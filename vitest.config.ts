import { defineConfig } from 'vitest/config';

/**
 * Vitest runs its own esbuild pipeline — the Rsbuild/Module-Federation/
 * React-Compiler config does NOT apply here. The suites are mostly pure
 * logic, store, and network (MSW) tests, plus a few focused component
 * smoke tests (`.test.tsx`) that render through happy-dom with the MF
 * runtime and react-rnd mocked.
 *
 * happy-dom (not jsdom) is used deliberately: its `fetch`/`Request` resolve
 * relative URLs against the document location, so `fetch('/remotes.manifest.json')`
 * in catalog.ts works under MSW without a base-URL shim.
 *
 * `esbuild.jsx: 'automatic'` lets `.tsx` suites use JSX without importing
 * React — the React Compiler is intentionally absent here, but the fix under
 * test (a plain useState/useEffect wrapper) does not depend on it.
 */
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/test/setup.ts'],
    // Host specs (incl. .tsx component smoke tests) + remote-package logic
    // specs (the root has msw/happy-dom/vitest) + RuleTester specs for the
    // custom design-token lint rules.
    include: [
      'src/**/*.test.{ts,tsx}',
      'packages/**/src/**/*.test.{ts,tsx}',
      'eslint-rules/*.test.js',
    ],
  },
});
