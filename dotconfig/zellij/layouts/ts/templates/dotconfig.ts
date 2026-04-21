/**
 * dotconfig — reusable Zellij layout template for editing a dotconfig
 * directory with a pi chat alongside.
 *
 * Shape: a horizontal split (two side-by-side panes) where:
 *  - Left (60%): a shell at the dotconfig `cwd`, focused on startup.
 *  - Right (40%): an interactive `pi` chat pane, also rooted at `cwd` so
 *    the agent has the right file context.
 *
 * Per-layout files import this template and pass their dotconfig path.
 *
 * @since 0.1.0
 */

import * as ZellijLayout from '@workspace/zellij-binding/ZellijLayout';

/**
 * Params for {@link dotconfig}.
 *
 * @since 0.1.0
 */
export interface DotconfigParams {
	/** Absolute path to the dotconfig directory. Inherited by both panes. */
	readonly cwd: string;
	/** Optional friendly name (reserved; currently unused at render time). */
	readonly name?: string;
	/**
	 * Command invocation for the chat pane. Defaults to `['pi']`.
	 * Use `['pi', '-c']` for continue-previous-session behavior, etc.
	 */
	readonly pi?: readonly [string, ...ReadonlyArray<string>];
	/** Size (percent or rows) for the left shell pane. Default `"60%"`. */
	readonly leftSize?: ZellijLayout.PaneSize;
	/** Size (percent or rows) for the right pi pane. Default `"40%"`. */
	readonly rightSize?: ZellijLayout.PaneSize;
}

const defaultPi = ['pi'] as const;

/**
 * Construct a "dotconfig IDE" layout for a single dotconfig directory.
 *
 * @since 0.1.0
 * @example
 * import { dotconfig } from './templates/dotconfig.ts'
 *
 * export default dotconfig({
 *   name: 'zellij',
 *   cwd: '/Users/m/repos/workspace/dotconfig/zellij'
 * })
 */
export const dotconfig = (params: DotconfigParams): ZellijLayout.Layout =>
	ZellijLayout.make({
		cwd: params.cwd,
		panes: [
			ZellijLayout.hsplit([
				ZellijLayout.shell({
					focus: true,
					size: params.leftSize ?? '60%'
				}),
				ZellijLayout.command(params.pi ?? defaultPi, {
					name: 'pi',
					size: params.rightSize ?? '40%'
				})
			])
		]
	});
