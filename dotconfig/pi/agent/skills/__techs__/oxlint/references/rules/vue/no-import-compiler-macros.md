# vue/no-import-compiler-macros

## What it does

Disallow importing Vue compiler macros.

### Why is this bad?

Compiler Macros like:

- `defineProps`
- `defineEmits`
- `defineExpose`
- `withDefaults`
- `defineModel`
- `defineOptions`
- `defineSlots`

are globally available in Vue 3's ````

Examples of **correct** code for this rule:

```vue
```

## Version

This rule was added in v1.21.0.
