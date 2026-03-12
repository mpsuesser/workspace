/**
 * Presenterm configuration schema.
 *
 * Models the `config.yaml` structure as documented at:
 * https://github.com/mfontanini/presenterm
 * https://raw.githubusercontent.com/mfontanini/presenterm/master/config-file-schema.json
 *
 * All fields are optional — config files are partial overlays.
 */
import * as Schema from 'effect/Schema';

// ---------------------------------------------------------------------------
// Image protocol
// ---------------------------------------------------------------------------

export const ImageProtocol = Schema.Literals([
	'auto',
	'kitty-local',
	'kitty-remote',
	'iterm2',
	'sixel'
]);

// ---------------------------------------------------------------------------
// Defaults section
// ---------------------------------------------------------------------------

/** Default presentation settings. */
export const Defaults = Schema.Struct({
	terminal_font_size: Schema.optional(Schema.Number),
	theme: Schema.optional(Schema.String),
	image_protocol: Schema.optional(ImageProtocol)
});

// ---------------------------------------------------------------------------
// Typst / Mermaid / D2
// ---------------------------------------------------------------------------

export const Typst = Schema.Struct({
	ppi: Schema.optional(Schema.Number)
});

export const Mermaid = Schema.Struct({
	scale: Schema.optional(Schema.Number)
});

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const Options = Schema.Struct({
	implicit_slide_ends: Schema.optional(Schema.Boolean),
	command_prefix: Schema.optional(Schema.String),
	incremental_lists: Schema.optional(Schema.Boolean),
	strict_front_matter_parsing: Schema.optional(Schema.Boolean),
	end_slide_shorthand: Schema.optional(Schema.Boolean)
});

// ---------------------------------------------------------------------------
// Snippet execution
// ---------------------------------------------------------------------------

export const SnippetExec = Schema.Struct({
	enable: Schema.optional(Schema.Boolean)
});

export const SnippetRender = Schema.Struct({
	threads: Schema.optional(Schema.Number)
});

export const Snippet = Schema.Struct({
	exec: Schema.optional(SnippetExec),
	exec_replace: Schema.optional(SnippetExec),
	render: Schema.optional(SnippetRender)
});

// ---------------------------------------------------------------------------
// Speaker notes
// ---------------------------------------------------------------------------

export const SpeakerNotes = Schema.Struct({
	listen_address: Schema.optional(Schema.String),
	publish_address: Schema.optional(Schema.String),
	always_publish: Schema.optional(Schema.Boolean)
});

// ---------------------------------------------------------------------------
// Key bindings
// ---------------------------------------------------------------------------

export const Bindings = Schema.Struct({
	next: Schema.optional(Schema.Array(Schema.String)),
	next_fast: Schema.optional(Schema.Array(Schema.String)),
	previous: Schema.optional(Schema.Array(Schema.String)),
	previous_fast: Schema.optional(Schema.Array(Schema.String)),
	first_slide: Schema.optional(Schema.Array(Schema.String)),
	last_slide: Schema.optional(Schema.Array(Schema.String)),
	go_to_slide: Schema.optional(Schema.Array(Schema.String)),
	execute_code: Schema.optional(Schema.Array(Schema.String)),
	reload: Schema.optional(Schema.Array(Schema.String)),
	toggle_slide_index: Schema.optional(Schema.Array(Schema.String)),
	toggle_bindings: Schema.optional(Schema.Array(Schema.String)),
	close_modal: Schema.optional(Schema.Array(Schema.String)),
	exit: Schema.optional(Schema.Array(Schema.String)),
	suspend: Schema.optional(Schema.Array(Schema.String)),
	skip_pauses: Schema.optional(Schema.Array(Schema.String))
});

// ---------------------------------------------------------------------------
// Top-level config
// ---------------------------------------------------------------------------

/**
 * Complete presenterm `config.yaml` schema.
 *
 * Represents the full structure of a presenterm configuration file.
 */
export class PresentermConfig extends Schema.Class<PresentermConfig>(
	'PresentermConfig'
)({
	defaults: Schema.optional(Defaults),
	typst: Schema.optional(Typst),
	mermaid: Schema.optional(Mermaid),
	options: Schema.optional(Options),
	snippet: Schema.optional(Snippet),
	speaker_notes: Schema.optional(SpeakerNotes),
	bindings: Schema.optional(Bindings)
}) {}

// ---------------------------------------------------------------------------
// Slide front-matter
// ---------------------------------------------------------------------------

/**
 * YAML front-matter for a presenterm markdown file.
 *
 * Placed at the top of the presentation markdown between `---` fences.
 */
export class SlideFrontmatter extends Schema.Class<SlideFrontmatter>(
	'SlideFrontmatter'
)({
	title: Schema.optional(Schema.String),
	sub_title: Schema.optional(Schema.String),
	author: Schema.optional(Schema.String),
	theme: Schema.optional(Schema.String),
	options: Schema.optional(Options)
}) {}
