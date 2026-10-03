#!/usr/bin/env bash
set -euo pipefail
# Interactive owner-side setup. Never prints/exports provider credential values.
REPOSITORY='HerrLoeffler/Hausaufgabe'
command -v gh >/dev/null
gh auth status
test "$(gh api "repos/$REPOSITORY" --jq .full_name)" = "$REPOSITORY"
printf '%s\n' 'Enter dedicated credentials only at the hidden gh prompts. No existing production key is reused.'
gh secret set CODEX_WORKER_API_KEY --repo "$REPOSITORY"
gh secret set GUARDIAN_OPENAI_REVIEW_KEY --repo "$REPOSITORY"
gh secret set GUARDIAN_ANTHROPIC_REVIEW_KEY --repo "$REPOSITORY"
# Required for bot-created PRs; does not grant the isolated coding job write access.
gh api "repos/$REPOSITORY/actions/permissions/workflow" --method PUT --input - <<'JSON'
{"default_workflow_permissions":"read","can_approve_pull_request_reviews":true}
JSON
gh variable set GRADECREW_GUARDIAN_ENABLED --repo "$REPOSITORY" --body true
gh variable set CODEX_WORKER_ENABLED --repo "$REPOSITORY" --body true
printf '%s\n' 'Credentials and flags configured. No task or paid call started by this script.'
printf '%s\n' 'A reviewed main task must still be explicitly admitted. Live/Production stays locked.'
