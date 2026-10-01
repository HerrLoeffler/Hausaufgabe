#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="${GC_EMULATOR_PROJECT_ID:-gradecrew-emulator-ci}"
FIREBASE_TOOLS_VERSION="${GC_FIREBASE_TOOLS_VERSION:-15.32.0}"
REPORT_DIR="${GC_EMULATOR_REPORT_DIR:-$ROOT/.gradecrew-reports}"
mkdir -p "$REPORT_DIR"

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
install_dir assessment-functions

ONLY="firestore"
TEMP_CONFIG="$(mktemp "$ROOT/.firebase-emulator.XXXXXX.json")"
cleanup() { rm -f "$TEMP_CONFIG"; }
trap cleanup EXIT

if [[ -f assessment-functions/main.js || -f assessment-functions/index.js ]]; then
  ONLY="firestore,functions"
  cat > "$TEMP_CONFIG" <<'JSON'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "assessment-functions",
      "codebase": "assessment",
      "runtime": "nodejs22"
    }
  ],
  "emulators": {
    "firestore": { "host": "127.0.0.1", "port": 8080 },
    "functions": { "host": "127.0.0.1", "port": 5001 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
JSON
else
  cat > "$TEMP_CONFIG" <<'JSON'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "firestore": { "host": "127.0.0.1", "port": 8080 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
JSON
fi

export GC_EMULATOR_PROJECT_ID="$PROJECT_ID"
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
export FUNCTIONS_EMULATOR_HOST="127.0.0.1:5001"
export GC_TELEMETRY_ENABLED="${GC_TELEMETRY_ENABLED:-false}"

CMD="node --test --test-concurrency=1 emulator-tests/*.test.mjs"
echo "[GradeCrew Emulator] project=$PROJECT_ID, emulators=$ONLY"

set -o pipefail
npx --yes "firebase-tools@${FIREBASE_TOOLS_VERSION}" \
  --config "$TEMP_CONFIG" \
  emulators:exec \
  --project "$PROJECT_ID" \
  --only "$ONLY" \
  "$CMD" 2>&1 | tee "$REPORT_DIR/emulator.log"
