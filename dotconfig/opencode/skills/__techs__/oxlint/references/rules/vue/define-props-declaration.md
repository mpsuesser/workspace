# vue/define-props-declaration

## What it does

This rule enforces `defineProps` typing style which you should use `type-based` or `runtime` declaration.
This rule only works in `
// "vue/define-props-declaration": ["error", "runtime"]
```

Examples of **correct** code for this rule:

```vue
// "vue/define-props-declaration": ["error", "type-based"]

// "vue/define-props-declaration": ["error", "runtime"]
```

## Configuration

This rule accepts one of the following string values:

### `"type-based"`

Enforce type-based declaration.

### `"runtime"`

Enforce runtime declaration.

## Version

This rule was added in v1.15.0.
