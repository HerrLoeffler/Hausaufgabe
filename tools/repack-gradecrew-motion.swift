#!/usr/bin/env swift
// Deterministic packing of ImageGen's irregular 4x5 sheets. No new artwork or resampling.
// Run on macOS: swift -module-cache-path /private/tmp/gradecrew-swift-cache \
//   tools/repack-gradecrew-motion.swift --output /private/tmp/packed coco=/absolute/source.png
// Self-test: same command with --self-test instead of the output/input arguments.
import Foundation
import CoreGraphics
import ImageIO
import CryptoKit

struct PackingError: Error, CustomStringConvertible { let description: String }
func require(_ condition: Bool, _ message: String) throws {
    if !condition { throw PackingError(description: message) }
}
struct Bounds: Codable {
    var x: Int; var y: Int; var width: Int; var height: Int
    var right: Int { x + width }; var bottom: Int { y + height }
    var centerX: Double { Double(x) + Double(width) / 2 }
    var centerY: Double { Double(y) + Double(height) / 2 }
}
struct Raster {
    let width: Int; let height: Int; var rgba: [UInt8]
    init(width: Int, height: Int) {
        self.width = width; self.height = height
        rgba = .init(repeating: 0, count: width * height * 4)
    }
    init(path: String) throws {
        guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
            throw PackingError(description: "Cannot decode PNG: \(path)")
        }
        width = image.width; height = image.height
        rgba = .init(repeating: 0, count: width * height * 4)
        let success = rgba.withUnsafeMutableBytes { pixels -> Bool in
            guard let context = CGContext(data: pixels.baseAddress, width: width, height: height,
                bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue)
                else { return false }
            // CGImage's scanlines already have the desired top-left order. Do not flip.
            context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
            return true
        }
        try require(success, "Cannot create decode context")
    }
    func pngData() throws -> Data {
        guard let provider = CGDataProvider(data: Data(rgba) as CFData),
              let image = CGImage(width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 32,
                bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue),
                provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent) else {
            throw PackingError(description: "Cannot encode PNG")
        }
        // Create a separate owned mutable buffer; do not rely on a temporary bridge's lifetime.
        let data = NSMutableData()
        guard let ownedDestination = CGImageDestinationCreateWithData(data, "public.png" as CFString, 1, nil) else {
            throw PackingError(description: "Cannot create PNG destination")
        }
        CGImageDestinationAddImage(ownedDestination, image, nil)
        try require(CGImageDestinationFinalize(ownedDestination), "Cannot finalize PNG")
        return data as Data
    }
}
struct Component {
    let label: Int; let pixels: [Int]; let bounds: Bounds
}
struct Analysis {
    let components: [Component]; let ignoredCount: Int; let ignoredMaxArea: Int
}
let threshold: UInt8 = 64
let minimumArea = 1000
let halo = 4
let gutter = 16
let columns = 4
let rows = 5
func analyze(_ image: Raster) throws -> Analysis {
    let w = image.width, h = image.height
    var visited = [Bool](repeating: false, count: w * h)
    var subjects = [Component](), ignoredCount = 0, ignoredMaxArea = 0
    for seed in 0..<(w * h) where !visited[seed] && image.rgba[seed * 4 + 3] >= threshold {
        var queue = [seed], cursor = 0, x0 = w, y0 = h, x1 = 0, y1 = 0
        visited[seed] = true
        while cursor < queue.count {
            let point = queue[cursor]; cursor += 1
            let x = point % w, y = point / w
            x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
            for dy in -1...1 { for dx in -1...1 where dx != 0 || dy != 0 {
                let nx = x + dx, ny = y + dy
                if nx >= 0 && nx < w && ny >= 0 && ny < h {
                    let next = ny * w + nx
                    if !visited[next] && image.rgba[next * 4 + 3] >= threshold {
                        visited[next] = true; queue.append(next)
                    }
                }
            }}
        }
        if queue.count >= minimumArea {
            subjects.append(Component(label: subjects.count, pixels: queue,
                bounds: Bounds(x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1)))
        } else { ignoredCount += 1; ignoredMaxArea = max(ignoredMaxArea, queue.count) }
    }
    try require(subjects.count == columns * rows,
        "Expected 20 isolated significant subjects; found \(subjects.count). Refusing to invent or split frames.")
    let byY = subjects.sorted { $0.bounds.centerY < $1.bounds.centerY }
    var ordered = [Component]()
    for row in 0..<rows {
        let group = Array(byY[(row * columns)..<((row + 1) * columns)])
        let centers = group.map { $0.bounds.centerY }
        try require(centers.max()! - centers.min()! < Double(h) / 10,
            "Ambiguous row \(row): subjects do not form a coherent 4x5 grid")
        let sorted = group.sorted { $0.bounds.centerX < $1.bounds.centerX }
        for pair in zip(sorted, sorted.dropFirst()) {
            try require(pair.1.bounds.centerX - pair.0.bounds.centerX > Double(w) / 10,
                "Ambiguous columns in row \(row)")
        }
        if row > 0 {
            try require(centers.min()! - byY[row * columns - 1].bounds.centerY > Double(h) / 10,
                "Ambiguous separation before row \(row)")
        }
        ordered += sorted
    }
    return Analysis(components: ordered, ignoredCount: ignoredCount, ignoredMaxArea: ignoredMaxArea)
}
struct FrameRecord: Codable {
    let index: Int; let row: Int; let column: Int
    let sourceOpaqueBounds: Bounds; let retainedSourceBounds: Bounds
    let outputOpaqueBounds: Bounds; let outputRetainedBounds: Bounds
    let significantPixelCount: Int; let retainedPixelCount: Int
    let originalRetainedRGBA_SHA256: String; let packedRetainedRGBA_SHA256: String
    let minimumOpaqueEdgeDistance: Int; let minimumRetainedEdgeDistance: Int
    let alpha128PixelsWithinFourPixelsOfCellEdge: Int
}
struct Manifest: Codable {
    let schemaVersion: Int; let packer: String; let mascot: String
    let sourcePath: String; let sourceSHA256: String; let outputSHA256: String
    let sourceWidth: Int; let sourceHeight: Int; let outputWidth: Int; let outputHeight: Int
    let columns: Int; let rows: Int; let frameCount: Int; let cellSize: Int; let scale: Int
    let alphaThreshold: Int; let significantComponentMinimumArea: Int; let antialiasHaloPixels: Int
    let ignoredSmallComponentCount: Int; let ignoredSmallComponentMaxArea: Int
    let retainedAlphaPixelCount: Int; let omittedAlphaPixelCount: Int; let omittedAlpha128PixelCount: Int
    let cleanupPolicy: String; let alignment: String; let frames: [FrameRecord]
}
func sha(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }
func bounds(of points: [Int], width: Int) -> Bounds {
    let xs = points.map { $0 % width }, ys = points.map { $0 / width }
    return Bounds(x: xs.min()!, y: ys.min()!, width: xs.max()! - xs.min()! + 1, height: ys.max()! - ys.min()! + 1)
}
func edgeDistance(_ bounds: Bounds, cellSize: Int) -> Int {
    min(bounds.x, bounds.y, cellSize - bounds.right, cellSize - bounds.bottom)
}
func pack(_ source: Raster, cellSize: Int) throws -> (Raster, [FrameRecord], Analysis, Int, Int, Int) {
    let analysis = try analyze(source)
    let w = source.width, h = source.height
    var owners = [Int](repeating: -1, count: w * h)
    var distances = [Int](repeating: Int.max, count: w * h)
    var queue = [Int]()
    // Seed all subjects before expansion: a neighbor can never steal another subject's solid pixels.
    for (index, component) in analysis.components.enumerated() {
        for pixel in component.pixels { owners[pixel] = index; distances[pixel] = 0; queue.append(pixel) }
    }
    var cursor = 0
    while cursor < queue.count {
        let pixel = queue[cursor]; cursor += 1
        if distances[pixel] >= halo { continue }
        let x = pixel % w, y = pixel / w
        for dy in -1...1 { for dx in -1...1 where dx != 0 || dy != 0 {
            let nx = x + dx, ny = y + dy
            if nx >= 0 && nx < w && ny >= 0 && ny < h {
                let next = ny * w + nx
                if distances[next] > distances[pixel] + 1 {
                    distances[next] = distances[pixel] + 1; owners[next] = owners[pixel]; queue.append(next)
                }
            }
        }}
    }
    var retained = [[Int]](repeating: [], count: 20)
    var omitted = 0, omitted128 = 0
    for pixel in 0..<(w * h) where source.rgba[pixel * 4 + 3] > 0 {
        if owners[pixel] >= 0 { retained[owners[pixel]].append(pixel) }
        else { omitted += 1; if source.rgba[pixel * 4 + 3] >= 128 { omitted128 += 1 } }
    }
    var output = Raster(width: columns * cellSize, height: rows * cellSize)
    var records = [FrameRecord]()
    for (index, component) in analysis.components.enumerated() {
        let sourceBounds = bounds(of: retained[index], width: w)
        let opaque = component.bounds
        // Whole-pixel translation only. Equal camera scale and opaque-foot baseline in every frame.
        let tx = (cellSize - opaque.width) / 2 - opaque.x
        let ty = cellSize - gutter - halo - opaque.bottom
        let outputBounds = Bounds(x: sourceBounds.x + tx, y: sourceBounds.y + ty,
            width: sourceBounds.width, height: sourceBounds.height)
        let outputOpaque = Bounds(x: opaque.x + tx, y: opaque.y + ty, width: opaque.width, height: opaque.height)
        try require(edgeDistance(outputBounds, cellSize: cellSize) >= gutter,
            "Frame \(index) needs a larger cell: retained bounds \(outputBounds), cell \(cellSize)")
        var original = Data(), packed = Data(), edgeCount = 0
        for pixel in retained[index] {
            let localX = pixel % w + tx, localY = pixel / w + ty
            let destinationX = (index % columns) * cellSize + localX
            let destinationY = (index / columns) * cellSize + localY
            let destination = (destinationY * output.width + destinationX) * 4
            for channel in 0..<4 { output.rgba[destination + channel] = source.rgba[pixel * 4 + channel] }
            original.append(contentsOf: source.rgba[(pixel * 4)..<(pixel * 4 + 4)])
            packed.append(contentsOf: output.rgba[destination..<(destination + 4)])
            if source.rgba[pixel * 4 + 3] >= 128 &&
                min(localX, localY, cellSize - 1 - localX, cellSize - 1 - localY) < 4 { edgeCount += 1 }
        }
        try require(original == packed && edgeCount == 0, "Copy/padding check failed for frame \(index)")
        records.append(FrameRecord(index: index, row: index / columns, column: index % columns,
            sourceOpaqueBounds: opaque, retainedSourceBounds: sourceBounds,
            outputOpaqueBounds: outputOpaque, outputRetainedBounds: outputBounds,
            significantPixelCount: component.pixels.count, retainedPixelCount: retained[index].count,
            originalRetainedRGBA_SHA256: sha(original), packedRetainedRGBA_SHA256: sha(packed),
            minimumOpaqueEdgeDistance: edgeDistance(outputOpaque, cellSize: cellSize),
            minimumRetainedEdgeDistance: edgeDistance(outputBounds, cellSize: cellSize),
            alpha128PixelsWithinFourPixelsOfCellEdge: edgeCount))
    }
    return (output, records, analysis, retained.reduce(0) { $0 + $1.count }, omitted, omitted128)
}
func selfTest() throws {
    var fixture = Raster(width: 800, height: 1000)
    for index in 0..<20 {
        let x0 = (index % 4) * 200 + 30 + index % 3
        let y0 = (index / 4) * 200 + 30 + index % 2
        for y in y0..<(y0 + 60) { for x in x0..<(x0 + 50) {
            let p = (y * fixture.width + x) * 4
            fixture.rgba[p] = UInt8(index + 20); fixture.rgba[p + 3] = 255
        }}
        // A real AA edge is kept; distant low-alpha contamination is excluded.
        fixture.rgba[((y0 - 1) * fixture.width + x0) * 4 + 3] = 20
        fixture.rgba[((y0 - 15) * fixture.width + x0) * 4 + 3] = 20
    }
    let first = try pack(fixture, cellSize: 128), second = try pack(fixture, cellSize: 128)
    try require(first.0.rgba == second.0.rgba && first.1.count == 20 && first.4 == 20,
        "Determinism, count, or halo ownership test failed")
    try require(first.1.allSatisfy { $0.minimumRetainedEdgeDistance >= gutter &&
        $0.alpha128PixelsWithinFourPixelsOfCellEdge == 0 &&
        $0.originalRetainedRGBA_SHA256 == $0.packedRetainedRGBA_SHA256 }, "Padding/preservation test failed")
    var missing = fixture
    for p in try analyze(fixture).components[19].pixels { missing.rgba[p * 4 + 3] = 0 }
    do { _ = try analyze(missing); throw PackingError(description: "Missing frame was accepted") }
    catch let error as PackingError { try require(error.description.contains("found 19"), error.description) }
    // Add a bridge between the first two solids. A merged frame must also be rejected.
    var merged = fixture
    for x in 70...240 { merged.rgba[(45 * merged.width + x) * 4 + 3] = 255 }
    do { _ = try analyze(merged); throw PackingError(description: "Merged frame was accepted") }
    catch let error as PackingError { try require(error.description.contains("found 19"), error.description) }
    print("PASS: 20 ordered frames, pixel preservation, halo isolation, >=16px padding, deterministic bytes, and refusal of missing/merged subjects")
}
func run() throws {
    let args = Array(CommandLine.arguments.dropFirst())
    if args == ["--self-test"] { try selfTest(); return }
    var outputPath: String?, cellSize = 336, inputs = [(String, String)](), cursor = 0
    while cursor < args.count {
        let arg = args[cursor]
        if arg == "--output" || arg == "--cell-size" {
            try require(cursor + 1 < args.count, "Missing value for \(arg)")
            cursor += 1
            if arg == "--output" { outputPath = args[cursor] }
            else { cellSize = Int(args[cursor]) ?? 0 }
        } else {
            let parts = arg.split(separator: "=", maxSplits: 1).map(String.init)
            try require(parts.count == 2 && parts[0].range(of: "^[a-z][a-z0-9-]*$", options: .regularExpression) != nil,
                "Input must be mascot=/absolute/source.png")
            inputs.append((parts[0], parts[1]))
        }
        cursor += 1
    }
    try require(outputPath != nil && !inputs.isEmpty && cellSize > 64,
        "Usage: repack-gradecrew-motion.swift --output directory [--cell-size 336] mascot=/absolute/source.png ...")
    try require(Set(inputs.map { $0.0 }).count == inputs.count, "Duplicate mascot names")
    // Validate every input before writing any deliverables.
    var deliverables = [(String, Data, Data)]()
    for (name, path) in inputs {
        let sourceData = try Data(contentsOf: URL(fileURLWithPath: path))
        let source = try Raster(path: path)
        let (output, records, analysis, kept, omitted, omitted128) = try pack(source, cellSize: cellSize)
        let encoded = try output.pngData()
        let manifest = Manifest(schemaVersion: 1, packer: "repack-gradecrew-motion.swift/v1", mascot: name,
            sourcePath: URL(fileURLWithPath: path).standardizedFileURL.path,
            sourceSHA256: sha(sourceData), outputSHA256: sha(encoded), sourceWidth: source.width,
            sourceHeight: source.height, outputWidth: output.width, outputHeight: output.height,
            columns: columns, rows: rows, frameCount: records.count, cellSize: cellSize, scale: 1,
            alphaThreshold: Int(threshold), significantComponentMinimumArea: minimumArea,
            antialiasHaloPixels: halo, ignoredSmallComponentCount: analysis.ignoredCount,
            ignoredSmallComponentMaxArea: analysis.ignoredMaxArea, retainedAlphaPixelCount: kept,
            omittedAlphaPixelCount: omitted, omittedAlpha128PixelCount: omitted128,
            cleanupPolicy: "Retain original decoded premultiplied RGBA of each alpha>=64 significant 8-connected subject plus its 4px Chebyshev antialias halo. Multi-source ownership excludes neighbors. Ignore unconnected tiny components and distant low-alpha source noise. No resampling, redrawing, mirroring, or frame synthesis.",
            alignment: "Row-major source order; integer horizontal centering of significant bounds; common bottom baseline at cellSize-20; scale=1 for all frames.",
            frames: records)
        let encoder = JSONEncoder(); encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
        deliverables.append((name, encoded, try encoder.encode(manifest)))
        print("\(name): 20 frames; \(output.width)x\(output.height); min retained gutter \(records.map(\.minimumRetainedEdgeDistance).min()!)px; edge violations 0; omitted alpha128 pixels \(omitted128)")
    }
    let directory = URL(fileURLWithPath: outputPath!, isDirectory: true)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    for (name, png, json) in deliverables {
        try png.write(to: directory.appendingPathComponent("\(name)-run-cuddle-v1.png"), options: .atomic)
        try json.write(to: directory.appendingPathComponent("\(name)-run-cuddle-v1.json"), options: .atomic)
    }
}
do { try run() }
catch { fputs("ERROR: \(error)\n", stderr); exit(1) }
