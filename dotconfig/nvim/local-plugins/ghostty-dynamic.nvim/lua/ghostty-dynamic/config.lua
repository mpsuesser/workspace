local M = {}

local function file_exists(path)
  return path and vim.loop.fs_stat(path) ~= nil
end

local function trim(s)
  return s and s:match('^%s*(.-)%s*$') or s
end

local function strip_quotes(s)
  return s and s:gsub('"', ''):gsub("'", '') or s
end

local function normalize_color(value)
  value = trim(value)
  if not value or value == '' then
    return nil
  end
  return value:gsub('^#', '')
end

local function add_location(locations, path)
  if path and file_exists(path) then
    table.insert(locations, path)
  end
end

function M.get_system_appearance()
  local uname = vim.loop.os_uname().sysname
  if uname == 'Linux' then
    local handle = io.popen('gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null')
    if handle then
      local result = handle:read('*a')
      handle:close()
      if result and result:match('prefer%-dark') then
        return 'dark'
      end
    end
  elseif uname == 'Darwin' then
    local handle = io.popen('dark-mode 2>/dev/null')
    if handle then
      local result = handle:read('*a')
      handle:close()
      if result and result:match('on') then
        return 'dark'
      end
    end
  end

  return 'light'
end

function M.get_ghostty_config_path()
  local xdg = os.getenv('XDG_CONFIG_HOME') or (os.getenv('HOME') .. '/.config')
  local paths = {
    xdg .. '/ghostty/config.ghostty',
    xdg .. '/ghostty/config',
    os.getenv('HOME') .. '/.config/ghostty/config.ghostty',
    os.getenv('HOME') .. '/.config/ghostty/config',
  }

  for _, path in ipairs(paths) do
    if file_exists(path) then
      return path
    end
  end

  return nil
end

function M.resolve_appearance_theme(theme_str)
  local light_theme, dark_theme = theme_str:match('^light:(.-)[,\n]%s*dark:(.-)$')
  if not light_theme or not dark_theme then
    return nil
  end
  local appearance = M.get_system_appearance()
  if appearance == 'dark' then
    return strip_quotes(dark_theme)
  end
  return strip_quotes(light_theme)
end

function M.get_current_theme_name(config_path)
  if not config_path or not file_exists(config_path) then
    return nil
  end

  for line in io.lines(config_path) do
    local theme = line:match('^theme%s*=%s*(.+)')
    if theme then
      theme = trim(theme)
      return M.resolve_appearance_theme(theme) or strip_quotes(theme)
    end
  end

  return nil
end

function M.get_theme_locations()
  local xdg = os.getenv('XDG_CONFIG_HOME') or (os.getenv('HOME') .. '/.config')
  local locations = {}

  add_location(locations, xdg .. '/ghostty/themes')

  local resources_dir = os.getenv('GHOSTTY_RESOURCES_DIR')
  if resources_dir then
    add_location(locations, resources_dir .. '/themes')
    add_location(locations, resources_dir .. '/ghostty/themes')
  end

  local system_paths = {
    '/Applications/Ghostty.app/Contents/Resources/ghostty/themes',
    '/usr/share/ghostty/themes',
    '/usr/local/share/ghostty/themes',
  }

  for _, path in ipairs(system_paths) do
    add_location(locations, path)
  end

  return locations
end

function M.find_theme_file(theme_name)
  if not theme_name then
    return nil
  end

  local locations = M.get_theme_locations()

  local function try_paths(base_name)
    for _, dir in ipairs(locations) do
      local test_paths = {
        dir .. '/' .. base_name,
        dir .. '/' .. base_name .. '.theme',
      }
      for _, path in ipairs(test_paths) do
        if file_exists(path) then
          return path
        end
      end
    end
    return nil
  end

  local path = try_paths(theme_name)
  if path then
    return path
  end

  local function insert_spaces(s)
    return (s:gsub('(%d)(%u)', '%1 %2'):gsub('(%u)(%u%l)', '%1 %2'):gsub('(%l)(%u)', '%1 %2'))
  end

  local variations = {
    theme_name:gsub('%-', ' '),
    theme_name:gsub(' ', '-'),
    theme_name:gsub('_', ' '),
    insert_spaces(theme_name),
    insert_spaces(theme_name:gsub('%-', ' ')),
  }

  for _, v in ipairs(variations) do
    if v ~= theme_name then
      path = try_paths(v)
      if path then
        return path
      end
    end
  end

  return nil
end

function M.get_live_theme()
  if vim.fn.executable('ghostty') ~= 1 then
    return nil
  end

  local output = vim.fn.system({ 'ghostty', '+show-config' })
  if vim.v.shell_error ~= 0 or not output or output == '' then
    return nil
  end

  local theme = {
    background = nil,
    foreground = nil,
    cursor_color = nil,
    cursor_text = nil,
    selection_background = nil,
    selection_foreground = nil,
    palette = {},
  }

  for line in output:gmatch('[^\r\n]+') do
    local key, value = line:match('^%s*([^=]+)%s*=%s*(.-)%s*$')
    if key and value then
      key = trim(key)
      value = trim(value)

      if key == 'background' then
        theme.background = normalize_color(value)
      elseif key == 'foreground' then
        theme.foreground = normalize_color(value)
      elseif key == 'cursor-color' then
        theme.cursor_color = normalize_color(value)
      elseif key == 'cursor-text' then
        theme.cursor_text = normalize_color(value)
      elseif key == 'selection-background' then
        theme.selection_background = normalize_color(value)
      elseif key == 'selection-foreground' then
        theme.selection_foreground = normalize_color(value)
      elseif key == 'palette' then
        local index_str, color = value:match('^(%d+)%s*=%s*(.+)$')
        local index = tonumber(index_str)
        if index and index >= 0 and index <= 15 and color then
          theme.palette[index] = normalize_color(color)
        end
      end
    end
  end

  if not theme.background then
    return nil
  end

  return theme
end

function M.get_background_color()
  local live_theme = M.get_live_theme()
  if live_theme and live_theme.background then
    return '#' .. live_theme.background
  end

  local config_path = M.get_ghostty_config_path()
  if not config_path then
    return nil
  end

  local theme_name = M.get_current_theme_name(config_path)
  if not theme_name then
    return nil
  end

  local theme_path = M.find_theme_file(theme_name)
  if not theme_path then
    return nil
  end

  local theme_parser = require('ghostty-dynamic.theme_parser')
  local theme = theme_parser.parse_theme_file(theme_path)
  if not theme or not theme.background then
    return nil
  end

  return '#' .. theme.background
end

return M
