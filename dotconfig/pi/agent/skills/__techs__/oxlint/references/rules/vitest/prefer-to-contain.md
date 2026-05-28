# vitest/prefer-to-contain

## What it does

In order to have a better failure message, `toContain()` should be used upon
asserting expectations on an array containing an object.

### Why is this bad?

This rule triggers a warning if `toBe()`, `toEqual()` or `toStrictEqual()` is
used to assert object inclusion in an array

### Examples

Examples of **incorrect** code for this rule:

```javascript
expect(a.includes(b)).toBe(true);
expect(a.includes(b)).not.toBe(true);
expect(a.includes(b)).toBe(false);
expect(a.includes(b)).toEqual(true);
expect(a.includes(b)).toStrictEqual(true);
```

Examples of **correct** code for this rule:

```javascript
expect(a).toContain(b);
expect(a).not.toContain(b);
```

## Version

This rule was added in v0.2.14.
