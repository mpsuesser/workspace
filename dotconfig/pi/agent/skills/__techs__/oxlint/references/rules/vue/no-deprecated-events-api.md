# vue/no-deprecated-events-api

## What it does

Disallow using deprecated Events API (`$on`, `$off`, `$once`) in Vue.js 3.0.0+.

### Why is this bad?

In Vue.js 3.0.0+, the internal event APIs `$on`, `$off`, and `$once` have been removed.
These methods were used for event handling between components but are no longer available.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

Examples of **correct** code for this rule:

```vue
```

## Version

This rule was added in v1.62.0.
