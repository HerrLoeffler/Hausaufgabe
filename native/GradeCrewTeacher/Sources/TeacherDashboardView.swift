import SwiftUI

struct TeacherDashboardView: View {
    @EnvironmentObject private var store: TeacherTestStore
    @State private var showCreate = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xl) {
                header
                statusOverview
                primaryAction
                recentSection
            }
            .frame(maxWidth: 980, alignment: .leading)
            .padding(GradeCrewDesignTokens.Spacing.xl)
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .navigationTitle("Übersicht")
        .sheet(isPresented: $showCreate) {
            TeacherWebPortalView(
                title: "Neuen Test erstellen",
                url: GradeCrewAppEnvironment.teacherURL(intent: "create")
            )
        }
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

    private var statusOverview: some View {
        HStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
            dashboardMetric(value: store.publishedCount, label: "Veröffentlicht", systemImage: "checkmark.circle.fill")
            dashboardMetric(value: store.draftCount, label: "Entwürfe", systemImage: "pencil")
            dashboardMetric(value: store.endedCount, label: "Beendet", systemImage: "archivebox.fill")
        }
    }

    private func dashboardMetric(value: Int, label: String, systemImage: String) -> some View {
        HStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
            Image(systemName: systemImage)
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            VStack(alignment: .leading, spacing: 1) {
                Text("\(value)")
                    .font(.headline)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                Text(label)
                    .font(.caption)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(GradeCrewDesignTokens.Spacing.md)
        .background(GradeCrewDesignTokens.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.panel, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.panel, style: .continuous)
                .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
        }
    }

    private var primaryAction: some View {
        Button {
            showCreate = true
        } label: {
            Label("Neuen Test erstellen", systemImage: "plus")
                .font(.system(size: GradeCrewDesignTokens.Typography.button, weight: .semibold))
                .frame(minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
        }
        .buttonStyle(.borderedProminent)
        .buttonBorderShape(.roundedRectangle(radius: GradeCrewDesignTokens.Radius.control))
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.md) {
            Text("Zuletzt verwendet")
                .font(.title3.weight(.semibold))
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)

            ForEach(Array(store.tests.prefix(3))) { test in
                TeacherTestCard(test: test)
            }

            Text("Testdaten für den ersten nativen Build · echte GradeCrew-Daten folgen mit Firebase.")
                .font(.caption)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
    }
}
