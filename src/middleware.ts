import { defineMiddleware } from 'astro:middleware';
import { isTerminalClient, renderTui } from './lib/tui';

// `curl shov.in` should return the portfolio, not a wall of HTML tags.
// Browsers are untouched and fall straight through to the normal render.
export const onRequest = defineMiddleware(async (context, next) => {
  const ua = context.request.headers.get('user-agent');

  // Only the bare site root. `curl shov.in/about` is a page request; hijacking
  // every route would break anyone scripting against the HTML on purpose.
  const isRoot = context.url.pathname === '/' || context.url.pathname === '';

  if (isRoot && isTerminalClient(ua)) {
    return new Response(renderTui(), {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        // safe to cache hard: the content only changes when the site is rebuilt
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  const response = await next();

  // With output:'server' every page is a function. These pages are static in
  // practice, so let the CDN serve them and keep the function for cache misses.
  //
  // must-revalidate matters: without it, `max-age=0` plus stale-while-revalidate
  // lets the BROWSER reuse a day-old page, so visitors keep seeing the previous
  // deploy. The shared cache still gets s-maxage and the stale window; only the
  // browser is required to check back. And never in dev, where a cached page
  // silently hides the edit you just made.
  if (
    import.meta.env.PROD &&
    context.request.method === 'GET' &&
    response.headers.get('content-type')?.includes('text/html')
  ) {
    response.headers.set(
      'cache-control',
      'public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=86400',
    );
  }

  return response;
});
