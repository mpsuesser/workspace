/**
 * @workspace/zellij-binding — Effect-first bindings for the Zellij CLI.
 *
 * The barrel exposes two flavours of names at the top level:
 *
 * 1. **Service / utility namespaces** — re-exported as `* as X` so callers
 *    can capture services and helpers structurally:
 *    ```ts
 *    import { Zellij, ZellijSession } from '@workspace/zellij-binding';
 *    const sessions = yield* Zellij.Service;
 *    ```
 *    Each namespace is a focused slice of the Zellij control surface:
 *    - {@link Zellij}        machine-wide ops (list/kill all sessions)
 *    - {@link ZellijSession} session-scoped lifecycle + container queries
 *    - {@link ZellijTab}     tab-scoped operations
 *    - {@link ZellijPane}    pane-scoped operations + identity
 *    - {@link ZellijAction}  thin 1:1 mapping over `zellij action …`
 *    - {@link ZellijCli}     internal CLI runner (Service tag for tests)
 *    - {@link ZellijError}   shared tagged error
 *    - {@link ZellijLayout}  KDL layout authoring
 *
 * 2. **Schema types** — re-exported as `type Foo` so callers can name
 *    decoded values directly without an extra `Foo.Foo` qualifier:
 *    ```ts
 *    import { type SessionName } from '@workspace/zellij-binding';
 *    const row: { name: SessionName } = …;
 *    ```
 *    For schema-side access (constructors, guards, decoders) deep-import
 *    the schema module instead:
 *    ```ts
 *    import * as SessionName from '@workspace/zellij-binding/schemas/SessionName';
 *    SessionName.make('verdant-muskrat');
 *    ```
 *
 * @since 0.1.0
 */

// ─── Service / utility namespaces ────────────────────────────────────────

export * as Zellij from './Zellij.ts';
export * as ZellijAction from './ZellijAction.ts';
export * as ZellijCli from './ZellijCli.ts';
export * as ZellijError from './ZellijError.ts';
export * as ZellijLayout from './ZellijLayout.ts';
export * as ZellijPane from './ZellijPane.ts';
export * as ZellijSession from './ZellijSession.ts';
export * as ZellijTab from './ZellijTab.ts';

// ─── Schema types (top-level type-only re-exports) ───────────────────────
//
// These collide in *type space* with `export * as Foo` namespace exports,
// so we expose only the types here. Deep-import the schema module when
// you need the constructor / guard / decoder surface.

export type { BlockStrategy } from './schemas/BlockStrategy.ts';
export type { ClientId } from './schemas/ClientId.ts';
export type { ClientInfo } from './schemas/ClientInfo.ts';
export type { Direction } from './schemas/Direction.ts';
export type { Mode } from './schemas/Mode.ts';
export type { PaneId } from './schemas/PaneId.ts';
export type { PaneInfo } from './schemas/PaneInfo.ts';
export type { PaneLocation } from './schemas/PaneLocation.ts';
export type { PaneSize } from './schemas/PaneSize.ts';
export type { ResizeDirection } from './schemas/ResizeDirection.ts';
export type { SessionName } from './schemas/SessionName.ts';
export type { SessionStatus } from './schemas/SessionStatus.ts';
export type { SubscribeEvent } from './schemas/SubscribeEvent.ts';
export type { TabId } from './schemas/TabId.ts';
export type { TabInfo } from './schemas/TabInfo.ts';
