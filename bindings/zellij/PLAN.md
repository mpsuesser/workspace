Only `ZellijLayout` is consumed externally. The rest can be rewritten freely.

Here's the design I'll implement. Stating it explicitly before coding so you can course-correct:

## Design

### File layout

```
src/
  schemas/
    PaneLocation.ts         (exists, reused)
    PaneSize.ts             (new — shared w/ layout)
    Direction.ts            (new — right|left|up|down)
    ResizeDirection.ts      (new — plus +/- grow/shrink)
    Mode.ts                 (new — locked|pane|tab|resize|...)
    BlockStrategy.ts        (new — blocking|untilExit|untilExitSuccess|...)
    PaneId.ts               (new — tagged union TerminalPaneId | PluginPaneId)
    TabId.ts                (new — branded number)
    ClientId.ts             (new — branded number)
    SessionName.ts          (new — branded non-empty string)
    PaneInfo.ts             (new — Schema.Class, decoded from list-panes --json)
    TabInfo.ts              (new — Schema.Class, decoded from list-tabs --json)
    ClientInfo.ts           (new — Schema.Class, decoded from list-clients)
    SubscribeEvent.ts       (new — PaneUpdate | PaneClosed NDJSON events)
  ZellijError.ts            (new — reason-union TaggedErrorClass)
  ZellijCli.ts              (new — INTERNAL service: run/lines/string/stream/json + withSession)
  ZellijAction.ts           (namespace — thin 1:1 mapping of every `zellij action` verb)
  ZellijPane.ts             (namespace — domain-oriented pane API, decoded outputs)
  ZellijTab.ts              (namespace — domain-oriented tab API)
  ZellijSession.ts          (namespace — session lifecycle + subscribe)
  Zellij.ts                 (namespace — top-level CLI: run/edit/pipe/plugin/subscribe/setup/watch/version + re-exports)
  ZellijLayout.ts           (unchanged)
  ZellijPipe.ts             (merge into Zellij.ts as `pipe` function)
  index.ts                  (re-export everything)
```

### Key architectural decisions

1. **Namespace-module pattern** per `effect-service-implementation` skill — each service exports `Interface` / `Service` / `layer` / `defaultLayer`. Classes stay empty.

2. **ZellijCli** is an internal service that owns `ChildProcessSpawner` + session/error policy. Every higher-level service depends on it in its `Layer.effect` closure, so **no service leaks `PlatformError`** to callers.

3. **ZellijError** is one `Schema.TaggedErrorClass` with a `reason` union — supports `Effect.catchReasons` / `Effect.unwrapReason` for targeted recovery:
   - `NotInSession` — `$ZELLIJ_SESSION_NAME` is unset
   - `SessionNotFound(name)` — zellij reports no such session
   - `PaneNotFound(paneId)` / `TabNotFound(tabId)`
   - `CommandFailed({ args, exitCode, stderr })` — non-zero exit
   - `DecodeFailure({ output, issue })` — JSON parsing failed
   - `SpawnError(cause)` — wraps `PlatformError` from `ChildProcess`

4. **Session targeting**: Every high-level service accepts an optional `session?: SessionName` option. Internally, methods call `cli.withSession(name).run(...)` which prepends `--session <name>`. This mirrors the CLI's own `--session` global flag.

5. **PaneId as tagged union**: `Terminal(id: number)` | `Plugin(id: number)` via `Schema.Union` + `Schema.toTaggedUnion("_tag")`. `toString` encodes as `terminal_N`/`plugin_N`; `fromString` decodes. Decoded list-panes items emit the correctly tagged variant via `is_plugin` check.

6. **Streaming subscribe**: `ZellijSession.subscribe(paneIds, options)` returns `Stream<SubscribeEvent, ZellijError>`. Implementation: `spawner.streamLines(...)` piped through NDJSON decode + schema validation.

7. **`action` commands** (the `zellij action <verb>` surface — 70+ verbs): every single one exposed in **ZellijAction** as a thin typed wrapper. **ZellijPane / ZellijTab / ZellijSession** delegate to ZellijAction for execution, then add decoding + ergonomic defaults on top. No duplicate implementations — the higher-level methods call `Action.newPane(...)` under the hood, not re-spawn CLIs.

8. **Blocking strategies**: model as a tagged enum so `Pane.new({ block: BlockStrategy.untilSuccess() })` is type-safe.

9. **JSON decoding**: `zellij action list-panes --json`, `list-tabs --json`, `current-tab-info --json` all decoded via `Schema.decodeUnknownEffect(Schema.fromJsonString(PaneInfoArray))`.

### Turn plan

You said one namespace at a time. My proposed pacing:

- **This turn**: Foundation only — `schemas/*`, `ZellijError.ts`, `ZellijCli.ts`. This is the shared substrate all six namespaces will import; getting it right up-front matters more than any individual namespace.
- **Next turn**: `ZellijAction.ts` (~70 thin wrappers — exercises the foundation).
- **Then**: `ZellijSession`, `ZellijTab`, `ZellijPane`, `Zellij` — one per turn.

If that ordering is cool, reply "go" or correct me and I'll proceed with the foundation. If you'd rather I batch foundation + first namespace together, say "batch" and I'll squeeze both into this turn.
