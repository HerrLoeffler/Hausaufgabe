#!/usr/bin/env python3
"""Generate the GradeCrew Release Control / acceptance board.

Read-only control plane: product inventory + manual acceptance + live Git/GitHub
release evidence. Manual results are bound to the exact tested target SHA.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import pathlib
import re
import subprocess
import urllib.error
import urllib.request
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "release-control" / "catalog.json"
ACCEPTANCE = ROOT / "release-control" / "acceptance.json"
STATE = ROOT / "GRADECREW_STATE.json"
REGISTRY = ROOT / "workstreams" / "registry.json"
STAGES = ["branch_only", "ci_green", "integrated", "staging_deployed", "user_tested", "production"]
STAGE_RANK = {stage: index for index, stage in enumerate(STAGES)}
SHA_RE = re.compile(r"^[0-9a-f]{40}$")


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
        if (
            run.get("name") == name
            and run.get("head_branch") == branch
            and run.get("head_sha") == sha
            and run.get("event") == "push"
            and run.get("status") == "completed"
        ):
            return {"runId": run.get("id"), "conclusion": run.get("conclusion"), "url": run.get("html_url")}
    return None


def latest_artifact_sha(runs: list[dict[str, Any]], workflow_name: str, artifact_prefix: str) -> dict[str, Any] | None:
    """Use immutable SHA embedded in deployment artifact names; no ZIP download needed."""
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not repo:
        return None
    for run in runs:
        if run.get("name") != workflow_name or run.get("conclusion") != "success":
            continue
        run_id = run.get("id")
        if not isinstance(run_id, int):
            continue
        try:
            payload = gh_request(f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/artifacts?per_page=100")
        except (RuntimeError, urllib.error.URLError, json.JSONDecodeError):
            continue
        for artifact in payload.get("artifacts", []):
            name = str(artifact.get("name") or "")
            if artifact.get("expired") or not name.startswith(artifact_prefix):
                continue
            candidate = name[len(artifact_prefix):]
            if SHA_RE.fullmatch(candidate):
                return {
                    "commit": candidate,
                    "runId": run_id,
                    "artifactId": artifact.get("id"),
                    "artifactName": name,
                    "evidence": "artifact_name",
                }
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
    return (STAGES[min(ranks)] if ranks else None), source_rows


def target_kind(feature_id: str) -> str:
    return {"AI-GATEWAY": "gateway", "ESCAPE": "games", "IOS-TEACHER": "ios"}.get(feature_id, "web")


def target_sha(kind: str, web_sha: str | None, gateway_evidence: dict[str, Any] | None, state_map: dict[str, dict[str, Any]], registry_map: dict[str, dict[str, Any]]) -> str | None:
    if kind == "web":
        return web_sha
    if kind == "gateway":
        return str((gateway_evidence or {}).get("commit") or "") or ref_sha("integration/ai-gateway-staging")
    if kind == "games":
        row = state_map.get("games-escape", {})
        return str(row.get("observed_head") or "") or ref_sha(str(registry_map.get("games-escape", {}).get("primaryBranch") or "feature/escape-room-mvp-v1"))
    if kind == "ios":
        row = state_map.get("ios-design", {})
        return str(row.get("observed_head") or "") or ref_sha(str(registry_map.get("ios-teacher-app", {}).get("primaryBranch") or "feature/shared-gradecrew-design-system"))
    return None


def acceptance_view(raw: dict[str, Any] | None, current_sha: str | None) -> tuple[str, str]:
    if not raw:
        return "pending", "Noch nicht getestet"
    status = str(raw.get("status") or "pending")
    tested_sha = str(raw.get("testedSha") or "") or None
    note = str(raw.get("note") or "").strip()
    if status in {"passed", "failed"} and tested_sha and current_sha and tested_sha != current_sha:
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
    functions_evidence = gateway_evidence = None
    try:
        runs = github_runs()
        if runs:
            functions_evidence = latest_artifact_sha(runs, "Automatic staging AI functions", "staging-functions-receipt-")
            gateway_evidence = latest_artifact_sha(runs, "Automatic staging AI gateway", "staging-ai-gateway-receipt-")
        else:
            warnings.append("Keine Live-Actions-Daten verfügbar; Deploymentstand fällt auf dokumentierte Evidence zurück.")
    except (RuntimeError, urllib.error.URLError, json.JSONDecodeError) as exc:
        warnings.append(f"GitHub-Actions-Abgleich fehlgeschlagen: {exc}")

    candidate_ci = find_ci_run(runs, "AI Staging Checks", candidate_branch, candidate_sha)
    hosting_evidence = verified_preview_snapshot(candidate_sha)
    release_train = state.get("release_train", {})
    documented_sha = str(release_train.get("observed_integration_head") or "") or None
    if documented_sha and candidate_sha and documented_sha != candidate_sha:
        warnings.append(f"GRADECREW_STATE.json veraltet: dokumentiert {short(documented_sha)}, Integration aktuell {short(candidate_sha)}.")

    if not hosting_evidence:
        evidence = state.get("automation", {}).get("preview_evidence", {})
        if evidence.get("commit"):
            hosting_evidence = {"commit": evidence.get("commit"), "runId": evidence.get("run_id"), "fallback": True}
    if not functions_evidence:
        evidence = state.get("automation", {}).get("functions_automation_evidence", {})
        if evidence.get("deployed_commit"):
            functions_evidence = {"commit": evidence.get("deployed_commit"), "runId": evidence.get("automatic_run_id"), "fallback": True}

    hosting_sha = str((hosting_evidence or {}).get("commit") or "") or None
    functions_sha = str((functions_evidence or {}).get("commit") or "") or None
    web_sync = bool(candidate_sha and candidate_ci and candidate_ci.get("conclusion") == "success" and hosting_sha == candidate_sha and functions_sha == candidate_sha)

    state_map, registry_map = workstream_maps(state, registry)
    manual_results = acceptance.get("results", {})
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
            current_sha = target_sha(kind, candidate_sha, gateway_evidence, state_map, registry_map)
            if feature_id == "AI-GATEWAY" and gateway_evidence:
                stage = "staging_deployed"
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
                if stage not in {"staging_deployed", "user_tested", "production"} and status == "pending":
                    status, note = "not_on_staging", "Noch nicht vollständig auf dem zugehörigen Testziel"
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
                    "raw": manual_results.get(test_id),
                }
                tests.append(row)
                feature_tests.append(row)
            features.append({"id": feature_id, "title": str(feature.get("title") or feature_id), "areaId": area_id, "areaTitle": area_title, "releaseTarget": kind, "releaseStage": stage, "targetSha": current_sha, "sourceWorkstreams": sources, "tests": feature_tests})

    unknown_results = sorted(set(manual_results) - known_tests)
    if unknown_results:
        warnings.append("Acceptance-Einträge ohne Katalog-Test: " + ", ".join(unknown_results))

    statuses = ["pending", "passed", "failed", "retest", "skipped", "not_on_staging"]
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
            "functions": functions_evidence,
            "rules": rules_status,
            "documentedReleaseSha": documented_sha,
            "documentedStateStale": bool(documented_sha and candidate_sha and documented_sha != candidate_sha),
            "webTechnicallySynchronized": web_sync,
        },
        "otherTargets": {
            "gateway": gateway_evidence,
            "gamesSha": target_sha("games", candidate_sha, gateway_evidence, state_map, registry_map),
            "iosSha": target_sha("ios", candidate_sha, gateway_evidence, state_map, registry_map),
        },
        "summary": {"features": len(features), "featuresOnStagingOrLater": staged_features, "featuresNotOnStaging": len(features) - staged_features, "tests": len(tests), **counts, "productionChanged": production_changed},
        "features": features,
        "warnings": warnings,
        "errors": errors,
    }

    production_label = "⚠️ verändert" if production_changed else "🔒 unverändert"
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
        f"| Hosting | {'✅ ' + short(hosting_sha) if hosting_sha == candidate_sha else '⚠️ ' + short(hosting_sha)} |",
        f"| AI Functions | {'✅ ' + short(functions_sha) if functions_sha == candidate_sha else '⚠️ ' + short(functions_sha)} |",
        f"| Firestore Rules | `{rules_status}` (separate Deploy-Stufe) |",
        f"| GRADECREW_STATE | {'⚠️ veraltet: ' + short(documented_sha) if documented_sha and documented_sha != candidate_sha else '✅ synchron'} |",
        f"| Production | {production_label} |",
        "",
        "## Deine Abnahme-Checkliste",
        "",
        "Ein Ergebnis gilt nur für den jeweiligen `targetSha`. Nach einer relevanten Änderung wird ein altes ✅/❌ automatisch zu 🔁 Retest.",
        "",
    ]

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
