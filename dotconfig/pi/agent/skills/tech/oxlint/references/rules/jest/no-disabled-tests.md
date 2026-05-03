# jest/no-disabled-tests

## What it does

This rule raises a warning about disabled tests.

### Why is this bad?

Jest has a feature that allows you to temporarily mark tests as disabled. This
feature is often helpful while debugging or to create placeholders for future
tests. Before committing changes we may want to check that all tests are
running.

### Examples

```js
describe.skip("foo", () => {});
it.skip("foo", () => {});
test.skip("foo", () => {});

describe["skip"]("bar", () => {});
it["skip"]("bar", () => {});
test["skip"]("bar", () => {});

xdescribe("foo", () => {});
xit("foo", () => {});
xtest("foo", () => {});

it("bar");
test("bar");

it("foo", () => {
  pending();
});
```

## Version

This rule was added in v0.0.7.
