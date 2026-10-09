# jsdoc/require-property

## What it does

Requires that all `@typedef` and `@namespace` tags have `@property` tags
when their type is a plain `object`, `Object`, or `PlainObject`.

Note: this rule can be configured via [jsdoc settings](../../generated-config.md#settings) option.

### Why is this bad?

Object type should have properties defined.

### Examples

Examples of **incorrect** code for this rule:

```javascript
/**
 * @typedef {Object} SomeTypedef
 */

/**
 * @namespace {Object} SomeNamespace
 */
```

Examples of **correct** code for this rule:

```javascript
/**
 * @typedef {Object} SomeTypedef
 * @property {SomeType} propName Prop description
 */

/**
 * @typedef {object} Foo
 * @property someProp
 */
```

## Version

This rule was added in v0.2.18.
