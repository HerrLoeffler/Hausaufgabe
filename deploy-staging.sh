#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"

cd "$(dirname "$0")"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Staging-Projekt entspricht dem Produktionsprojekt. Abbruch."
  exit 1
fi

if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: firebase-config.staging.js zeigt nicht auf hausaufgabe-staging. Abbruch."
  exit 1
fi

cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css firebase-config.js ai-json-tools.js public/

echo "Deploy STAGING -> ${PROJECT_ID}"
firebase deploy --project "$PROJECT_ID" --only firestore:rules,firestore:indexes,hosting

echo "Fertig: https://${PROJECT_ID}.web.app"
