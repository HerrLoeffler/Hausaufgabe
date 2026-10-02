#!/usr/bin/env python3
"""GradeCrew development status / branch audit.

Read-only. Combines a tiny human-maintained registry with live Git/GitHub data
and the central GRADECREW_STATE.json release view. It never changes refs, PRs
or files.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import pathlib
import subprocess
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "workstreams" / "registry.json"
DEFAULT_RELEASE_STATE = ROOT / "GRADECREW_STATE.json"
ACTIVE_STATES = {"active", "integration_ready", "blocked"}
READY_STATES = {"integration_ready"}


def run_git(*args: str, check: bool = True) -> str:
    proc = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, capture_output=True
    )
    if check and proc.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {proc.stderr.strip()}")
    return proc.stdout.strip()


def ref_exists(ref: str) -> bool:
    return subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", ref], cwd=ROOT
    ).returncode == 0


def resolve_branch(name: str | None) -> str | None:
    if not name:
        return None
    for ref in (f"refs/remotes/origin/{name}", f"refs/heads/{name}"):
        if ref_exists(ref):
            return ref
    return None


def short_sha(ref: str | None) -> str | None:
    return run_git("rev-parse", "--short=10", ref) if ref else None


def commit_age_days(ref: str | None) -> int | None:
    if not ref:
        return None
    epoch = int(run_git("show", "-s", "--format=%ct", ref))
    now = int(dt.datetime.now(dt.timezone.utc).timestamp())
    return max(0, (now - epoch) // 86400)


def ahead_behind(target_ref: str, branch_ref: str) -> tuple[int, int]:
    raw = run_git(
        "rev-list", "--left-right", "--count", f"{target_ref}...{branch_ref}"
    )
    behind, ahead = [int(value) for value in raw.split()]
    return ahead, behind


def changed_files(target_ref: str, branch_ref: str) -> set[str]:
    base = run_git("merge-base", target_ref, branch_ref)
    output = run_git("diff", "--name-only", f"{base}..{branch_ref}")
    return {line for line in output.splitlines() if line.strip()}


def is_ancestor(left_ref: str, right_ref: str) -> bool:
    proc = subprocess.run(
        ["git", "merge-base", "--is-ancestor", left_ref, right_ref],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    return proc.returncode == 0


def remote_branches() -> list[str]:
    raw = run_git(
        "for-each-ref", "--format=%(refname:strip=3)", "refs/remotes/origin"
    )
    return sorted({name for name in raw.splitlines() if name and name != "HEAD"})


def github_open_prs() -> tuple[list[dict[str, Any]], str | None]:
    token = os.getenv("GITHUB_TOKEN", "").strip()
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not token or not repo:
        return [], "GITHUB_TOKEN/GITHUB_REPOSITORY fehlt; PR-Abgleich übersprungen."

    url = f"https://api.github.com/repos/{repo}/pulls?state=open&per_page=100"
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "gradecrew-development-status",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.load(response)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return [], f"PR-Abgleich fehlgeschlagen: {exc}"

    prs = []
    for pr in payload:
        prs.append(
            {
                "number": pr.get("number"),
                "title": pr.get("title"),
                "draft": bool(pr.get("draft")),
                "head": pr.get("head", {}).get("ref"),
                "base": pr.get("base", {}).get("ref"),
                "url": pr.get("html_url"),
                "updatedAt": pr.get("updated_at"),
            }
        )
    return prs, None


def load_json(path: pathlib.Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def release_lookup(
    release_state: dict[str, Any],
) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_id: dict[str, dict[str, Any]] = {}
    by_branch: dict[str, dict[str, Any]] = {}
    for item in release_state.get("workstreams", []):
        ws_id = str(item.get("id") or "")
        branch = str(item.get("branch") or "")
        if ws_id:
            by_id[ws_id] = item
        if branch:
            by_branch[branch] = item
    return by_id, by_branch


def target_chain_reaches(
    start_branch: str, wanted_branch: str, branch_targets: dict[str, str]
) -> bool:
    current = start_branch
    seen: set[str] = set()
    while current and current not in seen:
        seen.add(current)
        target = branch_targets.get(current)
        if not target:
            return False
        if target == wanted_branch:
            return True
        current = target
    return False


@dataclass
class WorkstreamAudit:
    id: str
    title: str
    state: str
    branch: str
    target: str | None
    branchExists: bool
    targetExists: bool | None
    sha: str | None
    ageDays: int | None
    ahead: int | None
    behind: int | None
    changedFileCount: int | None
    changedFilesPreview: list[str]
    openPrs: list[int]
    prBases: list[str]
    releaseStage: str | None
    releaseStaging: str | None
    handoff: str | None
    staleCritical: bool


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    parser.add_argument("--release-state", default=str(DEFAULT_RELEASE_STATE))
    parser.add_argument("--json-out")
    parser.add_argument("--markdown-out")
    parser.add_argument("--fail-on-errors", action="store_true")
    args = parser.parse_args()

    registry_path = pathlib.Path(args.registry)
    release_state_path = pathlib.Path(args.release_state)
    registry = load_json(registry_path)
    release_state = load_json(release_state_path)

    errors: list[str] = []
    warnings: list[str] = []

    if registry.get("schemaVersion") != 2:
        errors.append("Unbekannte registry schemaVersion; erwartet: 2.")

    allowed_states = set(registry.get("allowedStates", []))
    stale_after_days = int(registry.get("staleAfterDays", 7))
    stale_behind_threshold = int(registry.get("staleBehindThreshold", 1))
    ignored_branches = set(registry.get("ignoredBranches", ["main"]))
    ignored_prefixes = tuple(registry.get("ignoredPrefixes", []))
    archive_prefixes = tuple(registry.get("archivePrefixes", []))
    workstreams = registry.get("workstreams", [])

    ids: set[str] = set()
    primary_branches: set[str] = set()

    for ws in workstreams:
        ws_id = str(ws.get("id", "")).strip()
        branch = str(ws.get("primaryBranch", "")).strip()
        state = str(ws.get("state", "")).strip()
        if not ws_id or not branch:
            errors.append("Jeder Workstream braucht id und primaryBranch.")
            continue
        if ws_id in ids:
            errors.append(f"Doppelte Workstream-ID: {ws_id}")
        ids.add(ws_id)
        if branch in primary_branches:
            errors.append(f"Doppelter primaryBranch im Register: {branch}")
        primary_branches.add(branch)
        if state not in allowed_states:
            errors.append(f"{ws_id}: ungültiger state '{state}'.")
        handoff = ws.get("handoff")
        if (
            handoff
            and not (ROOT / str(handoff)).exists()
            and not ws.get("handoffOptional", False)
        ):
            errors.append(f"{ws_id}: Handoff fehlt: {handoff}")

    prs, pr_note = github_open_prs()
    if pr_note:
        warnings.append(pr_note)
    prs_by_head: dict[str, list[dict[str, Any]]] = {}
    for pr in prs:
        prs_by_head.setdefault(str(pr.get("head") or ""), []).append(pr)

    release_by_id, release_by_branch = release_lookup(release_state)
    audits: list[WorkstreamAudit] = []
    file_sets: dict[str, set[str]] = {}
    branch_refs: dict[str, str] = {}
    branch_names_by_id: dict[str, str] = {}
    branch_targets = {
        str(ws.get("primaryBranch")): str(ws.get("integrationTarget"))
        for ws in workstreams
        if ws.get("primaryBranch") and ws.get("integrationTarget")
    }

    for ws in workstreams:
        ws_id = str(ws.get("id", ""))
        title = str(ws.get("title") or ws_id)
        branch = str(ws.get("primaryBranch", ""))
        target = str(ws.get("integrationTarget") or "") or None
        state = str(ws.get("state", ""))
        handoff = str(ws.get("handoff") or "") or None

        branch_ref = resolve_branch(branch)
        target_ref = resolve_branch(target)

        if branch_ref:
            branch_refs[ws_id] = branch_ref
            branch_names_by_id[ws_id] = branch

        if not branch_ref and state in ACTIVE_STATES:
            errors.append(f"{ws_id}: aktiver Branch fehlt lokal/remote: {branch}")
        if target and not target_ref:
            warnings.append(f"{ws_id}: Integrationsziel nicht verfügbar: {target}")

        ahead = behind = None
        files: set[str] = set()
        if branch_ref and target_ref:
            try:
                ahead, behind = ahead_behind(target_ref, branch_ref)
                files = changed_files(target_ref, branch_ref)
            except RuntimeError as exc:
                warnings.append(f"{ws_id}: Vergleich fehlgeschlagen: {exc}")

        if state in ACTIVE_STATES:
            file_sets[ws_id] = files

        matching_prs = prs_by_head.get(branch, [])
        pr_bases = sorted(
            {str(pr.get("base") or "") for pr in matching_prs if pr.get("base")}
        )
        if target and matching_prs and any(base != target for base in pr_bases):
            warnings.append(
                f"{ws_id}: Registry-Ziel '{target}' weicht von offenem PR-Ziel ab: "
                + ", ".join(pr_bases)
            )
        if state == "integrated" and matching_prs:
            warnings.append(
                f"{ws_id}: als integriert markiert, aber PR(s) noch offen: "
                + ", ".join(
                    f"#{pr['number']}" for pr in matching_prs if pr.get("number")
                )
            )

        release_item = release_by_id.get(ws_id) or release_by_branch.get(branch) or {}
        age_days = commit_age_days(branch_ref)
        stale = bool(
            state in ACTIVE_STATES
            and age_days is not None
            and age_days >= stale_after_days
            and behind is not None
            and behind >= stale_behind_threshold
        )

        audits.append(
            WorkstreamAudit(
                id=ws_id,
                title=title,
                state=state,
                branch=branch,
                target=target,
                branchExists=bool(branch_ref),
                targetExists=bool(target_ref) if target else None,
                sha=short_sha(branch_ref),
                ageDays=age_days,
                ahead=ahead,
                behind=behind,
                changedFileCount=len(files) if branch_ref and target_ref else None,
                changedFilesPreview=sorted(files)[:12],
                openPrs=[
                    int(pr["number"])
                    for pr in matching_prs
                    if pr.get("number") is not None
                ],
                prBases=pr_bases,
                releaseStage=str(release_item.get("stage") or "") or None,
                releaseStaging=str(release_item.get("staging") or "") or None,
                handoff=handoff,
                staleCritical=stale,
            )
        )

    parallel_overlaps: list[dict[str, Any]] = []
    serial_overlaps: list[dict[str, Any]] = []
    active_ids = sorted(file_sets)

    for idx, left in enumerate(active_ids):
        for right in active_ids[idx + 1 :]:
            shared = sorted(file_sets[left] & file_sets[right])
            if not shared:
                continue

            left_branch = branch_names_by_id.get(left, "")
            right_branch = branch_names_by_id.get(right, "")
            same_chain = bool(
                left_branch
                and right_branch
                and (
                    target_chain_reaches(left_branch, right_branch, branch_targets)
                    or target_chain_reaches(right_branch, left_branch, branch_targets)
                )
            )

            left_ref = branch_refs.get(left)
            right_ref = branch_refs.get(right)
            ancestor_related = bool(
                left_ref
                and right_ref
                and (
                    is_ancestor(left_ref, right_ref)
                    or is_ancestor(right_ref, left_ref)
                )
            )

            overlap = {
                "left": left,
                "right": right,
                "count": len(shared),
                "files": shared[:20],
                "relation": "serial" if (same_chain or ancestor_related) else "parallel",
            }
            if overlap["relation"] == "serial":
                serial_overlaps.append(overlap)
            else:
                parallel_overlaps.append(overlap)

    registered_all = set(primary_branches)
    for ws in workstreams:
        if ws.get("integrationTarget"):
            registered_all.add(str(ws.get("integrationTarget")))
        registered_all.update(
            str(branch) for branch in ws.get("relatedBranches", []) if branch
        )

    all_remote = remote_branches()
    archive_branches = [
        branch
        for branch in all_remote
        if archive_prefixes and branch.startswith(archive_prefixes)
    ]
    unregistered = [
        branch
        for branch in all_remote
        if branch not in registered_all
        and branch not in ignored_branches
        and not branch.startswith(ignored_prefixes)
        and not branch.startswith(archive_prefixes)
    ]

    if unregistered:
        warnings.append(
            f"{len(unregistered)} Remote-Branches sind nicht klassifiziert. "
            "Nicht automatisch löschen; zuerst triagieren."
        )

    unregistered_prs = [
        pr
        for pr in prs
        if pr.get("head") and pr.get("head") not in registered_all
    ]
    if unregistered_prs:
        warnings.append(
            "Offene PRs ohne Registry-Zuordnung: "
            + ", ".join(
                f"#{pr['number']} ({pr['head']})" for pr in unregistered_prs
            )
        )

    release_branches = {
        str(item.get("branch"))
        for item in release_state.get("workstreams", [])
        if item.get("branch")
    }
    release_missing_registry = sorted(
        branch
        for branch in release_branches
        if branch not in registered_all and branch not in ignored_branches
    )
    if release_missing_registry:
        warnings.append(
            "GRADECREW_STATE-Branches ohne Registry-Zuordnung: "
            + ", ".join(release_missing_registry)
        )

    active_count = sum(1 for item in audits if item.state in ACTIVE_STATES)
    stale_count = sum(1 for item in audits if item.staleCritical)
    integration_ready_count = sum(
        1 for item in audits if item.state in READY_STATES
    )
    staging_count = sum(
        1
        for item in release_state.get("workstreams", [])
        if item.get("stage") == "staging_deployed"
    )
    production_changed = bool(
        release_state.get("production", {}).get("changed_by_current_release_train")
    )

    if errors:
        health = "red"
    elif parallel_overlaps or stale_count or unregistered_prs:
        health = "yellow"
    else:
        health = "green"

    metrics = {
        "health": health,
        "activeWorkstreams": active_count,
        "potentialParallelOverlapPairs": len(parallel_overlaps),
        "expectedSerialOverlapPairs": len(serial_overlaps),
        "staleCriticalBranches": stale_count,
        "integrationReady": integration_ready_count,
        "stagingDeployedWorkstreams": staging_count,
        "openPullRequests": len(prs),
        "unregisteredBranches": len(unregistered),
        "archiveBranches": len(archive_branches),
        "productionChangedByCurrentReleaseTrain": production_changed,
    }

    report = {
        "schemaVersion": 2,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "registry": str(
            registry_path.relative_to(ROOT)
            if registry_path.is_relative_to(ROOT)
            else registry_path
        ),
        "releaseState": str(
            release_state_path.relative_to(ROOT)
            if release_state_path.is_relative_to(ROOT)
            else release_state_path
        ),
        "currentBranch": run_git("branch", "--show-current", check=False) or None,
        "currentCommit": run_git("rev-parse", "HEAD"),
        "metrics": metrics,
        "errors": errors,
        "warnings": warnings,
        "workstreams": [asdict(item) for item in audits],
        "potentialParallelFileOverlaps": parallel_overlaps,
        "expectedSerialFileOverlaps": serial_overlaps,
        "openPullRequests": prs,
        "unregisteredBranches": unregistered,
        "archiveBranches": archive_branches,
        "releaseBranchesMissingRegistry": release_missing_registry,
    }

    health_icon = {"green": "🟢", "yellow": "🟡", "red": "🔴"}[health]
    production_text = (
        "Production im aktuellen Release Train verändert"
        if production_changed
        else "Production unverändert"
    )

    lines = [
        "# GradeCrew Development Status",
        "",
        (
            f"{health_icon} **{active_count} aktive Baustellen** · "
            f"🟡 **{len(parallel_overlaps)} Parallel-Überschneidungen** · "
            f"🔴 **{stale_count} veraltete kritische Branches** · "
            f"🟦 **{integration_ready_count} integrationsbereit** · "
            f"🚀 **{staging_count} auf Staging** · "
            f"**{production_text}**"
        ),
        "",
        f"Erzeugt: `{report['generatedAt']}`",
        f"Audit-Commit: `{report['currentCommit'][:12]}`",
        "",
        "## Aktive / relevante Workstreams",
        "",
        "| Ampel | Workstream | Zustand | Branch | Ziel | SHA | ahead/behind | PR | Release |",
        "|---|---|---|---|---|---|---:|---|---|",
    ]

    for item in audits:
        if item.state not in ACTIVE_STATES and item.state not in {"integrated"}:
            continue
        if not item.branchExists or item.staleCritical:
            icon = "🔴"
        elif (
            item.openPrs
            and item.prBases
            and item.target
            and any(base != item.target for base in item.prBases)
        ):
            icon = "🟡"
        else:
            icon = "🟢"
        delta = "–" if item.ahead is None else f"+{item.ahead}/-{item.behind}"
        pr_text = ", ".join(f"#{value}" for value in item.openPrs) or "–"
        release_text = item.releaseStage or "–"
        lines.append(
            f"| {icon} | {item.title} | {item.state} | `{item.branch}` | "
            f"`{item.target or '–'}` | `{item.sha or 'FEHLT'}` | {delta} | "
            f"{pr_text} | {release_text} |"
        )

    lines.extend(["", "## Potenzielle Parallel-Konflikte", ""])
    if parallel_overlaps:
        for overlap in parallel_overlaps:
            preview = ", ".join(f"`{path}`" for path in overlap["files"][:6])
            suffix = " …" if overlap["count"] > 6 else ""
            lines.append(
                f"- 🟡 **{overlap['left']} ↔ {overlap['right']}**: "
                f"{overlap['count']} Datei(en): {preview}{suffix}"
            )
    else:
        lines.append("- 🟢 Keine aus den aktuellen Diffs ermittelbar.")

    lines.extend(["", "## Erwartete Überschneidungen in Branch-Ketten", ""])
    if serial_overlaps:
        for overlap in serial_overlaps:
            preview = ", ".join(f"`{path}`" for path in overlap["files"][:4])
            suffix = " …" if overlap["count"] > 4 else ""
            lines.append(
                f"- ℹ️ **{overlap['left']} ↔ {overlap['right']}**: "
                f"{overlap['count']} Datei(en): {preview}{suffix}"
            )
    else:
        lines.append("- Keine.")

    lines.extend(["", "## Offene Pull Requests", ""])
    if prs:
        for pr in prs:
            draft = "Draft" if pr.get("draft") else "Ready"
            lines.append(
                f"- #{pr['number']} **{pr['title']}** — "
                f"`{pr['head']}` → `{pr['base']}` · {draft}"
            )
    else:
        lines.append(
            "- Keine offenen PRs gefunden oder PR-Abgleich nicht verfügbar."
        )

    lines.extend(["", "## Nicht klassifizierte Remote-Branches", ""])
    if unregistered:
        for branch in unregistered[:40]:
            lines.append(f"- `{branch}`")
        if len(unregistered) > 40:
            lines.append(f"- … plus {len(unregistered) - 40} weitere")
    else:
        lines.append("- Keine.")

    lines.extend(["", "## Explizite Backup-/Archiv-Branches", ""])
    if archive_branches:
        for branch in archive_branches[:30]:
            lines.append(f"- `{branch}`")
        if len(archive_branches) > 30:
            lines.append(f"- … plus {len(archive_branches) - 30} weitere")
    else:
        lines.append("- Keine.")

    lines.extend(["", "## Fehler / Warnungen", ""])
    lines.extend(f"- 🔴 ERROR: {value}" for value in errors)
    lines.extend(f"- 🟡 WARN: {value}" for value in warnings)
    if not errors and not warnings:
        lines.append("- 🟢 Keine.")

    markdown = "\n".join(lines) + "\n"
    print(markdown)

    if args.json_out:
        pathlib.Path(args.json_out).write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    if args.markdown_out:
        pathlib.Path(args.markdown_out).write_text(markdown, encoding="utf-8")

    if errors and args.fail_on_errors:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
