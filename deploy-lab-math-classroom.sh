#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo 'Use --check or --deploy'; exit 1;; esac
npm test --prefix tools/games
bash deploy-lab-fast-quiz-backend.sh --check
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-games-hub.mjs "$BUILD_DIR"
if [ "$MODE" = --check ]; then echo 'Checked only; no deployment.'; exit 0; fi
[ -z "$(git status --porcelain)" ] || { echo 'Commit changes first.'; exit 1; }
command -v firebase >/dev/null || { echo 'Existing authorized Firebase staging login required.'; exit 1; }
echo "Source $(git rev-parse HEAD); target hausaufgabe-staging; functions:fastquiz + isolated gradecrew-math-classroom-20261016 Hosting channel."
bash deploy-lab-fast-quiz-backend.sh --deploy
firebase hosting:channel:deploy gradecrew-math-classroom-20261016 --expires 7d --config "$BUILD_DIR/firebase.json" --project hausaufgabe-staging --non-interactive
