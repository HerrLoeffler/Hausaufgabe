#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---check}"
case "$MODE" in --check|--deploy) ;; *) echo 'Use --check or --deploy'; exit 1;; esac
PROJECT_ID='gradecrew-staging-2026'
[ "$PROJECT_ID" = gradecrew-staging-2026 ] || exit 1
npm test --prefix tools/games
node --check lab/fast-quiz-functions/index.js
node --check lab/fast-quiz-functions/classroom-v2.js
node --check lab/fast-quiz-functions/classroom-source-repo.js
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
node tools/build-lab-math-classroom.mjs "$BUILD_DIR"
if [ "$MODE" = --check ]; then echo 'Checked only; no deployment.'; exit 0; fi
[ -z "$(git status --porcelain)" ] || { echo 'Commit changes first.'; exit 1; }
command -v firebase >/dev/null || { echo 'Existing authorized Firebase login required.'; exit 1; }
echo "Source $(git rev-parse HEAD); target gradecrew-staging-2026 ONLY; functions:fastquiz + isolated gradecrew-math-classroom-20261018 channel."
firebase deploy --config firebase.fastquiz.json --project "$PROJECT_ID" --only functions:fastquiz --non-interactive
firebase hosting:channel:deploy gradecrew-math-classroom-20261018 --expires 7d --config "$BUILD_DIR/firebase.json" --project "$PROJECT_ID" --non-interactive
