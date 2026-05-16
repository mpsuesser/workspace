/**
 * Shared types for the thrash-lint extension.
 *
 * Event[] is the pure, denormalised view of a session that downstream
 * detectors consume. Keeping it small and serialisable keeps the heuristic
 * layer testable without re-parsing JSONL.
 */

export interface SessionHeader {
	id: string;
	version: number;
	timestamp: string;
	cwd: string;
	path: string;
	parentSession?: string;
}

export type Event =
	| UserEvent
	| AssistantTextEvent
	| ToolCallEvent
	| ToolResultEvent
	| BashExecutionEvent;

interface EventBase {
	entry_id: string;
	parent_id: string | null;
	ts: number; // unix ms
}

export interface UserEvent extends EventBase {
	kind: "user";
	text: string;
}

export interface AssistantTextEvent extends EventBase {
	kind: "assistant_text";
	text: string;
}

export interface ToolCallEvent extends EventBase {
	kind: "tool_call";
	tool_call_id: string;
	tool_name: string;
	arguments: Record<string, unknown>;
	file_path?: string;
	bash_command?: string;
}

export interface ToolResultEvent extends EventBase {
	kind: "tool_result";
	tool_call_id: string;
	tool_name: string;
	is_error: boolean;
	text_excerpt: string;
	file_path?: string;
	exit_code?: number;
}

export interface BashExecutionEvent extends EventBase {
	kind: "bash_execution";
	command: string;
	exit_code: number | undefined;
	cancelled: boolean;
}

export interface ParsedSession {
	session: SessionHeader;
	events: Event[];
}

// Signal kinds the detector can emit. Closed enum so we can surface
// the taxonomy in tool descriptions and validate filters.
export const SIGNAL_KINDS = [
	"failed_edit_retry",
	"edit_oscillation",
	"bash_error_retry",
	"read_edit_loop",
	"tool_error_cascade",
] as const;
export type SignalKind = (typeof SIGNAL_KINDS)[number];

export interface SignalHit {
	kind: SignalKind;
	at_entry_id: string;
	ts: number;
	/** Optional end timestamp; defaults to ts. Used to extend incident span. */
	until_ts?: number;
	/** Optional ending entry id covered by this hit. */
	until_entry_id?: string;
	weight: number; // 0..1 contribution to incident score
	detail: string;
	file_path?: string;
	tool_name?: string;
}

export interface Incident {
	incident_id: string; // session_id:first_entry:last_entry
	session_path: string;
	session_id: string;
	project: string;
	first_entry_id: string;
	last_entry_id: string;
	started_at: string; // ISO
	duration_seconds: number;
	score: number; // sum of signal weights, clamped to a soft cap
	primary_signal: SignalKind;
	signals: Record<SignalKind, number>; // counts per kind
	hits: SignalHit[];
	file_paths: string[];
	tool_calls: number;
	failed_tool_calls: number;
	summary: string;
}
