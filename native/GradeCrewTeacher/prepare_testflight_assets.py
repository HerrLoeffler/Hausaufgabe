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

resources = ROOT / "Resources" / "Assets.xcassets"
appicon = resources / "AppIcon.appiconset"
appicon.mkdir(parents=True, exist_ok=True)
output_png = appicon / "AppIcon.png"


def rgb_from_hex(value: str) -> tuple[int, int, int]:
    if len(value) != 6:
        raise ValueError(f"Expected six-digit RGB color, got #{value}")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def appkit_render(source: Path, destination: Path) -> bool:
    """Render through AppKit and force an opaque RGB bitmap."""
    red, green, blue = rgb_from_hex(BACKGROUND)
    swift = r'''
import AppKit
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

guard let image = NSImage(contentsOf: source) else { exit(2) }
guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: size,
    pixelsHigh: size,
    bitsPerSample: 8,
    samplesPerPixel: 3,
    hasAlpha: false,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 24
) else { exit(3) }
bitmap.size = NSSize(width: size, height: size)

guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else { exit(4) }
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = .high
NSColor(calibratedRed: red, green: green, blue: blue, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()
let target = NSRect(
    x: inset,
    y: inset,
    width: CGFloat(size) - (2 * inset),
    height: CGFloat(size) - (2 * inset)
)
image.draw(in: target, from: NSRect(origin: .zero, size: image.size), operation: .sourceOver, fraction: 1.0)
NSGraphicsContext.restoreGraphicsState()

guard let data = bitmap.representation(using: .png, properties: [:]) else { exit(5) }
do {
    try data.write(to: destination, options: .atomic)
} catch {
    fputs("Could not write PNG: \(error)\n", stderr)
    exit(6)
}
'''
    with tempfile.TemporaryDirectory(prefix="gradecrew-appicon-swift-") as temp:
        script = Path(temp) / "render.swift"
        script.write_text(swift)
        result = subprocess.run(
            [
                "swift", str(script), str(source), str(destination), str(SIZE), str(INSET),
                str(red), str(green), str(blue),
            ],
            text=True,
            capture_output=True,
        )
        if result.returncode == 0:
            return True
        print(result.stdout)
        print(result.stderr)
        return False


def render_icon() -> None:
    if not BRAND_ICON.is_file():
        raise SystemExit(
            f"Canonical GradeCrew brand icon is missing: {BRAND_ICON}. "
            "Sync the asset referenced by shared/gradecrew-design/assets.json first."
        )

    # Modern macOS/AppKit can load the canonical SVG directly. Keep a Quick Look
    # fallback so the CI path remains robust if an image decoder changes.
    if appkit_render(BRAND_ICON, output_png):
        return

    if shutil.which("qlmanage") is None:
        raise SystemExit("Could not render SVG with AppKit and qlmanage is unavailable.")

    with tempfile.TemporaryDirectory(prefix="gradecrew-appicon-preview-") as temp:
        temp_dir = Path(temp)
        subprocess.run(
            ["qlmanage", "-t", "-s", str(SIZE), "-o", str(temp_dir), str(BRAND_ICON)],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        previews = sorted(temp_dir.glob("*.png"))
        if not previews:
            raise SystemExit("Quick Look did not produce a PNG preview for the GradeCrew icon.")
        if not appkit_render(previews[0], output_png):
            raise SystemExit("Could not flatten the rendered GradeCrew icon into an opaque AppIcon PNG.")


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
