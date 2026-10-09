# vue/define-emits-declaration

## What it does

This rule enforces `defineEmits` typing style which you should use `type-based`, strict `type-literal` (introduced in Vue 3.3), or `runtime` declaration.
This rule only works in setup script and `lang="ts"`.

### Why is this bad?

Inconsistent code style can be confusing and make code harder to read
through.

### Examples

Examples of **incorrect** code for this rule:

```vue
// "vue/define-emits-declaration": ["error", "type-based"]

// "vue/define-emits-declaration": ["error", "type-literal"]

// "vue/define-emits-declaration": ["error", "runtime"]
```

Examples of **correct** code for this rule:

```vue
// "vue/define-emits-declaration": ["error", "type-based"]

// "vue/define-emits-declaration": ["error", "type-literal"]

// "vue/define-emits-declaration": ["error", "runtime"]
```

## Configuration

This rule accepts one of the following string values:

### `"type-based"`

Enforces the use of a named TypeScript type or interface as the
argument to `defineEmits`, e.g. `defineEmits<MyEmits>()`.

### `"type-literal"`

Enforces the use of an inline type literal as the argument to
`defineEmits`, e.g. `defineEmits<{ (event: string): void }>()`.

### `"runtime"`

Enforces the use of runtime declaration, where emits are declared
using an array or object, e.g. `defineEmits(['event1', 'event2'])`.

## Version

This rule was added in v1.15.0.
