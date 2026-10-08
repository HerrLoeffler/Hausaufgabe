# GradeCrew AI Gateway

Status: **staging-only, branch prototype**. Production is not changed by this work.

This service is the isolated server-side entry point for multiple AI providers. The first implemented provider is Anthropic/Claude using Google Cloud -> Anthropic Workload Identity Federation (WIF), so no long-lived Anthropic API key is stored in GradeCrew.

## Current endpoints

- `GET /health` — process/config health only; does not call an external AI provider.
- `GET /providers` — configured providers and supported GradeCrew job names.
- `POST /providers/anthropic/test` — tiny Claude smoke request (`GATEWAY_OK`).
- `POST /v1/generate` — normalized text generation request. Provider must currently be selected explicitly; automatic provider routing is intentionally not enabled until GradeCrew has benchmark evidence.

Example body:

```json
{
  "provider": "anthropic",
  "job": "question_rewriting",
  "messages": [{"role": "user", "content": "Formuliere diese Aufgabe klarer ..."}],
  "max_tokens": 300
}
```

## Anthropic WIF configuration

Required Cloud Run environment variables (IDs, not API secrets):

- `ANTHROPIC_FEDERATION_RULE_ID`
- `ANTHROPIC_ORGANIZATION_ID`
- `ANTHROPIC_SERVICE_ACCOUNT_ID`
- `ANTHROPIC_WORKSPACE_ID` (recommended; required if the rule spans more than one workspace)

Optional:

- `ANTHROPIC_DEFAULT_MODEL` (staging default in code: `claude-haiku-4-5`)
- `ANTHROPIC_AUDIENCE` (default: `https://api.anthropic.com`)
- `ANTHROPIC_BASE_URL` (default: `https://api.anthropic.com`)

Do **not** set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` on this workload. The gateway requests a Google-signed identity token from the Cloud Run metadata server, exchanges it at Anthropic `/v1/oauth/token`, caches the short-lived Anthropic bearer token until shortly before expiry, and then calls `/v1/messages`.

## Cloud Run target

Manually created staging scaffold:

- project: `hausaufgabe-staging`
- service: `gradecrew-ai-gateway-staging`
- region: `europe-west1`
- service account: `gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com`
- authentication: required (IAM)
- min instances: `0`
- max instances: `2`
- desired concurrency for the real gateway revision: `5`

The currently created Cloud Run revision still runs Google's example `hello` container. It is **not** evidence that this branch code is deployed.

## Local checks

```bash
cd ai-gateway
npm test
npm run check
```

The unit tests use fake HTTP responses and do not call Claude or Google metadata.

## Safety / telemetry boundary

The service logs only request ID, provider, model, GradeCrew job kind, latency and token usage. It does not intentionally log prompts, uploaded materials, student answers or provider access tokens. Cloud Run IAM remains the outer access boundary; application-level caller authorization will be added before existing GradeCrew functions are routed through this service.

## Next providers

OpenAI, Gemini and Mistral should implement the same normalized provider interface. Provider quality is not guessed in code. GradeCrew will first collect controlled benchmark results per job, model, latency, cost and validation outcome; automatic routing comes only after that evidence exists.
