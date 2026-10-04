# Mistral gateway provider v1

Status: feature branch implementation. Staging only.

## Done
- Mistral PAYG account is user-configured with a monthly overage spending cap.
- `MISTRAL_API_KEY` exists in Google Secret Manager for `hausaufgabe-staging`.
- The dedicated gateway runtime service account has accessor permission on that secret.
- Provider adapter uses `POST /v1/chat/completions`, pinned `mistral-small-2603`, standard service tier, model allowlist and normalized usage.
- Real smoke endpoint is `POST /providers/mistral/test`.
- Staging workflow mounts the secret only into the runtime revision and requires Claude, OpenAI, Gemini and Mistral smokes before promotion.
- Production and the current GradeCrew generation path are unchanged.
- Automatic routing remains disabled.

## Deployment guard fix
The previous Gemini integration run passed all verification gates but stopped in preflight because the checker incorrectly rejected a revision that had a Cloud Run traffic tag while still owning 100% of normal traffic. The checker now accepts exactly one revision owning all 100% traffic regardless of tag, while still rejecting split traffic. This is covered by tests.

## Baseline model
`mistral-small-2603` (Mistral Small 4) is intentionally pinned instead of using a moving `latest` alias. More expensive models stay blocked until benchmark evidence and an explicit allowlist change exist.

## Still required before claiming staging-live
1. Feature CI green.
2. Merge into `integration/ai-gateway-staging`.
3. Automatic candidate deploy succeeds.
4. Real Claude/OpenAI/Gemini/Mistral `GATEWAY_OK` smoke tests all pass.
5. Exact tested revision is promoted and final base health is green.
6. Deployment receipt artifact exists.

Prompt caching remains out of this baseline so four-provider latency/cost measurements are comparable.
