# GC-AUTOMATION-08 Task Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the working Web chain and add one separately gated static Escape-Expedition preview profile without resetting existing history or budgets.

**Architecture:** Keep the common Guardian state machine and ledger. Resolve a closed trusted profile on main; use it consistently for admission, candidate tests, integration and component-specific deployment evidence. Isolate unprivileged validation from a trusted Hosting-only publication job.

**Tech Stack:** Python 3/unittest, Node 22/node:test, GitHub Actions, existing Firebase Hosting tooling. No new provider SDK or product dependency.

**Spec:** [Approved design](../specs/2026-10-04-guardian-admission-profiles-design.md), explicitly approved by Martin on 2026-10-04. This plan awaits review and execution-method selection.

## Global Constraints

- Task-ID remains GC-AUTOMATION-08; no new queue admission or paid pilot in the implementation steps.
- Existing Web task bytes/hashes and report shapes stay compatible; new control hashes never silently rebind old runs.
- At most eight explicitly named existing UTF-8 product files; Games first profile allows only lab/escape-expedition/index.html, styles.css and app.js.
- Cost contract module-web-v1 stays unchanged: 2.40 USD per attempt, 2.55 USD total; three total build/repair attempts never override remaining budget.
- Three existing independent correctness/security/qa reviewers remain mandatory and candidate-bound.
- Project hausaufgabe-staging; channel gradecrew-escape-visual; expiration at most 30 days.
- No candidate control/test/lockfile/Functions/Rules/native/secret changes; no production or fabricated human acceptance.
- New profile is disabled by default; real activation needs reviewed code, gates, verified identity and one bound task.
- No force push, hidden rebase, workflow cancellation, unknown-result retry or reservation reset.

## Review Focus

1. A document-only successor must not create a fresh paid attempt or invalidate unrelated unchanged product evidence; exercise in Task 2.
2. A retained older attempt under a different control hash must remain diagnostically readable but cannot authorize new writes; exercise in Task 2.
3. A valid-looking package with a path alias/symlink, injected config or missing file must fail before cloud authentication; exercise in Task 3.
4. Two controllers/manual previews competing for one Hosting channel must not overwrite a newer release; exercise in Task 5.
5. A “successful” workflow with skipped publication or a mismatched run attempt must not become staging_deployed; exercise in Task 5.

## File responsibilities

Create tools/automation/profiles.py (closed profile contract), games_static.py (packaging/evidence), validate-games-static.sh (fixed entry), tests test_profiles.py/test_games_static.py/test_profile_deployment.py/test_profile_rehearsal.py, and dedicated guardian-games-validation.yml / guardian-games-staging.yml.
Modify existing pipeline.py, guardian.py, admit.py, execution.py, continuation.py, validation_report.py, deployment_evidence.py and relevant Guardian workflow dispatch adapters only where they currently hardcode WEB/validation/deploy components. Do not rewrite unrelated provider/model_calls or recovery policies.
Trusted Games fixture snapshot: 6434ddefb83cffca7bde5a7347ed6d2f56d5cb45. Review and import tools/games/escape-expedition.test.cjs, tools/build-lab-escape-expedition.mjs, docs/games/ESCAPE_GAMES_CONCEPT.md, docs/games/ESCAPE_AMAZONAS_VISUAL_BIBLE.md and read-only lab/escape-room-adventure/index.html into tools/automation/fixtures/games-static-v1/. The existing tests read these files relative to cwd, so the validator assembles a scratch source tree with the three candidate files and these fixed read-only fixtures. Do not read the control fixtures from the candidate branch.
Every imported fixture and new validator/workflow enters the profile/control digest. Existing 35 tests remain intact; additional package/browser-boundary checks belong to trusted automation code.

### Task 1: Trusted profile resolution with legacy Web adapter

**Files:** Create profiles.py, test_profiles.py. Modify pipeline.py (task_contract/path_allowed/candidate_contract/control_hash); guardian.py validate_policy; admit.py admission.
**Interfaces:** Frozen Profile(id: str, version: int, risk: str, allowed_targets: tuple[str,...], writable_paths: tuple[str,...], validation_profile: str, deployment_components: tuple[str,...]). resolve_profile(task: dict) -> Profile; profile_digest(profile: Profile, root: Path) -> str; admitted_profile(task: dict, policy: dict) -> Profile. Missing execution_profile on old Web tasks resolves legacy Web without modifying task. New Games task explicitly supplies execution_profile=games-static-preview-v1, profile_digest and validation_profile=games-static-v1. Policy enabledExecutionProfiles defaults to legacy Web only; explicit Games entry is required even when global Guardian is enabled.
- [ ] Write tests: old task hash/bytes/report contract unchanged; unknown ID/version, wrong digest, disabled Games, non-allowlisted target and attempted Functions/Rules/lockfile writes rejected; cost profile alone cannot authorize Games.
- [ ] Run python3 -m unittest tools.automation.test_profiles -v; confirm specific new-profile tests fail before implementation.
- [ ] Implement fixed legacy Web + Games definitions and delegate only the profile-sensitive checks. Games allowed target is prototype/escape-expedition-visual-masterpiece-v1, with full expected SHA checked at admission. Keep existing security/candidate schema and cost limits.
- [ ] Run test_profiles plus test_pipeline and test_guardian; all pass, old Web fixtures unchanged.
- [ ] Commit profile adapter with handoff checkpoint; do not enable a policy entry or change old task sources.

### Task 2: Consistent profile-bound ownership and exact CI dispatch

**Files:** Modify execution.py, continuation.py, guardian.py, guardian-execution.yml, guardian-integrated-ci.yml. Add profile lifecycle cases to test_profiles.py/test_pipeline.py.
**Interfaces:** selected_profile(attempt: dict, task: dict, root: Path) -> Profile validates profile/control binding before any write; validation_workflow(profile: Profile) -> str returns one fixed trusted workflow ID/path. Legacy result shape remains untouched; new Games records include executionProfile, profileDigest and validationProfile.
- [ ] Write tests for different profile/control SHA, old retained attempt, changed target, documentation-only successor, queued/in-progress/unknown dispatch and v2/v3 unknown provider result. Assert zero provider POST, zero reservation and zero integration/deploy write on blocked cases.
- [ ] Run the focused new cases; verify failure of the old hardcoded WEB routing.
- [ ] Resolve base branch, validation workflow and review binding from the admitted trusted profile. Preserve taskId, response/request/run IDs, run_attempt, attempt count and budget fields. Do not change model_calls; do not add retry loops.
- [ ] Run test_profiles, test_pipeline, test_guardian, test_recovery and test_admit_after_pilot; all pass. Assert normal fast-forward and fresh target checks still precede CI dispatch.
- [ ] Commit coherent lifecycle adapter and checkpoint. Legacy runs under changed control hash remain stopped pending explicit diagnosis.

### Task 3: Credential-free Games validation and immutable package

**Files:** Create games_static.py, validate-games-static.sh, test_games_static.py, reviewed fixed fixture directory, guardian-games-validation.yml. Modify validation_report.py through a main entry function so importing it does not execute CI side effects.
**Interfaces:** validate_games_package(public: Path, source_sha: str, changed_files: list[str]) -> dict returns schemaVersion=1, sourceSha, sorted per-file sha256 and packageDigest; games_test_report(head: str, base: str, profile_digest: str, package: dict, test_result: str) -> dict. Fixed package includes only index.html/styles.css/app.js; sourceSha/provenance go into the separate manifest, not model-written source. Validator outputs evidence/tests.json, package-manifest.json and immutable public artifact.
- [ ] Review the pinned original 35 tests/builder/fixtures before importing them. Add tests for missing files, symlinks, traversal/Unicode aliases, extra firebase.json in public, changed byte hashes, remote HTML/JS/CSS resource references and failed/skipped packaging.
- [ ] Run test_games_static; confirm rejection cases fail before package validation exists.
- [ ] Implement fixed Node-22 syntax/test/build commands with trusted builder absolute path and scratch cwd. Keep cloud/provider credentials absent and checkout persist-credentials=false. Install any existing required CI toolchain before privileged work; run no candidate npm script.
- [ ] Add a controlled browser smoke using the existing pinned Games Playwright toolchain: intercept and fail every non-local resource/request, open the built shell and exercise Camp entry plus the learner hint/transfer UI. Keep this distinct from human visual acceptance and do not weaken the 35 contract tests.
- [ ] Run Python package tests; run node --test against the pinned Escape tests on the selected candidate and the fixed builder. Expected: all 35 contract tests and added package/browser cases pass under Node22. Record exact snapshot; local missing dependencies are not an app failure or green proof.
- [ ] Commit validator, fixture provenance and CI. No hosting identity or workflow secret in validation job; fixture/control digest checks pass.

### Task 4: Candidate reviews, integration and Games integrated CI

**Files:** Modify pipeline.py integration_gate/validate_review, execution.py review/integrate/ci_prepare, delivery.py adapter boundary; Guardian integrated CI workflow. Test in test_profiles.py/test_pipeline.py.
**Interfaces:** required_review_binding(task: dict, publication: dict, tests: dict, profile: Profile) -> dict; profile_packaging_gate(profile: Profile, report: dict, expected_head: str) -> None.
- [ ] Write tests rejecting one missing/vetoed reviewer, incorrect profile/package digest, stale candidate and a combined candidate with old reviews. Assert Web still requires its existing full evidence.
- [ ] Run focused tests and confirm failure before new bindings exist.
- [ ] Preserve existing reviewer model/role logic and add Games criteria/bindings from trusted profile. Games report requires its tested package digest. Fast-forward only to its explicit existing target, followed by the fixed integrated Games CI on exact new head.
- [ ] Run all contract/ownership tests, including partial push failure (no deploy dispatch). Expected: no path bypass and no receipt shortcut.
- [ ] Commit exact review/integration boundary. No paid review run in this task.

### Task 5: Trusted Hosting-only publication and receipt reconciliation

**Files:** Create guardian-games-staging.yml, test_profile_deployment.py; extend games_static.py with deployment verification; modify deployment_evidence.py component dispatch and continuation.py handoff selector.
**Interfaces:** verify_games_receipt(receipt: dict, attempt: dict, ci: dict, manifest: dict, current_target: str) -> dict; reconcile_profile_deployment(attempt: dict, persist: callable | None=None) -> str. Fixed Games components tuple is ('hosting',), Web remains its current Hosting/AI requirement.
- [ ] Write tests for wrong project/channel/source/digest, skipped job, stale target, run-attempt mismatch, missing credential, incomplete cloud publication, existing valid receipt and a concurrent manual Preview. Assert no duplicate publication or new provider call.
- [ ] Run test_profile_deployment; rejection/reconciliation cases must fail before implementation.
- [ ] Wire trusted main workflow to download the immutable already-validated artifact, verify manifest and current target/ownership before cloud login and immediately before publish. Use the existing scoped Hosting credential only after verifying its identity. If unavailable, block; do not provision IAM. No candidate code/scripts executed after login.
- [ ] Publish only channel gradecrew-escape-visual on hausaufgabe-staging, expires 30d, with cancel-in-progress=false and common per-channel concurrency. Record Hosting version and verify published file hashes. If existing manual publisher cannot join this ownership/concurrency boundary yet, keep real Games activation disabled.
- [ ] Emit receipt with task/profile/control/candidate/integrated SHA, CI/deploy Run and attempt, package digest, site/channel/version and verified hashes. Existing exactly matching receipt is reused; ambiguous result blocks retries. Update release state only for an actually verified stage transition, retaining human gate false.
- [ ] Run test_profile_deployment plus test_staging_deploy_permissions/test_pipeline. Assert validation is secret-free and Web Functions still uses its own identity.
- [ ] Commit workflow/evidence adapter and handoff; no real publication in this test task.

### Task 6: Bezahlfreie Rehearsal, full regression and activation handoff

**Files:** Create test_profile_rehearsal.py and synthetic fixtures; update automation/EXECUTION.md, workstreams/guardian-admission-profiles-v1.md, TODO.md and profile matrix. Do not change real queue/ledger reservations or enable Games.
**Interfaces:** rehearsal takes a synthetic task/source/candidate, fake provider responses, fake runs and fake receipt through Tasks 1–5; no network mutation and no real cloud credentials.
- [ ] Write end-to-end rehearsal tests for success, veto, target advancement, package mismatch, unknown provider, duplicate dispatch, insufficient remaining budget and missing receipt. Explicitly assert automaticProduction=false and user_tested is never manufactured.
- [ ] Run test_profile_rehearsal and confirm the first new-profile path fails before the final composition is wired.
- [ ] Connect the existing functions through synthetic fixtures without changing provider/deploy behaviors. Add restart from each saved phase and check same taskId/history/reservations. A 2.40 USD attempt under 2.55 USD cannot reserve another such attempt.
- [ ] Run python3 -m unittest discover -s tools/automation -p 'test_*.py' -v plus the exact Node22 Games CI. Existing Web dependency/emulator/package rehearsal also passes on the same controller commit; do not reuse earlier Web CI for changed control code.
- [ ] Perform independent whole-branch review, current main/PR/overlap comparison and required PR CI. Commit the resulting handoff with exact successes/failures. Keep policy/queue activation disabled.
- [ ] Prepare one explicit pilot contract only after separately verified profile/Hosting identity/channel ownership and actual remaining budget. Do not admit or dispatch it until its existing gates/freigabe are satisfied.

## Related existing work, handled separately

Freitext PR #11, Security cutover, Combined CI #51, PostHog #99/#100, Gateway evaluation and Native device acceptance are separate existing workstreams; this plan does not roll them into one uncontrolled implementation.
Escape-MVP's secret-scoped Viewer fix was explicitly approved and applied outside this controller plan; a current-SHA retry is an independently qualified deployment continuation, not a Games-profile pilot or a new model attempt.

## Execution handoff

Recommend Native execution in this chat: six tasks share tightly coupled profile/evidence interfaces and existing budgets; one implementation owner avoids concurrent controller edits. A fresh independent whole-branch reviewer follows, without starting the paid Guardian chain.
Before implementation, Martin reviews this written plan and chooses Native or subagent-driven execution. In either case preserve existing task IDs, safeguards and checkpoints.
