# GradeCrew i18n

This directory contains the shared internationalization boundary for the GradeCrew web surfaces.

## Current scope

- Active browser UI locales are **`de-DE`** and **`en-GB`**.
- German remains the canonical source language for the legacy DOM/runtime strings.
- UI language, assessment/content language and grading language are separate contexts.
- A UI-language switch must never translate or mutate persisted assessment content, student answers, names or teacher-authored content.
- Assessment content language is stored per test and is passed explicitly to AI generation/revision.
- The runtime remains dependency-free and uses platform `Intl` APIs for locale-sensitive formatting.

## Main modules

- `i18n-core.mjs`: locale canonicalization, context contracts, snapshots, number/date formatting and strict number parsing.
- `browser-runtime.mjs`: DE/EN UI switching, persistence, protected-content boundaries, dynamic DOM/attribute localization and native dialog localization.
- `messages-de-DE.mjs` / `messages-en-GB.mjs`: browser UI catalogs.
- `assessment-locale.mjs`: content-/grading-locale contract and AI content-language instruction.
- `assessment-locale-ui.mjs`: explicit per-test language controls. Changing the test language does **not** translate existing questions or solutions.

## Safety rules

1. Never derive assessment language from the UI locale.
2. Never translate persisted business values/status IDs.
3. Never use a UI-locale fallback to change assessment content or grading policy.
4. A published/running test must not silently change its assessment language.
5. UI language changes must be reversible and must preserve protected/user-authored content byte-for-byte.
6. German behavior remains first-class; English is additive.
7. Adding a third language requires a fresh capability review of browser UI, non-DOM output, validators, assessment semantics, accessibility and any game/native surfaces.

## Current limitations / follow-ups

The English UI is active, but not every non-DOM or language-sensitive subsystem is automatically internationalized. Keep `NON_DOM_INVENTORY.md` current. In particular, CSV/PDF/export copy, language-specific validators, games and native shells require their own locale-aware implementations rather than DOM translation.

Dynamic UI strings created by legacy JavaScript must be covered by the English source catalog/patterns and regression tests. New UI code should prefer semantic keys instead of adding more source-string translation debt.
