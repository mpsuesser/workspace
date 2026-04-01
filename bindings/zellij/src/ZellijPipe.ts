import * as Effect from 'effect/Effect';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

export interface PipeOptions {
	readonly name?: string;
	readonly args?: string;
	readonly plugin?: string;
	readonly pluginConfiguration?: string;
}

export const pipe = (payload: string, options?: PipeOptions) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args: Array<string> = ['pipe'];

		if (options?.name) args.push('-n', options.name);
		if (options?.args) args.push('-a', options.args);
		if (options?.plugin) args.push('-p', options.plugin);
		if (options?.pluginConfiguration)
			args.push('-c', options.pluginConfiguration);

		args.push('--', payload);

		const cmd = ChildProcess.make('zellij', args);
		return yield* spawner.string(cmd);
	});

export const broadcast = (name: string, payload: string) =>
	pipe(payload, {
		name
	});

export const sendToPlugin = (plugin: string, name: string, payload: string) =>
	pipe(payload, {
		name,
		plugin
	});
