const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('lab/escape-expedition/index.html', 'utf8');
const css = fs.readFileSync('lab/escape-expedition/styles.css', 'utf8');
const js = fs.readFileSync('lab/escape-expedition/app.js', 'utf8');
const concept = fs.readFileSync('docs/games/ESCAPE_GAMES_CONCEPT.md', 'utf8');
const oldAdventure = fs.readFileSync('lab/escape-room-adventure/index.html', 'utf8');

test('prototype is isolated and does not replace the school adventure', () => {
  assert.match(html, /Expedition Amazonas/);
  assert.match(oldAdventure, /Escape Adventure Prototyp/);
  assert.doesNotMatch(oldAdventure, /escape-expedition/);
});

test('escape-only concept defines engine, mechanics, worlds and variable runs', () => {
  for (const heading of ['Gemeinsame Escape-Engine', 'Große Mechanik-Bibliothek', 'Echte Welt- und Story-Packs', 'Variable Runs']) {
    assert.match(concept, new RegExp(heading));
  }
  assert.match(concept, /30 Schüler sollen nicht 30 KI-Generierungen benötigen/);
  assert.match(concept, /mindestens 2–3 charakteristische Mechaniken/);
});

test('prototype contains a six-stage expedition with multiple mechanic types', () => {
  for (const scene of ['camp', 'jeep', 'wildlife', 'river', 'station', 'tower']) assert.match(js, new RegExp(`${scene}: \{ stage:`));
  assert.match(js, /function updateJeep/);
  assert.match(js, /function pullWinch/);
  assert.match(js, /function takePhoto/);
  assert.match(js, /function updateRiver/);
  assert.match(js, /function chooseCircuit/);
  assert.match(js, /function sendRadio/);
});

test('desktop and touch input contracts exist', () => {
  assert.match(html, /class="touch-controls"/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /pointerdown/);
  assert.match(js, /touchInteractBtn/);
  assert.match(js, /cameraBtn/);
  assert.match(css, /touch-action:none/);
});

test('learning content is seeded and can vary without per-student AI calls', () => {
  assert.match(js, /seedFromUrl/);
  assert.match(js, /q1Base = pick/);
  assert.match(js, /q2Base = pick/);
  assert.match(js, /q3Base = pick/);
  assert.match(js, /radioChannel = 42 \+ \(seed % 17\)/);
  assert.match(js, /makeTransfer/);
});

test('wrong answers never directly grant learning progress', () => {
  const start = js.indexOf('function checkLearning');
  const end = js.indexOf('function openWinch', start);
  const body = js.slice(start, end);
  assert.match(body, /state\.attempts\[id\]\+\+/);
  assert.match(body, /state\.learningMode = 'transfer'/);
  assert.match(body, /rewardQuestion\(id\)/);
  const wrong = body.indexOf('state.selectedAnswer !== data.correct');
  const reward = body.indexOf('rewardQuestion(id)');
  assert.ok(wrong >= 0 && reward > wrong);
});

test('teacher-independent gameplay uses no external runtime assets or APIs', () => {
  assert.doesNotMatch(html, /https?:\/\//);
  assert.doesNotMatch(js, /fetch\s*\(/);
  assert.doesNotMatch(js, /OPENAI|ANTHROPIC|api[_-]?key/i);
});

test('production is not referenced by the prototype files', () => {
  const all = `${html}\n${css}\n${js}`;
  assert.doesNotMatch(all, /hausaufgabe-40294/);
  assert.doesNotMatch(all, /production/i);
});
