# Remote Micro-Frontend Architecture

This document describes the **Module Federation 2.x runtime architecture** used to integrate remote micro-frontend applications into the KBH-Desktop host.

The four remotes deliberately span two tiers: **reference remotes** (Calculator :5001, Notes :5002) keep the minimal MF contract visible and serve as the lab for the failure-isolation demo, while **domain remotes** (Network :5003, Compute :5004) are OpenStack-style dashboards (TanStack Query + mocked REST) built on the same contract.

## Overview

The host is built with **Rsbuild (Rspack)** and `@module-federation/rsbuild-plugin`, but declares **no remotes at build time**. Instead:

1. At boot, the host fetches the **app catalog** (`public/remotes.manifest.json`).
2. Each remote is registered with the MF runtime via `registerRemotes()`.
3. When a window opens, the exposed module is loaded via `loadRemote()` wrapped in a per-window `React.lazy`.

This enables:

- **Runtime URL injection**: remote locations live in a manifest (runtime data), not in build output — add/move/update remotes without rebuilding the host
- **Independent deployability**: each remote is its own Vercel project with its own release cycle
- **Failure isolation & recovery**: a failed remote breaks only its own window; the in-window **Try Again** button force-re-registers the remote and reloads just that frame — no page refresh
- **Shared singletons**: react/react-dom are negotiated through the MF shared scope

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    Host (KBH-Desktop) :5173                   │
│                                                               │
│  boot ──► fetch /remotes.manifest.json                        │
│              │                                                │
│              ▼                                                │
│        registerRemotes([{name, entry}, ...])                  │
│              │                                                │
│  open window ──► React.lazy(() => loadRemote('name/Module'))  │
│              │                     │ on failure               │
│              │                     ▼                          │
│              │        ErrorBoundary (this window only)        │
│              │            └─ Try Again ─► force re-register   │
│              ▼                            + fresh lazy        │
│     ┌──────────────┐   ┌──────────────┐                       │
│     │ Local Apps   │   │ Remote Apps  │                       │
│     │ (About, ...) │   │ (lazy MF)    │                       │
│     └──────────────┘   └──────┬───────┘                       │
└───────────────────────────────┼───────────────────────────────┘
        ┌─────────────────┬─────┴───────────┬─────────────────┐
        ▼                 ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Calculator    │ │ Notes         │ │ Network       │ │ Compute       │
│ :5001         │ │ :5002         │ │ :5003         │ │ :5004         │
│ mf-manifest   │ │ mf-manifest   │ │ mf-manifest   │ │ mf-manifest   │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
    reference         reference          domain            domain
```

## Quick Start

### Development Environment

Rsbuild serves a real MF container in dev mode — **no build+preview dance**.

```bash
# Terminal 1: all remotes in dev mode
pnpm dev:remotes

# Terminal 2: host
pnpm dev
```

| Application | Port | Entry served |
|-------------|------|--------------|
| Host OS | 5173 | - |
| Remote Calculator | 5001 | `/mf-manifest.json`, `/remoteEntry.js` |
| Remote Notes | 5002 | `/mf-manifest.json`, `/remoteEntry.js` |
| Remote Network | 5003 | `/mf-manifest.json`, `/remoteEntry.js` |
| Remote Compute | 5004 | `/mf-manifest.json`, `/remoteEntry.js` |

> Remotes can start **after** the host — a remote is only contacted when its window opens. If it's down, that window shows an error UI with a retry button.

## The App Catalog (`public/remotes.manifest.json`)

```json
{
  "version": 1,
  "apps": [
    {
      "id": "notes",
      "title": "Notes",
      "icon": "sticky-note",
      "type": "remote",
      "defaultSize": { "w": 380, "h": 420 },
      "remote": {
        "name": "remoteNotes",
        "module": "NotesApp",
        "entryUrl": "https://<notes-deployment>.vercel.app/mf-manifest.json",
        "devEntryUrl": "http://localhost:5002/mf-manifest.json"
      }
    }
  ]
}
```

- `remote.name` — the MF container name (must match the remote's `rsbuild.config.ts`)
- `remote.module` — the exposed module without `./` (`exposes: { './NotesApp': ... }` → `"NotesApp"`)
- `entryUrl` — deployed `mf-manifest.json`; `devEntryUrl` — used when the host runs in dev mode
- `type: 'local' | 'external'` are reserved for future catalog-driven app types
- Local apps (About, Resume) stay statically registered in `src/registry/appRegistry.ts`

The manifest is fetched with `cache: 'no-store'`, validated in `src/federation/catalog.ts`, and merged into the registry by `initializeAppRegistry()`. If the fetch fails, the desktop enters a **degraded** state: local apps stay usable and an error toast is shown.

## Creating a New Remote App

> **Always scaffold through the `add-remote-app` skill**
> (`.claude/skills/add-remote-app/SKILL.md`) — it encodes and verifies these
> steps. The walkthrough below explains *what* the skill produces.

### Step 1: Scaffold the package

Mirror `packages/remote-notes` (the minimal, no-data-layer reference below);
for a data-backed dashboard remote, mirror `packages/remote-compute` instead:

```
packages/remote-myapp/
├── index.html              # standalone shell (no <script> tag — Rsbuild injects)
├── package.json            # dev/build/preview via rsbuild
├── rsbuild.config.ts
├── postcss.config.js       # tailwind + autoprefixer
├── tailwind.config.js      # imports local src/theme.js copy
├── tsconfig.json
├── vercel.json             # CORS headers — required (see Deployment)
└── src/
    ├── MyApp.tsx           # the exposed module — MUST import './index.css'
    ├── index.css           # @tailwind directives ONLY (no global body rules!)
    ├── standalone.css      # body/html rules — standalone entry only
    ├── theme.js            # local token copy
    ├── env.d.ts            # /// <reference types="@rsbuild/core/types" />
    ├── main.tsx            # import('./bootstrap')  ← async boundary
    ├── bootstrap.tsx       # standalone render
    └── App.tsx             # standalone page wrapper
```

### Step 2: rsbuild.config.ts

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

const DEV_ORIGIN = 'http://localhost:5003'; // unique port

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remoteMyApp',
      filename: 'remoteEntry.js',
      exposes: { './MyApp': './src/MyApp.tsx' },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
      dts: false,
    }),
  ],
  html: { template: './index.html' },
  source: { entry: { index: './src/main.tsx' } },
  server: { port: 5003, strictPort: true, cors: { origin: '*' } },
  dev: { assetPrefix: DEV_ORIGIN },
  output: { assetPrefix: process.env.ASSET_PREFIX || 'auto' },
});
```

### Step 3: Register in the manifest — that's it

Add an entry to `public/remotes.manifest.json` (see schema above).
**No host code changes, no host rebuild.** The icon name must exist in the
`iconMap` of `DesktopIcon.tsx`/`TaskbarItem.tsx` (add it if new).

## Critical Rules (learned the hard way)

1. **Async boundary everywhere**: every entry (`main.tsx`) that transitively imports a shared module must be a single `import('./bootstrap')`. Otherwise: *"loadShareSync failed... check whether an async boundary is implemented."*
2. **The exposed module imports its own CSS**: `import './index.css'` must be in the exposed component file, not just the standalone entry — otherwise the app renders unstyled inside the host.
3. **No global styles in the exposed graph**: `body`/`html` rules live in `standalone.css` (standalone entry only). Anything imported by the exposed module is injected into the **host document** when the remote loads.
4. **Absolute `dev.assetPrefix`**: without it, the host resolves the remote's chunk URLs against its own origin and dev cross-origin loading breaks.

## Failure Recovery (per-window retry)

Implemented in `src/federation/runtime.ts` + `WindowFrame.tsx` + `ErrorBoundary.tsx`:

1. `loadRemote` failure rejects through the window's `React.lazy` into that window's `ErrorBoundary` — **other windows are unaffected**, including healthy windows of the *same* remote (their module code is already running).
2. **Try Again** calls `forceRefreshRemote()` → `registerRemotes([remote], { force: true })`, which clears the runtime's cached container/manifest state for that remote.
3. A **fresh `React.lazy` wrapper** is swapped in via `useState` (a rejected lazy permanently caches its rejection, so the wrapper must be replaced, not re-rendered). The wrapper lives in state — not `useMemo` — so React Compiler memoization cannot skip the replacement.

Already-loaded remotes keep working even if their server goes down (module code is cached in the MF runtime) — failures only surface on **fresh loads** (new page session or force-refresh).

## Standalone vs Integration Mode

| | Integration (in host) | Standalone (`pnpm dev`) |
|---|---|---|
| Entry | exposed module via `loadRemote` | `main.tsx` → `bootstrap.tsx` |
| Global styles | host owns `body` | `standalone.css` |
| React | shared singleton from host scope | own instance |

## Host–Remote Communication

A remote is an independent build and cannot import the host's i18n/theme, so the
shell exposes its prefs through a **preferences bridge** (`src/federation/hostBridge.ts`,
initialized in `src/bootstrap.tsx`). The convention is Custom Events on `window`
plus a seeded global for the initial synchronous read:

| Prefix | Direction | Example |
|--------|-----------|---------|
| `host:*` | Host → Remote | `host:locale-changed`, `host:theme-changed` |
| `remote:*` | Remote → Host | `remote:request-fullscreen` (reserved) |

- **Locale** — the host seeds `window.__PROTO_LOCALE__` and dispatches
  `host:locale-changed` on every toggle. Remotes own their domain dictionary but
  read the active locale from this bridge (see `packages/remote-network/src/i18n.ts`,
  `useHostLocale`).
- **Theme** — rides the shell's `.dark` ancestor class for free: a remote that
  sets `darkMode:'class'` and authors CSS-variable tokens scoped to its own root
  (`.dark .remote-x { --token: … }`) reacts to light/dark with no event needed.
  `host:theme-changed` is still emitted for remotes that prefer JS-driven theming.

## Deployment (Vercel)

Independent Vercel projects (one per app):

| Project | Root directory | Notes |
|---|---|---|
| `proto` (host) | repo root | serves `remotes.manifest.json` |
| `remote-calculator` | `packages/remote-calculator` | CORS headers required |
| `remote-notes` | `packages/remote-notes` | CORS headers required |
| `remote-network` | `packages/remote-network` | CORS headers required; deployed at `https://remote-network.vercel.app` (ASSET_PREFIX set) |
| `remote-compute` | `packages/remote-compute` | CORS headers required; deployed at `https://remote-compute.vercel.app` (ASSET_PREFIX set) |

Per remote project:

1. `vercel.json` ships wide-open CORS on `/(.*)`— required so the host can fetch `mf-manifest.json` and chunks cross-origin. Keep it.
2. Set the env var **`ASSET_PREFIX=https://<deployment-domain>/`** in the Vercel project settings so chunk URLs inside `mf-manifest.json` resolve absolutely.
3. Deploy, then put the deployed `https://<domain>/mf-manifest.json` into `entryUrl` in the host's `public/remotes.manifest.json` and redeploy the host.

## Troubleshooting

### "loadShareSync failed" on boot
Missing async boundary — see Critical Rules #1.

### Remote renders unstyled inside the host
The exposed module doesn't import its CSS — see Critical Rules #2. Fallback: set `output.injectStyles: true` in the remote's rsbuild config (styles injected via JS).

### "Failed to get manifest. #RUNTIME-003"
The remote server is unreachable (or CORS headers are missing in production). Start/redeploy the remote, then use the window's **Try Again** button — no page refresh needed.

### Retry does nothing
The retry must create a *new* lazy wrapper. If you refactor `WindowFrame`, keep the wrapper in `useState` — a memoized wrapper can survive the retry render and replay its cached rejection.

### Port already in use

```powershell
# find + kill (Windows PowerShell)
Get-NetTCPConnection -LocalPort 5001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
