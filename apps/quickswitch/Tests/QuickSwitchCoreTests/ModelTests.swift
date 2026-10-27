import Foundation
import CoreGraphics
import Testing
@testable import QuickSwitchCore

@Test func bindings() {
    #expect(Target.all.map(\.keyCode) == [12, 1, 0, 2, 13, 14])
    #expect(Target.all.map(\.legend) == ["Q", "S", "A", "D", "W", "E"])
    #expect(Set(Target.all.map(\.bundleID)).count == 6)
}

@Test func evenRadialAndClickThrough() {
    let size = CGSize(width: 1728, height: 1080)
    let layout = RadialLayout(size: size)
    #expect(layout.target(at: CGPoint(x: size.width / 2, y: size.height / 2)) == nil)
    #expect(layout.target(at: .zero) == nil)
    for target in Target.all {
        let key = layout.keyRect(for: target), icon = layout.iconRect(for: target)
        let kx = key.midX - size.width / 2, ky = key.midY - size.height / 2
        let ix = icon.midX - size.width / 2, iy = icon.midY - size.height / 2
        #expect(abs(kx * iy - ky * ix) < 0.00001)
        #expect(abs(hypot(ix - kx, iy - ky) - 76) < 0.00001)
        #expect(abs(hypot(kx, ky) - 82) < 0.00001)
        #expect(abs(hypot(ix, iy) - 158) < 0.00001)
        #expect(!key.intersects(icon))
        #expect(layout.target(at: CGPoint(x: key.midX, y: key.midY)) == target)
        #expect(layout.target(at: CGPoint(x: icon.midX, y: icon.midY)) == target)
    }
    let rows = ["QWE", "ASD"]
    for (row, legends) in rows.enumerated() {
        for (column, legend) in legends.enumerated() {
            let target = Target.all.first { $0.legend == String(legend) }
            #expect(target?.row == row)
            #expect(target?.column == column)
        }
    }
    let q = layout.keyRect(for: Target.all[0])
    let a = layout.keyRect(for: Target.all[2])
    #expect(abs(a.midX - q.midX) < 0.00001)
    #expect(abs(a.midY - q.midY - 82) < 0.00001)
    let clockwise = [Target.all[0], Target.all[4], Target.all[5], Target.all[3], Target.all[1], Target.all[2]]
    for index in clockwise.indices {
        let current = layout.keyRect(for: clockwise[index])
        let next = layout.keyRect(for: clockwise[(index + 1) % clockwise.count])
        #expect(abs(hypot(current.midX - next.midX, current.midY - next.midY) - 82) < 0.00001)
    }
}

@Test func radialLayoutFitsSmallScreens() {
    let size = CGSize(width: 360, height: 300)
    let layout = RadialLayout(size: size)
    let screen = CGRect(origin: .zero, size: size)
    for target in Target.all {
        #expect(screen.contains(layout.keyRect(for: target)))
        #expect(screen.contains(layout.iconRect(for: target)))
    }
}

@Test func firstChoiceWinsAndCancelOverrides() {
    var state = SelectionState()
    let idleChoice = state.choose(.target(49))
    #expect(!idleChoice)
    let began = state.begin()
    #expect(began)
    let duplicateBegin = state.begin()
    #expect(!duplicateBegin)
    let first = state.choose(.target(49))
    #expect(first)
    let second = state.choose(.target(0))
    #expect(!second)
    #expect(state.choice == .target(49))
    let cancelled = state.choose(.cancel)
    #expect(cancelled)
    #expect(state.choice == .cancel)
    state.close()
    let closingChoice = state.choose(.target(0))
    #expect(!closingChoice)
    state.reset()
    #expect(state.phase == .idle)
    #expect(state.choice == nil)
}

@Test func visibleLifecycle() {
    var state = SelectionState()
    state.show()
    #expect(state.phase == .idle)
    let began = state.begin()
    #expect(began)
    state.show()
    #expect(state.phase == .visible)
    let selected = state.choose(.target(12))
    #expect(selected)
    state.close()
    #expect(state.phase == .closing)
}

@Test func snapshotDecodingAndDestination() throws {
    let origin = try JSONDecoder().decode([Workspace].self, from: Data("""
    [{"workspace":"main","monitor-id":1}]
    """.utf8))[0]
    let windows = try JSONDecoder().decode([ManagedWindow].self, from: Data("""
    [{"window-id":1,"app-bundle-id":"com.mitchellh.ghostty","workspace":"main","monitor-id":1,"window-title":"one"},
     {"window-id":2,"app-bundle-id":"com.mitchellh.ghostty","workspace":"other","monitor-id":2,"window-title":"two"}]
    """.utf8))
    let snapshot = DesktopSnapshot(origin: origin, windows: windows)
    #expect(snapshot.launcherIsEmpty)
    #expect(snapshot.destination(for: Target.all[0], preferredID: 2)?.id == 2)
    #expect(snapshot.destination(for: Target.all[0], preferredID: 99)?.id == 1)
    #expect(snapshot.destination(for: Target.all[1], preferredID: nil) == nil)
    #expect(snapshot.sourceWindow(bundleID: "com.mitchellh.ghostty", title: "one")?.id == 1)
    #expect(snapshot.sourceWindow(bundleID: nil, title: nil) == nil)
}

@Test(arguments: Target.all) func fastBufferedChoice(target: Target) {
    var state = SelectionState()
    state.begin()
    let accepted = state.choose(.target(target.id))
    #expect(accepted)
    #expect(state.phase == .opening)
    #expect(state.choice == .target(target.id))
    state.close()
    let lateCancellation = state.choose(.cancel)
    #expect(!lateCancellation)
}

@Test func occupiedLauncherIsRejected() throws {
    let origin = try JSONDecoder().decode(Workspace.self, from: Data("""
    {"workspace":"main","monitor-id":1}
    """.utf8))
    let windows = try JSONDecoder().decode([ManagedWindow].self, from: Data("""
    [{"window-id":1,"app-bundle-id":"com.linear","workspace":"launcher","monitor-id":1,"window-title":""}]
    """.utf8))
    #expect(!DesktopSnapshot(origin: origin, windows: windows).launcherIsEmpty)
}

@Test func malformedWindowDoesNotBecomeLaunchFallback() {
    #expect(throws: DecodingError.self) {
        try JSONDecoder().decode([ManagedWindow].self, from: Data("""
        [{"window-id":1,"app-bundle-id":"com.linear"}]
        """.utf8))
    }
}
