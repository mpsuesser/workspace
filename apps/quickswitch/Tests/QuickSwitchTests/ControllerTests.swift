import AppKit
import Testing
import QuickSwitchCore
@testable import QuickSwitch

private actor TestDesktop: DesktopAccess {
    private(set) var reads = 0
    private(set) var mutations: [String] = []
    func snapshot() async throws -> DesktopSnapshot {
        reads += 1
        throw SwitchError.invalidSnapshot
    }
    func workspace(_ name: String) async throws { mutations.append(name) }
}

@MainActor private final class TestPalette: PalettePresenting {
    var visible = false
    var shows = 0
    var usesWallpaper = true
    func setUsesWallpaper(_ enabled: Bool) { usesWallpaper = enabled }
    func reloadWallpapers() {}
    func reloadIcons() {}
    func show(on screen: NSScreen) { visible = true; shows += 1 }
    func hide() { visible = false }
    func highlight(_ code: UInt16?) {}
    func target(at globalPoint: CGPoint) -> Target? { Target.all.first }
}

@Test @MainActor func openingAndCancellingNeverContactDesktopManager() async {
    let desktop = TestDesktop()
    let palette = TestPalette()
    let controller = SwitcherController(aerospace: desktop, palette: palette)
    for _ in 0..<10 {
        controller.toggle()
        #expect(palette.visible)
        #expect(controller.input.isActive)
        #expect(controller.input.hitTest(.zero)?.id == Target.all.first?.id)
        await Task.yield()
        #expect(await desktop.reads == 0)
        controller.cancel()
        #expect(!palette.visible)
        #expect(!controller.input.isActive)
    }
    #expect(await desktop.mutations.isEmpty)
    #expect(palette.shows == 10)
}

@Test @MainActor func cancelInvalidatesQueuedSelectionBeforeNextOpening() async {
    let desktop = TestDesktop()
    let palette = TestPalette()
    let controller = SwitcherController(aerospace: desktop, palette: palette)
    controller.toggle()
    controller.select(12)
    controller.cancel()
    controller.toggle()
    await Task.yield()
    #expect(palette.visible)
    #expect(controller.input.isActive)
    #expect(await desktop.reads == 0)
    #expect(await desktop.mutations.isEmpty)
    controller.toggle()
    #expect(!palette.visible)
    #expect(!controller.input.isActive)
}

@Test @MainActor func wallpaperIsDecodedAndCroppedBeforePresentation() throws {
    let source = NSImage(size: NSSize(width: 100, height: 100), flipped: false) { rect in
        NSColor.red.setFill()
        rect.fill()
        NSColor.blue.setFill()
        CGRect(x: 0, y: 50, width: 100, height: 50).fill()
        return true
    }
    let image = try #require(WallpaperBackdrop.render(source,
        screenFrame: CGRect(x: 200, y: 100, width: 100, height: 100),
        visibleFrame: CGRect(x: 200, y: 100, width: 100, height: 50), scale: 2))
    let bitmap = try #require(image.representations.first as? NSBitmapImageRep)
    #expect(bitmap.pixelsWide == 200)
    #expect(bitmap.pixelsHigh == 100)
    #expect(image.size == NSSize(width: 100, height: 50))
    // The removed upper half is blue. The visible lower half must remain red.
    let pixel = try #require(bitmap.colorAt(x: 100, y: 50)?.usingColorSpace(.sRGB))
    #expect(pixel.redComponent > 0.9)
    #expect(pixel.blueComponent < 0.1)
}
