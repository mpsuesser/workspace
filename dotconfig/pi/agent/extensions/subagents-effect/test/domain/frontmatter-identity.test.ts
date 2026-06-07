import { assert, describe, expect, it } from "vitest";
import * as Option from "effect/Option";
import * as Result from "effect/Result";
import { parseFrontmatter } from "../../src/domain/frontmatter.ts";
import { buildRuntimeName, parseCommaList, parsePackageName, splitToolList } from "../../src/domain/identity.ts";

describe("parseFrontmatter", () => {
	it("parses a quoted frontmatter block and trims the body", () => {
		const parsed = parseFrontmatter('---\nname: scout\ndescription: "A code scout"\n---\n\nYou are a scout.\n');
		expect(parsed.frontmatter.name).toBe("scout");
		expect(parsed.frontmatter.description).toBe("A code scout");
		expect(parsed.body).toBe("You are a scout.");
	});

	it("returns the verbatim content when there is no frontmatter", () => {
		const parsed = parseFrontmatter("no frontmatter here");
		expect(parsed.frontmatter).toEqual({});
		expect(parsed.body).toBe("no frontmatter here");
	});

	it("normalizes CRLF line endings", () => {
		const parsed = parseFrontmatter("---\r\nname: worker\r\ndescription: w\r\n---\r\nbody");
		expect(parsed.frontmatter.name).toBe("worker");
		expect(parsed.body).toBe("body");
	});
});

describe("identity helpers", () => {
	it("treats an absent package as success with no package", () => {
		const result = parsePackageName(Option.none());
		assert(Result.isSuccess(result), "expected success");
		expect(Option.isNone(result.success)).toBe(true);
	});

	it("normalizes a messy package name", () => {
		const result = parsePackageName(Option.some("Code Analysis"));
		assert(Result.isSuccess(result), "expected success");
		expect(Option.getOrNull(result.success)).toBe("code-analysis");
	});

	it("fails for a package name that cannot be sanitized", () => {
		const result = parsePackageName(Option.some("***"));
		expect(Result.isFailure(result)).toBe(true);
	});

	it("builds package-qualified runtime names", () => {
		expect(buildRuntimeName("scout", Option.some("code-analysis"))).toBe("code-analysis.scout");
		expect(buildRuntimeName("scout", Option.none())).toBe("scout");
	});

	it("splits direct MCP tools from builtin tools", () => {
		const split = splitToolList(["read", " mcp:chrome-devtools ", "bash", ""]);
		expect(split.tools).toEqual(["read", "bash"]);
		expect(split.mcpDirectTools).toEqual(["chrome-devtools"]);
	});

	it("parses comma lists into trimmed non-empty entries", () => {
		expect(parseCommaList(Option.some("a, b ,, c"))).toEqual(["a", "b", "c"]);
		expect(parseCommaList(Option.none())).toEqual([]);
	});
});
