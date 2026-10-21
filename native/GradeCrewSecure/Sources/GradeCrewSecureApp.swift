import SwiftUI
import UIKit

final class AppDelegate: NSObject, UIApplicationDelegate {
    // Third-party keyboards can expose search/network services during assessments.
    func application(_ application: UIApplication,
                     shouldAllowExtensionPointIdentifier identifier: UIApplication.ExtensionPointIdentifier) -> Bool {
        identifier != .keyboard
    }
}

@main
struct GradeCrewSecureApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    var body: some Scene {
        WindowGroup { StartView() }
    }
}
