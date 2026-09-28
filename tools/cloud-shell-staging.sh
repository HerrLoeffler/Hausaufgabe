#!/usr/bin/env bash
set -euo pipefail
# Run after any Cloud Shell reconnect. No upload, zip extraction or old cwd needed.
GRADECREW_REPO="$HOME/gradecrew-staging-gc1"
GRADECREW_BRANCH="fix/gradecrew-staging-polish"
if [ ! -e "$GRADECREW_REPO" ]; then
  git clone --branch "$GRADECREW_BRANCH" --single-branch https://github.com/HerrLoeffler/Hausaufgabe.git "$GRADECREW_REPO"
fi
cd "$GRADECREW_REPO"
if [ "$(git remote get-url origin)" != "https://github.com/HerrLoeffler/Hausaufgabe.git" ]; then
  echo "FEHLER: Das vorhandene Verzeichnis hat ein anderes Repository."; exit 1
fi
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  echo "FEHLER: Hier liegen eigene Änderungen. Sie wurden nicht überschrieben: $GRADECREW_REPO"; exit 1
fi
git fetch origin "$GRADECREW_BRANCH"
git switch "$GRADECREW_BRANCH"
git merge --ff-only "origin/$GRADECREW_BRANCH"
# Cloud Shell does not always reload nvm after reconnecting.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  set +u
  . "$HOME/.nvm/nvm.sh"
  nvm use 22 || nvm install 22
  set -u
fi
if ! command -v node >/dev/null || [ "$(node -p 'Number(process.versions.node.split(".")[0]) >= 22')" != "true" ]; then
  echo "FEHLER: Node 22 oder neuer wird benötigt. Bitte Node 22 in Cloud Shell aktivieren."; exit 1
fi
if ! command -v firebase >/dev/null; then
  npm install -g firebase-tools
fi
if ! firebase projects:list --json >/dev/null 2>&1; then
  echo "Firebase-Anmeldung ist nötig. Folge jetzt dem Anmeldelink in Cloud Shell."
  firebase login --no-localhost
fi
bash deploy-staging-hosting.sh --deploy
