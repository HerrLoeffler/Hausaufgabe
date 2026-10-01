#!/usr/bin/env bash
# Run once in the user's authenticated Cloud Shell. No service-account key created.
set -euo pipefail
PROJECT_ID=hausaufgabe-staging
REPOSITORY=HerrLoeffler/Hausaufgabe
REPOSITORY_ID=1076884609
POOL=gradecrew-github
PROVIDER=staging-preview
ACCOUNT=gradecrew-preview
SERVICE_ACCOUNT="$ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"
WORKFLOW="$REPOSITORY/.github/workflows/staging-preview.yml@refs/heads/main"
command -v gcloud >/dev/null || { echo 'Run this in Google Cloud Shell.'; exit 1; }
gcloud projects describe "$PROJECT_ID" --format='value(projectId)' | grep -qx "$PROJECT_ID"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
[[ "$PROJECT_NUMBER" =~ ^[0-9]+$ ]]
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com --project "$PROJECT_ID"
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$ACCOUNT" --display-name='GradeCrew staging hosting preview' --project "$PROJECT_ID"
fi
for role in roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$SERVICE_ACCOUNT" --role="$role" --condition=None --quiet >/dev/null
done
if ! gcloud iam workload-identity-pools describe "$POOL" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL" --location=global --display-name='GradeCrew GitHub' --project "$PROJECT_ID"
fi
CONDITION="assertion.repository_id == '$REPOSITORY_ID' && assertion.workflow_ref == '$WORKFLOW' && assertion.ref == 'refs/heads/main'"
MAPPING='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id'
if gcloud iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global --project "$PROJECT_ID" --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION"
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global --project "$PROJECT_ID" --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION"
fi
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" --project "$PROJECT_ID" --role=roles/iam.workloadIdentityUser --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository_id/$REPOSITORY_ID" --quiet >/dev/null
PROVIDER_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  gh variable set STAGING_WIF_PROVIDER --repo "$REPOSITORY" --body "$PROVIDER_NAME"
  echo 'GitHub variable saved. Next successful app-integration push CI will deploy its preview.'
else
  echo 'Google Cloud ready. Create this GitHub Actions repository variable:'
  echo "STAGING_WIF_PROVIDER=$PROVIDER_NAME"
  echo "https://github.com/$REPOSITORY/settings/variables/actions"
fi
echo 'Only staging Hosting roles granted. This script did not deploy hosting, rules or functions.'
