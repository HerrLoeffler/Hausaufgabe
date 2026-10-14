import SwiftUI

// Separate bundle: never launches Firebase, requests permission, records or creates tests.
@main
struct GradeCrewLayoutHostApp: App {
    var body: some Scene { WindowGroup { Color.clear } }
}
