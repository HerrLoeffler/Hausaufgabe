#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="${GC_EMULATOR_PROJECT_ID:-gradecrew-emulator-ci}"
FIREBASE_TOOLS_VERSION="${GC_FIREBASE_TOOLS_VERSION:-15.32.0}"

if [[ ! -f firebase.json || ! -f firestore.rules ]]; then
  echo "[GradeCrew Emulator] Kein firebase.json/firestore.rules im geprüften Stand – Emulator-Gate nicht anwendbar."
  exit 0
fi

if [[ ! -f emulator-tests/package.json ]]; then
  echo "[GradeCrew Emulator] emulator-tests/package.json fehlt." >&2
  exit 2
fi

install_dir() {
  local dir="$1"
  [[ -f "$dir/package.json" ]] || return 0
  if [[ -f "$dir/package-lock.json" ]]; then
    npm ci --prefix "$dir" --no-audit --no-fund
  else
    npm install --prefix "$dir" --no-audit --no-fund --package-lock=false
  fi
}

install_dir emulator-tests
install_dir functions
install_dir assessment-functions

ONLY="firestore"
if [[ -f assessment-functions/main.js || -f assessment-functions/index.js ]]; then
  ONLY="firestore,functions"
fi

export GC_EMULATOR_PROJECT_ID="$PROJECT_ID"
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
export FUNCTIONS_EMULATOR_HOST="127.0.0.1:5001"

CMD="node --test --test-concurrency=1 emulator-tests/*.test.mjs"
echo "[GradeCrew Emulator] project=$PROJECT_ID, emulators=$ONLY"

npx --yes "firebase-tools@${FIREBASE_TOOLS_VERSION}" \
  emulators:exec \
  --project "$PROJECT_ID" \
  --only "$ONLY" \
  "$CMD"
