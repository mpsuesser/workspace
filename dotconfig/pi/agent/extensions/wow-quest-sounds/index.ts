import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Plays the classic World of Warcraft quest sounds:
//   - "quest accepted" flourish when you submit a fresh prompt
//   - "quest complete" fanfare when the top-level agent finishes its turn
//
// Both .ogg files are the authentic Blizzard assets, extracted from the game
// client (Sound/Interface/iQuestActivate.ogg -> FileDataID 567400, and
// iQuestComplete.ogg -> FileDataID 567439).
//
// Disable without unloading: set WOW_QUEST_SOUNDS=off (or 0/false/no).

const ASSETS = {
	accept: fileURLToPath(new URL("./assets/quest-accept.ogg", import.meta.url)),
	complete: fileURLToPath(new URL("./assets/quest-complete.ogg", import.meta.url)),
} as const;

type PlayerName = "mpv" | "ffplay" | "afplay";

// Playback volume as a fraction of normal (1.0). Tweak to taste.
const VOLUME = 0.65;

function envDisabled(): boolean {
	const value = process.env.WOW_QUEST_SOUNDS?.trim().toLowerCase();
	return value === "off" || value === "0" || value === "false" || value === "no";
}

// True inside a pi-subagents child process. Subagents run as separate `pi`
// processes with PI_SUBAGENT_DEPTH >= 1; the top-level interactive session
// leaves it unset.
function isSubagent(): boolean {
	return Number(process.env.PI_SUBAGENT_DEPTH ?? "0") > 0;
}

function commandExists(command: string): boolean {
	return spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" }).status === 0;
}

function playerArgs(name: PlayerName, file: string): string[] {
	switch (name) {
		case "mpv": // --volume is a percentage (100 = normal)
			return ["--no-terminal", "--really-quiet", `--volume=${Math.round(VOLUME * 100)}`, file];
		case "ffplay": // -volume is 0-256 (256 = normal)
			return ["-nodisp", "-autoexit", "-loglevel", "quiet", "-volume", String(Math.round(VOLUME * 256)), file];
		case "afplay":
			// -v is a linear gain (1.0 = normal). Note: afplay also misreports the
			// length of these game .ogg files and quits early, so it is a last resort.
			return ["-v", String(VOLUME), file];
	}
}

let cachedPlayer: PlayerName | null | undefined;
function resolvePlayer(): PlayerName | undefined {
	if (cachedPlayer !== undefined) return cachedPlayer ?? undefined;
	// mpv first: it decodes these game .ogg files correctly and plays them in
	// full. afplay (macOS) mishandles them and stops early, so it is last.
	const candidates: PlayerName[] = ["mpv", "ffplay", "afplay"];
	cachedPlayer = candidates.find(commandExists) ?? null;
	return cachedPlayer ?? undefined;
}

function play(file: string): void {
	const player = resolvePlayer();
	if (!player) return;
	// Spawn detached + unref so each cue plays to completion independently of
	// pi's process group/lifecycle. We deliberately do NOT kill in-flight cues:
	// killing afplay and immediately respawning races the CoreAudio device and
	// swallows the next sound. Short overlaps are fine; the OS mixes them.
	try {
		const child = spawn(player, playerArgs(player, file), { stdio: "ignore", detached: true });
		child.on("error", () => {});
		child.unref();
	} catch {
		// Playback is best-effort; never disrupt the session.
	}
}

export default function (pi: ExtensionAPI) {
	// Quest accepted: a fresh, idle, human-typed prompt in the top-level session.
	pi.on("input", (event) => {
		const result = { action: "continue" as const };
		if (envDisabled() || isSubagent()) return result;
		if (event.source !== "interactive") return result; // ignore rpc/extension-injected input
		// streamingBehavior is "steer" | "followUp" | undefined (undefined => fresh idle submit).
		// Read defensively: present on the running pi, absent in some bundled type defs.
		const streamingBehavior = (event as { streamingBehavior?: "steer" | "followUp" }).streamingBehavior;
		if (streamingBehavior !== undefined) return result; // ignore steers and queued follow-ups
		play(ASSETS.accept);
		return result;
	});

	// Quest complete: the top-level agent finished its turn. ctx.hasUI is false
	// in print/JSON mode (where subagents run), so this only fires for the
	// interactive session the user is talking to directly.
	pi.on("agent_end", (_event, ctx: ExtensionContext) => {
		if (envDisabled() || isSubagent()) return;
		if (!ctx.hasUI) return;
		play(ASSETS.complete);
	});
}
