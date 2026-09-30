"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../lib/assessment-core');
const decoder = require('../lib/teacher-answer-decoder');

// Execute the actual callable handlers with an in-memory Admin SDK adapter.
// This verifies handler behavior, not just the presence of source-code strings.
function fixture() {
  const now = 1_800_000_000_000;
  const docs = new Map();
  const deleted = Symbol('deleted');
  const ref = path => ({ path, get: async () => snap(path) });
  const snap = path => ({ exists: docs.has(path), id: path.split('/').pop(), ref: ref(path), data: () => docs.get(path) });
  const db = {
    doc: ref,
    collection: path => ({ orderBy: () => ({ get: async () => ({ docs: [...docs.keys()].filter(k => k.startsWith(path + '/')).map(snap) }) }) }),
    runTransaction: async callback => callback({
      get: async r => snap(r.path),
      create: (r, value) => { assert.equal(docs.has(r.path), false); docs.set(r.path, value); },
      set: (r, value) => docs.set(r.path, { ...docs.get(r.path), ...value }),
      update: (r, value) => {
        const next = { ...docs.get(r.path), ...value };
        for (const key of Object.keys(next)) if (next[key] === deleted) delete next[key];
        docs.set(r.path, next);
      }
    })
  };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const exports = {};
  const context = {
    exports, Buffer,
    Date: class extends Date { static now() { return now; } },
    require: name => {
      if (name === 'node:crypto') return require(name);
      if (name === 'firebase-admin/app') return { getApps: () => [{}] };
      if (name === 'firebase-admin/firestore') return { getFirestore: () => db, Timestamp: { now: () => now, fromMillis: n => n }, FieldValue: { delete: () => deleted } };
      if (name === 'firebase-functions/v2/https') return { onCall: (_, handler) => handler, HttpsError };
      if (name === './assessment-core') return core;
      if (name === './teacher-answer-decoder') return decoder;
      throw Error(name);
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/secure-lifecycle'), 'utf8'), context);
  const quizId = 'AUDIT1';
  const token = 'A'.repeat(43);
  const questions = [{ id: 'q1', position: 1, type: 'number', text: '2+2', points: 1, numericAnswer: 4 }];
  docs.set(`quizzes/${quizId}`, { published: true, ended: false, startMode: 'teacher', sessionRunId: 'run1', sessionState: 'running', sessionStartedAt: now - 1000, resultMode: 'points_grade', showSolutions: true });
  docs.set(`quizzes/${quizId}/questions/q1`, questions[0]);
  const request = data => ({ data: { quizId, ...data }, rawRequest: { ip: '127.0.0.1' } });
  const start = name => exports.startAssessmentAttempt(request({ studentName: name, clientAttemptId: name.padEnd(20, '_'), attemptToken: token }));
  const submit = (id, answers = { q1: '4' }) => exports.submitAssessmentAttempt(request({ attemptId: id, attemptToken: token, answers }));
  const receipt = id => exports.getAssessmentReceipt(request({ attemptId: id, attemptToken: token }));
  return { exports, docs, quizId, token, now, request, start, submit, receipt };
}

test('solutions stay private for the entire teacher-end submission grace, including its last millisecond', async () => {
  const f = fixture();
  const first = await f.start('first');
  const second = await f.start('second');
  await f.submit(first.attemptId);
  for (const elapsed of [0, 1000, 90000]) {
    const quiz = f.docs.get(`quizzes/${f.quizId}`);
    Object.assign(quiz, { ended: true, published: false, endedAt: f.now - elapsed });
    const result = await f.receipt(first.attemptId);
    assert.equal(result.receipt.solutionsReleased, false, `elapsed=${elapsed}`);
    assert.equal(Object.hasOwn(result.receipt, 'solutions'), false);
  }
  await f.submit(second.attemptId);
  f.docs.get(`quizzes/${f.quizId}`).endedAt = f.now - 90001;
  assert.equal((await f.receipt(first.attemptId)).receipt.solutionsReleased, true);
});

test('missing end timestamp fails closed for solution release', async () => {
  const f = fixture(); const a = await f.start('student'); await f.submit(a.attemptId);
  Object.assign(f.docs.get(`quizzes/${f.quizId}`), { ended: true, published: false });
  assert.equal((await f.receipt(a.attemptId)).receipt.solutionsReleased, false);
});

test('repeated start after submission returns its receipt without rebuilding deleted secrets', async () => {
  const f = fixture(); const a = await f.start('student'); await f.submit(a.attemptId);
  const repeated = await f.start('student');
  assert.equal(repeated.status, 'submitted'); assert.equal(repeated.receipt.attemptId, a.attemptId);
});

test('submit is idempotent and forged grades do not override server evaluation', async () => {
  const f = fixture(); const a = await f.start('student');
  const first = await f.exports.submitAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: f.token, answers: { q1: '0' }, totalPoints: 999, grade: 1 }));
  assert.equal(first.receipt.totalPoints, 0);
  const again = await f.submit(a.attemptId);
  assert.equal(again.receipt.totalPoints, 0);
  await assert.rejects(f.exports.getAssessmentReceipt(f.request({ attemptId: a.attemptId, attemptToken: 'B'.repeat(43) })), { code: 'permission-denied' });
});

test('pending manual grades are withheld by the API itself', async () => {
  const f = fixture();
  f.docs.set(`quizzes/${f.quizId}/questions/q1`, { id: 'q1', type: 'text', points: 2, manualReview: true });
  const a = await f.start('student'); const { receipt } = await f.submit(a.attemptId, { q1: 'answer' });
  assert.equal(receipt.needsReview, true);
  for (const field of ['totalPoints', 'percent', 'grade']) assert.equal(Object.hasOwn(receipt, field), false, field);
});

test('two-item shuffle permits both permutations instead of encoding the answer by reversal', () => {
  const seen = new Set();
  for (let i = 0; i < 64; i++) seen.add(core.deterministicOrder(['A', 'B'], `secret${i}`, 'audit').join(''));
  assert.equal(seen.size, 2);
});

test('duplicated marked words cannot multiply awarded points', () => {
  const key = [{ id: 'q', type: 'markwords', points: 3, correctWordIndexes: ['0', '1', '2'] }];
  const answers = core.sanitizeAnswersForStorage(key, { q: ['0', '0', '0'] });
  assert.equal(core.gradeSubmission(key, answers).totalPoints, 1);
});

test('expired server deadline rejects a manipulated client even during teacher-end grace', async () => {
  const f = fixture(); const a = await f.start('student');
  f.docs.get(`quizzes/${f.quizId}/attempts/${a.attemptId}`).deadlineAt = f.now - 30001;
  Object.assign(f.docs.get(`quizzes/${f.quizId}`), { ended: true, published: false, endedAt: f.now });
  await assert.rejects(f.submit(a.attemptId), { code: 'deadline-exceeded' });
  assert.equal(f.docs.has(`quizzes/${f.quizId}/submissions/${a.attemptId}`), false);
});

test('teacher-end grace closes after 90 seconds and stale runs cannot submit', async () => {
  const f = fixture(); const a = await f.start('student');
  const quiz = f.docs.get(`quizzes/${f.quizId}`);
  Object.assign(quiz, { ended: true, published: false, endedAt: f.now - 90001 });
  await assert.rejects(f.submit(a.attemptId), { code: 'failed-precondition' });
  Object.assign(quiz, { ended: false, published: true, sessionRunId: 'run2' });
  await assert.rejects(f.submit(a.attemptId), { code: 'failed-precondition' });
});

test('waiting room withholds paper until teacher starts the same run', async () => {
  const f = fixture(); const quiz = f.docs.get(`quizzes/${f.quizId}`);
  quiz.sessionState = 'waiting'; quiz.sessionStartedAt = null;
  const a = await f.start('student'); assert.equal(a.paper, null); assert.equal(a.status, 'ready');
  await assert.rejects(f.submit(a.attemptId), { code: 'failed-precondition' });
  quiz.sessionState = 'running'; quiz.sessionStartedAt = f.now;
  const resumed = await f.exports.resumeAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: f.token }));
  assert.equal(resumed.status, 'running'); assert.equal(resumed.paper.length, 1);
});

test('teacher grading unlocks final receipt, while none mode remains private', async () => {
  const f = fixture();
  f.docs.set(`quizzes/${f.quizId}/questions/q1`, { id: 'q1', type: 'text', points: 2, manualReview: true });
  const a = await f.start('student'); await f.submit(a.attemptId, { q1: 'answer' });
  const submission = f.docs.get(`quizzes/${f.quizId}/submissions/${a.attemptId}`);
  Object.assign(submission, { status: 'graded', totalPoints: 2, percent: 100, grade: 1 });
  assert.equal((await f.receipt(a.attemptId)).receipt.totalPoints, 2);
  submission.resultMode = 'none';
  const hidden = (await f.receipt(a.attemptId)).receipt;
  for (const field of ['totalPoints', 'percent', 'grade', 'solutions']) assert.equal(Object.hasOwn(hidden, field), false);
});

test('authenticated running status delivers teacher-end signal without reading questions', async () => {
  const f = fixture(); const a = await f.start('student');
  // Deliberately poison questions: a status request must not build a paper.
  f.docs.set(`quizzes/${f.quizId}/questions/q1`, { id: 'changed', type: 'text', points: 999 });
  Object.assign(f.docs.get(`quizzes/${f.quizId}`), { ended: true, published: false, endedAt: f.now });
  const result = await f.exports.resumeAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: f.token, stateOnly: true }));
  assert.equal(result.quiz.ended, true); assert.equal(result.paper, null);
  assert.equal(result.serverNowMillis, f.now);
  await assert.rejects(f.exports.resumeAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: 'B'.repeat(43), stateOnly: true })), { code: 'permission-denied' });
  // Normal resume cannot reopen the ended exam or return its questions.
  await assert.rejects(f.exports.resumeAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: f.token })), { code: 'failed-precondition' });
});
