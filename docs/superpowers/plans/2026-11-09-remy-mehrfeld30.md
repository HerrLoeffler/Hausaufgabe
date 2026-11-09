# Remy Mehrfeld30 Implementation Plan

> **For agentic workers:** Use executing-plans. Task GC-EXTENDED-QUESTION-TYPES-01.

**Goal:** Private staging review for 30 real Remy tasks, plus bounded free wishes.
**Architecture:** Existing isolated Remy worker saves ordinary private drafts. A staging-only callable reads the exact initial quiz IDs or signed-in user's own pilot draft and records version-bound reviews. The preview is a dedicated hosting channel. Reuse existing visual renderer and shared grading for the signed-in teacher preview.
**Spec:** Human approved 30 tasks, free wish, two smileys, staging-only, documented. Fundus: docs/learning/mehrfeld-fundus/README.md.

- [ ] Verify existing worker and synthetic identity. Prepare 8 proportional, 8 inverse, 8 physics and 6 format-selection control cases. Four job IDs, two concurrent at most, no automatic extra jobs. Save outcomes and errors before handling retries. Existing provider access only.
- [ ] Add focused tests for review identity/version binding and staged task projection. Build preview showing one question at a time, next/previous, progress, optional bad reason, and own free-wish job recovery. Keep feedback private and separate from production learning.
- [ ] Verify the exact receipt before deploying the one pilot callable and dedicated Hosting preview. Reopen a review as synthetic account, verify progress and score persistence, document actual coverage, jobs, provider usage and limitations.

**Review focus:** Authentication before private read, no arbitrary cross-owner draft IDs, stale content cannot inherit ratings, reload uses stable job IDs, initial counter cases kept distinct from normal tasks, no public answer keys.
