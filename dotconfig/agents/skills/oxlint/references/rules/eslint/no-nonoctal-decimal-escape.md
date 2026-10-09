# eslint/no-nonoctal-decimal-escape

## What it does

This rule disallows \8 and \9 escape sequences in string literals.

### Why is this bad?

ECMAScript specification treats \8 and \9 in string literals as a legacy feature

### Examples

Examples of **incorrect** code for this rule:

```javascript
let x = "\8";
let y = "\9";
```

Examples of **correct** code for this rule:

```javascript
let x = "8";
let y = "\\9";
```

## Version

This rule was added in v0.2.10.
