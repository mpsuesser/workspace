import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";

const FRONTMATTER_LINE = /^([\w-]+):\s*(.*)$/;

const stripMatchingQuotes = (value: string): string => {
	const isDoubleQuoted = Str.startsWith('"')(value) && Str.endsWith('"')(value);
	const isSingleQuoted = Str.startsWith("'")(value) && Str.endsWith("'")(value);
	return (isDoubleQuoted || isSingleQuoted) && value.length >= 2 ? value.slice(1, -1) : value;
};

export interface ParsedFrontmatter {
	readonly frontmatter: Record<string, string>;
	readonly body: string;
}

const parseLine = (line: string): Option.Option<readonly [string, string]> => {
	const match = FRONTMATTER_LINE.exec(line);
	if (match === null) return Option.none();
	const key = match[1];
	const rawValue = match[2];
	if (key === undefined || rawValue === undefined) return Option.none();
	return Option.some([key, stripMatchingQuotes(Str.trim(rawValue))] as const);
};

/**
 * Parse a markdown agent/chain definition into its frontmatter map and body.
 *
 * Mirrors the loose `key: value` frontmatter format the original extension
 * accepts (single-line scalar values, optional surrounding quotes). Returns an
 * empty frontmatter map and the verbatim content when no `---` block is found.
 */
export const parseFrontmatter = (content: string): ParsedFrontmatter => {
	const normalized = Str.replaceAll("\r\n", "\n")(content);
	if (!Str.startsWith("---")(normalized)) {
		return { frontmatter: {}, body: normalized };
	}

	const endIndex = normalized.indexOf("\n---", 3);
	if (endIndex === -1) {
		return { frontmatter: {}, body: normalized };
	}

	const block = normalized.slice(4, endIndex);
	const body = Str.trim(normalized.slice(endIndex + 4));
	const frontmatter = pipe(Str.split("\n")(block), Arr.map(parseLine), Arr.getSomes, R.fromEntries);

	return { frontmatter, body };
};
