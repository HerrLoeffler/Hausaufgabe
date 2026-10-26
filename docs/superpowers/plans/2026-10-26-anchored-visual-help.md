# Anchored visual help implementation plan

> For agentic workers: execute each independently testable task with behavior checks and review; retain GC-ADAPTIVE-PRACTICE-01, PR262 and the existing separated test environment.

**Goal:** Help a learner with the task they can actually see, progressively and visually, without replacing its facts or confusing supported success with understanding.
**Architecture:** Immutable task anchor plus bounded, AI-generated and independently reviewed assistance. A compact workspace renders one source scene and one current question. Private bounded help episodes connect requests, supported steps, original-task completion, distinct independent probes and future review.
**Tech stack:** Existing Node Functions/CommonJS, structured GradeCrew AI provider, own validated SVG/workshop renderers, vanilla ESM UI; no new dependencies/provider/keys/rules.
**Spec:** This document records the user's explicit execution request and the implementation choices below. Existing main learning principles VIS03/05/07/08/10/13 and MOD05 are reused; no foreign assets or simulation embedding.

## Required behavior and anti-goals
- Help retains the source quantities, geometry, text/audio and relevant learner manipulation. Three squares must remain three; an existing one-row scene must not be described as having an unspecified upper row.
- The first help identifies one obstacle and focuses a visible element. The second adds a concrete scaffold such as counting labels, a row/column cue, colored quantities or a worked partial operation on the SAME data. The third models one smaller action and asks one answerable check. If progress still fails, preserve the context and invite a teacher rather than endlessly regenerate.
- The AI chooses the pedagogical explanation, question and focus; deterministic code owns object identity, scene facts, allowed focus anchors and response contracts. No arbitrary generated HTML/SVG and no changes to source data via help.
- A microquestion has its own explicit answer field. A question from the pupil is displayed together with the AI reply. Original task is available collapsed, not another large drawing above the help.
- A necessary workshop remains usable; no invisible actions or text field pretending to assess a drawing. If the current microquestion uses a scalar response, the original workshop is clearly supportive, not graded as the response.
- No forced reading timer. Desktop goal: task/help/model/answer within a 1280x720 viewport for ordinary short tasks. On narrow screens preserve readable text, logical focus order and local proximity; do not promise no scrolling for arbitrary long source text, keyboards or zoom.
- Do not hide errors, invent certainty, count a hint as mastery, or treat more clicks/reading time as learning proof.

## Design decisions and alternatives
A prompt-only instruction is insufficient: the model can still generate new numbers. A separate bank of static explanations would not interpret the actual pupil action. Chosen: AI-generated assistance constrained to an immutable source and validated semantic anchors, with reviewed response keys. Existing independent task generation remains for genuinely new probes after supported completion.

## Task 1 — Anchored AI assistance (root)
Files: new functions/lib/learning-brain/scaffolding.js; ai.js, core.js, service.js; backend tests.
Interfaces: sceneRegions(task) -> safe id/label array; anchoredCandidate(hint,session,context) -> candidate with source scene unchanged and assistance metadata; publicSession includes assistance only, no keys. AI gets source, scene facts, last actual action, previous help and critique; independent reviewer checks explanation/question/key against exactly that source.
- [ ] Add failing tests: three cells persist through successive help; invalid region rejected; one-row upper-row ambiguity rejected; ordinary text and fraction source unchanged; question/reply linked; no private answer in public assistance.
- [ ] Implement compact strict hint schema without mutable source scene fields, bounded text/options/key and focus ids. Two real candidate/review attempts maximum, no fabricated approval.
- [ ] Increment actual help stage on repeated request; preserve stage for a clarification; completion restores original task without generating a new one; new independent task clears assistance.
- [ ] Run focused AI/core/service tests, then whole Functions tests/lint. Check unclear/timeout/retry paths preserve accepted evidence.

## Task 2 — Shared visual learning workspace (UI worker)
Files: app.mjs/model.mjs/styles.css/diagram renderers; new assistance.mjs if needed; frontend tests. Build/server allowlists owned by root.
Interface: session.assistance={version:1,anchorTaskId,stage,focusIds,numberLabels,regions:[{id,label}],replyTo}; same original diagram/context/workshop reused. Stable anchors include cell:x:y,row:y,column:x,part:i,whole:i,token:i,bar:i,point:LABEL and supported named shape/side anchors.
- [ ] Meaningful tests for single source rendering, compact SVG viewbox, connected question/reply, escaping, valid/invalid focus and unchanged scene data.
- [ ] Render semantic highlights/optional counting labels in original diagram. Count-along control changes annotation only, never source or automatic correctness. Preserve workshop/draft on same source while making microquestion input distinct.
- [ ] Collapse original prompt/context and supplementary details. Keep explanation and answer adjacent; one primary action, clear progress/status and pending/error recovery.
- [ ] Browser verify original three-square case, second help, pupil question and keyboard answer; test fraction/number line/text families and narrow viewport. Record viewport/screenshot and limitations.

## Task 3 — Evidence of help usefulness (evidence worker + root integration)
Files: new help-evidence.js and tests; integrate in service transitions/private session persistence.
Interface: observeHelp(previous,next,{action,assessment,now}) -> next; projectHelpEvidence(sessions) -> safe aggregate reason counts.
- [ ] Tests distinguish request, repetition, supported success, original completion and genuinely distinct independent probe. Same fingerprint, unclear response, duplicate call and technical retry never prove transfer.
- [ ] Last20 private episodes per session; no raw learner answer/question/identity in aggregate. Link task fingerprint, support version/stage, errors and outcomes. Repeated difficulty flags reviewNeeded rather than globally downgrading an exercise from a single child.
- [ ] Preserve signals after finish/resume. Global multi-pupil promotion/causal claims/retention certification remain absent until a separately reviewed aggregation and teacher approval path exists. This is a quality signal, not model retraining.

## Task 4 — Integration, real AI and delivery (root)
- [ ] Review all changed files together, add new renderer imports to both test-only builders and local bridge allowlist.
- [ ] Commit/push safe checkpoints preserving tree identity and existing attempts/budgets. Update Task TODO/handoff with concrete tests, not completion claims from a plan.
- [ ] Deploy only changed owned learningBrain Profile/Start/Turn to gradecrew-staging-2026, state exact source before deploy; next attempt32, retaining1–31 history. No production/School Live/rules/IAM changes.
- [ ] Real synthetic-account cases: grid3 -> help -> help with unchanged3; wrong -> simpler focus -> answered check -> original -> distinct probe. At least fraction and text/line help paths. Inspect real pupil question/reply association and actual overlay.
- [ ] Reject/repair any scene/key mismatch; record rejected candidates honestly. Measure representative latency, do not remove counterreview for speed.
- [ ] Keep local8775 usable and show final screenshot. Existing broader content calibration/classroom/identity/retention gates remain explicit; do not claim every possible future task is perfectly taught.

## Review focus
1. Old saved sessions without assistance: first new help anchors the current original scene and safely migrates; no source change or crashing.
2. Model state preservation cannot double-replay actions or silently change the answer contract; same source/id vs new microquestion must be explicit.
3. Source media transcript/private answer cannot leak through region labels, response fields or help quality summary.
4. Pending generation/retry and time expiration must not count another error or lose the source/reply; event idempotency preserved.
5. Visually compact rendering must retain readable labels, correct geometric proportions and accessible alternative labels under narrow screens/zoom.

## Evidence limits
An answered helped check is supported progress, not independent competence. A later distinct correct probe is promising transfer, not causal proof that this hint works for everyone. Retention requires later independent evidence. Repeated requests without responses are requests, not math errors. The framework applies to all current validated task contracts; new future contracts must register semantic anchors and acceptance cases before claiming visual support.
