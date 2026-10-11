import UIKit

/// Each atlas is cropped once, outside the timeline body. A malformed atlas uses
/// the corresponding welcome artwork instead of a partial or incorrect frame.
struct GradeCrewMascotAtlas {
    let frames: [UIImage]
    let fallback: UIImage?

    init(atlasName: String, fallbackName: String, mascot: GradeCrewBrandMotionPolicy.Mascot) {
        fallback = UIImage(named: fallbackName)
        guard let atlas = UIImage(named: atlasName), atlas.imageOrientation == .up,
              let image = atlas.cgImage,
              image.width >= 4, image.height >= 5 else {
            frames = []
            return
        }
        let crops = (0..<GradeCrewBrandMotionPolicy.frameCount).compactMap { index -> UIImage? in
            guard let cell = GradeCrewAtlasGridPolicy.cell(index: index, width: image.width, height: image.height) else { return nil }
            let rect = CGRect(x: cell.x, y: cell.y, width: cell.width, height: cell.height)
            guard let crop = image.cropping(to: rect) else { return nil }
            let frame = UIImage(cgImage: crop, scale: atlas.scale, orientation: .up)
            return GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: mascot, index: index)
                ? frame.withHorizontallyFlippedOrientation() : frame
        }
        frames = crops.count == GradeCrewBrandMotionPolicy.frameCount ? crops : []
    }

    func image(at index: Int) -> UIImage? {
        frames.indices.contains(index) ? frames[index] : fallback
    }
}

/// Loading this cache prepares all 80 frames once for the process.
enum GradeCrewMascotAtlasCache {
    static let crew: [GradeCrewBrandMotionPolicy.Mascot: GradeCrewMascotAtlas] = [
        .coco: GradeCrewMascotAtlas(atlasName: GradeCrewAssets.NativeImage.cocoRunCuddle, fallbackName: GradeCrewAssets.NativeImage.cocoWelcome, mascot: .coco),
        .remy: GradeCrewMascotAtlas(atlasName: GradeCrewAssets.NativeImage.remyRunCuddle, fallbackName: GradeCrewAssets.NativeImage.remyWelcome, mascot: .remy),
        .emmi: GradeCrewMascotAtlas(atlasName: GradeCrewAssets.NativeImage.emmiRunCuddle, fallbackName: GradeCrewAssets.NativeImage.emmiWelcome, mascot: .emmi),
        .wilma: GradeCrewMascotAtlas(atlasName: GradeCrewAssets.NativeImage.wilmaRunCuddle, fallbackName: GradeCrewAssets.NativeImage.wilmaWelcome, mascot: .wilma),
    ]
}
