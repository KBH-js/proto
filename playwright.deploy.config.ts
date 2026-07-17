import { defineConfig, devices } from '@playwright/test';

/**
 * Post-deploy smoke config (`pnpm test:smoke`) — runs `e2e/deploy/` against a
 * LIVE Vercel deployment instead of local dev servers (contrast with
 * playwright.config.ts, which boots the 5-server dev topology).
 *
 * `SMOKE_URL` is the deployment to verify; the deploy-smoke workflow injects
 * it from the GitHub `deployment_status` event. Vercel's SSO protection on
 * per-deployment URLs is crossed with the protection-bypass header when
 * `VERCEL_AUTOMATION_BYPASS_SECRET` is set (harmless when protection is off).
 */
const SMOKE_URL = process.env.SMOKE_URL;
if (!SMOKE_URL) {
  throw new Error('SMOKE_URL is required — e.g. SMOKE_URL=https://proto-six-iota.vercel.app pnpm test:smoke');
}

const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: 'e2e/deploy',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2, // live-network smoke — absorb transient edge hiccups
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: SMOKE_URL,
    trace: 'on-first-retry',
    // Sent on every request (page loads + the request fixture) so protected
    // deployments answer instead of 302-ing to Vercel SSO.
    extraHTTPHeaders: BYPASS_SECRET ? { 'x-vercel-protection-bypass': BYPASS_SECRET } : undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
