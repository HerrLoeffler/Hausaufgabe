# Lernwerkstatt Paket1 Implementation Plan

> For agentic workers: use the authorized parallel scoped agents, then integrate and verify each contract. Task GC-ADAPTIVE-PRACTICE-01; existing PR262/253, no new task/chat.

**Goal:** Four actual tool families (fractions, number line, balance, short text work) in the existing real-AI adaptive practice, with stable learning evidence and a detailed evolving-didactics concept.

**Architecture:** Existing workshop registry and semantic replay receive three bounded adapters; all use the existing AI generator, factual assessment and independent review. Validated answers are checkpointed before next-task generation. Private bounded submissions and a separate reviewed-task reuse pool support personal progress and task quality without automatically training models or publishing pupil text.

**Tech Stack:** Existing vanilla ES modules, Firebase callable Node22/CommonJS and Firestore; existing provider binding. No new framework/provider/key.

**Spec:** ../specs/2026-10-22-learning-workshop-system.md plus explicit user22.10instruction to execute and deepen concept.

## Global Constraints

- Only own worktree/branch; sources/ and analysis/ are read-only.
- Test-only gradecrew-staging-2026; School Live/Production and existing endpoints outside scope untouched.
- Reuse VIS03/05/10/13 principles and available code after source inspection; no PhET assets/code copied.
- Public configs never include private answer keys or pupil identity. Max60 semantic actions, no pointer/tick telemetry. Exact same geometry for fraction comparison.
- Real generation and semantic assessment remain AI-backed. Exactmath guards and second review retained; no static replacement pretending to be live AI.
- User explicitly requests implementation now; no repeated scope-confirmation loop. Updated concept is a concrete deliverable, not a new excuse to postpone package1.

## Review Focus

1. A correct answer followed by rejected generation stays recorded once and retries generation only.
2. All four public models and server replay agree, including resets/fraction continuation states and decimal grid endpoints.
3. Multiple valid text/symbolic answers and manipulative arrangements remain acceptable; unrelated models are not offered.
4. Retained submissions stay under authenticated owner; expiry/bounds/deletion and no raw crosslearner sharing.
5. Existing topic routes and no-tool independent probes remain usable; essay/audio goals remain visibly gated rather than falsely complete.

## Work units

- [ ] Backend adapters: create functions/lib/learning-brain/workshop-models.js; extend workshop.js. Inputs public config+private task key+semantic actions; output validated config and server-derived observation. Tests functions/test/learning-workshop-models.test.js first RED thenGREEN.
- [ ] UI adapters: existing lerngehirn/workshop.mjs exports unchanged; extend to number-line, balance, text-workbench and fix common fraction geometry. UI agent owns module/styles/test. Interfaces {tool,version,role,goal,instruction,...boundedparams}; evidence {tool,version,taskId,actions}.
- [ ] Evidence service: checkpoint transition before next generation, safe pendingNext/retry-next, bounded private attempt records under same owner, timestamp expiry. Agent owns service/core/tests. No false grading on generation rejection.
- [ ] Shared didactic planning and AI: add demand descriptor, tool capabilities/config schema, shortanswer German eligibility and rational numeric validation; candidate repair uses actual critique. Root owns AI/new planning and pool modules/tests.
- [ ] Reviewed reuse fundus: reuse only matching topic/context/demand/support/toolversion, independently reviewed candidates; bounded Firestore repository with isolated synthetic scope and no learner answer in shared entries. Record independent outcomes separately, no automatic proof of learning or unreviewed promotion.
- [ ] App integration: actions/inputs for all tools, pendingNext retry and workshop entry routes; preserve formstate. Root owns app/model/API integration tests, build+proxy asset allowlists.
- [ ] Detailed concept: competency/subskill matrices, observation taxonomy, error ladders, outcome/retention validation, quality promotion/retirement, personal preference uncertainty, teacherpilot readiness and identity limitations. Agent owns new docs/learning-brain/didactics-learning-system-20261022.md.
- [ ] Verify/deploy: full backend/UI checks, independent scoped review, exact source checkpoint, targeted own functions+owned learning assets only, canonical baseline/hash checks. Test real correct/hardening, repeatederrors, support return, technical nextfailure and ownerisolation for all four. Screenshot actual model geometry and preserve failed attempts.
- [ ] Save receipts/limitations/actualtestscope and update same handoff/TODO/state. No blanket allmath/Quali/audio/student-account readiness claim without actual path proof.
