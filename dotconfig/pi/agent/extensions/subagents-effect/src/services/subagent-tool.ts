import { Context, Effect, Layer, pipe } from "effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import type { RequestContext } from "../extension/request-context.ts";
import type { PiTextContent, PiToolResult } from "./pi-host.ts";

export class PlaceholderInvocationProbe extends Schema.Class<PlaceholderInvocationProbe>("PlaceholderInvocationProbe")({
	action: Schema.OptionFromOptionalKey(Schema.String),
	agent: Schema.OptionFromOptionalKey(Schema.String),
	task: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export class PlaceholderSubagentToolDetails extends Schema.Class<PlaceholderSubagentToolDetails>(
	"PlaceholderSubagentToolDetails"
)({
	status: Schema.Literal("placeholder"),
	cwd: Schema.String,
	hasUI: Schema.Boolean
}) {}

const decodeProbeOption = Schema.decodeUnknownOption(PlaceholderInvocationProbe);

const optionalField = (
	probe: Option.Option<PlaceholderInvocationProbe>,
	field: "action" | "agent" | "task"
): Option.Option<string> => pipe(probe, Option.flatMap((value) => value[field]));

const describeOptional = (label: string, value: Option.Option<string>): string =>
	Option.match(value, {
		onNone: () => `${label}: <none>`,
		onSome: (text) => `${label}: ${text}`
	});

export namespace SubagentTool {
	export interface Interface {
		readonly executePlaceholder: (
			input: unknown,
			context: RequestContext
		) => Effect.Effect<PiToolResult<PlaceholderSubagentToolDetails>>;
		readonly doctor: (context: RequestContext) => Effect.Effect<string>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/SubagentTool") {}

	const executePlaceholder = Effect.fn("SubagentTool.executePlaceholder")(function* (
		input: unknown,
		context: RequestContext
	) {
		const probe = decodeProbeOption(input);
		const details = new PlaceholderSubagentToolDetails({
			status: "placeholder",
			cwd: context.cwd,
			hasUI: context.hasUI
		});

		yield* Effect.logInfo("subagent_effect placeholder invoked");

		const textContent: PiTextContent = {
			type: "text",
			text: [
				"subagent_effect is loaded and running through the Effect ManagedRuntime shell.",
				"Real subagent execution is not implemented in this slice yet.",
				describeOptional("action", optionalField(probe, "action")),
				describeOptional("agent", optionalField(probe, "agent")),
				describeOptional("task", optionalField(probe, "task"))
			].join("\n")
		};

		return {
			content: [textContent],
			details,
			terminate: true
		};
	});

	const doctor = Effect.fn("SubagentTool.doctor")(function* (context: RequestContext) {
		yield* Effect.logInfo("subagents-effect doctor invoked");
		return [
			"subagents-effect doctor",
			"status: loaded",
			"runtime: Effect ManagedRuntime shell",
			`cwd: ${context.cwd}`,
			`ui: ${context.hasUI ? "available" : "unavailable"}`,
			Option.match(context.sessionFile, {
				onNone: () => "sessionFile: <none>",
				onSome: (sessionFile) => `sessionFile: ${sessionFile}`
			})
		].join("\n");
	});

	export const layer: Layer.Layer<Service> = Layer.succeed(
		Service,
		Service.of({
			executePlaceholder,
			doctor
		})
	);
}
