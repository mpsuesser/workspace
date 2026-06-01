import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ChildEvent } from "./child-protocol.ts";
import { ControlEventType, ControlNotificationChannel } from "./config.ts";
import { IntercomTarget, RunId, RuntimeAgentName, SessionFile } from "./ids.ts";
import { RunResult, StepResult, WorkflowGraphSnapshot } from "./results.ts";
import { WorkflowMode, WorkflowPlan } from "./workflow.ts";

export const ActivityState = Schema.Literals(["active_long_running", "needs_attention"]).annotate({
	title: "ActivityState",
	description: "Current supervisor attention state for a child run."
});
export type ActivityState = typeof ActivityState.Type;

export class ControlEvent extends Schema.Class<ControlEvent>("ControlEvent")({
	type: ControlEventType,
	from: Schema.OptionFromOptionalKey(ActivityState),
	to: ActivityState,
	ts: Schema.DateTimeUtcFromString,
	agent: RuntimeAgentName,
	index: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	runId: RunId,
	nestedRunId: Schema.OptionFromOptionalKey(RunId),
	message: Schema.String,
	reason: Schema.OptionFromOptionalKey(Schema.Literals([
		"idle",
		"completion_guard",
		"active_long_running",
		"tool_failures",
		"time_threshold",
		"turn_threshold",
		"token_threshold"
	])),
	turns: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	tokens: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	toolCount: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	currentTool: Schema.OptionFromOptionalKey(Schema.String),
	currentToolDurationMs: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	currentPath: Schema.OptionFromOptionalKey(Schema.String),
	elapsedMs: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	recentFailureSummary: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class RunCreated extends Schema.Class<RunCreated>("RunCreated")({
	type: Schema.tag("runCreated"),
	runId: RunId,
	mode: WorkflowMode,
	cwd: Schema.String,
	createdAt: Schema.DateTimeUtcFromString
}) {}

export class WorkflowCompiled extends Schema.Class<WorkflowCompiled>("WorkflowCompiled")({
	type: Schema.tag("workflowCompiled"),
	runId: RunId,
	plan: WorkflowPlan,
	compiledAt: Schema.DateTimeUtcFromString
}) {}

export class StepStarted extends Schema.Class<StepStarted>("StepStarted")({
	type: Schema.tag("stepStarted"),
	runId: RunId,
	stepIndex: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	agent: RuntimeAgentName,
	sessionFile: Schema.OptionFromOptionalKey(SessionFile),
	intercomTarget: Schema.OptionFromOptionalKey(IntercomTarget),
	startedAt: Schema.DateTimeUtcFromString
}) {}

export class StepObservedChildEvent extends Schema.Class<StepObservedChildEvent>("StepObservedChildEvent")({
	type: Schema.tag("stepObservedChildEvent"),
	runId: RunId,
	stepIndex: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	agent: RuntimeAgentName,
	event: ChildEvent,
	observedAt: Schema.DateTimeUtcFromString
}) {}

export class StepFinished extends Schema.Class<StepFinished>("StepFinished")({
	type: Schema.tag("stepFinished"),
	runId: RunId,
	stepIndex: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	result: StepResult,
	endedAt: Schema.DateTimeUtcFromString
}) {}

export class StepFailed extends Schema.Class<StepFailed>("StepFailed")({
	type: Schema.tag("stepFailed"),
	runId: RunId,
	stepIndex: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
	agent: RuntimeAgentName,
	message: Schema.String,
	failedAt: Schema.DateTimeUtcFromString
}) {}

export class ControlNoticeEmitted extends Schema.Class<ControlNoticeEmitted>("ControlNoticeEmitted")({
	type: Schema.tag("controlNoticeEmitted"),
	runId: RunId,
	stepIndex: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	event: ControlEvent,
	emittedAt: Schema.DateTimeUtcFromString,
	channels: Schema.Array(ControlNotificationChannel).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	)
}) {}

export class WorkflowGraphUpdated extends Schema.Class<WorkflowGraphUpdated>("WorkflowGraphUpdated")({
	type: Schema.tag("workflowGraphUpdated"),
	runId: RunId,
	graph: WorkflowGraphSnapshot,
	updatedAt: Schema.DateTimeUtcFromString
}) {}

export class RunFinished extends Schema.Class<RunFinished>("RunFinished")({
	type: Schema.tag("runFinished"),
	runId: RunId,
	result: RunResult,
	finishedAt: Schema.DateTimeUtcFromString
}) {}

export const RunEvent = Schema.Union([
	RunCreated,
	WorkflowCompiled,
	StepStarted,
	StepObservedChildEvent,
	StepFinished,
	StepFailed,
	ControlNoticeEmitted,
	WorkflowGraphUpdated,
	RunFinished
]).pipe(Schema.toTaggedUnion("type"));
export type RunEvent = typeof RunEvent.Type;
