import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ToolCallId } from "./ids.ts";
import { ContextMessage } from "./session-context.ts";

export class ChildToolStarted extends Schema.Class<ChildToolStarted>("ChildToolStarted")({
	kind: Schema.tag("toolStarted"),
	toolCallId: ToolCallId,
	toolName: Schema.String,
	args: Schema.Record(Schema.String, Schema.Unknown).pipe(
		Schema.withDecodingDefault(Effect.succeed({})),
		Schema.withConstructorDefault(Effect.succeed({}))
	)
}) {}

export class ChildToolUpdated extends Schema.Class<ChildToolUpdated>("ChildToolUpdated")({
	kind: Schema.tag("toolUpdated"),
	toolCallId: ToolCallId,
	toolName: Schema.String,
	partialResult: Schema.OptionFromOptionalKey(Schema.Unknown)
}) {}

export class ChildToolEnded extends Schema.Class<ChildToolEnded>("ChildToolEnded")({
	kind: Schema.tag("toolEnded"),
	toolCallId: ToolCallId,
	toolName: Schema.String,
	isError: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	result: Schema.OptionFromOptionalKey(Schema.Unknown)
}) {}

export class ChildMessageEnded extends Schema.Class<ChildMessageEnded>("ChildMessageEnded")({
	kind: Schema.tag("messageEnded"),
	message: ContextMessage
}) {}

export class ChildStdoutLine extends Schema.Class<ChildStdoutLine>("ChildStdoutLine")({
	kind: Schema.tag("stdoutLine"),
	line: Schema.String
}) {}

export class ChildStderrLine extends Schema.Class<ChildStderrLine>("ChildStderrLine")({
	kind: Schema.tag("stderrLine"),
	line: Schema.String
}) {}

export class ChildMalformedLine extends Schema.Class<ChildMalformedLine>("ChildMalformedLine")({
	kind: Schema.tag("malformedLine"),
	line: Schema.String,
	reason: Schema.String
}) {}

export const ChildEvent = Schema.Union([
	ChildToolStarted,
	ChildToolUpdated,
	ChildToolEnded,
	ChildMessageEnded,
	ChildStdoutLine,
	ChildStderrLine,
	ChildMalformedLine
]).pipe(Schema.toTaggedUnion("kind"));
export type ChildEvent = typeof ChildEvent.Type;
