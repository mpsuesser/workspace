import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchMock } = vi.hoisted(() => ({
	searchMock: vi.fn<typeof import("../gemini-search.js").search>(),
}));

vi.mock("../gemini-search.js", () => ({
	search: searchMock,
}));

import {
	buildCodeSearchQuery,
	executeCodeSearch,
	formatCodeSearchResponse,
	legacyMaxTokensToNumResults,
} from "../code-search.ts";

describe("legacyMaxTokensToNumResults", () => {
	it("maps legacy token budgets onto source counts", () => {
		expect(legacyMaxTokensToNumResults(5000)).toBe(5);
		expect(legacyMaxTokensToNumResults(1000)).toBe(1);
		expect(legacyMaxTokensToNumResults(20000)).toBe(10);
		expect(legacyMaxTokensToNumResults(undefined)).toBeUndefined();
	});
});

describe("formatCodeSearchResponse", () => {
	it("formats numbered sources with excerpts", () => {
		const formatted = formatCodeSearchResponse(
			"React useEffect cleanup",
			[
				{
					title: "useEffect – React",
					url: "https://react.dev/reference/react/useEffect",
					snippet: "Cleanup docs",
				},
			],
			[
				{
					title: "useEffect – React",
					url: "https://react.dev/reference/react/useEffect",
					content: "useEffect(() => { return () => cleanup(); }, []);",
					error: null,
				},
			],
		);

		expect(formatted).toContain('Found 1 source for "React useEffect cleanup".');
		expect(formatted).toContain("1. useEffect – React");
		expect(formatted).toContain("Excerpt:");
		expect(formatted).toContain("cleanup");
	});
});

describe("executeCodeSearch", () => {
	beforeEach(() => {
		searchMock.mockReset();
	});

	it("returns a validation error for an empty query", async () => {
		const result = await executeCodeSearch("tool", { query: "   " });

		expect(result.details.error).toBe("No query provided");
		expect(result.details.resultCount).toBe(0);
		expect(searchMock).not.toHaveBeenCalled();
	});

	it("searches with provider fallback enabled and formats the response", async () => {
		searchMock.mockResolvedValue({
			provider: "exa",
			answer: "",
			results: [
				{
					title: "useEffect – React",
					url: "https://react.dev/reference/react/useEffect",
					snippet: "Cleanup docs",
				},
			],
			inlineContent: [
				{
					title: "useEffect – React",
					url: "https://react.dev/reference/react/useEffect",
					content:
						"The cleanup function should stop or undo whatever the setup function was doing.",
					error: null,
				},
			],
		});

		const result = await executeCodeSearch("tool", {
			query: "React useEffect cleanup",
			numResults: 3,
		});

		expect(searchMock).toHaveBeenCalledWith(buildCodeSearchQuery("React useEffect cleanup"), {
			provider: "auto",
			includeContent: true,
			numResults: 3,
			signal: undefined,
		});
		expect(result.details).toMatchObject({
			query: "React useEffect cleanup",
			numResults: 3,
			resultCount: 1,
			provider: "exa",
		});
		expect(result.content[0]?.text).toContain("1. useEffect – React");
	});
});
