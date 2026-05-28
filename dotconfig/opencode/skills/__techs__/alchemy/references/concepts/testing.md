# Testing

`alchemy/Test/Bun` and `alchemy/Test/Vitest` provide an Effect-aware test harness for both runners.

## What `Test.make` returns

```ts
const { test, beforeAll, beforeEach, afterAll, afterEach, deploy, destroy } =
  Test.make({
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  });
```

| Helper | Purpose |
|---|---|
| `test(name, effect)` | Effect-aware test. `HttpClient` and your providers Layer are in scope. |
| `test.skip` / `test.skipIf` / `test.only` / `test.todo` | Skip/focus/todo modifiers. |
| `test.provider(name, fn)` | Provider-lifecycle test against a scratch in-memory stack. |
| `beforeAll(effect)` | Run an Effect once. Returns a lazy accessor (`yield* result`). |
| `beforeEach(effect)` | Run an Effect before every test. |
| `afterAll(effect)` / `afterAll.skipIf(predicate)` | Cleanup hook with conditional teardown. |
| `afterEach(effect)` | Run an Effect after every test. |
| `deploy(Stack, opts?)` | Plan + apply a stack, resolve to its outputs. |
| `destroy(Stack, opts?)` | Plan + apply against an empty desired state. |

`expect` (and `describe`) come from the underlying runner — `bun:test` or `@effect/vitest` — directly.

## `Test.make` options

```ts
Test.make({
  providers,   // required
  state,       // optional
  profile,     // optional
  stage,       // optional
});
```

### `providers` (required)

The provider Layer that resolves resource implementations. Usually the same one your `Stack` uses:

```ts
providers: Cloudflare.providers(),
// or merge multiple:
providers: Layer.mergeAll(Cloudflare.providers(), Stripe.providers()),
```

Credentials resolve through the same `AuthProviders` registry as `alchemy deploy`.

### `state`

The state store used by top-level `deploy(Stack)` and `destroy(Stack)` (not by `test.provider`). Defaults to `localState()`.

```ts
state: Cloudflare.state(),                       // R2-backed, survives across CI runners
state: localState({ path: ".alchemy-test/" }),   // separate dir
state: undefined,                                 // omit → defaults to localState()
```

A persistent state lets `deploy(Stack)` skip recreating unchanged resources between runs.

### `profile`

Override `ALCHEMY_PROFILE` for this file only:

```ts
Test.make({
  providers: AWS.providers(),
  profile: "test-sandbox",
});
```

### `stage`

Default stage for `deploy(Stack)` / `destroy(Stack)`. Defaults to `"test"`. Override per file or per call:

```ts
Test.make({ providers, stage: "ci-pr-42" });
// or per-call:
beforeAll(deploy(Stack, { stage: "ci-pr-42" }));
afterAll.skipIf(!process.env.CI)(destroy(Stack, { stage: "ci-pr-42" }));
```

## Hooks

### `beforeAll(effect) → Effect.Effect<A>`

Runs the Effect once before any test in the file. Stores the result and returns a lazy accessor — `yield* accessor` inside any test returns the resolved value:

```ts
const stack = beforeAll(deploy(Stack));
const seed = beforeAll(Effect.gen(function* () {
  yield* DynamoDB.putItem({ /* ... */ });
  return Date.now();
}));

test(
  "uses both",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const startedAt = yield* seed;
    /* ... */
  }),
);
```

Default timeout is **120s**. Override with the second argument:

```ts
beforeAll(deploy(Stack), { timeout: 300_000 });
```

### `beforeEach(effect)`

Runs the Effect before every test. No accessor returned — for side-effect setup only.

### `afterAll(effect)` and `afterAll.skipIf(predicate)`

```ts
afterAll(destroy(Stack));                          // always destroy
afterAll.skipIf(!process.env.CI)(destroy(Stack));  // CI only
afterAll.skipIf(true)(destroy(Stack));             // never (debugging)
```

`afterAll.skipIf(true)` short-circuits without registering a hook at all.

### `afterEach(effect)`

Runs after every test. Combine with `beforeEach` for test-isolated fixtures.

## Test modifiers

```ts
test.skip("not ready yet", Effect.gen(function* () { /* ... */ }));
test.skipIf(process.env.CI)(
  "local-only smoke test",
  Effect.gen(function* () { /* ... */ }),
);
test.only(
  "the one I'm debugging",
  Effect.gen(function* () { /* ... */ }),
);
test.todo("backfill once R2 has multipart helper");
```

`test.provider` mirrors the same shape (`test.provider.skip`, `test.provider.skipIf(...)`).

## `HttpClient` in scope

`HttpClient` is wired into every `test` Effect:

```ts
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpBody from "effect/unstable/http/HttpBody";

test(
  "PUT and GET round-trip",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const put = yield* HttpClient.put(`${url}/k`, {
      body: HttpBody.text("hello"),
    });
    expect(put.status).toBe(201);
    const get = yield* HttpClient.get(`${url}/k`);
    expect(yield* get.text).toBe("hello");
  }),
);
```

The implementation comes from `effect/unstable/http/FetchHttpClient`.

## `test.provider` for provider-lifecycle tests

`test.provider(name, (stack) => effect)` builds a scratch stack with a private in-memory state store, isolated from `.alchemy/` and sibling tests. Use it to exercise create/update/replace/delete paths of a provider:

```ts
test.provider(
  "create, update, delete",
  (stack) => Effect.gen(function* () {
    // create
    const v1 = yield* stack.deploy(
      Effect.gen(function* () {
        return yield* MyResource("Test", { name: "v1" });
      }),
    );
    // update — same logical ID, new inputs
    const v2 = yield* stack.deploy(
      Effect.gen(function* () {
        return yield* MyResource("Test", { name: "v2" });
      }),
    );
    expect(v2.id).toBe(v1.id);
    // destroy
    yield* stack.destroy();
  }),
);
```

Inside the test body the configured `providers` Layer is already in scope, so SDK calls (`DynamoDB.describeTable`, `stripe.products.retrieve`, …) work without extra setup.

### Scratch state vs persistent state

| | `test` + `deploy(Stack)` | `test.provider` |
|---|---|---|
| State store | `state` option (default `localState()`) | private in-memory, per test |
| Survives runs | yes | no |
| Use case | end-to-end against a real stack | provider unit tests |

## Bun and Vitest adapters

Both adapters expose the same API:

```ts
// Bun
import * as Test from "alchemy/Test/Bun";
import { expect } from "bun:test";

// Vitest
import * as Test from "alchemy/Test/Vitest";
import { expect } from "@effect/vitest";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  state: Cloudflare.state(),
});
```

- **Bun** uses `bun:test` directly. Every `test(...)` becomes a `bun.test(...)` wrapped with `Effect.runPromise`.
- **Vitest** uses `@effect/vitest`'s `it.live`. Default hook timeout is the same (120s).

## Running against an existing deployed stack

`afterAll.skipIf(!process.env.CI)(destroy(Stack))` is the default pattern. To skip the deploy too (you've already run `alchemy deploy` manually and just want to hit the live URL), promote the outputs into `beforeAll`:

```ts
const stack = beforeAll(
  process.env.SKIP_DEPLOY
    ? Effect.succeed({ url: process.env.STACK_URL! })
    : deploy(Stack),
);
```

To share a deployed stack across multiple test files, use a remote state store (`Cloudflare.state()` / S3-backed) and the same `stage` in every file's `Test.make`.

## Further reading

- [Tutorial Part 3](../tutorial/part-3.md) — your first integration test, walked through.
- [Build a custom provider](../guides/custom-provider.md) — including a full `test.provider` example.
- [State store](./state-store.md)
- [Profiles](./profiles.md)
