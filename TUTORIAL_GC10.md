# GradeCrew gc10: complete practice journey

Based on staging branch 4c28d40, not the older gc2 workspace. Production is unaffected.

Replaces the disabled observer-driven tour with an explicitly labelled native-dialog practice journey. The app imports it after authenticated dashboard loading. Existing accounts can launch it from “GradeCrew ausprobieren”; new empty accounts are offered it once per page session. Completion is stored per account. The older first-AI and information tours are suppressed once this module is loaded; they remain fallback code if loading fails.

The elephant displays a prepared English/class-5 request. Starting the check advances to the draft after 3000 ms, with an immediate-continue option. Closing, Escape, Back, sign-out and subsequent renders cancel the timer. No body MutationObserver, polling, paid AI call, test import, publication or student record is created.

Practice actions: edit question, apply prepared fox revision, add prepared variant, explore settings, answer six demo questions, submit, manually grade the free-text answer, inspect example access code and computed result. Required actions gate advancement. Matching and ordering use explicitly labelled compact representations in the practice student view. The added variant is demonstrated separately and does not change the six-question/12-point student exercise. Settings are explanatory demo controls, not applied to real tests.

Native dialog supplies focus trapping and background interaction isolation. Large crew illustrations remain the current repository assets. No redesign of the landing page is included in this fix.

Validation: behavior tests for the whole journey, exact delay and cancellation, required responses and grading, account separation/replay, plus existing frontend regression suite and staging build. No authenticated Chrome/Safari visual run or staging deployment is claimed from this environment.
