import SwiftUI

struct TeacherDashboardView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xl) {
                header
                primaryAction
                sectionTitle
                emptyState
            }
            .frame(maxWidth: 980, alignment: .leading)
            .padding(GradeCrewDesignTokens.Spacing.xl)
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .navigationTitle("Übersicht")
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
            Text("DEIN ARBEITSBEREICH")
                .font(.system(size: GradeCrewDesignTokens.Typography.small, weight: .semibold))
                .tracking(1.2)
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)

            Text("Meine Tests")
                .font(.system(size: 34, weight: .bold))
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)

            Text("Alles für deinen nächsten Leistungsnachweis an einem Ort.")
                .font(.system(size: GradeCrewDesignTokens.Typography.body))
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
    }

    private var primaryAction: some View {
        Button(action: {}) {
            Label("Neuen Test erstellen", systemImage: "plus")
                .font(.system(size: GradeCrewDesignTokens.Typography.button, weight: .semibold))
                .frame(minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
        }
        .buttonStyle(.borderedProminent)
        .buttonBorderShape(.roundedRectangle(radius: GradeCrewDesignTokens.Radius.control))
    }

    private var sectionTitle: some View {
        HStack {
            Text("Zuletzt verwendet")
                .font(.title3.weight(.semibold))
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)
            Spacer()
        }
    }

    private var emptyState: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 34))
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)

            Text("Noch keine Tests geladen")
                .font(.headline)
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)

            Text("Im nächsten Schritt verbinden wir hier dieselben GradeCrew-Tests, die du bereits aus der Webplattform kennst.")
                .multilineTextAlignment(.center)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .frame(maxWidth: 460)
        }
        .frame(maxWidth: .infinity)
        .padding(GradeCrewDesignTokens.Spacing.xxxl)
        .background(GradeCrewDesignTokens.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous)
                .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
        }
    }
}
