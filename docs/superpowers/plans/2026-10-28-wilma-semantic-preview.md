# Wilma semantic review preview implementation plan

> Execute inline using superpowers:executing-plans. Existing task GC-PEDAGOGY-KB-01, same handoff and preserved pilot history. Human request relayed by authorized Zentrale: implement the specified existing UI flow, no further design round.

**Goal:** Unmatched nonempty text answers stay visibly pending and can receive semantic point suggestions in the existing class-wide teacher queue, with an isolated automatic synthetic preview.
**Architecture:** Keep existing deterministic scoring, Wilma reviewItem/decision/runtime/provider/cache and teacher-only confirmation. Add a small gated scheduler that calls the existing semantic review one unchanged answer at a time, reusing its persistent exact cache across class membership changes. No second engine/provider or automatic grade writes.
**Stack:** Existing native JavaScript modules, Firebase Callable/Firestore, existing OpenAI access/model. Existing UI/CSS and WebKit/Chromium harness.

## Current cause and chosen scope
- app.evaluateAnswer and assessment gradeQuestion label any text mismatch needsReview=false; reviewItem only reopens manualReview text. The current button only calls AI for existing pending candidates of the selected question, batches of ten; it does not judge task quality.
- Keep exact accepted matches automatic, explicit teacher confirmations untouched, genuinely empty text/gaps rule zero. Nonempty unmatched text stays pending, including previous unconfirmed auto-zero records. Never infer half a point by string similarity.
- Status/layout correction can be prepared for a narrow Live fix. Automatic execution stays OFF for ordinary/Live tests. First preview uses only a clearly owned fictional Staging fixture, two new single-answer requests maximum. Stage budget was4/7; never reset. Live pilot cap7 unchanged.
- Chosen path reuses existing queue and cache. Mass old-answer regrading is excluded. Per-answer existing cache is intentionally favored for this tiny preview; future batching requires evidence that already checked answers are not charged twice.

## Gates before automatic real-data activation
- Authenticated active owner and confirmed submission; exact question/answer/rubric binding; no pending draft/copy data. Only question, bounded rubric and pseudonymous answer IDs/text sent.
- Existing provider TEXT_MODEL, store:false, maxRetries0, timeout120s, output4500tokens; question6000chars, answer4000chars, criteria2000chars. Current request cap7 is NOT a monetary ceiling. Exact maximum input tokens/USD budget and concurrency policy must be approved/measured before broad auto activation.
- School operations/data owner must confirm existing processing purpose/provider/retention/access rules for automatic pupil-text use. No new transmission approval inferred from pseudonymization. No real-text auto send in this task.
- Unknown network/provider result: pending/error visible, no automatic retry. Cache/reload may retrieve the exact old receipt, no paid replay. Teacher sees criteria/answer/suggested points/short reason, decides confirm/change/defer. Scores/student release remain controlled.

## Tasks
1. [ ] Add failing regressions for nonmanual unmatched text, synonymous/partial/mixed/wrong/empty/no rubric/confirmed; client and existing server decision projection stay consistent. Reproduce true current auto-zero before fix.
2. [ ] Fix reviewItem and new-submission deterministic classification locally, retaining all other scoring and explicit manual decisions. Test no premature final grade or loss of CAS/undo behavior. Coordinate secure submission origin changes with School operations before any deploy.
3. [ ] Existing queue: clear counted primary entry; rename manual secondary AI action; pending AI status/error states; next open response across pupils/questions; no forced individual pupil pages. Known empty answers never schedule provider jobs.
4. [ ] Add bounded auto scheduler and tests: opt-in gate, eligible pending text/gaps, one serial unchanged answer identity, persistent provider-cache reuse, version change, no retry on failure/unknown/limit, account-generation isolation and no automatic confirmation. Ordinary Live flow remains off.
5. [ ] Fix task navigation with contained focusable horizontal scroll; long task/answer wrap; no document overflow for20/40 tasks at320/390/768/1024 and zoom/touch. Real browser geometry/click evidence, retain inline grading.
6. [ ] One normal-app Staging preview with owned fictional answers and at most2 remaining authorized provider requests; test reload/cache and confirmed points. No historical mass review or Live auto activation. Reuse existing budget and deployment receipts.
7. [ ] Scoped independent review, exact CI, source/version CAS. Save handoff/TODO/state and concrete automatic activation gates. Report actual performed tests vs pending human verdict; preserve all current Remy/upload/editor changes.
