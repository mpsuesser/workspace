/**
 * Built-in subagents.
 *
 * Mirrors OpenCode's native agents from `packages/opencode/src/agent/agent.ts`,
 * restricted to those that map cleanly to pi:
 *   - `general`: full-tool, subagent variant of OpenCode's "general"
 *   - `explore`: read-only researcher, prompt ported verbatim from explore.txt
 *
 * The OpenCode defaults we omit (`build`, `plan`, `compaction`, `title`, `summary`)
 * are all `mode: "primary"` -- they don't make sense for a pi-side subagent extension.
 * `scout` was also omitted by user request.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentInfo } from "./agent-info.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, "prompts");

function loadPrompt(name: string): string {
	return fs.readFileSync(path.join(PROMPTS_DIR, name), "utf-8");
}

/** Built-in agents shipped with this extension. */
export function builtinAgents(): AgentInfo[] {
	const explorePrompt = loadPrompt("explore.txt");

	return [
		{
			name: "general",
			description:
				"General-purpose agent for researching complex questions and executing multi-step tasks. Use this agent to execute multiple units of work in parallel.",
			mode: "subagent",
			native: true,
			// No restrictions -> pi runs the subprocess with its default tool set.
			permission: [],
			options: {},
			source: "builtin",
		},
		{
			name: "explore",
			description:
				'Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. "src/components/**/*.tsx"), search code for keywords (eg. "API endpoints"), or answer questions about the codebase (eg. "how do API endpoints work?"). When calling this agent, specify the desired thoroughness level: "quick" for basic searches, "medium" for moderate exploration, or "very thorough" for comprehensive analysis across multiple locations and naming conventions.',
			mode: "subagent",
			native: true,
			prompt: explorePrompt,
			// Read-only allowlist matching OpenCode's `explore` permission ruleset.
			permission: [
				{ permission: "*", pattern: "*", action: "deny" },
				{ permission: "grep", pattern: "*", action: "allow" },
				{ permission: "glob", pattern: "*", action: "allow" },
				{ permission: "list", pattern: "*", action: "allow" },
				{ permission: "bash", pattern: "*", action: "allow" },
				{ permission: "read", pattern: "*", action: "allow" },
				// webfetch/websearch may not exist in pi by default; included for
				// parity with OpenCode -- permission-map.ts will silently keep
				// them in the allowlist where they have no effect.
				{ permission: "webfetch", pattern: "*", action: "allow" },
				{ permission: "websearch", pattern: "*", action: "allow" },
			],
			options: {},
			source: "builtin",
		},
	];
}
