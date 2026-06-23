import { describe, it, expect } from "bun:test";
import { compileMeat } from "../src/core/meat";
import {
  userMsg,
  assistantText,
  assistantWithThinking,
  assistantWithToolCall,
  toolResult,
} from "./fixtures";

describe("compileMeat", () => {
  it("keeps only user messages and assistant prose", () => {
    const result = compileMeat({
      messages: [
        userMsg("fix the login bug"),
        assistantText("Let me investigate."),
        assistantWithToolCall("Read", { path: "login.ts" }),
        toolResult("Read", "export function login() { ... }"),
        toolResult("bash", "FAIL login.test.ts", true),
        assistantText("Found the root cause."),
        userMsg("ok patch it"),
        assistantWithThinking("Patched.", "Need to edit the file."),
      ],
    });

    expect(result).toBe([
      "[user]",
      "fix the login bug",
      "",
      "[assistant]",
      "Let me investigate.",
      "",
      "[assistant]",
      "Found the root cause.",
      "",
      "[user]",
      "ok patch it",
      "",
      "[assistant]",
      "Patched.",
    ].join("\n"));

    expect(result).not.toContain("Read");
    expect(result).not.toContain("FAIL login.test.ts");
    expect(result).not.toContain("Need to edit the file");
  });

  it("does not truncate long user or assistant text", () => {
    const longUser = Array.from({ length: 320 }, (_, i) => `user${i}`).join(" ");
    const longAssistant = Array.from({ length: 320 }, (_, i) => `assistant${i}`).join(" ");

    const result = compileMeat({
      messages: [
        userMsg(longUser),
        assistantText(longAssistant),
      ],
    });

    expect(result).toContain("user319");
    expect(result).toContain("assistant319");
    expect(result).not.toContain("(truncated)");
  });

  it("merges previous structured summary while stripping tool chatter", () => {
    const previousSummary = [
      "[Session Goal]",
      "- Fix login bug",
      "",
      "---",
      "",
      "[user]",
      "Fix login bug (#1)",
      "",
      "[assistant]",
      '* Read "login.ts" (#2)',
      "Found the bug. (#3)",
      "",
      "[tool_error] bash (#4)",
      "FAIL login.test.ts",
    ].join("\n");

    const result = compileMeat({
      previousSummary,
      messages: [
        userMsg("patch it"),
        assistantText("Patched and ready."),
      ],
    });

    expect(result).toBe([
      "[user]",
      "Fix login bug",
      "",
      "[assistant]",
      "Found the bug.",
      "",
      "[user]",
      "patch it",
      "",
      "[assistant]",
      "Patched and ready.",
    ].join("\n"));

    expect(result).not.toContain("[Session Goal]");
    expect(result).not.toContain('* Read "login.ts"');
    expect(result).not.toContain("FAIL login.test.ts");
    expect(result).not.toContain("(#");
  });
});
