#!/usr/bin/env python3
"""GradeCrew branch/workstream audit.

No third-party dependencies. Intended for local starts and GitHub Actions.
It never changes refs, branches, PRs, or files.
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
from dataclasses import dataclass, asdict
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "workstreams" / "registry.json"
IGNORED_BRANCHES = {"main"}
IGNORED_PREFIXES = ("v2.",)
ACTIVE_STATES = {"active", "integration_ready", "blocked"}


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


def resolve_branch(name: str) -> str | None:
    for ref in (f"refs/heads/{name}", f"refs/remotes/origin/{name}"):
        if ref_exists(ref):
            return ref
    return None


def short_sha(ref: str | None) -> str | None:
    return run_git("rev-parse", "--short=9", ref) if ref else None


def commit_age_days(ref: str | None) -> int | None:
    if not ref:
        return None
    epoch = int(run_git("show", "-s", "--format=%ct", ref))
    now = int(dt.datetime.now(dt.timezone.utc).timestamp())
    return max(0, (now - epoch) // 86400)


def ahead_behind(target_ref: str, branch_ref: str) -> tuple[int, int]:
    raw = run_git("rev-list", "--left-right", "--count", f"{target_ref}...{branch_ref}")
    behind, ahead = [int(value) for value in raw.split()]
    return ahead, behind


def changed_files(target_ref: str, branch_ref: str) -> set[str]:
    base = run_git("merge-base", target_ref, branch_ref)
    output = run_git("diff", "--name-only", f"{base}..{branch_ref}")
    return {line for line in output.splitlines() if line.strip()}


def remote_branches() -> list[str]:
    raw = run_git("for-each-ref", "--format=%(refname:strip=3)", "refs/remotes/origin")
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
            "User-Agent": "gradecrew-branch-audit",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.load(response)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return [], f"PR-Abgleich fehlgeschlagen: {exc}"
    return [
        {
            "number": pr.get("number"),
            "title": pr.get("title"),
            "draft": bool(pr.get("draft")),
            "head": pr.get("head", {}).get("ref"),
            "base": pr.get("base", {}).get("ref"),
            "url": pr.get("html_url"),
        }
        for pr in payload
    ], None


@dataclass
class WorkstreamAudit:
    id: str
    state: str
    branch: str
    target: str | None
    handoff: str | None
    branchExists: bool
    targetExists: bool | None
    sha: str | None
    ageDays: int | None
    ahead: int | None
    behind: int | None
    changedFileCount: int | None
    openPrs: list[int]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    parser.add_argument("--json-out")
    parser.add_argument("--markdown-out")
    parser.add_argument("--fail-on-warnings", action="store_true")
    args = parser.parse_args()

    registry_path = pathlib.Path(args.registry)
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    allowed_states = set(registry.get("allowedStates", []))
    workstreams = registry.get("workstreams", [])

    errors: list[str] = []
    warnings: list[str] = []
    ids: set[str] = set()
    primary_branches: set[str] = set()

    if registry.get("schemaVersion") != 1:
        errors.append("Unbekannte registry schemaVersion; erwartet: 1.")

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
        if handoff and not (ROOT / handoff).exists() and not ws.get("handoffOptional", False):
            errors.append(f"{ws_id}: Handoff fehlt: {handoff}")

    prs, pr_note = github_open_prs()
    if pr_note:
        warnings.append(pr_note)
    prs_by_head: dict[str, list[dict[str, Any]]] = {}
    for pr in prs:
        prs_by_head.setdefault(str(pr.get("head") or ""), []).append(pr)

    audits: list[WorkstreamAudit] = []
    file_sets: dict[str, set[str]] = {}
    for ws in workstreams:
        ws_id = str(ws.get("id", ""))
        branch = str(ws.get("primaryBranch", ""))
        state = str(ws.get("state", ""))
        target = ws.get("integrationTarget")
        handoff = ws.get("handoff")
        branch_ref = resolve_branch(branch)
        target_ref = resolve_branch(str(target)) if target else None
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

        audits.append(
            WorkstreamAudit(
                id=ws_id,
                state=state,
                branch=branch,
                target=str(target) if target else None,
                handoff=str(handoff) if handoff else None,
                branchExists=bool(branch_ref),
                targetExists=bool(target_ref) if target else None,
                sha=short_sha(branch_ref),
                ageDays=commit_age_days(branch_ref),
                ahead=ahead,
                behind=behind,
                changedFileCount=len(files) if branch_ref and target_ref else None,
                openPrs=[int(pr["number"]) for pr in prs_by_head.get(branch, []) if pr.get("number")],
            )
        )

    overlaps: list[dict[str, Any]] = []
    active_ids = sorted(file_sets)
    for idx, left in enumerate(active_ids):
        for right in active_ids[idx + 1 :]:
            shared = sorted(file_sets[left] & file_sets[right])
            if shared:
                overlaps.append(
                    {
                        "left": left,
                        "right": right,
                        "count": len(shared),
                        "files": shared[:20],
                    }
                )

    registered_all = set(primary_branches)
    for ws in workstreams:
        registered_all.update(str(b) for b in ws.get("relatedBranches", []) if b)
    unregistered = [
        branch for branch in remote_branches()
        if branch not in registered_all
        and branch not in IGNORED_BRANCHES
        and not branch.startswith(IGNORED_PREFIXES)
    ]
    if unregistered:
        warnings.append(
            f"{len(unregistered)} Remote-Branches sind noch nicht klassifiziert. "
            "Nicht löschen; erst einzeln triagieren."
        )

    unregistered_prs = [pr for pr in prs if pr.get("head") and pr.get("head") not in registered_all]
    if unregistered_prs:
        warnings.append(
            "Offene PRs ohne Registry-Zuordnung: "
            + ", ".join(f"#{pr['number']} ({pr['head']})" for pr in unregistered_prs)
        )

    report = {
        "schemaVersion": 1,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "registry": str(registry_path.relative_to(ROOT) if registry_path.is_relative_to(ROOT) else registry_path),
        "currentBranch": run_git("branch", "--show-current", check=False) or None,
        "currentCommit": run_git("rev-parse", "HEAD"),
        "errors": errors,
        "warnings": warnings,
        "workstreams": [asdict(item) for item in audits],
        "potentialFileOverlaps": overlaps,
        "openPullRequests": prs,
        "unregisteredBranches": unregistered,
    }

    lines = [
        "# GradeCrew Branch Audit",
        "",
        f"Commit: `{report['currentCommit'][:12]}`",
        f"Registry: `{report['registry']}`",
        "",
        "| Workstream | Zustand | Branch | SHA | Ziel | ahead/behind | PR |",
        "|---|---|---|---|---|---:|---|",
    ]
    for item in audits:
        ahead_behind_text = "–" if item.ahead is None else f"+{item.ahead}/-{item.behind}"
        pr_text = ", ".join(f"#{value}" for value in item.openPrs) or "–"
        lines.append(
            f"| {item.id} | {item.state} | `{item.branch}` | `{item.sha or 'FEHLT'}` | "
            f"`{item.target or '–'}` | {ahead_behind_text} | {pr_text} |"
        )
    lines.extend(["", "## Potenzielle Datei-Überschneidungen"])
    if overlaps:
        for overlap in overlaps:
            preview = ", ".join(f"`{path}`" for path in overlap["files"][:6])
            suffix = " …" if overlap["count"] > 6 else ""
            lines.append(
                f"- **{overlap['left']} ↔ {overlap['right']}**: {overlap['count']} Datei(en): {preview}{suffix}"
            )
    else:
        lines.append("- Keine aus den verfügbaren Refs ermittelbar.")
    lines.extend(["", "## Nicht klassifizierte Remote-Branches"])
    if unregistered:
        lines.extend(f"- `{branch}`" for branch in unregistered)
    else:
        lines.append("- Keine.")
    lines.extend(["", "## Fehler / Warnungen"])
    lines.extend(f"- ERROR: {value}" for value in errors)
    lines.extend(f"- WARN: {value}" for value in warnings)
    if not errors and not warnings:
        lines.append("- Keine.")
    markdown = "\n".join(lines) + "\n"

    print(markdown)
    if args.json_out:
        pathlib.Path(args.json_out).write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.markdown_out:
        pathlib.Path(args.markdown_out).write_text(markdown, encoding="utf-8")

    if errors:
        return 2
    if warnings and args.fail_on_warnings:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
