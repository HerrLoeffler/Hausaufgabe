"""Protect the persistent sign-in gate and keyboard-safe Remy navigation layout."""
from pathlib import Path

root = Path(__file__).parent / "Sources"
teacher = (root / "TeacherRootView.swift").read_text()
remy = (root / "QuickRemyView.swift").read_text()

assert "case .signedOut:" in teacher and "GradeCrewSignInScreen(" in teacher
assert "case .signedIn(_, _):" in teacher and "homeMenuScreen" in teacher
assert 'Label("Mit GradeCrew anmelden"' in teacher
assert "GradeCrewAssets.NativeImage.brandIcon" in teacher
assert "GradeCrewAssets.NativeImage.brandPrimary" not in teacher
assert ".clipShape(Circle())" in teacher
assert ".font(.system(size: 24, weight: .semibold, design: .rounded))" in teacher

body = remy.split("var body: some View {", 1)[1].split("private var navigationHeader", 1)[0]
assert body.index("navigationHeader") < body.index("ScrollView"), "The back button must stay outside the scrolling/keyboard content."
assert "@FocusState private var textEntryFocused" in remy
assert 'Button("Eingabe schließen")' in body
assert 'Button("Text übernehmen")' not in body
assert 'Button(transcriptActionTitle, action: sendCapturedTranscript)' in body
assert 'workStatus == .needsInfo ? "Antwort an Remy senden" : "Testwunsch an Remy senden"' in remy
assert 'Label(microphoneActionTitle, systemImage: status == .recording ? "stop.fill" : "mic.fill")' in remy
assert 'Image(GradeCrewAssets.NativeImage.remyMicrophone)' in remy
header = remy.split("private var navigationHeader", 1)[1]
assert "GradeCrewAssets.NativeImage.remyMicrophone" in header
assert "GradeCrewAssets.NativeImage.remyWelcome" not in header
assert 'pendingTranscript = transcript' in remy
assert 'case .transcribed:\n                break' in remy
assert 'Task { await prepareTranscript(capture.flow.transcript) }' not in remy
assert ".accessibilityLabel(workStatus == .needsInfo ? (workError" in body
print("GradeCrew native screen layout: passed (direct auth route, explicit Remy send, transparent mascot, pinned back button)")
