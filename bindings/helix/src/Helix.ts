import * as Clock from 'effect/Clock';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
import * as Path from 'effect/Path';
import type { PlatformError } from 'effect/PlatformError';
import * as P from 'effect/Predicate';
import * as Random from 'effect/Random';
import * as Schema from 'effect/Schema';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';
import * as TOML from 'smol-toml';

// Path specifiers — resolved to absolute filesystem paths once at
// service-make time via the Path / FileSystem services. We deliberately
// avoid `import foo from '@workspace/helix-dotconfig/foo.toml'` and
// `... .yaml`: both rely on Bun-only loader extensions, and any Node
// consumer of this binding (e.g. the pi extension host) blows up on
// import as soon as the chain reaches us. Plain string specifiers +
// runtime read are loader-agnostic.
const HELIX_CONFIG_SPECIFIER = '@workspace/helix-dotconfig/config.toml';
const THEMES_BY_MODE_SPECIFIER =
	'@workspace/helix-dotconfig/themes-by-mode.json';

class ThemeSet extends Schema.Class<ThemeSet>('ThemeSet')({
	NORMAL: Schema.String,
	INSERT: Schema.String,
	SELECT: Schema.String
}) {}

class ThemesByMode extends Schema.Class<ThemesByMode>('ThemesByMode')({
	dark: ThemeSet,
	light: ThemeSet
}) {}

const decodeThemesByModeJson = Schema.decodeUnknownEffect(
	Schema.fromJsonString(ThemesByMode)
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
		if (firstChar !== '┌' && firstChar !== '│' && firstChar !== '└') break;
		i++;
	}
	while (i < lines.length) {
		const line = lines[i];
		if (line === undefined || line.trim() !== '') break;
		i++;
	}
	return lines.slice(i).join('\n').trim();
};

export class Helix extends Context.Service<Helix>()(
	'@workspace/helix-binding/Helix',
	{
		make: Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			// Resolve once at make-time. `import.meta.resolve(...)` is a
			// pure string operation supported in both Node and Bun for
			// ESM modules — it does not load the file, so a `.toml` /
			// `.json` target is fine here.
			const helixConfigPath = yield* path.fromFileUrl(
				new URL(import.meta.resolve(HELIX_CONFIG_SPECIFIER))
			);
			const themesByModePath = yield* path.fromFileUrl(
				new URL(import.meta.resolve(THEMES_BY_MODE_SPECIFIER))
			);

			const helixConfigToml = yield* fs.readFileString(helixConfigPath);
			// `TOML.parse` returns a `TomlTable` (typed as `{ [key: string]:
			// TomlValue }`), so the parsed value is already a record at the
			// type level — no cast needed. We narrow with `P.isObject` only at
			// the path we mutate; everything else is spread through verbatim.
			const helixConfig = TOML.parse(helixConfigToml);

			const themesByModeJson = yield* fs.readFileString(themesByModePath);
			const themesByMode = yield* decodeThemesByModeJson(
				themesByModeJson
			);

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
								prefix: `helix-capture-${timestamp}-${
									randomSuffix.toString(36)
								}`
							});

							const tempConfigPath = yield* fs.makeTempFileScoped(
								{
									prefix: `helix-config-${timestamp}-${
										randomSuffix.toString(36)
									}`,
									suffix: '.toml'
								}
							);

							const editor: Record<string, unknown> = P.isObject(
									helixConfig.editor
								)
								? helixConfig.editor
								: {};
							const statusline: Record<string, unknown> =
								P.isObject(
										editor.statusline
									)
									? editor.statusline
									: {};
							const modifiedConfig = {
								...helixConfig,
								editor: {
									...editor,
									statusline: {
										...statusline,
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
