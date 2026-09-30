#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-secure-assessment-preview.sh --check oder --deploy"; exit 1 ;; esac

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"
BRANCH="feature/secure-assessment-v1"
CHANNEL="secure-assessment-v1"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Preview-Ziel entspricht Production. Abbruch."
  exit 1
fi
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
if [[ "$(node -p 'require("./assessment-functions/package.json").main')" != "main.js" ]]; then
  echo "FEHLER: Assessment-Codebase zeigt nicht auf den gehärteten main.js-Einstieg."
  exit 1
fi
if grep -q 'require("./index")' assessment-functions/main.js; then
  echo "FEHLER: main.js bindet den alten Assessment-Handler ein. Abbruch."
  exit 1
fi
if ! grep -q 'secure-lifecycle' assessment-functions/main.js; then
  echo "FEHLER: main.js exportiert den autoritativen Secure-Lifecycle nicht."
  exit 1
fi
if ! grep -q '"codebase": "assessment"' firebase.json; then
  echo "FEHLER: firebase.json enthält die isolierte Assessment-Codebase nicht."
  exit 1
fi

# Backend zuerst separat prüfen. Der anschließende gemeinsame Staging-Check
# validiert zusätzlich den vollständigen Browser-/Tutorial-/Diagnose-RC und den
# tatsächlichen Hosting-Build. So kann der Security-Preview nicht versehentlich
# einen älteren Mobile-/Tutorial-Stand ausliefern.
npm install --prefix assessment-functions --no-package-lock --no-audit --no-fund
npm test --prefix assessment-functions
npm run check --prefix assessment-functions

bash deploy-staging-hosting.sh --check

node --check secure-assessment-client.js
node --check secure-draft-persistence.js
node --check secure-student.js
node --check secure-deadline-guard.js
node --check secure-result-policy.js
node --check secure-solution-release.js
node --check secure-assessment-teacher-polish.js
node --check startup.js

node --test \
  secure-assessment-client.test.mjs \
  secure-draft-persistence.test.mjs \
  secure-student.test.mjs \
  secure-deadline-guard.test.mjs \
  secure-result-policy.test.mjs \
  secure-solution-release.test.mjs \
  secure-assessment-teacher-polish.test.mjs \
  secure-student-route.test.mjs \
  secure-firestore-rules.test.mjs

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-secure-preview.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-staging.mjs "$BUILD_DIR"
for REQUIRED in \
  mobile-viewport-polish.js \
  first-guide-responsive.js \
  crew-tour-responsive.js \
  secure-student.html \
  secure-draft-persistence.js \
  secure-student.js \
  secure-assessment-client.js \
  secure-deadline-guard.js \
  secure-result-policy.js \
  secure-solution-release.js \
  secure-assessment-teacher-polish.js; do
  test -f "$BUILD_DIR/public/$REQUIRED" || {
    echo "FEHLER: $REQUIRED fehlt im Preview-Build."
    exit 1
  }
done
grep -q 'secure-draft-persistence.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-deadline-guard.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-result-policy.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-solution-release.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'hausaufgabe-staging' "$BUILD_DIR/public/firebase-config.js"
grep -q '"mobileTutorial": "gc28-mobile"' "$BUILD_DIR/public/release.json"
grep -q '"secureAssessment": "v1"' "$BUILD_DIR/public/release.json"

if [[ "$MODE" = "--check" ]]; then
  echo "Secure Assessment Preview + vollständiger GradeCrew-RC geprüft. Es wurde nichts veröffentlicht."
  echo "Commit: $(git rev-parse HEAD)"
  echo "Hinweis: Die semantischen Firestore-Emulator-Tests laufen verpflichtend in GitHub CI mit Java 21."
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
Commit:  $(git rev-parse HEAD)

1. Nur die isolierte Functions-Codebase "assessment" wird auf STAGING deployed.
2. Die neue Oberfläche landet auf einem Preview Channel.
3. https://hausaufgabe-staging.web.app bleibt unverändert.
4. Firestore-Regeln werden noch NICHT verschärft.
5. Production ($PRODUCTION_ID) bleibt unverändert.

WICHTIG:
Dieser Preview ist ein FUNKTIONS-/INTEGRATIONSTEST, noch kein belastbarer
Security-Cutover. Solange die alten Staging-Firestore-Regeln aktiv sind, kann
ein technisch versierter Tester weiterhin alte direkte Firestore-Pfade prüfen.
Adversarial Security Testing erfolgt erst nach dem kontrollierten Rules-Cutover.
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
echo "WICHTIG: Das ist noch kein Security-Cutover; die bestehenden Staging-Firestore-Regeln bleiben absichtlich unverändert."
