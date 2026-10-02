const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('lab/escape-room-adventure/index.html', 'utf8');
const css = fs.readFileSync('lab/escape-room-adventure/styles.css', 'utf8');
const js = fs.readFileSync('lab/escape-room-adventure/app.js', 'utf8');
const originalEscape = fs.readFileSync('lab/escape-room/index.html', 'utf8');

test('adventure prototype is isolated from the existing Escape game', () => {
  assert.match(html, /Escape Adventure Prototyp/);
  assert.match(originalEscape, /escape-data\.js/);
  assert.doesNotMatch(originalEscape, /escape-room-adventure/);
});

test('desktop and touch movement controls are both present', () => {
  assert.match(html, /id="gameCanvas"/);
  assert.match(html, /class="touch-controls"/);
  assert.match(html, /data-dir="up"/);
  assert.match(html, /data-dir="left"/);
  assert.match(html, /data-dir="down"/);
  assert.match(html, /data-dir="right"/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /pointerdown/);
  assert.match(js, /btn\.dataset\.dir/);
  assert.match(css, /touch-action:none/);
});

test('room one keeps the known learning and item progression', () => {
  for (const id of ['q1', 'q2', 'q3']) assert.match(js, new RegExp(`${id}:`));
  assert.match(js, /reward: 'battery'/);
  assert.match(js, /reward: 'clue4'/);
  assert.match(js, /reward: 'clue7'/);
  assert.match(js, /state\.clues\.add\('8'\)/);
  assert.match(js, /flashlightPowered/);
  assert.match(js, /value==='784'/);
});

test('a wrong learning answer can never unlock progress directly', () => {
  assert.match(js, /state\.attempts\[id\]\+\+/);
  assert.match(js, /startTransfer\(id\)/);
  assert.match(js, /rewardQuestion\(id\)/);
  const wrongBranch = js.indexOf('state.selectedAnswer!==q.correct');
  const reward = js.indexOf('rewardQuestion(id)', wrongBranch);
  const transfer = js.indexOf('startTransfer(id)', wrongBranch);
  assert.ok(wrongBranch >= 0 && transfer > wrongBranch && reward > transfer);
});

test('door guessing is bounded by mandatory clue review', () => {
  assert.match(js, /doorFailures>=2/);
  assert.match(js, /new Set\(\['shelf','computer','board'\]\)/);
  assert.match(js, /Code gesperrt/);
});

test('prototype uses shared GradeCrew Coco instead of a local mascot copy', () => {
  assert.match(html, /shared\/penguin-guide\.svg#pose-1/);
  assert.doesNotMatch(html, /emoji|🐧/);
});
