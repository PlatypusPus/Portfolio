// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Canonical origin for <link rel="canonical"> and absolute og:image URLs.
  // Change this if the production domain is not shov.in.
  site: 'https://shov.in',

  // On-demand rendering so middleware runs in production. Prerendered pages are
  // served straight off the CDN and never reach middleware, which would make
  // `curl shov.in` impossible. Pages are cached at the edge instead (see
  // src/middleware.ts), so this costs a cold start, not per-request work.
  output: 'server',

  // ponytail: dev only — Astro derives scoped-style ids from file path, so edits
  // reuse the same cache key and the browser serves stale CSS. no-store fixes it.
  vite: { server: { headers: { 'cache-control': 'no-store' } } },

  adapter: vercel(),
});
