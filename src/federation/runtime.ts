import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import type { ComponentType } from 'react';

/**
 * Module Federation Runtime Helpers
 *
 * The host build declares NO remotes — the MF rsbuild plugin only creates
 * the federation instance and the shared scope (react/react-dom).
 * These helpers register and load remotes dynamically at runtime, which is
 * what enables:
 *   - remote URLs injected from a manifest instead of build-time env vars
 *   - per-window retry after a failed load (force re-registration)
 */

export interface RemoteRegistration {
  /** MF container name, e.g. 'remoteCalculator' */
  name: string;
  /** Entry URL — the remote's mf-manifest.json (or remoteEntry.js) */
  entry: string;
}

/**
 * Register remotes with the MF runtime instance created by the build plugin.
 * Safe to call once at boot with the full list from the app catalog.
 */
export function registerAppRemotes(remotes: RemoteRegistration[]): void {
  registerRemotes(remotes);
}

/**
 * Re-register a single remote, discarding its cached container/snapshot.
 *
 * Used by the per-window retry flow: after a failed load the MF runtime
 * caches the failure, so a plain re-import would reject again. Forcing the
 * registration resets that cache. Already-mounted instances of the same
 * remote keep working — their module code is already executing in the
 * React tree; only subsequent loadRemote calls hit the fresh container.
 */
export function forceRefreshRemote(remote: RemoteRegistration): void {
  registerRemotes([remote], { force: true });
}

/**
 * Load a remote module and normalize it into a lazy()-compatible shape.
 *
 * @param id - Federated module id, e.g. 'remoteCalculator/CalculatorApp'
 * @throws when the module cannot be loaded or has no component default export —
 *         the rejection propagates through React.lazy into the ErrorBoundary.
 */
export async function loadRemoteComponent<P = object>(
  id: string,
): Promise<{ default: ComponentType<P> }> {
  const mod = await loadRemote<{ default: ComponentType<P> }>(id);
  if (!mod || typeof mod.default !== 'function') {
    throw new Error(`Remote module '${id}' did not resolve to a React component`);
  }
  return { default: mod.default };
}
