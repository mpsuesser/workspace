import { Effect, Layer, ManagedRuntime } from "effect";
import type { TSchema } from "typebox";
import { makeRequestContext } from "./request-context.ts";
import { ParentExtensionLayer } from "../layers/parent-extension-layer.ts";
import { ExtensionRegistrar, type EffectToolDefinition, type NamedEffectCommandDefinition } from "../services/extension-registrar.ts";
import { PiHost, type PiCommandContextSource, type PiHostApi, type PiToolDefinition } from "../services/pi-host.ts";
import { SubagentTool } from "../services/subagent-tool.ts";

type RuntimeServices = PiHost.Service | ExtensionRegistrar.Service | SubagentTool.Service;
type Runtime = ManagedRuntime.ManagedRuntime<RuntimeServices, unknown>;

const adaptTool = <TParams extends TSchema, TDetails>(
	runtime: Runtime,
	definition: EffectToolDefinition<TParams, TDetails>
): PiToolDefinition<TParams, TDetails> => ({
	name: definition.name,
	label: definition.label,
	description: definition.description,
	...(definition.promptSnippet === undefined ? {} : { promptSnippet: definition.promptSnippet }),
	...(definition.promptGuidelines === undefined ? {} : { promptGuidelines: definition.promptGuidelines }),
	parameters: definition.parameters,
	execute: async (toolCallId, params, signal, _onUpdate, ctx) =>
		runtime.runPromise(definition.execute(toolCallId, params, makeRequestContext(ctx, signal)))
});

const adaptCommand = (runtime: Runtime, definition: NamedEffectCommandDefinition) => ({
	description: definition.description,
	handler: async (args: string, ctx: PiCommandContextSource) => {
		const report = await runtime.runPromise(definition.handler(args, makeRequestContext(ctx)));
		ctx.ui.notify(report, "info");
	}
});

export async function registerSubagentsEffectExtension(pi: PiHostApi): Promise<void> {
	const runtime = ManagedRuntime.make(Layer.mergeAll(PiHost.layer(pi), ParentExtensionLayer));

	const plan = await runtime.runPromise(ExtensionRegistrar.Service.use((registrar) => registrar.registrationPlan));

	await runtime.runPromise(
		Effect.forEach(
			plan.tools,
			(tool) => PiHost.Service.use((host) => host.registerTool(adaptTool(runtime, tool))),
			{ concurrency: 1, discard: true }
		)
	);

	await runtime.runPromise(
		Effect.forEach(
			plan.commands,
			(command) => PiHost.Service.use((host) => host.registerCommand(command.name, adaptCommand(runtime, command))),
			{ concurrency: 1, discard: true }
		)
	);

	pi.on("session_shutdown", async () => {
		await runtime.dispose();
	});
}

export default registerSubagentsEffectExtension;
