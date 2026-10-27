import AppKit
import ApplicationServices
import QuickSwitchCore

/// The event tap stays on the main run loop; its callback never waits on a CLI.
@MainActor final class InputMonitor {
    var isActive = false
    var toggle: () -> Void = {}
    var choose: (UInt16) -> Void = { _ in }
    var cancelAfterClick: () -> Void = {}
    var hitTest: (CGPoint) -> Target? = { _ in nil }
    var hover: (UInt16?) -> Void = { _ in }
    private var tap: CFMachPort?
    private var source: CFRunLoopSource?
    private var consumed = Set<UInt16>()
    private var clicked: UInt16?

    func start() -> Bool {
        if tap != nil { return true }
        let types: [CGEventType] = [.keyDown, .keyUp, .leftMouseDown, .leftMouseUp,
            .rightMouseDown, .rightMouseUp, .otherMouseDown, .otherMouseUp, .mouseMoved]
        let mask = types.reduce(CGEventMask(0)) { $0 | (1 << $1.rawValue) }
        let callback: CGEventTapCallBack = { _, type, event, context in
            guard let context else { return Unmanaged.passUnretained(event) }
            let swallowed = MainActor.assumeIsolated {
                let monitor = Unmanaged<InputMonitor>.fromOpaque(context).takeUnretainedValue()
                return monitor.handle(type, event)
            }
            return swallowed ? nil : Unmanaged.passUnretained(event)
        }
        guard let tap = CGEvent.tapCreate(tap: .cgSessionEventTap, place: .headInsertEventTap,
            options: .defaultTap, eventsOfInterest: mask, callback: callback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()) else { return false }
        self.tap = tap
        let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        self.source = source
        CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        return true
    }

    func stop() {
        if let tap { CGEvent.tapEnable(tap: tap, enable: false); CFMachPortInvalidate(tap) }
        if let source { CFRunLoopRemoveSource(CFRunLoopGetMain(), source, .commonModes) }
        tap = nil
        source = nil
        consumed.removeAll()
        clicked = nil
        isActive = false
    }

    func handle(_ type: CGEventType, _ event: CGEvent) -> Bool {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap { CGEvent.tapEnable(tap: tap, enable: true) }
            if isActive { toggle() }
            return false
        }
        if type == .keyDown || type == .keyUp {
            let code = UInt16(event.getIntegerValueField(.keyboardEventKeycode))
            if type == .keyUp { return consumed.remove(code) != nil }
            // A missed key-up (tap timeout, permission change, synthetic input)
            // must not make a physical key permanently unusable. Only an actual
            // autorepeat is a repeat; a fresh down always starts a new press.
            if event.getIntegerValueField(.keyboardEventAutorepeat) != 0 {
                return isActive || consumed.contains(code)
            }
            let modifiers: CGEventFlags = [.maskCommand, .maskControl, .maskAlternate, .maskShift]
            let plain = event.flags.intersection(modifiers).isEmpty
            if code == 100 && plain {
                consumed.insert(code)
                toggle()
                return true
            }
            guard isActive else { return false }
            consumed.insert(code)
            if code == 53 { toggle() }
            else if plain { choose(code) }
            return true
        }
        if type == .leftMouseUp, let code = clicked {
            clicked = nil
            if isActive { choose(code) }
            return true
        }
        guard isActive else { return false }
        if type == .mouseMoved { hover(hitTest(event.location)?.id); return false }
        if type == .leftMouseDown, let target = hitTest(event.location) {
            clicked = target.id
            return true
        }
        if type == .leftMouseUp || type == .rightMouseUp || type == .otherMouseUp {
            // Deliver the real mouse-up before restoring the workspace. Never
            // reactivate the source app over a dialog the user just clicked.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) { [weak self] in
                self?.cancelAfterClick()
            }
        }
        return false
    }
}
