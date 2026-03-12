import * as Schema from 'effect/Schema';

export class GhosttyNotInstalled extends Schema.TaggedErrorClass<GhosttyNotInstalled>()(
	'GhosttyNotInstalled',
	{
		message: Schema.String
	}
) {}

export class GhosttyNotRunning extends Schema.TaggedErrorClass<GhosttyNotRunning>()(
	'GhosttyNotRunning',
	{
		message: Schema.String
	}
) {}

export class GhosttyCliError extends Schema.TaggedErrorClass<GhosttyCliError>()(
	'GhosttyCliError',
	{
		command: Schema.String,
		exitCode: Schema.Number,
		stderr: Schema.String
	}
) {}

export class GhosttyConfigError extends Schema.TaggedErrorClass<GhosttyConfigError>()(
	'GhosttyConfigError',
	{
		message: Schema.String,
		path: Schema.optional(Schema.String)
	}
) {}

export class GhosttyActionFailed extends Schema.TaggedErrorClass<GhosttyActionFailed>()(
	'GhosttyActionFailed',
	{
		action: Schema.String,
		reason: Schema.String
	}
) {}

export type GhosttyError =
	| GhosttyNotInstalled
	| GhosttyNotRunning
	| GhosttyCliError
	| GhosttyConfigError
	| GhosttyActionFailed;
