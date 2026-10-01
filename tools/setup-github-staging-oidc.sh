#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
PRODUCTION_ID="hausaufgabe-40294"
REPO="HerrLoeffler/Hausaufgabe"
BRANCH="feature/secure-assessment-v1"
POOL_ID="github-actions"
PROVIDER_ID="gradecrew-secure-preview"
SERVICE_ACCOUNT_ID="gradecrew-github-staging"

if [[ "$PROJECT_ID" == "$PRODUCTION_ID" ]]; then
  echo "FEHLER: Staging und Production sind identisch. Abbruch."
  exit 1
fi

command -v gcloud >/dev/null || { echo "FEHLER: gcloud fehlt."; exit 1; }
command -v gh >/dev/null || { echo "FEHLER: GitHub CLI (gh) fehlt."; exit 1; }

gh auth status >/dev/null
if [[ "$(gh repo view "$REPO" --json nameWithOwner --jq .nameWithOwner)" != "$REPO" ]]; then
  echo "FEHLER: GitHub-Repo $REPO ist mit diesem Login nicht erreichbar."
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
if [[ -z "$ACTIVE_ACCOUNT" ]]; then
  echo "FEHLER: Kein aktives gcloud-Konto."
  exit 1
fi

echo "Google-Konto: $ACTIVE_ACCOUNT"
echo "GitHub-Repo:   $REPO"
echo "Zielprojekt:   $PROJECT_ID"
echo "Branch:        $BRANCH"
echo "Production:    $PRODUCTION_ID (wird nicht konfiguriert)"

gcloud config set project "$PROJECT_ID" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
if [[ -z "$PROJECT_NUMBER" ]]; then
  echo "FEHLER: Projektnummer für $PROJECT_ID konnte nicht gelesen werden."
  exit 1
fi

# Only APIs required for short-lived GitHub OIDC -> Google credentials.
gcloud services enable \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project "$PROJECT_ID" >/dev/null

SA_EMAIL="${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_ID" \
    --project "$PROJECT_ID" \
    --display-name="GradeCrew GitHub staging preview"
fi

if ! gcloud iam workload-identity-pools describe "$POOL_ID" \
  --project "$PROJECT_ID" --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --project "$PROJECT_ID" \
    --location=global \
    --display-name="GitHub Actions"
fi

if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --project "$PROJECT_ID" --location=global --workload-identity-pool="$POOL_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --project "$PROJECT_ID" \
    --location=global \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GradeCrew secure staging preview" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref,attribute.actor=assertion.actor" \
    --attribute-condition="assertion.repository=='${REPO}' && assertion.ref=='refs/heads/${BRANCH}'"
fi

PROVIDER_NAME="$(gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --project "$PROJECT_ID" --location=global --workload-identity-pool="$POOL_ID" \
  --format='value(name)')"

PRINCIPAL_SET="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project "$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="$PRINCIPAL_SET" >/dev/null

# Firebase's documented deployment roles: Hosting Admin for previews and
# Cloud Functions Admin + Service Account User for Functions deployment.
for ROLE in \
  roles/firebasehosting.admin \
  roles/cloudfunctions.admin \
  roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --condition=None >/dev/null
done

# Allow the deploy identity to attach the standard runtime account(s), but do
# not grant project-wide Service Account User.
for RUNTIME_SA in \
  "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  "${PROJECT_ID}@appspot.gserviceaccount.com"; do
  if gcloud iam service-accounts describe "$RUNTIME_SA" --project "$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
      --project "$PROJECT_ID" \
      --member="serviceAccount:${SA_EMAIL}" \
      --role="roles/iam.serviceAccountUser" >/dev/null
  fi
done

# Repository variables are configuration, not secrets. No long-lived Google
# service-account key is created or uploaded to GitHub.
gh variable set GCP_WIF_PROVIDER --repo "$REPO" --body "$PROVIDER_NAME"
gh variable set GCP_STAGING_SERVICE_ACCOUNT --repo "$REPO" --body "$SA_EMAIL"
gh variable set FIREBASE_STAGING_PROJECT --repo "$REPO" --body "$PROJECT_ID"

echo
echo "GitHub -> Google Cloud OIDC für GradeCrew Staging ist eingerichtet."
echo "Provider:       $PROVIDER_NAME"
echo "Servicekonto:  $SA_EMAIL"
echo "Projekt:        $PROJECT_ID"
echo "Branchbindung:  $BRANCH"
echo "Es wurde KEIN Service-Account-Schlüssel erzeugt und Production wurde nicht konfiguriert."
