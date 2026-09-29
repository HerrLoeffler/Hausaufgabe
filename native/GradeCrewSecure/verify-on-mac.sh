#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo 'Bitte Xcode installieren und einmal öffnen. Dieses Skript läuft auf dem Mac, nicht in Cloud Shell.' >&2
  exit 1
fi
xcodebuild -version
for scheme in 'GradeCrew Secure' 'GradeCrew AAC Lab'; do
  xcodebuild -project GradeCrewSecure.xcodeproj -scheme "$scheme" \
    -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build
done
echo 'Beide Simulator-Builds erfolgreich. Ein echter AAC-Gerätetest steht separat aus.'
