import { expect, test } from '@playwright/test';

test.describe('Persistance', () => {
  test('les pronostics survivent à un rechargement (LocalStorage)', async ({ page }) => {
    await page.goto('/');
    const inputs = page.locator('input.score-input');
    await inputs.nth(0).fill('2');
    await inputs.nth(1).fill('1');
    await expect(page.getByText(/1 \/ 104 matchs renseignés/)).toBeVisible();

    await page.reload();

    const reloaded = page.locator('input.score-input');
    await expect(reloaded.nth(0)).toHaveValue('2');
    await expect(reloaded.nth(1)).toHaveValue('1');
  });
});
