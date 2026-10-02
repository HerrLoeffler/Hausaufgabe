# GradeCrew AI Gateway

Status: **staging-only multi-provider gateway**. Production and GradeCrew's current direct OpenAI generation path are not changed by this work.

This service is the isolated server-side entry point for multiple AI providers. Anthropic/Claude authenticates through Google Cloud -> Anthropic Workload Identity Federation (WIF), so no long-lived Anthropic key is stored. OpenAI uses GradeCrew's existing staging Secret Manager secret and the Responses API. Gemini uses Vertex AI with the existing Cloud Run runtime service account, so no Gemini API key or additional secret is created.

## Current endpoints

- `GET /health` — process/config health only; no external AI call.
- `GET /providers` — configured providers and supported GradeCrew job names.
- `POST /providers/anthropic/test` — tiny Claude smoke request (`GATEWAY_OK`).
- `POST /providers/openai/test` — tiny OpenAI smoke request (`GATEWAY_OK`).
- `POST /providers/gemini/test` — tiny Gemini smoke request (`GATEWAY_OK`).
- `POST /v1/generate` — explicit provider text generation while automatic routing is disabled.
- `POST /v1/route` — signed quality/budget router; it remains unusable until the required policy/runtime dependencies are deliberately configured.

Example explicit request:

```json
{
  "provider": "gemini",
  "job": "question_rewriting",
  "messages": [{"role": "user", "content": "Formuliere diese Aufgabe klarer ..."}],
  "max_tokens": 300,
  "reasoning_effort": "minimal"
}
```

## Provider safety model

Provider choice and model choice are separate controls. Every runtime provider has a model allowlist. The default staging allowlists contain only inexpensive baseline models:

- Anthropic: `claude-haiku-4-5`
- OpenAI: `gpt-5.6-luna`
- Gemini: `gemini-3.5-flash-lite`

A caller cannot request a more expensive model unless an operator first expands the relevant environment allowlist. Automatic routing still requires signed, scope-bound quality evidence and its own budget policy; adding a model to an allowlist does **not** qualify it for routing.

OpenAI and Gemini are text-only in their first gateway adapters. Image/audio capability is intentionally fail-closed until its own request contract, privacy boundary and tests exist.

## Anthropic WIF configuration

Required Cloud Run environment variables (IDs, not API secrets):

- `ANTHROPIC_FEDERATION_RULE_ID`
- `ANTHROPIC_ORGANIZATION_ID`
- `ANTHROPIC_SERVICE_ACCOUNT_ID`
- `ANTHROPIC_WORKSPACE_ID`

Optional:

- `ANTHROPIC_DEFAULT_MODEL` (default `claude-haiku-4-5`)
- `ANTHROPIC_ALLOWED_MODELS` (comma-separated; default is only the default model)
- `ANTHROPIC_AUDIENCE` (default `https://api.anthropic.com`)
- `ANTHROPIC_BASE_URL` (default `https://api.anthropic.com`)

Do **not** set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` on this workload. The gateway requests a Google-signed identity token from the Cloud Run metadata server, exchanges it at Anthropic `/v1/oauth/token`, caches the short-lived bearer token until shortly before expiry, and calls `/v1/messages`.

## OpenAI configuration

The existing staging secret is reused; no new key is needed.

1. Once, grant the dedicated gateway runtime service account access to this one secret only:

   ```bash
   bash ai-gateway/setup-openai-secret-access.sh
   ```

2. Cloud Run mounts the secret as `OPENAI_API_KEY` through Secret Manager integration. Manual deploys refuse a shell-exported `OPENAI_API_KEY`.

Optional runtime metadata:

- `OPENAI_DEFAULT_MODEL` (default `gpt-5.6-luna`)
- `OPENAI_ALLOWED_MODELS` (comma-separated; default is only the default model)
- `OPENAI_BASE_URL` (default `https://api.openai.com`)
- `OPENAI_PROJECT_ID` / `OPENAI_ORGANIZATION_ID` if the OpenAI account requires explicit headers

The adapter uses `POST /v1/responses` with `store:false`, normalizes text/status/token usage to the gateway contract and never logs provider payloads, prompts or keys.

## Gemini / Vertex AI configuration

Gemini is deliberately keyless. One staging-only bootstrap enables Vertex AI and gives the existing gateway runtime identity the minimal model invocation role:

```bash
bash tools/automation/setup-staging-gemini-access.sh
```

Runtime variables:

- `GEMINI_ENABLED=true` — explicit opt-in
- `GEMINI_PROJECT_ID=hausaufgabe-staging`
- `GEMINI_LOCATION=eu` — EU multi-region endpoint and processing
- `GEMINI_DEFAULT_MODEL=gemini-3.5-flash-lite`
- `GEMINI_ALLOWED_MODELS=gemini-3.5-flash-lite`

The adapter obtains short-lived OAuth access tokens from the Google metadata server using the Cloud Run runtime service account. It calls Vertex AI `generateContent` through the EU multi-region endpoint, maps the shared `reasoning_effort` contract to Gemini `thinkingLevel`, normalizes usage including cached/thinking tokens, and never logs provider payloads or access tokens. Gemini 3.x manages sampling automatically, so custom temperature values are validated for the shared contract but are not forwarded to Vertex AI.

## Cloud Run target

Staging target:

- project: `hausaufgabe-staging`
- service: `gradecrew-ai-gateway-staging`
- region: `europe-west1`
- service account: `gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com`
- authentication: required (IAM)
- min instances: `0`
- max instances: `2`
- concurrency: `5`

The automatic staging workflow deploys a candidate revision with zero normal traffic. It promotes only after `/health`, provider listing, and real Claude/OpenAI/Gemini smoke calls all pass. The existing rollback and stale-source guards remain active.

## Local checks

```bash
cd ai-gateway
npm test
npm run check
bash -n deploy-staging.sh setup-openai-secret-access.sh ../tools/automation/setup-staging-gemini-access.sh
```

Tests use fake HTTP responses and make no paid provider calls.

## Safety / telemetry boundary

The service logs only request ID, provider, model, GradeCrew job kind, latency and token counts. It does not intentionally log prompts, uploaded materials, student answers, provider error payloads or access tokens. Cloud Run IAM remains the outer access boundary; browser-facing access still requires a GradeCrew role-checking proxy.

Cached input tokens are normalized where providers expose them so later cost accounting can price cache reads separately. Missing/invalid usage remains unknown rather than being treated as zero cost.

## Next provider work

Mistral can implement the same normalized provider interface. Provider quality is never guessed in code. Controlled benchmark evidence per job/model/scope must exist before the automatic router can select any candidate. Prompt-caching optimization should be benchmarked after the provider baseline is stable so cost/latency comparisons remain interpretable.
