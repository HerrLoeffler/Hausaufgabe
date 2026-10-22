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
  let questionReads = 0;
  let assetReads = 0;
  const assetBatchSizes = [];
  let retryBeforeCommit = null;
  const ref = path => ({ path, get: async () => { if (path.startsWith("assessmentSolutionAssets/")) assetReads++; return snap(path); } });
  const snap = path => ({ exists: docs.has(path), id: path.split('/').pop(), ref: ref(path), data: () => docs.get(path) });
  const db = {
    batch: () => {
      const entries = [];
      return { set: (r, value) => entries.push([r, value]), commit: async () => {
        const bytes = Buffer.byteLength(JSON.stringify(entries));
        assetBatchSizes.push(bytes);
        assert.ok(bytes < 8_000_000, 'bounded immutable audio commit');
        entries.forEach(([r, value]) => docs.set(r.path, value));
      } };
    },
    doc: ref,
    collection: path => {
      const read = async () => {
        if (path.endsWith('/questions')) questionReads++;
        return { docs: [...docs.keys()].filter(k => k.startsWith(path + '/')).map(snap) };
      };
      // Preserve the direct collection reads used by the newer solution-audio path.
      return { get: read, orderBy: () => ({ get: read }) };
    },
    runTransaction: async callback => {
      const writes = [];
      const assetEntries = [];
      const result = await callback({
        get: async r => {
          assert.equal(writes.length, 0, 'Firestore requires reads before writes');
          return r.path ? snap(r.path) : r.get();
        },
        create: (r, value) => writes.push(() => { assert.equal(docs.has(r.path), false); docs.set(r.path, value); }),
        set: (r, value) => {
          if (r.path.startsWith('assessmentSolutionAssets/')) assetEntries.push([r, value]);
          writes.push(() => docs.set(r.path, { ...docs.get(r.path), ...value }));
        },
        update: (r, value) => writes.push(() => {
          const next = { ...docs.get(r.path), ...value };
          for (const key of Object.keys(next)) if (next[key] === deleted) delete next[key];
          docs.set(r.path, next);
        })
      });
      if (retryBeforeCommit) {
        const winner = retryBeforeCommit; retryBeforeCommit = null;
        await winner(); // Discard this transaction's staged writes, then replay.
        return db.runTransaction(callback);
      }
      if (assetEntries.length) {
        const bytes = Buffer.byteLength(JSON.stringify(assetEntries));
        assert.ok(bytes < 8_000_000, 'bounded immutable audio transaction');
        assetBatchSizes.push(bytes);
      }
      writes.forEach(write => write());
      return result;
    }
  };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const exports = {};
  const context = {
    exports, Buffer,
    Date: class extends Date { static now() { return now; } },
    require: name => {
      if (name === './offline-recovery-policy') return require('../lib/offline-recovery-policy');
      if (name === './assessment-run-id') return require('../lib/assessment-run-id');
      if (name === './classroom-binding') return require('../lib/classroom-binding');
      if (name === './observability') return require('../lib/observability');
      if (name === './audio-release-gate') return require('../lib/audio-release-gate');
      if (name === 'firebase-functions/logger') return { info() {}, warn() {}, error() {} };
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
  return { exports, docs, quizId, token, now, request, start, submit, receipt,
    get questionReads() { return questionReads; },
    get assetReads() { return assetReads; },
    assetBatchSizes,
    retryNextTransaction(winner) { retryBeforeCommit = winner; } };
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


// Regressions for Issue #6: rejected callers must never reach author questions.
function quota(f) {
  return [...f.docs.entries()].find(([path]) => path.startsWith('assessmentRateLimits/'))[1];
}

test('exhausted start quota rejects new identities before any question read', async () => {
  const f = fixture(); await f.start('first'); quota(f).count = 250;
  const before = f.questionReads;
  await assert.rejects(f.start('new-student'), { code: 'resource-exhausted' });
  assert.equal(f.questionReads, before);
  assert.equal(quota(f).count, 250);
});

test('canonical quiz aliases share the exhausted start quota', async () => {
  const f = fixture(); await f.start('first'); quota(f).count = 250;
  const before = f.questionReads;
  await assert.rejects(f.exports.startAssessmentAttempt(f.request({
    quizId: ' a-u-d-i-t-1 ', studentName: 'new', clientAttemptId: 'N'.repeat(20), attemptToken: f.token
  })), { code: 'resource-exhausted' });
  assert.equal(f.questionReads, before);
});

test('existing start authenticates token and name before reading questions', async () => {
  const f = fixture(); await f.start('first');
  const before = f.questionReads;
  for (const credentials of [{ studentName: 'first', attemptToken: 'B'.repeat(43) },
    { studentName: 'someone-else', attemptToken: f.token }]) {
    await assert.rejects(f.exports.startAssessmentAttempt(f.request({
      clientAttemptId: 'first'.padEnd(20, '_'), ...credentials
    })), { code: 'permission-denied' });
    assert.equal(f.questionReads, before);
  }
});

test('legitimate start retry preserves paper and bypasses exhausted new-start quota', async () => {
  const f = fixture(); const first = await f.start('first'); quota(f).count = 250;
  const again = await f.start('first');
  assert.equal(again.attemptId, first.attemptId);
  assert.deepEqual(again.paper, first.paper);
  assert.equal(quota(f).count, 250);
});

test('submitted start retry returns saved receipt without question reads or quota charge', async () => {
  const f = fixture(); const first = await f.start('first'); await f.submit(first.attemptId);
  const before = f.questionReads;
  const again = await f.start('first');
  assert.equal(again.receipt.attemptId, first.attemptId);
  assert.equal(f.questionReads, before);
  assert.equal(quota(f).count, 1);
});


test('a retried start returns the committed winner paper, never a discarded random contract', async () => {
  const f = fixture();
  f.docs.set(`quizzes/${f.quizId}/questions/q1`, {
    id: 'q1', position: 1, type: 'single', text: 'Pick', points: 1,
    options: [{ text: 'A', correct: true }, { text: 'B', correct: false }]
  });
  let winner;
  f.retryNextTransaction(async () => { winner = await f.start('first'); });
  const retried = await f.start('first');
  assert.deepEqual(retried.paper, winner.paper);
  assert.equal(quota(f).count, 1);
  assert.equal([...f.docs.keys()].filter(k => k.includes('/attempts/')).length, 1);
});

test('failed contract construction does not consume quota or store partial attempts', async () => {
  const f = fixture(); await f.start('first');
  f.docs.delete(`quizzes/${f.quizId}/questions/q1`);
  await assert.rejects(f.start('second'), { code: 'failed-precondition' });
  assert.equal(quota(f).count, 1);
  assert.equal([...f.docs.keys()].filter(k => k.includes('/attempts/')).length, 1);
});


// SR01–04: only an explicitly authorized, private publication policy is practice.
function practiceFixture({ showSolutions = true } = {}) {
  const f = fixture();
  const quiz = f.docs.get(`quizzes/${f.quizId}`);
  Object.assign(quiz, { ownerId: 'owner', published: false, ended: false,
    solutionReleaseMode: 'practice_after_submit', resultMode: 'none', showSolutions });
  f.docs.set('users/owner', { role: 'teacher', status: 'active' });
  f.docs.set('users/other', { role: 'teacher', status: 'active' });
  f.docs.set('users/admin', { role: 'admin', status: 'active' });
  f.teacher = (data, uid = 'owner') => f.exports.configurePracticeSolutionRelease({ ...f.request(data), auth: uid ? { uid } : null });
  f.publish = async () => {
    const prepared = await f.teacher({ action: 'prepare' });
    return f.teacher({ action: 'publish', expectedRevision: prepared.revision, confirmAfterSubmit: showSolutions });
  };
  return f;
}

test('SR01 authorized practice releases own solutions before global end with hidden grades', async () => {
  const f = practiceFixture(); await f.publish();
  const quiz = f.docs.get(`quizzes/${f.quizId}`); quiz.sessionState = 'running';
  const a = await f.start('practice'); await f.start('other');
  assert.equal(Object.hasOwn(a, 'solutions'), false);
  assert.equal(JSON.stringify(a).includes('numericAnswer'), false);
  const { receipt } = await f.submit(a.attemptId);
  assert.equal(receipt.solutionsReleased, true);
  assert.equal(receipt.solutions[0].answer, '4');
  for (const key of ['totalPoints', 'percent', 'grade']) assert.equal(Object.hasOwn(receipt, key), false);
  assert.equal(quiz.ended, false);
});

test('SR02 draft practice flag, hidden grades and student start never authorize early release', async () => {
  const f = fixture(); const quiz = f.docs.get(`quizzes/${f.quizId}`);
  Object.assign(quiz, { resultMode: 'none', startMode: 'student', publishedAt: f.now,
    solutionReleaseMode: 'practice_after_submit', showSolutions: true });
  const a = await f.start('unconfirmed'); await f.submit(a.attemptId);
  assert.equal((await f.receipt(a.attemptId)).receipt.solutionsReleased, false);
});

test('SR03 practice publication requires exact explicit confirmation and rejects edited settings or keys', async () => {
  for (const change of [q => { q.resultMode = 'points'; }, q => { q.showSolutions = false; },
    (q, f) => { f.docs.get(`quizzes/${f.quizId}/questions/q1`).numericAnswer = 9; }]) {
    const f = practiceFixture(); const prepared = await f.teacher({ action: 'prepare' });
    change(f.docs.get(`quizzes/${f.quizId}`), f);
    await assert.rejects(f.teacher({ action: 'publish', expectedRevision: prepared.revision, confirmAfterSubmit: true }), { code: 'aborted' });
    assert.equal(f.docs.get(`quizzes/${f.quizId}`).published, false);
  }
  const f = practiceFixture(); const prepared = await f.teacher({ action: 'prepare' });
  await assert.rejects(f.teacher({ action: 'publish', expectedRevision: prepared.revision }), { code: 'failed-precondition' });
});

test('SR04 private practice snapshot survives later key and audio edits without rebuilding solutions', async () => {
  const f = practiceFixture();
  f.docs.set(`quizzes/${f.quizId}/audioScripts/q1`, { solutionAudioDataUrl: 'data:audio/wav;base64,T0xE', solutionAudioAiGenerated: false });
  await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('audio'); await f.submit(a.attemptId);
  f.docs.get(`quizzes/${f.quizId}/questions/q1`).numericAnswer = 99;
  f.docs.get(`quizzes/${f.quizId}/audioScripts/q1`).solutionAudioDataUrl = 'data:audio/wav;base64,TkVX';
  const receipt = (await f.receipt(a.attemptId)).receipt;
  assert.equal(receipt.solutions[0].answer, '4');
  assert.equal(receipt.solutions[0].audio.src, 'data:audio/wav;base64,T0xE');
  assert.equal(receipt.solutions[0].audio.aiGenerated, false);
});

test('SR04 receipt rejects forged tokens and no submission; hold and deletion suppress all solutions', async () => {
  const f = practiceFixture(); await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('guards');
  await assert.rejects(f.receipt(a.attemptId), { code: 'failed-precondition' });
  await f.submit(a.attemptId);
  await assert.rejects(f.exports.getAssessmentReceipt(f.request({ attemptId: a.attemptId, attemptToken: 'B'.repeat(43) })), { code: 'permission-denied' });
  const quiz = f.docs.get(`quizzes/${f.quizId}`);
  for (const key of ['rightsHold', 'isDeleted']) {
    quiz[key] = true;
    const receipt = (await f.receipt(a.attemptId)).receipt;
    assert.equal(receipt.solutionsReleased, false); assert.equal(Object.hasOwn(receipt, 'solutions'), false);
    quiz[key] = false;
  }
});

test('teacher policy rejects anonymous foreign blocked and deleting accounts before question reads', async () => {
  const f = practiceFixture();
  for (const uid of [null, 'other', 'missing']) {
    const reads = f.questionReads;
    await assert.rejects(f.teacher({ action: 'prepare' }, uid), { code: uid ? 'permission-denied' : 'unauthenticated' });
    assert.equal(f.questionReads, reads);
  }
  for (const block of ['blocked', 'deleting']) {
    f.docs.get('users/owner').status = block;
    await assert.rejects(f.teacher({ action: 'prepare' }), { code: 'permission-denied' });
  }
  f.docs.get('users/owner').status = 'active'; f.docs.set('accountDeletions/owner', {});
  await assert.rejects(f.teacher({ action: 'prepare' }), { code: 'permission-denied' });
});

test('admin may authorize practice while unavailable owner prevents publication', async () => {
  const f = practiceFixture(); const prepared = await f.teacher({ action: 'prepare' }, 'admin');
  await f.teacher({ action: 'publish', expectedRevision: prepared.revision, confirmAfterSubmit: true }, 'admin');
  assert.equal(f.docs.get(`quizzes/${f.quizId}`).published, true);
  const unavailable = practiceFixture(); unavailable.docs.get('users/owner').status = 'deleting';
  await assert.rejects(unavailable.teacher({ action: 'prepare' }, 'admin'), { code: 'permission-denied' });
});

test('late teacher release uses existing practice revision snapshot even after submit deleted grading keys', async () => {
  const f = practiceFixture({ showSolutions: false }); await f.publish();
  f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('late'); await f.submit(a.attemptId);
  const before = (await f.receipt(a.attemptId)).receipt;
  assert.equal(before.solutionsReleased, false); assert.equal(before.solutionsConfigured, true);
  const privateData = f.docs.get(`assessmentPrivate/${f.quizId}_${a.attemptId}`);
  assert.equal(Object.hasOwn(privateData, 'gradingKey'), false);
  f.docs.get(`quizzes/${f.quizId}/questions/q1`).numericAnswer = 99;
  const policy = f.docs.get(`assessmentPolicies/${f.quizId}`);
  await f.teacher({ action: 'release', expectedRevision: policy.revision, confirmAfterSubmit: true });
  assert.equal((await f.receipt(a.attemptId)).receipt.solutions[0].answer, '4');
  privateData.solutionSnapshot = null;
  assert.equal((await f.receipt(a.attemptId)).receipt.solutionsReleased, false);
});

test('late release cannot turn an exam or another run into practice', async () => {
  const exam = fixture(); exam.docs.get(`quizzes/${exam.quizId}`).ownerId = 'owner'; exam.docs.set('users/owner', { role: 'teacher', status: 'active' });
  await assert.rejects(exam.exports.configurePracticeSolutionRelease({ ...exam.request({ action: 'release', expectedRevision: 'f'.repeat(64), confirmAfterSubmit: true }), auth: { uid: 'owner' } }), { code: 'failed-precondition' });
  const f = practiceFixture({ showSolutions: false }); await f.publish();
  const revision = f.docs.get(`assessmentPolicies/${f.quizId}`).revision;
  f.docs.get(`quizzes/${f.quizId}`).sessionRunId = 'another-run';
  await assert.rejects(f.teacher({ action: 'release', expectedRevision: revision, confirmAfterSubmit: true }), { code: 'failed-precondition' });
});


test('large solution audio does not inflate the private attempt payload and assets remain revision bound', async () => {
  const f = practiceFixture();
  const src = 'data:audio/wav;base64,' + 'A'.repeat(860000);
  f.docs.set(`quizzes/${f.quizId}/audioScripts/q1`, { solutionAudioDataUrl: src });
  await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('largeaudio'); await f.submit(a.attemptId);
  const privateData = f.docs.get(`assessmentPrivate/${f.quizId}_${a.attemptId}`);
  assert.ok(Buffer.byteLength(JSON.stringify(privateData)) < 10000);
  assert.equal((await f.receipt(a.attemptId)).receipt.solutions[0].audio.src, src);
});

test('legacy attempts without revision-bound audio never attach current edited solution audio', async () => {
  const f = fixture(); const a = await f.start('legacy'); await f.submit(a.attemptId);
  const privateData = f.docs.get(`assessmentPrivate/${f.quizId}_${a.attemptId}`);
  delete privateData.solutionAudioRefs;
  f.docs.set(`quizzes/${f.quizId}/audioScripts/q1`, { solutionAudioDataUrl: 'data:audio/wav;base64,TkVX' });
  Object.assign(f.docs.get(`quizzes/${f.quizId}`), { ended: true, endedAt: f.now - 90001 });
  const receipt = (await f.receipt(a.attemptId)).receipt;
  assert.equal(receipt.solutionsReleased, true);
  assert.equal(Object.hasOwn(receipt.solutions[0], 'audio'), false);
});

test('late-release receipt remains consistent across submitted resume start retry and repeated submit', async () => {
  const f = practiceFixture({ showSolutions: false }); await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('consistent'); await f.submit(a.attemptId);
  await f.teacher({ action: 'release', expectedRevision: f.docs.get(`assessmentPolicies/${f.quizId}`).revision, confirmAfterSubmit: true });
  const resumed = await f.exports.resumeAssessmentAttempt(f.request({ attemptId: a.attemptId, attemptToken: f.token }));
  assert.equal(resumed.receipt.solutionsReleased, true);
  assert.equal((await f.start('consistent')).receipt.solutionsReleased, true);
  assert.equal((await f.submit(a.attemptId)).receipt.solutionsReleased, true);
});


test('unreleased practice and invalid tokens never read immutable solution audio assets', async () => {
  const f = practiceFixture({ showSolutions: false });
  f.docs.set(`quizzes/${f.quizId}/audioScripts/q1`, { solutionAudioDataUrl: 'data:audio/wav;base64,T0xE' });
  await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('noaudioleak'); await f.submit(a.attemptId); await f.receipt(a.attemptId);
  assert.equal(f.assetReads, 0);
  await assert.rejects(f.exports.getAssessmentReceipt(f.request({ attemptId: a.attemptId, attemptToken: 'B'.repeat(43) })), { code: 'permission-denied' });
  assert.equal(f.assetReads, 0);
  await f.teacher({ action: 'release', expectedRevision: f.docs.get(`assessmentPolicies/${f.quizId}`).revision, confirmAfterSubmit: true });
  assert.equal((await f.receipt(a.attemptId)).receipt.solutions[0].audio.src, 'data:audio/wav;base64,T0xE');
  assert.equal(f.assetReads, 1);
});


test('thirty 400KB solution audios use bounded immutable commits and a bounded receipt payload', async () => {
  const f = practiceFixture();
  for (let i = 1; i <= 30; i++) {
    const id = 'q' + i;
    f.docs.set(`quizzes/${f.quizId}/questions/${id}`, { id, position: i, type: 'number', text: '2+2', points: 1, numericAnswer: 4 });
    f.docs.set(`quizzes/${f.quizId}/audioScripts/${id}`, { solutionAudioDataUrl: 'data:audio/wav;base64,' + 'A'.repeat(400000) });
  }
  await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('boundedcommit'); await f.submit(a.attemptId);
  assert.equal([...f.docs.keys()].filter(k => k.startsWith('assessmentSolutionAssets/')).length, 30);
  assert.equal(f.assetBatchSizes.length, 2);
  assert.ok(f.assetBatchSizes.every(bytes => bytes < 8_000_000));
  const receipt = (await f.receipt(a.attemptId)).receipt;
  assert.equal(receipt.solutions.length, 30);
  assert.ok(Buffer.byteLength(JSON.stringify(receipt)) < 8_500_000);
  assert.equal(receipt.solutionAudioPartial, true);
});

test('missing immutable audio can be repaired on authenticated start retry only from its exact stored digest', async () => {
  const f = practiceFixture();
  f.docs.set(`quizzes/${f.quizId}/audioScripts/q1`, { solutionAudioDataUrl: 'data:audio/wav;base64,T0xE' });
  await f.publish(); f.docs.get(`quizzes/${f.quizId}`).sessionState = 'running';
  const a = await f.start('repairmedia');
  const assetId = f.docs.get(`assessmentPrivate/${f.quizId}_${a.attemptId}`).solutionAudioRefs.q1.assetId;
  f.docs.delete('assessmentSolutionAssets/' + assetId);
  await f.start('repairmedia');
  assert.equal(f.docs.get('assessmentSolutionAssets/' + assetId)?.audio.src, 'data:audio/wav;base64,T0xE');
  f.docs.delete('assessmentSolutionAssets/' + assetId);
  f.docs.get(`quizzes/${f.quizId}/audioScripts/q1`).solutionAudioDataUrl = 'data:audio/wav;base64,TkVX';
  await f.start('repairmedia');
  assert.equal(f.docs.has('assessmentSolutionAssets/' + assetId), false);
});

function classroomFixture(){const f=fixture();const {hash}=require('../lib/classroom-service');const sessionToken='C'.repeat(43);f.docs.set('classroomQuizPolicies/'+f.quizId,{required:true,schoolId:'school',sessionRunId:'run1'});f.docs.set('classroomSessions/'+hash(sessionToken),{schoolId:'school',studentId:'pupil',deviceMode:'shared',lastActivity:f.now,expiresAt:f.now+300000,accessVersion:1});f.docs.set('classroomSchools/school/students/pupil',{firstName:'Test',lastName:'Eins',status:'active',accessVersion:1});f.docs.set('classroomSchools/school/assignments/assignment',{quizId:f.quizId,sessionRunId:'run1',recipientIds:['pupil']});const start=(client='classroom-client-0001')=>f.exports.startAssessmentAttempt(f.request({studentName:'FORGED',clientAttemptId:client,attemptToken:f.token,classroomSession:sessionToken,classroomAssignment:'assignment',classroomGeneration:0}));return {...f,startPersonal:start};}
test('actual assessment handler blocks guest bypass and binds server pupil name to one attempt',async()=>{const f=classroomFixture();await assert.rejects(f.start('guest'),{code:'unauthenticated'});assert.equal([...f.docs.keys()].some(k=>k.includes('/attempts/')),false);const a=await f.startPersonal();const stored=f.docs.get(`quizzes/${f.quizId}/attempts/${a.attemptId}`);assert.equal(stored.studentName,'Test Eins');assert.equal(stored.classroom.studentId,'pupil');await assert.rejects(f.startPersonal('different-client-0001'),{code:'already-exists'});const submitted=await f.submit(a.attemptId);assert.equal(submitted.receipt.attemptId,a.attemptId);const saved=f.docs.get(`quizzes/${f.quizId}/submissions/${a.attemptId}`);assert.equal(saved.classroom.studentId,'pupil');assert.equal(saved.classroom.assignmentId,'assignment');});
test('released replacement blocks old attempt submission and leaves old answers/attempt intact',async()=>{const f=classroomFixture();const a=await f.startPersonal();const path='classroomSchools/school/assignments/assignment/participants/pupil';f.docs.set(path,{generation:1,attemptId:null});await assert.rejects(f.submit(a.attemptId),{code:'failed-precondition'});assert.equal(f.docs.get(`quizzes/${f.quizId}/attempts/${a.attemptId}`).status,'running');assert.equal(f.docs.has(`quizzes/${f.quizId}/submissions/${a.attemptId}`),false);await assert.rejects(f.exports.resumeAssessmentAttempt(f.request({attemptId:a.attemptId,attemptToken:f.token})),{code:'failed-precondition'});});
test('guest attempts started before a class assignment cannot resume or submit after its personal gate is enabled',async()=>{const f=fixture();const a=await f.start('prior-guest');f.docs.set('classroomQuizPolicies/'+f.quizId,{required:true,schoolId:'school',sessionRunId:'run1'});await assert.rejects(f.exports.resumeAssessmentAttempt(f.request({attemptId:a.attemptId,attemptToken:f.token})),{code:'permission-denied'});await assert.rejects(f.submit(a.attemptId),{code:'permission-denied'});assert.equal(f.docs.has(`quizzes/${f.quizId}/submissions/${a.attemptId}`),false);});
test('personal gate also protects self-start rounds using the authoritative student epoch run id',async()=>{const f=fixture();Object.assign(f.docs.get(`quizzes/${f.quizId}`),{startMode:'student',publishedAt:f.now,sessionRunId:'author-ui-run'});f.docs.set('classroomQuizPolicies/'+f.quizId,{required:true,schoolId:'school',sessionRunId:`student_${f.now}`});await assert.rejects(f.start('guest'),{code:'unauthenticated'});});
