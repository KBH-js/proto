import { test, expect } from '@playwright/test';
import { bootDesktop, windowFrame, TOUR_SEED } from '../fixtures';

/**
 * Mini visual-regression matrix: 3 surfaces × 2 themes = 6 baselines.
 *
 * Runs as the separate `vrt` Playwright project (`pnpm test:vrt`) so the
 * functional E2E suite (`pnpm test:e2e`) stays screenshot-free. Baselines are
 * generated on CI (ubuntu) by the "VRT baseline" workflow and committed under
 * `e2e/vrt/__screenshots__/` — see TESTING.md before touching them.
 *
 * Uses the raw Playwright test (not the shared fixture) because the theme is
 * the matrix axis: each describe block seeds its own `proto-desktop:prefs`.
 */

const THEMES = ['dark', 'light'] as const;

function prefsSeed(theme: (typeof THEMES)[number]): string {
  return JSON.stringify({ state: { locale: 'en', theme }, version: 1 });
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ({ prefs, tour }) => {
          localStorage.setItem('proto-desktop:prefs', prefs);
          localStorage.setItem('proto-desktop:tour', tour);
        },
        { prefs: prefsSeed(theme), tour: TOUR_SEED },
      );
      await bootDesktop(page);
      // The tray strip renders only after the remote catalog resolves — gate
      // on it so the desktop shot always includes the full 8-icon grid.
      await expect(page.locator('[data-tour="tray"]')).toContainText('4 remotes');
    });

    test(`desktop shell (${theme})`, async ({ page }) => {
      await expect(page).toHaveScreenshot(`desktop-${theme}.png`);
    });

    test(`about window (${theme})`, async ({ page }) => {
      await page.locator('[data-app-icon="about"]').click();

      const win = windowFrame(page, 'Byunghoon Kang');
      await expect(win).toBeVisible();
      await expect(win).toHaveScreenshot(`window-about-${theme}.png`);
    });

    test(`design tokens window (${theme})`, async ({ page }) => {
      await page.locator('[data-app-icon="tokens"]').click();

      const win = windowFrame(page, '3-layer token pipeline · raw colors blocked by lint');
      await expect(win).toBeVisible();
      await expect(win).toHaveScreenshot(`window-tokens-${theme}.png`);
    });
  });
}
