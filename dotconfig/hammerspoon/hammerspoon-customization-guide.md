# Hammerspoon Configuration & Customization Guide

## Overview

Hammerspoon is a powerful macOS automation framework that bridges Lua scripting with macOS system APIs, enabling comprehensive desktop automation and customization. This guide provides context for AI assistants helping to configure and maintain Hammerspoon setups.

## Core Architecture

### Foundation
- **Lua Engine**: Embedded Lua 5.4 interpreter for scripting
- **Objective-C Bridge**: Direct access to macOS APIs through Lua bindings
- **Event-Driven**: Asynchronous event system for responsive automation
- **Module System**: Extensive built-in modules (hs.*) for system interaction

### Configuration Structure
- **init.lua**: Main configuration file located at `~/.hammerspoon/init.lua`
- **Spoons**: Packaged extensions/plugins in `~/.hammerspoon/Spoons/`
- **Modules**: Custom Lua modules can be loaded via `require()`
- **Hot Reload**: Configuration changes applied instantly via `hs.reload()`

## Core Capabilities

### 1. Window Management

#### Basic Operations
```lua
-- Window positioning and sizing
hs.window.focusedWindow():moveToUnit({x=0, y=0, w=0.5, h=1})  -- Left half
hs.window.focusedWindow():maximize()                           -- Full screen
hs.window.focusedWindow():centerOnScreen()                     -- Center window
```

#### Advanced Features
- **Grid-based layouts**: Divide screen into customizable grids
- **Multi-monitor support**: Detect and manage windows across displays
- **Window filters**: Track and respond to window events
- **Layout persistence**: Save and restore window arrangements
- **Spaces integration**: Move windows between virtual desktops (requires private APIs)

#### Key APIs
- `hs.window`: Individual window control
- `hs.layout`: Batch window arrangement
- `hs.grid`: Grid-based window management
- `hs.window.filter`: Window event monitoring
- `hs.spaces`: Virtual desktop management (undocumented)

### 2. Hotkey System

#### Basic Bindings
```lua
hs.hotkey.bind({"cmd", "alt"}, "Left", function()
  -- Action code here
end)
```

#### Advanced Features
- **Modal hotkeys**: Context-specific key bindings
- **Chord sequences**: Multi-key combinations
- **Pass-through control**: Selectively allow/block key events
- **Hyper key support**: Use Caps Lock as modifier (via Karabiner)

#### Key APIs
- `hs.hotkey`: Global hotkey registration
- `hs.hotkey.modal`: Modal hotkey environments
- `hs.eventtap`: Low-level keyboard/mouse event interception

### 3. Application Control

#### Launching & Management
```lua
hs.application.launchOrFocus("Safari")
hs.application.get("Terminal"):kill()
```

#### Advanced Features
- **Application watchers**: Monitor app lifecycle events
- **Window rules**: Auto-arrange windows when apps launch
- **Menu manipulation**: Access application menu items programmatically
- **Bundle ID targeting**: Precise app identification

#### Key APIs
- `hs.application`: Application control
- `hs.application.watcher`: Application event monitoring
- `hs.appfinder`: Application discovery

### 4. System Integration

#### Shell Commands
```lua
output = hs.execute("ls -la")
hs.task.new("/usr/bin/git", nil, {"status"}):start()
```

#### AppleScript/JXA
```lua
hs.osascript.applescript('tell application "Finder" to activate')
hs.osascript.javascript('Application("Safari").windows[0].currentTab.url()')
```

#### Network Requests
```lua
hs.http.get("https://api.example.com/data", nil, callback)
hs.http.asyncPost(url, data, headers, callback)
```

### 5. Event Monitoring

#### System Events
- **WiFi changes**: `hs.wifi.watcher`
- **USB devices**: `hs.usb.watcher`
- **Battery/Power**: `hs.battery.watcher`
- **Screen changes**: `hs.screen.watcher`
- **Audio devices**: `hs.audiodevice.watcher`
- **File system**: `hs.pathwatcher`
- **Sleep/Wake**: `hs.caffeinate.watcher`

#### Custom Event Handlers
```lua
watcher = hs.wifi.watcher.new(function()
  -- Handle WiFi change
end)
watcher:start()
```

### 6. UI Creation

#### Visual Elements
- **Alerts**: `hs.alert.show("Message")`
- **Notifications**: `hs.notify.new({title="Title", informativeText="Text"})`
- **Canvas drawing**: `hs.canvas` for custom graphics
- **Menubar items**: `hs.menubar` for system tray integration
- **Chooser dialogs**: `hs.chooser` for selection interfaces
- **Webviews**: `hs.webview` for HTML-based UIs

#### Drawing & Overlays
```lua
canvas = hs.canvas.new({x=0, y=0, w=200, h=200})
canvas:appendElements({
  type = "rectangle",
  fillColor = {red=1, alpha=0.5}
})
canvas:show()
```

### 7. Input Device Control

#### Mouse & Trackpad
- **Cursor positioning**: `hs.mouse.absolutePosition`
- **Click simulation**: `hs.eventtap.leftClick(point)`
- **Gesture recognition**: Custom gesture detection via eventtap

#### Keyboard
- **Key simulation**: `hs.eventtap.keyStroke(modifiers, key)`
- **Text insertion**: `hs.eventtap.keyStrokes("text")`
- **Modifier tracking**: Monitor modifier key states

### 8. Audio Control

- **Volume control**: System and app-specific volume
- **Audio routing**: Switch between audio devices
- **Input monitoring**: Microphone state detection
- **Sound playback**: `hs.sound` for audio feedback

## Extension System (Spoons)

### Popular Spoons

#### Window Management
- **MiroWindowsManager**: Comprehensive window tiling
- **WindowGrid**: Grid-based window management
- **ArrangeDesktop**: Save/restore window layouts
- **WindowHalfsAndThirds**: Quick window sizing

#### Productivity
- **ClipboardTool**: Clipboard history manager
- **Seal**: Launcher interface (Alfred alternative)
- **TextClipboardHistory**: Text-specific clipboard
- **CountDown**: Timer and time tracking

#### System Enhancement
- **USBDeviceActions**: USB device event handlers
- **WiFiTransitions**: Location-based automation
- **AutoMuteOnSleep**: Audio management on sleep
- **ReloadConfiguration**: Auto-reload on config changes

### Installing Spoons
```lua
hs.loadSpoon("SpoonName")
spoon.SpoonName:start()
spoon.SpoonName:bindHotkeys({
  action = {{"cmd", "alt"}, "key"}
})
```

## Advanced Techniques

### 1. Context-Aware Automation

```lua
-- Different configurations based on WiFi network
local workWifi = "OfficeNetwork"
local homeWifi = "HomeNetwork"

hs.wifi.watcher.new(function()
  local currentNetwork = hs.wifi.currentNetwork()
  if currentNetwork == workWifi then
    -- Load work configuration
  elseif currentNetwork == homeWifi then
    -- Load home configuration
  end
end):start()
```

### 2. Multi-Step Workflows

```lua
-- Complex workflow example
function emailAndArchive()
  hs.application.launchOrFocus("Mail")
  hs.timer.doAfter(0.5, function()
    hs.eventtap.keyStroke({"cmd"}, "n")  -- New email
    hs.timer.doAfter(0.3, function()
      hs.eventtap.keyStrokes("automated@example.com")
      -- Continue workflow...
    end)
  end)
end
```

### 3. State Management

```lua
-- Persistent state across reloads
local state = {}
local statePath = hs.configdir .. "/state.json"

function saveState()
  hs.json.write(state, statePath, true)
end

function loadState()
  state = hs.json.read(statePath) or {}
end
```

### 4. Performance Optimization

```lua
-- Throttling expensive operations
local updateTimer = hs.timer.delayed.new(0.5, expensiveOperation)

function triggerUpdate()
  updateTimer:start()  -- Resets timer if already running
end
```

## Integration Patterns

### 1. External Tool Integration

```lua
-- Integrate with other automation tools
function runShortcut(name)
  hs.execute("shortcuts run '" .. name .. "'")
end

function runAppleScript(script)
  hs.osascript.applescript(script)
end
```

### 2. API Integration

```lua
-- Web service integration
function fetchData(callback)
  hs.http.asyncGet("https://api.service.com/data", nil, function(status, body)
    if status == 200 then
      local data = hs.json.decode(body)
      callback(data)
    end
  end)
end
```

### 3. Hardware Integration

```lua
-- USB device detection
usbWatcher = hs.usb.watcher.new(function(data)
  if data.eventType == "added" and data.productName == "My Device" then
    -- Handle device connection
  end
end)
usbWatcher:start()
```

## Best Practices

### Configuration Organization

1. **Modularize configuration**: Split into logical files
```lua
-- init.lua
require("modules.windows")
require("modules.hotkeys")
require("modules.apps")
```

2. **Use configuration tables**:
```lua
local config = {
  windowAnimations = true,
  gridSize = {4, 4},
  modifierKeys = {"cmd", "alt", "ctrl"}
}
```

3. **Error handling**:
```lua
local ok, err = pcall(function()
  -- Risky operation
end)
if not ok then
  hs.alert.show("Error: " .. tostring(err))
end
```

### Performance Considerations

1. **Avoid blocking operations** in event handlers
2. **Use timers** for delayed/repeated actions
3. **Cache expensive computations**
4. **Limit watchers** to necessary events only
5. **Profile with** `hs.timer.secondsSinceEpoch()`

### Debugging

1. **Console output**: `print()` and `hs.console.printStyledtext()`
2. **Logging**: `hs.logger` for structured logging
3. **Inspector**: `hs.inspect()` for object inspection
4. **REPL**: Hammerspoon console for interactive testing

## Common Patterns

### Window Management Workflow
```lua
-- Typical window management setup
local hyper = {"cmd", "alt", "ctrl", "shift"}

-- Window movements
hs.hotkey.bind(hyper, "Left", function()
  local win = hs.window.focusedWindow()
  win:moveToUnit({0, 0, 0.5, 1})
end)

-- Screen movements
hs.hotkey.bind(hyper, "N", function()
  local win = hs.window.focusedWindow()
  win:moveToScreen(win:screen():next())
end)
```

### Application Launcher
```lua
-- Quick app launcher
local appHotkeys = {
  S = "Safari",
  T = "Terminal",
  M = "Mail"
}

for key, app in pairs(appHotkeys) do
  hs.hotkey.bind(hyper, key, function()
    hs.application.launchOrFocus(app)
  end)
end
```

### Menu Bar Widget
```lua
-- System info in menu bar
menuBarItem = hs.menubar.new()

function updateMenuBar()
  local cpuUsage = hs.host.cpuUsage()
  menuBarItem:setTitle(string.format("CPU: %.0f%%", cpuUsage.overall.active))
end

hs.timer.doEvery(5, updateMenuBar)
```

## Limitations & Considerations

### Technical Limitations
- **Private APIs**: Some features (Spaces) use undocumented APIs
- **Security permissions**: Requires Accessibility permissions
- **macOS updates**: May break undocumented features
- **Performance overhead**: Lua interpreter adds some latency
- **Memory usage**: Complex configurations can consume resources

### Security Considerations
- **Full system access**: Scripts have extensive permissions
- **Code verification**: Verify third-party Spoons before use
- **Sensitive data**: Avoid hardcoding passwords/tokens
- **Network security**: Validate external data sources

## Troubleshooting Guide

### Common Issues

1. **Hotkeys not working**
   - Check Accessibility permissions
   - Verify no conflicts with system shortcuts
   - Test with simpler modifiers first

2. **Window management failures**
   - Some apps resist automation (certain games)
   - Full-screen apps may behave differently
   - Spaces API requires SIP modification (not recommended)

3. **Performance problems**
   - Review timer frequencies
   - Check for infinite loops
   - Monitor console for errors
   - Profile expensive operations

4. **Configuration not loading**
   - Check syntax errors in console
   - Verify file permissions
   - Test components individually

## Resources

### Official
- API Documentation: `hs.help()`
- Spoons Repository: Official Hammerspoon Spoons
- GitHub: Source code and issues

### Community
- Sample configurations on GitHub
- Blog posts and tutorials
- Discord/IRC channels
- Reddit communities

## Quick Reference

### Essential Shortcuts
- **Reload Config**: Usually bound to a hotkey for quick iteration
- **Console Access**: ⌘⌥⌃C (default)
- **Documentation**: `hs.help("module.name")`

### Module Categories
- **Core**: hotkey, timer, alert, console
- **Window**: window, layout, grid, spaces
- **Application**: application, appfinder
- **System**: battery, wifi, usb, screen
- **Input**: eventtap, mouse, keyboard
- **Network**: http, socket, urlevent
- **UI**: menubar, chooser, canvas, webview
- **Media**: audiodevice, sound, spotify
- **Utilities**: json, settings, logger, fs

This guide should provide comprehensive context for configuring and maintaining Hammerspoon setups. The framework's extensibility means new capabilities can always be added through Lua scripting and community contributions.