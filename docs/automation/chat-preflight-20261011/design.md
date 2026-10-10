# GC-CHAT-PREFLIGHT-01 implementation design

## Goal

For a covered GradeCrew/Games Codex prompt, check a compact authoritative policy version before every model call. If main has changed, compare a small set of governing files and supply a short bounded delta. Keep the project stage, evidence, and one actionable next step clear. Do not restore full chat history, load all TODO items, or broadcast into old conversations.

## Freshness hook

The candidate `UserPromptSubmit` command receives the hook's JSON event. It recognizes only a checkout whose canonical Git origin is exactly `github.com/HerrLoeffler/Hausaufgabe` and whose `cwd` resolves inside that checkout. It ignores session IDs and chat names for role assignment. For any other or incomplete identity it emits no GradeCrew instructions and reports `project=unknown` only in the offline probe.

For a recognized project it makes one conditional public GitHub main-pointer request on every Enter. The request includes `If-None-Match` when a cached ETag exists; a 304 confirms the cached commit without downloading the body. ETag saves bytes, not rate-limit quota. The default profile TTL is zero to preserve the user's per-Enter freshness requirement. A positive TTL can only be set explicitly in the user's private profile and is reflected as `cached-verified`, not `current`. The request sends no prompt, private workspace data, or credentials. It downloads the five governed files only after the main SHA changes, then stores their content and hashes in a host temp cache. On change it uses a bounded diff (maximum 1,800 characters) to expose the relevant policy delta. TODO, full transcripts and unrelated files are excluded.

When a pointer request or policy-file read fails (offline, 403, 429, timeout), the hook reports freshness as unverified and includes the last successful verification time when available. It reports a bounded `Retry-After` hint for 429 but never retries automatically. It does not block ordinary prompts or requests to discuss a risky plan. The candidate blocks only an imperative, explicit production deployment/release/publish or destructive repository action when policy freshness is unknown or the newest policy text cannot be read. It never blocks because model/effort is absent. This heuristic is a narrow hook guard, not an authorization system; role remains unresolved.

### Hook profile and exact scope

`hook-profile.template.json` is a review template for a user-level `~/.codex/hooks.json` source. Its command calls a manually installed copy of the reviewed script under `~/.codex/hooks/` and a separate local profile. `UserPromptSubmit.matcher` is intentionally omitted because the event ignores matchers. The handler timeout is bounded. The actual hook definition must be inspected and trusted by its current hash in `/hooks`; edits invalidate that trust. Project-scoped `<repo>/.codex/hooks.json` would require that project layer to be trusted and is not appropriate for the ChatGPT project mirror without `.git`.

The separate private profile defaults to `approved_project_roots: []` and `pointer_cache_ttl_seconds: 0`. An owner may explicitly add the exact absolute root of a known local project mirror to that private allowlist. The public PR/template contains no machine username or absolute path. If the current mirror path changes, it becomes unknown until the local profile is reviewed. A nested foreign checkout does not inherit the outer mirror scope. Repository checkouts still require the exact canonical `HerrLoeffler/Hausaufgabe` origin.

The hook’s `model` input is recorded as a current model slug only when present. The documented payload has no reasoning-effort field, so effort remains `unknown`. The hook cannot change either value. It never claims a global default equals a chat’s selected model.

If one of the governing files changes, the hook injects a short reminder to reload the changed authoritative section and re-resolve any affected skill/tool. There is no documented way for this hook to mutate the current chat’s MCP or skill catalog. Use App Server `skills/list(forceReload)` or `config/mcpServer/reload` only from a client that owns that App Server operation; do not call the refresh “active desktop chat updated” without direct evidence.

## Model preflight caller

The separate deterministic fake caller models a client that owns the App Server request. It reads `model/list`, chooses an available model and supported effort from an explicit task class, and passes both in `turn/start`. Routine starts at Luna/medium; cross-area work at Sol/medium; difficult work at Sol/high only with a stated reason. If the needed combination is unavailable, it uses the catalog’s explicitly advertised default with a supported effort and labels it as a new requested choice, or it stops before `turn/start` when the catalog has no usable choice. It never calls a missing current model “default” or “observed.”

This proves ordering and schema behavior for a client under our control. It does not establish that the ChatGPT desktop composer uses the same App Server API or that a hook can alter that composer’s selection. Actual runtime model/effort remain unknown unless the response exposes telemetry that identifies the actual values.

## Role and next-step response

Repository origin can establish GradeCrew project scope; it cannot establish whether the current participant is one of the five coordinators or a specialist. The hook therefore does not inherit role restrictions from `session_id`, a fork, or a chat title. A coordinator-only guard requires a separate authenticated, explicit role binding before enforcement is safe. Until then the hook asks the agent to identify the actual project stage from evidence and name one concrete next autonomous step; if the work is already authorized, it should continue that step.

## Release boundary

This is an implementation candidate only. No `~/.codex` hook/config file is changed, no hook trust is bypassed, no plugin is installed, and no app database or binary is accessed. ChatGPT Work does not read local Codex hooks. A qualified owner must review/trust the exact command in the Codex hook UI and perform an isolated no-paid-call lifecycle qualification before any wider activation. This qualification itself is not included in the PR.
