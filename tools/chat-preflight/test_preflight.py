#!/usr/bin/env python3
"""Offline regression tests for the GradeCrew chat preflight candidate."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from preflight import *  # noqa: F401,F403 - test the real candidate functions


class PreflightRegressionTests(unittest.TestCase):
    def test_offline_regression_matrix(self) -> None:
        import tempfile as _tempfile

        def identity_git(args: list[str], cwd: str) -> str | None:
            if args == ["rev-parse", "--show-toplevel"]:
                return "/work/Hausaufgabe"
            if args == ["remote", "get-url", "origin"]:
                return "https://github.com/HerrLoeffler/Hausaufgabe.git"
            return None

        with _tempfile.TemporaryDirectory() as temp:
            mirror_root = Path(temp) / "gradecrew-project-mirror"
            mirror_root.mkdir()
            nested_foreign = mirror_root / "foreign-checkout"
            nested_foreign.mkdir()

            def mirror_git(args: list[str], cwd: str) -> str | None:
                if args == ["rev-parse", "--show-toplevel"]:
                    if Path(cwd).resolve() == nested_foreign.resolve():
                        return str(nested_foreign)
                    if is_within(cwd, str(mirror_root)):
                        return None
                if args == ["remote", "get-url", "origin"] and Path(cwd).resolve() == nested_foreign.resolve():
                    return "https://github.com/elsewhere/unrelated.git"
                return None

            allowed = (str(mirror_root),)
            canonical_mirror = str(mirror_root.resolve())
            assert identify_project(str(mirror_root), mirror_git, allowed) == (REPOSITORY, canonical_mirror)
            assert identify_project(str(mirror_root / "sources"), mirror_git, allowed) == (REPOSITORY, canonical_mirror)
            assert identify_project(str(nested_foreign), mirror_git, allowed) == (None, str(nested_foreign.resolve()))
            mirror_result = preflight_context(
                {"cwd": str(mirror_root), "prompt": "status", "model": None},
                Path(temp) / "mirror-cache.json",
                lambda old: {"schema": 1, "repository": REPOSITORY, "commit": "e" * 40, "files": {}},
                mirror_git,
                allowed,
            )
            assert mirror_result["project"] == REPOSITORY and "role is unresolved" in mirror_result["context"]

            # Exercise the real snapshot fetcher with an in-memory HTTP fake: a
            # recent check reuses cache; an expired pointer costs one request; a
            # changed pointer reads bounded files pinned to that exact commit.
            unchanged_calls: list[str] = []

            def unchanged_fetch(url: str, headers: dict[str, str] | None = None) -> Any:
                unchanged_calls.append(url)
                return {"sha": "c" * 40}

            cached = {"schema": 1, "repository": REPOSITORY, "commit": "c" * 40, "files": {}}
            fetched = fetch_policy_snapshot(cached, unchanged_fetch)
            assert fetched["commit"] == cached["commit"] and len(unchanged_calls) == 1
            assert unchanged_calls == [f"{API_ROOT}/commits/main"]

            recent = {**cached, "checked_at": time.time(), "etag": '"main-pointer-v1"', "freshness": "cached-verified"}
            pointer_calls: list[tuple[str, dict[str, str]]] = []

            def not_modified_fetch(url: str, headers: dict[str, str] | None = None) -> Any:
                pointer_calls.append((url, headers or {}))
                return {"_not_modified": True, "_http_etag": '"main-pointer-v1"'}

            current = fetch_policy_snapshot(recent, not_modified_fetch)
            assert current["freshness"] == "current" and current["commit"] == "c" * 40
            assert current["checked_at"] >= recent["checked_at"]
            assert pointer_calls == [(f"{API_ROOT}/commits/main", {"If-None-Match": '"main-pointer-v1"'})]
            recent_reuse = fetch_policy_snapshot(recent, lambda url, headers=None: (_ for _ in ()).throw(AssertionError("default TTL must poll every Enter")), pointer_cache_ttl_seconds=60)
            assert recent_reuse["freshness"] == "cached-verified"

            profile_path = Path(temp) / "profile.json"
            profile_path.write_text(json.dumps({"schema": 1, "approved_project_roots": [str(mirror_root)], "pointer_cache_ttl_seconds": 0}), encoding="utf-8")
            profile = load_runtime_profile(profile_path)
            assert profile["approved_project_roots"] == (str(mirror_root),) and profile["pointer_cache_ttl_seconds"] == 0
            profile_path.write_text(json.dumps({"schema": 1, "approved_project_roots": ["relative/path"]}), encoding="utf-8")
            try:
                load_runtime_profile(profile_path)
            except PreflightError:
                pass
            else:
                raise AssertionError("relative project root must be rejected")

            changed_calls: list[str] = []
            encoded_policy = base64.b64encode(b"# verified rule\n").decode("ascii")

            def changed_fetch(url: str, headers: dict[str, str] | None = None) -> Any:
                changed_calls.append(url)
                if url == f"{API_ROOT}/commits/main":
                    return {"sha": "d" * 40}
                return {"encoding": "base64", "content": encoded_policy}

            updated = fetch_policy_snapshot(cached, changed_fetch)
            assert updated["commit"] == "d" * 40 and len(updated["files"]) == len(POLICY_FILES)
            assert len(changed_calls) == 1 + len(POLICY_FILES)
            assert all("ref=" + "d" * 40 in call for call in changed_calls[1:])

            cache = Path(temp) / "cache.json"
            snap1 = {"schema": 1, "repository": REPOSITORY, "commit": "a" * 40, "files": {p: {"sha256": sha256_text("stable"), "text": "stable\n"} for p in POLICY_FILES}}
            snap2 = {"schema": 1, "repository": REPOSITORY, "commit": "b" * 40, "files": {p: {"sha256": sha256_text("stable\nupdated rule" if p == "AGENTS.md" else "stable"), "text": "stable\nupdated rule\n" if p == "AGENTS.md" else "stable\n"} for p in POLICY_FILES}}
            fetch_counts = {"main": 0, "policy": 0}

            def refresh(old: dict[str, Any] | None) -> dict[str, Any]:
                fetch_counts["main"] += 1
                latest = snap2 if fetch_counts["main"] >= 4 else snap1
                if old and old.get("commit") == latest["commit"]:
                    return old
                fetch_counts["policy"] += len(POLICY_FILES)
                return latest

            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "summarize this", "model": "gpt-6-luna"}, cache, refresh, identity_git)
            assert result["freshness"] == "updated" and result["model"] == "gpt-6-luna" and result["effort"] == "unknown"
            assert "Policy baseline initialized" in result["context"]
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "next step?", "model": "gpt-6.1-sol"}, cache, refresh, identity_git)
            assert result["freshness"] == "current" and "no policy changes" in result["context"]
            assert result["model"] == "gpt-6.1-sol" and result["effort"] == "unknown"
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "routine check", "model": None}, cache, refresh, identity_git)
            assert result["model"] == "unknown" and result["effort"] == "unknown" and "role is unresolved" in result["context"]
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "continue authorized work", "model": "gpt-6.1-sol"}, cache, refresh, identity_git)
            assert result["freshness"] == "updated" and "updated rule" in result["context"]
            assert fetch_counts == {"main": 4, "policy": len(POLICY_FILES) * 2}
            result = preflight_context({"cwd": "/other/project", "prompt": "anything", "model": None}, cache, lambda old: (_ for _ in ()).throw(AssertionError("must not fetch unknown project")), identity_git)
            assert result["project"] == "unknown" and result["model"] == "unknown" and result["effort"] == "unknown"
            def unavailable() -> dict[str, Any]:
                raise urllib.error.URLError("offline")
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "Please deploy this to production", "model": None}, cache, lambda old: unavailable(), identity_git)
            assert result["decision"] == "block" and result["model"] == "unknown" and result["effort"] == "unknown"
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "Can you explain the production deploy plan?", "model": None}, cache, lambda old: unavailable(), identity_git)
            assert "decision" not in result and result["freshness"] == "unverified"
            def rate_limited(old: dict[str, Any] | None) -> dict[str, Any]:
                raise urllib.error.HTTPError("https://api.github.com", 429, "rate limited", {"Retry-After": "900"}, None)
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "status", "model": None}, cache, rate_limited, identity_git)
            assert "HTTP 429" in result["error"] and "retry-after=300s" in result["error"] and "decision" not in result
            assert "last verified=unknown" in result["context"]
            result = preflight_context({"cwd": "/work/Hausaufgabe", "prompt": "status only", "model": None}, cache, lambda old: unavailable(), identity_git)
            assert "decision" not in result and result["freshness"] == "unverified"

        models = [
            {"model": "gpt-6-luna", "supportedReasoningEfforts": [{"reasoningEffort": "medium"}]},
            {"model": "gpt-6.1-sol", "supportedReasoningEfforts": [{"reasoningEffort": "medium"}, {"reasoningEffort": "high"}]},
        ]
        cases = [("routine", None, "gpt-6-luna", "medium"), ("cross_area", None, "gpt-6.1-sol", "medium"), ("difficult", "security conflict", "gpt-6.1-sol", "high"), ("difficult", None, "gpt-6.1-sol", "medium")]
        for task_class, reason, expected_model, expected_effort in cases:
            server = FakeAppServer(models)
            available = server.model_list()
            model, effort = choose_model(task_class, available, reason)
            response = server.turn_start("thread-fake", model, effort, "synthetic input")
            assert [call["method"] for call in server.calls] == ["model/list", "turn/start"]
            assert server.calls[1]["model"] == expected_model and server.calls[1]["effort"] == expected_effort
            assert response["turn"]["model"] is None and response["turn"]["effort"] is None
        try:
            choose_model("routine", models[1:], None)
        except PreflightError:
            pass
        else:
            raise AssertionError("missing selected model must stop before turn/start")

        print("offline preflight probe: PASS (fresh/current/delta/unknown-scope/unknown-model/scoped-offline-block/model-list-before-explicit-turn-start; no inference)")



if __name__ == "__main__":
    unittest.main()
