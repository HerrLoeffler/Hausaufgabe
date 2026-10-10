"""Require a complete expected test set from this invocation's fresh directory."""
import json
import sys
from pathlib import Path


known_tests = {
    "GradeCrew.Lerninsel.Controls",
    "GradeCrew.Lerninsel.FourPuzzles",
    "GradeCrew.Lerninsel.Fox",
    "GradeCrew.Lerninsel.Play",
    "GradeCrew.Lerninsel.RuntimeSequence",
    "GradeCrew.Lerninsel.WorldPreview",
}
report_path, requested_prefix = sys.argv[1:]
try:
    report = json.loads(Path(report_path).read_text(encoding="utf-8-sig"))
except (OSError, ValueError) as error:
    raise SystemExit(f"No readable fresh automation report: {error}")

expected = {name for name in known_tests if name.startswith(requested_prefix)}
tests = report.get("tests", [])
assert expected, f"Unknown Lerninsel test prefix: {requested_prefix}"
assert {test["fullTestPath"] for test in tests} == expected, "Unexpected test set"
assert len(tests) == len(expected), "Missing or duplicate tests"
assert all(report.get(field) == 0 for field in ("failed", "notRun", "inProcess")), "Incomplete or failed run"
assert all(test["state"] == "Success" and test["errors"] == 0 for test in tests), "Unsuccessful test"
assert report["succeeded"] + report["succeededWithWarnings"] == len(expected), "Wrong completed count"
print("Fresh UE tests:", len(expected), "passed; warnings:", sum(test["warnings"] for test in tests))
for test in tests:
    print(test["fullTestPath"], test["state"], "errors", test["errors"], "warnings", test["warnings"])
