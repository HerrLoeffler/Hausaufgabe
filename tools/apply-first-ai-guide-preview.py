from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
app_path = ROOT / "app.js"
app = app_path.read_text(encoding="utf-8")

old = '''const FIRST_AI_GUIDE_VERSION = "first-ai-test-v1";
let firstAiGuideStep = "";
let firstAiGuideTarget = null;
let firstAiGuideResizeHandler = null;
let firstAiGuideOfferTimer = null;'''
new = '''const FIRST_AI_GUIDE_VERSION = "first-ai-test-v1";
let firstAiGuideStep = "";
let firstAiGuideTarget = null;
let firstAiGuideResizeHandler = null;
let firstAiGuideOfferTimer = null;
let firstAiGuideForceConsumed = false;

function firstAiGuideForcePreview() {
  return new URLSearchParams(location.search).get("firstGuide") === "1" && !firstAiGuideForceConsumed;
}'''
if app.count(old) != 1:
    raise RuntimeError(f"guide state block: expected 1 match, got {app.count(old)}")
app = app.replace(old, new, 1)

old = '''function firstAiGuideEligible() {
  if (!state.user || isSuspended() || firstAiGuideDone() || firstAiGuideSkippedThisSession()) return false;
  const quizzes = activeQuizzes().filter(q => q.generationStatus !== "running");
  const hasAiWork = state.aiJobs.some(job => ["queued", "running", "ready"].includes(job.status));
  return quizzes.length === 0 && !hasAiWork;
}'''
new = '''function firstAiGuideEligible() {
  const forced = firstAiGuideForcePreview();
  if (!state.user || isSuspended()) return false;
  if (forced) return true;
  if (firstAiGuideDone() || firstAiGuideSkippedThisSession()) return false;
  const quizzes = activeQuizzes().filter(q => q.generationStatus !== "running");
  const hasAiWork = state.aiJobs.some(job => ["queued", "running", "ready"].includes(job.status));
  return quizzes.length === 0 && !hasAiWork;
}'''
if app.count(old) != 1:
    raise RuntimeError(f"guide eligibility block: expected 1 match, got {app.count(old)}")
app = app.replace(old, new, 1)

old = '''    renderFirstAiGuideStep("intro");
  }, attempt ? 500 : 650);'''
new = '''    if (firstAiGuideForcePreview()) firstAiGuideForceConsumed = true;
    renderFirstAiGuideStep("intro");
  }, attempt ? 500 : 650);'''
if app.count(old) != 1:
    raise RuntimeError(f"guide offer block: expected 1 match, got {app.count(old)}")
app = app.replace(old, new, 1)

app_path.write_text(app, encoding="utf-8")
print("First AI guide preview mode applied.")
