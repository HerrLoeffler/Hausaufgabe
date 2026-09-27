#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-40294"
BRANCH="fix/ai-review-workflow"
cd "$(dirname "$0")"

echo "=========================================="
echo " GRADECREW - PRODUCTION BETA DEPLOY"
echo " Ziel: $PROJECT_ID"
echo " Nur für eingeladene Lehrkräfte / Beta-Test"
echo "=========================================="

if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "FEHLER: Bitte zuerst Branch $BRANCH öffnen."
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "FEHLER: Lokale Änderungen vorhanden. Erst sichern/abgleichen."
  git status --short
  exit 1
fi
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  echo "FEHLER: Node 22 erforderlich. Bitte zuerst: nvm use 22"
  exit 1
fi
if [[ ! -f firebase-config.production.js ]] || ! grep -q 'projectId: "hausaufgabe-40294"' firebase-config.production.js; then
  echo "FEHLER: Production-Config fehlt oder zeigt nicht auf $PROJECT_ID."
  exit 1
fi
if [[ ! -f firebase-config.staging.js ]] || ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: Staging-Config ist unerwartet."
  exit 1
fi

# Niemals den Secret-Wert ausgeben. Nur prüfen, ob im Production-Projekt eine aktive Version existiert.
if ! gcloud secrets versions access latest --secret=OPENAI_API_KEY --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "FEHLER: OPENAI_API_KEY ist im Production-Projekt nicht verfügbar."
  echo "Secret zuerst sicher im Projekt $PROJECT_ID anlegen; Wert niemals im Terminal-Log ausgeben."
  exit 1
fi

echo
echo "Release-Commit: $(git rev-parse HEAD)"
echo "Prüfe Tests und Browser-Code ..."
(cd functions && npm ci --include=dev && npm test && npm run check)
node --check app.js
node --check ai-client.js
node --check ui-enhancements.js
node --check visual-enhancements.js
node --check gradecrew-brand.js
node --check layout-enhancements.js
node --check editor-drafts.js
node --check ai-review-state.js
node --check ordering-grading.mjs
node --test ai-*.test.js
node --test ordering-grading.test.mjs

test -f assets/gradecrew/penguin-guide.svg
test -f assets/gradecrew/falcon-create.svg
test -f assets/gradecrew/fox-improve.svg
test -f assets/gradecrew/owl-grade.svg
test -f assets/gradecrew/crew-lineup.svg

echo
echo "ACHTUNG: Dieser Release schaltet die aktuelle GradeCrew-KI-Beta auf LIVE frei."
echo "KI bleibt serverseitig auf Admins + Lehrkräfte mit aiBetaEnabled=true begrenzt."
echo "Noch NICHT für echte Schüler-Leistungsnachweise freigeben; dieser Release dient dem Kollegentest."
echo "Live-Seite: https://hausaufgabe-40294.web.app"
echo
printf 'Tippe BETA-LIVE zum Fortfahren: '
read -r confirmation
if [[ "$confirmation" != "BETA-LIVE" ]]; then
  echo "Abgebrochen."
  exit 1
fi

mkdir -p public
cp index.html app.js styles.css design-system.css gradecrew-brand.css firebase-config.production.js ai-json-tools.js ai-client.js ui-enhancements.js visual-enhancements.js gradecrew-brand.js layout-enhancements.js editor-drafts.js ai-review-state.js ordering-grading.mjs public/
cp firebase-config.production.js public/firebase-config.js
rm -rf public/assets/gradecrew
mkdir -p public/assets
cp -R assets/gradecrew public/assets/

restore_staging_config() {
  cp firebase-config.staging.js public/firebase-config.js 2>/dev/null || true
}
trap restore_staging_config EXIT

echo
echo "Production-Konfiguration:"
grep 'projectId' public/firebase-config.js

echo
echo "1/2 Backend, Firestore-Regeln und Storage-Regeln auf Production ..."
firebase deploy --project "$PROJECT_ID" --only functions,firestore:rules,storage

echo
echo "2/2 Hosting auf Production ..."
firebase deploy --project "$PROJECT_ID" --only hosting

echo
echo "GRADECREW PRODUCTION BETA erfolgreich veröffentlicht:"
echo "https://hausaufgabe-40294.web.app"
echo "Release-Commit: $(git rev-parse HEAD)"
echo "Jetzt zuerst mit einem eingeladenen Testaccount prüfen, bevor weitere Lehrkräfte freigeschaltet werden."
