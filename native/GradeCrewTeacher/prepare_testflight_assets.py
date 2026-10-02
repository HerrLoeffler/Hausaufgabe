"""Prepare the canonical GradeCrew AppIcon for the Teacher iOS app.

The source of truth is shared/gradecrew-design/assets.json. The selected brand.icon
stays vector in the repository; this build step rasterizes it to the opaque
1024x1024 PNG required by the iOS AppIcon asset catalog.
"""
from pathlib import Path
import hashlib
import json
import shutil
import struct
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
MANIFEST = json.loads((REPO / "shared/gradecrew-design/assets.json").read_text())
TOKENS = json.loads((REPO / "shared/gradecrew-design/tokens.json").read_text())

BRAND_ICON = REPO / MANIFEST["root"] / MANIFEST["brand"]["icon"]
BACKGROUND = TOKENS["colors"]["surface"].lstrip("#")
SIZE = 1024
INSET = 64
PREVIEW_SIZE = SIZE - (2 * INSET)

resources = ROOT / "Resources" / "Assets.xcassets"
appicon = resources / "AppIcon.appiconset"
appicon.mkdir(parents=True, exist_ok=True)
output_png = appicon / "AppIcon.png"


def rgb_from_hex(value: str) -> tuple[int, int, int]:
    if len(value) != 6:
        raise ValueError(f"Expected six-digit RGB color, got #{value}")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def flatten_with_core_graphics(source: Path, destination: Path) -> None:
    """Composite an image over the brand surface and emit an opaque RGB PNG."""
    red, green, blue = rgb_from_hex(BACKGROUND)
    swift = r'''
import AppKit
import CoreGraphics
import Foundation

let args = CommandLine.arguments
if args.count != 8 { exit(64) }
let source = URL(fileURLWithPath: args[1])
let destination = URL(fileURLWithPath: args[2])
let size = Int(args[3])!
let inset = CGFloat(Double(args[4])!)
let red = CGFloat(Double(args[5])!) / 255.0
let green = CGFloat(Double(args[6])!) / 255.0
let blue = CGFloat(Double(args[7])!) / 255.0

guard let image = NSImage(contentsOf: source) else {
    fputs("Could not load rendered icon image.\n", stderr)
    exit(2)
}
var proposedRect = NSRect(origin: .zero, size: image.size)
guard let sourceCG = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
    fputs("Could not obtain CGImage from rendered icon.\n", stderr)
    exit(3)
}

let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.noneSkipLast.rawValue)
guard let context = CGContext(
    data: nil,
    width: size,
    height: size,
    bitsPerComponent: 8,
    bytesPerRow: size * 4,
    space: colorSpace,
    bitmapInfo: bitmapInfo.rawValue
) else {
    fputs("Could not create CoreGraphics bitmap context.\n", stderr)
    exit(4)
}

context.setFillColor(CGColor(red: red, green: green, blue: blue, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: size, height: size))
context.interpolationQuality = .high
let target = CGRect(
    x: inset,
    y: inset,
    width: CGFloat(size) - (2 * inset),
    height: CGFloat(size) - (2 * inset)
)
context.draw(sourceCG, in: target)

guard let flattened = context.makeImage() else {
    fputs("Could not create flattened CGImage.\n", stderr)
    exit(5)
}
let bitmap = NSBitmapImageRep(cgImage: flattened)
guard let data = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Could not encode flattened image as PNG.\n", stderr)
    exit(6)
}
do {
    try data.write(to: destination, options: .atomic)
} catch {
    fputs("Could not write PNG: \(error)\n", stderr)
    exit(7)
}
'''
    with tempfile.TemporaryDirectory(prefix="gradecrew-appicon-swift-") as temp:
        script = Path(temp) / "flatten.swift"
        script.write_text(swift)
        result = subprocess.run(
            [
                "swift", str(script), str(source), str(destination), str(SIZE), str(INSET),
                str(red), str(green), str(blue),
            ],
            text=True,
            capture_output=True,
        )
        if result.returncode != 0:
            details = (result.stderr or result.stdout or "unknown CoreGraphics error").strip()
            raise SystemExit(f"Could not flatten GradeCrew AppIcon: {details}")


def render_icon() -> None:
    if not BRAND_ICON.is_file():
        raise SystemExit(
            f"Canonical GradeCrew brand icon is missing: {BRAND_ICON}. "
            "Sync the asset referenced by shared/gradecrew-design/assets.json first."
        )
    if shutil.which("qlmanage") is None:
        raise SystemExit("qlmanage is required to rasterize the canonical GradeCrew SVG on macOS CI.")

    # Quick Look reliably rasterizes the canonical SVG on GitHub's macOS runner.
    # CoreGraphics then composites it onto an opaque brand surface, because App
    # Store icons must not carry transparency.
    with tempfile.TemporaryDirectory(prefix="gradecrew-appicon-preview-") as temp:
        temp_dir = Path(temp)
        result = subprocess.run(
            ["qlmanage", "-t", "-s", str(PREVIEW_SIZE), "-o", str(temp_dir), str(BRAND_ICON)],
            text=True,
            capture_output=True,
        )
        if result.returncode != 0:
            details = (result.stderr or result.stdout or "unknown Quick Look error").strip()
            raise SystemExit(f"Could not rasterize GradeCrew SVG: {details}")
        previews = sorted(temp_dir.glob("*.png"))
        if not previews:
            raise SystemExit("Quick Look did not produce a PNG preview for the GradeCrew icon.")
        flatten_with_core_graphics(previews[0], output_png)


def verify_png(path: Path) -> None:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise SystemExit("Generated AppIcon is not a valid PNG.")
    width, height = struct.unpack(">II", data[16:24])
    color_type = data[25]
    if (width, height) != (SIZE, SIZE):
        raise SystemExit(f"Generated AppIcon has wrong dimensions: {width}x{height}")
    if color_type not in (2, 3):
        raise SystemExit(f"Generated AppIcon unexpectedly contains an alpha-capable PNG color type: {color_type}")


render_icon()
verify_png(output_png)

(appicon / "Contents.json").write_text(json.dumps({
    "images": [{
        "filename": "AppIcon.png",
        "idiom": "universal",
        "platform": "ios",
        "size": "1024x1024"
    }],
    "info": {"author": "xcode", "version": 1}
}, indent=2) + "\n")

(resources / "Contents.json").write_text(json.dumps({
    "info": {"author": "xcode", "version": 1}
}, indent=2) + "\n")

fingerprint = hashlib.sha256(BRAND_ICON.read_bytes()).hexdigest()[:12]
print(
    "Prepared canonical GradeCrew AppIcon "
    f"from {MANIFEST['root']}/{MANIFEST['brand']['icon']} "
    f"(sha256:{fingerprint}, opaque {SIZE}x{SIZE})."
)
