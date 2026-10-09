# vitest/prefer-describe-function-title

## What it does

When testing a specific function, this rule aims to enforce passing a named function to `describe()`
instead of an equivalent hardcoded string.

### Why is this bad?

For tests that are related to a specific function, if the function being tested is renamed,
the describe title will no longer match and can cause confusion in the future. Using the function
directly ensures consistency even if the function is renamed.

### Examples

Examples of **incorrect** code for this rule:

```js
// myFunction.test.js
import { myFunction } from "./myFunction";

describe("myFunction", () => {
  // ...
});
```

Examples of **correct** code for this rule:

```js
// myFunction.test.js
import { myFunction } from "./myFunction";

describe(myFunction, () => {
  // ...
});
```

## Version

This rule was added in v1.39.0.
