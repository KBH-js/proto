import { test, expect, bootDesktop, windowFrame } from './fixtures';

test('loads the Network remote through the Module Federation runtime', async ({ page }) => {
  await bootDesktop(page);

  await page.locator('[data-app-icon="network"]').click();

  // Title bar carries the remote badge (dev entry → MFE:DEV)
  const win = windowFrame(page, 'MFE:DEV');
  await expect(win).toBeVisible({ timeout: 30_000 });

  // The exposed module actually rendered — not just the frame
  await expect(win.getByText('Network Dashboard')).toBeVisible({ timeout: 30_000 });

  // Load telemetry surfaces as a toast
  await expect(page.getByText(/loaded in \d+ms/)).toBeVisible();
});
