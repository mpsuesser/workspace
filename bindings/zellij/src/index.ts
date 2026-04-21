/**
 * @workspace/zellij-binding — Effect-first bindings for the Zellij CLI.
 *
 * Each namespace is a focused slice of the Zellij control surface:
 *
 * - {@link ZellijLayout}   author layouts as TypeScript, emit KDL
 * - {@link ZellijError}    shared error type with a reason-union
 *
 * Higher-level namespaces (ZellijCli, ZellijAction, ZellijPane, ZellijTab,
 * ZellijSession, Zellij) are landed one at a time; see PLAN.md.
 *
 * @since 0.1.0
 */

export * as ZellijError from './ZellijError.ts';
export * as ZellijLayout from './ZellijLayout.ts';

export * as Direction from './schemas/Direction.ts';
export * as Mode from './schemas/Mode.ts';
export * as PaneId from './schemas/PaneId.ts';
export * as PaneLocation from './schemas/PaneLocation.ts';
export * as ResizeDirection from './schemas/ResizeDirection.ts';
export * as SessionName from './schemas/SessionName.ts';
export * as TabId from './schemas/TabId.ts';
export * as ClientId from './schemas/ClientId.ts';
export * as BlockStrategy from './schemas/BlockStrategy.ts';
export * as PaneSize from './schemas/PaneSize.ts';
export * as PaneInfo from './schemas/PaneInfo.ts';
export * as TabInfo from './schemas/TabInfo.ts';
export * as ClientInfo from './schemas/ClientInfo.ts';
export * as SubscribeEvent from './schemas/SubscribeEvent.ts';
