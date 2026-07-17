// @vitest-environment node
// Smoke test for the REAL public/remotes.manifest.json — the runtime-critical
// file MF boot depends on. The default MSW handler serves a synthetic fixture,
// so each test overrides it to serve the shipped file and runs it through the
// production validator (fetchAppCatalog).
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/msw/server';
import { MANIFEST_PATTERN } from '../test/msw/handlers';
import { fetchAppCatalog, type AppCatalog } from './catalog';

const manifest = JSON.parse(
  readFileSync(new URL('../../public/remotes.manifest.json', import.meta.url), 'utf8'),
) as AppCatalog;

beforeEach(() => {
  server.use(http.get(MANIFEST_PATTERN, () => HttpResponse.json(manifest)));
});

describe('public/remotes.manifest.json (shipped file)', () => {
  it('passes fetchAppCatalog validation', async () => {
    const catalog = await fetchAppCatalog();
    expect(catalog.apps).toEqual(manifest.apps);
  });

  it('lists the expected apps (update when adding a remote — see add-remote-app skill)', () => {
    const ids = manifest.apps.map((app) => app.id).sort();
    expect(ids).toEqual(['calculator', 'compute', 'network', 'notes']);
  });

  it('has unique app ids', () => {
    const ids = manifest.apps.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique MF container names and dev ports across remotes', () => {
    const remotes = manifest.apps
      .filter((app) => app.type === 'remote' && app.remote)
      .map((app) => app.remote!);
    expect(remotes.length).toBeGreaterThan(0);

    const names = remotes.map((remote) => remote.name);
    expect(new Set(names).size).toBe(names.length);

    const ports = remotes
      .filter((remote) => remote.devEntryUrl)
      .map((remote) => new URL(remote.devEntryUrl!).port);
    expect(new Set(ports).size).toBe(ports.length);
  });
});
