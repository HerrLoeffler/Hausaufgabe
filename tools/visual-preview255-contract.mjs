export const PROJECT = 'gradecrew-staging-2026';
export const AI_NAMES = ['crewAssistant','generateTest','startAiTestJob','startAiTestVariantJob','processAiTestJob','prepareQuickRemy','submitQuickRemy','getQuickRemySubmission','regenerateQuestion','reviseWholeTest'];
export const ASSESSMENT_NAMES = ['configurePracticeSolutionRelease','getAssessmentInfo','startAssessmentAttempt','resumeAssessmentAttempt','submitAssessmentAttempt','getAssessmentReceipt'];
export function previewCallable(name) { return [...AI_NAMES,...ASSESSMENT_NAMES].includes(name) ? 'visual255'+name[0].toUpperCase()+name.slice(1) : name; }
// Never trust an owner-editable profile flag for paid preview access.
export const PREVIEW_TEST_UID = 'gc-visual255-e2e';
export function previewAccountAllowed(uid, profile = {}) { return uid === PREVIEW_TEST_UID || profile.role === 'admin'; }
