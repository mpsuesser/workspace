import { Context, Effect, Layer } from "effect";
import * as Arr from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import { NodePlatformLayer } from "../layers/node-platform.ts";

/**
 * Resolves project-scope agent/chain/settings locations relative to a working
 * directory by walking up to the nearest project root (a directory containing
 * `.pi` or legacy `.agents`). All probes treat IO failures as "absent".
 */
export namespace ProjectLayout {
	export interface Interface {
		readonly findRoot: (cwd: string) => Effect.Effect<Option.Option<string>>;
		readonly agentDirs: (cwd: string) => Effect.Effect<ReadonlyArray<string>>;
		readonly chainDirs: (cwd: string) => Effect.Effect<ReadonlyArray<string>>;
		readonly settingsPath: (cwd: string) => Effect.Effect<Option.Option<string>>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/ProjectLayout") {}

	export const layer: Layer.Layer<Service, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
		Service,
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;

			const isDir = (candidate: string): Effect.Effect<boolean> =>
				fs.stat(candidate).pipe(
					Effect.map((info) => info.type === "Directory"),
					Effect.orElseSucceed(() => false)
				);

			const walk = (dir: string): Effect.Effect<Option.Option<string>> =>
				Effect.gen(function* () {
					const hasPi = yield* isDir(path.join(dir, ".pi"));
					const hasAgents = yield* isDir(path.join(dir, ".agents"));
					if (hasPi || hasAgents) return Option.some(dir);
					const parent = path.dirname(dir);
					if (parent === dir) return Option.none<string>();
					return yield* walk(parent);
				});

			const findRoot = Effect.fn("ProjectLayout.findRoot")(function* (cwd: string) {
				return yield* walk(cwd);
			});

			const dirsUnderRoot = Effect.fnUntraced(function* (
				cwd: string,
				segments: ReadonlyArray<ReadonlyArray<string>>
			) {
				const root = yield* findRoot(cwd);
				return yield* Option.match(root, {
						onNone: () => Effect.succeed<ReadonlyArray<string>>([]),
						onSome: (rootDir) =>
							Effect.forEach(
								segments,
								(parts) => {
									const candidate = path.join(rootDir, ...parts);
									return isDir(candidate).pipe(
										Effect.map((exists) => (exists ? Option.some(candidate) : Option.none<string>()))
									);
								},
								{ concurrency: 1 }
							).pipe(Effect.map(Arr.getSomes))
					});
				});

			const agentDirs = Effect.fn("ProjectLayout.agentDirs")(function* (cwd: string) {
				return yield* dirsUnderRoot(cwd, [[".agents"], [".pi", "agents"]]);
			});
			const chainDirs = Effect.fn("ProjectLayout.chainDirs")(function* (cwd: string) {
				return yield* dirsUnderRoot(cwd, [[".pi", "chains"]]);
			});

			const settingsPath = Effect.fn("ProjectLayout.settingsPath")(function* (cwd: string) {
				const root = yield* findRoot(cwd);
				return Option.map(root, (rootDir) => path.join(rootDir, ".pi", "settings.json"));
			});

			return Service.of({ findRoot, agentDirs, chainDirs, settingsPath });
		})
	);

	export const defaultLayer: Layer.Layer<Service> = layer.pipe(Layer.provide(NodePlatformLayer));
}
