# Slice 07: Foreground workflow runner, outputs, artifacts, and acceptance

Read `00-global-rules.md` first.

## Goal

Implement foreground execution of compiled workflow plans using the single-step `RunEngine`. This slice brings together sequential steps, parallel groups, dynamic fanout, output persistence, artifact handling, worktrees, and acceptance evaluation.

## Create

- `src/services/workflow-runner.ts`
- `src/services/artifact-store.ts`
- `src/services/output-store.ts`
- `src/services/acceptance-evaluator.ts`
- `src/services/worktree-manager.ts`
- `src/services/result-formatter.ts`
- tests under `test/services/workflow-runner.test.ts`
- tests under `test/services/output-store.test.ts`
- tests under `test/services/acceptance-evaluator.test.ts`

## Behavioral references

- `../subagents/src/runs/foreground/chain-execution.ts`
- `../subagents/src/runs/shared/single-output.ts`
- `../subagents/src/runs/shared/acceptance.ts`
- `../subagents/src/runs/shared/worktree.ts`
- `../subagents/src/shared/artifacts.ts`
- `../subagents/src/shared/utils.ts`

## `WorkflowRunner`

Service interface suggestion:

```ts
readonly runForeground: (
  plan: WorkflowPlan,
  hooks: ForegroundRunHooks
) => Effect.Effect<RunResult, WorkflowRunError>;
```

Responsibilities:

- run sequential steps in order
- run static parallel groups with explicit concurrency
- run dynamic fanout groups after reading structured output from a prior named output
- respect `failFast`
- maintain chain output map by `as` names
- pass previous output into subsequent task templates
- update progress hooks with typed events/results
- call `RunEngine` for each compiled step
- use `WorktreeManager` when isolated worktrees are requested
- ensure scoped cleanup on interruption/failure

## `ArtifactStore`

Responsibilities:

- create per-run artifact directories
- write raw child logs/events if provided
- write metadata
- enforce cleanup policy later or provide helper for cleanup service

Use `FileSystem` and schema JSON codecs.

## `OutputStore`

Responsibilities:

- resolve output paths
- write saved outputs
- implement `inline` vs `file-only`
- truncate large outputs with saved artifact references
- read structured output capture files
- validate structured outputs against the declared contract
- return `SavedOutputReference` and `TruncationInfo` as typed data

## `AcceptanceEvaluator`

Responsibilities:

- resolve effective acceptance policy
- evaluate attested/checked/verified/reviewed modes
- run verification commands through a command gateway or `ChildProcessSpawner`
- aggregate evidence into `AcceptanceLedger`
- fail required gates with typed `AcceptanceError`
- keep review-only/no-edit conflicts explicit

If full reviewed-mode orchestration would be too large, model it and implement non-reviewed modes first with a clear typed pending state.

## `WorktreeManager`

Responsibilities:

- create isolated git worktrees for parallel tasks when requested
- reject cwd conflicts before running
- run optional setup hook with timeout
- collect diffs
- cleanup worktrees with `Effect.acquireUseRelease`

## `ResultFormatter`

Convert typed run results into compact text/details for the Pi tool boundary. Keep formatting separate from execution.

## Tests

Use fake `RunEngine` for workflow tests.

Test:

- single step success
- sequential chain passes previous output
- parallel group respects concurrency
- parallel group aggregates all outputs
- failFast stops remaining/running policy as designed
- dynamic fanout expands bounded items from structured output
- dynamic fanout empty skip/fail behavior
- output file-only returns concise reference
- truncation writes artifact reference
- acceptance verified command failure fails required gate
- worktree cleanup finalizer runs on failure/interruption where feasible

## Acceptance criteria

- Foreground runner has no spawn logic.
- Parallelism always has explicit concurrency.
- Output and acceptance errors are typed.
- `npm run check` passes.
