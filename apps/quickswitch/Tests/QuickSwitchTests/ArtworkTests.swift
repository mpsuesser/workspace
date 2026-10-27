import AppKit
import Testing
import QuickSwitchCore
@testable import QuickSwitch

@Test @MainActor func allSixMarksHaveTransparentBackgrounds() throws {
    let model = PaletteModel()
    model.loadIcons()
    for target in Target.all {
        let image = try #require(model.icons[target.id])
        let data = try #require(image.tiffRepresentation)
        let bitmap = try #require(NSBitmapImageRep(data: data))
        #expect(bitmap.hasAlpha)
        #expect(bitmap.pixelsWide == 512)
        #expect(bitmap.pixelsHigh == 512)
        for point in [(0, 0), (511, 0), (0, 511), (511, 511), (256, 0), (0, 256)] {
            let pixel = try #require(bitmap.colorAt(x: point.0, y: point.1))
            #expect(pixel.alphaComponent == 0)
        }
    }
}

@Test @MainActor func adminAndChromeRetainTheirAppColors() throws {
    let model = PaletteModel()
    model.loadIcons()
    func color(_ key: UInt16, x: Int, y: Int) throws -> NSColor {
        let image = try #require(model.icons[key])
        let data = try #require(image.tiffRepresentation)
        let bitmap = try #require(NSBitmapImageRep(data: data))
        let pixel = try #require(bitmap.colorAt(x: x, y: y))
        return try #require(pixel.usingColorSpace(.sRGB))
    }

    let gold = try color(0, x: 256, y: 100)
    let violet = try color(0, x: 100, y: 300)
    #expect(gold.redComponent > gold.blueComponent * 2)
    #expect(gold.greenComponent > gold.blueComponent * 2)
    #expect(violet.blueComponent > violet.redComponent)
    #expect(violet.redComponent > violet.greenComponent)

    let red = try color(2, x: 256, y: 100)
    let blue = try color(2, x: 256, y: 256)
    let green = try color(2, x: 100, y: 300)
    let yellow = try color(2, x: 400, y: 300)
    #expect(red.redComponent > red.greenComponent * 2)
    #expect(blue.blueComponent > blue.redComponent * 2)
    #expect(green.greenComponent > green.redComponent * 2)
    #expect(yellow.redComponent > yellow.blueComponent * 2)
    #expect(yellow.greenComponent > yellow.blueComponent * 2)
}

@Test @MainActor func linearAndT3HaveDarkMarksForLightWallpapers() throws {
    let model = PaletteModel()
    model.loadIcons()
    for key: UInt16 in [13, 1] {
        let image = try #require(model.icons[key])
        let data = try #require(image.tiffRepresentation)
        let bitmap = try #require(NSBitmapImageRep(data: data))
        let pixel = try #require(bitmap.colorAt(x: 256, y: 128))
        let color = try #require(pixel.usingColorSpace(.sRGB))
        #expect(color.alphaComponent == 1)
        let luminance = 0.2126 * color.redComponent
            + 0.7152 * color.greenComponent + 0.0722 * color.blueComponent
        #expect(luminance < 0.45)
    }
}
