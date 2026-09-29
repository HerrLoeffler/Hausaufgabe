#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"

cd "$(dirname "$0")"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Staging-Projekt entspricht dem Produktionsprojekt. Abbruch."
  exit 1
fi

# GradeCrew now has separate AI and assessment Functions codebases plus a
# security-rules cutover that must happen in a reviewed order. A historical
# full deploy must never silently publish both codebases or activate rules.
if grep -q '"codebase"[[:space:]]*:[[:space:]]*"assessment"' firebase.json; then
  cat <<'EOF'
FEHLER: Der generische Full-Staging-Deploy ist für GradeCrew gesperrt.

Grund:
- firebase.json enthält die separate Functions-Codebase "assessment".
- Secure-Assessment-Hosting, Assessment-Functions und Firestore-Regeln haben
  bewusst getrennte, geprüfte Deploy-Schritte.

Verwende stattdessen:
- Frontend unverändert prüfen/deployen: bash deploy-staging-hosting.sh --check|--deploy
- Nur bestehende AI-Functions: bash deploy-staging-functions.sh
- Secure Assessment Preview: bash deploy-secure-assessment-preview.sh --check|--deploy
- Secure Assessment Cutover: erst nach bestandenem Preview-Audit über den
  dafür vorgesehenen Cutover-Plan.

Es wurde nichts veröffentlicht.
EOF
  exit 1
fi

# Legacy fallback for historical checkouts without the assessment codebase.
if [[ "${TESTIFY_ALLOW_FULL_STAGING_DEPLOY:-}" != "yes" ]]; then
  echo "FEHLER: Functions-Quellstand zuerst mit Staging abgleichen."
  echo "Für reine Frontend-Änderungen: ./deploy-staging-hosting.sh"
  echo "Nach Quellabgleich: TESTIFY_ALLOW_FULL_STAGING_DEPLOY=yes ./deploy-staging.sh"
  exit 1
fi

if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "FEHLER: firebase-config.staging.js zeigt nicht auf hausaufgabe-staging. Abbruch."
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$(node -p 'process.versions.node.split(".")[1]')"
if [[ "$NODE_MAJOR" != "22" || "$NODE_MINOR" -lt 13 ]]; then
  echo "FEHLER: Node 22.13 oder neuer wird benötigt. Aktuell: $(node --version)"
  echo "Bitte zuerst: nvm install 22 && nvm use 22"
  exit 1
fi

echo
echo "=== LEGACY STAGING PREFLIGHT ==="
echo "1/4 Abhängigkeiten installieren"
(cd functions && npm ci --include=dev)

echo
echo "2/4 Tests ausführen"
(cd functions && npm test)

echo
echo "3/4 Functions-Syntax und Bezeichner prüfen"
(cd functions && npm run check)

echo
echo "4/4 Browser-App prüfen"
node --check app.js
node --check ai-client.js
node --check editor-drafts.js
node --check ai-review-state.js
node --test ai-review-state.test.js ai-job-report.test.js

echo
echo "✓ Alle Prüfungen erfolgreich."
echo "✓ Zielprojekt: ${PROJECT_ID}"
echo "✓ Produktion (${PRODUCTION_ID}) bleibt unangetastet."
echo

cp firebase-config.staging.js firebase-config.js
mkdir -p public
cp index.html app.js styles.css design-system.css firebase-config.js ai-json-tools.js ai-client.js editor-drafts.js ai-review-state.js public/

echo "Deploy LEGACY STAGING -> ${PROJECT_ID}"
firebase deploy --project "$PROJECT_ID" --only firestore:rules,storage,functions,hosting

echo
echo "✓ STAGING erfolgreich deployed:"
echo "https://${PROJECT_ID}.web.app"
