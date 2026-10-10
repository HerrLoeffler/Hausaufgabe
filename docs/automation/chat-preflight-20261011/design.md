# GC-CHAT-PREFLIGHT-01 implementation design

## Goal

For a covered GradeCrew/Games Codex prompt, check a compact authoritative policy version before every model call. If main has changed, compare a small set of governing files and supply a short bounded delta. Keep the project stage, evidence, and one actionable next step clear. Do not restore full chat history, load all TODO items, or broadcast into old conversations.

## Freshness hook

The candidate `UserPromptSubmit` command receives the hook's JSON event. It recognizes only a checkout whose canonical Git origin is exactly `github.com/HerrLoeffler/Hausaufgabe` and whose `cwd` resolves inside that checkout. It ignores session IDs and chat names for role assignment. For any other or incomplete identity it emits no GradeCrew instructions and reports `project=unknown` only in the offline probe.

For a recognized project it checks a shared private local cache first. A main pointer verified within five minutes is reused and explicitly labeled `cached-verified`; otherwise the hook makes one small unauthenticated request to the public GitHub API. It sends no prompt or private workspace data. When the pointer is unchanged, it injects a short “checked within the last five minutes” line. It downloads the five small rule files only after the main SHA changes, then stores their content, hashes, and pointer-check time in a host temp cache. On change it uses a bounded diff (maximum 1,800 characters) to expose the relevant policy delta. The governed set is START_HERE, AGENTS, CHAT_CONTRACT, CHAT_RECOVERY and the execution skill map; TODO, full transcripts and unrelated project files are excluded. This avoids turning many chats into one unauthenticated API request per Enter, while stating the age of the evidence.

When an expired cache cannot be refreshed (including offline or rate-limited API responses), the hook says it could only see the cached commit and freshness is unverified. It does not block ordinary prompts or requests to discuss a risky plan. The candidate blocks only an imperative, explicit production deployment/release/publish or destructive repository action when policy freshness is unknown or the newest policy text cannot be read. It never blocks merely because the observed model is high or because the model/effort field is absent. This heuristic is a narrow hook guard, not an authorization system; role remains unresolved.

The hook’s `model` input is recorded as a current model slug only when present. The documented payload has no reasoning-effort field, so effort remains `unknown`. The hook cannot change either value. It never claims a global default equals a chat’s selected model.

If one of the governing files changes, the hook injects a short reminder to reload the changed authoritative section and re-resolve any affected skill/tool. There is no documented way for this hook to mutate the current chat’s MCP or skill catalog. Use App Server `skills/list(forceReload)` or `config/mcpServer/reload` only from a client that owns that App Server operation; do not call the refresh “active desktop chat updated” without direct evidence.

## Model preflight caller

The separate deterministic fake caller models a client that owns the App Server request. It reads `model/list`, chooses an available model and supported effort from an explicit task class, and passes both in `turn/start`. Routine starts at Luna/medium; cross-area work at Sol/medium; difficult work at Sol/high only with a stated reason. If the needed combination is unavailable, it uses the catalog’s explicitly advertised default with a supported effort and labels it as a new requested choice, or it stops before `turn/start` when the catalog has no usable choice. It never calls a missing current model “default” or “observed.”

This proves ordering and schema behavior for a client under our control. It does not establish that the ChatGPT desktop composer uses the same App Server API or that a hook can alter that composer’s selection. Actual runtime model/effort remain unknown unless the response exposes telemetry that identifies the actual values.

## Role and next-step response

Repository origin can establish GradeCrew project scope; it cannot establish whether the current participant is one of the five coordinators or a specialist. The hook therefore does not inherit role restrictions from `session_id`, a fork, or a chat title. A coordinator-only guard requires a separate authenticated, explicit role binding before enforcement is safe. Until then the hook asks the agent to identify the actual project stage from evidence and name one concrete next autonomous step; if the work is already authorized, it should continue that step.

## Release boundary

This is an implementation candidate only. No `~/.codex` hook/config file is changed, no hook trust is bypassed, no plugin is installed, and no app database or binary is accessed. A qualified owner must review/trust the command in the Desktop hook UI and verify an idle specialist chat before activation. Coverage outside the documented Codex runtime remains unverified.
