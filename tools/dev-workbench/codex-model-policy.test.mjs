import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModelArgs, selectModelPolicy } from './codex-model-policy.mjs';

const base = { taskId: 'GC-TEST-01', phase: 'implementation', risk: 'routine' };

test('routine work starts with Luna medium and passes it explicitly to the CLI', () => {
  const selected = selectModelPolicy(base);
  assert.deepEqual(selected, { model: 'gpt-6-luna', effort: 'medium', requestedBy: 'policy' });
  assert.deepEqual(buildModelArgs(selected), ['--model', 'gpt-6-luna', '-c', 'model_reasoning_effort="medium"']);
});

test('a justified low trial and a human Luna choice are preserved', () => {
  assert.equal(selectModelPolicy({ ...base, effort: 'low', lowEvidence: '3 comparable routine jobs passed', acceptance: 'same criteria' }).effort, 'low');
  assert.deepEqual(selectModelPolicy({ ...base, model: 'gpt-6-luna', effort: 'medium' }), {
    model: 'gpt-6-luna', effort: 'medium', requestedBy: 'human',
  });
});

test('Sol medium requires an explicit complexity reason and preserves human choice', () => {
  assert.throws(() => selectModelPolicy({ ...base, model: 'gpt-6.1-sol', effort: 'medium' }), { code: 'SOL_REQUIRES_COMPLEXITY' });
  assert.deepEqual(selectModelPolicy({ ...base, risk: 'complexity', reason: 'Two dependent modules must be reconciled.', model: 'gpt-6.1-sol', effort: 'medium' }), {
    model: 'gpt-6.1-sol', effort: 'medium', requestedBy: 'human',
  });
});

test('high effort requires an authorized, concrete risk or engine reason', () => {
  assert.throws(() => selectModelPolicy({ ...base, effort: 'high' }), { code: 'HIGH_REQUIRES_AUTHORIZED_RISK' });
  assert.deepEqual(selectModelPolicy({ ...base, risk: 'authorized_high', reason: 'Engine crash blocks the required scene load.', authorization: 'task owner approved', model: 'gpt-6.1-sol', effort: 'high' }), {
    model: 'gpt-6.1-sol', effort: 'high', requestedBy: 'human',
  });
});

test('unavailable selection fails closed without substituting the global default', () => {
  assert.throws(() => selectModelPolicy({ ...base, availableModels: ['gpt-6.1-sol'] }), { code: 'MODEL_UNAVAILABLE' });
});

test('semantic escalation keeps acceptance fixed and stops after two model switches', () => {
  const history = [
    { model: 'gpt-6-luna', effort: 'medium', acceptance: 'same', status: 'completed' },
  ];
  assert.deepEqual(selectModelPolicy({ ...base, risk: 'complexity', reason: 'Cross-module issue.', failure: { kind: 'semantic', evidence: 'Acceptance check still fails.', acceptance: 'same' }, acceptance: 'same', history }), {
    model: 'gpt-6.1-sol', effort: 'medium', requestedBy: 'policy',
  });
  assert.throws(() => selectModelPolicy({ ...base, risk: 'complexity', reason: 'Cross-module issue.', failure: { kind: 'semantic', evidence: 'Still fails.', acceptance: 'changed' }, acceptance: 'changed', history }), { code: 'ACCEPTANCE_CHANGED' });
  const switchedTwice = [
    { model: 'gpt-6-luna', effort: 'medium', acceptance: 'same', status: 'completed' },
    { model: 'gpt-6.1-sol', effort: 'medium', acceptance: 'same', status: 'semantic_failed' },
    { model: 'gpt-6-luna', effort: 'medium', acceptance: 'same', status: 'semantic_failed' },
  ];
  assert.throws(() => selectModelPolicy({ ...base, risk: 'complexity', reason: 'Cross-module issue.', failure: { kind: 'semantic', evidence: 'Still fails.', acceptance: 'same' }, acceptance: 'same', history: switchedTwice }), { code: 'SWITCH_LIMIT' });
});

test('auth, DNS, quota, and unknown outcomes cannot start a retry or escalation', () => {
  const history = [{ model: 'gpt-6-luna', effort: 'medium', acceptance: 'same', status: 'completed' }];
  for (const kind of ['auth', 'dns', 'quota', 'unknown']) {
    assert.throws(() => selectModelPolicy({ ...base, risk: 'complexity', reason: 'Cross-module issue.', failure: { kind, evidence: 'failure observed', acceptance: 'same' }, acceptance: 'same', history }), { code: 'NON_SEMANTIC_RETRY' });
  }
});

test('an unresolved prior launch is never repeated', () => {
  assert.throws(() => selectModelPolicy({ ...base, history: [{ model: 'gpt-6-luna', effort: 'medium', acceptance: 'same', status: 'unknown' }] }), { code: 'PRIOR_OUTCOME_UNKNOWN' });
});

test('authorized high-risk work cannot downgrade until its completion is explicit', () => {
  const history = [{ model: 'gpt-6.1-sol', effort: 'high', acceptance: 'same', risk: 'authorized_high', status: 'completed' }];
  const failure = { kind: 'semantic', evidence: 'The scoped high-risk check still fails.', acceptance: 'same' };
  assert.throws(() => selectModelPolicy({ ...base, failure, acceptance: 'same', history }), { code: 'HIGH_STEP_DOWNGRADE' });
  assert.deepEqual(selectModelPolicy({ ...base, reason: 'The high-risk gate is complete; only a routine formatting follow-up remains.', failure, acceptance: 'same', history, securityStepComplete: true }), {
    model: 'gpt-6-luna', effort: 'medium', requestedBy: 'policy',
  });
});
