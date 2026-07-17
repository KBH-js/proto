import { test, expect, bootDesktop } from '../fixtures';

/**
 * Post-deploy smoke — the failure classes local E2E can never see because
 * they only exist on the deployed topology: asset prefixes, remote CORS
 * headers, manifest entryUrl drift, stale chunks after a redeploy.
 *
 * Runs against `SMOKE_URL` (a live Vercel deployment) via
 * playwright.deploy.config.ts; no local servers are involved, so the host
 * resolves remotes from the production manifest exactly like a visitor would.
 */

interface ManifestApp {
  type: string;
  remote?: { name: string; entryUrl: string };
}

test('production manifest resolves and every remote entry answers with CORS', async ({ request, baseURL }) => {
  const res = await request.get('/remotes.manifest.json');
  expect(res.status()).toBe(200);

  const manifest = (await res.json()) as { apps: ManifestApp[] };
  const remotes = manifest.apps.flatMap((app) => (app.type === 'remote' && app.remote ? [app.remote] : []));
  expect(remotes.length).toBeGreaterThan(0);

  const hostOrigin = new URL(String(baseURL)).origin;
  for (const remote of remotes) {
    // Fetch cross-origin exactly like the host runtime does — the entry must
    // be live AND carry CORS headers, or every window of that remote breaks.
    const entry = await request.get(remote.entryUrl, { headers: { Origin: hostOrigin } });
    expect(entry.status(), remote.entryUrl).toBe(200);
    expect(entry.headers()['access-control-allow-origin'], `CORS missing on ${remote.entryUrl}`).toBeTruthy();

    const mf = (await entry.json()) as { name?: string };
    expect(mf.name, `${remote.entryUrl} is not the '${remote.name}' MF manifest`).toBe(remote.name);
  }
});

test('deployed host boots to the desktop with every remote registered', async ({ page }) => {
  await bootDesktop(page);

  // 4 local apps + 4 remotes — mirrors boot.spec, against the live deployment
  await expect(page.locator('[data-app-icon]')).toHaveCount(8);
  await expect(page.locator('[data-tour="tray"]')).toContainText('Module Federation · 4 remotes');
});
