# Signals guidelines

- [Signals guidelines](#signals-guidelines)
    - [General](#general)
        - [Rule 01 - Mark signals as `readonly`](#rule-01---mark-signals-as-readonly)
    - [Inputs](#inputs)
        - [Rule 01 - Every component inputs should be the same type](#rule-01---every-component-inputs-should-be-the-same-type)
        - [Rule 02 - Use signal input generics to define types](#rule-02---use-signal-input-generics-to-define-types)
    - [Computed](#computed)
        - [Rule 01 - Test every computed](#rule-01---test-every-computed)
        - [Rule 02 - Keep computed logic in pure functions](#rule-02---keep-computed-logic-in-pure-functions)
    - [Effects](#effects)
        - [Rule 01 - Signal effects are banned](#rule-01---signal-effects-are-banned)

<hr>

## General

### Rule 01 - Mark signals as `readonly`

**Every** signals in classes should be marked as readonly. (`signal()`, `input()`, `computed()`, `model()`, ...)

## Inputs

### Rule 01 - Every component inputs should be the same type

When you add signal inputs to a component, refactor every other `@Input` to use `input()` instead.

We want to make sure the refactoring is done once and for all.

### Rule 02 - Use signal input generics to define types

Signal inputs use generics to provide type-safe inputs. There is no need to specify the type twice. <br>
Generics should always be used when a default value is not set. <br>
Generics are not mandatory when a default value is set.

**Avoid:**

```typescript
/* AVOID */

@Component()
class MyComponent {
    public readonly myInput: InputSignal<string | undefined> = input<string>();
    public readonly otherInput: InputSignal<string | undefined> = input();
    public readonly inputWithDefaultValue: InputSignal<string> = input('default');
    public readonly requiredInput: InputSignal<number> = input.required();
    public readonly requiredBoolInput: InputSignal<boolean> = input.required<boolean>();
}
```

**Prefer:**

```typescript
/* PREFER */

@Component()
class MyComponent {
    public readonly myInput = input<string>();
    public readonly otherInput = input<string>();
    public readonly inputWithDefaultValue = input('default');
    public readonly myRequiredInput = input.required<number>();
    public readonly requiredBoolInput = input.required<boolean>();
}
```

<hr>

## Computed

### Rule 01 - Test every computed

Like any other function, we need to test the computed behavior.

### Rule 02 - Keep computed logic in pure functions

As much logic as possible should live in pure functions (the `domain/` engines), with the `computed()` being a thin
wrapper that calls them — see `TournamentStore.runtime`.

There are a few notable advantages:

- Logic can be easily reused across features and components
- Pure functions are easier to test (no TestBed, no reactivity)

<hr>

## Effects

### Rule 01 - Use signal effects wisely

To keep the code reactive, only use effects to trigger side effects.
For example, setting another signal's value from an effect should be done only if there is no other way to do it reactively.
