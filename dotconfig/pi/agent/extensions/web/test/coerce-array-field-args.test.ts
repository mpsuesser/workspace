import { describe, expect, it } from "vitest";
import { coerceArrayFieldArgs, coerceStringArrayArg } from "../index.ts";

describe("coerceStringArrayArg", () => {
	it("passes through actual arrays unchanged", () => {
		expect(coerceStringArrayArg(["a", "b"])).toEqual(["a", "b"]);
	});

	it("parses a JSON-encoded array string", () => {
		expect(coerceStringArrayArg('["a","b","c"]')).toEqual(["a", "b", "c"]);
	});

	it("parses a JSON-encoded array with whitespace", () => {
		expect(coerceStringArrayArg('  ["a", "b"]  ')).toEqual(["a", "b"]);
	});

	it("wraps a plain string as a single-element array", () => {
		expect(coerceStringArrayArg("just a query")).toEqual(["just a query"]);
	});

	it("wraps a non-JSON string that starts with [ as a single-element array", () => {
		// Malformed JSON falls back to treating the raw string as one item.
		expect(coerceStringArrayArg("[not valid json")).toEqual(["[not valid json"]);
	});

	it("returns non-string, non-array values unchanged", () => {
		expect(coerceStringArrayArg(42)).toBe(42);
		expect(coerceStringArrayArg(undefined)).toBe(undefined);
		expect(coerceStringArrayArg(null)).toBe(null);
	});
});

describe("coerceArrayFieldArgs", () => {
	it("coerces a JSON-stringified array in the plural field", () => {
		const out = coerceArrayFieldArgs(
			{ queries: '["one","two","three"]' },
			"query",
			"queries",
		) as Record<string, unknown>;
		expect(out.queries).toEqual(["one", "two", "three"]);
	});

	it("coerces a single string in the plural field to a one-element array", () => {
		const out = coerceArrayFieldArgs({ queries: "single query" }, "query", "queries") as Record<
			string,
			unknown
		>;
		expect(out.queries).toEqual(["single query"]);
	});

	it("moves an array in the singular field to the plural field", () => {
		const out = coerceArrayFieldArgs({ query: ["a", "b"] }, "query", "queries") as Record<
			string,
			unknown
		>;
		expect(out.queries).toEqual(["a", "b"]);
		expect(out.query).toBe("a");
	});

	it("leaves well-formed args untouched", () => {
		const input = { query: "hello", queries: ["x", "y"], numResults: 3 };
		const out = coerceArrayFieldArgs(input, "query", "queries");
		expect(out).toEqual(input);
	});

	it("coerces a stringified domainFilter array too", () => {
		const out = coerceArrayFieldArgs(
			{ query: "x", domainFilter: '["example.com","-ads.com"]' },
			"query",
			"queries",
		) as Record<string, unknown>;
		expect(out.domainFilter).toEqual(["example.com", "-ads.com"]);
	});

	it("works for url/urls as well", () => {
		const out = coerceArrayFieldArgs(
			{ urls: '["https://a.com","https://b.com"]' },
			"url",
			"urls",
		) as Record<string, unknown>;
		expect(out.urls).toEqual(["https://a.com", "https://b.com"]);
	});

	it("returns non-object args unchanged", () => {
		expect(coerceArrayFieldArgs(null, "query", "queries")).toBe(null);
		expect(coerceArrayFieldArgs("string", "query", "queries")).toBe("string");
		expect(coerceArrayFieldArgs([1, 2], "query", "queries")).toEqual([1, 2]);
	});
});
