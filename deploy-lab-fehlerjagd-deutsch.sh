#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-fehlerjagd-deutsch.sh --check oder --deploy"; exit 1;; esac
PROJECT_ID="hausaufgabe-staging"; CHANNEL_ID="gradecrew-fehlerjagd-deutsch"
node --check lab/fehlerjagd-deutsch/deutsch-engine.js
node --check lab/fehlerjagd-deutsch/app.js
node --check tools/build-lab-fehlerjagd-deutsch.mjs
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-fehlerjagd.XXXXXX")"; trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-fehlerjagd-deutsch.mjs "$BUILD_DIR"
if [ "$MODE" = "--check" ]; then echo "Fehlerjagd Deutsch ist syntaktisch und als isolierter Build geprüft. Es wurde nichts veröffentlicht."; exit 0; fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then echo "FEHLER: Nicht gespeicherte Repository-Änderungen."; exit 1; fi
command -v firebase >/dev/null || { echo "Firebase CLI fehlt."; exit 1; }
echo "Veröffentliche nur Preview-Channel '$CHANNEL_ID' im Staging-Projekt."
firebase hosting:channel:deploy "$CHANNEL_ID" --config "$BUILD_DIR/firebase.json" --project "$PROJECT_ID" --non-interactive
echo "Fehlerjagd Deutsch Preview veröffentlicht."
