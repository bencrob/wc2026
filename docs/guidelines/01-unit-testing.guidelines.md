# Unit Testing Guidelines

This guide describes the project's **Unit Testing Guidelines**.
These apply to any Unit Test (abbv. UT) in the application.

**Test runner:** unit tests use [Vitest](https://vitest.dev/) (jsdom). Prefer `vi.fn()`, `vi.spyOn()`, and the Jest-compatible `expect` API.

## Table of Content

- [Unit Testing Guidelines](#unit-testing-guidelines)
    - [Table of Content](#table-of-content)
    - [Testing Principles](#testing-principles)
        - [Unit Testing](#unit-testing)
        - [What is the scope of a Unit Test?](#what-is-the-scope-of-a-unit-test)
    - [How-to read these guidelines?](#how-to-read-these-guidelines)
        - [Understanding the legend](#understanding-the-legend)
    - [01 - General](#01---general)
        - [Rule 01-01 Specification file: naming and location](#rule-01-01-specification-file-naming-and-location)
        - [Rule 01-02 Global `describe()` callback](#rule-01-02-global-describe-callback)
        - [Rule 01-03 One `describe()` callback per public method](#rule-01-03-one-describe-callback-per-public-method)
        - [Rule 01-04 Test each and every `class`](#rule-01-04-test-each-and-every-class)
        - [Rule 01-05 All public methods must be tested](#rule-01-05-all-public-methods-must-be-tested)
        - [Rule 01-06 Test every possible scenario](#rule-01-06-test-every-possible-scenario)
        - [Rule 01-07 Asynchronous code should be as well tested as synchronous code](#rule-01-07-asynchronous-code-should-be-as-well-tested-as-synchronous-code)
        - [Rule 01-08 Cleanup tests](#rule-01-08-cleanup-tests)
        - [Rule 01-09 Angular's Testing Modules](#rule-01-09-angulars-testing-modules)
        - [Rule 01-10 TestBed restrictions](#rule-01-10-testbed-restrictions)
        - [Rule 01-11 Isolated tests](#rule-01-11-isolated-tests)
        - [Rule 01-12 Useful tests only](#rule-01-12-useful-tests-only)
    - [02 - Test doubles](#02---test-doubles)
        - [Rule 02-01 Explicit naming of a test double](#rule-02-01-explicit-naming-of-a-test-double)
        - [Rule 02-02 Vitest spy registration](#rule-02-02-vitest-spy-registration)
        - [Rule 02-03 Keep it sync!](#rule-02-03-keep-it-sync)
    - [03 - Components](#03---components)
        - [Rule 03-01 Configure `TestBed` in the `beforeEach()` lifecycle hook](#rule-03-01-configure-testbed-in-the-beforeeach-lifecycle-hook)
        - [Rule 03-02 Avoid `compileComponents()`](#rule-03-02-avoid-compilecomponents)
        - [Rule 03-03 Don't link the view to the test](#rule-03-03-dont-link-the-view-to-the-test)
        - [Rule 03-04 Configure the testing module as a real module](#rule-03-04-configure-the-testing-module-as-a-real-module)
        - [Rule 03-05 Configure the target under test through its public interface](#rule-03-05-configure-the-target-under-test-through-its-public-interface)
        - [Rule 03-06 Avoid fake `Component` acting as a test host](#rule-03-06-avoid-fake-component-acting-as-a-test-host)
        - [Rule 03-07 Abstract `Component`s](#rule-03-07-abstract-components)
        - [Rule 03-08 Restrict specification file to `Component`'s scope](#rule-03-08-restrict-specification-file-to-components-scope)
    - [Resources](#resources)
        - [Rule 01-07](#rule-01-07)
        - [Test doubles](#test-doubles)
        - [Rule 03-02](#rule-03-02)
        - [Rule 03-09](#rule-03-09)

<hr>

## Testing Principles

When testing an application, it is best to keep in mind that testing can show if defects are present in a system.
However, it is impossible to prove that any non-trivial system is completely free of defects.
For this reason, the goal of testing is not to verify that the code is correct but to find problems within the code.
This is a subtle but important distinction.

If we set out to prove that the code is correct, we are more likely to not find any problem.
If we set out to find problems, we are more likely to more fully exercise the code and find the bugs that are lurking there.

It is also best to begin testing an application from the very start.
This allows defects to be found early in the process when they are easier to fix.
This also allows code to be refactored with confidence as new features are added to the system.

### Unit Testing

UTs exercise a single unit of code (component, page, service, pipe, ...) in isolation from the rest of the system.
Isolation is achieved through the injection of mock objects in place of the code's dependencies.
The mock objects allow the test to have fine-grained control of the outputs of the dependencies.
The mocks also allow the test to determine which dependencies have been called and what has been passed to them.

Well-written UTs are structured such that the unit of code and the features it contains are described via `describe()` callbacks.
The requirements for the unit of code and its features are tested via `it()` callbacks.
When the descriptions for the `describe()` and `it()` callbacks are read, they make sense as a phrase.
When the descriptions for nested `describe()`s and a final `it()` are concatenated together, they form a sentence that
fully describes the test case.

Since UTs exercise the code in isolation, they are fast, robust, and allow for a high degree of code coverage.

_The KPI for proper UTs and quality is **Branches coverage**._

##### Example

```typescript
// calculation.service.spec.ts

describe('Calculation', () => {
    describe('divide', () => {
        it('calculates 4 / 2 properly', () => {});
        it('cowardly refuses to divide by zero', () => {});
        // ...
    });

    describe('multiply', () => {
        // ...
    });
});
```

The outer `describe()` call states that the _Calculation_ service is being tested, the inner `describe()`
calls state exactly what functionality is being tested, and the `it()` calls state what the test cases are.
When run the full label for each test case is a sentence that makes sense: _Calculation divide cowardly refuses to divide by zero_.

### What is the scope of a Unit Test?

Even though the name is explicit, it is important that developers share the same definition of a UT.
A UT is a test whose sole purpose is to validate **one and only one (piece of) feature**.

It **should** be:

- small
- fast
- efficient
- explicit
- consistent with the rest of the testbase
- focused on logic

It **should not** be:

- testing views (otherwise it is called E2E)

Every single public methods of a class should be tested. Use a `describe()` block for each one of them.

<hr>

## How-to read these guidelines?

### Understanding the legend

ℹ️ **_Piece of information you have to be aware of._**

📚 Resources offering further details about the rules and tools to better your understanding.

⛔ Avoid doing this whenever possible. Very few exceptions are allowed.

✅ Something that you should thrive to do all the time.

💡 Ideas, reasons and whys behind the statement it follows.

🔥 Performance-oriented statement.

⚠️ Heads-up!

<hr>

## 01 - General

### Rule 01-01 Specification file: naming and location

✅ Put every UT in a dedicated specification file.

✅ Use conventional naming for specification file (e.g. use `.spec.ts` suffix).

✅ Put the specification file in the same folder as the file under test.

##### Example

```text
my-module

│
├── components
│
│   ├── my-app
│   │
│   │   ├── my-app.component.ts
│   │   └── my-app.component.spec.ts
│
├── services
│
│   ├── my-app
│   │
│   │   ├── my-app.service.ts
│   │   └── my-app.service.spec.ts
│
`
```

### Rule 01-02 Global `describe()` callback

✅ Wrap all the specifications into one global `describe()` callback.

✅ Use the name of the (`class` | `component` | `function` | ...) under test as
the description of the `describe()` callback.

##### Example

```typescript
// my-app.component.ts

@Component({...})
export class MyAppComponent {}
```

```typescript
// my-app.component.spec.ts

describe('MyAppComponent', () => {
    // ...
});
```

### Rule 01-03 One `describe()` callback per public method

✅ Use one `describe()` callback for each public method.

- 💡 Easier to understand when grouping all UTs of a method inside one `describe()` callback.

✅ Use the name of the method under test as the description (without parenthesis of course).

- 💡 It makes more sense when reading the test: _Calculation divide cowardly refuses to divide by zero_.

##### Example

```typescript
// my-app.service.ts

export class MyAppService {
    public increment(value: number): number {
        return value + 1;
    }
}
```

```typescript
// my-app.service.spec.ts

describe('MyAppService', () => {
    let myAppService: MyAppService;

    beforeEach(() => {
        myAppService = new MyAppService();
    });

    describe('increment', () => {
        it('should increment by 1', () => {
            // ...
        });
    });
});
```

### Rule 01-04 Test each and every `class`

✅ Write a UT to check that it instantiates correctly, even if the `class` is straightforward.

- 💡 These tests will validate any logic taking place at `class`'s instantiation as well as help us
  debug quickly whenever something has changed in the Dependency Injection system (on our side or elsewhere).

##### Example

```typescript
// my-app.component.ts

@Component({...})
export class MyAppComponent {}
```

```typescript
// my-app.component.spec.ts

describe('MyAppComponent', () => {
    let fixture: ComponentFixture<MyAppComponent>;
    let component: MyAppComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MyAppComponent],
        });

        fixture = TestBed.createComponent(MyAppComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
```

### Rule 01-05 All public methods must be tested

✅ Write tests for every single public method (from a `class`, a helper function, ...).

- 💡 Public methods represents the API you provide others to consume your data. Better have them battle-tested.

### Rule 01-06 Test every possible scenario

ℹ️ **_Our new KPI for front-end tests is the Branch coverage._**

📚 [Testing Principles](#testing-principles)

⛔ Don't think you know how the developer / user will use your code.

✅ Exhaustively test all paths / branches in your code.

- 💡 Expect the unexpected and everything should be alright.

### Rule 01-07 Asynchronous code should be tested as well as synchronous code

ℹ️ **_If you happen to have difficulties testing your asynchronous code, ask for help. Your team members are
here to help you._**

ℹ️ **_Sometimes, it might help to extract sensitive logic from the heart of an asynchronous code algorithm,
making it a simple piece of testable synchronous software._**

📚 [Component with async service](https://angular.dev/guide/testing/components-scenarios#component-with-async-service)

✅ Always test your `Observable`s, `Promise`s, ...

- 💡 Asynchronous code holds as much important logic as synchronous code.

⚠️ The usage of `fakeAsync()` is not recommended anymore ([documentation](https://angular.dev/guide/testing/components-scenarios#async-tests-with-zonejs-and-fakeasync))

✅ Prefer using `whenStable()` and Vitest fake timers to test your async code.

### Rule 01-08 Cleanup tests

(see [Rule 03-04](#rule-03-04-configure-the-testing-module-as-a-real-module)).

### Rule 01-09 Angular's Testing Modules

✅ Use Testing Modules (e.g. `HttpTestingModule`, `RouterTestingModule`, ...) provided by Angular.

- 💡 They are a simple way to reduce your test code complexity.

### Rule 01-10 TestBed restrictions

✅ Limit the use of Angular's `TestBed`.

✅ Create an instance yourself whenever possible.

- 💡 These restrictions will help us design better _unitary_ tests, effectively mocking every non-essential piece of software.
- 💡 If you have to test a service with a lot of dependencies, or which using Angular's testing modules, it is ok to use `TestBed`.

### Rule 01-11 Isolated tests

ℹ️ **_A well-written test is a test that leaves no trace. No context changes un-reset, no logs, no nothing._**

✅ Write tests that handle themselves.

- 💡 Avoiding polluting our tools is mandatory to allow quick and easy debugging sessions whenever an issue comes up.

🔥 Absolutely nothing coming from your tests should be left out.
If you have some issues dismissing errors / warnings / ..., ask a team member.

⚠️ **For this rule, chocoblasting is in order. Whoever creates a filthy test will have to suffer consequences...**

### Rule 01-12 Useful tests only

✅ Write tests only for logic that matters.

- 💡 `NgModule`s or even Repositories usually don't require any test at all.

🔥 Having too many tests is not an indicator of success. Especially if some tests bring no value.
They just slow down the execution process of the valuable tests, hence increasing the feedback loop.

### Rule 01-13 Testing signal inputs with WritableSignal

✅ Use `WritableSignal` to test components with signal inputs.

✅ Create the signal in `beforeEach()` with appropriate mock data.

✅ Use `inputBinding()` helper in `TestBed.createComponent()` to bind signals to inputs.

- 💡 Signal inputs provide better type safety and reactivity compared to traditional `@Input` decorators.
- 💡 Using `WritableSignal` allows you to update the input value during tests to verify reactive behavior.

##### Example

```typescript
// turf-betting-slip-card.component.ts

@Component({
    selector: 'app-turf-betting-slip-card',
    template: `
        <div>{{ bet().amount }}</div>
        <div>{{ bet().selection }}</div>
    `,
})
export class TurfBettingSlipCardComponent {
    public readonly bet = input.required<Bet>();
}
```

```typescript
// turf-betting-slip-card.component.spec.ts

describe('TurfBettingSlipCardComponent', () => {
    let fixture: ComponentFixture<TurfBettingSlipCardComponent>;
    let component: TurfBettingSlipCardComponent;
    let betSignal: WritableSignal<Bet>;

    beforeEach(() => {
        betSignal = signal<Bet>(betMocks.duoBet);

        TestBed.configureTestingModule({
            declarations: [TurfBettingSlipCardComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(TurfBettingSlipCardComponent, {
            bindings: [inputBinding('bet', betSignal)],
        });

        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display bet amount', () => {
        fixture.detectChanges();
        expect(component.bet().amount).toBe(betMocks.duoBet.amount);
    });

    it('should react to bet changes', () => {
        const newBet = { ...betMocks.duoBet, amount: 50 };

        betSignal.set(newBet);
        fixture.detectChanges();

        expect(component.bet().amount).toBe(50);
    });
});
```

## Rule 01-14 Testing linkedSignal with previous value dependencies

✅ Initialize `linkedSignal` memory by reading it once before testing its reactive behavior.

✅ Call the `linkedSignal` getter to establish the previous value before updating the source signal.

- 💡 `linkedSignal` requires an initial read to establish the "previous value" in its internal memory.
- 💡 Without this initialization, the `previousCounter` parameter will be `undefined` in the computation function.

##### Example

```typescript
// my-component.component.ts

@Component({
    selector: 'app-my-component',
    template: `
        <div>Counter: {{ counter() }}</div>
        <div>Is Increased: {{ isCounterIncreased() }}</div>
    `,
})
export class MyComponent {
    public readonly counter = input.required<number>();

    public readonly isCounterIncreased = linkedSignal<number, boolean>({
        source: this.counter,
        computation: (newCounter, previousCounter) => (previousCounter ? previousCounter.source < newCounter : false),
    });
}
```

```typescript
// my-component.component.spec.ts

describe('MyComponent', () => {
    let fixture: ComponentFixture<MyComponent>;
    let component: MyComponent;
    let counterSignal: WritableSignal<number>;

    beforeEach(() => {
        counterSignal = signal(0);

        TestBed.configureTestingModule({
            declarations: [MyComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(MyComponent, {
            bindings: [inputBinding('counter', counterSignal)],
        });

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('isCounterIncreased', () => {
        it('should return false initially', () => {
            expect(component.isCounterIncreased()).toBe(false);
        });

        it('should detect counter increase correctly', () => {
            // Initialize linkedSignal memory by reading it once
            component.isCounterIncreased();

            counterSignal.set(1);
            fixture.detectChanges();

            expect(component.isCounterIncreased()).toBe(true);
        });

        it('should return false when counter decreases', () => {
            // Initialize with higher value
            counterSignal.set(5);
            fixture.detectChanges();
            component.isCounterIncreased(); // Initialize memory

            counterSignal.set(3);
            fixture.detectChanges();

            expect(component.isCounterIncreased()).toBe(false);
        });

        it('should return false when counter stays the same', () => {
            counterSignal.set(5);
            fixture.detectChanges();
            component.isCounterIncreased(); // Initialize memory

            counterSignal.set(5);
            fixture.detectChanges();

            expect(component.isCounterIncreased()).toBe(false);
        });
    });
});
```

<hr>

## 02 - Test doubles

📚 [Check out Martin Fowler's definition](https://martinfowler.com/bliki/TestDouble.html).

**TL;DR:** Test Double is a generic term for any case where you replace a production object for testing purposes.
Five kinds of test double are identified in the above article, but **we'll keep it simple by sticking to the three below**:

- **Stubs** provide canned answers to calls made during the test,
  usually not responding at all to anything outside what's programmed in for the test.

- **Spies** are stubs that also record some information based on how they were called.

- **Mocks** are pre-programmed with expectations which form a specification of the calls they are expected to receive.
  They can throw an exception if they receive a call they don't expect and are checked during verification to ensure they
  got all the calls they were expecting.

### Rule 02-01 Explicit naming of a test double

✅ Name the test double according to its production implementation's name.

✅ Suffix a test double variable with its according kind.

- 💡 It makes your intent explicit when reviewing the code, easing debugging session and maintainability of the
  test suite, and also avoid naming collision.

##### Example

```typescript
// my-app.service.spec.ts

describe('MyAppService', () => {
    let myAppService: MyAppService;
    let loggerServiceMock: LoggerService;
    let myAppServiceLoginSpy: MockInstance;

    beforeEach(() => {
        loggerServiceMock = { log: vi.fn() } as unknown as LoggerService;
        myAppService = new MyAppService(loggerServiceMock);
        myAppServiceLoginSpy = vi.spyOn(myAppService, 'login');
    });

    test('should login with credentials', () => {
        // ...

        const loginPayloadStub = {
            login: expect.any(String),
            password: expect.any(String),
        };
        expect(myAppServiceLoginSpy).toHaveBeenCalledWith(loginPayloadStub);
    });
});
```

### Rule 02-02 Vitest spy registration

✅ Put spy and mock registration in the `beforeEach()` lifecycle hook.

- 💡 Cleaning context between each test execution is crucial to emphasize the unitary testing.

- 💡 Prefer spy instantiation in `beforeEach` rather than resetting your spies with `vi.clearAllMocks()`

##### Example

```typescript
// live-match-body-class.desktop.directive.spec.ts

describe('LiveMatchBodyClassDirective', () => {
    let bodyDisplayServiceMock: BodyDisplayService;
    let liveMatchBodyClassDirective: LiveMatchBodyClassDirective;

    beforeEach(() => {
        bodyDisplayServiceMock = {
            toggleMatchLivePageClass: vi.fn(),
        } as unknown as BodyDisplayService;
        liveMatchBodyClassDirective = new LiveMatchBodyClassDirective(bodyDisplayServiceMock);
    });

    describe('ngOnInit', () => {
        test('should add class if event is live', (): void => {
            liveMatchBodyClassDirective.isLive = true;
            liveMatchBodyClassDirective.ngOnInit();
            expect(bodyDisplayServiceMock.toggleMatchLivePageClass).toHaveBeenCalled();
        });

        test('should do nothing if event is not a live', () => {
            liveMatchBodyClassDirective.isLive = false;
            liveMatchBodyClassDirective.ngOnInit();
            expect(bodyDisplayServiceMock.toggleMatchLivePageClass).not.toHaveBeenCalled();
        });
    });
});
```

<hr>

## 03 - Components

### Rule 03-01 Configure `TestBed` in the `beforeEach()` lifecycle hook

ℹ️ **_This pattern avoid sharing context between tests and enforce unit testing._**

✅ Use `TestBed.configureTestingModule()` inside the `beforeEach()` lifecycle hook.

- 💡 The `beforeEach()` hook will be called before each individual test execution,
  effectively creating a new instance of the wrapping testing module.

##### Example

```typescript
// my-app.component.spec.ts

describe('MyAppComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            // ...
        });
    });

    it('should ...', () => {
        // ...
    });
});
```

### Rule 03-02 Avoid `compileComponents()`

ℹ️ **_[Although calling `compileComponents()` is harmless](https://angular.io/guide/testing#compilecomponents-is-harmless),
not having it improves the testing codebase and allows us to keep only one "main" `beforeEach()` hook._**

ℹ️ **_This rule enforces the "No logic in template" rule. If you happen to need to test something in the view,
it is likely that your implementation is wrong. If you followed the proper guidelines, then testing the view is the same
as testing that Angular does its interpolating job correctly._**

⚠️ **Its not your job to test the framework**.

📚 [`TestBed.compileComponents()`](https://angular.io/guide/testing#calling-compilecomponents)

✅ Remove the `compileComponents()` call.

- 💡 Since we always execute our tests using Angular CLI, the components are pre-compiled before test execution.
- 💡 Calling `compileComponents()` might prevent us from further customizing the resulting testing module.

✅ Remove the `async()` call from the `beforeEach()` setup.

✅ Merge the two `beforeEach()` generated by Angular CLI.

> You can ignore `compileComponents()` if you only run tests with the CLI `ng test` command because the CLI
> compiles the application before running the tests.

> Calling `compileComponents()` closes the current `TestBed` instance to further configuration.
> You cannot call any more `TestBed` configuration methods, not `configureTestingModule()` nor any of the "override" methods.
> The `TestBed` throws an error if you try.

### Rule 03-03 Don't link the view to the test

⛔ Don't access the view in the test (e.g. `debugElement`, ...).

- 💡 Unit tests check the business logic. Views are tested in E2E tests.

🟡 **Exception — low-level reusable UI components** (`src/app/presentation/ui/**`: inputs, cards,
directives, …). For these, the behaviour _is_ the DOM interaction (scroll, focus, class toggling),
and there is often no business logic to assert otherwise. Rendering the component and asserting its
observable interaction is preferred over widening a `private`/`protected` member to `public` just to
spy on it from a test.

- ✅ Drive the component through its **public API** (inputs, public methods, simulated events) and
  assert observable outcomes: public signals, emitted outputs, rendered classes, or DOM APIs you
  stub/spy (e.g. `element.scrollTo`, `element.scrollIntoView`).
- ✅ For `ControlValueAccessor` callbacks, register a `vi.fn()` via
  `registerOnChange` / `registerOnTouched` instead of exposing the callbacks.
- ⛔ Don't expand a component's public API solely for test access. Keep implementation details
  `private`/`protected`.
- 💡 jsdom has no real layout/scroll, so assert that the DOM scroll API was _called_ (spy), not the
  resulting pixel position.

### Rule 03-04 Configure the testing module as a real module

✅ Declare all the dependencies (e.g. `Component`s, `Directive`s, ...) instead of importing the
associated modules.

- 💡 When reading the test configuration, it becomes obvious what the scope of the test is.

✅ Provide test double over importing production modules (see [Test doubles](#02---test-doubles)).

- 💡 Exception is allowed for Angular's Testing Modules (see [Rule 01-09](#rule-01-09-angulars-testing-modules)).

🔥 Carefully configuring the testing module will avoid having too many dependencies and improve test execution / debugging.

### Rule 03-05 Configure the target under test through its public interface

✅ Use the target's public interface to set its initial state for the current test.

🔥 This pattern avoids the creation of a fake `Component` acting as a test host, saving compilation time
(see [Rule 03-06](#rule-03-06-avoid-fake-component-acting-as-a-test-host)).

##### Example

```typescript
// my-button.component.ts

@Component({...})
export class MyButtonComponent {
    public readonly title = input('');
}
```

```typescript
// my-button.component.spec.ts

describe('MyButtonComponent', () => {
    let fixture: ComponentFixture<MyButtonComponent>;
    let component: MyButtonComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MyButtonComponent],
        });

        fixture = TestBed.createComponent(MyButtonComponent);
        component = fixture.componentInstance;

        component.title = 'my-button';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
```

### Rule 03-06 Avoid fake `Component` acting as a Test Host

⛔ Don't use a Host if you can do otherwise.

✅ Use a Host only when you have to test template-related `Directive`s, transcluded content, abstract `Component`s ()...

- 💡 Test hosts makes the tests harder to reason about and obscure the underlying developer intention.
  They can be hard to maintain and are quickly out-of-sync with production implementation.

##### Example

```typescript
// my-button.component.spec.ts

//////////////////////////////////////////
//            DON'T DO THAT!            //
//////////////////////////////////////////

@Component({
    template: `<my-button title="Awesome!" />`,
    // ...
})
class MyButtonTestHostComponent {
    @ViewChild(MyButtonComponent)
    public readonly myButtonComponent: MyButtonComponent;
}

describe('MyButtonComponent', () => {
    let fixture: ComponentFixture<MyButtonTestHostComponent>;
    let component: MyButtonTestHostComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MyButtonComponent, MyButtonTestHostComponent],
        });

        fixture = TestBed.createComponent(MyButtonTestHostComponent);
        component = fixture.componentInstance;
    });

    // ...

    it('should have a title', () => {
        expect(component.myButtonComponent.title).toBe('Awesome!');
    });
});
```

### Rule 03-07 Abstract `Component`s

ℹ️ **_This is one of the few exceptions overriding
[Rule 03-06](#rule-03-06-avoid-fake-component-acting-as-a-test-host)._**

✅ Use a dedicated specification file for abstract `Component`s.

✅ Use inherited child to test an abstract `Component`.

✅ Test abstract `Component`'s code only.

- 💡 Code that is not part of the abstract `Component` itself will be tested in inherited child specification file.

##### Example

```typescript
// abstract-button.component.ts

export class AbstractButtonComponent {
    public click(): void {
        // ...
        this.handleClick();
    }

    protected handleClick(): void {
        // ...
    }
}
```

```typescript
// abstract-button.component.spec.ts

@Component({...})
class MyButtonTestHostComponent extends AbstractButtonComponent {}

describe('AbstractButtonComponent', () => {
    let fixture: ComponentFixture<MyButtonTestHostComponent>;
    let component: MyButtonTestHostComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MyButtonTestHostComponent],
        });

        fixture = TestBed.createComponent(MyButtonTestHostComponent);
        component = fixture.componentInstance;
    });

    // ...

    it('should ...', () => {
        // ...
        expect(component.handleClick).toHaveBeenCalled();
    });
});
```

### Rule 03-08 Restrict specification file to `Component`'s scope

📚 [What is `CUSTOM_ELEMENTS_SCHEMA`?](https://angular.io/api/core/CUSTOM_ELEMENTS_SCHEMA)

⛔ Don't load all the dependencies of the `Component` under test.

- 💡 Most of the time, child `Component`s of the one under tests are not needed to validate its logic.

✅ Add `CUSTOM_ELEMENTS_SCHEMA` to the
[`TestBed.configureTestingModule.schemas`](https://angular.io/api/core/testing/TestModuleMetadata) metadata.

- 💡 Focus the tests on your `Component`'s logic, not its template (see [Rule 03-03](#rule-03-03-dont-link-the-view-to-the-test)).

🔥 It reduces test's execution time and maintenance cost.

##### Example

```typescript
// button.component.spec.ts

describe('ButtonComponent', () => {
    // ...

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ButtonComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        // ...
    });

    // ...
});
```

<hr>

## Resources

### Rule 01-07

- 📚 [Component with async service](https://angular.io/guide/testing#component-with-async-service)
- 📚 [Async test with `fakeAsync()`](https://angular.io/guide/testing#async-test-with-fakeasync)
- 📚 [The `tick()` function](https://angular.io/guide/testing#the-tick-function)
- 📚 [`whenStable`](https://angular.io/guide/testing#whenstable)

### Test doubles

- 📚 [TestDouble](https://martinfowler.com/bliki/TestDouble.html)

### Rule 03-02

- 📚 [Calling `compileComponents()`](https://angular.io/guide/testing#calling-compilecomponents)
- 📚 [`compileComponents()` is harmless](https://angular.io/guide/testing#compilecomponents-is-harmless)

### Rule 03-08

- 📚 [`CUSTOM_ELEMENTS_SCHEMA`](https://angular.io/api/core/CUSTOM_ELEMENTS_SCHEMA)
