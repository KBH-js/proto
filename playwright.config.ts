import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

/**
 * E2E topology: the host MUST run in dev mode — `resolveEntryUrl()` picks each
 * remote's `devEntryUrl` (localhost:5001–5004) only when `import.meta.env.DEV`
 * is true, so a dev host + four remote dev servers exercises the full runtime
 * federation path without touching the production manifest.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    // Functional E2E (pnpm test:e2e)
    {
      name: 'chromium',
      testDir: 'e2e',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm -C packages/remote-calculator dev',
      url: 'http://localhost:5001/mf-manifest.json',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm -C packages/remote-notes dev',
      url: 'http://localhost:5002/mf-manifest.json',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm -C packages/remote-network dev',
      url: 'http://localhost:5003/mf-manifest.json',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm -C packages/remote-compute dev',
      url: 'http://localhost:5004/mf-manifest.json',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
});
