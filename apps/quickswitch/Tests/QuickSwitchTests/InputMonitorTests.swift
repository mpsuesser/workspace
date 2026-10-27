import CoreGraphics
import Testing
@testable import QuickSwitch

@MainActor private func event(_ code: UInt16, down: Bool = true, repeatKey: Bool = false) throws -> CGEvent {
    let event = try #require(CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: down))
    event.flags = []
    event.setIntegerValueField(.keyboardEventAutorepeat, value: repeatKey ? 1 : 0)
    return event
}

@Test @MainActor func missingKeyUpDoesNotDisableF8() throws {
    let monitor = InputMonitor()
    var toggles = 0
    monitor.toggle = { toggles += 1 }
    let first = monitor.handle(.keyDown, try event(100))
    #expect(first)
    let repeated = monitor.handle(.keyDown, try event(100, repeatKey: true))
    #expect(repeated)
    #expect(toggles == 1)
    // Deliberately omit key-up, as can happen across a disabled tap.
    let freshPress = monitor.handle(.keyDown, try event(100))
    #expect(freshPress)
    #expect(toggles == 2)
}

@Test @MainActor func selectionRepeatAndTrailingUpStayConsumed() throws {
    let monitor = InputMonitor()
    monitor.isActive = true
    var selections: [UInt16] = []
    monitor.choose = { selections.append($0) }
    let selected = monitor.handle(.keyDown, try event(49))
    #expect(selected)
    monitor.isActive = false
    let repeated = monitor.handle(.keyDown, try event(49, repeatKey: true))
    #expect(repeated)
    let released = monitor.handle(.keyUp, try event(49, down: false))
    #expect(released)
    #expect(selections == [49])
    let ordinaryPress = monitor.handle(.keyDown, try event(49))
    #expect(!ordinaryPress)
}

@Test @MainActor func functionModifierAllowedButCommandF8PassesThrough() throws {
    let monitor = InputMonitor()
    var toggles = 0
    monitor.toggle = { toggles += 1 }
    let modified = try event(100)
    modified.flags = [.maskCommand]
    let command = monitor.handle(.keyDown, modified)
    #expect(!command)
    let fn = try event(100)
    fn.flags = [.maskSecondaryFn]
    let function = monitor.handle(.keyDown, fn)
    #expect(function)
    #expect(toggles == 1)
}

@Test @MainActor func inactiveEscapeAndBackgroundClicksPassThrough() throws {
    let monitor = InputMonitor()
    let escape = monitor.handle(.keyDown, try event(53))
    #expect(!escape)
    let click = monitor.handle(.leftMouseDown, try event(0))
    #expect(!click)
}
