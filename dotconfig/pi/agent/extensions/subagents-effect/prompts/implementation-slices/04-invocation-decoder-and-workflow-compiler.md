# Slice 04: Invocation decoder and workflow compiler

Read `00-global-rules.md` first.

## Goal

Convert the raw public `subagent_effect` tool payload into a typed `SubagentInvocation`, then compile launch invocations into side-effect-light `WorkflowPlan` values. This is the planning brain before any spawning, async store writes, or artifact output.

## Create

- `src/services/invocation-decoder.ts`
- `src/services/workflow-compiler.ts`
- `src/services/model-resolver.ts` if useful
- `src/services/skill-resolver.ts` if useful
- tests under `test/services/invocation-decoder.test.ts`
- tests under `test/services/workflow-compiler.test.ts`

## Behavioral references

- `../subagents/src/extension/schemas.ts`
- `../subagents/src/runs/foreground/subagent-executor.ts`
- `../subagents/src/shared/normalize-array-params.ts`
- `../subagents/src/shared/settings.ts`
- `../subagents/src/runs/shared/parallel-utils.ts`

## `InvocationDecoder`

Boundary parser for raw tool input.

Responsibilities:

- accept `unknown`
- normalize provider-stringified `tasks`, `chain`, and `config`
- infer exactly one invocation kind:
  - management/control mode if `action` is present
  - chain mode if `chain` is present
  - parallel mode if `tasks` is present
  - single mode if `agent` is present and no execution array is present
- reject ambiguous launch shapes, e.g. `agent` + `tasks` + `chain`
- validate management action requirements, e.g. `resume` needs message/id eventually
- keep old compatibility shims isolated here
- return `DecodeInvocationError` with useful path/context on failure

Do not call the agent catalog or filesystem here.

## `WorkflowCompiler`

Compile launch invocations into `WorkflowPlan`.

Inputs:

- decoded launch invocation
- request context: cwd, parent session info, model registry snapshot if needed
- config/settings
- agent catalog

Responsibilities:

- resolve effective cwd
- resolve requested `agentScope`
- resolve all referenced agents
- infer effective context mode:
  - explicit `context` wins
  - otherwise any involved agent with `defaultContext: "fork"` can make the plan forked
  - otherwise fresh
- compile single/parallel/chain into one `WorkflowPlan`
- resolve per-step behavior:
  - output
  - outputMode
  - reads
  - progress
  - skills
  - model
  - structured output contract
  - acceptance policy
- enforce top-level parallel concurrency bounds
- enforce top-level parallel max task bounds if config provides one
- enforce dynamic fanout max item requirements
- mark fanout authorization only when an agent's resolved builtin tools includes `subagent`
- compute child max-subagent-depth policy
- produce warnings as typed data rather than free text when possible

No child processes. No artifact writes. No session forking yet.

## Output shape

`WorkflowPlan` should contain enough to execute later without re-resolving definitions:

- run id may be assigned here or by a later orchestrator, but choose one consistent policy
- mode
- cwd
- context mode
- compiled steps/groups
- resolved agents embedded or referenced by stable id
- concurrency
- artifact/output policies
- control policy
- nested/fanout policy

## Tests

Test `InvocationDecoder`:

- single launch
- parallel launch
- chain launch
- management action
- stringified `tasks`
- stringified `chain`
- stringified `config`
- ambiguous inputs fail
- typo-shaped inputs fail with useful errors

Test `WorkflowCompiler` with fake `AgentCatalog` and fake settings:

- single plan resolves defaults from agent
- parallel plan expands counts into distinct compiled steps if that is the chosen design
- chain plan resolves default task templates
- explicit context overrides agent default context
- agent default fork context is inferred
- output/read/progress/skill precedence: step override > agent default > disabled/default
- concurrency is bounded
- dynamic fanout without max bound fails unless global config allows it

## Acceptance criteria

- All decoded inputs are schema-backed.
- Compiler is deterministic and mostly pure.
- No spawning, no persistent run writes.
- `npm run check` passes.
