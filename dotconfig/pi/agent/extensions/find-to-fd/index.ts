/**
 * find-to-fd
 *
 * Transparently rewrites slow `find` invocations in the bash tool into
 * equivalent `fd` invocations, which are dramatically faster (parallel walk)
 * for the deep / whole-filesystem searches agents love to run, e.g.
 *
 *     find / -type d -iname "*effect*skill*"
 *       -> fd -H -I -t d --search-path / -g -i '*effect*skill*'
 *
 * Correctness comes first: only `find` commands whose entire expression maps
 * exactly onto `fd` are rewritten (see translate.ts for the safe subset and the
 * empirically-verified parity rules). Anything else — and all surrounding shell
 * context — is left byte-for-byte untouched, so behavior never silently changes.
 *
 * Environment:
 *   PI_FIND_TO_FD_DISABLE=1   disable rewriting entirely
 *   PI_FIND_TO_FD_DEBUG=1     log each rewrite to stderr
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { execFileSync } from "node:child_process";
import { rewriteFindToFd } from "./translate.ts";

const EXTENSION_ID = "find-to-fd";

/** Resolve the fd binary name once. Returns null if neither fd nor fdfind exist. */
function resolveFdBinary(): string | null {
	for (const bin of ["fd", "fdfind"]) {
		try {
			execFileSync(bin, ["--version"], { stdio: "ignore" });
			return bin;
		} catch {
			// not available under this name; try the next
		}
	}
	return null;
}

export default function findToFdExtension(pi: ExtensionAPI): void {
	if (process.env.PI_FIND_TO_FD_DISABLE === "1") return;

	const fdBinary = resolveFdBinary();
	if (!fdBinary) {
		// fd isn't installed — do nothing rather than break the user's find calls.
		if (process.env.PI_FIND_TO_FD_DEBUG === "1") {
			console.error(`[${EXTENSION_ID}] fd not found on PATH; rewriting disabled.`);
		}
		return;
	}

	const debug = process.env.PI_FIND_TO_FD_DEBUG === "1";

	pi.on("tool_call", (event) => {
		if (!isToolCallEventType("bash", event)) return;
		const command = event.input.command;
		if (typeof command !== "string" || command.length === 0) return;
		// Cheap pre-filter: skip the parser entirely when there's no `find` token.
		if (!/(^|[\s;&|(])\/?[\w/]*find(\s|$)/.test(command)) return;

		let rewritten: string | null = null;
		try {
			rewritten = rewriteFindToFd(command, fdBinary);
		} catch (err) {
			// A parser bug must never break the user's command: swallow and pass through.
			if (debug) console.error(`[${EXTENSION_ID}] rewrite threw, passing through:`, err);
			return;
		}

		if (rewritten && rewritten !== command) {
			if (debug) {
				console.error(`[${EXTENSION_ID}] rewrote:\n  - ${command}\n  + ${rewritten}`);
			}
			event.input.command = rewritten;
		}
	});
}
