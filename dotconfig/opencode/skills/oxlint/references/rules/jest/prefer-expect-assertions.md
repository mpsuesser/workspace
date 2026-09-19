# jest/prefer-expect-assertions

## What it does

Enforces that every test has either `expect.assertions(<number>)` or
`expect.hasAssertions()` as its first expression.

### Why is this bad?

Without explicit assertion counts, tests with asynchronous code,
callbacks, or loops may pass even if some `expect` calls are never
reached, silently hiding bugs.

### Examples

Examples of **incorrect** code for this rule:

```javascript
test("no assertions", () => {
  // ...
});
test("assertions not first", () => {
  expect(true).toBe(true);
  // ...
});
```

Examples of **correct** code for this rule:

```javascript
test("with assertion count", () => {
  expect.assertions(1);
  expect(true).toBe(true);
});
test("with hasAssertions", () => {
  expect.hasAssertions();
  expect(true).toBe(true);
});
```

///Examples of **incorrect** code with `{ "onlyFunctionsWithAsyncKeyword": true }`:

```javascript
test("fetches data", async () => {
  const data = await fetchData();
  expect(data).toBe("peanut butter");
});
```

Examples of **correct** code with `{ "onlyFunctionsWithAsyncKeyword": true }`:

```javascript
test("fetches data", async () => {
  expect.assertions(1);
  const data = await fetchData();
  expect(data).toBe("peanut butter");
});
```

Examples of **incorrect** code with `{ "onlyFunctionsWithExpectInLoop": true }`:

```javascript
test("all numbers are greater than zero", () => {
  for (const number of getNumbers()) {
    expect(number).toBeGreaterThan(0);
  }
});
```

Examples of **correct** code with `{ "onlyFunctionsWithExpectInLoop": true }`:

```javascript
test("all numbers are greater than zero", () => {
  expect.hasAssertions();
  for (const number of getNumbers()) {
    expect(number).toBeGreaterThan(0);
  }
});
```

Examples of **incorrect** code with `{ "onlyFunctionsWithExpectInCallback": true }`:

```javascript
test("callback test", () => {
  fetchData((data) => {
    expect(data).toBe("peanut butter");
  });
});
```

Examples of **correct** code with `{ "onlyFunctionsWithExpectInCallback": true }`:

```javascript
test("callback test", () => {
  expect.assertions(1);
  fetchData((data) => {
    expect(data).toBe("peanut butter");
  });
});
```

## Configuration

This rule accepts a configuration object with the following properties:

### onlyFunctionsWithAsyncKeyword

type: `boolean`

default: `false`

### onlyFunctionsWithExpectInCallback

type: `boolean`

default: `false`

### onlyFunctionsWithExpectInLoop

type: `boolean`

default: `false`

## Version

This rule was added in v1.62.0.
