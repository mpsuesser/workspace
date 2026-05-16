/**
 * Session JSONL parser.
 *
 * Reads a pi session file and produces an ordered Event[]. Assistant
 * tool calls are exploded out of the assistant message into separate
 * tool_call events so the detector can work on a flat stream.
 */
import { promises as fs } from "node:fs";
import type {
	Event,
	ParsedSession,
	SessionHeader,
	ToolCallEvent,
	ToolResultEvent,
} from "./types.ts";

const FILE_PATH_TOOLS = new Set([
	"read",
	"write",
	"edit",
	"glob",
	"grep",
]);

interface SessionLine {
	type: string;
	id?: string;
	parentId?: string | null;
	timestamp?: string;
	message?: any;
	[k: string]: any;
}

export async function parseSessionFile(filePath: string): Promise<ParsedSession> {
	const raw = await fs.readFile(filePath, "utf8");
	const lines = raw.split("\n").filter((l) => l.length > 0);
	if (lines.length === 0) {
		throw new Error(`empty session file: ${filePath}`);
	}

	let header: SessionLine;
	try {
		header = JSON.parse(lines[0]);
	} catch (err) {
		throw new Error(`invalid header line in ${filePath}: ${(err as Error).message}`);
	}
	if (header.type !== "session") {
		throw new Error(`first line is not a session header in ${filePath}`);
	}

	const session: SessionHeader = {
		id: String(header.id ?? ""),
		version: Number(header.version ?? 1),
		timestamp: String(header.timestamp ?? ""),
		cwd: String(header.cwd ?? ""),
		path: filePath,
		parentSession: header.parentSession,
	};

	const events: Event[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		let entry: SessionLine;
		try {
			entry = JSON.parse(line);
		} catch {
			// skip corrupted lines rather than failing the whole parse
			continue;
		}
		if (entry.type !== "message") continue;

		const entryId = String(entry.id ?? "");
		const parentId = entry.parentId == null ? null : String(entry.parentId);
		const ts = entry.timestamp ? Date.parse(entry.timestamp) : 0;
		const msg = entry.message;
		if (!msg || typeof msg !== "object") continue;

		switch (msg.role) {
			case "user": {
				const text = extractText(msg.content);
				events.push({
					kind: "user",
					entry_id: entryId,
					parent_id: parentId,
					ts,
					text,
				});
				break;
			}
			case "assistant": {
				const content = Array.isArray(msg.content) ? msg.content : [];
				let textBuf = "";
				for (const part of content) {
					if (!part || typeof part !== "object") continue;
					if (part.type === "text" && typeof part.text === "string") {
						textBuf += (textBuf ? "\n" : "") + part.text;
					} else if (part.type === "toolCall") {
						const call: ToolCallEvent = {
							kind: "tool_call",
							entry_id: entryId,
							parent_id: parentId,
							ts,
							tool_call_id: String(part.id ?? ""),
							tool_name: String(part.name ?? ""),
							arguments: part.arguments ?? {},
							file_path: extractFilePath(part.name, part.arguments),
							bash_command:
								part.name === "bash" && part.arguments?.command
									? String(part.arguments.command)
									: undefined,
						};
						events.push(call);
					}
				}
				if (textBuf) {
					events.push({
						kind: "assistant_text",
						entry_id: entryId,
						parent_id: parentId,
						ts,
						text: textBuf,
					});
				}
				break;
			}
			case "toolResult": {
				const text = extractText(msg.content);
				const details = msg.details ?? {};
				const result: ToolResultEvent = {
					kind: "tool_result",
					entry_id: entryId,
					parent_id: parentId,
					ts,
					tool_call_id: String(msg.toolCallId ?? ""),
					tool_name: String(msg.toolName ?? ""),
					is_error: Boolean(msg.isError),
					text_excerpt: text.slice(0, 400),
					file_path: typeof details.path === "string" ? details.path : undefined,
					exit_code:
						typeof details.exitCode === "number" ? details.exitCode : undefined,
				};
				events.push(result);
				break;
			}
			case "bashExecution": {
				events.push({
					kind: "bash_execution",
					entry_id: entryId,
					parent_id: parentId,
					ts,
					command: String(msg.command ?? ""),
					exit_code:
						typeof msg.exitCode === "number" ? msg.exitCode : undefined,
					cancelled: Boolean(msg.cancelled),
				});
				break;
			}
			default:
				// ignore custom_message, branchSummary, etc. for now
				break;
		}
	}

	// Stable sort by timestamp; preserve original order for ties.
	events.sort((a, b) => a.ts - b.ts);

	// Backfill file_path on tool_results by looking up their tool_call.
	const callsById = new Map<string, ToolCallEvent>();
	for (const e of events) {
		if (e.kind === "tool_call") callsById.set(e.tool_call_id, e);
	}
	for (const e of events) {
		if (e.kind === "tool_result" && !e.file_path) {
			const call = callsById.get(e.tool_call_id);
			if (call) e.file_path = call.file_path;
		}
	}

	return { session, events };
}

function extractText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	let out = "";
	for (const part of content) {
		if (part && typeof part === "object" && (part as any).type === "text") {
			out += ((part as any).text ?? "");
		}
	}
	return out;
}

function extractFilePath(toolName: unknown, args: any): string | undefined {
	if (typeof toolName !== "string") return undefined;
	if (!FILE_PATH_TOOLS.has(toolName)) return undefined;
	if (!args || typeof args !== "object") return undefined;
	const candidate = (args.path ?? args.file_path ?? args.filepath) as unknown;
	return typeof candidate === "string" ? candidate : undefined;
}
