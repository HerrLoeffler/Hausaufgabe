"""Exercise the value model used by Remy's editable field summary."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
source = root / "Sources" / "QuickRemyDraft.swift"
checks = r'''
var spoken = QuickRemyDraft()
spoken.applySpeechHints("Vierte Klasse Englisch Farben und Schulsachen")
assert(spoken.subject == "Englisch")
assert(spoken.grade == "4")
spoken.topic = "Farben und Schulsachen"
spoken.applySpeechHints("fünf", expectingCount: true)
assert(spoken.count == "5")
assert(spoken.subject == "Englisch" && spoken.grade == "4" && spoken.topic == "Farben und Schulsachen")
spoken.applySpeechHints("Mathe Klasse 6 zehn Aufgaben")
assert(spoken.subject == "Mathematik" && spoken.grade == "6" && spoken.count == "10")
var ambiguous = QuickRemyDraft()
ambiguous.applySpeechHints("Ich brauche etwas für morgen")
assert(ambiguous.subject.isEmpty && ambiguous.grade.isEmpty && ambiguous.count.isEmpty)

let draft = QuickRemyDraft(payload: [
    "subject": "Englisch",
    "grade": "4",
    "topic": "Farben und Schulsachen",
    "customNotes": "Bitte ohne Bilder."
])
assert(draft.subject == "Englisch")
assert(draft.grade == "4")
assert(draft.topic == "Farben und Schulsachen")
assert(draft.wishes == "Bitte ohne Bilder.")
assert(draft.count.isEmpty)
assert(draft.preparedRequest == nil)
assert(draft.knownFieldsPayload["subject"] as? String == "Englisch")
assert(draft.knownFieldsPayload["grade"] as? String == "4")
assert(draft.knownFieldsPayload["topic"] as? String == "Farben und Schulsachen")
assert(draft.knownFieldsPayload["count"] == nil)
assert(draft.knownFieldsPayload["schoolType"] as? String == "Mittelschule")
assert(draft.knownFieldsPayload["region"] as? String == "Bayern")
assert(draft.knownFieldsPayload["difficulty"] as? String == "mittel")
assert(draft.knownFieldsPayload["imageQuestionCount"] as? Int == 0)

var complete = draft
complete.count = "5"
complete.schoolType = "Grundschule"
complete.region = "Bayern"
complete.difficulty = "leicht"
complete.points = "10"
complete.imageQuestionCount = "3"
let prepared = complete.preparedRequest!
assert(prepared["subject"] as? String == "Englisch")
assert(prepared["grade"] as? String == "4")
assert(prepared["topic"] as? String == "Farben und Schulsachen")
assert(prepared["count"] as? Int == 5)
assert(prepared["customNotes"] as? String == "Bitte ohne Bilder.")
assert(complete.knownFieldsPayload["schoolType"] as? String == "Grundschule")
assert(complete.knownFieldsPayload["difficulty"] as? String == "leicht")
assert(complete.knownFieldsPayload["points"] as? Double == 10)
assert(complete.knownFieldsPayload["imageQuestionCount"] as? Int == 3)
complete.audioQuestionCount = "2"
complete.audioAnswerQuestionCount = "3"
assert(complete.knownFieldsPayload["audioQuestionCount"] as? Int == 2)
assert(complete.knownFieldsPayload["audioAnswerQuestionCount"] as? Int == 3)
assert(complete.validationError(allowedTypes: ["single"]) == nil)
assert(complete.validationError(allowedTypes: ["text"]) != nil)
complete.audioQuestionCount = "6"
assert(complete.validationError(allowedTypes: ["single"]) != nil)
spoken.applySpeechHints("davon zwei Höraufgaben und drei Audioantworten")
assert(spoken.audioQuestionCount == "2" && spoken.audioAnswerQuestionCount == "3")
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
