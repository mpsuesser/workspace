/**
 * Agent Skill Plugin
 *
 * Ensures agents with `knows` frontmatter in their agent markdown files
 * have the listed skills automatically loaded into conversation context.
 *
 * - Parses `knows: [skill-name, ...]` from agent markdown frontmatter
 * - Injects skill SKILL.md content on first chat message per session
 * - Re-injects after compaction (clearing tracked state on session.compacted)
 * - Tracks `skill` tool usage to avoid double-injection
 * - Adds compaction context so the summary mentions agent skills
 *
 * Searches both global config directories (agents/, skills/ siblings to this
 * plugin file) and project-local directories (.opencode/agents/, .opencode/skills/).
 */

import * as BunServices from '@effect/platform-bun/BunServices';
import type { Plugin } from '@opencode-ai/plugin';
import * as Effect from 'effect/Effect';
import type * as FileSystem from 'effect/FileSystem';
import * as _FileSystem from 'effect/FileSystem';
import type * as Path from 'effect/Path';
import * as _Path from 'effect/Path';

// ─── Frontmatter Parsing ──────────────────────────────────────

const extractFrontmatter = (content: string): string | null => {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	return match?.[1] ?? null;
};

const extractBody = (content: string): string =>
	content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

/**
 * Parse `knows` array from agent frontmatter.
 *
 * Supports both block and inline YAML array syntax:
 *   knows:
 *     - effect-v4
 *     - bun
 * or:
 *   knows: [effect-v4, bun]
 */
const parseKnows = (frontmatter: string): string[] => {
	const lines = frontmatter.split('\n');
	const result: string[] = [];
	let inKnows = false;

	for (const line of lines) {
		if (inKnows) {
			const itemMatch = line.match(/^\s+-\s+(.+)$/);
			if (itemMatch) {
				result.push(itemMatch[1]!.trim().replace(/^["']|["']$/g, ''));
				continue;
			}
			// Reached a non-array line — done with knows block
			break;
		}

		if (/^knows:\s*$/.test(line)) {
			inKnows = true;
		} else {
			const inlineMatch = line.match(/^knows:\s*\[([^\]]*)\]/);
			if (inlineMatch) {
				return inlineMatch[1]!
					.split(',')
					.map((s) => s.trim().replace(/^["']|["']$/g, ''))
					.filter(Boolean);
			}
		}
	}

	return result;
};

// ─── Agent Discovery ──────────────────────────────────────────

/**
 * Read all *.md files in a directory and extract `knows` arrays.
 * Returns a map of agent name -> skill names they require.
 */
const loadAgentKnowsFromDir = async (
	agentsDir: string,
	fs: FileSystem.FileSystem,
	p: Path.Path
): Promise<Map<string, string[]>> => {
	const result = new Map<string, string[]>();

	const entries = await Effect.runPromise(
		fs
			.readDirectory(agentsDir)
			.pipe(Effect.catch(() => Effect.succeed([] as string[])))
	);

	for (const entry of entries) {
		if (!entry.endsWith('.md')) continue;

		const agentName = entry.replace(/\.md$/, '');
		const filePath = p.join(agentsDir, entry);

		const content = await Effect.runPromise(
			fs
				.readFileString(filePath)
				.pipe(Effect.catch(() => Effect.succeed(null as string | null)))
		);
		if (!content) continue;

		const fm = extractFrontmatter(content);
		if (!fm) continue;

		const knows = parseKnows(fm);
		if (knows.length > 0) {
			result.set(agentName, knows);
		}
	}

	return result;
};

/**
 * Merge multiple agent-knows maps. Later entries override earlier ones
 * (project-local overrides global).
 */
const mergeAgentKnows = (
	...maps: Map<string, string[]>[]
): Map<string, string[]> => {
	const merged = new Map<string, string[]>();
	for (const m of maps) {
		for (const [k, v] of m) {
			merged.set(k, v);
		}
	}
	return merged;
};

// ─── Skill Discovery ──────────────────────────────────────────

/**
 * Walk a skills directory recursively and build a name -> SKILL.md path map.
 * Skill names are directory names (must contain a SKILL.md file).
 * Handles nested skills (e.g. effect-v4/effect-testing/).
 */
const discoverSkillsFromDir = async (
	skillsDir: string,
	fs: FileSystem.FileSystem,
	p: Path.Path
): Promise<Map<string, string>> => {
	const skills = new Map<string, string>();

	const walk = async (currentDir: string): Promise<void> => {
		const names = await Effect.runPromise(
			fs
				.readDirectory(currentDir)
				.pipe(Effect.catch(() => Effect.succeed([] as string[])))
		);

		for (const name of names) {
			if (name === 'references') continue;

			const entryDir = p.join(currentDir, name);
			const info = await Effect.runPromise(
				fs.stat(entryDir).pipe(
					Effect.map(
						(s) =>
							s as {
								type: string;
							}
					),
					Effect.catch(() =>
						Effect.succeed(
							null as {
								type: string;
							} | null
						)
					)
				)
			);
			if (!info || info.type !== 'Directory') continue;

			const skillFile = p.join(entryDir, 'SKILL.md');
			const skillExists = await Effect.runPromise(
				fs
					.exists(skillFile)
					.pipe(Effect.catch(() => Effect.succeed(false)))
			);
			if (skillExists) {
				skills.set(name, skillFile);
			}

			// Recurse for nested skills
			await walk(entryDir);
		}
	};

	await walk(skillsDir);
	return skills;
};

/**
 * Merge multiple skill index maps. Later entries override earlier ones
 * (project-local overrides global).
 */
const mergeSkillIndexes = (
	...maps: Map<string, string>[]
): Map<string, string> => {
	const merged = new Map<string, string>();
	for (const m of maps) {
		for (const [k, v] of m) {
			merged.set(k, v);
		}
	}
	return merged;
};

// ─── Plugin ───────────────────────────────────────────────────

export const AgentSkillPlugin: Plugin = async (pluginInput) => {
	const { client } = pluginInput;
	const dir = pluginInput.worktree || pluginInput.directory;

	// Pre-resolve platform services
	const { fs, path: p } = await Effect.runPromise(
		Effect.gen(function* () {
			return {
				fs: yield* _FileSystem.FileSystem,
				path: yield* _Path.Path
			};
		}).pipe(Effect.provide(BunServices.layer))
	);

	// Resolve global config directories (siblings to this plugin file)
	const globalAgentsDir = p.join(import.meta.dirname!, '..', 'agents');
	const globalSkillsDir = p.join(import.meta.dirname!, '..', 'skills');

	// Resolve project-local directories
	const projectAgentsDir = p.join(dir, '.opencode', 'agents');
	const projectSkillsDir = p.join(dir, '.opencode', 'skills');

	// Build agent -> knows mapping at startup (global + project-local)
	const [globalAgentKnows, projectAgentKnows] = await Promise.all([
		loadAgentKnowsFromDir(globalAgentsDir, fs, p),
		loadAgentKnowsFromDir(projectAgentsDir, fs, p)
	]);
	const agentKnows = mergeAgentKnows(globalAgentKnows, projectAgentKnows);

	// Build skill name -> file path index at startup (global + project-local)
	const [globalSkillIndex, projectSkillIndex] = await Promise.all([
		discoverSkillsFromDir(globalSkillsDir, fs, p),
		discoverSkillsFromDir(projectSkillsDir, fs, p)
	]);
	const skillIndex = mergeSkillIndexes(globalSkillIndex, projectSkillIndex);

	// Per-session state: which skills have been loaded
	const sessionSkills = new Map<string, Set<string>>();
	// Per-session state: which agent is running
	const sessionAgents = new Map<string, string>();

	/**
	 * Read a SKILL.md file, strip frontmatter, return body content.
	 */
	const readSkillBody = async (skillPath: string): Promise<string | null> =>
		Effect.runPromise(
			fs.readFileString(skillPath).pipe(
				Effect.map(extractBody),
				Effect.catch(() => Effect.succeed(null as string | null))
			)
		);

	return {
		/**
		 * On each user message, check if the session's agent has unloaded
		 * `knows` skills. If so, inject them as context before the LLM
		 * processes the message.
		 */
		'chat.message': async (input, output) => {
			const sessionId = input.sessionID;
			const agent = input.agent ?? output.message.agent;
			if (!agent) return;

			sessionAgents.set(sessionId, agent);

			const knows = agentKnows.get(agent);
			if (!knows || knows.length === 0) return;

			const loaded = sessionSkills.get(sessionId) ?? new Set<string>();
			const missing = knows.filter((s) => !loaded.has(s));
			if (missing.length === 0) return;

			// Read content for each missing skill
			const injections: Array<{
				name: string;
				content: string;
			}> = [];
			for (const name of missing) {
				const skillPath = skillIndex.get(name);
				if (!skillPath) continue;

				const body = await readSkillBody(skillPath);
				if (body) {
					injections.push({
						name,
						content: body
					});
				}
			}

			if (injections.length === 0) return;

			// Format as <skill_content> blocks (matches the skill tool's output format)
			const text = injections
				.map(
					({ name, content }) =>
						`<skill_content name="${name}">\n${content}\n</skill_content>`
				)
				.join('\n\n');

			try {
				await client.session.prompt({
					path: {
						id: sessionId
					},
					body: {
						noReply: true,
						parts: [
							{
								type: 'text',
								text: `<system-reminder>Auto-loaded skills for agent "${agent}" (via \`knows\` frontmatter):</system-reminder>\n\n${text}`
							}
						]
					}
				});

				// Mark as loaded only after successful injection
				for (const { name } of injections) {
					loaded.add(name);
				}
				sessionSkills.set(sessionId, loaded);
			} catch {
				// Injection failed — will retry on next message
			}
		},

		/**
		 * Track when the skill tool loads a skill, so we don't double-inject.
		 */
		'tool.execute.after': async (input, _output) => {
			if (input.tool !== 'skill') return;

			const args = input.args as
				| {
						name?: string;
				  }
				| undefined;
			const name = args?.name;
			if (!name) return;

			const loaded =
				sessionSkills.get(input.sessionID) ?? new Set<string>();
			loaded.add(name);
			sessionSkills.set(input.sessionID, loaded);
		},

		/**
		 * On compaction, clear loaded-skills tracking so they get re-injected.
		 * On session deletion, clean up all state.
		 */
		event: async ({ event }) => {
			if (event.type === 'session.compacted') {
				sessionSkills.delete(event.properties.sessionID);
			}
			if (event.type === 'session.deleted') {
				const id = event.properties.info.id;
				sessionSkills.delete(id);
				sessionAgents.delete(id);
			}
		},

		/**
		 * Add context about agent skills to the compaction summary so the
		 * continuation prompt references them.
		 */
		'experimental.session.compacting': async (input, output) => {
			const agent = sessionAgents.get(input.sessionID);
			if (!agent) return;

			const knows = agentKnows.get(agent);
			if (!knows || knows.length === 0) return;

			output.context.push(
				`## Agent Skills (auto-injected)\n` +
					`Agent "${agent}" has pre-loaded skills: ${knows.join(', ')}. ` +
					`These are automatically re-injected after compaction — do not load them manually via the skill tool.`
			);
		}
	};
};

export default AgentSkillPlugin;
