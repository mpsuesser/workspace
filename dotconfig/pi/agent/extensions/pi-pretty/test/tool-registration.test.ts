import { beforeEach, describe, expect, it, vi } from "vitest";

import piPrettyExtension from "../src/index.js";

class MockText {
	private text = "";
	constructor(_text = "", _x = 0, _y = 0) {}
	setText(value: string) {
		this.text = value;
	}
	getText() {
		return this.text;
	}
}

function mockToolFactory(name: string, exec: ReturnType<typeof vi.fn>) {
	return (_cwd: string) => ({
		name,
		description: name,
		parameters: { type: "object", properties: {} },
		execute: exec,
	});
}

describe("piPrettyExtension tool registration", () => {
	let tools: Map<string, any>;
	let events: Map<string, Function>;
	let readExec: ReturnType<typeof vi.fn>;
	let bashExec: ReturnType<typeof vi.fn>;
	let lsExec: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		tools = new Map();
		events = new Map();
		readExec = vi.fn().mockResolvedValue({ content: [{ type: "text", text: "alpha\nbeta" }] });
		bashExec = vi.fn().mockResolvedValue({ content: [{ type: "text", text: "ok" }] });
		lsExec = vi.fn().mockResolvedValue({ content: [{ type: "text", text: "a.ts\nb.ts" }] });

		piPrettyExtension(
			{
				registerTool: vi.fn((tool: any) => tools.set(tool.name, tool)),
				registerCommand: vi.fn(),
				on: vi.fn((event: string, handler: Function) => events.set(event, handler)),
			},
			{
				sdk: {
					createReadToolDefinition: mockToolFactory("read", readExec),
					createBashToolDefinition: mockToolFactory("bash", bashExec),
					createLsToolDefinition: mockToolFactory("ls", lsExec),
				},
				TextComponent: MockText,
			},
		);
	});

	it("registers only read, bash, and ls overrides", () => {
		expect([...tools.keys()].sort()).toEqual(["bash", "ls", "read"]);
		expect(events.size).toBe(0);
	});

	it("decorates read results with readFile details", async () => {
		const result = await tools.get("read").execute("t1", { path: "src/index.ts" }, null, null, {});
		expect(readExec).toHaveBeenCalledOnce();
		expect(result.details).toMatchObject({
			_type: "readFile",
			filePath: "src/index.ts",
			offset: 1,
			lineCount: 2,
			content: "alpha\nbeta",
		});
	});

	it("decorates bash results with bashResult details", async () => {
		const result = await tools.get("bash").execute("t2", { command: "echo ok" }, null, null, {});
		expect(bashExec).toHaveBeenCalledOnce();
		expect(result.details).toMatchObject({
			_type: "bashResult",
			command: "echo ok",
			text: "ok",
		});
	});

	it("decorates ls results with lsResult details", async () => {
		const result = await tools.get("ls").execute("t3", { path: "." }, null, null, {});
		expect(lsExec).toHaveBeenCalledOnce();
		expect(result.details).toMatchObject({
			_type: "lsResult",
			path: ".",
			entryCount: 2,
			text: "a.ts\nb.ts",
		});
	});
});
