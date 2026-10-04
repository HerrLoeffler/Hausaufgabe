import { exactKeys } from './context-contract.mjs';

const JOBS = Object.freeze([
  'test_generation', 'multiple_choice_generation', 'distractor_generation', 'solution_verification',
  'free_text_grading', 'curriculum_matching', 'student_tutoring', 'question_rewriting', 'quality_control',
  'game_content_generation', 'game_hint', 'crew_intent',
]);

const REPAIRABLE_JOBS = new Set([
  'test_generation', 'multiple_choice_generation', 'distractor_generation',
  'question_rewriting', 'game_content_generation', 'game_hint', 'student_tutoring',
]);

const PRIMARY_ROLE = Object.freeze({
  crew_intent: 'interpreter',
  question_rewriting: 'rewriter',
  solution_verification: 'verifier',
  quality_control: 'verifier',
  curriculum_matching: 'matcher',
  free_text_grading: 'grader',
  student_tutoring: 'tutor',
  game_hint: 'tutor',
});

function fail(code) { throw new Error(code); }
function boundedInt(value, min, max) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}
function boundedString(value, maxBytes) {
  return typeof value === 'string' && value.trim() && Buffer.byteLength(value) <= maxBytes;
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function deriveExecutionProfile(meta) {
  const keys = [
    'job', 'itemCount', 'maxOutputTokens', 'assessmentConsequence', 'hasPersonalData',
    'requiresCurriculumEvidence', 'semanticReviewRequired', 'complexReasoning',
    'highAmbiguity', 'deterministicCoverage',
  ];
  exactKeys(meta, keys, 'INVALID_EXECUTION_META');
  if (!JOBS.includes(meta.job)
    || !boundedInt(meta.itemCount, 1, 100)
    || !boundedInt(meta.maxOutputTokens, 1, 16000)
    || !['none', 'instructional', 'grading'].includes(meta.assessmentConsequence)
    || !['none', 'partial', 'strong'].includes(meta.deterministicCoverage)
    || ['hasPersonalData', 'requiresCurriculumEvidence', 'semanticReviewRequired', 'complexReasoning', 'highAmbiguity']
      .some(key => typeof meta[key] !== 'boolean')) fail('INVALID_EXECUTION_META');

  let riskTier = 'low';
  if (meta.assessmentConsequence === 'grading' || meta.job === 'free_text_grading') riskTier = 'critical';
  else if (['solution_verification', 'quality_control'].includes(meta.job) || meta.hasPersonalData) riskTier = 'high';
  else if ([
    'test_generation', 'multiple_choice_generation', 'distractor_generation',
    'curriculum_matching', 'student_tutoring', 'game_content_generation',
  ].includes(meta.job)) riskTier = 'medium';

  let complexity = 'low';
  if (meta.complexReasoning || meta.highAmbiguity || meta.itemCount > 12 || meta.maxOutputTokens > 2048) complexity = 'high';
  else if (meta.itemCount > 1 || meta.maxOutputTokens > 512 || meta.requiresCurriculumEvidence || meta.semanticReviewRequired) complexity = 'normal';

  const primaryRole = PRIMARY_ROLE[meta.job] || 'generator';
  const repairAllowed = REPAIRABLE_JOBS.has(meta.job);
  const independentCriticRequired = riskTier === 'high' || riskTier === 'critical'
    || complexity === 'high' || meta.semanticReviewRequired || meta.deterministicCoverage === 'none';
  const humanReviewRequired = riskTier === 'critical';

  const stages = [primaryRole];
  if (meta.deterministicCoverage !== 'none') stages.push('deterministic_validate');
  if (independentCriticRequired) stages.push('independent_critic');
  if (independentCriticRequired && repairAllowed) stages.push('optional_repair_once');
  if (meta.deterministicCoverage !== 'none' && (independentCriticRequired || repairAllowed)) stages.push('final_deterministic_validate');
  if (humanReviewRequired) stages.push('human_review_required');

  const maxAiCalls = independentCriticRequired ? (repairAllowed ? 3 : 2) : 1;
  return deepFreeze({
    schemaVersion: 1,
    job: meta.job,
    riskTier,
    complexity,
    primaryRole,
    independentCriticRequired,
    repairAllowed,
    maxRepairs: repairAllowed ? 1 : 0,
    maxAiCalls,
    humanReviewRequired,
    shareGeneratorReasoningWithCritic: false,
    stages,
  });
}

export function buildIndependentReviewPacket(input) {
  exactKeys(input, ['originalTask', 'artifact', 'rubric', 'context'], 'INVALID_REVIEW_PACKET');
  if (!boundedString(input.originalTask, 32 * 1024)
    || !input.artifact || typeof input.artifact !== 'object' || Array.isArray(input.artifact)
    || !input.rubric || typeof input.rubric !== 'object' || Array.isArray(input.rubric)
    || !input.context || typeof input.context !== 'object' || Array.isArray(input.context)) fail('INVALID_REVIEW_PACKET');

  const serialized = JSON.stringify(input);
  if (Buffer.byteLength(serialized) > 128 * 1024) fail('REVIEW_PACKET_TOO_LARGE');

  // The exact-key contract intentionally provides no field for generator reasoning,
  // provider identity, hidden scratchpad or prior model critique. The critic sees
  // only the original task, the artifact, the review rubric and trusted context.
  return deepFreeze(JSON.parse(serialized));
}

export function validateCriticResult(result) {
  exactKeys(result, ['status', 'severity', 'confidence', 'issueCode', 'itemIndex', 'detail'], 'INVALID_CRITIC_RESULT');
  if (!['pass', 'warn', 'fail'].includes(result.status)
    || !['none', 'minor', 'major', 'critical'].includes(result.severity)
    || !['low', 'medium', 'high'].includes(result.confidence)
    || typeof result.issueCode !== 'string' || !/^[a-z0-9_]{1,80}$/.test(result.issueCode)
    || !(result.itemIndex === null || boundedInt(result.itemIndex, 0, 99))
    || typeof result.detail !== 'string' || !result.detail.trim() || Buffer.byteLength(result.detail) > 1200) {
    fail('INVALID_CRITIC_RESULT');
  }
  if (result.status === 'pass' && result.severity !== 'none') fail('INVALID_CRITIC_RESULT');
  if (result.status !== 'pass' && result.severity === 'none') fail('INVALID_CRITIC_RESULT');
  return deepFreeze({ ...result });
}

export function decideAfterCritic({ critic, profile, repairAttempted }) {
  exactKeys({ critic, profile, repairAttempted }, ['critic', 'profile', 'repairAttempted'], 'INVALID_REVIEW_DECISION');
  const checked = validateCriticResult(critic);
  if (!profile || profile.schemaVersion !== 1 || typeof profile.repairAllowed !== 'boolean'
    || typeof profile.humanReviewRequired !== 'boolean' || !boundedInt(profile.maxRepairs, 0, 1)
    || typeof repairAttempted !== 'boolean') fail('INVALID_REVIEW_DECISION');

  if (checked.status === 'pass') {
    return deepFreeze({ action: profile.humanReviewRequired ? 'human_review' : 'accept', terminal: profile.humanReviewRequired });
  }

  if (checked.status === 'warn' && checked.severity === 'minor') {
    if (profile.humanReviewRequired || profile.riskTier === 'high') return deepFreeze({ action: 'human_review', terminal: true });
    return deepFreeze({ action: 'accept_with_warning', terminal: true });
  }

  if (profile.repairAllowed && !repairAttempted && profile.maxRepairs === 1) {
    return deepFreeze({ action: 'repair_once', terminal: false });
  }

  // Never enter a second repair loop. Remaining major/critical findings stop
  // automatic acceptance. Critical/high-risk work requires a human decision.
  if (profile.humanReviewRequired || profile.riskTier === 'high') {
    return deepFreeze({ action: 'human_review', terminal: true });
  }
  return deepFreeze({ action: 'stop', terminal: true });
}

export const COLLABORATION_JOBS = JOBS;
