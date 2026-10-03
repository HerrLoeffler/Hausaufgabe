#!/usr/bin/env python3
"""Generate the GradeCrew Release Control / acceptance board.

Read-only control plane: product inventory + manual acceptance + live Git/GitHub
release evidence. Manual results are bound to the exact tested target SHA.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import io
import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request
import zipfile
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
# Preserve the existing `python tools/release_control.py` entry point while
# importing the shared trusted execution evidence helpers.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
CATALOG = ROOT / "release-control" / "catalog.json"
ACCEPTANCE = ROOT / "release-control" / "acceptance.json"
STATE = ROOT / "GRADECREW_STATE.json"
REGISTRY = ROOT / "workstreams" / "registry.json"
STAGES = ["branch_only", "ci_green", "integrated", "staging_deployed", "user_tested", "production"]
STAGE_RANK = {stage: index for index, stage in enumerate(STAGES)}
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
REPO = "HerrLoeffler/Hausaufgabe"
WEB_BRANCH = "feature/gradecrew-app-integration"
DEPLOYMENTS = {
    "hosting": ("Automatic staging preview", "staging-preview.yml", "workflow_run", "main", "verified-preview-receipt", "receipt.json"),
    "functions": ("Automatic staging AI functions", "staging-functions.yml", "workflow_run", "main", "staging-functions-receipt-", "staging-functions-receipt.json"),
    "gateway": ("Automatic staging AI gateway", "staging-ai-gateway.yml", None, "integration/ai-gateway-staging", "staging-ai-gateway-receipt-", "staging-ai-gateway-receipt.json"),
}


def load_json(path: pathlib.Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def git(*args: str) -> str:
    proc = subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=True)
    if proc.returncode:
        raise RuntimeError(proc.stderr.strip() or f"git {' '.join(args)} failed")
    return proc.stdout.strip()


def ref_exists(ref: str) -> bool:
    return subprocess.run(["git", "show-ref", "--verify", "--quiet", ref], cwd=ROOT).returncode == 0


def ref_sha(branch: str) -> str | None:
    for ref in (f"refs/remotes/origin/{branch}", f"refs/heads/{branch}"):
        if ref_exists(ref):
            return git("rev-parse", ref)
    return None


def short(value: str | None) -> str:
    return value[:10] if value else "–"


def gh_request(url: str) -> Any:
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not token:
        raise RuntimeError("GITHUB_TOKEN fehlt")
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "gradecrew-release-control",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def github_runs(max_pages: int = 8) -> list[dict[str, Any]]:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not repo or not os.getenv("GITHUB_TOKEN", "").strip():
        return []
    rows: list[dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        payload = gh_request(f"https://api.github.com/repos/{repo}/actions/runs?per_page=100&page={page}")
        batch = list(payload.get("workflow_runs", []))
        rows.extend(batch)
        if len(batch) < 100:
            break
    return rows


def find_ci_run(runs: list[dict[str, Any]], name: str, branch: str, sha: str | None) -> dict[str, Any] | None:
    if not sha:
        return None
    for run in runs:
        if name == "AI Staging Checks" and branch == WEB_BRANCH and run.get("name") == "Guardian integrated checks":
            # Explicit dispatch is necessary for GITHUB_TOKEN integrations.
            # Read the durable task binding and the real CI artifact; neither
            # run title nor an arbitrary workflow_dispatch SHA is sufficient.
            try:
                from tools.automation.guardian import read_ledger
                from tools.automation.deployment_evidence import artifact_document, verify_ci
                ledger, _ = read_ledger()
                matches = [a for rows in ledger["attempts"].values() for a in rows
                           if run.get("display_title") == "Guardian integrated " + a.get("requestId", "")
                           and a.get("integratedSha") == sha]
                if len(matches) != 1:
                    continue
                attempt = matches[0]
                if (run.get("path") != ".github/workflows/guardian-integrated-ci.yml"
                        or run.get("event") != "workflow_dispatch" or run.get("head_branch") != "main"
                        or run.get("head_sha") != attempt.get("ciControlSha", attempt["controlSha"])
                        or run.get("head_repository", {}).get("full_name") != REPO):
                    continue
                conclusion = run.get("conclusion") if run.get("status") == "completed" else None
                if conclusion == "success":
                    report = artifact_document(run["id"], "guardian-integrated-evidence", "integrated-ci.json")
                    verify_ci(run, report, attempt)
                return {"runId": run["id"], "conclusion": conclusion, "url": run.get("html_url"), "origin": "guardian_exact_tree"}
            except (ValueError, RuntimeError, KeyError, OSError):
                return {"runId": run.get("id"), "conclusion": "evidence_missing", "url": run.get("html_url")}
        if (
            run.get("name") == name
            and run.get("head_branch") == branch
            and run.get("head_sha") == sha
            and run.get("event") == "push"
        ):
            return {"runId": run.get("id"), "conclusion": run.get("conclusion") if run.get("status") == "completed" else None, "url": run.get("html_url")}
    return None


def automation_status() -> dict[str, Any]:
    """Read-only execution/cost visibility; never starts or repairs an agent."""
    status: dict[str, Any] = {"available": False, "tasks": [], "productionAutomatic": False}
    if not os.getenv("GITHUB_TOKEN"):
        status["reason"] = "Kein GitHub-Nachweis verfügbar"
        return status
    try:
        from tools.automation.guardian import read_ledger, validate_policy
        from tools.automation.pipeline import MODELS
        policy = validate_policy(load_json(ROOT / "automation/guardian-policy.json"))
        ledger, _ = read_ledger()
        history = [a for rows in ledger["attempts"].values() for a in rows if a.get("execution") == "pipeline-v2"]
        status.update(available=True, policyEnabled=policy["enabled"],
            configuredTasks=sum(r.get("execution") == "pipeline-v2" for r in policy["workstreams"]),
            reservedUsd=round(sum(r.get("reservedUsd", 0) for r in ledger.get("budgetReservations", [])), 6),
            knownEstimatedUsd=round(sum(r.get("estimatedUsd", 0) for r in history), 6),
            modelAssignments={role: {"provider": spec["provider"], "model": spec["model"]} for role, spec in MODELS.items()},
            automaticModelSwitch=False,
            tasks=[{"taskId": a["taskId"], "requestId": a["requestId"], "state": a["state"], "runId": a.get("runId"),
                    "sha": a.get("integratedSha"), "reason": a.get("deployReason") or a.get("reason"),
                    "estimatedUsd": a.get("estimatedUsd")} for a in history])
    except (ValueError, RuntimeError, KeyError, OSError):
        status["reason"] = "Ausführungsnachweis fehlt/ist ungültig; keine automatische Freigabe"
    return status


def receipt_document(artifact: dict[str, Any], filename: str) -> dict[str, Any]:
    """Read one small JSON document, never extract an archive or forward tokens ourselves.

    Uses the same authenticated gh transport as the existing archive workflow.
    SHA256 verifies downloaded bytes against GitHub's artifact metadata.
    """
    artifact_id = artifact.get("id")
    size = artifact.get("size_in_bytes")
    if type(artifact_id) is not int or type(size) is not int or not 0 < size <= 1024 * 1024:
        raise ValueError("Invalid or oversized receipt artifact")
    data = subprocess.check_output(
        ["gh", "api", f"repos/{REPO}/actions/artifacts/{artifact_id}/zip"],
        timeout=30, stderr=subprocess.DEVNULL,
    )
    if len(data) > 1024 * 1024 or artifact.get("digest") != "sha256:" + hashlib.sha256(data).hexdigest():
        raise ValueError("Receipt artifact digest differs")
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) != 1 or entries[0].filename != filename or entries[0].file_size > 65536:
            raise ValueError("Unexpected receipt archive contents")
        receipt = json.loads(archive.read(entries[0]))
    if not isinstance(receipt, dict):
        raise ValueError("Receipt must be an object")
    return receipt


def validate_receipt(kind: str, receipt: dict[str, Any], run: dict[str, Any]) -> str:
    sha = receipt.get("commit")
    if not isinstance(sha, str) or not SHA_RE.fullmatch(sha) or receipt.get("project") != "hausaufgabe-staging":
        raise ValueError("Wrong receipt project or commit")
    if kind == "hosting":
        if (receipt.get("channel") != "gradecrew-app-integration"
                or str(receipt.get("ci_run")) != str(run["id"])
                or type(receipt.get("verified_files")) is not int or receipt["verified_files"] < 1
                or not re.fullmatch(r"https://hausaufgabe-staging--gradecrew-app-integration-[a-z0-9]+\.web\.app", str(receipt.get("url")))):
            raise ValueError("Hosting receipt target or verification differs")
    else:
        expected_branch = WEB_BRANCH if kind == "functions" else "integration/ai-gateway-staging"
        if receipt.get("productionChanged") is not False or receipt.get("integrationBranch") != expected_branch:
            raise ValueError("Wrong deployment scope")
        if kind == "functions":
            required = {"crewAssistant", "reviseWholeTest", "recordCrewTelemetry", "getCrewTelemetrySummary", "cleanupCrewTelemetry"}
            if (receipt.get("scope") != "functions:ai" or receipt.get("workflowRun") != run["id"]
                    or receipt.get("firestoreRulesChanged") is not False
                    or not required.issubset(receipt.get("verifiedFunctions", []))
                    or type(receipt.get("upstreamCiRun")) is not int):
                raise ValueError("Incomplete Functions verification")
        elif (receipt.get("service") != "gradecrew-ai-gateway-staging" or sha != run.get("head_sha")
                or not receipt.get("promotedRevision")
                or receipt.get("candidateSmoke", {}).get("health") is not True
                or any(receipt.get("candidateSmoke", {}).get(p, {}).get("ok") is not True for p in ("claude", "openai"))):
            raise ValueError("Incomplete gateway promotion verification")
    return sha


def latest_deployment(runs: list[dict[str, Any]], kind: str, warnings: list[str]) -> dict[str, Any] | None:
    """Latest trusted attempt only: never hide a newer failed/partial deployment."""
    name, path, event, branch, prefix, filename = DEPLOYMENTS[kind]
    relevant = [r for r in runs if r.get("path") == ".github/workflows/" + path
                and r.get("name") == name and r.get("head_branch") == branch
                and r.get("event") in ({event} if event else {"push", "workflow_dispatch"})
                and r.get("repository", {}).get("full_name") == REPO
                and r.get("head_repository", {}).get("full_name") == REPO]
    if not relevant:
        warnings.append(f"{kind}: kein vertrauenswürdiger Deploy-Lauf im abgefragten Zeitfenster.")
        return None
    run = max(relevant, key=lambda r: (r.get("run_number", 0), r.get("run_attempt", 0)))
    if run.get("status") != "completed" or run.get("conclusion") != "success":
        warnings.append(f"{kind}: neuester Deploy-Lauf {run['id']} ist {run.get('conclusion') or run.get('status')}; aktueller Stand unbestätigt.")
        return None
    try:
        payload = gh_request(f"https://api.github.com/repos/{REPO}/actions/runs/{run['id']}/artifacts?per_page=100")
        matches = [a for a in payload.get("artifacts", []) if not a.get("expired")
                   and (a.get("name") == prefix if kind == "hosting" else re.fullmatch(re.escape(prefix) + r"[0-9a-f]{40}", str(a.get("name"))))]
        if len(matches) != 1:
            raise ValueError("Missing or ambiguous deployment receipt")
        artifact = matches[0]
        receipt = receipt_document(artifact, filename)
        sha = validate_receipt(kind, receipt, run)
        if kind != "hosting" and artifact["name"] != prefix + sha:
            raise ValueError("Artifact name and receipt commit differ")
        return {"commit": sha, "runId": run["id"], "url": run.get("html_url"), "artifactId": artifact["id"],
                "evidence": "validated_receipt", "receipt": receipt}
    except (ValueError, TypeError, OSError, subprocess.SubprocessError, urllib.error.URLError, zipfile.BadZipFile) as exc:
        warnings.append(f"{kind}: Receipt von Run {run['id']} nicht verifiziert ({type(exc).__name__}).")
        return None


def verified_preview_snapshot(sha: str | None) -> dict[str, Any] | None:
    """Preview archive tags are created only after a verified preview receipt."""
    if not sha:
        return None
    tag = f"preview-snapshot-{sha}"
    if ref_exists(f"refs/tags/{tag}"):
        return {"commit": sha, "tag": tag, "evidence": "verified_preview_snapshot_tag"}
    return None


def workstream_maps(state: dict[str, Any], registry: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    state_map = {str(row.get("id")): row for row in state.get("workstreams", []) if row.get("id")}
    registry_map = {str(row.get("id")): row for row in registry.get("workstreams", []) if row.get("id")}
    return state_map, registry_map


def registry_stage(value: str) -> str | None:
    return {"integrated": "integrated", "integration_ready": "ci_green", "active": "branch_only", "blocked": "branch_only", "archive_candidate": None}.get(value)


def source_stage(ws_id: str, state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> tuple[str | None, str | None]:
    row = state_map.get(ws_id)
    if row:
        return str(row.get("stage") or "") or None, str(row.get("staging") or "") or None
    row = registry_map.get(ws_id)
    if row:
        return registry_stage(str(row.get("state") or "")), None
    return None, None


def feature_stage(ids: list[str], state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> tuple[str | None, list[dict[str, Any]]]:
    source_rows: list[dict[str, Any]] = []
    ranks: list[int] = []
    for ws_id in ids:
        stage, staging = source_stage(ws_id, state_map, registry_map)
        source_rows.append({"id": ws_id, "stage": stage, "staging": staging})
        if stage in STAGE_RANK:
            ranks.append(STAGE_RANK[stage])
    return (STAGES[min(ranks)] if ranks and len(ranks) == len(ids) else None), source_rows


def target_kind(feature_id: str) -> str:
    return {"AI-GATEWAY": "gateway", "ESCAPE": "games", "IOS-TEACHER": "ios"}.get(feature_id, "web")


def target_sha(kind: str, web_sha: str | None, gateway_evidence: dict[str, Any] | None, state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> str | None:
    if kind == "web":
        return web_sha
    if kind == "gateway":
        return str((gateway_evidence or {}).get("commit") or "") or None
    # Branch tips and documented observations are not installed/deployed builds.
    # Games needs a verified Hosting/Functions receipt; iOS needs build + web SHA.
    return None


def acceptance_view(raw: dict[str, Any] | None, current_sha: str | None) -> tuple[str, str]:
    if raw is None or raw == {}:
        return "pending", "Noch nicht getestet"
    if not isinstance(raw, dict):
        return "invalid", "Abnahme muss ein Objekt sein"
    status = str(raw.get("status") or "pending")
    tested_sha = raw.get("testedSha")
    note = str(raw.get("note") or "").strip()
    if status not in {"pending", "passed", "failed", "skipped"}:
        return "invalid", "Unbekannter Abnahmestatus"
    if status != "pending" and (not isinstance(tested_sha, str) or not SHA_RE.fullmatch(tested_sha)):
        return "invalid", "Vollständiger getesteter SHA fehlt"
    if status != "pending" and (not current_sha or tested_sha != current_sha):
        return "retest", note or f"Ergebnis stammt von {short(tested_sha)}"
    labels = {"pending": "Noch nicht getestet", "passed": "Bestanden", "failed": "Fehler gemeldet", "skipped": "Bewusst übersprungen"}
    return status, note or labels.get(status, status)


def acceptance_icon(status: str) -> str:
    return {"pending": "⬜", "passed": "✅", "failed": "❌", "retest": "🔁", "skipped": "➖", "not_on_staging": "🧪"}.get(status, "❓")


def stage_icon(stage: str | None) -> str:
    return {"branch_only": "⚪", "ci_green": "🟦", "integrated": "🟣", "staging_deployed": "🚀", "user_tested": "✅", "production": "🌍"}.get(stage, "❓")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-out")
    parser.add_argument("--markdown-out")
    parser.add_argument("--fail-on-errors", action="store_true")
    args = parser.parse_args()

    catalog, acceptance, state, registry = map(load_json, (CATALOG, ACCEPTANCE, STATE, REGISTRY))
    errors: list[str] = []
    warnings: list[str] = []
    if catalog.get("schemaVersion") != 1:
        errors.append("catalog.json: schemaVersion 1 erwartet")
    if acceptance.get("schemaVersion") != 1:
        errors.append("acceptance.json: schemaVersion 1 erwartet")

    candidate_branch = str(acceptance.get("candidateBranch") or "feature/gradecrew-app-integration")
    candidate_sha = ref_sha(candidate_branch)
    if not candidate_sha:
        errors.append(f"Kandidatenbranch fehlt: {candidate_branch}")

    runs: list[dict[str, Any]] = []
    hosting_evidence = functions_evidence = gateway_evidence = None
    try:
        runs = github_runs()
        if runs:
            hosting_evidence = latest_deployment(runs, "hosting", warnings)
            functions_evidence = latest_deployment(runs, "functions", warnings)
            gateway_evidence = latest_deployment(runs, "gateway", warnings)
        else:
            warnings.append("Keine Live-Actions-Daten verfügbar; aktueller Deploymentstand bleibt unbestätigt.")
    except (RuntimeError, urllib.error.URLError, json.JSONDecodeError) as exc:
        warnings.append(f"GitHub-Actions-Abgleich fehlgeschlagen: {exc}")

    candidate_ci = find_ci_run(runs, "AI Staging Checks", candidate_branch, candidate_sha)
    snapshot_evidence = verified_preview_snapshot(candidate_sha)
    release_train = state.get("release_train", {})
    documented_sha = str(release_train.get("observed_integration_head") or "") or None
    if documented_sha and candidate_sha and documented_sha != candidate_sha:
        warnings.append(f"GRADECREW_STATE.json veraltet: dokumentiert {short(documented_sha)}, Integration aktuell {short(candidate_sha)}.")

    hosting_sha = str((hosting_evidence or {}).get("commit") or "") or None
    functions_sha = str((functions_evidence or {}).get("commit") or "") or None
    web_sync = bool(candidate_sha and candidate_ci and candidate_ci.get("conclusion") == "success" and hosting_sha == candidate_sha and functions_sha == candidate_sha)

    state_map, registry_map = workstream_maps(state, registry)
    manual_results = acceptance.get("results", {})
    if not isinstance(manual_results, dict):
        errors.append("acceptance.json: results muss ein Objekt sein")
        manual_results = {}
    known_tests: set[str] = set()
    features: list[dict[str, Any]] = []
    tests: list[dict[str, Any]] = []

    for area in catalog.get("areas", []):
        area_id = str(area.get("id") or "")
        area_title = str(area.get("title") or area_id)
        for feature in area.get("features", []):
            feature_id = str(feature.get("id") or "")
            source_ids = [str(value) for value in feature.get("sourceWorkstreams", [])]
            stage, sources = feature_stage(source_ids, state_map, registry_map)
            kind = target_kind(feature_id)
            current_sha = target_sha(kind, candidate_sha if web_sync else None, gateway_evidence, state_map, registry_map)
            available = bool(current_sha and stage in {"staging_deployed", "user_tested", "production"})
            if not available and stage in {"staging_deployed", "user_tested", "production"}:
                stage = "unverified"
            feature_tests: list[dict[str, Any]] = []
            for test in feature.get("tests", []):
                test_id = str(test.get("id") or "")
                if not test_id:
                    errors.append(f"{feature_id}: Test ohne ID")
                    continue
                if test_id in known_tests:
                    errors.append(f"Doppelte Test-ID: {test_id}")
                known_tests.add(test_id)
                status, note = acceptance_view(manual_results.get(test_id), current_sha)
                if status == "invalid":
                    errors.append(f"{test_id}: {note}")
                if not available and status == "pending":
                    status, note = "not_on_staging", "Noch nicht vollständig auf dem zugehörigen Testziel"
                elif not available and status == "passed":
                    status = "retest"
                    note = "Abnahme gespeichert; aktuelles Testziel nicht vollständig bestätigt. " + note
                row = {
                    "id": test_id,
                    "title": str(test.get("title") or test_id),
                    "device": str(test.get("device") or "any"),
                    "featureId": feature_id,
                    "featureTitle": str(feature.get("title") or feature_id),
                    "areaId": area_id,
                    "areaTitle": area_title,
                    "targetKind": kind,
                    "targetSha": current_sha,
                    "available": available,
                    "status": status,
                    "note": note,
                    "raw": manual_results.get(test_id),
                }
                tests.append(row)
                feature_tests.append(row)
            features.append({"id": feature_id, "title": str(feature.get("title") or feature_id), "areaId": area_id, "areaTitle": area_title, "releaseTarget": kind, "releaseStage": stage, "targetSha": current_sha, "sourceWorkstreams": sources, "tests": feature_tests})

    unknown_results = sorted(set(manual_results) - known_tests)
    if unknown_results:
        warnings.append("Acceptance-Einträge ohne Katalog-Test: " + ", ".join(unknown_results))

    statuses = ["pending", "passed", "failed", "retest", "skipped", "not_on_staging", "invalid"]
    counts = {status: sum(row["status"] == status for row in tests) for status in statuses}
    staged_features = sum(row["releaseStage"] in {"staging_deployed", "user_tested", "production"} for row in features)
    rules_status = str(release_train.get("gates", {}).get("staging_rules") or "unknown")
    production_changed = bool(state.get("production", {}).get("changed_by_current_release_train"))

    report = {
        "schemaVersion": 1,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "candidate": {
            "branch": candidate_branch,
            "sha": candidate_sha,
            "ci": candidate_ci,
            "hosting": hosting_evidence,
            "hostingSnapshot": snapshot_evidence,
            "functions": functions_evidence,
            "rules": rules_status,
            "documentedReleaseSha": documented_sha,
            "documentedStateStale": bool(documented_sha and candidate_sha and documented_sha != candidate_sha),
            "webTechnicallySynchronized": web_sync,
            "stagingComplete": False,
            "completionBlockers": ["Firestore-Rules-Nachweis/Cutover fehlt", "Geräte- und Martin-Abnahme separat offen"],
        },
        "otherTargets": {
            "gateway": gateway_evidence,
            "gamesSha": target_sha("games", candidate_sha, gateway_evidence, state_map, registry_map),
            "iosSha": target_sha("ios", candidate_sha, gateway_evidence, state_map, registry_map),
        },
        "summary": {"features": len(features), "featuresOnStagingOrLater": staged_features, "featuresNotOnStaging": len(features) - staged_features, "tests": len(tests), **counts, "productionChanged": production_changed},
        "features": features,
        "automation": automation_status(),
        "warnings": warnings,
        "errors": errors,
    }

    production_label = "🔒 nicht freigegeben; Änderung dokumentiert" if production_changed else "🔒 nicht freigegeben (dieser Bericht prüft Production nicht)"
    lines = [
        "# GradeCrew Release Control",
        "",
        f"{'🟢' if web_sync else '🟡'} **Web-Kandidat `{short(candidate_sha)}`** · 🚀 **{staged_features}/{len(features)} Featurebereiche auf Staging oder weiter** · ✅ **{counts['passed']} bestanden** · ❌ **{counts['failed']} Fehler** · 🔁 **{counts['retest']} Retests** · ⬜ **{counts['pending']} offene Tests** · 🧪 **{counts['not_on_staging']} noch nicht testbar** · Production **{production_label}**",
        "",
        f"Erzeugt: `{report['generatedAt']}`",
        "",
        "## Technischer Web-Kandidat",
        "",
        "| Gate | Stand |",
        "|---|---|",
        f"| Integration | `{candidate_branch}@{short(candidate_sha)}` |",
        f"| Combined CI | {'✅ Run ' + str(candidate_ci.get('runId')) if candidate_ci and candidate_ci.get('conclusion') == 'success' else '❌/offen'} |",
        f"| Hosting | {'✅ ' + short(hosting_sha) if candidate_sha and hosting_sha == candidate_sha else '⚠️ ' + short(hosting_sha)} |",
        f"| AI Functions | {'✅ ' + short(functions_sha) if candidate_sha and functions_sha == candidate_sha else '⚠️ ' + short(functions_sha)} |",
        f"| Hosting Snapshot | {'📦 historisch vorhanden' if snapshot_evidence else 'offen'} – kein Nachweis des aktuellen Deployments |",
        f"| Firestore Rules | `{rules_status}` (separate Deploy-Stufe) |",
        "| Staging vollständig | 🟡 nicht bestätigt; Rules und fachliche Abnahme separat prüfen |",
        f"| GRADECREW_STATE | {'✅ Kandidaten-SHA synchron' if documented_sha and documented_sha == candidate_sha else '⚠️ fehlt/veraltet: ' + short(documented_sha)} |",
        f"| Production | {production_label} |",
        "",
        "## Deine Abnahme-Checkliste",
        "",
        "Ein Ergebnis gilt nur für den verifizierten `targetSha`. Jeder SHA-Wechsel erfordert Retest. Historische Notizen bleiben erhalten. Ein grüner Hosting/AI-Abgleich ist keine vollständige Staging- oder Production-Freigabe.",
        "",
        "Games: Deployment-Receipt fehlt. iOS: TestFlight-Upload, installierter Build und geladener Web-SHA müssen gemeinsam gebunden werden. Branchspitzen zählen nicht als Gerätetest.",
        "",
    ]

    automation = report["automation"]
    lines.extend(["## KI-Ausführung und Kosten", "",
                  "Die Leitstelle beobachtet; nur der separate Guardian führt ausdrücklich freigegebene Aufgaben aus.", ""])
    if automation["available"]:
        lines.extend([f"Konfigurierte Aufgaben: {automation['configuredTasks']}; Policy aktiviert: {automation['policyEnabled']}.",
                      f"Reserviert: ${automation['reservedUsd']:.2f}; bekannte konservative Nutzungsschätzung: ${automation['knownEstimatedUsd']:.2f}. Unklare Aufrufe bleiben voll reserviert; keine Rechnung oder behauptete Einsparung.", "",
                      "| Zweck | Provider | Modell |", "|---|---|---|"])
        lines += [f"| {role} | {spec['provider']} | `{spec['model']}` |" for role, spec in automation["modelAssignments"].items()]
        lines.extend(["", "| Auftrag / Versuch | Schritt | Nachweis |", "|---|---|---|"])
        lines += [f"| {r['taskId']} / {r['requestId']} | {r['state']} | Run {r['runId'] or 'offen'}; `{short(r['sha'])}` |" for r in automation["tasks"]]
        lines += ["", "API-Schlüssel, Pilot-Aktivierung und echter Staging-Durchlauf müssen separat bestätigt sein. Modelle wechseln nicht ungeprüft.", ""]
    else:
        lines += [automation["reason"], ""]

    for area in catalog.get("areas", []):
        area_id = str(area.get("id") or "")
        rows = [row for row in tests if row["areaId"] == area_id]
        if not rows:
            continue
        lines.extend([f"### {area.get('title')}", "", "| Test | Ziel | Status | Hinweis |", "|---|---|---|---|"])
        for row in rows:
            note = str(row["note"]).replace("|", "/").replace("\n", " ")
            lines.append(f"| `{row['id']}` {row['title']} | `{row['targetKind']}@{short(row['targetSha'])}` | {acceptance_icon(row['status'])} {row['status']} | {note} |")
        lines.append("")

    lines.extend(["## Feature-/Entwicklungsstand", "", "| Feature | Ziel | Entwicklungsstufe | Quellen |", "|---|---|---|---|"])
    for feature in features:
        sources = ", ".join(f"{row['id']}:{row['stage'] or '?'}" for row in feature["sourceWorkstreams"]) or "–"
        lines.append(f"| {feature['title']} | `{feature['releaseTarget']}@{short(feature['targetSha'])}` | {stage_icon(feature['releaseStage'])} `{feature['releaseStage'] or 'unknown'}` | {sources} |")

    if warnings:
        lines.extend(["", "## Warnungen", "", *[f"- 🟡 {value}" for value in warnings]])
    if errors:
        lines.extend(["", "## Fehler", "", *[f"- 🔴 {value}" for value in errors]])
    markdown = "\n".join(lines) + "\n"
    print(markdown)

    if args.json_out:
        path = pathlib.Path(args.json_out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.markdown_out:
        path = pathlib.Path(args.markdown_out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(markdown, encoding="utf-8")
    return 1 if args.fail_on_errors and errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
