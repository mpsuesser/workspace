import * as Array from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as Record from 'effect/Record';
import * as ServiceMap from 'effect/ServiceMap';
import { Ghostty } from './Ghostty.ts';
import { type GhosttyCliError, GhosttyConfigError } from './GhosttyError.ts';

export const parseConfig = (content: string): Record<string, string> =>
	content.split('\n').reduce(
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
				acc[key] = value;
			}
			return acc;
		},
		{} as Record<string, string>
	);

export const serializeConfig = (config: Record<string, string>): string =>
	Object.entries(config)
		.map(([key, value]) => `${key} = ${value}`)
		.join('\n');

const updateConfigContent = (
	content: string,
	key: string,
	value: string
): string => {
	const lines = content.split('\n');
	const keyPattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=`);
	const existingIndex = lines.findIndex((line) => keyPattern.test(line));

	if (existingIndex !== -1) {
		lines[existingIndex] = `${key} = ${value}`;
		return lines.join('\n');
	}

	const nonEmptyLines = lines.filter((line) => line.trim() !== '');
	if (nonEmptyLines.length === 0) {
		return `${key} = ${value}`;
	}

	let lastNonEmptyIndex = lines.length - 1;
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i];
		if (line !== undefined && line.trim() !== '') {
			lastNonEmptyIndex = i;
			break;
		}
	}

	const result = [
		...lines
	];
	result.splice(lastNonEmptyIndex + 1, 0, `${key} = ${value}`);
	return result.join('\n');
};

const removeConfigKey = (content: string, key: string): string => {
	const lines = content.split('\n');
	const keyPattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=`);
	return lines.filter((line) => !keyPattern.test(line)).join('\n');
};

const escapeRegex = (str: string): string =>
	str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HomeConfig = Config.string('HOME');
const XdgConfigHomeConfig = Config.option(Config.string('XDG_CONFIG_HOME'));

const getConfigPaths = (
	pathService: Path.Path
): Effect.Effect<ReadonlyArray<string>, GhosttyConfigError> =>
	Effect.gen(function* () {
		const home = yield* HomeConfig;
		const xdgConfigHomeOption = yield* XdgConfigHomeConfig;
		const xdgConfigHome = Option.getOrElse(xdgConfigHomeOption, () =>
			pathService.join(home, '.config')
		);
		const xdgPath = pathService.join(xdgConfigHome, 'ghostty', 'config');
		const macOsPath = pathService.join(
			home,
			'Library',
			'Application Support',
			'com.mitchellh.ghostty',
			'config'
		);

		return process.platform === 'darwin'
			? [
					xdgPath,
					macOsPath
				]
			: [
					xdgPath
				];
	}).pipe(
		Effect.catchTag('ConfigError', (error) =>
			Effect.fail(
				new GhosttyConfigError({
					message: `Environment variable not set: ${error.message}`
				})
			)
		)
	);

const findExistingConfigPath = (
	fs: FileSystem.FileSystem,
	paths: ReadonlyArray<string>
): Effect.Effect<Option.Option<string>, GhosttyConfigError> =>
	Effect.forEach(paths, (p) =>
		fs.exists(p).pipe(
			Effect.map(
				(exists) =>
					[
						p,
						exists
					] as const
			),
			Effect.orElseSucceed(
				() =>
					[
						p,
						false
					] as const
			)
		)
	).pipe(
		Effect.map((results) =>
			Array.findFirst(results, ([, exists]) => exists).pipe(
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

export class GhosttyConfig extends ServiceMap.Service<
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
>()('@multitude/binding-ghostty-core/GhosttyConfig') {
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

			const getPath: Effect.Effect<string, GhosttyConfigError> =
				Effect.gen(function* () {
					const paths = yield* getConfigPaths(pathService);
					const existing = yield* findExistingConfigPath(fs, paths);
					return Option.getOrElse(existing, () =>
						Array.headNonEmpty(paths as Array.NonEmptyArray<string>)
					);
				});

			const readRaw: Effect.Effect<string, GhosttyConfigError> =
				Effect.gen(function* () {
					const configPath = yield* getPath;
					const exists = yield* fs
						.exists(configPath)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'check config')(e)
							)
						);
					if (!exists) {
						return '';
					}
					return yield* fs
						.readFileString(configPath)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'read config')(e)
							)
						);
				});

			const read: Effect.Effect<
				Record<string, string>,
				GhosttyConfigError
			> = readRaw.pipe(Effect.map(parseConfig));

			const get = (
				key: string
			): Effect.Effect<Option.Option<string>, GhosttyConfigError> =>
				read.pipe(Effect.map((config) => Record.get(config, key)));

			const set = (
				key: string,
				value: string
			): Effect.Effect<void, GhosttyConfigError> =>
				Effect.gen(function* () {
					const configPath = yield* getPath;
					const dirPath = pathService.dirname(configPath);

					yield* fs
						.makeDirectory(dirPath, {
							recursive: true
						})
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(
									dirPath,
									'create config directory'
								)(e)
							)
						);

					const exists = yield* fs
						.exists(configPath)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'check config')(e)
							)
						);
					const content = exists
						? yield* fs
								.readFileString(configPath)
								.pipe(
									Effect.mapError((e) =>
										mapPlatformError(
											configPath,
											'read config'
										)(e)
									)
								)
						: '';

					const updated = updateConfigContent(content, key, value);

					yield* fs
						.writeFileString(configPath, updated)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'write config')(e)
							)
						);
				});

			const remove = (
				key: string
			): Effect.Effect<void, GhosttyConfigError> =>
				Effect.gen(function* () {
					const configPath = yield* getPath;
					const exists = yield* fs
						.exists(configPath)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'check config')(e)
							)
						);
					if (!exists) {
						return;
					}

					const content = yield* fs
						.readFileString(configPath)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'read config')(e)
							)
						);

					const updated = removeConfigKey(content, key);

					yield* fs
						.writeFileString(configPath, updated)
						.pipe(
							Effect.mapError((e) =>
								mapPlatformError(configPath, 'write config')(e)
							)
						);
				});

			return GhosttyConfig.of({
				getPath,
				readRaw,
				read,
				get,
				set,
				remove,
				validate: ghostty.validateConfig,
				show: ghostty.showConfig
			});
		})
	);
}
