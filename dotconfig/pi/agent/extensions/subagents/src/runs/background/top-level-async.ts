interface AsyncOverrideParams {
	async?: boolean;
	clarify?: boolean;
}

export function applyForceTopLevelAsyncOverride<T extends AsyncOverrideParams>(
	params: T,
	depth: number,
	forceTopLevelAsync: boolean,
): T {
	if (!(depth === 0 && forceTopLevelAsync)) return params;
	return { ...params, async: true, clarify: false };
}

export interface SupervisorAsyncPromotionInput {
	/** Config opt-out (`autoPromoteSupervisorRunsToAsync`), defaults to enabled. */
	enabled: boolean;
	/** Only top-level (depth 0) runs are promoted; nested children stay as-is. */
	depth: number;
	/** The intercom bridge is active, so children are armed with `contact_supervisor`. */
	intercomBridgeActive: boolean;
	/** Async execution is actually available in this environment. */
	asyncAvailable: boolean;
	/** The run would otherwise execute foreground (blocking the orchestrator). */
	wouldRunForeground: boolean;
	/** Interactive clarify flow — leave it foreground so the user can refine the task. */
	isClarify: boolean;
	/** At least one dispatched agent actually carries `contact_supervisor`. */
	dispatchedAgentsCanContactSupervisor: boolean;
}

/**
 * Decide whether a top-level *foreground* run should be auto-promoted to async.
 *
 * When the intercom bridge is active, dispatched children are armed with
 * `contact_supervisor`, which blocks the child waiting for the supervisor's
 * reply (up to a 10-minute timeout). A foreground run blocks the orchestrator
 * inside this tool call, so it cannot answer until the run returns — the child
 * hangs and times out, and the decision is never actually made. Running async
 * keeps the orchestrator idle and able to reply, so supervisor coordination
 * works. This trades inline foreground results for a free orchestrator, which is
 * the right call precisely when the children can ask the orchestrator questions.
 */
export function shouldPromoteForegroundRunForSupervisor(input: SupervisorAsyncPromotionInput): boolean {
	return input.enabled
		&& input.depth === 0
		&& input.intercomBridgeActive
		&& input.asyncAvailable
		&& input.wouldRunForeground
		&& !input.isClarify
		&& input.dispatchedAgentsCanContactSupervisor;
}
