# vue/define-props-destructuring

## What it does

This rule enforces a consistent style for handling Vue 3 Composition API props,
allowing you to choose between requiring destructuring or prohibiting it.

### Why is this bad?

By default, the rule requires you to use destructuring syntax when using `defineProps`
instead of storing props in a variable and warns against combining `withDefaults` with destructuring.

### Examples

Examples of **incorrect** code for this rule:

```vue
```

Examples of **correct** code for this rule:

```vue
```

## Configuration

This rule accepts a configuration object with the following properties:

### destructure

type: `"always" | "never"`

default: `"always"`

Require or prohibit destructuring.

#### `"always"`

Requires destructuring when using `defineProps` and warns against using `withDefaults` with destructuring

#### `"never"`

Requires using a variable to store props and prohibits destructuring

## Version

This rule was added in v1.20.0.
