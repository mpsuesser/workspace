/**
 * Client ID — integer identifier for a client connection to a zellij session.
 *
 * Surfaced by `zellij action list-clients`. A single session can have
 * multiple attached clients (and each client has its own focused pane).
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * Branded positive integer client id.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const ClientId = Schema.Int.check(Schema.isGreaterThan(0)).pipe(
	Schema.brand('ClientId')
).annotate({
	identifier: 'ClientId',
	title: 'ClientId',
	description: 'Integer ID of a client connected to a zellij session.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type ClientId = typeof ClientId.Type;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isClientId = Schema.is(ClientId);

/**
 * @category Constructors
 * @since 0.1.0
 */
export const decodeUnknown = Schema.decodeUnknownEffect(ClientId);

/**
 * Sync constructor — throws if `value` is not a positive integer.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const make = Schema.decodeUnknownSync(ClientId);
