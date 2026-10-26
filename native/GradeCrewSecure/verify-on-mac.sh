#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo 'Bitte Xcode installieren und einmal öffnen. Dieses Skript läuft auf dem Mac, nicht in Cloud Shell.' >&2
  exit 1
fi
xcodebuild -version
swift prepare_assets.swift
node --test ScriptTests/*.test.cjs TelemetryBackend/core.test.cjs
swift test --package-path .
swift ScriptTests/verify_renderer_webkit.swift "$PWD/Resources/Exam/index.html"
PYTHONPYCACHEPREFIX="${TMPDIR:-/private/tmp}/gradecrew-aac-pycache" python3 -m unittest discover -s ScriptTests -v
python3 ../test_release_environments.py
for scheme in 'GradeCrew Secure' 'GradeCrew AAC Lab' 'GradeCrew Secure Staging'; do
  xcodebuild -project GradeCrewSecure.xcodeproj -scheme "$scheme" \
    -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build
done
python3 - <<'PY_CHECK'
import plistlib
from pathlib import Path
info = plistlib.loads(Path('DerivedData/Build/Products/SecureStaging-iphonesimulator/GradeCrewSecure.app/Info.plist').read_bytes())
assert info.get('GradeCrewSecureMode') == 'staging-exam', 'Built app has no Staging mode'
assert info.get('CFBundleIdentifier') == 'de.gradecrew.secure.test2026'
assert info.get('CFBundleDisplayName') == 'Secure Test'
print('Built Staging configuration verified.')
PY_CHECK
python3 LayoutTests/run_layout_checks.py --output "${TMPDIR:-/private/tmp}/secure-layout-smoke-$(date +%s)" --suite smoke --layer all
echo 'Alle drei Simulator-Builds erfolgreich. Der vollständige Staging-Prüfungsablauf muss separat auf dem iPad geprüft werden.'
