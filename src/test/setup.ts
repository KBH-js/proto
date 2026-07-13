import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// MSW lifecycle: fail on any request without a matching handler so tests
// can't silently hit the network, and reset per-test overrides between tests.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  // catalog.ts fetches a root-relative URL ('/remotes.manifest.json'). Under
  // the Node environment (used by catalog.test.ts, whose undici Response has
  // no ReadableStream-lock quirk) that URL can't be parsed, so absolutize it
  // against a dummy origin before MSW — which then matches on '*/…'. happy-dom
  // exposes `fetch` as read-only and resolves relative URLs itself, so the
  // assignment simply no-ops there.
  const patched = globalThis.fetch;
  try {
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
      patched(
        typeof input === 'string' && input.startsWith('/') ? `http://localhost${input}` : input,
        init,
      )) as typeof fetch;
  } catch {
    /* read-only under happy-dom — those suites don't fetch */
  }
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
