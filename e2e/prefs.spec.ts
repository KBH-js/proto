import { test, expect, bootDesktop } from './fixtures';

test('theme toggle flips the dark class on the shell root', async ({ page }) => {
  await bootDesktop(page);

  // WindowManagerLayout scopes Tailwind dark variants via a `dark` class
  // on the shell root — not on <html>.
  const shellRoot = page.locator('div.w-screen.h-screen');
  await expect(shellRoot).toHaveClass(/\bdark\b/);

  await page.getByRole('button', { name: 'Switch to light mode' }).click();

  await expect(shellRoot).not.toHaveClass(/\bdark\b/);
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
});

test('locale toggle switches shell strings between English and Korean', async ({ page }) => {
  await bootDesktop(page);

  await expect(page.locator('[data-app-icon="network"]')).toContainText('Network');

  await page.getByRole('button', { name: 'Switch to Korean' }).click();

  await expect(page.locator('[data-app-icon="network"]')).toContainText('네트워크');
  // Toggle back from the Korean-labelled button
  await page.getByRole('button', { name: 'English로 전환' }).click();
  await expect(page.locator('[data-app-icon="network"]')).toContainText('Network');
});
