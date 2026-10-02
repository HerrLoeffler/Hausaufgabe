"""Exercise the pure GradeCrew iOS navigation policy with Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
beta = (root / "Sources" / "GradeCrewBetaEnvironment.swift").read_text()
policy = (root / "Sources" / "GradeCrewNavigationPolicy.swift").read_text()
checks = r'''
let selected = URL(string: "https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/")!
let stable = URL(string: "https://hausaufgabe-staging.web.app/")!
let otherPreview = URL(string: "https://hausaufgabe-staging--mobile-test.web.app/path")!
let auth = URL(string: "https://hausaufgabe-staging.firebaseapp.com/__/auth/handler")!
let external = URL(string: "https://example.com/help")!
let mail = URL(string: "mailto:support@example.com")!
let production = URL(string: "https://hausaufgabe-40294.web.app/")!
let blob = URL(string: "blob:https://hausaufgabe-staging.web.app/123")!

assert(GradeCrewNavigationPolicy.isTrustedInternalURL(selected, selectedBaseURL: selected))
assert(GradeCrewNavigationPolicy.isTrustedInternalURL(stable, selectedBaseURL: selected))
assert(GradeCrewNavigationPolicy.isTrustedInternalURL(otherPreview, selectedBaseURL: selected))
assert(GradeCrewNavigationPolicy.isTrustedInternalURL(auth, selectedBaseURL: selected))
assert(GradeCrewNavigationPolicy.isTrustedInternalURL(blob, selectedBaseURL: selected))
assert(!GradeCrewNavigationPolicy.isTrustedInternalURL(production, selectedBaseURL: selected))
assert(!GradeCrewNavigationPolicy.isTrustedInternalURL(external, selectedBaseURL: selected))

assert(GradeCrewNavigationPolicy.shouldOpenExternally(external, selectedBaseURL: selected, userActivated: true))
assert(GradeCrewNavigationPolicy.shouldOpenExternally(mail, selectedBaseURL: selected, userActivated: true))
assert(GradeCrewNavigationPolicy.shouldOpenExternally(production, selectedBaseURL: selected, userActivated: true))
assert(!GradeCrewNavigationPolicy.shouldOpenExternally(external, selectedBaseURL: selected, userActivated: false))
assert(!GradeCrewNavigationPolicy.shouldOpenExternally(otherPreview, selectedBaseURL: selected, userActivated: true))
print("GradeCrew navigation policy: passed")
'''

with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "navigation.swift"
    script.write_text(beta + "\n" + policy + "\n" + checks)
    subprocess.run(["swift", str(script)], check=True)
