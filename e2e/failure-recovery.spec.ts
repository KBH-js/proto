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

  // Break the Calculator container via the Inspector's chaos demo
  await page.locator('[data-app-icon="inspector"]').click();
  const calculatorRow = page
    .getByRole('listitem')
    .filter({ hasText: 'remoteCalculator/CalculatorApp' });
  await calculatorRow.getByRole('button', { name: 'Break' }).click();

  // The reopened Calculator window fails into its per-frame ErrorBoundary
  await expect(page.getByText('Calculator is currently unavailable')).toBeVisible({
    timeout: 30_000,
  });
  // The rest of the shell is untouched — the Inspector window is still live
  await expect(page.getByRole('button', { name: 'Heal all' })).toBeVisible();

  // Try Again re-registers the healthy entry and swaps a fresh lazy wrapper
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByRole('button', { name: '7', exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText('Calculator is currently unavailable')).toHaveCount(0);
});
