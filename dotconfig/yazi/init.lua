require("no-status"):setup()

local togglepane = require("toggle-pane")
togglepane:entry("min-parent")
togglepane:entry("min-preview")

require("bunny"):setup({
	hops = {
		{ key = "c", path = "~/curationspace" },

		{ key = "e", path = "~/multitude" },

		{ key = "9", path = "~/multitude/99e" },
		{ key = "p", path = "~/multitude/packages" },
		{ key = "o", path = "~/multitude/.opencode" },
		{ key = "a", path = "~/multitude/.opencode/agents" },
		{ key = "s", path = "~/multitude/.opencode/skills" },
		{ key = "m", path = "~/multitude/.opencode/memories" },
		{ key = "t", path = "~/multitude/.opencode/tool" },

		{ key = "y", path = "~/multitude/bindings/yazi/dotconfig" },

		{ key = { "h", "e" }, path = "~/multitude/packages/helix/dotconfig" },
		{ key = { "h", "a" }, path = "~/multitude/packages/hammerspoon/dotconfig" },

		{ key = "g", path = "~/.config/ghostty" },

		{ key = "w", path = "~/" },
		{ key = "D", path = "~/Downloads" },

		{ key = "_", path = "~/_" },
		{ key = "3", path = "~/_/3core" },

		{ key = { ".", "c" }, path = "~/.config" },
		{ key = { ".", "s" }, path = "~/.state" },
		{ key = { ".", "b" }, path = "~/.bin" },
	},

	tabs = true,
	notify = true
})

require("yatline"):setup({
	--theme = my_theme,
	section_separator = { open = "", close = "" },
	part_separator = { open = "", close = "" },
	inverse_separator = { open = "", close = "" },

	style_a = {
		fg = "black",
		bg_mode = {
			normal = "white",
			select = "brightyellow",
			un_set = "brightred"
		}
	},
	style_b = { bg = "brightblack", fg = "brightwhite" },
	style_c = { bg = "black", fg = "brightwhite" },

	permissions_t_fg = "green",
	permissions_r_fg = "yellow",
	permissions_w_fg = "red",
	permissions_x_fg = "cyan",
	permissions_s_fg = "white",

	tab_width = 20,
	tab_use_inverse = false,

	selected = { icon = "󰻭", fg = "yellow" },
	copied = { icon = "", fg = "green" },
	cut = { icon = "", fg = "red" },

	total = { icon = "󰮍", fg = "yellow" },
	succ = { icon = "", fg = "green" },
	fail = { icon = "", fg = "red" },
	found = { icon = "󰮕", fg = "blue" },
	processed = { icon = "󰐍", fg = "green" },

	show_background = true,

	display_header_line = false,
	display_status_line = false,

	component_positions = { "header", "tab", "status" },

	header_line = {
		left = {
			section_a = {
        			{type = "line", custom = false, name = "tabs", params = {"left"}},
			},
			section_b = {
			},
			section_c = {
			}
		},
		right = {
			section_a = {
        			{type = "string", custom = false, name = "date", params = {"%A, %d %B %Y"}},
			},
			section_b = {
        			{type = "string", custom = false, name = "date", params = {"%X"}},
			},
			section_c = {
			}
		}
	}
})
