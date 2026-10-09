# vitest/prefer-called-exactly-once-with

## What it does

It checks when a target is asserted with both `toHaveBeenCalledOnce` and `toHaveBeenCalledWith` instead of
`toHaveBeenCalledExactlyOnceWith`.

### Why is this bad?

The reader must deduce from both expectations that the spy function is called once and with specific arguments.

### Examples

Examples of **incorrect** code for this rule:

```js
test("foo", () => {
  const mock = vi.fn();
  mock("foo");
  expect(mock).toHaveBeenCalledOnce();
  expect(mock).toHaveBeenCalledWith("foo");
});
```

Examples of **correct** code for this rule:

```js
test("foo", () => {
  const mock = vi.fn();
  mock("foo");
  expect(mock).toHaveBeenCalledExactlyOnceWith("foo");
});
```

## Version

This rule was added in v1.58.0.
