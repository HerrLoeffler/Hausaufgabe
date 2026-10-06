# GC-STAGING-CANONICAL-01 · canonical staging Hosting URL

- Parent task: GC-STAGING-CLOSEOUT-20261006.
- Owner: canonical staging deploy-control workstream; chat link unknown.
- Branch: `fix/gc-staging-canonical-20261006`, based on main `46f9290bca25e31a6d79c1963f1015932244301e`.
- Target: main. Scope: `.github/workflows/staging-preview.yml`, `tools/automation/preview.py`, `tools/automation/canonical_staging.py`, targeted tests and this handoff.
- No product files, central state, TODO, IAM setup, secrets or production project are changed.

## Purpose and control

The automatic workflow currently verifies and publishes only the long `gradecrew-app-integration` preview URL. After this PR is merged, a new append-only file `automation/canonical-staging-requests/<id>.json` on main is the repo-native trigger. Its exact schema is `{"id":"<id>","previewRunId":123,"commit":"<40 lowercase hex>"}`. The existing workflow routes that push separately from its existing preview deployment requests. A manual workflow dispatch remains available in the GitHub UI, but it is not required by the connected tooling. Keeping the canonical job in the same workflow preserves the existing WIF `workflow_ref` restriction without adding permissions.

The request binds one preview run ID and exact commit. The job requires the latest actual automatic preview attempt to be successful; request-triggered canonical workflow runs are identified from their single append-only request commit and excluded from that comparison. A newer failed or pending real preview remains a blocker. The job verifies digest-checked source and receipt artifacts, revalidates the original CI and current integration branch, and rejects the known failed user-acceptance SHA `f97841b82291d879cd9f4a9bccce0ee2c2cf3641`. New preview receipts also record the version ID returned by Firebase's deploy result; older receipts without a version are ineligible.

The job downloads that run's immutable build artifact, validates its release manifest and every file hash against the served preview, checks the preview channel's current version against the exact version in the receipt, and records the current live version. Immediately before cloning, it rechecks both preview and live versions; a concurrent live change blocks promotion. It clones only the receipt-bound preview version to `hausaufgabe-staging:live`, then checks the live version and every served file at `https://hausaufgabe-staging.web.app/`. A 90-day receipt records the source run, CI run, commit, promoted version, previous live version and verified file count. If a post-clone step fails, the previous live version remains in a recovery artifact. A deliberate rollback can clone that saved version to the same staging live channel after rechecking current state; no rollback runs automatically.

Only the existing `gradecrew-preview` WIF identity and Hosting IAM permissions are used. The workload provider already limits authentication to `.github/workflows/staging-preview.yml@refs/heads/main`. The code cannot target `hausaufgabe-40294`, Functions or Rules.

## Evidence and gates

- main `46f9290`: current `START_HERE.md`, `AGENTS.md`, release state, TODO, workstreams rules, automation setup and workflow read. Development Status run `37477387627` completed successfully.
- Technical evidence for `f97841b`: Combined CI `37467220757`, Hosting preview `37467324361`, AI and Assessment Functions `37467324128`. The user reported failed startup, login and tutorial acceptance. It is therefore hard-blocked from canonical promotion.
- Local deploy-control tests: `python3 -m unittest tools.automation.test_canonical_staging -v` (10 tests passed). Workflow YAML parsed successfully. No request file was added to main; no workflow dispatch, cloud login, clone, deployment or live URL inspection performed in this task.
- Review history: first candidate `dd94cfa`; documentation-only head `2acf3ca`; request/receipt/version-race head `112d038`. Independent review found that a canonical push would itself become the newest run and block promotion. The current fix excludes only proven canonical request pushes; the added regression test keeps newer actual previews blocking. No failed execution attempt or provider cost resulted from these review rounds.
- The reviewed preview and canonical live Hosting share the staging Firebase project and the cloned Hosting version, but this does not prove Rules compatibility, Functions deployment, browser behavior or device acceptance. The live URL's current content is unknown here because browser inspection is unavailable.

Before a real promotion: repair the product on the integration branch; require fresh combined CI and a successful newest preview run with a version-bound receipt for the same SHA, and reconcile relevant AI/Assessment Functions receipts. Check whether that candidate invokes a documented Rules/security cutover gate; if so, satisfy it separately. Martin has already authorized the short STAGING URL as a test destination. Commit one new exact request file to main using the connected GitHub file tool; its push starts this workflow without manual text transfer or a new permission. Then review the canonical receipt and perform browser/device acceptance on the short URL. A missing browser tool does not block this authorized staging test; it leaves user acceptance open. Only then update central release state. Production remains a separate approval.

## Recovery

- Last secured step: deploy-control PR candidate, no deployment. Branch/commit/PR are recorded in the PR.
- Uncommitted work: none once this branch is pushed. No provider calls, paid model calls, reservations or retries.
- If dispatch outcome is uncertain, inspect the Actions run, canonical receipt or recovery artifact and current Hosting live version before any repeat. Do not retry blindly.
- Next step: review and merge this deploy-control PR; after repaired product evidence, commit one exact canonical request file to main and verify its run.
