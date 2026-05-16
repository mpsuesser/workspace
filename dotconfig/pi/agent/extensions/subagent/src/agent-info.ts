/**
 * Agent info types.
 *
 * Mirrors OpenCode's `Info` schema from `packages/opencode/src/agent/agent.ts`
 * and the per-agent config schema from `packages/opencode/src/config/agent.ts`,
 * adapted for pi:
 *  - `mode` is fixed to "subagent" (pi has no primary persona registry).
 *  - `permission` is collapsed to a pi `--tools` allowlist by permission-map.ts.
 *  - `temperature`, `top_p`, `steps`, `maxSteps`, `variant` are NOT honored
 *    (pi exposes no CLI flag for them); unknown frontmatter keys are folded
 *    into `options` like OpenCode does.
 */

export type PermissionAction = "allow" | "deny" | "ask";

export interface PermissionRule {
	permission: string;
	pattern: string;
	action: PermissionAction;
}

export type Permission = PermissionRule[];

export type AgentMode = "subagent" | "primary" | "all";

export type AgentColor = string; // hex like #RRGGBB or theme key (primary, secondary, ...)

export interface AgentInfo {
	/** Stable identifier. Matches the markdown filename (sans .md) or `name:` in frontmatter. */
	name: string;
	/** When the LLM should use this agent. Used by the `task` tool's `subagent_type` selection. */
	description?: string;
	/**
	 * OpenCode supports "subagent" | "primary" | "all". This extension only
	 * honors "subagent" -- non-subagent agents are still loaded but ignored
	 * by the `task` tool (with a warning at load time).
	 */
	mode: AgentMode;
	/** Bundled built-in agent (general/explore). User markdown agents have native=false. */
	native?: boolean;
	/** Hide from the agent list in tool descriptions and from `/agent list`. Still invokable. */
	hidden?: boolean;
	/** Theme color or hex. Used by the renderer; safe to omit. */
	color?: AgentColor;
	/**
	 * Provider/model selection passed through to `pi --model`.
	 * Accepts pi's full pattern syntax: "claude-sonnet-4-5", "anthropic/claude-haiku-4-5",
	 * or "openai/gpt-4o:high".
	 */
	model?: string;
	/** The system prompt (markdown body, or the bundled prompt for native agents). */
	prompt?: string;
	/**
	 * OpenCode's permission ruleset. After normalization, a flat array of rules
	 * with last-match-wins semantics. permission-map.ts collapses this to a pi
	 * --tools allowlist; pattern-bearing rules are warned-and-dropped.
	 */
	permission: Permission;
	/** Opaque options bag; unknown frontmatter keys land here. */
	options: Record<string, unknown>;
	/**
	 * @deprecated Use `permission` instead. OpenCode preserves the same
	 * back-compat shorthand: a map of {toolName: enabled}. We additionally
	 * accept comma-separated strings and arrays in frontmatter for ergonomics.
	 */
	tools?: Record<string, boolean>;
	/** Source provenance for diagnostics and the renderer. */
	source: "builtin" | "user" | "project";
	/** Absolute path to the .md file the agent was loaded from (undefined for builtins). */
	filePath?: string;
}

/**
 * Raw frontmatter shape as parsed from a markdown file -- before normalization.
 * Mirrors OpenCode's `AgentSchema` plus the deprecated/ergonomic variants we accept.
 */
export interface AgentFrontmatter {
	name?: string;
	description?: string;
	mode?: AgentMode;
	hidden?: boolean;
	disable?: boolean;
	color?: AgentColor;
	model?: string;

	/**
	 * Three accepted forms:
	 *   tools: { read: true, bash: false }   (OpenCode's typed form)
	 *   tools: read, bash, grep              (string, common in @-agent files)
	 *   tools: [read, bash, grep]            (array, common in @-agent files)
	 */
	tools?: Record<string, boolean> | string | string[];
	/** OpenCode's permission shorthand: action string OR record of per-permission rules. */
	permission?: PermissionAction | Record<string, PermissionAction | Record<string, PermissionAction>>;
	/** Free-form options pass-through. */
	options?: Record<string, unknown>;

	// Fields we deliberately do NOT honor (silently folded into `options` like
	// any other unknown key, so existing OpenCode markdown still parses):
	//   temperature, top_p, steps, maxSteps, variant
	[key: string]: unknown;
}
