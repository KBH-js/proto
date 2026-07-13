import { defineConfig } from 'vitest/config';

/**
 * Vitest runs its own esbuild pipeline — the Rsbuild/Module-Federation/
 * React-Compiler config does NOT apply here. The suites are pure logic,
 * store, and network (MSW) tests, none of which need those transforms.
 *
 * happy-dom (not jsdom) is used deliberately: its `fetch`/`Request` resolve
 * relative URLs against the document location, so `fetch('/remotes.manifest.json')`
 * in catalog.ts works under MSW without a base-URL shim.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
});
