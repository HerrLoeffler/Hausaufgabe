#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-games-hub.sh --check oder --deploy"; exit 1;; esac
PROJECT_ID="hausaufgabe-staging"
CHANNEL_ID="gradecrew-games-hub"

# Fast Quiz
node --check lab/fast-quiz/app-v4.js
node --check lab/fast-quiz/math-engine-v4.js

# Fehlerjagd Deutsch
node --check lab/fehlerjagd-deutsch/app.js
node --check lab/fehlerjagd-deutsch/deutsch-engine.js
node --check lab/fehlerjagd-deutsch/task-integrity.js
node --check lab/fehlerjagd-deutsch/curriculum-polish.js
if [ -f lab/fehlerjagd-deutsch/feedback-polish.js ]; then node --check lab/fehlerjagd-deutsch/feedback-polish.js; fi

# Vocab Rush – exakt derselbe Frontend-Stand wie im eigenen Preview
node --check lab/vocab-rush/curriculum.js
node --check lab/vocab-rush/app.js
node --check lab/vocab-rush/library-plus.js
node --check lab/vocab-rush/mode-consistency.js
node --check lab/vocab-rush/learning-plus.js
node --check lab/vocab-rush/ux-polish.js
node --check lab/vocab-rush/camera-plus.js
node --check lab/vocab-rush/crop-universal.js
node --check tools/build-lab-vocab-rush.mjs
node --check tools/build-lab-games-hub.mjs

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-games-hub.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-games-hub.mjs "$BUILD_DIR"

if [ "$MODE" = "--check" ]; then
  echo "GradeCrew Games Hub mit Fast Quiz + Fehlerjagd Deutsch + Vocab Rush geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi

if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen."
  exit 1
fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt."; exit 1; }

echo "Veröffentliche nur Preview-Channel '$CHANNEL_ID' im Staging-Projekt."
echo "Enthalten: Fast Quiz + Fehlerjagd Deutsch + Vocab Rush."
echo "Bestehende Functions/Backends, normales Staging-Hosting und Production werden nicht verändert."
firebase hosting:channel:deploy "$CHANNEL_ID" --config "$BUILD_DIR/firebase.json" --project "$PROJECT_ID" --non-interactive

echo "GradeCrew Games Hub Preview mit allen 3 Spielen veröffentlicht."
