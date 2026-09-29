#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-40294"
STAGING_ID="hausaufgabe-staging"

cd "$(dirname "$0")"

echo "=========================================="
echo " GRADECREW - PRODUCTION DEPLOY"
echo " Ziel: $PROJECT_ID"
echo "=========================================="

if [[ ! -f firebase-config.production.js ]]; then
  echo "FEHLER: firebase-config.production.js fehlt."
  exit 1
fi

if ! grep -q 'projectId: "hausaufgabe-40294"' firebase-config.production.js; then
  echo "FEHLER: Production-Config zeigt nicht auf $PROJECT_ID."
  exit 1
fi

if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: Staging-Config ist unerwartet."
  exit 1
fi

# FAIL CLOSED: Die heutige GradeCrew-/KI-Oberfläche besteht aus zusätzlichen
# Modulen und Assets und benötigt für echte Leistungsnachweise außerdem den
# serverseitig abgesicherten Abgabeweg aus SECURE_EXAM_PLAN.md. Dieses alte
# Skript kopiert bewusst nur den früheren Browser-Stand und darf deshalb keinen
# aktuellen 2.3.1 Release Candidate auf Produktion veröffentlichen.
if grep -Eq 'const APP_VERSION = "2\.3\.1-(ai|gc)' app.js; then
  echo "FEHLER: Aktueller GradeCrew Release Candidate ist für dieses Production-Skript gesperrt."
  echo "Vor LIVE zuerst: sicheren serverseitigen Abgabeweg fertigstellen, Production-Buildpfad erneuern und Release erneut vollständig prüfen."
  echo "Siehe SECURE_EXAM_PLAN.md und STAGING_RELEASE_AUDIT_2026-09-29.md."
  exit 1
fi

echo
echo "ACHTUNG: Du bist dabei, die LIVE-SEITE zu aktualisieren:"
echo "https://hausaufgabe-40294.web.app"
echo
printf 'Tippe LIVE zum Fortfahren: '
read -r confirmation

if [[ "$confirmation" != "LIVE" ]]; then
  echo "Abgebrochen."
  exit 1
fi

mkdir -p public

cp index.html app.js styles.css design-system.css ai-json-tools.js ai-client.js editor-drafts.js ai-review-state.js ordering-grading.mjs public/
cp firebase-config.production.js public/firebase-config.js

restore_staging_config() {
  cp firebase-config.staging.js public/firebase-config.js 2>/dev/null || true
}
trap restore_staging_config EXIT

echo
echo "Deploy-Ziel:"
grep 'projectId' public/firebase-config.js

echo
echo "Deploye Firestore Rules + Hosting ..."
firebase deploy \
  --project "$PROJECT_ID" \
  --only firestore:rules,hosting

echo
echo "LIVE-Deploy erfolgreich:"
echo "https://hausaufgabe-40294.web.app"
