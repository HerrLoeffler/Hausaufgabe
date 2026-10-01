#!/usr/bin/env bash
# One-time setup for automatic GradeCrew AI Functions deployment to STAGING only.
# Creates a dedicated Workload Identity pool/provider and deployer service account.
# No service-account key is created and Production is never targeted.
set -euo pipefail

PROJECT_ID="hausaufgabe-staging"
REPOSITORY="HerrLoeffler/Hausaufgabe"
REPOSITORY_ID="1076884609"
POOL="gradecrew-functions-github"
PROVIDER="staging-functions"
ACCOUNT="gradecrew-functions"
SERVICE_ACCOUNT="$ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"
WORKFLOW="$REPOSITORY/.github/workflows/staging-functions.yml@refs/heads/main"
VARIABLE="STAGING_FUNCTIONS_WIF_PROVIDER"
POOL_DISPLAY='GradeCrew Staging Functions'
PROVIDER_DISPLAY='GradeCrew Staging OIDC'
MAX_WIF_DISPLAY_LENGTH=32

# Google IAM limits Workload Identity pool/provider display names to 32 characters.
# Validate this before the script can mutate APIs or IAM so setup never fails halfway
# because of an invalid cosmetic display name.
[[ ${#POOL_DISPLAY} -le $MAX_WIF_DISPLAY_LENGTH ]] || {
  echo "FEHLER: Workload-Identity-Pool-Anzeigename ist länger als $MAX_WIF_DISPLAY_LENGTH Zeichen."
  exit 1
}
[[ ${#PROVIDER_DISPLAY} -le $MAX_WIF_DISPLAY_LENGTH ]] || {
  echo "FEHLER: Workload-Identity-Provider-Anzeigename ist länger als $MAX_WIF_DISPLAY_LENGTH Zeichen."
  exit 1
}

command -v gcloud >/dev/null || { echo 'FEHLER: Dieses Skript in der authentifizierten Google Cloud Shell ausführen.'; exit 1; }

gcloud projects describe "$PROJECT_ID" --format='value(projectId)' | grep -qx "$PROJECT_ID" || {
  echo "FEHLER: Staging-Projekt $PROJECT_ID ist nicht erreichbar."
  exit 1
}
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
[[ "$PROJECT_NUMBER" =~ ^[0-9]+$ ]] || { echo 'FEHLER: Projekt-Nummer konnte nicht bestimmt werden.'; exit 1; }

if [[ "$PROJECT_ID" == "hausaufgabe-40294" ]]; then
  echo 'FEHLER: Production darf von diesem Skript niemals verwendet werden.'
  exit 1
fi

echo 'GradeCrew STAGING Functions Automation'
echo "Projekt:       $PROJECT_ID"
echo "Repository:    $REPOSITORY"
echo "Workflow:      staging-functions.yml auf main"
echo "Servicekonto:  $SERVICE_ACCOUNT"
echo 'Production:    ausgeschlossen'
echo

echo 'Aktiviere nur die für Staging-Functions benötigten Google APIs ...'
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  serviceusage.googleapis.com \
  firebase.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  --project "$PROJECT_ID"

if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$ACCOUNT" \
    --display-name='GradeCrew staging AI Functions deployer' \
    --project "$PROJECT_ID"
fi

# Firebase documents Cloud Functions Admin + Service Account User for Functions deploys.
# Additional staging-only roles cover the scheduled/task functions already present in
# the AI codebase and allow read-only Firebase/Secret metadata checks without secret payload access.
for role in \
  roles/cloudfunctions.admin \
  roles/cloudscheduler.admin \
  roles/cloudtasks.admin \
  roles/firebase.viewer \
  roles/serviceusage.serviceUsageConsumer \
  roles/secretmanager.viewer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$role" \
    --condition=None \
    --quiet >/dev/null
done

# Do NOT grant project-wide Service Account User. Limit actAs to the default
# runtime/build identities that Firebase/Cloud Functions may actually use.
RUNTIME_ACCOUNTS=(
  "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
  "$PROJECT_ID@appspot.gserviceaccount.com"
  "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
)
for target in "${RUNTIME_ACCOUNTS[@]}"; do
  if gcloud iam service-accounts describe "$target" --project "$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts add-iam-policy-binding "$target" \
      --project "$PROJECT_ID" \
      --member="serviceAccount:$SERVICE_ACCOUNT" \
      --role=roles/iam.serviceAccountUser \
      --quiet >/dev/null
    echo "actAs begrenzt freigegeben: $target"
  else
    echo "Nicht vorhanden, übersprungen: $target"
  fi
done

if ! gcloud iam workload-identity-pools describe "$POOL" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL" \
    --location=global \
    --display-name="$POOL_DISPLAY" \
    --project "$PROJECT_ID"
fi

CONDITION="assertion.repository_id == '$REPOSITORY_ID' && assertion.workflow_ref == '$WORKFLOW' && assertion.ref == 'refs/heads/main'"
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

# Separate pool: the existing Hosting identity cannot use this Functions service account.
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project "$PROJECT_ID" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository_id/$REPOSITORY_ID" \
  --quiet >/dev/null

PROVIDER_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"

echo
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  gh variable set "$VARIABLE" --repo "$REPOSITORY" --body "$PROVIDER_NAME"
  echo "GitHub Actions Variable gesetzt: $VARIABLE"
else
  echo 'Google Cloud ist fertig eingerichtet.'
  echo 'GitHub CLI ist jedoch nicht angemeldet; damit die Automatik aktiviert wird, einmal in derselben Cloud Shell:'
  echo '  gh auth login'
  echo "  gh variable set $VARIABLE --repo $REPOSITORY --body '$PROVIDER_NAME'"
fi

echo
echo 'Einrichtung abgeschlossen.'
echo 'Der Functions-Workflow darf ausschließlich aus staging-functions.yml auf main über diese Identität authentifizieren.'
echo 'Der Workflow deployt ausschließlich functions:ai nach hausaufgabe-staging.'
echo 'Keine Production-Rolle, kein Schlüssel, kein Firestore-Rules- oder Hosting-Deploy wurde eingerichtet.'
