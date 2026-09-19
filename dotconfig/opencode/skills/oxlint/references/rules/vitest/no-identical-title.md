# vitest/no-identical-title

## What it does

This rule looks at the title of every test and test suite.
It will report when two test suites or two test cases at the same level of a test suite have the same title.

### Why is this bad?

Having identical titles for two different tests or test suites may create confusion.
For example, when a test with the same title as another test in the same test suite fails, it is harder to know which one failed and thus harder to fix.

### Examples

Examples of **incorrect** code for this rule:

```javascript
describe("baz", () => {
  //...
});

describe("baz", () => {
  // Has the same title as a previous test suite
  // ...
});
```

## Version

This rule was added in v0.0.14.
