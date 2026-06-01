# Slice 09: Pi tool adapter, slash commands, rendering, and doctor

Read `00-global-rules.md` first.

## Goal

Finish the user-facing Pi integration. This slice wires the decoded/compiled/run services into a public Pi tool and minimal commands. Keep the first pass intentionally smaller than the old extension's full TUI clarify system.

## Create

- `src/extension/tool-schema.ts`
- `src/extension/subagent-tool.ts`
- `src/extension/slash-commands.ts`
- `src/extension/render.ts`
- `src/extension/doctor.ts`
- tests under `test/extension/`

## Behavioral references

- `../subagents/src/extension/index.ts`
- `../subagents/src/extension/schemas.ts`
- `../subagents/src/slash/slash-commands.ts`
- `../subagents/src/slash/slash-bridge.ts`
- `../subagents/src/tui/render.ts`
- `../subagents/src/extension/doctor.ts`

## Public tool

Register public tool name `subagent_effect` initially to avoid clobbering the old extension during development.

Later, when stable, it can also register/replace `subagent`.

The tool adapter should:

1. accept raw params from Pi TypeBox validation
2. call `InvocationDecoder.decode`
3. route management invocations to `AgentManagement`, `AsyncRunStore`, `AsyncSupervisor`, or `Doctor`
4. route launch invocations to `WorkflowCompiler`
5. run foreground or background via `WorkflowRunner` / `AsyncSupervisor`
6. format results via `ResultFormatter`
7. convert typed errors into clear Pi tool failures

Keep TypeBox schema in `tool-schema.ts`. It should mirror the public shape while internal code uses Effect Schema. Add tests that sample payloads accepted by TypeBox also decode through `InvocationDecoder`.

## Slash commands

Implement minimal commands:

- `/subagents-effect-doctor`
- optionally `/run-effect <agent> [task]`
- optionally `/parallel-effect ...`
- optionally `/chain-effect ...`

Do not rebuild the full old clarify UI in this slice unless all core work is already stable.

## Rendering

Implement compact rendering helpers for:

- foreground run result
- background start receipt
- async status
- doctor report

Keep these mostly text-based. Avoid heavy TUI component complexity in the first pass.

## Doctor

Implement `Doctor` service and command output that checks:

- package root and extension paths
- child runtime path exists
- settings decode
- agent discovery
- async run store directory access
- artifact directory access
- optional intercom availability/config
- platform dependencies available

Doctor must be read-only.

## Tests

Use fake services and fake Pi API.

Test:

- tool is registered with expected name.
- tool launch path decodes and calls compiler/runner.
- management status path calls run store.
- typed errors become understandable tool errors.
- doctor command returns read-only report.
- slash command registration works.

## Acceptance criteria

- User-facing extension can be loaded by Pi.
- Public tool remains `subagent_effect` unless explicitly asked to take over `subagent`.
- No untyped error leakage at boundary.
- `npm run check` passes.
