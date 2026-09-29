import SwiftUI

@main
struct GradeCrewSecurePlaygroundApp: App {
    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.blue.ignoresSafeArea()

                VStack(spacing: 18) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 72))
                        .foregroundStyle(.white)

                    Text("GradeCrew Secure")
                        .font(.largeTitle.bold())
                        .foregroundStyle(.white)

                    Text("Der Playground startet korrekt.")
                        .font(.title3)
                        .foregroundStyle(.white.opacity(0.9))

                    Text("Diagnose-Build")
                        .font(.footnote.monospaced())
                        .foregroundStyle(.white.opacity(0.7))
                }
                .padding(32)
            }
        }
    }
}
