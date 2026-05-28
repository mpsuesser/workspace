# Secrets and Variables (2026-05-11)

`Alchemy.Secret` and `Alchemy.Variable` collapse env-var wiring into a single line that's also a typed runtime accessor.

```ts
const apiKey = yield* Alchemy.Secret("OPENAI_API_KEY");
// ^? Output<Redacted<string>>
```

One yield does three things:
- Reads the value from the active `ConfigProvider` at deploy time
- Attaches it to the deploy target as the platform's secret binding (Cloudflare → `secret_text`, Lambda → encrypted env var)
- Hands back an accessor — `yield* apiKey` inside `fetch` resolves the value at runtime, typed as `Redacted<string>`

## One API, every runtime

```ts
// Cloudflare Worker
const apiKey = yield* Alchemy.Secret("OPENAI_API_KEY");

// AWS Lambda — exact same shape
const apiKey = yield* Alchemy.Secret("OPENAI_API_KEY");
```

Each provider routes to its native secret binding.

## `Alchemy.Variable` for non-secret values

Strings deploy as `plain_text`; everything else as JSON. Runtime accessor returns the original type.

```ts
const port = yield* Alchemy.Variable("PORT", 3000);
const flags = yield* Alchemy.Variable("FLAGS", { beta: true });

// In fetch
const p = yield* port;   // number — 3000
const f = yield* flags;  // { beta: true }
```

## Four input shapes

Both helpers accept:

```ts
Alchemy.Secret("API_KEY");                              // Config.redacted("API_KEY") default
Alchemy.Secret("API_KEY", "sk-123");                    // string literal
Alchemy.Secret("API_KEY", Effect.succeed("sk-123"));    // Effect<string | Redacted>
Alchemy.Secret("API_KEY", Config.string("OPENAI_KEY")); // Config<string | Redacted>
```

The binding name on the deploy target is always the first argument.

## See also

- [Guides › Secrets and env vars](../guides/secrets.md)
