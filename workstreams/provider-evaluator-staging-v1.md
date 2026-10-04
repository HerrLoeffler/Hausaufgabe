# Provider evaluator staging v1

Status: implementation branch. Staging only.

## Purpose

Run the four-provider **competency/collaboration** evaluation as a bounded manual research job. It does not choose a global winner and cannot publish runtime routing.

## Identity

A dedicated service account `gradecrew-ai-evaluator-staging` is used through GitHub OIDC/WIF. The WIF provider is bound to exactly:

- repository ID `1076884609`
- workflow `.github/workflows/provider-evaluation.yml`
- branch `integration/ai-gateway-staging`

No static Google key is created.

## Permissions

The evaluator gets only the staging capabilities needed for this pilot:

- read Cloud Run service metadata,
- invoke `gradecrew-ai-gateway-staging`,
- use Firestore for durable `aiRouting` evaluation reservations/settlements.

It gets no Secret Manager access, no deployment role, no Artifact Registry writer and no Production role.

Firestore IAM is database-wide at the project level, so this remains **staging-only**. Production requires a separately reviewed data-boundary design before reuse.

## Hard pilot caps

The manual workflow fixes the first pilot at:

- maximum 8 paid calls,
- maximum $0.50 conservative reservation per workflow run,
- $1/day evaluation reservation cap,
- $5/month evaluation reservation cap,
- 40 evaluation calls/day.

Provider-level account caps remain an additional outer guard.

## Workflow behavior

Only one of the three allowlisted synthetic Phase-A bundles can run. The workflow refuses any other file, wrong branch, stale SHA, wrong project, or missing exact confirmation phrase.

The worker performs a dry run first, then reserves every individual call durably before the gateway request. There are no automatic provider retries.

The content-free metrics artifact is retained for 30 days. The private review packet contains only synthetic prompts plus model outputs and is retained for 7 days; it is never committed.

## Activation still required

Run `tools/automation/setup-staging-provider-evaluator.sh` once from authenticated Cloud Shell after this branch is merged. If service-account IAM policy mutation is blocked, temporarily grant the user `roles/iam.serviceAccountAdmin` exactly as with the gateway bootstrap, rerun the script, then remove the temporary role.

After the GitHub variable `STAGING_EVALUATOR_WIF_PROVIDER` exists, the first micro-pilot can be manually dispatched.
