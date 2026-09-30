#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in
  --check|--deploy) ;;
  *) echo "Aufruf: bash deploy-lab-fast-quiz.sh --check oder --deploy"; exit 1 ;;
esac

PROJECT_ID="hausaufgabe-staging"
CHANNEL_ID="gradecrew-fast-quiz"

node --check lab/fast-quiz/math-engine-v4.js
node --check lab/fast-quiz/rounding-plus.js
node --check lab/fast-quiz/app-v4.js
node --check tools/build-lab-fast-quiz.mjs

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-fast-quiz.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-fast-quiz.mjs "$BUILD_DIR"

if [ "$MODE" = "--check" ]; then
  echo "Fast Quiz Lab inkl. Runden bis Tausendstel ist syntaktisch und als isolierter Build geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi

if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen. Bitte zuerst prüfen und committen."
  exit 1
fi

command -v firebase >/dev/null || { echo "Firebase CLI fehlt. Installieren: npm install -g firebase-tools"; exit 1; }

echo "Veröffentliche nur den Preview-Channel '$CHANNEL_ID' im Staging-Projekt."
echo "Der Live-Channel von Staging und die Produktion werden nicht verändert."
firebase hosting:channel:deploy "$CHANNEL_ID" \
  --config "$BUILD_DIR/firebase.json" \
  --project "$PROJECT_ID" \
  --non-interactive

echo "Fast Quiz Lab inkl. Runden veröffentlicht. Die Firebase CLI zeigt oben die Preview-URL an."
