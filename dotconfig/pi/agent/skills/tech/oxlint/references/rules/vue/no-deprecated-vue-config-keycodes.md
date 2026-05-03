# vue/no-deprecated-vue-config-keycodes

## What it does

Disallow using deprecated `Vue.config.keyCodes` (in Vue.js 3.0.0+).

### Why is this bad?

`Vue.config.keyCodes` was removed in Vue 3. Code that relies on it will
silently stop working when upgrading.

### Examples

Examples of **incorrect** code for this rule:

```js
Vue.config.keyCodes = { enter: 13 };
```

Examples of **correct** code for this rule:

```js
Vue.config.silent = true;
```

## Version

This rule was added in v1.62.0.
