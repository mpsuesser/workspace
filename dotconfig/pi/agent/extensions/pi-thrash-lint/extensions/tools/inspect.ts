/**
 * thrash_inspect — return a structured event trace for a single incident.
 *
 * DX:
 *   - Input is just the incident_id (returned by thrash_find).
 *   - Output is a list of high-level events (kind, entry_id, tool_name,
 *     file_path, is_error, one-line summary) plus signal annotations.
 *   - No raw JSON. The LLM can decide whether to drill into a specific
 *     entry by re-reading the session file directly if needed.
 */
import type { Corpus } from "../lib/corpus.ts";
import type { Event, Incident } from "../lib/types.ts";

export interface InspectInput {
	incident_id: string;
	max_events?: number;
}

export interface InspectEvent {
	kind: Event["kind"];
	entry_id: string;
	timestamp: string;
	tool_name?: string;
	file_path?: string;
	is_error?: boolean;
	exit_code?: number;
	summary: string;
}

export interface InspectAnnotation {
	signal: string;
	at_entry_id: string;
	until_entry_id?: string;
	detail: string;
}

export interface InspectOutput {
	incident_id: string;
	project: string;
	session_id: string;
	session_path: string;
	started_at: string;
	duration_seconds: number;
	primary_signal: string;
	summary: string;
	events: InspectEvent[];
	annotations: InspectAnnotation[];
	truncated: boolean;
}

export async function runThrashInspect(
	input: InspectInput,
	corpus: Corpus,
): Promise<InspectOutput> {
	const inc = corpus.incidentById.get(input.incident_id);
	if (!inc) {
		throw new Error(`incident not found: ${input.incident_id}`);
	}
	const parsed = corpus.sessionByPath.get(inc.session_path);
	if (!parsed) {
		throw new Error(`session not found for incident: ${input.incident_id}`);
	}

	const startMs = Date.parse(inc.started_at);
	const endMs = startMs + inc.duration_seconds * 1000;

	const all: InspectEvent[] = [];
	for (const e of parsed.events) {
		if (e.ts < startMs || e.ts > endMs) continue;
		all.push(toInspectEvent(e));
	}

	const max = Math.max(1, input.max_events ?? 50);
	const truncated = all.length > max;
	const events = truncated ? all.slice(0, max) : all;

	const annotations: InspectAnnotation[] = inc.hits.map((h) => ({
		signal: h.kind,
		at_entry_id: h.at_entry_id,
		until_entry_id: h.until_entry_id,
		detail: h.detail,
	}));

	return {
		incident_id: inc.incident_id,
		project: inc.project,
		session_id: inc.session_id,
		session_path: inc.session_path,
		started_at: inc.started_at,
		duration_seconds: inc.duration_seconds,
		primary_signal: inc.primary_signal,
		summary: inc.summary,
		events,
		annotations,
		truncated,
	};
}

function toInspectEvent(e: Event): InspectEvent {
	switch (e.kind) {
		case "user":
			return {
				kind: "user",
				entry_id: e.entry_id,
				timestamp: new Date(e.ts).toISOString(),
				summary: shorten(e.text, 120),
			};
		case "assistant_text":
			return {
				kind: "assistant_text",
				entry_id: e.entry_id,
				timestamp: new Date(e.ts).toISOString(),
				summary: shorten(e.text, 120),
			};
		case "tool_call":
			return {
				kind: "tool_call",
				entry_id: e.entry_id,
				timestamp: new Date(e.ts).toISOString(),
				tool_name: e.tool_name,
				file_path: e.file_path,
				summary: describeCall(e),
			};
		case "tool_result":
			return {
				kind: "tool_result",
				entry_id: e.entry_id,
				timestamp: new Date(e.ts).toISOString(),
				tool_name: e.tool_name,
				file_path: e.file_path,
				is_error: e.is_error,
				exit_code: e.exit_code,
				summary: shorten(e.text_excerpt, 200),
			};
		case "bash_execution":
			return {
				kind: "bash_execution",
				entry_id: e.entry_id,
				timestamp: new Date(e.ts).toISOString(),
				tool_name: "bash",
				summary: `${e.command} (exit=${e.exit_code ?? "?"})`,
			};
	}
}

function describeCall(e: { tool_name: string; arguments: Record<string, unknown>; file_path?: string }): string {
	if (e.tool_name === "bash") {
		const c = e.arguments?.command;
		return `bash: ${shorten(typeof c === "string" ? c : "", 100)}`;
	}
	if (e.file_path) return `${e.tool_name}: ${e.file_path}`;
	return e.tool_name;
}

function shorten(s: string, max: number): string {
	const t = (s ?? "").replace(/\s+/g, " ").trim();
	return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
