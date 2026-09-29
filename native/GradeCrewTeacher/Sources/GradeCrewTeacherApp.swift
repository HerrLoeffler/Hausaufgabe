import SwiftUI

@main
struct GradeCrewTeacherApp: App {
    var body: some Scene {
        WindowGroup {
            TeacherRootView()
                .tint(GradeCrewDesignTokens.Colors.primary)
        }
    }
}
