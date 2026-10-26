// Enabled only by the reproducible, project-bound Issue 255 preview builder.
export const ENABLED = false;
const names = new Set(['crewAssistant','generateTest','startAiTestJob','startAiTestVariantJob','prepareQuickRemy','submitQuickRemy','getQuickRemySubmission','regenerateQuestion','reviseWholeTest','configurePracticeSolutionRelease','getAssessmentInfo','startAssessmentAttempt','resumeAssessmentAttempt','submitAssessmentAttempt','getAssessmentReceipt']);
export function previewCallable(name) { return ENABLED && names.has(name) ? 'visual255'+name[0].toUpperCase()+name.slice(1) : name; }
