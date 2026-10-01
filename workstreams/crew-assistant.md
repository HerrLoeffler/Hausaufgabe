# Crew Assistant V1 handoff

Task: `GC-CREW-AI-01`

## Scope

Build the first GradeCrew Crew Assistant foundation so authenticated teachers can talk to Coco, Remy, Emmi and Wilma through one shared assistant layer. Clear/repeating requests should be resolved locally when safe; open requests fall back to a server-side AI call. Remy can prepare the existing AI test form without starting generation automatically.

## Branch and base

- Branch: `feature/crew-assistant-v1`
- Base: `feature/gradecrew-app-integration` at `74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Production: unchanged
- Staging: not deployed from this branch

## Implemented in this draft

- `crew-assistant-core.js`
  - shared metadata for Coco, Remy, Emmi and Wilma
  - curated zero-API replies for greetings, capabilities, privacy and API-cost questions
  - deterministic parsing of common test requests into partial form patches
  - explicit delegation to AI only when the local layer cannot safely resolve the request
- `crew-assistant-ui.js`
  - teacher-only floating `Crew fragen` launcher
  - selectable conversations with all four Crew members
  - text input and progressive-enhancement push-to-dictate button
  - local replies are marked as requiring no AI call
  - AI fallback calls Firebase `crewAssistant`
  - `patch_ai_form` opens the real existing GradeCrew AI form and changes only recognized fields
  - generation is never started automatically
  - browser chat history is session-memory only; raw chat is not written to localStorage
- `functions/lib/crew-assistant.js`
  - four server personas on one shared contract
  - strict JSON schema
  - V1 actions restricted to `none` and `patch_ai_form`
  - destructive/publish/share/result-changing actions explicitly forbidden
  - `cacheCandidate` only marks context-free recurring answers for later human curation
- `functions/main.js`
  - additive Firebase entrypoint that preserves all existing exports from `index.js` and adds `crewAssistant`
  - avoids risky edits to the large existing AI generation module
- dedicated assistant API quota and existing private AI usage metadata path
  - raw messages are not added to usage events
  - stored metadata: Crew member, normalized intent, action type, token usage, cache-candidate flag
- isolated branch CI workflow for Crew Assistant checks

## Cost strategy

1. Local deterministic command parser first.
2. Curated common-response catalog second.
3. AI fallback only for unresolved/open requests.
4. AI responses are never blindly cached for reuse.
5. Server may set `cacheCandidate=true` only for generic context-free answers; repeated intent metadata can later be reviewed and promoted into the curated local catalog.
6. No raw teacher chat is stored merely to build the cache.

## Voice status

The V1 UI includes a push-to-dictate progressive enhancement using the browser speech-recognition capability when present. This is not the final cross-browser voice architecture. The planned production path remains explicit microphone capture -> controlled speech-to-text -> same Crew Assistant core. There is no wake-word/background listening in V1.

## Safety / privacy boundaries

- Teacher/admin AI access only, reusing current `requireAiUser` policy.
- No student-facing Crew Assistant in this V1.
- UI warns not to enter personal student data.
- Minimized screen/form context only is sent to the assistant.
- AI requests use the existing server-side OpenAI secret path and `store:false`.
- No production deploy and no automatic irreversible actions.

## Validation

- Browser-core tests: `crew-assistant-core.test.mjs`
- Server-contract tests: `functions/test/crew-assistant.test.js`
- Branch CI: `.github/workflows/crew-assistant-check.yml`
- First CI runs found parser/test edge cases; these are being fixed before the workstream is called green.

## Next steps after green CI

1. Staging-only deploy of web + `crewAssistant` function after explicit review/coordination.
2. Authenticated desktop/mobile visual smoke test.
3. Replace browser-dependent dictation with controlled STT transport.
4. Add context-aware Emmi editor actions and Wilma result-reading actions behind explicit permission/safety rules.
5. Add reviewed intent-frequency reporting/admin promotion flow for curated zero-API responses.
6. Build native iOS App Intents/Siri adapter on the same action contract.

## Do not do

- Do not deploy this branch to production.
- Do not auto-cache AI replies containing user/test context.
- Do not store raw audio by default.
- Do not let assistant output directly publish, delete, share, or grade real submissions without a separately designed confirmation/authorization flow.
