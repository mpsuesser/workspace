import type {
	BeforeAgentStartEvent,
	ExtensionAPI,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";

export interface ModeRegistration {
	id: string;
	name: string;
	color: string;
	description?: string;
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
	onChange?: (enabled: boolean, ctx: ExtensionContext) => void;
}

export interface ModeToggle {
	readonly id: string;
	readonly name: string;
	readonly color: string;
	readonly description?: string;
	readonly statusText: string;
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

export const MODE_REGISTER_EVENT = "mode-toggler:register";
export const MODE_UNREGISTER_EVENT = "mode-toggler:unregister";

const registeredModes = new Map<string, ModeRegistration>();

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

	const mode: ModeToggle = {
		id: options.id,
		name,
		color: options.color,
		description: options.description,
		statusText,
		isEnabled: () => enabled,
		setEnabled: (nextEnabled, ctx) => {
			if (enabled === nextEnabled) return;
			enabled = nextEnabled;
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
