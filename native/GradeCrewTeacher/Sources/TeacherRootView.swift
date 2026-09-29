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
            PlaceholderView(title: "Meine Tests", message: "Hier erscheinen als Nächstes die echten GradeCrew-Tests aus Firestore.")
        case .classes:
            PlaceholderView(title: "Klassen", message: "Klassen und Zuweisungen folgen nach dem ersten Test-Workflow.")
        case .settings:
            PlaceholderView(title: "Einstellungen", message: "Die App verwendet dieselben GradeCrew-Grundwerte wie die Webplattform.")
        }
    }
}

private struct PlaceholderView: View {
    let title: String
    let message: String

    var body: some View {
        ZStack {
            GradeCrewDesignTokens.Colors.background.ignoresSafeArea()
            VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                Image(systemName: "hammer")
                    .font(.system(size: 34))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                Text(title)
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                Text(message)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .frame(maxWidth: 460)
            }
            .padding(GradeCrewDesignTokens.Spacing.xl)
        }
        .navigationTitle(title)
    }
}
