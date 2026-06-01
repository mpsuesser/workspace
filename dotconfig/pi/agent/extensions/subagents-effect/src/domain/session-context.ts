import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ToolCallId } from "./ids.ts";

export class TextBlock extends Schema.Class<TextBlock>("TextBlock")({
	type: Schema.tag("text"),
	text: Schema.String
}) {}

export class ImageBlock extends Schema.Class<ImageBlock>("ImageBlock")({
	type: Schema.tag("image"),
	data: Schema.OptionFromOptionalKey(Schema.String),
	mimeType: Schema.OptionFromOptionalKey(Schema.String),
	source: Schema.OptionFromOptionalKey(Schema.Unknown)
}) {}

export class ThinkingBlock extends Schema.Class<ThinkingBlock>("ThinkingBlock")({
	type: Schema.tag("thinking"),
	thinking: Schema.String.pipe(
		Schema.withDecodingDefault(Effect.succeed("")),
		Schema.withConstructorDefault(Effect.succeed(""))
	),
	thinkingSignature: Schema.OptionFromOptionalKey(Schema.String),
	signature: Schema.OptionFromOptionalKey(Schema.String),
	redacted: Schema.OptionFromOptionalKey(Schema.Boolean),
	data: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class RedactedThinkingBlock extends Schema.Class<RedactedThinkingBlock>("RedactedThinkingBlock")({
	type: Schema.tag("redacted_thinking"),
	data: Schema.String,
	thinkingSignature: Schema.OptionFromOptionalKey(Schema.String),
	signature: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class ToolCallBlock extends Schema.Class<ToolCallBlock>("ToolCallBlock")({
	type: Schema.tag("toolCall"),
	id: ToolCallId,
	name: Schema.String,
	arguments: Schema.Record(Schema.String, Schema.Unknown).pipe(
		Schema.withDecodingDefault(Effect.succeed({})),
		Schema.withConstructorDefault(Effect.succeed({}))
	)
}) {}

export const UserContentBlock = Schema.Union([TextBlock, ImageBlock]).pipe(Schema.toTaggedUnion("type"));
export type UserContentBlock = typeof UserContentBlock.Type;

export const AssistantContentBlock = Schema.Union([TextBlock, ThinkingBlock, RedactedThinkingBlock, ToolCallBlock]).pipe(Schema.toTaggedUnion("type"));
export type AssistantContentBlock = typeof AssistantContentBlock.Type;

export const ToolResultContentBlock = Schema.Union([TextBlock, ImageBlock]).pipe(Schema.toTaggedUnion("type"));
export type ToolResultContentBlock = typeof ToolResultContentBlock.Type;

export class MessageUsageCost extends Schema.Class<MessageUsageCost>("MessageUsageCost")({
	input: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	output: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheRead: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheWrite: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	total: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0)))
}) {}

export class MessageUsage extends Schema.Class<MessageUsage>("MessageUsage")({
	input: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	output: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheRead: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cacheWrite: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	totalTokens: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(0)), Schema.withConstructorDefault(Effect.succeed(0))),
	cost: MessageUsageCost.pipe(
		Schema.withDecodingDefault(Effect.succeed(new MessageUsageCost())),
		Schema.withConstructorDefault(Effect.succeed(new MessageUsageCost()))
	)
}) {}

export class UserContextMessage extends Schema.Class<UserContextMessage>("UserContextMessage")({
	role: Schema.tag("user"),
	content: Schema.Union([Schema.String, Schema.Array(UserContentBlock)]),
	timestamp: Schema.OptionFromOptionalKey(Schema.Number)
}) {}

export class AssistantContextMessage extends Schema.Class<AssistantContextMessage>("AssistantContextMessage")({
	role: Schema.tag("assistant"),
	content: Schema.Array(AssistantContentBlock),
	api: Schema.OptionFromOptionalKey(Schema.String),
	provider: Schema.OptionFromOptionalKey(Schema.String),
	model: Schema.OptionFromOptionalKey(Schema.String),
	usage: Schema.OptionFromOptionalKey(MessageUsage),
	stopReason: Schema.OptionFromOptionalKey(Schema.String),
	errorMessage: Schema.OptionFromOptionalKey(Schema.String),
	timestamp: Schema.OptionFromOptionalKey(Schema.Number)
}) {}

export class ToolResultContextMessage extends Schema.Class<ToolResultContextMessage>("ToolResultContextMessage")({
	role: Schema.tag("toolResult"),
	toolCallId: ToolCallId,
	toolName: Schema.String,
	content: Schema.Array(ToolResultContentBlock),
	details: Schema.OptionFromOptionalKey(Schema.Unknown),
	isError: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	timestamp: Schema.OptionFromOptionalKey(Schema.Number)
}) {}

export class CustomContextMessage extends Schema.Class<CustomContextMessage>("CustomContextMessage")({
	role: Schema.tag("custom"),
	customType: Schema.String,
	content: Schema.Union([Schema.String, Schema.Array(UserContentBlock)]),
	display: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	details: Schema.OptionFromOptionalKey(Schema.Unknown),
	timestamp: Schema.OptionFromOptionalKey(Schema.Number)
}) {}

export class CompactionSummaryContextMessage extends Schema.Class<CompactionSummaryContextMessage>("CompactionSummaryContextMessage")({
	role: Schema.tag("compactionSummary"),
	summary: Schema.String,
	tokensBefore: Schema.OptionFromOptionalKey(Schema.Number),
	timestamp: Schema.OptionFromOptionalKey(Schema.Number)
}) {}

export const ContextMessage = Schema.Union([
	UserContextMessage,
	AssistantContextMessage,
	ToolResultContextMessage,
	CustomContextMessage,
	CompactionSummaryContextMessage
]).pipe(Schema.toTaggedUnion("role"));
export type ContextMessage = typeof ContextMessage.Type;
