/**
 * Test harness for pattern definitions
 *
 * Provides utilities to test that pattern regex matches expected inputs
 * without requiring the full plugin infrastructure.
 */

import { Lang, parse } from '@ast-grep/napi';
import * as BunServices from '@effect/platform-bun/BunServices';
import { describe, expect, it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Path from 'effect/Path';
// @ts-expect-error - no type declarations available
import picomatch from 'picomatch';

interface PatternDefinition {
	name: string;
	description: string;
	event: string;
	tool: string;
	glob?: string;
	pattern: string;
	detector: 'regex' | 'ast';
	inside?: string;
	action: string;
	level: string;
	body: string;
	filePath: string;
}

const parseYaml = (content: string): Record<string, unknown> => {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};
	return Object.fromEntries(
		match[1]!
			.split('\n')
			.map((line) => line.match(/^(\w+):\s*["']?(.+?)["']?$/))
			.filter(Boolean)
			.map((m) => [
				m![1],
				m![2]
			])
	);
};

const extractBody = (content: string): string =>
	content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

const readPattern = async (
	fs: FileSystem.FileSystem,
	filePath: string
): Promise<PatternDefinition | null> => {
	try {
		const content = await Effect.runPromise(fs.readFileString(filePath));
		const fm = parseYaml(content);
		if (!fm.name || !fm.pattern) return null;
		const result: PatternDefinition = {
			name: fm.name as string,
			description: (fm.description as string) || '',
			event: (fm.event as string) || 'PostToolUse',
			tool: (fm.tool as string) || '.*',
			pattern: fm.pattern as string,
			detector: (fm.detector as 'regex' | 'ast') || 'regex',
			action: (fm.action as string) || 'context',
			level: (fm.level as string) || 'info',
			body: extractBody(content),
			filePath
		};
		if (typeof fm.glob === 'string') result.glob = fm.glob;
		if (typeof fm.inside === 'string') result.inside = fm.inside;
		return result;
	} catch {
		return null;
	}
};

const loadAllPatterns = async (
	fs: FileSystem.FileSystem,
	path: Path.Path
): Promise<PatternDefinition[]> => {
	const patternsDir = path.join(import.meta.dirname!, '..', 'patterns');
	const patterns: PatternDefinition[] = [];

	const walk = async (dir: string): Promise<void> => {
		const dirExists = await Effect.runPromise(fs.exists(dir));
		if (!dirExists) return;
		try {
			const entries = await Effect.runPromise(fs.readDirectory(dir));
			for (const entry of entries) {
				const fullPath = path.join(dir, entry);
				try {
					const stat = await Effect.runPromise(fs.stat(fullPath));
					if (stat.type === 'Directory') {
						await walk(fullPath);
					} else if (
						entry.endsWith('.md') &&
						!entry.startsWith('CLAUDE') &&
						!entry.startsWith('README')
					) {
						const pattern = await readPattern(fs, fullPath);
						if (pattern) patterns.push(pattern);
					}
				} catch {}
			}
		} catch {
			// ignore
		}
	};

	await walk(patternsDir);
	return patterns;
};

// Pre-load all patterns at module level using top-level await
const { fs: _fs, path: _path } = await Effect.runPromise(
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		return {
			fs,
			path
		};
	}).pipe(Effect.provide(BunServices.layer))
);

const _allPatterns = await loadAllPatterns(_fs, _path);

const findPatternByName = (name: string): PatternDefinition | null => {
	return _allPatterns.find((p) => p.name === name) ?? null;
};

const testGlob = (filePath: string, glob: string): boolean => {
	try {
		return picomatch(glob)(filePath);
	} catch {
		return false;
	}
};

interface TestPatternOptions {
	name: string;
	tag?: string;
	shouldMatch: string[];
	shouldNotMatch: string[];
}

interface TestBashPatternOptions {
	name: string;
	decision: 'ask' | 'deny';
	shouldMatch: string[];
	shouldNotMatch: string[];
}

const testAstMatch = (input: string, pattern: PatternDefinition): boolean => {
	try {
		const root = parse(Lang.TypeScript, input).root();
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

export const testPattern = (opts: TestPatternOptions) => {
	describe(`Pattern: ${opts.name}`, () => {
		const pattern = findPatternByName(opts.name);

		it('should load pattern definition', () => {
			expect(pattern).not.toBeNull();
			expect(pattern!.name).toBe(opts.name);
		});

		if (pattern) {
			const testMatch =
				pattern.detector === 'ast'
					? (input: string) => testAstMatch(input, pattern)
					: (input: string) =>
							new RegExp(pattern.pattern).test(input);

			describe('shouldMatch', () => {
				for (const input of opts.shouldMatch) {
					it(`should match: ${JSON.stringify(input).slice(0, 80)}`, () => {
						expect(testMatch(input)).toBe(true);
					});
				}
			});

			describe('shouldNotMatch', () => {
				for (const input of opts.shouldNotMatch) {
					it(`should NOT match: ${JSON.stringify(input).slice(0, 80)}`, () => {
						expect(testMatch(input)).toBe(false);
					});
				}
			});
		}
	});
};

export const testBashPattern = (opts: TestBashPatternOptions) => {
	describe(`Bash Pattern: ${opts.name}`, () => {
		const pattern = findPatternByName(opts.name);

		it('should load pattern definition', () => {
			expect(pattern).not.toBeNull();
			expect(pattern!.tool.toLowerCase()).toBe('bash');
			expect(pattern!.event.toLowerCase()).toMatch(/^(pre|before)/);
			expect(pattern!.action).toBe(opts.decision);
		});

		if (pattern) {
			const regex = new RegExp(pattern.pattern);

			describe('shouldMatch', () => {
				for (const input of opts.shouldMatch) {
					it(`should match: ${JSON.stringify(input)}`, () => {
						expect(regex.test(input)).toBe(true);
					});
				}
			});

			describe('shouldNotMatch', () => {
				for (const input of opts.shouldNotMatch) {
					it(`should NOT match: ${JSON.stringify(input)}`, () => {
						expect(regex.test(input)).toBe(false);
					});
				}
			});
		}
	});
};

interface TestWritePatternOptions {
	name: string;
	decision: 'ask' | 'deny';
	shouldMatch: string[];
	shouldNotMatch: string[];
}

export const testWritePattern = (opts: TestWritePatternOptions) => {
	describe(`Write Pattern: ${opts.name}`, () => {
		const pattern = findPatternByName(opts.name);

		it('should load pattern definition', () => {
			expect(pattern).not.toBeNull();
			expect(pattern!.tool.toLowerCase()).toBe('write');
			expect(pattern!.event.toLowerCase()).toMatch(/^(pre|before)/);
			expect(pattern!.action).toBe(opts.decision);
			expect(pattern!.glob).toBeDefined();
		});

		if (pattern?.glob) {
			describe('shouldMatch (glob)', () => {
				for (const filePath of opts.shouldMatch) {
					it(`should match file: ${JSON.stringify(filePath)}`, () => {
						expect(testGlob(filePath, pattern.glob!)).toBe(true);
					});
				}
			});

			describe('shouldNotMatch (glob)', () => {
				for (const filePath of opts.shouldNotMatch) {
					it(`should NOT match file: ${JSON.stringify(filePath)}`, () => {
						expect(testGlob(filePath, pattern.glob!)).toBe(false);
					});
				}
			});
		}
	});
};

interface TestFilePathPatternOptions {
	name: string;
	shouldMatch: Array<{
		code: string;
		filePath: string;
	}>;
	shouldNotMatch: Array<{
		code: string;
		filePath: string;
	}>;
}

export const testFilePathPattern = (opts: TestFilePathPatternOptions) => {
	describe(`File+Code Pattern: ${opts.name}`, () => {
		const pattern = findPatternByName(opts.name);

		it('should load pattern definition', () => {
			expect(pattern).not.toBeNull();
		});

		if (pattern) {
			const regex = new RegExp(pattern.pattern);

			describe('shouldMatch', () => {
				for (const { code, filePath } of opts.shouldMatch) {
					it(`should match code=${JSON.stringify(code)} in file=${filePath}`, () => {
						const codeMatches = regex.test(code);
						const globMatches = pattern.glob
							? testGlob(filePath, pattern.glob)
							: true;
						expect(codeMatches && globMatches).toBe(true);
					});
				}
			});

			describe('shouldNotMatch', () => {
				for (const { code, filePath } of opts.shouldNotMatch) {
					it(`should NOT match code=${JSON.stringify(code)} in file=${filePath}`, () => {
						const codeMatches = regex.test(code);
						const globMatches = pattern.glob
							? testGlob(filePath, pattern.glob)
							: true;
						expect(codeMatches && globMatches).toBe(false);
					});
				}
			});
		}
	});
};
