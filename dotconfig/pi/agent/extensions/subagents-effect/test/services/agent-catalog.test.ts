import { it } from "@effect/vitest";
import { assert, describe, expect } from "vitest";
import { Effect, Layer } from "effect";
import * as Arr from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import { AgentDiscoveryError, AgentResolutionError, ConfigLoadError } from "../../src/domain/errors.ts";
import { RuntimeAgentName } from "../../src/domain/ids.ts";
import { NodePlatformLayer } from "../../src/layers/node-platform.ts";
import { AgentCatalog } from "../../src/services/agent-catalog.ts";
import { AgentPaths } from "../../src/services/agent-paths.ts";
import { ProjectLayout } from "../../src/services/project-layout.ts";
import { SettingsRepository } from "../../src/services/settings-repository.ts";

type Fixture = ReadonlyArray<readonly [string, string]>;

const agentMd = (name: string, description: string, extra = ""): string =>
	`---\nname: ${name}\ndescription: ${description}\n${extra}---\nBody for ${name}.\n`;

const writeFixture = (files: Fixture) =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		const root = yield* fs.makeTempDirectoryScoped();
		yield* Effect.forEach(
			files,
			([relative, content]) => {
				const full = path.join(root, relative);
				return fs
					.makeDirectory(path.dirname(full), { recursive: true })
					.pipe(Effect.andThen(fs.writeFileString(full, content)));
			},
			{ concurrency: 1 }
		);
		return root;
	});

const pathsFor = (root: string): AgentPaths.Interface => ({
	agentDir: `${root}/user`,
	homeDir: `${root}/home`,
	userAgentDirs: [`${root}/user/agents`, `${root}/home/.agents`],
	userChainDir: `${root}/user/chains`,
	userSettingsPath: `${root}/user/settings.json`,
	extensionConfigPath: `${root}/user/extensions/subagent/config.json`,
	builtinAgentsDir: `${root}/builtin`
});

const layerFor = (paths: AgentPaths.Interface): Layer.Layer<AgentCatalog.Service | SettingsRepository.Service> => {
	const base = Layer.mergeAll(NodePlatformLayer, Layer.succeed(AgentPaths.Service, AgentPaths.Service.of(paths)));
	const withProject = ProjectLayout.layer.pipe(Layer.provideMerge(base));
	const withSettings = SettingsRepository.layer.pipe(Layer.provideMerge(withProject));
	return AgentCatalog.layer.pipe(Layer.provideMerge(withSettings));
};

const runtimeName = (value: string): RuntimeAgentName => Schema.decodeUnknownSync(RuntimeAgentName)(value);

describe("AgentCatalog discovery", () => {
	it.effect("merges builtin agents and applies user precedence by runtime name", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([
				["builtin/worker.md", agentMd("worker", "builtin worker")],
				["builtin/scout.md", agentMd("scout", "builtin scout")],
				["user/agents/worker.md", agentMd("worker", "user worker")]
			]);
			const snapshot = yield* AgentCatalog.Service.use((catalog) => catalog.discover(root, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			expect(Arr.map(snapshot.agents, (agent) => agent.name)).toEqual(["scout", "worker"]);
			const worker = Arr.findFirst(snapshot.agents, (agent) => agent.name === "worker");
			expect(Option.getOrNull(Option.map(worker, (agent) => agent.description))).toBe("user worker");
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("lets project agents override user agents", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([
				["builtin/worker.md", agentMd("worker", "builtin worker")],
				["user/agents/worker.md", agentMd("worker", "user worker")],
				["proj/.pi/agents/worker.md", agentMd("worker", "project worker")]
			]);
			const snapshot = yield* AgentCatalog.Service.use((catalog) => catalog.discover(`${root}/proj`, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			const worker = Arr.findFirst(snapshot.agents, (agent) => agent.name === "worker");
			expect(Option.getOrNull(Option.map(worker, (agent) => agent.description))).toBe("project worker");
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("qualifies runtime names with the package name", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([
				["user/agents/scout.md", agentMd("scout", "scout", "package: code-analysis\n")]
			]);
			const snapshot = yield* AgentCatalog.Service.use((catalog) => catalog.discover(root, "user")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			expect(Arr.map(snapshot.agents, (agent) => agent.name)).toEqual(["code-analysis.scout"]);
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("separates direct MCP tools from builtin tools", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([
				["user/agents/net.md", agentMd("net", "net agent", "tools: read, mcp:chrome-devtools, bash\n")]
			]);
			const snapshot = yield* AgentCatalog.Service.use((catalog) => catalog.discover(root, "user")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			const agent = Arr.head(snapshot.agents);
			assert(Option.isSome(agent), "expected one agent");
			expect(Option.getOrNull(agent.value.tools)).toEqual(["read", "bash"]);
			expect(Option.getOrNull(agent.value.mcpDirectTools)).toEqual(["chrome-devtools"]);
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("hides a builtin disabled through settings overrides", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([
				["builtin/worker.md", agentMd("worker", "builtin worker")],
				["builtin/scout.md", agentMd("scout", "builtin scout")],
				["user/settings.json", '{ "subagents": { "agentOverrides": { "worker": { "disabled": true } } } }']
			]);
			const snapshot = yield* AgentCatalog.Service.use((catalog) => catalog.discover(root, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			expect(Arr.map(snapshot.agents, (agent) => agent.name)).toEqual(["scout"]);
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("fails with AgentDiscoveryError on malformed frontmatter", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([["builtin/bad.md", agentMd("bad", "bad agent", "thinking: bogus-level\n")]]);
			const error = yield* AgentCatalog.Service.use((catalog) => catalog.discover(root, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root))),
				Effect.flip
			);
			assert(error instanceof AgentDiscoveryError, "expected AgentDiscoveryError");
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("resolves a known agent and rejects an unknown one", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([["builtin/worker.md", agentMd("worker", "builtin worker")]]);
			const layer = layerFor(pathsFor(root));
			const resolved = yield* AgentCatalog.Service.use((catalog) =>
				catalog.resolve(runtimeName("worker"), root, "both")
			).pipe(Effect.provide(layer));
			expect(resolved.name).toBe("worker");

			const missing = yield* AgentCatalog.Service.use((catalog) =>
				catalog.resolve(runtimeName("ghost"), root, "both")
			).pipe(Effect.provide(layer), Effect.flip);
			assert(missing instanceof AgentResolutionError, "expected AgentResolutionError");
		}).pipe(Effect.provide(NodePlatformLayer))
	);
});

describe("SettingsRepository", () => {
	it.effect("fails with ConfigLoadError on malformed settings JSON", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([["user/settings.json", "{ not valid json"]]);
			const error = yield* SettingsRepository.Service.use((repo) => repo.loadSubagentSettings(root, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root))),
				Effect.flip
			);
			assert(error instanceof ConfigLoadError, "expected ConfigLoadError");
		}).pipe(Effect.provide(NodePlatformLayer))
	);

	it.effect("returns empty settings when no files are present", () =>
		Effect.gen(function* () {
			const root = yield* writeFixture([["builtin/worker.md", agentMd("worker", "builtin worker")]]);
			const bundle = yield* SettingsRepository.Service.use((repo) => repo.loadSubagentSettings(root, "both")).pipe(
				Effect.provide(layerFor(pathsFor(root)))
			);
			expect(Option.isNone(bundle.user.disableBuiltins)).toBe(true);
		}).pipe(Effect.provide(NodePlatformLayer))
	);
});
