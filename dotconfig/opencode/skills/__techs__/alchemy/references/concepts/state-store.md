# State Store

Alchemy persists resource state between deploys so the next plan can diff desired state against current state.

## What's persisted

Each resource's state is keyed by fully qualified name (namespace + logical ID) and scoped by stack + stage. State includes:

- Resource type (e.g. `Cloudflare.R2Bucket`)
- Input properties
- Output attributes
- Instance ID
- Lifecycle status (`created`, `updating`, `deleting`, …)
- Bindings attached by policies and event sources

## Local state (default)

By default state is written to `.alchemy/` next to your code:

```
.alchemy/
  state/
    MyApp/
      dev_sam/
        Bucket.json
        Worker.json
```

Add `.alchemy/` to `.gitignore`. Local state works fine for solo development; each developer gets isolated state via their default stage (`dev_$USER`).

## Cloudflare state store

For teams and CI, configure a remote store:

```ts
Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () { /* ... */ }),
);
```

`Cloudflare.state()` persists state in a Worker backed by a Durable Object with embedded SQLite. The auth token and encryption key live in your account's Secrets Store.

### First-run bootstrap

The first deploy against a stack configured with `Cloudflare.state()` prompts before creating:

- **`Api`** — the state-store Worker (DO + SQLite, on `workers.dev`)
- **`AlchemyStateStoreToken`** — bearer token in Secrets Store
- **`StateStoreEncryptionKey`** — symmetric key for SQLite encryption at rest
- **`StateStoreSecrets`** — the Secrets Store scoped to your account
- **`StateStoreAuthTokenValue` / `StateStoreEncryptionKeyValue`** — generated random values

These resources are shared across every stack + stage on the account.

### Credentials

After bootstrap, the URL and bearer token are written to `~/.alchemy/<profile>/cloudflare-state-store.json`. On CI (`CI=true`), credentials are resolved from the Secrets Store on every run.

### Custom worker name

```ts
state: Cloudflare.state({ workerName: "alchemy-state-store-team-a" }),
```

## Lifecycle statuses

| Status | Meaning |
|---|---|
| `creating` | Create in progress |
| `created` | Resource exists and is healthy |
| `updating` | Update in progress |
| `updated` | Update succeeded |
| `deleting` | Delete in progress |
| `replacing` | Replacement in progress (new created, old pending delete) |

Intermediate statuses exist because state is persisted before cloud operations complete — they let alchemy recover after a crash.

## Custom state stores

A state store is an Effect `Layer` providing the `State` service. See [Writing a Custom State Store](../guides/custom-state-store.md) for the interface and a Postgres-backed walkthrough.

## In-memory state for tests

```ts
import * as TestState from "alchemy/Test/TestState";

const state = TestState.state({
  Bucket: { /* ... */ },
});
```

The test harness (`alchemy/Test/Bun` / `alchemy/Test/Vitest`) handles state setup automatically.
