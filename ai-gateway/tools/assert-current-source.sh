#!/usr/bin/env bash
set -euo pipefail

# Recheck immediately before cloud access and traffic promotion, not only
# before the potentially long test/build stage. Never deploy a queued old SHA.
test "${GITHUB_REPOSITORY:?}" = 'HerrLoeffler/Hausaufgabe'
test "${INTEGRATION_BRANCH:?}" = 'integration/ai-gateway-staging'
test "${GITHUB_REF:?}" = "refs/heads/$INTEGRATION_BRANCH"
[[ "${GITHUB_SHA:?}" =~ ^[0-9a-f]{40}$ ]]
current="$(gh api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${INTEGRATION_BRANCH}" --jq .object.sha)"
if [[ "$current" != "$GITHUB_SHA" ]]; then
  echo 'Source advanced; refusing obsolete gateway deployment.' >&2
  exit 1
fi
