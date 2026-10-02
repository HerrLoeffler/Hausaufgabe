# Gemini gateway provider v1

## Scope
Add Google Gemini as the third real provider behind the GradeCrew staging AI gateway without changing Production, the legacy GradeCrew generation path, or automatic routing.

## Base
- Integration branch checked before work: `integration/ai-gateway-staging`
- Base commit: `479e2fa9f682c5eaef4e33292cd33c94d56943dc`
- Feature branch: `feature/gemini-gateway-provider-v1`

## Decisions
- Use Vertex AI with the Cloud Run runtime service account. No Gemini API key or new secret is introduced.
- Default model: `gemini-3.5-flash-lite` only. More expensive Gemini models remain blocked until benchmark evidence justifies adding them to the allowlist.
- Default processing location: `eu` multi-region.
- Text-only gateway capability in v1. Multimodal support is deliberately deferred so provider baseline tests compare like with like.
- Gemini is explicit opt-in through `GEMINI_ENABLED=true` and a project ID.
- Shared `reasoning_effort` maps to Gemini `thinkingLevel`; custom Gemini 3.x sampling values are not forwarded.
- Provider-specific errors never include provider payloads, prompts, tokens, or credentials.

## Safety
- Current GradeCrew task generation remains on the existing direct OpenAI/Firebase path.
- `GC_AUTOMATIC_ROUTING` is not enabled by this work.
- Candidate Cloud Run revision receives zero normal traffic until Anthropic, OpenAI, and Gemini smoke tests all return `GATEWAY_OK`.
- Existing rollback and stale-source guards remain intact.
- Production project `hausaufgabe-40294` is not targeted.

## One-time staging bootstrap
`tools/automation/setup-staging-gemini-access.sh` enables the Vertex AI API in `hausaufgabe-staging` and grants only `roles/aiplatform.user` to the existing gateway runtime service account. It creates no API key and grants no Production role.

## Verification required before integration
- Node syntax and unit tests
- Existing intelligence and evaluation tests
- Firestore emulator budget/transaction checks
- Container build
- One-time Gemini access bootstrap in staging
- Automated zero-traffic candidate deployment
- `/health` shows Anthropic, OpenAI, Gemini configured
- `/providers` lists all three
- Anthropic smoke: `GATEWAY_OK`
- OpenAI smoke: `GATEWAY_OK`
- Gemini smoke: `GATEWAY_OK`
- Only then promote candidate to normal staging traffic

## Not done by this branch
- No legacy generation cutover
- No automatic routing activation
- No Production deploy
- No Gemini image/audio/video input yet
- No Claude prompt-caching rollout yet; keep baseline provider comparison clean first
