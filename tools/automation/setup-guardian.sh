#!/usr/bin/env bash
set -euo pipefail
# Interactive owner-side setup. Never prints/exports provider credential values.
REPOSITORY='HerrLoeffler/Hausaufgabe'
TASK_ID="${1:-}"
if [ "$#" -gt 1 ] || { [ -n "$TASK_ID" ] && [[ ! "$TASK_ID" =~ ^[a-z0-9][a-z0-9-]{0,79}$ ]]; }; then
  printf '%s\n' 'Usage: setup-guardian.sh [reviewed-main-task-id]' >&2
  exit 2
fi
command -v gh >/dev/null
gh auth status
test "$(gh api "repos/$REPOSITORY" --jq .full_name)" = "$REPOSITORY"
if [ -n "$TASK_ID" ]; then
  # Confirm a concrete main task exists before changing account configuration.
  gh api "repos/$REPOSITORY/contents/agent-queue/$TASK_ID.json?ref=main" >/dev/null
fi
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
if [ -n "$TASK_ID" ]; then
  gh workflow run guardian-admit.yml --repo "$REPOSITORY" --ref main --field "task_id=$TASK_ID"
  printf '%s\n' 'Admission requested once. Check its run: stale source or missing keys blocks all paid work.'
  printf '%s\n' 'Do not repeat on an unknown dispatch result; inspect Actions first. Production stays locked.'
else
  printf '%s\n' 'Credentials and flags configured. No task or paid call started by this script.'
  printf '%s\n' 'A reviewed main task must still be explicitly admitted. Live/Production stays locked.'
fi
