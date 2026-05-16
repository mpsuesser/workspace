/**
 * @mpsuesser/pi-subagent
 *
 * Pi extension that mimics OpenCode's task / subagent system as closely as the
 * pi extension API allows. Key surfaces:
 *
 *   - registers a `task` tool with the same parameter shape, description, and
 *     output formatting as OpenCode's task tool
 *   - registers a `task_status` tool stub (background subagents are NYI)
 *   - discovers project agents in `.pi/agents/*.md` (walking up from cwd)
 *     and user agents in `~/.pi/agent/agents/*.md`
 *   - ships built-in `general` and `explore` agents with prompts ported
 *     verbatim from OpenCode
 *   - registers `/agent-list`, `/agent-path`, `/agent-new` commands
 *
 * See README.md for the full set of differences from OpenCode.
 */

import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import type { AgentInfo } from "./src/agent-info.js";
import { builtinAgents } from "./src/defaults.js";
import { discoverAgents, type DiscoveryResult } from "./src/loader.js";
import { registerTaskTool } from "./src/task-tool.js";
import { registerTaskStatusTool } from "./src/task-status-tool.js";
import { registerGenerateCommand } from "./src/generate.js";

export default function (pi: ExtensionAPI) {
	// Cache the discovery result for the lifetime of the session, but key it
	// on cwd so a /reload picks up new agents.
	let cached: { cwd: string; result: DiscoveryResult } | undefined;

	const discover = (ctx: { cwd: string }): DiscoveryResult => {
		if (cached && cached.cwd === ctx.cwd) return cached.result;
		const result = discoverAgents({
			cwd: ctx.cwd,
			builtins: builtinAgents(),
		});
		cached = { cwd: ctx.cwd, result };
		return result;
	};

	// On session start, surface load-time warnings exactly once.
	pi.on("session_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		const { agents, warnings, projectAgentsDir } = discover(ctx);
		const userAgentCount = agents.filter((a) => a.source === "user").length;
		const projectAgentCount = agents.filter((a) => a.source === "project").length;
		const summary = [
			`${agents.length} agents loaded`,
			`(${userAgentCount} user, ${projectAgentCount} project, ${agents.length - userAgentCount - projectAgentCount} builtin)`,
		].join(" ");
		ctx.ui.setStatus("subagent", summary);
		if (projectAgentsDir) {
			ctx.ui.setStatus("subagent", `${summary} • project dir: ${projectAgentsDir}`);
		}
		for (const w of warnings.slice(0, 5)) ctx.ui.notify(w, "warning");
		if (warnings.length > 5) {
			ctx.ui.notify(`(+${warnings.length - 5} more agent warnings, run /agent-list to inspect)`, "warning");
		}
	});

	// Before each turn, inject a brief "Available subagents" block into the
	// system prompt so the LLM knows which subagent_type values are valid.
	// This keeps the `task` tool's description identical to OpenCode's verbatim
	// task.txt while still giving the model the agent list.
	pi.on("before_agent_start", async (event, ctx) => {
		const { agents } = discover(ctx);
		const visible = agents.filter((a) => !a.hidden);
		if (visible.length === 0) return;
		const lines = visible
			.map((a: AgentInfo) => {
				const tag = a.source === "builtin" ? "builtin" : a.source;
				const desc = a.description ? ` — ${a.description.split(/\n/)[0]}` : "";
				return `  - ${a.name} (${tag})${desc}`;
			})
			.join("\n");
		return {
			systemPrompt: `${event.systemPrompt}\n\n<available_subagents>\nWhen calling the \`task\` tool, set \`subagent_type\` to one of:\n${lines}\n</available_subagents>`,
		};
	});

	registerTaskTool({
		pi,
		getDiscovery: (ctx: ExtensionContext) => discover(ctx),
	});

	registerTaskStatusTool(pi);

	// /agent-list: print all known agents grouped by source.
	pi.registerCommand("agent-list", {
		description: "List subagents available to the `task` tool",
		handler: async (_args, ctx) => {
			const { agents, projectAgentsDir, userAgentsDir, warnings } = discover(ctx);
			const groups: Record<string, AgentInfo[]> = { builtin: [], user: [], project: [] };
			for (const a of agents) groups[a.source].push(a);
			const fmt = (label: string, dir: string | null, list: AgentInfo[]) => {
				if (list.length === 0) return `[${label}] (none)${dir ? ` -- ${dir}` : ""}`;
				const header = `[${label}]${dir ? ` -- ${dir}` : ""}`;
				const rows = list
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((a) => `  ${a.hidden ? "·" : "•"} ${a.name}${a.description ? `: ${a.description.split(/\n/)[0]}` : ""}`)
					.join("\n");
				return `${header}\n${rows}`;
			};
			const text = [
				fmt("builtin", null, groups.builtin),
				fmt("user", userAgentsDir, groups.user),
				fmt("project", projectAgentsDir, groups.project),
				warnings.length > 0 ? `\nwarnings:\n${warnings.map((w) => `  - ${w}`).join("\n")}` : "",
			]
				.filter(Boolean)
				.join("\n\n");
			ctx.ui.notify(text, "info");
		},
	});

	// /agent-path <name>: print the file path of an agent.
	pi.registerCommand("agent-path", {
		description: "Print the file path of a subagent (handy for editing)",
		handler: async (args, ctx) => {
			const name = args?.trim();
			if (!name) {
				ctx.ui.notify("Usage: /agent-path <agent-name>", "warning");
				return;
			}
			const { agents } = discover(ctx);
			const agent = agents.find((a) => a.name === name);
			if (!agent) {
				ctx.ui.notify(`No agent named "${name}"`, "error");
				return;
			}
			if (agent.source === "builtin") {
				ctx.ui.notify(`${agent.name} is built-in; no file to edit.`, "info");
				return;
			}
			ctx.ui.notify(agent.filePath ?? "(unknown path)", "info");
		},
	});

	registerGenerateCommand({
		pi,
		getDiscovery: (ctx: ExtensionCommandContext) => discover(ctx),
		// generateAgentConfig is intentionally undefined for now -- /agent-new
		// is registered with a graceful "not wired up" notice. The user can
		// extend this in their fork by passing in a real LLM call.
	});
}
