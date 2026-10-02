#!/usr/bin/env python3
"""Generate the GradeCrew Release Control / acceptance board.

The board combines four different truths without pretending they are the same:
- product inventory: release-control/catalog.json
- manual acceptance: release-control/acceptance.json
- documented release/workstream stages: GRADECREW_STATE.json + workstreams/registry.json
- live evidence: Git refs and, when GITHUB_TOKEN is available, GitHub Actions runs/receipts

This script is read-only. It never changes branches, deployments, PRs or acceptance data.
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import pathlib
import subprocess
import urllib.error
import urllib.request
import zipfile
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "release-control" / "catalog.json"
ACCEPTANCE = ROOT / "release-control" / "acceptance.json"
STATE = ROOT / "GRADECREW_STATE.json"
REGISTRY = ROOT / "workstreams" / "registry.json"

STAGES = ["branch_only", "ci_green", "integrated", "staging_deployed", "user_tested", "production"]
STAGE_RANK = {stage: index for index, stage in enumerate(STAGES)}


def load_json(path: pathlib.Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def git(*args: str, check: bool = True) -> str:
    proc = subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=True)
    if check and proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or f"git {' '.join(args)} failed")
    return proc.stdout.strip()


def resolve_ref(branch: str) -> str | None:
    for ref in (f"refs/remotes/origin/{branch}", f"refs/heads/{branch}"):
        proc = subprocess.run(["git", "show-ref", "--verify", "--quiet", ref], cwd=ROOT)
        if proc.returncode == 0:
            return ref
    return None


def ref_sha(branch: str) -> str | None:
    ref = resolve_ref(branch)
    return git("rev-parse", ref) if ref else None


def short(value: str | None) -> str:
    return value[:10] if value else "–"


def gh_request(url: str, *, binary: bool = False) -> Any:
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not token:
        raise RuntimeError("GITHUB_TOKEN fehlt")
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "gradecrew-release-control",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
    return data if binary else json.loads(data.decode("utf-8"))


def github_runs() -> list[dict[str, Any]]:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not repo or not os.getenv("GITHUB_TOKEN", "").strip():
        return []
    payload = gh_request(f"https://api.github.com/repos/{repo}/actions/runs?per_page=100")
    return list(payload.get("workflow_runs", []))


def find_ci_run(runs: list[dict[str, Any]], *, name: str, branch: str, sha: str | None) -> dict[str, Any] | None:
    if not sha:
        return None
    for run in runs:
        if (
            run.get("name") == name
            and run.get("head_branch") == branch
            and run.get("head_sha") == sha
            and run.get("event") == "push"
            and run.get("status") == "completed"
        ):
            return {
                "runId": run.get("id"),
                "conclusion": run.get("conclusion"),
                "url": run.get("html_url"),
            }
    return None


def receipt_from_artifact(run_id: int, artifact_prefix: str) -> dict[str, Any] | None:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    payload = gh_request(f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/artifacts?per_page=100")
    artifacts = payload.get("artifacts", [])
    artifact = next((item for item in artifacts if str(item.get("name", "")).startswith(artifact_prefix) and not item.get("expired")), None)
    if not artifact:
        return None
    raw = gh_request(str(artifact["archive_download_url"]), binary=True)
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        json_names = [name for name in archive.namelist() if name.endswith(".json")]
        for name in json_names:
            try:
                parsed = json.loads(archive.read(name).decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
            if isinstance(parsed, dict) and parsed.get("commit"):
                parsed["artifactId"] = artifact.get("id")
                parsed["artifactName"] = artifact.get("name")
                parsed["runId"] = run_id
                return parsed
    return None


def latest_receipt(runs: list[dict[str, Any]], workflow_name: str, artifact_prefix: str) -> dict[str, Any] | None:
    for run in runs:
        if run.get("name") != workflow_name or run.get("conclusion") != "success":
            continue
        run_id = run.get("id")
        if not isinstance(run_id, int):
            continue
        try:
            receipt = receipt_from_artifact(run_id, artifact_prefix)
        except (RuntimeError, urllib.error.URLError, zipfile.BadZipFile, KeyError):
            continue
        if receipt:
            return receipt
    return None


def workstream_maps(state: dict[str, Any], registry: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    state_map = {str(item.get("id")): item for item in state.get("workstreams", []) if item.get("id")}
    registry_map = {str(item.get("id")): item for item in registry.get("workstreams", []) if item.get("id")}
    return state_map, registry_map


def registry_state_to_release(state: str) -> str | None:
    return {
        "integrated": "integrated",
        "integration_ready": "ci_green",
        "active": "branch_only",
        "blocked": "branch_only",
        "archive_candidate": None,
    }.get(state)


def source_stage(ws_id: str, state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> tuple[str | None, str | None]:
    item = state_map.get(ws_id)
    if item:
        return str(item.get("stage") or "") or None, str(item.get("staging") or "") or None
    reg = registry_map.get(ws_id)
    if reg:
        return registry_state_to_release(str(reg.get("state") or "")), None
    return None, None


def feature_stage(source_ids: list[str], state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> tuple[str | None, list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    ranks: list[int] = []
    for ws_id in source_ids:
        stage, staging = source_stage(ws_id, state_map, registry_map)
        rows.append({"id": ws_id, "stage": stage, "staging": staging})
        if stage in STAGE_RANK:
            ranks.append(STAGE_RANK[stage])
    if not ranks:
        return None, rows
    return STAGES[min(ranks)], rows


def target_kind(feature_id: str) -> str:
    if feature_id == "AI-GATEWAY":
        return "gateway"
    if feature_id == "ESCAPE":
        return "games"
    if feature_id == "IOS-TEACHER":
        return "ios"
    return "web"


def target_sha(kind: str, candidate_sha: str | None, gateway_receipt: dict[str, Any] | None, state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> str | None:
    if kind == "web":
        return candidate_sha
    if kind == "gateway":
        if gateway_receipt and gateway_receipt.get("commit"):
            return str(gateway_receipt["commit"])
        return ref_sha("integration/ai-gateway-staging")
    if kind == "games":
        item = state_map.get("games-escape", {})
        return str(item.get("observed_head") or "") or ref_sha(str(registry_map.get("games-escape", {}).get("primaryBranch") or "feature/escape-room-mvp-v1"))
    if kind == "ios":
        item = state_map.get("ios-design", {})
        return str(item.get("observed_head") or "") or ref_sha(str(registry_map.get("ios-teacher-app", {}).get("primaryBranch") or "feature/shared-gradecrew-design-system"))
    return None


def acceptance_view(raw: dict[str, Any] | None, current_sha: str | None) -> tuple[str, str]:
    if not raw:
        return "pending", "Noch nicht getestet"
    status = str(raw.get("status") or "pending")
    tested_sha = str(raw.get("testedSha") or "") or None
    note = str(raw.get("note") or "").strip()
    if tested_sha and current_sha and tested_sha != current_sha and status in {"passed", "failed"}:
        return "retest", note or f"Ergebnis stammt von {short(tested_sha)}"
    labels = {
        "pending": "Noch nicht getestet",
        "passed": "Bestanden",
        "failed": "Fehler gemeldet",
        "skipped": "Bewusst übersprungen",
    }
    return status, note or labels.get(status, status)


def acceptance_icon(status: str) -> str:
    return {
        "pending": "⬜",
        "passed": "✅",
        "failed": "❌",
        "retest": "🔁",
        "skipped": "➖",
        "not_on_staging": "🧪",
    }.get(status, "❓")


def stage_icon(stage: str | None) -> str:
    return {
        "branch_only": "⚪",
        "ci_green": "🟦",
        "integrated": "🟣",
        "staging_deployed": "🚀",
        "user_tested": "✅",
        "production": "🌍",
    }.get(stage, "❓")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-out")
    parser.add_argument("--markdown-out")
    parser.add_argument("--fail-on-errors", action="store_true")
    args = parser.parse_args()

    catalog = load_json(CATALOG)
    acceptance = load_json(ACCEPTANCE)
    state = load_json(STATE)
    registry = load_json(REGISTRY)
    errors: list[str] = []
    warnings: list[str] = []

    if catalog.get("schemaVersion") != 1:
        errors.append("release-control/catalog.json: schemaVersion 1 erwartet")
    if acceptance.get("schemaVersion") != 1:
        errors.append("release-control/acceptance.json: schemaVersion 1 erwartet")

    candidate_branch = str(acceptance.get("candidateBranch") or "feature/gradecrew-app-integration")
    candidate_sha = ref_sha(candidate_branch)
    if not candidate_sha:
        errors.append(f"Kandidatenbranch fehlt: {candidate_branch}")

    runs: list[dict[str, Any]] = []
    hosting_receipt = functions_receipt = gateway_receipt = None
    try:
        runs = github_runs()
        if runs:
            hosting_receipt = latest_receipt(runs, "Automatic staging preview", "verified-preview-receipt")
            functions_receipt = latest_receipt(runs, "Automatic staging AI functions", "staging-functions-receipt-")
            gateway_receipt = latest_receipt(runs, "Automatic staging AI gateway", "staging-ai-gateway-receipt-")
        else:
            warnings.append("Keine GitHub-Actions-Daten verfügbar; Deployment-Receipts nur aus zentralem Status ableitbar.")
    except (RuntimeError, urllib.error.URLError, json.JSONDecodeError) as exc:
        warnings.append(f"GitHub-Actions-Abgleich fehlgeschlagen: {exc}")

    candidate_ci = find_ci_run(runs, name="AI Staging Checks", branch=candidate_branch, sha=candidate_sha)
    hosting_sha = str((hosting_receipt or {}).get("commit") or "") or None
    functions_sha = str((functions_receipt or {}).get("commit") or "") or None

    release_train = state.get("release_train", {})
    documented_sha = str(release_train.get("observed_integration_head") or "") or None
    if documented_sha and candidate_sha and documented_sha != candidate_sha:
        warnings.append(
            f"GRADECREW_STATE.json ist beim Integrationshead veraltet: dokumentiert {short(documented_sha)}, aktuell {short(candidate_sha)}."
        )

    if not hosting_receipt:
        evidence = state.get("automation", {}).get("preview_evidence", {})
        if evidence.get("commit"):
            hosting_receipt = {"commit": evidence.get("commit"), "runId": evidence.get("run_id"), "fallback": True}
            hosting_sha = str(evidence.get("commit"))
    if not functions_receipt:
        evidence = state.get("automation", {}).get("functions_automation_evidence", {})
        if evidence.get("deployed_commit"):
            functions_receipt = {"commit": evidence.get("deployed_commit"), "runId": evidence.get("automatic_run_id"), "fallback": True}
            functions_sha = str(evidence.get("deployed_commit"))

    web_sync = bool(candidate_sha and candidate_ci and candidate_ci.get("conclusion") == "success" and hosting_sha == candidate_sha and functions_sha == candidate_sha)

    state_map, registry_map = workstream_maps(state, registry)
    manual_results = acceptance.get("results", {})
    known_test_ids: set[str] = set()
    feature_rows: list[dict[str, Any]] = []
    test_rows: list[dict[str, Any]] = []

    for area in catalog.get("areas", []):
        area_id = str(area.get("id") or "")
        area_title = str(area.get("title") or area_id)
        for feature in area.get("features", []):
            feature_id = str(feature.get("id") or "")
            source_ids = [str(item) for item in feature.get("sourceWorkstreams", [])]
            stage, sources = feature_stage(source_ids, state_map, registry_map)
            kind = target_kind(feature_id)
            current_sha = target_sha(kind, candidate_sha, gateway_receipt, state_map, registry_map)
            if feature_id == "AI-GATEWAY" and gateway_receipt:
                stage = "staging_deployed"

            tests = []
            for test in feature.get("tests", []):
                test_id = str(test.get("id") or "")
                if not test_id:
                    errors.append(f"{feature_id}: Test ohne id")
                    continue
                if test_id in known_test_ids:
                    errors.append(f"Doppelte Test-ID: {test_id}")
                known_test_ids.add(test_id)
                raw_result = manual_results.get(test_id)
                status, note = acceptance_view(raw_result, current_sha)
                if stage not in {"staging_deployed", "user_tested", "production"} and status == "pending":
                    status = "not_on_staging"
                    note = "Noch nicht vollständig auf dem zugehörigen Testziel"
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
                    "status": status,
                    "note": note,
                    "raw": raw_result,
                }
                tests.append(row)
                test_rows.append(row)

            feature_rows.append(
                {
                    "id": feature_id,
                    "title": str(feature.get("title") or feature_id),
                    "areaId": area_id,
                    "areaTitle": area_title,
                    "releaseTarget": kind,
                    "releaseStage": stage,
                    "targetSha": current_sha,
                    "sourceWorkstreams": sources,
                    "tests": tests,
                }
            )

    unknown_results = sorted(set(manual_results) - known_test_ids)
    if unknown_results:
        warnings.append("Acceptance-Einträge ohne Katalog-Test: " + ", ".join(unknown_results))

    counts = {
        status: sum(1 for row in test_rows if row["status"] == status)
        for status in ["pending", "passed", "failed", "retest", "skipped", "not_on_staging"]
    }
    on_staging_features = sum(1 for item in feature_rows if item["releaseStage"] in {"staging_deployed", "user_tested", "production"})
    not_staging_features = len(feature_rows) - on_staging_features

    rules_status = str(release_train.get("gates", {}).get("staging_rules") or "unknown")
    production_changed = bool(state.get("production", {}).get("changed_by_current_release_train"))

    report = {
        "schemaVersion": 1,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "candidate": {
            "branch": candidate_branch,
            "sha": candidate_sha,
            "ci": candidate_ci,
            "hosting": hosting_receipt,
            "functions": functions_receipt,
            "rules": rules_status,
            "documentedReleaseSha": documented_sha,
            "documentedStateStale": bool(documented_sha and candidate_sha and documented_sha != candidate_sha),
            "webTechnicallySynchronized": web_sync,
        },
        "otherTargets": {
            "gateway": gateway_receipt,
            "gamesSha": target_sha("games", candidate_sha, gateway_receipt, state_map, registry_map),
            "iosSha": target_sha("ios", candidate_sha, gateway_receipt, state_map, registry_map),
        },
        "summary": {
            "features": len(feature_rows),
            "featuresOnStagingOrLater": on_staging_features,
            "featuresNotOnStaging": not_staging_features,
            "tests": len(test_rows),
            **counts,
            "productionChanged": production_changed,
        },
        "features": feature_rows,
        "warnings": warnings,
        "errors": errors,
    }

    candidate_label = short(candidate_sha)
    sync_icon = "🟢" if web_sync else "🟡"
    production_label = "⚠️ verändert" if production_changed else "🔒 unverändert"
    lines = [
        "# GradeCrew Release Control",
        "",
        f"{sync_icon} **Web-Kandidat `{candidate_label}`** · 🚀 **{on_staging_features}/{len(feature_rows)} Featurebereiche auf Staging oder weiter** · ✅ **{counts['passed']} manuell bestanden** · ❌ **{counts['failed']} Fehler** · 🔁 **{counts['retest']} Retests** · ⬜ **{counts['pending']} offene Tests** · Production **{production_label}**",
        "",
        f"Erzeugt: `{report['generatedAt']}`",
        "",
        "## Technischer Web-Kandidat",
        "",
        "| Gate | Stand |",
        "|---|---|",
        f"| Integrationsbranch | `{candidate_branch}@{candidate_label}` |",
        f"| Combined CI | {'✅ ' + str(candidate_ci.get('runId')) if candidate_ci and candidate_ci.get('conclusion') == 'success' else '❌/offen'} |",
        f"| Hosting | {'✅ ' + short(hosting_sha) if hosting_sha == candidate_sha else '⚠️ ' + short(hosting_sha)} |",
        f"| AI Functions | {'✅ ' + short(functions_sha) if functions_sha == candidate_sha else '⚠️ ' + short(functions_sha)} |",
        f"| Firestore Rules | `{rules_status}` (separate Deploy-Stufe) |",
        f"| Zentrale Statusdatei | {'⚠️ veraltet: ' + short(documented_sha) if documented_sha and documented_sha != candidate_sha else '✅ synchron'} |",
        f"| Production | {production_label} |",
        "",
        "## Deine Abnahme-Checkliste",
        "",
        "Du kannst einen Punkt als bestanden/fehlerhaft melden. Ein Ergebnis gilt nur fuer den jeweiligen `targetSha`; bei einem neueren Stand erscheint automatisch 🔁 Retest.",
        "",
    ]

    for area in catalog.get("areas", []):
        area_id = str(area.get("id") or "")
        rows = [row for row in test_rows if row["areaId"] == area_id]
        if not rows:
            continue
        lines.extend([f"### {area.get('title')}", "", "| Test | Ziel | Status | Hinweis |", "|---|---|---|---|"])
        for row in rows:
            target = short(row["targetSha"])
            note = str(row["note"]).replace("|", "/").replace("\n", " ")
            lines.append(f"| `{row['id']}` {row['title']} | `{row['targetKind']}@{target}` | {acceptance_icon(row['status'])} {row['status']} | {note} |")
        lines.append("")

    lines.extend(["## Feature-/Entwicklungsstand", "", "| Feature | Ziel | Entwicklungsstufe | Quellen |", "|---|---|---|---|"])
    for feature in feature_rows:
        sources = ", ".join(
            f"{item['id']}:{item['stage'] or '?'}" for item in feature["sourceWorkstreams"]
        ) or "–"
        lines.append(
            f"| {feature['title']} | `{feature['releaseTarget']}@{short(feature['targetSha'])}` | {stage_icon(feature['releaseStage'])} `{feature['releaseStage'] or 'unknown'}` | {sources} |"
        )

    if warnings:
        lines.extend(["", "## Warnungen", ""])
        lines.extend(f"- 🟡 {warning}" for warning in warnings)
    if errors:
        lines.extend(["", "## Fehler", ""])
        lines.extend(f"- 🔴 {error}" for error in errors)

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

    if args.fail_on_errors and errors:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
