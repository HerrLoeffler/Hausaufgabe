"""Compile both real environment policies, including legacy preference isolation."""
from pathlib import Path
import subprocess, tempfile
root=Path(__file__).parent
teacher=(root/'GradeCrewTeacher/Sources/GradeCrewBetaEnvironment.swift').read_text()
secure_path=root/'GradeCrewSecure/Sources/SecureReleaseEnvironment.swift'
secure=secure_path.read_text() if secure_path.exists() else ''
navigation=(root/'GradeCrewTeacher/Sources/GradeCrewNavigationPolicy.swift').read_text()
bridge=(root/'GradeCrewTeacher/Sources/GradeCrewNativeBridgePolicy.swift').read_text()
preview=(root/'GradeCrewSecure/Sources/StagingWebView.swift').read_text().split('struct PreviewScreen:')[0].replace('import SwiftUI','').replace('import WebKit','')
for staging in (False,True):
    project='gradecrew-staging-2026' if staging else 'hausaufgabe-staging'
    public_host=f'{project}.web.app' if staging else 'gradecrew.de'
    checks=f'''
assert(GradeCrewBetaEnvironment.projectID == "{project}")
assert(GradeCrewBetaEnvironment.defaultURL.host == "{public_host}")
assert(GradeCrewBetaEnvironment.baseURL(for: "https://hausaufgabe-staging--old.web.app/").host == "{public_host}")
assert(GradeCrewBetaEnvironment.previewURL(from: "https://hausaufgabe-staging--old.web.app/") == nil)
assert(SecureReleaseEnvironment.projectID == "{project}")
assert(SecureReleaseEnvironment.functionsURL.host == "europe-west1-{project}.cloudfunctions.net")
assert(SecureReleaseEnvironment.attemptService == "{'de.gradecrew.secure.test2026-attempt-v1' if staging else 'de.gradecrew.secure.staging-attempt-v1'}")
assert(SecureReleaseEnvironment.workDirectory == "{'SecureTest2026' if staging else 'SecureStaging'}")
assert(SecureReleaseEnvironment.telemetryService == "{'de.gradecrew.secure.test2026-telemetry-v1' if staging else 'de.gradecrew.secure.staging-telemetry-v1'}")
let candidate="https://gradecrew-staging-2026--mobile.web.app/"
assert((GradeCrewBetaEnvironment.previewURL(from:candidate) != nil) == {str(staging).lower()})
let selected=GradeCrewBetaEnvironment.defaultURL
assert(StagingPolicy.testURL(code:" ab12 ")?.host == "{public_host}")
assert(StagingPolicy.testURL(code:" ab12 ")?.query == "test=AB12")
assert(StagingPolicy.testURL(code:"bad/code") == nil)
for host in ["gradecrew.de", "www.gradecrew.de", "hausaufgabe-staging.web.app"] {{
    let url=URL(string:"https://\\(host)/?test=AB12")!
    assert(GradeCrewNavigationPolicy.isTrustedInternalURL(url,selectedBaseURL:selected) == {str(not staging).lower()})
    assert(StagingPolicy.allows(url) == {str(not staging).lower()})
    assert(GradeCrewNativeBridgePolicy.isAllowedDocument(url,selectedBaseURL:url) == {str(not staging).lower()})
}}
for host in ["gradecrew-staging-2026.web.app"] {{
    let url=URL(string:"https://\\(host)/")!
    assert(GradeCrewNavigationPolicy.isTrustedInternalURL(url,selectedBaseURL:selected) == {str(staging).lower()})
    assert(StagingPolicy.allows(url) == {str(staging).lower()})
}}
let legacy=URL(string:"https://hausaufgabe-staging.web.app/")!
assert(!GradeCrewNativeBridgePolicy.isAllowedDocument(legacy,selectedBaseURL:selected))
for raw in ["https://gradecrew.de.evil.invalid/", "https://evil.gradecrew.de/", "https://hausaufgabe-40294.web.app/", "http://{public_host}/", "https://{public_host}:8443/", "https://user:secret@{public_host}/"] {{
    let url=URL(string:raw)!
    assert(!GradeCrewNavigationPolicy.isTrustedInternalURL(url,selectedBaseURL:selected))
    assert(!GradeCrewNativeBridgePolicy.isAllowedDocument(url,selectedBaseURL:url))
    assert(!StagingPolicy.allows(url))
}}
print("Environment policy: {'staging' if staging else 'live'} passed")
'''
    with tempfile.TemporaryDirectory() as d:
        path=Path(d)/'check.swift';path.write_text('\n'.join([teacher,secure,navigation,bridge,preview,checks]))
        cmd=['swift','-module-cache-path',d+'/cache']
        if staging: cmd+=['-D','GRADECREW_STAGING']
        subprocess.run(cmd+[str(path)],check=True)
