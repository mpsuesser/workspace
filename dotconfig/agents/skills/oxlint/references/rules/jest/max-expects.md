# jest/max-expects

## What it does

This rule enforces a maximum number of `expect()` calls in a single test.

### Why is this bad?

Tests with many different assertions are likely mixing multiple objectives.
It is generally better to have a single objective per test to ensure that when a test fails,
the problem is easy to identify.

### Examples

Examples of **incorrect** code for this rule:

```javascript
test("should not pass", () => {
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
});

it("should not pass", () => {
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
  expect(true).toBeDefined();
});
```

## Configuration

This rule accepts a configuration object with the following properties:

### max

type: `integer`

default: `5`

Maximum number of `expect()` assertion calls allowed within a single test.

## Version

This rule was added in v0.0.18.
