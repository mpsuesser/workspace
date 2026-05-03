/**
 * pi-zellij-sessions-bar-integration — pi-side companion for
 * `apps/zellij-vertical-sessions-bar`.
 *
 * Each pi process writes a tiny state record keyed by zellij session
 * fingerprint + pane id + pid. The sidebar folds all fresh records for a
 * zellij session using `working > done > idle`, so multiple pi panes in the
 * same zellij session are represented correctly.
 *
 * @since 0.1.0
 */

import { WorkspaceRuntimeLayer } from '@workspace/runtime';
import * as PaneId from '@workspace/zellij-binding/schemas/PaneId';
import { ZellijPane, ZellijSession } from '@workspace/zellij-binding';
import { Effect, Ref } from 'effect';
import * as Cause from 'effect/Cause';
import * as Exit from 'effect/Exit';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import * as Schedule from 'effect/Schedule';

import {
	HEARTBEAT_INTERVAL,
	PiAgentSessionIdentity,
	removeAgentSessionState,
	writeAgentSessionState,
	type PiAgentRunState
} from './src/state.ts';

interface RuntimeRefs {
	readonly currentState: Ref.Ref<PiAgentRunState>;
	readonly identity: Ref.Ref<Option.Option<PiAgentSessionIdentity>>;
	readonly offTerminalInput: Ref.Ref<Option.Option<() => void>>;
}

interface PiSessionContext {
	readonly ui: {
		readonly onTerminalInput: (
			handler: (data: string) => string | undefined | void
		) => () => void;
	};
}

interface PiExtensionApi {
	on(
		event: 'session_start',
		listener: (event: unknown, context: PiSessionContext) => Promise<void>
	): void;
	on(event: 'agent_start' | 'agent_end' | 'session_shutdown', listener: () => Promise<void>): void;
}

const makeRuntimeRefs = Effect.fn(
	'PiZellijSessionsBarIntegration.makeRuntimeRefs'
)(function* () {
	const currentState = yield* Ref.make<PiAgentRunState>('idle');
	const identity = yield* Ref.make<Option.Option<PiAgentSessionIdentity>>(
		Option.none()
	);
	const offTerminalInput = yield* Ref.make<Option.Option<() => void>>(
		Option.none()
	);
	return { currentState, identity, offTerminalInput } satisfies RuntimeRefs;
});

const logStateWriteFailure = (operation: string, cause: Cause.Cause<unknown>) =>
	Effect.logWarning(
		`pi-zellij-sessions-bar-integration: ${operation} failed`,
		{ cause }
	);

const isPrintableInput = (data: string): boolean => {
	if (data.length === 0) return false;
	if (data.startsWith('\x1b')) return false;
	return [...data].some((char) => {
		const codePoint = char.codePointAt(0);
		return codePoint !== undefined && codePoint >= 32;
	});
};

export default async function (pi: PiExtensionApi): Promise<void> {
	const runtime = ManagedRuntime.make(WorkspaceRuntimeLayer);
	const refs = await runtime.runPromise(makeRuntimeRefs());
	let isShuttingDown = false;

	const runPromiseIgnoringInterrupts = async <A, E>(
		effect: Effect.Effect<
			A,
			E,
			ManagedRuntime.ManagedRuntime.Services<typeof runtime>
		>
	): Promise<Option.Option<A>> => {
		const exit = await runtime.runPromiseExit(effect);
		if (Exit.isSuccess(exit)) return Option.some(exit.value);
		if (Cause.hasInterruptsOnly(exit.cause)) return Option.none();
		throw Cause.squash(exit.cause);
	};

	const disposeRuntimeIgnoringInterrupts = async (): Promise<void> => {
		const exit = await Effect.runPromiseExit(runtime.disposeEffect);
		if (Exit.isSuccess(exit) || Cause.hasInterruptsOnly(exit.cause)) return;
		throw Cause.squash(exit.cause);
	};

	const publishStateEffect = (state: PiAgentRunState) =>
		Effect.gen(function* () {
			yield* Ref.set(refs.currentState, state);
			const identity = yield* Ref.get(refs.identity);
			if (Option.isNone(identity)) return;

			yield* writeAgentSessionState(identity.value, state).pipe(
				Effect.catchCause((cause) =>
					logStateWriteFailure(`publish ${state}`, cause)
				)
			);
		});

	const publishState = (state: PiAgentRunState) =>
		isShuttingDown
			? Promise.resolve(Option.none<void>())
			: runPromiseIgnoringInterrupts(publishStateEffect(state));

	pi.on('session_start', async (_event, ctx) => {
		const identity = Option.flatten(
			await runPromiseIgnoringInterrupts(
				Effect.gen(function* () {
					const session = yield* ZellijSession.Service;
					const pane = yield* ZellijPane.Service;
					const fingerprint = yield* session.fingerprintCurrent();
					const paneId = yield* pane.currentId();
					const pid = yield* Effect.sync(() => process.pid);

					const identity = Option.flatMap(
						fingerprint,
						(sessionFingerprint) =>
							Option.map(
								paneId,
								(paneId) =>
									new PiAgentSessionIdentity({
										sessionFingerprint,
										paneKey: PaneId.toCliArg(paneId),
										pid
									})
							)
					);
					yield* Ref.set(refs.identity, identity);
					return identity;
				}).pipe(
					Effect.catchTag('ZellijError', (error) =>
						Effect.logDebug(
							'pi-zellij-sessions-bar-integration: disabled outside zellij',
							{ error }
						).pipe(Effect.as(Option.none<PiAgentSessionIdentity>()))
					)
				)
			)
		);

		await publishState('idle');

		if (Option.isSome(identity)) {
			runtime.runFork(
				Effect.gen(function* () {
					const currentState = yield* Ref.get(refs.currentState);
					yield* writeAgentSessionState(identity.value, currentState);
				}).pipe(
					Effect.repeat(Schedule.spaced(HEARTBEAT_INTERVAL)),
					Effect.catchCause((cause) =>
						Cause.hasInterruptsOnly(cause)
							? Effect.void
							: logStateWriteFailure('heartbeat', cause)
					)
				)
			);
		}

		const offTerminalInput = ctx.ui.onTerminalInput((data) => {
			runtime.runFork(
				Effect.gen(function* () {
					const currentState = yield* Ref.get(refs.currentState);
					if (currentState === 'done' && isPrintableInput(data)) {
						yield* publishStateEffect('idle');
					}
				}).pipe(
					Effect.catchCause((cause) =>
						Cause.hasInterruptsOnly(cause)
							? Effect.void
							: logStateWriteFailure(
									'terminal input state reset',
									cause
								)
					)
				)
			);
			return undefined;
		});
		await runPromiseIgnoringInterrupts(
			Ref.set(refs.offTerminalInput, Option.some(offTerminalInput))
		);
	});

	pi.on('agent_start', async () => {
		await publishState('working');
	});

	pi.on('agent_end', async () => {
		await publishState('done');
	});

	pi.on('session_shutdown', async () => {
		isShuttingDown = true;
		await runPromiseIgnoringInterrupts(
			Effect.gen(function* () {
				const offTerminalInput = yield* Ref.get(refs.offTerminalInput);
				yield* Option.match(offTerminalInput, {
					onNone: () => Effect.void,
					onSome: (off) => Effect.sync(off)
				});
				yield* Ref.set(refs.offTerminalInput, Option.none());

				const identity = yield* Ref.get(refs.identity);
				if (Option.isSome(identity)) {
					yield* removeAgentSessionState(identity.value).pipe(
						Effect.catchCause((cause) =>
							logStateWriteFailure('shutdown cleanup', cause)
						)
					);
				}

				yield* Ref.set(refs.identity, Option.none());
				yield* Ref.set(refs.currentState, 'idle');
			})
		);
		await disposeRuntimeIgnoringInterrupts();
	});
}
