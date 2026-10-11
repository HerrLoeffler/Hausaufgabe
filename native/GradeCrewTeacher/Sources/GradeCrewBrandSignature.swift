import SwiftUI

/// Existing crew artwork surrounds the central GradeCrew mark.
/// Entrance motion is decorative and never gates authentication or navigation.
struct GradeCrewBrandSignature: View {
    var animateEntrance = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var formed = false

    private var visible: Bool { !animateEntrance || reduceMotion || formed }

    var body: some View {
        HStack(spacing: 16) {
            VStack(spacing: 4) {
                portrait(GradeCrewAssets.NativeImage.cocoWelcome, position: 0)
                portrait(GradeCrewAssets.NativeImage.remyWelcome, position: 1)
            }
            Image(GradeCrewAssets.NativeImage.brandIcon)
                .resizable()
                .scaledToFit()
                .frame(width: 84, height: 84)
                .clipShape(Circle())
            VStack(spacing: 4) {
                portrait(GradeCrewAssets.NativeImage.emmiWelcome, position: 2)
                portrait(GradeCrewAssets.NativeImage.wilmaWelcome, position: 3)
            }
        }
        .frame(width: 260, height: 132)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("GradeCrew mit Coco, Remy, Emmi und Wilma")
        .allowsHitTesting(false)
        .onAppear { formed = true }
    }

    private func portrait(_ image: String, position: Int) -> some View {
        Image(image)
            .resizable()
            .scaledToFit()
            .frame(width: 64, height: 64)
            .blendMode(.multiply)
            .opacity(visible ? 1 : 0)
            .offset(x: visible ? 0 : (position < 2 ? -24 : 24), y: visible ? 0 : 8)
            .scaleEffect(visible ? 1 : 0.94)
            .animation(
                animateEntrance && !reduceMotion
                    ? .easeOut(duration: 0.28).delay(Double(position) * 0.035)
                    : nil,
                value: formed
            )
    }
}
