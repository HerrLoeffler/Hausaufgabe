#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-vocab-rush.sh --check oder --deploy"; exit 1;; esac
PROJECT_ID="hausaufgabe-staging"; CHANNEL_ID="gradecrew-vocab-rush"
node --check lab/vocab-rush/curriculum.js
node --check lab/vocab-rush/app.js
node --check lab/vocab-rush/library-plus.js
node --check lab/vocab-rush/learning-plus.js
node --check lab/vocab-rush/camera-plus.js
node --check lab/vocab-rush/crop-universal.js
node --check tools/build-lab-vocab-rush.mjs
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-vocab-rush.XXXXXX")"; trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-vocab-rush.mjs "$BUILD_DIR"
if [ "$MODE" = "--check" ]; then echo "Vocab Rush ist syntaktisch und als isolierter Build geprüft. Es wurde nichts veröffentlicht."; exit 0; fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then echo "FEHLER: Nicht gespeicherte Repository-Änderungen."; exit 1; fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt."; exit 1; }
echo "Veröffentliche nur Preview-Channel '$CHANNEL_ID' im Staging-Projekt."
firebase hosting:channel:deploy "$CHANNEL_ID" --config "$BUILD_DIR/firebase.json" --project "$PROJECT_ID" --non-interactive
echo "Vocab Rush Preview veröffentlicht."
