import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { AgentOverride } from "./agents.ts";
import { RuntimeAgentName } from "./ids.ts";

/**
 * The `subagents` block of a Pi `settings.json` file: builtin agent overrides
 * keyed by runtime agent name, plus an optional bulk disable switch.
 */
export class SubagentSettings extends Schema.Class<SubagentSettings>("SubagentSettings")({
	agentOverrides: Schema.Record(RuntimeAgentName, AgentOverride).pipe(
		Schema.withDecodingDefault(Effect.succeed({})),
		Schema.withConstructorDefault(Effect.succeed({}))
	),
	disableBuiltins: Schema.OptionFromOptionalKey(Schema.Boolean)
}) {}

/**
 * Minimal view over a Pi `settings.json` file. Unknown top-level keys (theme,
 * packages, extensions, …) are ignored by Schema during decoding.
 */
export class SettingsFile extends Schema.Class<SettingsFile>("SettingsFile")({
	subagents: Schema.OptionFromOptionalKey(SubagentSettings)
}) {}

export const emptySubagentSettings: SubagentSettings = Schema.decodeUnknownSync(SubagentSettings)({});
