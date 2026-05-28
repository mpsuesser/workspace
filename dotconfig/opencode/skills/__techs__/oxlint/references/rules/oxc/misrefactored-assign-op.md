# oxc/misrefactored-assign-op

## What it does

https://rust-lang.github.io/rust-clippy/master/#/misrefactored_assign_op

Checks for `a op= a op b` or `a op= b op a` patterns.

### Why is this bad?

Most likely these are bugs where one meant to write `a op= b`.

### Examples

Examples of **incorrect** code for this rule:

```javascript
a += a + b;
a -= a - b;
```

Examples of **correct** code for this rule:

```javascript
a += b;
a -= b;
```

## Version

This rule was added in v0.1.1.
