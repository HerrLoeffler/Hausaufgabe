#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-fehlerjagd-deutsch-full.sh --check oder --deploy"; exit 1;; esac
if [ "$MODE" = "--check" ]; then
  bash deploy-lab-fehlerjagd-deutsch-backend.sh --check
  bash deploy-lab-fehlerjagd-deutsch.sh --check
  echo "Fehlerjagd Deutsch Frontend + Backend geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi
bash deploy-lab-fehlerjagd-deutsch-backend.sh --deploy
bash deploy-lab-fehlerjagd-deutsch.sh --deploy
echo "Fehlerjagd Deutsch vollständig im Lab veröffentlicht."
