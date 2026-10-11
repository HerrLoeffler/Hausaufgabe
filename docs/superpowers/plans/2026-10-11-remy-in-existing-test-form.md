# Remy in the Existing Test Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep native Remy speech entry at the top of the screen while showing and using GradeCrew’s existing full test-generation form beneath it.

**Architecture:** Reuse the authenticated WKWebView and its existing test-generation UI as the single source of truth. Native speech recognition and Remy preparation fill the existing subject, grade, topic, and task-count controls; the normal form remains available for task types, difficulty, points, images/materials, and the existing generation action.

**Tech Stack:** SwiftUI, WKWebView `callAsyncJavaScript`, existing GradeCrew web form and Quick Remy bridge, Python regression tests, Xcode/TestFlight workflow.

**Spec:** User request in the current conversation: “Remy füllt es eben aus und man kann dann halt schnell alles auswählen, auch Bilder, auch Aufgaben. Es soll alles genau gleich sein, es soll nur einfach schneller gehen.”

## Global Constraints

- Keep production unchanged; TestFlight must continue to use the existing staging route.
- Preserve existing authenticated native speech capture and Remy follow-up flow.
- Reuse the existing web test form and generation pipeline; do not duplicate its option model in Swift.
- Do not create a test unless the user presses the existing form’s create button.

## Review Focus

- Form initialization is asynchronous; ensure speech values are applied only after the AI form is open.
- Follow-up answers must preserve prior values and update the same form.
- The native microphone panel must not cover or disable the web form below it.
- Missing web bridge or form controls must show a retryable message, not claim success.
- Remy speech must never submit/create a test on its own.

---

### Task 1: Show the existing full AI form below native Remy

**Files:**
- Modify: `native/GradeCrewTeacher/Sources/TeacherRootView.swift`
- Modify: `native/GradeCrewTeacher/Sources/QuickRemyView.swift`
- Test: `native/GradeCrewTeacher/test_teacher_home_and_remy_layout.py`

**Interface:** Keep the authenticated WKWebView visible and interactive on the `.quickRemy` route. Render the native Remy microphone panel as a top safe-area inset above it.

- [ ] Add a failing layout assertion that `.quickRemy` shows the web view and the native Remy panel together.
- [ ] Run the layout test and verify it fails for the missing combined route.
- [ ] Move the voice surface to a compact top panel and expose the existing full editor below.
- [ ] Run layout and Xcode simulator build checks.

### Task 2: Prefill, but do not bypass, the normal test form

**Files:**
- Modify: `native/GradeCrewTeacher/Sources/TeacherWebPortalView.swift`
- Modify: `native/GradeCrewTeacher/Sources/QuickRemyView.swift`
- Test: `native/GradeCrewTeacher/test_native_bridge.py`
- Test: `native/GradeCrewTeacher/test_teacher_home_and_remy_layout.py`

**Interface:** Add native bridge actions `openAiForm` and `populateAiForm`. The first opens the current page’s existing test-generation form. The second fills only recognized Remy values and dispatches normal DOM input/change events.

- [ ] Add failing assertions for opening the existing AI form and pre-filling subject, grade, topic, and count.
- [ ] Verify tests fail before implementation.
- [ ] Implement the two bridge actions and sync partial/complete Remy drafts into the page.
- [ ] Remove the separate native submission path from this screen; retain the normal web form’s create action.
- [ ] Run bridge, draft, follow-up, and UI regression tests.

### Task 3: TestFlight candidate

**Files:**
- Modify: `native/GradeCrewTeacher/VERSION` only if the repository release workflow requires a version bump.

- [ ] Prepare and generate canonical app assets/project.
- [ ] Build and launch the simulator app; verify the full form is visible below Remy and remains usable.
- [ ] Run all native GradeCrew CI tests and `git diff --check`.
- [ ] Commit and push the isolated branch, then use the existing TestFlight workflow for the staging app only.
- [ ] Verify CI and App Store Connect/TestFlight status before reporting availability.
