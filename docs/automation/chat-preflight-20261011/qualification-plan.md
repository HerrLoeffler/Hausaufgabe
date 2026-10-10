# Candidate hook lifecycle qualification (no paid inference)

Qualification is limited to a separate Codex CLI process. It cannot establish that the Desktop composer uses the same caller or that every old chat loads this hook. No global hook source, shared `HOME`/Codex state, user auth, session, or trust record is reused.

## Supported isolation and provider

The official Codex environment-variable documentation says `CODEX_HOME` selects the root for config and state and that the directory must exist. The official CLI documents `--oss`, `--local-provider ollama`, and `--no-daemon`; together these select a local provider and bypass the shared app-server daemon. Use a newly created empty temporary Codex root, never the existing user root; do not copy `config.toml`, `auth.json`, plugin data, trust state, or credentials into it. Set `CODEX_HOME` only in the isolated child process with a task-specific temporary path variable. Keep the current parent environment and shared Codex state unchanged.

Run a fake Ollama-compatible HTTP stub bound only to `127.0.0.1:11434`. The stub returns fixed metadata and a fixed response and records only method/path counters, never the request body. The sole provider override is the documented local Ollama provider. Do not configure an OpenAI provider or API key. If the hook fails to load, times out, or emits invalid output, the only possible generation request must be to this loopback stub; any request to another host invalidates the qualification. A verified local-only endpoint is a hard prerequisite.

## Isolated hook source and exact test scope

Place the candidate command in the new temporary Codex root's `hooks.json`, using the template's supported `UserPromptSubmit` handler fields. Point it to the exact reviewed candidate script and private profile. This is a separate temporary user-level source, not the user's active source. The profile must contain one exact, existing, `.git`-less test mirror root, `pointer_cache_ttl_seconds: 0`, and `qualification_mode: "block"`. The test mode blocks only when the prompt CWD resolves exactly to that one root and Git returns its explicit “not a git repository” result. A detected repository, Git executable failure, timeout, or ambiguous Git error returns no hook output. A canonical checkout, nested directory, unrelated scope, malformed profile, or missing profile also returns no hook output. It never reads the cache or contacts GitHub in qualification mode.

The exact hook command is:

```text
python3 /ABSOLUTE/CANDIDATE/PATH/tools/chat-preflight/preflight.py --profile /ABSOLUTE/PRIVATE/PATH/qualification-profile.json
```

Example child-process launch (all paths are private temporary paths):

```text
env CODEX_HOME="$gcProbeCodexRoot" codex --oss --local-provider ollama --no-daemon --model gc-preflight-fake -C "$gcProbeWorkspace"
```

The `$gcProbeCodexRoot` directory must be newly created and empty before the test; `hooks.json` is its only installed source. The workspace is the exact private test mirror root in the profile and contains no `.git`. Review and trust only the current exact hook definition in the supported `/hooks` UI. Never use `--dangerously-bypass-hook-trust`. If trust review cannot be completed in this isolated root, stop without sending a prompt.

Send one synthetic prompt. Pass Stage A only if the actual candidate command is shown as loaded/invoked by Codex, Codex accepts its `UserPromptSubmit` block JSON, the candidate source/profile hashes match the receipt, and the loopback provider's inference endpoint counter remains zero. The hook event's `model` field may be recorded only if the runtime exposes it through supported output; `effort` remains unknown because the event schema does not document it. If no loaded/invoked receipt is available, report runtime qualification as unverified.

## What this does not prove

Stage A proves hook source/command/schema behavior for this isolated Codex CLI version and exact test mirror. Because `qualification_mode` returns the block before cache reads, it does **not** qualify ordinary freshness context, changed-main deltas, GitHub failures, or per-Enter semantics through the live hook. Those behaviors remain covered only by deterministic fake-fetch offline tests. The App Server fake caller separately proves explicit model/effort ordering for a caller it owns; it is not evidence of native composer model switching.

ChatGPT Work does not use local Codex hooks. No Desktop-wide or historical-chat guarantee follows from this test. Record only Codex CLI version/surface, script SHA-256, profile schema/hash, hook definition hash, test-root description without its host path, loaded/invoked result, output decision, provider endpoint counters, and the hook model slug if actually exposed. Do not retain prompt text, request body, transcript, secrets, response content, auth state, or model response. Remove only the temporary Codex root, fake server, profile, and test mirror after preserving the small redacted receipt; do not touch shared user state.

## Official references

- [Codex Hooks](https://learn.chatgpt.com/docs/hooks) — hook event schema and exact-definition trust review.
- [Codex environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables) — `CODEX_HOME` isolation.
- [Codex developer commands](https://learn.chatgpt.com/docs/developer-commands) — `--oss`, `--local-provider`, and `--no-daemon` CLI options.
- [Ollama chat API](https://docs.ollama.com/api/chat) — local stub request/response shape.
