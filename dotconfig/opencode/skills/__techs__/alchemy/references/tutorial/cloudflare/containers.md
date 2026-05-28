# Run a Container

Some workloads need a long-lived process — a sandboxed shell, a database client, a binary you can't compile to wasm. In this part you'll add a **Cloudflare Container** that runs alongside a Durable Object instance, and call into it to execute shell commands.

## Declare the Sandbox class

Create `src/Sandbox.ts` with the bare class declaration. No methods yet — just the name and the entrypoint file:

```ts
import * as Cloudflare from "alchemy/Cloudflare";

export class Sandbox extends Cloudflare.Container<Sandbox>()(
  "Sandbox",
  { main: import.meta.filename },
) {}
```

The `Cloudflare.Container<Sandbox>()(...)` shape is the same ceremony as `DurableObjectNamespace` — the empty `()` lets TypeScript capture the class identity for the typed RPC stub.

## Add a typed interface

Pin the public RPC surface with a second type parameter. This is analogous to declaring an Effect `Context.Service` — the type lists every method callers can invoke, and the runtime implementation has to match:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import type { PlatformError } from "effect/PlatformError";

export class Sandbox extends Cloudflare.Container<
  Sandbox,
  {
    exec: (command: string) => Effect.Effect<
      { exitCode: number; stdout: string; stderr: string },
      PlatformError
    >;
  }
>()(
  "Sandbox",
  { main: import.meta.filename },
) {}
```

Once the interface is declared, anything that binds `Sandbox` sees `exec(command)` as a typed RPC method returning `Effect<{ exitCode, stdout, stderr }, PlatformError>`.

## Customize per stage

The container's deploy-time props can read the surrounding Stack through `Stack.useSync`. Use it to pick a beefier instance type in `prod` and the cheap `dev` instance everywhere else:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import type { PlatformError } from "effect/PlatformError";
import { Stack } from "alchemy/Stack";

export class Sandbox extends Cloudflare.Container<
  Sandbox,
  {
    exec: (command: string) => Effect.Effect<
      { exitCode: number; stdout: string; stderr: string },
      PlatformError
    >;
  }
>()(
  "Sandbox",
  Stack.useSync((stack) => ({
    main: import.meta.filename,
    instanceType: stack.stage === "prod" ? "standard-1" : "dev",
    observability: { logs: { enabled: true } },
  })),
) {}
```

`Stack.useSync` is the synchronous accessor for any data in the surrounding Effect context — handy for stack-level config like stage, app name, or anything else you'd want to vary per environment.

## Add the runtime file

The class above is just a typed identifier — it has no implementation yet. Containers always split the implementation into a **separate file** because the Durable Object that binds the container imports the class. If the runtime lived in the same file, the DO bundle would pull in process spawners, Node APIs, SDKs, etc. and Cloudflare Workers would reject it.

Create `src/Sandbox.runtime.ts` with an empty `.make()` shell:

```ts
import * as Effect from "effect/Effect";
import { Sandbox } from "./Sandbox.ts";

export const SandboxLive = Sandbox.make(
  Effect.gen(function* () {
    return Sandbox.of({
      // exec + fetch will go here
    });
  }),
);

export default SandboxLive;
```

`Sandbox.of(...)` is an identity function carrying the container's typed shape — it ensures your implementation matches the interface you declared on the class.

## Implement `exec` as an RPC method

Containers have **RPC methods** — the same pattern you used on the `Counter` Durable Object in [Add a Durable Object](./durable-objects.md). Anything you return from `Sandbox.of({ ... })` whose value is an `Effect` becomes a typed RPC method that callers can invoke through the typed handle.

```ts
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as ChildProcess from "effect/unstable/process/ChildProcess";
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import { Sandbox } from "./Sandbox.ts";

export const SandboxLive = Sandbox.make(
  Effect.gen(function* () {
    const cp = yield* ChildProcessSpawner;
    return Sandbox.of({
      exec: (command) =>
        cp
          .spawn(ChildProcess.make(command, { shell: true }))
          .pipe(
            Effect.flatMap((handle) =>
              Effect.all(
                [
                  handle.exitCode,
                  handle.stdout.pipe(Stream.decodeText, Stream.mkString),
                  handle.stderr.pipe(Stream.decodeText, Stream.mkString),
                ],
                { concurrency: "unbounded" },
              ),
            ),
            Effect.map(([exitCode, stdout, stderr]) => ({
              exitCode,
              stdout,
              stderr,
            })),
            Effect.scoped,
          ),
    });
  }),
);

export default SandboxLive;
```

The body shells out via Effect's `ChildProcessSpawner` and collects stdout/stderr/exit code, but the **shape** is what matters: a function returning an `Effect` becomes a typed RPC method.

## Add an HTTP handler

A container can also serve HTTP. Add a `fetch` field — Alchemy binds it to port `3000` inside the container by default, so any HTTP server you'd normally run inside Docker just works:

```ts
return Sandbox.of({
  exec: /* ... unchanged ... */,
  fetch: Effect.succeed(
    HttpServerResponse.text("Hello from the Sandbox container!"),
  ),
});
```

`fetch` and RPC methods like `exec` are independent — a caller decides which they want by either calling `getTcpPort(3000).fetch` (HTTP) or invoking `.exec(...)` directly (RPC).

## Bind the container from a Durable Object

Workers don't talk to containers directly — every container has a **Durable Object in front of it** that owns its lifecycle. Create `src/Agent.ts` with the bare DO shell that imports the `Sandbox` class:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Sandbox } from "./Sandbox.ts";

export default class Agent extends Cloudflare.DurableObjectNamespace<Agent>()(
  "Agents",
  Effect.gen(function* () {
    return Effect.gen(function* () {
      return {};
    });
  }),
) {}
```

Importing `Sandbox` (the class) does **not** pull in the runtime — that lives in `Sandbox.runtime.ts` and Rolldown tree-shakes it out.

## Bind the container in the outer phase

`Cloudflare.Container.bind(Sandbox)` registers the binding the same way `R2Bucket.bind` or `KVNamespace.bind` do. It belongs in the **outer** init phase — that runs once when the DO class is wired to its Worker. If you put it in the inner phase, every new DO instance would re-bind, which is wasteful and wrong.

```ts
Effect.gen(function* () {
  const sandbox = yield* Cloudflare.Container.bind(Sandbox);
  return Effect.gen(function* () {
    return {};
  });
}),
```

## Start the container per instance

`Cloudflare.start(sandbox)` ensures the container process is running for **this** DO instance, then hands you the typed shape you declared on the class. Add it to the **inner** init and wire the result up as an RPC method:

```ts
Effect.gen(function* () {
  const sandbox = yield* Cloudflare.Container.bind(Sandbox);
  return Effect.gen(function* () {
    const container = yield* Cloudflare.start(sandbox);
    return {
      exec: (command: string) => container.exec(command),
    };
  });
}),
```

The DO instance is now a thin RPC bridge: callers invoke `agent.exec(cmd)`, the DO forwards to `container.exec(cmd)`, and the captured stdout/stderr/exitCode flow back through the typed shape.

## Wire the Container into the Stack

The Container's `.make()` is the side-effect that registers the runtime — it has to be reachable from `alchemy.run.ts`. Provide `SandboxLive` to the Stack via `Effect.provide`:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import SandboxLive from "./src/Sandbox.runtime.ts";
import Worker from "./src/worker.ts";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const worker = yield* Worker;
    return { url: worker.url };
  }).pipe(Effect.provide(SandboxLive)),
);
```

The Worker binds `Agent` and exposes the `/sandbox/exec` route:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import Agent from "./Agent.ts";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const agents = yield* Agent;
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        if (request.url === "/sandbox/exec" && request.method === "POST") {
          const command = yield* request.text;
          const result = yield* agents
            .getByName("default")
            .exec(command)
            .pipe(Effect.orDie);
          return yield* HttpServerResponse.json(result);
        }
        return HttpServerResponse.text("Hello from my Worker!");
      }),
    };
  }),
);
```

The first deploy uploads the container image to Cloudflare and provisions the registry — expect it to take a minute or two longer than usual.

## Test it

```ts
test(
  "Sandbox container executes a shell command",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const response = yield* HttpClient.post(`${url}/sandbox/exec`, {
      body: HttpBody.text("echo hi"),
    });
    const body = yield* response.json;
    expect(body).toMatchObject({ stdout: "hi\n", exitCode: 0 });
  }),
  { timeout: 60_000 },
);
```

The first request boots the container (which takes a few seconds — hence the bumped timeout); subsequent requests reuse the warm instance until Cloudflare evicts it for inactivity.

## Bonus: HTTP requests against a container port

Containers can run any HTTP server. The `Sandbox.runtime.ts` above exposes `fetch` on port `3000` by default. Add a `hello` RPC method to `Agent.ts` that proxies to it via `getTcpPort`:

```ts
return {
  exec: (command: string) => container.exec(command),
  hello: () =>
    Effect.gen(function* () {
      const { fetch } = yield* container.getTcpPort(3000);
      const response = yield* fetch(
        HttpClientRequest.get("http://container/"),
      );
      return yield* response.text;
    }),
};
```

`getTcpPort(n)` returns a `Fetcher`-shaped object whose `fetch` method retries with backoff while the container is still booting, so you don't have to coordinate readiness yourself.

Next: [add a Workflow](./workflows.md) to orchestrate multi-step durable work that the container or DOs can trigger.
