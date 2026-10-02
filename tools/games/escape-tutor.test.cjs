const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'lab', 'escape-room');

function loadTutor() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
  const w = dom.window;
  w.eval(fs.readFileSync(path.join(source, 'escape-data.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(source, 'escape-tutor.js'), 'utf8'));
  return { w };
}

test('common Remy help stays local and never calls the external bridge', async () => {
  const { w } = loadTutor();
  try {
    let externalCalls = 0;
    w.GradeCrewTutorBridge = { async ask() { externalCalls++; return { answer: 'extern' }; } };
    const question = w.GradeCrewEscapePrototype.questions[0];

    const start = await w.GradeCrewEscapeTutor.ask(question, 'Wie fange ich an?');
    const simpler = await w.GradeCrewEscapeTutor.ask(question, 'Kannst du es einfacher erklären?');
    const solution = await w.GradeCrewEscapeTutor.ask(question, 'Sag mir die Lösung');
    const example = await w.GradeCrewEscapeTutor.ask(question, 'Hast du ein Beispiel?');

    assert.equal(start.source, 'generic');
    assert.equal(simpler.source, 'generic');
    assert.equal(solution.source, 'generic');
    assert.match(solution.answer, /verrate dir die Lösung nicht/i);
    assert.equal(example.source, 'generic');
    assert.equal(externalCalls, 0);
    assert.equal(w.GradeCrewEscapeTutor.getStats().genericHits, 4);
  } finally { w.close(); }
});

test('specific unknown student question can use the external bridge and is session-cached', async () => {
  const { w } = loadTutor();
  try {
    let externalCalls = 0;
    w.GradeCrewTutorBridge = { async ask() { externalCalls++; return { answer: 'Individuelle Erklärung' }; } };
    const question = w.GradeCrewEscapePrototype.questions[0];

    const first = await w.GradeCrewEscapeTutor.ask(question, 'Warum funktioniert dieser Weg hier anders als gestern?');
    const second = await w.GradeCrewEscapeTutor.ask(question, 'Warum funktioniert dieser Weg hier anders als gestern?');

    assert.equal(first.source, 'external');
    assert.equal(second.source, 'cache');
    assert.equal(externalCalls, 1);
    assert.equal(w.GradeCrewEscapeTutor.getStats().externalCalls, 1);
    assert.equal(w.GradeCrewEscapeTutor.getStats().cacheHits, 1);
  } finally { w.close(); }
});
