# GC-STAGING-CANONICAL-01 · canonical staging Hosting URL

- Parent task: GC-STAGING-CLOSEOUT-20261006.
- Owner: canonical staging deploy-control workstream; chat link unknown.
- Branch: `fix/gc-staging-canonical-20261006`, based on main `46f9290bca25e31a6d79c1963f1015932244301e`.
- Target: main. Scope: `.github/workflows/staging-preview.yml`, `tools/automation/canonical_staging.py`, targeted tests and this handoff.
- No product files, central state, TODO, IAM setup, secrets or production project are changed.

## Purpose and control

The automatic workflow currently verifies and publishes only the long `gradecrew-app-integration` preview URL. A separate manual dispatch in that same workflow (required by the existing WIF `workflow_ref` restriction) accepts one preview run ID and exact 40-character commit. It requires the latest automatic preview run to be successful, verifies its digest-checked source and receipt artifacts, revalidates the original CI and current integration branch, and rejects the known failed user-acceptance SHA `f97841b82291d879cd9f4a9bccce0ee2c2cf3641`.

The job downloads that run's immutable build artifact, validates its release manifest and every file hash against the served preview, reads the current preview and live Hosting version IDs, then clones the pinned preview version to `hausaufgabe-staging:live`. It checks the live version and every served file at `https://hausaufgabe-staging.web.app/`. A 90-day receipt records the source run, CI run, commit, promoted version, previous live version and verified file count. If a post-clone step fails, the previous live version remains in a recovery artifact. A deliberate rollback can clone that saved version to the same staging live channel after rechecking current state; no rollback runs automatically.

Only the existing `gradecrew-preview` WIF identity and Hosting IAM permissions are used. The workload provider already limits authentication to `.github/workflows/staging-preview.yml@refs/heads/main`. The code cannot target `hausaufgabe-40294`, Functions or Rules.

## Evidence and gates

- main `46f9290`: current `START_HERE.md`, `AGENTS.md`, release state, TODO, workstreams rules, automation setup and workflow read. Development Status run `37477387627` completed successfully.
- Technical evidence for `f97841b`: Combined CI `37467220757`, Hosting preview `37467324361`, AI and Assessment Functions `37467324128`. The user reported failed startup, login and tutorial acceptance. It is therefore hard-blocked from canonical promotion.
- Local deploy-control tests: `python3 -m unittest tools.automation.test_canonical_staging -v` (5 tests passed). Workflow YAML parsed successfully. No workflow dispatch, cloud login, clone, deployment or live URL inspection performed in this task.
- The reviewed preview and canonical live Hosting share the staging Firebase project and the cloned Hosting version, but this does not prove Rules compatibility, Functions deployment, browser behavior or device acceptance. The live URL's current content is unknown here because browser inspection is unavailable.

Before a real promotion: repair the product on the integration branch; require fresh combined CI, a successful newest preview run and matching AI/Assessment Functions receipts for the same SHA; inspect the preview in an approved browser/test path and record the user's decision to expose that candidate at the short STAGING URL. Resolve any Rules/security cutover gates applicable to that candidate separately. Dispatch the workflow manually on main with the exact preview run ID and SHA, then review the canonical receipt and perform browser/device acceptance on the short URL. Only then update central release state. Production remains a separate approval.

## Recovery

- Last secured step: deploy-control PR candidate, no deployment. Branch/commit/PR are recorded in the PR.
- Uncommitted work: none once this branch is pushed. No provider calls, paid model calls, reservations or retries.
- If dispatch outcome is uncertain, inspect the Actions run, canonical receipt or recovery artifact and current Hosting live version before any repeat. Do not retry blindly.
- Next step: review and merge this deploy-control PR; after repaired product evidence and authorization, perform one exact manual staging promotion.
