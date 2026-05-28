# vitest/prefer-strict-boolean-matchers

## What it does

Enforce using `toBe(true)` and `toBe(false)` over matchers that coerce types to boolean.

### Why is this bad?

Truthy/falsy matchers coerce values to boolean and can hide type mistakes.
Strict boolean assertions make intent explicit and avoid accidental coercion.

### Examples

Examples of **incorrect** code for this rule:

```javascript
expect(foo).toBeTruthy();
expectTypeOf(foo).toBeTruthy();
expect(foo).toBeFalsy();
expectTypeOf(foo).toBeFalsy();
```

Examples of **correct** code for this rule:

```javascript
expect(foo).toBe(true);
expectTypeOf(foo).toBe(true);
expect(foo).toBe(false);
expectTypeOf(foo).toBe(false);
```

## Version

This rule was added in v1.57.0.
