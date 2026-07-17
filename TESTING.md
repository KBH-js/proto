# Testing

Three layers, all enforced per-PR by CI (`.github/workflows/ci.yml`):

| Layer | Tool | Command |
|-------|------|---------|
| Unit + integration | **Vitest** (+ **MSW** for network) | `pnpm test` |
| End-to-end | **Playwright** (chromium) | `pnpm test:e2e` |
| Type/i18n/token gates | `tsc -b` + ESLint local rules | `pnpm typecheck` · `pnpm lint` |

## Vitest (unit + integration)

One root config runs every suite: host specs (unit + component), the remote
packages' data layers (`packages/remote-network`, `packages/remote-compute`,
integration via **Vitest + MSW**), and RuleTester specs for the custom
design-token lint rules (`eslint-rules/*.test.js`).
Tests run on their own esbuild pipeline — the Rsbuild / Module Federation /
React Compiler build config does not apply — under the **happy-dom**
environment by default. `catalog.test.ts` and `manifestFile.test.ts` opt
into Node per-file (happy-dom's `Response.json()` locks its stream under
MSW); the RuleTester specs run in Node because ESLint needs no DOM.

```bash
pnpm test        # run once (CI-style)
pnpm test:watch  # watch mode
```

| Suite | Kind | What it locks down |
|-------|------|--------------------|
| `src/utils/windowGeometry.test.ts` | unit | Aero-snap rects, edge/corner detection, size + titlebar-above-taskbar clamping |
| `src/store/windowStore.test.ts` | unit | single-instance launch, cascade + zIndex compaction, focus/close/minimize/restore promotion, snap vs maximize |
| `src/store/tourStore.test.ts` | unit | first-run tour lifecycle: start/advance/back clamping, finish marks seen, reset allows replay |
| `src/store/prefsStore.test.ts` | unit | browser-language locale detection (`detectLocale`) |
| `src/registry/appRegistry.test.ts` | unit (mocked catalog) | remote-catalog merge into seeded locals, StrictMode in-flight join, dev-HMR re-init after store reset, degrade-on-failure without retry |
| `src/i18n/josa.test.ts` | unit | Korean particle resolution (을/를·이/가) by final consonant (`resolveJosa`) |
| `src/apps/designTokens.test.ts` | unit | 3-layer token gallery derives from `@proto/shared/theme` without drift; semantic→primitive resolution |
| `src/federation/catalog.test.ts` | integration (MSW) | manifest happy path + every validation/error branch, dev vs prod entry resolution |
| `src/federation/manifestFile.test.ts` | integration (MSW) | the real shipped `public/remotes.manifest.json` passes the production validator — no schema drift |
| `src/components/molecules/DesktopIcon.test.tsx` | component | single-click launch; keyboard activation via native button semantics |
| `src/components/organisms/StartMenu.test.tsx` | component | ARIA menu role + initial focus, ArrowDown focus movement, Escape close with focus return |
| `src/components/organisms/WindowFrame.test.tsx` | component | persisted remote window rehydrates once the catalog resolves after boot (MF runtime + react-rnd mocked) |
| `packages/remote-network/src/data/db.test.ts` | unit | Neutron seed selectors: networks + subnets, ports, summary/health derivation, armed-outage 503 |
| `packages/remote-network/src/data/networkApi.test.ts` | integration (MSW) | REST contract for `/api/*` + transport facade: fetch/MSW when armed, in-memory fallback otherwise |
| `packages/remote-compute/src/data/db.test.ts` | unit | Nova seed selectors: servers + addresses, flavor/hypervisor referential integrity, volumes, summary/health, armed-outage 503 |
| `packages/remote-compute/src/data/computeApi.test.ts` | integration (MSW) | same REST/facade contract as remote-network, against `/api/nova/*` |
| `eslint-rules/no-raw-colors.test.js` | RuleTester | raw hex/`rgb()`/`hsl()` literals error; token sources stay clean |
| `eslint-rules/no-raw-px.test.js` | RuleTester | Tailwind arbitrary px errors; rem values and scale tokens pass |

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

## Deploy smoke (post-deploy gate)

```bash
SMOKE_URL=https://proto-six-iota.vercel.app pnpm test:smoke   # run by hand against any deployment
```

`.github/workflows/deploy-smoke.yml` fires on every successful Vercel
deployment (GitHub `deployment_status` event — Preview and Production alike)
and runs `e2e/deploy/deployed-smoke.spec.ts` via `playwright.deploy.config.ts`
against the live deployment URL. No local servers: the deployed host resolves
remotes from the production manifest exactly like a visitor would. The check
attaches to the deployed commit, so Preview runs appear on the PR.

It covers the failure classes local E2E cannot see (they only exist on the
deployed topology):
- `remotes.manifest.json` resolves and each remote `entryUrl` answers 200
  **with CORS headers** (fetched cross-origin like the host runtime does)
- the deployed host boots to the desktop with every remote registered

Setup: Vercel's per-deployment URLs sit behind SSO protection, so the repo
needs a `VERCEL_AUTOMATION_BYPASS_SECRET` secret (Vercel project → Settings →
Deployment Protection → Protection Bypass for Automation, then
`gh secret set VERCEL_AUTOMATION_BYPASS_SECRET`).

## Visual regression (design note — not currently wired into CI)

An earlier iteration ran a mini Playwright `toHaveScreenshot` matrix here —
3 surfaces (desktop shell, About window, Design Tokens window) × light/dark
= 6 baselines. Because font rasterization and anti-aliasing differ per OS,
baselines were rendered on CI (ubuntu) by a dedicated `workflow_dispatch`
workflow and committed via a platform-agnostic `snapshotPathTemplate`; the
CI-vs-CI comparison allowed a tight tolerance (`maxDiffPixelRatio: 0.002` —
a looser 0.02 was measured to let a real UI change, new About-header
buttons, slip through unnoticed).

It was retired from CI on purpose: **window/page-level screenshots are the
wrong granularity for VRT.** Any copy or layout tweak inside a captured
surface invalidates baselines, so every content PR paid a baseline
re-render round-trip while catching little that E2E assertions don't. VRT
earns its keep at the isolated component/story level — the full-scale
version in the private project this repo mirrors runs against Storybook
stories in a light/dark matrix. If VRT returns here, it comes back
story-level, not page-level.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`:
**verify** (lint → typecheck → vitest → host build → all-remote builds) and
**e2e** (Playwright, report uploaded on failure).
The typecheck/build steps double as the i18n gate — `en.ts` is a type-mirror
of `ko.ts`, so a missing locale key fails `tsc -b`.
`.github/workflows/deploy-smoke.yml` adds the post-deploy smoke above on top
of every Vercel deployment.
