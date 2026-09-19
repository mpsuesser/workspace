# vitest/no-focused-tests

## What it does

This rule reminds you to remove `.only` from your tests by raising a warning
whenever you are using the exclusivity feature.

### Why is this bad?

Jest has a feature that allows you to focus tests by appending `.only` or
prepending `f` to a test-suite or a test-case. This feature is really helpful to
debug a failing test, so you don’t have to execute all of your tests. After you
have fixed your test and before committing the changes you have to remove
`.only` to ensure all tests are executed on your build system.

### Examples

Examples of **incorrect** code for this rule:

```javascript
describe.only("foo", () => {});
it.only("foo", () => {});
describe["only"]("bar", () => {});
it["only"]("bar", () => {});
test.only("foo", () => {});
test["only"]("bar", () => {});
fdescribe("foo", () => {});
fit("foo", () => {});
fit.each`
  table
`();
```

## Version

This rule was added in v0.0.8.
