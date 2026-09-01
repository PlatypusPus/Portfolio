import type { APIRoute } from 'astro';

export const prerender = true;

// An endpoint rather than a file in public/ so the sitemap URL is built from
// `site` in astro.config.mjs — changing the domain stays a one-line change.
export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      // Nothing to crawl, and it only answers POST.
      'Disallow: /api/',
      '',
      `Sitemap: ${new URL('/sitemap.xml', site).href}`,
      '',
    ].join('\n'),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
