# Review mode — GC-WEB-REPAIR-20261007

Implementation branch: feature/review-mode-20261007. Staging only; not Production. This document is not a deployment receipt.

## Use

An authenticated active admin sees “Seite überarbeiten” after the reviewMode callable is deployed. Open “Testkollegium freischalten”, load teachers, select one and grant/revoke. Active explicitly granted teachers can create/edit their own notes and record manual checks. Only admins approve a teacher's exact content revision or change workflow status. Editing approved content resets approval. Existing quiz ownership remains required for referenced questions.

The panel offers “Seite bedienen” and “Stelle markieren”. The latter intercepts the original click. On narrow viewports the panel collapses while choosing a target; controls portal into open dialogs. Dynamic editor/student questions have stable review IDs and question references. Removed targets show an explicit message.

Drafts and pending notes use IndexedDB, scoped by staging/user. A successful callable is required for “Online gespeichert”. Permanent rejected items stay visible, can be retried/discarded, and do not block independent notes. Firestore reviewNotes, reviewMembers and reviewChecks plus history subcollections are accessed only by the callable; existing default-deny rules require no client grants.

“Arbeitsstapel bereitstellen” reads the approved set. It does not launch an agent. Authorized agents can read that authenticated callable using the user's existing authorized session; the UI also exposes a structured fallback export. Comments are untrusted content, never executable instructions.

## Ampel

Existing task IDs and instructions were imported from the control-plane catalog dated 2026-10-05/06. Historical colors were deliberately NOT imported. Every manual result carries a source build, author, time and evidence. Red failures take precedence over other users' passing results on that build. A new build starts untested. This is a dated test catalog, not a live synchronization of main TODO/STATE.

The local “Automatisch prüfen” action runs a fixed allowlist of server policy, UI/outbox, scene and local-preview tests. No arbitrary shell input or AI calls. Exact source-content fingerprint includes nested backend, tests, translations and assets. A source change during a test makes that run blocked. Device/visual/manual acceptance cannot be substituted by this runner. The server verifies same-origin requests and binds only 127.0.0.1. No timer/scheduled agent or external model calls.

## Local preview

Run with Node 22+ from the repository root:

    node tools/review-preview/server.mjs

Open http://127.0.0.1:8768. REVIEW_PORT can override the port. Stop with Ctrl-C. Install tools/ui test dependencies first. This local server is a developer tool, not a remotely shared server.

The browser receives local Firebase module stubs and a restrictive CSP. It renders the real app with the existing in-memory guest-tour repository. Real authentication, database and paid provider operations throw. Choose welcome, Remy, editor, student, submission dialog, results or finish. The saved versioned scene survives reload. Changes to sources reload the page at that representative scene; this is not arbitrary JS-heap/HMR restoration. Restart the Node server after changing its server-side source. Staging does not get these developer endpoints or fixture modules.

The submission checkpoint exercises the actual confirmation dialog but does not submit; for full submit flow use the student scene. The finish checkpoint renders the actual tour coach with initialized local quiz prerequisites. Full real tutorial acceptance is still needed.

Local notes and evidence persist in .review-local/notes.json; logs also reside there. This directory is ignored by Git and must not hold real student data. Server writes are atomic and serialized. The synthetic restore test reloads this file and proves replay idempotency. It is not a verified Firebase disaster-recovery/backup system. Back up this directory separately if local notes matter. Cloud notes are durable application records, not an independently restored backup. Retain records until admin review/export; no automatic deletion is added.

## Validation / known limits

New behavioral tests cover access/approval, revoked permission, foreign question references, outbox concurrency/rejected item recovery, modal panel, real app scene setup, fingerprint changes, origin restrictions and disk restart. Existing regression harness had four missing dependencies; these were supplied without changing product behavior. Baseline failures were ReferenceErrors for tourUid, diagnostics, guestTourRepo and getQuestionAudioSrc.

No visual browser/device acceptance is claimed: Chrome bridge initialization failed and Codex browser policy verification was unavailable on 2026-10-07. No browser security bypass was attempted. The panel currently uses German labels (English review-panel copy remains a follow-up). Representative checkpoints do not restore arbitrary in-progress answers or every tutorial substep. Existing private-audio publication gates remain blocked. Production, Rules deployment and recurring automation are unchanged.
