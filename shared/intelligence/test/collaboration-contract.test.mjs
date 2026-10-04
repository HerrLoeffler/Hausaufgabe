import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildIndependentReviewPacket,
  decideAfterCritic,
  deriveExecutionProfile,
  validateCriticResult,
} from '../collaboration-contract.mjs';
import { authorizeProviderDataRoute, validateDataPolicyMatrix } from '../data-policy.mjs';

function meta(overrides = {}) {
  return {
    job: 'test_generation',
    itemCount: 10,
    maxOutputTokens: 1800,
    assessmentConsequence: 'instructional',
    hasPersonalData: false,
    requiresCurriculumEvidence: false,
    semanticReviewRequired: false,
    complexReasoning: false,
    highAmbiguity: false,
    deterministicCoverage: 'strong',
    ...overrides,
  };
}

test('simple low-risk work stays one-call and deterministic when possible', () => {
  const profile = deriveExecutionProfile(meta({
    job: 'crew_intent', itemCount: 1, maxOutputTokens: 180,
    assessmentConsequence: 'none', deterministicCoverage: 'strong',
  }));
  assert.equal(profile.riskTier, 'low');
  assert.equal(profile.complexity, 'low');
  assert.equal(profile.primaryRole, 'interpreter');
  assert.equal(profile.independentCriticRequired, false);
  assert.equal(profile.maxAiCalls, 1);
  assert.deepEqual(profile.stages, ['interpreter', 'deterministic_validate']);
});

test('hard generation uses one independent critic and at most one repair', () => {
  const profile = deriveExecutionProfile(meta({ complexReasoning: true, semanticReviewRequired: true }));
  assert.equal(profile.complexity, 'high');
  assert.equal(profile.independentCriticRequired, true);
  assert.equal(profile.repairAllowed, true);
  assert.equal(profile.maxRepairs, 1);
  assert.equal(profile.maxAiCalls, 3);
  assert.equal(profile.shareGeneratorReasoningWithCritic, false);
  assert.deepEqual(profile.stages, [
    'generator', 'deterministic_validate', 'independent_critic',
    'optional_repair_once', 'final_deterministic_validate',
  ]);
});

test('grading is critical, independently checked and requires human review', () => {
  const profile = deriveExecutionProfile(meta({
    job: 'free_text_grading', itemCount: 1, maxOutputTokens: 700,
    assessmentConsequence: 'grading', hasPersonalData: true,
    semanticReviewRequired: true, deterministicCoverage: 'partial',
  }));
  assert.equal(profile.riskTier, 'critical');
  assert.equal(profile.primaryRole, 'grader');
  assert.equal(profile.repairAllowed, false);
  assert.equal(profile.maxAiCalls, 2);
  assert.equal(profile.humanReviewRequired, true);
  assert.equal(profile.stages.at(-1), 'human_review_required');
});

test('critic packet structurally excludes generator reasoning and provider identity', () => {
  const packet = buildIndependentReviewPacket({
    originalTask: 'Erstelle eine eindeutige Prozentaufgabe.',
    artifact: { text: 'Berechne 25 % von 80.', answer: 20 },
    rubric: { checks: ['correctness', 'ambiguity', 'answer_leak'] },
    context: { subject: 'Mathematik', grade: '9' },
  });
  assert.deepEqual(Object.keys(packet), ['originalTask', 'artifact', 'rubric', 'context']);
  assert.throws(() => buildIndependentReviewPacket({
    originalTask: 'x', artifact: {}, rubric: {}, context: {},
    generatorReasoning: 'hidden chain',
  }), /INVALID_REVIEW_PACKET/);
});

test('critic decision cannot loop beyond one repair', () => {
  const profile = deriveExecutionProfile(meta({ semanticReviewRequired: true }));
  const failure = validateCriticResult({
    status: 'fail', severity: 'major', confidence: 'high',
    issueCode: 'ambiguous_answer', itemIndex: 3, detail: 'Two answers remain defensible.',
  });
  assert.deepEqual(decideAfterCritic({ critic: failure, profile, repairAttempted: false }),
    { action: 'repair_once', terminal: false });
  assert.deepEqual(decideAfterCritic({ critic: failure, profile, repairAttempted: true }),
    { action: 'stop', terminal: true });
});

test('high-risk unresolved critic findings go to a human instead of looping', () => {
  const profile = deriveExecutionProfile(meta({
    job: 'solution_verification', itemCount: 1, maxOutputTokens: 700,
    semanticReviewRequired: true, deterministicCoverage: 'partial',
  }));
  const failure = {
    status: 'fail', severity: 'critical', confidence: 'high',
    issueCode: 'wrong_solution', itemIndex: 0, detail: 'The numerical solution conflicts with the task.',
  };
  assert.deepEqual(decideAfterCritic({ critic: failure, profile, repairAttempted: false }),
    { action: 'human_review', terminal: true });
});

test('data policy is fail-closed and exact per provider/job/data class/region', () => {
  const matrix = validateDataPolicyMatrix([{
    id: 'privacy-review-openai-crew-intent-v1',
    provider: 'openai',
    job: 'crew_intent',
    dataClass: 'teacher_content',
    requestedRegion: 'eu',
    status: 'approved',
    evidenceId: 'privacy-evidence-2026-10',
    reviewedAt: '2026-10-01T00:00:00Z',
    expiresAt: '2026-11-01T00:00:00Z',
    retentionClass: 'provider-policy-reviewed',
  }, {
    id: 'privacy-review-openai-grading-v1',
    provider: 'openai',
    job: 'free_text_grading',
    dataClass: 'student_identifiable',
    requestedRegion: 'eu',
    status: 'blocked',
    evidenceId: 'privacy-evidence-2026-10',
    reviewedAt: '2026-10-01T00:00:00Z',
    expiresAt: '2026-11-01T00:00:00Z',
    retentionClass: 'blocked',
  }]);
  const now = Date.parse('2026-10-04T12:00:00Z');
  assert.equal(authorizeProviderDataRoute({
    provider: 'openai', job: 'crew_intent', dataClass: 'teacher_content', requestedRegion: 'eu',
  }, matrix, now).allowed, true);
  assert.equal(authorizeProviderDataRoute({
    provider: 'anthropic', job: 'crew_intent', dataClass: 'teacher_content', requestedRegion: 'eu',
  }, matrix, now).reason, 'NO_EXPLICIT_POLICY');
  assert.equal(authorizeProviderDataRoute({
    provider: 'openai', job: 'free_text_grading', dataClass: 'student_identifiable', requestedRegion: 'eu',
  }, matrix, now).reason, 'POLICY_BLOCKED');
  assert.equal(authorizeProviderDataRoute({
    provider: 'openai', job: 'crew_intent', dataClass: 'teacher_content', requestedRegion: 'eu',
  }, matrix, Date.parse('2026-12-01T00:00:00Z')).reason, 'POLICY_EXPIRED');
});
