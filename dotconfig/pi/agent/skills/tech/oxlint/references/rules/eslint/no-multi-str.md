# eslint/no-multi-str

## What it does

Disallow multiline strings.

### Why is this bad?

Some consider this to be a bad practice as it was an undocumented feature of JavaScript
that was only formalized later.

### Examples

Examples of **incorrect** code for this rule:

```javascript
var x =
  "Line 1 \
 Line 2";
```

## Version

This rule was added in v0.5.3.
