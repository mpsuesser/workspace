import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { AcceptanceInput } from "./acceptance.ts";
import { AgentName, ChainName, RuntimeAgentName } from "./ids.ts";

export const AgentSource = Schema.Literals(["builtin", "user", "project"]).annotate({
	title: "AgentSource",
	description: "Where an agent or chain definition was discovered."
});
export type AgentSource = typeof AgentSource.Type;

export const AgentScope = Schema.Literals(["user", "project", "both"]).annotate({
	title: "AgentScope",
	description: "Discovery scope requested by a tool invocation or management action."
});
export type AgentScope = typeof AgentScope.Type;

export const ThinkingLevel = Schema.Literals(["off", "minimal", "low", "medium", "high", "xhigh"]).annotate({
	title: "ThinkingLevel",
	description: "Pi reasoning/thinking level suffix applied to compatible models."
});
export type ThinkingLevel = typeof ThinkingLevel.Type;

export const SystemPromptMode = Schema.Literals(["replace", "append"]).annotate({
	title: "SystemPromptMode",
	description: "Whether an agent prompt replaces or appends to Pi's base system prompt."
});
export type SystemPromptMode = typeof SystemPromptMode.Type;

export const AgentDefaultContext = Schema.Literals(["fresh", "fork"]).annotate({
	title: "AgentDefaultContext",
	description: "Default context mode used when a launch omits an explicit context."
});
export type AgentDefaultContext = typeof AgentDefaultContext.Type;

export const OutputMode = Schema.Literals(["inline", "file-only"]).annotate({
	title: "OutputMode",
	description: "How saved child output is returned to the parent session."
});
export type OutputMode = typeof OutputMode.Type;

export class AgentDefinition extends Schema.Class<AgentDefinition>("AgentDefinition")({
	name: RuntimeAgentName,
	localName: Schema.OptionFromOptionalKey(AgentName),
	packageName: Schema.OptionFromOptionalKey(Schema.String),
	description: Schema.String,
	source: AgentSource,
	filePath: Schema.String,
	tools: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	mcpDirectTools: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	extensions: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	model: Schema.OptionFromOptionalKey(Schema.String),
	fallbackModels: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	thinking: Schema.OptionFromOptionalKey(ThinkingLevel),
	systemPromptMode: SystemPromptMode.pipe(
		Schema.withDecodingDefault(Effect.succeed("replace" as const)),
		Schema.withConstructorDefault(Effect.succeed("replace" as const))
	),
	inheritProjectContext: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	inheritSkills: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	defaultContext: Schema.OptionFromOptionalKey(AgentDefaultContext),
	systemPrompt: Schema.String,
	skills: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	output: Schema.OptionFromOptionalKey(Schema.String),
	defaultReads: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	defaultProgress: Schema.OptionFromOptionalKey(Schema.Boolean),
	interactive: Schema.OptionFromOptionalKey(Schema.Boolean),
	maxSubagentDepth: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	completionGuard: Schema.OptionFromOptionalKey(Schema.Boolean),
	disabled: Schema.OptionFromOptionalKey(Schema.Boolean),
	extraFields: Schema.OptionFromOptionalKey(Schema.Record(Schema.String, Schema.String))
}) {}

export class AgentOverride extends Schema.Class<AgentOverride>("AgentOverride")({
	model: Schema.OptionFromOptionalKey(Schema.Union([Schema.String, Schema.Literal(false)])),
	fallbackModels: Schema.OptionFromOptionalKey(Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)])),
	thinking: Schema.OptionFromOptionalKey(Schema.Union([ThinkingLevel, Schema.Literal(false)])),
	systemPromptMode: Schema.OptionFromOptionalKey(SystemPromptMode),
	inheritProjectContext: Schema.OptionFromOptionalKey(Schema.Boolean),
	inheritSkills: Schema.OptionFromOptionalKey(Schema.Boolean),
	defaultContext: Schema.OptionFromOptionalKey(Schema.Union([AgentDefaultContext, Schema.Literal(false)])),
	disabled: Schema.OptionFromOptionalKey(Schema.Boolean),
	systemPrompt: Schema.OptionFromOptionalKey(Schema.String),
	skills: Schema.OptionFromOptionalKey(Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)])),
	tools: Schema.OptionFromOptionalKey(Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)])),
	completionGuard: Schema.OptionFromOptionalKey(Schema.Boolean)
}) {}

export class ResolvedAgent extends Schema.Class<ResolvedAgent>("ResolvedAgent")({
	definition: AgentDefinition,
	name: RuntimeAgentName,
	description: Schema.String,
	tools: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	mcpDirectTools: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	extensions: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	model: Schema.OptionFromOptionalKey(Schema.String),
	fallbackModels: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	thinking: Schema.OptionFromOptionalKey(ThinkingLevel),
	systemPromptMode: SystemPromptMode,
	inheritProjectContext: Schema.Boolean,
	inheritSkills: Schema.Boolean,
	defaultContext: Schema.OptionFromOptionalKey(AgentDefaultContext),
	systemPrompt: Schema.String,
	skills: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	output: Schema.OptionFromOptionalKey(Schema.String),
	defaultReads: Schema.OptionFromOptionalKey(Schema.Array(Schema.String)),
	defaultProgress: Schema.OptionFromOptionalKey(Schema.Boolean),
	maxSubagentDepth: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	completionGuard: Schema.OptionFromOptionalKey(Schema.Boolean),
	override: Schema.OptionFromOptionalKey(AgentOverride),
	warnings: Schema.Array(Schema.String).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	)
}) {}

export class ChainStepDefinition extends Schema.Class<ChainStepDefinition>("ChainStepDefinition")({
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	task: Schema.OptionFromOptionalKey(Schema.String),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	as: Schema.OptionFromOptionalKey(Schema.String),
	outputSchema: Schema.OptionFromOptionalKey(Schema.Union([Schema.String, Schema.Record(Schema.String, Schema.Unknown)])),
	output: Schema.OptionFromOptionalKey(Schema.Union([Schema.String, Schema.Literal(false)])),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	reads: Schema.OptionFromOptionalKey(Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)])),
	model: Schema.OptionFromOptionalKey(Schema.String),
	skills: Schema.OptionFromOptionalKey(Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)])),
	progress: Schema.OptionFromOptionalKey(Schema.Boolean),
	parallel: Schema.OptionFromOptionalKey(Schema.Unknown),
	expand: Schema.OptionFromOptionalKey(Schema.Unknown),
	collect: Schema.OptionFromOptionalKey(Schema.Unknown),
	concurrency: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	failFast: Schema.OptionFromOptionalKey(Schema.Boolean),
	worktree: Schema.OptionFromOptionalKey(Schema.Boolean),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export class ChainDefinition extends Schema.Class<ChainDefinition>("ChainDefinition")({
	name: ChainName,
	localName: Schema.OptionFromOptionalKey(AgentName),
	packageName: Schema.OptionFromOptionalKey(Schema.String),
	description: Schema.String,
	source: AgentSource,
	filePath: Schema.String,
	steps: Schema.NonEmptyArray(ChainStepDefinition),
	extraFields: Schema.OptionFromOptionalKey(Schema.Record(Schema.String, Schema.String))
}) {}

export class AgentCatalogSnapshot extends Schema.Class<AgentCatalogSnapshot>("AgentCatalogSnapshot")({
	agents: Schema.Array(ResolvedAgent),
	chains: Schema.Array(ChainDefinition),
	warnings: Schema.Array(Schema.String).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	)
}) {}
