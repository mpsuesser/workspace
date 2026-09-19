# jsdoc/require-property-description

## What it does

Requires that all `@property` tags have descriptions.

### Why is this bad?

The description of a property should be documented.

### Examples

Examples of **incorrect** code for this rule:

```javascript
/**
 * @typedef {SomeType} SomeTypedef
 * @property {number} foo
 */
```

Examples of **correct** code for this rule:

```javascript
/**
 * @typedef {SomeType} SomeTypedef
 * @property {number} foo Foo.
 */
```

## Version

This rule was added in v0.2.18.
