#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo 'Bitte Xcode installieren und einmal öffnen. Dieses Skript läuft auf dem Mac, nicht in Cloud Shell.' >&2
  exit 1
fi
xcodebuild -version
swift prepare_assets.swift
swift test --package-path .
swift ScriptTests/verify_renderer_webkit.swift "$PWD/Resources/Exam/index.html"
PYTHONPYCACHEPREFIX="${TMPDIR:-/private/tmp}/gradecrew-aac-pycache" python3 -m unittest discover -s ScriptTests -v
for scheme in 'GradeCrew Secure' 'GradeCrew AAC Lab' 'GradeCrew Secure Staging'; do
  xcodebuild -project GradeCrewSecure.xcodeproj -scheme "$scheme" \
    -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build
done
echo 'Alle drei Simulator-Builds erfolgreich. Der vollständige Staging-Prüfungsablauf muss separat auf dem iPad geprüft werden.'
