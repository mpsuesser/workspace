# vue/no-required-prop-with-default

## What it does

Enforce props with default values to be optional.

### Why is this bad?

If a prop is declared with a default value, whether it is required or not,
we can always skip it in actual use. In that situation, the default value would be applied.
So, a required prop with a default value is essentially the same as an optional prop.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

Examples of **correct** code for this rule:

```vue
```

## Version

This rule was added in v1.17.0.
