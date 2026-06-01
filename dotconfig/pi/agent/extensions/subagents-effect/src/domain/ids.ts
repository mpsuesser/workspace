import * as Schema from "effect/Schema";

const nonEmptyIdentifier = (title: string, description: string) =>
	Schema.NonEmptyString.annotate({ title, description });

export const RunId = nonEmptyIdentifier("RunId", "Stable identifier for a subagent run.").pipe(Schema.brand("RunId"));
export type RunId = typeof RunId.Type;
export const isRunId = Schema.is(RunId);

export const AgentName = nonEmptyIdentifier("AgentName", "Local agent name before package qualification.").pipe(Schema.brand("AgentName"));
export type AgentName = typeof AgentName.Type;
export const isAgentName = Schema.is(AgentName);

export const RuntimeAgentName = nonEmptyIdentifier("RuntimeAgentName", "Runtime agent name, optionally package-qualified.").pipe(Schema.brand("RuntimeAgentName"));
export type RuntimeAgentName = typeof RuntimeAgentName.Type;
export const isRuntimeAgentName = Schema.is(RuntimeAgentName);

export const ChainName = nonEmptyIdentifier("ChainName", "Runtime chain name, optionally package-qualified.").pipe(Schema.brand("ChainName"));
export type ChainName = typeof ChainName.Type;
export const isChainName = Schema.is(ChainName);

export const SessionFile = nonEmptyIdentifier("SessionFile", "Path to a persisted Pi session JSONL file.").pipe(Schema.brand("SessionFile"));
export type SessionFile = typeof SessionFile.Type;
export const isSessionFile = Schema.is(SessionFile);

export const SessionId = nonEmptyIdentifier("SessionId", "Pi session identifier.").pipe(Schema.brand("SessionId"));
export type SessionId = typeof SessionId.Type;
export const isSessionId = Schema.is(SessionId);

export const OutputName = Schema.NonEmptyString.check(
	Schema.isPattern(/^[A-Za-z_][A-Za-z0-9_-]*$/, {
		identifier: "OutputNamePatternCheck",
		title: "Output Name Pattern",
		description: "A named workflow output reference safe for template lookup.",
		message: "Output names must start with a letter or underscore and contain only letters, numbers, underscores, or dashes"
	})
).pipe(
	Schema.brand("OutputName"),
	Schema.annotate({
		title: "OutputName",
		description: "Safe identifier used to expose a step output to later workflow steps."
	})
);
export type OutputName = typeof OutputName.Type;
export const isOutputName = Schema.is(OutputName);

export const JsonPointer = Schema.String.check(
	Schema.isPattern(/^(?:$|\/(?:[^/~]|~0|~1)*)*$/, {
		identifier: "JsonPointerPatternCheck",
		title: "JSON Pointer Pattern",
		description: "RFC 6901-style JSON pointer used to select data from structured outputs.",
		message: "JSON pointer must be empty or start with /"
	})
).pipe(
	Schema.brand("JsonPointer"),
	Schema.annotate({
		title: "JsonPointer",
		description: "Pointer into a structured JSON output."
	})
);
export type JsonPointer = typeof JsonPointer.Type;
export const isJsonPointer = Schema.is(JsonPointer);

export const ToolCallId = nonEmptyIdentifier("ToolCallId", "Provider tool-call identifier.").pipe(Schema.brand("ToolCallId"));
export type ToolCallId = typeof ToolCallId.Type;
export const isToolCallId = Schema.is(ToolCallId);

export const IntercomTarget = nonEmptyIdentifier("IntercomTarget", "Pi intercom session target for supervisor/child coordination.").pipe(Schema.brand("IntercomTarget"));
export type IntercomTarget = typeof IntercomTarget.Type;
export const isIntercomTarget = Schema.is(IntercomTarget);
