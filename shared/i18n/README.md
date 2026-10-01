# GradeCrew i18n foundation

This directory contains the first isolated internationalization primitives for GradeCrew.

## Current scope

- Active UI locale remains **only `de-DE`**.
- No existing screen is translated or migrated by this foundation.
- No assessment, grading or security behavior is changed automatically.
- The module is intentionally dependency-free and uses platform `Intl` APIs.

## Contracts

`i18n-core.mjs` provides:

- BCP-47 locale canonicalization;
- deterministic UI locale resolution (`user -> school -> device -> default`);
- separate `uiLocale`, `contentLocale` and `gradingLocale` context fields;
- a versioned assessment locale snapshot for reproducibility;
- locale-aware number/date formatting;
- strict number parsing that rejects ambiguous separators instead of silently guessing.

## Safety rules

1. Do not derive assessment language from the UI locale.
2. Do not translate persisted business values/status IDs.
3. Do not use locale fallbacks to silently change assessment content or grading policy.
4. Published/running assessments must keep an immutable locale/policy snapshot.
5. Do not wire new locales into the visible product until the relevant capability has been explicitly verified.
6. Keep `de-DE` behavior unchanged while the foundation is introduced.

## Next integration step

After this isolated core is reviewed, wire it into one low-risk shared UI boundary first (not the entire `app.js`). Add a German message catalog and migrate a small reference surface while preserving identical visible copy. Only after regression tests are green should the migration expand screen by screen.
