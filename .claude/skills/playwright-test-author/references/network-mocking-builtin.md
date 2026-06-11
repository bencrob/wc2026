# Network mocking — Playwright built-in (`page.route`)

Doc: https://playwright.dev/docs/mock · https://playwright.dev/docs/network

The app is static with a single network dependency: `official-results.json`. `page.route` is the way to control it in e2e tests:

- **Mock official results** to exercise the locking behavior (`**/official-results.json` → canned payload).
- **Request-level inspection** (assert a request fired with specific params).
- **Abort** a request entirely (e.g. simulate offline for PWA scenarios).

## Patterns

### Fulfill — return a canned response

```ts
await page.route('**/analytics/track', route =>
    route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
    }),
);
```

### Abort — drop the request

```ts
await page.route('**/*.{png,jpg,jpeg}', route => route.abort()); // skip images
await page.route('**/google-analytics.com/**', route => route.abort());
```

### Continue — pass through (optionally modified)

```ts
await page.route('**/*', async route => {
    const headers = route.request().headers();
    delete headers['x-secret'];
    await route.continue({ headers });
});
```

### Modify response from real fetch

```ts
await page.route('**/api/v1/fruits', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ name: 'Loquat', id: 100 });
    await route.fulfill({ response, json });
});
```

## URL matching

- Glob: `*` (no `/`), `**` (any), `?`, `{a,b}`. Example: `**/api/v1/*`
- Regex: `await page.route(/.*\/track\?.*$/, ...)`
- Predicate: `await page.route(url => new URL(url).pathname.endsWith('/x'), ...)`

## Listening without intercepting

```ts
page.on('request', req => console.log(req.method(), req.url()));
page.on('response', res => console.log(res.status(), res.url()));

const responsePromise = page.waitForResponse('**/api/me');
await page.getByRole('button', { name: 'Refresh' }).click();
const me = await (await responsePromise).json();
```

## Order matters

`page.route` matches the **most recently registered** route first. Register specific routes after generic ones, or use `unroute` to remove a previous handler.

## Anti-patterns

- ❌ Forgetting `await route.fulfill(...)` — the request hangs
- ❌ Building request matchers from `request.postData()` without parsing — use `JSON.parse(request.postData() ?? '')` if you need to inspect a JSON body
- ❌ Long-running `page.route` handlers (`fetch` to slow third-parties) — they slow every matching request
