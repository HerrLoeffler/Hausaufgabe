"""Bounded adapter for the existing skill-creator validator, no automatic setup."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser()
    default = Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex")))
    parser.add_argument("--validator", type=Path, default=default / "skills/.system/skill-creator/scripts/quick_validate.py")
    args = parser.parse_args()
    # One preflight, before any per-skill process. Never install dependencies here.
    try:
        import yaml  # noqa: F401
    except ModuleNotFoundError:
        print(json.dumps({"status": "dependency_missing", "dependency": "PyYAML", "validator_runs": 0, "python": sys.executable}))
        return 2
    if not args.validator.is_file():
        print(json.dumps({"status": "validator_missing", "validator_runs": 0}))
        return 3
    folders = sorted(p.parent for p in (Path(__file__).resolve().parents[1] / "skills").glob("*/SKILL.md"))
    if not folders:
        print(json.dumps({"status": "no_skills", "validator_runs": 0}))
        return 4
    results = []
    for folder in folders:
        run = subprocess.run([sys.executable, str(args.validator), str(folder)], capture_output=True, text=True)
        results.append({"skill": folder.name, "exit_code": run.returncode, "output": run.stdout.strip(), "error": run.stderr.strip()})
        if run.returncode:
            break
    passed = len(results) == len(folders) and all(x["exit_code"] == 0 for x in results)
    print(json.dumps({"status": "passed" if passed else "failed", "python": sys.executable,
                      "validator": str(args.validator), "validator_runs": len(results), "results": results}, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
