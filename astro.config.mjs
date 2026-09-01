// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Canonical origin for <link rel="canonical"> and absolute og:image URLs.
  // Change this if the production domain is not shov.in.
  site: 'https://shov.in',

  // On-demand rendering so middleware runs in production. about/projects/privacy/404
  // opt back into prerendering (`export const prerender = true`) and ship as static
  // files on Cloudflare's CDN; only `/`, `/contact`, `/tui` and `/api/contact`
  // invoke the Pages Function.
  output: 'server',

  // ponytail: dev only — Astro derives scoped-style ids from file path, so edits
  // reuse the same cache key and the browser serves stale CSS. no-store fixes it.
  vite: { server: { headers: { 'cache-control': 'no-store' } } },

  // The only images are two fixed-size avatar renders. Optimise them at build
  // time so production needs no Cloudflare Images binding or runtime transforms.
  //
  // workerEntryPoint: builds the App with streaming off. Without it every page
  // renders as the literal string "[object Object]" on Cloudflare — see the
  // comment in src/worker-entry.ts for why.
  adapter: cloudflare({
    imageService: 'compile',
    workerEntryPoint: { path: './src/worker-entry.ts' },
  }),
});
