"""Bounded stage continuation. Only explicit, commit-pinned tasks may invoke AI.

The observer and deploy board remain read-only. This separate controller reserves
an attempt durably before dispatching the existing isolated Codex worker.
It never manufactures acceptance or Production approval.
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
REPO = "HerrLoeffler/Hausaufgabe"
LEDGER_BRANCH = "automation/guardian-state"
LEDGER_PATH = "automation/guardian-ledger.json"
SHA = re.compile(r"[0-9a-f]{40}")
ID = re.compile(r"[a-z0-9][a-z0-9-]{0,79}")
STAGES = ["branch_only", "ci_green", "integrated", "staging_deployed", "user_tested", "production"]
ALLOWED_BASES = {"feature/gradecrew-app-integration", "feature/secure-assessment-v1", "feature/shared-gradecrew-design-system", "lab/games-structure"}


def api(path, method="GET", body=None):
    args = ["gh", "api", f"repos/{REPO}/{path}", "--method", method]
    if body is not None:
        args += ["--input", "-"]
    result = subprocess.run(args, input=json.dumps(body) if body is not None else None,
                            text=True, capture_output=True, timeout=30)
    if result.returncode:
        # Never echo raw provider responses, URLs or credentials in summaries.
        raise RuntimeError(f"GitHub operation failed: {method} {path.split('?')[0]}")
    return json.loads(result.stdout) if result.stdout.strip() else {}


def validate_policy(policy):
    if not isinstance(policy, dict) or policy.get("schemaVersion") != 1:
        raise ValueError("Guardian policy schemaVersion 1 required")
    if type(policy.get("enabled")) is not bool:
        raise ValueError("Explicit enabled boolean required")
    if type(policy.get("maxAttemptsPerStage")) is not int or not 1 <= policy["maxAttemptsPerStage"] <= 3:
        raise ValueError("Attempts must be between 1 and 3")
    if policy.get("automaticProduction") is not False:
        raise ValueError("Automatic Production is forbidden")
    rows = policy.get("workstreams")
    if not isinstance(rows, list):
        raise ValueError("workstreams must be a list")
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or not ID.fullmatch(str(row.get("id", ""))) or row["id"] in seen:
            raise ValueError("Invalid or duplicate workstream")
        seen.add(row["id"])
        if type(row.get("enabled")) is not bool or row.get("baseBranch") not in ALLOWED_BASES:
            raise ValueError("Invalid workstream permission")
        if not SHA.fullmatch(str(row.get("approvedSha", ""))) or not ID.fullmatch(str(row.get("taskId", ""))):
            raise ValueError("Exact approved SHA and task ID required")
        if row.get("maxAutomaticStage") != "staging_deployed":
            raise ValueError("Automatic continuation stops at technical staging")
        if row.get("execution", "legacy-worker") not in {"legacy-worker", "pipeline-v2"}:
            raise ValueError("Unknown execution engine")
        if row.get("execution") == "pipeline-v2" and row["baseBranch"] != "feature/gradecrew-app-integration":
            raise ValueError("Pipeline v2 currently admits only the gated web integration target")
    return policy


def choose(row, stage, ledger, enabled, current_sha):
    """No numeric stage field or AI text may authorize deployment or acceptance."""
    stage_key = f"{row['id']}:{stage}"
    attempts = ledger.get("attempts", {}).get(stage_key, [])
    if not isinstance(attempts, list):
        raise ValueError("Invalid attempt history")
    if stage not in STAGES:
        return "blocked", "Unknown release stage"
    if stage == "production":
        return "complete", "Already released; no autonomous Production action"
    if stage == "user_tested":
        return "await_production_approval", "Explicit Martin approval and promotion gates required"
    if stage == "staging_deployed":
        return "await_user_acceptance", "Real device acceptance must be recorded for exact components"
    if not enabled or not row["enabled"]:
        return "disabled", "Task automation is not activated"
    if current_sha != row["approvedSha"]:
        return "blocked", "Source changed; pinned task must be reviewed before another API call"
    if attempts and attempts[-1].get("state") in {"reserved", "dispatch_unknown", "dispatched"}:
        return "wait", "Existing attempt owns this stage; do not start a duplicate"
    if len(attempts) >= row.get("attemptLimit", 3):
        return "stopped", "Attempt budget exhausted; human diagnosis required"
    if stage == "ci_green":
        return "await_independent_reviews", "Current-SHA independent reviews and merge-result CI required before integration"
    if stage == "integrated":
        return "await_deployment_receipts", "Existing deployment chain must return all required component receipts"
    return "dispatch_worker", "Continue the approved coding task"


def reserve(ledger, row, stage, request_id, limit):
    if not ID.fullmatch(request_id):
        raise ValueError("Invalid request ID")
    result = json.loads(json.dumps(ledger))
    if result.get("schemaVersion") != 1 or not isinstance(result.get("attempts"), dict):
        raise ValueError("Invalid ledger")
    key = f"{row['id']}:{stage}"
    attempts = result["attempts"].setdefault(key, [])
    if any(a.get("requestId") == request_id for rows in result["attempts"].values() for a in rows):
        raise ValueError("Request already reserved")
    if len(attempts) >= limit or (attempts and attempts[-1].get("state") in {"reserved", "dispatch_unknown", "dispatched"}):
        raise ValueError("Stage is busy or attempt limit exhausted")
    attempts.append({"requestId": request_id, "approvedSha": row["approvedSha"], "taskId": row["taskId"],
                     "state": "reserved", "reservedAt": dt.datetime.now(dt.timezone.utc).isoformat()})
    return result


def read_ledger():
    # Check refs first. Permission/network failure must not be mistaken for empty history.
    refs = api("git/matching-refs/heads/" + LEDGER_BRANCH)
    if not any(r.get("ref") == "refs/heads/" + LEDGER_BRANCH for r in refs):
        return {"schemaVersion": 1, "attempts": {}}, None
    data = api(f"contents/{LEDGER_PATH}?ref={quote(LEDGER_BRANCH, safe='')}")
    value = json.loads(base64.b64decode(data["content"]).decode())
    if value.get("schemaVersion") != 1 or not isinstance(value.get("attempts"), dict):
        raise ValueError("Invalid durable attempt ledger")
    return value, data["sha"]


def write_ledger(value, blob_sha):
    # Global workflow concurrency plus contents SHA compare-and-swap guards lost updates.
    if blob_sha is None:
        main = api("git/ref/heads/main")["object"]["sha"]
        api("git/refs", "POST", {"ref": "refs/heads/" + LEDGER_BRANCH, "sha": main})
    body = {"message": "guardian: reserve/update bounded worker attempt", "branch": LEDGER_BRANCH,
            "content": base64.b64encode((json.dumps(value, indent=2) + "\n").encode()).decode()}
    if blob_sha is not None:
        body["sha"] = blob_sha
    return api(f"contents/{LEDGER_PATH}", "PUT", body)["content"]["sha"]


def validate_task(row):
    task = json.loads((ROOT / "agent-queue" / (row["taskId"] + ".json")).read_text())
    if task.get("id") != row["taskId"] or task.get("base_branch") != row["baseBranch"] or task.get("base_sha") != row["approvedSha"]:
        raise ValueError("Task and continuation permission differ")
    for key in ("goal", "acceptance", "constraints"):
        if not isinstance(task.get(key), str) or not 1 <= len(task[key].strip()) <= 16000:
            raise ValueError("Incomplete task contract")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--json-out", default="artifacts/guardian/guardian.json")
    args = parser.parse_args()
    policy = validate_policy(json.loads((ROOT / "automation/guardian-policy.json").read_text()))
    state = json.loads((ROOT / "GRADECREW_STATE.json").read_text())
    stages = {r["id"]: r.get("stage") for r in state.get("workstreams", [])}
    repo = os.getenv("GITHUB_REPOSITORY")
    if repo != REPO:
        raise ValueError("Guardian must run in the configured GradeCrew repository")
    active = policy["enabled"] and os.getenv("GUARDIAN_ENABLED") == "true"
    worker_ready = os.getenv("WORKER_ENABLED") == "true" and os.getenv("WORKER_KEY_PRESENT") == "true"
    ledger, blob_sha = read_ledger()
    report = {"schemaVersion": 1, "enabled": active, "workerReady": worker_ready,
              "automaticProduction": False, "actions": [], "unconfiguredWorkstreams": [],
              "remainingCapabilities": ["publish_worker_patch_as_scoped_PR", "independent_multi_provider_reviews", "gated_integration", "retry_feedback_and_completion_reconciliation"]}
    configured = {r["id"] for r in policy["workstreams"]}
    report["unconfiguredWorkstreams"] = sorted(k for k, v in stages.items() if k not in configured and v in {"branch_only", "ci_green", "integrated"})
    dispatched = False
    for original in policy["workstreams"]:
        if original.get("execution") == "pipeline-v2":
            report["actions"].append({"id": original["id"], "stage": "ledger_owned",
                "action": "execution_controller", "reason": "See execution.json/md: authoritative run, reviews, integration and receipts", "attempts": 0})
            continue
        row = {**original, "attemptLimit": policy["maxAttemptsPerStage"]}
        current = api("git/ref/heads/" + row["baseBranch"])["object"]["sha"]
        stage = stages.get(row["id"], "unknown")
        action, reason = choose(row, stage, ledger, active, current)
        if action == "dispatch_worker" and not worker_ready:
            action, reason = "blocked", "CODEX_WORKER_ENABLED / worker credential not configured"
        if action == "dispatch_worker":
            try:
                validate_task(row)
            except (ValueError, OSError, json.JSONDecodeError):
                action, reason = "blocked", "Pinned queue task is missing or invalid"
        item = {"id": row["id"], "stage": stage, "action": action, "reason": reason,
                "attempts": len(ledger["attempts"].get(f"{row['id']}:{stage}", []))}
        if args.execute and action == "dispatch_worker" and not dispatched:
            # Recheck after planning; a changed branch cannot consume a new attempt.
            if api("git/ref/heads/" + row["baseBranch"])["object"]["sha"] != row["approvedSha"]:
                item.update(action="blocked", reason="Branch changed during planning")
            else:
                request_id = f"run-{os.environ['GITHUB_RUN_ID']}-{os.environ.get('GITHUB_RUN_ATTEMPT', '1')}"
                ledger = reserve(ledger, row, stage, request_id, policy["maxAttemptsPerStage"])
                blob_sha = write_ledger(ledger, blob_sha)
                attempt = ledger["attempts"][f"{row['id']}:{stage}"][-1]
                try:
                    api("actions/workflows/codex-worker.yml/dispatches", "POST", {"ref": "main", "inputs": {"task_id": row["taskId"]}})
                    attempt["state"] = "dispatched"
                    item["action"] = "dispatched"
                except RuntimeError:
                    attempt["state"] = "dispatch_unknown"
                    item.update(action="blocked", reason="Dispatch outcome unknown; reconcile before retry")
                # If this write fails, the durable reservation still prevents double dispatch.
                blob_sha = write_ledger(ledger, blob_sha)
                dispatched = True
        report["actions"].append(item)
    path = Path(args.json_out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    lines = ["# GradeCrew Stage Guardian", "", f"Automation enabled: {active}; worker ready: {worker_ready}", "",
             "| Workstream | Stage | Next action | Attempts | Reason |", "|---|---|---|---|---|"]
    lines += [f"| {r['id']} | {r['stage']} | {r['action']} | {r['attempts']} | {r['reason']} |" for r in report["actions"]]
    lines += ["", "Unconfigured workstreams: " + ", ".join(report["unconfiguredWorkstreams"]), "",
              "Remaining execution capabilities: " + ", ".join(report["remainingCapabilities"]), "",
              "Device acceptance and explicit Production approval remain human gates."]
    markdown = "\n".join(lines) + "\n"
    path.with_suffix(".md").write_text(markdown)
    print(markdown)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
