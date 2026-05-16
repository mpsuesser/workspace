/**
 * Translate OpenCode-style permission rules + tools shorthand into the inputs
 * pi's CLI actually accepts: a flat allowlist of tool names for `--tools`.
 *
 * Limitations (flagged at the call site via the returned `warnings`):
 *   - pattern-bearing rules (e.g. `read: { "*.env": "ask" }`) are dropped
 *   - action: "ask" is collapsed to "deny" (pi has no per-pattern prompt gate)
 *   - permissions with no pi equivalent (external_directory, repo_clone,
 *     repo_overview, lsp, doom_loop, question, skill) are dropped
 */

import type { Permission, PermissionAction, PermissionRule } from "./agent-info.js";

/** Tool names pi treats as built-in. */
export const PI_BUILTIN_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"] as const;

/** OpenCode permission key -> pi tool name (1:n where OpenCode collapses edit/write/patch). */
const PERMISSION_TO_PI_TOOL: Record<string, string[]> = {
	read: ["read"],
	bash: ["bash"],
	edit: ["edit", "write"], // OpenCode treats edit/write/patch as one "edit" permission
	write: ["write"],
	patch: ["edit"],
	grep: ["grep"],
	glob: ["find"], // pi's `find` is OC's `glob`
	list: ["ls"], // pi's `ls` is OC's `list`
	ls: ["ls"],
	webfetch: ["webfetch"], // only present if a webfetch extension is installed
	websearch: ["websearch"],
	task: ["task"], // recursive subagent; default-denied like OpenCode
	todowrite: ["todowrite"], // only present if a todo extension is installed
};

/** Permissions we recognize but pi has no equivalent for; dropped with a warning. */
const UNSUPPORTED_PERMISSIONS = new Set([
	"external_directory",
	"repo_clone",
	"repo_overview",
	"lsp",
	"doom_loop",
	"question",
	"skill",
	"plan_enter",
	"plan_exit",
]);

export interface ToolsAllowlistResult {
	/** Tool names to pass to `pi --tools <csv>` (sorted, deduped). */
	allowedTools: string[];
	/**
	 * `true` if NO restrictions apply (no rules at all). Caller may want to
	 * omit `--tools` entirely so pi runs with its default tool set.
	 */
	unrestricted: boolean;
	/** Diagnostic messages to surface once at agent-load time. */
	warnings: string[];
}

/**
 * Normalize the various frontmatter shapes we accept for `tools:` into the
 * canonical OpenCode form: `Record<string, boolean>`.
 */
export function normalizeToolsField(raw: unknown): Record<string, boolean> | undefined {
	if (raw == null) return undefined;
	if (typeof raw === "string") {
		const result: Record<string, boolean> = {};
		for (const token of raw.split(",")) {
			const t = token.trim();
			if (t) result[t] = true;
		}
		return Object.keys(result).length > 0 ? result : undefined;
	}
	if (Array.isArray(raw)) {
		const result: Record<string, boolean> = {};
		for (const item of raw) {
			if (typeof item === "string" && item.trim()) result[item.trim()] = true;
		}
		return Object.keys(result).length > 0 ? result : undefined;
	}
	if (typeof raw === "object") {
		const result: Record<string, boolean> = {};
		for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
			if (typeof v === "boolean") result[k] = v;
		}
		return Object.keys(result).length > 0 ? result : undefined;
	}
	return undefined;
}

/**
 * Translate the deprecated `tools` map into permission rules. Matches
 * OpenCode's `normalize()` in config/agent.ts -- edit/write/patch collapse
 * to the "edit" permission.
 */
export function toolsToPermissionRules(tools: Record<string, boolean>): PermissionRule[] {
	const rules: PermissionRule[] = [];
	for (const [tool, enabled] of Object.entries(tools)) {
		const action: PermissionAction = enabled ? "allow" : "deny";
		const permission = tool === "write" || tool === "edit" || tool === "patch" ? "edit" : tool;
		rules.push({ permission, pattern: "*", action });
	}
	return rules;
}

/**
 * Normalize the various frontmatter shapes we accept for `permission:` into a
 * flat ruleset.
 *
 * Accepts:
 *   permission: allow                    -> [{*, *, allow}]
 *   permission: deny                     -> [{*, *, deny}]
 *   permission: { read: allow, edit: { "*": deny, "src/*.md": allow }}
 */
export function normalizePermissionField(raw: unknown): PermissionRule[] {
	if (raw == null) return [];
	if (typeof raw === "string") {
		if (raw === "allow" || raw === "deny" || raw === "ask")
			return [{ permission: "*", pattern: "*", action: raw }];
		return [];
	}
	if (typeof raw !== "object") return [];

	const out: PermissionRule[] = [];
	for (const [permission, value] of Object.entries(raw as Record<string, unknown>)) {
		if (typeof value === "string") {
			if (value === "allow" || value === "deny" || value === "ask")
				out.push({ permission, pattern: "*", action: value });
		} else if (value && typeof value === "object") {
			for (const [pattern, action] of Object.entries(value as Record<string, unknown>)) {
				if (action === "allow" || action === "deny" || action === "ask")
					out.push({ permission, pattern, action });
			}
		}
	}
	return out;
}

/**
 * Collapse a permission ruleset to a flat pi tool allowlist.
 *
 * Algorithm:
 *   1. Walk rules in order. Last-match-wins on (permission, pattern="*").
 *      Rules with patterns other than "*" are recorded for warnings but do
 *      not affect the allowlist.
 *   2. For each pi tool, look up its action; "allow" -> include, "deny" or
 *      "ask" -> exclude.
 *   3. `task` is excluded by default unless explicitly allowed (mirrors
 *      OpenCode's deriveSubagentSessionPermission which adds task:deny
 *      unless the subagent opts in).
 */
export function collapseToToolsAllowlist(permission: Permission): ToolsAllowlistResult {
	const warnings: string[] = [];

	if (permission.length === 0) {
		return { allowedTools: [], unrestricted: true, warnings };
	}

	// Track effective action per (pi tool name), with last-write-wins.
	// Start each pi tool at "default": effectively allowed (pi runs with all
	// built-ins enabled when --tools is not supplied) UNLESS we have any
	// allow-list-shaped rule, in which case we flip the default to deny so the
	// rules act as an exact allowlist.
	const hasExplicitAllow = permission.some((r) => r.action === "allow" && r.pattern === "*");

	const effective = new Map<string, PermissionAction>();
	// Build initial defaults for every pi tool.
	const allKnownPiTools = new Set<string>([
		...PI_BUILTIN_TOOLS,
		"webfetch",
		"websearch",
		"todowrite",
		"task",
	]);
	for (const t of allKnownPiTools) {
		effective.set(t, hasExplicitAllow ? "deny" : "allow");
	}
	// task always defaults to deny unless explicitly allowed.
	effective.set("task", "deny");

	for (const rule of permission) {
		if (rule.pattern !== "*") {
			warnings.push(
				`permission rule "${rule.permission}: ${rule.pattern}" uses a pattern; pi has no per-pattern gating, rule ignored.`,
			);
			continue;
		}

		if (rule.action === "ask") {
			warnings.push(
				`permission "${rule.permission}: ask" downgraded to "deny" (pi has no per-tool ask prompt).`,
			);
		}
		const action: PermissionAction = rule.action === "ask" ? "deny" : rule.action;

		// Wildcard permission applies to every pi tool we know about.
		if (rule.permission === "*") {
			for (const t of effective.keys()) {
				// Even "*: allow" should not enable task implicitly.
				if (t === "task" && action === "allow") continue;
				effective.set(t, action);
			}
			continue;
		}

		if (UNSUPPORTED_PERMISSIONS.has(rule.permission)) {
			warnings.push(
				`permission "${rule.permission}" has no pi equivalent and is ignored (rule: ${rule.action}).`,
			);
			continue;
		}

		const piTools = PERMISSION_TO_PI_TOOL[rule.permission];
		if (!piTools) {
			// Unknown permission name -- forward as-is so user-defined extension
			// tools can be allow/deny-listed by name.
			effective.set(rule.permission, action);
			continue;
		}
		for (const piTool of piTools) effective.set(piTool, action);
	}

	const allowedTools = Array.from(effective.entries())
		.filter(([, action]) => action === "allow")
		.map(([tool]) => tool)
		.sort();

	return { allowedTools, unrestricted: false, warnings };
}
