# GC-SCHOOL-EXPORT-20261028: isolated school export prototype

Goal: make one synthetic pupil's marked work reviewable and downloadable from the existing teacher results view, with a machine-readable record and an audit trail for later manual changes.

Scope: staging-only, teacher-owned quiz and class; no production, real pupil data, external AI, or DMS connection. The export is a technical demonstration, not a school-approved archive.

Design:
- A narrow Assessment callable verifies authenticated active teacher, quiz ownership, and classroom binding server-side. It reads one consistent export snapshot in a Firestore transaction and returns a versioned JSON record with explicit gaps for absent historical fields and private media bytes.
- Manual review goes through a separate callable transaction. It validates points against frozen question maxima, records who/when/reason and before/after in a server-only event collection, and treats repeated operation IDs idempotently. Existing public submission fields remain the current result projection.
- The browser places “Arbeit exportieren” by each result and calls only the staging endpoint. It creates a readable PDF and a self-contained ZIP with JSON, manifest, and media. Local re-read and SHA-256 verification provide a technical receipt. No public download URL or storage bucket is used.
- The client offers a local synthetic preview through the existing GradeCrew results UI. Never expose this control on production.

Steps:
1. [x] Add failing focused tests for authorization, classroom scoping, idempotent correction/undo, export history and integrity/missing-data statements.
2. [x] Implement staging-only service and callable, use Firestore's default denial for private event subcollections, connect review save and export button without reshaping grading UI.
3. [x] Build/export deterministic PDF and ZIP, inspect rendered PDF and re-open package/hash locally.
4. [x] Run focused tests and integration checks; create an isolated local preview, Draft-PR #374, and handoff with exact evidence and remaining gates. Remote preview remains open. Wilma writer reconciliation blocks merge.

Coordination: Wilma owns parallel grading work. Keep changes in new modules and minimal result-view hooks; reconcile against Wilma's merged patch before PR. No full staging Hosting or Functions deployment that could remove `/wilma/`.
