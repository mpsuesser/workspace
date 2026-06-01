import * as Schema from "effect/Schema";

export class DecodeInvocationError extends Schema.TaggedErrorClass<DecodeInvocationError>()(
	"DecodeInvocationError",
	{
		message: Schema.String,
		path: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "The raw subagent tool input could not be decoded into a typed invocation." }
) {}

export class ConfigLoadError extends Schema.TaggedErrorClass<ConfigLoadError>()(
	"ConfigLoadError",
	{
		message: Schema.String,
		path: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Subagents-effect configuration could not be loaded or decoded." }
) {}

export class AgentDiscoveryError extends Schema.TaggedErrorClass<AgentDiscoveryError>()(
	"AgentDiscoveryError",
	{
		message: Schema.String,
		path: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Agent or chain discovery failed." }
) {}

export class AgentResolutionError extends Schema.TaggedErrorClass<AgentResolutionError>()(
	"AgentResolutionError",
	{
		message: Schema.String,
		name: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A requested agent or chain could not be resolved." }
) {}

export class WorkflowCompileError extends Schema.TaggedErrorClass<WorkflowCompileError>()(
	"WorkflowCompileError",
	{
		message: Schema.String,
		stepIndex: Schema.optionalKey(Schema.Int),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A decoded invocation could not be compiled into an executable workflow plan." }
) {}

export class SessionForkError extends Schema.TaggedErrorClass<SessionForkError>()(
	"SessionForkError",
	{
		message: Schema.String,
		parentSessionFile: Schema.optionalKey(Schema.String),
		leafId: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Creating or resolving a forked child session failed." }
) {}

export class PromptPolicyError extends Schema.TaggedErrorClass<PromptPolicyError>()(
	"PromptPolicyError",
	{
		message: Schema.String,
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Child prompt policy rewriting failed." }
) {}

export class ContextSanitizationError extends Schema.TaggedErrorClass<ContextSanitizationError>()(
	"ContextSanitizationError",
	{
		message: Schema.String,
		messageIndex: Schema.optionalKey(Schema.Int),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Child-visible context could not be sanitized safely." }
) {}

export class ChildProtocolDecodeError extends Schema.TaggedErrorClass<ChildProtocolDecodeError>()(
	"ChildProtocolDecodeError",
	{
		message: Schema.String,
		line: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A child Pi JSON-mode event could not be decoded." }
) {}

export class ChildProcessError extends Schema.TaggedErrorClass<ChildProcessError>()(
	"ChildProcessError",
	{
		message: Schema.String,
		exitCode: Schema.optionalKey(Schema.Int),
		stderr: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A child Pi process failed before producing a usable step result." }
) {}

export class RunStoreError extends Schema.TaggedErrorClass<RunStoreError>()(
	"RunStoreError",
	{
		message: Schema.String,
		path: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Persisting or replaying typed run events failed." }
) {}

export class WorkflowRunError extends Schema.TaggedErrorClass<WorkflowRunError>()(
	"WorkflowRunError",
	{
		message: Schema.String,
		runId: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "An executable workflow failed." }
) {}

export class OutputError extends Schema.TaggedErrorClass<OutputError>()(
	"OutputError",
	{
		message: Schema.String,
		path: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "Output capture, validation, truncation, or persistence failed." }
) {}

export class AcceptanceError extends Schema.TaggedErrorClass<AcceptanceError>()(
	"AcceptanceError",
	{
		message: Schema.String,
		level: Schema.optionalKey(Schema.String),
		gateId: Schema.optionalKey(Schema.String),
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A workflow result did not satisfy its acceptance policy." }
) {}
