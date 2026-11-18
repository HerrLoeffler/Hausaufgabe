# Historical Wilma recovery and compact review implementation plan

> For agentic workers: use executing-plans for the parent backend/client work and independently scoped agents for teacher and student UI.

**Goal:** Make the actual historical failure usable, show answers in the first viewport, and keep the student timer and compact task numbers visible without shrinking questions.

**Architecture:** Existing receipt fingerprints and budgets remain authoritative. Old valid receipts are read for free; settled missing/corrupt receipts have one explicit CAS-guarded retry. Never-started answers get a separate explicit one-answer action. Historical answers predating the first recovery rollout and results refreshes stay free-only. Failure scope is a quiz/identity rather than a permanent actor-wide pause. Existing server deadline and teacher grading authority remain unchanged.

**Tech stack:** Existing JavaScript modules, Firebase callable, Firestore ledger and private GCS receipt store; Chromium/WebKit fixtures.

## Tasks

- [x] Read actual live/main/handoff and diagnose the affected historical operation without provider or grading writes. Current class has11 submissions; one settled unknown operation and several identities with no prior job. Reproduce the unsafe failure cascade and missing/corrupt receipt cases with fictional data.
- [x] Parent: core/runtime cached-receipt validation before retry eligibility; old failed phase and creation-time stamp fallback. No retry for unsettled holds or infrastructure uncertainty; valid old receipt recovers free even with an unsettled hold. Seven new backend regressions RED→GREEN.
- [x] Parent: quiz-scoped failure guard, explicit resume callback, successful state replacement, historical/refresh free-only host policy. New regressions RED→GREEN; no automatic grade writes.
- [ ] Teacher agent: dense header/task chooser, Offene/Alle, one short problem line/action, compact per-gap comparison. Reproduce15-task/9-submission legacy screen; first answer visible at1180×700,390×700 and zoom.
- [ ] Student agent: original timer node stays visible, numbered44px grid, bounded30/50/100 scroll, active outline and completion checks. Preserve860px question area/fonts,1180×600 breakpoint, answer/media node identity and automatic submission semantics.
- [ ] Integrate once; independent review, appropriate full tests and exact CI. Add new bounded timer/grid check to the existing CI. Preserve the actual live baseline and unrelated source.
- [ ] Stage the reviewed exact source, preserve other Hosting paths and all other functions. Use only the existing clearly fictional Stage QA operation for a controlled missing/corrupt legacy fixture and one explicit provider retry. Preserve old bytes/metadata, histories, cost accounting and grades. No real-class rerun. A fresh successful submission is not acceptance of the old failure case.
- [ ] Verify deployed recovery and compact screens, then publish only the authorized callable and Hosting scope. Live validation reuses the already valid fictional receipt without another provider call where possible. Old real pupil data remains read-only.
- [ ] Update existing handoffs, TODO and GRADECREW_STATE with exact receipts. Coordinate the student UI refinement with the existing native owner; do not launch duplicate native builds.

## Cost and scope

Existing tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01. This new explicit P1 follow-up authorizes a controlled synthetic historical-recovery test; previous completed QA rounds remain preserved. Target at most one new Stage provider call and zero new Live provider calls in this round; stop on unexpected state or accounting rather than retry blindly. Existing20EUR shared monthly ceiling and8.75EUR Live share remain unchanged. Production source/limits/IAM/Rules/Assessment/Gateway/Games outside the narrow scope remain intact.
