#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

python3 prepare_testflight_assets.py
python3 generate_project.py

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "Xcode/xcodebuild nicht gefunden. Installiere Xcode und starte dieses Skript erneut."
  exit 1
fi

xcodebuild \
  -project GradeCrewTeacher.xcodeproj \
  -scheme GradeCrew \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO \
  build

echo "✅ GradeCrew Teacher: Simulator-Build erfolgreich."
