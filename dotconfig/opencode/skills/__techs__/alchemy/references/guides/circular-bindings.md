# Circular Bindings

Two Workers (or Lambdas, Containers) that call each other create a cycle: A needs B's URL, B needs A's URL. Alchemy resolves this by separating **identity** (a class used as a Tag) from **implementation** (a Layer attached via `.make()`).

## The pattern

Across the cycle, files import only the Tag — cheap and side-effect free. Each Worker's runtime implementation lives behind a `.make()` call evaluated only when the Stack provides it.

### `src/A.ts` — Tag + runtime that binds B

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { B } from "./B.ts";

export class A extends Cloudflare.Worker<A>()("A", {
  main: import.meta.path,
}) {}

export default A.make(
  Effect.gen(function* () {
    const b = yield* Cloudflare.Worker.bind(B);
    return {
      fetch: Effect.gen(function* () {
        return yield* b.fetch(new Request("https://b/work"));
      }),
    };
  }),
);
```

### `src/B.ts` — symmetric

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { A } from "./A.ts";

export class B extends Cloudflare.Worker<B>()("B", {
  main: import.meta.path,
}) {}

export default B.make(
  Effect.gen(function* () {
    const a = yield* Cloudflare.Worker.bind(A);
    return {
      fetch: Effect.gen(function* () {
        return yield* a.fetch(new Request("https://a/callback"));
      }),
    };
  }),
);
```

### Stack wires both Tags + both Layers

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import ALive, { A } from "./src/A.ts";
import BLive, { B } from "./src/B.ts";

export default Alchemy.Stack(
  "AB",
  { providers: Cloudflare.providers() },
  Effect.gen(function* () {
    const a = yield* A;
    const b = yield* B;
    return { aUrl: a.url, bUrl: b.url };
  }).pipe(Effect.provide(Layer.mergeAll(ALive, BLive))),
);
```

If either Layer is missing, TypeScript flags it at the `yield*` site.

## How Alchemy resolves the cycle

Alchemy plans the cycle in two passes:

1. Tags are registered up front so the graph knows A and B both exist.
2. Each provider's `precreate` hook reserves the resource (and its physical URL) without needing the other side's outputs.
3. `create` runs in parallel with deferred `Output<string>` placeholders for cross-references.
4. A converge pass calls `update` once both sides exist, wiring the real cross-references in.

The same pattern works for Lambda↔Lambda, Worker↔Container, or any mix of platforms.

## When you don't need this

If your services form a DAG (no cycles), keep declaration and implementation in one expression:

```ts
export default Cloudflare.Worker(
  "MyWorker",
  { main: import.meta.path },
  Effect.gen(function* () { /* ... */ }),
);
```

The tagged-class pattern only pays off when something else needs to reference the Worker before its implementation is in scope. For non-circular reuse across files, see [Layers](../concepts/layers.md).
