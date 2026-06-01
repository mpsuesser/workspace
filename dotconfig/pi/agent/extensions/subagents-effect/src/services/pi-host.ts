import { Context, Effect, Layer } from "effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import type { Static, TSchema } from "typebox";
import type { RequestContextSource } from "../extension/request-context.ts";

export interface PiTextContent {
	readonly type: "text";
	readonly text: string;
}

export type PiUserMessageContent = string | PiTextContent[];

export interface PiSendMessageOptions {
	readonly triggerTurn?: boolean;
	readonly deliverAs?: "steer" | "followUp" | "nextTurn";
}

export interface PiSendUserMessageOptions {
	readonly deliverAs?: "steer" | "followUp";
}

export interface PiCustomMessage<TDetails = unknown> {
	readonly customType: string;
	readonly content: string;
	readonly display: boolean;
	readonly details?: TDetails;
}

export interface PiToolResult<TDetails = unknown> {
	readonly content: PiTextContent[];
	readonly details: TDetails;
	readonly terminate?: boolean;
}

export type PiToolUpdateCallback<TDetails = unknown> = (partial: PiToolResult<TDetails>) => void;

export interface PiToolDefinition<TParams extends TSchema = TSchema, TDetails = unknown> {
	readonly name: string;
	readonly label: string;
	readonly description: string;
	readonly promptSnippet?: string;
	readonly promptGuidelines?: string[];
	readonly parameters: TParams;
	readonly execute: (
		toolCallId: string,
		params: Static<TParams>,
		signal: AbortSignal | undefined,
		onUpdate: PiToolUpdateCallback<TDetails> | undefined,
		ctx: RequestContextSource
	) => Promise<PiToolResult<TDetails>>;
}

export interface PiCommandContextSource extends RequestContextSource {
	readonly ui: {
		readonly notify: (message: string, type?: "info" | "warning" | "error") => void;
	};
}

export interface PiCommandDefinition {
	readonly description?: string;
	readonly handler: (args: string, ctx: PiCommandContextSource) => Promise<void>;
}

export interface PiSessionShutdownEvent {
	readonly type: "session_shutdown";
	readonly reason: "quit" | "reload" | "new" | "resume" | "fork";
	readonly targetSessionFile?: string;
}

export type PiSessionShutdownHandler = (
	event: PiSessionShutdownEvent,
	ctx: RequestContextSource
) => Promise<void> | void;

export interface PiHostApi {
	readonly registerTool: (definition: PiToolDefinition) => void;
	readonly registerCommand: (name: string, definition: PiCommandDefinition) => void;
	readonly on: (event: "session_shutdown", handler: PiSessionShutdownHandler) => void;
	readonly sendMessage: <TDetails = unknown>(message: PiCustomMessage<TDetails>, options?: PiSendMessageOptions) => void;
	readonly sendUserMessage: (content: PiUserMessageContent, options?: PiSendUserMessageOptions) => void;
	readonly setSessionName: (name: string) => void;
	readonly getSessionName: () => string | undefined;
}

export class PiHostError extends Schema.TaggedErrorClass<PiHostError>()(
	"PiHostError",
	{
		operation: Schema.String,
		message: Schema.String,
		cause: Schema.optionalKey(Schema.Defect)
	},
	{ description: "A Pi host API call failed at the extension boundary." }
) {}

const toPiHostError = (operation: string, cause: unknown) =>
	new PiHostError({
		operation,
		message: `Pi host operation failed: ${operation}`,
		cause
	});

export namespace PiHost {
	export interface Interface {
		readonly registerTool: (definition: PiToolDefinition) => Effect.Effect<void, PiHostError>;
		readonly registerCommand: (name: string, definition: PiCommandDefinition) => Effect.Effect<void, PiHostError>;
		readonly sendMessage: <TDetails = unknown>(
			message: PiCustomMessage<TDetails>,
			options?: PiSendMessageOptions
		) => Effect.Effect<void, PiHostError>;
		readonly sendUserMessage: (
			content: PiUserMessageContent,
			options?: PiSendUserMessageOptions
		) => Effect.Effect<void, PiHostError>;
		readonly setSessionName: (name: string) => Effect.Effect<void, PiHostError>;
		readonly getSessionName: Effect.Effect<Option.Option<string>, PiHostError>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/PiHost") {}

	export const layer = (pi: PiHostApi): Layer.Layer<Service> =>
		Layer.succeed(
			Service,
			Service.of({
				registerTool: (definition) =>
					Effect.try({
						try: () => pi.registerTool(definition),
						catch: (cause) => toPiHostError("registerTool", cause)
					}),
				registerCommand: (name, definition) =>
					Effect.try({
						try: () => pi.registerCommand(name, definition),
						catch: (cause) => toPiHostError("registerCommand", cause)
					}),
				sendMessage: (message, options) =>
					Effect.try({
						try: () => pi.sendMessage(message, options),
						catch: (cause) => toPiHostError("sendMessage", cause)
					}),
				sendUserMessage: (content, options) =>
					Effect.try({
						try: () => pi.sendUserMessage(content, options),
						catch: (cause) => toPiHostError("sendUserMessage", cause)
					}),
				setSessionName: (name) =>
					Effect.try({
						try: () => pi.setSessionName(name),
						catch: (cause) => toPiHostError("setSessionName", cause)
					}),
				getSessionName: Effect.try({
					try: () => Option.fromNullishOr(pi.getSessionName()),
					catch: (cause) => toPiHostError("getSessionName", cause)
				})
			})
		);
}
