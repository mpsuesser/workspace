# vitest/hoisted-apis-on-top

## What it does

Requires [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) Vitest APIs
(`vi.mock`, `vi.unmock`, and `vi.hoisted`) to appear in the top-level of the file.

### Why is this bad?

Vitest hoists certain APIs to the top of the file during transformation, so they always
run before any imports — regardless of where they appear in the source. Writing them
inside conditionals, test bodies, or other runtime locations can be misleading and confusing.

The code looks like it executes at runtime, but it actually runs first. This rule ensures
that these hoisted APIs are not allowed in confusing contexts.

### Examples

Examples of **incorrect** code for this rule:

```js
if (condition) {
  vi.mock("some-module", () => {});
}
```

```js
if (condition) {
  vi.unmock("some-module", () => {});
}
```

```js
if (condition) {
  vi.hoisted(() => {});
}
```

```js
describe("suite", () => {
  it("test", async () => {
    vi.mock("some-module", () => {});

    const sm = await import("some-module");
  });
});
```

Examples of **correct** code for this rule:

```js
if (condition) {
  vi.doMock("some-module", () => {});
}
```

```js
vi.mock("some-module", () => {});
if (condition) {
}
```

```js
vi.unmock("some-module", () => {});
if (condition) {
}
```

```js
vi.hoisted(() => {});
if (condition) {
}
```

```js
vi.mock("some-module", () => {});

describe("suite", () => {
  it("test", async () => {
    const sm = await import("some-module");
  });
});
```

## Version

This rule was added in v1.39.0.
