import { test as firstRun, expect as baseExpect } from '@playwright/test';
import { test, expect, bootDesktop, PREFS_SEED } from './fixtures';

// Uses the raw Playwright test: seeds prefs (English) but NOT the tour flag,
// so this is the one spec that exercises the first-run path.
firstRun('first run shows the spotlight tour and Skip dismisses it', async ({ page }) => {
  await page.addInitScript((prefs) => {
    localStorage.setItem('proto-desktop:prefs', prefs);
  }, PREFS_SEED);
  await page.goto('/');

  const dialog = page.getByRole('dialog');
  await baseExpect(dialog).toBeVisible({ timeout: 30_000 });
  await baseExpect(dialog).toContainText('Welcome to KBH-Desktop');
  await dialog.getByRole('button', { name: 'Skip' }).click();
  await baseExpect(dialog).toBeHidden();
});

test('boots to a desktop with all apps and a healthy federation tray', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await bootDesktop(page);

  // 4 local apps + 4 remotes from the runtime catalog
  await expect(page.locator('[data-app-icon]')).toHaveCount(8);
  // Tray status strip proves the manifest resolved and remotes registered
  await expect(page.locator('[data-tour="tray"]')).toContainText('Module Federation · 4 remotes · React 19');

  expect(consoleErrors).toEqual([]);
});
