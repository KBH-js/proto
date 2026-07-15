---
name: add-remote-app
description: >-
  Scaffold, register, and verify a new Module Federation remote app in this
  pnpm monorepo (web desktop shell host + packages/remote-*). ALWAYS use this
  skill whenever the user asks to add, create, build, or register a new remote
  app — in any phrasing or language: "remote app 만들어줘/추가해줘/생성",
  "리모트 앱", "원격 앱", "새 remote", "new MF remote", "add a dashboard app",
  "OpenStack storage/identity/image remote app", "packages/remote-* 하나 더",
  or any request for a new app window that the desktop shell should load via
  Module Federation. Trigger it even when the user doesn't say the word
  "remote" but wants a new independently-deployed app on the desktop.
---

# Add a Remote App

Adds a new federated remote to this repo end-to-end: package scaffold → host
catalog registration → automated + in-browser verification. The host never
declares remotes at build time, so a correctly built remote needs **zero host
code changes** except icon/i18n polish.

**Reference implementation: `packages/remote-compute`** (built by mirroring
`packages/remote-network`). When in doubt about any file's exact shape, open
the corresponding file there and mirror it. `packages/remote-notes` is the
minimal variant (no data layer). Deployment details live in `REMOTES.md`.

## Step 0 — Gather decisions (from the request; do not invent silently)

- **App id / MF name / exposed module**: e.g. id `storage`, name
  `remoteStorage`, module `StorageApp` (exposes `./StorageApp`).
- **Port**: next free one. Taken so far: 5001 calculator, 5002 notes,
  5003 network, 5004 compute. Verify against `.claude/launch.json`,
  `public/remotes.manifest.json`, and the REMOTES.md port table.
- **Domain model**: if it's an OpenStack-style dashboard, base types on the
  real API vocabulary (e.g. Nova: servers/flavors/os-hypervisors) — faithful
  naming is part of the portfolio narrative.
- **Icon**: a lucide-react icon name for the manifest (check
  `src/components/shared/appIcons.ts` for taken names).
- **Accent**: each remote keeps the same neutral palette but a distinct accent
  (network=indigo, compute=violet) so apps are distinguishable yet consistent.
- **CSS scope + var prefix + MSW flag**: unique per remote, e.g.
  `.remote-storage`, `--stg-*`, `window.__PROTO_STORAGE_MSW__`.

## Step 1 — Scaffold `packages/remote-<id>`

Copy the remote-compute file set, renaming as you go:

```
package.json            # name @proto/remote-<id>; deps identical (react 19, @tanstack/react-query, lucide-react, msw)
rsbuild.config.ts       # MF name, exposes, singleton react/react-dom ^19.0.0, dts:false, unique port, dev.assetPrefix
index.html  postcss.config.js  tailwind.config.js  tsconfig.json  vercel.json  .gitignore
public/mockServiceWorker.js   # copy verbatim from remote-network/public
src/theme.js            # local copy of shared non-color scales (independent deploy)
src/env.d.ts            # __PROTO_<ID>_MSW__ + __PROTO_LOCALE__ window flags
src/main.tsx            # import('./bootstrap')  ← async boundary, ONE line
src/bootstrap.tsx       # standalone: start MSW worker, set the MSW flag, render App
src/App.tsx             # standalone wrapper with dark toggle
src/index.css           # @tailwind directives + SCOPED token vars (see below)
src/standalone.css      # body/html rules — imported ONLY by bootstrap.tsx
src/i18n.ts             # ko (source) + en dicts, useHostLocale/useT
src/<Name>App.tsx       # the exposed module — MUST `import './index.css'`
src/data/types.ts  db.ts  <id>Api.ts        # domain model, in-memory db, facade
src/mocks/handlers.ts  browser.ts           # MSW REST over the db
src/components/...                          # SummaryCards, master table, DetailPanel, ResourceTabs, StatusBadge, states
src/data/db.test.ts  <id>Api.test.ts        # Vitest suites (picked up by ROOT `pnpm test`)
```

Invariants that break at runtime if violated — respect the why:

1. **Async boundary**: `main.tsx` must be exactly `import('./bootstrap')`.
   Eager imports from the entry chunk defeat MF share negotiation →
   "loadShareSync failed" at boot.
2. **Exposed module imports its own CSS** (`import './index.css'` in
   `<Name>App.tsx`), or the app renders unstyled inside the host. Never put
   `body`/`html` rules in that graph — they'd leak into the host document;
   they belong in `standalone.css` only.
3. **Scoped tokens**: colors live as CSS variables under `.remote-<id>` (and
   `.dark .remote-<id>` for dark), written as space-separated RGB channels so
   Tailwind `/opacity` works via `rgb(var(--x) / <alpha-value>)`. Raw colors
   in `.ts/.tsx` fail the `local/no-raw-colors` lint rule — CSS files and
   `theme.js` are the sanctioned homes.
4. **Isomorphic transport**: the api facade checks `window.__PROTO_<ID>_MSW__`
   **per call** (the standalone bootstrap sets it after module load). MSW on →
   real `fetch('/api/<service>/…')`; embedded in the host a cross-origin
   service worker is impossible → fall back to the same in-memory db, so both
   paths serve identical data. MSW handler patterns need a leading wildcard
   (`*/api/<service>/…`) to match any origin.
5. **db is deterministic** (no randomness/Date.now) with `setOutage`/
   `setLatency` injection — this powers the loading → error → retry demo and
   keeps tests reproducible. Keep cross-app narrative consistency where it
   makes sense (e.g. compute's fixed IPs match network's floating-IP mappings).
6. **TanStack Query stays remote-internal** (own QueryClient, `retry: 0`,
   `staleTime` 30s). Only react/react-dom are MF singletons; do not add the
   query lib to `shared`.
7. **Ports/CORS**: unique dev port + absolute `dev.assetPrefix` (host on :5173
   loads chunks cross-origin) + `server.cors.origin: '*'`; prod uses the
   `ASSET_PREFIX` env (see vercel.json + REMOTES.md).
8. **Tests**: the api contract test imports the shared MSW server via
   `../../../../src/test/msw/server` and `server.use(...handlers)`; root
   vitest includes `packages/**/src/**/*.test.ts`. Set latency 0 and reset
   outage in `beforeEach`.

## Step 2 — Register with the host

- `public/remotes.manifest.json`: append the app entry
  (`id/title/icon/type:"remote"/defaultSize/remote{name,module,entryUrl,devEntryUrl}`).
  Use `http://localhost:<port>/mf-manifest.json` for dev and a
  `https://remote-<id>.vercel.app/mf-manifest.json` placeholder for prod.
- `src/components/shared/appIcons.ts`: add the icon to `appIconMap` and a tint
  in `getAppIconColor` (only if the icon name is new).
- Host locales `src/i18n/locales/ko.ts` + `en.ts`: add `app.<id>` (falls back
  to the manifest title if missing, but add it — the shell is bilingual).
- `.claude/launch.json`: add a `remote-<id>` configuration (pnpm -C dev) so
  the dev server is startable via preview tooling.
- Docs: REMOTES.md port table + deployment table row; CLAUDE.md package list
  and a one-line package bullet.

## Step 3 — Verify (all gates must pass; report results honestly)

1. `pnpm install` (links the new workspace package)
2. Root `pnpm test` — existing + new suites
3. Root `pnpm lint` — watch for `local/no-raw-colors`
4. In the package: `pnpm exec tsc -b` and `pnpm exec rsbuild build`
   (confirm `dist/remoteEntry.js` + the exposed CSS chunk exist)
5. Browser, standalone: `preview_start` the `remote-<id>` launch config; check
   console for errors, `/api/<service>/*` requests return 200 via MSW, detail
   panel + outage toggle (error → retry → recovery) work.
6. Browser, embedded: `preview_start` the `host` config; the desktop shows the
   new icon and the federation strip count increments; open the window and
   confirm the MF chain (`mf-manifest.json → remoteEntry.js → exposed chunk +
   CSS`) loads from the remote's port; toggle locale (ko↔en) and theme
   (dark↔light) and confirm the remote re-renders in sync (host bridge:
   `__PROTO_LOCALE__`/`__PROTO_THEME__` + `host:locale-changed`/
   `host:theme-changed` events).

## Deployment (when asked)

New Vercel project rooted at `packages/remote-<id>`, keep vercel.json CORS
headers, set `ASSET_PREFIX=https://<domain>/`, then update the manifest's
`entryUrl` and redeploy the host. Full procedure: REMOTES.md → Deployment.
