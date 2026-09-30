"""Create deterministic beta AppIcon assets for GradeCrew Teacher.

The final app icon can replace this later. This keeps the first cloud/TestFlight
build self-contained and derives the beta icon color from the shared design tokens.
"""
from pathlib import Path
import json
import struct
import zlib

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
TOKENS = json.loads((REPO / "shared/gradecrew-design/tokens.json").read_text())
PRIMARY = TOKENS["colors"]["primary"].lstrip("#")
RGB = tuple(int(PRIMARY[i:i+2], 16) for i in (0, 2, 4))

SIZE = 1024
resources = ROOT / "Resources" / "Assets.xcassets"
appicon = resources / "AppIcon.appiconset"
appicon.mkdir(parents=True, exist_ok=True)


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def segment_distance(px, py, ax, ay, bx, by):
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    denom = abx * abx + aby * aby
    t = 0.0 if denom == 0 else max(0.0, min(1.0, (apx * abx + apy * aby) / denom))
    cx, cy = ax + t * abx, ay + t * aby
    dx, dy = px - cx, py - cy
    return (dx * dx + dy * dy) ** 0.5


# Solid GradeCrew blue with a simple white checkmark, deliberately without text.
rows = []
for y in range(SIZE):
    row = bytearray([0])  # PNG filter byte
    for x in range(SIZE):
        r, g, b = RGB
        # Checkmark built from two thick strokes.
        d1 = segment_distance(x, y, 270, 540, 435, 705)
        d2 = segment_distance(x, y, 435, 705, 770, 350)
        if min(d1, d2) <= 54:
            r, g, b = 255, 255, 255
        row.extend((r, g, b))
    rows.append(bytes(row))
raw = b"".join(rows)

png = b"\x89PNG\r\n\x1a\n"
png += png_chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0))
png += png_chunk(b"IDAT", zlib.compress(raw, 9))
png += png_chunk(b"IEND", b"")
(appicon / "AppIcon.png").write_bytes(png)

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

print(f"Prepared GradeCrew beta AppIcon from shared primary color #{PRIMARY}.")
