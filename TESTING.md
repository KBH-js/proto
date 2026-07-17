# Testing

Three layers, all enforced per-PR by CI (`.github/workflows/ci.yml`):

| Layer | Tool | Command |
|-------|------|---------|
| Unit + integration | **Vitest** (+ **MSW** for network) | `pnpm test` |
| End-to-end | **Playwright** (chromium) | `pnpm test:e2e` |
| Type/i18n/token gates | `tsc -b` + ESLint local rules | `pnpm build` · `pnpm lint` |

## Vitest (unit + integration)

Tests run on Vitest's own esbuild pipeline — the Rsbuild / Module Federation /
React Compiler build config does not apply — under the **happy-dom**
environment (chosen so `fetch('/remotes.manifest.json')` resolves the relative
URL under MSW without a base-URL shim).

```bash
pnpm test        # run once (CI-style)
pnpm test:watch  # watch mode
```

Covers (host `src/**` + `packages/**/src/**`): window geometry/store, tour
store, shortcuts, app registry, catalog validation (MSW), design-token
builder, DesktopIcon/StartMenu/WindowFrame components, and the
remote-network / remote-compute data layers (MSW node server).

Notes:
- `windowStore.test.ts` mocks `registry/appRegistry` and `utils/device` so the
  store is exercised in isolation from the app-component / MF-runtime graph.
- MSW runs with `onUnhandledRequest: 'error'`, so a test can never silently
  reach the network.

## Playwright E2E

```bash
pnpm test:e2e     # headless; starts all 5 dev servers itself
pnpm test:e2e:ui  # interactive UI mode
```

Topology: the config's `webServer` array boots the **host in dev mode**
(:5173) plus all four remote dev servers (:5001–:5004). Dev mode matters —
`resolveEntryUrl()` only picks the localhost `devEntryUrl`s when
`import.meta.env.DEV` is true, so this exercises the real runtime-federation
path with no manifest swapping. Locally, already-running dev servers are
reused.

Specs (`e2e/*.spec.ts`):
- `boot` — first-run tour, 8 desktop icons, federation tray strip, zero console errors
- `local-window` — open/close a local app window + taskbar item lifecycle
- `remote-load` — Calculator loads through the MF runtime (MFE:DEV badge, load toast)
- `window-ops` — maximize / minimize (genie) / restore from taskbar
- `failure-recovery` — Inspector "Break" → per-frame ErrorBoundary → "Try Again" recovers
- `prefs` — theme class toggle on the shell root, ko/en locale switch

`e2e/fixtures.ts` seeds localStorage (`proto-desktop:prefs` → en/dark,
`proto-desktop:tour` → seen) so specs assert English strings without the tour
overlay; the first-run spec deliberately skips the tour seed.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`:
**quality** (lint → vitest → host build), **build-remotes** (4-package
matrix), and **e2e** (Playwright, report uploaded on failure). The build step
doubles as the i18n gate — `en.ts` is a type-mirror of `ko.ts`, so a missing
locale key fails `tsc -b`.
