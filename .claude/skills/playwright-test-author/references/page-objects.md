# Page Objects (POM)

Doc: https://playwright.dev/docs/pom

## Repo convention

Today the e2e suite is small (`e2e/*.e2e.ts` with inline locators). Introduce a POM when a feature's locators/flows are reused across specs:

```
e2e/<feature>.po.ts    # POM class + fixture export
e2e/<feature>.e2e.ts   # tests
```

Static mock payloads (e.g. canned `official-results.json` bodies) can live in a `<feature>.mocks.ts` next to them.

## POM class shape

- One class per page or page region (e.g. `GroupsPage`, `KnockoutPage`)
- Locators declared as `readonly` properties
- Methods describe **user intent**, not low-level steps
- Constructor receives `Page` (plus any cross-cutting fixtures)

```ts
import { expect, type Locator, type Page } from '@playwright/test';

export class GroupsPage {
    public readonly progress: Locator = this.page.getByText(/matchs renseignés/);
    private readonly scoreInputs = this.page.locator('input.score-input');

    constructor(private readonly page: Page) {}

    public async open(): Promise<void> {
        await this.page.goto('/');
        await expect(this.page.getByRole('tab', { name: 'Poules' })).toBeVisible();
    }

    public async enterScore(matchIndex: number, home: number, away: number): Promise<void> {
        await this.scoreInputs.nth(matchIndex * 2).fill(String(home));
        await this.scoreInputs.nth(matchIndex * 2 + 1).fill(String(away));
    }
}
```

## Method naming

Name methods after **what the user is doing**, not the framework call:

- ✅ `open()`, `enterScore(1, 3, 0)`, `pickPenaltyWinner('home')`
- ❌ `clickButton()`, `fillInput()`, `waitForSelector()`

Cohesive, intent-revealing methods make specs read like a flow.

## Public vs. private

- `public` — methods called from a spec (`login()`, `validateDigest()`)
- `private` — internal helpers (raw selectors, low-level chains)
- `readonly` properties for locators that the spec asserts on (e.g. `loginPageElement`)

## Composing sub-POMs

For complex pages with sub-flows, compose POMs:

```ts
export class KnockoutPage {
    private readonly penaltyPicker = new PenaltyPicker(this.page);
    private readonly bracketColumn = new BracketColumn(this.page);
    // ...
}
```

## Fixture export

Always export a `test` from the same file (so consumers can `mergeTests`):

```ts
export interface GroupsFixtures {
    groupsPage: GroupsPage;
}

export const test = base.extend<GroupsFixtures>({
    groupsPage: async ({ page }, use) => {
        await use(new GroupsPage(page));
    },
});
```

See `references/fixtures.md` for `mergeTests` and option fixtures.

## `<feature>.mocks.ts`

Holds the static payloads and small helpers used by the POM. Keeps spec + POM uncluttered.

```ts
// official-results.mocks.ts
export const groupAComplete = {
    version: 1,
    results: {
        M1: { home: 1, away: 1 },
        // ...
    },
};
```

The POM (or a `beforeEach`) registers them via `page.route('**/official-results.json', ...)`. See `references/network-mocking-builtin.md`.

## Anti-patterns

- ❌ Locator declared inline inside a spec — lift to the POM
- ❌ Page object exposing `Locator` properties for every element — only expose what specs assert on; keep the rest private
- ❌ Methods named after the action (`clickLogin`) instead of intent (`login`)
- ❌ Asserting inside the POM AND inside the spec for the same fact — pick one place; usually the spec asserts the visible outcome and the POM ensures intermediate state
- ❌ Page objects that own `expect.toBeVisible` waits but no clear "open" / "ready" boundary — every POM should have a clear entry method that asserts the page is ready
