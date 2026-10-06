# GC-STAGING-CANONICAL-01 · canonical staging Hosting URL

- Parent: GC-STAGING-CLOSEOUT-20261006. Owner: canonical staging deploy-control workstream; chat link unknown.
- Initial controller: PR #150, merged as 6551091a2c2a6e9a46715fa243bc2af127100879.
- Repair branch: fix/gc-staging-canonical-direct-20261006, based on main 9c24523c701fc580a73b95b354ad0337d5bcbf22; target main.
- Scope: staging-preview.yml, preview.py, canonical_staging.py, targeted tests and this handoff. No product files, central state, TODO, IAM, secrets, Functions, Rules or Production project change.

## First real preview attempt and diagnosis

The corrected product 77d9ee45fa0e3b8801e59fe7f2f5814557ec8849 passed exact combined CI 37482166166. Automatic Hosting preview run 37482339993, deploy job 112333991484, authenticated with the existing gradecrew-preview identity and completed hosting:channel:deploy successfully at 14:52:13 UTC. The immediately following preview.py verify failed at deployed_version() line 71 with “No unambiguous deployed Hosting version”, before published-byte checks. No verified-preview receipt was produced. Hosting bytes may be on the preview channel, but their hashes have not been verified for this run. No canonical request or live staging deployment occurred. Separate AI/Assessment Functions run 37482340263 succeeded with receipts 11422191369 and 11421747016; this repair neither reruns nor modifies it.

The original deploy-result.json was held only in the failed job's temporary directory and was neither logged nor uploaded. Its exact version field is unknown. The pinned firebase-tools v14.17.0 source for hosting:channel:deploy sets the result's short version only when the internal deployed version name starts with sites/<site>/versions/; otherwise it leaves the field empty. An official firebase-tools issue shows a Hosting API versions.create response with projects/<number>/sites/<site>/versions/<id>. This makes the empty-field explanation plausible, but does not prove the shape in run 37482339993. Sources: https://github.com/firebase/firebase-tools/blob/v14.17.0/src/commands/hosting-channel-deploy.ts and https://github.com/firebase/firebase-tools/issues/7387.

## Narrow repair and controls

The preview verifier again relies on the release manifest and every served-file SHA-256 hash. It no longer requires the CLI's derived version field. A regression test uses a successful one-site CLI result with an empty version and requires all published hashes before a receipt is written. The receipt still binds exact source commit, source CI run, preview run, staging project, channel, URL and verified file count.

Canonical staging is published directly from the same immutable staging-preview-build artifact downloaded by exact successful preview-run ID. Before cloud login, preview.py prepare validates its release manifest, hashes and staging Firebase client config and generates the same single-site Hosting-only firebase.json used for preview. canonical_staging.prepare rechecks the successful latest preview, original CI authority, current integration SHA, preview receipt and served preview bytes; captures and rechecks the previous live version. The pinned CLI then executes firebase deploy --only hosting --project hausaufgabe-staging --config promotion/firebase.json. No mutable preview-channel version is cloned. After deployment, canonical verification checks the current live version stays stable while checking the exact release manifest and every served file at https://hausaufgabe-staging.web.app/; it writes the canonical receipt. If post-deploy verification fails, the previous live version remains in a recovery artifact. No automatic rollback runs.

The existing append-only automation/canonical-staging-requests/<id>.json trigger, exact SHA/run selection, rejected f97841b82291d879cd9f4a9bccce0ee2c2cf3641 guard, current-main/workflow authority, WIF restrictions and Hosting-only service account remain. The source run must be successful, so failed run 37482339993 cannot be promoted. A new, deliberate preview run with this changed verifier is required; this PR starts none. The version-prefix normalization in the read-only live-channel check accepts either sites/<site>/versions/<id> or observed project-qualified API names while requiring the exact staging site.
The access-token OAuth scope matches the already working preview deployment (cloud-platform); the service account's Hosting-only IAM permissions are unchanged. The Hosting channel API response is restricted to project hausaufgabe-staging (or its known numeric ID 950775032930), and the canonical build config contains only that site's Hosting target.

## Evidence, limits and next step

- Current main entry/rules, release state, TODO and this handoff were reread. The failed job's deploy and verify step results and traceback were checked from GitHub logs. This is the first real Hosting-preview verification failure after PR #150, not an unknown or repeated deployment attempt. Attempt history and budget are unchanged.
- Local targeted regression tests: python3 -m unittest tools.automation.test_canonical_staging -v — 11 passed. Workflow YAML parses. No request file, dispatch, cloud login, Hosting deploy, live URL inspection or retry was performed by this repair workstream.
- Preview and canonical Hosting remain separate releases in the same staging Firebase project. Matching bytes do not prove Functions/Rules compatibility, browser behavior or device acceptance. Any documented Rules/security cutover gate still applies separately. The short URL has not been inspected or user-tested here.

Next: independently review and merge this repair, then initiate one explicitly qualified new preview attempt for exact 77d9ee45fa0e3b8801e59fe7f2f5814557ec8849 and inspect its manifest/hash receipt. Reconcile the already successful separate Functions receipts and relevant Rules/security gates. Only after a successful newest preview run, create one exact canonical request on main and inspect its live receipt, then perform browser/device acceptance at the short URL. Martin has authorized the short STAGING URL for testing; Production remains separately gated.

## Recovery

- Last secured step: PR #150 merged; first corrected-product preview deploy succeeded but verification failed before receipt. This branch contains a proposed repair; no deployment was started here.
- Uncommitted work: none after this repair branch is pushed. No paid model call or new provider reservation.
- If a future deploy result is unclear, inspect exact Actions run, receipts/recovery artifact and current Hosting state before any repeat. Never treat failed 37482339993 as a verified source.
