# Test structure

Doc: https://playwright.dev/docs/writing-tests · https://playwright.dev/docs/api/class-test

## File layout

```
e2e/
├── <feature>.e2e.ts         # tests (suffix .e2e.ts — testMatch in playwright.config.ts)
└── <feature>.po.ts          # page object + fixture, once the feature warrants one
```

Specs live outside `src/` so Vitest never picks them up.

## Anatomy of a spec

```ts
import { expect, test } from '@playwright/test';

test.describe('Poules', () => {
    test('score entry updates ranking and progress', async ({ page }) => {
        await page.goto('/');

        await page.getByLabel('Score domicile').fill('3');
        await page.getByLabel('Score extérieur').fill('0');

        await expect(page.getByText('1/6').first()).toBeVisible();
        await expect(page.getByText(/1 \/ 104 matchs renseignés/)).toBeVisible();
    });
});
```

## Hooks

| Hook         | Scope           | Use for                                      |
| ------------ | --------------- | -------------------------------------------- |
| `beforeEach` | Each test       | Common setup (mocks, navigation)             |
| `afterEach`  | Each test       | Per-test cleanup (rare — fixtures preferred) |
| `beforeAll`  | Once per worker | Expensive shared setup (use cautiously)      |
| `afterAll`   | Once per worker | Cleanup of worker-scoped state               |

Prefer **fixtures** over `beforeAll` / `afterAll` — they encapsulate setup + teardown together and only run when needed. See `references/fixtures.md`.

## `test.describe` groups

Group related tests; the title becomes a prefix in the report.

```ts
test.describe('Tableau final', () => {
    test('group winner propagates to the round of 32', ...);
    test('penalty winner propagates to the next round', ...);
});
```

Avoid deep nesting — one level of `describe` is usually enough.

## Tags

Tags are optional `--grep` filters (e.g. `{ tag: ['@slow'] }` + `npx playwright test --grep-invert @slow`). Introduce one only when a real filtering need appears — don't tag by default.

## Skipping / fixing

```ts
test.skip('reason — flaky, see issue #42', ...);        // do not run
test.fixme('not yet implemented', ...);                 // known broken
test.fail('expected failure for now', ...);             // expects to fail
```

Always include a reason and an issue reference. Never leave `test.only` committed.

## `test.step` — annotate substeps in the report

Group several actions/assertions under a labeled step. Steps appear in the HTML report and the trace timeline, and improve diagnostics on long flows.

```ts
test('fill a group and check qualification', async ({ page }) => {
    await test.step('enter all six scores', async () => {
        // … fill inputs …
        await expect(page.getByText('6/6')).toBeVisible();
    });

    await test.step('check qualified teams', async () => {
        await expect(page.getByText(/qualifié/).first()).toBeVisible();
    });
});
```

`test.step` does not affect parallelism or isolation — it is purely a reporting/diagnostic aid.

## Performance — bundle related checks

Each `page.goto` boots the whole app (and the Angular dev server compiles on first hit), so navigation is the dominant cost in an e2e run. Consequences:

- One `goto` per test is the target. Stay on the same page, drive the flow through user actions (the app is tab-based — switch tabs instead of reloading).
- Avoid `page.reload()` unless the test is about reload/persistence behavior itself.
- Prefer one richer test that walks a flow and asserts at multiple points over many narrow tests that each `goto`. Use `test.step` to keep it readable.
- Split when two flows genuinely need different starting states (e.g. different `official-results.json` mocks) or when a long flow needs failure containment.

## Naming

```
should <user-visible outcome> when <precondition>
```

Examples:

- `should lock the score inputs when the match has an official result`
- `should rank the best thirds when all groups are complete`
- `should propagate the penalty winner to the next round`

Avoid `it works`, `test 1`, `case`, `flow`.
