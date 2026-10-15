#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ $# != 2 || ! $1 =~ ^[A-Z0-9]{10}$ || ! $2 =~ ^[A-Za-z0-9-]+$ ]]; then
  echo 'Aufruf: ./install-aac-lab.sh TEAM_ID DEVICE_ID' >&2
  exit 2
fi
swift prepare_assets.swift
lab_team="$1"
lab_device="$2"
lab_output="${TMPDIR:-/private/tmp}/gradecrew-aac-signed"
xcodebuild -project GradeCrewSecure.xcodeproj -scheme 'GradeCrew AAC Lab' \
  -configuration AACLab -destination "id=$lab_device" -derivedDataPath "$lab_output" \
  DEVELOPMENT_TEAM="$lab_team" -allowProvisioningUpdates build
lab_app="$lab_output/Build/Products/AACLab-iphoneos/GradeCrewSecure.app"
if [[ ! -f "$lab_app/embedded.mobileprovision" ]]; then
  echo 'Kein Geräte-Provisioning-Profil vorhanden. Keine Installation.' >&2
  exit 1
fi
lab_check="$(mktemp -d)"
trap 'rm -rf "$lab_check"' EXIT
security cms -D -i "$lab_app/embedded.mobileprovision" > "$lab_check/profile.plist"
codesign --verify --strict "$lab_app"
codesign -d --entitlements :- "$lab_app" > "$lab_check/entitlements.plist" 2> "$lab_check/codesign.log"
python3 - "$lab_check" "$lab_team" <<'PY'
import datetime, pathlib, plistlib, sys
root, team = pathlib.Path(sys.argv[1]), sys.argv[2]
profile = plistlib.loads((root / 'profile.plist').read_bytes())
app = plistlib.loads((root / 'entitlements.plist').read_bytes())
permission = 'com.apple.developer.automatic-assessment-configuration'
for label, entitlement in [('Profil', profile['Entitlements']), ('App', app)]:
    if entitlement.get(permission) is not True:
        raise SystemExit(f'AAC fehlt in {label}. Keine Installation.')
    if entitlement.get('com.apple.developer.team-identifier') != team:
        raise SystemExit(f'Falsches Team in {label}. Keine Installation.')
    identifier = entitlement.get('application-identifier', '')
    if identifier.split('.', 1)[-1] != 'de.gradecrew.secure':
        raise SystemExit(f'Falsche App-ID in {label}. Keine Installation.')
if profile['ExpirationDate'] <= datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None):
    raise SystemExit('Provisioning-Profil abgelaufen. Keine Installation.')
print('AAC in signierter App und Profil vorhanden; Team, Bundle-ID und Ablauf geprüft.')
PY
xcrun devicectl device install app --device "$lab_device" "$lab_app"
xcrun devicectl device process launch --device "$lab_device" de.gradecrew.secure
echo 'Lab geöffnet. Die Sperre startet erst nach deiner Bestätigung auf dem iPad.'
