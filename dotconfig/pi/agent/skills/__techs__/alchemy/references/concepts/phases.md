# Phases

Alchemy programs run in two phases:

- **Plantime** — when you run `alchemy deploy`, `plan`, or `dev`. Builds the resource graph, calls providers, persists state.
- **Runtime** — inside a deployed Worker or Lambda. Runs for each request.

A Platform resource expresses both phases in one program by returning an Effect from inside an Effect:

```ts
Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    // ─── Init phase ───
    const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
    return {
      // ─── Runtime phase ───
      fetch: Effect.gen(function* () {
        const obj = yield* bucket.get("key");
        return HttpServerResponse.text(yield* obj.text());
      }),
    };
  }),
);
```

| Phase | Code | When it runs |
|---|---|---|
| Init | outer | At plantime **and** at cold start |
| Runtime | inner | Only inside a deployed handler |

The `bucket` value is established once during init and captured by the runtime closure. Init runs at most once per cold start; the runtime body runs per request with everything already wired up.

The runtime phase is the only place where `Alchemy.RuntimeContext` is available. Any Effect whose requirements include `RuntimeContext` can only execute inside the runtime closure — the type system rejects it everywhere else. See [Layers › Runtime as a colored function](./layers.md).

## Why two phases?

- At **plantime**, init runs to discover bindings — alchemy needs to know which resources the handler will use so it can wire permissions, env vars, and references.
- At **runtime cold start**, init runs again — this time inside the deployed Worker, where the same `bind()` calls return live SDK clients backed by the deployed resource.
- The **runtime body** only runs in the deployed handler. It never executes at plantime, so you can put real per-request work there without affecting deploy speed.

## The `ALCHEMY_PHASE` value

| Value | Context |
|---|---|
| `plan` | Default. Running `alchemy deploy` or `alchemy plan`. |
| `dev` | Running `alchemy dev` (local development with hot reload). |
| `runtime` | Running inside a deployed Worker or Lambda Function. |

Most user code never reads this directly — providers and [bindings](./binding.md) use it internally to behave differently across phases.

## `Binding.Service` vs `Binding.Policy`

A binding has two layers under the hood — and which one runs depends on the phase:

| Layer | Phase | Job |
|---|---|---|
| `Binding.Service` | Runtime | The lightweight typed SDK that ships with the bundle. |
| `Binding.Policy` | Plan | The deploy-time logic that emits IAM / env / config. |

At plantime the Policy layer is provided, so calling `bind()` records what the function will need. At runtime the Policy layer is absent — `bind()` returns just the Service wrapper. The runtime bundle stays small because none of the planning code is included.

This is also how alchemy lets you write `bucket.get(...)` inside a Worker without bundling AWS / Cloudflare provisioning code: provisioning lives in `Policy`, not `Service`.

## Why the split matters

The init/runtime split lets you write code that:

1. **Resolves infrastructure references at deploy time** — bindings know which bucket ARN, queue URL, etc. to inject.
2. **Initializes SDK clients once at cold start** — not on every request.
3. **Handles requests with a pre-configured context** — the `bucket` variable in the runtime body already knows which resource to talk to.

```ts
Effect.gen(function* () {
  // Init: runs once per cold start
  const bucket = yield* Cloudflare.R2Bucket.bind(Bucket);
  const kv = yield* Cloudflare.KVNamespace.bind(KV);
  return {
    // Runtime: runs per request
    fetch: Effect.gen(function* () {
      const obj = yield* bucket.get("key");
      // ...
    }),
  };
});
```

See [Binding](./binding.md) for the full mechanics of `.bind()`.
