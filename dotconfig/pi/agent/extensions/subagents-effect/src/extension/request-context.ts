import { pipe } from "effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { SessionFile } from "../domain/ids.ts";

export interface RequestContextSource {
	readonly cwd: string;
	readonly hasUI: boolean;
	readonly signal?: AbortSignal | undefined;
	readonly sessionManager?: {
		readonly getSessionFile?: () => string | undefined;
	} | undefined;
}

export interface RequestContext {
	readonly cwd: string;
	readonly hasUI: boolean;
	readonly signal: Option.Option<AbortSignal>;
	readonly sessionFile: Option.Option<SessionFile>;
}

const decodeSessionFileOption = Schema.decodeUnknownOption(SessionFile);

export const makeRequestContext = (
	source: RequestContextSource,
	signal?: AbortSignal
): RequestContext => ({
	cwd: source.cwd,
	hasUI: source.hasUI,
	signal: Option.fromNullishOr(signal ?? source.signal),
	sessionFile: pipe(
		Option.fromNullishOr(source.sessionManager?.getSessionFile?.()),
		Option.flatMap(decodeSessionFileOption)
	)
});
