// Shared by the contact page (src/pages/contact.astro) and the API route that
// handles the submission (src/pages/api/contact.ts). Kept in its own module so
// the page does not have to import the API route — which would pull `resend`
// into the page's server bundle.
export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 15, max: 2000 },
  /** Most links a genuine message carries. Above this it is almost always spam. */
  links: 3,
  /** Between two sends from the same browser. */
  cooldownMs: 60_000,
} as const;
