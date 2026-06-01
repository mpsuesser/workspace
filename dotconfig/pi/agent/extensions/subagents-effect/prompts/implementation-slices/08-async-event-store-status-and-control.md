# Slice 08: Async event store, status projection, control monitor, nested runs, intercom

Read `00-global-rules.md` first.

## Goal

Implement background runs as event-sourced workflows. Status should be a projection over persisted typed `RunEvent` records, not the contents of mutable in-memory maps.

## Create

- `src/services/async-run-store.ts`
- `src/services/async-supervisor.ts`
- `src/services/run-status-projection.ts`
- `src/services/control-monitor.ts`
- `src/services/nested-run-registry.ts`
- `src/services/intercom-gateway.ts`
- tests under `test/services/async-run-store.test.ts`
- tests under `test/services/run-status-projection.test.ts`
- tests under `test/services/control-monitor.test.ts`

## Behavioral references

- `../subagents/src/runs/background/async-execution.ts`
- `../subagents/src/runs/background/async-job-tracker.ts`
- `../subagents/src/runs/background/async-status.ts`
- `../subagents/src/runs/background/result-watcher.ts`
- `../subagents/src/runs/background/run-id-resolver.ts`
- `../subagents/src/runs/background/stale-run-reconciler.ts`
- `../subagents/src/runs/shared/subagent-control.ts`
- `../subagents/src/runs/shared/nested-events.ts`
- `../subagents/src/intercom/intercom-bridge.ts`
- `../subagents/src/intercom/result-intercom.ts`

## `AsyncRunStore`

Service interface suggestion:

```ts
readonly append: (event: RunEvent) => Effect.Effect<void, RunStoreError>;
readonly readEvents: (runId: RunId) => Effect.Effect<ReadonlyArray<RunEvent>, RunStoreError>;
readonly status: (runId: RunId) => Effect.Effect<RunStatus, RunStoreError | AsyncRunNotFound>;
readonly list: (filter: RunListFilter) => Effect.Effect<ReadonlyArray<RunStatus>, RunStoreError>;
readonly resolveIdPrefix: (prefix: string) => Effect.Effect<RunId, RunStoreError | AsyncRunNotFound | AmbiguousRunId>;
```

Responsibilities:

- append typed JSONL run events
- read/decode event logs
- list known runs
- resolve id prefixes safely
- never treat malformed event logs as success; surface typed errors with path context

## `RunStatusProjection`

Pure module/service that folds `ReadonlyArray<RunEvent>` into `RunStatus`.

Responsibilities:

- reconstruct mode, state, current step, child statuses
- calculate usage/tokens/tool counts from observed child events/results
- surface paused/failed/completed/detached states
- include workflow graph/nested summaries when events contain them

This should have extensive pure tests.

## `AsyncSupervisor`

Responsibilities:

- start a background workflow from a `WorkflowPlan`
- append `RunCreated`, step events, and `RunFinished`
- call `WorkflowRunner` or a background-compatible runner path
- reconcile stale runs on extension startup/reload
- expose interrupt/resume hooks where possible

Avoid daemon-like unmanaged fibers. Use scoped runtime ownership and explicit finalizers.

## `ControlMonitor`

Responsibilities:

- derive `active_long_running` and `needs_attention` from:
  - last activity time
  - active tool duration
  - turn count threshold
  - token threshold
  - repeated mutating tool failures
- use `Clock` and `Duration`, not `Date.now` or number milliseconds in domain logic
- dedupe notifications with typed keys
- emit `ControlNoticeEmitted` run events
- route notifications to configured channels

## `NestedRunRegistry`

Responsibilities:

- model nested fanout routes and capability tokens
- record nested child event/control files if still needed
- project nested runs into parent status
- keep depth/max-depth policy explicit

## `IntercomGateway`

Optional capability.

Responsibilities:

- detect/resolve intercom bridge availability
- format and deliver result messages
- format and deliver control notices
- support absence gracefully via `Option`
- avoid making intercom a hard dependency of core workflow execution

## Tests

- append/read typed events.
- malformed event file fails with typed error.
- status projection rebuilds running/completed/failed states.
- id prefix resolution handles exact, missing, and ambiguous prefixes.
- stale run reconciliation marks incomplete runs consistently.
- control monitor emits needs-attention after configured duration.
- control monitor dedupes repeated notices.
- optional intercom absence does not fail normal status/result flow.

## Acceptance criteria

- Async status is replayable from event logs.
- In-memory state is only an optimization/cache, not source of truth.
- Control decisions are typed and testable.
- `npm run check` passes.
