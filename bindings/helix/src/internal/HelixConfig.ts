/**
 * Helix editor configuration schema.
 *
 * Models the `config.toml` structure as documented at:
 * https://docs.helix-editor.com/configuration.html
 * https://docs.helix-editor.com/editor.html
 * https://docs.helix-editor.com/remapping.html
 *
 * All fields are optional — helix config files are partial overlays
 * merged with built-in defaults.
 *
 * Property names use kebab-case to match the TOML config format directly,
 * so `Schema.decodeUnknownSync(HelixConfig)(parsedToml)` works without
 * any key transformation.
 */
import * as Schema from 'effect/Schema';

// ---------------------------------------------------------------------------
// Shared enums / literals
// ---------------------------------------------------------------------------

/** Line number display mode. */
export const LineNumber = Schema.Literals([
	'absolute',
	'relative'
]);

/** Cursor shape options. */
export const CursorShape = Schema.Literals([
	'block',
	'bar',
	'underline',
	'hidden'
]);

/** Bufferline display mode. */
export const Bufferline = Schema.Literals([
	'always',
	'never',
	'multiple'
]);

/** Line ending format for new documents. */
export const LineEnding = Schema.Literals([
	'native',
	'lf',
	'crlf',
	'ff',
	'cr',
	'nel'
]);

/** Popup border rendering. */
export const PopupBorder = Schema.Literals([
	'popup',
	'menu',
	'all',
	'none'
]);

/** Indentation heuristic. */
export const IndentHeuristic = Schema.Literals([
	'simple',
	'tree-sitter',
	'hybrid'
]);

/** Diagnostic severity levels. */
export const DiagnosticSeverity = Schema.Literals([
	'error',
	'warning',
	'info',
	'hint'
]);

/** Diagnostic severity or disable. */
export const DiagnosticSeverityOrDisable = Schema.Literals([
	'error',
	'warning',
	'info',
	'hint',
	'disable'
]);

/** Whitespace render mode — either a simple string or per-character table. */
export const WhitespaceRenderMode = Schema.Literals([
	'all',
	'none'
]);

/** Gutter types. */
export const GutterType = Schema.Literals([
	'diagnostics',
	'diff',
	'line-numbers',
	'spacer'
]);

/** Built-in clipboard providers. */
export const ClipboardProviderBuiltin = Schema.Literals([
	'pasteboard',
	'wayland',
	'x-clip',
	'x-sel',
	'win-32-yank',
	'termux',
	'tmux',
	'windows',
	'termcode',
	'none'
]);

/** Statusline element names. */
export const StatuslineElement = Schema.Literals([
	'mode',
	'spinner',
	'file-name',
	'file-absolute-path',
	'file-base-name',
	'file-modification-indicator',
	'file-encoding',
	'file-line-ending',
	'file-indent-style',
	'read-only-indicator',
	'total-line-numbers',
	'file-type',
	'diagnostics',
	'workspace-diagnostics',
	'selections',
	'primary-selection-length',
	'position',
	'position-percentage',
	'separator',
	'spacer',
	'version-control',
	'register'
]);

// ---------------------------------------------------------------------------
// Keybinding value — recursive type
// ---------------------------------------------------------------------------

/**
 * A keybinding value in helix config.
 *
 * Can be:
 * - A string: a static command, typable command (`:cmd`), or macro (`@keys`)
 * - An array of strings: a command sequence executed in order
 * - A nested record: a minor mode (sub-keymap)
 */
export type KeybindingValue =
	| string
	| ReadonlyArray<string>
	| {
			readonly [key: string]: KeybindingValue;
	  };

export const KeybindingValue: Schema.Schema<KeybindingValue> = Schema.Union([
	Schema.String,
	Schema.Array(Schema.String),
	Schema.Record(
		Schema.String,
		Schema.suspend((): Schema.Schema<KeybindingValue> => KeybindingValue)
	)
]);

/** A keymap is a record of key names to keybinding values. */
export const Keymap = Schema.Record(Schema.String, KeybindingValue);

// ---------------------------------------------------------------------------
// Editor sub-section schemas
// ---------------------------------------------------------------------------

/** `[editor.statusline]` — configures the bottom status bar. */
export const EditorStatusline = Schema.Struct({
	left: Schema.optional(Schema.Array(StatuslineElement)),
	center: Schema.optional(Schema.Array(StatuslineElement)),
	right: Schema.optional(Schema.Array(StatuslineElement)),
	separator: Schema.optional(Schema.String),
	mode: Schema.optional(
		Schema.Struct({
			normal: Schema.optional(Schema.String),
			insert: Schema.optional(Schema.String),
			select: Schema.optional(Schema.String)
		})
	),
	diagnostics: Schema.optional(Schema.Array(DiagnosticSeverity)),
	'workspace-diagnostics': Schema.optional(Schema.Array(DiagnosticSeverity))
});

/** `[editor.lsp]` — language server protocol integration settings. */
export const EditorLsp = Schema.Struct({
	enable: Schema.optional(Schema.Boolean),
	'display-messages': Schema.optional(Schema.Boolean),
	'display-progress-messages': Schema.optional(Schema.Boolean),
	'auto-signature-help': Schema.optional(Schema.Boolean),
	'display-inlay-hints': Schema.optional(Schema.Boolean),
	'inlay-hints-length-limit': Schema.optional(Schema.Number),
	'display-color-swatches': Schema.optional(Schema.Boolean),
	'display-signature-help-docs': Schema.optional(Schema.Boolean),
	snippets: Schema.optional(Schema.Boolean),
	'goto-reference-include-declaration': Schema.optional(Schema.Boolean)
});

/** `[editor.cursor-shape]` — cursor shape per mode. */
export const EditorCursorShape = Schema.Struct({
	normal: Schema.optional(CursorShape),
	insert: Schema.optional(CursorShape),
	select: Schema.optional(CursorShape)
});

/** `[editor.file-picker]` — file picker and global search settings. */
export const EditorFilePicker = Schema.Struct({
	hidden: Schema.optional(Schema.Boolean),
	'follow-symlinks': Schema.optional(Schema.Boolean),
	'deduplicate-links': Schema.optional(Schema.Boolean),
	parents: Schema.optional(Schema.Boolean),
	ignore: Schema.optional(Schema.Boolean),
	'git-ignore': Schema.optional(Schema.Boolean),
	'git-global': Schema.optional(Schema.Boolean),
	'git-exclude': Schema.optional(Schema.Boolean),
	'max-depth': Schema.optional(Schema.Number)
});

/**
 * `[editor.auto-pairs]` — automatic bracket/quote insertion.
 *
 * Can be `false` to disable, `true` for defaults, or a record mapping
 * opening characters to closing characters.
 */
export const EditorAutoPairs = Schema.Union([
	Schema.Boolean,
	Schema.Record(Schema.String, Schema.String)
]);

/** `[editor.auto-save]` — automatic saving behavior. */
export const EditorAutoSave = Schema.Struct({
	'focus-lost': Schema.optional(Schema.Boolean),
	'after-delay': Schema.optional(
		Schema.Struct({
			enable: Schema.optional(Schema.Boolean),
			timeout: Schema.optional(Schema.Number)
		})
	)
});

/** `[editor.search]` — search behavior. */
export const EditorSearch = Schema.Struct({
	'smart-case': Schema.optional(Schema.Boolean),
	'wrap-around': Schema.optional(Schema.Boolean)
});

/** `[editor.whitespace.render]` — per-character whitespace rendering. */
export const WhitespaceRenderTable = Schema.Struct({
	space: Schema.optional(WhitespaceRenderMode),
	nbsp: Schema.optional(WhitespaceRenderMode),
	nnbsp: Schema.optional(WhitespaceRenderMode),
	tab: Schema.optional(WhitespaceRenderMode),
	newline: Schema.optional(WhitespaceRenderMode)
});

/** `[editor.whitespace.characters]` — literal whitespace characters. */
export const WhitespaceCharacters = Schema.Struct({
	space: Schema.optional(Schema.String),
	nbsp: Schema.optional(Schema.String),
	nnbsp: Schema.optional(Schema.String),
	tab: Schema.optional(Schema.String),
	newline: Schema.optional(Schema.String),
	tabpad: Schema.optional(Schema.String)
});

/** `[editor.whitespace]` — whitespace rendering options. */
export const EditorWhitespace = Schema.Struct({
	render: Schema.optional(
		Schema.Union([
			WhitespaceRenderMode,
			WhitespaceRenderTable
		])
	),
	characters: Schema.optional(WhitespaceCharacters)
});

/** `[editor.indent-guides]` — vertical indent guide rendering. */
export const EditorIndentGuides = Schema.Struct({
	render: Schema.optional(Schema.Boolean),
	character: Schema.optional(Schema.String),
	'skip-levels': Schema.optional(Schema.Number)
});

/** `[editor.gutters.line-numbers]` — line number gutter options. */
export const GutterLineNumbers = Schema.Struct({
	'min-width': Schema.optional(Schema.Number)
});

/** `[editor.gutters]` — gutter configuration (detailed form). */
export const EditorGutters = Schema.Struct({
	layout: Schema.optional(Schema.Array(GutterType)),
	'line-numbers': Schema.optional(GutterLineNumbers)
});

/** `[editor.soft-wrap]` — soft line wrapping. */
export const EditorSoftWrap = Schema.Struct({
	enable: Schema.optional(Schema.Boolean),
	'max-wrap': Schema.optional(Schema.Number),
	'max-indent-retain': Schema.optional(Schema.Number),
	'wrap-indicator': Schema.optional(Schema.String),
	'wrap-at-text-width': Schema.optional(Schema.Boolean)
});

/** `[editor.smart-tab]` — tab key behavior. */
export const EditorSmartTab = Schema.Struct({
	enable: Schema.optional(Schema.Boolean),
	'supersede-menu': Schema.optional(Schema.Boolean)
});

/** `[editor.inline-diagnostics]` — inline diagnostic rendering. */
export const EditorInlineDiagnostics = Schema.Struct({
	'cursor-line': Schema.optional(DiagnosticSeverityOrDisable),
	'other-lines': Schema.optional(DiagnosticSeverityOrDisable),
	'prefix-len': Schema.optional(Schema.Number),
	'max-wrap': Schema.optional(Schema.Number),
	'max-diagnostics': Schema.optional(Schema.Number)
});

/** Custom clipboard provider command. */
export const ClipboardCommand = Schema.Struct({
	command: Schema.String,
	args: Schema.optional(Schema.Array(Schema.String))
});

/** `[editor.clipboard-provider.custom]` — custom clipboard commands. */
export const ClipboardProviderCustom = Schema.Struct({
	custom: Schema.Struct({
		yank: ClipboardCommand,
		paste: ClipboardCommand,
		'primary-yank': Schema.optional(ClipboardCommand),
		'primary-paste': Schema.optional(ClipboardCommand)
	})
});

/**
 * Clipboard provider — either a built-in name string or a custom command table.
 */
export const ClipboardProvider = Schema.Union([
	ClipboardProviderBuiltin,
	ClipboardProviderCustom
]);

// ---------------------------------------------------------------------------
// Editor section
// ---------------------------------------------------------------------------

/**
 * `[editor]` — the main editor configuration section.
 *
 * All fields are optional as helix config files are partial overlays.
 * Documented at: https://docs.helix-editor.com/editor.html
 */
export const Editor = Schema.Struct({
	scrolloff: Schema.optional(Schema.Number),
	mouse: Schema.optional(Schema.Boolean),
	'default-yank-register': Schema.optional(Schema.String),
	'middle-click-paste': Schema.optional(Schema.Boolean),
	'scroll-lines': Schema.optional(Schema.Number),
	shell: Schema.optional(Schema.Array(Schema.String)),
	'line-number': Schema.optional(LineNumber),
	cursorline: Schema.optional(Schema.Boolean),
	cursorcolumn: Schema.optional(Schema.Boolean),
	'continue-comments': Schema.optional(Schema.Boolean),
	gutters: Schema.optional(
		Schema.Union([
			Schema.Array(GutterType),
			EditorGutters
		])
	),
	'auto-completion': Schema.optional(Schema.Boolean),
	'path-completion': Schema.optional(Schema.Boolean),
	'auto-format': Schema.optional(Schema.Boolean),
	'idle-timeout': Schema.optional(Schema.Number),
	'completion-timeout': Schema.optional(Schema.Number),
	'preview-completion-insert': Schema.optional(Schema.Boolean),
	'completion-trigger-len': Schema.optional(Schema.Number),
	'completion-replace': Schema.optional(Schema.Boolean),
	'auto-info': Schema.optional(Schema.Boolean),
	'true-color': Schema.optional(Schema.Boolean),
	undercurl: Schema.optional(Schema.Boolean),
	rulers: Schema.optional(Schema.Array(Schema.Number)),
	bufferline: Schema.optional(Bufferline),
	'color-modes': Schema.optional(Schema.Boolean),
	'text-width': Schema.optional(Schema.Number),
	'workspace-lsp-roots': Schema.optional(Schema.Array(Schema.String)),
	'default-line-ending': Schema.optional(LineEnding),
	'insert-final-newline': Schema.optional(Schema.Boolean),
	'atomic-save': Schema.optional(Schema.Boolean),
	'trim-final-newlines': Schema.optional(Schema.Boolean),
	'trim-trailing-whitespace': Schema.optional(Schema.Boolean),
	'popup-border': Schema.optional(PopupBorder),
	'indent-heuristic': Schema.optional(IndentHeuristic),
	'jump-label-alphabet': Schema.optional(Schema.String),
	'end-of-line-diagnostics': Schema.optional(DiagnosticSeverityOrDisable),
	'clipboard-provider': Schema.optional(ClipboardProvider),
	'editor-config': Schema.optional(Schema.Boolean),

	// Sub-sections
	statusline: Schema.optional(EditorStatusline),
	lsp: Schema.optional(EditorLsp),
	'cursor-shape': Schema.optional(EditorCursorShape),
	'file-picker': Schema.optional(EditorFilePicker),
	'auto-pairs': Schema.optional(EditorAutoPairs),
	'auto-save': Schema.optional(EditorAutoSave),
	search: Schema.optional(EditorSearch),
	whitespace: Schema.optional(EditorWhitespace),
	'indent-guides': Schema.optional(EditorIndentGuides),
	'soft-wrap': Schema.optional(EditorSoftWrap),
	'smart-tab': Schema.optional(EditorSmartTab),
	'inline-diagnostics': Schema.optional(EditorInlineDiagnostics)
});

// ---------------------------------------------------------------------------
// Keys section
// ---------------------------------------------------------------------------

/**
 * `[keys]` — keybinding configuration.
 *
 * Each mode (`normal`, `insert`, `select`) maps key names to keybinding values.
 * Key names can be literal characters, special names (`ret`, `space`, `esc`, etc.),
 * or modifier combos (`C-s`, `A-x`, `C-S-esc`, `Cmd-s`).
 *
 * Documented at: https://docs.helix-editor.com/remapping.html
 */
export const Keys = Schema.Struct({
	normal: Schema.optional(Keymap),
	insert: Schema.optional(Keymap),
	select: Schema.optional(Keymap)
});

// ---------------------------------------------------------------------------
// Top-level config
// ---------------------------------------------------------------------------

/**
 * Complete Helix `config.toml` schema.
 *
 * Represents the full structure of a Helix configuration file.
 * All fields are optional — config files are partial overlays merged
 * with built-in defaults.
 *
 * Usage with parsed TOML:
 * ```ts
 * import * as TOML from 'smol-toml';
 * const parsed = TOML.parse(tomlString);
 * const config = Schema.decodeUnknownSync(HelixConfig)(parsed);
 * ```
 */
export class HelixConfig extends Schema.Class<HelixConfig>('HelixConfig')({
	theme: Schema.optional(Schema.String),
	editor: Schema.optional(Editor),
	keys: Schema.optional(Keys)
}) {}
