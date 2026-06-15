# Copilot instructions — wc2026

These rules apply to all code suggestions and generations for this project.

**Single source of truth:** the detailed guidelines live in [docs/guidelines/](../docs/guidelines/) and the
project conventions (commands, architecture, naming, git) in [CLAUDE.md](../CLAUDE.md). Read them for:

- Unit testing (Vitest, TestBed, test doubles, signal inputs): [docs/guidelines/01-unit-testing.guidelines.md](../docs/guidelines/01-unit-testing.guidelines.md)
- Refactoring patterns (interfaces, ports & adapters, tokenized DI): [docs/guidelines/02-refactoring.guidelines.md](../docs/guidelines/02-refactoring.guidelines.md)
- Reusable UI components: [docs/guidelines/03-reusable-ui.guidelines.md](../docs/guidelines/03-reusable-ui.guidelines.md)
- Performance (pure pipes): [docs/guidelines/04-performance.guidelines.md](../docs/guidelines/04-performance.guidelines.md)
- Signals: [docs/guidelines/05-signals.guidelines.md](../docs/guidelines/05-signals.guidelines.md)
- Project organization (hexagonal layers): [docs/guidelines/06-organization.guidelines.md](../docs/guidelines/06-organization.guidelines.md)

The essentials are summarized below.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Never use `as` type assertions (except in test files) or non-null assertions (`!`)

## Angular Best Practices

- Always use standalone components over NgModules
- Don't use explicit `standalone: true` (it is implied by default)
- Use signals for state management — the app is zoneless
- Use `@defer` for non-critical UI to keep the initial load light
- Use `NgOptimizedImage` for all static images

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Two sources of truth only (predictions + official results), held as signals in `TournamentStore`
- Use `computed()` for derived state — heavy logic stays in pure `domain/` engines
- Keep state transformations pure and predictable

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- External dependencies go through ports (`domain/ports/`) + `InjectionToken`s, never direct imports of adapters

## Code review focus (Copilot PR reviews)

When reviewing a pull request, prioritize these — they are the project's recurring risks:

1. **Match-locking regressions** — `MatchAccessPolicy` + `schedule.ts`: a match must become read-only once an official result exists **or** its kickoff is past. Check kickoff ISO times and **timezone offsets**, the day-start fallback for matches without an explicit kickoff, and that **every write path goes through `isEditable`** (store guard *and* UI `disabled`). A wrong/missing kickoff or a bypassed guard is a real production bug.
2. **Two sources of truth** — flag any *stored* derived state; everything except predictions + official results must be `computed()` from pure `domain/` engines.
3. **Domain purity** — no `@angular/*` or browser-API import in `domain/`; no `domain/ → infrastructure/` dependency.
4. **`effect()` misuse** — reserved for side effects (e.g. reactive persistence); flag any signal being *set* from inside an `effect()`.
5. **Template logic** — no method calls, ternaries or `&&`/`||` in templates; move it to a `computed()`.
6. **Accessibility & theming** — ARIA on interactive elements; theming via CSS variables (`--mat-sys-*`, `--wc-*`), never `ngClass`/`ngStyle`.

Keep review comments specific and actionable: cite the file/line and the rule it breaks. Commit messages follow Conventional Commits in **French**.
