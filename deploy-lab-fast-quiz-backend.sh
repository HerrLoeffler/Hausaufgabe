#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in
  --check|--deploy) ;;
  *) echo "Aufruf: bash deploy-lab-fast-quiz-backend.sh --check oder --deploy"; exit 1 ;;
esac

PROJECT_ID="hausaufgabe-staging"
FUNCTION_DIR="lab/fast-quiz-functions"

node --check "$FUNCTION_DIR/index.js"
node -e 'JSON.parse(require("fs").readFileSync("firebase.fastquiz.json", "utf8")); JSON.parse(require("fs").readFileSync("lab/fast-quiz-functions/package.json", "utf8"));'

if [ "$MODE" = "--check" ]; then
  echo "Fast Quiz Backend ist syntaktisch geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi

if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen. Bitte zuerst prüfen und committen."
  exit 1
fi

command -v firebase >/dev/null || { echo "Firebase CLI fehlt. Installieren: npm install -g firebase-tools"; exit 1; }
command -v npm >/dev/null || { echo "npm fehlt."; exit 1; }

if [ ! -d "$FUNCTION_DIR/node_modules/firebase-functions" ] || [ ! -d "$FUNCTION_DIR/node_modules/firebase-admin" ]; then
  echo "Installiere Fast-Quiz-Backend-Abhängigkeiten lokal ..."
  if [ -f "$FUNCTION_DIR/package-lock.json" ]; then
    npm --prefix "$FUNCTION_DIR" ci --omit=dev
  else
    npm --prefix "$FUNCTION_DIR" install --omit=dev
  fi
fi

node -e 'require("./lab/fast-quiz-functions/node_modules/firebase-functions"); require("./lab/fast-quiz-functions/node_modules/firebase-admin"); console.log("Fast Quiz Backend-Abhängigkeiten vorhanden.");'

echo "Deploye ausschließlich die separate Functions-Codebase 'fastquiz' nach $PROJECT_ID."
echo "Bestehende GradeCrew-Functions, Firestore-Regeln, Staging-Hosting und Production werden nicht verändert."
firebase deploy \
  --config firebase.fastquiz.json \
  --project "$PROJECT_ID" \
  --only functions:fastquiz \
  --non-interactive

echo "Fast Quiz Backend veröffentlicht."
