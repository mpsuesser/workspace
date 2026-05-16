/**
 * thrash_cluster — group incidents by a fixed key and report counts.
 *
 * DX:
 *   - Closed enum of group_by keys: "signal" | "tool" | "file_extension" | "file_glob" | "project".
 *   - Each group: { key, count, sample_incident_ids (≤3), representative_summary }.
 *   - Sorted by count desc.
 */
import type { Corpus } from "../lib/corpus.ts";
import type { Incident, SignalKind } from "../lib/types.ts";

const GROUP_BY = ["signal", "tool", "file_extension", "file_glob", "project"] as const;
export type ClusterGroupBy = (typeof GROUP_BY)[number];

export interface ClusterInput {
	group_by: ClusterGroupBy;
	signals?: SignalKind[];
	project?: string;
	limit?: number;
}

export interface ClusterGroup {
	key: string;
	count: number;
	sample_incident_ids: string[];
	representative_summary: string;
}

export interface ClusterOutput {
	group_by: ClusterGroupBy;
	groups: ClusterGroup[];
	total_incidents: number;
}

export async function runThrashCluster(
	input: ClusterInput,
	corpus: Corpus,
): Promise<ClusterOutput> {
	if (!GROUP_BY.includes(input.group_by)) {
		throw new Error(
			`invalid group_by '${input.group_by}'. Expected one of: ${GROUP_BY.join(", ")}`,
		);
	}
	const limit = input.limit ?? 20;

	const filtered = corpus.incidents.filter((inc) => {
		if (input.signals && !input.signals.some((s) => inc.signals[s] > 0)) return false;
		if (input.project && !inc.project.includes(input.project)) return false;
		return true;
	});

	const groups = new Map<string, Incident[]>();
	for (const inc of filtered) {
		for (const key of keysFor(inc, input.group_by)) {
			let arr = groups.get(key);
			if (!arr) {
				arr = [];
				groups.set(key, arr);
			}
			arr.push(inc);
		}
	}

	const out: ClusterGroup[] = [];
	for (const [key, members] of groups) {
		members.sort((a, b) => b.score - a.score);
		out.push({
			key,
			count: members.length,
			sample_incident_ids: members.slice(0, 3).map((m) => m.incident_id),
			representative_summary: representativeFor(input.group_by, key, members),
		});
	}
	out.sort((a, b) => b.count - a.count);

	return {
		group_by: input.group_by,
		groups: out.slice(0, limit),
		total_incidents: filtered.length,
	};
}

function keysFor(inc: Incident, group_by: ClusterGroupBy): string[] {
	switch (group_by) {
		case "signal": {
			const out: string[] = [];
			for (const [sig, count] of Object.entries(inc.signals)) {
				if (count > 0) out.push(sig);
			}
			return out;
		}
		case "tool": {
			const out = new Set<string>();
			for (const h of inc.hits) if (h.tool_name) out.add(h.tool_name);
			return [...out];
		}
		case "file_extension": {
			const out = new Set<string>();
			for (const p of inc.file_paths) {
				const m = /(\.[A-Za-z0-9]+)$/.exec(p);
				if (m) out.add(m[1]!.toLowerCase());
				else out.add("(no-ext)");
			}
			return [...out];
		}
		case "file_glob": {
			const out = new Set<string>();
			for (const p of inc.file_paths) out.add(globKey(p));
			return [...out];
		}
		case "project":
			return [inc.project];
	}
}

/**
 * Build a summary that reflects the GROUP key, not just the top incident.
 * Otherwise a `read_edit_loop` cluster might be summarised as a bash retry
 * because its top-scoring incident happened to be primarily a bash retry.
 */
function representativeFor(
	group_by: ClusterGroupBy,
	key: string,
	members: Incident[],
): string {
	if (group_by === "signal") {
		// Pick the member with the highest count of THIS signal, and re-summarise
		// with this signal in front.
		const best = [...members].sort(
			(a, b) =>
				(b.signals[key as SignalKind] ?? 0) - (a.signals[key as SignalKind] ?? 0),
		)[0];
		if (!best) return "";
		const hits = best.signals[key as SignalKind] ?? 0;
		const file = best.file_paths[0];
		const loc = file ? ` on ${shortPath(file)}` : "";
		return `${hits}× ${key}${loc}`;
	}
	if (group_by === "tool") {
		const best = members[0];
		if (!best) return "";
		return `${best.tool_calls} tool calls including ${key}; ${best.summary}`;
	}
	return members[0]?.summary ?? "";
}

function shortPath(p: string): string {
	const parts = p.split("/").filter(Boolean);
	return parts.slice(-2).join("/");
}

function globKey(p: string): string {
	const parts = p.split("/").filter(Boolean);
	if (parts.length === 0) return "(empty)";
	const file = parts[parts.length - 1]!;
	const ext = /(\.[A-Za-z0-9]+)$/.exec(file)?.[1]?.toLowerCase() ?? "";
	const dir = parts.slice(0, -1).slice(-1).join("/") || "(root)";
	return `${dir}/*${ext}`;
}
