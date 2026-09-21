#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-40294"
cd "$(dirname "$0")"

if ! grep -q 'projectId: "hausaufgabe-40294"' firebase-config.production.js; then
  echo "FEHLER: Produktionskonfiguration ist unerwartet. Abbruch."
  exit 1
fi

printf 'ACHTUNG: Deployment auf LIVE (%s). Tippe LIVE zum Fortfahren: ' "$PROJECT_ID"
read -r confirmation
if [[ "$confirmation" != "LIVE" ]]; then
  echo "Abgebrochen."
  exit 1
fi

cp firebase-config.production.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css firebase-config.js ai-json-tools.js public/
firebase deploy --project "$PROJECT_ID" --only firestore:rules,firestore:indexes,hosting
