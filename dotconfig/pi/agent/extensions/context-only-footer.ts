import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

type ModelInfo = {
	id: string;
	provider: string;
	reasoning: boolean;
	contextWindow: number;
} | null;

function formatTokens(count: number): string {
	if (count < 1000) return count.toString();
	if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1000000) return `${Math.round(count / 1000)}k`;
	if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
	return `${Math.round(count / 1000000)}M`;
}

function homeRelative(path: string): string {
	const home = process.env.HOME || process.env.USERPROFILE;
	if (home && path.startsWith(home)) {
		return `~${path.slice(home.length)}`;
	}
	return path;
}

function sanitizeStatusText(text: string): string {
	return text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim();
}

const HIDDEN_BRANCHES = new Set(["main"]);
const HIDDEN_PROVIDERS = new Set(["openai-codex", "anthropic"]);

function shouldShowBranch(branch: string | null | undefined): branch is string {
	return !!branch && !HIDDEN_BRANCHES.has(branch);
}

function formatModelLabel(model: ModelInfo): string {
	if (!model) return "no-model";
	if (HIDDEN_PROVIDERS.has(model.provider)) return model.id;
	return `(${model.provider}) ${model.id}`;
}

function joinLeftRight(left: string, right: string, width: number, ellipsis: string): string {
	const leftWidth = visibleWidth(left);
	const rightWidth = visibleWidth(right);

	if (rightWidth >= width) {
		return truncateToWidth(right, width, ellipsis);
	}

	if (leftWidth + 1 + rightWidth <= width) {
		return left + " ".repeat(width - leftWidth - rightWidth) + right;
	}

	const availableLeft = width - rightWidth - 1;
	if (availableLeft <= 0) {
		return truncateToWidth(right, width, ellipsis);
	}

	const truncatedLeft = truncateToWidth(left, availableLeft, ellipsis);
	return truncatedLeft + " ".repeat(Math.max(1, width - visibleWidth(truncatedLeft) - rightWidth)) + right;
}

export default function (pi: ExtensionAPI) {
	let currentModel: ModelInfo = null;

	pi.on("model_select", async (event) => {
		currentModel = {
			id: event.model.id,
			provider: event.model.provider,
			reasoning: event.model.reasoning,
			contextWindow: event.model.contextWindow,
		};
	});

	pi.on("session_start", async (_event, ctx) => {
		currentModel = ctx.model
			? {
				id: ctx.model.id,
				provider: ctx.model.provider,
				reasoning: ctx.model.reasoning,
				contextWindow: ctx.model.contextWindow,
			}
			: null;

		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());
			const ellipsis = theme.fg("dim", "...");

			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					let pwd = homeRelative(ctx.sessionManager.getCwd());
					const branch = footerData.getGitBranch();
					const sessionName = pi.getSessionName();

					if (shouldShowBranch(branch)) pwd += ` (${branch})`;
					if (sessionName) pwd += ` • ${sessionName}`;

					const modelText = formatModelLabel(currentModel);
					const thinkingText = pi.getThinkingLevel();

					const usage = ctx.getContextUsage();
					const contextWindow = usage?.contextWindow ?? currentModel?.contextWindow ?? 0;
					const contextDisplay =
						usage?.percent == null
							? `?/${formatTokens(contextWindow)}`
							: `${usage.percent.toFixed(1)}%/${formatTokens(contextWindow)}`;

					let contextText = theme.fg("dim", contextDisplay);
					if (usage?.percent != null && usage.percent > 90) {
						contextText = theme.fg("error", contextDisplay);
					} else if (usage?.percent != null && usage.percent > 70) {
						contextText = theme.fg("warning", contextDisplay);
					}

					const topLine = joinLeftRight(
						theme.fg("dim", pwd),
						contextText,
						width,
						ellipsis,
					);

					const bottomLine = joinLeftRight(
						theme.fg("dim", modelText),
						theme.fg("dim", thinkingText),
						width,
						ellipsis,
					);

					const extensionStatuses = footerData.getExtensionStatuses();
					if (extensionStatuses.size === 0) {
						return [topLine, bottomLine];
					}

					const statusLine = truncateToWidth(
						Array.from(extensionStatuses.entries())
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([, text]) => sanitizeStatusText(text))
							.join(" "),
						width,
						ellipsis,
					);

					return [statusLine, topLine, bottomLine];
				},
			};
		});
	});
}
