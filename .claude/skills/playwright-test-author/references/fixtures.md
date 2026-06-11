# Fixtures

Doc: https://playwright.dev/docs/test-fixtures

## What a fixture is

A fixture sets up something a test needs (page object, mock system, signed-in session) and tears it down after. Pattern:

```ts
fixtureName: async ({ deps }, use) => {
    const value = await setup(deps);
    await use(value); // hand it to the test
    await teardown(value);
};
```

Tests pull fixtures by name. Setup runs only when a test asks for the fixture.

## Defining a fixture (recommended pattern)

Each feature exports its own `test` extended with the feature's page object.

```ts
// e2e/groups.po.ts
import { test as base, Page } from '@playwright/test';

export class GroupsPage {
    constructor(private readonly page: Page) {}
    // ...methods
}

export interface GroupsFixtures {
    groupsPage: GroupsPage;
}

export const test = base.extend<GroupsFixtures>({
    groupsPage: async ({ page }, use) => {
        await use(new GroupsPage(page));
    },
});
```

## Composing fixtures: `mergeTests`

A spec usually needs several feature fixtures. Compose them with `mergeTests`.

```ts
// knockout.e2e.ts
import { mergeTests } from '@playwright/test';
import { test as groupsFixture } from './groups.po';
import { test as knockoutFixture } from './knockout.po';

const test = mergeTests(groupsFixture, knockoutFixture);

test('flow', async ({ groupsPage, knockoutPage }) => { ... });
```

`mergeTests` merges the type signatures so all named fixtures are available with full TypeScript inference.

## Fixture scopes

| Scope    | When created        | Use for                                      |
| -------- | ------------------- | -------------------------------------------- |
| `test`   | Each test (default) | Page objects, per-test state                 |
| `worker` | Once per worker     | Expensive resources (shared DB, auth tokens) |

```ts
account: [
    async ({ browser }, use) => {
        const ctx = await browser.newContext();
        // expensive: log in once per worker
        await use(account);
        await ctx.close();
    },
    { scope: 'worker' },
],
```

Worker-scoped fixtures must not contain mutable per-test state.

## Auto fixtures

Run for every test even if not pulled in. Use for cross-cutting concerns (logging, screenshot annotations) — rarely needed.

```ts
saveLogs: [async ({}, use) => { ... }, { auto: true }];
```

## Options fixtures

Parameterize at the project level (e.g. per browser project). Options use the same `extend` API; the second argument flags the fixture as an option with a default value.

```ts
export const test = base.extend<{ startTab: string } & GroupsFixtures>({
    startTab: ['Poules', { option: true }],
    groupsPage: async ({ startTab, page }, use) => {
        await use(new GroupsPage(page, startTab));
    },
});

// playwright.config.ts (per project)
use: {
    startTab: 'Tableau';
}
```

## Overriding a built-in fixture

You can override `page` itself (e.g. to pre-seed LocalStorage predictions before the app boots):

```ts
page: async ({ page }, use) => {
    await page.addInitScript(() => {
        localStorage.setItem('world-cup-2026-predictions', JSON.stringify({ M1: { home: 3, away: 0 } }));
    });
    await use(page);
};
```

When you override `page`, every downstream fixture using `page` gets the overridden one.

## Why fixtures over `beforeEach`

| Concern                   | `beforeEach`         | Fixture               |
| ------------------------- | -------------------- | --------------------- |
| Setup + teardown together | Split across hooks   | Co-located in one fn  |
| Reuse across files        | Copy-paste           | Import + `mergeTests` |
| Type inference for value  | Manual `let foo!: T` | Auto                  |
| Only runs when needed     | Always runs          | Lazy                  |

Reach for `beforeEach` only for in-file setup that doesn't produce a value (e.g. install a `page.route` mock for every test in a single spec).
