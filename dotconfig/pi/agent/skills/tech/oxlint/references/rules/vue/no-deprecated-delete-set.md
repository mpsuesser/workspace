# vue/no-deprecated-delete-set

## What it does

Disallow using deprecated `$set` / `$delete` (in Vue.js 3.0.0+).

### Why is this bad?

In Vue 3, the instance methods `$set` / `$delete` and the global
`Vue.set` / `Vue.delete` were removed. Reactivity is now backed by
Proxies, so plain assignment and the `delete` operator work as
expected and these helpers are no longer needed.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

Examples of **correct** code for this rule:

```vue
```

## Version

This rule was added in v1.62.0.
