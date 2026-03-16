ya.ignore({
	"node_modules",
	".git",
	"*.tsbuildinfo",
	".turbo",
	".react-router",
	".gitmodules",
	"bun.lock",
	"package-lock.json",
})

require("no-status"):setup()

local togglepane = require("toggle-pane")
togglepane:entry("min-parent")
togglepane:entry("min-preview")

require("bunny"):setup({
	hops = {
		{ key = "r", path = "~/repos" },
		{ key = "c", path = "~/repos/curationspace" },
		{ key = "e", path = "~/repos/curationspace" },
		{ key = "m", path = "~/repos/multitude" },
		{ key = "w", path = "~/repos/workspace" },

		{ key = "o", path = "~/.config/opencode" },
		{ key = "s", path = "~/.config/opencode/skills" },
		{ key = "y", path = "~/.config/yazi" },
		{ key = "g", path = "~/.config/ghostty" },
		{ key = { "h", "e" }, path = "~/.config/helix" },
		{ key = { "h", "a" }, path = "~/.config/hammerspoon" },

		{ key = { ".", "c" }, path = "~/.config" },
		{ key = { ".", "s" }, path = "~/.state" },
		{ key = { ".", "b" }, path = "~/.bin" },

		{ key = "D", path = "~/Downloads" },
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
