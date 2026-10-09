# oxc/erasing-op

## What it does

Checks for erasing operations, e.g., `x * 0`.

Based on https://rust-lang.github.io/rust-clippy/master/#/erasing_op

### Why is this bad?

The whole expression can be replaced by zero. This is most likely not the intended outcome and should probably be corrected.

### Examples

Examples of **incorrect** code for this rule:

```javascript
let x = 1;
let y = x * 0;
```

Examples of **correct** code for this rule:

```javascript
let x = 1;
let y = 0;
```

## Version

This rule was added in v0.1.1.
