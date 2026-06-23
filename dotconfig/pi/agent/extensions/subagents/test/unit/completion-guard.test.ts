import test from "node:test";
import assert from "node:assert/strict";

import type { Message } from "@earendil-works/pi-ai";

import {
	evaluateCompletionMutationGuard,
	expectsImplementationMutation,
	hasMutationToolCall,
} from "../../src/runs/shared/completion-guard.ts";

function assistantToolCall(name: string, args: Record<string, unknown> = {}): Message {
	return {
		role: "assistant",
		content: [{ type: "toolCall", name, arguments: args }],
	} as unknown as Message;
}

function assistantText(text: string): Message {
	return {
		role: "assistant",
		content: [{ type: "text", text }],
	} as unknown as Message;
}

test("implementation task with no mutation triggers the completion guard", () => {
	const result = evaluateCompletionMutationGuard({
		agent: "worker",
		task: "Implement the approved fix",
		messages: [assistantText("Plan: update the files...")],
	});

	assert.deepEqual(result, {
		expectedMutation: true,
		attemptedMutation: false,
		triggered: true,
	});
});

test("declared read-only core tools suppress implementation-word false positives", () => {
	const result = evaluateCompletionMutationGuard({
		agent: "architect",
		task: "Produce a proposal that implements the approved fix",
		messages: [assistantText("Proposal only")],
		tools: ["read", "grep", "find", "ls"],
	});

	assert.deepEqual(result, {
		expectedMutation: false,
		attemptedMutation: false,
		triggered: false,
	});
});

test("omitted, empty, bash, unknown, write, and MCP tool capabilities stay conservative", () => {
	const base = {
		agent: "architect",
		task: "Implement the approved source fix",
		messages: [assistantText("Validation only")],
	};

	assert.equal(evaluateCompletionMutationGuard(base).triggered, true);
	assert.equal(evaluateCompletionMutationGuard({ ...base, tools: [] }).triggered, true);
	assert.equal(evaluateCompletionMutationGuard({ ...base, tools: ["read", "bash", "ls"] }).triggered, true);
	assert.equal(evaluateCompletionMutationGuard({ ...base, tools: ["read", "custom_lookup"] }).triggered, true);
	assert.equal(evaluateCompletionMutationGuard({ ...base, tools: ["read", "write"] }).triggered, true);
	assert.equal(evaluateCompletionMutationGuard({ ...base, tools: ["read", "grep"], mcpDirectTools: ["github/search"] }).triggered, true);
});

test("implementation task with mutating-capable tools still triggers when no mutation is observed", () => {
	const result = evaluateCompletionMutationGuard({
		agent: "implementation-agent",
		task: "Fix the test implementation",
		messages: [assistantText("I will edit it next")],
		tools: ["read", "edit"],
	});

	assert.deepEqual(result, {
		expectedMutation: true,
		attemptedMutation: false,
		triggered: true,
	});
});

test("review-only, research, and framework output instructions do not expect mutation", () => {
	assert.equal(expectsImplementationMutation("worker", "Review only: return findings, do not edit"), false);
	assert.equal(expectsImplementationMutation("worker", "Do not edit files. Tell me how to fix the bug."), false);
	assert.equal(expectsImplementationMutation("worker", "Review the diff and suggest fixes only. Do not edit files."), false);
	assert.equal(expectsImplementationMutation("worker", "Implement this. Do not edit files outside this repo. Do not edit files."), false);
	assert.equal(expectsImplementationMutation("worker", "Investigate why this failed"), false);
	assert.equal(expectsImplementationMutation("research-agent", "Research the API behavior"), false);
	assert.equal(expectsImplementationMutation("research-agent", "Research this and patch the bug"), true);
	assert.equal(expectsImplementationMutation("review-agent", "Review this and fix any real issues"), true);
	assert.equal(expectsImplementationMutation("review-agent", "Review this and fix any real issues; regardless of findings, apply changes directly"), true);
	assert.equal(expectsImplementationMutation("worker", "[Write to: /tmp/result.md]\n\nSummarize findings"), false);
	assert.equal(expectsImplementationMutation("worker", "Write report"), false);
	assert.equal(expectsImplementationMutation("worker", "Create a report"), false);
	assert.equal(expectsImplementationMutation("worker", "Create a summary"), false);
	assert.equal(expectsImplementationMutation("worker", "Add a report"), false);
	assert.equal(expectsImplementationMutation("worker", "Update a summary"), false);
	assert.equal(expectsImplementationMutation("worker", "Write to {chain_dir}"), false);
	assert.equal(
		expectsImplementationMutation("worker", "Do async work\nUpdate progress at: /tmp/progress.md\nWrite your findings to: /tmp/out.md"),
		false,
	);
});

test("implementation verbs win over investigative wording", () => {
	assert.equal(expectsImplementationMutation("implementation-agent", "Investigate why the agent did not edit files and fix it"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Research the current code path and patch the bug"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Fix the bug where no edits were made"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Implement the fix and return findings."), true);
});

test("edit intent covers common docs, config, and source tasks", () => {
	assert.equal(expectsImplementationMutation("implementation-agent", "Update README to mention the native tool"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Remove share functionality and all Vercel references"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Replace the registered command with a render tool"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Create completion-guard.ts"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Add tests for the completion guard"), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Implement the approved fixes. Do not edit files outside this repo."), true);
	assert.equal(expectsImplementationMutation("implementation-agent", "Implement the fix. Do not edit unrelated files."), true);
});

test("edit and write tool calls count as mutation attempts", () => {
	assert.equal(hasMutationToolCall([assistantToolCall("edit", { path: "a.ts" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("write", { path: "a.ts" })]), true);
});

test("obvious mutating bash commands count as mutation attempts", () => {
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "mkdir -p src && cat > src/file.ts <<'EOF'\nhi\nEOF" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "cat <<'EOF' > src/file.ts\nhi\nEOF" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "python3 -c \"from pathlib import Path; Path('x').write_text('hi')\"" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "node script.js > generated.txt" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "echo 'a > b'" })]), false);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "node -e \"console.log(a > b)\"" })]), false);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "python3 <<'PY'\nprint('inspect only')\nPY" })]), false);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "echo 'rm file'" })]), false);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "printf \"mkdir x\"" })]), false);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "git apply patch.diff" })]), true);
	assert.equal(hasMutationToolCall([assistantToolCall("bash", { command: "patch -p0 < fix.patch" })]), true);
});

test("implementation task with mutation attempts does not trigger", () => {
	const result = evaluateCompletionMutationGuard({
		agent: "worker",
		task: "Fix the failing test",
		messages: [assistantToolCall("edit", { path: "test.ts" })],
	});

	assert.equal(result.triggered, false);
});
