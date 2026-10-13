"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

for (const attempts of [[], ['assessmentPrivate/QUIZ_attempt']]) {
  test(`quiz deletion removes private publication and immutable audio with ${attempts.length} remaining attempts`, async () => {
    const paths = new Set([...attempts, 'assessmentPolicies/QUIZ', 'assessmentSolutionAssets/audio', 'assessmentPolicies/OTHER', 'assessmentSolutionAssets/other']);
    const docs = path => [...paths].filter(p => p.startsWith(path + '/') && !p.endsWith('other')).map(p => ({ ref: { path: p } }));
    const db = { collection: path => ({ where: (field, op, id) => ({ get: async () => { assert.equal(field, 'quizId'); assert.equal(op, '=='); assert.equal(id, 'QUIZ'); const rows = docs(path); return { docs: rows, empty: !rows.length }; } }) }),
      doc: path => ({ path }), batch: () => ({ delete: ref => paths.delete(ref.path), commit: async () => {} }) };
    const exports = {};
    vm.runInNewContext(fs.readFileSync(require.resolve('../lib/cleanup'), 'utf8'), { exports, require: name => name === 'firebase-admin/firestore' ? { getFirestore: () => db } : { onDocumentDeleted: (_, handler) => handler } });
    await exports.cleanupAssessmentPrivateOnQuizDelete({ params: { quizId: 'QUIZ' } });
    assert.deepEqual([...paths].sort(), ['assessmentPolicies/OTHER', 'assessmentSolutionAssets/other']);
  });
}
