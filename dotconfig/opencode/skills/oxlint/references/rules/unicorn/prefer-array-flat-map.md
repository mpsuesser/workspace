# unicorn/prefer-array-flat-map

## What it does

Prefers the use of `.flatMap()` when `map().flat()` are used together.

### Why is this bad?

It is slightly more efficient to use `.flatMap(…)` instead of `.map(…).flat()`.

### Examples

Examples of **incorrect** code for this rule:

```javascript
const bar = [1, 2, 3].map((i) => [i]).flat();
```

Examples of **correct** code for this rule:

```javascript
const bar = [1, 2, 3].flatMap((i) => [i]);
```

## Version

This rule was added in v0.0.14.
