---
name: unit-test-author
description: Use when writing, modifying, or reviewing unit tests (.spec.ts files) in this repository — covers TestBed setup, test doubles, signal inputs, async patterns, and naming conventions.
---

# Unit Test Author

## Principles

- **Simplicity first** — don't overengineer tests; a flat, readable test is better than an abstracted one
- **Follow existing patterns** — before writing tests for a file, check co-located `.spec.ts` files in the same folder for established conventions and copy the style
- **`test.each`** — use parameterized tests whenever the same logic is exercised with multiple inputs; prefer it over duplicated `test()` blocks
- prefer `test.each` with backticks and interpolation for readability over array syntax
- **Be on the lookout for anti-patterns**

## General

- Spec file: same folder as the tested file, `.spec.ts` suffix
- One global `describe()` with the name of the tested class/component
- One `describe()` per public method
- Test **every class**, every public method, every branch (KPI = Branch coverage)
- No view testing (that's E2E's role — see `e2e/*.e2e.ts`)
- No `console.log` or shared state between tests
- Domain code (`src/app/domain/`) is pure TypeScript: test it **without TestBed** — plain instantiation, no Angular
- Substitute ports with the in-memory doubles from `src/app/testing/` instead of hand-rolled mocks when one exists

## TestBed

- `TestBed.configureTestingModule()` in `beforeEach()` — never outside
- No `compileComponents()`
- To isolate a component from its children, add a schema **in the component's own metadata** via `TestBed.overrideComponent(Cmp, { set: { imports: [...], schemas: [NO_ERRORS_SCHEMA] } })`. For a **standalone** component, a schema in `configureTestingModule` only covers the host fixture, **not** the component's own template — putting it there leaks NG0303/NG0304.
- Prefer **`NO_ERRORS_SCHEMA`** over `CUSTOM_ELEMENTS_SCHEMA` when you strip a component's `imports` in a shallow test: `CUSTOM_ELEMENTS_SCHEMA` only silences unknown _elements_ (NG0304), not unknown _property bindings_ on native elements (NG0303)
- No DOM access (`debugElement`) in unit tests

## Test doubles

- Name according to the implementation + type suffix: `persistenceMock`, `fetchSpy`, `scoreMapStub`
- **Vitest**: use `vi.fn()` for mock methods, `vi.spyOn()` for spies, and the Jest-compatible `expect` API
- Instantiate spies in `beforeEach()` — avoid relying on `vi.clearAllMocks()` instead of fresh mocks per test
- **Avoid force casts** — prefer partial mocks (`{ id: 1 } as MyType`) over `as unknown as Type`; allow `as unknown as T` only for DOM/external types where constructing a full object is impractical

## Signal inputs

Use `inputBinding` via `TestBed.createComponent` bindings — **never `fixture.componentRef.setInput()`**:

```ts
let matchSignal: WritableSignal<Match>;

beforeEach(() => {
    matchSignal = signal<Match>(matchMock);
    // standalone component: put the isolation schema in its own metadata, not configureTestingModule
    TestBed.overrideComponent(MyComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(MyComponent, { bindings: [inputBinding('match', matchSignal)] });
    component = fixture.componentInstance;
});
```

## linkedSignal

- Read the signal once before testing its reactive behavior (to initialize the `previousValue` memory)

## Async

- Never use `fakeAsync()` + `tick()`
- Use `fixture.detectChanges()` to trigger change detection and lifecycle hooks
- Use `await fixture.whenStable()` after async operations to wait for pending tasks to settle — these do different things and are often used together, not as alternatives

## Keep test logs clean

CI test logs should contain **only** vitest progress. Anything else (Angular `NGxxxx` warnings, `console.warn`, jsdom "Not implemented", stack traces) is noise — avoid producing it:

- **Schemas (NG0303 / NG0304)** — see TestBed section: use `NO_ERRORS_SCHEMA` in the `overrideComponent` `set` block when shallow-rendering, not `CUSTOM_ELEMENTS_SCHEMA` in `configureTestingModule`.
- **Mock pipes (NG0313 "multiple pipes match")** — replace a component's pipes with `overrideComponent(Cmp, { set: { imports: mockPipes(...) } })`. Use **`set:`**, never **`add:`** — `add` keeps the real pipe alongside the mock, so two pipes match the same name.
- **`@for` track (NG0955 "duplicated keys")** — never `track` by a value that can repeat (a string character, a non-unique field); use `track $index` for positional lists. Give mock collections **unique ids**, and never build them with `Array(n).fill({ id: 'x' })` (same key repeated) — use `Array.from({ length: n }, (_, i) => ({ id: \`x-${i}\` }))`.
- **Swallowed assertions** — never put `expect(...)` **inside** an `output`/Observable `subscribe` callback: if it throws, rxjs swallows it and the test passes without validating (the error only shows as a stderr `AssertionError`). Capture the emitted value in a variable and assert **after**, in the test body.
- **Reactive-form `disabled`** — never bind `[disabled]` on an element that also has `[formControl]`/`formControlName` (warns and can cause "changed after checked"). Drive the disabled state from the `FormControl` (`control.disable()` / `control.enable()`), e.g. in an `effect`.
- **`vi.mock` / `vi.hoisted`** — keep at the **module top level**, not nested inside `describe()` (vitest warns; will become an error).
- **jsdom "Not implemented"** — stub the missing browser APIs. For media: `HTMLMediaElement.prototype.{play,pause,load}`; for canvas: `HTMLCanvasElement.prototype.getContext` (return `null`).
- **jsdom "navigation to another Document"** — clicking an `<a href="https://...">` makes jsdom attempt a real navigation. In tests use a same-document `#fragment` href, or `preventDefault()` the click.
