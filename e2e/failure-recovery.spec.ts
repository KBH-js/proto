import { test, expect, bootDesktop } from './fixtures';

/**
 * The résumé claim this proves: a stale/redeployed chunk breaks ONE window,
 * the failure is isolated to that frame's ErrorBoundary, and Try Again
 * recovers just that frame (force re-registration + fresh lazy wrapper).
 *
 * This spec intentionally produces console errors (chaos.invalid network
 * failure + React boundary logging) — do not assert on console cleanliness.
 */
test('a poisoned remote fails into its own frame and Try Again recovers it', async ({ page }) => {
  await bootDesktop(page);

  // Break the Network container via the Inspector's chaos demo
  await page.locator('[data-app-icon="inspector"]').click();
  const networkRow = page
    .getByRole('listitem')
    .filter({ hasText: 'remoteNetwork/NetworkApp' });
  await networkRow.getByRole('button', { name: 'Break' }).click();

  // The reopened Network window fails into its per-frame ErrorBoundary
  await expect(page.getByText('Network is currently unavailable')).toBeVisible({
    timeout: 30_000,
  });
  // The rest of the shell is untouched — the Inspector window is still live
  await expect(page.getByRole('button', { name: 'Heal all' })).toBeVisible();

  // Try Again re-registers the healthy entry and swaps a fresh lazy wrapper
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByText('Network Dashboard')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText('Network is currently unavailable')).toHaveCount(0);
});
