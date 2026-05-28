# Platform

A **Platform** is a [Resource](./resource.md) that ships runtime code along with its infrastructure. Cloudflare Workers, AWS Lambda Functions, and Cloudflare Containers are all platforms. When you declare a platform you describe both:

- The cloud configuration (memory, region, compatibility flags…)
- The Effect that runs inside it

Both deploy together as one resource.

## A Worker, end to end

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Bucket } from "./bucket.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.path },
  Effect.gen(function* () {
    // Init: bind a resource. The binding is the typed SDK.
    const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
    return {
      // Runtime: per-request handler.
      fetch: Effect.gen(function* () {
        const obj = yield* bucket.get("hello.txt");
        return obj
          ? HttpServerResponse.text(yield* obj.text())
          : HttpServerResponse.text("Not found", { status: 404 });
      }),
    };
  }),
);
```

`bucket` is the resource itself, exposed as a typed SDK. No `env.BUCKET`, no environment variable wiring — the binding **is** the client.

## Bindings in action

`yield* SomeResource.bind(target)` does three things at once:

1. Records the binding on the platform's deploy plan
2. Generates any needed permissions/configuration
3. Returns a typed handle you call at runtime

```ts
const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
const kv = yield* Cloudflare.KVNamespace.bind(Sessions);

// Inside fetch:
yield* bucket.put("key", "value");
yield* kv.get("session-id");
```

Every binding obeys the same shape across providers — a Cloudflare R2 binding and an AWS S3 binding are interchangeable from the caller's point of view.

## Automatic IAM on AWS

On AWS, every binding maps to specific IAM actions on specific resources. Alchemy generates **least-privilege policies** scoped to exact resource ARNs:

```ts
export default AWS.Lambda.Function(
  "Api",
  { main: import.meta.path },
  Effect.gen(function* () {
    const getJob = yield* DynamoDB.GetItem.bind(JobsTable);
    const enqueue = yield* SQS.SendMessage.bind(JobQueue);
    return {
      fetch: Effect.gen(function* () {
        // The binding alone is enough — IAM is generated automatically.
        const job = yield* getJob({ Key: { id: { S: "abc" } } });
        yield* enqueue({ MessageBody: JSON.stringify(job) });
      }),
    };
  }),
);
```

The deployed function has exactly:

- `dynamodb:GetItem` on `JobsTable.tableArn`
- `sqs:SendMessage` on `JobQueue.queueArn`

…and nothing else. If you bind multiple tables to one operation, the generated policy enumerates each ARN explicitly rather than falling back to `Resource: "*"`. On Cloudflare, the same call records a Worker binding instead — the runtime API stays identical.

## Effect handlers vs async handlers

Platforms support two styles for the runtime code.

**Effect style** — handlers are Effects, with typed errors, composable retries, structured concurrency, and bindings resolved through Effect's context:

```ts
export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
    return {
      fetch: Effect.gen(function* () {
        /* ... */
      }),
    };
  }),
);
```

**Async style** — handlers are standard `async fetch` functions. Bindings are passed as `bindings: { ... }` props and typed via `InferEnv`:

```ts
export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  bindings: { Bucket },
});
```

```ts
import type { WorkerEnv } from "../alchemy.run.ts";
export default {
  async fetch(request: Request, env: WorkerEnv) {
    const object = await env.Bucket.get("key");
    return new Response(object?.body ?? null);
  },
};
```

Pick whichever fits your team. The Effect style unlocks [Layers](./layers.md), structured retries, and fine-grained testing; the async style integrates better with existing handler code.

For when init code runs vs when runtime code runs, see [Phases](./phases.md).
