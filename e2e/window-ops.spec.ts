import { test, expect, bootDesktop, windowFrame } from './fixtures';

test('maximizes, minimizes, and restores a window from the taskbar', async ({ page }) => {
  await bootDesktop(page);

  await page.locator('[data-app-icon="about"]').click();
  const win = windowFrame(page, 'Byunghoon Kang');
  await expect(win).toBeVisible();

  // Maximize fills (nearly) the whole viewport
  await win.getByRole('button', { name: 'Maximize window' }).click();
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => (await win.boundingBox())?.width ?? 0)
    .toBeGreaterThan(viewport.width * 0.95);

  // Minimize unmounts the frame once the genie animation (220ms) finishes
  await win.getByRole('button', { name: 'Minimize window' }).click();
  await expect(win).toBeHidden();

  // Clicking the taskbar item restores it
  await page.locator('[data-window-id]').filter({ hasText: 'About' }).click();
  await expect(win).toBeVisible();
});
