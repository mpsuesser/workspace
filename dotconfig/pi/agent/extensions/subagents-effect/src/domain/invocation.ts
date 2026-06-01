import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { AcceptanceInput } from "./acceptance.ts";
import { AgentScope, OutputMode } from "./agents.ts";
import { ControlConfig } from "./config.ts";
import { ChainName, RunId, RuntimeAgentName } from "./ids.ts";
import {
	DynamicCollectSpec,
	DynamicExpandSpec,
	ExecutionContextMode,
	JsonSchemaObject,
	OutputOverride,
	ParallelTaskItem,
	ParallelTaskTemplate,
	ReadsOverride,
	SkillOverride,
	TaskItem
} from "./workflow.ts";

export const ManagementActionName = Schema.Literals([
	"list",
	"get",
	"create",
	"update",
	"delete",
	"status",
	"interrupt",
	"resume",
	"doctor"
]).annotate({
	title: "ManagementActionName",
	description: "Public management/control action names accepted by the subagent tool."
});
export type ManagementActionName = typeof ManagementActionName.Type;

export class ChainItem extends Schema.Class<ChainItem>("ChainItem")({
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	task: Schema.OptionFromOptionalKey(Schema.String),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	as: Schema.OptionFromOptionalKey(Schema.String),
	outputSchema: Schema.OptionFromOptionalKey(JsonSchemaObject),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	output: Schema.OptionFromOptionalKey(OutputOverride),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	reads: Schema.OptionFromOptionalKey(ReadsOverride),
	progress: Schema.OptionFromOptionalKey(Schema.Boolean),
	skill: Schema.OptionFromOptionalKey(SkillOverride),
	model: Schema.OptionFromOptionalKey(Schema.String),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput),
	parallel: Schema.OptionFromOptionalKey(Schema.Union([Schema.NonEmptyArray(ParallelTaskItem), ParallelTaskTemplate])),
	expand: Schema.OptionFromOptionalKey(DynamicExpandSpec),
	collect: Schema.OptionFromOptionalKey(DynamicCollectSpec),
	concurrency: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	failFast: Schema.OptionFromOptionalKey(Schema.Boolean),
	worktree: Schema.OptionFromOptionalKey(Schema.Boolean)
}) {}

export class SingleLaunch extends Schema.Class<SingleLaunch>("SingleLaunch")({
	kind: Schema.tag("single"),
	agent: RuntimeAgentName,
	task: Schema.OptionFromOptionalKey(Schema.String),
	context: Schema.OptionFromOptionalKey(ExecutionContextMode),
	async: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	clarify: Schema.OptionFromOptionalKey(Schema.Boolean),
	share: Schema.OptionFromOptionalKey(Schema.Boolean),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	output: Schema.OptionFromOptionalKey(OutputOverride),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	model: Schema.OptionFromOptionalKey(Schema.String),
	skill: Schema.OptionFromOptionalKey(SkillOverride),
	control: Schema.OptionFromOptionalKey(ControlConfig),
	agentScope: AgentScope.pipe(
		Schema.withDecodingDefault(Effect.succeed("both" as const)),
		Schema.withConstructorDefault(Effect.succeed("both" as const))
	),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export class ParallelLaunch extends Schema.Class<ParallelLaunch>("ParallelLaunch")({
	kind: Schema.tag("parallel"),
	tasks: Schema.NonEmptyArray(TaskItem),
	concurrency: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	worktree: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	context: Schema.OptionFromOptionalKey(ExecutionContextMode),
	async: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	clarify: Schema.OptionFromOptionalKey(Schema.Boolean),
	share: Schema.OptionFromOptionalKey(Schema.Boolean),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	control: Schema.OptionFromOptionalKey(ControlConfig),
	agentScope: AgentScope.pipe(
		Schema.withDecodingDefault(Effect.succeed("both" as const)),
		Schema.withConstructorDefault(Effect.succeed("both" as const))
	)
}) {}

export class ChainLaunch extends Schema.Class<ChainLaunch>("ChainLaunch")({
	kind: Schema.tag("chain"),
	chain: Schema.NonEmptyArray(ChainItem),
	chainDir: Schema.OptionFromOptionalKey(Schema.String),
	context: Schema.OptionFromOptionalKey(ExecutionContextMode),
	async: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	clarify: Schema.OptionFromOptionalKey(Schema.Boolean),
	share: Schema.OptionFromOptionalKey(Schema.Boolean),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	control: Schema.OptionFromOptionalKey(ControlConfig),
	agentScope: AgentScope.pipe(
		Schema.withDecodingDefault(Effect.succeed("both" as const)),
		Schema.withConstructorDefault(Effect.succeed("both" as const))
	)
}) {}

export const LaunchInvocation = Schema.Union([SingleLaunch, ParallelLaunch, ChainLaunch]).pipe(Schema.toTaggedUnion("kind"));
export type LaunchInvocation = typeof LaunchInvocation.Type;

export class ListAgents extends Schema.Class<ListAgents>("ListAgents")({
	kind: Schema.tag("list"),
	scope: AgentScope.pipe(
		Schema.withDecodingDefault(Effect.succeed("both" as const)),
		Schema.withConstructorDefault(Effect.succeed("both" as const))
	)
}) {}

export class GetAgent extends Schema.Class<GetAgent>("GetAgent")({
	kind: Schema.tag("get"),
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	chainName: Schema.OptionFromOptionalKey(ChainName),
	scope: AgentScope.pipe(
		Schema.withDecodingDefault(Effect.succeed("both" as const)),
		Schema.withConstructorDefault(Effect.succeed("both" as const))
	)
}) {}

export class CreateAgent extends Schema.Class<CreateAgent>("CreateAgent")({
	kind: Schema.tag("create"),
	config: Schema.Record(Schema.String, Schema.Unknown)
}) {}

export class UpdateAgent extends Schema.Class<UpdateAgent>("UpdateAgent")({
	kind: Schema.tag("update"),
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	chainName: Schema.OptionFromOptionalKey(ChainName),
	config: Schema.Record(Schema.String, Schema.Unknown)
}) {}

export class DeleteAgent extends Schema.Class<DeleteAgent>("DeleteAgent")({
	kind: Schema.tag("delete"),
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	chainName: Schema.OptionFromOptionalKey(ChainName)
}) {}

export class StatusRun extends Schema.Class<StatusRun>("StatusRun")({
	kind: Schema.tag("status"),
	id: Schema.OptionFromOptionalKey(RunId),
	dir: Schema.OptionFromOptionalKey(Schema.String),
	includeProgress: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	)
}) {}

export class InterruptRun extends Schema.Class<InterruptRun>("InterruptRun")({
	kind: Schema.tag("interrupt"),
	id: Schema.OptionFromOptionalKey(RunId),
	runId: Schema.OptionFromOptionalKey(RunId)
}) {}

export class ResumeRun extends Schema.Class<ResumeRun>("ResumeRun")({
	kind: Schema.tag("resume"),
	id: Schema.OptionFromOptionalKey(RunId),
	runId: Schema.OptionFromOptionalKey(RunId),
	dir: Schema.OptionFromOptionalKey(Schema.String),
	index: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	message: Schema.String
}) {}

export class Doctor extends Schema.Class<Doctor>("Doctor")({
	kind: Schema.tag("doctor")
}) {}

export const ManagementInvocation = Schema.Union([
	ListAgents,
	GetAgent,
	CreateAgent,
	UpdateAgent,
	DeleteAgent,
	StatusRun,
	InterruptRun,
	ResumeRun,
	Doctor
]).pipe(Schema.toTaggedUnion("kind"));
export type ManagementInvocation = typeof ManagementInvocation.Type;

export const SubagentInvocation = Schema.Union([
	SingleLaunch,
	ParallelLaunch,
	ChainLaunch,
	ListAgents,
	GetAgent,
	CreateAgent,
	UpdateAgent,
	DeleteAgent,
	StatusRun,
	InterruptRun,
	ResumeRun,
	Doctor
]).pipe(Schema.toTaggedUnion("kind"));
export type SubagentInvocation = typeof SubagentInvocation.Type;
