import { test as base, expect, type Page, type Locator } from '@playwright/test';

/**
 * Shared E2E fixture.
 *
 * The shell persists prefs (zustand `persist`, shape `{state, version}`), so a
 * clean profile boots in Korean with the first-run tour armed. Specs assert on
 * English strings and don't want the tour overlay, so the default fixture
 * seeds both keys before any document loads.
 */

export const PREFS_SEED = JSON.stringify({ state: { locale: 'en', theme: 'dark' }, version: 1 });
export const TOUR_SEED = JSON.stringify({ state: { seen: true }, version: 1 });

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(
      ({ prefs, tour }) => {
        localStorage.setItem('proto-desktop:prefs', prefs);
        localStorage.setItem('proto-desktop:tour', tour);
      },
      { prefs: PREFS_SEED, tour: TOUR_SEED },
    );
    await use(context);
  },
});

export { expect };

/**
 * Navigate to the desktop and wait for the boot overlay to clear.
 * BootScreen is an opaque z-[99999] overlay that unmounts once the remote
 * catalog resolves (min 400ms + fade), so icons only become interactable
 * after its "KBH-Desktop" heading is gone.
 */
export async function bootDesktop(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByText('KBH-Desktop', { exact: true })).toBeHidden({ timeout: 30_000 });
  await expect(page.locator('[data-app-icon="network"]')).toBeVisible({ timeout: 30_000 });
}

/**
 * Locate a window frame by an exact text it renders (react-rnd wraps every
 * window in a `.react-draggable` element). Pick text unique to that window —
 * the title-bar label collides with desktop-icon/taskbar labels only outside
 * the frame, so exact title text is safe.
 */
export function windowFrame(page: Page, exactText: string): Locator {
  return page
    .locator('.react-draggable')
    .filter({ has: page.getByText(exactText, { exact: true }) });
}
