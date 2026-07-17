# Testing

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

## What's covered

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

## Notes on scope

- **Unit + integration only** — no Playwright E2E and no CI workflow are wired
  in this repo (the private project these mirror runs both; here the honest
  claim is the Vitest/MSW layer that actually runs). No status badge is shown
  because there is no CI to back it.
- `windowStore.test.ts` mocks `registry/appRegistry` and `utils/device` so the
  store is exercised in isolation from the app-component / MF-runtime graph.
- MSW runs with `onUnhandledRequest: 'error'`, so a test can never silently
  reach the network.
