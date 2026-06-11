---
name: prepush-check
description: Use when you want to validate code quality before committing or pushing — runs Prettier, ESLint, unit tests, and the production build. Stops on first non-autofixable failure.
---

# prepush-check

Sequential gate: Prettier → ESLint → unit tests → build. Stop on first non-autofixable failure.

## Phase 1 — Autofix (sequential)

#### 1. Prettier

Format only the files changed vs `origin/main`:

```bash
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)
[ -z "$CHANGED_FILES" ] || printf '%s\n' "$CHANGED_FILES" | tr '\n' '\0' | xargs -0 npx prettier --write --ignore-unknown --
```

#### 2. ESLint

```bash
npm run lint -- --fix
```

Stop and report if non-fixable issues remain.

## Phase 2 — Verify (sequential)

#### 3. Unit tests

```bash
npm test
```

Never auto-fix test failures — report with `file:line` refs.

#### 4. Build

```bash
npm run build
```

Catches template/type errors that lint and unit tests miss. Report failures with file refs.

#### 5. E2E (optional)

Only when presentation-layer behavior changed:

```bash
npm run e2e
```

## Outcome

- **All steps pass** → report "✓ prepush checks passed" and exit cleanly.
- **Any step fails** → stop immediately, report the failure with file refs, and exit. Do not continue to the next step.

## Failure handling

| Phase | Step               | Action                              |
| ----- | ------------------ | ----------------------------------- |
| 1     | ESLint non-fixable | Stop. Report. Don't start Phase 2.  |
| 2     | Test failure       | Report `file:line`. Never auto-fix. |
| 2     | Build failure      | Report with file refs.              |
