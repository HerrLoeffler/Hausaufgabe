import SwiftUI

/// Single activation point for the new backend flow. `App.swift` will switch its
/// root to this wrapper only after the staging backend has been deployed and
/// verified. With the feature gate false it preserves the known-good TestFlight UI.
struct GradeCrewSecureRootView: View {
    var body: some View {
        if GradeCrewSecureBuild.secureBackendEnabled {
            SecureBackendStartView()
        } else {
            StartView()
        }
    }
}
