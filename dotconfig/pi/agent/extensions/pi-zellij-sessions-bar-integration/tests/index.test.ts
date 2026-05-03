import * as BunServices from '@effect/platform-bun/BunServices';
import { describe, expect, it } from 'bun:test';
import { Effect, FileSystem, Path, Stream } from 'effect';
import * as Schema from 'effect/Schema';
import { ChildProcess, ChildProcessSpawner } from 'effect/unstable/process';

const JsonString = Schema.fromJsonString(Schema.String);
const encodeJsonString = Schema.encodeSync(JsonString);

const makeRaceScript = (extensionPath: string): string => `
import extension from ${encodeJsonString(extensionPath)};

const handlers = new Map();
const pi = {
	on(event, listener) {
		handlers.set(event, [...(handlers.get(event) ?? []), listener]);
	}
};
const ctx = {
	ui: {
		onTerminalInput() {
			return () => undefined;
		}
	}
};
const emit = (event, ...args) =>
	Promise.all((handlers.get(event) ?? []).map((handler) => handler(...args)))
		.then(() => undefined);

await extension(pi);
await emit('session_start', { type: 'session_start' }, ctx);
await Promise.all([emit('agent_end'), emit('session_shutdown')]);
`;

const runRaceRepro = Effect.fn(
	'PiZellijSessionsBarIntegrationTest.runRaceRepro'
)(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const tempDir = yield* fs.makeTempDirectoryScoped({
		prefix: 'pi-zellij-ext-'
	});
	const socketDir = path.join(tempDir, 'socket');
	const contractDir = path.join(socketDir, 'contract_version_1');
	const sessionName = 'test-session';
	const scriptPath = path.join(tempDir, 'race-repro.ts');
	const extensionPath = path.resolve(
		'dotconfig/pi/agent/extensions/pi-zellij-sessions-bar-integration/index.ts'
	);

	yield* fs.makeDirectory(contractDir, { recursive: true });
	yield* fs.writeFileString(path.join(contractDir, sessionName), '');
	yield* fs.writeFileString(scriptPath, makeRaceScript(extensionPath));

	const handle = yield* spawner.spawn(
		ChildProcess.make('bun', [scriptPath], {
			env: {
				ZELLIJ_PANE_ID: '1',
				ZELLIJ_SESSION_NAME: sessionName,
				ZELLIJ_SOCKET_DIR: socketDir
			},
			extendEnv: true,
			stdin: 'ignore'
		})
	);
	const output = yield* Stream.mkString(Stream.decodeText(handle.all));
	const exitCode = yield* handle.exitCode;
	return { exitCode, output };
});

describe('pi-zellij-sessions-bar-integration', () => {
	it('does not report interrupt-only failures when agent end races shutdown', () =>
		Effect.runPromise(
			Effect.gen(function* () {
				const result = yield* runRaceRepro();
				expect(result.exitCode).toBe(ChildProcessSpawner.ExitCode(0));
				expect(result.output).not.toContain(
					'All fibers interrupted without error'
				);
			}).pipe(Effect.scoped, Effect.provide(BunServices.layer))
		));
});
