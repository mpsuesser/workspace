import AppKit
import ApplicationServices

/// Native Accessibility focusing avoids AeroSpace 0.20.3's floating-window
/// `focus --window-id` assertion. No window-server capture or private API is used.
@MainActor final class WindowFocus {
    private var remembered: [String: AXUIElement] = [:]
    private(set) var source: AXUIElement?

    func capture(bundleID: String?, pid: pid_t?) -> (title: String?, fullscreen: Bool) {
        source = nil
        guard let pid else { return (nil, false) }
        let app = AXUIElementCreateApplication(pid)
        AXUIElementSetMessagingTimeout(app, 0.2)
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(app, kAXFocusedWindowAttribute as CFString, &value) == .success,
              let value, CFGetTypeID(value) == AXUIElementGetTypeID() else { return (nil, false) }
        let window = unsafeDowncast(value, to: AXUIElement.self)
        AXUIElementSetMessagingTimeout(window, 0.2)
        source = window
        if let bundleID { remembered[bundleID] = window }
        var title: CFTypeRef?
        var fullscreen: CFTypeRef?
        AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &title)
        AXUIElementCopyAttributeValue(window, "AXFullScreen" as CFString, &fullscreen)
        return (title as? String, (fullscreen as? Bool) == true)
    }

    @discardableResult func restoreSource(bundleID: String) -> Bool {
        activate(bundleID: bundleID, window: source)
    }

    @discardableResult func focus(bundleID: String, title: String) -> Bool {
        if let window = remembered[bundleID], raise(window) {
            return activate(bundleID: bundleID, window: window)
        }
        guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: bundleID).first else { return false }
        var value: CFTypeRef?
        let element = AXUIElementCreateApplication(app.processIdentifier)
        AXUIElementSetMessagingTimeout(element, 0.2)
        AXUIElementCopyAttributeValue(element, kAXWindowsAttribute as CFString, &value)
        let windows = value as? [AXUIElement] ?? []
        let matching = windows.filter { window in
            AXUIElementSetMessagingTimeout(window, 0.2)
            var value: CFTypeRef?
            AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &value)
            return value as? String == title
        }
        // With duplicate titles, let the app restore its own active window.
        let window = matching.count == 1 ? matching.first : nil
        return activate(bundleID: bundleID, window: window)
    }

    private func activate(bundleID: String, window: AXUIElement?) -> Bool {
        guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: bundleID).first else { return false }
        app.unhide()
        let activated = app.activate()
        if let window, raise(window) { remembered[bundleID] = window }
        return activated
    }

    private func raise(_ window: AXUIElement) -> Bool {
        AXUIElementSetAttributeValue(window, kAXMainAttribute as CFString, kCFBooleanTrue)
        return AXUIElementPerformAction(window, kAXRaiseAction as CFString) == .success
    }
}
