# Wilma budget and confirmed-answer fundus implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline, followed by an independent whole-branch review.

**Goal:** Enforce a EUR20 monthly Wilma API ceiling on Staging and reuse teacher-confirmed text/gap scores without a provider call.
**Architecture:** Existing owner-checked Callable and decision transactions remain the only entry points. Stage-only budget reservations use integer micro-euros and conservative published-model tariffs; the private fundus references a still-valid teacher confirmation, never an unconfirmed AI result. Live behavior stays unchanged.
**Tech Stack:** Node22 ESM, existing Firestore Standard/Admin transactions, existing OpenAI client, existing Web results UI.
**Spec:** Direct user instruction29Oct2026 and workstreams/wilma-live-grading-20261028.md budget decision. Existing reuse-key and own-fictional-test provider authorization persists.

## Global constraints
- Stage only: gradecrew-staging-2026; gradecrew.de/hausaufgabe-staging unchanged. No new IAM/Rules/secrets/provider.
- EUR20 monthly global Stage Wilma cap, not per teacher. Monthly civil boundaries Europe/Berlin. Existing seven historical requests/jobs preserved; conservative historical allowance charged once to activation month.
- Model gpt-5.6-luna only. Official29Oct rates USD0.20 input/USD1.20 output per million; accounting ceilings EUR1 input/EUR6 output per million deliberately exceed the published dollar tariff. Count all input/output at ceiling rates, no cached-input discount; no invoice-accuracy claim. Pricing policy expires90days and fails closed until reviewed.
- Reserve an upper bound before provider: UTF8 input payload bytes plus8192 token overhead, max4500 output. Unknown/timeout/missing usage retains reservation; no automatic retry. Concurrent reservations, duplicate requests and late settlement must remain safe.
- Same teacher/test/question/full question snapshot/exact answer only; no normalization of case, spelling or whitespace for fundus reuse. Source submission's answer, confirmed score and question snapshot must still match. Deleted/held sources, media, changed scores/rubrics or undo make old evidence unusable.
- Fundus stores hashes and source reference/points; no copied answer/name/classlist. Existing account aiRuntime recursive deletion covers it. No cross-account sharing or self-training.
- Fundus results remain suggestions requiring teacher confirmation, with short 'Aus deinem Fundus' provenance. API fallback only for unknown/invalidated evidence, within budget.

## Review focus
Parallel reservations; month rollover with in-flight calls; incomplete provider usage; stale/undone/contradictory teacher decisions; forged client rubric/foreign owner bypass. Cover each with tests.

### Task1: monetary reservation and usage settlement
Files: functions/lib/wilma/budget.mjs + budget.test.mjs; runtime.mjs/runtime.test.mjs; provider.mjs/provider.test.mjs; wilma-review-callables.js.
- [ ] Red tests: EUR20 boundary/concurrent reservation, Berlin rollover, usage validation, failures retain reservation, old7 history retained, Live oldcap unchanged.
- [ ] Implement pure money calculations and transactional ledger reservation/settlement in existing private budget paths. Return usage from provider, including incomplete responses safely; never expose tokens.
- [ ] Run focused tests, record red/green and commit.

### Task2: teacher-confirmed private fundus
Files: functions/lib/wilma/fundus.mjs + fundus.test.mjs; core.mjs; runtime.mjs; decision.mjs; corresponding tests; wilma-answer-review.mjs.
- [ ] Red tests: confirmed new submission reuses0calls, unconfirmed AI never learns, foreign owner/question/rubric/answer mismatch, correction/Undo/conflicting confirmation invalidation, deletion/media, batch mixed known/unknown, exhausted budget still permits fundus.
- [ ] On explicit confirmation register source reference in same transaction, before writes. Read and validate active source before serving stored points. Exact context only; no broad migration of historic scores.
- [ ] Preserve existing teacher save/undo/status and UI receipt format; mark fundus provenance without automatic score write.
- [ ] Run focused/full tests, record red/green and commit.

### Task3: exact source review, Stage deployment and real acceptance
- [ ] Independent scoped reviewer, resolve important findings; exact remote CI.
- [ ] Fresh active Stage source ZIP and Hosting snapshot; deploy only reviewWilmaAnswers from exact reviewed composition and minimal changed Web prefix. Preserve submission origin,95otherFunctions,other Hosting files/config, live bytes and historical budget.
- [ ] Own fictional long-text AI proposal -> teacher confirm -> same answer in another submission uses fundus0calls; changed answer/raster no unsafe hit; correction/undo/reload; budget-boundary synthetic ledger tests with no extra charges. No artificial exhaustion of real monthly global budget.
- [ ] Update same task/Handoff/TODO/STATE with exact commits/receipts, cost accounting limitations and remaining human/physical-device acceptance.

## Ledger
29Oct: existing owned isolated worktree reused; new branch feat/wilma-budget-fundus-20261029 from reviewed7474-equivalent6b7068. Existing Stage review00007, budget7/7. Existing Firebase session renewed normally after401; unchanged scopes. No provider call or deploy yet. Runtime model requestedSol6.1; actual runtime unknown. Inline execution authorized by direct 'bau jetzt' and standing no repeated plan confirmations.
