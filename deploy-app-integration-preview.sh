#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-app-integration-preview.sh --check oder --deploy"; exit 1 ;; esac
PROJECT_ID="hausaufgabe-staging"
BRANCH="feature/gradecrew-app-integration"
CHANNEL="gradecrew-app-integration"
if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "FEHLER: Branch $BRANCH erforderlich."; exit 1
fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "FEHLER: Nicht gespeicherte Änderungen. Erst sichern."; git status --short; exit 1
fi
# The runtime must survive a fresh Cloud Shell reconnect.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then . "$NVM_DIR/nvm.sh"; fi
if ! command -v nvm >/dev/null 2>&1; then echo "FEHLER: nvm fehlt."; exit 1; fi
nvm install 22 >/dev/null
nvm use 22 >/dev/null
[[ "$(node -p 'process.versions.node.split(".")[0]')" == "22" ]]
grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js
npm ci --prefix tools/ui --no-audit --no-fund
for FILE in app.js startup.js visual-enhancements.js mobile-viewport-polish.js first-guide-responsive.js crew-tour-responsive.js gate-e-lab.js tools/gate-e-load-test.mjs; do node --check "$FILE"; done
node --test diagnostics.test.mjs crew-art.test.mjs gradecrew-tour.test.mjs gradecrew-tour-v8-dashboard.test.mjs crew-tour-gc*.test.mjs first-guide-responsive.test.mjs crew-tour-responsive.test.mjs assessment-receipt-check.test.mjs gate-e-lab.test.mjs tools/gate-e-load-test.test.mjs secure-*.test.mjs assessment-functions/test/*.test.js
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-app-preview.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-staging.mjs "$BUILD_DIR"
test -f "$BUILD_DIR/public/diagnostics.mjs"
test -f "$BUILD_DIR/public/crew-tour-responsive.js"
test -f "$BUILD_DIR/public/secure-student.js"
test -f "$BUILD_DIR/public/assessment-receipt-check.mjs"
if [[ "$MODE" == "--check" ]]; then
  echo "App-Integration gc28 geprüft. Es wurde nichts veröffentlicht."; exit 0
fi
if ! command -v firebase >/dev/null 2>&1; then npm install -g firebase-tools; fi
echo "Veröffentliche ausschließlich Hosting-Preview $CHANNEL auf $PROJECT_ID."
echo "Bereits deployte Assessment-Functions werden verwendet. Normales Staging, Regeln und Production bleiben unverändert."
firebase hosting:channel:deploy "$CHANNEL" --project "$PROJECT_ID" --config "$BUILD_DIR/firebase.json" --expires 7d --non-interactive
echo "Verwende die ausgegebene Preview-URL für den gemeinsamen Tutorial-/Funktionscheck. ?gateE=1 öffnet optional den Paralleltest."
