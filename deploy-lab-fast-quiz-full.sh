#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:---check}"
case "$MODE" in
  --check|--deploy) ;;
  *) echo "Aufruf: bash deploy-lab-fast-quiz-full.sh --check oder --deploy"; exit 1 ;;
esac

if [ "$MODE" = "--check" ]; then
  bash deploy-lab-fast-quiz-backend.sh --check
  bash deploy-lab-fast-quiz.sh --check
  echo "Fast Quiz V4 Frontend + Backend geprüft. Es wurde nichts veröffentlicht."
  exit 0
fi

bash deploy-lab-fast-quiz-backend.sh --deploy
bash deploy-lab-fast-quiz.sh --deploy

echo "Fast Quiz V4 vollständig veröffentlicht: isolierte Fast-Quiz-Function + Preview-Hosting."
