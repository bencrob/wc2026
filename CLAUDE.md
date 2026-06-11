# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm start            # dev server — http://localhost:4200
npm run build        # production build — output: dist/wcng2026/browser
npm run watch        # development build in watch mode
npm test             # unit tests (Vitest)
npm run e2e          # end-to-end tests (Playwright)
npm run lint         # ESLint (angular-eslint, flat config)
```

- Node.js 22+, npm (no Yarn, no Nx).
- The service worker is only active in production builds. To test offline/PWA behavior, serve the build output (e.g. `npx http-server dist/wcng2026/browser`).

---

## Architecture

FIFA World Cup 2026 predictions app — static, offline-first (PWA), no backend.
**Hexagonal architecture**, dependencies point towards the domain:

```
src/app/
  domain/          # Pure TypeScript (zero Angular imports): models, data,
                   # engines (groups, knockout, third-place), policies, validation, ports
  application/     # TournamentStore (signals + computed) + DI tokens
  infrastructure/  # Adapters: LocalStorage persistence, remote official results, file I/O
  presentation/    # Angular Material UI (features/, ui/, theming/)
  testing/         # Shared test doubles (in-memory ports)
```

Key rules:

- `domain/` must stay free of Angular and browser APIs. Business logic lives in pure engines (`TournamentEngine`, `GroupStageEngine`, `KnockoutStageEngine`, comparators).
- `application/` exposes state through `TournamentStore`; ports are `InjectionToken`s (`PERSISTENCE`, `OFFICIAL_RESULTS`, `FILE_IO`) wired to concrete adapters in `app.config.ts`.
- Official results (`public/official-results.json`) are server data, take priority over predictions, and **lock** the affected matches (guard in the store + `disabled` in UI — defense in depth).

Full reference (French): [docs/Index.md](docs/Index.md) — business rules, technical rules, tests & quality, deployment.

### State management — signals store

- **Two sources of truth only** (user predictions + official results), held as private writable signals in `TournamentStore`.
- **Everything else is `computed()`** from pure domain engines — never store derived state.
- Expose state as `readonly` computed signals or `.asReadonly()`; mutations go through store methods that enforce access policies.
- `effect()` is reserved for side effects (e.g. reactive persistence) — avoid setting signals from effects.

### Testing setup

- Runner: Vitest (jsdom), specs co-located with sources (`.spec.ts`)
- E2E: Playwright (`e2e/*.e2e.ts`)
- Use `vi.fn()` / `vi.spyOn()` / the Jest-compatible `expect` API
- Use `test()` not `it()`; no "should create" boilerplate tests
- Unit tests assert business logic, not views (views → E2E)
- Substitute ports with the in-memory test doubles from `src/app/testing/`

---

# Guidelines

Detailed guidelines live in [docs/guidelines/](docs/guidelines/). The essentials:

## Angular 22 — Best Practices

- Always use **standalone components** (no `NgModules`, no explicit `standalone: true` — it's the default)
- `changeDetection: ChangeDetectionStrategy.OnPush` on every `@Component`
- The app is **zoneless** (`provideZonelessChangeDetection`) — rely on signals, never on zone-based change detection
- Use `inject()` instead of constructor injection
- Use `input()` / `output()` instead of `@Input` / `@Output` decorators
- Use **native control flow**: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@defer` for non-critical UI (e.g. secondary tabs) to keep the initial load light
- Logic in `.ts`, styles in `.scss`, template in `.html` — always in separate files
- No logic in templates (no ternaries, no `&&`/`||`, no method calls) — use `computed()` instead

### TypeScript

- Strict type checking enabled (`strict`, `noUncheckedIndexedAccess`)
- Prefer type inference when it's obvious
- Use `unknown` instead of `any` if the type is uncertain
- `const` > `let`, never `var`
- Never use `as` type assertions (except in test files) — use type guards (`instanceof`, `typeof`, type predicates) instead; `as const` is the only exception
- Never use non-null assertions (`!`) — use optional chaining or type guards

### Naming

- Files: `kebab-case`
- Component selectors: `wc` prefix
- Components: `PascalCase` + `Component` suffix (e.g. `GroupTableComponent`)
- Services/stores: `PascalCase` + `Service`/`Store` suffix (e.g. `TournamentStore`)
- Interfaces: `PascalCase` without `I` prefix (e.g. `Match`)
- Enums: `PascalCase` without `Enum` suffix
- Constants: `UPPER_SNAKE_CASE`

---

## CSS / Styles

- Create a separate stylesheet for a component only when it actually needs styles
- Use native bindings such as `[class.active]="isActive()"` and `[style.color]="textColor()"` instead of `ngClass`
- Theming goes through CSS variables: Material `--mat-sys-*` overrides + project variables (`--wc-*`); themes are applied as a `theme-<id>` class on `<body>`

---

## Signals

- All signals in classes must be `readonly`
- Use **generics** on `input()` to type without repetition:

    ```ts
    // AVOID
    public readonly myInput: InputSignal<string | undefined> = input<string>();

    // PREFER
    public readonly myInput = input<string>();
    public readonly myRequiredInput = input.required<number>();
    ```

- `computed()` for all derived state — keep the heavy lifting in pure domain engines and wrap the result in a `computed()`
- `effect()` is only for triggering side effects — avoid setting a signal from an effect if possible
- Test each `computed()` like any other function

---

## Folder Structure

```
src/app/
  domain/
    data/            # Frozen tournament data (schedule, teams, bracket links)
    engines/         # Pure computation (group stage, knockout, comparators)
    policies/        # Access rules (e.g. MatchAccessPolicy)
    ports/           # Interfaces for the outside world (persistence, official results, file I/O)
    validation/      # Validators + Result type
  application/       # TournamentStore + DI tokens
  infrastructure/    # One adapter per port
  presentation/
    features/        # One folder per feature (groups, knockout, thirds)
    ui/              # Reusable presentational components
    theming/         # Theme definitions and service
  testing/           # In-memory port implementations for tests
```

- New business logic goes in `domain/` first (pure, tested), then gets surfaced through the store and presentation layers.
- A new external dependency (storage, network, …) means a new **port** in `domain/ports/` + an adapter in `infrastructure/` — never import infrastructure from domain.

---

## Git Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
type(scope): description
```

- **type**: `build` | `chore` | `ci` | `docs` | `feat` | `fix` | `perf` | `refactor` | `revert` | `style` | `test`
- **scope**: short feature name, e.g. `groups`, `knockout`, `store`
- **description**: lower-case, no trailing period

### Examples

```
feat(knockout): propagate penalty winners to next round
fix(store): ignore score edits on officially locked matches
```

### Branch Naming

```
<type>/<kebab-description>
```

- **type**: same set as commit types. Bug → `fix` · feature → `feat` · restructure → `refactor` · dep/config/docs → `chore`.
- **kebab-description**: lowercase, hyphen-separated, short (~60 chars total). Strip filler words.

Examples:

```
feat/penalty-shootout-picker
fix/group-ranking-tiebreaker
chore/update-angular-22
```

Branch from fresh `origin/main`. Always guard against reusing a name that already exists locally or on the remote.

---

## Review Workflow

You are a senior software engineer performing a thorough code review to identify potential bugs.
During a code review, check for:

1. Logic errors and incorrect behaviors
2. Unhandled edge cases
3. Null/undefined references
4. Race conditions
5. Security vulnerabilities
6. Resource leaks
7. API contract violations
8. Cache issues (staleness, invalidation, incorrect keys)
9. Violations of project patterns and conventions

Make sure to:

1. If exploring the codebase, call multiple tools in parallel for increased efficiency. Do not spend too much time exploring.
2. If you find any pre-existing bugs in the code, you should also report those since it's important for us to maintain general code quality for the user.
3. Do NOT report issues that are speculative or low-confidence. All your conclusions should be based on a complete understanding of the codebase.
4. Remember that if you were given a specific git commit, it may not be checked out and local code states may be different.
