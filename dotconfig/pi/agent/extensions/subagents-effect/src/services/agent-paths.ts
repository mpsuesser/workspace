import { Config, Context, Effect, Layer } from "effect";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Str from "effect/String";
import { layersDir, NodePlatformLayer } from "../layers/node-platform.ts";

const resolveAgentDir = (path: Path.Path, homeDir: string, configured: Option.Option<string>): string =>
	Option.match(configured, {
		onNone: () => path.join(homeDir, ".pi", "agent"),
		onSome: (value) =>
			value === "~"
				? homeDir
				: Str.startsWith("~/")(value)
					? path.join(homeDir, value.slice(2))
					: Str.isNonEmpty(value)
						? value
						: path.join(homeDir, ".pi", "agent")
	});

/**
 * Resolves the well-known user-scope and builtin directories the catalog reads.
 *
 * Production wiring reads `HOME`, `PI_CODING_AGENT_DIR`, and an optional builtin
 * override from `Config`; tests provide a fixed implementation with temp dirs.
 */
export namespace AgentPaths {
	export interface Interface {
		readonly agentDir: string;
		readonly homeDir: string;
		readonly userAgentDirs: ReadonlyArray<string>;
		readonly userChainDir: string;
		readonly userSettingsPath: string;
		readonly extensionConfigPath: string;
		readonly builtinAgentsDir: string;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/AgentPaths") {}

	export const layer: Layer.Layer<Service, never, Path.Path> = Layer.effect(
		Service,
		Effect.gen(function* () {
			const path = yield* Path.Path;
			const homeDir = yield* Config.string("HOME").pipe(Config.withDefault(""));
			const configuredAgentDir = yield* Config.string("PI_CODING_AGENT_DIR").pipe(Config.option);
			const builtinAgentsDir = yield* Config.string("PI_SUBAGENTS_EFFECT_BUILTIN_AGENTS_DIR").pipe(
				Config.withDefault(path.resolve(layersDir, "..", "..", "agents"))
			);

			const agentDir = resolveAgentDir(path, homeDir, configuredAgentDir);

			return Service.of({
				agentDir,
				homeDir,
				userAgentDirs: [path.join(agentDir, "agents"), path.join(homeDir, ".agents")],
				userChainDir: path.join(agentDir, "chains"),
				userSettingsPath: path.join(agentDir, "settings.json"),
				extensionConfigPath: path.join(agentDir, "extensions", "subagent", "config.json"),
				builtinAgentsDir
			});
		}).pipe(Effect.orDie)
	);

	export const defaultLayer: Layer.Layer<Service> = layer.pipe(Layer.provide(NodePlatformLayer));
}
