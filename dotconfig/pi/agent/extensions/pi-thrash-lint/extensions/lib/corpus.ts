/**
 * Corpus loader.
 *
 * Loads parsed sessions + incidents for a set of session files. The set
 * is dep-injected so unit tests can pass fixture paths and the
 * production extension can pass the result of scanning ~/.pi.
 *
 * Caching strategy:
 *   - On disk: a JSON cache at ~/.pi/cache/thrash-lint/index.json keyed
 *     by absolute session path with stored mtimeMs.
 *   - In memory: corpus object returned by buildCorpus is immutable for
 *     the duration of one tool invocation, then dropped.
 *
 * For v0 the cache layer is a stub — we always re-parse. The hook is
 * here so production indexing can swap in lazy incremental loads.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { parseSessionFile } from "./parser.ts";
import { detectIncidents } from "./detect.ts";
import type { Incident, ParsedSession } from "./types.ts";

export interface Corpus {
	sessions: ParsedSession[];
	incidents: Incident[];
	incidentById: Map<string, Incident>;
	sessionByPath: Map<string, ParsedSession>;
}

export interface BuildCorpusOptions {
	sessionFiles: string[];
	/** Optional: skip sessions older than this ms epoch. */
	since_ms?: number;
}

export async function buildCorpus(opts: BuildCorpusOptions): Promise<Corpus> {
	const sessions: ParsedSession[] = [];
	const incidents: Incident[] = [];

	for (const file of opts.sessionFiles) {
		let parsed: ParsedSession;
		try {
			parsed = await parseSessionFile(file);
		} catch {
			continue;
		}
		const headerTs = Date.parse(parsed.session.timestamp);
		if (opts.since_ms && Number.isFinite(headerTs) && headerTs < opts.since_ms) {
			continue;
		}
		sessions.push(parsed);
		for (const inc of detectIncidents(parsed)) {
			incidents.push(inc);
		}
	}

	const incidentById = new Map<string, Incident>();
	for (const inc of incidents) incidentById.set(inc.incident_id, inc);
	const sessionByPath = new Map<string, ParsedSession>();
	for (const s of sessions) sessionByPath.set(s.session.path, s);

	return { sessions, incidents, incidentById, sessionByPath };
}

/**
 * Discover pi session files under ~/.pi/agent/sessions.
 * Production-facing helper used by the extension wrapper.
 */
export async function discoverSessionFiles(opts?: {
	root?: string;
}): Promise<string[]> {
	const root =
		opts?.root ??
		path.join(os.homedir(), ".pi", "agent", "sessions");
	const out: string[] = [];
	let projectDirs: string[];
	try {
		projectDirs = await fs.readdir(root);
	} catch {
		return out;
	}
	for (const dir of projectDirs) {
		const full = path.join(root, dir);
		let entries: string[];
		try {
			const stat = await fs.stat(full);
			if (!stat.isDirectory()) continue;
			entries = await fs.readdir(full);
		} catch {
			continue;
		}
		for (const f of entries) {
			if (f.endsWith(".jsonl")) out.push(path.join(full, f));
		}
	}
	return out;
}
