"""Decode the shipped motion atlases and verify all20 drawable transparent frames."""
from pathlib import Path
import json
import subprocess
import tempfile

root = Path(__file__).parent
repo = root.parent.parent
manifest = json.loads((repo / "shared/gradecrew-design/assets.json").read_text())
checks = r"""
import Foundation
import CoreGraphics
import ImageIO
import CryptoKit

for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        fatalError("Motion atlas cannot decode: " + path)
    }
    assert(image.width >= 256 && image.height >= 320, "Atlas must have adequate pixel resolution")
    var hashes = Set<String>()
    for index in 0..<20 {
        let cell = GradeCrewAtlasGridPolicy.cell(index: index, width: image.width, height: image.height)!
        let cropped = image.cropping(to: CGRect(x: cell.x, y: cell.y, width: cell.width, height: cell.height))!
        let count = cell.width * cell.height
        var rgba = [UInt8](repeating: 0, count: count * 4)
        rgba.withUnsafeMutableBytes { storage in
            let context = CGContext(data: storage.baseAddress, width: cell.width, height: cell.height,
                bitsPerComponent: 8, bytesPerRow: cell.width * 4, space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            context.draw(cropped, in: CGRect(x: 0, y: 0, width: cell.width, height: cell.height))
        }
        var transparent = 0
        var visible = 0
        var edgePixels = 0
        for pixel in 0..<count {
            let alpha = rgba[pixel * 4 + 3]
            if alpha == 0 { transparent += 1 }
            if alpha > 64 { visible += 1 }
            let x = pixel % cell.width
            let y = pixel / cell.width
            if alpha >= 128 && (x < 4 || y < 4 || x >= cell.width - 4 || y >= cell.height - 4) { edgePixels += 1 }
        }
        assert(edgePixels == 0, "A pose touches its crop boundary: chopped head/feet or neighbor bleed")
        assert(transparent > count / 20, "Every frame must retain real clear space, not a painted background")
        assert(visible > count / 10, "Every cropped frame must contain a complete drawable mascot")
        hashes.insert(SHA256.hash(data: Data(rgba)).map { String(format: "%02x", $0) }.joined())
    }
    assert(hashes.count >= 12, "A static portrait copied20times is not a run-to-cuddle sequence")
    print("GradeCrew motion artwork:20drawable transparent frames verified in " + url.lastPathComponent)
}
"""
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "motion-art.swift"
    script.write_text((root / "Sources/GradeCrewAtlasGridPolicy.swift").read_text() + "\n" + checks)
    binary = Path(work) / "motion-art"
    subprocess.run(["swiftc", "-module-cache-path", str(Path(work) / "module-cache"), str(script), "-o", str(binary)], check=True)
    atlases = [repo / manifest["root"] / manifest["mascots"][name]["runCuddle"] for name in ["coco", "remy", "emmi", "wilma"]]
    subprocess.run([str(binary), *map(str, atlases)], check=True)
