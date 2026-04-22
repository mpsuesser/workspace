# @workspace/zellij-binding

Effect-first TypeScript binding over the **Zellij 0.44** CLI. Six namespaces, one tagged error, ~20 schemas. No native `fetch`, no `child_process` escapes, no untyped failure paths.

## TL;DR layer wiring

```ts
import * as BunServices from '@effect/platform-bun/BunServices';
import * as Zellij from '@workspace/zellij-binding/Zellij';
import * as ZellijCli from '@workspace/zellij-binding/ZellijCli';
import * as ZellijPane from '@workspace/zellij-binding/ZellijPane';
import * as ZellijSession from '@workspace/zellij-binding/ZellijSession';
import * as ZellijTab from '@workspace/zellij-binding/ZellijTab';
import * as Layer from 'effect/Layer';

// One runner shared across the four services (runtime-layer pattern).
const AppLayer = Layer.mergeAll(
	Zellij.layer,
	ZellijSession.layer,
	ZellijTab.layer,
	ZellijPane.layer
).pipe(Layer.provide(ZellijCli.layer), Layer.provide(BunServices.layer));
```

`runtime/runtime.ts` already does this; import `WorkspaceRuntime` from `@workspace/runtime` and you're done.

For single-namespace usage, each module also exports `defaultLayer` which provides its own `ZellijCli`:

```ts
program.pipe(
	Effect.provide(ZellijSession.defaultLayer),
	Effect.provide(BunServices.layer)
);
```

## Namespaces

All four domain namespaces are `Context.Service`s; capture them with `yield* Service`.

### `Zellij` — machine-wide

| Method                | Maps to                                                  |
| --------------------- | -------------------------------------------------------- |
| `listSessions()`      | `zellij list-sessions -s` → `ReadonlyArray<SessionName>` |
| `killAllSessions()`   | `zellij kill-all-sessions -y`                            |
| `deleteAllSessions()` | `zellij delete-all-sessions -y`                          |

### `ZellijSession` — subject: a session

Lifecycle (`createBackground`, `attach`, `watch`, `kill`, `delete`, `detach`, `rename`, `save`, `switch`) plus **container queries** about what lives inside a session: `getTabs`, `getPanes`, `getTabNames`, `getClients`, `getLayout`.

Session discovery:

- `current()` → `Option<SessionName>` (reads `$ZELLIJ_SESSION_NAME` via `Config.option`, testable through `ConfigProvider`)
- `currentOrFail()` → fails with `NotInSession` reason when unset
- `isInSession()` → `boolean`

**Streaming** — `subscribe(paneIds, { scrollback? })` returns `Stream<SubscribeEvent, ZellijError>`. Always JSON-framed; blank lines filtered.

```ts
const session = yield * ZellijSession.Service;
const panes = yield * session.getPanes(); // current session
const layout = yield *
	session.getLayout({ session: SessionName.make('other') });
```

### `ZellijTab` — subject: a tab

23 per-tab operations: `info(tabId?)`, `getPanes(tabId?)`, `new`/`close`/`closeById`, `goTo*`, `rename`/`renameById`, `toggleSync`, `*SwapLayout`, `overrideLayout`, `show/hide/toggleFloating`, `areFloatingVisible`.

**Dual-path on `tabId?`**: omit for current-tab (uses CLI `--tab` flag), pass one for a specific tab (list all + client-side filter). Zellij has no `--tab-id` on most commands.

### `ZellijPane` — subject: a pane

42 methods. Highlights:

- Identity: `currentId()` / `currentIdOrFail()` (from `$ZELLIJ_PANE_ID`), `info(paneId)`
- Creation returns **typed `PaneId`** parsed from stdout: `create`, `openEditor`, `launchPlugin`, `launchOrFocusPlugin`
- Geometry: `resize`, `move`, `toggleFullscreen`, `toggleEmbedOrFloating`, `togglePinned`, `stackPanes`
- Input: `writeChars`, `writeBytes`, `write`
- Scrolling: `scrollUp`/`Down`, `halfPageScroll*`, `pageScroll*`, `scrollToTop`/`Bottom`
- Output: `dumpScreen`, `editScrollback`
- Plugins: `startOrReloadPlugin`, pipe-to-plugin variants

### `ZellijAction` — thin 1:1 mapping (72 verbs)

**Not a Service.** Standalone functions, each `Effect<_, ZellijError, ZellijCli.Service>`. Use these when the higher-level namespaces don't have what you need. Higher-level namespaces delegate here internally — you almost never call them directly.

### `ZellijCli` — internal runner (Service)

Only public surface: the Service tag itself, for tests that want to stub it. Higher layers capture `cli` in their `Layer.effect` closure, so `ChildProcessSpawner` and `PlatformError` never leak into public signatures.

Shapes: `cli.exec(argv, opts?)` / `lines(argv)` / `string(argv)` / `stream(argv)` / `interactive(argv)` (stdio-inherited, for attach/watch).

### `ZellijLayout` — **external stable contract**

Authors zellij KDL layouts as TypeScript. **Consumed by `scripts/generate-zellij-layout-kdl-files.ts` and `dotconfig/zellij/layouts/ts/templates/dotconfig.ts`** — do not break its public API without updating both.

## Error model

Every failure is a single `ZellijError` class with a tagged `reason`. Recover precisely:

```ts
import * as ZellijError from '@workspace/zellij-binding/ZellijError';

program.pipe(
	Effect.catchReasons('ZellijError', {
		NotInSession: () => Effect.succeed(null),
		SessionNotFound: (r) => Effect.logWarning(`missing: ${r.session}`),
		PaneNotFound: (r) =>
			Effect.logWarning(`pane ${r.paneId.kind}_${r.paneId.id}`),
		CommandFailed: (r) =>
			Effect.logError(
				`zellij ${r.argv.join(' ')} → ${r.exitCode}: ${r.stderr}`
			)
	})
);
```

Reason variants: `SpawnError` · `CommandFailed` · `DecodeFailure` · `NotInSession` · `SessionNotFound` · `PaneNotFound` · `TabNotFound`. The class overrides `.message` to render reasons in Effect's default Cause pretty-printer.

## Schemas (the short list)

All exported from `@workspace/zellij-binding/schemas/<Name>`:

- `PaneId` — tagged union of `terminal_N` | `plugin_N`. Helpers: `fromEnv` (from `$ZELLIJ_PANE_ID`), `fromCliArg` (parses stdout), `toCliArg`, `terminal`/`plugin` constructors.
- `TabId` — branded `number`. `TabId.make(n)` at call sites.
- `SessionName` — branded non-empty `string`. `SessionName.make('name')`.
- `ClientId` — branded `number`.
- `PaneInfo` / `TabInfo` / `ClientInfo` — `Schema.Class` decoded from `zellij action list-*`. Include `decodeJson*` / `parseOutput`.
- `SubscribeEvent` — `Schema.toTaggedUnion('event')` over `PaneUpdate` | `PaneClosed`. Discriminator field is **`event`, not `_tag`**. Use `SubscribeEvent.isPaneUpdate` / `isPaneClosed` guards.
- `Direction`, `ResizeDirection`, `BlockStrategy`, `Mode`, `PaneSize`, `PaneLocation` — small literal/struct schemas used across the action surface.

## Canonical patterns to keep

- **Subject-scoped namespaces.** `ZellijX` means "operations on X as subject". Collection queries about X-shaped things live on the container (`Zellij.listSessions`, `Session.getTabs/getPanes`, `Tab.getPanes`) — no `list()` on per-entity namespaces.
- **Typed `PaneId` returned from creation ops.** Never a raw string. Failure to parse → `DecodeFailure` with `argv` + `output`.
- **Options pass through structurally.** Never reconstruct `{ session: options?.session }` — that breaks `exactOptionalPropertyTypes`. Forward the options object whole.
- **Env-var reads are effects.** `Config.option(cfg).asEffect().pipe(Effect.orDie)` — not `process.env`. Residual `ConfigError` on a missing env is an invariant violation (EF-31).
- **Schema defaults over handler fallbacks.** `Schema.withDecodingDefault` / `withConstructorDefault` (EF-34).
- **Structural widening over casts.** If a narrow-typed helper needs to fit a wider Interface slot, annotate the target binding (`const x: Interface['x'] = …`) — no `as`.

## Live validation

`scripts/` / `scratchpad/` can write programs against a real zellij session using `BunRuntime.runMain` from `@effect/platform-bun/BunRuntime`. When doing this:

- Don't mutate the caller's current session beyond what you clean up.
- Use `ZellijSession.createBackground('bg-name')` + `kill` + `delete` for isolated lifecycle tests.
- `SubscribeEvent` events come through within ~500ms of a write to the subscribed pane.

The three bugs the most recent live run caught (now all fixed, kept as cautionary tales):

1. `PaneInfo` was missing `index_in_pane_group` / `default_fg` / `default_bg` — zellij emits them unconditionally.
2. `PaneInfo.pane_command` / `pane_cwd` need `OptionFromOptionalKey` (keys are **absent** on plugin panes), not `OptionFromNullishOr`.
3. `ZellijError` had no `.message` — Effect's default pretty-printer rendered `ZellijError:` with no context. Fixed with a `Match.typeTags`-backed getter.

## Further reading

- [`PLAN.md`](./PLAN.md) — original design doc for the six-namespace split.
- [`src/ZellijCli.ts`](./src/ZellijCli.ts) — JSDoc on the four return shapes (`exec` / `lines` / `string` / `stream` / `interactive`) and why each exists.
- [`src/ZellijError.ts`](./src/ZellijError.ts) — full reason-union + smart constructors.
- [Effect-first development](../../AGENTS.md) — EF-1…EF-40 conventions this package adheres to.
