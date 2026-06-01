import { Context, Effect, Layer } from "effect";
import { Type, type Static, type TSchema } from "typebox";
import type { RequestContext } from "../extension/request-context.ts";
import type { PiToolResult } from "./pi-host.ts";
import { PlaceholderSubagentToolDetails, SubagentTool } from "./subagent-tool.ts";

const TaskItem = Type.Object({
	agent: Type.String({ description: "Agent name to invoke once real execution is enabled." }),
	task: Type.String({ description: "Task to delegate once real execution is enabled." })
});

const ChainItem = Type.Object({
	agent: Type.Optional(Type.String({ description: "Agent name for this chain step." })),
	task: Type.Optional(Type.String({ description: "Task template for this chain step." }))
});

export const SubagentEffectParameters = Type.Object({
	action: Type.Optional(Type.String({ description: "Management action name for future slices." })),
	agent: Type.Optional(Type.String({ description: "Agent name for single mode." })),
	task: Type.Optional(Type.String({ description: "Task for single mode." })),
	tasks: Type.Optional(Type.Array(TaskItem, { description: "Parallel task items for future slices." })),
	chain: Type.Optional(Type.Array(ChainItem, { description: "Chain items for future slices." }))
});

export interface EffectToolDefinition<TParams extends TSchema = TSchema, TDetails = unknown> {
	readonly name: string;
	readonly label: string;
	readonly description: string;
	readonly promptSnippet?: string;
	readonly promptGuidelines?: string[];
	readonly parameters: TParams;
	readonly execute: (
		toolCallId: string,
		params: Static<TParams>,
		context: RequestContext
	) => Effect.Effect<PiToolResult<TDetails>>;
}

export interface NamedEffectCommandDefinition {
	readonly name: string;
	readonly description: string;
	readonly handler: (args: string, context: RequestContext) => Effect.Effect<string>;
}

export interface ExtensionRegistrationPlan {
	readonly tools: ReadonlyArray<EffectToolDefinition>;
	readonly commands: ReadonlyArray<NamedEffectCommandDefinition>;
}

export namespace ExtensionRegistrar {
	export interface Interface {
		readonly registrationPlan: Effect.Effect<ExtensionRegistrationPlan>;
	}

	export class Service extends Context.Service<Service, Interface>()("@subagents-effect/ExtensionRegistrar") {}

	export const layer: Layer.Layer<Service, never, SubagentTool.Service> = Layer.effect(
		Service,
		Effect.gen(function* () {
			const subagentTool = yield* SubagentTool.Service;

			const registrationPlan = Effect.fn("ExtensionRegistrar.registrationPlan")(function* () {
				const tool: EffectToolDefinition<typeof SubagentEffectParameters, PlaceholderSubagentToolDetails> = {
					name: "subagent_effect",
					label: "Subagent Effect",
					description: [
						"Effect-first subagent orchestration tool.",
						"This development build currently proves extension loading and ManagedRuntime execution; real subagent execution follows in later slices."
					].join(" "),
					promptSnippet: "Run the Effect-first subagent orchestration tool",
					promptGuidelines: [
						"Use subagent_effect only when the user explicitly asks to test the new Effect-first subagent extension."
					],
					parameters: SubagentEffectParameters,
					execute: (_toolCallId, params, context) => subagentTool.executePlaceholder(params, context)
				};

				const doctorCommand: NamedEffectCommandDefinition = {
					name: "subagents-effect-doctor",
					description: "Show subagents-effect extension health information",
					handler: (_args, context) => subagentTool.doctor(context)
				};

				return {
					tools: [tool],
					commands: [doctorCommand]
				};
			});

			return Service.of({ registrationPlan: registrationPlan() });
		})
	);
}
