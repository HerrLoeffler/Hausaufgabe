# GC-VISUAL-PROTOTYPE-AI-02 / Issue 255

Owner: executing chat 01a15f2f-5b0d-7c71-b338-d37571fcce6d. Original task retained; no replacement issue or offline starter.
Branch: feature/visual-prototype-ai-02-20261021. PR: https://github.com/HerrLoeffler/Hausaufgabe/pull/265.
Base: 2a6ff107c3e84c9020507f2b384fdd20354efbf7. Current main at start: 0eac79c9ab36d40238956076001de8c9eff30409.

## Source and rollout evidence

- Backend source cfea0cc207cf7197da9d36c3e553137e6fca7ad6, exact reviewed local 991d052 tree aa672fed06f26fd94815cb4c86c0cf88d5fb0c42.
- Final hosting source 989f6463e9b1e41edb4f931bc2ddcc46393e7b7e, exact reviewed local menu fix 2ea6fa5 tree 6962f0dae4d63ab6912641a682b3fbdade595a10.
- Published URL https://gradecrew-staging-2026--visual255-rjcwf436.web.app/ . Expires 20 November 2026. 179/179 remote assets hash-verified against final release.json.
- 16 new prefixed endpoints, codebases visual255-ai and visual255-assessment, deployed successfully only to gradecrew-staging-2026. Existing OPENAI_API_KEY Secret Manager binding reused; value never read or copied. No new API key.
- AI access uses fixed synthetic UID gc-visual255-e2e, or protected pre-existing admin role. All six assessment endpoints restrict scope to quizzes of such owners. Unauthenticated AI call verified HTTP401/UNAUTHENTICATED. No public unauthenticated paid API.
- Standard Test Hosting, Schul-Live hausaufgabe-staging, hausaufgabe-40294, Rules and existing Functions not selected by this task's deploys. Inventory comparison saw three learningBrain endpoints change concurrently in the separate adaptive workstream; the other 41 existing endpoints retained source/hash. Own commands selected only the new visual255 codebases.
- No merge, canonical promotion, Production deployment, CI-green claim, human acceptance or physical-device claim. State is staging_deployed with synthetic operator verification.

## Implemented

Existing vanilla GradeCrew UI and Remy/teacher/Emmi/save/student/assessment paths preserved. Prototype source read from Downloads/GradeCrew_Prototyp_02; model and renderers reused with closed, bounded data validation and scoped styles. Twelve extra interactions in one visual family: hotspot, labeling, scale, angle, grid, chart, connections, coordinate, evidence, range, table, correction. Native single/multi/number reused; native numeric fractions/decimal input matches server and preview. Existing matching and markwords remain distinct from spatial directed links and alternative complete sentence evidence. No format-completeness quota.

visualTask is a versioned JSON string, preserving nested task data through Firestore serialization, import/export, source context, materialization, Emmi single/whole revision, teacher preview, student paper and answers. Student visual answers persist as JSON strings; public paper strips solutions/review/provenance/rationale. Server assessment retains existing fingerprinted immutable snapshots, ownership and idempotent submission. Protractor starts displaced and rotated, supports pointer/keyboard/control translation and rotation, and never auto-fills the measured answer.

## Genuine online checks

- Exact fraction prompt entered in existing browser Remy UI. Job 6a1daf36a30146d33f01350fc6847ee27786db47 / request AI-1d28d7370fad427a, quiz VSSP9ZEH: 6 tasks,12points. Initial selection produced classic tasks; no forcing of unsuitable visuals.
- Genuine Emmi single edit converted the 24-child three-quarter objective to a24cell grid. Genuine whole-test edit reworded task6 while preserving grid/key/points. Teacher review acknowledgement and save performed; final wording and grid independently read from server after reload (not inferred from local draft).
- Secure student paper6/12 loaded online, no visual solution. Direct online resume gave identical frozen paper. Five correct and one wrong answers =>10/12,83%,grade2; repeated submit with altered answers retained identical signed receipt. Submission a_15377234a6f2caf9521d3849bb18.
- NT job061bfe1c45055ce025cd8794c450196778116d2e, quizP5TRADQM: plant labeling/single/multi/function matching; genuine generation plus secure online submission =>8/8,grade1. Public key absent.
- Angle job76b49d9e26bdfb3d207b378300b2c66dea5f2453, quizE5NPTL3M: genuine measurement task with no target value in public prompt/hint. Secure online ±1degree tolerance case=>2/2;outside=>0/2.
- Five logical AI actions,17unique provider requests. Model gpt-5.6-luna;78398 input and9735 output tokens. All request/response IDs in evidence. Angle needed3replacements and4quality-review passes (10provider calls); do not describe this as a one-call operation. Exact money unavailable; no invented cost estimate. No terminal failed AI event or simulated provider result used.

Evidence: docs/evidence/visual255-online-20261021.json. User-facing local copy: outputs/Pruefnachweis-Issue-255.json in executing chat. Real public intro screenshot retained there as Bruchtest-Online-Schueleransicht.png.

## Tests and review

293Functions and97Assessment tests, both check commands including ESLint; final100relevant browser/UI regressions and3environment tests passed. Local Chrome smoke exercised all12solution-free formats, touch-type pointer grid/protractor events, coordinate input, keyboard/numeric protractor motion/rotation, actual editor select, native fraction parity. Simulated touch events are not a physical iPad test.
Independent code/generated-package reviewer found and verified fixes for writable preview allowlist flag, missing Crew Assistant namespace route, native fraction parity, SVG marker IDs and static editor type option. Final re-reviews: no actionable findings. Git-CLI push had no write credentials; connected GitHub tree/commit tools saved the exact locally reviewed trees, verified by hash. No force push/reset.

## Browser acceptance completed

The saved fraction quiz VSSP9ZEH was reloaded in the integrated browser on 2026-10-21. The final Emmi grid wording persisted. All six tasks were answered through normal UI controls: Q1 intentionally wrong, Q2-Q6 correct including 18 of 24 grid cells. The rendered server receipt confirms “Abgabe gespeichert”, “Sicher gespeichert”, 10/12 points, 83%, grade 2. No new AI calls. Screenshot: outputs/Bruchtest-Browser-Ergebnis.png in the task workspace. The earlier modal blocker was absent on this continuation. Result tab marked as deliverable.

Automatic approval review rejected a proposed broad query of staging profile names/roles as unnecessary private metadata. That query did not run and was not retried/indirectly bypassed. Use only own synthetic data unless a specific account is supplied.

Browser fraction acceptance is complete. Physical-device acceptance remains untested. Main TODO/STATE/registry promotion remains with the integration owner; proposed coordination delta is this existing task -> staging_deployed, PR265, runtime989f646/backendcfea0cc, private/test-only access. No unrelated main coordination objects copied into product branch.

Relevant scoped assurance: SEC04/06/07/08/11/14/17 and PRIV07/17/20: own synthetic accounts only, server key, auth/quota, closed input/public projection, immutable/idempotent grading and no pupil answers to AI; current source tests and genuine server receipts above. Broader school/AVV/legal/device approval not claimed. Requested project working model for integration Sol/medium, actual runtime effort unknown; no runtime switch claimed.


## Verified owner preview access (2026-10-21)

Owner reported AI-CREATE-001 while the header displayed Admin. A targeted lookup of the explicitly supplied own login verified an active teacher profile in gradecrew-staging-2026; Admin is the display name, not the role. After explicit owner approval, source commit a18870f5086adaf3985c75d0070b22ddef2b84e2 adds only the exact verified staging UID to the compiled preview allowlist. No administrator promotion and no owner-editable opt-in flag. Both visual255 codebases were deployed successfully; all 16 prefixed functions are ACTIVE with new revisions. Tests: 4 preview access + 293 Functions + 97 Assessment passed. No AI generation triggered during this fix. No Hosting or School Live deployment. Evidence: docs/evidence/visual255-owner-access-20261021.json.
