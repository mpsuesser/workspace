import { Context, Effect, Layer, Order, pipe } from "effect";
import * as Arr from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";
import {
	AgentCatalogSnapshot,
	AgentDefinition,
	type AgentOverride,
	type AgentScope,
	type AgentSource,
	type ChainDefinition,
	ResolvedAgent
} from "../domain/agents.ts";
import { AgentDiscoveryError, AgentResolutionError } from "../domain/errors.ts";
import { parseFrontmatter } from "../domain/frontmatter.ts";
import { buildRuntimeName, parseCommaList, parsePackageName, splitToolList } from "../domain/identity.ts";
import type { RuntimeAgentName } from "../domain/ids.ts";
import type { SubagentSettings } from "../domain/management.ts";
import { NodePlatformLayer } from "../layers/node-platform.ts";
import { AgentPaths } from "./agent-paths.ts";
import { ProjectLayout } from "./project-layout.ts";
import { SettingsRepository } from "./settings-repository.ts";

const KNOWN_FIELDS = HashSet.fromIterable([
	"name",
	"package",
	"description",
	"tools",
	"model",
	"fallbackModels",
	"thinking",
	"systemPromptMode",
	"inheritProjectContext",
	"inheritAvailableSkills",
	"inheritSkills",
	"defaultContext",
	"skill",
	"skills",
	"extensions",
	"output",
	"defaultReads",
	"defaultProgress",
	"interactive",
	"maxSubagentDepth",
	"completionGuard"
]);

const decodeAgentDefinition = Schema.decodeUnknownEffect(AgentDefinition);

const isMarkdownAgentFile = (name: string): boolean =>
	Str.endsWith(".md")(name) && !Str.endsWith(".chain.md")(name);

const presentArray = (key: string, values: ReadonlyArray<string>): Record<string, ReadonlyArray<string>> =>
	values.length > 0 ? { [key]: values } : {};

const lookup = (frontmatter: Record<string, string>, key: string): Option.Option<string> =>
	Option.fromNullishOr(frontmatter[key]);

const flag = (frontmatter: Record<string, string>, key: string): Option.Option<boolean> =>
	pipe(
		lookup(frontmatter, key),
		Option.flatMap((value) =>
			value === "true" ? Option.some(true) : value === "false" ? Option.some(false) : Option.none<boolean>()
		)
	);

const defaultSystemPromptMode = (localName: string): "append" | "replace" =>
	localName === "delegate" ? "append" : "replace";

const defaultInheritProjectContext = (localName: string): boolean => localName === "delegate";

interface RawAgentResult {
	readonly definition: Option.Option<AgentDefinition>;
	readonly warnings: ReadonlyArray<string>;
}

/**
 * Discovers and resolves agent definitions across builtin, user, and project
 * scopes, applying settings-driven builtin overrides and enforcing
 * `builtin < user < project` precedence by runtime name.
 */
export namespace AgentCatalog {
	export interface Interface {
		readonly discover: (cwd: string, scope: AgentScope) => Effect.Effect<AgentCatalogSnapshot, AgentDiscoveryError>;
		readonly resolve: (
			name: RuntimeAgentName,
			cwd: string,
			scope: AgentScope
		) => Effect.Effect<ResolvedAgent, AgentResolutionError | AgentDiscoveryError>;
		readonly resolveMany: (
			names: ReadonlyArray<RuntimeAgentName>,
			cwd: string,
			scope: AgentScope
		) => Effect.Effect<ReadonlyArray<ResolvedAgent>, AgentResolutionError | AgentDiscoveryError>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/AgentCatalog") {}

	export const layer: Layer.Layer<
		Service,
		never,
		AgentPaths.Service | ProjectLayout.Service | SettingsRepository.Service | FileSystem.FileSystem | Path.Path
	> = Layer.effect(
		Service,
		Effect.gen(function* () {
			const agentPaths = yield* AgentPaths.Service;
			const projectLayout = yield* ProjectLayout.Service;
			const settings = yield* SettingsRepository.Service;
			const fs = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;

			const listFiles: (
				dir: string,
				accept: (name: string) => boolean
			) => Effect.Effect<ReadonlyArray<string>> = Effect.fnUntraced(function* (dir, accept) {
				const entries = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(() => [] as ReadonlyArray<string>));
				const sorted = Arr.sort(entries, Order.String);
				const nested = yield* Effect.forEach(
					sorted,
					(name) => classifyEntry(path.join(dir, name), name, accept),
					{ concurrency: 1 }
				);
				return Arr.flatten(nested);
			});

			const classifyEntry = Effect.fnUntraced(function* (
				full: string,
				name: string,
				accept: (name: string) => boolean
			) {
				const info = yield* fs.stat(full).pipe(Effect.option);
				return yield* Option.match(info, {
					onNone: () => Effect.succeed<ReadonlyArray<string>>([]),
					onSome: (stat) =>
						stat.type === "Directory"
							? listFiles(full, accept)
							: (stat.type === "File" || stat.type === "SymbolicLink") && accept(name)
								? Effect.succeed<ReadonlyArray<string>>([full])
								: Effect.succeed<ReadonlyArray<string>>([])
				});
			});

			const buildRawAgent = Effect.fnUntraced(function* (raw: string, source: AgentSource, filePath: string) {
				const { frontmatter, body } = parseFrontmatter(raw);
				const nameOption = lookup(frontmatter, "name");
				const descriptionOption = lookup(frontmatter, "description");
				if (Option.isNone(nameOption) || Option.isNone(descriptionOption)) {
					return { definition: Option.none(), warnings: [] } satisfies RawAgentResult;
				}
				const localName = nameOption.value;
				const packageResult = parsePackageName(lookup(frontmatter, "package"), `Agent '${localName}' package`);
				if (Result.isFailure(packageResult)) {
					return {
						definition: Option.none(),
						warnings: [`${packageResult.failure} (${filePath})`]
					} satisfies RawAgentResult;
				}
				const packageName = packageResult.success;
				const runtimeName = buildRuntimeName(localName, packageName);

				const { tools, mcpDirectTools } = splitToolList(parseCommaList(lookup(frontmatter, "tools")));
				const skills = parseCommaList(Option.orElse(lookup(frontmatter, "skill"), () => lookup(frontmatter, "skills")));
				const fallbackModels = parseCommaList(lookup(frontmatter, "fallbackModels"));
				const defaultReads = parseCommaList(lookup(frontmatter, "defaultReads"));
				const extensions = parseCommaList(lookup(frontmatter, "extensions"));

				const systemPromptMode = Option.getOrElse(
					Option.filter(lookup(frontmatter, "systemPromptMode"), (m) => m === "append" || m === "replace"),
					() => defaultSystemPromptMode(localName)
				);
				const inheritProjectContext = Option.getOrElse(
					flag(frontmatter, "inheritProjectContext"),
					() => defaultInheritProjectContext(localName)
				);
				const inheritAvailableSkills = Option.getOrElse(
					Option.orElse(flag(frontmatter, "inheritAvailableSkills"), () => flag(frontmatter, "inheritSkills")),
					() => true
				);
				const defaultContext = Option.filter(
					lookup(frontmatter, "defaultContext"),
					(value) => value === "fresh" || value === "fork"
				);
				const maxSubagentDepth = pipe(
					lookup(frontmatter, "maxSubagentDepth"),
					Option.map(Number),
					Option.filter((n) => Number.isInteger(n) && n > 0)
				);
				const extraFields = R.filter(frontmatter, (_value, key) => !HashSet.has(KNOWN_FIELDS, key));

				const rawAgent = {
					name: runtimeName,
					localName,
					...(Option.isSome(packageName) ? { packageName: packageName.value } : {}),
					description: descriptionOption.value,
					source,
					filePath,
					...presentArray("tools", tools),
					...presentArray("mcpDirectTools", mcpDirectTools),
					...presentArray("extensions", extensions),
					...(Option.isSome(lookup(frontmatter, "model")) ? { model: frontmatter.model } : {}),
					...presentArray("fallbackModels", fallbackModels),
					...(Option.isSome(lookup(frontmatter, "thinking")) ? { thinking: frontmatter.thinking } : {}),
					systemPromptMode,
					inheritProjectContext,
					inheritAvailableSkills,
					...(Option.isSome(defaultContext) ? { defaultContext: defaultContext.value } : {}),
					systemPrompt: body,
					...presentArray("skills", skills),
					...(Option.isSome(lookup(frontmatter, "output")) ? { output: frontmatter.output } : {}),
					...presentArray("defaultReads", defaultReads),
					...Option.match(flag(frontmatter, "defaultProgress"), {
						onNone: () => ({}),
						onSome: (value) => ({ defaultProgress: value })
					}),
					...Option.match(flag(frontmatter, "interactive"), {
						onNone: () => ({}),
						onSome: (value) => ({ interactive: value })
					}),
					...(Option.isSome(maxSubagentDepth) ? { maxSubagentDepth: maxSubagentDepth.value } : {}),
					...Option.match(flag(frontmatter, "completionGuard"), {
						onNone: () => ({}),
						onSome: (value) => ({ completionGuard: value })
					}),
					...(R.isEmptyRecord(extraFields) ? {} : { extraFields })
				};

				const definition = yield* decodeAgentDefinition(rawAgent).pipe(
					Effect.mapError(
						(cause) =>
							new AgentDiscoveryError({ message: `Invalid agent definition in '${filePath}'.`, path: filePath, cause })
					)
				);
				return { definition: Option.some(definition), warnings: [] } satisfies RawAgentResult;
			});

			const loadAgentsFromDir = Effect.fnUntraced(function* (dir: string, source: AgentSource) {
				const files = yield* listFiles(dir, isMarkdownAgentFile);
				const results = yield* Effect.forEach(
					files,
					(filePath) =>
						fs.readFileString(filePath).pipe(
							Effect.flatMap((raw) => buildRawAgent(raw, source, filePath)),
							Effect.catchTag("PlatformError", () =>
								Effect.succeed<RawAgentResult>({ definition: Option.none(), warnings: [] })
							)
						),
					{ concurrency: 4 }
				);
				return {
					definitions: Arr.getSomes(Arr.map(results, (r) => r.definition)),
					warnings: Arr.flatMap(results, (r) => r.warnings)
				};
			});

			const resolveAgentWithOverride = (
				definition: AgentDefinition,
				override: Option.Option<AgentOverride>
			): ResolvedAgent => {
				const field = <A>(get: (o: AgentOverride) => Option.Option<A>): Option.Option<A> =>
					Option.flatMap(override, get);
				const unionField = <A>(base: Option.Option<A>, ov: Option.Option<A | false>): Option.Option<A> =>
					Option.match(ov, {
						onNone: () => base,
						onSome: (value) => (value === false ? Option.none<A>() : Option.some(value))
					});
				const resolvedToolSplit = Option.match(field((o) => o.tools), {
					onNone: () => ({ tools: definition.tools, mcpDirectTools: definition.mcpDirectTools }),
					onSome: (value) =>
						value === false
							? { tools: Option.none<ReadonlyArray<string>>(), mcpDirectTools: Option.none<ReadonlyArray<string>>() }
							: (() => {
									const split = splitToolList(value);
									return {
										tools: split.tools.length > 0 ? Option.some(split.tools) : Option.none<ReadonlyArray<string>>(),
										mcpDirectTools:
											split.mcpDirectTools.length > 0
												? Option.some(split.mcpDirectTools)
												: Option.none<ReadonlyArray<string>>()
									};
								})()
				});

				return new ResolvedAgent({
					definition,
					name: definition.name,
					description: definition.description,
					tools: resolvedToolSplit.tools,
					mcpDirectTools: resolvedToolSplit.mcpDirectTools,
					extensions: definition.extensions,
					model: unionField(definition.model, field((o) => o.model)),
					fallbackModels: unionField(definition.fallbackModels, field((o) => o.fallbackModels)),
					thinking: unionField(definition.thinking, field((o) => o.thinking)),
					systemPromptMode: Option.getOrElse(field((o) => o.systemPromptMode), () => definition.systemPromptMode),
					inheritProjectContext: Option.getOrElse(
						field((o) => o.inheritProjectContext),
						() => definition.inheritProjectContext
					),
					inheritAvailableSkills: Option.getOrElse(
						field((o) => o.inheritAvailableSkills),
						() => definition.inheritAvailableSkills
					),
					defaultContext: unionField(definition.defaultContext, field((o) => o.defaultContext)),
					systemPrompt: Option.getOrElse(field((o) => o.systemPrompt), () => definition.systemPrompt),
					skills: unionField(definition.skills, field((o) => o.skills)),
					output: definition.output,
					defaultReads: definition.defaultReads,
					defaultProgress: definition.defaultProgress,
					maxSubagentDepth: definition.maxSubagentDepth,
					completionGuard: Option.orElse(field((o) => o.completionGuard), () => definition.completionGuard),
					override,
					warnings: []
				});
			};

			const overrideFor = (
				definition: AgentDefinition,
				bundle: { user: SubagentSettings; project: SubagentSettings; projectHasFile: boolean }
			): { override: Option.Option<AgentOverride>; disabled: boolean } => {
				const projectOverride = R.get(bundle.project.agentOverrides, definition.name);
				if (Option.isSome(projectOverride) && bundle.projectHasFile) {
					return {
						override: projectOverride,
						disabled: Option.getOrElse(projectOverride.value.disabled, () => false)
					};
				}
				const projectBulkDisabled = bundle.projectHasFile && Option.getOrElse(bundle.project.disableBuiltins, () => false);
				if (projectBulkDisabled) {
					return { override: Option.none(), disabled: true };
				}
				const userOverride = R.get(bundle.user.agentOverrides, definition.name);
				if (Option.isSome(userOverride)) {
					return { override: userOverride, disabled: Option.getOrElse(userOverride.value.disabled, () => false) };
				}
				const userBulkDisabled =
					Option.isNone(bundle.project.disableBuiltins) && Option.getOrElse(bundle.user.disableBuiltins, () => false);
				return { override: Option.none(), disabled: userBulkDisabled };
			};

			const discover = Effect.fn("AgentCatalog.discover")(function* (cwd: string, scope: AgentScope) {
				const bundle = yield* settings.loadSubagentSettings(cwd, scope).pipe(
					Effect.mapError(
						(cause) =>
							new AgentDiscoveryError({ message: "Failed to load subagent settings during discovery.", cause })
					)
				);
				const projectHasFile = Option.isSome(bundle.projectSettingsPath);

				const builtinLoaded = yield* loadAgentsFromDir(agentPaths.builtinAgentsDir, "builtin");
				const userLoaded =
					scope === "project"
						? { definitions: [] as ReadonlyArray<AgentDefinition>, warnings: [] as ReadonlyArray<string> }
						: yield* loadManyDirs(agentPaths.userAgentDirs, "user");
				const projectDirs = scope === "user" ? [] : yield* projectLayout.agentDirs(cwd);
				const projectLoaded = yield* loadManyDirs(projectDirs, "project");

				const builtinResolved = pipe(
					builtinLoaded.definitions,
					Arr.map((definition) => {
						const decision = overrideFor(definition, {
							user: bundle.user,
							project: bundle.project,
							projectHasFile
						});
						return { resolved: resolveAgentWithOverride(definition, decision.override), disabled: decision.disabled };
					}),
					Arr.filter((entry) => !entry.disabled),
					Arr.map((entry) => entry.resolved)
				);

				const resolveLoaded = (defs: ReadonlyArray<AgentDefinition>): ReadonlyArray<ResolvedAgent> =>
					pipe(
						defs,
						Arr.filter((definition) => !Option.getOrElse(definition.disabled, () => false)),
						Arr.map((definition) => resolveAgentWithOverride(definition, Option.none()))
					);
				const userResolved = resolveLoaded(userLoaded.definitions);
				const projectResolved = resolveLoaded(projectLoaded.definitions);

				const merged = mergeByScope(scope, builtinResolved, userResolved, projectResolved);
				const sortedAgents = Arr.sort(
					merged,
					Order.mapInput(Order.String, (agent: ResolvedAgent) => agent.name)
				);

				return new AgentCatalogSnapshot({
					agents: sortedAgents,
					chains: [] as ReadonlyArray<ChainDefinition>,
					warnings: Arr.dedupe([...builtinLoaded.warnings, ...userLoaded.warnings, ...projectLoaded.warnings])
				});
			});

			const loadManyDirs = Effect.fnUntraced(function* (dirs: ReadonlyArray<string>, source: AgentSource) {
				const loaded = yield* Effect.forEach(dirs, (dir) => loadAgentsFromDir(dir, source), { concurrency: 1 });
				return {
					definitions: Arr.flatMap(loaded, (entry) => entry.definitions),
					warnings: Arr.flatMap(loaded, (entry) => entry.warnings)
				};
			});

			const resolve = Effect.fn("AgentCatalog.resolve")(function* (
				name: RuntimeAgentName,
				cwd: string,
				scope: AgentScope
			) {
				const snapshot = yield* discover(cwd, scope);
				return yield* Option.match(
					Arr.findFirst(snapshot.agents, (agent) => agent.name === name),
					{
						onNone: () =>
							Effect.fail(new AgentResolutionError({ message: `Agent '${name}' was not found.`, name })),
						onSome: Effect.succeed
					}
				);
			});

			const resolveMany = Effect.fn("AgentCatalog.resolveMany")(function* (
				names: ReadonlyArray<RuntimeAgentName>,
				cwd: string,
				scope: AgentScope
			) {
				const snapshot = yield* discover(cwd, scope);
				return yield* Effect.forEach(
					names,
					(name) =>
						Option.match(
							Arr.findFirst(snapshot.agents, (agent) => agent.name === name),
							{
								onNone: () =>
									Effect.fail(new AgentResolutionError({ message: `Agent '${name}' was not found.`, name })),
								onSome: Effect.succeed
							}
						),
					{ concurrency: 1 }
				);
			});

			return Service.of({ discover, resolve, resolveMany });
		})
	);

	export const defaultLayer: Layer.Layer<Service> = layer.pipe(
		Layer.provide(AgentPaths.defaultLayer),
		Layer.provide(ProjectLayout.defaultLayer),
		Layer.provide(SettingsRepository.defaultLayer),
		Layer.provide(NodePlatformLayer)
	);
}

const mergeByScope = (
	scope: AgentScope,
	builtin: ReadonlyArray<ResolvedAgent>,
	user: ReadonlyArray<ResolvedAgent>,
	project: ReadonlyArray<ResolvedAgent>
): ReadonlyArray<ResolvedAgent> => {
	const overlay = (base: ReadonlyArray<ResolvedAgent>, next: ReadonlyArray<ResolvedAgent>): ReadonlyArray<ResolvedAgent> => {
		const replaced = Arr.map(base, (agent) =>
			Option.getOrElse(
				Arr.findFirst(next, (candidate) => candidate.name === agent.name),
				() => agent
			)
		);
		const additions = Arr.filter(next, (candidate) => !Arr.some(base, (agent) => agent.name === candidate.name));
		return [...replaced, ...additions];
	};

	return scope === "user"
		? overlay(builtin, user)
		: scope === "project"
			? overlay(builtin, project)
			: overlay(overlay(builtin, user), project);
};
