# vue/no-this-in-before-route-enter

## What it does

Disallow `this` usage in a `beforeRouteEnter` method.

This rule is only relevant when using `vue-router`.

### Why is this bad?

Inside a `beforeRouteEnter` method, there is no access to `this`.
See [the vue-router docs](https://router.vuejs.org/guide/advanced/navigation-guards.html#in-component-guards).
This behavior isn't obvious, and so this lint rule can help prevent runtime errors in some cases.

### Examples

Examples of **incorrect** code for this rule:

```js
export default {
  beforeRouteEnter(to, from, next) {
    this.a; // Error: 'this' is not available
    next();
  },
};
```

Examples of **correct** code for this rule:

```js
export default {
  beforeRouteEnter(to, from, next) {
    // anything without `this`
  },
};
```

## Version

This rule was added in v1.37.0.
