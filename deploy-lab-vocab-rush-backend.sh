#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-vocab-rush-backend.sh --check oder --deploy"; exit 1;; esac
PROJECT_ID="hausaufgabe-staging"; SRC="lab/vocab-rush-functions"
node --check "$SRC/index.js"
node -e 'JSON.parse(require("fs").readFileSync("firebase.vocab-rush.json","utf8"));JSON.parse(require("fs").readFileSync("lab/vocab-rush-functions/package.json","utf8"));'
if [ "$MODE" = "--check" ]; then echo "Vocab Rush Backend ist syntaktisch geprüft. Es wurde nichts veröffentlicht."; exit 0; fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then echo "FEHLER: Nicht gespeicherte Repository-Änderungen."; exit 1; fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt."; exit 1; }
if [ ! -d "$SRC/node_modules/firebase-functions" ]; then echo "Installiere Vocab-Rush-Backend-Abhängigkeiten ..."; npm --prefix "$SRC" install --no-package-lock --no-save; fi
echo "Deploye ausschließlich Functions-Codebase 'vocabrush' nach $PROJECT_ID."
firebase deploy --config firebase.vocab-rush.json --project "$PROJECT_ID" --only functions:vocabrush --non-interactive
echo "Vocab Rush Backend veröffentlicht."
