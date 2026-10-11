/// Integral row-major crops for the 4 by 5 generated sprite atlas.
enum GradeCrewAtlasGridPolicy {
    struct Cell {
        let x: Int
        let y: Int
        let width: Int
        let height: Int
    }

    static func cell(index: Int, width: Int, height: Int) -> Cell? {
        guard (0..<20).contains(index), width >= 4, height >= 5 else { return nil }
        let column = index % 4
        let row = index / 4
        let left = column * width / 4
        let right = (column + 1) * width / 4
        let top = row * height / 5
        let bottom = (row + 1) * height / 5
        return Cell(x: left, y: top, width: right - left, height: bottom - top)
    }
}
