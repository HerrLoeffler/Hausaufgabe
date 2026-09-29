import SwiftUI

@main
struct GradeCrewTeacherApp: App {
    @StateObject private var testStore = TeacherTestStore()

    var body: some Scene {
        WindowGroup {
            TeacherRootView()
                .environmentObject(testStore)
                .tint(GradeCrewDesignTokens.Colors.primary)
        }
    }
}
