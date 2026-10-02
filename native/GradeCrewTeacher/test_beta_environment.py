"""Execute actual Foundation routing code with Swift before signing/uploading."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
source = (root / 'Sources' / 'GradeCrewBetaEnvironment.swift').read_text()
version = (root / 'VERSION').read_text().strip()
checks = f'''
let preview = GradeCrewBetaEnvironment.previewURL(from: "  https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app/?gateE=1#old  ")!
assert(preview.absoluteString == "https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app/")
for value in ["http://hausaufgabe-staging--abc.web.app", "https://hausaufgabe-40294.web.app", "https://hausaufgabe-staging--abc.web.app.evil.test", "https://x:secret@hausaufgabe-staging--abc.web.app", "https://hausaufgabe-staging--abc.web.app:443", "https://hausaufgabe-staging--.web.app", "not a URL"] {{
    assert(GradeCrewBetaEnvironment.previewURL(from: value) == nil, value)
}}
assert(GradeCrewBetaEnvironment.baseURL(for: "") == GradeCrewBetaEnvironment.integrationPreviewURL)
assert(GradeCrewBetaEnvironment.baseURL(for: "broken") == GradeCrewBetaEnvironment.integrationPreviewURL)
assert(GradeCrewBetaEnvironment.baseURL(for: GradeCrewBetaEnvironment.stablePreference) == GradeCrewBetaEnvironment.stableStagingURL)
assert(GradeCrewBetaEnvironment.environmentLabel(for: "") == "Integration")
assert(GradeCrewBetaEnvironment.environmentLabel(for: GradeCrewBetaEnvironment.stablePreference) == "Staging")
let normal = GradeCrewBetaEnvironment.homeURL(preference: "", version: "{version}")
assert(normal.host == "hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app")
let stable = GradeCrewBetaEnvironment.homeURL(preference: GradeCrewBetaEnvironment.stablePreference, version: "{version}")
assert(stable.host == "hausaufgabe-staging.web.app")
let selected = GradeCrewBetaEnvironment.homeURL(preference: preview.absoluteString, version: "{version}")
assert(selected.host == preview.host)
let items = URLComponents(url: selected, resolvingAgainstBaseURL: false)!.queryItems!
assert(items.first(where: {{ $0.name == "appVersion" }})?.value == "{version}")
assert(items.first(where: {{ $0.name == "gradecrewApp" }})?.value == "teacher")
assert(items.first(where: {{ $0.name == "source" }})?.value == "ios")
print("Beta environment routing: passed for {version}")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / 'routing.swift'
    script.write_text(source + '\n' + checks)
    subprocess.run(['swift', str(script)], check=True)
