# Actions

Full action API (`click`, `fill`, `check`, `selectOption`, `hover`, keyboard, files, drag-and-drop): https://playwright.dev/docs/input
Actionability checks: https://playwright.dev/docs/actionability

This file covers the **rule** about waits and the patterns used in this repo. Reach for the docs for the full action surface.

## Trust actionability

Before each action Playwright waits for the element to be visible, stable, hit-testable, enabled and (for fill) editable. You do **not** need `waitFor`, `waitForSelector`, or `waitForTimeout` before an action — the action waits for you.

```ts
// ✅ enough — `click` waits for the button to be ready
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ redundant
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'visible' });
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ flaky and slow
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Submit' }).click();
```

## Replace time-based waits with response-based ones

When you need to wait for a specific request to complete, wait for the response — not for time.

```ts
// ✅ Tie the wait to the actual event
const responsePromise = page.waitForResponse('**/api/me');
await page.getByRole('button', { name: 'Refresh' }).click();
await responsePromise;

// ❌ Never
await page.waitForTimeout(2000);
```

Prefer asserting the visible outcome (`await expect(loc).toBeVisible()`) over `waitForResponse` when both work — the assertion is the user-visible contract.

## Navigation

```ts
await page.goto('/dashboard'); // resolves on `load`
```

Each `page.goto` triggers a full SSR render in this app — see `references/test-structure.md` "Performance and SSR cost". Minimize navigations.

## `force` option — last resort

```ts
await locator.click({ force: true });
```

Disables actionability checks. Acceptable only when:

- The check is correct but the test scenario intentionally breaks it (e.g. asserting that clicking a covered button has no effect)
- The element is correctly enabled but Playwright cannot detect it (rare; file a bug)

Never use `force: true` to "fix flakiness" — find the root cause.

## Anti-patterns

- ❌ `await page.waitForTimeout(N)` — replace with an assertion or `waitForResponse`
- ❌ `await new Promise(r => setTimeout(r, N))` — same
- ❌ `await page.waitForLoadState('networkidle')` — flaky on apps with long-poll/SSE; assert the visible outcome instead
- ❌ Manual `waitFor({ state: 'visible' })` immediately followed by an action
- ❌ `force: true` to mask flakiness
- ❌ `page.evaluate(() => input.value = 'x')` to set form values — bypasses validation; use `fill`
- ❌ Triggering DOM events via `dispatchEvent` when a real user action would do — fragile against framework changes
