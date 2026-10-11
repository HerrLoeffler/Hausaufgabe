"""Exercise validation of Remy's missing-field replies with Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
policy_source = root / "Sources/QuickRemyFollowUpPolicy.swift"
assert policy_source.is_file(), "Quick Remy follow-up policy is not implemented yet."

checks = r'''
let allRequired = ["subject", "grade", "topic", "count"]
assert(QuickRemyFollowUpPolicy.question(
    status: "needsInfo", missingFields: allRequired,
    question: "Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben soll ich verwenden?"
) == "Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben soll ich verwenden?")
assert(QuickRemyFollowUpPolicy.question(
    status: "needsInfo", missingFields: ["topic"], question: "Welches Thema?"
) == "Welches Thema?")
assert(QuickRemyFollowUpPolicy.question(
    status: "needsInfo", missingFields: ["subject", "subject"], question: "Welches Fach?"
) == nil)
assert(QuickRemyFollowUpPolicy.question(
    status: "needsInfo", missingFields: ["uid"], question: "Wer bist du?"
) == nil)
assert(QuickRemyFollowUpPolicy.question(
    status: "ready", missingFields: allRequired, question: "Bitte ergänzen."
) == nil)
print("Quick Remy follow-up policy: passed (all four fields, valid single field, malformed replies)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "followup.swift"
    script.write_text("import Foundation\n" + policy_source.read_text() + "\n" + checks)
    subprocess.run(["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)], check=True)
