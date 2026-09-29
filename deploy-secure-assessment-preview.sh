#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-secure-assessment-preview.sh --check oder --deploy"; exit 1 ;; esac

PROJECT_ID="hausaufgabe-staging"
BRANCH="feature/secure-assessment-v1"
CHANNEL="secure-assessment-v1"

if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "FEHLER: Bitte zuerst Branch $BRANCH öffnen."
  exit 1
fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "FEHLER: Nicht gespeicherte Repository-Änderungen. Erst sichern oder verwerfen."
  git status --short
  exit 1
fi
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  echo "FEHLER: Node 22 erforderlich. Bitte zuerst: nvm use 22"
  exit 1
fi
if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: Staging-Konfiguration zeigt nicht auf $PROJECT_ID."
  exit 1
fi

npm install --prefix assessment-functions --no-package-lock --no-audit --no-fund
npm test --prefix assessment-functions
npm run check --prefix assessment-functions
node --test secure-assessment-client.test.mjs secure-student.test.mjs secure-student-route.test.mjs secure-firestore-rules.test.mjs

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-secure-preview.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-staging.mjs "$BUILD_DIR"
test -f "$BUILD_DIR/public/secure-student.html"
test -f "$BUILD_DIR/public/secure-student.js"
test -f "$BUILD_DIR/public/secure-assessment-client.js"

if [[ "$MODE" = "--check" ]]; then
  echo "Secure Assessment Preview geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi

command -v firebase >/dev/null || {
  echo "FEHLER: Firebase CLI fehlt. Installieren: npm install -g firebase-tools"
  exit 1
}

cat <<EOF
==========================================
 GRADECREW SECURE ASSESSMENT · PREVIEW
==========================================
Projekt: $PROJECT_ID
Branch:  $BRANCH

1. Nur die isolierte Functions-Codebase "assessment" wird auf STAGING deployed.
2. Die neue Oberfläche landet auf einem Preview Channel.
3. https://hausaufgabe-staging.web.app bleibt unverändert.
4. Firestore-Regeln werden noch NICHT verschärft.
5. Production bleibt unverändert.
EOF

firebase deploy \
  --project "$PROJECT_ID" \
  --only functions:assessment \
  --non-interactive

firebase hosting:channel:deploy "$CHANNEL" \
  --project "$PROJECT_ID" \
  --config "$BUILD_DIR/firebase.json" \
  --expires 7d \
  --non-interactive

echo
echo "Preview veröffentlicht. Verwende die vom Firebase-CLI ausgegebene Preview-URL zum Testen."
echo "WICHTIG: Das ist noch kein Security-Cutover; die bestehenden Staging-Firestore-Regeln bleiben absichtlich offen."
