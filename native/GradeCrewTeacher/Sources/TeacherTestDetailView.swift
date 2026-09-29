import SwiftUI

struct TeacherTestDetailView: View {
    let test: GradeCrewTestSummary
    @State private var showEditor = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xl) {
                header
                metrics
                actions
                note
            }
            .frame(maxWidth: 760, alignment: .leading)
            .padding(GradeCrewDesignTokens.Spacing.xl)
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .navigationTitle(test.title)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showEditor) {
            TeacherWebPortalView(
                title: test.title,
                url: GradeCrewAppEnvironment.teacherURL(intent: "edit")
            )
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
            TestStatusBadge(status: test.status)
            Text(test.subject.uppercased())
                .font(.caption.weight(.semibold))
                .tracking(0.8)
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            Text(test.title)
                .font(.system(size: 30, weight: .bold))
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)
            Text(test.gradeLabel)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
    }

    private var metrics: some View {
        HStack(spacing: GradeCrewDesignTokens.Spacing.md) {
            metric(value: "\(test.submissionCount)", label: "Abgaben", systemImage: "tray.full")
            metric(value: pointsText, label: "Gesamtpunkte", systemImage: "star")
            metric(value: test.updatedAt.formatted(date: .abbreviated, time: .shortened), label: "Zuletzt geändert", systemImage: "clock")
        }
    }

    private func metric(value: String, label: String, systemImage: String) -> some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xs) {
            Image(systemName: systemImage)
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            Text(value)
                .font(.headline)
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)
            Text(label)
                .font(.caption)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(GradeCrewDesignTokens.Spacing.lg)
        .background(GradeCrewDesignTokens.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.panel, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.panel, style: .continuous)
                .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
        }
    }

    private var actions: some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.md) {
            Text("Aktionen")
                .font(.headline)
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)

            Button {
                showEditor = true
            } label: {
                Label("Im GradeCrew-Editor öffnen", systemImage: "square.and.pencil")
                    .frame(maxWidth: .infinity, minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
            }
            .buttonStyle(.borderedProminent)
            .buttonBorderShape(.roundedRectangle(radius: GradeCrewDesignTokens.Radius.control))

            Button(action: {}) {
                Label("Code & Freigabe", systemImage: "qrcode")
                    .frame(maxWidth: .infinity, minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
            }
            .buttonStyle(.bordered)
            .buttonBorderShape(.roundedRectangle(radius: GradeCrewDesignTokens.Radius.control))
            .disabled(true)

            Button(action: {}) {
                Label("Abgaben ansehen", systemImage: "checklist")
                    .frame(maxWidth: .infinity, minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
            }
            .buttonStyle(.bordered)
            .buttonBorderShape(.roundedRectangle(radius: GradeCrewDesignTokens.Radius.control))
            .disabled(true)
        }
    }

    private var note: some View {
        Label(
            "Dieser App-Stand nutzt für die native Oberfläche Testdaten. Der Editor öffnet bereits die GradeCrew-Staging-Umgebung. Firebase-Login und echte Testdaten sind der nächste Integrationsschritt.",
            systemImage: "hammer.fill"
        )
        .font(.footnote)
        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        .padding(GradeCrewDesignTokens.Spacing.lg)
        .background(GradeCrewDesignTokens.Colors.soft)
        .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.panel, style: .continuous))
    }

    private var pointsText: String {
        test.totalPoints.rounded() == test.totalPoints
            ? "\(Int(test.totalPoints))"
            : test.totalPoints.formatted()
    }
}
