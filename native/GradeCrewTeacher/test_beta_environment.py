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
assert(normal.host == "gradecrew.de")
assert(normal.path == "/workspace.html", "Native must load the auth workspace, not the public homepage")
let items = URLComponents(url: normal, resolvingAgainstBaseURL: false)!.queryItems!
assert(items.first(where: {{ $0.name == "appVersion" }})?.value == "{version}")
assert(items.first(where: {{ $0.name == "gradecrewApp" }})?.value == "teacher")
assert(items.first(where: {{ $0.name == "source" }})?.value == "ios")
assert(items.contains(where: {{ $0.name == "intent" && $0.value == "login" }}), "Signed-out native home must remain on the teacher login workspace")
let login = GradeCrewBetaEnvironment.signInURL(preference:"", version:"{version}")
assert(login.path == "/workspace.html")
assert(URLComponents(url:login,resolvingAgainstBaseURL:false)!.queryItems!.contains(where: {{ $0.name == "intent" && $0.value == "login" }}))
print("Live routing: passed")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / 'routing.swift'
    script.write_text(source + '\n' + checks)
    subprocess.run(['swift', '-module-cache-path', str(Path(work) / 'module-cache'), str(script)], check=True)

staging_checks = '''
let home = GradeCrewBetaEnvironment.homeURL(preference: "", version: "0.2.0")
let login = GradeCrewBetaEnvironment.signInURL(preference: "", version: "0.2.0")
assert(home.host == "gradecrew-staging-2026.web.app")
assert(home.path == "/workspace.html")
assert(URLComponents(url: home, resolvingAgainstBaseURL: false)!.queryItems!.contains(URLQueryItem(name: "intent", value: "login")))
assert(login.path == "/workspace.html")
assert(URLComponents(url: login, resolvingAgainstBaseURL: false)!.queryItems!.contains(URLQueryItem(name: "intent", value: "login")))
print("Test2026 routing: passed")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / 'staging-routing.swift'
    script.write_text(source + '\n' + staging_checks)
    subprocess.run(['swift', '-D', 'GRADECREW_STAGING', '-module-cache-path', str(Path(work) / 'module-cache'), str(script)], check=True)
