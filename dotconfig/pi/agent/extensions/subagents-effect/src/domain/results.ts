import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { AcceptanceLedger } from "./acceptance.ts";
import { WorkflowMode } from "./workflow.ts";
import { IntercomTarget, OutputName, RunId, RuntimeAgentName, SessionFile } from "./ids.ts";

export class Usage extends Schema.Class<Usage>("Usage")({
	input: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	output: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheRead: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheWrite: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cost: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	turns: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)).pipe(
		Schema.withDecodingDefault(Effect.succeed(0)),
		Schema.withConstructorDefault(Effect.succeed(0))
	)
}) {}

export class TokenUsage extends Schema.Class<TokenUsage>("TokenUsage")({
	input: Schema.Number,
	output: Schema.Number,
	total: Schema.Number
}) {}

export class ModelAttempt extends Schema.Class<ModelAttempt>("ModelAttempt")({
	model: Schema.String,
	success: Schema.Boolean,
	exitCode: Schema.OptionFromOptionalKey(Schema.Int),
	error: Schema.OptionFromOptionalKey(Schema.String),
	usage: Schema.OptionFromOptionalKey(Usage)
}) {}

export class SavedOutputReference extends Schema.Class<SavedOutputReference>("SavedOutputReference")({
	path: Schema.String,
	bytes: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	lines: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	message: Schema.String
}) {}

export class TruncationInfo extends Schema.Class<TruncationInfo>("TruncationInfo")({
	truncated: Schema.Boolean,
	originalBytes: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	originalLines: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	artifactPath: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export const StepResultStatus = Schema.Literals(["completed", "failed", "paused", "detached", "skipped"]).annotate({
	title: "StepResultStatus",
	description: "Terminal status for a workflow step."
});
export type StepResultStatus = typeof StepResultStatus.Type;

export class StepResult extends Schema.Class<StepResult>("StepResult")({
	agent: RuntimeAgentName,
	index: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	status: StepResultStatus,
	output: Schema.String,
	error: Schema.OptionFromOptionalKey(Schema.String),
	exitCode: Schema.OptionFromOptionalKey(Schema.Int),
	sessionFile: Schema.OptionFromOptionalKey(SessionFile),
	intercomTarget: Schema.OptionFromOptionalKey(IntercomTarget),
	model: Schema.OptionFromOptionalKey(Schema.String),
	attemptedModels: Schema.Array(Schema.String).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	modelAttempts: Schema.Array(ModelAttempt).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	usage: Usage.pipe(
		Schema.withDecodingDefault(Effect.succeed(new Usage())),
		Schema.withConstructorDefault(Effect.succeed(new Usage()))
	),
	structuredOutput: Schema.OptionFromOptionalKey(Schema.Unknown),
	structuredOutputPath: Schema.OptionFromOptionalKey(Schema.String),
	acceptance: Schema.OptionFromOptionalKey(AcceptanceLedger),
	outputReference: Schema.OptionFromOptionalKey(SavedOutputReference),
	truncation: Schema.OptionFromOptionalKey(TruncationInfo),
	outputName: Schema.OptionFromOptionalKey(OutputName)
}) {}

export const RunResultStatus = Schema.Literals(["completed", "failed", "paused", "detached"]).annotate({
	title: "RunResultStatus",
	description: "Terminal status for a subagent workflow run."
});
export type RunResultStatus = typeof RunResultStatus.Type;

export class RunResult extends Schema.Class<RunResult>("RunResult")({
	runId: RunId,
	mode: WorkflowMode,
	status: RunResultStatus,
	summary: Schema.String,
	children: Schema.Array(StepResult),
	usage: Usage.pipe(
		Schema.withDecodingDefault(Effect.succeed(new Usage())),
		Schema.withConstructorDefault(Effect.succeed(new Usage()))
	),
	startedAt: Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromString),
	endedAt: Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromString),
	error: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export const WorkflowNodeStatus = Schema.Literals(["pending", "running", "completed", "failed", "paused", "detached", "skipped"]).annotate({
	title: "WorkflowNodeStatus",
	description: "Status for a node in a projected workflow graph."
});
export type WorkflowNodeStatus = typeof WorkflowNodeStatus.Type;

interface WorkflowGraphNodeEncoded extends Schema.Codec.Encoded<typeof WorkflowGraphNode> {}

export class WorkflowGraphNode extends Schema.Class<WorkflowGraphNode>("WorkflowGraphNode")({
	id: Schema.String,
	kind: Schema.Literals(["step", "parallel-group", "dynamic-parallel-group", "agent"]),
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	phase: Schema.OptionFromOptionalKey(Schema.String),
	label: Schema.String,
	status: WorkflowNodeStatus,
	flatIndex: Schema.OptionFromOptionalKey(Schema.Int),
	stepIndex: Schema.OptionFromOptionalKey(Schema.Int),
	children: Schema.OptionFromOptionalKey(
		Schema.Array(Schema.suspend((): Schema.Codec<WorkflowGraphNode, WorkflowGraphNodeEncoded> => WorkflowGraphNode))
	),
	outputName: Schema.OptionFromOptionalKey(OutputName),
	structured: Schema.OptionFromOptionalKey(Schema.Boolean),
	acceptanceStatus: Schema.OptionFromOptionalKey(Schema.String),
	error: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class WorkflowGraphPhase extends Schema.Class<WorkflowGraphPhase>("WorkflowGraphPhase")({
	title: Schema.String,
	nodeIds: Schema.Array(Schema.String)
}) {}

export class WorkflowGraphSnapshot extends Schema.Class<WorkflowGraphSnapshot>("WorkflowGraphSnapshot")({
	runId: RunId,
	mode: WorkflowMode,
	phases: Schema.Array(WorkflowGraphPhase).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	nodes: Schema.Array(WorkflowGraphNode).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	currentNodeId: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export const RunLifecycleState = Schema.Literals(["pending", "running", "completed", "failed", "paused", "detached", "stale"]).annotate({
	title: "RunLifecycleState",
	description: "Projected lifecycle state for a foreground or background run."
});
export type RunLifecycleState = typeof RunLifecycleState.Type;

export class RunStatus extends Schema.Class<RunStatus>("RunStatus")({
	runId: RunId,
	mode: WorkflowMode,
	state: RunLifecycleState,
	cwd: Schema.String,
	agent: Schema.OptionFromOptionalKey(RuntimeAgentName),
	agents: Schema.Array(RuntimeAgentName).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	currentStep: Schema.OptionFromOptionalKey(Schema.Int),
	steps: Schema.Array(StepResult).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	usage: Usage.pipe(
		Schema.withDecodingDefault(Effect.succeed(new Usage())),
		Schema.withConstructorDefault(Effect.succeed(new Usage()))
	),
	graph: Schema.OptionFromOptionalKey(WorkflowGraphSnapshot),
	startedAt: Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromString),
	endedAt: Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromString),
	lastUpdate: Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromString),
	error: Schema.OptionFromOptionalKey(Schema.String)
}) {}
