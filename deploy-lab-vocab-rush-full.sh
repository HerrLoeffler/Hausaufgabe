#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo "Aufruf: bash deploy-lab-vocab-rush-full.sh --check oder --deploy"; exit 1;; esac
bash deploy-lab-vocab-rush-backend.sh "$MODE"
bash deploy-lab-vocab-rush.sh "$MODE"
if [ "$MODE" = "--check" ]; then echo "Vocab Rush Frontend + Backend geprüft. Es wurde nichts veröffentlicht."; else echo "Vocab Rush vollständig im Lab veröffentlicht."; fi
