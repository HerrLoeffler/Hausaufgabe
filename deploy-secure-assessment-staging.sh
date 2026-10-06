#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"
BRANCH="feature/secure-assessment-v1"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Staging-Ziel entspricht Production. Abbruch."
  exit 1
fi
if [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  echo "FEHLER: Secure Assessment darf derzeit nur vom Branch $BRANCH deployed werden."
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
  echo "FEHLER: Assessment-Codebase zeigt nicht auf main.js."
  exit 1
fi
if grep -q 'require("./index")' assessment-functions/main.js || ! grep -q 'secure-lifecycle' assessment-functions/main.js; then
  echo "FEHLER: Assessment-Einstieg ist nicht der gehärtete Secure-Lifecycle."
  exit 1
fi

command -v firebase >/dev/null || {
  echo "FEHLER: Firebase CLI fehlt. Installieren: npm install -g firebase-tools"
  exit 1
}

npm ci --prefix assessment-functions --no-audit --no-fund
npm test --prefix assessment-functions
npm run check --prefix assessment-functions
node --test secure-assessment-client.test.mjs secure-student.test.mjs secure-student-route.test.mjs secure-firestore-rules.test.mjs

cat <<EOF
==========================================
 GRADECREW SECURE ASSESSMENT · STAGING
==========================================
Projekt: $PROJECT_ID
Branch:  $BRANCH
Commit:  $(git rev-parse HEAD)

Es werden ausschließlich die Functions der Codebase "assessment" auf
hausaufgabe-staging veröffentlicht. Hosting, Firestore-Regeln, die bestehende
AI-Codebase und Production ($PRODUCTION_ID) bleiben unverändert.
EOF

firebase deploy \
  --project "$PROJECT_ID" \
  --only functions:assessment \
  --non-interactive

echo
echo "Secure Assessment Backend auf Staging veröffentlicht."
echo "Noch KEIN Security-Cutover: Hosting und Firestore-Regeln sind unverändert."
