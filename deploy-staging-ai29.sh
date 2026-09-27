#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ "$(git branch --show-current)" != "fix/ai-review-workflow" ]]; then
  echo "Bitte zuerst den Branch fix/ai-review-workflow öffnen."
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Lokale Änderungen vorhanden. Bitte erhalten und zuerst abgleichen."
  git status --short
  exit 1
fi
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  echo "Bitte zuerst: nvm use 22"
  exit 1
fi
if ! grep -q 'projectId: "hausaufgabe-staging"' firebase-config.staging.js; then
  echo "Staging-Konfiguration stimmt nicht. Abbruch."
  exit 1
fi
echo "Testify ai29 · nur hausaufgabe-staging"
echo "1/3 Prüfen und laufenden Quellcode sichern"
(cd functions && npm ci && npm test && npm run check)
node --check app.js
node --check ai-review-state.js
node --test ai-*.test.js
PYTHONDONTWRITEBYTECODE=1 python3 tools/check-ai29-source.py
echo "2/3 Betroffene Staging-Funktionen aktualisieren"
firebase deploy --project hausaufgabe-staging --only functions:getAiStatus,functions:generateTest,functions:processAiTestJob,functions:regenerateQuestion,functions:generateQuestionMedia,functions:analyzeMaterial
echo "3/3 Staging-Oberfläche aktualisieren"
bash deploy-staging-hosting.sh
echo "Staging ai29 bereit. Jetzt mit unkritischen Beispielen prüfen."
