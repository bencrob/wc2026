# Parallelism & isolation

Doc: https://playwright.dev/docs/test-parallel

## Defaults

- Files run in **parallel** across workers.
- Tests **inside one file** run **sequentially** in the same worker (unless overridden).
- Each test gets a fresh `BrowserContext` — cookies, storage, cache, IndexedDB are clean.

For this app the fresh `BrowserContext` matters most: predictions live in LocalStorage, so each test starts with an empty prediction set unless it seeds one (`page.addInitScript`).

## Make tests independent

A test must:

- Set up everything it needs in `beforeEach` or a fixture (or inline in the test body for one-off setup).
- Not depend on side effects of any other test.
- Not rely on test execution order.

If you find yourself writing "this test must run after the previous one because…", you have a serial group, not isolated tests — see below.

## Force parallel inside a file

Useful when tests in the same file are independent and you want the speed-up.

```ts
test.describe.configure({ mode: 'parallel' });

test.describe('independent flows', () => {
    test('a', async ({ page }) => { ... });
    test('b', async ({ page }) => { ... });
});
```

## Force serial inside a file

When tests genuinely depend on each other (e.g. multi-step wizard against shared state). Failing tests skip the rest of the group.

```ts
test.describe.configure({ mode: 'serial' });

test.describe('wizard', () => {
    test('step 1', async ({ page }) => { ... });
    test('step 2', async ({ page }) => { ... });   // skipped if step 1 fails
});
```

Treat serial mode as a smell, not a feature. Most "I need serial" cases are solved by registering the missing setup as a fixture or in `beforeEach`.

## `beforeAll` / `afterAll` and parallelism

`beforeAll` runs **once per worker**, not once per file. With parallel workers, side effects across workers will collide. Prefer:

- Worker-scoped fixtures for expensive shared resources (see `references/fixtures.md`)
- Per-test setup for everything else

## Sharing context across tests in a `describe` block

Sometimes you want **one** browser context for an entire describe (e.g. very expensive bootstrap). Use the worker-scoped `browser` fixture and create a context yourself:

```ts
test.describe.configure({ mode: 'serial' });
test.describe('shared ctx', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        const ctx = await browser.newContext();
        page = await ctx.newPage();
    });

    test('a', async () => {
        /* uses page */
    });
    test('b', async () => {
        /* uses page */
    });
});
```

This trades isolation for speed — only when justified.

## Common isolation bugs

- **Mocks registered in `beforeAll`** — only fired for the first test in the worker. Use `beforeEach` or a fixture.
- **Module-level mutable state** — e.g. `const counter = { n: 0 }` at file scope, mutated in tests. Tests run in different workers/processes; this never works as intended.
- **Date-dependent tests** without a frozen clock — flaky around midnight, DST, etc. Either freeze via `Date.now()` mock or assert ranges, not equalities.
- **Order-dependent assertions** — `expect(items).toHaveText(['a', 'b'])` against a server that returns items in non-deterministic order. Sort, or assert with `toContainText` and `toHaveCount`.
