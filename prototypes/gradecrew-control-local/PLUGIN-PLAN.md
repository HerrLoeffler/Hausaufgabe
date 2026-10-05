# GradeCrew Central Plugin Implementation Plan

> Execution: existing isolated GC-BRAIN-01 checkout; inline implementation with two independent final reviewers per AGENTS.md. User explicitly requested building the previously proposed integration on 06.10.2026.

**Goal:** Installable local MCP plugin with task overview and a persistent question → current chat → answer workflow.
**Spec:** CENTRAL-STRATEGY.md; first vertical slice only. No product-code dispatch, no model switching or paid inference. Cloud execution remains separate.
**Architecture:** Existing localhost service remains the single writer of the existing state. Stdio MCP adapter exposes task snapshots, durable questions and model-only answers. Self-contained MCP App uses the documented ui/* bridge, declares global/thread entrypoints. No external scripts, credentials or model API. Portable plugin manifest plus local marketplace installation.

## Constraints and acceptance
- Preserve original task IDs, comments, drafts and release evidence. Answering a question cannot change a release stage.
- Read-only task selection is context, not authorization. Explicit question send persists before host message; timeout must not silently repeat a message.
- Function, application and operational responsibility are separate filter dimensions; classification is a suggestion, not product-status evidence.
- One local server serializes writes for app and plugin. Older server is detected, not silently treated as compatible.
- Local snapshot has source date; no claim of automatic GitHub refresh or Mac-off execution.

## Tasks
- [x] 1. Durable questions in server.mjs and test/plugin.test.mjs: test missing task, duplicate key, changed duplicate, restart, answer replay/conflict and unchanged release stage. Observe failing test; implement endpoints; rerun existing tests.
- [x] 2. plugin/mcp.mjs and plugin/client.mjs: expose gradecrew_open, gradecrew_task, gradecrew_question, gradecrew_answer, list resources and serve self-contained UI. Test stdio initialization, unknown method, visibility, resource and real tool roundtrip. No arbitrary executable/path/URL accepted as input.
- [x] 3. plugin/ui.html plus bridge/view modules: responsive overview, filters, task detail, questions/results, explicit send and visible unavailable/uncertain outcomes. Verify with simulated MCP host; actual host test separate. No CUA policy bypass.
- [x] 4. plugin.json/mcp.json, launcher and marketplace: validate schemas and install using supported CLI; verify installed status. Document any reload/host availability requirement accurately.
- [x] 5. Freeze candidate, two independent read-only reviews, bounded repairs if needed. Save exact test evidence, install outcome, TODO/handoff and remote checkpoint; no production deployment.

## Review focus
Duplicate submissions; stale task revisions; lost host acknowledgement; concurrent panels; persisted hostile text rendered as text. Each has a behavioral test in task 1–3. Fresh reviews must assess this candidate, not earlier architecture notes.

## Ledger
Baseline: 3/3 existing tests passed with local-port permission. Latest development audit 37387706779 / job 112025093083 successful; warned about unrelated unclassified branches and differing PR targets. Existing isolated prototype branch reused, no overlapping product files. Network documentation read through approved escalation. Initial sandbox listen EPERM was environmental, not a product test failure.

Review repair attempt 1/3: both reviewers independently reproduced lost draft text and replay after unknown delivery on 5e8ba5d. Correctness review additionally identified permanently cached service readiness. Added per-task composers, only-new-request host sending, persistent in-view uncertainty lock, fresh keys after acknowledged sends, safe read-only answer polling and noncached liveness. Regression harness failed four assertions before fix, then passed six; connection retry/coalescing test added. No paid calls or budget resets.

Review repair attempt 2/3: both final reviewers reproduced overly broad uncertainty lock on explicit pre-save409. Propagate HTTP status through MCP error results; only confirmed4xx before host delivery permits correction, while unknown persistence/host delivery remains locked. Added regression for stale-source rejection preserving editable draft.

Final reviews: both cleared immutable0897050. Installed0.2.2 and tested its real launcher/read/resource roundtrip. Actual host UI acceptance remains separate and open. See PLUGIN-VERIFICATION.md.
