import { Context, Effect, Layer } from "effect";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import type { AgentScope } from "../domain/agents.ts";
import { ExtensionConfig } from "../domain/config.ts";
import { ConfigLoadError } from "../domain/errors.ts";
import { emptySubagentSettings, SettingsFile, SubagentSettings } from "../domain/management.ts";
import { NodePlatformLayer } from "../layers/node-platform.ts";
import { AgentPaths } from "./agent-paths.ts";
import { ProjectLayout } from "./project-layout.ts";

/**
 * Resolved subagent settings for one discovery scope. Filtered scopes (user-only
 * or project-only) carry an empty settings value for the excluded side, mirroring
 * the precedence semantics the catalog applies when merging builtin overrides.
 */
export interface SubagentSettingsBundle {
	readonly user: SubagentSettings;
	readonly project: SubagentSettings;
	readonly userSettingsPath: string;
	readonly projectSettingsPath: Option.Option<string>;
}

const parseJson = Schema.decodeUnknownEffect(Schema.UnknownFromJsonString);
const decodeSettingsFile = Schema.decodeUnknownEffect(SettingsFile);
const decodeExtensionConfig = Schema.decodeUnknownEffect(ExtensionConfig);

/**
 * Loads typed extension configuration and builtin agent overrides from disk.
 *
 * Configuration lives in `<agentDir>/extensions/subagent/config.json`; builtin
 * overrides live under the `subagents` key of user and project `settings.json`
 * files. Missing files decode to schema defaults; malformed files fail with
 * `ConfigLoadError`.
 */
export namespace SettingsRepository {
	export interface Interface {
		readonly loadExtensionConfig: Effect.Effect<ExtensionConfig, ConfigLoadError>;
		readonly loadSubagentSettings: (
			cwd: string,
			scope: AgentScope
		) => Effect.Effect<SubagentSettingsBundle, ConfigLoadError>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/SettingsRepository") {}

	export const layer: Layer.Layer<
		Service,
		never,
		AgentPaths.Service | ProjectLayout.Service | FileSystem.FileSystem
	> = Layer.effect(
		Service,
		Effect.gen(function* () {
			const agentPaths = yield* AgentPaths.Service;
			const projectLayout = yield* ProjectLayout.Service;
			const fs = yield* FileSystem.FileSystem;

			const configError = (message: string, path: string) => (cause: unknown) =>
				new ConfigLoadError({ message, path, cause });

			const readOptionalFile = Effect.fnUntraced(function* (filePath: string) {
				const exists = yield* fs.exists(filePath).pipe(Effect.orElseSucceed(() => false));
				if (!exists) return Option.none<string>();
				const raw = yield* fs
					.readFileString(filePath)
					.pipe(Effect.mapError(configError(`Failed to read '${filePath}'.`, filePath)));
				return Option.some(raw);
			});

			const decodeSubagentSettings = Effect.fnUntraced(function* (filePath: string, raw: string) {
				const json = yield* parseJson(raw).pipe(
					Effect.mapError(configError(`'${filePath}' is not valid JSON.`, filePath))
				);
				const file = yield* decodeSettingsFile(json).pipe(
					Effect.mapError(configError(`'${filePath}' has an invalid subagents block.`, filePath))
				);
				return Option.getOrElse(file.subagents, () => emptySubagentSettings);
			});

			const loadSettingsFile = Effect.fn("SettingsRepository.loadSettingsFile")(function* (filePath: string) {
				const rawOption = yield* readOptionalFile(filePath);
				return yield* Option.match(rawOption, {
					onNone: () => Effect.succeed(emptySubagentSettings),
					onSome: (raw) => decodeSubagentSettings(filePath, raw)
				});
			});

			const extensionConfigPath = agentPaths.extensionConfigPath;
			const extensionDefaults = decodeExtensionConfig({}).pipe(
				Effect.mapError((cause) => new ConfigLoadError({ message: "Invalid default extension config.", cause }))
			);
			const decodeExtensionConfigRaw = Effect.fnUntraced(function* (raw: string) {
				const json = yield* parseJson(raw).pipe(
					Effect.mapError(configError(`'${extensionConfigPath}' is not valid JSON.`, extensionConfigPath))
				);
				return yield* decodeExtensionConfig(json).pipe(
					Effect.mapError(
						configError(`'${extensionConfigPath}' is not a valid extension config.`, extensionConfigPath)
					)
				);
			});

			const loadExtensionConfig = readOptionalFile(extensionConfigPath).pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => extensionDefaults,
						onSome: (raw) => decodeExtensionConfigRaw(raw)
					})
				)
			);

			const loadSubagentSettings = Effect.fn("SettingsRepository.loadSubagentSettings")(function* (
				cwd: string,
				scope: AgentScope
			) {
				const user =
					scope === "project" ? emptySubagentSettings : yield* loadSettingsFile(agentPaths.userSettingsPath);
				const projectSettingsPath = yield* projectLayout.settingsPath(cwd);
				const project =
					scope === "user"
						? emptySubagentSettings
						: yield* Option.match(projectSettingsPath, {
								onNone: () => Effect.succeed(emptySubagentSettings),
								onSome: loadSettingsFile
							});

				return {
					user,
					project,
					userSettingsPath: agentPaths.userSettingsPath,
					projectSettingsPath
				} satisfies SubagentSettingsBundle;
			});

			return Service.of({ loadExtensionConfig, loadSubagentSettings });
		})
	);

	export const defaultLayer: Layer.Layer<Service> = layer.pipe(
		Layer.provide(AgentPaths.defaultLayer),
		Layer.provide(ProjectLayout.defaultLayer),
		Layer.provide(NodePlatformLayer)
	);
}
