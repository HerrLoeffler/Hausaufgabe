import SwiftUI

/// The actual signed-in start screen, independent of authentication/network ownership.
struct GradeCrewHomeMenuView<Feedback: View>: View {
    let animationStartedAt: Date
    let accountLabel: String
    let isAuthRestored: Bool
    let workspaceOpening: Bool
    let auditMessage: String?
    let auditNeedsReview: Bool
    let openRemy: () -> Void
    let openWorkspace: () -> Void
    @ViewBuilder let feedback: Feedback

    var body: some View {
        ScrollView {
            VStack(spacing: GradeCrewDesignTokens.Spacing.xxl) {
                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    GradeCrewBrandSignature(animationStartedAt: animationStartedAt)
                        .gcLayout("home.brand", role: "center")
                    Text("Was möchtest du tun?")
                        .font(.system(size: GradeCrewDesignTokens.Typography.pageTitle, weight: .semibold, design: .rounded))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                        .gcLayout("home.heading", role: "center", text: "Was möchtest du tun?", fontSize: 34)
                    Label(accountLabel, systemImage: "person.crop.circle.fill")
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityLabel("Angemeldet als \(accountLabel)")
                }
                .padding(.top, GradeCrewDesignTokens.Spacing.lg)
                .padding(.horizontal, GradeCrewLayoutGuides.pageInset)

                HStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                    actionCard(
                        title: "Keine Zeit?",
                        subtitle: "Sag mir kurz, welchen Test du brauchst.",
                        symbol: "mic.fill",
                        illustration: GradeCrewAssets.NativeImage.remyMicrophoneForward,
                        tint: GradeCrewDesignTokens.Colors.crewRust,
                        action: openRemy
                    )
                    actionCard(
                        title: "GradeCrew öffnen",
                        subtitle: "Tests ansehen und bearbeiten",
                        symbol: "graduationcap.fill",
                        illustration: GradeCrewAssets.NativeImage.brandIcon,
                        tint: GradeCrewDesignTokens.Colors.primary,
                        action: openWorkspace
                    )
                }
                .gcLayout("home.actions", role: "center")
                .frame(maxWidth: GradeCrewLayoutGuides.menuMaxWidth)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

                if let auditMessage {
                    Text(auditMessage)
                        .font(.footnote)
                        .foregroundStyle(auditNeedsReview ? GradeCrewDesignTokens.Colors.danger : GradeCrewDesignTokens.Colors.muted)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 480)
                        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
                }
                if workspaceOpening { ProgressView("Deine Tests werden geöffnet …").font(.footnote) }
                feedback
            }
            .frame(maxWidth: .infinity)
            .padding(.bottom, GradeCrewDesignTokens.Spacing.xxl)
        }
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

    private func actionCard(title: String, subtitle: String, symbol: String, illustration: String? = nil, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                if let illustration {
                    Image(illustration)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 104, height: 78)
                        .accessibilityHidden(true)
                    .frame(height: 78)
                } else {
                    Image(systemName: symbol)
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(tint)
                        .frame(height: 78)
                }
                Text(title)
                    .font(.system(size: GradeCrewDesignTokens.Typography.cardTitle, weight: .semibold))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    .multilineTextAlignment(.center)
                Text(subtitle)
                    .font(.system(size: GradeCrewDesignTokens.Typography.body))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, minHeight: 196)
            .padding(GradeCrewDesignTokens.Spacing.lg)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.largeCard))
            .overlay {
                RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.largeCard)
                    .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
            }
        }
        .gcLayout(title == "Keine Zeit?" ? "home.remy" : "home.workspace", role: "tap")
        .buttonStyle(.plain)
        .disabled(!isAuthRestored || workspaceOpening)
        .opacity(isAuthRestored ? 1 : 0.55)
        .accessibilityHint(isAuthRestored ? subtitle : "Aktionen verfügbar, sobald die Anmeldung geprüft wurde.")
    }

}
