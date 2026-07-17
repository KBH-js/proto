import { test, expect, bootDesktop, windowFrame } from './fixtures';

test('opens a local app window and lists it in the taskbar', async ({ page }) => {
  await bootDesktop(page);

  await page.locator('[data-app-icon="about"]').click();

  // The About window renders the portfolio header
  const win = windowFrame(page, 'Byunghoon Kang');
  await expect(win).toBeVisible();

  // …and gets a taskbar item wired to its window id
  const taskbarItem = page.locator('[data-window-id]').filter({ hasText: 'About' });
  await expect(taskbarItem).toBeVisible();

  // Closing removes both the frame and the taskbar item
  await win.getByRole('button', { name: 'Close window' }).click();
  await expect(win).toBeHidden();
  await expect(taskbarItem).toHaveCount(0);
});
