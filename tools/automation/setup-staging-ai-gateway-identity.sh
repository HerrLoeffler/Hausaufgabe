#!/usr/bin/env bash
# One-time setup for automatic GradeCrew AI Gateway deployment to STAGING only.
# Creates a dedicated GitHub OIDC/WIF identity and a least-privilege deployer.
# No Google service-account key is created. Production is explicitly excluded.
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
REPOSITORY="HerrLoeffler/Hausaufgabe"
REPOSITORY_ID="1076884609"
REGION="europe-west1"
SERVICE="gradecrew-ai-gateway-staging"
RUNTIME_ACCOUNT="gradecrew-ai-gateway-staging@$PROJECT_ID.iam.gserviceaccount.com"
DEPLOYER_ACCOUNT_NAME="gradecrew-ai-gateway-deployer"
DEPLOYER_ACCOUNT="$DEPLOYER_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
ARTIFACT_REPOSITORY="gradecrew-ai-gateway"
POOL="gradecrew-gateway-github"
PROVIDER="staging-gateway"
INTEGRATION_BRANCH="integration/ai-gateway-staging"
WORKFLOW="$REPOSITORY/.github/workflows/staging-ai-gateway.yml@refs/heads/$INTEGRATION_BRANCH"
VARIABLE="STAGING_GATEWAY_WIF_PROVIDER"
POOL_DISPLAY='GradeCrew Gateway Staging'
PROVIDER_DISPLAY='Gateway GitHub OIDC'
MAX_DISPLAY=32

[[ ${#POOL_DISPLAY} -le $MAX_DISPLAY ]] || { echo 'FEHLER: Pool-Anzeigename zu lang.'; exit 1; }
[[ ${#PROVIDER_DISPLAY} -le $MAX_DISPLAY ]] || { echo 'FEHLER: Provider-Anzeigename zu lang.'; exit 1; }
command -v gcloud >/dev/null || { echo 'FEHLER: Bitte in der authentifizierten Google Cloud Shell ausführen.'; exit 1; }

ACTIVE_PROJECT="$(gcloud config get-value project 2>/dev/null || true)"
if [[ "$ACTIVE_PROJECT" != "$PROJECT_ID" ]]; then
  echo "FEHLER: Aktives Projekt ist '$ACTIVE_PROJECT', erwartet '$PROJECT_ID'."
  exit 1
fi
[[ "$PROJECT_ID" != 'hausaufgabe-40294' ]] || { echo 'FEHLER: Production ist für dieses Skript verboten.'; exit 1; }

gcloud projects describe "$PROJECT_ID" --format='value(projectId)' | grep -qx "$PROJECT_ID" || {
  echo "FEHLER: Staging-Projekt $PROJECT_ID ist nicht erreichbar."
  exit 1
}
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
[[ "$PROJECT_NUMBER" =~ ^[0-9]+$ ]] || { echo 'FEHLER: Projekt-Nummer konnte nicht bestimmt werden.'; exit 1; }

# The runtime service and account must already exist. This prevents this setup from
# silently bootstrapping a second gateway or a Production-like service by mistake.
gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" >/dev/null
gcloud iam service-accounts describe "$RUNTIME_ACCOUNT" --project "$PROJECT_ID" >/dev/null

echo 'GradeCrew STAGING AI Gateway Automation'
echo "Projekt:        $PROJECT_ID"
echo "Service:        $SERVICE"
echo "Integration:    $INTEGRATION_BRANCH"
echo "Deployer:       $DEPLOYER_ACCOUNT"
echo 'Production:     ausgeschlossen'
echo

gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  serviceusage.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

if ! gcloud iam service-accounts describe "$DEPLOYER_ACCOUNT" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$DEPLOYER_ACCOUNT_NAME" \
    --display-name='GradeCrew staging gateway deployer' \
    --project "$PROJECT_ID"
fi

# Project-level permissions are intentionally limited to updating Cloud Run service
# configuration and consuming enabled APIs. No IAM-admin, Secret Accessor or Production role.
for role in \
  roles/run.developer \
  roles/serviceusage.serviceUsageConsumer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$DEPLOYER_ACCOUNT" \
    --role="$role" \
    --condition=None \
    --quiet >/dev/null
done

# The deployer may only act as the existing gateway runtime identity.
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_ACCOUNT" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_ACCOUNT" \
  --role=roles/iam.serviceAccountUser \
  --quiet >/dev/null

# Create a dedicated Artifact Registry repository for immutable gateway images.
if ! gcloud artifacts repositories describe "$ARTIFACT_REPOSITORY" \
  --project "$PROJECT_ID" --location "$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$ARTIFACT_REPOSITORY" \
    --project "$PROJECT_ID" \
    --location "$REGION" \
    --repository-format=docker \
    --description='GradeCrew staging AI gateway images'
fi

gcloud artifacts repositories add-iam-policy-binding "$ARTIFACT_REPOSITORY" \
  --project "$PROJECT_ID" \
  --location "$REGION" \
  --member="serviceAccount:$DEPLOYER_ACCOUNT" \
  --role=roles/artifactregistry.writer \
  --quiet >/dev/null

# The private candidate/base URLs are invoked only by this deployer during smoke tests.
gcloud run services add-iam-policy-binding "$SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --member="serviceAccount:$DEPLOYER_ACCOUNT" \
  --role=roles/run.invoker \
  --quiet >/dev/null

if ! gcloud iam workload-identity-pools describe "$POOL" \
  --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL" \
    --location=global \
    --display-name="$POOL_DISPLAY" \
    --project "$PROJECT_ID"
fi

CONDITION="assertion.repository_id == '$REPOSITORY_ID' && assertion.workflow_ref == '$WORKFLOW' && assertion.ref == 'refs/heads/$INTEGRATION_BRANCH'"
MAPPING='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id'
if gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --workload-identity-pool="$POOL" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc "$PROVIDER" \
    --workload-identity-pool="$POOL" \
    --location=global \
    --project "$PROJECT_ID" \
    --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping="$MAPPING" \
    --attribute-condition="$CONDITION"
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
    --workload-identity-pool="$POOL" \
    --location=global \
    --display-name="$PROVIDER_DISPLAY" \
    --project "$PROJECT_ID" \
    --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping="$MAPPING" \
    --attribute-condition="$CONDITION"
fi

PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository_id/$REPOSITORY_ID"
for role in roles/iam.workloadIdentityUser roles/iam.serviceAccountTokenCreator; do
  gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER_ACCOUNT" \
    --project "$PROJECT_ID" \
    --member="$PRINCIPAL" \
    --role="$role" \
    --quiet >/dev/null
done

PROVIDER_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"

echo
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  gh variable set "$VARIABLE" --repo "$REPOSITORY" --body "$PROVIDER_NAME"
  echo "GitHub Actions Variable gesetzt: $VARIABLE"
else
  echo 'Google Cloud ist fertig eingerichtet.'
  echo 'GitHub CLI ist nicht angemeldet. Einmal ausführen:'
  echo '  gh auth login'
  echo "  gh variable set $VARIABLE --repo $REPOSITORY --body '$PROVIDER_NAME'"
fi

echo
echo 'Einrichtung abgeschlossen.'
echo "Nur staging-ai-gateway.yml auf $INTEGRATION_BRANCH darf diese WIF-Identität verwenden."
echo 'Der Deployer kann nur Staging Cloud Run aktualisieren, das bestehende Runtime-Servicekonto verwenden,'
echo 'in das dedizierte Artifact-Registry-Repository schreiben und den privaten Gateway aufrufen.'
echo 'Kein Google-Schlüssel, kein OPENAI_API_KEY-Zugriff für den Deployer und keine Production-Rolle wurden eingerichtet.'
