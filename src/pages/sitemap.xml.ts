import type { APIRoute } from 'astro';

export const prerender = true;

// Hand-rolled rather than pulling in @astrojs/sitemap: this site has five public
// URLs and they are not going to be generated from anything. Add a route here
// when you add a page.
//
// `/tui` and `/404` are deliberately absent — one is the home page's content in
// another format, the other has nothing to rank for.
const PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/projects', priority: '0.8' },
  { path: '/about', priority: '0.8' },
  { path: '/contact', priority: '0.5' },
  { path: '/privacy', priority: '0.1' },
];

export const GET: APIRoute = ({ site }) => {
  // Prerendered, so this is the build date: the last time the content could
  // actually have changed.
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = PAGES.map(
    ({ path, priority }) =>
      `  <url><loc>${new URL(path, site).href}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`,
  ).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
