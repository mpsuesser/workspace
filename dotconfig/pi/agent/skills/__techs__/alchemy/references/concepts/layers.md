# Layers

A [Binding](./binding.md) connects one [Resource](./resource.md) to a [Platform](./platform.md). A **Layer** is the next abstraction up: a unit of encapsulated infrastructure. It owns whatever resources and bindings it needs, returns a typed implementation of a service interface, and hides everything behind that interface.

Layers make Alchemy code portable. A Worker written against an abstract `JobService` doesn't know whether its underlying storage is a KV namespace, a DynamoDB table, or an in-memory map — it depends on the *service*, and a Layer wires up the rest.

## The encapsulation problem

A straightforward Worker that serves jobs from a KV namespace might bind the KV directly:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const kv = yield* Cloudflare.KVNamespaceBinding.bind(MyKV);
    return {
      fetch: Effect.gen(function* () {
        const job = yield* kv.get<Job>("job-1", "json");
        return HttpServerResponse.json(job);
      }),
    };
  }),
);
```

The handler is welded to KV. Moving the data to DynamoDB or swapping in an in-memory fake for tests means rewriting `fetch` — not just the storage wiring.

## A service is a contract

A service is a `Context.Service` — a typed Tag that names a capability without saying how it's provided:

```ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Alchemy from "alchemy";

export class JobService extends Context.Service<
  JobService,
  {
    getJob(id: string): Effect.Effect<Job, JobError, Alchemy.RuntimeContext>;
  }
>()("JobService") {}
```

A consumer writes `yield* JobService` and gets the typed object — nothing else.

## A Layer encapsulates the infrastructure

A Layer is the implementation side of a service. It declares the resources it needs, wires up bindings, and returns the typed value:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const JobServiceKV = Layer.effect(
  JobService,
  Effect.gen(function* () {
    const MyKV = yield* Cloudflare.KVNamespace("MyKV");
    const kv = yield* Cloudflare.KVNamespaceBinding.bind(MyKV);
    return {
      getJob: Effect.fn(function* (id: string) {
        return yield* kv.get<Job>(id, "json");
      }),
    };
  }),
);
```

Three things happen in one expression:

1. **The KV namespace is a real resource.** It joins the [Stack](./stack.md), goes through plan/create/update like anything else.
2. **The binding is wired** — `KVNamespaceBinding.bind(MyKV)` attaches the KV namespace to whichever Worker eventually consumes this Layer.
3. **A typed `JobService` is returned.** Callers see only `getJob`.

## Cloud-agnostic consumers

A Worker depends on `JobService` and provides a Layer to satisfy it:

```ts
export default Cloudflare.Worker(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const jobs = yield* JobService;
    return {
      fetch: Effect.gen(function* () {
        return yield* jobs.getJob("job-1");
      }),
    };
  }).pipe(Effect.provide(JobServiceKV)),
);
```

The handler never mentions KV. Swapping the implementation is a one-line change:

```ts
.pipe(Effect.provide(JobServiceDynamo))
```

The next deploy tears down the KV namespace and creates whatever `JobServiceDynamo` declares. The handler is untouched.

## Where runtime requirements live

A KV-direct handler has `fetch` typed roughly:

```
Effect.Effect<Response, KVNamespaceError, Alchemy.RuntimeContext>
```

The KV-specific error and the implicit dependence on a Cloudflare binding both leak into the handler's signature. The Layer-wrapped equivalent collapses to:

```
Effect.Effect<Response, JobError, Alchemy.RuntimeContext>
```

The Cloudflare-specific surface is gone — absorbed by the Layer:

```ts
export const KVNamespaceBindingLive = Layer.effect(
  KVNamespaceBinding,
  Effect.gen(function* () {
    const env = yield* WorkerEnvironment; // ← required here, once
    // ...returns a client that closes over env
  }),
);
```

The Worker that consumes `KVNamespaceBindingLive` satisfies `WorkerEnvironment` in one place; downstream callers see only `RuntimeContext`. Try the swap on a Cloudflare Worker with an AWS implementation:

```ts
.pipe(Effect.provide(JobServiceKV))         // requires WorkerEnvironment ✓
.pipe(Effect.provide(JobServiceDynamo))     // requires AWS.FunctionEnvironment ✗
```

The Cloudflare Worker can't satisfy `AWS.FunctionEnvironment`, so the program won't type-check. Platforms and Layers fit together by type, not by convention.

## Runtime as a colored function

A Platform program has two [phases](./phases.md): the init closure (outer) runs at both plantime and cold start, and the runtime closure (inner) runs only inside the deployed handler. Bindings live in init; cloud calls live in runtime:

```ts
Cloudflare.Worker(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    // ─── Init: declare dependencies ───
    const kv = yield* Cloudflare.KVNamespaceBinding.bind(MyKV);
    return {
      // ─── Runtime: use them ───
      fetch: Effect.gen(function* () {
        return yield* kv.get<Job>("job-1", "json");
      }),
    };
  }),
);
```

`Alchemy.RuntimeContext` is the Effect service that exists only inside the runtime closure. So an Effect like:

```
kv.get(...): Effect.Effect<Job | null, KVNamespaceError, Alchemy.RuntimeContext>
```

is one the type system guarantees can only run in the runtime phase. Move that call up into the init closure and the type checker rejects it — `RuntimeContext` is not satisfied there.

You can think of it as a "color" — TypeScript doesn't have keyword-level coloring, so Alchemy encodes the color as an Effect requirement. The compiler enforces the init/runtime boundary for you.

## Composing multiple Layers

A typical app stack mixes several Layers, one per capability:

```ts
.pipe(
  Effect.provide(Layer.mergeAll(
    JobServiceKV,         // provides JobService
    BetterAuthD1,         // provides BetterAuth
    RateLimiterDurable,   // provides RateLimiter
  )),
)
```

Each Layer brings its own resources into the Stack and its own typed service into scope.

| Combinator | Use it for |
|---|---|
| `Layer.mergeAll(a, b)` | Provide multiple independent services |
| `Layer.provideMerge` | A Layer that supplies *and* exposes a service |
| `Layer.provide` | Satisfy one Layer's dependencies privately from another |

For the step-by-step of building one yourself, see [Building Infrastructure Layers](../guides/infrastructure-layers.md).

## What you can do with Layers

Because Layers are normal Effect Layers, the patterns scale all the way out:

- **Distribute on npm.** A service is just a TypeScript module exporting a `Context.Service` and one or more Layers. Publish `@org/jobs`, `npm install` it, `Effect.provide` it.
- **Substitute for tests.** Provide a `JobServiceMemory` Layer backed by a `Map`; the Worker under test never knows.
- **Migrate without rewrites.** Moving from KV to DynamoDB is a Layer swap, not a Worker rewrite.
- **Type-safe portability.** Cloud-specific requirements are confined to Layer construction; the consumer-facing surface speaks only `RuntimeContext`.
