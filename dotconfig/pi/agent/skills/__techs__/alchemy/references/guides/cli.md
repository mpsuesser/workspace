# CLI Reference

The Alchemy CLI operates on `alchemy.run.ts` (or a custom entrypoint) and targets a **stage** — an isolated environment.

```sh
alchemy <command> [file] [options]
```

If no file is specified, the CLI looks for `alchemy.run.ts` in the current directory.

## Common options

| Option | Description |
|---|---|
| `--stage <name>` | Stage to target. Defaults to `dev_$USER`. Must match `[a-z0-9][-_a-z0-9]*`. |
| `--env-file <path>` | Load environment variables from a file before running. |

## `deploy`

Compute a plan, ask for approval, create/update/delete resources to match desired state.

```sh
alchemy deploy [file] [options]
```

| Option | Description |
|---|---|
| `--stage <name>` | Stage to deploy to (defaults to `dev_$USER`) |
| `--yes` | Skip the approval prompt |
| `--dry-run` | Show the plan without applying (same as `alchemy plan`) |
| `--force` | Force updates for resources that would otherwise no-op |
| `--adopt` | Adopt pre-existing cloud resources that conflict (for re-import into a fresh state store) |
| `--profile <name>` | Auth profile (defaults to `default` or `$ALCHEMY_PROFILE`) |
| `--env-file <path>` | Load environment variables from a file |

### Adoption behavior

When a resource has no prior state, the engine calls the provider's `read`:

| `read` returns | Without `--adopt` | With `--adopt` |
|---|---|---|
| `undefined` | create | create |
| owned (plain attrs) | silent adopt | silent adopt |
| `Unowned(attrs)` | fail `OwnedBySomeoneElse` | take over (silently) |

"Owned" means the provider can prove the resource was created by this stack/stage/logical-id (typically via tags or naming). Recovering a wiped state for resources you already own is the default behavior — no flag required.

`--adopt` only matters when the provider reports a resource exists but isn't ours. By default Alchemy refuses to silently overwrite resources whose ownership can't be proven.

Programmatic enablement via `alchemy/AdoptPolicy`:

```ts
import { adopt } from "alchemy/AdoptPolicy";

yield* deploy(
  Effect.gen(function* () {
    yield* Cloudflare.Worker("API", { /* ... */ });
  }),
).pipe(adopt(true));
```

`AdoptPolicy` is consulted at plan time, so wrap the *deploy*, not the inner resource-declaration effect.

## `plan`

Preview what would change without applying. Equivalent to `alchemy deploy --dry-run`.

```sh
alchemy plan [file] [options]
```

`+` create, `~` update, `-` delete, `•` no-op.

## `destroy`

Delete every resource in a stack — plan with all resources marked for deletion, then apply in reverse dependency order.

```sh
alchemy destroy [file] [options]
```

| Option | Description |
|---|---|
| `--stage <name>` | Stage to destroy |
| `--yes` | Skip the approval prompt |
| `--dry-run` | Show what would be deleted without deleting |
| `--env-file <path>` | Load environment variables from a file |

## `dev`

Run your stack in development mode with hot reloading. Resources deploy to the cloud while Workers run locally in workerd.

```sh
alchemy dev [file] [options]
```

| Option | Description |
|---|---|
| `--stage <name>` | Stage to use (defaults to `dev_$USER`) |
| `--env-file <path>` | Load environment variables from a file |

## `tail`

Stream live logs from deployed resources.

```sh
alchemy tail [file] [options]
```

| Option | Description |
|---|---|
| `--stage <name>` | Stage to tail |
| `--filter <ids>` | Comma-separated logical resource IDs |
| `--env-file <path>` | Load environment variables from a file |

## `logs`

Fetch historical logs.

```sh
alchemy logs [file] [options]
```

| Option | Description |
|---|---|
| `--stage <name>` | Stage to fetch from |
| `--filter <ids>` | Comma-separated logical resource IDs |
| `--limit <n>` | Number of entries (default: 100) |
| `--since <time>` | Duration (`1h`, `30m`, `2d`) or ISO date |
| `--env-file <path>` | Load environment variables from a file |

## `aws bootstrap`

Set up the AWS assets bucket required for deploying Lambda functions and other AWS resources that need artifact storage.

```sh
alchemy aws bootstrap [options]
```

| Option | Description |
|---|---|
| `--profile <name>` | AWS profile (default: `default`) |
| `--region <region>` | AWS region (defaults to `AWS_REGION`) |
| `--destroy` | Destroy all bootstrap buckets in the selected region |
| `--env-file <path>` | Load environment variables from a file |

## `cloudflare bootstrap`

Manually deploy (or repair) the Cloudflare-hosted state store. Normally you don't need this — the first stack deploy that uses `Cloudflare.state(...)` prompts to bootstrap automatically.

```sh
alchemy cloudflare bootstrap [options]
```

| Option | Description |
|---|---|
| `--profile <name>` | Alchemy auth profile |
| `--force` | Force a full redeploy even if the worker already exists |
| `--worker-name <name>` | Override the default state-store worker name |
| `--env-file <path>` | Load environment variables from a file |

Behavior:
- If the worker already exists, it's **adopted**: the auth token is re-fetched via a short-lived edge-preview probe (the only way to read a Secrets Store value).
- If a previous run failed mid-flight, the leftover local state stack is detected and the deploy resumes.
- `--force` redeploys unconditionally; existing resources are reconciled in place (adoption is enabled automatically).

## `cloudflare state logs`

Get or tail logs from the `alchemy-state-store` Worker. Requires `workers_observability:read` and `workers_observability_telemetry:write` OAuth scopes — existing profiles need to re-run `alchemy login` to pick them up.

```sh
alchemy cloudflare state logs [options]
```

| Option | Description |
|---|---|
| `--tail` | Stream live |
| `--limit <n>` | Number of entries (default: 100) |
| `--since <time>` | Duration or ISO date |
| `--worker-name <name>` | Override default state-store worker name |
| `--profile <name>` | Alchemy auth profile |
| `--env-file <path>` | Load environment variables from a file |

## `login`

Walk each cloud provider used by your stack and write credentials to `~/.alchemy/profiles.json`, keyed by profile name.

```sh
alchemy login [file] [options]
```

| Option | Description |
|---|---|
| `--profile <name>` | Profile to write to |
| `--configure` | Re-run the provider's interactive configure step |
| `--stage <name>` | Stage used while loading the stack |
| `--env-file <path>` | Load environment variables from a file |

## `profile show`

Print configured credentials for a profile (redacted).

```sh
alchemy profile show [options]
```

| Option | Description |
|---|---|
| `--profile <name>` | Profile to show |
| `--env-file <path>` | Load environment variables from a file |

## `state`

Inspect and manage the state store.

```sh
alchemy state <subcommand> [options]
```

Common options for all subcommands:

| Option | Description |
|---|---|
| `--local` | Read from local `.alchemy/state` instead of configured store |
| `--stage <name>` | Stage used while loading the stack |
| `--profile <name>` | Auth profile |
| `--env-file <path>` | Load environment variables from a file |

### Subcommands

- **`state stacks [file]`** — List every stack name in the state store.
- **`state stages <stack> [file]`** — List stages under a stack.
- **`state resources <stack> <stage> [file]`** — List FQNs tracked under a stack/stage.
- **`state get <stack> <stage> <fqn> [file]`** — Print a resource's persisted state as JSON.
- **`state tree [file]`** — Render the entire state store as a tree.
- **`state clear [stack] [stage] [file]`** — Delete state entries. **Destructive but local-only** — cloud resources are not touched. Omit both args to clear all; pass `<stack>` for all stages under it; pass `<stack> <stage>` for a single stage. `--yes` skips confirmation.

## Stages

Every command targets a stage — an isolated instance of your stack. Defaults to `dev_$USER`. Resources are namespaced by stage, so environments never interfere.

```sh
alchemy deploy --stage prod
alchemy deploy --stage pr-42
alchemy destroy --stage dev_sam
```
