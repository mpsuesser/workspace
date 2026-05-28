# Add a Workflow

The `Sandbox` container handles long-lived compute, but sometimes you need to coordinate **many** steps that should outlive any single request — a checkout flow, a multi-stage data pipeline, a "send a reminder in 24 hours" job. That's what **Cloudflare Workflows** are for: durable, retryable, replayable task sequences with at-least-once delivery semantics. The example below broadcasts each task's progress back to the chat `Room` you built two parts ago.

## How a Workflow looks

The shape mirrors what you've seen for Workers and Durable Objects. The outer `Effect.gen` resolves shared dependencies; the returned `Effect.fn` is the workflow body — a typed function from an `input` payload to an Effect that the Cloudflare Workflows runtime steps through:

```ts
Effect.gen(function* () {
  // Phase 1: init — runs at deploy and once per workflow instance.
  const room = yield* Room;
  return Effect.fn(function* (input: { orderId: string }) {
    // Phase 2: workflow body — runs as durable steps.
    const result = yield* Cloudflare.task("process", doWork(input.orderId));
    yield* Cloudflare.sleep("cooldown", "10 seconds");
    return result;
  });
});
```

Each `task` call is a checkpoint. If the worker crashes mid-task, Cloudflare replays the workflow from the last completed task — your code is _not_ retried, the persisted result is.

## Create the workflow file

Create `src/NotifyWorkflow.ts` with a typed workflow body. The `Effect.fn` takes the `input` payload directly, so `notifier.create({ roomId, message })` is type-checked end to end — and the workflow's return value flows through to `instance.status().output`:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Room from "./room.ts";

export default class NotifyWorkflow extends Cloudflare.Workflow<NotifyWorkflow>()(
  "Notifier",
  Effect.gen(function* () {
    const rooms = yield* Room;
    return Effect.fn(function* (input: { roomId: string; message: string }) {
      const { roomId, message } = input;
      return { roomId, message };
    });
  }),
) {}
```

## Declare a KV namespace

Tasks need somewhere durable to read and write. Give the workflow a KV namespace by declaring it in its own file:

```ts
import * as Cloudflare from "alchemy/Cloudflare";

export const KV = Cloudflare.KVNamespace("KV");
```

`Cloudflare.KVNamespace("KV")` is just a description — Alchemy provisions the real namespace on the next deploy as soon as something binds to it.

## Bind KV to the workflow

`Cloudflare.KVNamespace.bind(KV)` belongs in the workflow's outer init phase. It registers the binding on the workflow's worker and returns a typed Effect-native client whose methods (`get`, `put`, `list`, `delete`) are Effects you can `yield*` directly:

```ts
Effect.gen(function* () {
  const rooms = yield* Room;
  const kv = yield* Cloudflare.KVNamespace.bind(KV);
  return Effect.fn(function* (input: { roomId: string; message: string }) {
    const { roomId, message } = input;
    return { roomId, message };
  });
}),
```

Yielding the binding in the outer init is a one-time setup — the inner workflow body closes over `kv` and uses it on every run.

## Wrap I/O in tasks

`Cloudflare.task("name", effect)` runs the inner Effect inside a Cloudflare workflow step — the result is checkpointed so a crash + replay returns the persisted value instead of re-running the side effect. Wrap **anything** that touches the outside world — HTTP calls, binding I/O, file writes — in a task:

```ts
return Effect.fn(function* (input: { roomId: string; message: string }) {
  const { roomId, message } = input;
  const stored = yield* Cloudflare.task(
    "kv-roundtrip",
    Effect.gen(function* () {
      const key = `workflow:${roomId}`;
      yield* kv.put(key, message);
      return yield* kv.get(key);
    }).pipe(Effect.orDie),
  );
  return { roomId, message: stored };
});
```

`task` automatically threads the binding's service requirement through, so `kv.put` / `kv.get` work directly inside the inner Effect with no extra plumbing.

## Broadcast to the chat room

Add another task that fans the stored value out to the matching `Room` instance:

```ts
const room = rooms.getByName(roomId);
yield* Cloudflare.task(
  "broadcast",
  room.broadcast(`[workflow] ${stored}`),
);
```

Calling the DO's `broadcast` RPC method from inside a `task` makes the message-send durable too — replays don't double-broadcast.

## Sleep between tasks

`Cloudflare.sleep("name", "2 seconds")` parks the workflow without billing for compute, then resumes at the requested time. Names are required because Cloudflare uses them as replay keys:

```ts
yield* Cloudflare.sleep("cooldown", "2 seconds");
yield* Cloudflare.task(
  "finalize",
  room.broadcast(`[workflow] complete for ${roomId}`),
);
return { roomId, message: stored };
```

After the cool-down the workflow broadcasts a "complete" message and finishes. The whole sequence — KV roundtrip → broadcast → sleep → broadcast → return — is durable end to end.

## Use a secret in a task

Most real workflows need credentials — an upstream API key, a signing token, etc. `Alchemy.Secret` registers a `secret_text` binding on the workflow at plantime and hands back an accessor for use inside steps:

```ts
import * as Alchemy from "alchemy";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";

export default class NotifyWorkflow extends Cloudflare.Workflow<NotifyWorkflow>()(
  "Notifier",
  Effect.gen(function* () {
    const rooms = yield* Room;
    const apiKey = yield* Alchemy.Secret("API_KEY");
    const kv = yield* Cloudflare.KVNamespace.bind(KV);
    return Effect.fn(function* (input: { roomId: string; message: string }) {
      const { roomId, message } = input;
      // ...
      const key = yield* apiKey;
      yield* Cloudflare.task(
        "fetch-with-auth",
        HttpClientRequest.get("https://example.com/data").pipe(
          HttpClientRequest.bearerToken(Redacted.value(key)),
          HttpClient.execute,
          Effect.flatMap((r) => r.text),
        ),
      );
      return { roomId, message };
    });
  }),
) {}
```

`Alchemy.Secret("API_KEY")` reads `API_KEY` from the active `Config` provider (env vars, `.env`, …) at plantime and binds it into the workflow as `secret_text`. `HttpClient.execute` runs inside `Cloudflare.task`, so the response is checkpointed and the request only fires once across replays. `Redacted.value` is called at the single header site that needs the cleartext; elsewhere the value stays redacted.

## Trigger from the Worker

A Workflow becomes a typed handle when you `yield*` it in the Worker's init phase. Use `create()` to start an instance and `get(id).status()` to poll it:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import NotifyWorkflow from "./NotifyWorkflow.ts";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const notifier = yield* NotifyWorkflow;
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        if (
          request.url.startsWith("/workflow/start/") &&
          request.method === "POST"
        ) {
          const roomId = request.url.split("/").pop()!;
          const instance = yield* notifier.create({
            roomId,
            message: "hello from workflow",
          });
          return yield* HttpServerResponse.json({ instanceId: instance.id });
        }
        if (request.url.startsWith("/workflow/status/")) {
          const instanceId = request.url.split("/").pop()!;
          const instance = yield* notifier.get(instanceId);
          const status = yield* instance.status();
          return yield* HttpServerResponse.json(status);
        }
        return HttpServerResponse.text("Hello from my Worker!");
      }),
    };
  }),
);
```

`notifier.create({ ... })` immediately returns an instance id — the workflow runs asynchronously on Cloudflare's side. `instance.status()` returns one of `"queued"`, `"running"`, `"paused"`, `"complete"`, or `"errored"` along with the `output` (what the body Effect returned) or `error`.

## Test the workflow

```ts
test(
  "Notifier workflow completes within 60s",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const roomId = `room-${Date.now()}`;
    const start = yield* HttpClient.post(`${url}/workflow/start/${roomId}`);
    const { instanceId } = (yield* start.json) as { instanceId: string };
    expect(instanceId).toBeString();
    const status = yield* HttpClient.get(
      `${url}/workflow/status/${instanceId}`,
    ).pipe(
      Effect.flatMap((res) => res.json),
      Effect.map((s) => s as { status: string }),
      Effect.repeat({
        schedule: Schedule.spaced("2 seconds"),
        until: (s) => s.status === "complete" || s.status === "errored",
      }),
      Effect.timeout("60 seconds"),
    );
    expect(status.status).toBe("complete");
  }),
  { timeout: 120_000 },
);
```

The polling loop should see the workflow transition through `running` and finish in `complete` within a few seconds.

Your app now spans a Worker, a Vite frontend, Durable Objects, hibernatable WebSockets, a Container, and a Workflow — all deploying from CI thanks to [Part 5](../part-5.md).
