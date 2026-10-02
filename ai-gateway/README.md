# GradeCrew AI Gateway

Status: **staging-only, branch prototype**. Production is not changed by this work.

This service is the isolated server-side entry point for multiple AI providers. Anthropic/Claude authenticates through Google Cloud -> Anthropic Workload Identity Federation (WIF), so no long-lived Anthropic key is stored. OpenAI uses GradeCrew's existing staging Secret Manager secret and the Responses API; the key is never committed, printed or copied into a deploy command.

## Current endpoints

- `GET /health` — process/config health only; no external AI call.
- `GET /providers` — configured providers and supported GradeCrew job names.
- `POST /providers/anthropic/test` — tiny Claude smoke request (`GATEWAY_OK`).
- `POST /providers/openai/test` — tiny OpenAI smoke request (`GATEWAY_OK`).
- `POST /v1/generate` — explicit provider text generation while automatic routing is disabled.
- `POST /v1/route` — signed quality/budget router from the orchestration branch; it remains unusable until the required policy/runtime dependencies are deliberately configured.

Example explicit request:

```json
{
  "provider": "openai",
  "job": "question_rewriting",
  "messages": [{"role": "user", "content": "Formuliere diese Aufgabe klarer ..."}],
  "max_tokens": 300
}
```

## Provider safety model

Provider choice and model choice are separate controls. Every runtime provider has a model allowlist. The default staging allowlists contain only the already selected inexpensive baseline models:

- Anthropic: `claude-haiku-4-5`
- OpenAI: `gpt-5.6-luna` (same text model currently used by GradeCrew's existing OpenAI functions)

A caller cannot request a more expensive model unless an operator first expands the relevant environment allowlist. Automatic routing still requires signed, scope-bound quality evidence and its own budget policy; adding a model to an allowlist does **not** qualify it for routing.

OpenAI is text-only in this first gateway adapter. Image/audio capability is intentionally fail-closed until its own request contract, privacy boundary and tests exist.

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

2. `deploy-staging.sh` mounts the secret as `OPENAI_API_KEY` through Cloud Run Secret Manager integration. The script refuses a shell-exported `OPENAI_API_KEY`.

Optional runtime metadata:

- `OPENAI_DEFAULT_MODEL` (default `gpt-5.6-luna`)
- `OPENAI_ALLOWED_MODELS` (comma-separated; default is only the default model)
- `OPENAI_BASE_URL` (default `https://api.openai.com`)
- `OPENAI_PROJECT_ID` / `OPENAI_ORGANIZATION_ID` if the OpenAI account requires explicit headers

The adapter uses `POST /v1/responses` with `store:false`, normalizes text/status/token usage to the gateway contract and never logs provider payloads, prompts or keys.

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

Claude is already end-to-end verified on the deployed base gateway. This OpenAI-provider branch is **not deployed yet** and makes no Production change.

## Local checks

```bash
cd ai-gateway
npm test
npm run check
bash -n deploy-staging.sh setup-openai-secret-access.sh
```

Tests use fake HTTP responses and make no paid provider calls.

## Safety / telemetry boundary

The service logs only request ID, provider, model, GradeCrew job kind, latency and token counts. It does not intentionally log prompts, uploaded materials, student answers, provider error payloads or access tokens. Cloud Run IAM remains the outer access boundary; browser-facing access still requires a GradeCrew role-checking proxy.

OpenAI cached tokens are accounted as a subset of `input_tokens`, so the cost layer subtracts cached input from regular input before applying the cheaper cache-read price. Missing/invalid usage remains unknown rather than being treated as zero cost.

## Next providers

Gemini and Mistral should implement the same normalized provider interface. Provider quality is never guessed in code. Controlled benchmark evidence per job/model/scope must exist before the automatic router can select a candidate.
