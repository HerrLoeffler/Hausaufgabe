"""Execute actual Foundation routing code with Swift before signing/uploading."""
from pathlib import Path
import subprocess
import tempfile
source = (Path(__file__).parent / 'Sources' / 'GradeCrewBetaEnvironment.swift').read_text()
checks = r'''
let preview = GradeCrewBetaEnvironment.previewURL(from: "  https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app/?gateE=1#old  ")!
assert(preview.absoluteString == "https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app/")
for value in ["http://hausaufgabe-staging--abc.web.app", "https://hausaufgabe-40294.web.app", "https://hausaufgabe-staging--abc.web.app.evil.test", "https://x:secret@hausaufgabe-staging--abc.web.app", "https://hausaufgabe-staging--abc.web.app:443", "https://hausaufgabe-staging--.web.app", "not a URL"] {
    assert(GradeCrewBetaEnvironment.previewURL(from: value) == nil, value)
}
assert(GradeCrewBetaEnvironment.baseURL(for: "broken") == GradeCrewBetaEnvironment.defaultURL)
let normal = GradeCrewBetaEnvironment.homeURL(preference: "", version: "0.1.4")
assert(normal.host == "hausaufgabe-staging.web.app")
let selected = GradeCrewBetaEnvironment.homeURL(preference: preview.absoluteString, version: "0.1.4")
assert(selected.host == preview.host)
let items = URLComponents(url: selected, resolvingAgainstBaseURL: false)!.queryItems!
assert(items.first(where: { $0.name == "appVersion" })?.value == "0.1.4")
assert(items.first(where: { $0.name == "gradecrewApp" })?.value == "teacher")
print("Beta environment routing: passed")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / 'routing.swift'
    script.write_text(source + '\n' + checks)
    subprocess.run(['swift', str(script)], check=True)
