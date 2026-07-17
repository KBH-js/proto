import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validCatalog } from '../test/msw/handlers';

// The MF runtime needs a federation instance created by the build plugin,
// which doesn't exist under Vitest — registration is asserted via this mock.
vi.mock('../federation/runtime', () => ({
  registerAppRemotes: vi.fn(),
}));

// The catalog fetch is mocked directly (instead of via MSW) so this suite can
// run in the default happy-dom environment — see catalog.test.ts for the
// Response.json() stream quirk that forces its suite onto Node.
vi.mock('../federation/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../federation/catalog')>();
  return { ...actual, fetchAppCatalog: vi.fn() };
});

import { initializeAppRegistry, useAppRegistry } from './appRegistry';
import { fetchAppCatalog } from '../federation/catalog';
import { registerAppRemotes } from '../federation/runtime';

const fetchCatalog = vi.mocked(fetchAppCatalog);
const registerRemotes = vi.mocked(registerAppRemotes);

// The static seed (local apps only, status 'loading'), captured before any
// test mutates the store. Restoring it replicates what dev-HMR does when it
// re-instantiates the store module.
const seededState = useAppRegistry.getState();

describe('initializeAppRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppRegistry.setState(seededState, true);
    fetchCatalog.mockResolvedValue(validCatalog);
  });

  it('merges remote catalog entries into the seeded locals and becomes ready', async () => {
    await initializeAppRegistry();

    const { entries, status } = useAppRegistry.getState();
    expect(status).toBe('ready');
    // Locals survive the merge; remotes come from the catalog fixture.
    expect(entries.about).toBeDefined();
    expect(entries.calculator?.isRemote).toBe(true);
    expect(entries.notes?.remote?.module).toBe('NotesApp');
    // The unresolved prod entry survives for About's deployment list.
    expect(entries.calculator?.remote?.prodEntry).toBe(
      'https://remote-calculator-sage.vercel.app/mf-manifest.json',
    );
    expect(registerRemotes).toHaveBeenCalledTimes(1);
    expect(registerRemotes.mock.calls[0][0]).toHaveLength(3);
  });

  it('is a no-op when called again after the registry is ready', async () => {
    await initializeAppRegistry();
    await initializeAppRegistry();

    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    expect(registerRemotes).toHaveBeenCalledTimes(1);
  });

  it('joins an in-flight initialization instead of fetching twice (StrictMode)', async () => {
    const first = initializeAppRegistry();
    const second = initializeAppRegistry();

    expect(second).toBe(first);
    await Promise.all([first, second]);
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
  });

  it('runs again after the store resets to its seed (dev HMR re-instantiation)', async () => {
    await initializeAppRegistry();
    expect(useAppRegistry.getState().entries.calculator).toBeDefined();

    // HMR re-instantiates the store module: entries drop back to the local
    // seed and status to 'loading', while this module's closures survive.
    useAppRegistry.setState(seededState, true);
    expect(useAppRegistry.getState().entries.calculator).toBeUndefined();

    await initializeAppRegistry();

    const { entries, status } = useAppRegistry.getState();
    expect(status).toBe('ready');
    expect(entries.calculator?.isRemote).toBe(true);
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
    expect(registerRemotes).toHaveBeenCalledTimes(2);
  });

  it('degrades on catalog failure and does not retry on later calls', async () => {
    fetchCatalog.mockRejectedValue(new Error('manifest unreachable'));

    await initializeAppRegistry();

    const { entries, status } = useAppRegistry.getState();
    expect(status).toBe('degraded');
    // Local apps stay usable; no remote entries appear.
    expect(entries.about).toBeDefined();
    expect(entries.calculator).toBeUndefined();
    expect(registerRemotes).not.toHaveBeenCalled();

    // 'degraded' is a settled state — repeated calls must not refetch-loop.
    await initializeAppRegistry();
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
  });
});
