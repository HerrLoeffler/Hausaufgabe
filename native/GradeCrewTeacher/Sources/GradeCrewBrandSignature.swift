import SwiftUI

/// All four crew members run toward the existing GradeCrew mark in one second.
/// The caller retains one start date across auth restoration and the home view.
struct GradeCrewBrandSignature: View {
    var animationStartedAt: Date = Date()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    private let atlases = GradeCrewMascotAtlasCache.crew

    var body: some View {
        Group {
            if scenePhase == .active && !reduceMotion && Date() < animationStartedAt.addingTimeInterval(GradeCrewBrandMotionPolicy.duration) {
                TimelineView(GradeCrewBrandMotionSchedule(startedAt: animationStartedAt)) { context in
                    formation(at: context.date)
                }
            } else {
                formation(at: Date())
            }
        }
        .frame(width: 260, height: 160)
        .clipped()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("GradeCrew mit Coco, Remy, Emmi und Wilma")
        .allowsHitTesting(false)
    }

    private func formation(at date: Date) -> some View {
        let sample = GradeCrewBrandMotionPolicy.sample(startedAt: animationStartedAt, now: date, reduceMotion: reduceMotion)
        return ZStack {
            Image(GradeCrewAssets.NativeImage.brandIcon)
                .resizable()
                .scaledToFit()
                .frame(width: 114, height: 114)
                .clipShape(Circle())
                .position(x: 130, y: 80)
            ForEach(GradeCrewBrandMotionPolicy.Mascot.allCases, id: \.self) { mascot in
                let center = sample.center(for: mascot)
                if let image = atlases[mascot]?.image(at: sample.frameIndex) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 74, height: 74)
                        .position(x: center.x, y: center.y)
                }
            }
        }
        .frame(width: 260, height: 160)
    }
}

/// Unlike an animation timeline, this schedule has no entries after one second.
/// Removing the TimelineView while inactive also stops all scheduled updates.
private struct GradeCrewBrandMotionSchedule: TimelineSchedule {
    let startedAt: Date

    func entries(from startDate: Date, mode: TimelineScheduleMode) -> [Date] {
        GradeCrewBrandMotionPolicy.refreshDates(startedAt: startedAt, from: startDate, reduceMotion: false, isActive: true)
    }
}
