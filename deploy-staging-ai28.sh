#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"
EXPECTED_BRANCH="fix/ai-format-reliability"

cd "$(dirname "$0")"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Staging und Produktion sind identisch. Abbruch."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "FEHLER: Erwarteter Branch: $EXPECTED_BRANCH"
  echo "Aktuell: $CURRENT_BRANCH"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "FEHLER: Lokale Änderungen vorhanden. Bitte nicht überschreiben."
  git status --short
  exit 1
fi

if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: firebase-config.staging.js zeigt nicht auf Staging."
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" != "22" ]]; then
  echo "FEHLER: Node 22 erforderlich. Aktuell: $(node --version)"
  echo "Bitte zuerst: nvm use 22"
  exit 1
fi

echo "=== Testify ai28 · STAGING ==="
echo "Branch: $CURRENT_BRANCH"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Produktion $PRODUCTION_ID bleibt unangetastet."

echo
echo "1/4 Functions installieren und testen"
(
  cd functions
  npm ci
  npm test
  npm run check
)

echo
echo "2/4 Frontend prüfen"
node --check app.js
node --check ai-client.js
node --check editor-drafts.js
node --check ai-review-state.js
node --test ai-review-state.test.js ai-job-report.test.js

echo
echo "3/4 Staging-Frontend vorbereiten"
cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css design-system.css firebase-config.js ai-json-tools.js ai-client.js editor-drafts.js ai-review-state.js public/

echo
echo "4/4 Nur STAGING deployen"
firebase deploy \
  --project "$PROJECT_ID" \
  --only hosting,functions:getAiStatus,functions:generateTest,functions:startAiTestJob,functions:processAiTestJob,functions:regenerateQuestion

echo
echo "✓ STAGING ai28 erfolgreich deployed"
echo "✓ https://${PROJECT_ID}.web.app"
echo "✓ Produktion (${PRODUCTION_ID}) wurde nicht verändert."
