/**
 * `/agent new <description>` command.
 *
 * Mirrors OpenCode's `Agent.generate` (packages/opencode/src/agent/agent.ts)
 * which asks the active model for an agent configuration from a description.
 *
 * We use the same system prompt (`generate.txt`) and the same JSON output
 * shape `{ identifier, whenToUse, systemPrompt }`. The result is written to
 * `.pi/agents/<identifier>.md` after a confirmation prompt.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@mariozechner/pi-coding-agent";
import type { DiscoveryResult } from "./loader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, "prompts", "generate.txt"), "utf-8");

interface GeneratedAgent {
	identifier: string;
	whenToUse: string;
	systemPrompt: string;
}

function extractJsonObject(text: string): GeneratedAgent | null {
	// Try direct parse first.
	try {
		return JSON.parse(text) as GeneratedAgent;
	} catch {
		// fall through
	}
	// Pull out the largest balanced { ... } block.
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start < 0 || end < 0 || end <= start) return null;
	const candidate = text.slice(start, end + 1);
	try {
		return JSON.parse(candidate) as GeneratedAgent;
	} catch {
		return null;
	}
}

function frontmatterEscape(value: string): string {
	// YAML-safe: if the string contains anything tricky, quote and escape.
	if (/^[A-Za-z0-9 ,.\-_/()]+$/.test(value) && !value.startsWith("-")) return value;
	return JSON.stringify(value);
}

async function writeAgentMd(
	dir: string,
	gen: GeneratedAgent,
): Promise<{ filePath: string; created: boolean }> {
	await fs.promises.mkdir(dir, { recursive: true });
	const filePath = path.join(dir, `${gen.identifier}.md`);
	const exists = fs.existsSync(filePath);
	const content =
		[
			"---",
			`name: ${frontmatterEscape(gen.identifier)}`,
			`description: ${frontmatterEscape(gen.whenToUse)}`,
			"---",
			"",
			gen.systemPrompt.trim(),
			"",
		].join("\n");
	await fs.promises.writeFile(filePath, content, "utf-8");
	return { filePath, created: !exists };
}

export interface RegisterGenerateOptions {
	pi: ExtensionAPI;
	getDiscovery: (ctx: ExtensionCommandContext) => DiscoveryResult;
	/** Optional: callback to invoke an LLM with the generate.txt system prompt. */
	generateAgentConfig?: (description: string, existingNames: string[]) => Promise<GeneratedAgent | null>;
}

export function registerGenerateCommand(opts: RegisterGenerateOptions): void {
	const { pi, getDiscovery, generateAgentConfig } = opts;
	pi.registerCommand("agent-new", {
		description: "Generate a new subagent definition (.pi/agents/<name>.md) from a description",
		handler: async (args, ctx) => {
			const description = args?.trim();
			if (!description) {
				ctx.ui.notify("Usage: /agent-new <description of the agent>", "warning");
				return;
			}

			const existing = getDiscovery(ctx).agents.map((a) => a.name);

			if (!generateAgentConfig) {
				ctx.ui.notify(
					"Agent generation isn't wired up in this build. Manually create a .pi/agents/<name>.md file (see README).",
					"warning",
				);
				return;
			}

			ctx.ui.setStatus("subagent-generate", "Generating agent definition...");
			let generated: GeneratedAgent | null = null;
			try {
				generated = await generateAgentConfig(description, existing);
			} catch (err) {
				ctx.ui.notify(`Agent generation failed: ${err instanceof Error ? err.message : String(err)}`, "error");
				return;
			} finally {
				ctx.ui.setStatus("subagent-generate", undefined);
			}

			if (!generated) {
				ctx.ui.notify("Model did not return a valid agent configuration.", "error");
				return;
			}

			if (existing.includes(generated.identifier)) {
				ctx.ui.notify(`Agent "${generated.identifier}" already exists; refusing to overwrite.`, "error");
				return;
			}

			const targetDir = path.join(ctx.cwd, ".pi", "agents");
			const ok = await ctx.ui.confirm(
				`Create agent "${generated.identifier}"?`,
				[
					`Path: ${path.join(targetDir, `${generated.identifier}.md`)}`,
					"",
					`When to use: ${generated.whenToUse}`,
					"",
					`System prompt (${generated.systemPrompt.length} chars):`,
					generated.systemPrompt.slice(0, 240) + (generated.systemPrompt.length > 240 ? "..." : ""),
				].join("\n"),
			);
			if (!ok) {
				ctx.ui.notify("Cancelled.", "info");
				return;
			}

			try {
				const { filePath } = await writeAgentMd(targetDir, generated);
				ctx.ui.notify(`Wrote ${filePath}`, "info");
			} catch (err) {
				ctx.ui.notify(
					`Failed to write agent file: ${err instanceof Error ? err.message : String(err)}`,
					"error",
				);
			}
		},
	});
}

export { SYSTEM_PROMPT as GENERATE_SYSTEM_PROMPT, extractJsonObject };
export type { GeneratedAgent };
