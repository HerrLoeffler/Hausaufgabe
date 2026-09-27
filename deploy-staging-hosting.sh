#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
cd "$(dirname "$0")"

if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: Firebase-Konfiguration zeigt nicht auf Staging."
  exit 1
fi

node --check app.js
node --check ai-client.js
node --check ui-enhancements.js
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

cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css design-system.css gradecrew-brand.css firebase-config.js ai-json-tools.js ai-client.js ui-enhancements.js gradecrew-brand.js layout-enhancements.js editor-drafts.js ai-review-state.js ordering-grading.mjs public/
rm -rf public/assets/gradecrew
mkdir -p public/assets
cp -R assets/gradecrew public/assets/

echo "Deploy HOSTING -> ${PROJECT_ID} (Functions, Regeln und Storage bleiben unverändert)"
firebase deploy --project "$PROJECT_ID" --only hosting
echo "✓ https://${PROJECT_ID}.web.app"
