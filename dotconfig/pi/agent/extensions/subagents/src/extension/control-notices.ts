import * as fs from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { controlNotificationKey, formatControlNoticeMessage } from "../runs/shared/subagent-control.ts";
import { hasTerminalRun, isTerminalRunState } from "../runs/background/recent-terminal-runs.ts";
import { readStatus } from "../shared/utils.ts";
import type { ControlEvent, SubagentState } from "../shared/types.ts";

/**
 * Reads the current persisted state of an async run directory. Injectable so the
 * delivery gate can be unit-tested without touching the filesystem.
 */
export type AsyncRunStateProbe = (asyncDir: string) => { exists: boolean; state?: string };

const defaultAsyncRunStateProbe: AsyncRunStateProbe = (asyncDir) => {
	if (!fs.existsSync(asyncDir)) return { exists: false };
	return { exists: true, state: readStatus(asyncDir)?.state };
};

function asyncJobShowsProgressAfterIdleEvent(state: SubagentState, event: ControlEvent): boolean {
	if (event.reason !== "idle") return false;
	const job = state.asyncJobs.get(event.runId);
	if (!job) return false;
	const step = event.index !== undefined ? job.steps?.find((candidate) => candidate.index === event.index) ?? job.steps?.[event.index] : undefined;
	const lastActivityAt = Math.max(job.lastActivityAt ?? 0, step?.lastActivityAt ?? 0);
	if (lastActivityAt > event.ts) return true;
	const activityState = step?.activityState ?? job.activityState;
	return job.status === "running" && lastActivityAt > 0 && activityState !== "needs_attention" && lastActivityAt >= event.ts;
}

/**
 * Decides whether an async control notice is still worth waking the orchestrator
 * for. We only deliver when there is no positive evidence that the run already
 * finished — `completion_guard` failure notices are always delivered because
 * they tell the orchestrator a subagent failed and needs follow-up.
 *
 * This is the fix for the dominant orchestration complaint: stale
 * "needs attention" notices firing for runs that already completed.
 */
export function isAsyncNoticeStillActionable(
	state: SubagentState,
	details: SubagentControlMessageDetails,
	probe: AsyncRunStateProbe = defaultAsyncRunStateProbe,
): boolean {
	const event = details.event;
	if (!event) return false;
	if (event.reason === "completion_guard") return true;
	const job = state.asyncJobs.get(event.runId);
	if (job && isTerminalRunState(job.status)) return false;
	if (asyncJobShowsProgressAfterIdleEvent(state, event)) return false;
	if (hasTerminalRun(state, event.runId)) return false;
	if (details.asyncDir) {
		const probed = probe(details.asyncDir);
		if (!probed.exists) return false;
		if (isTerminalRunState(probed.state)) return false;
	}
	return true;
}

export const SUBAGENT_CONTROL_MESSAGE_TYPE = "subagent_control_notice";

export interface SubagentControlMessageDetails {
	event: ControlEvent;
	source?: "foreground" | "async";
	asyncDir?: string;
	childIntercomTarget?: string;
	noticeText?: string;
}

export function controlNoticeTarget(details: SubagentControlMessageDetails): string | undefined {
	return details.childIntercomTarget;
}

export function formatSubagentControlNotice(details: SubagentControlMessageDetails, content?: string): string {
	return details.noticeText ?? content ?? formatControlNoticeMessage(details.event, controlNoticeTarget(details));
}

function noticeTimerKey(details: SubagentControlMessageDetails): string {
	const childIntercomTarget = controlNoticeTarget(details);
	return `${details.event.runId}:${controlNotificationKey(details.event, childIntercomTarget)}`;
}

export function clearPendingForegroundControlNotices(state: SubagentState, runId?: string): void {
	const pending = state.pendingForegroundControlNotices;
	if (!pending) return;
	for (const [key, timer] of pending) {
		if (runId !== undefined && !key.startsWith(`${runId}:`)) continue;
		clearTimeout(timer);
		pending.delete(key);
	}
}

function deliverControlNotice(input: {
	pi: Pick<ExtensionAPI, "sendMessage">;
	visibleControlNotices: Set<string>;
	details: SubagentControlMessageDetails;
}): void {
	const childIntercomTarget = controlNoticeTarget(input.details);
	const key = controlNotificationKey(input.details.event, childIntercomTarget);
	if (input.visibleControlNotices.has(key)) return;
	input.visibleControlNotices.add(key);
	const noticeText = input.details.noticeText ?? formatControlNoticeMessage(input.details.event, childIntercomTarget);
	input.pi.sendMessage(
		{
			customType: SUBAGENT_CONTROL_MESSAGE_TYPE,
			content: noticeText,
			display: true,
			details: { ...input.details, childIntercomTarget, noticeText },
		},
		{ triggerTurn: input.details.source !== "foreground" },
	);
}

function isForegroundNoticeStillActionable(state: SubagentState, details: SubagentControlMessageDetails): boolean {
	const control = state.foregroundControls.get(details.event.runId);
	if (!control) return false;
	if (control.currentAgent && control.currentAgent !== details.event.agent) return false;
	if (details.event.index !== undefined && control.currentIndex !== details.event.index) return false;
	return control.currentActivityState === "needs_attention";
}

export function handleSubagentControlNotice(input: {
	pi: Pick<ExtensionAPI, "sendMessage">;
	state: SubagentState;
	visibleControlNotices: Set<string>;
	details: SubagentControlMessageDetails;
	foregroundDelayMs?: number;
	asyncRunStateProbe?: AsyncRunStateProbe;
}): void {
	if (!input.details?.event || input.details.event.type === "active_long_running") return;
	if (input.details.source !== "foreground") {
		if (!isAsyncNoticeStillActionable(input.state, input.details, input.asyncRunStateProbe)) return;
		deliverControlNotice(input);
		return;
	}

	const pending = input.state.pendingForegroundControlNotices ?? new Map<string, ReturnType<typeof setTimeout>>();
	input.state.pendingForegroundControlNotices = pending;
	const timerKey = noticeTimerKey(input.details);
	const existing = pending.get(timerKey);
	if (existing) clearTimeout(existing);
	const timer = setTimeout(() => {
		pending.delete(timerKey);
		if (!isForegroundNoticeStillActionable(input.state, input.details)) return;
		deliverControlNotice(input);
	}, input.foregroundDelayMs ?? 1000);
	timer.unref?.();
	pending.set(timerKey, timer);
}
