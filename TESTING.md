# Testing

The host is covered by **Vitest** (unit) and **Vitest + MSW** (integration).
Tests run on their own esbuild pipeline — the Rsbuild / Module Federation /
React Compiler build config does not apply — under the **happy-dom**
environment (chosen so `fetch('/remotes.manifest.json')` resolves the relative
URL under MSW without a base-URL shim).

```bash
pnpm test        # run once (CI-style)
pnpm test:watch  # watch mode
```

## What's covered

| Suite | Kind | What it locks down |
|-------|------|--------------------|
| `src/utils/windowGeometry.test.ts` | unit | Aero-snap rects, edge/corner detection, size + titlebar-above-taskbar clamping |
| `src/store/windowStore.test.ts` | unit | single-instance launch, cascade + zIndex compaction, focus/close/minimize/restore promotion, snap vs maximize |
| `src/federation/catalog.test.ts` | integration (MSW) | manifest happy path + every validation/error branch, dev vs prod entry resolution |

## Notes on scope

- **Unit + integration only** — no Playwright E2E and no CI workflow are wired
  in this repo (the private project these mirror runs both; here the honest
  claim is the Vitest/MSW layer that actually runs). No status badge is shown
  because there is no CI to back it.
- `windowStore.test.ts` mocks `registry/appRegistry` and `utils/device` so the
  store is exercised in isolation from the app-component / MF-runtime graph.
- MSW runs with `onUnhandledRequest: 'error'`, so a test can never silently
  reach the network.
