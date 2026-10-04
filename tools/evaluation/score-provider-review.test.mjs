import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompetencyMatrix,
  scoreDevelopmentPacket,
  validateManualReview,
} from './score-provider-review.mjs';

const reference = {
  schemaVersion: 1,
  id: 'phase-a-development-reference-de-v1',
  status: 'development_only',
  runtimeAuthorized: false,
  warning: 'synthetic',
  rubrics: { crew_intent: { required: [], critical: [] } },
  caseChecks: {
    'ci-01': { expectedPatch: { count: 8, difficulty: 'mittel' } },
    'ci-04': { expectedPatch: { difficulty: 'anspruchsvoll' }, mustNotChange: ['count'] },
  },
};

function packet(texts, status = 'completed') {
  return {
    schemaVersion: 1,
    bundleId: 'phase-a-crew-intent-de-dev-v1',
    job: 'crew_intent',
    system: 'Return JSON.',
    context: { contentLocale: 'de-DE' },
    warning: 'private',
    results: texts.map((text, index) => ({
      caseId: index ? 'ci-04' : 'ci-01',
      independenceUnit: index ? 'intent-preserve-unspecified' : 'intent-count-difficulty',
      provider: index ? 'anthropic' : 'gemini',
      model: index ? 'claude-haiku-4-5' : 'gemini-3.5-flash-lite',
      roles: index ? ['critic', 'verifier'] : ['interpreter', 'extractor'],
      messages: [{ role: 'user', content: 'synthetic request' }],
      status,
      result: status === 'completed' ? {
        requestId: 'r-' + index,
        provider: index ? 'anthropic' : 'gemini',
        model: index ? 'claude-haiku-4-5' : 'gemini-3.5-flash-lite',
        text, stopReason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 },
        latencyMs: 100 + index * 20, costMicros: 3 + index,
      } : null,
    })),
  };
}

test('Crew intent exact checks catch wrong and unexpected patches', () => {
  const scored = scoreDevelopmentPacket(packet([
    '{"patch":{"count":8,"difficulty":"mittel"}}',
    '{"patch":{"difficulty":"anspruchsvoll","count":7}}',
  ]), reference);
  assert.equal(scored.runtimeAuthorized, false);
  assert.equal(scored.rows[0].automatedStatus, 'pass_checks');
  assert.equal(scored.rows[0].criticalFailure, false);
  assert.equal(scored.rows[1].automatedStatus, 'fail_checks');
  assert.equal(scored.rows[1].criticalFailure, true);
  assert.ok(scored.rows[1].findings.includes('unexpected_change_count'));
});

test('Crew intent parser tolerates a JSON code fence but rejects extra top-level fields', () => {
  const good = scoreDevelopmentPacket(packet([
    '~~~json\n{"patch":{"count":8,"difficulty":"mittel"}}\n~~~'.replaceAll('~~~', String.fromCharCode(96).repeat(3)),
    '{"patch":{"difficulty":"anspruchsvoll"}}',
  ]), reference);
  assert.equal(good.rows[0].automatedStatus, 'pass_checks');

  const bad = scoreDevelopmentPacket(packet([
    '{"patch":{"count":8,"difficulty":"mittel"},"reasoning":"hidden"}',
    '{"patch":{"difficulty":"anspruchsvoll"}}',
  ]), reference);
  assert.ok(bad.rows[0].findings.includes('unexpected_patch_field'));
});

test('hint scorer catches final-answer leakage without numeric substring false positives', () => {
  const hintReference = {
    ...reference,
    rubrics: { game_hint: { required: [], critical: [] } },
    caseChecks: { 'gh-01': { forbiddenFinalAnswers: ['20'] } },
  };
  const base = packet(['Denke daran: 25 % entsprechen 25 von 100.', '{"patch":{"difficulty":"anspruchsvoll"}}']);
  base.bundleId = 'phase-a-game-hint-de-dev-v1';
  base.job = 'game_hint';
  base.results = [base.results[0]];
  base.results[0] = { ...base.results[0], caseId: 'gh-01', roles: ['tutor'] };
  const safe = scoreDevelopmentPacket(base, hintReference);
  assert.equal(safe.rows[0].criticalFailure, false);

  base.results[0] = { ...base.results[0], result: { ...base.results[0].result, text: 'Die Antwort ist 20.' } };
  const leaked = scoreDevelopmentPacket(base, hintReference);
  assert.equal(leaked.rows[0].criticalFailure, true);
  assert.ok(leaked.rows[0].findings.includes('final_answer_leak'));
});

test('competency matrix has roles, no winner, and needs manual review completion', () => {
  const scored = scoreDevelopmentPacket(packet([
    '{"patch":{"count":8,"difficulty":"mittel"}}',
    '{"patch":{"difficulty":"anspruchsvoll"}}',
  ]), reference);
  const review = {
    schemaVersion: 1,
    id: 'teacher-review-001',
    bundleId: scored.bundleId,
    reviewerId: 'reviewer-1',
    completedAt: '2026-10-04T12:00:00Z',
    rows: [{
      caseId: 'ci-01', provider: 'gemini', model: 'gemini-3.5-flash-lite',
      pass: true, criticalFailure: false, issueCodes: [],
    }],
  };
  validateManualReview(review, scored);
  const matrix = buildCompetencyMatrix(scored, review);
  assert.equal(matrix.globalWinner, null);
  assert.equal(matrix.runtimeAuthorized, false);
  const interpreter = matrix.roles.find(row => row.role === 'interpreter');
  assert.equal(interpreter.manualPassRate, 1);
  assert.equal(interpreter.evidenceStatus, 'review_complete_development');
  const critic = matrix.roles.find(row => row.role === 'critic');
  assert.equal(critic.evidenceStatus, 'review_incomplete');
});

test('manual review cannot reference a result that was not evaluated', () => {
  const scored = scoreDevelopmentPacket(packet([
    '{"patch":{"count":8,"difficulty":"mittel"}}',
    '{"patch":{"difficulty":"anspruchsvoll"}}',
  ]), reference);
  assert.throws(() => validateManualReview({
    schemaVersion: 1,
    id: 'teacher-review-001',
    bundleId: scored.bundleId,
    reviewerId: 'reviewer-1',
    completedAt: '2026-10-04T12:00:00Z',
    rows: [{
      caseId: 'ci-99', provider: 'gemini', model: 'gemini-3.5-flash-lite',
      pass: true, criticalFailure: false, issueCodes: [],
    }],
  }, scored), /INVALID_MANUAL_REVIEW_ROW/);
});
