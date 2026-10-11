"""Exercise the value model used by Remy's editable field summary."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
source = root / "Sources" / "QuickRemyDraft.swift"
checks = r'''
let draft = QuickRemyDraft(payload: [
    "subject": "Englisch",
    "grade": "4",
    "topic": "Farben und Schulsachen"
])
assert(draft.subject == "Englisch")
assert(draft.grade == "4")
assert(draft.topic == "Farben und Schulsachen")
assert(draft.count.isEmpty)
assert(draft.preparedRequest == nil)
assert(draft.knownFieldsPayload["subject"] as? String == "Englisch")
assert(draft.knownFieldsPayload["grade"] as? String == "4")
assert(draft.knownFieldsPayload["topic"] as? String == "Farben und Schulsachen")
assert(draft.knownFieldsPayload["count"] == nil)

var complete = draft
complete.count = "5"
let prepared = complete.preparedRequest!
assert(prepared["subject"] as? String == "Englisch")
assert(prepared["grade"] as? String == "4")
assert(prepared["topic"] as? String == "Farben und Schulsachen")
assert(prepared["count"] as? Int == 5)
complete.count = "0"
assert(complete.preparedRequest == nil)
complete.count = "101"
assert(complete.preparedRequest == nil)
print("Quick Remy draft: passed (partial values persist, complete values validate, invalid count is rejected)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "draft.swift"
    script.write_text((source.read_text() if source.exists() else "import Foundation\n") + "\n" + checks)
    result = subprocess.run(
        ["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)],
        text=True, capture_output=True
    )
    assert result.returncode == 0, result.stderr
    print(result.stdout, end="")
