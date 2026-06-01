# Slice 01: Domain schemas and typed errors

Read `00-global-rules.md` first.

## Goal

Implement the domain foundation for the new Effect-first extension. This slice should establish the data model that later services compile, execute, persist, and project. Prefer explicit ADTs over optional-field soup.

## Create

- `src/domain/ids.ts`
- `src/domain/config.ts`
- `src/domain/invocation.ts`
- `src/domain/agents.ts`
- `src/domain/workflow.ts`
- `src/domain/session-context.ts`
- `src/domain/child-protocol.ts`
- `src/domain/run-events.ts`
- `src/domain/results.ts`
- `src/domain/acceptance.ts`
- `src/domain/errors.ts`
- matching tests under `test/domain/`

## Required models

### IDs and value objects

Create branded schemas and types for at least:

- `RunId`
- `AgentName`
- `RuntimeAgentName`
- `ChainName`
- `SessionFile`
- `SessionId`
- `OutputName`
- `JsonPointer`
- `ToolCallId`
- `IntercomTarget`

Use schema-backed guards with `Schema.is(...)` where useful.

### Public invocation ADT

Model decoded invocations, not the raw flat TypeBox input.

Launch variants:

- `SingleLaunch`
- `ParallelLaunch`
- `ChainLaunch`

Management/control variants:

- `ListAgents`
- `GetAgent`
- `CreateAgent`
- `UpdateAgent`
- `DeleteAgent`
- `StatusRun`
- `InterruptRun`
- `ResumeRun`
- `Doctor`

Export:

- `LaunchInvocation`
- `ManagementInvocation`
- `SubagentInvocation`

Use literal discriminants and `Schema.Union([...]).pipe(Schema.toTaggedUnion("kind"))` for non-`_tag` unions.

### Agent and chain models

Model at least:

- `AgentDefinition`
- `ResolvedAgent`
- `AgentSource`
- `AgentScope`
- `ThinkingLevel`
- `SystemPromptMode`
- `AgentDefaultContext`
- `ChainDefinition`
- `AgentOverride`

Keep `AgentDefinition` distinct from `ResolvedAgent`. The former is decoded file/frontmatter data; the latter is after defaults and overrides.

### Workflow models

Model at least:

- `WorkflowPlan`
- `WorkflowMode`
- `SequentialWorkflowStep`
- `StaticParallelGroup`
- `DynamicFanoutGroup`
- `StepBehavior`
- `TaskItem`
- `ParallelTaskItem`
- `DynamicExpandSpec`
- `DynamicCollectSpec`
- `StructuredOutputContract`

Use `Duration` for time windows and `Schema.OptionFrom*` helpers for absence.

### Session/context models

Model Pi/AI message shapes needed by sanitizer and child process decoding:

- `TextBlock`
- `ImageBlock`
- `ThinkingBlock`
- `ToolCallBlock`
- `UserContextMessage`
- `AssistantContextMessage`
- `ToolResultContextMessage`
- `CustomContextMessage`
- `ContextMessage`

Include signature-related fields on thinking blocks:

- `thinkingSignature`
- `signature`
- `redacted`
- `data`

Do not implement sanitizer logic here; just model the data.

### Child protocol models

Model normalized child JSON-mode events:

- `ChildToolStarted`
- `ChildToolUpdated`
- `ChildToolEnded`
- `ChildMessageEnded`
- `ChildStdoutLine`
- `ChildStderrLine`
- `ChildMalformedLine`
- `ChildEvent`

### Run event models

Model an event-sourced run log:

- `RunCreated`
- `WorkflowCompiled`
- `StepStarted`
- `StepObservedChildEvent`
- `StepFinished`
- `StepFailed`
- `ControlNoticeEmitted`
- `RunFinished`
- `RunEvent`

These should be sufficient to rebuild status after reload.

### Results and status

Model at least:

- `Usage`
- `ModelAttempt`
- `StepResult`
- `RunResult`
- `RunStatus`
- `WorkflowNodeStatus`
- `WorkflowGraphSnapshot`
- `SavedOutputReference`
- `TruncationInfo`

### Acceptance

Model the public acceptance policy shape:

- `AcceptanceLevel`
- `AcceptanceEvidenceKind`
- `AcceptanceGate`
- `AcceptanceVerifyCommand`
- `AcceptanceReviewGate`
- `AcceptancePolicy`
- `AcceptanceLedger`

### Typed errors

In `errors.ts`, define `Schema.TaggedErrorClass` errors with useful context and `message` fields for at least:

- `DecodeInvocationError`
- `ConfigLoadError`
- `AgentDiscoveryError`
- `AgentResolutionError`
- `WorkflowCompileError`
- `SessionForkError`
- `PromptPolicyError`
- `ContextSanitizationError`
- `ChildProtocolDecodeError`
- `ChildProcessError`
- `RunStoreError`
- `WorkflowRunError`
- `OutputError`
- `AcceptanceError`

## Acceptance criteria

- All exported decoded/domain shapes are schema-first.
- No schema constants end with `Schema`.
- Non-class schemas export matching type aliases.
- Domain modules have no platform imports.
- `npm run typecheck` passes.
- Tests cover representative successful and failing decodes.
- Tests prove branded ids reject empty values where intended.
