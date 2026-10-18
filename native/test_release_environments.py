"""Compile both real environment policies, including legacy preference isolation."""
from pathlib import Path
import subprocess, tempfile
root=Path(__file__).parent
teacher=(root/'GradeCrewTeacher/Sources/GradeCrewBetaEnvironment.swift').read_text()
secure_path=root/'GradeCrewSecure/Sources/SecureReleaseEnvironment.swift'
secure=secure_path.read_text() if secure_path.exists() else ''
for staging in (False,True):
    project='gradecrew-staging-2026' if staging else 'hausaufgabe-staging'
    checks=f'''
assert(GradeCrewBetaEnvironment.projectID == "{project}")
assert(GradeCrewBetaEnvironment.defaultURL.host == "{project}.web.app")
assert(GradeCrewBetaEnvironment.baseURL(for: "https://hausaufgabe-staging--old.web.app/").host == "{project}.web.app")
assert(GradeCrewBetaEnvironment.previewURL(from: "https://hausaufgabe-staging--old.web.app/") == nil)
assert(SecureReleaseEnvironment.projectID == "{project}")
assert(SecureReleaseEnvironment.functionsURL.host == "europe-west1-{project}.cloudfunctions.net")
assert(SecureReleaseEnvironment.attemptService == "{'de.gradecrew.secure.test2026-attempt-v1' if staging else 'de.gradecrew.secure.staging-attempt-v1'}")
assert(SecureReleaseEnvironment.workDirectory == "{'SecureTest2026' if staging else 'SecureStaging'}")
assert(SecureReleaseEnvironment.telemetryService == "{'de.gradecrew.secure.test2026-telemetry-v1' if staging else 'de.gradecrew.secure.staging-telemetry-v1'}")
let candidate="https://gradecrew-staging-2026--mobile.web.app/"
assert((GradeCrewBetaEnvironment.previewURL(from:candidate) != nil) == {str(staging).lower()})
print("Environment policy: {'staging' if staging else 'live'} passed")
'''
    with tempfile.TemporaryDirectory() as d:
        path=Path(d)/'check.swift';path.write_text(teacher+'\n'+secure+'\n'+checks)
        cmd=['swift','-module-cache-path',d+'/cache']
        if staging: cmd+=['-D','GRADECREW_STAGING']
        subprocess.run(cmd+[str(path)],check=True)
