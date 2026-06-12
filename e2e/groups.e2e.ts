import { expect, test } from '@playwright/test';

test.describe('Poules', () => {
  test('la saisie d’un score met à jour le classement et la progression', async ({ page }) => {
    // Aucun résultat officiel + horloge figée avant tout coup d'envoi → M1 éditable.
    await page.route('**/official-results.json', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ version: 1, results: {} }),
      }),
    );
    await page.goto('/?now=2026-06-01T00:00:00Z');

    // Onglet Poules actif, groupe A déplié : premiers inputs = match M1 (A1 vs A2).
    const inputs = page.locator('input.score-input');
    await inputs.nth(0).fill('3'); // A1
    await inputs.nth(1).fill('0'); // A2

    // Le compteur de saisie du groupe passe à 1/6.
    await expect(page.getByText('1/6').first()).toBeVisible();

    // La progression globale reflète 1 match renseigné.
    await expect(page.getByText(/1 \/ 104 matchs renseignés/)).toBeVisible();
  });
});
