"""Verify actual atlas crop bounds, including generated non-divisible PNG sizes."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
checks = r'''
let first = GradeCrewAtlasGridPolicy.cell(index: 0, width: 1122, height: 1402)!
assert(first.x == 0 && first.y == 0 && first.width == 280 && first.height == 280)
let final = GradeCrewAtlasGridPolicy.cell(index: 19, width: 1122, height: 1402)!
assert(final.x == 841 && final.y == 1121, "Twentieth frame must be row-major bottom-right")
assert(final.width == 281 && final.height == 281, "Last cell must preserve right and bottom edge pixels")
for row in 0..<5 {
    var nextX = 0
    for col in 0..<4 {
        let cell = GradeCrewAtlasGridPolicy.cell(index: row * 4 + col, width: 1122, height: 1402)!
        assert(cell.x == nextX, "No overlap or omitted pixels between horizontal cells")
        nextX = cell.x + cell.width
    }
    assert(nextX == 1122)
}
for col in 0..<4 {
    var nextY = 0
    for row in 0..<5 {
        let cell = GradeCrewAtlasGridPolicy.cell(index: row * 4 + col, width: 1122, height: 1402)!
        assert(cell.y == nextY, "No overlap or omitted pixels between vertical cells")
        nextY = cell.y + cell.height
    }
    assert(nextY == 1402)
}
assert(GradeCrewAtlasGridPolicy.cell(index: -1, width: 1122, height: 1402) == nil)
assert(GradeCrewAtlasGridPolicy.cell(index: 20, width: 1122, height: 1402) == nil)
assert(GradeCrewAtlasGridPolicy.cell(index: 0, width: 3, height: 5) == nil)
assert(GradeCrewAtlasGridPolicy.cell(index: 0, width: 4, height: 4) == nil)
assert(GradeCrewAtlasGridPolicy.cell(index: 0, width: 0, height: 0) == nil)
print("GradeCrew mascot atlas grid: passed (20 bounded row-major crops, non-divisible dimensions, invalid atlas rejection)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "atlas-grid.swift"
    source = root / "Sources/GradeCrewAtlasGridPolicy.swift"
    script.write_text(source.read_text() + "\n" + checks)
    subprocess.run(["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)], check=True)
