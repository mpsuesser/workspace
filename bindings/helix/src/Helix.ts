import helixConfig from '@workspace/helix-dotconfig/config.toml';
import themesByMode from '@workspace/helix-dotconfig/themes-by-mode.yaml';
import * as Clock from 'effect/Clock';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
import type { PlatformError } from 'effect/PlatformError';
import * as Random from 'effect/Random';
import * as Context from 'effect/Context';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';
import * as TOML from 'smol-toml';

export class Helix extends Context.Service<Helix>()(
	'@workspace/helix-binding/Helix',
	{
		make: Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			const open = Effect.fn('Helix.open')((...args: Array<string>) =>
				Effect.scoped(
					Effect.gen(function* () {
						const cmd = ChildProcess.make('hx', [...args], {
							env: {
								HX_MODETHEME_INSERT: themesByMode.dark.INSERT,
								HX_MODETHEME_NORMAL: themesByMode.dark.NORMAL,
								HX_MODETHEME_SELECT: themesByMode.dark.SELECT
							},
							stdin: 'inherit',
							stdout: 'inherit',
							stderr: 'inherit'
						});
						const process = yield* spawner.spawn(cmd);
						yield* Effect.addFinalizer(() =>
							process.kill().pipe(Effect.ignore)
						);
						return yield* process.exitCode;
					})
				)
			);

			const makePromptFence = (
				prompt: string
			): {
				content: string;
				cursorLine: number;
			} => {
				const lines = prompt.split('\n');
				const maxLen = Math.max(...lines.map((l) => l.length), 30);
				const border = '─'.repeat(maxLen + 2);
				const top = `┌${border}┐`;
				const bottom = `└${border}┘`;
				const middle = lines.map((l) => `│ ${l.padEnd(maxLen)} │`);
				const content = [top, ...middle, bottom, '', ''].join('\n');
				const cursorLine = lines.length + 4;
				return {
					content,
					cursorLine
				};
			};

			const stripPromptFence = (content: string): string => {
				const lines = content.split('\n');
				let i = 0;
				while (i < lines.length) {
					const line = lines[i];
					if (line === undefined) break;
					const firstChar = line[0];
					if (
						firstChar !== '┌' &&
						firstChar !== '│' &&
						firstChar !== '└'
					)
						break;
					i++;
				}
				while (i < lines.length) {
					const line = lines[i];
					if (line === undefined || line.trim() !== '') break;
					i++;
				}
				return lines.slice(i).join('\n').trim();
			};

			const captureNewTextEntry = Effect.fn('Helix.captureNewTextEntry')(
				(options?: {
					withPrompt?: string;
					initialContent?: string;
				}): Effect.Effect<string, PlatformError> =>
					Effect.scoped(
						Effect.gen(function* () {
							const timestamp = yield* Clock.currentTimeMillis;
							const randomSuffix = yield* Random.nextIntBetween(
								0,
								0x7fffffff
							);

							const tempFile = yield* fs.makeTempFileScoped({
								prefix: `helix-capture-${timestamp}-${randomSuffix.toString(36)}`
							});

							const tempConfigPath = yield* fs.makeTempFileScoped(
								{
									prefix: `helix-config-${timestamp}-${randomSuffix.toString(36)}`,
									suffix: '.toml'
								}
							);

							const modifiedConfig = {
								...helixConfig,
								editor: {
									...helixConfig.editor,
									statusline: {
										...helixConfig.editor.statusline,
										center: []
									}
								}
							};
							yield* fs.writeFileString(
								tempConfigPath,
								TOML.stringify(modifiedConfig)
							);

							const promptFence = options?.withPrompt
								? makePromptFence(options.withPrompt)
								: undefined;

							let fileContent = '';
							if (promptFence) {
								fileContent = promptFence.content;
							}
							if (options?.initialContent) {
								fileContent += options.initialContent;
							}

							if (fileContent) {
								yield* fs.writeFileString(
									tempFile,
									fileContent
								);
							}

							const fileArg = promptFence
								? `${tempFile}:${promptFence.cursorLine}`
								: tempFile;

							yield* open('-c', tempConfigPath, fileArg);

							const rawContent = (yield* fs.readFileString(
								tempFile
							)).trim();

							const content = options?.withPrompt
								? stripPromptFence(rawContent)
								: rawContent;

							return content;
						})
					)
			);

			return {
				captureNewTextEntry,
				open
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make);
}
