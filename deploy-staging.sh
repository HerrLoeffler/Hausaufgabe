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

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$(node -p 'process.versions.node.split(".")[1]')"
if [[ "$NODE_MAJOR" != "22" || "$NODE_MINOR" -lt 13 ]]; then
  echo "FEHLER: Node 22.13 oder neuer wird benötigt. Aktuell: $(node --version)"
  echo "Bitte zuerst: nvm install 22 && nvm use 22"
  exit 1
fi

echo
echo "=== STAGING PREFLIGHT ==="
echo "1/4 Abhängigkeiten installieren"
(
  cd functions
  npm ci --include=dev
)

echo
echo "2/4 Tests ausführen"
(
  cd functions
  npm test
)

echo
echo "3/4 Functions-Syntax und Bezeichner prüfen"
(
  cd functions
  npm run check
)

echo
echo "4/4 Browser-App prüfen"
node --check app.js
node --check ai-client.js
node --check editor-drafts.js

echo
echo "✓ Alle Prüfungen erfolgreich."
echo "✓ Zielprojekt: ${PROJECT_ID}"
echo "✓ Produktion (${PRODUCTION_ID}) bleibt unangetastet."
echo

cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css firebase-config.js ai-json-tools.js ai-client.js editor-drafts.js public/

echo "Deploy STAGING -> ${PROJECT_ID}"
firebase deploy --project "$PROJECT_ID" --only firestore:rules,storage,functions,hosting

echo
echo "✓ STAGING erfolgreich deployed:"
echo "https://${PROJECT_ID}.web.app"
