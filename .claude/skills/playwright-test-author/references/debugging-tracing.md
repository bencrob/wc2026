# Debugging & tracing

Doc: https://playwright.dev/docs/debug · https://playwright.dev/docs/trace-viewer · https://playwright.dev/docs/codegen · https://playwright.dev/docs/test-ui-mode

## First reflex: trace viewer

When a test fails (locally or on CI), open the trace before re-running anything.

```bash
# Force a trace for a local run
npm run e2e -- --trace on

# Open it
npx playwright show-trace test-results/<...>/trace.zip
```

Or upload `trace.zip` to https://trace.playwright.dev (runs entirely in your browser, no upload to a server).

The trace gives you, for each step:

- DOM snapshot before and after
- Screenshot
- Console + network logs
- Action-level timings
- Source location

This is almost always faster than `console.log` debugging.

## UI mode — the daily driver

```bash
npm run e2e -- --ui
```

Watches your tests, lets you re-run a single test, time-travel through actions, and pick locators against the live DOM. Use this instead of `--debug` for everyday development.

## `--debug` flag

```bash
npm run e2e -- --debug
```

Opens Playwright Inspector with headed browser, zero timeouts, and step-through. Useful when UI mode is too high-level (e.g. you need to step through inside a hook).

## `page.pause()`

Drop a breakpoint in code:

```ts
test('debug me', async ({ page }) => {
    await page.goto('/');
    await page.pause(); // run halts; Inspector opens
    await page.getByRole('button').click();
});
```

Remove before committing — leaving `page.pause()` in CI hangs the suite.

## Codegen — generating locators / starter tests

```bash
npx playwright codegen <url>
```

Two windows: a real browser and the Inspector. Click around → it emits code. Click "Pick Locator" → hover an element → it gives you the resilient locator.

For this repo, **never check in raw codegen output**. Use it as a starting point, then:

1. Move locators into a POM (when the feature has one)
2. Replace generic locators with role/label/data-testid
3. Replace ad-hoc waits with assertions
4. Mock `official-results.json` with `page.route` when the scenario needs official results

## Run a single test

```bash
npm run e2e -- e2e/groups.e2e.ts:12
npm run e2e -- --grep "classement"
```

## Headed + slow-mo for visual sanity

```bash
npm run e2e -- --headed --workers=1 --project=chromium
```

`slowMo` is set in config (out of scope here), but `--headed` alone is usually enough.

## `console.log` from the test vs. from the page

```ts
console.log('test side');
page.on('console', msg => console.log('page:', msg.text()));
```

If your component logs in the browser, surface those logs in the test output via the listener — easier than opening DevTools.

## Verbose Playwright internals

```bash
DEBUG=pw:api npm run e2e            # what Playwright is doing under the hood
PWDEBUG=console npm run e2e         # exposes window.playwright in DevTools
```

Use sparingly — verbose, but invaluable when actionability checks seem wrong.

## Anti-patterns

- ❌ Adding `page.waitForTimeout(N)` "to debug" — never commit it
- ❌ Leaving `test.only`, `page.pause()`, or `console.log` in committed code
- ❌ Running with `--workers=1` "to debug" and forgetting — keeps CI slow
- ❌ Looking at screenshots without the trace — the trace already includes them with context
