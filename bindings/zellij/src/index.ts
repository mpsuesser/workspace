/**
 * @workspace/zellij-binding — Effect-first bindings for the Zellij CLI.
 *
 * Each namespace is a focused slice of the Zellij control surface:
 *
 * - {@link ZellijLayout}   author layouts as TypeScript, emit KDL
 * - {@link ZellijError}    shared error type with a reason-union
 * - {@link ZellijCli}      internal CLI runner service (foundation for the
 *                          higher-level Action/Pane/Tab/Session namespaces)
 *
 * Higher-level namespaces (ZellijAction, ZellijPane, ZellijTab,
 * ZellijSession, Zellij) are landed one at a time; see PLAN.md.
 *
 * @since 0.1.0
 */

export * as ZellijCli from './ZellijCli.ts';
export * as ZellijError from './ZellijError.ts';
export * as ZellijLayout from './ZellijLayout.ts';

export * as BlockStrategy from './schemas/BlockStrategy.ts';
export * as ClientId from './schemas/ClientId.ts';
export * as ClientInfo from './schemas/ClientInfo.ts';
export * as Direction from './schemas/Direction.ts';
export * as Mode from './schemas/Mode.ts';
export * as PaneId from './schemas/PaneId.ts';
export * as PaneInfo from './schemas/PaneInfo.ts';
export * as PaneLocation from './schemas/PaneLocation.ts';
export * as PaneSize from './schemas/PaneSize.ts';
export * as ResizeDirection from './schemas/ResizeDirection.ts';
export * as SessionName from './schemas/SessionName.ts';
export * as SubscribeEvent from './schemas/SubscribeEvent.ts';
export * as TabId from './schemas/TabId.ts';
export * as TabInfo from './schemas/TabInfo.ts';
