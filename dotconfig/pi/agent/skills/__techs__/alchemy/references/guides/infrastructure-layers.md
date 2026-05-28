# Building Infrastructure Layers

A [Layer](../concepts/layers.md) packages infrastructure behind a typed service. This guide builds a `JobService` backed by Cloudflare KV, plugs it into a Worker, and shows how to swap the backend without touching consumer code.

## 1. Define the service interface

```ts
import * as Alchemy from "alchemy";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export interface Job {
  id: string;
  status: "pending" | "done";
}

export class JobService extends Context.Service<
  JobService,
  {
    getJob(id: string): Effect.Effect<Job | null, never, Alchemy.RuntimeContext>;
    putJob(job: Job): Effect.Effect<void, never, Alchemy.RuntimeContext>;
  }
>()("JobService") {}
```

`Alchemy.RuntimeContext` on the return types marks these methods as runtime-only — the compiler rejects calls from deploy scripts.

## 2. Implement the Layer

`Layer.effect(Tag, effect)` says "to build the service identified by `Tag`, run this Effect":

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { JobService, type Job } from "./JobService.ts";

export const JobServiceKV = Layer.effect(
  JobService,
  Effect.gen(function* () {
    const Namespace = yield* Cloudflare.KVNamespace("Jobs");
    const kv = yield* Cloudflare.KVNamespaceBinding.bind(Namespace);
    return {
      getJob: Effect.fn(function* (id: string) {
        return yield* kv.get<Job>(id, "json");
      }),
      putJob: Effect.fn(function* (job: Job) {
        yield* kv.put(job.id, JSON.stringify(job));
      }),
    };
  }),
);
```

`Cloudflare.KVNamespace("Jobs")` is a real resource — yielding it inside the Layer attaches it to whichever Stack consumes the Layer. `KVNamespaceBinding.bind(Namespace)` wires the binding into the consuming Worker (binding name, IAM, env injection).

## 3. Consume the service in a Worker

```ts
import { JobService } from "./JobService.ts";
import { JobServiceKV } from "./JobService.KV.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const jobs = yield* JobService;
    return {
      fetch: Effect.gen(function* () {
        const job = yield* jobs.getJob("job-1");
        return yield* HttpServerResponse.json(job);
      }),
    };
  }).pipe(
    Effect.provide(
      JobServiceKV.pipe(Layer.provide(Cloudflare.KVNamespaceBindingLive)),
    ),
  ),
);
```

`Layer.provide` (inner) satisfies `JobServiceKV`'s dependency on `KVNamespaceBinding` privately, so the consumer only sees `JobService`. `KVNamespaceBindingLive` requires `WorkerEnvironment`, satisfied automatically by the Cloudflare Worker runtime at cold start.

## 4. Reuse across Workers

A Layer is just a value. Any Worker that provides `JobServiceKV` shares the same KV namespace, because `Cloudflare.KVNamespace("Jobs")` has a stable logical ID:

```ts
export default Cloudflare.Worker(
  "Admin",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const jobs = yield* JobService;
    // ...
  }).pipe(
    Effect.provide(
      JobServiceKV.pipe(Layer.provide(Cloudflare.KVNamespaceBindingLive)),
    ),
  ),
);
```

The Stack ends up with one `Jobs` KV namespace, bound to both `Api` and `Admin` with the correct env vars on each.

## See also

- [Layers](../concepts/layers.md)
- [Binding](../concepts/binding.md)
- [Phases](../concepts/phases.md)
- [Circular Bindings](./circular-bindings.md)
