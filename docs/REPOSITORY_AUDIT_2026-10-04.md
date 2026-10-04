# GradeCrew repository audit — 2026-10-04

This is a source audit and regression inventory, not a Production or device approval. Martin requested the current code and automation be checked across workstreams. No blanket merge or rewrite is authorized by this report.

## Exact source coverage

| Area | Snapshot | Evidence |
|---|---|---|
| Web, AI Functions, Assessment, Rules, shared design/i18n, Secure native prototype | `eb80c5e6a8b6c1ae13deba676709607bfccee208` | All 322 text files downloaded; 174 JS/MJS/CJS syntax checks and JSON parsing passed. Broad local test run: 295 passed; 22 suites could not load missing firebase-admin/firebase-functions/ajv/jsdom. Real dependency/emulator/UI/package GitHub rehearsals passed in runs 37198688992 and 37199087981. |
| Gateway and intelligence/evaluation modules | `ad621a314b57ce567e1bd165754f2c7ddff0947e` | Selected new/changed modules fetched from exact current branch; 44 JS syntax checks passed. 80 local tests passed; 3 could not execute because partial audit snapshot lacks a deployment guard, admin module/workflow. No exact-head Actions run returned at audit time; live deploy is separate. |
| Games base | `55e58e4f6147d0d274d8e5f51578b5d60cb33b4e` | Selected game modules fetched; 28 JS syntax checks passed; exact-head Games Lab Checks run 36993091180 passed. |
| Escape prototype | `934354fce20a24fd27f47a9b69237f3d04e3a3f5` | Selected new Escape modules fetched; 20 JS syntax checks passed; exact-head Escape review gates 37198496899 and Games Lab Checks 37198496913 passed. Partial local test run lacks HTML/jsdom/function-source fixtures; not an application failure. |
| Teacher iOS | `8bdebaf1ab701d44e57369914bd2b82fe7bdc895` | Teacher Swift source/configuration reviewed; exact-head TestFlight workflow 37015605383 passed. Linux lacks Swift/Xcode; local environment test could not start. Physical iPad acceptance remains open. |

Additional snapshots contain 124 selected new/changed text files in total. Binary assets, real device behavior, live IAM/database state and every historical feature branch were not exhaustively checked. Parallel gateway/Escape branches advanced during this audit; the SHA above defines coverage. A passing syntax check does not prove UI composition, security or business behavior.

## Findings and decisions

1. **P0, GC-SECURITY-02: the source cutover for solution protection remains incomplete.** Web `firestore.rules` permits public reads of published `quizzes/{quizId}/questions/*`; those documents feed Assessment's grading keys including correct/accepted answers. The secure callable returns a sanitized paper, but a direct Firestore read remains possible under these source rules. `SECURE_ASSESSMENT_V1.md` explicitly records this as a migration gate. Require an atomic client/Functions/rules migration and emulator denial tests before claiming protected examinations. This audit does not establish which rules are currently deployed and does not deploy a breaking rules change.
2. **P1, GC-GAMES-INTEGRITY-01: Fehlerjagd highscore input and finalization need server validation.** `lab/fehlerjagd-deutsch-functions/lib/common.js::cleanSummary` clamps client-provided totals/scores but does not recompute answers. `finishHighscoreAttempt` reads attempt status before its transaction; the transaction reads the score document, not the attempt, so concurrent finishes can both use an earlier running snapshot. Treat leaderboards as prototype data until answer/score verification and transactional single finalization are implemented and tested. Separate owner branch; no games overwrite here.
3. **P1, cost control: product AI and development Guardian are separate billing paths.** Web Functions enforce per-user minute/day quotas before calls. They do not provide Guardian's dollar ledger or an account-wide spend cap in this snapshot. The separate gateway has durable operation reservations, global daily/monthly budgets and stops on unknown provider charges. Do not claim those gateway controls already govern every product test-generation endpoint on the web integration branch. Complete explicit routing integration and price/quality evidence under the gateway workstream.
4. **P1, GC-DESIGN-03: the original homepage queue was not executable.** It requested forbidden `.json`/`.md`/workstreams context and roughly 60k bytes of selected source within a 12k profile. Correct it to CSS-only changes, read-only existing entry/startup JS and module-web-v1. Same four models and review gates; $2.40 reservation and unchanged $2.55 overall cap, permitting one attempt. The task is admitted only after the real pilot reaches verified staging and the selected homepage blobs still match. Text-only reviewers do not establish final visual acceptance.
5. **P2, maintenance: avoid a broad rewrite while active branches overlap.** `app.js` is approximately 371k bytes; multiple tour versions and optional enhancement layers are packaged. Extract one stable boundary at a time with existing behavioral tests. Admin data loads at app.js 6358–6361 fetch entire users/quizzes/announcements/feedback collections: pagination/aggregation belongs to the existing admin scalability task. Preserve import, scoring, tutorial and secure routing behavior.

## Automatic phase capability

| Stage | Actual capability |
|---|---|
| branch_only | Bounded explicitly admitted existing web UI files can produce a PR. Backend/rules/games/native changes require their own execution profiles. |
| ci_green | Dependency-installed emulator, UI and package checks plus three independent provider reviews gate the exact candidate. |
| integrated | Exact source/tree and all gates required; fast-forward preserves parallel changes. |
| staging_deployed | Integrated CI plus same-SHA Hosting/Functions deployment receipts required. |
| user_tested | Physical devices and final visual acceptance are human gates. |
| production | Remains an explicit human release gate. |

Starting the eligible queue is authorized. An old PR being open or a workstream being active is not evidence that its changes can safely be merged or that its device/Production gate has passed.

