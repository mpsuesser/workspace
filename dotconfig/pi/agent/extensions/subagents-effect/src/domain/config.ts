import { Duration, Effect } from "effect";
import * as Schema from "effect/Schema";
import { AcceptanceInput } from "./acceptance.ts";

export const ControlEventType = Schema.Literals(["active_long_running", "needs_attention"]).annotate({
	title: "ControlEventType",
	description: "Supervisor attention event emitted by a child run."
});
export type ControlEventType = typeof ControlEventType.Type;

export const ControlNotificationChannel = Schema.Literals(["event", "async", "intercom"]).annotate({
	title: "ControlNotificationChannel",
	description: "Destination channel for a control notification."
});
export type ControlNotificationChannel = typeof ControlNotificationChannel.Type;

const PositiveInt = Schema.Int.check(Schema.isGreaterThan(0));

export class ControlConfig extends Schema.Class<ControlConfig>("ControlConfig")({
	enabled: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(true)),
		Schema.withConstructorDefault(Effect.succeed(true))
	),
	needsAttentionAfter: Schema.DurationFromString.pipe(
		Schema.withDecodingDefault(Effect.succeed("60 seconds")),
		Schema.withConstructorDefault(Effect.succeed(Duration.seconds(60)))
	),
	activeNoticeAfter: Schema.DurationFromString.pipe(
		Schema.withDecodingDefault(Effect.succeed("4 minutes")),
		Schema.withConstructorDefault(Effect.succeed(Duration.minutes(4)))
	),
	activeNoticeAfterTurns: Schema.OptionFromOptionalKey(PositiveInt),
	activeNoticeAfterTokens: Schema.OptionFromOptionalKey(PositiveInt),
	failedToolAttemptsBeforeAttention: PositiveInt.pipe(
		Schema.withDecodingDefault(Effect.succeed(3)),
		Schema.withConstructorDefault(Effect.succeed(3))
	),
	notifyOn: Schema.Array(ControlEventType).pipe(
		Schema.withDecodingDefault(Effect.succeed(["active_long_running", "needs_attention"] as const)),
		Schema.withConstructorDefault(Effect.succeed(["active_long_running", "needs_attention"] as const))
	),
	notifyChannels: Schema.Array(ControlNotificationChannel).pipe(
		Schema.withDecodingDefault(Effect.succeed(["event", "async", "intercom"] as const)),
		Schema.withConstructorDefault(Effect.succeed(["event", "async", "intercom"] as const))
	)
}) {}

export const IntercomBridgeMode = Schema.Literals(["off", "auto", "always"]).annotate({
	title: "IntercomBridgeMode",
	description: "How aggressively child runs should request Pi intercom coordination."
});
export type IntercomBridgeMode = typeof IntercomBridgeMode.Type;

export class IntercomBridgeConfig extends Schema.Class<IntercomBridgeConfig>("IntercomBridgeConfig")({
	mode: IntercomBridgeMode.pipe(
		Schema.withDecodingDefault(Effect.succeed("auto" as const)),
		Schema.withConstructorDefault(Effect.succeed("auto" as const))
	),
	instructionFile: Schema.OptionFromOptionalKey(Schema.String),
	resultDelivery: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(true)),
		Schema.withConstructorDefault(Effect.succeed(true))
	)
}) {}

export class ArtifactConfig extends Schema.Class<ArtifactConfig>("ArtifactConfig")({
	enabled: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(true)),
		Schema.withConstructorDefault(Effect.succeed(true))
	),
	cleanupAfter: Schema.DurationFromString.pipe(
		Schema.withDecodingDefault(Effect.succeed("7 days")),
		Schema.withConstructorDefault(Effect.succeed(Duration.days(7)))
	),
	maxOutputBytes: PositiveInt.pipe(
		Schema.withDecodingDefault(Effect.succeed(50 * 1024)),
		Schema.withConstructorDefault(Effect.succeed(50 * 1024))
	),
	maxOutputLines: PositiveInt.pipe(
		Schema.withDecodingDefault(Effect.succeed(2000)),
		Schema.withConstructorDefault(Effect.succeed(2000))
	)
}) {}

export class ParallelConfig extends Schema.Class<ParallelConfig>("ParallelConfig")({
	concurrency: PositiveInt.pipe(
		Schema.withDecodingDefault(Effect.succeed(4)),
		Schema.withConstructorDefault(Effect.succeed(4))
	),
	maxTasks: Schema.OptionFromOptionalKey(PositiveInt),
	dynamicFanoutMaxItems: Schema.OptionFromOptionalKey(PositiveInt)
}) {}

export class ExtensionConfig extends Schema.Class<ExtensionConfig>("ExtensionConfig")({
	asyncByDefault: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	forceTopLevelAsync: Schema.Boolean.pipe(
		Schema.withDecodingDefault(Effect.succeed(false)),
		Schema.withConstructorDefault(Effect.succeed(false))
	),
	maxSubagentDepth: PositiveInt.pipe(
		Schema.withDecodingDefault(Effect.succeed(1)),
		Schema.withConstructorDefault(Effect.succeed(1))
	),
	parallel: ParallelConfig.pipe(Schema.withDecodingDefault(Effect.succeed({}))),
	artifacts: ArtifactConfig.pipe(Schema.withDecodingDefault(Effect.succeed({}))),
	control: ControlConfig.pipe(Schema.withDecodingDefault(Effect.succeed({}))),
	intercomBridge: Schema.OptionFromOptionalKey(IntercomBridgeConfig),
	worktreeSetupHook: Schema.OptionFromOptionalKey(Schema.String),
	defaultAcceptance: Schema.OptionFromOptionalKey(AcceptanceInput)
}) {}
