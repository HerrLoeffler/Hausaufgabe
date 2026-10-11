"""Exercise the native home auth/route state machine with Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
checks = r'''
var home = GradeCrewHomeNavigation()
assert(home.route == .home)
assert(!home.isAuthRestored)
home.openRemy()
assert(home.route == .home)

home.receive(.signedOut)
assert(home.isAuthRestored)
home.openRemy()
assert(home.route == .signIn)
let loginURL = GradeCrewBetaEnvironment.signInURL(preference: "", version: "0.1.11")
let loginComponents = URLComponents(url: loginURL, resolvingAgainstBaseURL: false)!
assert(loginComponents.queryItems?.contains(URLQueryItem(name: "intent", value: "login")) == true)
home.receive(.signedIn(accountLabel: "Frau Beispiel", accountChanged: true))
assert(home.route == .home)
assert(home.isAuthRestored)

home.receive(.signedOut)
home.openSignIn()
assert(home.route == .signIn)
home.receive(.signedIn(accountLabel: "Frau Beispiel", accountChanged: true))
assert(home.route == .home)

home.openWorkspace()
assert(home.route == .workspace)
home.receive(.checking)
home.receive(.signedIn(accountLabel: "Frau Beispiel", accountChanged: false))
assert(home.route == .workspace)

home.showHome()
home.openRemy()
assert(home.route == .quickRemy)
home.receive(.checking)
assert(home.route == .home)
assert(!home.isAuthRestored)
home.receive(.signedIn(accountLabel: "Zweite Lehrkraft", accountChanged: true))
assert(home.route == .home)
if case let .signedIn(label, _) = home.authState { assert(label == "Zweite Lehrkraft") } else { fatalError("Auth state was lost") }

home.openRemy()
assert(home.route == .quickRemy)
home.receive(.signedOut)
assert(home.route == .home)
print("GradeCrew home navigation: passed (auth restore, login return, workspace, logout, account switch invalidates Remy immediately)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "home.swift"
    sources = [
        root / "Sources/GradeCrewBetaEnvironment.swift",
        root / "Sources/GradeCrewNativeBridgePolicy.swift",
        root / "Sources/GradeCrewHomeNavigation.swift",
    ]
    script.write_text("\n".join(path.read_text() for path in sources) + "\n" + checks)
    subprocess.run(["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)], check=True)
