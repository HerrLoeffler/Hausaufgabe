import test from 'node:test';
import assert from 'node:assert/strict';
import { createTelemetry, validateEvent } from './events.mjs';
import { classroomReliability } from './metrics.mjs';
const context = { session_id: '11111111-1111-4111-8111-111111111111', environment: 'staging', release_commit: 'a'.repeat(40) };
const event = () => ({ schema_version: 1, event_id: '22222222-2222-4222-8222-222222222222', ...context, timestamp: '2026-10-01T19:00:00.000Z', name: 'game.session.ended', properties: { active_ms: 1000, outcome: 'completed', completed_steps: 4, total_steps: 4, hints: 1 } });
test('disabled by default: no event creation or collection', () => {
  const t = createTelemetry({ newId: () => { throw Error('must not run'); } });
  assert.equal(t.record('anything', { answer: 'private' }), false);
  assert.deepEqual(t.snapshot(), []);
});
test('unknown and sensitive payload fields rejected, including nested data', () => {
  assert.deepEqual(validateEvent(event()), event());
  for (const key of ['answer', 'email', 'prompt', 'student_name', 'url', 'raw_error']) {
    assert.throws(() => validateEvent({ ...event(), properties: { ...event().properties, [key]: 'private' } }));
  }
  assert.throws(() => validateEvent({ ...event(), properties: { ...event().properties, hints: { text: 'private' } } }));
  assert.throws(() => validateEvent({ ...event(), name: 'unknown.event' }));
  assert.throws(() => validateEvent({ ...event(), school_id: 'school' }));
});
test('invalid times, counts and progress cannot pollute metrics', () => {
  for (const timestamp of ['bad', '2026-02-31T19:00:00.000Z']) assert.throws(() => validateEvent({ ...event(), timestamp }));
  for (const hints of [-1, NaN, Infinity, '2']) assert.throws(() => validateEvent({ ...event(), properties: { ...event().properties, hints } }));
  assert.throws(() => validateEvent({ ...event(), properties: { ...event().properties, completed_steps: 5 } }));
});
test('bounded buffer, defensive copies and account-change clear primitive', () => {
  const t = createTelemetry({ enabled: true, capacity: 1, context, newId: () => event().event_id, now: () => new Date(event().timestamp) });
  t.record(event().name, event().properties); t.record(event().name, event().properties);
  assert.equal(t.snapshot().length, 1);
  const copy = t.snapshot(); copy[0].properties.hints = 99;
  assert.equal(t.snapshot()[0].properties.hints, 1);
  t.clear(); assert.deepEqual(t.snapshot(), []);
});
test('reliability uses distinct sessions, explicit denominator and inclusive 90 percent', () => {
  const a = { session_id: 'a', expected: 30, ready_within_60s: 27 };
  const result = classroomReliability([a, a, { session_id:'b', expected:30, ready_within_60s:26 }, { session_id:'c', expected:0, ready_within_60s:0 }]);
  assert.equal(result.rate, 0.5); assert.equal(result.eligible_sessions, 2); assert.equal(result.excluded_unknown_expected, 1);
  assert.equal(classroomReliability([]).rate, null);
  assert.throws(() => classroomReliability([a, {...a, ready_within_60s:28}]));
});
