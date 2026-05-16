# jest/no-hooks

## What it does

Disallows Jest setup and teardown hooks, such as `beforeAll`.

### Why is this bad?

Jest provides global functions for setup and teardown tasks, which are
called before/after each test case and each test suite. The use of these
hooks promotes shared state between tests.

This rule reports for the following function calls:

- `beforeAll`
- `beforeEach`
- `afterAll`
- `afterEach`

### Examples

Examples of **incorrect** code for this rule:

```javascript
function setupFoo(options) {
  /* ... */
}
function setupBar(options) {
  /* ... */
}

describe("foo", () => {
  let foo;
  beforeEach(() => {
    foo = setupFoo();
  });
  afterEach(() => {
    foo = null;
  });
  it("does something", () => {
    expect(foo.doesSomething()).toBe(true);
  });
  describe("with bar", () => {
    let bar;
    beforeEach(() => {
      bar = setupBar();
    });
    afterEach(() => {
      bar = null;
    });
    it("does something with bar", () => {
      expect(foo.doesSomething(bar)).toBe(true);
    });
  });
});
```

## Configuration

This rule accepts a configuration object with the following properties:

### allow

type: `string[]`

default: `[]`

An array of hook function names that are permitted for use.

## Version

This rule was added in v0.0.16.
