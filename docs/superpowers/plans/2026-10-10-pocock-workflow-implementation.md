# GC-POCOCK-IMPLEMENT-01 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline; independent final review keeps both axes explicit. Steps use checkbox syntax.

**Goal:** Make the authorized existing GradeCrew handoff/review workflow mechanically checkable and demonstrate it on this package.
**Architecture:** Opt-in structured briefs live inside existing workstream Markdown. A read-only stdlib checker follows registry handoff pointers and reports the claimed, unblocked decision frontier. Existing handoff CI runs its behavior tests and validates registered briefs; it dispatches nothing.
**Tech Stack:** Python standard library, existing GitHub Actions handoff workflow, Markdown templates.
**Spec:** User-authorized scope and design brief in `workstreams/pocock-workflow-implementation-20261010.md`; integrated research report supplies recommendations, current project rules bind execution.

## Global Constraints
- Task family GC-POCOCK-RESEARCH-01, subtask GC-POCOCK-IMPLEMENT-01; original attempts/reservations/history preserved.
- Five central chats coordinate only; executable owner is this specialist.
- No production/deployment, paid calls/media/scans, npm inventory export, Security recovery, new controller or automatic skill rewrite.
- Shared START/AGENTS/CHAT_CONTRACT/TODO/STATE/registry belong to this owner. Plugins, Web runtime QA, native Games QA and active Pizza work remain separately owned.
- Validator reads only registered Markdown; no file writes, process dispatch or authority/approval claims.

## Review Focus
- Missing/deleted opt-in brief must fail CI instead of disappearing silently.
- Blank/absent claim cannot become a ready owned decision.
- Unknown dependencies, duplicate IDs and cycles cannot produce a false frontier.
- Running/unknown external results suppress resumption; metadata never proves provider success.
- Traversal/symlink handoff pointers cannot read outside repository workstreams; old unprofiled handoffs remain compatible.

### Task 1: Contract integration
**Files:** `.github/PULL_REQUEST_TEMPLATE.md`, `workstreams/TEMPLATE.md`, `docs/workflow/EXECUTION_BRIEFS.md`, own handoff, START/AGENTS/CHAT_CONTRACT/TODO/STATE/registry.
**Interfaces:** existing registry handoff + optional `checkProfile: workflow-brief-v1`; one fenced `gradecrew-brief` JSON block is authoritative, no new status store.
- [ ] Keep existing contracts and add concise brief, decision, review and retro fields; link canonical guide.
- [ ] Register own subtask, recommendation/owner/evidence matrix, approved exclusions and live source.
- [ ] Self-check source links and preserve all unrelated State/registry/release data; checkpoint.

### Task 2: Read-only checker and CI
**Files:** `tools/workstream_checks.py`, `tools/test_workstream_checks.py`, `.github/workflows/handoff-check.yml`.
**Interfaces:** CLI `--registry PATH`, JSON stdout summary, exit0 valid / exit1 contract errors; root determined by registry `workstreams/` parent.
- [ ] Write subprocess integration tests with hand-authored fixtures for the five review conditions; observe RED (CLI missing, no ready result).
- [ ] Implement strict brief validation, bounded dependency graph and read-only frontier computation.
- [ ] Run new suite GREEN, full existing automation and release-control suites, registry consumer on real handoff; retain logs/fixtures as local evidence.
- [ ] Connect existing handoff CI and its path filters; no new workflow/controller. Commit tested implementation.

### Task 3: Real package pilot and integration
**Files:** own handoff and `docs/workflow/pocock-implementation-retro-20261010.md`; no product files.
**Interfaces:** brief/decision outputs from Task2; independent reviewer returns separate requirements/standards results bound to exact candidate.
- [ ] Apply new brief, decision card, PR format and two review axes to this exact package.
- [ ] Record real session observations: absent local Node, rejected native checkout, bounded path/metadata mistakes; choose one demonstrated missing mechanical check, no global rewrite.
- [ ] Verify a malformed brief is rejected and blocked/unknown operations produce no ready work, no files change; retain candidate SHA/evidence.
- [ ] Independent review, exact current target/CI gates and authorized workflow merge; actual main receipt separately verified.
- [ ] Leave external Web/native QA/Plugin evidence honestly pending until source owners provide it; no duplicate execution or claim all recommendations operationally finished.
