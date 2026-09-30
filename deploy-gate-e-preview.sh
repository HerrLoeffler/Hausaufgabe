#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-gate-e-preview.sh --check oder --deploy"; exit 1 ;; esac

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"
BRANCH="feature/gate-e-load-test"
CHANNEL="gate-e-lab"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Gate-E-Ziel entspricht Production. Abbruch."
  exit 1
fi
if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "FEHLER: Bitte zuerst Branch $BRANCH öffnen."
  exit 1
fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen."
  git status --short
  exit 1
fi

# Frische Cloud-Shell-Sitzungen dürfen keine aktive Node-Version voraussetzen.
# Das Deployskript lädt nvm deshalb selbst und stellt Node 22 im selben Prozess sicher.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
fi
if ! command -v nvm >/dev/null 2>&1; then
  echo "FEHLER: nvm ist in dieser Cloud-Shell nicht verfügbar."
  exit 1
fi
nvm install 22 >/dev/null
nvm use 22 >/dev/null

if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  echo "FEHLER: Node 22 konnte nicht aktiviert werden."
  exit 1
fi
if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: Staging-Konfiguration zeigt nicht auf $PROJECT_ID."
  exit 1
fi

echo "Gate E Preflight · Node $(node --version) · Branch $(git branch --show-current) · Commit $(git rev-parse --short HEAD)"

node --check gate-e-lab.js
node --test gate-e-lab.test.mjs
node --check tools/gate-e-load-test.mjs
node --test tools/gate-e-load-test.test.mjs

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-gate-e-preview.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-staging.mjs "$BUILD_DIR"

test -f "$BUILD_DIR/public/gate-e-lab.js" || {
  echo "FEHLER: gate-e-lab.js fehlt im Staging-Build."
  exit 1
}
grep -q 'appEnvironment = "staging"' "$BUILD_DIR/public/firebase-config.js"
grep -q 'gradecrew-gate-e-students' "$BUILD_DIR/public/gate-e-lab.js"
grep -q 'const PARTICIPANTS = 30' "$BUILD_DIR/public/gate-e-lab.js"

if [[ "$MODE" = "--check" ]]; then
  echo "Gate E Preview geprüft. Es wurde nichts veröffentlicht."
  echo "Commit: $(git rev-parse HEAD)"
  exit 0
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "Firebase CLI fehlt – wird für diese Cloud-Shell installiert …"
  npm install -g firebase-tools
fi

cat <<EOF
==========================================
 GRADECREW · GATE E STAGING LAB
==========================================
Projekt: $PROJECT_ID
Branch:  $BRANCH
Commit:  $(git rev-parse HEAD)
Channel: $CHANNEL

- Es wird NUR ein separater Hosting-Preview-Channel veröffentlicht.
- Die bereits deployten Secure-Assessment-Functions auf Staging werden verwendet.
- Normales Staging bleibt unverändert.
- Secure-Assessment-Preview bleibt unverändert.
- Firestore-Regeln werden NICHT verändert.
- Production ($PRODUCTION_ID) bleibt unverändert.
EOF

firebase hosting:channel:deploy "$CHANNEL" \
  --project "$PROJECT_ID" \
  --config "$BUILD_DIR/firebase.json" \
  --expires 7d \
  --non-interactive

echo
echo "Gate E Lab veröffentlicht. Öffne die ausgegebene Preview-URL mit ?gateE=1."
