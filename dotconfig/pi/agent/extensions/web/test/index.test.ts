import { describe, expect, it } from "vitest";
import extension, { resolveWorkflow } from "../index.ts";

describe("pi-web-access", () => {
	it("exports a pi extension", () => {
		expect(typeof extension).toBe("function");
	});
});

describe("resolveWorkflow", () => {
	it("defaults to raw results when UI is available", () => {
		expect(resolveWorkflow(undefined, true)).toBe("none");
		expect(resolveWorkflow("", true)).toBe("none");
	});

	it("honors explicit summary-review when UI is available", () => {
		expect(resolveWorkflow("summary-review", true)).toBe("summary-review");
		expect(resolveWorkflow(" SUMMARY-REVIEW ", true)).toBe("summary-review");
	});

	it("forces raw results without UI", () => {
		expect(resolveWorkflow("summary-review", false)).toBe("none");
	});
});
