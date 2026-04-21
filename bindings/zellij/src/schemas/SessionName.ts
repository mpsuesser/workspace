/**
 * Session name — a non-empty string identifying a zellij session.
 *
 * `zellij list-sessions` returns whimsical two-word names like
 * `verdant-muskrat`; this module brands the string so session names and
 * arbitrary strings don't get accidentally interchanged at call sites.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * Branded non-empty string representing a zellij session name.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const SessionName = Schema.NonEmptyString.pipe(
	Schema.brand('SessionName')
).annotate({
	identifier: 'SessionName',
	title: 'SessionName',
	description: 'Non-empty string identifying a zellij session.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type SessionName = typeof SessionName.Type;

/**
 * Type guard for `SessionName` — checks non-empty string.
 *
 * @category Guards
 * @since 0.1.0
 */
export const isSessionName = Schema.is(SessionName);

/**
 * Construct a `SessionName` from a raw string, validating non-emptiness.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const decodeUnknown = Schema.decodeUnknownEffect(SessionName);

/**
 * Sync constructor — throws if `value` is empty.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const make = Schema.decodeUnknownSync(SessionName);
