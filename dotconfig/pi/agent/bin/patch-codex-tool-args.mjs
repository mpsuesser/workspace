#!/usr/bin/env node
/**
 * Patches the installed `@earendil-works/pi-ai` openai-codex provider so that,
 * before a streaming response is finalized, tool-call arguments whose schema
 * declares an array or object are auto-coerced from JSON-encoded strings into
 * real values.
 *
 * Why: gpt-5.5 via the openai-codex Responses API frequently stringifies
 * nested array tool arguments (e.g. `tasks: "[{...}]"` instead of
 * `tasks: [{...}]`). The harness validator rejects the string and the tool
 * call fails. This patch makes the codex provider undo that quirk before the
 * arguments reach the validator.
 *
 * Idempotent: if the patch markers are already present, this script is a
 * no-op. Re-run after `bun upgrade` / `npm i -g @earendil-works/...` (which
 * may overwrite the dist).
 *
 * Run:
 *   node ~/repos/workspace/dotconfig/pi/agent/bin/patch-codex-tool-args.mjs
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const TARGET = path.join(
	os.homedir(),
	".bun/install/global/node_modules/@earendil-works/pi-ai/dist/providers/openai-codex-responses.js",
);

const BEGIN = "// PATCH-codex-tool-arg-coercion BEGIN";
const END = "// PATCH-codex-tool-arg-coercion END";

const HELPER_BLOCK = `${BEGIN}
// Recover from openai-codex's habit of stringifying nested array/object tool args.
// Walks the tool's JSON Schema and JSON.parses string values where an array or
// object is expected. Best-effort; failures leave the original value in place
// so downstream validation can produce its usual error.
function __piAiCodexTryParseJson(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    const firstChar = trimmed[0];
    if (firstChar !== "[" && firstChar !== "{") return undefined;
    try {
        return JSON.parse(trimmed);
    } catch {
        return undefined;
    }
}
function __piAiCodexSchemaAcceptsType(schema, jsonType) {
    if (!schema || typeof schema !== "object") return false;
    const types = Array.isArray(schema.type) ? schema.type : (schema.type ? [schema.type] : []);
    if (types.includes(jsonType)) return true;
    for (const key of ["anyOf", "oneOf", "allOf"]) {
        const arr = schema[key];
        if (Array.isArray(arr)) {
            for (const sub of arr) {
                if (__piAiCodexSchemaAcceptsType(sub, jsonType)) return true;
            }
        }
    }
    return false;
}
function __piAiCodexPickMatchingSubschema(schema, value) {
    if (!schema || typeof schema !== "object") return schema;
    if (!Array.isArray(schema.anyOf) && !Array.isArray(schema.oneOf)) return schema;
    const candidates = (schema.anyOf || []).concat(schema.oneOf || []);
    const isArr = Array.isArray(value);
    const isObj = value !== null && typeof value === "object" && !isArr;
    for (const sub of candidates) {
        if (!sub || typeof sub !== "object") continue;
        if (isArr && __piAiCodexSchemaAcceptsType(sub, "array")) return sub;
        if (isObj && __piAiCodexSchemaAcceptsType(sub, "object")) return sub;
    }
    return schema;
}
function __piAiCodexCoerceValue(value, schema) {
    if (value == null || !schema || typeof schema !== "object") return value;
    if (typeof value === "string") {
        const wantsArray = __piAiCodexSchemaAcceptsType(schema, "array");
        const wantsObject = __piAiCodexSchemaAcceptsType(schema, "object");
        if (wantsArray || wantsObject) {
            const parsed = __piAiCodexTryParseJson(value);
            if (parsed !== undefined) {
                if (wantsArray && Array.isArray(parsed)) {
                    return __piAiCodexCoerceValue(parsed, __piAiCodexPickMatchingSubschema(schema, parsed));
                }
                if (wantsObject && parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return __piAiCodexCoerceValue(parsed, __piAiCodexPickMatchingSubschema(schema, parsed));
                }
            }
        }
        return value;
    }
    const effective = __piAiCodexPickMatchingSubschema(schema, value);
    if (Array.isArray(value)) {
        if (effective.items && !Array.isArray(effective.items)) {
            for (let i = 0; i < value.length; i++) {
                value[i] = __piAiCodexCoerceValue(value[i], effective.items);
            }
        }
        return value;
    }
    if (typeof value === "object") {
        if (effective.properties && typeof effective.properties === "object") {
            for (const key of Object.keys(value)) {
                const propSchema = effective.properties[key];
                if (propSchema) value[key] = __piAiCodexCoerceValue(value[key], propSchema);
            }
        }
        return value;
    }
    return value;
}
function __piAiCodexCoerceStringifiedToolArgs(output, tools) {
    if (!output || !Array.isArray(output.content) || !Array.isArray(tools) || tools.length === 0) return;
    for (const block of output.content) {
        if (!block || block.type !== "toolCall" || !block.arguments || typeof block.arguments !== "object") continue;
        const tool = tools.find((t) => t && t.name === block.name);
        if (!tool || !tool.parameters || typeof tool.parameters !== "object") continue;
        try {
            __piAiCodexCoerceValue(block.arguments, tool.parameters);
        } catch {
            // best-effort; never let coercion bring down a response
        }
    }
}
${END}`;

function applyPatch() {
	if (!fs.existsSync(TARGET)) {
		console.error(`Target file not found: ${TARGET}`);
		console.error("Is @earendil-works/pi-ai installed globally via bun?");
		process.exit(1);
	}
	let source = fs.readFileSync(TARGET, "utf-8");

	if (source.includes(BEGIN)) {
		console.log("[patch-codex-tool-args] Already applied — nothing to do.");
		return;
	}

	// 1. Insert the helper block after the last top-level import.
	const importLineRe = /^import .+?;\n/gm;
	let lastImportEnd = 0;
	for (const match of source.matchAll(importLineRe)) {
		lastImportEnd = match.index + match[0].length;
	}
	if (lastImportEnd === 0) {
		console.error("Could not find import block to insert helper after.");
		process.exit(1);
	}
	source = source.slice(0, lastImportEnd) + "\n" + HELPER_BLOCK + "\n" + source.slice(lastImportEnd);

	// 2. Inject coercion call before each finalization in streamOpenAICodexResponses.
	const wsFinalization = `if (options?.signal?.aborted) {
                        throw new Error("Request was aborted");
                    }
                    stream.push({
                        type: "done",`;
	const wsReplacement = `if (options?.signal?.aborted) {
                        throw new Error("Request was aborted");
                    }
                    __piAiCodexCoerceStringifiedToolArgs(output, context.tools);
                    stream.push({
                        type: "done",`;
	if (!source.includes(wsFinalization)) {
		console.error("Could not locate WebSocket finalization site in streamOpenAICodexResponses.");
		process.exit(1);
	}
	source = source.replace(wsFinalization, wsReplacement);

	const sseFinalization = `await processStream(response, output, stream, model, options);
            if (options?.signal?.aborted) {
                throw new Error("Request was aborted");
            }
            stream.push({ type: "done", reason: output.stopReason, message: output });`;
	const sseReplacement = `await processStream(response, output, stream, model, options);
            if (options?.signal?.aborted) {
                throw new Error("Request was aborted");
            }
            __piAiCodexCoerceStringifiedToolArgs(output, context.tools);
            stream.push({ type: "done", reason: output.stopReason, message: output });`;
	if (!source.includes(sseFinalization)) {
		console.error("Could not locate SSE finalization site in streamOpenAICodexResponses.");
		process.exit(1);
	}
	source = source.replace(sseFinalization, sseReplacement);

	fs.writeFileSync(TARGET, source, "utf-8");
	console.log(`[patch-codex-tool-args] Applied to ${TARGET}`);
}

applyPatch();
