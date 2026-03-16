/**
 * Effect-native bridge for OpenCode custom tools.
 *
 * Provides `effectTool` and `fromAiTool` — write tool handlers with
 * Effect.gen and Schema parameters, get OpenCode `ToolDefinition` out.
 *
 * Usage:
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 * import { effectTool, ToolContext } from "./helpers.ts"
 *
 * export default effectTool({
 *   description: "Search files by pattern",
 *   schema: { pattern: Schema.String },
 *   execute: (args) => Effect.gen(function*() {
 *     const ctx = yield* ToolContext
 *     return `Found files in ${ctx.directory} matching ${args.pattern}`
 *   })
 * })
 * ```
 */
import {
	type ToolContext as RawToolContext,
	type ToolDefinition,
	tool
} from '@opencode-ai/plugin';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Schema from 'effect/Schema';
import type * as AST from 'effect/SchemaAST';
import * as ServiceMap from 'effect/ServiceMap';
import { structToZodShape } from '../plugins/helpers.ts';

// ─── ToolError ─────────────────────────────────────────────────

/** Tagged error for tool failures — keeps the Effect failure channel typed. */
export class ToolError extends Data.TaggedError('ToolError')<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

// ─── ToolContext Service ───────────────────────────────────────

/** Effect service providing the OpenCode tool execution context. */
export class ToolContext extends ServiceMap.Service<
	ToolContext,
	RawToolContext
>()('@OpenCode/ToolContext') {}

// ─── Schema Types ──────────────────────────────────────────────

/** Anything with an `ast` property — Schema.Struct, Schema.Class, etc. */
type AnySchema = {
	readonly ast: AST.AST;
	readonly Type: any;
};

// ─── Run Effect → Promise<string> ─────────────────────────────

const runWithContext = (
	effect: Effect.Effect<string, unknown, ToolContext>,
	ctx: RawToolContext
): Promise<string> =>
	Effect.runPromise(
		effect.pipe(
			Effect.provide(Layer.succeed(ToolContext, ctx)),
			Effect.catchCause((cause) =>
				Effect.succeed(`[Tool Error] ${cause}`)
			)
		)
	);

// ─── effectTool ────────────────────────────────────────────────

/**
 * Create an OpenCode tool from Schema fields and an Effect handler.
 *
 * The `schema` field accepts `Schema.Struct.Fields` — the same shape you'd
 * pass to `Schema.Struct({...})`. The `execute` handler receives decoded
 * args and must return `Effect<string, E, ToolContext>`.
 *
 * Access the tool context via `yield* ToolContext` inside Effect.gen.
 *
 * ```ts
 * export default effectTool({
 *   description: "Greet someone",
 *   schema: { name: Schema.String },
 *   execute: (args) => Effect.succeed(`Hello ${args.name}!`)
 * })
 * ```
 */
export const effectTool = <Fields extends Schema.Struct.Fields>(input: {
	description: string;
	schema: Fields;
	execute: (
		args: Schema.Struct.Type<Fields>
	) => Effect.Effect<string, unknown, ToolContext>;
}): ToolDefinition => {
	const struct = Schema.Struct(input.schema);
	const zodShape = structToZodShape(struct);
	return tool({
		description: input.description,
		args: zodShape,
		execute: (args: any, context: RawToolContext) =>
			runWithContext(input.execute(args), context)
	});
};

// ─── fromAiTool ────────────────────────────────────────────────

/**
 * Bridge an Effect AI `Tool.make` definition to an OpenCode tool.
 *
 * Accepts any tool with `description` and `parameters`/`parametersSchema`.
 * The handler receives the decoded params and must return a string.
 *
 * ```ts
 * import { Tool } from "effect/unstable/AI"
 * import { fromAiTool, ToolContext } from "./helpers.ts"
 *
 * const MyTool = Tool.make("search", {
 *   description: "Search the index",
 *   parameters: Schema.Struct({ query: Schema.String }),
 *   success: Schema.String,
 * })
 *
 * export default fromAiTool(MyTool, (params) =>
 *   Effect.succeed(`Results for: ${params.query}`)
 * )
 * ```
 */
export const fromAiTool = (
	aiTool: {
		readonly description?: string | undefined;
		readonly parameters?: AnySchema;
		readonly parametersSchema?: AnySchema;
	},
	handler: (params: any) => Effect.Effect<string, unknown, ToolContext>
): ToolDefinition => {
	const schema = aiTool.parameters ?? aiTool.parametersSchema;
	if (!schema)
		throw new Error(
			'fromAiTool: tool has no parameters or parametersSchema'
		);
	const zodShape = structToZodShape(schema);
	return tool({
		description: aiTool.description ?? '',
		args: zodShape,
		execute: (args: any, context: RawToolContext) =>
			runWithContext(handler(args), context)
	});
};
