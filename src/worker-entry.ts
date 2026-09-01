import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';

/**
 * Custom Cloudflare worker entrypoint, used only to construct the App with
 * streaming disabled.
 *
 * Astro chooses its response body with:
 *
 *     isNode = Object.prototype.toString.call(process) === "[object process]"
 *
 * When that is true it returns an **async iterable** from `renderPage`, which is
 * fine under Node but not on Cloudflare: workerd does not accept an async
 * iterable as a `Response` body, so it stringifies the object and every page
 * ships as the literal 15-byte string "[object Object]".
 *
 * The `nodejs_compat` flag — which the adapter requires — gives workerd a
 * `process` polyfill complete enough to pass that check in production. Local
 * `wrangler pages dev` uses a thinner polyfill that fails it, which is why this
 * only ever broke on the deployed site.
 *
 * Non-streaming makes `renderPage` return a plain string instead, which every
 * runtime accepts. The cost is a few ms of TTFB on pages that are edge-cached
 * for an hour anyway (see src/middleware.ts).
 */
export function createExports(manifest: ConstructorParameters<typeof App>[0]) {
  const app = new App(manifest, false);
  return {
    default: {
      fetch: (request: Request, env: unknown, context: unknown) =>
        // @ts-expect-error - the adapter's handler is untyped
        handle(manifest, app, request, env, context),
    },
  };
}
