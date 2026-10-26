import SwiftUI

struct GradeCrewAuthRestoringView<Feedback: View>: View {
    let animationStartedAt: Date
    var isWaiting = true
    @ViewBuilder let feedback: Feedback

    var body: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
            GradeCrewBrandSignature(animationStartedAt: animationStartedAt)
                .gcLayout("restore.brand", role: "center")
            if isWaiting {
                ProgressView("Anmeldung wird wiederhergestellt …")
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .accessibilityLabel("Gespeicherte GradeCrew-Anmeldung wird geprüft")
                    .gcLayout("restore.progress", role: "center", text: "Anmeldung wird wiederhergestellt …", fontSize: 17)
            }
            feedback
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(GradeCrewDesignTokens.Spacing.xl)
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

}
