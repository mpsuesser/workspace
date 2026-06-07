import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as Result from "effect/Result";
import * as Str from "effect/String";

const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)*$/;

const normalizePackageName = (value: string): Option.Option<string> => {
	const normalized = pipe(
		Str.toLowerCase(Str.trim(value)),
		Str.replace(/\s+/g, "-"),
		Str.replace(/[^a-z0-9.-]/g, ""),
		Str.replace(/-+/g, "-"),
		Str.replace(/\.+/g, "."),
		Str.replace(/(?:^[-.]+|[-.]+$)/g, "")
	);
	return Str.isNonEmpty(normalized) && IDENTIFIER_PATTERN.test(normalized)
		? Option.some(normalized)
		: Option.none();
};

/**
 * Parse an optional frontmatter `package` value into a normalized package name.
 *
 * Absent (or explicitly empty) input yields `Result.succeed(Option.none())`.
 * A present-but-unsanitizable value yields `Result.fail(message)` so discovery
 * can skip that definition with a typed warning rather than silently coercing.
 */
export const parsePackageName = (
	value: Option.Option<string>,
	label = "package"
): Result.Result<Option.Option<string>, string> =>
	Option.match(value, {
		onNone: () => Result.succeed(Option.none()),
		onSome: (raw) =>
			Str.isNonEmpty(Str.trim(raw))
				? Option.match(normalizePackageName(raw), {
						onNone: () => Result.fail(`${label} is invalid after sanitization.`),
						onSome: (packageName) => Result.succeed(Option.some(packageName))
					})
				: Result.succeed(Option.none())
	});

/**
 * Build a runtime agent name, qualifying it with the package when present:
 * `buildRuntimeName("scout", some("code-analysis")) === "code-analysis.scout"`.
 */
export const buildRuntimeName = (localName: string, packageName: Option.Option<string>): string =>
	Option.match(packageName, {
		onNone: () => localName,
		onSome: (pkg) => `${pkg}.${localName}`
	});

export interface SplitToolList {
	readonly tools: ReadonlyArray<string>;
	readonly mcpDirectTools: ReadonlyArray<string>;
}

const MCP_PREFIX = "mcp:";

/**
 * Partition a raw tool list into builtin tool names and direct MCP tool names
 * (the `mcp:` prefix selects a server tool exposed directly to the child).
 */
export const splitToolList = (rawTools: ReadonlyArray<string>): SplitToolList => {
	const cleaned = pipe(
		rawTools,
		Arr.map(Str.trim),
		Arr.filter(Str.isNonEmpty)
	);
	return {
		tools: Arr.filter(cleaned, (tool) => !Str.startsWith(MCP_PREFIX)(tool)),
		mcpDirectTools: pipe(
			cleaned,
			Arr.filter(Str.startsWith(MCP_PREFIX)),
			Arr.map((tool) => tool.slice(MCP_PREFIX.length))
		)
	};
};

/**
 * Split a comma-separated frontmatter list (e.g. `read, bash, mcp:github/x`)
 * into trimmed, non-empty entries.
 */
export const parseCommaList = (value: Option.Option<string>): ReadonlyArray<string> =>
	Option.match(value, {
		onNone: () => [],
		onSome: (raw) => pipe(Str.split(",")(raw), Arr.map(Str.trim), Arr.filter(Str.isNonEmpty))
	});
