const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'lab', 'escape-room');

function openEscape(savedState) {
  const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'https://games.example/escape-room/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window;
  w.alert = message => { throw new Error('Unexpected alert: ' + message); };
  w.confirm = () => true;
  w.setInterval = () => 1;
  w.clearInterval = () => {};
  w.setTimeout = callback => { callback(); return 1; };

  if (w.HTMLDialogElement) {
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new w.Event('close'));
    };
  }

  w.eval(fs.readFileSync(path.join(source, 'escape-data.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(source, 'escape-tutor.js'), 'utf8'));

  if (savedState) {
    const D = w.GradeCrewEscapePrototype;
    w.localStorage.setItem(
      `gradecrew-escape-save:${D.world.id}:${D.world.version}`,
      JSON.stringify(savedState)
    );
  }

  w.eval(fs.readFileSync(path.join(source, 'app.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(source, 'escape-teacher-compact.js'), 'utf8'));
  return { dom, w, d: w.document };
}

function click(d, selector) {
  const node = d.querySelector(selector);
  assert.ok(node, 'Missing node: ' + selector);
  node.click();
}

function submitForm(w, d) {
  d.getElementById('questionForm').dispatchEvent(
    new w.Event('submit', { bubbles: true, cancelable: true })
  );
}

function submitAnswer(w, d, index) {
  const input = d.querySelector(`#questionOptions input[value="${index}"]`);
  assert.ok(input, 'Answer option missing: ' + index);
  input.checked = true;
  submitForm(w, d);
}

function solveCurrentQuestion(w, d) {
  const number = Number(d.getElementById('questionTitle').textContent.match(/\d+/)?.[0]);
  assert.ok(number >= 1 && number <= 8, 'Question number not visible');
  const question = w.GradeCrewEscapePrototype.questions[number - 1];
  submitAnswer(w, d, question.correctIndex);
}

function completeRemediation(w, d, question) {
  const copy = d.getElementById('remediationInput');
  assert.ok(copy, 'Remediation input missing');
  copy.value = question.remediation.activeTask.text;
  submitForm(w, d);

  const transfer = d.getElementById('transferInput');
  assert.ok(transfer, 'Transfer input missing');
  transfer.value = question.remediation.transfer.acceptedAnswers[0];
  submitForm(w, d);
}

function clickPuzzleText(d, text) {
  const button = [...d.querySelectorAll('#puzzleBody button')]
    .find(node => node.textContent.trim() === text);
  assert.ok(button, 'Puzzle button missing: ' + text);
  button.click();
}

test('numeric transfer retains tolerance and empty answers do not count as an attempt', () => {
  const { w, d } = openEscape();
  try {
    const set = w.GradeCrewEscapeIntegration.getQuestionSet();
    set[0].remediation.transfer = { prompt: 'Runde 1,25', acceptedAnswers: ['1.25'], answerMode: 'number',
      numericAnswer: 1.25, tolerance: 0.1, hint: 'Eine Nachkommastelle.', explanation: '1,3 liegt im erlaubten Bereich.' };
    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');
    submitAnswer(w, d, (set[0].correctIndex + 1) % 4);
    submitAnswer(w, d, set[0].correctIndex);
    assert.ok(d.getElementById('transferInput'));
    submitForm(w, d);
    assert.match(d.getElementById('questionFeedback').textContent, /zuerst eine Antwort/);
    d.getElementById('transferInput').value = '1,3';
    submitForm(w, d);
    assert.equal(d.getElementById('questionDialog').open, false);
  } finally { w.close(); }
});


test('Escape preflight accepts remediation data and rejects duplicate question ids', () => {
  const { w } = openEscape();
  try {
    const D = w.GradeCrewEscapePrototype;
    assert.equal(D.world.version, '0.2.1');
    assert.equal(D.validateWorldDefinition().ok, true);

    const bad = D.questions.map((q, i) => ({
      ...q,
      id: i === 1 ? 'q1' : q.id,
      options: [...q.options],
      remediation: {
        ...q.remediation,
        activeTask: { ...q.remediation.activeTask },
        transfer: {
          ...q.remediation.transfer,
          acceptedAnswers: [...q.remediation.transfer.acceptedAnswers]
        }
      }
    }));
    assert.equal(D.validateWorldDefinition(D.world, bad).ok, false);
  } finally {
    w.close();
  }
});

test('teacher preview exposes route, eight editable questions and a passing preflight', () => {
  const { w, d } = openEscape();
  try {
    assert.match(d.getElementById('preflightStatus').textContent, /Preflight bestanden/);
    assert.equal(d.querySelectorAll('#teacherRoute li').length, 3);
    assert.equal(d.querySelectorAll('#teacherQuestions .teacherQuestion').length, 8);
    assert.equal(d.querySelectorAll('#teacherQuestions .smallButton').length, 8);
    assert.match(d.querySelector('.labWarning').textContent, /Berechtigungsprüfung/);
    assert.match(d.getElementById('teacherContentProfile').textContent, /Prozentrechnung/);
    assert.ok(d.querySelector('#teacherEditDialog .teacherAdvancedDetails'));
    assert.equal(d.querySelectorAll('#teacherQuestions .teacherLearningDetails').length, 8);
  } finally {
    w.close();
  }
});

test('teacher can edit one learning slot before play and the canonical integration hook returns it', () => {
  const { w, d } = openEscape();
  try {
    click(d, '#teacherQuestions .smallButton');
    assert.equal(d.getElementById('teacherEditDialog').open, true);

    d.getElementById('editPrompt').value = 'Wie viel sind 50 % von 30?';
    d.getElementById('editOption0').value = '10';
    d.getElementById('editOption1').value = '15';
    d.getElementById('editOption2').value = '20';
    d.getElementById('editOption3').value = '25';
    d.getElementById('editCorrectIndex').value = '1';

    d.getElementById('teacherEditForm').dispatchEvent(
      new w.Event('submit', { bubbles: true, cancelable: true })
    );

    assert.equal(d.getElementById('teacherEditDialog').open, false);
    assert.match(d.querySelector('#teacherQuestions .teacherQuestion p').textContent, /50 % von 30/);

    const set = w.GradeCrewEscapeIntegration.getQuestionSet();
    assert.equal(set[0].prompt, 'Wie viel sind 50 % von 30?');
    assert.equal(set[0].correctIndex, 1);
  } finally {
    w.close();
  }
});

test('three attempts trigger mandatory active learning and transfer before progress', () => {
  const { w, d } = openEscape();
  try {
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');

    const q1 = w.GradeCrewEscapePrototype.questions[0];
    const wrong = q1.correctIndex === 0 ? 1 : 0;

    submitAnswer(w, d, wrong);
    submitAnswer(w, d, wrong);
    submitAnswer(w, d, wrong);

    assert.equal(d.getElementById('progressText').textContent, '0 / 8 Fragen');
    assert.ok(d.getElementById('remediationInput'));
    assert.equal(d.getElementById('remyHelp').hidden, false);

    completeRemediation(w, d, q1);

    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');
    assert.match(d.getElementById('inventory').textContent, /Batterie/);
  } finally {
    w.close();
  }
});

test('one wrong answer gives a real hint and a later correct answer still requires transfer', () => {
  const { w, d } = openEscape();
  try {
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');
    const q1 = w.GradeCrewEscapePrototype.questions[0];
    const wrong = q1.correctIndex === 0 ? 1 : 0;

    submitAnswer(w, d, wrong);
    assert.match(d.getElementById('questionFeedback').textContent, /Denkhilfe:/);
    assert.match(d.getElementById('questionFeedback').textContent, new RegExp(q1.hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(d.getElementById('questionFeedback').textContent, /Lies die Aufgabe noch einmal/);

    submitAnswer(w, d, q1.correctIndex);
    assert.equal(d.getElementById('progressText').textContent, '0 / 8 Fragen');
    assert.ok(d.getElementById('transferInput'));

    d.getElementById('transferInput').value = q1.remediation.transfer.acceptedAnswers[0];
    submitForm(w, d);
    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');
  } finally {
    w.close();
  }
});

test('text answer mode can unlock progress with an accepted answer', () => {
  const { w, d } = openEscape();
  try {
    const set = w.GradeCrewEscapeIntegration.getQuestionSet();
    set[0] = { ...set[0], answerMode: 'text', acceptedAnswers: ['München', 'Muenchen'] };
    delete set[0].options;
    delete set[0].correctIndex;
    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');
    const input = d.getElementById('primaryAnswerInput');
    assert.ok(input);
    input.value = 'muenchen';
    submitForm(w, d);
    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');
  } finally { w.close(); }
});

test('number answer mode accepts decimal comma within tolerance', () => {
  const { w, d } = openEscape();
  try {
    const set = w.GradeCrewEscapeIntegration.getQuestionSet();
    set[0] = { ...set[0], answerMode: 'number', numericAnswer: 4.5, tolerance: 0.05, unit: 'kg' };
    delete set[0].options;
    delete set[0].correctIndex;
    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');
    const input = d.getElementById('primaryAnswerInput');
    assert.ok(input);
    assert.match(d.getElementById('questionOptions').textContent, /kg/);
    input.value = '4,52';
    submitForm(w, d);
    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');
  } finally { w.close(); }
});

test('local Remy knowledge answers are cached without using an external bridge', async () => {
  const { w } = openEscape();
  try {
    const question = w.GradeCrewEscapePrototype.questions[0];
    const first = await w.GradeCrewEscapeTutor.ask(question, 'Warum durch 4?');
    const second = await w.GradeCrewEscapeTutor.ask(question, 'Warum durch 4?');
    const stats = w.GradeCrewEscapeTutor.getStats();

    assert.equal(first.source, 'knowledge');
    assert.equal(second.source, 'cache');
    assert.equal(stats.knowledgeHits, 1);
    assert.equal(stats.cacheHits, 1);
    assert.equal(stats.externalCalls, 0);
  } finally {
    w.close();
  }
});

test('repeated board guessing forces the learner to reread the pattern before retrying', () => {
  const { w, d } = openEscape();
  try {
    d.getElementById('startBtn').click();
    click(d, '[data-action="board"]');
    clickPuzzleText(d, '7');
    d.getElementById('puzzleResetBtn').click();
    clickPuzzleText(d, '10');
    assert.equal(d.getElementById('puzzleDialog').open, false);
    click(d, '[data-action="board"]');
    assert.equal(d.getElementById('puzzleDialog').open, false);
    assert.match(d.getElementById('messageBar').textContent, /gleichbleibenden Abstand/);
    click(d, '[data-action="board"]');
    assert.equal(d.getElementById('puzzleDialog').open, true);
  } finally { w.close(); }
});

test('two wrong door codes require reviewing all three code sources before another attempt', () => {
  const { w, d } = openEscape();
  try {
    const set = w.GradeCrewEscapeIntegration.getQuestionSet();
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]'); submitAnswer(w, d, set[0].correctIndex);
    click(d, '[data-action="cabinet"]'); click(d, '.inventoryItem'); click(d, '[data-action="cabinet"]');
    click(d, '[data-action="shelf"]'); submitAnswer(w, d, set[1].correctIndex);
    click(d, '[data-action="computer"]'); submitAnswer(w, d, set[2].correctIndex);
    click(d, '[data-action="board"]'); clickPuzzleText(d, '8');
    click(d, '[data-action="door"]'); clickPuzzleText(d, '1'); clickPuzzleText(d, '1'); clickPuzzleText(d, '1');
    d.getElementById('puzzleResetBtn').click();
    clickPuzzleText(d, '2'); clickPuzzleText(d, '2'); clickPuzzleText(d, '2');
    assert.equal(d.getElementById('puzzleDialog').open, false);
    click(d, '[data-action="door"]');
    assert.equal(d.getElementById('puzzleDialog').open, false);
    click(d, '[data-action="shelf"]');
    click(d, '[data-action="computer"]');
    click(d, '[data-action="door"]');
    assert.equal(d.getElementById('puzzleDialog').open, false);
    click(d, '[data-action="board"]');
    assert.match(d.getElementById('messageBar').textContent, /Jetzt darfst du den Code erneut eingeben/);
    click(d, '[data-action="door"]');
    assert.equal(d.getElementById('puzzleDialog').open, true);
  } finally { w.close(); }
});

test('full route reaches the exit; repeated symbol guessing forces clue review', () => {
  const { w, d } = openEscape();
  try {
    d.getElementById('startBtn').click();

    click(d, '[data-action="desk"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="cabinet"]');
    click(d, '.inventoryItem');
    click(d, '[data-action="cabinet"]');
    click(d, '[data-action="shelf"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="computer"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="board"]'); clickPuzzleText(d, '8');
    click(d, '[data-action="door"]'); clickPuzzleText(d, '7'); clickPuzzleText(d, '8'); clickPuzzleText(d, '4');
    click(d, '[data-action="door"]');
    assert.equal(d.getElementById('roomTitle').textContent, 'Flur');

    click(d, '[data-action="shelf"]'); solveCurrentQuestion(w, d);

    click(d, '[data-action="desk"]');
    clickPuzzleText(d, '●'); clickPuzzleText(d, '●'); clickPuzzleText(d, '●');
    d.getElementById('puzzleResetBtn').click();
    clickPuzzleText(d, '■'); clickPuzzleText(d, '■'); clickPuzzleText(d, '■');

    assert.equal(d.getElementById('puzzleDialog').open, false);
    assert.match(d.getElementById('messageBar').textContent, /Schwarzen Brett/);

    click(d, '[data-action="desk"]');
    assert.equal(d.getElementById('puzzleDialog').open, false);

    click(d, '[data-action="shelf"]');
    assert.match(d.getElementById('messageBar').textContent, /▲ ● ■/);

    click(d, '[data-action="desk"]');
    clickPuzzleText(d, '▲'); clickPuzzleText(d, '●'); clickPuzzleText(d, '■');

    click(d, '.inventoryItem');
    click(d, '[data-action="door"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="door"]');
    assert.equal(d.getElementById('roomTitle').textContent, 'Sekretariat');

    click(d, '[data-action="computer"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="shelf"]'); clickPuzzleText(d, '★'); clickPuzzleText(d, '◆'); clickPuzzleText(d, '●');
    click(d, '[data-action="cabinet"]'); solveCurrentQuestion(w, d);
    click(d, '.inventoryItem');
    click(d, '[data-action="door"]'); solveCurrentQuestion(w, d);
    click(d, '[data-action="door"]');

    assert.equal(d.getElementById('resultView').hidden, false);
    assert.equal(d.getElementById('resultQuestions').textContent, '8 / 8');
    assert.equal(d.getElementById('resultPuzzles').textContent, '4');
    assert.equal(w.localStorage.length, 0);
  } finally {
    w.close();
  }
});

test('a saved run is offered for resume and restores its progress', () => {
  const first = openEscape();
  let saved;

  try {
    first.d.getElementById('startBtn').click();
    click(first.d, '[data-action="desk"]');
    solveCurrentQuestion(first.w, first.d);

    const key = first.w.localStorage.key(0);
    saved = JSON.parse(first.w.localStorage.getItem(key));
    assert.equal(saved.completedQuestions.includes('q1'), true);
  } finally {
    first.w.close();
  }

  const second = openEscape(saved);
  try {
    assert.equal(second.d.getElementById('resumeBtn').hidden, false);
    second.d.getElementById('resumeBtn').click();
    assert.equal(second.d.getElementById('gameView').hidden, false);
    assert.equal(second.d.getElementById('progressText').textContent, '1 / 8 Fragen');
    assert.match(second.d.getElementById('inventory').textContent, /Batterie/);
  } finally {
    second.w.close();
  }
});
