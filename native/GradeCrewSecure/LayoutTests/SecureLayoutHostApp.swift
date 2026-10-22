import SwiftUI
@main struct SecureLayoutHostApp: App {
    var body: some Scene {
        WindowGroup {
            if ProcessInfo.processInfo.arguments.contains("--secure-lifecycle-ui") { SecureLifecycleUIHost() }
            else { Color.clear }
        }
    }
}
