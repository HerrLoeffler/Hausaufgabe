#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
RUNTIME_SERVICE_ACCOUNT="gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com"

active_project="$(gcloud config get-value project 2>/dev/null || true)"
if [[ "${active_project}" != "${PROJECT_ID}" ]]; then
  echo "Refusing setup: active gcloud project is '${active_project}', expected '${PROJECT_ID}'." >&2
  exit 2
fi

if ! gcloud iam service-accounts describe "${RUNTIME_SERVICE_ACCOUNT}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "Refusing setup: runtime service account '${RUNTIME_SERVICE_ACCOUNT}' does not exist." >&2
  exit 2
fi

echo "GradeCrew STAGING Gemini access bootstrap"
echo "Project: ${PROJECT_ID}"
echo "Runtime identity: ${RUNTIME_SERVICE_ACCOUNT}"
echo "Production: excluded"
echo

echo "Enabling Vertex AI API in staging (idempotent)..."
gcloud services enable aiplatform.googleapis.com \
  --project="${PROJECT_ID}" \
  --quiet

echo "Granting only Vertex AI user access to the gateway runtime identity..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${RUNTIME_SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user" \
  --condition=None \
  --quiet >/dev/null

binding="$(gcloud projects get-iam-policy "${PROJECT_ID}" \
  --flatten='bindings[].members' \
  --filter="bindings.role=roles/aiplatform.user AND bindings.members=serviceAccount:${RUNTIME_SERVICE_ACCOUNT}" \
  --format='value(bindings.members)' | head -n 1)"

if [[ "${binding}" != "serviceAccount:${RUNTIME_SERVICE_ACCOUNT}" ]]; then
  echo "Gemini setup verification failed: roles/aiplatform.user binding is missing." >&2
  exit 1
fi

echo
echo "Gemini staging access is ready."
echo "- Vertex AI API: enabled"
echo "- Runtime SA: roles/aiplatform.user"
echo "- No Gemini API key or secret created"
echo "- No Production role changed"
