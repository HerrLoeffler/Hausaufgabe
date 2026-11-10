# GC-CHAT-PREFLIGHT-01 capability matrix

Evidence checked 2026-10-11 against official OpenAI documentation and the installed Codex CLI protocol schema. This is a capability finding, not a claim that a hook is installed or active in existing chats.

| Capability | Codex runtime evidence | Ordinary ChatGPT desktop chats | Safe conclusion |
| --- | --- | --- | --- |
| Synchronous prompt preflight | `UserPromptSubmit` is a documented Codex hook. It receives `cwd`, `hook_event_name`, `model`, `permission_mode`, `prompt`, `session_id`, `transcript_path`, and `turn_id`; it can add `additionalContext` or return `decision=block`. `matcher` is ignored for this event. A non-managed hook must be reviewed and trusted by exact current hook hash in `/hooks`. | OpenAI documents Codex app agents sharing configuration with CLI/IDE. ChatGPT Work chats run managed and do not read local Codex config; command hooks are unsupported with Work Cloud orchestration. | Candidate applies only to Codex runtimes that load the configured hook. It does not cover every ordinary ChatGPT Work/Desktop surface. |
| Model visibility in hook input | The common hook input documents an active `model` slug. | Not established for every desktop surface. | Report the field when present; otherwise model is `unknown`. |
| Effort visibility or mutation in hook | No reasoning-effort field is documented for hook input; hook output only adds context/blocks. | Not established. | Effort is `unknown`; never infer it from a global default. A hook cannot select the model or effort. |
| Select model/effort before generation | App Server `turn/start` documents explicit `model` and `effort`; installed local protocol schema also contains both. | The native composer’s internal request path is not established by the public docs. | A caller that owns `turn/start` can select both before its request. This does not prove the Desktop composer is that caller. |
| Change an active turn | App Server `turn/steer` explicitly has no turn-level model/effort override. | Not established. | Do not describe hooks or steer as a model switch for an active request. |
| Refresh skill listing | Installed protocol supports `skills/list` with `forceReload`; `skills/changed` says a client should rerun `skills/list`. | No documented hook-to-current-chat refresh bridge found. | Supported for an App Server client that owns the call. A hook can only tell the model that freshness needs review. |
| Refresh MCP servers | Installed protocol has `config/mcpServer/reload`. | No documented hook-to-current-chat refresh bridge found. | App Server capability exists, but it does not prove that an installed hook can refresh the current desktop session’s tool catalog. Refresh only when needed. |
| Reload general config | Installed protocol exposes config read/write and MCP-server reload; no general config reload operation was found in the generated schema. | No documented native config reload path found. | Do not claim config reload or changed settings in an already-open chat. |
| Share updates with old chats | A user-level Codex hook can run on each new prompt when loaded and trusted. The candidate sends one conditional main-pointer request per Enter and fetches the five governed files only when the SHA changes. | No local-hook configuration coverage for ChatGPT Work. No historic chat broadcast or hot reload guarantee. | Existing covered Codex chats can receive current policy context on their next prompt. ETag reduces response bytes, not request count. |
| Rate limits and failed verification | GitHub `If-None-Match` may return 304, which still counts as a request. | Same runtime caveat. | Default pointer TTL is zero to honor per-Enter freshness. A user may explicitly set a bounded positive TTL in the local profile; offline/403/429 never become “current,” include last verified time, and cause no automatic retry. |
| Identify project/role | Hook input includes `cwd`, `session_id`, and active `model`; `session_id` is not a reliable fork/role key. | ChatGPT project identity is not present in the documented hook event. | Accept canonical repository origin or an exact absolute root explicitly listed in a private local profile for a mirror without `.git`. A nested foreign checkout stays unknown. Project identity never establishes coordinator/specialist role. |
| Unknown scope behavior | A user-level hook may run for prompts outside a particular project. | No GradeCrew identity is established without an exact repo or explicit mirror-root match. | Unknown/malformed identity, or missing/invalid local profile, is a silent no-op: no cache access and no GradeCrew `additionalContext`/block. |

## Sources

- Official OpenAI Hooks: <https://learn.chatgpt.com/docs/hooks> — hook locations and trust, event timing, hook input/output, `UserPromptSubmit`, and limitations.
- Official OpenAI Advanced Configuration: <https://learn.chatgpt.com/docs/config-file/config-advanced> — user/project hook locations and project trust.
- Official OpenAI Developer Settings: <https://learn.chatgpt.com/docs/developer-settings> — Codex app configuration sharing and ChatGPT Work’s managed configuration boundary.
- Official OpenAI Codex App Server: <https://learn.chatgpt.com/docs/app-server> — `model/list`, `turn/start`, `turn/steer`, skill input and configuration methods.
- Local installed CLI evidence: `codex --help`, `codex app-server --help`, and `codex app-server generate-json-schema --out /tmp/gc-chat-preflight-schema` on the installed ChatGPT.app Codex CLI. The generated schema included `turn/start`, `skills/list` (`forceReload`), `skills/changed`, `config/mcpServer/reload`, config read/write. No inference was run.

## Main-source identity

GitHub reports current main as `7eb49b50315b34e25e4af67a46c2addfa575febe`. Policy-file content SHAs fetched from main:

| File | GitHub blob SHA |
| --- | --- |
| `START_HERE.md` | `85c5de38da633c864c1452169c2140c63a78ac40` |
| `AGENTS.md` | `e0866436984d981f3de1231ce80122dca4c96680` |
| `docs/CHAT_CONTRACT.md` | `22f9c252c8f27156db5a9deaf74cbfc67a700444` |
| `docs/CHAT_RECOVERY.md` | `c2782f94dd3ff64931a7681b412acbe03b48936b` |
| `docs/skills/GRADECREW_EXECUTION_SKILLS.md` | `4a95aebe03948e80cd1b383de44fd26392315886` |

Those values are a recorded baseline, not a live claim. The hook candidate below queries the public `main` commit pointer conditionally on each covered prompt and fetches policy text only when it changes. If the network is unavailable or rate-limited, it reports the cached commit and verification time and marks freshness unverified. Only explicit imperative high-impact actions are blocked on unverified/stale rules; discussion and ordinary prompts continue with a short warning.
