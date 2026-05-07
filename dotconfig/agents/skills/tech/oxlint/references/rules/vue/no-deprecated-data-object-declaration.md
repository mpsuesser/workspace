# vue/no-deprecated-data-object-declaration

## What it does

Disallow object declaration on `data` (in Vue.js 3.0.0+).

### Why is this bad?

In Vue 3, declaring `data` as an object causes the same object to be
shared between every instance of the component, which leads to cross-
instance state pollution. `data` must be a function that returns a
fresh object per instance.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

Examples of **correct** code for this rule:

```vue
```

## Version

This rule was added in v1.62.0.
