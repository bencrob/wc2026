# Anti-patterns to reject

Quick checklist used in review. If you see one of these, comment, link the relevant reference, and request a fix.

## Locators

- `page.locator('div.foo > .bar:nth-child(2)')` — replace with role/label/text/`data-qa`
- `page.locator('xpath=...')` — same, plus no shadow DOM piercing
- `page.getByRole('button').first()` / `.nth(2)` — use `.filter({ hasText })` instead
- `page.locator('#mui-12345')` — auto-generated IDs, not stable
- `data-qa` introduced only in the test, not in the template — keep them in the component

## Assertions

- `expect(await loc.isVisible()).toBe(true)` — no auto-retry; use `await expect(loc).toBeVisible()`
- `expect(await loc.innerText()).toBe('x')` — same; use `toHaveText`
- `await loc.waitFor(); await expect(loc).toBeVisible();` — the assertion already waits, drop the `waitFor`
- Missing `await` on `expect(locator).toXxx()` — silently does nothing; ESLint `@typescript-eslint/no-floating-promises` catches it
- `expect(value).toBe(...)` against a stringified DOM snapshot — fragile, asserts on internals

## Waits

- `await page.waitForTimeout(N)` — replace with `expect(...).toBeVisible()` or `page.waitForResponse(...)`
- `await new Promise(r => setTimeout(r, N))` — same
- `await page.waitForLoadState('networkidle')` — flaky on apps with long-poll/SSE; assert the visible outcome instead

## Actions

- `await loc.click({ force: true })` — disables actionability; only acceptable with a comment justifying it
- `await page.evaluate(() => input.value = 'x')` to set form values — bypasses validation; use `fill`
- Triggering events via `dispatchEvent` when a real user action would do — fragile against framework changes

## Mocking

- Mocks registered after the request fires — race; register in `beforeEach` / fixture / before the action (e.g. `page.route('**/official-results.json', ...)` must be set before `page.goto`)
- Hardcoded payload literal inline in the spec — move to `<feature>.mocks.ts`
- Same endpoint mocked twice with no `requestPayload` discriminator — second call hits the first registered mock

## Test structure

- `test.only(...)` — fails CI; never commit
- `test.skip(...)` without a reason and ticket — leaves dead tests; always include why
- `console.log` — remove before committing (page-side console logs are fine via `page.on('console')` during debugging only)
- Module-level mutable state — never works across workers
- `beforeAll` for per-test setup (e.g., mock registration) — only fires for the first test in the worker
- One mega-test that exercises ten flows — split into focused tests

## Naming

- `test('test 1', ...)`, `test('it works', ...)`, `test('case', ...)` — describe the user-visible outcome
- POM methods named after the framework (`clickButton`, `fillField`) instead of intent (`login`, `placeBet`)

## Selectors and timing

- `await page.locator(sel).waitFor({ timeout: 60_000 })` — long timeouts mask bugs; default timeout (5s) should cover anything not explicitly slow; if the action _is_ slow, use `waitForResponse` for the underlying request

## Cross-test coupling

- Tests sharing persisted state — each test gets a fresh `BrowserContext` (clean LocalStorage); never disable that isolation to "share" predictions between tests
- Tests that rely on the previous test's URL or scroll position — start each test with explicit navigation

## Misc

- Asserting equality on `Date.now()` — use ranges (`expect(t).toBeGreaterThan(start)`)
- Asserting on order of an unordered API response — assert with `toContainText` + `toHaveCount`, or sort first
- Reading the production code's CSS-in-JS output — assertions should target rendered text/role, not class names
