'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { profileRequest, SHORT_TEST_PROFILES, SHORT_TEST_PROFILE_RULES } = require('../lib/short-test-profiles');
const { SYSTEM, testUserPrompt } = require('../lib/prompts');
const { core, parseVisualTask, publicVisualTask } = require('../lib/visual-task');
const fixtures = require('./fixtures/short-test-profiles.json');

test('a short-test profile reaches the existing Remy prompt with a complete bounded request', () => {
  for (const profile of SHORT_TEST_PROFILES) {
    const request = profileRequest(profile.id);
    const prompt = testUserPrompt(request);
    assert.equal(request.count, 4);
    assert.equal(request.points, ['KURZ-REAKTION', 'KURZ-MENGEN'].includes(profile.id) ? 12 : 8);
    assert.deepEqual(request.allowedTypes, ['visual']);
    assert.equal(request.imageMode, 'none');
    assert.equal(request.audioMode, 'none');
    assert.ok(prompt.includes(request.notes));
    assert.ok(prompt.includes(profile.id));
    assert.equal(prompt.includes('undefined'), false);
    assert.equal(Object.hasOwn(request, 'clientRequestId'), false, 'request IDs belong to the actual persisted attempt');
  }
  assert.ok(SYSTEM.includes(SHORT_TEST_PROFILE_RULES), 'the live shared authoring prompt must load the profiles');
});

test('unknown or prototype-like profile IDs cannot silently select another subject', () => {
  for (const id of ['unknown', '', '__proto__', 'constructor', undefined]) {
    assert.throws(() => profileRequest(id), /Unbekanntes Kurztestprofil/);
  }
});

test('editing one prepared request cannot change another request or the shared profile', () => {
  const changed = profileRequest('KURZ-BRUCH');
  changed.allowedTypes.push('text');
  changed.count = 99;
  changed.notes = 'changed';
  const next = profileRequest('KURZ-BRUCH');
  assert.deepEqual(next.allowedTypes, ['visual']);
  assert.equal(next.count, 4);
  assert.notEqual(next.notes, 'changed');
});

// Expected answers below are hand calculated, independent of solutionResponse().
const cases = [
  ['KURZ-BRUCH', [0,1,2,3,4,5], 2, [0,1], 0],
  ['KURZ-FUNKTION', {out:'13'}, 2, {out:'9'}, 0],
  ['KURZ-GERADE', [{x:0,y:-1},{x:2,y:3}], 2, [{x:0,y:1},{x:2,y:5}], 0],
  ['KURZ-VEKTOR', [{x:2,y:3}], 2, [{x:4,y:3}], 0],
  ['KURZ-REAKTION', {h2:'2',o2:'1',h2o:'2'}, 3, {h2:'1',o2:'1',h2o:'1'}, 1],
  ['KURZ-ATOM', {mass:'14',charge:'-1'}, 2, {mass:'21',charge:'1'}, 0],
  ['KURZ-OHM', 20, 2, 2, 0],
  ['KURZ-MENGEN', {packets:'3',red:'1',blue:'1'}, 3, {packets:'4',red:'-1',blue:'0'}, 0],
];

for (const [id, right, rightPoints, wrong, wrongPoints] of cases) {
  test(`${id}: the server contract and grading match independently calculated answers`, () => {
    const task = parseVisualTask(JSON.stringify(fixtures[id]), {points:rightPoints});
    assert.equal(core.grade(task, right).points, rightPoints);
    assert.equal(core.grade(task, wrong).points, wrongPoints);
    assert.equal(core.grade(task, null).points, 0);
    const student = JSON.parse(publicVisualTask(JSON.stringify(task)));
    for (const key of ['solution', 'rationale', 'provenance', 'review']) {
      assert.equal(Object.hasOwn(student, key), false, `${id}: private ${key}`);
    }
  });
}

test('fraction grading accepts alternative patterns but rejects duplicate or excess cells', () => {
  const task = fixtures['KURZ-BRUCH'];
  assert.equal(core.grade(task, [2,3,4,5,6,7]).points, 2);
  assert.equal(core.grade(task, [0,1,2,3,4,4]).points, 0);
  assert.equal(core.grade(task, [0,1,2,3,4,5,6,7]).points, 0);
});

test('the two specified function points cannot be replaced by other collinear points or swapped labels', () => {
  const task = fixtures['KURZ-GERADE'];
  assert.equal(core.grade(task, [{x:-1,y:-3},{x:3,y:5}]).points, 0);
  assert.equal(core.grade(task, [{x:2,y:3},{x:0,y:-1}]).points, 0);
});

test('chemical coefficients require the stated smallest positive integer representation', () => {
  const task = fixtures['KURZ-REAKTION'];
  assert.equal(core.grade(task, {h2:'4',o2:'2',h2o:'4'}).points, 0);
  assert.equal(core.grade(task, {h2:'2/1',o2:'1/1',h2o:'2/1'}).points, 0);
});

test('partial points remain explicit for independent atom and stock answers', () => {
  assert.equal(core.grade(fixtures['KURZ-ATOM'], {mass:'14',charge:'1'}).points, 1);
  assert.equal(core.grade(fixtures['KURZ-MENGEN'], {packets:'3',red:'0',blue:'0'}).points, 1);
});

test('equivalent whole-number notation and a typographic minus keep the atom answer correct', () => {
  assert.equal(core.grade(fixtures['KURZ-ATOM'], {mass:'14,0',charge:'−1'}).points, 2);
  assert.equal(core.grade(fixtures['KURZ-ATOM'], {mass:'14/1',charge:'-1/1'}).points, 2);
});

test('an answer in amperes is not silently accepted on a milliampere scale', () => {
  assert.equal(core.grade(fixtures['KURZ-OHM'], 0.02).points, 0);
});
