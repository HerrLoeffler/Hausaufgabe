#!/usr/bin/env python3
"""Narrow GradeCrew prompt freshness hook and offline App Server fake caller.

This is a review candidate. It is not installed into Codex hook configuration.
"""

from __future__ import annotations

import difflib
import base64
import argparse
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable


REPOSITORY = "HerrLoeffler/Hausaufgabe"
API_ROOT = "https://api.github.com/repos/HerrLoeffler/Hausaufgabe"
POLICY_FILES = (
    "START_HERE.md",
    "AGENTS.md",
    "docs/CHAT_CONTRACT.md",
    "docs/CHAT_RECOVERY.md",
    "docs/skills/GRADECREW_EXECUTION_SKILLS.md",
)
CACHE_SCHEMA = 1
MAX_POLICY_FILE_BYTES = 196_608
MAX_DELTA_CHARS = 1800
POINTER_CACHE_SECONDS = 0
HIGH_IMPACT = re.compile(
    r"^\s*(?:(?:please|could you|can you)\s+)?(?:deploy|release|publish)\b.*\bproduction\b|"
    r"^\s*(?:(?:please|could you|can you)\s+)?(?:force[- ]push|delete|remove)\b.*"
    r"\b(?:repo|repository|branch|project)\b|"
    r"^\s*(?:(?:bitte|kannst du)\s+)?lösche\b.*\b(?:repository|repo|branch)\b",
    re.IGNORECASE,
)


class PreflightError(RuntimeError):
    pass


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _run_git(args: list[str], cwd: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", *args], cwd=cwd, check=True, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=2,
        )
        return result.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return None


def identify_project(
    cwd: str,
    git: Callable[[list[str], str], str | None] = _run_git,
    approved_project_roots: tuple[str, ...] = (),
) -> tuple[str | None, str | None]:
    """Identify exact canonical repo roots or explicit local mirror roots."""
    root = git(["rev-parse", "--show-toplevel"], cwd)
    git_root = str(Path(root).resolve()) if root else None
    if git_root:
        origin = git(["remote", "get-url", "origin"], git_root)
        if origin:
            normalized = origin.strip().removesuffix(".git").rstrip("/")
            accepted = {
                "https://github.com/HerrLoeffler/Hausaufgabe",
                "git@github.com:HerrLoeffler/Hausaufgabe",
                "ssh://git@github.com/HerrLoeffler/Hausaufgabe",
            }
            if normalized in accepted:
                return REPOSITORY, git_root
    for root_entry in approved_project_roots:
        try:
            approved_root = str(Path(root_entry).resolve(strict=True))
        except (OSError, RuntimeError):
            continue
        if not Path(approved_root).is_dir() or not is_within(cwd, approved_root):
            continue
        # A nested checkout (especially one with a different origin) does not
        # inherit the mirror's GradeCrew identity.
        if git_root and git_root != approved_root:
            return None, git_root
        # If the allowed root itself has Git metadata, require its canonical
        # origin check above instead of allowing a mirror-path override.
        if git_root == approved_root:
            return None, git_root
        return REPOSITORY, approved_root
    return None, git_root


def is_within(path: str, root: str) -> bool:
    try:
        Path(path).resolve().relative_to(Path(root).resolve())
        return True
    except (ValueError, OSError):
        return False


def fetch_json(url: str, headers: dict[str, str] | None = None) -> Any:
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/vnd.github+json", "User-Agent": "gradecrew-chat-preflight", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(request, timeout=2.5) as response:
            result = json.loads(response.read(256_000).decode("utf-8"))
            if isinstance(result, dict):
                etag = response.headers.get("ETag")
                if etag:
                    result["_http_etag"] = etag
            return result
    except urllib.error.HTTPError as exc:
        if exc.code == 304:
            return {"_not_modified": True, "_http_etag": exc.headers.get("ETag") if exc.headers else None}
        raise


def fetch_policy_snapshot(
    old: dict[str, Any] | None = None,
    fetch: Callable[..., Any] = fetch_json,
    pointer_cache_ttl_seconds: int = POINTER_CACHE_SECONDS,
) -> dict[str, Any]:
    now = time.time()
    checked_at = old.get("checked_at") if isinstance(old, dict) else None
    if pointer_cache_ttl_seconds > 0 and isinstance(checked_at, (int, float)) and 0 <= now - checked_at < pointer_cache_ttl_seconds:
        return {**old, "freshness": "cached-verified"}
    request_headers = {"If-None-Match": old["etag"]} if old and isinstance(old.get("etag"), str) else None
    commit_info = fetch(f"{API_ROOT}/commits/main", request_headers)
    if isinstance(commit_info, dict) and commit_info.get("_not_modified") is True:
        if not old or not isinstance(old.get("commit"), str) or not isinstance(old.get("files"), dict):
            raise PreflightError("GitHub returned 304 without a usable cached policy snapshot")
        fresh = {key: value for key, value in old.items() if key != "freshness"}
        fresh.update({"checked_at": now, "freshness": "current"})
        if commit_info.get("_http_etag"):
            fresh["etag"] = commit_info["_http_etag"]
        return fresh
    commit = commit_info.get("sha") if isinstance(commit_info, dict) else None
    if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise PreflightError("GitHub did not return a valid main commit SHA")
    if old and old.get("commit") == commit:
        fresh = {key: value for key, value in old.items() if key != "freshness"}
        fresh.update({"checked_at": now, "freshness": "current"})
        if commit_info.get("_http_etag"):
            fresh["etag"] = commit_info["_http_etag"]
        return fresh
    files: dict[str, dict[str, str]] = {}
    for path in POLICY_FILES:
        from urllib.parse import quote

        content = fetch(f"{API_ROOT}/contents/{quote(path)}?ref={commit}")
        if not isinstance(content, dict) or content.get("encoding") != "base64":
            raise PreflightError(f"Could not read authoritative policy file: {path}")
        raw = base64.b64decode(content.get("content", ""), validate=False)
        if len(raw) > MAX_POLICY_FILE_BYTES:
            raise PreflightError(f"Policy file exceeds the bounded read size: {path}")
        text = raw.decode("utf-8")
        files[path] = {"sha256": sha256_text(text), "text": text}
    snapshot = {"schema": CACHE_SCHEMA, "repository": REPOSITORY, "commit": commit, "files": files, "checked_at": now}
    if commit_info.get("_http_etag"):
        snapshot["etag"] = commit_info["_http_etag"]
    return snapshot


def load_cache(path: Path) -> dict[str, Any] | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("schema") == CACHE_SCHEMA and data.get("repository") == REPOSITORY:
            return data
    except (OSError, ValueError, AttributeError):
        pass
    return None


def load_runtime_profile(path: Path) -> dict[str, Any]:
    """Read the explicit, local project-root allowlist; never inspect credentials."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("schema") != 1:
        raise PreflightError("Preflight profile must be a JSON object with schema=1")
    roots = data.get("approved_project_roots", [])
    if not isinstance(roots, list) or any(not isinstance(item, str) or not Path(item).is_absolute() for item in roots):
        raise PreflightError("approved_project_roots must contain only absolute local paths")
    ttl = data.get("pointer_cache_ttl_seconds", 0)
    if isinstance(ttl, bool) or not isinstance(ttl, int) or ttl < 0 or ttl > 3600:
        raise PreflightError("pointer_cache_ttl_seconds must be an explicit integer from 0 to 3600")
    qualification_mode = data.get("qualification_mode")
    if qualification_mode not in (None, "block"):
        raise PreflightError("qualification_mode must be omitted or set to 'block'")
    return {
        "approved_project_roots": tuple(roots),
        "pointer_cache_ttl_seconds": ttl,
        "qualification_mode": qualification_mode,
    }


def save_cache(path: Path, snapshot: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if path.parent.is_symlink() or not path.parent.is_dir():
        raise PreflightError("Cache directory must be a real private directory")
    os.chmod(path.parent, 0o700)
    if stat.S_IMODE(path.parent.stat().st_mode) != 0o700:
        raise PreflightError("Cache directory permissions could not be restricted")
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    os.close(fd)
    tmp = Path(tmp_name)
    try:
        tmp.write_text(json.dumps(snapshot, ensure_ascii=False, sort_keys=True), encoding="utf-8")
        os.chmod(tmp, 0o600)
        os.replace(tmp, path)
    finally:
        try:
            tmp.unlink()
        except FileNotFoundError:
            pass


def policy_delta(old: dict[str, Any] | None, new: dict[str, Any]) -> str:
    if old is None:
        return "Policy baseline initialized; review the current project rules before acting."
    chunks: list[str] = []
    old_files, new_files = old.get("files", {}), new.get("files", {})
    for path in POLICY_FILES:
        before = old_files.get(path, {}).get("text", "").splitlines()
        after = new_files.get(path, {}).get("text", "").splitlines()
        if old_files.get(path, {}).get("sha256") == new_files.get(path, {}).get("sha256"):
            continue
        diff = list(difflib.unified_diff(before, after, fromfile=f"cached/{path}", tofile=f"main/{path}", n=1))
        if diff:
            chunks.append("\n".join(diff))
    if not chunks:
        return "Main advanced; governed policy content is unchanged."
    result = "\n".join(chunks)
    if len(result) > MAX_DELTA_CHARS:
        return result[:MAX_DELTA_CHARS].rstrip() + "\n[policy delta truncated; inspect the named authoritative files before acting]"
    return result


def preflight_context(
    event: dict[str, Any],
    cache_path: Path,
    fetcher: Callable[[dict[str, Any] | None], dict[str, Any]] = fetch_policy_snapshot,
    git: Callable[[list[str], str], str | None] = _run_git,
    approved_project_roots: tuple[str, ...] = (),
    pointer_cache_ttl_seconds: int = POINTER_CACHE_SECONDS,
) -> dict[str, Any]:
    cwd = event.get("cwd")
    if not isinstance(cwd, str) or not cwd:
        return {"project": "unknown", "model": event.get("model") or "unknown", "effort": "unknown", "freshness": "unknown", "context": "Project identity is unknown; do not assume GradeCrew role or rules."}
    project, root = identify_project(cwd, git, approved_project_roots)
    if project != REPOSITORY or root is None or not is_within(cwd, root):
        return {"project": "unknown", "model": event.get("model") or "unknown", "effort": "unknown", "freshness": "unknown", "context": "Project identity is unknown; do not infer GradeCrew scope or role from chat/session identity."}

    old = load_cache(cache_path)
    actual_model = event.get("model") if isinstance(event.get("model"), str) and event.get("model") else "unknown"
    effort = "unknown"  # UserPromptSubmit's documented input has no effort field.
    try:
        latest = fetcher(old, pointer_cache_ttl_seconds=pointer_cache_ttl_seconds) if fetcher is fetch_policy_snapshot else fetcher(old)
    except Exception as exc:  # Network/cache failures must be surfaced without broad blocking.
        freshness = "unverified"
        cached_commit = old.get("commit", "none") if old else "none"
        checked_at = old.get("checked_at") if old else None
        last_verified = datetime.fromtimestamp(checked_at, timezone.utc).isoformat() if isinstance(checked_at, (int, float)) else "unknown"
        prompt = event.get("prompt") if isinstance(event.get("prompt"), str) else ""
        blocked = bool(HIGH_IMPACT.search(prompt))
        context = f"GradeCrew policy freshness unverified; cached main={cached_commit}, last verified={last_verified}. Model={actual_model}; effort=unknown. Role remains unresolved."
        error = type(exc).__name__
        if isinstance(exc, urllib.error.HTTPError):
            error = f"HTTP {exc.code}"
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            if retry_after and retry_after.isdigit():
                error += f"; retry-after={min(int(retry_after), 300)}s (no automatic retry)"
        output: dict[str, Any] = {"project": REPOSITORY, "model": actual_model, "effort": effort, "freshness": freshness, "context": context, "error": error}
        if blocked:
            output["decision"] = "block"
            output["reason"] = "Current GradeCrew policy could not be verified for this production or destructive action. Refresh the authoritative rules, then resubmit."
        return output

    freshness = latest.get("freshness") or ("current" if old and old.get("commit") == latest.get("commit") else "updated")
    if freshness == "cached-verified":
        checked_at = latest.get("checked_at")
        verified = datetime.fromtimestamp(checked_at, timezone.utc).isoformat() if isinstance(checked_at, (int, float)) else "unknown"
        delta = f"Main pointer last verified at {verified}; reused within the explicitly configured cache TTL."
    else:
        delta = "Rules checked against current main; no policy changes." if freshness == "current" else policy_delta(old, latest)
    save_cache(cache_path, latest)
    context = (
        f"GradeCrew rules checked at main {latest['commit'][:12]} ({freshness}). {delta}\n"
        f"Current model={actual_model}; effort=unknown. Repository identity establishes project scope only; role is unresolved. "
        "State the evidenced project stage and one concrete next autonomous step; continue already-authorized work."
    )
    return {"project": REPOSITORY, "model": actual_model, "effort": effort, "freshness": freshness, "context": context}


def hook_main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--profile", type=Path)
    args = parser.parse_args(argv)
    try:
        event = json.load(sys.stdin)
    except (ValueError, OSError):
        return 0
    if not isinstance(event, dict):
        return 0
    try:
        profile = load_runtime_profile(args.profile) if args.profile else {
            "approved_project_roots": (),
            "pointer_cache_ttl_seconds": 0,
            "qualification_mode": None,
        }
    except (OSError, ValueError, PreflightError):
        # A user-level hook must fail silently when it cannot prove project scope.
        return 0
    cwd = event.get("cwd")
    if not isinstance(cwd, str) or not cwd:
        return 0
    project, root = identify_project(cwd, approved_project_roots=profile["approved_project_roots"])
    if project != REPOSITORY or root is None or not is_within(cwd, root):
        return 0
    if profile["qualification_mode"] == "block":
        print(json.dumps({"decision": "block", "reason": "GC-CHAT-PREFLIGHT-01 local qualification sentinel"}, ensure_ascii=False))
        return 0
    cache_root = Path(os.environ.get("TMPDIR", tempfile.gettempdir())) / "gradecrew-chat-preflight"
    cache_path = cache_root / "policy.json"
    result = preflight_context(
        event, cache_path, approved_project_roots=profile["approved_project_roots"],
        pointer_cache_ttl_seconds=profile["pointer_cache_ttl_seconds"],
    )
    if result.get("project") != REPOSITORY:
        return 0
    if result.get("decision") == "block":
        print(json.dumps({"decision": "block", "reason": result["reason"]}, ensure_ascii=False))
        return 0
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": result["context"]}}, ensure_ascii=False))
    return 0


# Small deterministic fake-caller probe. This models only an App Server client
# that owns turn/start; it does not make an inference or connect to Desktop.
def choose_model(task_class: str, available: list[dict[str, Any]], reason_for_high: str | None = None) -> tuple[str, str]:
    targets = {
        "routine": ("gpt-6-luna", "medium"),
        "cross_area": ("gpt-6.1-sol", "medium"),
        "difficult": ("gpt-6.1-sol", "high" if reason_for_high else "medium"),
    }
    if task_class not in targets:
        raise PreflightError("Task class must be routine, cross_area, or difficult")
    target_model, target_effort = targets[task_class]
    model = next((m for m in available if m.get("model") == target_model), None)
    if model is None:
        raise PreflightError(f"Chosen model {target_model} is not advertised; stop before turn/start")
    supported = {e.get("reasoningEffort") for e in model.get("supportedReasoningEfforts", []) if isinstance(e, dict)}
    if target_effort not in supported:
        raise PreflightError(f"Chosen effort {target_effort} is not advertised for {target_model}; stop before turn/start")
    return target_model, target_effort


class FakeAppServer:
    def __init__(self, models: list[dict[str, Any]]) -> None:
        self.models = models
        self.calls: list[dict[str, Any]] = []

    def model_list(self) -> list[dict[str, Any]]:
        self.calls.append({"method": "model/list"})
        return self.models

    def turn_start(self, thread_id: str, model: str, effort: str, input_text: str) -> dict[str, Any]:
        if not model or not effort:
            raise AssertionError("fake caller must set model and effort explicitly")
        call = {"method": "turn/start", "threadId": thread_id, "model": model, "effort": effort, "input": input_text}
        self.calls.append(call)
        return {"turn": {"status": "inProgress", "model": None, "effort": None}}


if __name__ == "__main__":
    hook_main()
