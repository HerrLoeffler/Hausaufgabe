# Crew Assistant V1 handoff

Task: `GC-CREW-AI-01`

## Scope

First GradeCrew assistant foundation for Coco, Remy, Emmi and Wilma. Clear/repeating requests are resolved locally when safe; open requests fall back to a server-side AI call. Remy can prepare the existing AI test form without starting generation automatically.

## Branch and evidence

- Branch: `feature/crew-assistant-v1`
- Base: `feature/gradecrew-app-integration` at `74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Green implementation head: `c21b7b83afb6844be6f5dcae7fea05def0123437`
- Green CI: GitHub Actions run `36927353069`
- Handoff-only follow-up commit on branch: `fce4156ba0e5758330746e992a505f22716221b5`
- Production unchanged
- Staging not deployed from this branch
- No real-device confirmation yet

## Implemented

- Shared Crew core with Coco, Remy, Emmi and Wilma.
- Curated zero-API answers for common questions plus deterministic parsing of common test requests.
- Teacher-only `Crew fragen` panel with animal selection, text input and first push-to-dictate progressive enhancement.
- `patch_ai_form` opens and patches the real GradeCrew AI form without auto-starting generation.
- Server-side `crewAssistant` Firebase callable with strict structured output and V1 actions limited to `none` / `patch_ai_form`.
- Dedicated assistant quota; AI usage events store token/intent/action/cache-candidate metadata, not raw chat text.
- AI may mark generic replies as `cacheCandidate`; no AI reply is blindly reused across users. Repeated generic intents can later be reviewed and promoted into the local catalog.
- Browser-core tests, server-contract tests, Functions syntax and ESLint are green in run `36927353069`.

## Voice status

V1 has push-to-dictate only where the browser exposes speech recognition. This is not the final voice architecture. Planned production path: explicit microphone capture -> controlled speech-to-text -> same Crew Assistant core. No wake-word/background listening is active.

## Next steps

1. Staging-only deploy of web + `crewAssistant` after coordination.
2. Authenticated desktop/mobile visual smoke test.
3. Replace browser-dependent dictation with controlled STT transport.
4. Add context-aware Emmi editor actions and Wilma result-reading actions with explicit safety/permission rules.
5. Add reviewed intent-frequency reporting/admin promotion flow for zero-API standard answers.
6. Build native iOS App Intents/Siri adapter on the same action contract.

## Do not do

- Do not deploy this branch to production without explicit approval.
- Do not auto-cache AI replies containing user/test context.
- Do not store raw audio by default.
- Do not let assistant output directly publish, delete, share or grade real submissions without a separately designed confirmation/authorization flow.
