# unicorn/prefer-set-size

## What it does

Prefer `Set#size` over `Set#length` when the `Set` is converted to an array.

### Why is this bad?

Using `Set#size` is more readable and performant.

### Examples

Examples of **incorrect** code for this rule:

```javascript
const length = [...new Set([1, 2, 3])].length;
```

Examples of **correct** code for this rule:

```javascript
const size = new Set([1, 2, 3]).size;
```

## Version

This rule was added in v0.0.19.
