#!/usr/bin/env bash
set -euo pipefail
# Explicit, isolated staging deployment. Existing Functions/Rules/canonicalHosting untouched.
case "${1:---check}" in --check|--deploy) ;; *) exit 2;; esac
TASK_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$TASK_ROOT"
node --test tools/test-rallye/*.cjs tools/test-rallye/*.mjs tools/games/*.test.cjs assessment-functions/test/*.test.js
node --check lab/test-rallye-functions/index.js
if [[ "${1:---check}" == --check ]]; then exit 0; fi
if [[ -n "$(git status --porcelain)" ]]; then echo 'Commit the candidate before deployment.' >&2; exit 1; fi
TASK_BUILD="$(mktemp -d /private/tmp/test-rallye-staging.XXXXXX)"
node tools/build-test-rallye-preview.mjs "$TASK_BUILD"
firebase deploy --project hausaufgabe-staging --config firebase.testrallye.json --only functions:testrallye --non-interactive
firebase hosting:channel:deploy gradecrew-test-rallye-20261013 --project hausaufgabe-staging --config "$TASK_BUILD/firebase.json" --expires 7d --non-interactive
