local M = {}

M._last_theme = nil
M._last_opts = nil
M._expected_bg = nil

local applying = false

local function clamp(n)
  return math.max(0, math.min(255, math.floor(n + 0.5)))
end

local function hex_to_rgb(hex)
  local value = hex:gsub('#', '')
  return tonumber(value:sub(1, 2), 16), tonumber(value:sub(3, 4), 16), tonumber(value:sub(5, 6), 16)
end

local function rgb_to_hex(r, g, b)
  return string.format('#%02x%02x%02x', clamp(r), clamp(g), clamp(b))
end

local function mix(color1, color2, weight_to_first)
  local r1, g1, b1 = hex_to_rgb(color1)
  local r2, g2, b2 = hex_to_rgb(color2)
  return rgb_to_hex(
    r1 * weight_to_first + r2 * (1 - weight_to_first),
    g1 * weight_to_first + g2 * (1 - weight_to_first),
    b1 * weight_to_first + b2 * (1 - weight_to_first)
  )
end

local function luminance(hex)
  local r, g, b = hex_to_rgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
end

local function is_light_bg(hex)
  return luminance(hex) > 0.5
end

local function best_contrast(bg, option1, option2)
  local bg_luminance = luminance(bg)
  local diff1 = math.abs(luminance(option1) - bg_luminance)
  local diff2 = math.abs(luminance(option2) - bg_luminance)
  if diff1 >= diff2 then
    return option1
  end
  return option2
end

local function set_hl(group, opts)
  if not opts then
    return
  end
  vim.api.nvim_set_hl(0, group, opts)
end

local function link_hl(group, target)
  vim.api.nvim_set_hl(0, group, { link = target })
end

local function set_terminal_colors(palette)
  for i = 0, 15 do
    vim.g['terminal_color_' .. i] = palette[i]
  end
end

local function build_semantic_theme(theme, opts)
  opts = opts or {}
  local overrides = opts.overrides or {}

  local bg = theme.background or '#000000'
  local fg = theme.foreground or '#ffffff'

  local palette = {}
  for i = 0, 15 do
    palette[i] = theme.palette[i] or (i < 8 and '#000000' or '#ffffff')
  end

  local semantic = {
    bg = bg,
    fg = fg,
    is_light = is_light_bg(bg),
    palette = palette,

    error = palette[1] or '#cc6666',
    success = palette[2] or '#98c379',
    warning = palette[3] or '#e5c07b',
    link = palette[4] or '#61afef',
    accent = palette[5] or '#c678dd',
    accent_alt = palette[6] or '#56b6c2',
  }

  semantic.muted = mix(fg, bg, 0.45)
  semantic.dim = mix(fg, bg, 0.35)
  semantic.border = mix(fg, bg, 0.22)
  semantic.border_strong = mix(fg, bg, 0.32)

  semantic.surface = mix(fg, bg, 0.05)
  semantic.surface_elevated = mix(fg, bg, 0.08)
  semantic.float_bg = mix(fg, bg, 0.06)
  semantic.popup_bg = mix(fg, bg, 0.08)
  semantic.active_bg = theme.selection_background or mix(fg, bg, 0.16)
  semantic.active_fg = theme.selection_foreground or best_contrast(semantic.active_bg, fg, bg)
  semantic.cursorline_bg = overrides.cursor_line or semantic.surface
  semantic.cursor_bg = theme.cursor_color or semantic.accent
  semantic.cursor_fg = theme.cursor_text or best_contrast(semantic.cursor_bg, fg, bg)

  semantic.search_bg = mix(semantic.warning, bg, 0.55)
  semantic.search_fg = best_contrast(semantic.search_bg, fg, bg)
  semantic.cur_search_bg = mix(semantic.accent, bg, 0.62)
  semantic.cur_search_fg = best_contrast(semantic.cur_search_bg, fg, bg)

  semantic.error_bg = mix(semantic.error, bg, 0.14)
  semantic.success_bg = mix(semantic.success, bg, 0.14)
  semantic.warning_bg = mix(semantic.warning, bg, 0.14)
  semantic.info_bg = mix(semantic.link, bg, 0.14)
  semantic.accent_bg = mix(semantic.accent, bg, 0.14)
  semantic.accent_alt_bg = mix(semantic.accent_alt, bg, 0.14)

  return semantic
end

local function apply_base_groups(c)
  vim.o.termguicolors = true
  vim.cmd('highlight clear')
  if vim.fn.exists('syntax_on') == 1 then
    vim.cmd('syntax reset')
  end
  vim.cmd('noautocmd set background=' .. (c.is_light and 'light' or 'dark'))
  set_terminal_colors(c.palette)

  set_hl('Normal', { fg = c.fg, bg = c.bg })
  set_hl('NormalNC', { fg = c.fg, bg = c.bg })
  set_hl('NormalFloat', { fg = c.fg, bg = c.float_bg })
  set_hl('FloatBorder', { fg = c.border_strong, bg = c.float_bg })
  set_hl('FloatTitle', { fg = c.accent, bg = c.float_bg, bold = true })

  set_hl('Cursor', { fg = c.cursor_fg, bg = c.cursor_bg })
  set_hl('lCursor', { fg = c.cursor_fg, bg = c.cursor_bg })
  set_hl('CursorIM', { fg = c.cursor_fg, bg = c.cursor_bg })
  set_hl('CursorLine', { bg = c.cursorline_bg })
  set_hl('CursorColumn', { bg = c.surface })
  set_hl('ColorColumn', { bg = c.surface })
  set_hl('CursorLineNr', { fg = c.fg, bg = c.cursorline_bg, bold = true })
  set_hl('LineNr', { fg = c.dim, bg = c.bg })

  set_hl('Visual', { fg = c.active_fg, bg = c.active_bg })
  set_hl('VisualNOS', { fg = c.active_fg, bg = c.active_bg })
  set_hl('Search', { fg = c.search_fg, bg = c.search_bg })
  set_hl('CurSearch', { fg = c.cur_search_fg, bg = c.cur_search_bg })
  set_hl('IncSearch', { fg = c.cur_search_fg, bg = c.cur_search_bg })
  set_hl('Substitute', { fg = c.cur_search_fg, bg = c.cur_search_bg })
  set_hl('MatchParen', { fg = c.accent_alt, bg = c.surface_elevated, bold = true })

  set_hl('Pmenu', { fg = c.fg, bg = c.popup_bg })
  set_hl('PmenuSel', { fg = c.active_fg, bg = c.active_bg })
  set_hl('PmenuSbar', { bg = c.surface_elevated })
  set_hl('PmenuThumb', { bg = c.border_strong })
  set_hl('WildMenu', { fg = c.active_fg, bg = c.active_bg })

  set_hl('StatusLine', { fg = c.fg, bg = c.surface })
  set_hl('StatusLineNC', { fg = c.muted, bg = c.surface })
  set_hl('WinBar', { fg = c.fg, bg = c.surface })
  set_hl('WinBarNC', { fg = c.muted, bg = c.surface })
  set_hl('TabLineFill', { fg = c.muted, bg = c.surface })
  set_hl('TabLine', { fg = c.muted, bg = c.surface })
  set_hl('TabLineSel', { fg = c.active_fg, bg = c.active_bg })

  set_hl('VertSplit', { fg = c.border, bg = c.bg })
  set_hl('WinSeparator', { fg = c.border, bg = c.bg })
  set_hl('SignColumn', { fg = c.fg, bg = c.bg })
  set_hl('FoldColumn', { fg = c.muted, bg = c.bg })
  set_hl('Folded', { fg = c.muted, bg = c.surface })

  set_hl('Title', { fg = c.accent, bold = true })
  set_hl('Directory', { fg = c.link })
  set_hl('Question', { fg = c.link })
  set_hl('MoreMsg', { fg = c.success })
  set_hl('ModeMsg', { fg = c.accent })
  set_hl('WarningMsg', { fg = c.warning })
  set_hl('ErrorMsg', { fg = c.error })
  set_hl('MsgSeparator', { fg = c.border })
  set_hl('MsgArea', { fg = c.fg, bg = c.bg })
  set_hl('QuickFixLine', { fg = c.active_fg, bg = c.active_bg })

  set_hl('NonText', { fg = c.dim })
  set_hl('EndOfBuffer', { fg = c.dim })
  set_hl('Whitespace', { fg = c.dim })
  set_hl('SpecialKey', { fg = c.dim })
  set_hl('Conceal', { fg = c.muted })

  set_hl('Bold', { bold = true })
  set_hl('Italic', { italic = true })
  set_hl('Underlined', { fg = c.link, underline = true })

  set_hl('SpellBad', { undercurl = true, sp = c.error })
  set_hl('SpellCap', { undercurl = true, sp = c.warning })
  set_hl('SpellRare', { undercurl = true, sp = c.accent })
  set_hl('SpellLocal', { undercurl = true, sp = c.accent_alt })

  set_hl('Error', { fg = c.error })
  set_hl('Todo', { fg = c.warning, bg = c.warning_bg, bold = true })

  set_hl('Comment', { fg = c.muted, italic = true })
  set_hl('SpecialComment', { fg = c.dim, italic = true })
  set_hl('Constant', { fg = c.accent })
  set_hl('String', { fg = c.success })
  set_hl('Character', { fg = c.success })
  set_hl('Number', { fg = c.accent })
  set_hl('Boolean', { fg = c.accent })
  set_hl('Float', { fg = c.accent })
  set_hl('Identifier', { fg = c.accent_alt })
  set_hl('Function', { fg = c.link })
  set_hl('Statement', { fg = c.accent })
  set_hl('Conditional', { fg = c.accent })
  set_hl('Repeat', { fg = c.accent })
  set_hl('Label', { fg = c.accent })
  set_hl('Operator', { fg = c.fg })
  set_hl('Keyword', { fg = c.accent })
  set_hl('Exception', { fg = c.error })
  set_hl('PreProc', { fg = c.warning })
  set_hl('Include', { fg = c.link })
  set_hl('Define', { fg = c.warning })
  set_hl('Macro', { fg = c.warning })
  set_hl('PreCondit', { fg = c.warning })
  set_hl('Type', { fg = c.accent_alt })
  set_hl('StorageClass', { fg = c.accent_alt })
  set_hl('Structure', { fg = c.accent_alt })
  set_hl('Typedef', { fg = c.accent_alt })
  set_hl('Special', { fg = c.accent_alt })
  set_hl('SpecialChar', { fg = c.warning })
  set_hl('Tag', { fg = c.link })
  set_hl('Delimiter', { fg = c.muted })
  set_hl('Debug', { fg = c.error })

  set_hl('DiagnosticError', { fg = c.error })
  set_hl('DiagnosticWarn', { fg = c.warning })
  set_hl('DiagnosticInfo', { fg = c.link })
  set_hl('DiagnosticHint', { fg = c.accent_alt })
  set_hl('DiagnosticOk', { fg = c.success })

  set_hl('DiagnosticSignError', { fg = c.error, bg = c.bg })
  set_hl('DiagnosticSignWarn', { fg = c.warning, bg = c.bg })
  set_hl('DiagnosticSignInfo', { fg = c.link, bg = c.bg })
  set_hl('DiagnosticSignHint', { fg = c.accent_alt, bg = c.bg })
  set_hl('DiagnosticSignOk', { fg = c.success, bg = c.bg })

  set_hl('DiagnosticVirtualTextError', { fg = c.error, bg = c.error_bg })
  set_hl('DiagnosticVirtualTextWarn', { fg = c.warning, bg = c.warning_bg })
  set_hl('DiagnosticVirtualTextInfo', { fg = c.link, bg = c.info_bg })
  set_hl('DiagnosticVirtualTextHint', { fg = c.accent_alt, bg = c.accent_alt_bg })
  set_hl('DiagnosticVirtualTextOk', { fg = c.success, bg = c.success_bg })

  set_hl('DiagnosticFloatingError', { fg = c.error, bg = c.float_bg })
  set_hl('DiagnosticFloatingWarn', { fg = c.warning, bg = c.float_bg })
  set_hl('DiagnosticFloatingInfo', { fg = c.link, bg = c.float_bg })
  set_hl('DiagnosticFloatingHint', { fg = c.accent_alt, bg = c.float_bg })
  set_hl('DiagnosticFloatingOk', { fg = c.success, bg = c.float_bg })

  set_hl('DiagnosticUnderlineError', { undercurl = true, sp = c.error })
  set_hl('DiagnosticUnderlineWarn', { undercurl = true, sp = c.warning })
  set_hl('DiagnosticUnderlineInfo', { undercurl = true, sp = c.link })
  set_hl('DiagnosticUnderlineHint', { undercurl = true, sp = c.accent_alt })
  set_hl('DiagnosticUnderlineOk', { undercurl = true, sp = c.success })

  set_hl('LspReferenceText', { bg = c.active_bg })
  set_hl('LspReferenceRead', { bg = c.active_bg })
  set_hl('LspReferenceWrite', { bg = c.active_bg })
  set_hl('LspCodeLens', { fg = c.dim, italic = true })
  set_hl('LspCodeLensSeparator', { fg = c.dim })
  set_hl('LspInlayHint', { fg = c.muted, bg = c.surface, italic = true })

  set_hl('DiffAdd', { fg = c.success, bg = c.success_bg })
  set_hl('DiffChange', { fg = c.warning, bg = c.warning_bg })
  set_hl('DiffDelete', { fg = c.error, bg = c.error_bg })
  set_hl('DiffText', { fg = c.link, bg = c.info_bg })
  set_hl('Added', { fg = c.success })
  set_hl('Changed', { fg = c.warning })
  set_hl('Removed', { fg = c.error })

  set_hl('Link', { fg = c.link, underline = true })
end

local function apply_treesitter_groups()
  local links = {
    ['@comment'] = 'Comment',
    ['@comment.documentation'] = 'SpecialComment',
    ['@string'] = 'String',
    ['@string.documentation'] = 'String',
    ['@string.escape'] = 'SpecialChar',
    ['@string.regex'] = 'SpecialChar',
    ['@string.special'] = 'Special',
    ['@string.special.url'] = 'Link',
    ['@character'] = 'Character',
    ['@character.special'] = 'SpecialChar',
    ['@number'] = 'Number',
    ['@boolean'] = 'Boolean',
    ['@float'] = 'Float',
    ['@constant'] = 'Constant',
    ['@constant.builtin'] = 'Constant',
    ['@constant.macro'] = 'Macro',
    ['@keyword'] = 'Keyword',
    ['@keyword.function'] = 'Keyword',
    ['@keyword.operator'] = 'Operator',
    ['@keyword.return'] = 'Keyword',
    ['@keyword.import'] = 'Include',
    ['@keyword.exception'] = 'Exception',
    ['@operator'] = 'Operator',
    ['@punctuation'] = 'Delimiter',
    ['@punctuation.delimiter'] = 'Delimiter',
    ['@punctuation.bracket'] = 'Delimiter',
    ['@punctuation.special'] = 'Special',
    ['@variable'] = 'Identifier',
    ['@variable.builtin'] = 'Special',
    ['@variable.member'] = 'Identifier',
    ['@property'] = 'Identifier',
    ['@field'] = 'Identifier',
    ['@parameter'] = 'Identifier',
    ['@parameter.builtin'] = 'Identifier',
    ['@function'] = 'Function',
    ['@function.builtin'] = 'Function',
    ['@function.call'] = 'Function',
    ['@function.macro'] = 'Macro',
    ['@function.method'] = 'Function',
    ['@function.method.call'] = 'Function',
    ['@method'] = 'Function',
    ['@method.call'] = 'Function',
    ['@constructor'] = 'Type',
    ['@module'] = 'Include',
    ['@module.builtin'] = 'Include',
    ['@label'] = 'Label',
    ['@namespace'] = 'Include',
    ['@type'] = 'Type',
    ['@type.builtin'] = 'Type',
    ['@type.definition'] = 'Typedef',
    ['@attribute'] = 'PreProc',
    ['@tag'] = 'Tag',
    ['@tag.attribute'] = 'PreProc',
    ['@tag.delimiter'] = 'Delimiter',
    ['@markup.strong'] = 'Bold',
    ['@markup.italic'] = 'Italic',
    ['@markup.underline'] = 'Underlined',
    ['@markup.strikethrough'] = 'DiagnosticDeprecated',
    ['@markup.heading'] = 'Title',
    ['@markup.heading.1'] = 'Title',
    ['@markup.heading.2'] = 'Title',
    ['@markup.heading.3'] = 'Title',
    ['@markup.heading.4'] = 'Title',
    ['@markup.heading.5'] = 'Title',
    ['@markup.heading.6'] = 'Title',
    ['@markup.link'] = 'Link',
    ['@markup.link.url'] = 'Link',
    ['@markup.quote'] = 'Comment',
    ['@markup.raw'] = 'String',
    ['@markup.raw.block'] = 'String',
    ['@markup.list'] = 'Special',
    ['@markup.math'] = 'Number',
  }

  for group, target in pairs(links) do
    link_hl(group, target)
  end

  local legacy = {
    TSComment = 'Comment',
    TSString = 'String',
    TSCharacter = 'Character',
    TSNumber = 'Number',
    TSBoolean = 'Boolean',
    TSFloat = 'Float',
    TSKeyword = 'Keyword',
    TSKeywordFunction = 'Keyword',
    TSKeywordOperator = 'Operator',
    TSOperator = 'Operator',
    TSPunctDelimiter = 'Delimiter',
    TSPunctBracket = 'Delimiter',
    TSConstant = 'Constant',
    TSConstBuiltin = 'Constant',
    TSConstMacro = 'Macro',
    TSVariable = 'Identifier',
    TSVariableBuiltin = 'Special',
    TSProperty = 'Identifier',
    TSField = 'Identifier',
    TSParameter = 'Identifier',
    TSFunction = 'Function',
    TSFuncBuiltin = 'Function',
    TSFuncMacro = 'Macro',
    TSMethod = 'Function',
    TSConstructor = 'Type',
    TSInclude = 'Include',
    TSNamespace = 'Include',
    TSType = 'Type',
    TSTypeBuiltin = 'Type',
    TSTypeDefinition = 'Typedef',
    TSAttribute = 'PreProc',
    TSTag = 'Tag',
    TSTagDelimiter = 'Delimiter',
    TSText = 'Normal',
    TSStrong = 'Bold',
    TSEmphasis = 'Italic',
    TSUnderline = 'Underlined',
    TSTitle = 'Title',
    TSURI = 'Link',
    TSLiteral = 'String',
  }

  for group, target in pairs(legacy) do
    link_hl(group, target)
  end
end

local function apply_plugin_groups(c)
  local links = {
    TelescopeNormal = 'NormalFloat',
    TelescopeBorder = 'FloatBorder',
    TelescopePromptNormal = 'NormalFloat',
    TelescopePromptBorder = 'FloatBorder',
    TelescopePromptTitle = 'Title',
    TelescopePreviewTitle = 'Title',
    TelescopeResultsTitle = 'Title',
    TelescopeSelection = 'PmenuSel',
    TelescopeSelectionCaret = 'Keyword',
    TelescopeMatching = 'Function',
    TelescopePromptPrefix = 'Keyword',

    BlinkCmpMenu = 'Pmenu',
    BlinkCmpMenuBorder = 'FloatBorder',
    BlinkCmpDoc = 'NormalFloat',
    BlinkCmpDocBorder = 'FloatBorder',
    BlinkCmpSignatureHelp = 'NormalFloat',
    BlinkCmpSignatureHelpBorder = 'FloatBorder',
    BlinkCmpLabel = 'Pmenu',
    BlinkCmpLabelDeprecated = 'DiagnosticDeprecated',
    BlinkCmpKind = 'Type',
    BlinkCmpSource = 'Comment',

    CmpItemAbbr = 'Pmenu',
    CmpItemAbbrMatch = 'Function',
    CmpItemAbbrMatchFuzzy = 'Function',
    CmpItemKind = 'Type',
    CmpItemMenu = 'Comment',

    NeoTreeNormal = 'Normal',
    NeoTreeNormalNC = 'NormalNC',
    NeoTreeFloatBorder = 'FloatBorder',
    NeoTreeWinSeparator = 'WinSeparator',
    NeoTreeDirectoryName = 'Directory',
    NeoTreeDirectoryIcon = 'Directory',
    NeoTreeRootName = 'Title',
    NeoTreeFileNameOpened = 'String',
    NeoTreeIndentMarker = 'Comment',
    NeoTreeGitAdded = 'Added',
    NeoTreeGitModified = 'Changed',
    NeoTreeGitDeleted = 'Removed',

    TroubleNormal = 'NormalFloat',
    TroubleNormalNC = 'NormalFloat',
    TroubleText = 'Normal',
    TroubleCount = 'PmenuSel',
    TroubleIndent = 'Comment',
    TroubleFile = 'Directory',

    NoicePopup = 'NormalFloat',
    NoicePopupBorder = 'FloatBorder',
    NoiceCmdlinePopup = 'NormalFloat',
    NoiceCmdlinePopupBorder = 'FloatBorder',
    NoiceConfirm = 'NormalFloat',
    NoiceConfirmBorder = 'FloatBorder',

    WhichKey = 'Keyword',
    WhichKeyGroup = 'Title',
    WhichKeyDesc = 'Function',
    WhichKeySeparator = 'Comment',
    WhichKeyBorder = 'FloatBorder',
    WhichKeyValue = 'Comment',

    GitSignsAdd = 'Added',
    GitSignsChange = 'Changed',
    GitSignsDelete = 'Removed',
    GitSignsCurrentLineBlame = 'Comment',

    FlashMatch = 'Search',
    FlashCurrent = 'CurSearch',
    FlashBackdrop = 'Comment',

    NotifyERRORTitle = 'DiagnosticError',
    NotifyERRORBorder = 'DiagnosticError',
    NotifyERRORIcon = 'DiagnosticError',
    NotifyWARNTitle = 'DiagnosticWarn',
    NotifyWARNBorder = 'DiagnosticWarn',
    NotifyWARNIcon = 'DiagnosticWarn',
    NotifyINFOTitle = 'DiagnosticInfo',
    NotifyINFOBorder = 'DiagnosticInfo',
    NotifyINFOIcon = 'DiagnosticInfo',
    NotifyDEBUGTitle = 'Comment',
    NotifyDEBUGBorder = 'Comment',
    NotifyDEBUGIcon = 'Comment',
    NotifyTRACETitle = 'Comment',
    NotifyTRACEBorder = 'Comment',
    NotifyTRACEIcon = 'Comment',
  }

  for group, target in pairs(links) do
    link_hl(group, target)
  end

  set_hl('BlinkCmpLabelMatch', { fg = c.link, bold = true })
  set_hl('FlashLabel', { fg = c.cur_search_fg, bg = c.cur_search_bg, bold = true })

  set_hl('NotifyERRORBody', { fg = c.fg, bg = c.float_bg })
  set_hl('NotifyWARNBody', { fg = c.fg, bg = c.float_bg })
  set_hl('NotifyINFOBody', { fg = c.fg, bg = c.float_bg })
  set_hl('NotifyDEBUGBody', { fg = c.fg, bg = c.float_bg })
  set_hl('NotifyTRACEBody', { fg = c.fg, bg = c.float_bg })

  set_hl('DiagnosticDeprecated', { fg = c.dim, strikethrough = true })
  set_hl('DiagnosticUnnecessary', { fg = c.dim, italic = true })
end

local function apply_user_overrides(opts)
  opts = opts or {}
  local overrides = opts.overrides or {}
  local groups = overrides.groups or {}

  for group, spec in pairs(groups) do
    set_hl(group, spec)
  end
end

function M.apply_theme(theme, opts)
  if applying then
    return
  end
  applying = true

  M._last_theme = theme
  M._last_opts = opts

  local ok, err = pcall(function()
    local colors = build_semantic_theme(theme, opts)
    apply_base_groups(colors)
    apply_treesitter_groups()
    apply_plugin_groups(colors)
    apply_user_overrides(opts)

    M._expected_bg = colors.bg
    vim.g.colors_name = 'ghostty-dynamic'
    vim.api.nvim_exec_autocmds('ColorScheme', { pattern = 'ghostty-dynamic' })
  end)

  applying = false

  if not ok then
    vim.notify('[ghostty-dynamic] Error applying theme: ' .. tostring(err), vim.log.levels.ERROR)
    return
  end

  vim.g._ghostty_apply_gen = (vim.g._ghostty_apply_gen or 0) + 1
  local gen = vim.g._ghostty_apply_gen
  for i = 1, 5 do
    vim.defer_fn(function()
      if gen == vim.g._ghostty_apply_gen and M._last_theme and not M.is_theme_intact() then
        M.apply_theme(M._last_theme, M._last_opts)
      end
    end, i * 200)
  end
end

function M.is_theme_intact()
  if not M._expected_bg then
    return true
  end
  local actual = vim.api.nvim_get_hl(0, { name = 'Normal' })
  if not actual.bg then
    return false
  end
  return string.format('#%06x', actual.bg) == M._expected_bg
end

return M
