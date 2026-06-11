# Locators

Doc: https://playwright.dev/docs/locators · https://playwright.dev/docs/other-locators

For the full API and rationale, read the docs. This file is the **decision guide** for choosing a locator in this repo.

## Priority order

Use the first option that fits.

| Priority | Locator                                          | Use for                                         |
| -------- | ------------------------------------------------ | ----------------------------------------------- |
| 1        | `page.getByRole(role, { name })`                 | Any interactive element (button, link, textbox) |
| 2        | `page.getByLabel(text)`                          | Form controls associated with a `<label>`       |
| 3        | `page.getByPlaceholder(text)`                    | Inputs without labels                           |
| 4        | `page.getByText(text)`                           | Non-interactive text (headings, paragraphs)     |
| 5        | `page.getByAltText(text)` / `page.getByTitle(t)` | Images / elements with `title`                  |
| 6        | `page.getByTestId(id)`                           | Stable test hook when nothing semantic fits     |
| —        | `page.locator('css' \| 'xpath=...')`             | **Avoid** — last resort, with a comment         |

## `getByTestId` and `data-testid`

The repo uses Playwright's default test-id attribute (`data-testid`), so:

```ts
page.getByTestId('submit-score-button'); // matches <x data-testid="submit-score-button">
```

`data-testid` lives on the production component template — not added solely for the test. Always use `getByTestId` to query it; never `page.locator('[data-testid="..."]')` (see anti-patterns).

When you need a new test hook on a component:

1. Add `data-testid="<descriptive-name>"` to the component template
2. Reference it in the test with `page.getByTestId('<descriptive-name>')`

Use kebab-case for new ids (e.g. `submit-score-button`).

## `getByText` and UI copy

The app UI is French and single-language, so hardcoded French strings in `getByText` are acceptable. Still prefer `getByRole` or `getByTestId` over `getByText` where possible — they survive copy changes.

## Examples

```ts
await page.getByRole('tab', { name: 'Poules' }).click();
await page.getByLabel('Score domicile').fill('3');
await expect(page.getByText(/1 \/ 104 matchs renseignés/)).toBeVisible();
await page.getByTestId('reset-predictions').click();
```

## Chain and filter, do not index

`nth(0)`, `first()`, `last()` are brittle. Filter by what makes the element unique.

```ts
// ✅ Filter by content
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
await product.getByRole('button', { name: 'Add to cart' }).click();

// ✅ Filter by descendant locator
const card = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Product 2' }) });

// ❌ Position-based — breaks when order changes
await page.getByRole('button').nth(2).click();
```

`and()`, `or()`, list assertions (`toHaveCount`, `toHaveText([...])`), strict mode — see the docs.

## Anti-patterns

- ❌ `page.locator('[data-testid="..."]')` — use `getByTestId(...)`
- ❌ `page.locator('div.foo > .bar:nth-child(2)')` — class chains break with refactors
- ❌ `page.locator('xpath=...')` — DOM-position fragile, no shadow DOM piercing
- ❌ `page.getByRole('button').first()` / `.nth(2)` — use `.filter({ hasText })` instead
- ❌ `page.locator('#mui-12345')` — auto-generated IDs, not stable
- ❌ Adding a `data-testid` only on the test side without coordinating with the component — keep `data-testid` in the component template

## Generating locators

`npx playwright codegen <url>` → "Pick Locator" → hover an element → copy. See `references/debugging-tracing.md`.
