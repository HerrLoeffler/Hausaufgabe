import Foundation

struct GradeCrewHomeNavigation {
    enum Route: Equatable { case home, workspace, quickRemy }

    private(set) var route: Route = .home
    private(set) var authState: GradeCrewNativeBridgePolicy.AuthState = .checking
    private var shouldReturnHomeAfterLogin = false

    var isAuthRestored: Bool {
        if case .checking = authState { return false }
        return true
    }

    mutating func receive(_ state: GradeCrewNativeBridgePolicy.AuthState) {
        authState = state
        switch state {
        case let .signedIn(_, accountChanged):
            if accountChanged, route == .quickRemy { route = .home }
            if shouldReturnHomeAfterLogin {
                shouldReturnHomeAfterLogin = false
                route = .home
            }
        case .signedOut:
            if route == .quickRemy { route = .home }
        case .checking:
            if route == .quickRemy { route = .home }
        }
    }

    mutating func openRemy() {
        switch authState {
        case .checking:
            return
        case .signedIn:
            route = .quickRemy
        case .signedOut:
            openSignIn()
        }
    }

    mutating func openSignIn() {
        guard isAuthRestored else { return }
        shouldReturnHomeAfterLogin = true
        route = .workspace
    }

    mutating func openWorkspace() {
        switch authState {
        case .checking:
            return
        case .signedIn:
            shouldReturnHomeAfterLogin = false
            route = .workspace
        case .signedOut:
            openSignIn()
        }
    }

    mutating func showHome() { route = .home }
    mutating func beginAuthCheck() { authState = .checking }
}
