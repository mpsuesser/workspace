/**
 * ClientInfo — a row from `zellij action list-clients`.
 *
 * Unlike `list-panes`/`list-tabs`, `list-clients` emits plain whitespace-
 * aligned text (no `--json` flag supported as of zellij 0.44). This module
 * decodes each line into a `ClientInfo` class.
 *
 * Output format:
 * ```
 * CLIENT_ID ZELLIJ_PANE_ID RUNNING_COMMAND
 * 1         terminal_3     vim /tmp/notes.txt
 * 2         plugin_2       zellij:session-manager
 * ```
 *
 * Decoding uses a plain text parser (not Schema) because the header row
 * needs to be stripped and the third column can contain spaces.
 *
 * @since 0.1.0
 */

import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

import * as ClientIdSchema from './ClientId.ts';
import * as PaneId from './PaneId.ts';

/**
 * Decoded row of `zellij action list-clients`.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class ClientInfo extends Schema.Class<ClientInfo>('ClientInfo')(
	{
		clientId: ClientIdSchema.ClientId,
		paneId: PaneId.PaneId,
		runningCommand: Schema.OptionFromUndefinedOr(Schema.String)
	},
	{
		identifier: 'ClientInfo',
		title: 'ClientInfo',
		description: 'A row of `zellij action list-clients`.'
	}
) {}

// Match three whitespace-delimited leading columns, then the rest of the line
// (which may contain spaces) as the running command.
const LINE_PATTERN = /^(\S+)\s+(\S+)\s*(.*)$/u;

const parseLine = (line: string): Option.Option<ClientInfo> => {
	const match = LINE_PATTERN.exec(line);
	if (match === null) return Option.none();
	const [, idRaw, paneRaw, rest] = match;
	if (idRaw === undefined || paneRaw === undefined) return Option.none();

	const clientIdNum = Number.parseInt(idRaw, 10);
	if (!Number.isFinite(clientIdNum) || clientIdNum <= 0) return Option.none();

	const paneId = PaneId.fromCliArg(paneRaw);
	if (Option.isNone(paneId)) return Option.none();

	const trimmedRest = (rest ?? '').trim();
	return Option.some(
		new ClientInfo({
			clientId: ClientIdSchema.make(clientIdNum),
			paneId: paneId.value,
			runningCommand:
				trimmedRest.length === 0
					? Option.none()
					: Option.some(trimmedRest)
		})
	);
};

/**
 * Parse the full stdout of `zellij action list-clients`. Drops the header
 * row (`CLIENT_ID ZELLIJ_PANE_ID RUNNING_COMMAND`) and any blank lines; each
 * remaining line is parsed into a `ClientInfo`. Lines that don't match the
 * expected shape are silently dropped rather than failing the whole parse.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const parseOutput = (output: string): ReadonlyArray<ClientInfo> =>
	pipe(
		Str.split('\n')(output),
		Arr.map(Str.trim),
		Arr.filter((line) => line.length > 0 && !line.startsWith('CLIENT_ID')),
		Arr.filterMap(parseLine)
	);
