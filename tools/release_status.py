#!/usr/bin/env python3
"""Print the current GradeCrew release train and workstream stages.

GRADECREW_STATE.json is the source of truth. This tool is intentionally read-only.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "GRADECREW_STATE.json"
STAGES = ["branch_only", "ci_green", "integrated", "staging_deployed", "user_tested", "production"]


def main() -> int:
    data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    model = data.get("status_model", {})
    configured = model.get("ordered_stages", STAGES)
    if configured != STAGES:
        raise SystemExit(f"Unexpected stage model: {configured}")

    release = data.get("release_train", {})
    print(f"GradeCrew release state — observed {data.get('observed_at', 'unknown')}")
    print(f"Release train: {release.get('id', 'none')}")
    print(f"Integration: {release.get('integration_branch', '-')} @ {release.get('observed_integration_head', '-')}")
    included = release.get("included_workstreams", [])
    print("Included: " + (", ".join(included) if included else "none"))

    gates = release.get("gates", {})
    if gates:
        print("\nGates:")
        for key, value in gates.items():
            print(f"  - {key}: {value}")

    print("\nWorkstreams:")
    for item in data.get("workstreams", []):
        stage = item.get("stage", "unknown")
        branch = item.get("branch", "-")
        head = item.get("observed_head", "-")
        staging = item.get("staging", "-")
        user_test = item.get("user_test", "-")
        print(f"  - {item.get('id', '?')}: {stage} | {branch}@{head[:8]} | staging={staging} | user={user_test}")
        if item.get("next_action"):
            print(f"      next: {item['next_action']}")

    blockers = data.get("blockers", [])
    if blockers:
        print("\nBlockers:")
        for blocker in blockers:
            print(f"  - {blocker}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
