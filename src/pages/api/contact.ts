import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { CONTACT } from '../../data/profile';
import { LIMITS } from '../../data/contact-limits';

export const prerender = false;

const COOLDOWN_COOKIE = 'shovin_contact_at';

/** Post/Redirect/Get target. `d_*` hands the draft back so a failure never eats it. */
const back = (params: Record<string, string> = {}) => {
  const q = new URLSearchParams(params).toString();
  return `/contact${q ? `?${q}` : ''}#form`;
};

// Deliberately loose. A stricter regex rejects valid addresses far more often
// than it catches typos, and the send itself is the real validation.
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const countLinks = (v: string) => (v.match(/https?:\/\/|www\./gi) || []).length;

// ponytail: per-instance memory, so it resets on a cold start and is not shared
// across Worker isolates. It is a second line behind the cookie, not the real
// defence. A KV store or Turnstile is the upgrade if this ever gets abused.
// Bounded so a long-lived isolate under spam can't grow it without limit.
const seenByIp = new Map<string, number>();
const SEEN_MAX = 5_000;

export const POST: APIRoute = async ({ request, clientAddress, cookies, locals }) => {
  let name = '', email = '', message = '', honeypot = '';

  const bail = (error: string, keepDraft = true) => {
    const draft = keepDraft
      ? { d_name: name, d_email: email, d_message: message }
      : {};
    return Response.redirect(new URL(back({ error, ...draft }), request.url), 303);
  };

  try {
    const form = await request.formData();
    name = String(form.get('name') ?? '').trim().slice(0, LIMITS.name.max);
    email = String(form.get('email') ?? '').trim().slice(0, LIMITS.email.max);
    message = String(form.get('message') ?? '').trim().slice(0, LIMITS.message.max);
    // Real people leave this empty; bots fill every field they find.
    honeypot = String(form.get('company') ?? '').trim();
  } catch {
    return bail('send', false);
  }

  // Accept and drop. Telling a bot it failed just teaches it to retry.
  if (honeypot) {
    return Response.redirect(new URL(back({ sent: '1' }), request.url), 303);
  }

  if (!name || !email || !message) return bail('missing');
  if (name.length < LIMITS.name.min) return bail('name');
  if (!looksLikeEmail(email)) return bail('email');
  if (message.length < LIMITS.message.min) return bail('short');
  if (countLinks(message) > LIMITS.links) return bail('links');

  // Cookie first: it survives cold starts and is per browser, which is what a
  // repeat submitter actually is. The IP map catches the same browser with
  // cookies cleared, within one warm instance.
  const now = Date.now();
  const cookieAt = Number(cookies.get(COOLDOWN_COOKIE)?.value ?? 0);
  const ipAt = seenByIp.get(clientAddress || 'unknown') ?? 0;
  const lastSend = Math.max(
    Number.isFinite(cookieAt) ? cookieAt : 0,
    ipAt,
  );
  if (lastSend && now - lastSend < LIMITS.cooldownMs) return bail('rate');

  // On Cloudflare, Worker secrets live on locals.runtime.env, not import.meta.env
  // (which is build-time only). Fall back to import.meta.env so `astro dev`
  // without the platform proxy, and other adapters, still work.
  const env = (locals as any).runtime?.env ?? import.meta.env;
  const apiKey = env.RESEND_API_KEY;
  const from = env.CONTACT_FROM || 'shov.in <onboarding@resend.dev>';
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set');
    return bail('send');
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: CONTACT.email,
      replyTo: email,
      subject: `Portfolio - ${name}`,
      text: [
        `From: ${name} <${email}>`,
        '',
        message,
        '',
        '---',
        'Sent from the contact form at shov.in',
      ].join('\n'),
    });
    if (error) throw error;
  } catch (err) {
    console.error('[contact] send failed', err);
    return bail('send');
  }

  if (seenByIp.size >= SEEN_MAX) seenByIp.clear();
  seenByIp.set(clientAddress || 'unknown', now);
  cookies.set(COOLDOWN_COOKIE, String(now), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: Math.ceil(LIMITS.cooldownMs / 1000),
  });

  return Response.redirect(new URL(back({ sent: '1' }), request.url), 303);
};
