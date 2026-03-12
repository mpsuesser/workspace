import * as Schema from 'effect/Schema';

export class HammerspoonNotRunning extends Schema.TaggedErrorClass<HammerspoonNotRunning>()(
	'HammerspoonNotRunning',
	{
		message: Schema.String
	}
) {}

export class HammerspoonCliError extends Schema.TaggedErrorClass<HammerspoonCliError>()(
	'HammerspoonCliError',
	{
		command: Schema.String,
		exitCode: Schema.Number,
		stderr: Schema.String
	}
) {}

export class HammerspoonIpcTimeout extends Schema.TaggedErrorClass<HammerspoonIpcTimeout>()(
	'HammerspoonIpcTimeout',
	{
		message: Schema.String,
		timeoutMs: Schema.Number
	}
) {}

export type HammerspoonError =
	| HammerspoonNotRunning
	| HammerspoonCliError
	| HammerspoonIpcTimeout;
