/**
 * Normalize array-shaped subagent params that may have arrived as JSON-encoded
 * strings.
 *
 * Some LLM providers (notably openai-codex / gpt-5.5 over the Responses API)
 * emit nested array arguments as stringified JSON instead of true JSON arrays.
 * Example: the model intends `tasks: [{...}, {...}]` but the wire payload
 * carries `tasks: "[{...}, {...}]"`. The TypeBox validator strictly rejects
 * the string with `tasks.0: must be object`, even though the schema is
 * declared to accept either form (see `schemas.ts`).
 *
 * This helper is intentionally narrow: it only auto-parses string values for
 * the two known array-typed parameters (`tasks` and `chain`), and only when
 * the parsed value is itself a JSON array. Anything else is returned untouched
 * for downstream validation to handle.
 *
 * Returns a result object instead of throwing so callers can render a
 * friendly tool error rather than a generic stack trace.
 */
export type NormalizeArrayParamsResult<T extends Record<string, unknown>> =
	| { ok: true; params: T }
	| { ok: false; error: string };

const ARRAY_PARAM_FIELDS = ["tasks", "chain"] as const;

export function normalizeStringifiedArrayParams<T extends Record<string, unknown>>(
	params: T,
): NormalizeArrayParamsResult<T> {
	let working: T | undefined;
	for (const field of ARRAY_PARAM_FIELDS) {
		const value = params[field];
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			// Treat empty string as omitted to avoid surprise behavior.
			if (!working) working = { ...params };
			delete (working as Record<string, unknown>)[field];
			continue;
		}
		let parsed: unknown;
		try {
			parsed = JSON.parse(trimmed);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return {
				ok: false,
				error:
					`Parameter '${field}' arrived as a string but was not valid JSON: ${message}.\n` +
					`Pass '${field}' as a real JSON array, e.g. ${field}: [{agent: "name", task: "..."}].`,
			};
		}
		if (!Array.isArray(parsed)) {
			return {
				ok: false,
				error:
					`Parameter '${field}' arrived as a string and parsed to a ${parsed === null ? "null" : typeof parsed}, not an array.\n` +
					`Pass '${field}' as a real JSON array of objects, e.g. ${field}: [{agent: "name", task: "..."}].`,
			};
		}
		if (!working) working = { ...params };
		(working as Record<string, unknown>)[field] = parsed;
	}
	return { ok: true, params: working ?? params };
}
