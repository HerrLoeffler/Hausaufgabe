const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('lab/escape-expedition/index.html', 'utf8');
const css = fs.readFileSync('lab/escape-expedition/styles.css', 'utf8');
const js = fs.readFileSync('lab/escape-expedition/app.js', 'utf8');
const concept = fs.readFileSync('docs/games/ESCAPE_GAMES_CONCEPT.md', 'utf8');
const visualBible = fs.readFileSync('docs/games/ESCAPE_AMAZONAS_VISUAL_BIBLE.md', 'utf8');
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


test('M1.1 keeps full HUD rendering out of the animation update loop', () => {
  const start = js.indexOf('function update(now, dt)');
  const end = js.indexOf('function formatTime', start);
  const body = js.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.doesNotMatch(body, /updateHud\(\)/);
  assert.match(js, /let lastTimerSecond = -1/);
  assert.match(js, /previousNearId/);
  assert.match(js, /previousDistance <= 80/);
  assert.match(js, /previousProgress <= 50/);
});


test('M1.2 central game mode and transition lock guard scene changes', () => {
  assert.match(js, /gameMode: 'world', transitioning: false, sceneEpoch: 0, actionEpoch: 0/);
  assert.match(js, /function modeForScene/);
  assert.match(js, /function setGameMode/);
  assert.match(js, /function scheduleGuarded/);
  assert.match(js, /sceneEpoch !== state\.sceneEpoch \|\| actionEpoch !== state\.actionEpoch \|\| state\.transitioning/);

  const start = js.indexOf('function setScene(name, spawn = null)');
  const end = js.indexOf('function generalHotspots', start);
  const body = js.slice(start, end);
  assert.match(body, /if \(state\.transitioning \|\| state\.scene === name \|\| state\.won\) return false/);
  assert.match(body, /state\.transitioning = true/);
  assert.match(body, /setGameMode\('transition'\)/);
  assert.match(body, /const transitionEpoch = \+\+state\.sceneEpoch/);
  assert.match(body, /requestAnimationFrame/);
  assert.match(body, /state\.transitioning = false/);

  assert.match(js, /if \(state\.gameMode !== 'world' \|\| state\.transitioning \|\| !state\.near \|\| state\.won\) return/);
  assert.match(js, /if \(!state\.transitioning\) \{/);
  assert.match(js, /state\.gameMode==='radio'/);
  assert.match(js, /state\.gameMode==='camera'/);
  assert.match(js, /state\.gameMode==='modal'/);
});

test('M1.2 replaces state-changing delayed callbacks with guarded scheduling', () => {
  assert.doesNotMatch(js, /setTimeout\(\(\) => \{ state\.learningMode = 'transfer'/);
  assert.doesNotMatch(js, /setTimeout\(\(\) => \{ \$\('learningDialog'\)\.close\(\)/);
  assert.doesNotMatch(js, /setTimeout\(\(\) => \{ \$\('winchDialog'\)\.close\(\)/);
  assert.doesNotMatch(js, /setTimeout\(\(\) => \$\('generatorDialog'\)\.close\(\)/);
  assert.doesNotMatch(js, /setTimeout\(\(\) => \$\('victoryDialog'\)\.showModal\(\)/);
  assert.match(js, /scheduleGuarded\(850/);
  assert.match(js, /scheduleGuarded\(650/);
  assert.match(js, /scheduleGuarded\(500/);
  assert.match(js, /scheduleGuarded\(700/);
});


test('M1.3 winch modal updates only its own mechanic state', () => {
  const winchStart = js.indexOf('function updateWinch(dt)');
  const winchEnd = js.indexOf('function update(now, dt)', winchStart);
  const winchBody = js.slice(winchStart, winchEnd);
  assert.ok(winchStart >= 0 && winchEnd > winchStart);
  assert.match(winchBody, /state\.gameMode !== 'modal'/);
  assert.match(winchBody, /winchDialog/);
  assert.match(winchBody, /state\.winchValue/);
  assert.match(winchBody, /winchNeedle/);
  assert.doesNotMatch(winchBody, /updateGeneral|updateJeep|updateRiver|updateAnimals|updateHud|setScene/);

  const updateStart = js.indexOf('function update(now, dt)');
  const updateEnd = js.indexOf('function formatTime', updateStart);
  const updateBody = js.slice(updateStart, updateEnd);
  assert.doesNotMatch(updateBody, /winchDialog|winchNeedle|winchValue/);

  const loopStart = js.indexOf('function loop(now)');
  const loopEnd = js.indexOf('function canvasPoint', loopStart);
  const loopBody = js.slice(loopStart, loopEnd);
  assert.match(loopBody, /else if\(\$\('winchDialog'\)\.open\) updateWinch\(dt\)/);
  assert.doesNotMatch(loopBody, /else if\(\$\('winchDialog'\)\.open\) update\(now,dt\)/);
});

test('M1.3 winch action is ignored outside its active modal', () => {
  const start = js.indexOf('function pullWinch()');
  const end = js.indexOf('function openGenerator', start);
  const body = js.slice(start, end);
  assert.match(body, /state\.gameMode !== 'modal'/);
  assert.match(body, /state\.transitioning/);
  assert.match(body, /!\$\('winchDialog'\)\.open/);
});


test('M1.4 uses a single resolving-action lock for delayed success paths', () => {
  assert.match(js, /resolvingAction: null/);
  assert.match(js, /function beginResolvingAction\(kind\)/);
  assert.match(js, /if \(state\.resolvingAction\) return false/);
  assert.match(js, /function endResolvingAction\(kind\)/);
  assert.match(js, /setResolvingControls\(kind, true\)/);
  assert.match(js, /setResolvingControls\(kind, false\)/);
});

test('M1.4 learning success and transfer schedules cannot be queued repeatedly', () => {
  const start = js.indexOf('function checkLearning');
  const end = js.indexOf('function openWinch', start);
  const body = js.slice(start, end);
  assert.match(body, /if \(state\.resolvingAction\) return/);
  assert.match(body, /beginResolvingAction\('learning'\)/);
  assert.match(body, /endResolvingAction\('learning'\)/);
  assert.match(body, /scheduleGuarded\(850/);
  assert.match(body, /scheduleGuarded\(650/);
  assert.match(body, /scheduleGuarded\(500/);
});

test('M1.4 winch generator and victory lock immediately on success', () => {
  const winch = js.slice(js.indexOf('function pullWinch'), js.indexOf('function openGenerator'));
  assert.match(winch, /state\.resolvingAction/);
  assert.match(winch, /beginResolvingAction\('winch'\)/);
  assert.match(winch, /endResolvingAction\('winch'\)/);

  const generator = js.slice(js.indexOf('function chooseCircuit'), js.indexOf('function takePhoto'));
  assert.match(generator, /state\.resolvingAction/);
  assert.match(generator, /beginResolvingAction\('generator'\)/);
  assert.match(generator, /endResolvingAction\('generator'\)/);

  const radio = js.slice(js.indexOf('function sendRadio'), js.indexOf('function movePlayer'));
  assert.match(radio, /state\.resolvingAction/);
  assert.match(radio, /beginResolvingAction\('victory'\)/);
  assert.match(radio, /endResolvingAction\('victory'\)/);
});

test('M1.4 rewards are idempotent and success controls are disabled', () => {
  const reward = js.slice(js.indexOf('function rewardQuestion'), js.indexOf('function openLearning'));
  assert.match(reward, /if \(state\.solved\.has\(id\)\) return false/);
  assert.match(js, /winchPullBtn'\)\.disabled = disabled/);
  assert.match(js, /#generatorButtons button/);
  assert.match(js, /learningForm'\)\.querySelector\('button\[type="submit"\]'\)/);
});


test('M1.5 exposes recovery controls for vehicles camera winch generator and radio', () => {
  for (const id of ['recoveryBtn', 'winchResetBtn', 'winchExitBtn', 'generatorResetBtn', 'generatorExitBtn']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /R: zurücksetzen/);
  assert.match(html, /Esc: Kamera\/Funk verlassen/);
});

test('M1.5 central recovery router covers all six requested mechanics', () => {
  assert.match(js, /function recoveryKind\(\)/);
  assert.match(js, /function recoverMechanic\(kind = recoveryKind\(\)\)/);
  for (const kind of ['jeep', 'river', 'camera', 'winch', 'generator', 'radio']) {
    assert.match(js, new RegExp(`kind === '${kind}'`));
  }
  assert.match(js, /function exitMechanicDialog/);
  assert.match(js, /key==='r' && recoverMechanic\(\)/);
  assert.match(js, /recoverMechanic\('camera'\)/);
  assert.match(js, /recoverMechanic\('radio'\)/);
});

test('M1.5 vehicle recovery uses safe checkpoints instead of full-run restart', () => {
  assert.match(js, /safeDistance: 0/);
  assert.match(js, /safeProgress: 0/);
  assert.match(js, /state\.jeep\.distance = state\.jeep\.safeDistance/);
  assert.match(js, /state\.river\.progress = state\.river\.safeProgress/);
  assert.match(js, /jeepCheckpoint > state\.jeep\.safeDistance/);
  assert.match(js, /riverCheckpoint > state\.river\.safeProgress/);
});

test('M1.5 mechanic recovery preserves earned learning and collected progress', () => {
  const start = js.indexOf('function recoverMechanic');
  const end = js.indexOf('function exitMechanicDialog', start);
  const body = js.slice(start, end);
  assert.doesNotMatch(body, /state\.solved\.clear|state\.items\.clear|state\.photos\.clear/);
  assert.match(body, /state\.cameraMode = false/);
  assert.match(body, /state\.winchHits = 0/);
  assert.match(body, /state\.generator\.seq = \[\]/);
  assert.match(body, /state\.tuned = 35/);
});

test('M1.5 modal recovery invalidates pending actions and can safely exit', () => {
  const start = js.indexOf('function recoverMechanic');
  const end = js.indexOf('function setGameMode', start);
  const body = js.slice(start, end);
  assert.match(body, /invalidateDelayedActions\(\)/);
  assert.match(body, /clearResolvingAction\(\)/);
  assert.match(js, /winchResetBtn/);
  assert.match(js, /winchExitBtn/);
  assert.match(js, /generatorResetBtn/);
  assert.match(js, /generatorExitBtn/);
});


test('M1.5 recovery controls cannot interrupt an already resolving mechanic success', () => {
  const start = js.indexOf('function setResolvingControls');
  const end = js.indexOf('function beginResolvingAction', start);
  const body = js.slice(start, end);
  for (const id of ['winchResetBtn', 'winchExitBtn', 'generatorResetBtn', 'generatorExitBtn']) {
    assert.match(body, new RegExp(id));
  }
});


test('M2 student-facing copy uses short direct action language', () => {
  for (const expected of [
    'Finde die Route',
    'Fahr durch den Dschungel',
    'Finde die Tiere',
    'Fahr zur Station',
    'Bring den Strom zurück',
    'Sende den Notruf',
    'Finde Tukan und Capybara. Fotografiere beide.',
    'Der Strom ist aus. Starte zuerst den Generator.',
    'Richtig! Weiter geht’s.'
  ]) assert.ok(js.includes(expected), 'missing simplified copy: ' + expected);

  for (const oldCopy of [
    'Dokumentiere die Tiere',
    'Ortungssender auswerten',
    'Fortschritt freigeschaltet',
    'Die zwei Zielarten sind Tukan und Capybara',
    'Die Piste übernimmt den Rest',
    'Das Jeep-Terminal verlangt zuerst'
  ]) assert.ok(!js.includes(oldCopy), 'old complex copy remains: ' + oldCopy);
});

test('M2 mechanic instructions are concise and student-friendly', () => {
  assert.match(html, /LERN-AUFGABE/);
  assert.match(html, /Triff 3-mal den grünen Bereich/);
  assert.match(html, /Drück die Stromkreise in der Reihenfolge der Lampen/);
  assert.match(html, /WASD\/Pfeile: bewegen · E\/Enter: Aktion/);
  assert.match(html, /R: zurücksetzen · Esc: Kamera\/Funk verlassen/);
});


test('V0.1 visual bible defines the Amazonas reference quality bar', () => {
  for (const phrase of [
    'Warm, abenteuerlich, lebendig',
    'Tiefenaufbau pro Szene',
    'Camp – Referenzstandard',
    'Performance-Budget',
    'Camp-Wow-Moment'
  ]) assert.ok(visualBible.includes(phrase), 'missing visual rule: ' + phrase);
  assert.match(html, /class="visual-masterpiece"/);
  assert.match(html, /GRADECrew ESCAPE · EXPEDITION/);
});

test('V1 Camp is a layered scene rather than the old prototype canvas', () => {
  for (const fn of [
    'drawCampBackground',
    'drawCampGround',
    'drawCampTent',
    'drawCampTable',
    'drawCampSupplies',
    'drawCampJeepDetailed',
    'drawCampPollen',
    'drawCampForeground'
  ]) assert.ok(js.includes('function ' + fn), 'missing Camp layer: ' + fn);

  const start = js.indexOf('function drawCamp(){');
  const end = js.indexOf('function drawJeep()', start);
  const body = js.slice(start, end);
  for (const placeholder of ['🗺️', '🌴', '📡', '🦜', '🥭']) assert.ok(!body.includes(placeholder), 'Camp placeholder remains: ' + placeholder);
  assert.match(js, /if \(state\.scene === 'camp'\) drawCampForeground\(performance\.now\(\)\)/);
});

test('V1 Camp Jeep start has a guarded visual beat before driving', () => {
  assert.match(js, /campJeepStartAt: 0/);
  const start = js.indexOf("if (state.scene === 'camp' && id === 'jeep')");
  const end = js.indexOf("if (state.scene === 'blocked'", start);
  const body = js.slice(start, end);
  assert.match(body, /beginResolvingAction\('camp-jeep'\)/);
  assert.match(body, /state\.campJeepStartAt = performance\.now\(\)/);
  assert.match(body, /setGameMode\('transition'\)/);
  assert.match(body, /scheduleGuarded\(620/);
  assert.match(body, /setScene\('jeep'\)/);
});
