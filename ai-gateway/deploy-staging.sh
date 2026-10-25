#!/usr/bin/env bash
set -euo pipefail

EXPECTED_PROJECT="hausaufgabe-staging"
SERVICE="gradecrew-ai-gateway-staging"
REGION="europe-west1"
SERVICE_ACCOUNT="gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com"

required=(
  ANTHROPIC_FEDERATION_RULE_ID
  ANTHROPIC_ORGANIZATION_ID
  ANTHROPIC_SERVICE_ACCOUNT_ID
  ANTHROPIC_WORKSPACE_ID
)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env var: ${name}" >&2
    exit 2
  fi
done

if [[ -n "${ANTHROPIC_API_KEY:-}" || -n "${ANTHROPIC_AUTH_TOKEN:-}" ]]; then
  echo "Refusing deploy: ANTHROPIC_API_KEY/ANTHROPIC_AUTH_TOKEN must stay unset for WIF." >&2
  exit 2
fi

project="$(gcloud config get-value project 2>/dev/null || true)"
if [[ "${project}" != "${EXPECTED_PROJECT}" ]]; then
  echo "Refusing deploy: active gcloud project is '${project}', expected '${EXPECTED_PROJECT}'." >&2
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "${repo_root}"
branch="$(git branch --show-current)"
if [[ "${branch}" != "feature/multi-provider-ai-gateway-v1" ]]; then
  echo "Refusing deploy from branch '${branch}'. Switch to feature/multi-provider-ai-gateway-v1 first." >&2
  exit 2
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing deploy from a dirty working tree. Commit/stash unrelated changes first." >&2
  exit 2
fi

commit="$(git rev-parse HEAD)"
echo "Deploying ${SERVICE} from ${branch}@${commit} to ${EXPECTED_PROJECT}/${REGION}"

gcloud run deploy "${SERVICE}" \
  --project="${EXPECTED_PROJECT}" \
  --region="${REGION}" \
  --source="${repo_root}/ai-gateway" \
  --service-account="${SERVICE_ACCOUNT}" \
  --no-allow-unauthenticated \
  --min=0 \
  --max=2 \
  --concurrency=5 \
  --timeout=60 \
  --set-env-vars="ANTHROPIC_FEDERATION_RULE_ID=${ANTHROPIC_FEDERATION_RULE_ID},ANTHROPIC_ORGANIZATION_ID=${ANTHROPIC_ORGANIZATION_ID},ANTHROPIC_SERVICE_ACCOUNT_ID=${ANTHROPIC_SERVICE_ACCOUNT_ID},ANTHROPIC_WORKSPACE_ID=${ANTHROPIC_WORKSPACE_ID},ANTHROPIC_DEFAULT_MODEL=${ANTHROPIC_DEFAULT_MODEL:-claude-haiku-4-5}"

echo "Deploy complete. Verify the revision image/source, service account, IAM requirement, max instances=2 and concurrency=5 before smoke testing."
