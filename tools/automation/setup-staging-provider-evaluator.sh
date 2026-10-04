#!/usr/bin/env bash
# One-time setup for the GradeCrew provider evaluation worker on STAGING only.
# Creates a dedicated GitHub OIDC/WIF evaluator identity. No service-account key
# and no provider/API secret access are granted.
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
REPOSITORY="HerrLoeffler/Hausaufgabe"
REPOSITORY_ID="1076884609"
REGION="europe-west1"
SERVICE="gradecrew-ai-gateway-staging"
EVALUATOR_ACCOUNT_NAME="gradecrew-ai-evaluator-staging"
EVALUATOR_ACCOUNT="$EVALUATOR_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
POOL="gradecrew-gateway-github"
PROVIDER="staging-evaluator"
INTEGRATION_BRANCH="integration/ai-gateway-staging"
WORKFLOW="$REPOSITORY/.github/workflows/provider-evaluation.yml@refs/heads/$INTEGRATION_BRANCH"
VARIABLE="STAGING_EVALUATOR_WIF_PROVIDER"
POOL_DISPLAY='GradeCrew Gateway Staging'
PROVIDER_DISPLAY='Evaluator GitHub OIDC'

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

gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" >/dev/null

echo 'GradeCrew STAGING Provider Evaluator'
echo "Projekt:       $PROJECT_ID"
echo "Gateway:       $SERVICE"
echo "Integration:   $INTEGRATION_BRANCH"
echo "Evaluator:     $EVALUATOR_ACCOUNT"
echo 'Production:    ausgeschlossen'
echo

gcloud services enable   iam.googleapis.com   iamcredentials.googleapis.com   sts.googleapis.com   firestore.googleapis.com   run.googleapis.com   --project "$PROJECT_ID"

if ! gcloud iam service-accounts describe "$EVALUATOR_ACCOUNT" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$EVALUATOR_ACCOUNT_NAME"     --display-name='GradeCrew staging AI evaluator'     --project "$PROJECT_ID"
fi

# Staging-only evaluator permissions:
# - datastore.user: durable aiRouting/evaluation budget reservations
# - run.viewer: resolve the private gateway URL and verify target metadata
# No Secret Manager, deployment, Artifact Registry or Production permission.
for role in   roles/datastore.user   roles/run.viewer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID"     --member="serviceAccount:$EVALUATOR_ACCOUNT"     --role="$role"     --condition=None     --quiet >/dev/null
done

# Invoke exactly the private staging gateway.
gcloud run services add-iam-policy-binding "$SERVICE"   --project "$PROJECT_ID"   --region "$REGION"   --member="serviceAccount:$EVALUATOR_ACCOUNT"   --role=roles/run.invoker   --quiet >/dev/null

# Reuse the existing staging GitHub WIF pool but create a provider whose condition
# is bound to one workflow file and the integration branch.
gcloud iam workload-identity-pools describe "$POOL"   --location=global --project "$PROJECT_ID" >/dev/null

CONDITION="assertion.repository_id == '$REPOSITORY_ID' && assertion.workflow_ref == '$WORKFLOW' && assertion.ref == 'refs/heads/$INTEGRATION_BRANCH'"
MAPPING='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id'
if gcloud iam workload-identity-pools providers describe "$PROVIDER"   --workload-identity-pool="$POOL" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc "$PROVIDER"     --workload-identity-pool="$POOL"     --location=global     --project "$PROJECT_ID"     --issuer-uri=https://token.actions.githubusercontent.com     --attribute-mapping="$MAPPING"     --attribute-condition="$CONDITION"
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER"     --workload-identity-pool="$POOL"     --location=global     --display-name="$PROVIDER_DISPLAY"     --project "$PROJECT_ID"     --issuer-uri=https://token.actions.githubusercontent.com     --attribute-mapping="$MAPPING"     --attribute-condition="$CONDITION"
fi

PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository_id/$REPOSITORY_ID"
for role in roles/iam.workloadIdentityUser roles/iam.serviceAccountTokenCreator; do
  gcloud iam service-accounts add-iam-policy-binding "$EVALUATOR_ACCOUNT"     --project "$PROJECT_ID"     --member="$PRINCIPAL"     --role="$role"     --quiet >/dev/null
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
echo 'Evaluator-Einrichtung abgeschlossen.'
echo "Nur provider-evaluation.yml auf $INTEGRATION_BRANCH darf diese WIF-Identität verwenden."
echo 'Der Evaluator darf das Staging-Gateway lesen/aufrufen und Firestore-Evaluationsbudgets reservieren.'
echo 'Keine Provider-Secrets, keine Deploy-Rechte, kein Artifact-Registry-Schreiben und keine Production-Rolle wurden eingerichtet.'
