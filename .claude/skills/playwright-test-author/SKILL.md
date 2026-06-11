---
name: playwright-test-author
description: Use when writing or modifying Playwright end-to-end tests in this repository — authoring `e2e/*.e2e.ts` files, page objects, fixtures, mocks, or assertions. Covers locator strategy, web-first assertions, fixture composition, the page object pattern, and `page.route` network mocking. Excludes Playwright configuration topics (workers, projects, retries, reporters).
---

# Playwright Test Author

Author resilient, isolated Playwright tests that follow official best practices and the repo's e2e conventions. This skill applies to any test under `e2e/` (`*.e2e.ts`, matched by `playwright.config.ts`).

The skill does **not** restate the Playwright docs in detail — it links to them. Read https://playwright.dev/docs/intro for fundamentals, then come here for the rules and patterns specific to this repo.

## Top-level rules

1. **Test user-visible behavior, not implementation.** Locators target what the user perceives (role, label, text), not CSS classes or DOM structure. Doc: https://playwright.dev/docs/best-practices
2. **Locators first, in priority order: role → label → text → testid.** Use `getByRole`, `getByLabel`, `getByText`, `getByTestId` (default `data-testid` attribute). The UI is single-language French, so French strings in `getByText` are fine — but prefer role/testid, which survive copy changes. See `references/locators.md`. Doc: https://playwright.dev/docs/locators
3. **Web-first assertions only.** Always `await expect(locator).toXxx()`. Never `expect(await locator.isVisible()).toBe(true)`. See `references/assertions.md`. Doc: https://playwright.dev/docs/test-assertions
4. **No manual waits.** No `waitForTimeout`, no arbitrary `setTimeout`. Playwright's actionability checks handle timing — see `references/anti-patterns.md`. Doc: https://playwright.dev/docs/actionability
5. **Tests are isolated.** Each test sets up its own state via `beforeEach` or fixtures. Predictions live in LocalStorage and each test gets a fresh `BrowserContext`; seed state with `page.addInitScript` when needed. No shared mutable state across tests in a file.
6. **Page Object Model when a feature grows.** Inline locators are fine for small specs; once locators/flows are reused across specs, extract a `<feature>.po.ts`. See `references/page-objects.md`. Doc: https://playwright.dev/docs/pom
7. **Fixtures via `mergeTests`.** Compose feature fixtures with `mergeTests(testA, testB, ...)` — never duplicate setup logic across spec files. See `references/fixtures.md`. Doc: https://playwright.dev/docs/test-fixtures
8. **Network mocking goes through `page.route`.** The app's only network dependency is `public/official-results.json` — mock it to exercise locking/comparison scenarios, and register the route **before** `page.goto`. See `references/network-mocking-builtin.md`. Keep mock payloads minimal: every property the feature reads, nothing more.
9. **Minimize `page.goto`. Bundle related checks in one test.** Navigation (plus dev-server compilation on first hit) dominates e2e run time. Prefer one test that walks a flow with multiple assertions — the app is tab-based, switch tabs instead of reloading. See `references/test-structure.md`.
10. **Debug with traces and codegen, not `console.log`.** See `references/debugging-tracing.md`. Doc: https://playwright.dev/docs/trace-viewer

## When to invoke this skill

Trigger when:

- Creating a new `.e2e.ts` spec, page object, or fixture under `e2e/`
- Modifying an existing Playwright test
- Adding network mocks to a Playwright test
- Reviewing a PR that touches `e2e/`
- A test is flaky, slow, or fails intermittently

Do **not** invoke when:

- Editing `playwright.config.ts` (configuration is out of scope; refer to https://playwright.dev/docs/test-configuration)
- Working on Vitest unit tests (use the `unit-test-author` skill)

## Workflow

1. Read the existing specs in `e2e/` for the feature you are touching. Match their style.
2. Apply the top-level rules above.
3. Open the relevant `references/*.md` for the topic at hand:

| Topic                                                  | Reference                               |
| ------------------------------------------------------ | --------------------------------------- |
| Choosing locators (role, label, testid)                | `references/locators.md`                |
| Writing assertions (`expect`, soft, polling)           | `references/assertions.md`              |
| Performing actions (click, fill, select, hover)        | `references/actions.md`                 |
| Structuring tests (`describe`, `test`, hooks, naming)  | `references/test-structure.md`          |
| Building fixtures (`test.extend`, `mergeTests`)        | `references/fixtures.md`                |
| Building page objects (POM)                            | `references/page-objects.md`            |
| Mocking via `page.route` (official results, offline)   | `references/network-mocking-builtin.md` |
| Test isolation, parallelism, serial mode               | `references/parallelism-isolation.md`   |
| Debugging, tracing, codegen, UI mode                   | `references/debugging-tracing.md`       |
| Anti-patterns to reject in review                      | `references/anti-patterns.md`           |

4. **Run the affected tests after every change** — `npm run e2e -- --grep "<describe-name>"` (the config starts/reuses the dev server automatically). Do not report the task as done until the tests are green.

## Quick checklist before opening a PR

- [ ] All locators use `getByRole` / `getByLabel` / `getByText` / `getByTestId` — no class chains, no `[data-testid="..."]` selectors
- [ ] All assertions are `await expect(locator).toXxx()` — no `isVisible()`/`innerText()` checks
- [ ] No `page.waitForTimeout`, no `setTimeout`, no `sleep`
- [ ] `page.route` mocks registered before `page.goto`; payloads contain only what the feature reads
- [ ] Fixtures composed with `mergeTests`, not duplicated `beforeEach`
- [ ] No unnecessary `page.goto` — drive the flow through the UI (tabs) instead of reloading
- [ ] No `console.log` left behind, no `test.only`, no `page.pause()`
- [ ] Test runs locally green at least once (`npm run e2e`); for flaky-suspect tests, run twice in a row
