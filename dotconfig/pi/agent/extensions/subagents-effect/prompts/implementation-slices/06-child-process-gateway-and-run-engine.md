# Slice 06: Pi args builder, child process gateway, and run engine

Read `00-global-rules.md` first.

## Goal

Implement the runtime path for executing one compiled child step. Process spawning and protocol parsing must be isolated behind services so workflow code never manages stdout buffers, kill timers, or raw Pi args directly.

## Create

- `src/services/pi-args-builder.ts`
- `src/services/child-protocol-decoder.ts`
- `src/services/child-process-gateway.ts`
- `src/services/run-engine.ts`
- tests under `test/services/child-protocol-decoder.test.ts`
- tests under `test/services/pi-args-builder.test.ts`
- tests under `test/services/run-engine.test.ts`

## Behavioral references

- `../subagents/src/runs/shared/pi-args.ts`
- `../subagents/src/runs/foreground/execution.ts`
- `../subagents/src/runs/background/subagent-runner.ts`
- `../subagents/src/shared/post-exit-stdio-guard.ts`
- `../subagents/src/runs/shared/model-fallback.ts`

## `PiArgsBuilder`

Service interface suggestion:

```ts
readonly build: (spec: ChildLaunchSpec) => Effect.Effect<PiSpawnSpec, PiArgsBuildError>;
```

Responsibilities:

- build command/env for `pi --mode json -p`
- handle `--session`, `--session-dir`, and `--no-session`
- apply model + thinking suffix exactly once
- build builtin `--tools` allowlist
- add direct MCP tools where requested
- add child runtime extension path
- add fanout child runtime extension path only when authorized
- apply `--no-extensions` and explicit extension allowlist semantics
- apply `--no-skills` when inherited skills are disabled
- write system prompt temp file when prompt is provided
- write task temp file when task exceeds safe CLI arg length
- set child env vars:
  - child mode
  - fanout mode
  - run id
  - child agent name
  - child index
  - intercom session name/target
  - structured output schema/capture paths
  - nested route/capability vars
- return temp dir cleanup metadata

Use `FileSystem`, `Path`, and `Crypto`/id service as needed.

## `ChildProtocolDecoder`

Decode raw JSON-mode lines from Pi into `ChildEvent` ADT.

Responsibilities:

- parse raw JSON line using Schema JSON codecs
- preserve malformed lines as `ChildMalformedLine` rather than throwing when streaming
- decode tool start/update/end events
- decode message end events
- extract usage/model/error metadata into typed shapes
- keep provider-specific unknown fields in details only where useful

## `ChildProcessGateway`

Service interface suggestion:

```ts
readonly runPiJson: (
  spec: PiSpawnSpec,
  options: ChildRunOptions
) => Effect.Effect<ChildProcessResult, ChildProcessError>;
```

Responsibilities:

- spawn through `ChildProcessSpawner`
- stream stdout and stderr
- decode stdout lines through `ChildProtocolDecoder`
- optionally tee raw output to an artifact sink
- support Effect interruption and host abort signals at boundary
- own final drain policy after clean terminal assistant stop
- own SIGTERM/SIGKILL escalation
- produce exit code, stderr, decoded messages/events, final output, usage, model, and error summary

Use `Effect.scoped` for process handles.

## `RunEngine`

Service interface suggestion:

```ts
readonly runStep: (step: CompiledStep) => Effect.Effect<StepResult, StepExecutionError>;
```

Responsibilities:

- execute one compiled step
- use `PiArgsBuilder`
- use `ChildProcessGateway`
- implement retryable model fallback policy
- aggregate usage and model attempts
- detect child task/provider errors
- emit observed child events through a typed callback/sink supplied by caller
- evaluate completion guard only if the domain model already supports it; otherwise leave a typed TODO/result flag

Do not implement chain/parallel workflow orchestration here.

## Tests

- `PiArgsBuilder` builds expected args/env for fresh child.
- `PiArgsBuilder` includes runtime extension path and structured-output env.
- `PiArgsBuilder` marks fanout only when authorized.
- `ChildProtocolDecoder` decodes representative Pi JSON-mode lines and malformed lines.
- `RunEngine` with fake `ChildProcessGateway` handles success.
- `RunEngine` with fake gateway retries retryable provider failure on fallback model.
- interruption/cleanup behavior is tested at gateway level where feasible.

## Acceptance criteria

- Process lifecycle is scoped and centralized.
- Workflow code will not need to know about stdout buffers or kill timers.
- No raw `child_process` in domain/workflow services.
- `npm run check` passes.
