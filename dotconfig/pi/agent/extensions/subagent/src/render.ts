/**
 * TUI rendering for the `task` and `task_status` tool calls.
 *
 * Borrows the collapsed/expanded layout from the reference subagent extension
 * (examples/extensions/subagent/index.ts), trimmed to the modes we actually
 * use (no parallel/chain -- those are not part of OpenCode's task tool).
 */

import { Container, Markdown, Spacer, Text } from "@mariozechner/pi-tui";
import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import type { RunnerMessage, RunnerResult, RunnerUsage } from "./runner.js";
import { getFinalText } from "./runner.js";

export const COLLAPSED_ITEM_COUNT = 10;

export interface TaskRenderDetails {
	taskId: string;
	agent: string;
	agentSource: "builtin" | "user" | "project" | "unknown";
	description: string; // the user-visible short title
	task: string; // the full task prompt
	color?: string;
	background: boolean;
	result?: RunnerResult;
}

function formatTokens(count: number): string {
	if (count < 1000) return count.toString();
	if (count < 10_000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
	return `${(count / 1_000_000).toFixed(1)}M`;
}

export function formatUsage(u: RunnerUsage, model?: string): string {
	const parts: string[] = [];
	if (u.turns) parts.push(`${u.turns} turn${u.turns > 1 ? "s" : ""}`);
	if (u.input) parts.push(`↑${formatTokens(u.input)}`);
	if (u.output) parts.push(`↓${formatTokens(u.output)}`);
	if (u.cacheRead) parts.push(`R${formatTokens(u.cacheRead)}`);
	if (u.cacheWrite) parts.push(`W${formatTokens(u.cacheWrite)}`);
	if (u.cost) parts.push(`$${u.cost.toFixed(4)}`);
	if (u.contextTokens && u.contextTokens > 0) parts.push(`ctx:${formatTokens(u.contextTokens)}`);
	if (model) parts.push(model);
	return parts.join(" ");
}

function formatToolCall(toolName: string, args: Record<string, unknown>, fg: (color: string, text: string) => string): string {
	const shortenPath = (p: string) => {
		const home = process.env.HOME ?? "";
		return home && p.startsWith(home) ? `~${p.slice(home.length)}` : p;
	};
	switch (toolName) {
		case "bash": {
			const command = (args.command as string) || "...";
			const preview = command.length > 60 ? `${command.slice(0, 60)}...` : command;
			return fg("muted", "$ ") + fg("toolOutput", preview);
		}
		case "read": {
			const raw = ((args.file_path as string) || (args.path as string) || "...") as string;
			const filePath = shortenPath(raw);
			const offset = args.offset as number | undefined;
			const limit = args.limit as number | undefined;
			let text = fg("accent", filePath);
			if (offset !== undefined || limit !== undefined) {
				const start = offset ?? 1;
				const end = limit !== undefined ? start + limit - 1 : "";
				text += fg("warning", `:${start}${end ? `-${end}` : ""}`);
			}
			return fg("muted", "read ") + text;
		}
		case "write": {
			const raw = ((args.file_path as string) || (args.path as string) || "...") as string;
			const filePath = shortenPath(raw);
			const lines = ((args.content as string) || "").split("\n").length;
			let text = fg("muted", "write ") + fg("accent", filePath);
			if (lines > 1) text += fg("dim", ` (${lines} lines)`);
			return text;
		}
		case "edit": {
			const raw = ((args.file_path as string) || (args.path as string) || "...") as string;
			return fg("muted", "edit ") + fg("accent", shortenPath(raw));
		}
		case "ls": {
			const raw = ((args.path as string) || ".") as string;
			return fg("muted", "ls ") + fg("accent", shortenPath(raw));
		}
		case "find": {
			const pattern = (args.pattern as string) || "*";
			const raw = ((args.path as string) || ".") as string;
			return fg("muted", "find ") + fg("accent", pattern) + fg("dim", ` in ${shortenPath(raw)}`);
		}
		case "grep": {
			const pattern = (args.pattern as string) || "";
			const raw = ((args.path as string) || ".") as string;
			return fg("muted", "grep ") + fg("accent", `/${pattern}/`) + fg("dim", ` in ${shortenPath(raw)}`);
		}
		default: {
			const argsStr = JSON.stringify(args);
			const preview = argsStr.length > 50 ? `${argsStr.slice(0, 50)}...` : argsStr;
			return fg("accent", toolName) + fg("dim", ` ${preview}`);
		}
	}
}

type DisplayItem =
	| { type: "text"; text: string }
	| { type: "toolCall"; name: string; args: Record<string, unknown> };

function getDisplayItems(messages: RunnerMessage[]): DisplayItem[] {
	const items: DisplayItem[] = [];
	for (const msg of messages) {
		if (msg.role !== "assistant") continue;
		for (const part of msg.content) {
			if (part.type === "text" && typeof part.text === "string") {
				items.push({ type: "text", text: part.text });
			} else if (part.type === "toolCall" && typeof part.name === "string") {
				items.push({ type: "toolCall", name: part.name, args: part.arguments ?? {} });
			}
		}
	}
	return items;
}

export interface RenderTheme {
	fg: (color: string, text: string) => string;
	bold: (text: string) => string;
}

/**
 * Render the tool call header (before/while running).
 *
 * In OpenCode the renderer for `task` shows the agent name + short title;
 * we keep that shape and append a [resumed] marker when continuing.
 */
export function renderTaskCall(args: Record<string, unknown>, theme: RenderTheme): Text {
	const agent = (args.subagent_type as string) || "...";
	const description = (args.description as string) || "";
	const taskPreview = ((args.prompt as string) || "")
		.replace(/\s+/g, " ")
		.slice(0, 60);
	const resumed = typeof args.task_id === "string" && args.task_id.length > 0;
	let text =
		theme.fg("toolTitle", theme.bold("task ")) +
		theme.fg("accent", agent) +
		(description ? theme.fg("muted", ` -- ${description}`) : "");
	if (resumed) text += theme.fg("warning", ` [resume ${(args.task_id as string).slice(0, 12)}…]`);
	if (taskPreview) text += `\n  ${theme.fg("dim", taskPreview)}${(args.prompt as string).length > 60 ? "..." : ""}`;
	return new Text(text, 0, 0);
}

export function renderTaskResult(
	details: TaskRenderDetails | undefined,
	expanded: boolean,
	theme: RenderTheme,
): Text | Container {
	if (!details || !details.result) {
		return new Text(theme.fg("muted", "(no output yet)"), 0, 0);
	}
	const r = details.result;
	const isError = r.exitCode !== 0 || r.stopReason === "error" || r.stopReason === "aborted";
	const icon = isError ? theme.fg("error", "✗") : theme.fg("success", "✓");
	const items = getDisplayItems(r.messages);
	const finalOutput = getFinalText(r.messages);

	const header = (() => {
		let h = `${icon} ${theme.fg("toolTitle", theme.bold(details.agent))}${theme.fg("muted", ` (${details.agentSource})`)}`;
		if (details.background) h += theme.fg("warning", " [background]");
		if (isError && r.stopReason) h += ` ${theme.fg("error", `[${r.stopReason}]`)}`;
		return h;
	})();

	if (expanded) {
		const c = new Container();
		c.addChild(new Text(header, 0, 0));
		if (isError && r.errorMessage) c.addChild(new Text(theme.fg("error", `Error: ${r.errorMessage}`), 0, 0));
		c.addChild(new Spacer(1));
		c.addChild(new Text(theme.fg("muted", "─── Task ───"), 0, 0));
		c.addChild(new Text(theme.fg("dim", details.task), 0, 0));
		c.addChild(new Spacer(1));
		c.addChild(new Text(theme.fg("muted", "─── Output ───"), 0, 0));
		if (items.length === 0 && !finalOutput) {
			c.addChild(new Text(theme.fg("muted", "(no output)"), 0, 0));
		} else {
			for (const item of items) {
				if (item.type === "toolCall") {
					c.addChild(
						new Text(
							theme.fg("muted", "→ ") + formatToolCall(item.name, item.args, theme.fg.bind(theme)),
							0,
							0,
						),
					);
				}
			}
			if (finalOutput) {
				c.addChild(new Spacer(1));
				c.addChild(new Markdown(finalOutput.trim(), 0, 0, getMarkdownTheme()));
			}
		}
		const usage = formatUsage(r.usage, r.model);
		if (usage) {
			c.addChild(new Spacer(1));
			c.addChild(new Text(theme.fg("dim", usage), 0, 0));
		}
		c.addChild(new Text(theme.fg("muted", `task_id: ${details.taskId}`), 0, 0));
		return c;
	}

	// Collapsed view
	let text = header;
	if (isError && r.errorMessage) text += `\n${theme.fg("error", `Error: ${r.errorMessage}`)}`;
	if (items.length === 0) {
		text += `\n${theme.fg("muted", "(no output)")}`;
	} else {
		const toShow = items.slice(-COLLAPSED_ITEM_COUNT);
		const skipped = items.length - toShow.length;
		if (skipped > 0) text += `\n${theme.fg("muted", `... ${skipped} earlier items`)}`;
		for (const item of toShow) {
			if (item.type === "text") {
				const preview = item.text.split("\n").slice(0, 3).join("\n");
				text += `\n${theme.fg("toolOutput", preview)}`;
			} else {
				text += `\n${theme.fg("muted", "→ ") + formatToolCall(item.name, item.args, theme.fg.bind(theme))}`;
			}
		}
		if (items.length > COLLAPSED_ITEM_COUNT) text += `\n${theme.fg("muted", "(Ctrl+O to expand)")}`;
	}
	const usage = formatUsage(r.usage, r.model);
	if (usage) text += `\n${theme.fg("dim", usage)}`;
	text += `\n${theme.fg("muted", `task_id: ${details.taskId}`)}`;
	return new Text(text, 0, 0);
}
