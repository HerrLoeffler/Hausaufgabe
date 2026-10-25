import SwiftUI
@main struct SecureLayoutHostApp: App {
    var body: some Scene {
        WindowGroup {
            if ProcessInfo.processInfo.arguments.contains("--secure-lifecycle-ui") { SecureLifecycleUIHost() }
            else {
                #if GRADECREW_STAGING
                if ProcessInfo.processInfo.arguments.contains("--secure-start-ui") { SecureLifecycleUIHost() }
                else { Color.clear }
                #else
                Color.clear
                #endif
            }
        }
    }
}
