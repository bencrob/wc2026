# Reusable UI Components

The `src/app/presentation/ui/` folder hosts the reusable, presentational building blocks of the app —
components that implement common interaction patterns whilst being as _unopinionated_ as possible about
their whole usage context. Think of it as a small, well-tested kit upon which the feature components
(`presentation/features/`) are built.

The following guidelines apply to every component that lives there.

---

#### Guideline #01: Immutability

Each reusable component **_must_** use the immutability principle.
This enforces us, the developers, to be aware of the whole component's state and lifecycle.

It also helps in reducing the amount of bugs as nothing will be able to change the state just
like a middleware would, saving us <small>(a lot of)</small> debugging time.

---

#### Guideline #02: OnPush Strategy

Same ol', same ol': each component **_must_** implement
[Angular's OnPush strategy](https://angular.dev/api/core/ChangeDetectionStrategy). The app is zoneless —
state flows exclusively through signal inputs and computed values.

---

#### Guideline #03: Tool Agnostic

As a good practice, we want to isolate reusable components from any external tool.

This decoupling allows us to be free to change, remove, or update any tool
we see fit, anytime, with little to no impact on the components.

---

#### Guideline #04: Feature Agnostic

Components hosted in `ui/` should be reusable by all features and therefore must remain
as **_[unopinionated](https://en.wiktionary.org/wiki/unopinionated)_** as possible:

- No injection of `TournamentStore` or any application state — data comes in through `input()`, events go out through `output()`.
- No knowledge of which tab or feature renders them.
- Styling through CSS variables (`--mat-sys-*`, `--wc-*`) so themes apply without component changes.

If a component needs the store, it belongs in `presentation/features/`, not in `ui/`.

---

#### Guideline #05: Single Responsibility Pattern (SRP)

Without further ado: [Wikipedia](https://en.wikipedia.org/wiki/Single_responsibility_principle).

---

#### Guideline #06: Keep It Simple Stupid (KISS, Dumb Pattern)

Without further ado: [Wikipedia](https://en.wikipedia.org/wiki/KISS_principle).

---

#### Guideline #07: Tests

Every component **_must_** be well-tested before it reaches the main branch.

Let's highlight the main reasons for writing tests:

- Unit Tests help you understand the design of the code you are working on and to think about all the possibilities;
- Unit Tests can help document and define what something is supposed to do;
- If you change something in the code and the tests still pass you can be sure you have not broken anything.

For low-level UI components, the behaviour _is_ the DOM interaction — see the exception in
[01-unit-testing.guidelines.md](01-unit-testing.guidelines.md) (Rule 03-03) for how to test them
through their public API.

---

#### Guideline #08: Follow the right component modification flow

- **Should you create a new component or update/upgrade an existing one?**
  As a general case, you should always check if you can update a component first.
  Then, only if you find yourself in one of the following example cases, should you create a new component:
    - Existing component is too complex;
    - Existing component is at risk with the new feature;
    - Existing component is completely agnostic, requested feature is feature-specific (then the new component belongs in `features/`, not `ui/`).
- **Update and delete existing components with caution** — check every usage before changing a shared component's API.
