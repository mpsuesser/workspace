/**
 * Shared pi ↔ zellij-sessions-bar state protocol.
 *
 * Each running pi process writes exactly one JSON record into a runtime
 * directory. The sidebar reads all fresh records, resolves their
 * rename-stable zellij session fingerprints to current session names, and
 * folds per-pane pi states into a single per-zellij-session state.
 *
 * @since 0.1.0
 */

import * as SessionFingerprint from '@workspace/zellij-binding/schemas/SessionFingerprint';
import * as SessionName from '@workspace/zellij-binding/schemas/SessionName';
import * as ZellijSession from '@workspace/zellij-binding/ZellijSession';
import { Clock, Duration, Effect, pipe } from 'effect';
import type * as PlatformError from 'effect/PlatformError';
import * as Arr from 'effect/Array';
import * as Bool from 'effect/Boolean';
import * as Config from 'effect/Config';
import * as FileSystem from 'effect/FileSystem';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as P from 'effect/Predicate';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

const STATE_DIR_NAME = 'pi-zellij-sessions-bar-integration';
const STATE_FILE_SUFFIX = '.json';

/** Heartbeat cadence used by the pi extension while it is loaded. */
export const HEARTBEAT_INTERVAL = Duration.seconds(5);

/**
 * Maximum age of a pi state record before the sidebar ignores it.
 * This makes hard-killed pi panes self-heal instead of sticking forever.
 */
export const FRESH_RECORD_WINDOW = Duration.seconds(20);

/** Agent state reported by one pi process. */
export const PiAgentRunState = Schema.Literals([
	'idle',
	'working',
	'done'
]).annotate({
	identifier: 'PiAgentRunState',
	title: 'PiAgentRunState',
	description: 'Run state reported by one pi process in a zellij pane.'
});

export type PiAgentRunState = typeof PiAgentRunState.Type;

/** Identity of one pi process inside one zellij pane. */
export class PiAgentSessionIdentity extends Schema.Class<PiAgentSessionIdentity>(
	'PiAgentSessionIdentity'
)(
	{
		sessionFingerprint: SessionFingerprint.SessionFingerprint,
		paneKey: Schema.NonEmptyString,
		pid: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))
	},
	{
		identifier: 'PiAgentSessionIdentity',
		title: 'PiAgentSessionIdentity',
		description:
			'Identity for one pi process, scoped to a zellij session fingerprint and pane.'
	}
) {}

/** Persisted status record for one pi process. */
export class PiAgentSessionStateRecord extends Schema.Class<PiAgentSessionStateRecord>(
	'PiAgentSessionStateRecord'
)(
	{
		schemaVersion: Schema.Literal(1),
		sessionFingerprint: SessionFingerprint.SessionFingerprint,
		paneKey: Schema.NonEmptyString,
		pid: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
		state: PiAgentRunState,
		updatedAtEpochMillis: Schema.Int.check(
			Schema.isGreaterThanOrEqualTo(0)
		)
	},
	{
		identifier: 'PiAgentSessionStateRecord',
		title: 'PiAgentSessionStateRecord',
		description: 'Persisted state record consumed by the zellij sessions bar.'
	}
) {}

const PiAgentSessionStateRecordJson = Schema.fromJsonString(
	PiAgentSessionStateRecord
);

export interface ResolvedPiAgentSessionStateRecord {
	readonly sessionName: SessionName.SessionName;
	readonly record: PiAgentSessionStateRecord;
}

const RunStateEq = Schema.toEquivalence(PiAgentRunState);
const SessionNameEq = Schema.toEquivalence(SessionName.SessionName);

const hasState =
	(target: PiAgentRunState) =>
	(states: ReadonlyArray<PiAgentRunState>): boolean =>
		Arr.some(states, (state) => RunStateEq(state, target));

/** Fold many pi process states into one zellij-session state. */
export const aggregateRunStates = (
	states: ReadonlyArray<PiAgentRunState>
): PiAgentRunState =>
	Bool.match(hasState('working')(states), {
		onTrue: () => 'working' as const,
		onFalse: () =>
			Bool.match(hasState('done')(states), {
				onTrue: () => 'done' as const,
				onFalse: () => 'idle' as const
			})
	});

/** Return the aggregate state for one zellij session from resolved records. */
export const aggregateRunStateForSession = (
	sessionName: SessionName.SessionName,
	records: ReadonlyArray<ResolvedPiAgentSessionStateRecord>
): PiAgentRunState =>
	pipe(
		records,
		Arr.filter((resolved) => SessionNameEq(resolved.sessionName, sessionName)),
		Arr.map((resolved) => resolved.record.state),
		aggregateRunStates
	);

/** Runtime directory containing pi state records. */
export const stateDirectory = Effect.fn(
	'PiZellijSessionsBarState.stateDirectory'
)(function* () {
	const path = yield* Path.Path;
	const xdgRuntimeDir = yield* Config.option(
		Config.string('XDG_RUNTIME_DIR')
	).asEffect().pipe(Effect.orDie);
	const tmpDir = yield* Config.option(Config.string('TMPDIR'))
		.asEffect()
		.pipe(Effect.orDie);
	const uid = yield* Effect.sync(() => process.getuid?.() ?? 0);

	return Option.match(xdgRuntimeDir, {
		onSome: (dir) => path.join(dir, STATE_DIR_NAME),
		onNone: () =>
			path.join(
				Option.match(tmpDir, {
					onSome: (dir) => dir,
					onNone: () => '/tmp'
				}),
				`${STATE_DIR_NAME}-${uid}`
			)
	});
});

const fileNameForIdentity = (identity: PiAgentSessionIdentity): string =>
	`${identity.sessionFingerprint.dev}-${identity.sessionFingerprint.ino}-${identity.paneKey}-${identity.pid}${STATE_FILE_SUFFIX}`;

const isNotFoundPlatformError = (
	error: PlatformError.PlatformError
): boolean => P.isTagged(error.reason, 'NotFound');

const stateRecordPath = Effect.fn(
	'PiZellijSessionsBarState.stateRecordPath'
)(function* (identity: PiAgentSessionIdentity) {
	const path = yield* Path.Path;
	const dir = yield* stateDirectory();
	return path.join(dir, fileNameForIdentity(identity));
});

/** Write a fresh state record for one pi process. */
export const writeAgentSessionState = Effect.fn(
	'PiZellijSessionsBarState.writeAgentSessionState'
)(function* (identity: PiAgentSessionIdentity, state: PiAgentRunState) {
	const fs = yield* FileSystem.FileSystem;
	const dir = yield* stateDirectory();
	const filePath = yield* stateRecordPath(identity);
	const updatedAtEpochMillis = yield* Clock.currentTimeMillis;
	const record = new PiAgentSessionStateRecord({
		schemaVersion: 1,
		sessionFingerprint: identity.sessionFingerprint,
		paneKey: identity.paneKey,
		pid: identity.pid,
		state,
		updatedAtEpochMillis
	});
	const encoded = yield* Schema.encodeEffect(PiAgentSessionStateRecordJson)(
		record
	);

	yield* fs.makeDirectory(dir, { recursive: true });
	yield* fs.writeFileString(filePath, encoded);
	return record;
});

/** Remove one pi process state record. Missing files are ignored. */
export const removeAgentSessionState = Effect.fn(
	'PiZellijSessionsBarState.removeAgentSessionState'
)(function* (identity: PiAgentSessionIdentity) {
	const fs = yield* FileSystem.FileSystem;
	const filePath = yield* stateRecordPath(identity);
	yield* fs.remove(filePath).pipe(
		Effect.catchTag('PlatformError', (error) =>
			isNotFoundPlatformError(error) ? Effect.void : Effect.fail(error)
		)
	);
});

const decodeRecordFile = (
	dir: string,
	entry: string
): Effect.Effect<
	Option.Option<PiAgentSessionStateRecord>,
	PlatformError.PlatformError,
	FileSystem.FileSystem | Path.Path
> =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		// Records are tiny one-object JSON files written by this extension;
		// reading the whole file is intentional and simpler than streaming.
		const content = yield* fs.readFileString(path.join(dir, entry));
		return yield* Schema.decodeUnknownEffect(PiAgentSessionStateRecordJson)(
			content
		).pipe(Effect.map(Option.some));
	}).pipe(
		Effect.catchTag('SchemaError', () => Effect.succeed(Option.none())),
		Effect.catchTag('PlatformError', (error) =>
			isNotFoundPlatformError(error)
				? Effect.succeed(Option.none())
				: Effect.fail(error)
		)
	);

/** Read all fresh pi state records from the runtime state directory. */
export const readAgentSessionStateRecords = Effect.fn(
	'PiZellijSessionsBarState.readAgentSessionStateRecords'
)((freshRecordWindow = FRESH_RECORD_WINDOW) =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const dir = yield* stateDirectory();
		const now = yield* Clock.currentTimeMillis;
		const maxAgeMillis = Duration.toMillis(freshRecordWindow);
		const entries = yield* fs.readDirectory(dir).pipe(
			Effect.catchTag('PlatformError', (error) =>
				isNotFoundPlatformError(error)
					? Effect.succeed<ReadonlyArray<string>>([])
					: Effect.fail(error)
			)
		);
		const decoded = yield* Effect.forEach(
			pipe(entries, Arr.filter(Str.endsWith(STATE_FILE_SUFFIX))),
			(entry) => decodeRecordFile(dir, entry),
			{ concurrency: 8 }
		);

		return pipe(
			decoded,
			Arr.getSomes,
			Arr.filter(
				(record) =>
					now - record.updatedAtEpochMillis <= maxAgeMillis
			)
		);
	})
);

/**
 * Read fresh records and resolve each zellij session fingerprint to the
 * session's current name. Records whose sessions no longer exist are ignored.
 */
export const readResolvedAgentSessionStateRecords = Effect.fn(
	'PiZellijSessionsBarState.readResolvedAgentSessionStateRecords'
)(() =>
	Effect.gen(function* () {
		const session = yield* ZellijSession.Service;
		const records = yield* readAgentSessionStateRecords();
		const resolved = yield* Effect.forEach(
			records,
			(record) =>
				session.findByFingerprint(record.sessionFingerprint).pipe(
					Effect.map(
						Option.map((sessionName) => ({ record, sessionName }))
					),
					Effect.catchTag('ZellijError', () =>
						Effect.succeed(Option.none())
					)
				),
			{ concurrency: 8 }
		);

		return Arr.getSomes(resolved);
	})
);
