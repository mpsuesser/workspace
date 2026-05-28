import type { ExtractedContent } from "./extract.js";
import { search } from "./gemini-search.js";
import type { SearchResult } from "./perplexity.js";

const DEFAULT_CODE_SEARCH_RESULTS = 5;
const MIN_CODE_SEARCH_RESULTS = 1;
const MAX_CODE_SEARCH_RESULTS = 10;
const MAX_EXCERPT_CHARS = 1200;

export interface CodeSearchParams {
	query: string;
	numResults?: number;
}

export interface CodeSearchDetails {
	query: string;
	numResults: number;
	resultCount: number;
	provider?: string;
	error?: string;
}

type CodeSearchContent = { type: "text"; text: string };

function clampCodeSearchResultCount(value: number): number {
	return Math.min(MAX_CODE_SEARCH_RESULTS, Math.max(MIN_CODE_SEARCH_RESULTS, Math.floor(value)));
}

function normalizeCodeSearchResultCount(value: number | undefined): number {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return DEFAULT_CODE_SEARCH_RESULTS;
	}
	return clampCodeSearchResultCount(value);
}

export function legacyMaxTokensToNumResults(value: unknown): number | undefined {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return undefined;
	}
	return clampCodeSearchResultCount(Math.round(value / 1000));
}

export function buildCodeSearchQuery(query: string): string {
	return `Official documentation, API references, GitHub examples, and Stack Overflow answers for: ${query}`;
}

function normalizeExcerpt(text: string): string {
	const normalized = text
		.replace(/\r\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	if (normalized.length <= MAX_EXCERPT_CHARS) {
		return normalized;
	}
	return `${normalized.slice(0, MAX_EXCERPT_CHARS - 3)}...`;
}

function createInlineContentIndex(
	inlineContent: readonly ExtractedContent[] | undefined,
): Map<string, ExtractedContent> {
	return new Map((inlineContent ?? []).map((content) => [content.url, content]));
}

function getResultExcerpt(
	result: SearchResult,
	inlineContentIndex: ReadonlyMap<string, ExtractedContent>,
): string {
	const inlineContent = inlineContentIndex.get(result.url);
	if (inlineContent?.content.trim()) {
		return normalizeExcerpt(inlineContent.content);
	}
	if (result.snippet.trim()) {
		return normalizeExcerpt(result.snippet);
	}
	return "";
}

export function formatCodeSearchResponse(
	query: string,
	results: readonly SearchResult[],
	inlineContent: readonly ExtractedContent[] | undefined,
): string {
	if (results.length === 0) {
		return `No code search results found for "${query}".`;
	}

	const inlineContentIndex = createInlineContentIndex(inlineContent);
	const sections = results.map((result, index) => {
		const title = result.title.trim() || `Source ${index + 1}`;
		const lines = [`${index + 1}. ${title}`, `URL: ${result.url}`];
		const excerpt = getResultExcerpt(result, inlineContentIndex);
		if (excerpt) {
			lines.push(`Excerpt:\n${excerpt}`);
		}
		return lines.join("\n");
	});

	const sourceLabel = results.length === 1 ? "source" : "sources";
	return [`Found ${results.length} ${sourceLabel} for "${query}".`, ...sections].join("\n\n");
}

export async function executeCodeSearch(
	_toolCallId: string,
	params: CodeSearchParams,
	signal?: AbortSignal,
): Promise<{
	content: CodeSearchContent[];
	details: CodeSearchDetails;
}> {
	const query = params.query.trim();
	const numResults = normalizeCodeSearchResultCount(params.numResults);
	if (!query) {
		return {
			content: [{ type: "text", text: "Error: No query provided." }],
			details: { query: "", numResults, resultCount: 0, error: "No query provided" },
		};
	}

	try {
		const response = await search(buildCodeSearchQuery(query), {
			provider: "auto",
			includeContent: true,
			numResults,
			signal,
		});
		const results = response.results.slice(0, numResults);
		return {
			content: [
				{
					type: "text",
					text: formatCodeSearchResponse(query, results, response.inlineContent),
				},
			],
			details: {
				query,
				numResults,
				resultCount: results.length,
				provider: response.provider,
			},
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			content: [{ type: "text", text: `Error: ${message}` }],
			details: { query, numResults, resultCount: 0, error: message },
		};
	}
}
