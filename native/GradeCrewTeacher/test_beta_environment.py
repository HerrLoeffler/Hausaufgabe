"""Execute actual Foundation routing code with Swift before signing/uploading."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
source = (root / 'Sources' / 'GradeCrewBetaEnvironment.swift').read_text()
version = (root / 'VERSION').read_text().strip()
checks = f'''
assert(GradeCrewBetaEnvironment.baseURL(for: "") == GradeCrewBetaEnvironment.defaultURL)
assert(GradeCrewBetaEnvironment.baseURL(for: "https://hausaufgabe-staging--old.web.app/") == GradeCrewBetaEnvironment.defaultURL)
assert(GradeCrewBetaEnvironment.previewURL(from:"https://hausaufgabe-staging--old.web.app/") == nil)
assert(GradeCrewBetaEnvironment.environmentLabel(for: "") == "Live")
let normal = GradeCrewBetaEnvironment.homeURL(preference: "", version: "{version}")
assert(normal.host == "hausaufgabe-staging.web.app")
let items = URLComponents(url: normal, resolvingAgainstBaseURL: false)!.queryItems!
assert(items.first(where: {{ $0.name == "appVersion" }})?.value == "{version}")
assert(items.first(where: {{ $0.name == "gradecrewApp" }})?.value == "teacher")
assert(items.first(where: {{ $0.name == "source" }})?.value == "ios")
let login = GradeCrewBetaEnvironment.signInURL(preference:"", version:"{version}")
assert(URLComponents(url:login,resolvingAgainstBaseURL:false)!.queryItems!.contains(where: {{ $0.name == "intent" && $0.value == "login" }}))
print("Live routing: passed")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / 'routing.swift'
    script.write_text(source + '\n' + checks)
    subprocess.run(['swift', '-module-cache-path', str(Path(work) / 'module-cache'), str(script)], check=True)
