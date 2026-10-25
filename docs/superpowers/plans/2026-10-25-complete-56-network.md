# GradeCrew 5/6 competency network implementation plan

> For agentic workers: use authorized scoped parallel workers, then root integration and independent review. Existing task GC-ADAPTIVE-PRACTICE-01, AppPR262/DocsPR253. User explicitly requests implementation of the previously discussed 5/6 scope; do not restart approval questions.

**Goal:** Cover every existing Bavarian Mittelschule Math/German grade5/6 curriculum anchor with detailed, source-linked practice competencies and a clickable personal network, retaining real AI, durable evidence and truthful assessment boundaries.

**Architecture:** Extend the existing catalogue with separate versioned competencies, retaining all legacy topic IDs and their evidence. Reuse the current owner-isolated session/attempt/pool services and workshop contracts. Personal network nodes derive from actual competency evidence; prerequisite edges are curated relations, not random lines or hard locks.

**Tech Stack:** Existing vanilla ES modules, Node22 Firebase callables/Firestore, existing OpenAI provider and audio-flow. No new framework, provider, keys, school deployment or alternate identity database.

**Spec:** Existing approved docs/learning-brain/didactics-learning-system-20261022.md, docs/superpowers/specs/2026-10-22-learning-workshop-system.md and explicit 25Oct user instruction to implement detailed Math/German5/6 and personal clickable network.

## Global constraints

- Own checkout/branch; sources/ and analysis/ remain read-only. Same task, budget and deploy history (next attempt22).
- Only gradecrew-staging-2026. Never hausaufgabe-staging or hausaufgabe-40294; no unrelated endpoint/rule/IAM changes.
- Preserve legacy parent evidence. Never manufacture child mastery from a parent or helped answer.
- Explicit unassessed / practicing / using-help / demonstrated / review states. Unknown is not failure. Mastery still needs varied independent evidence, not one click or a watched explanation.
- Tool selection is goal-specific, never a mandatory interaction quota. Existing fraction-board/number-line/balance/text-workbench reused.
- Audio listening must genuinely deliver audio without leaking transcript; written planning does not prove speaking, gesture, group discussion or physical instrument use.
- Complete catalogue coverage means every existing 5/6 anchor has meaningful practice and a declared assessment scope, not certified full curriculum/learning effectiveness. Human-observation boundaries remain visible and cannot auto-promote.
- Record all failed generation/review/runtime attempts and genuine API tests. No fake AI fallback.

## Interfaces

Catalogue adds `competencies: Competency[]`, `competencyVersion`, and `coverage56`. Original `topics` remain compatible.

`Competency` extends existing topic fields: `id` (parent ID + stable skill suffix), `parentTopicId`, `title`, `goal`, `subject`, `grade`, `track`, `area`, `source`, `prerequisites: string[]`, `didacticFamily`, `delivery` (`text|visual|listen|speak`), `assessmentScope` (`digital|preparation|human-observation`), `evidenceBoundary`, `learningPlan: {levels:string[4],help:string[3],preferredTool:string}`.

Content module `functions/lib/learning-brain/competencies56.js` exports `buildCompetencies(topics)` returning `{version,competencies,coverage56}`; `coverage56` explicitly lists all113 original anchors and child IDs. Every child has a substantive observable goal. No generic suffix-only variants. Prerequisites reference actual competencies, form a DAG and have a concrete pedagogical rationale.

Backend `network.js` exports `projectNetwork(catalog, topicEvents, sessions, now, context)` and `chooseCompetency(catalog, topicEvents, context, now)`. Profile includes `learningNetwork:{version,nodes,edges,nextTopicId,coverage}`. Node = public competency metadata plus `evidence` (existing projectSkill result), `state`, `recommended`, `active`, and explicit assessment boundary. UI must not need private answers or pupil submissions.

UI can derive the same public network projection from `catalog.competencies` plus `profile.skills` when a legacy endpoint has no projection during rollout. Server projection becomes authoritative when present.

Practice start accepts a competency ID through existing topicId. Starting a legacy parent chooses a relevant child; legacy active sessions resume unchanged. Recommendations filter selected grade/subject; no fabricated cross-grade readiness. Requests cannot choose a foreign owner.

## Work packages and ownership

- [ ] Content worker: only new competencies56.js/data and its tests. Read all113 existing anchors and available didactics/material references; cover Math5/6 and all German areas with detailed practice goals and explicit oral/physical boundaries. Red/green tests: complete parent coverage, no dangling IDs/cycles, no generic duplicate goals, source linkage, 5/6 scope, distinct domain-specific demand/help levels.
- [ ] Backend worker: only service.js/core.js, new network.js, related service/core/network tests. Add durable child routing, evidence-derived network/recommendations, help state and legacy compatibility. Red/green owner/revision/idempotency/unknown-vs-help/no false parent-to-child mastery/context tests. Do not edit catalogue/AI/planning/UI/callables.
- [ ] UI worker: only lerngehirn/app.mjs/model.mjs/styles.css, new network.mjs, their tests, preview allowlist additions only for new UI modules. Build subject/year/area navigation, real clickable node/edge network, accessible list alternative, evidence sidebar and prerequisite/next navigation. Preserve active exercise and 20min controls. No fake sample achievements, edit controls or pupil switch without authorization.
- [ ] Root: integrate catalogue, explicit competency planning/eligibility and real AI prompts, media/visual delivery contracts, callables, source compatibility, existing audio-flow reuse and preview bridge. Extend suitable visual models only where current four tools cannot answer the learning goal. Meaningful TDD and exact math/scene/answer agreement.
- [ ] Review: read actual combined diff, test behavioral and source contracts, repair findings. Existing sources are inspiration/reference, not automatically approved copied runtime content.
- [ ] Verify/deploy: backend and UI checks, curriculum/competency coverage report, deterministic invalid-answer/alternative-answer checks. Real AI samples span all4 subject/year combinations, independent success/harder, repeated errors/simpler help/return, text alternatives, geometry/data and actual listening when supported, current pool reuse and persisted resume. No per-tick API.
- [ ] Browser: show selected5/6 network, click actual competencies, verify evidence after real answers and reload, source/legend/sidebar, keyboard and compact layout. Physical devices remain separate.
- [ ] Save exact sources, deploy receipts and all test/failure scopes in existing handoff/TODO/state. Start with test-only release; ordinary student/classroom pilot remains a separate identity/retention gate.

## Review focus

1. A novice without events is unassessed, never labeled weak or secure.
2. Help, technical rejection and duplicate answers cannot create independent evidence; old parent evidence cannot certify new children.
3. Prerequisites are meaningful and visible without permanent lockout; failed tasks may probe prerequisites rather than loop same level.
4. All113 anchors accounted for, oral/physical group work distinguished from digitally tested preparation; no hidden exclusions to claim completeness.
5. Graph clicks refer to real owner-bound task IDs; selected class/subject and persisted session survive navigation and reload.
6. Audio, diagrams, key and question agree; no transcript/key leak, arbitrary HTML, untrusted final scene state or foreign profile/media access.

## Existing decisions

Use the current runtime and programme, not50 disconnected demos. Grade5/6 first; 7-10 catalogue remains untouched. No additional design approval is required for the already explicitly requested implementation; routine layout and stable skill-ID choices are root decisions within this contract.
