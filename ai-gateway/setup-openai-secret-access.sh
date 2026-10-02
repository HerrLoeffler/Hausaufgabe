#!/usr/bin/env bash
set -euo pipefail

EXPECTED_PROJECT="hausaufgabe-staging"
SERVICE_ACCOUNT="gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com"
SECRET_NAME="${OPENAI_SECRET_NAME:-OPENAI_API_KEY}"

project="$(gcloud config get-value project 2>/dev/null || true)"
if [[ "${project}" != "${EXPECTED_PROJECT}" ]]; then
  echo "Refusing setup: active gcloud project is '${project}', expected '${EXPECTED_PROJECT}'." >&2
  exit 2
fi

if ! gcloud secrets describe "${SECRET_NAME}" --project="${EXPECTED_PROJECT}" >/dev/null 2>&1; then
  echo "Secret '${SECRET_NAME}' does not exist in ${EXPECTED_PROJECT}; refusing to create or upload a key." >&2
  exit 2
fi

# Grant only this runtime identity access to this one existing secret. No project-wide Secret Manager role.
gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
  --project="${EXPECTED_PROJECT}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

echo "Granted ${SERVICE_ACCOUNT} runtime access to existing secret ${SECRET_NAME}."
echo "No secret value was read, printed, copied or changed."
