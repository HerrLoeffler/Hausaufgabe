#!/usr/bin/env bash
set -euo pipefail

EXPECTED_PROJECT="hausaufgabe-staging"
EXPECTED_BRANCH="feature/openai-gateway-provider-v1"
SERVICE="gradecrew-ai-gateway-staging"
REGION="europe-west1"
SERVICE_ACCOUNT="gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com"
OPENAI_SECRET_NAME="${OPENAI_SECRET_NAME:-OPENAI_API_KEY}"

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
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "Refusing deploy: do not export OPENAI_API_KEY. Cloud Run must receive it from Secret Manager." >&2
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
if [[ "${branch}" != "${EXPECTED_BRANCH}" ]]; then
  echo "Refusing deploy from branch '${branch}'. Expected '${EXPECTED_BRANCH}'." >&2
  exit 2
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing deploy from a dirty working tree. Commit/stash unrelated changes first." >&2
  exit 2
fi

if ! gcloud secrets describe "${OPENAI_SECRET_NAME}" --project="${EXPECTED_PROJECT}" >/dev/null 2>&1; then
  echo "Refusing deploy: Secret Manager secret '${OPENAI_SECRET_NAME}' is unavailable in ${EXPECTED_PROJECT}." >&2
  exit 2
fi

commit="$(git rev-parse HEAD)"
echo "Deploying ${SERVICE} from ${branch}@${commit} to ${EXPECTED_PROJECT}/${REGION}"
echo "OpenAI credential source: Secret Manager '${OPENAI_SECRET_NAME}' (value is never read by this script)."

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
  --update-env-vars="ANTHROPIC_FEDERATION_RULE_ID=${ANTHROPIC_FEDERATION_RULE_ID},ANTHROPIC_ORGANIZATION_ID=${ANTHROPIC_ORGANIZATION_ID},ANTHROPIC_SERVICE_ACCOUNT_ID=${ANTHROPIC_SERVICE_ACCOUNT_ID},ANTHROPIC_WORKSPACE_ID=${ANTHROPIC_WORKSPACE_ID},ANTHROPIC_DEFAULT_MODEL=${ANTHROPIC_DEFAULT_MODEL:-claude-haiku-4-5},ANTHROPIC_ALLOWED_MODELS=${ANTHROPIC_ALLOWED_MODELS:-claude-haiku-4-5},OPENAI_DEFAULT_MODEL=${OPENAI_DEFAULT_MODEL:-gpt-5.6-luna},OPENAI_ALLOWED_MODELS=${OPENAI_ALLOWED_MODELS:-gpt-5.6-luna}" \
  --update-secrets="OPENAI_API_KEY=${OPENAI_SECRET_NAME}:latest"

echo "Deploy complete. Verify revision/source, service account, IAM requirement, max=2, concurrency=5 and both provider smoke tests."
