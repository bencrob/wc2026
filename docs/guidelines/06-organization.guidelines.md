# Project organization

## Hexagonal layers

The codebase is organized by **layer**, with dependencies always pointing towards the domain:

```
src/app/
  domain/            # Pure TypeScript — zero Angular imports
    data/            # Frozen tournament data (schedule, teams, bracket links)
    engines/         # Pure computation (group stage, knockout, comparators)
    policies/        # Access rules (e.g. MatchAccessPolicy)
    ports/           # Interfaces for the outside world (persistence, official results, file I/O)
    validation/      # Validators + Result type
  application/       # TournamentStore (signals + computed) + DI tokens
  infrastructure/    # One adapter per port (LocalStorage, remote results, file I/O)
  presentation/
    features/        # Smart components — one folder per feature (groups, knockout, thirds)
    ui/              # Dumb, reusable presentational components
    theming/         # Theme definitions and service
  testing/           # In-memory port implementations shared by specs
```

### Placement rules

- **New business logic** goes in `domain/` first (pure, tested without TestBed), then gets surfaced through the store and presentation layers.
- **New external dependency** (storage, network, …) = a new **port** in `domain/ports/` + an adapter in `infrastructure/` + a token in `application/tokens.ts`. Never import `infrastructure/` from `domain/` or `application/`.
- **New component**: if it injects the store → `presentation/features/`; if it only has inputs/outputs → `presentation/ui/`.
- Spec files are co-located with the code they test (`.spec.ts` next to the `.ts`); e2e specs live in `e2e/` at the repo root.

## Exports

Prefer **named exports** over default exports. This makes renames safe, improves tree-shaking, and makes it easy to see what a file provides.

```typescript
/* AVOID */
export default class TournamentEngine { ... }

/* PREFER */
export class TournamentEngine { ... }
```

When a folder exposes a barrel (`models.ts`, `index.ts`), only re-export what is used **outside** the folder — internal implementation details stay private.
