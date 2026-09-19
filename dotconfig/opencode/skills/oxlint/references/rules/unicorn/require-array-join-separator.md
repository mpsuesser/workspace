# unicorn/require-array-join-separator

## What it does

Enforce using the separator argument with `Array#join()`.

### Why is this bad?

It's better to make it clear what the separator is when calling `Array#join()`,
instead of relying on the default comma (`','`) separator.

### Examples

Examples of **incorrect** code for this rule:

```javascript
foo.join();
```

Examples of **correct** code for this rule:

```javascript
foo.join(",");
```

## Version

This rule was added in v0.0.19.
