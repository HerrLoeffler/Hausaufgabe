"""Guard the native Remy quick workflow and its hidden web service bridge."""
from pathlib import Path

root = Path(__file__).parent / "Sources"
teacher = (root / "TeacherRootView.swift").read_text()
remy = (root / "QuickRemyView.swift").read_text()
bridge = (root / "TeacherWebPortalView.swift").read_text()

assert "authFormPresented = true" in teacher and "GradeCrewAuthView(" in teacher
assert "case .signedIn(_, _):" in teacher and "homeMenuScreen" in teacher
assert 'Mit GradeCrew anmelden' not in teacher
assert 'call: quickRemyCall,' in teacher
assert ".opacity(route == .workspace ? 1 : 0)" in teacher
assert ".allowsHitTesting(route == .workspace)" in teacher
assert "if route == .quickRemy {" in teacher and "QuickRemyView(onBack:" in teacher

assert "ScrollView" in remy
assert "Button(action: toggleRemyRecording)" in remy
assert 'Sprich mir schnell ein, was du willst.' in remy
assert 'Button("An Remy senden")' not in remy and 'return "An Remy senden"' not in remy
for field in ["Fach", "Klasse", "Schulart", "Bundesland", "Thema", "Aufgaben", "Gesamtpunkte", "Aufgaben mit Bild (0–5)"]:
    assert f'nativeField("{field}"' in remy, f"Native form field missing: {field}"
assert 'Text("Eigene Wünsche (optional)")' in remy
assert 'Button(action: toggleWishesRecording)' in remy
assert 'Test erstellen' in remy and 'invoke("createAiTest"' in remy
assert 'Image(GradeCrewAssets.NativeImage.remyMicrophone)' in remy
assert '.frame(width: 220, height: 220)' in remy
assert 'Task { await prepareTranscript(transcript) }' in remy
assert 'invoke("openAiForm", payload: [:])' in remy
assert '"knownFields": draft.knownFieldsPayload' in remy
assert "action === 'populateAiForm'" in bridge
assert bridge.count("const selectedTypes = new Set") == 1
for field in ["aiSchoolType", "aiRegion", "aiDifficulty", "aiPoints", "aiImageQuestionCount"]:
    assert field in bridge
assert "route == .quickRemy ? 1 : 0" not in teacher
print("GradeCrew native screen layout: passed (native-only route, tap-Remy capture, native test form and GradeCrew submission bridge)")
