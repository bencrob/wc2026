# Refactoring: Improving the Design of Existing Code

This document gives a list of principles to apply when refactoring a module.

> If you are ever curious about refactoring good practices in general, go read this book ASAP! - [Refactoring: Improving the Design of Existing Code](https://www.amazon.fr/Refactoring-Improving-Design-Existing-Code/dp/0134757599), by Martin Fowler and Kent Beck

## Table of Content

1. [Modular Architecture](#1-modular-architecture)
2. [Migrate `class`es to `interface`s](#2-migrate-classes-to-interfaces)
3. [Prefer union types and `as const` to `enum`s](#3-prefer-union-types-and-as-const-to-enums)
4. [Clean Services](#4-clean-services)
5. [Clean Code](#5-clean-code)
6. [The Smart/Dumb Components Pattern](#6-the-smartdumb-components-pattern)
7. [The Ports & Adapters Pattern](#7-the-ports--adapters-pattern)
8. [Shared Test Doubles](#8-shared-test-doubles)
9. [The Tokenized Dependency Injection](#9-the-tokenized-dependency-injection)

## 1. Modular Architecture

> Modular Architecture is exactly what you think it is — a way to manage the complexity of a problem by breaking it down
> to smaller manageable modules. The difference is, as a software architecture style, it has some guidelines, principles
> and patterns.

If we design our codebase so that it is smartly reusable, then we will save us a lot of troubles and time when it comes
to improving it. In this repo, modularity follows the hexagonal layering (`domain/`, `application/`, `infrastructure/`,
`presentation/`): each layer is standalone, and dependencies always point towards the domain.

In essence, the point is to always think modular: try as much as possible to have **standalone** and **reusable**
modules.

#### Documentation

- [Modular Architecture](https://medium.com/on-software-architecture/on-modular-architectures-53ec61f88ff4)

## 2. Migrate `class`es to `interface`s

Unlike classes, interfaces are virtual structures that only exist within the context of TypeScript.
The TypeScript compiler uses interfaces for type-checking purposes.
Once the code is transpiled to JavaScript, it will be stripped from its interfaces resulting in smaller bundles.

Reserve classes for things with behavior (engines, policies, services); model plain data with interfaces.

**AVOID**

```typescript
export class MatchResultModel {
    public id: string;
    public home: number;
    public away: number;

    public static fromDto(dto: MatchResultDto): MatchResultModel {
        const model: MatchResultModel = new MatchResultModel();
        model.id = dto.matchId;
        model.home = dto.homeScore;
        model.away = dto.awayScore;

        return model;
    }
}
```

**PREFER**

```typescript
export interface MatchResult {
    id: string;
    home: number;
    away: number;
}
```

## 3. Prefer union types and `as const` to `enum`s

Standard `enum`s generate extra runtime code, and `const enum`s are incompatible with `isolatedModules`
(the default in modern Angular builds). Prefer string literal unions, or an `as const` object when you
need to iterate over the values.

**AVOID**

```typescript
export enum Side {
    Home = 'home',
    Away = 'away',
}
```

**PREFER**

```typescript
export type Side = 'home' | 'away';

// or, when the values need to exist at runtime:
export const SIDES = ['home', 'away'] as const;
export type Side = (typeof SIDES)[number];
```

## 4. Clean Services

- Single Responsibility Principle: one service (or engine) = one job
- `private readonly` everywhere — dependencies and internal collaborators are never reassigned
- Keep computation pure and side-effect free where possible (this is what makes `domain/` engines trivially testable)

## 5. Clean Code

- `ReadonlyArray` / immutability / `readonly` by default
- Follow the naming conventions from [CLAUDE.md](../../CLAUDE.md) (kebab-case files, no `I` interface prefix, `UPPER_SNAKE_CASE` constants)
- Prefer small, intention-revealing functions over comments

## 6. The Smart/Dumb Components Pattern

- **Smart** (container) components live in `presentation/features/`: they inject the store, wire data and callbacks.
- **Dumb** (presentational) components live in `presentation/ui/`: inputs in, outputs out, zero injection of app state.

Dumb components are reusable and trivial to test; keep as much UI as possible dumb.

## 7. The Ports & Adapters Pattern

As a good practice, business logic should not care where data comes from, nor how to get it (Single Responsibility Principle).

In this repo, data access goes through **ports** (interfaces in `domain/ports/`) implemented by **adapters**
(`infrastructure/`). The store depends on the port's `InjectionToken`, never on a concrete adapter.

This pattern keeps the codebase decoupled, flexible and reusable. It also eases the tests, enabling
[**Shared Test Doubles**](#8-shared-test-doubles).

**AVOID**

```typescript
@Injectable({ providedIn: 'root' })
export class TournamentStore {
    // store talks to LocalStorage directly — untestable without a browser
    private readonly predictions = signal<ScoreMap>(
        JSON.parse(localStorage.getItem('predictions') ?? '{}'),
    );
}
```

**PREFER**

```typescript
// domain/ports/persistence.port.ts
export interface PersistencePort {
    loadPredictions(): ScoreMap;
    savePredictions(predictions: ScoreMap): void;
}
```

```typescript
@Injectable({ providedIn: 'root' })
export class TournamentStore {
    private readonly persistence = inject(PERSISTENCE);
    private readonly predictions = signal<ScoreMap>(this.persistence.loadPredictions());
}
```

## 8. Shared Test Doubles

Rather than re-declaring providers in every spec, share the in-memory implementations of the ports
(see `src/app/testing/`) and provide them once per spec:

```typescript
TestBed.configureTestingModule({
    providers: [
        { provide: PERSISTENCE, useClass: InMemoryPersistence },
        { provide: OFFICIAL_RESULTS, useValue: new StaticOfficialResultsProvider({}) },
    ],
});
```

When several specs need the same provider set, extract a `provideTestingPorts()` helper function returning the
providers array — the standalone equivalent of the old "testing module" pattern.

## 9. The Tokenized Dependency Injection

One might think of _The Tokenized Dependency Injection_ as overrated, and that is utterly normal. But, you have to
stop for a minute and think about it.

Co-locate the token with the interface it represents:

`> domain/ports/official-results.port.ts`

```typescript
export interface OfficialResultsPort {
    fetch(): Promise<ScoreMap>;
}
```

`> application/tokens.ts`

```typescript
export const OFFICIAL_RESULTS = new InjectionToken<OfficialResultsPort>('OfficialResultsPort');
```

**USE**

`> app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
    providers: [{ provide: OFFICIAL_RESULTS, useClass: RemoteOfficialResultsProvider }],
};
```

`> application/tournament.store.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class TournamentStore {
    private readonly officialSrc = inject(OFFICIAL_RESULTS);
}
```

#### Why should we stick with it?

The **Injection Token Pattern** is a key feature to improve the modularity of the codebase
(see [1. Modular Architecture](#1-modular-architecture)).

It decouples consumers from implementations and makes them really **standalone** by not
binding them to any specific dependency. This dependency abstraction eases:

- the hexagonal layering (`domain/` never imports `infrastructure/`)
- the tests, by allowing [Shared Test Doubles](#8-shared-test-doubles)
- swapping implementations (e.g. a different persistence backend) without touching consumers

#### Documentation

- [Injection Tokens in Angular](https://www.inversionofcontrol.co.uk/injection-tokens-in-angular/)
- [Power of Angular Dependency Injection](https://medium.com/coding-blocks/power-of-angular-dependency-injection-b981faa9c0de)
