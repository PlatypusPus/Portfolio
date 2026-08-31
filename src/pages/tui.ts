import type { APIRoute } from 'astro';
import { renderTui } from '../lib/tui';

export const prerender = false;

// Always returns the terminal render regardless of client, so the output is
// reachable (and linkable) without relying on user-agent sniffing.
export const GET: APIRoute = () =>
  new Response(renderTui(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
