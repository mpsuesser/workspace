import * as Arr from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as P from 'effect/Predicate';
import * as R from 'effect/Record';
import * as Context from 'effect/Context';

import { Ghostty } from './Ghostty.ts';
import { type GhosttyCliError, GhosttyConfigError } from './GhosttyError.ts';

export const parseConfig = (content: string): Record<string, string> =>
	Arr.reduce(
		content.split('\n'),
		{} as Record<string, string>,
		(acc, line) => {
			const trimmed = line.trim();
			if (trimmed === '' || trimmed.startsWith('#')) {
				return acc;
			}
			const eqIndex = trimmed.indexOf('=');
			if (eqIndex === -1) {
				return acc;
			}
			const key = trimmed.slice(0, eqIndex).trim();
			const value = trimmed.slice(eqIndex + 1).trim();
			if (key !== '') {
				return { ...acc, [key]: value };
			}
			return acc;
		}
	);

export const serializeConfig = (config: Record<string, string>): string =>
	R.toEntries(config)
		.map(([key, value]) => `${key} = ${value}`)
		.join('\n');

const updateConfigContent = (
	content: string,
	key: string,
	value: string
): string => {
	const lines = content.split('\n');
	const keyPattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=`);
	const existingIndex = Arr.findFirstIndex(lines, (line) =>
		keyPattern.test(line)
	);

	if (Option.isSome(existingIndex)) {
		const updated = [...lines];
		updated[existingIndex.value] = `${key} = ${value}`;
		return updated.join('\n');
	}

	const hasNonEmpty = Arr.some(lines, (line) => line.trim() !== '');
	if (!hasNonEmpty) {
		return `${key} = ${value}`;
	}

	const lastNonEmptyIndex = Arr.findLastIndex(
		lines,
		(line) => line.trim() !== ''
	);
	const insertAt = Option.match(lastNonEmptyIndex, {
		onNone: () => lines.length,
		onSome: (i) => i + 1
	});

	const result = [...lines];
	result.splice(insertAt, 0, `${key} = ${value}`);
	return result.join('\n');
};

const removeConfigKey = (content: string, key: string): string => {
	const lines = content.split('\n');
	const keyPattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=`);
	return Arr.filter(lines, (line) => !keyPattern.test(line)).join('\n');
};

const escapeRegex = (str: string): string =>
	str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const detectDarwin = (global: unknown): boolean =>
	P.isObject(global) &&
	P.hasProperty(global, 'process') &&
	P.isObject(global.process) &&
	P.hasProperty(global.process, 'platform') &&
	global.process.platform === 'darwin';

const HomeConfig = Config.string('HOME');
const XdgConfigHomeConfig = Config.option(Config.string('XDG_CONFIG_HOME'));

const getConfigPaths = Effect.fn('GhosttyConfig.getConfigPaths')(
	(
		pathService: Path.Path
	): Effect.Effect<ReadonlyArray<string>, GhosttyConfigError> =>
		Effect.gen(function* () {
			const home = yield* HomeConfig;
			const xdgConfigHomeOption = yield* XdgConfigHomeConfig;
			const xdgConfigHome = Option.getOrElse(xdgConfigHomeOption, () =>
				pathService.join(home, '.config')
			);
			const xdgPath = pathService.join(
				xdgConfigHome,
				'ghostty',
				'config'
			);
			const macOsPath = pathService.join(
				home,
				'Library',
				'Application Support',
				'com.mitchellh.ghostty',
				'config'
			);

			const isDarwin = yield* Effect.sync(() => detectDarwin(globalThis));
			return isDarwin ? [xdgPath, macOsPath] : [xdgPath];
		}).pipe(
			Effect.catchTag('ConfigError', (error) =>
				Effect.fail(
					new GhosttyConfigError({
						message: `Environment variable not set: ${error.message}`
					})
				)
			)
		)
);

const findExistingConfigPath = (
	fs: FileSystem.FileSystem,
	paths: ReadonlyArray<string>
): Effect.Effect<Option.Option<string>, GhosttyConfigError> =>
	Effect.forEach(paths, (p) =>
		fs.exists(p).pipe(
			Effect.map((exists) => [p, exists] as const),
			Effect.orElseSucceed(() => [p, false] as const)
		)
	).pipe(
		Effect.map((results) =>
			Arr.findFirst(results, ([, exists]) => exists).pipe(
				Option.map(([p]) => p)
			)
		)
	);

const mapPlatformError =
	(configPath: string, operation: string) =>
	(e: { message: string }): GhosttyConfigError =>
		new GhosttyConfigError({
			message: `Failed to ${operation}: ${e.message}`,
			path: configPath
		});

export class GhosttyConfig extends Context.Service<
	GhosttyConfig,
	{
		readonly getPath: Effect.Effect<string, GhosttyConfigError>;
		readonly readRaw: Effect.Effect<string, GhosttyConfigError>;
		readonly read: Effect.Effect<
			Record<string, string>,
			GhosttyConfigError
		>;
		readonly get: (
			key: string
		) => Effect.Effect<Option.Option<string>, GhosttyConfigError>;
		readonly set: (
			key: string,
			value: string
		) => Effect.Effect<void, GhosttyConfigError>;
		readonly remove: (
			key: string
		) => Effect.Effect<void, GhosttyConfigError>;
		readonly validate: () => Effect.Effect<boolean, GhosttyCliError>;
		readonly show: () => Effect.Effect<string, GhosttyCliError>;
	}
>()('@workspace/ghostty-binding/GhosttyConfig') {
	static readonly layer: Layer.Layer<
		GhosttyConfig,
		never,
		Ghostty | FileSystem.FileSystem | Path.Path
	> = Layer.effect(
		GhosttyConfig,
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const pathService = yield* Path.Path;
			const ghostty = yield* Ghostty;

			const getPath = Effect.fn('GhosttyConfig.getPath')(
				(): Effect.Effect<string, GhosttyConfigError> =>
					Effect.gen(function* () {
						const paths = yield* getConfigPaths(pathService);
						const existing = yield* findExistingConfigPath(
							fs,
							paths
						);
						return Option.getOrElse(existing, () => {
							const head = Arr.head(paths);
							return Option.getOrElse(head, () => '');
						});
					})
			);

			const readRaw = Effect.fn('GhosttyConfig.readRaw')(
				(): Effect.Effect<string, GhosttyConfigError> =>
					Effect.gen(function* () {
						const configPath = yield* getPath();
						const exists = yield* fs
							.exists(configPath)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'check config')
								)
							);
						if (!exists) {
							return '';
						}
						return yield* fs
							.readFileString(configPath)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'read config')
								)
							);
					})
			);

			const read = Effect.fn('GhosttyConfig.read')(
				(): Effect.Effect<Record<string, string>, GhosttyConfigError> =>
					readRaw().pipe(Effect.map(parseConfig))
			);

			const get = Effect.fn('GhosttyConfig.get')(
				(
					key: string
				): Effect.Effect<Option.Option<string>, GhosttyConfigError> =>
					read().pipe(Effect.map((config) => R.get(config, key)))
			);

			const set = Effect.fn('GhosttyConfig.set')(
				(
					key: string,
					value: string
				): Effect.Effect<void, GhosttyConfigError> =>
					Effect.gen(function* () {
						const configPath = yield* getPath();
						const dirPath = pathService.dirname(configPath);

						yield* fs
							.makeDirectory(dirPath, { recursive: true })
							.pipe(
								Effect.mapError(
									mapPlatformError(
										dirPath,
										'create config directory'
									)
								)
							);

						const exists = yield* fs
							.exists(configPath)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'check config')
								)
							);
						const content = exists
							? yield* fs
									.readFileString(configPath)
									.pipe(
										Effect.mapError(
											mapPlatformError(
												configPath,
												'read config'
											)
										)
									)
							: '';

						const updated = updateConfigContent(
							content,
							key,
							value
						);

						yield* fs
							.writeFileString(configPath, updated)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'write config')
								)
							);
					})
			);

			const remove = Effect.fn('GhosttyConfig.remove')(
				(key: string): Effect.Effect<void, GhosttyConfigError> =>
					Effect.gen(function* () {
						const configPath = yield* getPath();
						const exists = yield* fs
							.exists(configPath)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'check config')
								)
							);
						if (!exists) {
							return;
						}

						const content = yield* fs
							.readFileString(configPath)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'read config')
								)
							);

						const updated = removeConfigKey(content, key);

						yield* fs
							.writeFileString(configPath, updated)
							.pipe(
								Effect.mapError(
									mapPlatformError(configPath, 'write config')
								)
							);
					})
			);

			return GhosttyConfig.of({
				getPath: getPath(),
				readRaw: readRaw(),
				read: read(),
				get,
				set,
				remove,
				validate: ghostty.validateConfig,
				show: ghostty.showConfig
			});
		})
	);
}
