# vitest/prefer-called-once

## What it does

Substitute `toBeCalledTimes(1)` and `toHaveBeenCalledTimes(1)` with
`toBeCalledOnce()` and `toHaveBeenCalledOnce()` respectively.

### Why is this bad?

The `*Times` matchers require reading the argument to know how many
times a spy is expected to be called. Most of the time, you expect a
method to be called once.

### Examples

Examples of **incorrect** code for this rule:

```js
test("foo", () => {
  const mock = vi.fn();
  mock("foo");
  expect(mock).toBeCalledTimes(1);
  expect(mock).toHaveBeenCalledTimes(1);
});
```

Examples of **correct** code for this rule:

```js
test("foo", () => {
  const mock = vi.fn();
  mock("foo");
  expect(mock).toBeCalledOnce();
  expect(mock).toHaveBeenCalledOnce();
});
```

## Version

This rule was added in v1.39.0.
