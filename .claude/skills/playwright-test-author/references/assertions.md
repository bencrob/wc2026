# Assertions

Full matcher list and behavior: https://playwright.dev/docs/test-assertions

This file documents the **rule** and the **patterns** the repo uses. Do not memorize matcher names from here — the docs are the source of truth.

## Rule: web-first only

Every assertion targeting a `Locator`, `Page`, or `APIResponse` must use `await expect(...)`. The matcher polls until it passes or times out. Never assert on a synchronous snapshot.

```ts
// ✅ auto-retries until visible (or timeout)
await expect(page.getByText('Welcome')).toBeVisible();

// ❌ snapshots once, no retry, race-prone
expect(await page.getByText('Welcome').isVisible()).toBe(true);
```

The matchers you will use most: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveCount`, `toHaveURL`, `toBeChecked`. The full list (visibility/state, content, DOM properties, page-level, API response, screenshots) is in the docs.

## Patterns specific to this repo

### Soft assertions in long SSR-bound flows

Tests in this repo bundle multiple checks per page (see `references/test-structure.md` "Performance and SSR cost"). When several checks at the **same point in the flow** are independent (e.g. multiple header values after login), `expect.soft` lets you collect all failures rather than stopping on the first.

```ts
await expect.soft(header.cashBalance).toHaveText('100€');
await expect.soft(header.bonusBalance).toHaveText('10€');
await expect.soft(header.accountName).toHaveText('Test User');
```

Do not use soft assertions across actions that depend on each other — if the first one failing makes the rest meaningless, use a hard assertion.

### Polling for non-locator values

Use `expect.poll` (single value) or `expect.toPass` (block) when waiting on something that isn't a `Locator`.

```ts
// Wait for a backend job to finish
await expect
    .poll(async () => (await page.request.get('/api/jobs/1')).status(), {
        timeout: 10_000,
    })
    .toBe(200);

// Retry an entire block of expects together
await expect(async () => {
    const response = await page.request.get('/api/jobs/1');
    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveProperty('result', 'done');
}).toPass({ timeout: 60_000 });
```

Avoid using `waitForResponse` when what you really want is a state assertion — the matcher tells you _what is true now_; the listener tells you _what just happened_.

### Custom message

Helps a future reader of CI logs.

```ts
await expect(loginButton, 'login button must hide after success').toBeHidden();
```

### `toHaveScreenshot`

Requires a baseline. First run with `--update-snapshots` to generate, then commit the baseline. Visual diffs are sensitive to font rendering and OS — the suite is currently not running these in CI; coordinate before adding new ones.

## Anti-patterns

- ❌ `expect(await loc.isVisible()).toBe(true)` — no retry
- ❌ `expect(await loc.innerText()).toBe('x')` — no retry
- ❌ `await loc.waitFor()` followed by `expect(loc).toBeVisible()` — redundant
- ❌ `await loc.waitFor({ state: 'hidden' })` to assert disappearance — use `await expect(loc).toBeHidden()`. Some existing POMs (e.g. `login.ts`) still use the `waitFor` form; prefer the assertion in new code.
- ❌ Missing `await` on `expect(locator)` — the matcher returns a promise; ESLint `@typescript-eslint/no-floating-promises` catches it
