# Shared database across stages

[Stages](../concepts/stages.md) make isolated copies of a stack cheap — per-developer, `pr-42`, `prod`. Most resources should be isolated. But some — a Neon Postgres project, a shared S3 bucket, a global rate limiter — are too expensive or stateful to re-provision per stage. PR-preview stages should *point at* the shared instance.

`Resource.ref(id, { stage })` reads a deployed resource's attributes from another stage of the same stack — typed, lazy, resolved at plan time against the persisted state store.

## The pattern: PR stages reference staging

Walkthrough: a Neon project owned by `staging`, with PR-preview stages (`pr-*`) referencing it instead of creating their own.

### Start with the unconditional version

Every stage gets its own project — wasteful for short-lived PR previews:

```ts
import * as Alchemy from "alchemy";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";

export const NeonDb = Effect.gen(function* () {
  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });
  const project = yield* Neon.Project("app-db", {
    region: "aws-us-east-1",
  });
  const branch = yield* Neon.Branch("app-branch", {
    project,
    migrationsDir: schema.out,
  });
  return { project, branch, schema };
});
```

Fine for `staging` and `prod`. Overkill for `pr-147`.

### Read the current stage

```ts
const { stage } = yield* Alchemy.Stack;
```

### Branch on stage with `Resource.ref`

Replace the unconditional `Neon.Project(...)` with a conditional:

```ts
const project = stage.startsWith("pr-")
  ? yield* Neon.Project.ref("app-db", { stage: "staging" })
  : yield* Neon.Project("app-db", {
      region: "aws-us-east-1",
    });
```

Three things to know about `Resource.ref`:

1. **Same logical ID.** `"app-db"` matches what `staging` uses to create the project. Lookup is keyed by `{ stack, stage, id }`.
2. **Typed.** `project` is `Neon.Project` either way — same attributes, same downstream API. The branch resource doesn't know or care that one stage's `project` is real and another's is a reference.
3. **Resolved at plan time.** Alchemy reads attributes from the staging stage's state file. If `staging` hasn't been deployed yet, plan fails with `InvalidReferenceError`.

Signature: `Resource.ref(id, { stage?: string, stack?: string })`. Both options default to the current stack and stage.

### Pass the reference downstream

Once `project` exists (real or referenced), the rest is identical. The branch creates per-stage:

```ts
const branch = yield* Neon.Branch("app-branch", {
  project,
  migrationsDir: schema.out,
});
```

Each PR stage gets its own ephemeral Neon branch off the shared project — copy-on-write and free.

### Complete file

```ts
import * as Alchemy from "alchemy";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";

export const NeonDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;
  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });
  const project = stage.startsWith("pr-")
    ? yield* Neon.Project.ref("app-db", { stage: "staging" })
    : yield* Neon.Project("app-db", {
        region: "aws-us-east-1",
      });
  const branch = yield* Neon.Branch("app-branch", {
    project,
    migrationsDir: schema.out,
  });
  return { project, branch, schema };
});
```

### Deploy order

Materialize the shared project first:

```sh
alchemy deploy --stage staging
```

PR stages can then reference it:

```sh
alchemy deploy --stage pr-147
```

Plan reads `staging`'s state, resolves `app-db` against it, and provisions only the per-stage `Neon.Branch`. Tearing down a PR stage with `alchemy destroy --stage pr-147` deletes the branch but leaves the shared project alone.

## Referencing across stacks

`Resource.ref` also takes a `stack` option:

```ts
const project = yield* Neon.Project.ref("app-db", {
  stack: "shared-infra",
  stage: "prod",
});
```

The lookup is `{ stack, stage, id }`.

## When to use which reference

| Goal | Use |
|---|---|
| Reference a single resource, same stack, different stage | `Resource.ref(id, { stage })` |
| Reference a single resource, different stack | `Resource.ref(id, { stack, stage })` |
| Reference an entire stack's outputs | `Backend.stage[name]` ([monorepo guide](./monorepo.md)) |
| Reference an arbitrary deployed Output | `Output.ref` ([outputs](../concepts/outputs.md)) |

All four resolve through the same state store — they differ in the shape they return.
