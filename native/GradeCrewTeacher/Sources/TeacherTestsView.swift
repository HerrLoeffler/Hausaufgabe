import SwiftUI

struct TeacherTestsView: View {
    @EnvironmentObject private var store: TeacherTestStore
    @State private var searchText = ""
    @State private var showCreate = false

    private var filteredTests: [GradeCrewTestSummary] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return store.tests }
        return store.tests.filter {
            $0.title.localizedCaseInsensitiveContains(query) ||
            $0.subject.localizedCaseInsensitiveContains(query) ||
            $0.gradeLabel.localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    ForEach(filteredTests) { test in
                        NavigationLink {
                            TeacherTestDetailView(test: test)
                        } label: {
                            TeacherTestCard(test: test)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .frame(maxWidth: 900)
                .padding(GradeCrewDesignTokens.Spacing.xl)
            }
            .background(GradeCrewDesignTokens.Colors.background)
            .navigationTitle("Meine Tests")
            .searchable(text: $searchText, prompt: "Tests durchsuchen")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showCreate = true
                    } label: {
                        Label("Neuen Test", systemImage: "plus")
                    }
                }
            }
            .refreshable { await store.refresh() }
            .sheet(isPresented: $showCreate) {
                TeacherWebPortalView(
                    title: "Neuen Test erstellen",
                    url: GradeCrewAppEnvironment.teacherURL(intent: "create")
                )
            }
        }
    }
}

struct TeacherTestCard: View {
    let test: GradeCrewTestSummary

    var body: some View {
        VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.md) {
            HStack(alignment: .top, spacing: GradeCrewDesignTokens.Spacing.md) {
                VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xs) {
                    Text(test.subject.uppercased())
                        .font(.system(size: GradeCrewDesignTokens.Typography.small, weight: .semibold))
                        .tracking(0.8)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    Text(test.title)
                        .font(.system(size: GradeCrewDesignTokens.Typography.cardTitle, weight: .semibold))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    Text(test.gradeLabel)
                        .font(.subheadline)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                }
                Spacer()
                TestStatusBadge(status: test.status)
            }

            Divider()

            HStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                Label("\(test.submissionCount) Abgaben", systemImage: "tray.full")
                Label(pointsText, systemImage: "star")
                Spacer()
                Text(test.updatedAt, style: .relative)
            }
            .font(.caption)
            .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
        .padding(GradeCrewDesignTokens.Spacing.lg)
        .background(GradeCrewDesignTokens.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous)
                .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
        }
        .contentShape(Rectangle())
    }

    private var pointsText: String {
        let value = test.totalPoints
        return value.rounded() == value ? "\(Int(value)) Punkte" : "\(value.formatted()) Punkte"
    }
}

struct TestStatusBadge: View {
    let status: GradeCrewTestStatus

    var body: some View {
        Label(status.label, systemImage: status.systemImage)
            .font(.caption.weight(.semibold))
            .foregroundStyle(foreground)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(background)
            .clipShape(Capsule())
    }

    private var foreground: Color {
        switch status {
        case .draft: return GradeCrewDesignTokens.Colors.muted
        case .published: return GradeCrewDesignTokens.Colors.positive
        case .ended: return GradeCrewDesignTokens.Colors.primaryPressed
        }
    }

    private var background: Color {
        switch status {
        case .draft: return GradeCrewDesignTokens.Colors.background
        case .published: return GradeCrewDesignTokens.Colors.positive.opacity(0.10)
        case .ended: return GradeCrewDesignTokens.Colors.soft
        }
    }
}
