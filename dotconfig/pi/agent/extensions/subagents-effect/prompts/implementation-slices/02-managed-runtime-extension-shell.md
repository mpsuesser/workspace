# Slice 02: ManagedRuntime extension shell

Read `00-global-rules.md` first.

## Goal

Build the Pi extension boundary as a thin adapter over an Effect `ManagedRuntime`. This slice should not implement real subagent execution. It should prove the extension can load, register boundary hooks/tools, run Effect services from Pi callbacks, and dispose cleanly on shutdown.

## Create

- `src/extension/index.ts`
- `src/extension/request-context.ts`
- `src/services/pi-host.ts`
- `src/services/extension-registrar.ts`
- `src/services/subagent-tool.ts` as a placeholder boundary service
- `src/layers/node-platform.ts`
- `src/layers/parent-extension-layer.ts`
- tests under `test/extension/` and `test/services/`

## Service interfaces

### `PiHost`

Wrap only the minimal Pi APIs needed by this slice and later adapters.

Suggested interface:

```ts
export namespace PiHost {
  export interface Interface {
    readonly registerTool: (definition: PiToolDefinition) => Effect.Effect<void>;
    readonly registerCommand: (name: string, definition: PiCommandDefinition) => Effect.Effect<void>;
    readonly sendMessage: (message: PiCustomMessage, options?: PiSendOptions) => Effect.Effect<void, PiHostError>;
    readonly sendUserMessage: (content: PiUserMessageContent, options?: PiSendOptions) => Effect.Effect<void, PiHostError>;
    readonly setSessionName: (name: string) => Effect.Effect<void>;
    readonly getSessionName: Effect.Effect<Option.Option<string>>;
  }
}
```

Keep this service intentionally narrow. Avoid carrying raw `ExtensionAPI` through the rest of the app.

### `ExtensionRegistrar`

Registers tools, commands, message renderers, and session lifecycle hooks. For this slice, it can register only:

- placeholder `subagent_effect` tool
- `/subagents-effect-doctor` placeholder command
- `session_shutdown` disposal hook handled in the adapter

### `SubagentTool`

For now, accepts raw input and returns a placeholder tool result that proves runtime execution works. Later slices replace the internals.

## Extension entrypoint behavior

`src/extension/index.ts` should:

1. receive `ExtensionAPI` from Pi.
2. create `ManagedRuntime.make(ParentExtensionLayer.pipe(Layer.provide(PiHost.layer(pi))))`.
3. register extension resources via `runtime.runPromise(ExtensionRegistrar.Service.use(...))`.
4. register a `session_shutdown` handler that disposes the runtime.
5. avoid storing `ExtensionContext` or other session-bound objects in module globals.

## Request context

Define a small request-scoped context type derived from Pi callback context:

- cwd
- hasUI
- signal as `Option<AbortSignal>` if necessary at the boundary
- session file/id if available
- model info if needed later

Do not put raw `ExtensionContext` in long-lived state.

## Tests

Use fake Pi objects.

Test:

- default export registers placeholder tool/command.
- placeholder tool runs through `ManagedRuntime` and returns a result.
- `session_shutdown` disposes runtime or calls registered shutdown cleanup.
- no unhandled Promise rejection when registration fails; typed error is surfaced.

## Acceptance criteria

- Extension shell typechecks.
- No real subagent spawning.
- No direct use of old extension internals.
- Runtime lifecycle is explicit and tested.
