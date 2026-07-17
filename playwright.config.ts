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
      testIgnore: '**/vrt/**',
      use: { ...devices['Desktop Chrome'] },
    },
    /**
     * Visual regression (pnpm test:vrt) — 3 surfaces × light/dark.
     * Baselines are rendered on CI (ubuntu) and committed; font/AA rendering
     * differs per OS, so local runs compare against the linux baselines with
     * a small tolerance and are best-effort only (see TESTING.md).
     */
    {
      name: 'vrt',
      testDir: 'e2e/vrt',
      // One platform-agnostic baseline set (the CI-rendered one) instead of
      // Playwright's default per-OS suffixed snapshots.
      snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.02,
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
        },
      },
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
