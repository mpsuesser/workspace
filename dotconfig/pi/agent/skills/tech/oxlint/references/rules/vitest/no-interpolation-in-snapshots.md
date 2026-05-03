# vitest/no-interpolation-in-snapshots

## What it does

Prevents the use of string interpolations in snapshots.

### Why is this bad?

Interpolation prevents snapshots from being updated. Instead, properties should
be overloaded with a matcher by using
[property matchers](https://jestjs.io/docs/en/snapshot-testing#property-matchers).

### Examples

Examples of **incorrect** code for this rule:

```javascript
expect(something).toMatchInlineSnapshot(
  `Object {
    property: ${interpolated}
  }`,
);

expect(something).toMatchInlineSnapshot(
  { other: expect.any(Number) },
  `Object {
    other: Any<Number>,
    property: ${interpolated}
  }`,
);

expect(errorThrowingFunction).toThrowErrorMatchingInlineSnapshot(`${interpolated}`);
```

## Version

This rule was added in v0.0.13.
