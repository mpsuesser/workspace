import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { AcceptanceInput } from "./acceptance.ts";
import { OutputMode, ResolvedAgent } from "./agents.ts";
import { ControlConfig } from "./config.ts";
import { JsonPointer, OutputName, RunId, RuntimeAgentName, SessionFile } from "./ids.ts";

export const WorkflowMode = Schema.Literals(["single", "parallel", "chain"]).annotate({
	title: "WorkflowMode",
	description: "Top-level execution mode for a subagent run."
});
export type WorkflowMode = typeof WorkflowMode.Type;

export const ExecutionContextMode = Schema.Literals(["fresh", "fork"]).annotate({
	title: "ExecutionContextMode",
	description: "Whether child sessions start fresh or fork from the parent session."
});
export type ExecutionContextMode = typeof ExecutionContextMode.Type;

export const JsonSchemaObject = Schema.Record(Schema.String, Schema.Unknown).annotate({
	title: "JsonSchemaObject",
	description: "JSON Schema object used for strict structured subagent output."
});
export type JsonSchemaObject = typeof JsonSchemaObject.Type;

export class StructuredOutputContract extends Schema.Class<StructuredOutputContract>("StructuredOutputContract")({
	schema: JsonSchemaObject,
	schemaPath: Schema.OptionFromOptionalKey(Schema.String),
	capturePath: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export const OutputOverride = Schema.Union([Schema.String, Schema.Literal(false)]).annotate({
	title: "OutputOverride",
	description: "Output path override or false to disable saved output."
});
export type OutputOverride = typeof OutputOverride.Type;

export const ReadsOverride = Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)]).annotate({
	title: "ReadsOverride",
	description: "Files a child should read before running, or false to disable inherited reads."
});
export type ReadsOverride = typeof ReadsOverride.Type;

export const SkillOverride = Schema.Union([Schema.Array(Schema.String), Schema.Boolean, Schema.String]).annotate({
	title: "SkillOverride",
	description: "Skill override accepted by public invocations."
});
export type SkillOverride = typeof SkillOverride.Type;

export class StepBehavior extends Schema.Class<StepBehavior>("StepBehavior")({
	output: Schema.Union([Schema.String, Schema.Literal(false)]).pipe(
		Schema.withDecodingDefault(Effect.succeed(false as const)),
		Schema.withConstructorDefault(Effect.succeed(false as const))
	),
	outputMode: OutputMode.pipe(
		Schema.withDecodingDefault(Effect.succeed("inline" as const)),
		Schema.withConstructorDefault(Effect.succeed("inline" as const))
	),
	reads: ReadsOverride.pipe(
		Schema.withDecodingDefault(Effect.succeed(false as const)),
		Schema.withConstructorDefault(Effect.succeed(false as const))
	),
	progress: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	skills: Schema.Union([Schema.Array(Schema.String), Schema.Literal(false)]).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	model: Schema.OptionFromOptionalKey(Schema.String),
	structuredOutput: Schema.OptionFromOptionalKey(StructuredOutputContract)
}) {}

export class TaskItem extends Schema.Class<TaskItem>("TaskItem")({
	agent: RuntimeAgentName,
	task: Schema.String,
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	count: Schema.Int.check(Schema.isGreaterThan(0)).pipe(
		Schema.withDecodingDefault(Effect.succeed(1)),
		Schema.withConstructorDefault(Effect.succeed(1))
	),
	output: Schema.OptionFromOptionalKey(OutputOverride),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	reads: Schema.OptionFromOptionalKey(ReadsOverride),
	progress: Schema.OptionFromOptionalKey(Schema.Boolean),
	model: Schema.OptionFromOptionalKey(Schema.String),
	skill: Schema.OptionFromOptionalKey(SkillOverride),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export class ParallelTaskItem extends Schema.Class<ParallelTaskItem>("ParallelTaskItem")({
	agent: RuntimeAgentName,
	task: Schema.OptionFromOptionalKey(Schema.String),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	as: Schema.OptionFromOptionalKey(OutputName),
	outputSchema: Schema.OptionFromOptionalKey(JsonSchemaObject),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	count: Schema.Int.check(Schema.isGreaterThan(0)).pipe(
		Schema.withDecodingDefault(Effect.succeed(1)),
		Schema.withConstructorDefault(Effect.succeed(1))
	),
	output: Schema.OptionFromOptionalKey(OutputOverride),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	reads: Schema.OptionFromOptionalKey(ReadsOverride),
	progress: Schema.OptionFromOptionalKey(Schema.Boolean),
	skill: Schema.OptionFromOptionalKey(SkillOverride),
	model: Schema.OptionFromOptionalKey(Schema.String),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export class DynamicExpandSource extends Schema.Class<DynamicExpandSource>("DynamicExpandSource")({
	output: OutputName,
	path: JsonPointer
}) {}

export class DynamicExpandSpec extends Schema.Class<DynamicExpandSpec>("DynamicExpandSpec")({
	from: DynamicExpandSource,
	item: Schema.NonEmptyString.pipe(
		Schema.withDecodingDefault(Effect.succeed("item")),
		Schema.withConstructorDefault(Effect.succeed("item"))
	),
	key: Schema.OptionFromOptionalKey(JsonPointer),
	maxItems: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	onEmpty: Schema.Literals(["skip", "fail"]).pipe(
		Schema.withDecodingDefault(Effect.succeed("skip" as const)),
		Schema.withConstructorDefault(Effect.succeed("skip" as const))
	)
}) {}

export class DynamicCollectSpec extends Schema.Class<DynamicCollectSpec>("DynamicCollectSpec")({
	as: OutputName,
	outputSchema: Schema.OptionFromOptionalKey(JsonSchemaObject)
}) {}

export class ParallelTaskTemplate extends Schema.Class<ParallelTaskTemplate>("ParallelTaskTemplate")({
	agent: RuntimeAgentName,
	task: Schema.OptionFromOptionalKey(Schema.String),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	outputSchema: Schema.OptionFromOptionalKey(JsonSchemaObject),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	output: Schema.OptionFromOptionalKey(OutputOverride),
	outputMode: Schema.OptionFromOptionalKey(OutputMode),
	reads: Schema.OptionFromOptionalKey(ReadsOverride),
	progress: Schema.OptionFromOptionalKey(Schema.Boolean),
	skill: Schema.OptionFromOptionalKey(SkillOverride),
	model: Schema.OptionFromOptionalKey(Schema.String),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export class SequentialWorkflowStep extends Schema.Class<SequentialWorkflowStep>("SequentialWorkflowStep")({
	kind: Schema.tag("sequential"),
	index: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	agent: RuntimeAgentName,
	resolvedAgent: ResolvedAgent,
	task: Schema.String,
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	as: Schema.OptionFromOptionalKey(OutputName),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	behavior: StepBehavior,
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput),
	sessionFile: Schema.OptionFromOptionalKey(SessionFile)
}) {}

export class StaticParallelGroup extends Schema.Class<StaticParallelGroup>("StaticParallelGroup")({
	kind: Schema.tag("parallel"),
	index: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	tasks: Schema.NonEmptyArray(ParallelTaskItem),
	concurrency: Schema.Int.check(Schema.isGreaterThan(0)),
	failFast: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	worktree: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	cwd: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class DynamicFanoutGroup extends Schema.Class<DynamicFanoutGroup>("DynamicFanoutGroup")({
	kind: Schema.tag("dynamicFanout"),
	index: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	expand: DynamicExpandSpec,
	parallel: ParallelTaskTemplate,
	collect: DynamicCollectSpec,
	concurrency: Schema.Int.check(Schema.isGreaterThan(0)),
	failFast: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.OptionFromOptionalKey(Schema.String),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}

export const WorkflowStep = Schema.Union([
	SequentialWorkflowStep,
	StaticParallelGroup,
	DynamicFanoutGroup
]).pipe(Schema.toTaggedUnion("kind"));
export type WorkflowStep = typeof WorkflowStep.Type;

export class WorkflowPlan extends Schema.Class<WorkflowPlan>("WorkflowPlan")({
	runId: RunId,
	mode: WorkflowMode,
	cwd: Schema.String,
	context: ExecutionContextMode,
	steps: Schema.NonEmptyArray(WorkflowStep),
	control: ControlConfig,
	artifactsEnabled: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(true)),
		Schema.withConstructorDefault(Effect.succeed(true))
	),
	share: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	warnings: Schema.Array(Schema.String).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	)
}) {}
