# vue/valid-define-emits

## What it does

This rule checks whether `defineEmits` compiler macro is valid.

This rule reports `defineEmits` compiler macros in the following cases:

- `defineEmits` is referencing locally declared variables.
- `defineEmits` has both a literal type and an argument. e.g. `defineEmits<(e: 'foo')=>void>(['bar'])`
- `defineEmits` has been called multiple times.
- Custom events are defined in both `defineEmits` and `export default {}`.
- Custom events are not defined in either `defineEmits` or `export default {}`.

### Why is this bad?

Misusing `defineEmits` can lead to runtime errors, unclear component contracts, and lost type safety.
Vue may still compile the code, but emitted events may break silently or be typed incorrectly.

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

This rule was added in v1.14.0.
