#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

BRANCH="${1:-}"
if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git branch --show-current)"
fi
if [[ -z "$BRANCH" ]]; then
  echo "FEHLER: Kein Branch angegeben und aktueller Branch konnte nicht ermittelt werden."
  echo "Aufruf: bash cloud-shell-bootstrap.sh <branch>"
  exit 1
fi

echo "=========================================="
echo " GradeCrew · frische Cloud-Shell-Sitzung"
echo "=========================================="
echo "Repo:   $(pwd)"
echo "Branch: $BRANCH"
echo

git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
fi

if ! command -v nvm >/dev/null 2>&1; then
  echo "FEHLER: nvm ist in dieser Cloud-Shell nicht verfügbar."
  exit 1
fi

# Absichtlich immer 'nvm install 22': Das ist idempotent und funktioniert auch
# nach einem Cloud-Shell-Reconnect, wenn die VM die zuvor installierte Version
# nicht mehr besitzt.
nvm install 22
nvm use 22
nvm alias default 22 >/dev/null

# Deploy-Skripte verwenden den Firebase-CLI-Befehl direkt. In einer frischen
# Cloud-Shell kann er fehlen, deshalb nur bei Bedarf installieren.
if ! command -v firebase >/dev/null 2>&1; then
  echo "Firebase CLI fehlt – wird einmalig für diese Umgebung installiert …"
  npm install -g firebase-tools
fi

echo
echo "Bereit."
echo "Node:     $(node --version)"
echo "npm:      $(npm --version)"
echo "Firebase: $(firebase --version)"
echo "Branch:   $(git branch --show-current)"
echo "Commit:   $(git rev-parse HEAD)"

if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo
  echo "WARNUNG: Working Tree ist nicht sauber:"
  git status --short
else
  echo "Working Tree: sauber"
fi
