#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_ID="hausaufgabe-staging"
BRANCH="feature/secure-assessment-v1"

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

command -v firebase >/dev/null || {
  echo "FEHLER: Firebase CLI fehlt. Installieren: npm install -g firebase-tools"
  exit 1
}

# Kein package-lock während des Prüfdeploys erzeugen; der Branch muss sauber bleiben.
npm install --prefix assessment-functions --no-package-lock --no-audit --no-fund
npm test --prefix assessment-functions
npm run check --prefix assessment-functions
node --test secure-assessment-client.test.mjs secure-student.test.mjs

cat <<'EOF'
==========================================
 GRADECREW SECURE ASSESSMENT · STAGING
==========================================
Es werden ausschließlich die Functions des Codebase "assessment" auf
hausaufgabe-staging veröffentlicht. Hosting, Firestore-Regeln, die bestehende
KI-Codebase und Production bleiben unverändert.
EOF

firebase deploy \
  --project "$PROJECT_ID" \
  --only functions:assessment \
  --non-interactive

echo
echo "Secure Assessment Backend auf Staging veröffentlicht."
echo "Nächster Schritt: sicheren Schülerclient separat auf Staging veröffentlichen und adversarial testen."
