#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-staging-hosting.sh --check oder --deploy"; exit 1 ;; esac
PROJECT_ID="hausaufgabe-staging"

for FILE in app.js interface.js startup.js ai-client.js ui-enhancements.js visual-enhancements.js first-guide-guard.js gradecrew-tour.js gradecrew-brand.js layout-enhancements.js variant-enhancements.js admin-ai-access.js editor-drafts.js ai-review-state.js ordering-grading.mjs; do
  node --check "$FILE"
done
node --test ai-*.test.js ordering-grading.test.mjs gradecrew-tour.test.mjs
if [ ! -d tools/ui/node_modules/jsdom ]; then
  npm ci --prefix tools/ui --no-audit --no-fund
fi
npm test --prefix tools/ui
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-staging.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-staging.mjs "$BUILD_DIR"
if [ "$MODE" = "--check" ]; then
  echo "Alle Prüfungen erfolgreich. Es wurde nichts veröffentlicht."
  exit 0
fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen. Bitte zuerst prüfen und committen."
  exit 1
fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt. Installieren: npm install -g firebase-tools"; exit 1; }
echo "Veröffentliche ausschließlich Hosting auf $PROJECT_ID."
firebase deploy --config "$BUILD_DIR/firebase.json" --project "$PROJECT_ID" --only hosting --non-interactive
node tools/verify-staging.mjs "$BUILD_DIR/public/release.json"
echo "Fertig: https://hausaufgabe-staging.web.app"
