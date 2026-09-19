# jsdoc/require-property-name

## What it does

Requires that all `@property` tags have names.

### Why is this bad?

The name of a property type should be documented.

### Examples

Examples of **incorrect** code for this rule:

```javascript
/**
 * @typedef {SomeType} SomeTypedef
 * @property {number}
 */
```

Examples of **correct** code for this rule:

```javascript
/**
 * @typedef {SomeType} SomeTypedef
 * @property {number} foo
 */
```

## Version

This rule was added in v0.2.18.
