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
assert ".opacity(route == .workspace || route == .signIn || route == .quickRemy ? 1 : 0)" in teacher
assert ".allowsHitTesting(route == .workspace || route == .signIn || route == .quickRemy)" in teacher
assert "if route == .quickRemy {" in teacher and "QuickRemyView(onBack:" in teacher

body = remy.split("var body: some View {", 1)[1].split("private var navigationHeader", 1)[0]
assert body.index("navigationHeader") < body.index("microphoneButton"), "The Remy controls remain pinned above the existing web form."
assert "@FocusState private var textEntryFocused" in remy
assert 'Button("Eingabe schließen")' in body
assert 'Button("Text übernehmen")' not in body
assert "sendCapturedTranscript()" in body, "The prominent microphone action must still submit the captured text to Remy."
assert 'workStatus == .needsInfo ? "Antwort an Remy senden" : "Testwunsch an Remy senden"' in remy
assert 'Label(microphoneActionTitle, systemImage: status == .recording ? "stop.fill" : "mic.fill")' in remy
assert 'Image(GradeCrewAssets.NativeImage.remyMicrophone)' in remy
header = remy.split("private var navigationHeader", 1)[1]
assert "GradeCrewAssets.NativeImage.remyMicrophone" in header
assert "GradeCrewAssets.NativeImage.remyWelcome" not in header
assert 'pendingTranscript = transcript' in remy
assert "QuickRemyDraft" in remy
assert '"knownFields": draft.knownFieldsPayload' in remy
assert "draftReviewCard" not in remy
assert "submitPreparedRequest" not in remy
assert ".frame(width: 52, height: 52)" in remy
assert 'case .transcribed:\n                break' in remy
assert 'Task { await prepareTranscript(capture.flow.transcript) }' not in remy
assert "remyMainArtwork" in body, "Remy needs the transparent illustration above the existing full form."
assert 'Text("Dein Testentwurf")' not in remy, "The existing web form remains the single source of truth for test options."
assert 'Text("Remy fragt kurz nach")' in remy, "Missing details should be shown in a dedicated follow-up card."
assert 'invoke("openAiForm", payload: [:])' in remy
assert 'invoke("populateAiForm", payload: ["draft": draft.knownFieldsPayload])' in remy
assert "submitPreparedRequest()" not in body, "Creating the test stays in the existing full test form."
assert 'Text("Erkannter Text · Demo")' not in remy, "The real app must not label its real transcript as a demo."
print("GradeCrew native screen layout: passed (direct auth route, explicit Remy send, transparent mascot, pinned back button)")
