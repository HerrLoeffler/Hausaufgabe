import SwiftUI

struct TeacherRootView: View {
    enum Destination: String, CaseIterable, Identifiable {
        case dashboard = "Übersicht"
        case tests = "Meine Tests"
        case classes = "Klassen"
        case settings = "Einstellungen"

        var id: String { rawValue }

        var systemImage: String {
            switch self {
            case .dashboard: return "house"
            case .tests: return "doc.text"
            case .classes: return "person.3"
            case .settings: return "gearshape"
            }
        }
    }

    @State private var selection: Destination? = .dashboard

    var body: some View {
        NavigationSplitView {
            List(Destination.allCases, selection: $selection) { destination in
                Label(destination.rawValue, systemImage: destination.systemImage)
                    .tag(destination)
            }
            .navigationTitle("GradeCrew")
        } detail: {
            content(for: selection ?? .dashboard)
        }
    }

    @ViewBuilder
    private func content(for destination: Destination) -> some View {
        switch destination {
        case .dashboard:
            TeacherDashboardView()
        case .tests:
            TeacherTestsView()
        case .classes:
            TeacherPlaceholderView(
                title: "Klassen",
                systemImage: "person.3",
                message: "Klassen, Schülerkürzel und Testzuweisungen folgen nach der Firebase-Anbindung."
            )
        case .settings:
            TeacherPlaceholderView(
                title: "Einstellungen",
                systemImage: "gearshape",
                message: "Die App verwendet bereits dieselben GradeCrew-Designwerte wie die Webplattform."
            )
        }
    }
}

private struct TeacherPlaceholderView: View {
    let title: String
    let systemImage: String
    let message: String

    var body: some View {
        ZStack {
            GradeCrewDesignTokens.Colors.background.ignoresSafeArea()
            VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                Image(systemName: systemImage)
                    .font(.system(size: 38))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                Text(title)
                    .font(.title2.bold())
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                Text(message)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .frame(maxWidth: 440)
            }
            .padding(GradeCrewDesignTokens.Spacing.xl)
        }
        .navigationTitle(title)
    }
}
