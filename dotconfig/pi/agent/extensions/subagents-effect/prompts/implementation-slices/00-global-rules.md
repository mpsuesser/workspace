# Slice 00: Global implementation rules

You are implementing `subagents-effect`, a new Effect-first Pi extension. Do not migrate the old `subagents` extension in-place.

## Required workflow

- Load at least 5 relevant Effect skills before planning or writing code.
- Use Effect v4 APIs only.
- If an Effect API is unclear, read from `~/.cache/effect-v4` before coding.
- Run `npm run check` before handing off, or clearly state why it could not be run.

## Effect-first rules

- Use `Schema.Class`, `Schema.TaggedClass`, branded schemas, and schema-derived types for decoded/domain shapes.
- Use `Schema.TaggedErrorClass` for public/cross-module errors.
- Use namespace-module services with `Context.Service` + `Layer.effect`.
- Service class bodies stay empty; construction logic belongs in namespace-level `layer` exports.
- Service methods must not leak requirements in `R`; dependencies are captured during layer construction.
- Use `Effect.fn("Namespace.method")` for public/reusable effectful methods.
- Use `Effect.log*`, spans, and metrics rather than `console.*` in Effect code.

## Platform boundaries

Do not use these in domain/service code:

- raw `node:fs`, `node:path`, `node:child_process`
- `Date.now`, `Math.random`
- direct `process.env`
- direct `JSON.parse` / `JSON.stringify`
- untyped `throw` for recoverable behavior

Use these instead:

- `FileSystem.FileSystem`
- `Path.Path`
- `Clock`, `Crypto`, `Config`
- `ChildProcess` + `ChildProcessSpawner`
- `Schema.UnknownFromJsonString`, `Schema.fromJsonString`, `Schema.decodeUnknownEffect`, `Schema.encodeUnknownEffect`

Narrow Pi-host adapters may touch Pi's Promise/TypeBox APIs, but must decode unknown inputs into Effect schemas immediately.

## Old extension references

Reference the old extension only for behavior and fixture shapes. Avoid copying large modules.

Useful files:

- `../subagents/src/extension/index.ts`
- `../subagents/src/extension/schemas.ts`
- `../subagents/src/runs/foreground/subagent-executor.ts`
- `../subagents/src/runs/foreground/execution.ts`
- `../subagents/src/runs/background/subagent-runner.ts`
- `../subagents/src/runs/shared/pi-args.ts`
- `../subagents/src/runs/shared/subagent-prompt-runtime.ts`
- `../subagents/src/shared/types.ts`

## Architecture target

Pi calls a thin adapter. The adapter decodes a typed invocation, compiles it into a workflow plan, runs that plan through scoped Effect services, persists run transitions as typed events, and projects user-visible results/status from those events.

Keep these concepts separate:

- raw public tool input
- decoded invocation ADT
- resolved agent definitions
- compiled workflow plan
- child-visible sanitized context
- child process protocol events
- run event log
- status/result projections

## Signed-thinking invariant

Provider-signed assistant messages are immutable. If a message contains signed or redacted thinking, never edit, reorder, rebuild, or normalize any block in that assistant message. Either keep it exactly or drop the whole assistant turn.
