# vue/valid-define-props

## What it does

This rule checks whether `defineProps` compiler macro is valid.

This rule reports `defineProps` compiler macros in the following cases:

- `defineProps` is referencing locally declared variables.
- `defineProps` has both a literal type and an argument. e.g. `defineProps<{ /*props*/ }>({ /*props*/ })`
- `defineProps` has been called multiple times.
- Props are defined in both `defineProps` and `export default {}`.
- Props are not defined in either `defineProps` or `export default {}`.

### Why is this bad?

Misusing `defineProps` can lead to runtime errors, and lost type safety.
Vue may still compile the code, but properties may break silently or be typed incorrectly.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

```vue
```

```vue
```

```vue
```

Examples of **correct** code for this rule:

```vue
```

```vue
```

```vue
```

```vue
```

## Version

This rule was added in v1.15.0.
