/**
 * SessionStatus — a row from `zellij list-sessions` (the long form, without
 * `-s`).
 *
 * Unlike `list-sessions -s` which emits one bare name per line, the
 * default form decorates each line with creation duration and an optional
 * marker (`(current)` for the session this CLI invocation is associated
 * with, `(EXITED - attach to resurrect)` for a resurrectable session).
 * Run with `--no-formatting` (`-n`) to strip the ANSI colours; the bare
 * output then looks like:
 *
 * ```
 * littlebird [Created 4days 10h 14m 8s ago]
 * sidebar [Created 22m 32s ago] (current)
 * old-thing [Created 3days ago] (EXITED - attach to resurrect)
 * ```
 *
 * This module decodes one such line into a {@link SessionStatus} record
 * and exposes {@link parseOutput} to fan that out across the full stdout.
 *
 * @since 0.1.0
 */

import { pipe } from 'effect';
import * as Arr from 'effect/Array';
import * as Duration from 'effect/Duration';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

import * as SessionNameSchema from './SessionName.ts';

/**
 * Decoded row of `zellij list-sessions`.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class SessionStatus extends Schema.Class<SessionStatus>(
	'SessionStatus'
)(
	{
		name: SessionNameSchema.SessionName,
		/**
		 * How long ago the session was created, captured at the moment
		 * the `list-sessions` command ran. Treat this as a snapshot —
		 * re-fetch for a fresh value.
		 */
		createdAgo: Schema.Duration,
		/**
		 * `true` for the session this CLI invocation is associated with
		 * (zellij prints `(current)` next to that line). Always `false`
		 * when called from outside any session.
		 */
		isCurrent: Schema.Boolean,
		/**
		 * `true` when the session is in zellij's resurrection cache rather
		 * than actively running (zellij prints
		 * `(EXITED - attach to resurrect)`).
		 */
		isExited: Schema.Boolean
	},
	{
		identifier: 'SessionStatus',
		title: 'SessionStatus',
		description: 'A row of `zellij list-sessions`.'
	}
) {}

// ─── Duration parser ─────────────────────────────────────────────────────
//
// zellij formats creation durations via humantime, e.g.
// `4days 10h 14m 8s`. The unit grammar is open enough that we keep this
// parser tolerant: each fragment is `<integer><unit>` with the unit
// matched against a small alphabet of long/short forms. Unknown
// fragments are silently dropped.

const FRAGMENT_PATTERN =
	/(\d+)\s*(years?|months?|weeks?|days?|hours?|minutes?|seconds?|ms|y|w|d|h|m|s)\b/giu;

const unitToDuration = (n: number, unit: string): Duration.Duration => {
	const u = unit.toLowerCase();
	if (u === 'ms') return Duration.millis(n);
	// `years` / `y` — coarse approximation; sessions are unlikely to live
	// long enough for the mismatch to matter for sort ordering.
	if (u.startsWith('y')) return Duration.weeks(n * 52);
	// `months` / `mo*` — must be checked before the generic `m` branch.
	if (u.startsWith('mo')) return Duration.weeks(n * 4);
	if (u.startsWith('w')) return Duration.weeks(n);
	if (u.startsWith('d')) return Duration.days(n);
	if (u.startsWith('h')) return Duration.hours(n);
	if (u.startsWith('s')) return Duration.seconds(n);
	// `m`, `min`, `mins`, `minute(s)` — generic-`m` fallthrough. `mo*`
	// is handled above so months don't end up here.
	return Duration.minutes(n);
};

const parseFragment = (
	match: RegExpMatchArray
): Option.Option<Duration.Duration> =>
	Option.gen(function* () {
		const numRaw = yield* Option.fromNullishOr(match[1]);
		const unit = yield* Option.fromNullishOr(match[2]);
		const n = Number.parseInt(numRaw, 10);
		if (!Number.isFinite(n)) return yield* Option.none<never>();
		return unitToDuration(n, unit);
	});

const parseDuration = (raw: string): Duration.Duration =>
	pipe(
		Arr.fromIterable(raw.matchAll(FRAGMENT_PATTERN)),
		Arr.filterMap((match) =>
			Result.fromOption(parseFragment(match), () => null)
		),
		Arr.reduce(Duration.zero, Duration.sum)
	);

// ─── Line parser ─────────────────────────────────────────────────────────

// `<name> [Created <duration> ago]` with an optional `(<marker>)` suffix.
// Anchored to start/end of an already-trimmed line.
const LINE_PATTERN = /^(\S+)\s+\[Created\s+(.+?)\s+ago\](?:\s+\(([^)]+)\))?$/u;

const parseLine = (line: string): Option.Option<SessionStatus> =>
	Option.gen(function* () {
		const match = yield* Option.fromNullishOr(LINE_PATTERN.exec(line));
		const nameRaw = yield* Option.fromNullishOr(match[1]);
		const durationRaw = yield* Option.fromNullishOr(match[2]);
		if (!SessionNameSchema.isSessionName(nameRaw)) {
			return yield* Option.none<never>();
		}

		const marker = (match[3] ?? '').toLowerCase();
		return new SessionStatus({
			name: nameRaw,
			createdAgo: parseDuration(durationRaw),
			isCurrent: marker === 'current',
			isExited: marker.startsWith('exited')
		});
	});

/**
 * Parse the full stdout of `zellij list-sessions --no-formatting`. Blank
 * lines are dropped; lines that don't match the expected shape are
 * silently skipped rather than failing the whole parse, mirroring how
 * {@link ./ClientInfo.parseOutput} treats malformed rows.
 *
 * The caller is responsible for passing `--no-formatting` (or otherwise
 * stripping ANSI escape codes) — the regex used here matches the bare
 * line shape, not the colourised default output.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const parseOutput = (output: string): ReadonlyArray<SessionStatus> =>
	pipe(
		Str.split('\n')(output),
		Arr.map(Str.trim),
		Arr.filter(Str.isNonEmpty),
		Arr.filterMap((line) => Result.fromOption(parseLine(line), () => null))
	);
