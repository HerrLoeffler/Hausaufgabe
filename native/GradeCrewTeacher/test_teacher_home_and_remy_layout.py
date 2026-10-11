"""Protect the persistent sign-in gate and keyboard-safe Remy navigation layout."""
from pathlib import Path

root = Path(__file__).parent / "Sources"
teacher = (root / "TeacherRootView.swift").read_text()
remy = (root / "QuickRemyView.swift").read_text()

assert "case .signedOut:" in teacher and "GradeCrewSignInScreen(" in teacher
assert "case .signedIn(_, _):" in teacher and "homeMenuScreen" in teacher
assert 'Label("Mit GradeCrew anmelden"' in teacher
assert "CocoOpeningDoor()" in teacher
assert "GradeCrewAssets.NativeImage.cocoWelcome" in teacher
assert "GradeCrewAssets.NativeImage.brandIcon" in teacher
assert "GradeCrewAssets.NativeImage.brandPrimary" not in teacher
assert ".frame(height: 88)" in teacher
assert ".clipShape(Circle())" in teacher
assert ".font(.system(size: 24, weight: .semibold, design: .rounded))" in teacher

body = remy.split("var body: some View {", 1)[1].split("private var navigationHeader", 1)[0]
assert body.index("navigationHeader") < body.index("ScrollView"), "The back button must stay outside the scrolling/keyboard content."
assert "@FocusState private var textEntryFocused" in remy
assert 'Button("Eingabe schließen")' in body
assert 'Button("Text übernehmen")' in body
assert ".accessibilityLabel(workStatus == .needsInfo ? (workError" in body
print("GradeCrew native screen layout: passed (auth gate, Coco welcome, pinned Remy back button, keyboard-safe text entry)")
