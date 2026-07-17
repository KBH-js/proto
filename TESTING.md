# Testing

Three layers, all enforced per-PR by CI (`.github/workflows/ci.yml`):

| Layer | Tool | Command |
|-------|------|---------|
| Unit + integration | **Vitest** (+ **MSW** for network) | `pnpm test` |
| End-to-end | **Playwright** (chromium) | `pnpm test:e2e` |
| Type/i18n/token gates | `tsc -b` + ESLint local rules | `pnpm typecheck` · `pnpm lint` |

## Vitest (unit + integration)

The host and the remote packages' data layers (`packages/remote-network`,
`packages/remote-compute`) are covered by **Vitest** (unit + component) and
**Vitest + MSW** (integration) — one root config runs all 14 suites.
Tests run on their own esbuild pipeline — the Rsbuild / Module Federation /
React Compiler build config does not apply — under the **happy-dom**
environment by default; `catalog.test.ts` opts into Node per-file because
happy-dom's `Response.json()` locks its stream under MSW.

```bash
pnpm test        # run once (CI-style)
pnpm test:watch  # watch mode
```

| Suite | Kind | What it locks down |
|-------|------|--------------------|
| `src/utils/windowGeometry.test.ts` | unit | Aero-snap rects, edge/corner detection, size + titlebar-above-taskbar clamping |
| `src/store/windowStore.test.ts` | unit | single-instance launch, cascade + zIndex compaction, focus/close/minimize/restore promotion, snap vs maximize |
| `src/store/tourStore.test.ts` | unit | first-run tour lifecycle: start/advance/back clamping, finish marks seen, reset allows replay |
| `src/registry/appRegistry.test.ts` | unit (mocked catalog) | remote-catalog merge into seeded locals, StrictMode in-flight join, dev-HMR re-init after store reset, degrade-on-failure without retry |
| `src/hooks/useShortcuts.test.ts` | unit | Alt+key chord mapping, ctrl/meta rejection, suppression while a form field is focused |
| `src/apps/designTokens.test.ts` | unit | 3-layer token gallery derives from `@proto/shared/theme` without drift; semantic→primitive resolution |
| `src/federation/catalog.test.ts` | integration (MSW) | manifest happy path + every validation/error branch, dev vs prod entry resolution |
| `src/components/molecules/DesktopIcon.test.tsx` | component | single-click launch; keyboard activation via native button semantics |
| `src/components/organisms/StartMenu.test.tsx` | component | ARIA menu role + initial focus, ArrowDown focus movement, Escape close with focus return |
| `src/components/organisms/WindowFrame.test.tsx` | component | persisted remote window rehydrates once the catalog resolves after boot (MF runtime + react-rnd mocked) |
| `packages/remote-network/src/data/db.test.ts` | unit | Neutron seed selectors: networks + subnets, ports, summary/health derivation, armed-outage 503 |
| `packages/remote-network/src/data/networkApi.test.ts` | integration (MSW) | REST contract for `/api/*` + transport facade: fetch/MSW when armed, in-memory fallback otherwise |
| `packages/remote-compute/src/data/db.test.ts` | unit | Nova seed selectors: servers + addresses, flavor/hypervisor referential integrity, volumes, summary/health, armed-outage 503 |
| `packages/remote-compute/src/data/computeApi.test.ts` | integration (MSW) | same REST/facade contract as remote-network, against `/api/nova/*` |

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
**verify** (lint → typecheck → vitest → host build → all-remote builds) and
**e2e** (Playwright, report uploaded on failure). The typecheck/build steps
double as the i18n gate — `en.ts` is a type-mirror of `ko.ts`, so a missing
locale key fails `tsc -b`.
