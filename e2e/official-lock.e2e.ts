import { expect, test } from '@playwright/test';

test.describe('Résultats officiels (serveur)', () => {
  test('un match avec résultat officiel est verrouillé et comparé', async ({ page }) => {
    // Simule le fichier serveur déployé « à la main » : M1 officiel 0-3.
    await page.route('**/official-results.json', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ version: 1, results: { M1: { home: 0, away: 3 } } }),
      }),
    );

    await page.goto('/');

    const first = page.locator('input.score-input').first(); // M1 domicile
    await expect(first).toBeDisabled(); // verrouillage lecture seule
    await expect(first).toHaveValue('0'); // score officiel affiché

    // Ligne de comparaison officielle visible.
    await expect(page.getByText(/Officiel 0–3/)).toBeVisible();
  });
});
