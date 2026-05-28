# Effect HTTP API

Build a schema-validated HTTP API with Effect's `HttpApi` module and deploy it as a Cloudflare Worker. The mental model:

1. **Define schema + API outside the Worker.** Pure descriptions, importable by clients.
2. **Construct the service inside the Worker's Init phase.** Pure construction only — never `yield*` a running server.
3. **Return `{ fetch }`** where `fetch` is an `HttpEffect` produced by `HttpRouter.toHttpEffect`.
4. **Bonus:** the same `TaskApi` value drives a typed client via `HttpApiClient.make`.

## 1. Define the schema

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
```

`Schema.Class` gives a runtime-validated class with an inferred TS type. `Schema.TaggedClass` is a typed error you can return from handlers and discriminate on the client.

## 2. Declare the API

```ts
// src/api.ts
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import { Task, TaskNotFound } from "./task.ts";

const getTask = HttpApiEndpoint.get("getTask", "/:id", {
  success: Task,
  error: TaskNotFound,
});

const createTask = HttpApiEndpoint.post("createTask", "/", {
  success: Task,
  payload: Schema.Struct({
    title: Schema.String,
  }),
});

export class TasksGroup extends HttpApiGroup.make("Tasks")
  .add(getTask)
  .add(createTask) {}

export class TaskApi extends HttpApi.make("TaskApi").add(TasksGroup) {}
```

Nothing executes yet — `TaskApi` is a value-level description.

## 3. Bind storage in Init

```ts
// src/bucket.ts
export const Tasks = Cloudflare.R2Bucket("Tasks");
```

```ts
import { Tasks } from "./bucket.ts";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const tasks = yield* Cloudflare.R2Bucket.bind(Tasks);
    return {};
  }),
);
```

## 4. Build the handler group inside Init

`HttpApiBuilder.group` constructs a `Layer` — it doesn't run anything. Safe to call in Init.

```ts
const tasksGroup = HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
  handlers
    .handle("getTask", ({ path }) =>
      Effect.gen(function* () {
        const object = yield* tasks.get(path.id);
        if (!object) {
          return yield* Effect.fail(new TaskNotFound({ id: path.id }));
        }
        return Schema.decodeUnknownSync(Task)(
          JSON.parse(yield* object.text()),
        );
      }).pipe(Effect.orDie),
    )
    .handle("createTask", ({ payload }) =>
      Effect.gen(function* () {
        const task = new Task({
          id: crypto.randomUUID(),
          title: payload.title,
          completed: false,
        });
        yield* tasks.put(task.id, JSON.stringify(task));
        return task;
      }).pipe(Effect.orDie),
    ),
);
```

Each handler receives a typed request. Return type must match the endpoint's `success` or fail with the declared `error`. `Effect.orDie` converts unexpected R2 errors into defects (500s) so the typed error channel stays reserved for `TaskNotFound`.

## 5. Return `{ fetch }`

Assemble the layers and convert to an `HttpEffect`:

```ts
return {
  fetch: HttpApiBuilder.layer(TaskApi).pipe(
    Layer.provide(tasksGroup),
    Layer.provide([HttpPlatform.layer, Etag.layer]),
    HttpRouter.toHttpEffect,
  ),
};
```

## Add CORS

```ts
return {
  fetch: HttpApiBuilder.layer(TaskApi).pipe(
    Layer.provide(tasksGroup),
    Layer.provide([HttpPlatform.layer, Etag.layer]),
    Layer.provide(HttpRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })),
    HttpRouter.toHttpEffect,
  ),
};
```

CORS middleware wraps every response (including automatic `OPTIONS` preflight) with the configured headers.

## Complete worker.ts

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import { TaskApi } from "./api.ts";
import { Tasks } from "./bucket.ts";
import { Task, TaskNotFound } from "./task.ts";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const tasks = yield* Cloudflare.R2Bucket.bind(Tasks);

    const tasksGroup = HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
      handlers
        .handle("getTask", ({ path }) =>
          Effect.gen(function* () {
            const object = yield* tasks.get(path.id);
            if (!object) {
              return yield* Effect.fail(new TaskNotFound({ id: path.id }));
            }
            return Schema.decodeUnknownSync(Task)(
              JSON.parse(yield* object.text()),
            );
          }).pipe(Effect.orDie),
        )
        .handle("createTask", ({ payload }) =>
          Effect.gen(function* () {
            const task = new Task({
              id: crypto.randomUUID(),
              title: payload.title,
              completed: false,
            });
            yield* tasks.put(task.id, JSON.stringify(task));
            return task;
          }).pipe(Effect.orDie),
        ),
    );

    return {
      fetch: HttpApiBuilder.layer(TaskApi).pipe(
        Layer.provide(tasksGroup),
        Layer.provide([HttpPlatform.layer, Etag.layer]),
        HttpRouter.toHttpEffect,
      ),
    };
  }).pipe(Effect.provide(Cloudflare.R2BucketBindingLive)),
);
```

## Typed client

The same `TaskApi` value drives a fully typed client — no codegen.

```ts
import * as Effect from "effect/Effect";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import { TaskApi } from "../src/api.ts";

const program = Effect.gen(function* () {
  const client = yield* HttpApiClient.make(TaskApi, {
    baseUrl: process.env.TASK_API_URL!,
  });

  const created = yield* client.Tasks.createTask({
    payload: { title: "Write docs" },
  });

  const fetched = yield* client.Tasks.getTask({
    path: { id: created.id },
  });
});

Effect.runPromise(program);
```

`client.Tasks.getTask` returns `Effect<Task, TaskNotFound | HttpClientError>` — the `TaskNotFound` branch is a typed value you can pattern-match on.

## Route to a Durable Object

The same `HttpApi` machinery can run inside a Durable Object. The DO becomes a typed sub-API; the Worker proxies to it through a typed client.

Define a DO-side group and a Worker-side wrapper:

```ts
const getTaskDO = HttpApiEndpoint.get("getTaskDO", "/do/:id", {
  success: Task,
  error: TaskNotFound,
});
const createTaskDO = HttpApiEndpoint.post("createTaskDO", "/do", {
  success: Task,
  payload: Schema.Struct({ title: Schema.String }),
});

export class TasksGroup extends HttpApiGroup.make("Tasks")
  .add(getTask).add(createTask)
  .add(getTaskDO).add(createTaskDO) {}

export class TasksDOGroup extends HttpApiGroup.make("TasksDO")
  .add(getTask).add(createTask) {}

export class TaskDOApi extends HttpApi.make("TaskDOApi").add(TasksDOGroup) {}
```

DO implementation:

```ts
export default class TasksObject extends Cloudflare.DurableObjectNamespace<TasksObject>()(
  "TasksObject",
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const state = yield* Cloudflare.DurableObjectState;
      const tasksGroup = HttpApiBuilder.group(TaskDOApi, "TasksDO", (handlers) =>
        handlers
          .handle("getTask", ({ path }) =>
            state.storage.get<Task>(path.id).pipe(
              Effect.flatMap(decodeTask),
              Effect.orDie,
            ),
          )
          .handle("createTask", ({ payload }) => {
            const task = new Task({
              id: crypto.randomUUID(),
              title: payload.title,
              completed: false,
            });
            return state.storage.put(task.id, encodeTask(task)).pipe(Effect.as(task));
          }),
      );

      return {
        fetch: HttpApiBuilder.layer(TaskDOApi).pipe(
          Layer.provide(tasksGroup),
          HttpRouter.toHttpEffect,
        ),
      };
    });
  }),
) {}
```

Bridge in the Worker:

```ts
const tasksDO = yield* TasksObject;

const getTaskDOClient = (id: string = "default") =>
  HttpApiClient.makeWith(TaskDOApi, {
    baseUrl: "http://localhost",
    httpClient: Cloudflare.toHttpClient(tasksDO.getByName(id)),
  });
```

The `baseUrl` is irrelevant — requests never leave the isolate; the `httpClient` short-circuits straight to `tasksDO.getByName(id).fetch`.

Wire the proxy handlers:

```ts
.handle("getTaskDO", ({ path }) =>
  getTaskDOClient().pipe(
    Effect.flatMap((client) => client.TasksDO.getTask({ path })),
  ),
)
.handle("createTaskDO", ({ payload }) =>
  getTaskDOClient().pipe(
    Effect.flatMap((client) => client.TasksDO.createTask({ payload })),
  ),
)
```
