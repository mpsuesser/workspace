# vitest/no-mocks-import

## What it does

This rule reports imports from a path containing a `__mocks__` component.

### Why is this bad?

Manually importing mocks from a `__mocks__` directory can lead to unexpected behavior
and breaks Jest's automatic mocking system. Jest is designed to automatically resolve
and use mocks from `__mocks__` directories when `jest.mock()` is called. Directly
importing from these directories bypasses Jest's module resolution system and can cause
inconsistencies between test and production environments.

### Examples

Examples of **incorrect** code for this rule:

```ts
import thing from "./__mocks__/index";
require("./__mocks__/index");
```

Examples of **correct** code for this rule:

```ts
import thing from "thing";
require("thing");
```

## Version

This rule was added in v0.0.13.
