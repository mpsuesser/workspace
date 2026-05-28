# Secrets and env vars

Take a secret like `OPENAI_API_KEY` from your shell or a `.env` file and make it available inside a Worker as a `secret_text` binding — without leaking it through plans, logs, or the Worker bundle.

For non-secret config, swap `Alchemy.Secret` for `Alchemy.Variable` — the binding ships as `plain_text` / `json` instead.

## Put the value somewhere `ConfigProvider` can find it

The CLI uses `ConfigProvider.fromEnv()` by default — an exported shell var or a `.env` file at the project root works:

```sh
# .env
OPENAI_API_KEY=sk-proj-...
```

You don't need to plumb `process.env` anywhere — `Alchemy.Secret` reads from `ConfigProvider` for you.

## Bind the secret on the Worker

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default Cloudflare.Worker(
  "Worker",
  { main: import.meta.path },
  Effect.gen(function* () {
    const apiKey = yield* Alchemy.Secret("OPENAI_API_KEY");
    return {
      fetch: Effect.gen(function* () {
        return HttpServerResponse.text("Hello, world!");
      }),
    };
  }),
);
```

The 1-arg form is sugar for `Alchemy.Secret("OPENAI_API_KEY", Config.redacted("OPENAI_API_KEY"))`. At deploy time Alchemy resolves the value, hands it to the Worker provider as a `Redacted<string>`, and the put-worker payload declares the binding as `type: "secret_text"`.

## Read the value at runtime

`apiKey` is an `Effect<Redacted<string>>` — an accessor. `yield*` it inside `fetch`, then unwrap with `Redacted.value` only at the call site that actually needs the string:

```ts
import * as Redacted from "effect/Redacted";

fetch: Effect.gen(function* () {
  const key = yield* apiKey;
  const response = yield* Effect.tryPromise(() =>
    fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${Redacted.value(key)}` },
    }),
  );
  return HttpServerResponse.text(yield* Effect.promise(() => response.text()));
}),
```

`Redacted` keeps the value out of logs and stack traces — the `Bearer …` string only exists inside the `fetch` call.

## Override the source

The 2-arg form replaces `Config.redacted(name)` with a custom source:

```ts
import * as Config from "effect/Config";

// Read from a differently-named env var
yield* Alchemy.Secret("OPENAI_API_KEY", Config.redacted("MY_OPENAI_KEY"));

// Pull from another resource's output
const stored = yield* Cloudflare.Secret("ApiKey", { store, value: /* ... */ });
yield* Alchemy.Secret("OPENAI_API_KEY", stored.value);

// Compute the value with an Effect
yield* Alchemy.Secret("OPENAI_API_KEY", Effect.gen(function* () {
  const raw = yield* fetchKeyFromVault();
  return Redacted.make(raw);
}));
```

The binding name on the Worker (the key the runtime reads) is always the first argument.

## Non-secret env vars

For values that are fine to ship as plain text, use `Alchemy.Variable`. Strings deploy as `plain_text`; everything else as `json`:

```ts
const host = yield* Alchemy.Variable("HOST", "api.openai.com");
const port = yield* Alchemy.Variable("PORT", 443);
const flags = yield* Alchemy.Variable("FLAGS", { beta: true });
```

Read with `yield* host` — no `Redacted.value` unwrap needed.

## Recap

- `OPENAI_API_KEY` read from `Config` at deploy time
- A `secret_text` binding deployed onto the Worker (no plain-text copy in the bundle, plan, or logs)
- A typed runtime accessor that returns `Redacted<string>`
