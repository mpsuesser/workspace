/**
 * OpenCode Patterns Plugin
 *
 * Detects dangerous commands and code smells based on pattern definitions.
 * Patterns are defined in .opencode/patterns/ as markdown files with YAML frontmatter.
 *
 * - `before` patterns can block (deny) or prompt (ask) for dangerous commands
 * - `after` patterns provide context/suggestions after tool execution
 */

import { Lang, parse } from '@ast-grep/napi';
import * as BunServices from '@effect/platform-bun/BunServices';
import type { Hooks, Plugin, PluginInput } from '@opencode-ai/plugin';
import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import type * as FileSystem from 'effect/FileSystem';
import * as _FileSystem from 'effect/FileSystem';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import type * as Path from 'effect/Path';
import * as _Path from 'effect/Path';
import * as Schema from 'effect/Schema';
// @ts-expect-error no type declarations
import picomatch from 'picomatch';

const PatternEvent = Schema.Literals([
	'before',
	'after'
] as const);
type PatternEvent = typeof PatternEvent.Type;

const PatternAction = Schema.Literals([
	'context',
	'ask',
	'deny'
] as const);
type PatternAction = typeof PatternAction.Type;

const PatternLevel = Schema.Literals([
	'critical',
	'high',
	'medium',
	'warning',
	'info'
] as const);
type PatternLevel = typeof PatternLevel.Type;

const PatternDetector = Schema.Literals([
	'regex',
	'ast'
] as const);
type PatternDetector = typeof PatternDetector.Type;

const PatternFrontmatter = Schema.Struct({
	name: Schema.String,
	description: Schema.String.pipe(Schema.withDecodingDefault(() => '')),
	event: PatternEvent.pipe(
		Schema.withDecodingDefault(() => 'after' as const)
	),
	tool: Schema.String.pipe(Schema.withDecodingDefault(() => '.*')),
	glob: Schema.String.pipe(Schema.optionalKey),
	pattern: Schema.String,
	detector: PatternDetector.pipe(
		Schema.withDecodingDefault(() => 'regex' as const)
	),
	inside: Schema.String.pipe(Schema.optionalKey),
	action: PatternAction.pipe(
		Schema.withDecodingDefault(() => 'context' as const)
	),
	level: PatternLevel.pipe(Schema.withDecodingDefault(() => 'info' as const))
});
type PatternFrontmatter = typeof PatternFrontmatter.Type;

class PatternDefinition extends Schema.Class<PatternDefinition>(
	'PatternDefinition'
)({
	name: Schema.String,
	description: Schema.String,
	event: PatternEvent,
	tool: Schema.String,
	glob: Schema.String.pipe(Schema.optionalKey),
	pattern: Schema.String,
	detector: PatternDetector,
	inside: Schema.String.pipe(Schema.optionalKey),
	action: PatternAction,
	level: PatternLevel,
	body: Schema.String,
	filePath: Schema.String
}) {}

const SKIPPED_FILES = [
	'CLAUDE',
	'AGENTS',
	'GEMINI',
	'README'
];

const isSkippedFile = (filename: string): boolean =>
	SKIPPED_FILES.some(
		(prefix) =>
			filename.startsWith(prefix) ||
			filename.toLowerCase() === `${prefix.toLowerCase()}.md`
	);

const parseYamlLine = (
	line: string
):
	| readonly [
			string,
			string
	  ]
	| undefined => {
	const match = line.match(/^(\w+):\s*["']?(.+?)["']?$/);
	if (!match?.[1] || !match[2]) return undefined;
	return [
		match[1],
		match[2]
	] as const;
};

const parseYaml = (content: string): Record<string, unknown> => {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match?.[1]) return {};

	const entries = match[1]
		.split('\n')
		.map(parseYamlLine)
		.filter(
			(
				entry
			): entry is readonly [
				string,
				string
			] => entry !== undefined
		);

	return Object.fromEntries(entries);
};

const extractBody = (content: string): string =>
	content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

const normalizeEvent = (event: string | undefined): PatternEvent => {
	if (!event) return 'after';
	const lower = event.toLowerCase();
	if (lower === 'pretooluse' || lower === 'before') return 'before';
	return 'after';
};

const validateRegex = (pattern: string): boolean => {
	try {
		new RegExp(pattern);
		return true;
	} catch {
		return false;
	}
};

const testRegex = (text: string, pattern: string): boolean => {
	try {
		return new RegExp(pattern).test(text);
	} catch {
		return false;
	}
};

const testGlob = (filePath: string, glob: string): boolean => {
	try {
		return picomatch(glob)(filePath);
	} catch {
		return false;
	}
};

const langFromPath = (filePath: string | undefined): Lang | null => {
	if (!filePath) return null;
	if (filePath.endsWith('.tsx')) return Lang.Tsx;
	if (filePath.endsWith('.ts')) return Lang.TypeScript;
	if (filePath.endsWith('.jsx')) return Lang.Tsx;
	if (filePath.endsWith('.js')) return Lang.JavaScript;
	return null;
};

const testAst = (
	text: string,
	pattern: PatternDefinition,
	filePath: string | undefined
): boolean => {
	const lang = langFromPath(filePath);
	if (!lang) return false;

	try {
		const root = parse(lang, text).root();
		const nodes = pattern.inside
			? root.findAll({
					rule: {
						pattern: pattern.pattern,
						inside: {
							pattern: pattern.inside,
							stopBy: 'end'
						}
					}
				})
			: root.findAll(pattern.pattern);
		return nodes.length > 0;
	} catch {
		return false;
	}
};

const decodePattern = Schema.decodeUnknownOption(PatternFrontmatter);

const readPattern = (
	filePath: string,
	content: string
): PatternDefinition | null => {
	const raw = parseYaml(content);
	if (!raw.name || !raw.pattern) return null;

	const normalized = {
		...raw,
		event: normalizeEvent(raw.event as string | undefined)
	};

	const result = decodePattern(normalized);
	if (Option.isNone(result)) {
		return null;
	}

	const fm = result.value;

	if (fm.detector !== 'ast' && !validateRegex(fm.pattern)) {
		return null;
	}

	if (fm.tool !== '.*' && !validateRegex(fm.tool)) {
		return null;
	}

	return new PatternDefinition({
		name: fm.name,
		description: fm.description,
		event: fm.event,
		tool: fm.tool,
		...(fm.glob !== undefined
			? {
					glob: fm.glob
				}
			: {}),
		pattern: fm.pattern,
		detector: fm.detector,
		...(fm.inside !== undefined
			? {
					inside: fm.inside
				}
			: {}),
		action: fm.action,
		level: fm.level,
		body: extractBody(content),
		filePath
	});
};

const loadPatternsFromDir = async (
	dir: string,
	fs: FileSystem.FileSystem,
	p: Path.Path
): Promise<PatternDefinition[]> => {
	const exists = await Effect.runPromise(
		fs.exists(dir).pipe(Effect.catch(() => Effect.succeed(false)))
	);
	if (!exists) return [];

	const patterns: PatternDefinition[] = [];

	const walk = async (currentDir: string): Promise<void> => {
		const entries = await Effect.runPromise(
			fs
				.readDirectory(currentDir)
				.pipe(Effect.catch(() => Effect.succeed([] as string[])))
		);

		for (const entry of entries) {
			const fullPath = p.join(currentDir, entry);
			const info = await Effect.runPromise(
				fs.stat(fullPath).pipe(
					Effect.catch(() =>
						Effect.succeed(
							null as {
								type: string;
							} | null
						)
					)
				)
			);
			if (!info) continue;

			if (info.type === 'Directory') {
				await walk(fullPath);
			} else if (entry.endsWith('.md') && !isSkippedFile(entry)) {
				const content = await Effect.runPromise(
					fs
						.readFileString(fullPath)
						.pipe(Effect.catch(() => Effect.succeed('')))
				);
				const pattern = readPattern(fullPath, content);
				if (pattern) patterns.push(pattern);
			}
		}
	};

	await walk(dir);
	return patterns;
};

const contentFields = [
	'command',
	'newString',
	'content',
	'pattern',
	'query',
	'url',
	'prompt'
] as const;

const getMatchableContent = (input: Record<string, unknown>): string => {
	for (const field of contentFields) {
		if (typeof input[field] === 'string') {
			return input[field] as string;
		}
	}
	return JSON.stringify(input);
};

const getFilePath = (input: Record<string, unknown>): string | undefined => {
	const fp = input.filePath;
	return typeof fp === 'string' ? fp : undefined;
};

const matches = (
	toolName: string,
	args: Record<string, unknown>,
	eventType: PatternEvent,
	pattern: PatternDefinition
): boolean => {
	const filePath = getFilePath(args);
	const content = getMatchableContent(args);

	const globMatches = pattern.glob
		? filePath !== undefined && testGlob(filePath, pattern.glob)
		: true;

	if (
		pattern.event !== eventType ||
		!testRegex(toolName, pattern.tool) ||
		!globMatches
	) {
		return false;
	}

	if (pattern.detector === 'ast') {
		return testAst(content, pattern, filePath);
	}

	return testRegex(content, pattern.pattern);
};

const levelPriority: Record<PatternLevel, number> = {
	critical: 0,
	high: 1,
	medium: 2,
	warning: 3,
	info: 4
};

const PatternLevelOrder = Order.mapInput(
	Order.Number,
	(p: PatternDefinition) => levelPriority[p.level]
);

const sortByLevel = (patterns: PatternDefinition[]): PatternDefinition[] =>
	Arr.sort(patterns, PatternLevelOrder);

let cachedPatterns: PatternDefinition[] | null = null;
let resolvedServices: {
	fs: FileSystem.FileSystem;
	path: Path.Path;
} | null = null;

const getPatterns = async (directory: string): Promise<PatternDefinition[]> => {
	if (cachedPatterns) return cachedPatterns;

	if (!resolvedServices) {
		resolvedServices = await Effect.runPromise(
			Effect.gen(function* () {
				return {
					fs: yield* _FileSystem.FileSystem,
					path: yield* _Path.Path
				};
			}).pipe(Effect.provide(BunServices.layer))
		);
	}

	const { fs, path: p } = resolvedServices;

	// Search both the global config patterns (sibling to this plugin file)
	// and the project-local .opencode/patterns/ directory.
	const globalPatternsDir = p.join(import.meta.dirname!, '..', 'patterns');
	const projectPatternsDir = p.join(directory, '.opencode', 'patterns');

	const allPatterns: PatternDefinition[] = [];
	for (const dir of [
		globalPatternsDir,
		projectPatternsDir
	]) {
		try {
			const loaded = await loadPatternsFromDir(dir, fs, p);
			allPatterns.push(...loaded);
		} catch (error) {
			console.error(
				`[opencode-patterns] Failed to load patterns from ${dir}`,
				error
			);
		}
	}

	cachedPatterns = allPatterns;
	return cachedPatterns;
};

export const PatternsPlugin: Plugin = async (pluginInput) => ({
	'tool.execute.before': async (input, output) => {
		const { client } = pluginInput;
		const patterns = await getPatterns(
			pluginInput.worktree || pluginInput.directory
		);

		const toolName = input.tool;
		const args = output.args as Record<string, unknown>;

		const matched = patterns.filter((p: PatternDefinition) =>
			matches(toolName, args, 'before', p)
		);
		if (matched.length === 0) return;

		const blockingPatterns = sortByLevel(
			matched.filter(
				(p: PatternDefinition) =>
					p.action === 'deny' || p.action === 'ask'
			)
		);
		const primary = blockingPatterns[0];

		if (primary?.action === 'deny') {
			throw new Error(
				`[DENIED] ${primary.name}: ${primary.description}\n\n${primary.body}`
			);
		}

		if (primary?.action === 'ask') {
			await client.session.prompt({
				path: {
					id: input.sessionID
				},
				body: {
					noReply: true,
					parts: [
						{
							type: 'text',
							text: `<pattern-warning name="${primary.name}" level="${primary.level}">\n${primary.body}\n</pattern-warning>`
						}
					]
				}
			});
		}

		const contextPatterns = matched.filter(
			(p: PatternDefinition) => p.action === 'context'
		);
		if (contextPatterns.length > 0) {
			const message = contextPatterns
				.map(
					(p: PatternDefinition) =>
						`<code-smell name="${p.name}" level="${p.level}">\n${p.body}\n</code-smell>`
				)
				.join('\n\n');

			await client.session.prompt({
				path: {
					id: input.sessionID
				},
				body: {
					noReply: true,
					parts: [
						{
							type: 'text',
							text: message
						}
					]
				}
			});
		}
	},

	'tool.execute.after': async (input, output) => {
		const { client } = pluginInput;
		const patterns = await getPatterns(
			pluginInput.worktree || pluginInput.directory
		);

		const toolName = input.tool;
		const pseudoArgs: Record<string, unknown> = {
			content: output.output
		};

		const contextPatterns = patterns.filter(
			(p: PatternDefinition) =>
				matches(toolName, pseudoArgs, 'after', p) &&
				p.action === 'context'
		);

		if (contextPatterns.length === 0) return;

		const message = contextPatterns
			.map(
				(p: PatternDefinition) =>
					`<code-smell name="${p.name}" level="${p.level}">\n${p.body}\n</code-smell>`
			)
			.join('\n\n');

		await client.session.prompt({
			path: {
				id: input.sessionID
			},
			body: {
				noReply: true,
				parts: [
					{
						type: 'text',
						text: message
					}
				]
			}
		});
	}
});

export default PatternsPlugin;
