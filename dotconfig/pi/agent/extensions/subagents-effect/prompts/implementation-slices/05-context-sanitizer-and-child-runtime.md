# Slice 05: Context sanitizer, prompt policy, and child runtime

Read `00-global-rules.md` first.

## Goal

Implement the child-session safety boundary as typed services. This slice directly addresses previous signed-thinking and parent-orchestration leakage bugs.

## Create

- `src/services/context-sanitizer.ts`
- `src/services/prompt-policy.ts`
- `src/child-runtime/index.ts`
- `src/child-runtime/structured-output-tool.ts`
- tests under `test/services/context-sanitizer.test.ts`
- tests under `test/services/prompt-policy.test.ts`
- tests under `test/child-runtime/`

## Behavioral references

- `../subagents/src/runs/shared/subagent-prompt-runtime.ts`
- `../subagents/test/unit/subagent-prompt-runtime.test.ts`
- recent bug context: signed Anthropic thinking blocks were invalidated when parent `subagent` tool calls were stripped out of assistant messages.

## Critical invariant

Provider-signed assistant messages are immutable.

If an assistant message contains signed or redacted thinking, never edit, reorder, rebuild, or normalize any block in that assistant message. Either keep it exactly or drop the whole assistant turn.

Signed thinking indicators include at least:

- content block type `redacted_thinking`
- thinking block with `redacted: true`
- non-empty `thinkingSignature`
- non-empty `signature`
- non-empty provider `data` if used for redacted thinking

## `ContextSanitizer`

Service interface suggestion:

```ts
readonly sanitize: (
  messages: ReadonlyArray<unknown>,
  policy: ChildContextPolicy
) => Effect.Effect<SanitizedContext, ContextSanitizationError>;
```

Responsibilities:

- decode enough of the message shape to reason safely
- remove parent-only custom messages:
  - `subagent-orchestration-instructions`
  - `subagent-slash-result`
  - `subagent-notify`
  - `subagent_control_notice`
  - `subagent-control`
  - `subagent-control-notice`
- remove parent `subagent` tool results
- remove parent `subagent` tool calls from unsigned assistant turns
- drop signed-thinking assistant turns that include parent `subagent` tool calls
- when dropping an assistant turn, drop matching following `toolResult` messages by `toolCallId`, including sibling tool results from the same assistant message
- return diagnostics:
  - decisions per affected message
  - removed tool call ids
  - removed tool result ids
  - count of signed assistant turns dropped

Do not mutate input message objects in place.

## `PromptPolicy`

Responsibilities:

- strip inherited project context when policy says false
- strip the inherited available-skills catalog when `inheritAvailableSkills` is false (defaults to true; legacy `inheritSkills` key still accepted)
- strip explicit or catalog `pi-subagents` skill content
- remove previously injected child boundary instructions before adding the current one
- inject strict child boundary for normal children
- inject fanout boundary only when fanout is explicitly authorized
- inject structured-output instruction when a structured-output capture path is present

Boundary language should preserve the old intent:

- child is not parent orchestrator
- parent owns delegation/orchestration/follow-up launches
- ignore prior parent-only orchestration instructions in inherited history
- do not propose or run subagents unless explicitly fanout-authorized
- if edits are needed, call actual edit/write tools; do not print pseudo-tool calls

## Child runtime extension

`src/child-runtime/index.ts` should export a Pi extension default function for child processes.

It should:

- register a `context` handler that runs `ContextSanitizer`
- register a `before_agent_start` handler that runs `PromptPolicy`
- set child intercom session name from env if present
- register `structured_output` tool when schema/capture env vars are present
- not register the full parent `subagent` tool
- leave fanout child tool as a narrow placeholder or TODO unless this slice has time; model the authorization env regardless

Because Pi extension hooks are Promise-based, use a small ManagedRuntime or direct `Effect.runPromise` at this child boundary. Keep it scoped and simple.

## Structured output tool

Implement a child-only tool that:

- reads schema/capture paths from env at boundary
- validates submitted `value` against JSON schema
- writes capture file through `FileSystem`
- returns `terminate: true`

If JSON Schema validation requires `typebox` Compile, isolate that dependency in this child runtime module.

## Tests

Port and strengthen old tests:

- strips parent-only custom messages
- strips prior parent subagent tool calls and results
- does not rewrite context when no artifacts present
- strips prompt project context only
- strips inherited skills only
- strips explicit pi-subagents skill
- injects strict boundary idempotently
- replaces strict/fanout boundaries correctly

Add signed-thinking tests:

- signed-thinking assistant + only subagent tool call => drop assistant and subagent result
- signed-thinking assistant + subagent tool + read tool => drop assistant and both following sibling tool results
- signed-thinking assistant without parent-only artifacts => keep exact object reference or deep equal unchanged
- unsigned mixed assistant => remove only subagent tool call and keep other blocks

## Acceptance criteria

- Input messages are never mutated.
- Signed assistant messages are never partially rewritten.
- Diagnostics make sanitizer decisions inspectable.
- `npm run check` passes.
