/**
 * Discover and load agent definitions from markdown files.
 *
 * Mirrors OpenCode's `ConfigAgent.load(dir)` (config/agent.ts):
 *   - Scans `{agent,agents}/**\/*.md` under each search directory.
 *   - Parses YAML frontmatter; body becomes the system prompt.
 *   - Nested directory names are preserved in the agent's `name` if not
 *     overridden by frontmatter `name:`.
 *   - Unknown frontmatter keys are folded into `options`.
 *   - The deprecated `tools` map (and our ergonomic string/array variants)
 *     are translated into permission rules.
 *
 * Search directories (in OpenCode-equivalent precedence order, later wins):
 *   1. user:    `~/.pi/agent/agents/`
 *   2. project: walks up from cwd to find `.pi/agents/` or `agents/`,
 *               same walk pi uses for context files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { getAgentDir, parseFrontmatter } from "@mariozechner/pi-coding-agent";
import type {
	AgentFrontmatter,
	AgentInfo,
	AgentMode,
	PermissionRule,
} from "./agent-info.js";
import {
	collapseToToolsAllowlist,
	normalizePermissionField,
	normalizeToolsField,
	toolsToPermissionRules,
} from "./permission-map.js";

const KNOWN_FRONTMATTER_KEYS = new Set([
	"name",
	"description",
	"mode",
	"hidden",
	"disable",
	"color",
	"model",
	"prompt",
	"tools",
	"permission",
	"options",
]);

/** Per-file load result with the diagnostics produced during normalization. */
export interface LoadedAgent {
	agent: AgentInfo;
	warnings: string[];
}

export interface DiscoveryResult {
	/** Final, merged set of agents (project > user > builtin). */
	agents: AgentInfo[];
	/** Project agents directory, if one was found while walking up from cwd. */
	projectAgentsDir: string | null;
	/** User agents directory checked (may not exist on disk). */
	userAgentsDir: string;
	/** Per-agent normalization warnings, surfaced once to the user. */
	warnings: string[];
}

function isDirectory(p: string): boolean {
	try {
		return fs.statSync(p).isDirectory();
	} catch {
		return false;
	}
}

/**
 * Walk up from cwd looking for the first project-local `.pi/agents/`.
 *
 * We deliberately do NOT accept `.pi/agent/` (singular). `.pi/agent/` is pi's
 * own per-user config dir (extensions, skills, sessions, etc.) and if cwd is
 * anywhere under `$HOME`, walking up would eventually find `~/.pi/agent`
 * either directly or via a symlink and treat the whole pi config tree as
 * project agents -- including any `.md` files under `node_modules` of
 * other extensions. The user's convention is `.pi/agents/` only.
 *
 * We also stop the walk at $HOME so user-level `.pi/agents` is loaded
 * exclusively via getAgentDir() in the user phase, not as a project dir.
 */
function findProjectAgentsDir(cwd: string): string | null {
	const home = process.env.HOME;
	let current = path.resolve(cwd);
	while (true) {
		const candidate = path.join(current, ".pi", "agents");
		if (isDirectory(candidate)) return candidate;
		const parent = path.dirname(current);
		if (parent === current) return null;
		if (home && current === home) return null;
		current = parent;
	}
}

/** Directory names we never recurse into when collecting agent files. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".hg", "dist", "build", "out", ".next", ".turbo", ".cache"]);

/** Recursively collect *.md files, skipping noisy directories. */
function collectMarkdownFiles(dir: string): string[] {
	const out: string[] = [];
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const e of entries) {
		if (SKIP_DIRS.has(e.name)) continue;
		if (e.name.startsWith(".") && e.name !== "." && e.name !== "..") continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			out.push(...collectMarkdownFiles(full));
		} else if ((e.isFile() || e.isSymbolicLink()) && e.name.endsWith(".md")) {
			out.push(full);
		}
	}
	return out;
}

/**
 * Derive the agent name from the file path relative to its search root.
 * Mirrors OpenCode's `configEntryNameFromPath` so nested directories become
 * part of the name (e.g. `.pi/agents/team/reviewer.md` -> `team/reviewer`).
 */
function nameFromPath(filePath: string, searchRoot: string): string {
	const normalized = filePath.replaceAll("\\", "/");
	const rootNorm = searchRoot.replaceAll("\\", "/").replace(/\/+$/, "");
	let candidate: string;
	if (normalized.startsWith(rootNorm + "/")) {
		candidate = normalized.slice(rootNorm.length + 1);
	} else {
		candidate = path.basename(filePath);
	}
	return candidate.replace(/\.md$/i, "");
}

function loadOneAgent(
	filePath: string,
	searchRoot: string,
	source: "user" | "project",
): LoadedAgent | null {
	let raw: string;
	try {
		raw = fs.readFileSync(filePath, "utf-8");
	} catch (err) {
		return {
			agent: {
				name: nameFromPath(filePath, searchRoot),
				mode: "subagent",
				permission: [],
				options: {},
				source,
				filePath,
			},
			warnings: [`failed to read ${filePath}: ${err instanceof Error ? err.message : String(err)}`],
		};
	}

	const { frontmatter, body } = parseFrontmatter<AgentFrontmatter>(raw);
	const warnings: string[] = [];

	if (frontmatter.disable === true) return null;

	const defaultName = nameFromPath(filePath, searchRoot);
	const name = typeof frontmatter.name === "string" && frontmatter.name.trim()
		? frontmatter.name.trim()
		: defaultName;

	// mode: only "subagent" is honored; warn on the others, default to "subagent".
	const requestedMode = frontmatter.mode as AgentMode | undefined;
	let mode: AgentMode = "subagent";
	if (requestedMode === "primary" || requestedMode === "all") {
		warnings.push(
			`${filePath}: mode="${requestedMode}" is not supported by pi-subagent (pi has no primary persona registry); treating as "subagent".`,
		);
	} else if (requestedMode === "subagent") {
		mode = "subagent";
	}

	// Collect unknown frontmatter keys into options. Matches OpenCode normalize().
	const options: Record<string, unknown> = {
		...(frontmatter.options ?? {}),
	};
	for (const [k, v] of Object.entries(frontmatter)) {
		if (!KNOWN_FRONTMATTER_KEYS.has(k)) options[k] = v;
	}

	// Warn on fields we deliberately don't honor.
	for (const dropped of ["temperature", "top_p", "steps", "maxSteps", "variant"]) {
		if (dropped in frontmatter) {
			warnings.push(
				`${filePath}: "${dropped}" has no effect (pi exposes no CLI flag for it); stored in options.`,
			);
		}
	}

	// Build permission rules from `tools` shorthand + explicit `permission`.
	const tools = normalizeToolsField(frontmatter.tools);
	const permission: PermissionRule[] = [];
	if (tools) permission.push(...toolsToPermissionRules(tools));
	permission.push(...normalizePermissionField(frontmatter.permission));

	const agent: AgentInfo = {
		name,
		description: typeof frontmatter.description === "string" ? frontmatter.description : undefined,
		mode,
		hidden: frontmatter.hidden === true,
		color: typeof frontmatter.color === "string" ? frontmatter.color : undefined,
		model: typeof frontmatter.model === "string" ? frontmatter.model : undefined,
		prompt: body.trim() || undefined,
		permission,
		options,
		tools: tools,
		source,
		filePath,
	};

	return { agent, warnings };
}

function loadFromDir(dir: string, source: "user" | "project"): LoadedAgent[] {
	if (!isDirectory(dir)) return [];
	const files = collectMarkdownFiles(dir);
	const out: LoadedAgent[] = [];
	for (const file of files) {
		const loaded = loadOneAgent(file, dir, source);
		if (loaded) out.push(loaded);
	}
	return out;
}

export interface DiscoverOptions {
	/** Working directory used to locate the project `.pi/agents/`. */
	cwd: string;
	/** Built-in agents (general/explore) supplied by defaults.ts. */
	builtins: AgentInfo[];
}

export function discoverAgents(opts: DiscoverOptions): DiscoveryResult {
	const userAgentsDir = path.join(getAgentDir(), "agents");
	const projectAgentsDir = findProjectAgentsDir(opts.cwd);

	const allWarnings: string[] = [];

	const userLoaded = loadFromDir(userAgentsDir, "user");
	const projectLoaded = projectAgentsDir ? loadFromDir(projectAgentsDir, "project") : [];

	for (const { agent, warnings } of [...userLoaded, ...projectLoaded]) {
		// Pre-flight: surface tool-allowlist warnings now so the user sees them
		// once at session start, not per invocation.
		const flat = collapseToToolsAllowlist(agent.permission);
		for (const w of flat.warnings) allWarnings.push(`[${agent.source}:${agent.name}] ${w}`);
		for (const w of warnings) allWarnings.push(w);
	}

	const agents = new Map<string, AgentInfo>();
	for (const a of opts.builtins) agents.set(a.name, a);
	for (const { agent } of userLoaded) agents.set(agent.name, agent);
	for (const { agent } of projectLoaded) agents.set(agent.name, agent);

	return {
		agents: Array.from(agents.values()),
		projectAgentsDir,
		userAgentsDir,
		warnings: allWarnings,
	};
}
