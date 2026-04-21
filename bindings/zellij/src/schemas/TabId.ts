/**
 * Tab ID — stable integer identifier assigned by zellij.
 *
 * Distinct from tab "position", which is the ordinal index (0-based) visible
 * in `zellij action list-tabs`. IDs are stable across reorders; positions
 * are not.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * Branded non-negative integer tab id.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const TabId = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)).pipe(
	Schema.brand('TabId')
).annotate({
	identifier: 'TabId',
	title: 'TabId',
	description: 'Stable integer ID of a zellij tab.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type TabId = typeof TabId.Type;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isTabId = Schema.is(TabId);

/**
 * @category Constructors
 * @since 0.1.0
 */
export const decodeUnknown = Schema.decodeUnknownEffect(TabId);

/**
 * @category Constructors
 * @since 0.1.0
 */
export const make = Schema.decodeUnknownSync(TabId);

/**
 * Format a `TabId` as the decimal string zellij's CLI expects.
 *
 * @category Encoding
 * @since 0.1.0
 */
export const toCliArg = (id: TabId): string => String(id);
