# Writing a Custom State Store

A state store is an Effect `Layer` providing Alchemy's `State` service. Built-in stores (`localState()` on disk, `Cloudflare.state()` on Cloudflare) cover most cases, but you can back state with Postgres, S3, Redis, DynamoDB, etc.

This guide builds a Postgres-backed store. See [State Store](../concepts/state-store.md) for an overview of what's persisted.

## Scaffold the layer

A state store is a `Layer.Layer<State, never, R>` where `R` is any ambient services. Start with an empty `StateService`:

```ts
// src/postgres-state.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { State, type StateService } from "alchemy/State";

export interface PostgresStateProps {
  connectionString: string;
}

export const postgresState = (props: PostgresStateProps) =>
  Layer.scoped(State, makePostgresState(props));

const makePostgresState = (_props: PostgresStateProps) =>
  Effect.gen(function* () {
    const service: StateService = {
      listStacks: () => Effect.die("not implemented"),
      listStages: () => Effect.die("not implemented"),
      list: () => Effect.die("not implemented"),
      get: () => Effect.die("not implemented"),
      set: () => Effect.die("not implemented"),
      delete: () => Effect.die("not implemented"),
      deleteStack: () => Effect.die("not implemented"),
      getReplacedResources: () => Effect.die("not implemented"),
    };
    return service;
  });
```

## Connect to Postgres

Use `Layer.scoped` + `Effect.acquireRelease` so the connection is released on teardown.

```ts
import postgres from "postgres";

const makePostgresState = (props: PostgresStateProps) =>
  Effect.gen(function* () {
    const sql = yield* Effect.acquireRelease(
      Effect.sync(() => postgres(props.connectionString)),
      (sql) => Effect.promise(() => sql.end()),
    );

    yield* Effect.promise(
      () => sql`
        create table if not exists alchemy_state (
          stack text not null,
          stage text not null,
          fqn   text not null,
          value jsonb not null,
          primary key (stack, stage, fqn)
        )
      `,
    );

    // ... service methods ...
  });
```

## Implement `set` and `get`

Key things to know:

- Use `encodeState` / `reviveState` from `alchemy/State` when serializing — they handle `Secret`, `Date`, etc.
- Return `undefined` from `get` for missing rows. `StateStoreError` is for transport failures only.
- Map thrown errors through `StateStoreError`.

```ts
import { State, StateStoreError, encodeState, reviveState } from "alchemy/State";

const run = <A>(thunk: () => Promise<A>) =>
  Effect.tryPromise({
    try: thunk,
    catch: (cause) =>
      new StateStoreError({
        message: cause instanceof Error ? cause.message : String(cause),
        cause: cause instanceof Error ? cause : undefined,
      }),
  });

const service: StateService = {
  get: ({ stack, stage, fqn }) =>
    run(() => sql<{ value: string }[]>`
      select value::text from alchemy_state
      where stack = ${stack} and stage = ${stage} and fqn = ${fqn}
    `).pipe(
      Effect.map((rows) =>
        rows.length === 0 ? undefined : JSON.parse(rows[0].value, reviveState),
      ),
    ),

  set: ({ stack, stage, fqn, value }) =>
    run(() => sql`
      insert into alchemy_state (stack, stage, fqn, value)
      values (${stack}, ${stage}, ${fqn}, ${sql.json(encodeState(value))})
      on conflict (stack, stage, fqn)
      do update set value = excluded.value
    `).pipe(Effect.as(value)),

  // ... rest
};
```

## Implement listing

```ts
listStacks: () =>
  run(() => sql<{ stack: string }[]>`
    select distinct stack from alchemy_state order by stack
  `).pipe(Effect.map((rows) => rows.map((r) => r.stack))),

listStages: (stack) =>
  run(() => sql<{ stage: string }[]>`
    select distinct stage from alchemy_state
    where stack = ${stack} order by stage
  `).pipe(Effect.map((rows) => rows.map((r) => r.stage))),

list: ({ stack, stage }) =>
  run(() => sql<{ fqn: string }[]>`
    select fqn from alchemy_state
    where stack = ${stack} and stage = ${stage} order by fqn
  `).pipe(Effect.map((rows) => rows.map((r) => r.fqn))),
```

## Implement `delete` and `deleteStack`

```ts
delete: ({ stack, stage, fqn }) =>
  run(() => sql`
    delete from alchemy_state
    where stack = ${stack} and stage = ${stage} and fqn = ${fqn}
  `).pipe(Effect.asVoid),

deleteStack: ({ stack, stage }) =>
  run(() =>
    stage === undefined
      ? sql`delete from alchemy_state where stack = ${stack}`
      : sql`delete from alchemy_state where stack = ${stack} and stage = ${stage}`,
  ).pipe(Effect.asVoid),
```

## Implement `getReplacedResources`

When Alchemy replaces a resource, the old one is kept with `status: "replaced"` until destroy succeeds. `getReplacedResources` returns that backlog so the next deploy can finish cleanup.

```ts
getReplacedResources: ({ stack, stage }) =>
  run(() => sql<{ value: string }[]>`
    select value::text from alchemy_state
    where stack = ${stack}
      and stage = ${stage}
      and value->>'status' = 'replaced'
  `).pipe(
    Effect.map((rows) =>
      rows.map((r) => JSON.parse(r.value, reviveState)),
    ),
  ),
```

## Plug into a stack

```ts
import { postgresState } from "./src/postgres-state.ts";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: postgresState({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
  Effect.gen(function* () { /* resources */ }),
);
```

## Test the round-trip

```ts
import { State } from "alchemy/State";
import { postgresState } from "../src/postgres-state.ts";

const layer = postgresState({
  connectionString: process.env.TEST_DATABASE_URL!,
});

it("round-trips a resource", () =>
  Effect.gen(function* () {
    const state = yield* State;
    yield* state.set({
      stack: "Test",
      stage: "dev",
      fqn: "Bucket",
      value: {
        id: "Bucket",
        fqn: "Bucket",
        status: "created",
        kind: "Cloudflare.R2Bucket",
        props: { name: "my-bucket" },
        output: { name: "my-bucket" },
      } as any,
    });

    const got = yield* state.get({
      stack: "Test",
      stage: "dev",
      fqn: "Bucket",
    });
    expect(got?.id).toBe("Bucket");

    const fqns = yield* state.list({ stack: "Test", stage: "dev" });
    expect(fqns).toContain("Bucket");

    yield* state.deleteStack({ stack: "Test" });
    const after = yield* state.list({ stack: "Test", stage: "dev" });
    expect(after).toEqual([]);
  }).pipe(Effect.provide(layer), Effect.scoped, Effect.runPromise));
```

## Production notes

- **FQNs are arbitrary strings** that may contain `/`. If your backend uses FQNs in keys (filenames, S3 keys, Redis keys), use `encodeFqn` / `decodeFqn` from `alchemy/FQN`.
- **Concurrent writes happen** during a deploy as Alchemy applies resources in parallel. Your backend needs row-level (or equivalent) consistency on `(stack, stage, fqn)`.
- **State persists between deploys** — schema changes to `ResourceState` are effectively migrations. Be conservative with the encoded shape, and use `reviveState` so future Alchemy versions can deserialize what you wrote.

## Reference implementations

- [`LocalState.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/State/LocalState.ts) — filesystem-backed, simplest end-to-end example
- [`HttpStateStore.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/State/HttpStateStore.ts) — HTTP client against the Alchemy state API
- [`InMemoryState.ts`](https://github.com/sam-goodwin/alchemy-effect/blob/main/packages/alchemy/src/State/InMemoryState.ts) — minimal in-process map
