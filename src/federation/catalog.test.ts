// @vitest-environment node
// Node's undici Response is used deliberately — happy-dom's Response.json()
// locks its stream under MSW. catalog.ts needs no DOM.
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/msw/server';
import { MANIFEST_PATTERN, validCatalog } from '../test/msw/handlers';
import { fetchAppCatalog, resolveEntryUrl } from './catalog';

describe('fetchAppCatalog', () => {
  it('returns the parsed catalog on the happy path', async () => {
    const catalog = await fetchAppCatalog();
    expect(catalog.version).toBe(1);
    expect(catalog.apps).toHaveLength(2);
    expect(catalog.apps[0].remote?.name).toBe('remoteCalculator');
  });

  it('throws on a non-2xx response', async () => {
    server.use(http.get(MANIFEST_PATTERN, () => new HttpResponse(null, { status: 500 })));
    await expect(fetchAppCatalog()).rejects.toThrow(/HTTP 500/);
  });

  it('throws when the top-level shape is malformed', async () => {
    server.use(http.get(MANIFEST_PATTERN, () => HttpResponse.json({ version: 'x', apps: {} })));
    await expect(fetchAppCatalog()).rejects.toThrow(/Malformed app catalog/);
  });

  it('throws when an app is missing required fields', async () => {
    server.use(
      http.get(MANIFEST_PATTERN, () =>
        HttpResponse.json({ version: 1, apps: [{ id: 'x', type: 'local' }] }),
      ),
    );
    await expect(fetchAppCatalog()).rejects.toThrow(/Malformed catalog app/);
  });

  it('throws when a remote app is missing its remote block', async () => {
    server.use(
      http.get(MANIFEST_PATTERN, () =>
        HttpResponse.json({
          version: 1,
          apps: [{ id: 'calc', title: 'Calc', icon: 'calculator', type: 'remote' }],
        }),
      ),
    );
    await expect(fetchAppCatalog()).rejects.toThrow(/missing remote/);
  });

  it('propagates a network error', async () => {
    server.use(http.get(MANIFEST_PATTERN, () => HttpResponse.error()));
    await expect(fetchAppCatalog()).rejects.toThrow();
  });
});

describe('resolveEntryUrl', () => {
  const remote = validCatalog.apps[0].remote!;

  it('falls back to the production entry when no dev entry exists', () => {
    // Independent of the mode: with no devEntryUrl the prod entry is the only option.
    expect(resolveEntryUrl({ ...remote, devEntryUrl: undefined })).toBe(remote.entryUrl);
  });

  // `isDevelopment` is captured at module load, so the two mode-dependent
  // cases re-import catalog with the config module mocked.
  it('prefers the dev entry in dev mode', async () => {
    vi.resetModules();
    vi.doMock('../config/portfolio.config', () => ({ isDevelopment: true }));
    const { resolveEntryUrl: r } = await import('./catalog');
    expect(r(remote)).toBe(remote.devEntryUrl);
    vi.doUnmock('../config/portfolio.config');
    vi.resetModules();
  });

  it('uses the production entry outside dev mode', async () => {
    vi.resetModules();
    vi.doMock('../config/portfolio.config', () => ({ isDevelopment: false }));
    const { resolveEntryUrl: r } = await import('./catalog');
    expect(r(remote)).toBe(remote.entryUrl);
    vi.doUnmock('../config/portfolio.config');
    vi.resetModules();
  });
});
