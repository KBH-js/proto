---
name: verify
description: >-
  Full verification for this MF monorepo — static gates plus a live browser
  pass through the desktop shell, remotes, and MSW demos. Use before
  committing or whenever asked to verify that a change actually works.
---

# Verify

Run the gates in order; report each one's actual result honestly — never
claim an unexercised path works. For a docs-only diff, gate 1 suffices.

## 1. Static gates (all must pass)

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm -r build
```

This mirrors CI (`.github/workflows/ci.yml`) exactly — anything red here
fails the PR.

## 2. Live E2E (browser)

Start dev servers via `.claude/launch.json` (preview tooling): the remotes
touched by the change (`remote-network` :5003, `remote-compute` :5004),
then `host` (:5173).

- Open each affected app from the desktop shell; the window renders with no
  console errors.
- MF chain per remote (read_network_requests): `mf-manifest.json` responds →
  `remoteEntry.js` loads → exposed chunk + CSS fetched from the remote's port.

## 3. Host-bridge sync

Toggle locale (ko↔en) and theme (dark↔light) in the host; open remote windows
must re-render in sync (`__PROTO_LOCALE__`/`__PROTO_THEME__` +
`host:locale-changed`/`host:theme-changed`).

## 4. MSW outage demo (network & compute)

Trigger the outage/latency toggles; the UI must show loading → error →
recover on retry after restore.

Detailed per-step commands and expected output live in
`.claude/skills/add-remote-app/SKILL.md`, **Step 3 — Verify** — reference it
rather than improvising.
