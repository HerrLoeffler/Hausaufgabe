#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_ID="hausaufgabe-staging"
EXPECTED_BRANCH="fix/gradecrew-staging-polish"

CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  echo "FEHLER: Erwartet Branch $EXPECTED_BRANCH, aktuell $CURRENT_BRANCH."; exit 1
fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen. Bitte zuerst prüfen und committen."; exit 1
fi
if ! command -v node >/dev/null || [ "$(node -p 'Number(process.versions.node.split(".")[0]) >= 22')" != "true" ]; then
  echo "FEHLER: Node 22 oder neuer wird benötigt."; exit 1
fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt."; exit 1; }

echo "Prüfe Functions für STAGING: $PROJECT_ID"
(
  cd functions
  npm ci --include=dev
  npm test
  npm run check
)

echo "Deploye ausschließlich Functions auf STAGING: $PROJECT_ID"
firebase deploy --project "$PROJECT_ID" --only functions --non-interactive

echo "Functions-Staging-Deploy abgeschlossen. Production wurde nicht berührt."
