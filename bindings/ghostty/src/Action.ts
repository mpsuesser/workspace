import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

export type AdjustDirection =
	| 'left'
	| 'right'
	| 'up'
	| 'down'
	| 'page_up'
	| 'page_down'
	| 'home'
	| 'end'
	| 'beginning_of_line'
	| 'end_of_line';

export type SplitDirection = 'left' | 'right' | 'up' | 'down' | 'auto';

export type GotoSplitDirection =
	| 'left'
	| 'right'
	| 'up'
	| 'down'
	| 'previous'
	| 'next';

export type WriteFileAction = 'copy' | 'paste' | 'open';

export type InspectorMode = 'toggle' | 'show' | 'hide';

export type CursorKeyMode = 'application' | 'normal';

export type ResizeDirection = 'left' | 'right' | 'up' | 'down';

export const Action = Schema.TaggedUnion({
	CopyToClipboard: {},
	PasteFromClipboard: {},
	PasteFromSelection: {},
	CopyUrlToClipboard: {},
	CopyTitleToClipboard: {},

	IncreaseFontSize: {
		amount: Schema.OptionFromUndefinedOr(Schema.Number)
	},
	DecreaseFontSize: {
		amount: Schema.OptionFromUndefinedOr(Schema.Number)
	},
	ResetFontSize: {},
	SetFontSize: { size: Schema.Number },

	ClearScreen: {},
	SelectAll: {},
	Reset: {},

	ScrollToTop: {},
	ScrollToBottom: {},
	ScrollToSelection: {},
	ScrollPageUp: {},
	ScrollPageDown: {},
	ScrollPageFractional: { fraction: Schema.Number },
	ScrollPageLines: { lines: Schema.Number },

	AdjustSelection: {
		direction: Schema.Literals([
			'left',
			'right',
			'up',
			'down',
			'page_up',
			'page_down',
			'home',
			'end',
			'beginning_of_line',
			'end_of_line'
		])
	},

	JumpToPrompt: { delta: Schema.Number },

	WriteScrollbackFile: {
		action: Schema.Literals(['copy', 'paste', 'open'])
	},
	WriteScreenFile: {
		action: Schema.Literals(['copy', 'paste', 'open'])
	},
	WriteSelectionFile: {
		action: Schema.Literals(['copy', 'paste', 'open'])
	},

	NewWindow: {},
	CloseWindow: {},
	ToggleFullscreen: {},
	ToggleMaximize: {},
	ResetWindowSize: {},
	ToggleWindowFloatOnTop: {},
	ToggleWindowDecorations: {},

	NewTab: {},
	CloseTab: {
		mode: Schema.OptionFromUndefinedOr(Schema.String)
	},
	NextTab: {},
	PreviousTab: {},
	LastTab: {},
	GotoTab: { index: Schema.Number },
	MoveTab: { offset: Schema.Number },
	ToggleTabOverview: {},
	PromptSurfaceTitle: {},

	NewSplit: {
		direction: Schema.Literals(['left', 'right', 'up', 'down', 'auto'])
	},
	GotoSplit: {
		direction: Schema.Literals([
			'left',
			'right',
			'up',
			'down',
			'previous',
			'next'
		])
	},
	ToggleSplitZoom: {},
	ResizeSplit: {
		direction: Schema.Literals(['left', 'right', 'up', 'down']),
		amount: Schema.Number
	},
	EqualizeSplits: {},
	CloseSurface: {},

	ToggleQuickTerminal: {},

	ToggleVisibility: {},

	ReloadConfig: {},
	OpenConfig: {},

	Inspector: {
		mode: Schema.Literals(['toggle', 'show', 'hide'])
	},
	ShowGtkInspector: {},

	Text: { text: Schema.String },
	Csi: { sequence: Schema.String },
	Esc: { sequence: Schema.String },
	CursorKey: {
		mode: Schema.Literals(['application', 'normal'])
	},

	ToggleSecureInput: {},

	ToggleCommandPalette: {},

	Undo: {},
	Redo: {},

	Quit: {},
	Ignore: {},
	Unbind: {}
});

export type Action = typeof Action.Type;

export const actionToKeybindString = Action.match({
	CopyToClipboard: () => 'copy_to_clipboard',
	PasteFromClipboard: () => 'paste_from_clipboard',
	PasteFromSelection: () => 'paste_from_selection',
	CopyUrlToClipboard: () => 'copy_url_to_clipboard',
	CopyTitleToClipboard: () => 'copy_title_to_clipboard',

	IncreaseFontSize: ({ amount }) =>
		Option.match(amount, {
			onNone: () => 'increase_font_size',
			onSome: (a) => `increase_font_size:${a}`
		}),
	DecreaseFontSize: ({ amount }) =>
		Option.match(amount, {
			onNone: () => 'decrease_font_size',
			onSome: (a) => `decrease_font_size:${a}`
		}),
	ResetFontSize: () => 'reset_font_size',
	SetFontSize: ({ size }) => `set_font_size:${size}`,

	ClearScreen: () => 'clear_screen',
	SelectAll: () => 'select_all',
	Reset: () => 'reset',

	ScrollToTop: () => 'scroll_to_top',
	ScrollToBottom: () => 'scroll_to_bottom',
	ScrollToSelection: () => 'scroll_to_selection',
	ScrollPageUp: () => 'scroll_page_up',
	ScrollPageDown: () => 'scroll_page_down',
	ScrollPageFractional: ({ fraction }) =>
		`scroll_page_fractional:${fraction}`,
	ScrollPageLines: ({ lines }) => `scroll_page_lines:${lines}`,

	AdjustSelection: ({ direction }) => `adjust_selection:${direction}`,

	JumpToPrompt: ({ delta }) => `jump_to_prompt:${delta}`,

	WriteScrollbackFile: ({ action }) => `write_scrollback_file:${action}`,
	WriteScreenFile: ({ action }) => `write_screen_file:${action}`,
	WriteSelectionFile: ({ action }) => `write_selection_file:${action}`,

	NewWindow: () => 'new_window',
	CloseWindow: () => 'close_window',
	ToggleFullscreen: () => 'toggle_fullscreen',
	ToggleMaximize: () => 'toggle_maximize',
	ResetWindowSize: () => 'reset_window_size',
	ToggleWindowFloatOnTop: () => 'toggle_window_float_on_top',
	ToggleWindowDecorations: () => 'toggle_window_decorations',

	NewTab: () => 'new_tab',
	CloseTab: ({ mode }) =>
		Option.match(mode, {
			onNone: () => 'close_tab',
			onSome: (m) => `close_tab:${m}`
		}),
	NextTab: () => 'next_tab',
	PreviousTab: () => 'previous_tab',
	LastTab: () => 'last_tab',
	GotoTab: ({ index }) => `goto_tab:${index}`,
	MoveTab: ({ offset }) => `move_tab:${offset}`,
	ToggleTabOverview: () => 'toggle_tab_overview',
	PromptSurfaceTitle: () => 'prompt_surface_title',

	NewSplit: ({ direction }) => `new_split:${direction}`,
	GotoSplit: ({ direction }) => `goto_split:${direction}`,
	ToggleSplitZoom: () => 'toggle_split_zoom',
	ResizeSplit: ({ direction, amount }) =>
		`resize_split:${direction},${amount}`,
	EqualizeSplits: () => 'equalize_splits',
	CloseSurface: () => 'close_surface',

	ToggleQuickTerminal: () => 'toggle_quick_terminal',

	ToggleVisibility: () => 'toggle_visibility',

	ReloadConfig: () => 'reload_config',
	OpenConfig: () => 'open_config',

	Inspector: ({ mode }) => `inspector:${mode}`,
	ShowGtkInspector: () => 'show_gtk_inspector',

	Text: ({ text }) => `text:${text}`,
	Csi: ({ sequence }) => `csi:${sequence}`,
	Esc: ({ sequence }) => `esc:${sequence}`,
	CursorKey: ({ mode }) => `cursor_key:${mode}`,

	ToggleSecureInput: () => 'toggle_secure_input',

	ToggleCommandPalette: () => 'toggle_command_palette',

	Undo: () => 'undo',
	Redo: () => 'redo',

	Quit: () => 'quit',
	Ignore: () => 'ignore',
	Unbind: () => 'unbind'
});
