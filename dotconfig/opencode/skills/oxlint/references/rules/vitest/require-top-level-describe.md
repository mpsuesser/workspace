# vitest/require-top-level-describe

## What it does

Requires test cases and hooks to be inside a top-level `describe` block.

### Why is this bad?

Having tests and hooks organized within `describe` blocks provides better
structure and grouping for test suites. It makes test output more readable
and helps with test organization, especially in larger codebases.

This rule triggers a warning if a test case (`test` and `it`) or a hook
(`beforeAll`, `beforeEach`, `afterEach`, `afterAll`) is not located in a
top-level `describe` block.

### Examples

Examples of **incorrect** code for this rule:

```javascript
// Above a describe block
test("my test", () => {});
describe("test suite", () => {
  it("test", () => {});
});

// Below a describe block
describe("test suite", () => {});
test("my test", () => {});

// Same for hooks
beforeAll("my beforeAll", () => {});
describe("test suite", () => {});
afterEach("my afterEach", () => {});
```

Examples of **correct** code for this rule:

```javascript
// Above a describe block
// In a describe block
describe("test suite", () => {
  test("my test", () => {});
});

// In a nested describe block
describe("test suite", () => {
  test("my test", () => {});
  describe("another test suite", () => {
    test("my other test", () => {});
  });
});
```

## Configuration

This rule accepts a configuration object with the following properties:

### maxNumberOfTopLevelDescribes

type: `integer`

default: `Infinity`

The maximum number of top-level `describe` blocks allowed in a test file.

## Version

This rule was added in v0.4.2.
