
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Node.js (this project)

When running scripts from `package.json` (`npm run …`, `npx …`, `ng …`, tests, builds, installs), use Node.js from this installation (aligned with `.nvmrc`):

- **Node:** `C:\Program Files\nodejs\node.exe`
- **npm:** `C:\Program Files\nodejs\npm.cmd`
- **npx:** `C:\Program Files\nodejs\npx.cmd`

Do not rely on other `node` / `npm` installations elsewhere on `PATH` for this repo.

**PowerShell** — prepend the Node.js directory, then run the script:

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
npm run test
```

**Direct invocation** (when PATH cannot be changed):

```powershell
& "C:\Program Files\nodejs\npm.cmd" run test
```

Verify the version when unsure: `& "C:\Program Files\nodejs\node.exe" -v`.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Type Definitions

- Define interfaces and types in separate files within the `src/app/types` folder
- Use `.interface.ts` or `.type.ts` suffix for clarity
- Import types where needed

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
- `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- All member properties and methods must have explicit access modifiers (`protected`, `private`, `public`)
- Prefer `protected` for component properties accessed in templates

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Avoid using non-deterministic globals (e.g. `new Date()`) directly in templates; compute in component code for testability.
- Use self-closing tags in HTML/Angular templates wherever possible.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Import Organization

- Group imports in the following order, separated by blank lines:
  1. Angular imports (e.g., `@angular/core`, `@angular/common`)
  2. Local application imports (e.g., `@admin-panel-web/*`, relative imports)
  3. Third-party library imports (e.g., `rxjs`)

## Clean Code Rules (based on Robert C. Martin)

Code is clean if it can be understood easily by everyone on the team. Clean code can be read and enhanced by a developer other than its original author. With understandability comes readability, changeability, extensibility and maintainability.

### General Rules

1. Follow standard conventions.
2. Keep it simple stupid. Simpler is always better. Reduce complexity as much as possible.
3. Boy scout rule. Leave the campground cleaner than you found it.
4. Always find root cause. Always look for the root cause of a problem.

### Design Rules

1. Keep configurable data at high levels.
2. Prefer polymorphism to if/else or switch/case.
3. Separate multi-threading code.
4. Prevent over-configurability.
5. Use dependency injection.
6. Follow Law of Demeter. A class should know only its direct dependencies.

### Understandability Tips

1. Be consistent. If you do something a certain way, do all similar things in the same way.
2. Use explanatory variables.
3. Encapsulate boundary conditions. Boundary conditions are hard to keep track of. Put the processing for them in one place.
4. Prefer dedicated value objects to primitive type.
5. Avoid logical dependency. Don't write methods which work correctly depending on something else in the same class.
6. Avoid negative conditionals.

### Names Rules

1. Choose descriptive and unambiguous names.
2. Make meaningful distinction.
3. Use pronounceable names.
4. Use searchable names.
5. Replace magic numbers with named constants.
6. Avoid encodings. Don't append prefixes or type information.

### Functions Rules

1. Small.
2. Do one thing.
3. Use descriptive names.
4. Prefer fewer arguments.
5. Have no side effects.
6. Don't use flag arguments. Split method into several independent methods that can be called from the client without the flag.

### Comments Rules

1. Always try to explain yourself in code.
2. Don't be redundant.
3. Don't add obvious noise.
4. Don't use closing brace comments.
5. Don't comment out code. Just remove.
6. Use as explanation of intent.
7. Use as clarification of code.
8. Use as warning of consequences.

### Source Code Structure

1. Separate concepts vertically.
2. Related code should appear vertically dense.
3. Declare variables close to their usage.
4. Dependent functions should be close.
5. Similar functions should be close.
6. Place functions in the downward direction.
7. Keep lines short.
8. Don't use horizontal alignment.
9. Use white space to associate related things and disassociate weakly related.
10. Don't break indentation.

### Objects and Data Structures

1. Hide internal structure.
2. Prefer data structures.
3. Avoid hybrid structures (half object and half data).
4. Should be small.
5. Do one thing.
6. Small number of instance variables.
7. Base class should know nothing about their derivatives.
8. Better to have many functions than to pass some code into a function to select a behavior.
9. Prefer non-static methods to static methods.

### Tests

1. One assert per test.
2. Readable.
3. Fast.
4. Independent.
5. Repeatable.

### Code Smells

1. **Rigidity.** The software is difficult to change. A small change causes a cascade of subsequent changes.
2. **Fragility.** The software breaks in many places due to a single change.
3. **Immobility.** You cannot reuse parts of the code in other projects because of involved risks and high effort.
4. **Needless Complexity.**
5. **Needless Repetition.**
6. **Opacity.** The code is hard to understand.
