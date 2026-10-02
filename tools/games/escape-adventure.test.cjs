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
  for (const dir of ['up', 'left', 'down', 'right']) assert.match(html, new RegExp(`data-dir="${dir}"`));
  assert.match(js, /ArrowLeft/);
  assert.match(js, /pointerdown/);
  assert.match(js, /btn\.dataset\.dir/);
  assert.match(css, /touch-action:none/);
});

test('click-to-move approaches reachable stand points instead of furniture centers', () => {
  assert.match(js, /standX:/);
  assert.match(js, /standY:/);
  assert.match(js, /tap: \{ x:/);
  assert.match(js, /function findApproachPoint\(h\)/);
  assert.match(js, /const target = findApproachPoint\(h\)/);
  assert.match(js, /state\.target = target/);
  assert.doesNotMatch(js, /state\.target = \{ x: h\.x, y: h\.y \}/);
});

test('room one keeps the known learning and item progression', () => {
  for (const id of ['q1', 'q2', 'q3']) assert.match(js, new RegExp(`${id}:`));
  assert.match(js, /reward: 'battery'/);
  assert.match(js, /reward: 'clue4'/);
  assert.match(js, /reward: 'clue7'/);
  assert.match(js, /state\.clues\.add\('8'\)/);
  assert.match(js, /flashlightPowered/);
});

test('flashlight follows player facing and reveals a real dark-corner clue', () => {
  assert.match(js, /facing:/);
  assert.match(js, /state\.player\.facing = Math\.atan2/);
  assert.match(js, /function isInFlashlightBeam/);
  assert.match(js, /ctx\.rotate\(p\.facing\)/);
  assert.match(js, /id: 'order-note'/);
  assert.match(js, /COMPUTER → TAFEL → REGAL/);
  assert.match(html, /data-step="order"/);
});

test('door code is now logically derivable and cannot open without the order note', () => {
  assert.match(js, /value === '784' && state\.clues\.size === 3 && state\.orderNoteFound/);
  assert.match(js, /Der Zettel sagt: Computer → Tafel → Regal/);
  assert.match(js, /Die Reihenfolge fehlt noch/);
});

test('a wrong learning answer can never unlock progress directly', () => {
  assert.match(js, /state\.attempts\[id\]\+\+/);
  assert.match(js, /startTransfer\(id\)/);
  assert.match(js, /rewardQuestion\(id\)/);
  const wrongBranch = js.indexOf('state.selectedAnswer !== q.correct');
  const transfer = js.indexOf('startTransfer(id)', wrongBranch);
  const reward = js.indexOf('rewardQuestion(id)', wrongBranch);
  assert.ok(wrongBranch >= 0 && transfer > wrongBranch && reward > transfer);
});

test('door guessing is bounded by mandatory clue review', () => {
  assert.match(js, /state\.doorFailures >= 2/);
  assert.match(js, /new Set\(\['shelf', 'computer', 'board'\]\)/);
  assert.match(js, /Code gesperrt/);
});

test('Coco is the shared guide, not the controllable player', () => {
  assert.match(html, /shared\/penguin-guide\.svg#pose-1/);
  assert.match(html, /COCO · DEIN GUIDE/);
  assert.match(js, /function drawExplorer\(\)/);
  assert.doesNotMatch(js, /cocoImage/);
});
