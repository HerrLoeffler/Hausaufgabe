#!/usr/bin/env bash
# Deploy exactly one verified GradeCrew integration commit's AI codebase to STAGING.
# This script is fail-closed: project, branch and source SHA are fixed/verified.
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
INTEGRATION_BRANCH="feature/gradecrew-app-integration"
EXPECTED_SHA="${1:-}"
MODE="${2:-}"

if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Usage: bash tools/automation/deploy-staging-ai-functions.sh <40-char-integration-sha> [--deploy]"
  exit 2
fi

command -v git >/dev/null || { echo "FEHLER: git fehlt."; exit 1; }
command -v node >/dev/null || { echo "FEHLER: Node.js fehlt."; exit 1; }
command -v npm >/dev/null || { echo "FEHLER: npm fehlt."; exit 1; }

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$REMOTE_URL" != *"HerrLoeffler/Hausaufgabe"* ]]; then
  echo "FEHLER: Dieses Skript darf nur im GradeCrew-Repository laufen."
  exit 1
fi

git fetch origin "$INTEGRATION_BRANCH" --quiet
REMOTE_SHA="$(git rev-parse "origin/$INTEGRATION_BRANCH")"
if [[ "$REMOTE_SHA" != "$EXPECTED_SHA" ]]; then
  echo "FEHLER: Erwarteter SHA ist nicht mehr der aktuelle Integrationsstand."
  echo "Erwartet: $EXPECTED_SHA"
  echo "Aktuell:  $REMOTE_SHA"
  echo "Erst neuen CI-/Release-Nachweis prüfen; kein veraltetes Staging deployen."
  exit 1
fi

WORKTREE="$(mktemp -d "${TMPDIR:-/tmp}/gradecrew-staging-ai.XXXXXX")"
cleanup() {
  git -C "$ROOT" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$WORKTREE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git worktree add --detach "$WORKTREE" "$EXPECTED_SHA" >/dev/null
cd "$WORKTREE"

[[ "$(git rev-parse HEAD)" == "$EXPECTED_SHA" ]] || { echo "FEHLER: Worktree-SHA stimmt nicht."; exit 1; }
grep -q '"codebase": "ai"' firebase.json || { echo "FEHLER: AI-Codebase fehlt in firebase.json."; exit 1; }
grep -q 'crewAssistant' functions/main.js || { echo "FEHLER: crewAssistant fehlt im Zielcommit."; exit 1; }
grep -q 'reviseWholeTest' functions/main.js || { echo "FEHLER: reviseWholeTest fehlt im Zielcommit."; exit 1; }

if grep -q 'hausaufgabe-40294' .firebaserc 2>/dev/null; then
  echo "HINWEIS: .firebaserc enthält eine Production-Referenz; deploy target bleibt trotzdem hart $PROJECT_ID."
fi

echo "GradeCrew STAGING AI Functions"
echo "Projekt: $PROJECT_ID"
echo "Branch:  $INTEGRATION_BRANCH"
echo "Commit:  $EXPECTED_SHA"
echo "Scope:   functions:ai (keine Rules, kein Hosting, kein Assessment, keine Production)"

echo
echo "Prüfe Functions-Code ..."
npm ci --prefix functions --no-audit --no-fund
npm test --prefix functions
npm run check --prefix functions

if [[ "$MODE" != "--deploy" ]]; then
  echo
  echo "DRY RUN erfolgreich. Es wurde nichts deployed."
  echo "Für den echten Staging-Deploy denselben Befehl mit --deploy wiederholen."
  exit 0
fi

if command -v firebase >/dev/null; then
  FIREBASE=(firebase)
else
  echo "Firebase CLI nicht global vorhanden; verwende gepinnte firebase-tools 15.32.0 via npx."
  FIREBASE=(npx --yes firebase-tools@15.32.0)
fi

echo
echo "Verifiziere Firebase-Zugriff auf $PROJECT_ID ..."
"${FIREBASE[@]}" projects:list --json >/dev/null

echo "Deploye ausschließlich AI-Codebase nach STAGING ..."
"${FIREBASE[@]}" deploy --project "$PROJECT_ID" --only functions:ai --non-interactive

echo
echo "STAGING AI Functions deploy abgeschlossen für $EXPECTED_SHA."
echo "Production, Firestore Rules, Hosting und Assessment-Codebase wurden von diesem Skript nicht angefordert."
