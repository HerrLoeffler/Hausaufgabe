import SwiftUI

struct TeacherRootView: View {
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadID = 0

    var body: some View {
        ZStack(alignment: .top) {
            GradeCrewWebView(
                url: GradeCrewAppEnvironment.teacherHomeURL,
                reloadID: reloadID,
                isLoading: $isLoading,
                errorMessage: $loadError
            )
            .ignoresSafeArea(edges: .bottom)

            if isLoading {
                ProgressView()
                    .progressViewStyle(.linear)
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .frame(maxWidth: .infinity)
                    .accessibilityLabel("GradeCrew wird geladen")
            }

            if let loadError {
                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 34, weight: .semibold))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.primary)

                    Text("GradeCrew konnte nicht geladen werden")
                        .font(.headline)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)

                    Text(loadError)
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)

                    Button("Erneut versuchen") {
                        self.loadError = nil
                        self.isLoading = true
                        reloadID += 1
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(GradeCrewDesignTokens.Spacing.xl)
                .frame(maxWidth: 420)
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous))
                .shadow(radius: 18, y: 8)
                .padding(GradeCrewDesignTokens.Spacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(GradeCrewDesignTokens.Colors.background)
    }
}
