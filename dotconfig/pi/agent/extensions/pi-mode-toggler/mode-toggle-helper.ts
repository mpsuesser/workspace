import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import type {
	BeforeAgentStartEvent,
	ExtensionAPI,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";

export type ModePersistenceScope = "none" | "session" | "project" | "branch" | "global";

export interface ModePersistenceOptions {
	scope: ModePersistenceScope;
}

export interface ModeRegistration {
	id: string;
	name: string;
	color: string;
	description?: string;
	persistenceScope: ModePersistenceScope;
	isEnabled: () => boolean;
	setEnabled: (enabled: boolean, ctx: ExtensionContext) => void;
}

export interface CreateModeToggleOptions {
	id: string;
	name?: string;
	color: string;
	statusText?: string;
	description?: string;
	enabledLabel?: string;
	disabledLabel?: string;
	persistence?: ModePersistenceOptions;
	onChange?: (enabled: boolean, ctx: ExtensionContext) => void;
}

export interface ModeToggle {
	readonly id: string;
	readonly name: string;
	readonly color: string;
	readonly description?: string;
	readonly statusText: string;
	readonly persistenceScope: ModePersistenceScope;
	isEnabled(): boolean;
	setEnabled(enabled: boolean, ctx: ExtensionContext): void;
	toggle(ctx: ExtensionContext): void;
	syncStatus(ctx: ExtensionContext): void;
	onSessionStart(ctx: ExtensionContext): void;
	onSessionShutdown(ctx: ExtensionContext): void;
	beforeAgentStart(
		event: Pick<BeforeAgentStartEvent, "systemPrompt">,
		systemPrompt?: string,
	):
		| {
				message?: {
					customType: string;
					content: string;
					display: true;
				};
				systemPrompt?: string;
		  }
		| undefined;
}

interface PersistedModeState {
	enabled: boolean;
	modeId: string;
	scope: ModePersistenceScope;
	updatedAt: string;
	cwd?: string;
	sessionId?: string;
	gitBranch?: string;
}

export const MODE_REGISTER_EVENT = "mode-toggler:register";
export const MODE_UNREGISTER_EVENT = "mode-toggler:unregister";

const registeredModes = new Map<string, ModeRegistration>();
const DEFAULT_PERSISTENCE_SCOPE: ModePersistenceScope = "none";
const PROJECT_STATE_ROOT = ".pi-mode-toggler";
const GLOBAL_STATE_ROOT = join(homedir(), ".pi", "agent", "state", "pi-mode-toggler");

export function getRegisteredModes(): ModeRegistration[] {
	return Array.from(registeredModes.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeHexColor(color: string): string | null {
	const normalized = color.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
	return normalized.toLowerCase();
}

function colorToRgb(color: string): [number, number, number] | null {
	const hex = normalizeHexColor(color);
	if (!hex) return null;

	return [
		Number.parseInt(hex.slice(0, 2), 16),
		Number.parseInt(hex.slice(2, 4), 16),
		Number.parseInt(hex.slice(4, 6), 16),
	];
}

function encodePathSegment(value: string): string {
	return encodeURIComponent(value);
}

function getPersistenceScope(options: CreateModeToggleOptions): ModePersistenceScope {
	return options.persistence?.scope ?? DEFAULT_PERSISTENCE_SCOPE;
}

function resolveGitBranch(cwd: string): string | undefined {
	try {
		const branch = execFileSync("git", ["branch", "--show-current"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		if (branch.length > 0) return branch;

		const detachedHead = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		return detachedHead.length > 0 ? `detached-${detachedHead}` : undefined;
	} catch {
		return undefined;
	}
}

function resolveStateFile(
	modeId: string,
	scope: ModePersistenceScope,
	ctx: ExtensionContext,
): string | undefined {
	const projectStateRoot = join(ctx.sessionManager.getSessionDir(), PROJECT_STATE_ROOT);
	const encodedModeId = `${encodePathSegment(modeId)}.json`;

	switch (scope) {
		case "none":
			return undefined;
		case "session":
			return join(
				projectStateRoot,
				"session",
				encodePathSegment(ctx.sessionManager.getSessionId()),
				encodedModeId,
			);
		case "project":
			return join(projectStateRoot, "project", encodedModeId);
		case "branch": {
			const gitBranch = resolveGitBranch(ctx.cwd);
			return gitBranch
				? join(projectStateRoot, "branch", encodePathSegment(gitBranch), encodedModeId)
				: join(projectStateRoot, "project", encodedModeId);
		}
		case "global":
			return join(GLOBAL_STATE_ROOT, encodedModeId);
	}
}

function readPersistedState(
	modeId: string,
	scope: ModePersistenceScope,
	ctx: ExtensionContext,
): boolean | undefined {
	const filePath = resolveStateFile(modeId, scope, ctx);
	if (!filePath) return undefined;

	try {
		const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<PersistedModeState>;
		return typeof parsed.enabled === "boolean" ? parsed.enabled : undefined;
	} catch (error) {
		const record = error as { code?: string };
		if (record.code === "ENOENT") return undefined;
		throw error;
	}
}

function writePersistedState(
	modeId: string,
	scope: ModePersistenceScope,
	enabled: boolean,
	ctx: ExtensionContext,
): void {
	const filePath = resolveStateFile(modeId, scope, ctx);
	if (!filePath) return;

	const gitBranch = scope === "branch" ? resolveGitBranch(ctx.cwd) : undefined;
	const payload: PersistedModeState = {
		enabled,
		modeId,
		scope,
		updatedAt: new Date().toISOString(),
		cwd: ctx.cwd,
		sessionId: ctx.sessionManager.getSessionId(),
		...(gitBranch ? { gitBranch } : {}),
	};

	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function formatModeLabel(name: string, color: string): string {
	const rgb = colorToRgb(color);
	if (!rgb) return name;

	const [r, g, b] = rgb;
	return `\x1b[1;38;2;${String(r)};${String(g)};${String(b)}m${name}\x1b[0m`;
}

export function createModeToggle(
	pi: ExtensionAPI,
	options: CreateModeToggleOptions,
): ModeToggle {
	const name = options.name ?? options.id;
	const statusText = options.statusText ?? formatModeLabel(name, options.color);
	const enabledLabel = options.enabledLabel ?? `${name} mode enabled`;
	const disabledLabel = options.disabledLabel ?? `${name} mode disabled`;
	const persistenceScope = getPersistenceScope(options);

	let enabled = false;
	let lastPromptEnabled: boolean | undefined;

	const getStatusMessage = (): string => {
		return enabled ? enabledLabel : disabledLabel;
	};

	const emitRegistration = (): void => {
		const registration: ModeRegistration = {
			id: options.id,
			name,
			color: options.color,
			persistenceScope,
			...(options.description
				? { description: options.description }
				: {}),
			isEnabled: () => enabled,
			setEnabled: (nextEnabled, ctx) => {
				mode.setEnabled(nextEnabled, ctx);
			},
		};
		registeredModes.set(options.id, registration);
		pi.events.emit(MODE_REGISTER_EVENT, registration);
	};

	const syncStatus = (ctx: ExtensionContext): void => {
		ctx.ui.setStatus(options.id, enabled ? statusText : undefined);
	};

	const restorePersistedState = (ctx: ExtensionContext): void => {
		if (persistenceScope === "none") return;
		const persistedEnabled = readPersistedState(options.id, persistenceScope, ctx);
		if (typeof persistedEnabled === "boolean") {
			enabled = persistedEnabled;
		}
	};

	const persistState = (ctx: ExtensionContext): void => {
		if (persistenceScope === "none") return;
		writePersistedState(options.id, persistenceScope, enabled, ctx);
	};

	const mode: ModeToggle = {
		id: options.id,
		name,
		color: options.color,
		description: options.description,
		statusText,
		persistenceScope,
		isEnabled: () => enabled,
		setEnabled: (nextEnabled, ctx) => {
			if (enabled === nextEnabled) return;
			enabled = nextEnabled;

			try {
				persistState(ctx);
			} catch {
				ctx.ui.notify(`Failed to persist ${name} mode state`, "warning");
			}

			syncStatus(ctx);
			ctx.ui.notify(getStatusMessage(), "info");
			options.onChange?.(enabled, ctx);
		},
		toggle: (ctx) => {
			mode.setEnabled(!enabled, ctx);
		},
		syncStatus: (ctx) => {
			syncStatus(ctx);
		},
		onSessionStart: (ctx) => {
			try {
				restorePersistedState(ctx);
			} catch {
				ctx.ui.notify(`Failed to restore ${name} mode state`, "warning");
			}

			emitRegistration();
			syncStatus(ctx);
			lastPromptEnabled = ctx.sessionManager
				.getBranch()
				.some((entry) => entry.type === "message" && entry.message.role === "user")
					? enabled
					: undefined;
		},
		onSessionShutdown: (ctx) => {
			registeredModes.delete(options.id);
			pi.events.emit(MODE_UNREGISTER_EVENT, options.id);
			ctx.ui.setStatus(options.id, undefined);
		},
		beforeAgentStart: (event, systemPrompt) => {
			const statusChanged =
				lastPromptEnabled !== undefined && lastPromptEnabled !== enabled;
			lastPromptEnabled = enabled;

			if (!enabled && !statusChanged) return undefined;

			return {
				...(statusChanged
					? {
							message: {
								customType: options.id,
								content: getStatusMessage(),
								display: true as const,
							},
						}
					: {}),
				...(enabled && systemPrompt
					? {
							systemPrompt: `${event.systemPrompt}\n\n${systemPrompt}`,
						}
					: {}),
			};
		},
	};

	emitRegistration();
	return mode;
}
