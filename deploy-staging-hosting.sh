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
node --check editor-drafts.js
node --check ai-review-state.js
node --test ai-review-state.test.js

cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css design-system.css firebase-config.js ai-json-tools.js ai-client.js editor-drafts.js ai-review-state.js public/

echo "Deploy HOSTING -> ${PROJECT_ID} (Functions, Regeln und Storage bleiben unverändert)"
firebase deploy --project "$PROJECT_ID" --only hosting
echo "✓ https://${PROJECT_ID}.web.app"
