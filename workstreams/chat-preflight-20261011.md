# GC-CHAT-PREFLIGHT-01 — Chat Preflight and Rule Freshness

Owner: specialist execution (current task handoff; chat link not available). Linked tasks: GC-HOOKS-01 and GC-MODEL-GOVERNOR-01. Draft PR #203: `feat/gc-chat-preflight-20261011`; this revision is being assembled from `bfa8de0d223cf602b59e545f1b0a90be128627f9`. The PR base is `6833a1d93562a29199183dc90e59f8069286bf6e`; GitHub reported mergeable at the previous head.

## Request

Make policy/tool freshness visible in existing GradeCrew/Games chats before each new prompt, use one clear next-step response tied to actual stage/evidence, and choose model/effort before the call where the caller supports it. Keep old chat histories, attempts, budgets and role assignments intact. Production remains separately authorized.

## Current evidence

- Initial candidate parent was `7eb49b50315b34e25e4af67a46c2addfa575febe`; PR base later advanced to `6833a1d93562a29199183dc90e59f8069286bf6e`.
- Current main `START_HERE.md` blob `85c5de38…`, `AGENTS.md` `e0866436…`, `docs/CHAT_CONTRACT.md` `22f9c252…`, `docs/CHAT_RECOVERY.md` `c2782f94…`, and skill map `4a95aebe…` fetched from the GitHub connector.
- Open PR #184 is still open. Its lifecycle design is reference evidence only; this task does not install or trust it.
- Official OpenAI documentation confirms Codex `UserPromptSubmit` supports context injection or blocking and requires trust for non-managed hooks. The hook input includes `model` but has no documented effort field.
- Official App Server docs and local installed CLI schema confirm an owning caller can pass explicit `model` and `effort` to `turn/start`; `turn/steer` cannot change them. The schema supports `skills/list(forceReload)` and `config/mcpServer/reload`, but no general config reload was found.
- Inference, hooks, trust changes, app database/binary inspection, plugin install, and global config writes: none.

## Candidate files

- `docs/automation/chat-preflight-20261011/capability-matrix.md`
- `docs/automation/chat-preflight-20261011/design.md`
- `tools/chat-preflight/preflight.py`
- `docs/automation/chat-preflight-20261011/hook-profile.template.json`
- `docs/automation/chat-preflight-20261011/qualification-plan.md`
- `.github/workflows/chat-preflight-check.yml`
- `tools/chat-preflight/test_preflight.py`
- `.github/workflows/chat-preflight-check.yml`

The script is an uninstalled candidate and includes a deterministic fake-caller probe. It does not claim the ChatGPT desktop composer is an App Server caller. The Codex hook can inspect freshness and model when present, but effort remains unknown and the hook cannot change either setting. Role remains unresolved even when repository identity proves GradeCrew project scope. A private local profile may allowlist an exact mirror root without `.git`; the committed profile template contains no machine path. A nested foreign checkout stays unknown.

## Local checkpoint

- Offline regression suite: `python3 -B tools/chat-preflight/test_preflight.py` — PASS (5 test methods). It covers per-Enter ETag polling, 304 freshness reset, explicit opt-in TTL, changed main and bounded delta, unknown project/model/effort/role, exact approved mirror and nested foreign checkout, silent unknown/invalid-profile no-op, exact-mirror qualification block without network, concurrent unique atomic cache writes and private permissions, explicit risky action vs plan discussion while offline, explicit model/effort before fake `turn/start`, and stopping when the exact target model/effort is unavailable. No inference.
- Syntax: `PYTHONPYCACHEPREFIX=/tmp/chat-preflight-pycache python3 -m py_compile tools/chat-preflight/preflight.py tools/chat-preflight/test_preflight.py` — PASS.
- Scoped PR CI in `.github/workflows/chat-preflight-check.yml` runs only the offline suite and syntax check with read-only repository access; it does not call GitHub API, models, MCP, or deployment.
- Hygiene scan is rerun for all candidate files before updating the remote review branch.
- Freshness polling defaults to no time-based cache; each covered Enter sends a conditional public pointer request. Positive TTL is opt-in in the private profile. Offline/403/429 checks report the last verification time and remain unverified; there are no retries. A 304 resets a previously cached marker to `current`.
- The hook profile is a template only. The qualification plan uses an isolated block sentinel before model generation; neither the profile nor local root allowlist is installed. ChatGPT Work remains outside local-hook coverage.
- Reviewer corrections: 0-second default TTL and ETag conditional request per Enter; cache freshness is reset after 304; an explicitly approved exact mirror root supports this `.git`-less project mirror, while nested foreign repositories remain unknown. The actual mirror path is private-profile-only and is not committed.
- Delta-review corrections: unknown/unrelated scope and missing/invalid profile produce no hook output; test-only `qualification_mode=block` validates the exact mirror scope and then blocks without cache/network access; concurrent cache writes use unique private temp files and atomic replace in a non-symlink `0700` directory with `0600` files. Model caller stops if its requested target model/effort is not advertised; it never silently uses another default.
- Offline qualification unit tests do not prove Codex runtime loading. `qualification-plan.md` now requires the exact candidate command and source hash under an isolated supported Codex hook source, plus a verified local-only provider so a missed hook cannot reach OpenAI. Runtime qualification remains unperformed.

## Checkout boundary

The local Git transport could not resolve `github.com`; no local clone contains current main. The candidate is assembled through the authorized GitHub connector on `feat/gc-chat-preflight-20261011`, whose starting ref was verified as exact parent `7eb49b50315b34e25e4af67a46c2addfa575febe`. No stale local branch was used and no shared files were edited.

## Status and next action

Candidate branch / draft PR #203 for independent review. The new offline CI workflow is scoped to these candidate paths, read-only, and has no live network, model, secret, MCP, or deploy step. CI/integration, desktop hook activation, staging and production are not claimed. Before future activation, the owner must review/trust the exact command in `/hooks` and qualify the lifecycle using the isolated no-paid sentinel plan. This covers Codex hooks only; ChatGPT Work remains outside local command-hook coverage.
