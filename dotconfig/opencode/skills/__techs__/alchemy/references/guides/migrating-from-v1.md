# Migrating from v1

Alchemy v1 uses `async/await` with top-level `await` for orchestration. v2 replaces this with Effect generators for type-safe error handling, composable retries, and declarative resource wiring.

Your existing `async fetch` handlers **do not need to change** — keep them as-is.

## Step 1: Replace the Stack

### v1

```ts
import alchemy from "alchemy";
import { Worker, R2Bucket } from "alchemy/cloudflare";

const app = await alchemy("my-app", {});

const bucket = await R2Bucket("bucket", {});

const worker = await Worker("worker", {
  entrypoint: "./src/worker.ts",
  bindings: { BUCKET: bucket },
});

console.log(worker.url);
await app.finalize();
```

### v2

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export const Bucket = Cloudflare.R2Bucket("Bucket");
export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  bindings: { Bucket },
});

export default Alchemy.Stack(
  "MyApp",
  { providers: Cloudflare.providers() },
  Effect.gen(function* () {
    const worker = yield* Worker;
    return { url: worker.url };
  }),
);
```

### Key differences

- `await alchemy("name")` + `await app.finalize()` → `Alchemy.Stack("name", { providers }, effect)`
- `await R2Bucket("name", {})` → `Cloudflare.R2Bucket("name")`
- `await Worker("name", { entrypoint })` → `Cloudflare.Worker("name", { main })`
- `entrypoint` renamed to `main`
- Resources declared at the top level, then `yield*`-ed inside the Stack
- No more `finalize()` — the Stack handles lifecycle automatically

## Step 2: Keep your async handler

The async style passes bindings as props and uses `Cloudflare.InferEnv` to type `env`:

```ts
export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  bindings: { Bucket },
});
```

Handler — just update the type import:

```ts
import type { WorkerEnv } from "../alchemy.run.ts";

export default {
  async fetch(request: Request, env: WorkerEnv) {
    const object = await env.Bucket.get("key");
    return new Response(object?.body ?? null);
  },
};
```

`Cloudflare.InferEnv` derives a fully typed `env` from `bindings` — type safety on binding names and APIs without using Effect in runtime code.

## Step 3: Deploy

```sh
alchemy deploy
alchemy destroy
```

v1 state is **not compatible** with v2. Destroy your v1 stack first, then deploy with v2.

## (Optional) Adopt Effect for runtime code

Switch to Effect-native Workers for typed errors, composable retries, and Effect's `HttpServer` integration.

Instead of `bindings` as props, bind resources in the Worker's Init phase:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Bucket } from "./bucket.ts";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const key = request.url.split("/").pop()!;
        const object = yield* bucket.get(key);
        return object
          ? HttpServerResponse.text(yield* object.text())
          : HttpServerResponse.text("Not found", { status: 404 });
      }),
    };
  }),
);
```

The Worker resource declaration moves from `alchemy.run.ts` into the Worker file (using `import.meta.path` as `main`), and the Stack just `yield*`-s the imported Worker:

```ts
import Worker from "./src/worker.ts";

export default Alchemy.Stack(
  "MyApp",
  { providers: Cloudflare.providers() },
  Effect.gen(function* () {
    const bucket = yield* Bucket;
    const worker = yield* Worker;
    return { url: worker.url };
  }),
);
```

## Quick reference

| | v1 (async) | v2 (async style) | v2 (Effect style) |
|---|---|---|---|
| Stack | `await alchemy("name")` | `Alchemy.Stack("name", ...)` | `Alchemy.Stack("name", ...)` |
| Resources | `await R2Bucket(...)` | `Cloudflare.R2Bucket(...)` | `Cloudflare.R2Bucket(...)` |
| Worker entry | `entrypoint` | `main` | `main: import.meta.path` |
| Bindings | `bindings: { KEY: resource }` | `bindings: { Key: resource }` | `yield* Resource.bind(ref)` |
| Runtime code | `async fetch(req, env)` | `async fetch(req, env)` | `Effect.gen(function* () { ... })` |
| Lifecycle | `await app.finalize()` | automatic | automatic |
| Type safety | runtime errors | typed `env` via `InferEnv` | full Effect type system |
