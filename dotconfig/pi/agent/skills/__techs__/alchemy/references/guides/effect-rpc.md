# Effect RPC

Build a typed RPC API with Effect's `Rpc` module and deploy it as a Cloudflare Worker. Same wiring story as the [HTTP API guide](./effect-http-api.md) but with procedures instead of REST endpoints — and a fully typed client for free.

1. **Define schemas outside.** Domain types and tagged errors.
2. **Construct service inside Init.** `RpcGroup.toLayer` is pure construction.
3. **Return `{ fetch }`** — the `HttpEffect` produced by `RpcServer.toHttpEffect`.
4. **Bonus:** typed client via `RpcClient.make` using the same `RpcGroup` value.

## 1. Schemas

```ts
// src/task.ts
import * as Schema from "effect/Schema";

export class Task extends Schema.Class<Task>("Task")({
  id: Schema.String,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}

export class TaskNotFound extends Schema.TaggedClass<TaskNotFound>()(
  "TaskNotFound",
  { id: Schema.String },
) {}

export class CreateTaskFailed extends Schema.TaggedClass<CreateTaskFailed>()(
  "CreateTaskFailed",
  { message: Schema.String },
) {}
```

## 2. Declare the RPCs

```ts
// src/rpcs.ts
import * as Schema from "effect/Schema";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { Task, TaskNotFound, CreateTaskFailed } from "./task.ts";

const getTask = Rpc.make("getTask", {
  success: Task,
  error: TaskNotFound,
  payload: { id: Schema.String },
});

const createTask = Rpc.make("createTask", {
  success: Task,
  error: CreateTaskFailed,
  payload: { title: Schema.String },
});

export class TaskRpcs extends RpcGroup.make(getTask, createTask) {}
```

`TaskRpcs` is a value-level description. Nothing executes yet.

## 3. Build handlers in Init

`TaskRpcs.toLayer` builds a `Layer` — pure construction, safe in Init.

```ts
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const tasks = yield* Cloudflare.R2Bucket.bind(Tasks);

    const handlersLayer = TaskRpcs.toLayer({
      getTask: ({ id }) =>
        Effect.gen(function* () {
          const object = yield* tasks.get(id);
          if (!object) {
            return yield* Effect.fail(new TaskNotFound({ id }));
          }
          return Schema.decodeUnknownSync(Task)(
            JSON.parse(yield* object.text()),
          );
        }).pipe(Effect.orDie),

      createTask: ({ title }) =>
        Effect.gen(function* () {
          const task = new Task({
            id: crypto.randomUUID(),
            title,
            completed: false,
          });
          yield* tasks.put(task.id, JSON.stringify(task));
          return task;
        }).pipe(
          Effect.catchTag("R2Error", (error) =>
            Effect.fail(new CreateTaskFailed({ message: error.message })),
          ),
        ),
    });

    return {
      fetch: RpcServer.toHttpEffect(TaskRpcs).pipe(
        Effect.provide(handlersLayer),
        Effect.provide(RpcSerialization.layerJson),
      ),
    };
  }).pipe(Effect.provide(Cloudflare.R2BucketBindingLive)),
);
```

`getTask` uses `Effect.orDie` to turn unexpected R2 failures into 500s — `TaskNotFound` is the only client-visible error. `createTask` maps R2 failures into the declared `CreateTaskFailed` so the client can match on it.

RPC doesn't need `HttpPlatform.layer` or `Etag.layer` — the RPC server handles message framing internally.

## 4. Typed client

```ts
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http/FetchHttpClient";
import { TaskRpcs } from "../src/rpcs.ts";

const program = Effect.gen(function* () {
  const client = yield* RpcClient.make(TaskRpcs);
  const task = yield* client.createTask({ title: "Write docs" });
  const fetched = yield* client.getTask({ id: task.id });
});

Effect.runPromise(
  program.pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({
        url: process.env.TASK_RPC_URL!,
      }),
    ),
    Effect.provide(RpcSerialization.layerJson),
    Effect.provide(FetchHttpClient.layer),
  ),
);
```

`client.getTask` returns `Effect<Task, TaskNotFound>` — errors are typed values, not HTTP status codes.

## Streaming responses

Wrap `success` in `RpcSchema.Stream(item, error)` for procedures that emit multiple values. Pick a streaming-friendly serialization like `layerNdjson`.

```ts
import * as RpcSchema from "effect/unstable/rpc/RpcSchema";

const countTasks = Rpc.make("countTasks", {
  payload: { upto: Schema.Number },
  success: RpcSchema.Stream(Schema.Number, Schema.Never),
});

export class TaskRpcs extends RpcGroup.make(getTask, createTask, countTasks) {}
```

Handler returns a `Stream`:

```ts
import * as Stream from "effect/Stream";

countTasks: ({ upto }) =>
  Stream.fromIterable(Array.from({ length: upto }, (_, i) => i + 1)),
```

Provide `layerNdjson` instead of `layerJson`:

```ts
fetch: RpcServer.toHttpEffect(TaskRpcs).pipe(
  Effect.provide(handlersLayer),
  Effect.provide(RpcSerialization.layerNdjson),
),
```

Client consumes the stream with `Stream.runCollect`, `Stream.runForEach`, etc.

## Route to a Durable Object

Split RPCs into two groups: one the DO implements, one the Worker proxies.

```ts
export const InnerRpcs = RpcGroup.make(getTask, createTask);
export const DoRpcs = RpcGroup.make(
  Rpc.make("getTaskDO", {
    payload: { id: Schema.String },
    success: Task,
    error: TaskNotFound,
  }),
  Rpc.make("createTaskDO", {
    payload: { title: Schema.String },
    success: Task,
    error: CreateTaskFailed,
  }),
);

export class TaskRpcs extends InnerRpcs.merge(DoRpcs) {}
```

DO Init returns `{ fetch }` from `RpcServer.toHttpEffect(InnerRpcs)`:

```ts
export default class TasksObject extends Cloudflare.DurableObjectNamespace<TasksObject>()(
  "TasksObject",
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const state = yield* Cloudflare.DurableObjectState;
      const handlersLayer = InnerRpcs.toLayer({
        getTask: ({ id }) =>
          state.storage.get<Task>(id).pipe(
            Effect.flatMap((task) =>
              task ? Effect.succeed(task) : Effect.fail(new TaskNotFound({ id })),
            ),
          ),
        createTask: ({ title }) =>
          Effect.sync(() => new Task({ id: crypto.randomUUID(), title, completed: false }))
            .pipe(Effect.tap((task) => state.storage.put(task.id, task))),
      });
      return {
        fetch: RpcServer.toHttpEffect(InnerRpcs).pipe(
          Effect.provide(Layer.mergeAll(handlersLayer, RpcSerialization.layerNdjson)),
        ),
      };
    });
  }),
) {}
```

Bridge in the Worker via `Cloudflare.toHttpClient(stub)`:

```ts
const tasksDO = yield* TasksObject;

const makeDOClient = (id: string = "default") =>
  RpcClient.make(DoRpcs).pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({ url: "http://localhost" }).pipe(
        Layer.provide(
          Layer.succeed(
            HttpClient.HttpClient,
            Cloudflare.toHttpClient(tasksDO.getByName(id)),
          ),
        ),
        Layer.provide(RpcSerialization.layerNdjson),
      ),
    ),
  );
```

Proxy handlers:

```ts
const handlersLayer = TaskRpcs.toLayer({
  getTask: /* R2 implementation */,
  createTask: /* R2 implementation */,
  getTaskDO: (payload) =>
    makeDOClient().pipe(Effect.flatMap((client) => client.getTask(payload))),
  createTaskDO: (payload) =>
    makeDOClient().pipe(Effect.flatMap((client) => client.createTask(payload))),
});
```

For streaming RPCs use `Stream.unwrap`:

```ts
countTasksDO: (payload) =>
  Stream.unwrap(
    makeDOClient().pipe(Effect.map((client) => client.countTasks(payload))),
  ),
```

## HTTP API vs RPC

| | HTTP API | RPC |
|---|---|---|
| Style | REST endpoints | Procedures |
| Client | Any HTTP client | Typed client from same group value |
| Best for | Public APIs | Service-to-service |

You can combine them in the same Worker — HTTP API for external consumers, RPC for internal services.
