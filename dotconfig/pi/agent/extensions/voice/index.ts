import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { complete } from "@mariozechner/pi-ai";
import type { Model } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EXTENSION_ID = "pi-voice";
const DEFAULT_VOICE_ID = "aEO01A4wXwd1O8GPgGlF";
const DEFAULT_ELEVEN_MODEL = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const DEFAULT_SUMMARY_MODEL = "openai-codex/gpt-5.4-nano";
const DEFAULT_ACK_MODEL = "openai-codex/gpt-5.4-nano";
const MAX_RECENT_CONTEXT_CHARS = 5000;
const MAX_ASSISTANT_RESPONSE_CHARS = 12000;
const MAX_ACK_SOURCE_CHARS = 180;

type AckStyle = "template" | "llm";
type VoiceKind = "ack" | "final" | "test";
type PlayerName = "auto" | "mpv" | "afplay" | "ffplay";

interface RuntimeSettings {
	enabled: boolean;
	ackEnabled: boolean;
	finalEnabled: boolean;
	ackStyle: AckStyle;
	dryRun: boolean;
	debug: boolean;
	voiceId: string;
	elevenModel: string;
	outputFormat: string;
	summaryModel: string;
	ackModel: string;
	player: PlayerName;
	maxFinalSentences: number;
	maxSpeechChars: number;
	ackMaxLatencyMs: number;
	stability?: number;
	similarityBoost?: number;
	speed?: number;
	useSpeakerBoost: boolean;
	optimizeStreamingLatency?: number;
}

interface SpeechJob {
	kind: VoiceKind;
	text: string;
	ctx?: ExtensionContext;
	createdAt: number;
	shouldSpeak?: () => boolean;
}

interface ResolvedPlayer {
	name: Exclude<PlayerName, "auto">;
	args: (file: string) => string[];
}

function env(name: string): string | undefined {
	const value = process.env[name];
	return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) return fallback;
	const normalized = value.trim().toLowerCase();
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
	if (value === undefined) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
	if (value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAckStyle(value: string | undefined): AckStyle {
	return value?.toLowerCase() === "llm" ? "llm" : "template";
}

function parsePlayer(value: string | undefined): PlayerName {
	const normalized = value?.toLowerCase();
	if (normalized === "mpv" || normalized === "afplay" || normalized === "ffplay") return normalized;
	return "auto";
}

function loadSettings(): RuntimeSettings {
	return {
		enabled: parseBool(env("PI_VOICE_ENABLED"), true),
		ackEnabled: parseBool(env("PI_VOICE_ACK_ENABLED"), true),
		finalEnabled: parseBool(env("PI_VOICE_FINAL_ENABLED"), true),
		ackStyle: parseAckStyle(env("PI_VOICE_ACK_STYLE")),
		dryRun: parseBool(env("PI_VOICE_DRY_RUN"), false),
		debug: parseBool(env("PI_VOICE_DEBUG"), false),
		voiceId: env("PI_VOICE_ID") ?? DEFAULT_VOICE_ID,
		elevenModel: env("PI_VOICE_ELEVEN_MODEL") ?? DEFAULT_ELEVEN_MODEL,
		outputFormat: env("PI_VOICE_OUTPUT_FORMAT") ?? DEFAULT_OUTPUT_FORMAT,
		summaryModel: env("PI_VOICE_SUMMARY_MODEL") ?? DEFAULT_SUMMARY_MODEL,
		ackModel: env("PI_VOICE_ACK_MODEL") ?? DEFAULT_ACK_MODEL,
		player: parsePlayer(env("PI_VOICE_PLAYER")),
		maxFinalSentences: Math.max(1, Math.min(8, Math.round(parseNumber(env("PI_VOICE_MAX_FINAL_SENTENCES"), 3)))),
		maxSpeechChars: Math.max(160, Math.round(parseNumber(env("PI_VOICE_MAX_CHARS"), 520))),
		ackMaxLatencyMs: Math.max(1000, Math.round(parseNumber(env("PI_VOICE_ACK_MAX_LATENCY_MS"), 6000))),
		stability: parseOptionalNumber(env("PI_VOICE_STABILITY")),
		similarityBoost: parseOptionalNumber(env("PI_VOICE_SIMILARITY_BOOST")),
		speed: parseOptionalNumber(env("PI_VOICE_SPEED")),
		useSpeakerBoost: parseBool(env("PI_VOICE_USE_SPEAKER_BOOST"), true),
		optimizeStreamingLatency: parseOptionalNumber(env("PI_VOICE_OPTIMIZE_STREAMING_LATENCY")),
	};
}

function debug(settings: RuntimeSettings, message: string, error?: unknown): void {
	if (!settings.debug) return;
	const suffix = error === undefined ? "" : ` ${error instanceof Error ? error.stack ?? error.message : String(error)}`;
	process.stderr.write(`[${EXTENSION_ID}] ${message}${suffix}\n`);
}

function notify(ctx: ExtensionContext | undefined, message: string, type: "info" | "warning" | "error" = "info"): void {
	if (ctx?.hasUI) {
		ctx.ui.notify(message, type);
	} else {
		process.stderr.write(`[${EXTENSION_ID}] ${message}\n`);
	}
}

function setVoiceStatus(ctx: ExtensionContext | undefined, text: string | undefined): void {
	if (ctx?.hasUI) {
		ctx.ui.setStatus(EXTENSION_ID, text);
	}
}

function hashText(text: string): number {
	const hex = createHash("sha1").update(text).digest("hex").slice(0, 8);
	return Number.parseInt(hex, 16);
}

function truncate(text: string, maxChars: number): string {
	const trimmed = text.trim();
	if (trimmed.length <= maxChars) return trimmed;
	if (maxChars <= 10) return trimmed.slice(0, maxChars);
	return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}

function truncateMiddle(text: string, maxChars: number): string {
	const trimmed = text.trim();
	if (trimmed.length <= maxChars) return trimmed;
	const keep = Math.max(20, Math.floor((maxChars - 15) / 2));
	return `${trimmed.slice(0, keep).trimEnd()}\n...[truncated]...\n${trimmed.slice(-keep).trimStart()}`;
}

function extractText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((part) => {
			if (!part || typeof part !== "object") return "";
			const block = part as { type?: string; text?: string };
			return block.type === "text" && typeof block.text === "string" ? block.text : "";
		})
		.filter((part) => part.trim().length > 0)
		.join("\n");
}

function getMessageRole(message: unknown): string | undefined {
	if (!message || typeof message !== "object") return undefined;
	const record = message as { role?: unknown };
	return typeof record.role === "string" ? record.role : undefined;
}

function getMessageContent(message: unknown): unknown {
	if (!message || typeof message !== "object") return undefined;
	return (message as { content?: unknown }).content;
}

function getEntryMessage(entry: unknown): unknown {
	if (!entry || typeof entry !== "object") return undefined;
	const record = entry as { type?: unknown; message?: unknown };
	return record.type === "message" ? record.message : undefined;
}

function latestAssistantText(messages: unknown[]): string | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		if (getMessageRole(message) !== "assistant") continue;
		const text = extractText(getMessageContent(message)).trim();
		if (text) return text;
	}
	return undefined;
}

function latestUserTextFromBranch(branch: unknown[]): string | undefined {
	for (let i = branch.length - 1; i >= 0; i--) {
		const message = getEntryMessage(branch[i]);
		if (getMessageRole(message) !== "user") continue;
		const text = extractText(getMessageContent(message)).trim();
		if (text) return text;
	}
	return undefined;
}

function buildRecentConversation(branch: unknown[]): string {
	const lines: string[] = [];
	const recent = branch.slice(-18);

	for (const entry of recent) {
		const message = getEntryMessage(entry);
		const role = getMessageRole(message);
		if (role !== "user" && role !== "assistant") continue;

		const text = extractText(getMessageContent(message)).trim();
		if (!text) continue;

		const label = role === "user" ? "User" : "Pi";
		lines.push(`${label}: ${truncateMiddle(text, 900)}`);
	}

	return truncateMiddle(lines.join("\n\n"), MAX_RECENT_CONTEXT_CHARS);
}

function stripMarkdownForSpeech(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+[.)]\s+/gm, "")
		.replace(/[*_~]{1,3}/g, "")
		.replace(/[{}[\]|<>]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function enforceSentenceLimit(text: string, maxSentences: number): string {
	const normalized = text.trim();
	if (!normalized) return "";
	const matches = normalized.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
	if (!matches) return normalized;
	return matches.slice(0, maxSentences).join(" ").replace(/\s+/g, " ").trim();
}

function sanitizeForSpeech(text: string, settings: RuntimeSettings, maxSentences = settings.maxFinalSentences): string {
	const cleaned = stripMarkdownForSpeech(text)
		.replace(/\bPi\b/g, "Pi")
		.replace(/&/g, " and ")
		.replace(/\s+([,.!?;:])/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
	return truncate(enforceSentenceLimit(cleaned, maxSentences), settings.maxSpeechChars);
}

function deterministicFinalSummary(responseText: string, settings: RuntimeSettings): string {
	const stripped = stripMarkdownForSpeech(responseText);
	const summary = enforceSentenceLimit(stripped, settings.maxFinalSentences);
	return truncate(summary || "I’m done and ready for your next prompt.", settings.maxSpeechChars);
}

function cleanUserPromptForAck(text: string): string {
	return stripMarkdownForSpeech(text)
		.replace(/^\s*(hey|hi|okay|ok|so|please|can you|could you)\b[,.!\s-]*/i, "")
		.trim();
}

function deterministicAck(prompt: string, hasImages: boolean): string {
	const cleaned = truncate(cleanUserPromptForAck(prompt), MAX_ACK_SOURCE_CHARS).toLowerCase();
	const templates: string[] = [];

	if (hasImages) {
		templates.push("Got it — I’ll look at the image and the request.");
	}
	if (/\b(extension|hook|pi|agent loop)\b/i.test(cleaned)) {
		templates.push("Got it — I’ll wire up the extension pieces now.");
		templates.push("On it — I’ll check the Pi hooks and build this carefully.");
	}
	if (/\b(plan|design|architecture|approach)\b/i.test(cleaned)) {
		templates.push("Sounds good — I’ll turn that into a concrete plan.");
	}
	if (/\b(search|look up|research|docs?|sdk|api)\b/i.test(cleaned)) {
		templates.push("On it — I’ll look that up and distill the useful parts.");
	}
	if (/\b(fix|bug|error|failing|failed|broken)\b/i.test(cleaned)) {
		templates.push("Got it — I’ll trace the failure and work toward a fix.");
	}
	if (/\b(write|implement|build|create|add)\b/i.test(cleaned)) {
		templates.push("On it — I’ll build that and keep you posted.");
	}

	templates.push(
		"Got it — I’ll get started and report back shortly.",
		"Okay, I’m on it.",
		"Understood — I’ll take care of that now.",
	);

	const index = hashText(`${prompt}:${Date.now() >> 13}`) % templates.length;
	return templates[index];
}

function buildAckPrompt(userPrompt: string, recentConversation: string, hasImages: boolean): string {
	return [
		"The user just sent Pi a task. Write one brief spoken acknowledgement.",
		"Rules:",
		"- One sentence, under sixteen words.",
		"- Friendly and natural.",
		"- Specific enough to feel responsive, but do not solve the task.",
		"- Do not claim the work is done.",
		"- No markdown, emojis, bullets, quotes, or labels.",
		"",
		`The user ${hasImages ? "included one or more images and " : ""}said:`,
		"<user_prompt>",
		truncateMiddle(userPrompt, 1200),
		"</user_prompt>",
		"",
		"Recent context, if helpful:",
		"<recent_context>",
		truncateMiddle(recentConversation, 1600),
		"</recent_context>",
	].join("\n");
}

function buildFinalPrompt(options: {
	recentConversation: string;
	latestUserPrompt?: string;
	assistantResponse: string;
	maxSentences: number;
}): string {
	return [
		"You are writing text that will be read aloud by a text-to-speech voice.",
		"Turn Pi's latest response into a warm, useful spoken update for the user.",
		"",
		"Voice and tone:",
		"- Use full, natural sentences. Do not write clipped headline fragments.",
		"- Sound lightly playful and charming, like a smart collaborator giving a quick verbal handoff.",
		"- A little wit or sparkle is welcome, but keep it grounded in what actually happened.",
		"- Avoid corporate summary voice, robotic phrasing, and generic cheerleading.",
		"",
		"Content rules:",
		`- Write one to ${options.maxSentences} sentences, usually forty to seventy words total.`,
		"- Lead with the practical outcome, then mention what the user needs to answer or do next if anything.",
		"- If no user action is needed, say that naturally and briefly.",
		"- Avoid technical detail unless it is necessary for the user's next decision.",
		"- Do not mention model names, provider names, package versions, long paths, commands, or internal implementation details unless the user explicitly needs that exact detail.",
		"- No markdown, bullets, headings, code blocks, JSON, backticks, emojis, or file diffs.",
		"- Do not say 'the assistant said', 'Pi said', or 'in this conversation'.",
		"- Use natural punctuation for pauses.",
		"",
		"Recent conversation context:",
		"<recent_context>",
		options.recentConversation,
		"</recent_context>",
		"",
		"Latest user prompt:",
		"<latest_user_prompt>",
		options.latestUserPrompt ?? "",
		"</latest_user_prompt>",
		"",
		"Pi's latest response:",
		"<latest_response>",
		truncateMiddle(options.assistantResponse, MAX_ASSISTANT_RESPONSE_CHARS),
		"</latest_response>",
	].join("\n");
}

function parseModelRef(ref: string): { provider: string; modelId: string } | undefined {
	const slash = ref.indexOf("/");
	if (slash <= 0 || slash === ref.length - 1) return undefined;
	return { provider: ref.slice(0, slash), modelId: ref.slice(slash + 1) };
}

function uniqueModelRefs(refs: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const ref of refs) {
		const normalized = ref.trim();
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		result.push(normalized);
	}
	return result;
}

async function completeSideText(
	ctx: ExtensionContext,
	settings: RuntimeSettings,
	modelRef: string,
	prompt: string,
	options: { maxTokens: number; temperature: number; signal?: AbortSignal; purpose: string },
): Promise<string | undefined> {
	const candidates = uniqueModelRefs([
		modelRef,
		DEFAULT_SUMMARY_MODEL,
		"anthropic/claude-haiku-4-5",
		ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "",
	]);

	for (const ref of candidates) {
		if (options.signal?.aborted) return undefined;
		const parsed = parseModelRef(ref);
		if (!parsed) continue;

		const model = ctx.modelRegistry.find(parsed.provider, parsed.modelId) as Model<any> | undefined;
		if (!model) {
			debug(settings, `${options.purpose}: model not found: ${ref}`);
			continue;
		}

		const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
		if (!auth.ok) {
			debug(settings, `${options.purpose}: auth unavailable for ${ref}: ${auth.error}`);
			continue;
		}

		try {
			const response = await complete(
				model,
				{
					messages: [
						{
							role: "user" as const,
							content: [{ type: "text" as const, text: prompt }],
							timestamp: Date.now(),
						},
					],
				},
				{
					apiKey: auth.apiKey,
					headers: auth.headers,
					maxTokens: options.maxTokens,
					temperature: options.temperature,
					signal: options.signal,
				},
			);

			const text = extractText(response.content).trim();
			if (text) return text;
		} catch (error) {
			if (options.signal?.aborted) return undefined;
			debug(settings, `${options.purpose}: model call failed for ${ref}`, error);
		}
	}

	return undefined;
}

let elevenClient: ElevenLabsClient | undefined;
let elevenClientKey: string | undefined;

function getElevenClient(apiKey: string): ElevenLabsClient {
	if (!elevenClient || elevenClientKey !== apiKey) {
		elevenClient = new ElevenLabsClient({ apiKey });
		elevenClientKey = apiKey;
	}
	return elevenClient;
}

function reloadAuthStorage(ctx: ExtensionContext | undefined): void {
	// Pi's /reload refreshes extensions/resources, but the long-lived model registry can
	// keep the auth.json contents it loaded at process startup. Reload credentials before
	// checking our extension-owned key so users can add it without restarting Pi.
	try {
		(ctx?.modelRegistry as unknown as { authStorage?: { reload?: () => void } } | undefined)?.authStorage?.reload?.();
	} catch {
		// Best effort only. getApiKeyForProvider() and env fallback still run below.
	}
}

async function resolveElevenLabsApiKey(ctx: ExtensionContext | undefined): Promise<string | undefined> {
	reloadAuthStorage(ctx);

	// Prefer Pi's private auth store so users don't need to put secrets in shell files.
	const authFileKey = await ctx?.modelRegistry.getApiKeyForProvider("elevenlabs");
	if (authFileKey) return authFileKey;

	// Keep env var support for simple setups and CI.
	return env("ELEVENLABS_API_KEY") ?? env("PI_VOICE_ELEVENLABS_API_KEY");
}

async function audioToBuffer(audio: unknown): Promise<Buffer> {
	if (Buffer.isBuffer(audio)) return audio;
	if (audio instanceof Uint8Array) return Buffer.from(audio);
	if (audio instanceof ArrayBuffer) return Buffer.from(audio);

	if (audio && typeof audio === "object" && typeof (audio as { arrayBuffer?: unknown }).arrayBuffer === "function") {
		const arrayBuffer = await (audio as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer();
		return Buffer.from(arrayBuffer);
	}

	if (audio && typeof audio === "object" && Symbol.asyncIterator in audio) {
		const chunks: Buffer[] = [];
		for await (const chunk of audio as AsyncIterable<Uint8Array | Buffer | string>) {
			chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
		}
		return Buffer.concat(chunks);
	}

	if (audio && typeof audio === "object" && typeof (audio as { getReader?: unknown }).getReader === "function") {
		const reader = (audio as ReadableStream<Uint8Array>).getReader();
		const chunks: Buffer[] = [];
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) chunks.push(Buffer.from(value));
			}
		} finally {
			reader.releaseLock();
		}
		return Buffer.concat(chunks);
	}

	throw new Error("Unsupported ElevenLabs audio response type");
}

async function synthesizeToFile(
	text: string,
	settings: RuntimeSettings,
	ctx: ExtensionContext | undefined,
	signal?: AbortSignal,
): Promise<{ file: string; dir: string }> {
	if (signal?.aborted) throw new Error("Speech synthesis cancelled");

	const apiKey = await resolveElevenLabsApiKey(ctx);
	if (!apiKey) {
		throw new Error("No ElevenLabs API key found. Add an 'elevenlabs' key to ~/.pi/agent/auth.json or set ELEVENLABS_API_KEY.");
	}

	const client = getElevenClient(apiKey);
	const voiceSettings: Record<string, unknown> = {
		useSpeakerBoost: settings.useSpeakerBoost,
	};
	if (settings.stability !== undefined) voiceSettings.stability = settings.stability;
	if (settings.similarityBoost !== undefined) voiceSettings.similarityBoost = settings.similarityBoost;
	if (settings.speed !== undefined) voiceSettings.speed = settings.speed;

	const request: Record<string, unknown> = {
		text,
		modelId: settings.elevenModel,
		outputFormat: settings.outputFormat,
	};
	if (Object.keys(voiceSettings).length > 0) request.voiceSettings = voiceSettings;
	if (settings.optimizeStreamingLatency !== undefined) {
		request.optimizeStreamingLatency = settings.optimizeStreamingLatency;
	}

	const audio = await client.textToSpeech.stream(settings.voiceId, request as any, { signal } as any);
	if (signal?.aborted) throw new Error("Speech synthesis cancelled");

	const buffer = await audioToBuffer(audio);
	if (signal?.aborted) throw new Error("Speech synthesis cancelled");

	const dir = await mkdtemp(join(tmpdir(), "pi-voice-"));
	const ext = settings.outputFormat.split("_")[0] || "mp3";
	const file = join(dir, `speech.${ext}`);
	await writeFile(file, buffer);
	return { file, dir };
}

function hasCommand(command: string): boolean {
	const result = spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
	return result.status === 0;
}

function resolvePlayer(settings: RuntimeSettings): ResolvedPlayer | undefined {
	const candidates: Exclude<PlayerName, "auto">[] = settings.player === "auto"
		? process.platform === "darwin"
			? ["mpv", "afplay", "ffplay"]
			: ["mpv", "ffplay"]
		: [settings.player];

	for (const name of candidates) {
		if (!hasCommand(name)) continue;
		if (name === "mpv") return { name, args: (file) => ["--no-terminal", "--really-quiet", file] };
		if (name === "afplay") return { name, args: (file) => [file] };
		if (name === "ffplay") return { name, args: (file) => ["-nodisp", "-autoexit", "-loglevel", "quiet", file] };
	}

	return undefined;
}

function playFile(file: string, player: ResolvedPlayer, signal?: AbortSignal, onProcess?: (child: ChildProcess) => void): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			resolve();
			return;
		}

		const child = spawn(player.name, player.args(file), { stdio: "ignore" });
		onProcess?.(child);

		const onAbort = () => {
			child.kill("SIGTERM");
			setTimeout(() => {
				if (!child.killed) child.kill("SIGKILL");
			}, 500).unref?.();
		};

		signal?.addEventListener("abort", onAbort, { once: true });

		child.on("error", (error) => {
			signal?.removeEventListener("abort", onAbort);
			reject(error);
		});

		child.on("close", () => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		});
	});
}

class SpeechQueue {
	private queue: SpeechJob[] = [];
	private running = false;
	private currentProcess: ChildProcess | undefined;
	private currentAbort: AbortController | undefined;

	constructor(private readonly settings: RuntimeSettings) {}

	enqueue(job: SpeechJob): void {
		this.queue.push(job);
		void this.pump();
	}

	clearPending(kind?: VoiceKind): void {
		this.queue = kind ? this.queue.filter((job) => job.kind !== kind) : [];
	}

	stop(): void {
		this.clearPending();
		this.currentAbort?.abort();
		this.currentProcess?.kill("SIGTERM");
	}

	dispose(): void {
		this.stop();
	}

	private async pump(): Promise<void> {
		if (this.running) return;
		this.running = true;
		try {
			while (true) {
				const job = this.queue.shift();
				if (!job) return;
				await this.runJob(job);
			}
		} finally {
			this.running = false;
		}
	}

	private async runJob(job: SpeechJob): Promise<void> {
		if (!this.settings.enabled) return;
		if (job.shouldSpeak && !job.shouldSpeak()) return;

		const text = sanitizeForSpeech(job.text, this.settings, job.kind === "ack" ? 1 : this.settings.maxFinalSentences);
		if (!text) return;

		if (this.settings.dryRun) {
			notify(job.ctx, `Voice ${job.kind}: ${text}`, "info");
			return;
		}

		const player = resolvePlayer(this.settings);
		if (!player) {
			notify(job.ctx, "Pi voice could not find an audio player. Install mpv, ffplay, or use macOS afplay.", "warning");
			return;
		}

		const abort = new AbortController();
		this.currentAbort = abort;
		setVoiceStatus(job.ctx, job.kind === "ack" ? "voice: acknowledging" : "voice: speaking");

		let dir: string | undefined;
		try {
			debug(this.settings, `speaking ${job.kind}: ${text}`);
			const synthesized = await synthesizeToFile(text, this.settings, job.ctx, abort.signal);
			dir = synthesized.dir;
			if (abort.signal.aborted || (job.shouldSpeak && !job.shouldSpeak())) return;
			await playFile(synthesized.file, player, abort.signal, (child) => {
				this.currentProcess = child;
			});
		} catch (error) {
			if (!abort.signal.aborted) {
				debug(this.settings, `speech ${job.kind} failed`, error);
				notify(job.ctx, `Pi voice failed: ${error instanceof Error ? error.message : String(error)}`, "warning");
			}
		} finally {
			this.currentProcess = undefined;
			this.currentAbort = undefined;
			setVoiceStatus(job.ctx, undefined);
			if (dir) {
				void rm(dir, { recursive: true, force: true }).catch((error) => debug(this.settings, "failed to remove temp voice dir", error));
			}
		}
	}
}

async function formatStatus(settings: RuntimeSettings, ctx: ExtensionContext | undefined): Promise<string> {
	const hasAuthFileKey = Boolean(await ctx?.modelRegistry.getApiKeyForProvider("elevenlabs"));
	const hasEnvKey = Boolean(env("ELEVENLABS_API_KEY") ?? env("PI_VOICE_ELEVENLABS_API_KEY"));
	const keySource = hasAuthFileKey ? "Pi auth.json" : hasEnvKey ? "environment" : "missing";
	const player = resolvePlayer(settings)?.name ?? "not found";
	return [
		`Voice: ${settings.enabled ? "on" : "off"}`,
		`ElevenLabs API key: ${keySource}`,
		`Voice ID: ${settings.voiceId}`,
		`ElevenLabs model: ${settings.elevenModel}`,
		`Output format: ${settings.outputFormat}`,
		`Player: ${player}`,
		`Acknowledgements: ${settings.ackEnabled ? settings.ackStyle : "off"}`,
		`Final summaries: ${settings.finalEnabled ? "on" : "off"}`,
		`Summary model: ${settings.summaryModel}`,
		`Dry run: ${settings.dryRun ? "on" : "off"}`,
	].join("\n");
}

function parseOnOff(value: string | undefined): boolean | undefined {
	if (!value) return undefined;
	const normalized = value.toLowerCase();
	if (["on", "true", "yes", "1"].includes(normalized)) return true;
	if (["off", "false", "no", "0"].includes(normalized)) return false;
	return undefined;
}

export default function (pi: ExtensionAPI) {
	const settings = loadSettings();
	const speechQueue = new SpeechQueue(settings);
	let activityVersion = 0;
	const sideControllers = new Set<AbortController>();

	const cancelSideWork = () => {
		for (const controller of sideControllers) {
			controller.abort();
		}
		sideControllers.clear();
	};

	const createSideController = () => {
		const controller = new AbortController();
		sideControllers.add(controller);
		controller.signal.addEventListener("abort", () => sideControllers.delete(controller), { once: true });
		return controller;
	};

	const shouldUseVoice = (ctx?: ExtensionContext) => {
		if (!settings.enabled) return false;
		if (ctx && !ctx.hasUI) return false;
		return true;
	};

	const enqueueSpeech = (kind: VoiceKind, text: string, ctx: ExtensionContext | undefined, version?: number) => {
		speechQueue.enqueue({
			kind,
			text,
			ctx,
			createdAt: Date.now(),
			shouldSpeak: version === undefined ? undefined : () => version === activityVersion,
		});
	};

	const speakAck = async (userPrompt: string, hasImages: boolean, ctx: ExtensionContext, version: number) => {
		if (!shouldUseVoice(ctx) || !settings.ackEnabled) return;
		const startedAt = Date.now();
		const controller = createSideController();
		try {
			let text: string | undefined;
			if (settings.ackStyle === "llm") {
				const recentConversation = buildRecentConversation(ctx.sessionManager.getBranch() as unknown[]);
				text = await completeSideText(
					ctx,
					settings,
					settings.ackModel,
					buildAckPrompt(userPrompt, recentConversation, hasImages),
					{ maxTokens: 48, temperature: 0.8, signal: controller.signal, purpose: "ack" },
				);
			}

			if (!text) text = deterministicAck(userPrompt, hasImages);
			if (controller.signal.aborted || version !== activityVersion) return;
			if (Date.now() - startedAt > settings.ackMaxLatencyMs) return;
			enqueueSpeech("ack", text, ctx, version);
		} catch (error) {
			debug(settings, "ack generation failed", error);
		} finally {
			sideControllers.delete(controller);
		}
	};

	const speakFinal = async (eventMessages: unknown[], ctx: ExtensionContext, version: number) => {
		if (!shouldUseVoice(ctx) || !settings.finalEnabled) return;

		const responseText = latestAssistantText(eventMessages);
		if (!responseText) return;

		const controller = createSideController();
		setVoiceStatus(ctx, "voice: summarizing");
		try {
			const branch = ctx.sessionManager.getBranch() as unknown[];
			const recentConversation = buildRecentConversation(branch);
			const latestUserPrompt = latestUserTextFromBranch(branch);
			const prompt = buildFinalPrompt({
				recentConversation,
				latestUserPrompt,
				assistantResponse: responseText,
				maxSentences: settings.maxFinalSentences,
			});

			const generated = await completeSideText(
				ctx,
				settings,
				settings.summaryModel,
				prompt,
				{ maxTokens: 220, temperature: 0.35, signal: controller.signal, purpose: "final summary" },
			);

			if (controller.signal.aborted || version !== activityVersion) return;
			const text = generated ? sanitizeForSpeech(generated, settings) : deterministicFinalSummary(responseText, settings);
			speechQueue.clearPending("ack");
			enqueueSpeech("final", text, ctx, version);
		} catch (error) {
			debug(settings, "final summary generation failed", error);
			if (!controller.signal.aborted && version === activityVersion) {
				enqueueSpeech("final", deterministicFinalSummary(responseText, settings), ctx, version);
			}
		} finally {
			sideControllers.delete(controller);
			setVoiceStatus(ctx, undefined);
		}
	};

	pi.registerCommand("voice", {
		description: "Control Pi voice output",
		handler: async (args, ctx) => {
			const parts = args.trim().split(/\s+/).filter(Boolean);
			const command = parts[0]?.toLowerCase() ?? "status";

			if (command === "status") {
				notify(ctx, await formatStatus(settings, ctx), "info");
				return;
			}

			if (command === "on" || command === "off") {
				settings.enabled = command === "on";
				notify(ctx, `Pi voice ${settings.enabled ? "enabled" : "disabled"}.`, "info");
				if (!settings.enabled) {
					cancelSideWork();
					speechQueue.stop();
				}
				return;
			}

			if (command === "stop") {
				activityVersion++;
				cancelSideWork();
				speechQueue.stop();
				setVoiceStatus(ctx, undefined);
				notify(ctx, "Stopped Pi voice.", "info");
				return;
			}

			if (command === "test") {
				const text = parts.slice(1).join(" ") || "Pi voice is working. I’ll speak short, useful updates when work finishes.";
				enqueueSpeech("test", text, ctx);
				return;
			}

			if (command === "ack") {
				const value = parts[1]?.toLowerCase();
				if (value === "template" || value === "llm") {
					settings.ackEnabled = true;
					settings.ackStyle = value;
				} else {
					const onOff = parseOnOff(value);
					if (onOff === undefined) {
						notify(ctx, "Usage: /voice ack on|off|template|llm", "warning");
						return;
					}
					settings.ackEnabled = onOff;
				}
				notify(ctx, `Pi voice acknowledgements: ${settings.ackEnabled ? settings.ackStyle : "off"}.`, "info");
				return;
			}

			if (command === "final") {
				const onOff = parseOnOff(parts[1]);
				if (onOff === undefined) {
					notify(ctx, "Usage: /voice final on|off", "warning");
					return;
				}
				settings.finalEnabled = onOff;
				notify(ctx, `Pi voice final summaries: ${settings.finalEnabled ? "on" : "off"}.`, "info");
				return;
			}

			if (command === "voice") {
				const voiceId = parts[1];
				if (!voiceId) {
					notify(ctx, "Usage: /voice voice <elevenlabs-voice-id>", "warning");
					return;
				}
				settings.voiceId = voiceId;
				notify(ctx, `Pi voice ID set to ${voiceId}.`, "info");
				return;
			}

			if (command === "dry-run") {
				const onOff = parseOnOff(parts[1]);
				if (onOff === undefined) {
					notify(ctx, "Usage: /voice dry-run on|off", "warning");
					return;
				}
				settings.dryRun = onOff;
				notify(ctx, `Pi voice dry run: ${settings.dryRun ? "on" : "off"}.`, "info");
				return;
			}

			notify(ctx, "Usage: /voice status|on|off|stop|test|ack|final|voice|dry-run", "warning");
		},
	});

	pi.on("input", (event, ctx) => {
		if (event.source !== "interactive") return { action: "continue" as const };
		if (!settings.enabled || !settings.ackEnabled) return { action: "continue" as const };

		activityVersion++;
		cancelSideWork();
		speechQueue.stop();

		const version = activityVersion;
		const hasImages = Array.isArray(event.images) && event.images.length > 0;
		void speakAck(event.text, hasImages, ctx, version);

		return { action: "continue" as const };
	});

	pi.on("agent_end", (event, ctx) => {
		if (!settings.enabled || !settings.finalEnabled) return;
		const version = activityVersion;
		void speakFinal(event.messages as unknown[], ctx, version);
	});

	pi.on("session_shutdown", () => {
		cancelSideWork();
		speechQueue.dispose();
	});
}
