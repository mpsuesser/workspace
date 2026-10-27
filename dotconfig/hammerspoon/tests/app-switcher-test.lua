-- Run with luajit tests/app-switcher-test.lua from dotconfig/hammerspoon.
package.path = "./?.lua;" .. package.path
local module = require("app-switcher")
local recoveryKey = "desktopSwitcher.returnWorkspace"
local tests, passed = {}, 0

local function equal(actual, expected)
    assert(actual == expected, "expected " .. tostring(expected) .. ", got " .. tostring(actual))
end

local function test(name, body)
    table.insert(tests, { name = name, body = body })
end

local function fixture()
    local env = {
        now = 0, jobs = {}, calls = {}, alerts = {}, settings = {}, json = {}, windows = {},
        workspace = "browser", monitorID = 1, focusedID = 999, aerospaceRunning = true,
        preferred = {}, overrides = {}, canvases = {}, launches = {}, tasks = {}
    }
    for index, target in ipairs(module.bindings) do
        env.windows[index] = {
            ["window-id"] = index + 10, ["app-bundle-id"] = target.bundleID,
            ["monitor-id"] = 1, workspace = target.key == "`" and "monitoring" or "browser"
        }
    end

    local function schedule(delay, callback)
        assert(delay > 0, "zero-delay Hammerspoon timers do not fire")
        local job = { at = env.now + delay, callback = callback, active = true }
        function job:stop() self.active = false; return self end
        table.insert(env.jobs, job)
        return job
    end

    function env.step()
        table.sort(env.jobs, function(a, b) return a.at < b.at end)
        while #env.jobs > 0 do
            local job = table.remove(env.jobs, 1)
            if job.active then
                job.active = false
                env.now = job.at
                job.callback()
                return true
            end
        end
        return false
    end

    function env.flush()
        local count = 0
        while env.step() do
            count = count + 1
            assert(count < 200, "runaway callback loop")
        end
    end

    local function json(value)
        local token = "json:" .. tostring(#env.json + 1)
        table.insert(env.json, value)
        env.json[token] = value
        return token
    end

    local function handle(path, args)
        local override = env.overrides[args[1]]
        if override then
            local code, stdout, stderr = override(args, path)
            if code ~= nil then return code, stdout or "", stderr or "test failure" end
        end
        if path == "/usr/bin/open" then
            if args[1] == "-g" then env.aerospaceRunning = true else
                table.insert(env.launches, { bundleID = args[2], workspace = env.workspace })
            end
            return 0, "", ""
        end
        if args[1] == "list-workspaces" then
            return 0, json({ { workspace = env.workspace, ["monitor-id"] = env.monitorID } }), ""
        elseif args[1] == "list-windows" then
            if args[2] == "--workspace" then
                local count = 0
                for _, window in ipairs(env.windows) do
                    if window.workspace == args[3] then count = count + 1 end
                end
                return 0, tostring(count), ""
            end
            return 0, json(env.windows), ""
        elseif args[1] == "summon-workspace" or args[1] == "workspace" then
            env.workspace = args[2]
            return 0, "", ""
        elseif args[1] == "focus" then
            env.workspaceBeforeFocus = env.workspace
            env.focusedID = tonumber(args[3])
            for _, window in ipairs(env.windows) do
                if window["window-id"] == env.focusedID then
                    env.workspace = window.workspace
                    env.focusedBundleID = window["app-bundle-id"]
                end
            end
            return 0, "", ""
        end
        error("unexpected command: " .. table.concat(args, " "))
    end

    local function watcher(callback)
        return {
            callback = callback,
            start = function(self) self.active = true; return self end,
            stop = function(self) self.active = false; return self end
        }
    end

    local screen = { frame = function() return { x = -1728, y = 24, w = 1728, h = 1093 } end }
    local originalWindow = {
        id = function() return 999 end,
        screen = function() return screen end,
        isFullScreen = function() return env.fullscreen end
    }
    local api = {
        logger = { new = function() return { e = function() end } end },
        alert = { show = function(message) table.insert(env.alerts, message) end },
        timer = { doAfter = schedule },
        settings = {
            get = function(key) return env.settings[key] end,
            set = function(key, value) env.settings[key] = value end,
            clear = function(key) env.settings[key] = nil end
        },
        json = { decode = function(value)
            assert(env.json[value], "malformed JSON")
            return env.json[value]
        end },
        image = { imageFromAppBundle = function(bundleID) return "icon:" .. bundleID end },
        window = { focusedWindow = function()
            assert(not env.inTap, "Accessibility call inside event tap")
            return not env.noFocusedWindow and originalWindow or nil
        end },
        application = { get = function(bundleID)
            assert(not env.inTap, "Accessibility call inside event tap")
            if bundleID == "bobko.aerospace" then return env.aerospaceRunning and {} or nil end
            local preferred = env.preferred[bundleID]
            if preferred then
                return {
                    focusedWindow = function() return { id = function() return preferred end } end,
                    mainWindow = function() return nil end
                }
            end
        end },
        screen = { mainScreen = function() return screen end, watcher = { new = function(callback)
            env.screenWatcher = watcher(callback)
            return env.screenWatcher
        end } },
        spaces = { watcher = { new = function(callback)
            env.spacesWatcher = watcher(callback)
            return env.spacesWatcher
        end } },
        keycodes = { map = { f8 = 100, escape = 53, ["`"] = 50, space = 49, a = 0, d = 2, l = 37, q = 12, x = 7, f9 = 101 } },
        eventtap = { event = { types = {
            keyDown = 10, keyUp = 11, leftMouseDown = 1, leftMouseUp = 2,
            rightMouseDown = 3, rightMouseUp = 4, otherMouseDown = 25, otherMouseUp = 26
        } }, new = function(_, callback)
            env.tap = watcher(callback)
            return env.tap
        end },
        execute = function(command)
            assert(not env.inTap, "synchronous command inside event tap")
            env.syncCommand = command
            if env.syncFailure then return "", false end
            env.workspace = command:match("workspace '(.*)'$")
            return "", true
        end,
        task = { new = function(path, callback, args)
            if env.failTaskCreation then return nil end
            local task = { callback = callback, args = args, path = path }
            table.insert(env.tasks, task)
            function task:start()
                if env.failTaskStart then return false end
                table.insert(env.calls, { path = path, args = args })
                if env.hangCommand ~= args[1] then
                    schedule(0.01, function()
                        if not self.terminated then
                            local code, stdout, stderr = handle(path, args)
                            if self.callback then self.callback(code, stdout, stderr) end
                        end
                    end)
                end
                return self
            end
            function task:setCallback(nextCallback) self.callback = nextCallback; return self end
            function task:terminate() self.terminated = true; return self end
            return task
        end },
        canvas = { windowLevels = { overlay = 102 }, new = function(frame)
            if env.failCanvas then return nil end
            local canvas = { frame = frame }
            function canvas:level() return self end
            function canvas:behavior() return self end
            function canvas:clickActivating() return self end
            function canvas:canvasMouseEvents() return self end
            function canvas:mouseCallback(callback) self.callback = callback; return self end
            function canvas:replaceElements(elements) self.elements = elements; return self end
            function canvas:show() self.visible = true; return self end
            function canvas:hide() self.visible = false; return self end
            function canvas:delete() self.deleted = true; self.visible = false end
            table.insert(env.canvases, canvas)
            env.canvas = canvas
            return canvas
        end }
    }

    function env.key(key, eventType, flags)
        local event = {
            getKeyCode = function() return assert(api.keycodes.map[key]) end,
            getType = function() return api.eventtap.event.types[eventType or "keyDown"] end,
            getFlags = function() return flags or {} end
        }
        env.inTap = true
        local swallowed = env.tap.callback(event)
        env.inTap = false
        return swallowed
    end

    function env.press(key, flags)
        local swallowed = env.key(key, "keyDown", flags)
        env.key(key, "keyUp", flags)
        return swallowed
    end

    function env.mouse(eventType, x, y)
        env.inTap = true
        local swallowed = env.tap.callback({
            getType = function() return api.eventtap.event.types[eventType] end,
            getLocation = function() return { x = x, y = y } end
        })
        env.inTap = false
        return swallowed
    end

    env.switcher = module.new(api)
    env.switcher.start()
    function env.open() env.press("f8"); env.flush(); equal(env.switcher.status(), "ready") end
    function env.cancel() env.press("escape"); env.flush(); equal(env.switcher.status(), "idle") end
    return env
end

test("exact six requested bindings", function()
    equal(#module.bindings, 6)
    local expected = {
        ["`"] = "com.mitchellh.ghostty", space = "com.t3tools.t3code",
        a = "com.google.Chrome.app.ibioofnnpndfmiedpmogibjlnljpfebh",
        d = "com.google.Chrome", l = "com.linear", q = "com.superlogical.rex"
    }
    local angles = {}
    for _, target in ipairs(module.bindings) do
        equal(target.bundleID, expected[target.key])
        assert(not angles[target.angle])
        angles[target.angle] = true
    end
end)

test("idle keys and modified F8 pass through; fn-F8 starts without blocking", function()
    local env = fixture()
    equal(env.press("a"), false)
    equal(env.press("f9"), false)
    equal(env.press("f8", { cmd = true }), false)
    equal(env.press("f8", { fn = true }), true)
    equal(env.switcher.status(), "opening")
    equal(#env.calls, 0)
    env.flush()
    env.cancel()
end)

test("real desktop and six native icons on the active display", function()
    local env = fixture()
    env.open()
    equal(env.workspace, "launcher")
    equal(env.settings[recoveryKey], "browser")
    equal(env.canvas.visible, true)
    equal(env.canvas.frame.x, -1728)
    local icons = 0
    for _, element in ipairs(env.canvas.elements) do
        if element.type == "image" then icons = icons + 1 end
        assert(element.type ~= "circle", "no decorative ring")
        if element.type == "rectangle" then
            assert(element.id:match("^key[:%-]"), "only keycaps have backgrounds/borders")
        end
        assert(element.text ~= "F8" and element.text ~= "Esc to return", "no center text")
        for _, target in ipairs(module.bindings) do assert(element.text ~= target.name, "no app names") end
        assert(not element.trackMouseUp, "canvas must remain click-through")
    end
    equal(icons, 6)
    equal(#env.canvas.elements, 24)
    equal(env.canvas.callback, nil)
    env.cancel()
    equal(env.workspace, "browser")
    equal(env.focusedID, 999)
    equal(env.settings[recoveryKey], nil)
    equal(env.canvas.visible, false)
end)

test("inner keycaps and outer icons share a radial ray", function()
    local env = fixture()
    env.open()
    local centerX, centerY = env.canvas.frame.w / 2, env.canvas.frame.h / 2
    local function center(id)
        for _, element in ipairs(env.canvas.elements) do
            if element.id == id then
                return element.frame.x + element.frame.w / 2 - centerX,
                    element.frame.y + element.frame.h / 2 - centerY
            end
        end
        error("missing element " .. id)
    end
    for _, target in ipairs(module.bindings) do
        local keyX, keyY = center("key:" .. target.key)
        local iconX, iconY = center("app:" .. target.key)
        assert(math.abs(keyX * iconY - keyY * iconX) < 0.00001, "centers must be collinear")
        assert(keyX * iconX + keyY * iconY > 0, "same ray, not the opposite direction")
        assert(iconX * iconX + iconY * iconY > keyX * keyX + keyY * keyY, "icons must be outside keys")
    end
    equal(module.bindings[2].label, "␣")
    env.cancel()
end)

for _, target in ipairs(module.bindings) do
    test("buffered fast selection: " .. target.name, function()
        local env = fixture()
        env.press("f8")
        env.press(target.key)
        env.flush()
        equal(env.switcher.status(), "idle")
        equal(env.focusedBundleID, target.bundleID)
        equal(#env.launches, 0)
        equal(#env.canvases, 0)
        equal(env.settings[recoveryKey], nil)
    end)
end

test("first buffered selection wins", function()
    local env = fixture()
    env.press("f8")
    env.press("a")
    env.press("d")
    env.flush()
    equal(env.focusedBundleID, module.bindings[3].bundleID)
end)

test("F8 cancels before opening starts", function()
    local env = fixture()
    env.press("f8")
    env.press("f8")
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(#env.calls, 0)
end)

test("cancel while summon is in flight restores the source", function()
    local env = fixture()
    env.press("f8")
    env.step() -- begin
    env.step() -- origin query
    env.step() -- empty-workspace query; summon starts
    env.press("escape")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.focusedID, 999)
    equal(env.switcher.status(), "idle")
    equal(#env.canvases, 0)
end)

test("cancel overrides a queued selection", function()
    local env = fixture()
    env.press("f8")
    env.press("a")
    env.press("escape")
    env.flush()
    equal(env.focusedBundleID, nil)
    equal(env.workspace, "browser")
end)

test("selection repeats and trailing key-up never leak into the target", function()
    local env = fixture()
    env.open()
    equal(env.key("a"), true)
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(env.key("a"), true)
    equal(env.key("a", "keyUp"), true)
    equal(env.press("a"), false)
end)

test("unknown and modified keys are swallowed while open", function()
    local env = fixture()
    env.open()
    equal(env.press("x"), true)
    equal(env.press("q", { cmd = true }), true)
    equal(env.switcher.status(), "ready")
    env.cancel()
end)

test("F8 repeat does not cancel, a fresh F8 does", function()
    local env = fixture()
    env.key("f8")
    env.flush()
    env.key("f8")
    equal(env.switcher.status(), "ready")
    env.key("f8", "keyUp")
    env.press("f8")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.switcher.status(), "idle")
end)

test("cross-monitor target restores the source display before focus", function()
    local env = fixture()
    env.windows[1]["monitor-id"] = 2
    env.open()
    env.press("`")
    env.flush()
    equal(env.focusedBundleID, module.bindings[1].bundleID)
    equal(env.workspaceBeforeFocus, "browser")
end)

test("prefer the app's last focused managed window", function()
    local env = fixture()
    table.insert(env.windows, {
        ["window-id"] = 777, ["app-bundle-id"] = module.bindings[4].bundleID,
        ["monitor-id"] = 1, workspace = "browser"
    })
    env.preferred[module.bindings[4].bundleID] = 777
    env.open()
    env.press("d")
    env.flush()
    equal(env.focusedID, 777)
end)

test("missing app window restores before launch", function()
    local env = fixture()
    table.remove(env.windows, 6)
    env.open()
    env.press("q")
    env.flush()
    equal(env.launches[1].bundleID, module.bindings[6].bundleID)
    equal(env.launches[1].workspace, "browser")
    equal(env.switcher.status(), "idle")
end)

test("a disappearing target falls back to launch after restoring", function()
    local env = fixture()
    env.overrides.focus = function(args)
        if args[3] ~= "999" then return 1 end
    end
    env.open()
    env.press("l")
    env.flush()
    equal(env.launches[1].bundleID, module.bindings[5].bundleID)
    equal(env.launches[1].workspace, "browser")
end)

test("malformed window JSON cancels instead of launching", function()
    local env = fixture()
    env.overrides["list-windows"] = function(args)
        if args[2] == "--all" then return 0, "invalid JSON" end
    end
    env.open()
    env.press("d")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.switcher.status(), "idle")
    equal(#env.launches, 0)
    equal(#env.alerts, 1)
end)

test("malformed origin JSON cannot strand the desktop", function()
    local env = fixture()
    env.overrides["list-workspaces"] = function() return 0, "invalid JSON" end
    env.press("f8")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.switcher.status(), "idle")
    equal(#env.alerts, 1)
end)

test("failed summon restores and clears recovery state", function()
    local env = fixture()
    env.overrides["summon-workspace"] = function() return 1 end
    env.press("f8")
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(env.workspace, "browser")
    equal(env.settings[recoveryKey], nil)
end)

test("hung command times out and releases the keyboard", function()
    local env = fixture()
    env.hangCommand = "summon-workspace"
    env.press("f8")
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(env.workspace, "browser")
    equal(env.tasks[3].terminated, true)
    equal(env.press("a"), false)
end)

for _, failure in ipairs({ "failTaskCreation", "failTaskStart" }) do
    test(failure .. " leaves the switcher idle", function()
        local env = fixture()
        env[failure] = true
        env.press("f8")
        env.flush()
        equal(env.switcher.status(), "idle")
        equal(env.workspace, "browser")
        equal(#env.alerts, 1)
    end)
end

test("failed restore preserves recovery for the next invocation", function()
    local env = fixture()
    env.open()
    env.overrides.workspace = function() return 1 end
    env.cancel()
    equal(env.workspace, "launcher")
    equal(env.settings[recoveryKey], "browser")
    env.overrides.workspace = nil
    env.open()
    env.cancel()
    equal(env.workspace, "browser")
    equal(env.settings[recoveryKey], nil)
end)

test("occupied launcher is not hidden or rearranged", function()
    local env = fixture()
    env.windows[1].workspace = "launcher"
    env.press("f8")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.windows[1].workspace, "launcher")
    equal(env.switcher.status(), "idle")
    equal(#env.canvases, 0)
end)

test("native fullscreen is declined without switching workspaces", function()
    local env = fixture()
    env.fullscreen = true
    env.press("f8")
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(#env.calls, 0)
    equal(#env.alerts, 1)
end)

test("start AeroSpace in background and retry startup without losing selection", function()
    local env = fixture()
    env.aerospaceRunning = false
    local remaining = 2
    env.overrides["list-workspaces"] = function()
        if remaining > 0 then remaining = remaining - 1; return 1 end
    end
    env.press("f8")
    env.press("a")
    env.flush()
    equal(env.calls[1].path, "/usr/bin/open")
    equal(table.concat(env.calls[1].args, " "), "-g -b bobko.aerospace")
    equal(env.focusedBundleID, module.bindings[3].bundleID)
    equal(env.switcher.status(), "idle")
end)

test("desktop with no focused window uses the main screen", function()
    local env = fixture()
    env.noFocusedWindow = true
    env.open()
    env.cancel()
    for _, call in ipairs(env.calls) do assert(call.args[1] ~= "focus") end
    equal(env.workspace, "browser")
end)

for _, name in ipairs({ "screenWatcher", "spacesWatcher" }) do
    test(name .. " cancels the menu", function()
        local env = fixture()
        env.open()
        env[name].callback()
        env.flush()
        equal(env.switcher.status(), "idle")
        equal(env.workspace, "browser")
    end)
end

test("mouse selection only intercepts visible icon/label regions", function()
    local env = fixture()
    env.open()
    local icon
    for _, element in ipairs(env.canvas.elements) do
        if element.image == "icon:" .. module.bindings[5].bundleID then icon = element end
    end
    local x = env.canvas.frame.x + icon.frame.x + icon.frame.w / 2
    local y = env.canvas.frame.y + icon.frame.y + icon.frame.h / 2
    equal(env.mouse("leftMouseDown", x, y), true)
    equal(env.mouse("leftMouseUp", x, y), true)
    env.flush()
    equal(env.focusedBundleID, module.bindings[5].bundleID)
end)

test("permission-dialog clicks in the empty center pass through and cancel", function()
    local env = fixture()
    env.open()
    local frame = env.canvas.frame
    equal(env.mouse("leftMouseDown", frame.x + frame.w / 2, frame.y + frame.h / 2), false)
    equal(env.switcher.status(), "ready")
    equal(env.workspace, "launcher")
    equal(env.mouse("leftMouseUp", frame.x + frame.w / 2, frame.y + frame.h / 2), false)
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(env.workspace, "browser")
    for _, call in ipairs(env.calls) do assert(call.args[1] ~= "focus", "do not steal the clicked dialog's focus") end
end)

test("right-click passes through and cancels without reading keyboard fields", function()
    local env = fixture()
    env.open()
    equal(env.mouse("rightMouseDown", 0, 0), false)
    equal(env.mouse("rightMouseUp", 0, 0), false)
    env.flush()
    equal(env.switcher.status(), "idle")
end)

test("trailing icon mouse-up is swallowed after a keyboard selection", function()
    local env = fixture()
    env.open()
    local icon = env.canvas.elements[1]
    local x = env.canvas.frame.x + icon.frame.x + icon.frame.w / 2
    local y = env.canvas.frame.y + icon.frame.y + icon.frame.h / 2
    equal(env.mouse("leftMouseDown", x, y), true)
    env.press("l")
    env.flush()
    equal(env.mouse("leftMouseUp", x, y), true)
    equal(env.focusedBundleID, module.bindings[5].bundleID)
end)

test("drawing failure restores the workspace", function()
    local env = fixture()
    env.failCanvas = true
    env.press("f8")
    env.flush()
    equal(env.switcher.status(), "idle")
    equal(env.workspace, "browser")
end)

test("shutdown restores synchronously and releases all resources", function()
    local env = fixture()
    env.open()
    env.switcher.stop()
    equal(env.workspace, "browser")
    equal(env.switcher.status(), "idle")
    equal(env.canvas.deleted, true)
    equal(env.tap.active, false)
    equal(env.screenWatcher.active, false)
    equal(env.spacesWatcher.active, false)
    equal(env.settings[recoveryKey], nil)
    env.switcher.stop()
    env.switcher.start()
    env.open()
    env.cancel()
end)

test("stopping during summon kills pending callbacks", function()
    local env = fixture()
    env.press("f8")
    env.step()
    env.step()
    env.step()
    local pending = env.tasks[3]
    local staleCallback = pending.callback
    env.switcher.stop()
    equal(pending.terminated, true)
    staleCallback(0, "", "")
    env.flush()
    equal(env.workspace, "browser")
    equal(env.switcher.status(), "idle")
    equal(#env.canvases, 0)
end)

test("failed shutdown restore keeps recovery", function()
    local env = fixture()
    env.open()
    env.syncFailure = true
    env.switcher.stop()
    equal(env.settings[recoveryKey], "browser")
end)

test("orphaned launcher recovers to main without looping", function()
    local env = fixture()
    env.workspace = "launcher"
    env.settings[recoveryKey] = "launcher"
    env.open()
    env.cancel()
    equal(env.workspace, "main")
end)

for _, item in ipairs(tests) do
    local ok, failure = pcall(item.body)
    if not ok then
        io.stderr:write("FAIL " .. item.name .. "\n" .. tostring(failure) .. "\n")
        os.exit(1)
    end
    passed = passed + 1
    print("PASS " .. item.name)
end
print(tostring(passed) .. " app-switcher tests passed")
