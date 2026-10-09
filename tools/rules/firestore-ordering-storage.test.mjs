import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import { orderingVariants, orderingVariantsForStorage, validOrder, orderingNeedsReview, gradeOrdering } from '../../ordering-grading.mjs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, terminate } from 'firebase/firestore';

// Only the real SDK's local parser runs. No credentials or network commits.
const app = initializeApp({ projectId: 'demo-gradecrew-ordering-storage' });
const db = getFirestore(app);
const require = createRequire(import.meta.url);
const { buildAssessmentContract, gradeQuestion, authoringFingerprint } = require('../../assessment-functions/lib/assessment-core.js');
const { storedAiQuestion } = require('../../functions/lib/ai-job.js');
const question = { id: 'q1', type: 'ordering', text: 'Sort ascending', position: 1, points: 1,
  items: ['one', 'two', 'three'], acceptedOrders: [[2, 1, 0]] };
const secret = 'T'.repeat(43);

after(async () => { await terminate(db); await deleteApp(app); });

function assertFirestoreAccepts(value) {
  const payload = JSON.parse(JSON.stringify(value)); // Normalize the test VM's cross-realm plain objects.
  assert.doesNotThrow(() => writeBatch(db).set(doc(db, 'synthetic', 'ordering'), payload));
}

test('ordering grading keys, including the implicit primary order, can be stored by Firestore', () => {
  for (const acceptedOrders of [[], [[2, 1, 0]]]) {
    const contract = buildAssessmentContract([{ ...question, acceptedOrders }], secret);
    assertFirestoreAccepts({ gradingKey: contract.gradingKey });
  }
});

test('generated ordering alternatives are storable while all accepted answers retain credit', async () => {
  const stored = await storedAiQuestion(question, 0, { model: 'mock', promptVersion: 'test' });
  assertFirestoreAccepts(stored);
  const contract = buildAssessmentContract([{ ...stored, id: 'q1' }], secret);
  const opaque = new Map(contract.paper[0].items.map(item => [item.text, item.id]));
  assert.equal(gradeQuestion(contract.gradingKey[0], ['three', 'two', 'one'].map(value => opaque.get(value))).correct, true);
  const legacy = { ...contract.gradingKey[0], acceptedOrders: contract.gradingKey[0].acceptedOrders.map(order => order.ids) };
  assert.equal(gradeQuestion(legacy, ['three', 'two', 'one'].map(value => opaque.get(value))).correct, true);
  assert.equal(authoringFingerprint([question]), authoringFingerprint([{ ...question, acceptedOrders: stored.acceptedOrders }]));
});

test('manual saves and feedback remain storable, and editor reload preserves alternatives', () => {
  const source = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  const context = { orderingVariants, orderingVariantsForStorage, validOrder, orderingNeedsReview,
    round1: value => Math.round(value * 2) / 2, getQuestionAudioSrc: () => '', getQuestionImageSrc: () => '' };
  vm.createContext(context);
  vm.runInContext(extract('function initializeTypeData(', 'async function openEditor(')
    + extract('function sanitizeQuestionForSave(', 'async function saveCurrentQuiz(')
    + extract('function aiQuestionFeedbackSnapshot(', 'async function submitTutorialQuestionFeedback('), context);
  const saved = context.sanitizeQuestionForSave(question);
  assertFirestoreAccepts(saved);
  assertFirestoreAccepts({ questionSnapshot: context.aiQuestionFeedbackSnapshot(question) });
  const loaded = { ...saved };
  context.initializeTypeData(loaded, 'ordering');
  assert.equal(gradeOrdering(loaded, [2, 1, 0]).correct, true);
  assert.deepEqual(JSON.parse(JSON.stringify(loaded.acceptedOrders)), [[2, 1, 0]]);
});
