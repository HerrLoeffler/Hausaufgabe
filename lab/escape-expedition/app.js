(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const $ = id => document.getElementById(id);

  const seedFromUrl = new URLSearchParams(location.search).get('seed');
  const seed = Number.isFinite(Number(seedFromUrl)) ? Number(seedFromUrl) >>> 0 : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  let rngState = seed || 1;
  function rnd() {
    rngState ^= rngState << 13; rngState ^= rngState >>> 17; rngState ^= rngState << 5;
    return (rngState >>> 0) / 4294967296;
  }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }

  const q1Base = pick([80, 120, 160, 200]);
  const q1Answer = q1Base / 4;
  const q2Base = pick([50, 70, 90, 110]);
  const q2Answer = q2Base * 0.3;
  const q3Base = pick([150, 200, 250, 300]);
  const q3Answer = q3Base * 0.4;
  const radioChannel = 42 + (seed % 17);

  function mc(correct, candidates) {
    const options = shuffle([...new Set([String(correct), ...candidates.map(String)])]).slice(0, 4);
    if (!options.includes(String(correct))) options[0] = String(correct);
    return { options, correct: options.indexOf(String(correct)) };
  }

  const q1Mc = mc(q1Answer, [q1Answer - 5, q1Answer + 10, q1Answer * 2]);
  const q2Mc = mc(q2Answer, [q2Answer - 6, q2Answer + 7, q2Base * 0.03]);
  const q3Mc = mc(q3Answer, [q3Answer - 20, q3Answer + 30, q3Base * 0.04]);
  const questions = {
    q1: {
      title: 'Route prüfen',
      prompt: `Der Jeep-Tank fasst ${q1Base} l. 25 % bleiben als Reserve. Wie viele Liter sind das?`,
      options: q1Mc.options, correct: q1Mc.correct,
      hint: '25 % sind genau ein Viertel.',
      explanation: `${q1Base} ÷ 4 = ${q1Answer}.`,
      transfer: makeTransfer(25, pick([40, 60, 100, 140])),
      reward: 'jeepKey'
    },
    q2: {
      title: 'Sender prüfen',
      prompt: `Der Sender hat ${q2Base} Wh. 30 % sind für die Nacht reserviert. Wie viele Wh sind das?`,
      options: q2Mc.options, correct: q2Mc.correct,
      hint: `10 % von ${q2Base} sind ${q2Base / 10}.`,
      explanation: `30 % sind drei 10-%-Schritte: 3 × ${q2Base / 10} = ${q2Answer}.`,
      transfer: makeTransfer(30, pick([20, 40, 60, 80])),
      reward: 'riverMap'
    },
    q3: {
      title: 'Terminal starten',
      prompt: `Der Generator liefert ${q3Base} W. Das Terminal braucht 40 %. Wie viele Watt sind das?`,
      options: q3Mc.options, correct: q3Mc.correct,
      hint: `10 % von ${q3Base} sind ${q3Base / 10}.`,
      explanation: `40 % sind vier 10-%-Schritte: 4 × ${q3Base / 10} = ${q3Answer} W.`,
      transfer: makeTransfer(40, pick([50, 100, 150, 250])),
      reward: 'radio'
    }
  };

  function makeTransfer(percent, base) {
    const ans = base * percent / 100;
    const choices = mc(ans, [ans + 5, Math.max(1, ans - 5), base - ans]);
    return { prompt: `Neue Aufgabe: Wie viel sind ${percent} % von ${base}?`, options: choices.options, correct: choices.correct, hint: `Rechne zuerst 10 % oder nutze einen passenden Bruch.` };
  }

  const SCENES = {
    camp: { stage: 1, title: 'Expeditionscamp', mission: 'Finde die Route', steps: ['Tablet prüfen', 'Schlüssel holen', 'Jeep starten'] },
    jeep: { stage: 2, title: 'Dschungelpiste', mission: 'Fahr durch den Dschungel', steps: ['Auf der Piste bleiben', 'Hindernissen ausweichen', 'Bis zum Baum fahren'] },
    blocked: { stage: 2, title: 'Blockierter Pfad', mission: 'Räume den Weg frei', steps: ['Zum Baum', 'Winde starten', '3 gute Züge'] },
    wildlife: { stage: 3, title: 'Wildtierzone', mission: 'Finde die Tiere', steps: ['Tukan fotografieren', 'Capybara fotografieren', 'Sender prüfen', 'Zum Boot'] },
    river: { stage: 4, title: 'Rio Verde', mission: 'Fahr zur Station', steps: ['Boot steuern', 'Felsen ausweichen', 'Station erreichen'] },
    station: { stage: 5, title: 'Forschungsstation', mission: 'Bring den Strom zurück', steps: ['Generator starten', 'Terminal starten', 'Funkkanal finden', 'Zum Funkmast'] },
    tower: { stage: 6, title: 'Funkmast', mission: 'Sende den Notruf', steps: ['Konsole starten', `Kanal ${radioChannel} einstellen`, 'Signal senden'] }
  };

  const state = {
    scene: 'camp',
    player: { x: 470, y: 470, r: 16, speed: 215, facing: -Math.PI / 2 },
    keys: new Set(), target: null, near: null,
    items: new Set(['fieldBook']), solved: new Set(), attempts: { q1: 0, q2: 0, q3: 0 },
    activeQuestion: null, learningMode: 'main', selectedAnswer: null,
    winchHits: 0, winchValue: 0.08, winchDir: 1, winchTimer: 0,
    jeep: { x: 480, distance: 0, bumps: 0, safeDistance: 0, speed: 64, stuck: false, stuckPower: 0, impactTimer: 0, shake: 0, hitHazards: new Set(), roadblockTimer: 0 },
    photos: new Set(), cameraMode: false, reticle: { x: 480, y: 300 },
    animals: [
      { id: 'toucan', emoji: '🦜', x: 700, y: 170, vx: 38, vy: 0, target: true },
      { id: 'capybara', emoji: '🦫', x: 280, y: 420, vx: 25, vy: -12, target: true },
      { id: 'monkey', emoji: '🐒', x: 520, y: 215, vx: -30, vy: 8, target: false }
    ],
    river: { x: 480, progress: 0, hits: 0, safeProgress: 0, lastRockCycle: -1, speed: 66 },
    generator: { seq: [], done: false },
    radioMode: false, tuned: 35,
    startTime: performance.now(), won: false, toastTimer: 0,
    sceneEntered: performance.now(),
    gameMode: 'world', transitioning: false, sceneEpoch: 0, actionEpoch: 0,
    resolvingAction: null,
    campJeepStartAt: 0
  };

  const inventoryInfo = {
    fieldBook: ['📗', 'Feldbuch'], jeepKey: ['🔑', 'Jeep-Schlüssel'], winch: ['🪝', 'Seilwinde'],
    photos: ['📷', 'Tierfotos'], riverMap: ['🗺️', 'Flusskarte'], radio: ['📻', `Kanal ${radioChannel}`]
  };

  const sceneDecor = Array.from({ length: 42 }, () => ({ x: 40 + rnd() * 880, y: 60 + rnd() * 500, s: .6 + rnd() * .8, type: rnd() > .55 ? 'leaf' : 'tree' }));
  const JEEP_SCREEN_Y = 452;
  const JEEP_PX_PER_M = 2.45;
  const JEEP_LANES = [374, 480, 586];
  const jeepCourse = [
    { id: 'rock-a', type: 'rock', at: 145, lane: 0 },
    { id: 'mud-a', type: 'mud', at: 255, lane: 2 },
    { id: 'branch-a', type: 'branch', at: 355, lane: 1 },
    { id: 'rock-b', type: 'rock', at: 470, lane: 2 },
    { id: 'mud-b', type: 'mud', at: 585, lane: 0 },
    { id: 'rock-c', type: 'rock', at: 695, lane: 1 },
    { id: 'roadblock', type: 'tree', at: 832, lane: 1, story: true }
  ];

  function jeepHazardScreenY(hazard) {
    return JEEP_SCREEN_Y - (hazard.at - state.jeep.distance) * JEEP_PX_PER_M;
  }

  let last = performance.now();
  let lastTimerSecond = -1;

  function setCoco(title, text) { $('cocoTitle').textContent = title; $('cocoText').textContent = text; }
  function toast(text, seconds = 2.1) { $('toast').textContent = text; $('toast').hidden = false; state.toastTimer = seconds; }
  function clearMovement() { state.target = null; state.keys.clear(); }

  function modeForScene(name = state.scene) {
    return ['jeep', 'river'].includes(name) ? 'vehicle' : 'world';
  }

  function invalidateDelayedActions() {
    state.actionEpoch++;
  }

  function setResolvingControls(kind, disabled) {
    if (kind === 'learning') {
      const submit = $('learningForm').querySelector('button[type="submit"]');
      if (submit) submit.disabled = disabled;
      $('hintBtn').disabled = disabled;
      $('learningOptions').querySelectorAll('input').forEach(input => { input.disabled = disabled; });
    }
    if (kind === 'winch') {
      $('winchPullBtn').disabled = disabled;
      $('winchResetBtn').disabled = disabled;
      $('winchExitBtn').disabled = disabled;
    }
    if (kind === 'generator') {
      document.querySelectorAll('#generatorButtons button').forEach(button => { button.disabled = disabled; });
      $('generatorResetBtn').disabled = disabled;
      $('generatorExitBtn').disabled = disabled;
    }
  }

  function beginResolvingAction(kind) {
    if (state.resolvingAction) return false;
    state.resolvingAction = kind;
    setResolvingControls(kind, true);
    return true;
  }

  function endResolvingAction(kind) {
    if (state.resolvingAction !== kind) return;
    state.resolvingAction = null;
    setResolvingControls(kind, false);
  }

  function clearResolvingAction() {
    const kind = state.resolvingAction;
    if (!kind) return;
    state.resolvingAction = null;
    setResolvingControls(kind, false);
  }

  function recoveryKind() {
    if (state.won || state.transitioning || state.jeep.roadblockTimer > 0) return null;
    if ($('winchDialog').open) return 'winch';
    if ($('generatorDialog').open) return 'generator';
    if (state.gameMode === 'camera' && state.scene === 'wildlife') return 'camera';
    if (state.gameMode === 'radio' && state.scene === 'tower') return 'radio';
    if (state.scene === 'jeep') return 'jeep';
    if (state.scene === 'river') return 'river';
    return null;
  }

  function recoveryLabel(kind = recoveryKind()) {
    const labels = {
      jeep: '↺ Jeep zurücksetzen',
      river: '↺ Boot zurücksetzen',
      camera: '↺ Kamera verlassen',
      winch: '↺ Winde neu starten',
      generator: '↺ Generator neu starten',
      radio: '↺ Funk zurücksetzen'
    };
    return labels[kind] || '↺ Zurücksetzen';
  }

  function recoverMechanic(kind = recoveryKind()) {
    if (!kind || state.transitioning || state.won) return false;

    invalidateDelayedActions();
    clearResolvingAction();
    clearMovement();

    if (kind === 'jeep') {
      state.jeep.x = 480;
      state.jeep.distance = state.jeep.safeDistance;
      state.jeep.speed = 56;
      state.jeep.stuck = false;
      state.jeep.stuckPower = 0;
      state.jeep.impactTimer = 0;
      state.jeep.shake = 0;
      state.jeep.roadblockTimer = 0;
      for (const hazard of jeepCourse) if (hazard.at >= state.jeep.safeDistance - 10) state.jeep.hitHazards.delete(hazard.id);
      restoreSceneMode();
      toast('Jeep zurück am sicheren Punkt.');
      updateHud();
      return true;
    }

    if (kind === 'river') {
      state.river.x = 480;
      state.river.progress = state.river.safeProgress;
      toast('Boot zurück am sicheren Punkt.');
      updateHud();
      return true;
    }

    if (kind === 'camera') {
      state.cameraMode = false;
      state.reticle = { x: state.player.x + 110, y: state.player.y - 40 };
      restoreSceneMode();
      setCoco('Kamera zu', 'Deine Fotos bleiben gespeichert.');
      updateHud();
      return true;
    }

    if (kind === 'winch') {
      state.winchHits = 0;
      state.winchValue = .08;
      state.winchDir = 1;
      $('winchNeedle').style.left = '8%';
      $('winchStatus').textContent = '0 / 3 sichere Züge';
      $('winchPullBtn').disabled = false;
      return true;
    }

    if (kind === 'generator') {
      if (state.generator.done) return false;
      state.generator.seq = [];
      document.querySelectorAll('#generatorButtons button').forEach(button => {
        button.classList.remove('active');
        button.disabled = false;
      });
      $('generatorFeedback').className = 'feedback';
      $('generatorFeedback').textContent = 'Hinweis an der Wand: 🌿 → ☀️ → 🌊';
      return true;
    }

    if (kind === 'radio') {
      state.radioMode = false;
      state.tuned = 35;
      restoreSceneMode();
      setCoco('Funk zurückgesetzt', 'Du kannst die Konsole gleich neu starten.');
      updateHud();
      return true;
    }

    return false;
  }

  function exitMechanicDialog(kind, dialogId) {
    recoverMechanic(kind);
    const dialog = $(dialogId);
    if (dialog.open) dialog.close();
  }

  function setGameMode(mode) {
    state.gameMode = mode;
    if (!['world', 'vehicle'].includes(mode)) clearMovement();
    renderInteraction();
  }

  function restoreSceneMode() {
    if (state.won) return setGameMode('won');
    setGameMode(modeForScene());
  }

  function scheduleGuarded(delay, callback) {
    const sceneEpoch = state.sceneEpoch;
    const actionEpoch = state.actionEpoch;
    return setTimeout(() => {
      if (sceneEpoch !== state.sceneEpoch || actionEpoch !== state.actionEpoch || state.transitioning) return;
      callback();
    }, delay);
  }

  function updateHud() {
    const meta = SCENES[state.scene];
    $('levelBadge').textContent = `LEVEL ${meta.stage}/6`;
    $('learningBadge').textContent = `🧠 ${state.solved.size}/3`;
    $('sceneTitle').textContent = `${meta.stage}/6 · ${meta.title}`;
    $('missionTitle').textContent = meta.mission;
    $('missionText').textContent = missionText();
    $('seedLabel').textContent = `Run #${String(seed).slice(-6)}`;
    const steps = currentStepStates();
    $('missionSteps').innerHTML = meta.steps.map((step, i) => `<li class="${steps[i] || ''}">${step}</li>`).join('');
    const items = [...state.items];
    $('inventory').innerHTML = [0, 1, 2].map(i => {
      const item = items[i];
      if (!item) return '<div class="inventory-slot">leer</div>';
      const info = inventoryInfo[item] || ['🧩', item];
      return `<div class="inventory-slot filled"><div><strong>${info[0]}</strong>${info[1]}</div></div>`;
    }).join('');
    $('cameraBtn').disabled = state.scene !== 'wildlife';
    $('cameraBtn').textContent = state.cameraMode ? '📸 Foto machen' : '📷 Kamera';

    const recovery = recoveryKind();
    $('recoveryBtn').disabled = !recovery;
    $('recoveryBtn').textContent = recoveryLabel(recovery);
  }

  function missionText() {
    switch (state.scene) {
      case 'camp': return 'Dr. Yara meldet sich nicht. Prüfe das Tablet und finde die Route.';
      case 'jeep': return 'Fahr bis zur Station. Weiche Matsch und Steinen aus.';
      case 'blocked': return 'Ein Baum blockiert den Weg. Nutze die Seilwinde.';
      case 'wildlife': return 'Dr. Yara sucht Tukan und Capybara. Fotografiere beide.';
      case 'river': return 'Die Station liegt flussaufwärts. Weiche den Felsen aus.';
      case 'station': return 'Der Strom ist aus. Starte zuerst den Generator.';
      case 'tower': return `Stelle Kanal ${radioChannel} ein. Sende dann das Signal.`;
      default: return '';
    }
  }

  function currentStepStates() {
    if (state.scene === 'camp') return [state.solved.has('q1') ? 'done' : 'active', state.items.has('jeepKey') ? 'done' : '', state.solved.has('q1') ? 'active' : ''];
    if (state.scene === 'jeep') return [state.jeep.distance > 80 ? 'done' : 'active', state.jeep.distance >= 850 ? 'done' : 'active', ''];
    if (state.scene === 'blocked') return [state.near?.id === 'tree' ? 'done' : 'active', state.winchHits ? 'done' : 'active', state.winchHits >= 3 ? 'done' : 'active'];
    if (state.scene === 'wildlife') return [state.photos.has('toucan') ? 'done' : 'active', state.photos.has('capybara') ? 'done' : '', state.solved.has('q2') ? 'done' : '', state.solved.has('q2') ? 'active' : ''];
    if (state.scene === 'river') return [state.river.progress > 50 ? 'done' : 'active', state.river.hits < 3 ? 'active' : '', state.river.progress >= 950 ? 'done' : ''];
    if (state.scene === 'station') return [state.generator.done ? 'done' : 'active', state.solved.has('q3') ? 'done' : '', state.items.has('radio') ? 'done' : '', state.solved.has('q3') ? 'active' : ''];
    if (state.scene === 'tower') return [state.radioMode ? 'done' : 'active', state.tuned === radioChannel ? 'done' : state.radioMode ? 'active' : '', state.won ? 'done' : ''];
    return [];
  }

  function setScene(name, spawn = null) {
    if (state.transitioning || state.scene === name || state.won) return false;

    state.transitioning = true;
    invalidateDelayedActions();
    setGameMode('transition');
    const transitionEpoch = ++state.sceneEpoch;

    state.scene = name;
    state.sceneEntered = performance.now();
    state.cameraMode = false;
    state.radioMode = false;
    clearMovement();

    if (spawn) { state.player.x = spawn.x; state.player.y = spawn.y; }
    else { state.player.x = 480; state.player.y = 470; }

    if (name === 'blocked') state.items.add('winch');
    if (name === 'wildlife') { state.player.x = 120; state.player.y = 470; setCoco('Kamera bereit', 'Finde Tukan und Capybara. Fotografiere beide.'); }
    if (name === 'river') setCoco('Boot los!', 'Lenke links und rechts. Die Strömung bringt dich vorwärts.');
    if (name === 'station') { state.player.x = 480; state.player.y = 500; setCoco('Kein Strom', 'Starte links den Generator.'); }
    if (name === 'tower') { state.player.x = 500; state.player.y = 490; setCoco('Fast geschafft', `Stelle am Funkmast Kanal ${radioChannel} ein.`); }

    updateHud();
    renderInteraction();

    requestAnimationFrame(() => {
      if (state.sceneEpoch !== transitionEpoch || state.scene !== name) return;
      state.transitioning = false;
      restoreSceneMode();
      updateHud();
    });

    return true;
  }

  function generalHotspots() {
    if (state.scene === 'camp') return [
      { id: 'tablet', x: 150, y: 150, r: 72, label: 'Tablet prüfen' },
      { id: 'jeep', x: 760, y: 365, r: 88, label: 'Jeep starten' }
    ];
    if (state.scene === 'blocked') return [{ id: 'tree', x: 690, y: 270, r: 105, label: 'Winde starten' }];
    if (state.scene === 'wildlife') return [
      { id: 'sender', x: 570, y: 120, r: 76, label: state.photos.size >= 2 ? 'Sender prüfen' : 'Erst beide Tiere fotografieren' },
      { id: 'dock', x: 875, y: 455, r: 85, label: 'Zum Boot' }
    ];
    if (state.scene === 'station') return [
      { id: 'generator', x: 175, y: 360, r: 86, label: 'Generator öffnen' },
      { id: 'terminal', x: 710, y: 175, r: 78, label: state.generator.done ? 'Terminal starten' : 'Terminal ohne Strom' },
      { id: 'towerGate', x: 870, y: 430, r: 78, label: 'Zum Funkmast' }
    ];
    if (state.scene === 'tower') return [{ id: 'radioConsole', x: 480, y: 160, r: 90, label: 'Funk starten' }];
    return [];
  }

  function interact() {
    if (state.gameMode !== 'world' || state.transitioning || !state.near || state.won) return;
    const id = state.near.id;
    if (state.scene === 'camp' && id === 'tablet') return openLearning('q1');
    if (state.scene === 'camp' && id === 'jeep') {
      if (!state.solved.has('q1')) return toast('Prüfe zuerst die Route am Tablet.');
      if (!beginResolvingAction('camp-jeep')) return;
      state.campJeepStartAt = performance.now();
      setGameMode('transition');
      state.near = null;
      renderInteraction();
      setCoco('MANGO-1 startet!', 'Lenke links/rechts. Halte ↑ für mehr Tempo. Matsch kann dich festsetzen.');
      scheduleGuarded(620, () => {
        endResolvingAction('camp-jeep');
        setScene('jeep');
      });
      return;
    }
    if (state.scene === 'blocked' && id === 'tree') return openWinch();
    if (state.scene === 'wildlife' && id === 'sender') {
      if (state.photos.size < 2) return toast('Fotografiere zuerst Tukan und Capybara.');
      return openLearning('q2');
    }
    if (state.scene === 'wildlife' && id === 'dock') {
      if (!state.solved.has('q2')) return toast('Löse zuerst den Sender.');
      return setScene('river');
    }
    if (state.scene === 'station' && id === 'generator') return openGenerator();
    if (state.scene === 'station' && id === 'terminal') {
      if (!state.generator.done) return toast('Starte zuerst den Generator.');
      return openLearning('q3');
    }
    if (state.scene === 'station' && id === 'towerGate') {
      if (!state.solved.has('q3')) return toast('Starte zuerst das Terminal.');
      return setScene('tower');
    }
    if (state.scene === 'tower' && id === 'radioConsole') {
      invalidateDelayedActions();
      state.radioMode = true; state.tuned = 35;
      setGameMode('radio');
      setCoco('Funk bereit', `Stelle Kanal ${radioChannel} ein. Sende mit E/Enter.`);
      return updateHud();
    }
  }

  function rewardQuestion(id) {
    if (state.solved.has(id)) return false;
    state.solved.add(id);
    if (id === 'q1') { state.items.add('jeepKey'); setCoco('Route stimmt', 'Der Jeep wartet rechts im Camp.'); }
    if (id === 'q2') { state.items.add('riverMap'); setCoco('Route gefunden', 'Geh rechts zum Boot.'); }
    if (id === 'q3') { state.items.add('radio'); setCoco('Kanal gefunden', `Kanal ${radioChannel}. Geh zum Funkmast.`); }
    updateHud();
    return true;
  }

  function openLearning(id) {
    if (state.gameMode !== 'world' || state.transitioning) return;
    if (state.solved.has(id)) return toast('Schon gelöst.');
    invalidateDelayedActions();
    state.activeQuestion = id; state.learningMode = 'main'; state.selectedAnswer = null;
    setGameMode('modal');
    renderLearning();
    $('learningDialog').showModal();
    scheduleGuarded(50, () => { if ($('learningDialog').open) $('learningDialog').focus(); });
  }

  function renderLearning() {
    const q = questions[state.activeQuestion];
    const data = state.learningMode === 'main' ? q : q.transfer;
    $('learningTitle').textContent = state.learningMode === 'main' ? q.title : 'Neue Aufgabe';
    $('learningPrompt').textContent = data.prompt;
    $('learningOptions').innerHTML = '';
    data.options.forEach((opt, i) => {
      const label = document.createElement('label'); label.className = 'answer-option';
      label.innerHTML = `<input type="radio" name="learningAnswer" value="${i}"><span>${opt}</span>`;
      label.addEventListener('click', () => { state.selectedAnswer = i; [...$('learningOptions').children].forEach(x => x.classList.remove('selected')); label.classList.add('selected'); });
      $('learningOptions').append(label);
    });
    $('learningFeedback').className = 'feedback';
    $('learningFeedback').textContent = state.learningMode === 'main' ? 'Wähle eine Antwort.' : 'Löse auch diese neue Aufgabe.';
  }

  function checkLearning(e) {
    e.preventDefault();
    if (state.resolvingAction) return;
    const id = state.activeQuestion; const q = questions[id]; const data = state.learningMode === 'main' ? q : q.transfer;
    if (state.selectedAnswer === null) { $('learningFeedback').textContent = 'Wähle zuerst eine Antwort.'; return; }
    if (state.selectedAnswer !== data.correct) {
      $('learningFeedback').className = 'feedback error';
      if (state.learningMode === 'transfer') { $('learningFeedback').textContent = `Noch nicht. ${q.transfer.hint}`; return; }
      state.attempts[id]++;
      $('learningFeedback').textContent = state.attempts[id] === 1 ? `Noch nicht. Tipp: ${q.hint}` : `Noch nicht. ${q.explanation} Jetzt probierst du eine ähnliche Aufgabe.`;
      if (state.attempts[id] >= 2 && beginResolvingAction('learning')) {
        scheduleGuarded(850, () => {
          endResolvingAction('learning');
          if (state.activeQuestion !== id) return;
          state.learningMode = 'transfer';
          state.selectedAnswer = null;
          renderLearning();
        });
      }
      return;
    }
    if (state.learningMode === 'main' && state.attempts[id] > 0) {
      $('learningFeedback').className = 'feedback success'; $('learningFeedback').textContent = `Richtig. Jetzt noch eine ähnliche Aufgabe.`;
      if (!beginResolvingAction('learning')) return;
      return scheduleGuarded(650, () => {
        endResolvingAction('learning');
        if (state.activeQuestion !== id) return;
        state.learningMode = 'transfer';
        state.selectedAnswer = null;
        renderLearning();
      });
    }
    $('learningFeedback').className = 'feedback success'; $('learningFeedback').textContent = 'Richtig! Weiter geht’s.';
    if (!beginResolvingAction('learning')) return;
    scheduleGuarded(500, () => {
      rewardQuestion(id);
      state.activeQuestion = null;
      endResolvingAction('learning');
      if ($('learningDialog').open) $('learningDialog').close();
    });
  }

  function openWinch() {
    if (state.gameMode !== 'world' || state.transitioning) return;
    invalidateDelayedActions();
    setGameMode('modal');
    state.winchValue = .08; state.winchDir = 1; $('winchStatus').textContent = `${state.winchHits} / 3 gute Züge`;
    $('winchDialog').showModal();
  }
  function pullWinch() {
    if (state.resolvingAction || state.gameMode !== 'modal' || state.transitioning || !$('winchDialog').open) return;
    if (state.winchValue >= .38 && state.winchValue <= .62) {
      state.winchHits++; $('winchStatus').textContent = `${state.winchHits} / 3 sichere Züge`; toast('Gut! Der Baum bewegt sich.');
      if (state.winchHits >= 3 && beginResolvingAction('winch')) {
        scheduleGuarded(650, () => {
          setCoco('Weg frei!', 'Weiter geht’s zu Fuß.');
          setScene('wildlife');
          endResolvingAction('winch');
          if ($('winchDialog').open) $('winchDialog').close();
        });
      }
    } else {
      state.winchHits = Math.max(0, state.winchHits - 1); $('winchStatus').textContent = `${state.winchHits} / 3 sichere Züge`; toast('Nicht im grünen Bereich. Versuch es nochmal.');
    }
  }

  function openGenerator() {
    if (state.gameMode !== 'world' || state.transitioning) return;
    invalidateDelayedActions();
    setGameMode('modal');
    $('generatorDialog').showModal();
  }
  function chooseCircuit(name, button) {
    if (state.resolvingAction || state.generator.done) return;
    const order = ['leaf', 'sun', 'river'];
    const expected = order[state.generator.seq.length];
    if (name === expected) {
      state.generator.seq.push(name); button.classList.add('active');
      $('generatorFeedback').className = 'feedback success'; $('generatorFeedback').textContent = `${state.generator.seq.length}/3 an.`;
      if (state.generator.seq.length === 3) {
        if (!beginResolvingAction('generator')) return;
        state.generator.done = true; setCoco('Strom ist da!', 'Starte jetzt das Terminal rechts.');
        scheduleGuarded(650, () => {
          endResolvingAction('generator');
          if ($('generatorDialog').open) $('generatorDialog').close();
        });
        updateHud();
      }
    } else {
      state.generator.seq = []; document.querySelectorAll('#generatorButtons button').forEach(b => b.classList.remove('active'));
      $('generatorFeedback').className = 'feedback error'; $('generatorFeedback').textContent = 'Falsch. Neu: 🌿 → ☀️ → 🌊';
    }
  }

  function takePhoto() {
    if (state.transitioning || state.scene !== 'wildlife') return;
    if (!state.cameraMode) {
      if (state.gameMode !== 'world') return;
      invalidateDelayedActions();
      state.cameraMode = true;
      state.reticle = { x: state.player.x + 110, y: state.player.y - 40 };
      setGameMode('camera');
      setCoco('Kamera an', 'Zieh den Sucher aufs Tier. Drück dann wieder Kamera.');
      updateHud();
      return;
    }
    if (state.gameMode !== 'camera') return;
    let best = null; let dist = 999;
    for (const a of state.animals) {
      const d = Math.hypot(a.x - state.reticle.x, a.y - state.reticle.y);
      if (d < dist) { dist = d; best = a; }
    }
    flashScreen();
    if (best && dist < 58 && best.target) {
      if (!state.photos.has(best.id)) { state.photos.add(best.id); toast(best.id === 'toucan' ? '🦜 Tukan fotografiert!' : '🦫 Capybara fotografiert!'); }
      else toast('Das Tier hast du schon fotografiert.');
      if (state.photos.size >= 2) { state.items.add('photos'); setCoco('Beide Fotos geschafft', 'Prüfe jetzt den Sender.'); }
    } else if (best && dist < 58) toast('🐒 Gutes Foto. Gesucht sind Tukan und Capybara.');
    else toast('Daneben! Versuch es nochmal.');
    updateHud();
  }

  function flashScreen() {
    canvas.classList.add('flash'); setTimeout(() => canvas.classList.remove('flash'), 90);
  }

  function sendRadio() {
    if (state.resolvingAction || state.gameMode !== 'radio' || state.transitioning || !state.radioMode || state.won) return;
    if (state.tuned !== radioChannel) { toast(`Falscher Kanal: ${state.tuned}.`); return; }
    if (!beginResolvingAction('victory')) return;
    invalidateDelayedActions();
    state.won = true; state.radioMode = false; setGameMode('won'); updateHud();
    setCoco('Antwort!', 'Dr. Yara ist sicher. Ein Capybara hat wirklich den Schlüssel geklaut.');
    const sec = Math.round((performance.now() - state.startTime) / 1000);
    $('victoryText').textContent = 'Dr. Yara ist sicher. Der Funk läuft wieder. Und das Capybara behält den Schlüssel.';
    $('victoryStats').innerHTML = `<span>🧠 ${state.solved.size}/3 Lern-Gates</span><span>📷 ${state.photos.size}/2 Zielfotos</span><span>🚙 ${state.jeep.bumps} Rempler</span><span>🚤 ${state.river.hits} Felskontakte</span><span>⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</span>`;
    scheduleGuarded(700, () => {
      endResolvingAction('victory');
      if (!$('victoryDialog').open) $('victoryDialog').showModal();
    });
  }

  function movePlayer(dx, dy, dt) {
    const len = Math.hypot(dx, dy); if (!len) return;
    const ux = dx / len, uy = dy / len; state.player.facing = Math.atan2(uy, ux); const step = state.player.speed * dt;
    const nx = Math.max(45, Math.min(W - 45, state.player.x + ux * step));
    const ny = Math.max(70, Math.min(H - 45, state.player.y + uy * step));
    state.player.x = nx; state.player.y = ny;
  }

  function updateGeneral(dt) {
    if (state.cameraMode || state.radioMode) return;
    let dx = 0, dy = 0;
    if (state.keys.has('ArrowLeft') || state.keys.has('a')) dx--;
    if (state.keys.has('ArrowRight') || state.keys.has('d')) dx++;
    if (state.keys.has('ArrowUp') || state.keys.has('w')) dy--;
    if (state.keys.has('ArrowDown') || state.keys.has('s')) dy++;
    if (dx || dy) { state.target = null; movePlayer(dx, dy, dt); }
    else if (state.target) {
      const vx = state.target.x - state.player.x, vy = state.target.y - state.player.y;
      if (Math.hypot(vx, vy) < 7) state.target = null; else movePlayer(vx, vy, dt);
    }
    let nearest = null, nearestD = 9999;
    for (const h of generalHotspots()) { const d = Math.hypot(state.player.x - h.x, state.player.y - h.y); if (d < h.r && d < nearestD) { nearest = h; nearestD = d; } }
    const previousNearId = state.near?.id || null;
    state.near = nearest;
    if (previousNearId !== (nearest?.id || null)) updateHud();
    renderInteraction();
  }

  function updateJeep(dt) {
    const jeep = state.jeep;

    if (jeep.roadblockTimer > 0) {
      jeep.roadblockTimer -= dt;
      jeep.speed = Math.max(0, jeep.speed - 160 * dt);
      jeep.shake = Math.max(0, jeep.shake - dt);
      if (jeep.roadblockTimer <= 0) {
        jeep.roadblockTimer = 0;
        setScene('blocked', { x: 300, y: 430 });
        setCoco('Baum im Weg', 'MANGO-1 kommt hier nicht weiter. Geh zur Seilwinde.');
      }
      return;
    }

    let steer = 0;
    if (state.keys.has('ArrowLeft') || state.keys.has('a')) steer--;
    if (state.keys.has('ArrowRight') || state.keys.has('d')) steer++;

    if (jeep.stuck) {
      jeep.speed = 0;
      jeep.shake = Math.max(0, jeep.shake - dt * .8);
      const throttle = state.keys.has('ArrowUp') || state.keys.has('w');
      jeep.stuckPower = Math.max(0, Math.min(1, jeep.stuckPower + (throttle ? dt * 1.45 : -dt * .25)));
      jeep.x = Math.max(330, Math.min(630, jeep.x + steer * 90 * dt));
      if (jeep.stuckPower >= 1) {
        jeep.stuck = false;
        jeep.stuckPower = 0;
        jeep.speed = 40;
        toast('Frei! Weiter geht’s.', 1.0);
        setCoco('Wieder frei', 'Weiterfahren. Weiche dem nächsten Hindernis aus.');
      }
      return;
    }

    if (jeep.impactTimer > 0) jeep.impactTimer = Math.max(0, jeep.impactTimer - dt);
    jeep.shake = Math.max(0, jeep.shake - dt * 1.8);

    const throttle = state.keys.has('ArrowUp') || state.keys.has('w');
    const targetSpeed = jeep.impactTimer > 0 ? 24 : (throttle ? 86 : 64);
    jeep.speed += (targetSpeed - jeep.speed) * Math.min(1, dt * 3.8);

    const previousDistance = jeep.distance;
    jeep.x = Math.max(330, Math.min(630, jeep.x + steer * 238 * dt));
    jeep.distance += jeep.speed * dt;

    const jeepCheckpoint = Math.floor(jeep.distance / 180) * 180;
    if (jeepCheckpoint > jeep.safeDistance && jeep.distance % 180 < 42) jeep.safeDistance = jeepCheckpoint;
    if (previousDistance <= 80 && jeep.distance > 80) updateHud();

    for (const hazard of jeepCourse) {
      if (hazard.story || jeep.hitHazards.has(hazard.id)) continue;
      const y = jeepHazardScreenY(hazard);
      if (y < JEEP_SCREEN_Y - 42 || y > JEEP_SCREEN_Y + 26) continue;

      const x = JEEP_LANES[hazard.lane];
      const halfWidth = hazard.type === 'mud' ? 54 : hazard.type === 'branch' ? 50 : 34;
      if (Math.abs(jeep.x - x) > halfWidth) continue;

      jeep.hitHazards.add(hazard.id);
      jeep.bumps++;
      jeep.shake = .34;

      if (hazard.type === 'mud') {
        jeep.stuck = true;
        jeep.stuckPower = 0;
        jeep.speed = 0;
        setCoco('Festgefahren!', 'Halte ↑ / W gedrückt. Auf dem Handy: Pfeil nach oben.');
        toast('Matsch! MANGO-1 steckt fest.', 1.4);
      } else {
        jeep.impactTimer = .72;
        jeep.speed = 18;
        jeep.distance = Math.max(0, jeep.distance - 7);
        jeep.x += jeep.x <= x ? -18 : 18;
        jeep.x = Math.max(330, Math.min(630, jeep.x));
        toast(hazard.type === 'rock' ? 'Stein erwischt! Tempo weg.' : 'Ast erwischt! Kurz abbremsen.', 1.1);
      }
      updateHud();
      break;
    }

    const roadblock = jeepCourse[jeepCourse.length - 1];
    const roadblockY = jeepHazardScreenY(roadblock);
    if (roadblockY >= 337 && !jeep.hitHazards.has(roadblock.id)) {
      jeep.hitHazards.add(roadblock.id);
      jeep.roadblockTimer = .82;
      jeep.speed = 0;
      jeep.shake = .22;
      setGameMode('transition');
      clearMovement();
      setCoco('Vollbremsung!', 'Ein Baum blockiert die ganze Piste.');
      toast('Weg blockiert!', 1.0);
      updateHud();
    }

    if (jeep.distance > 820) jeep.distance = 820;
  }

  function updateAnimals(dt) {
    for (const a of state.animals) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 180 || a.x > 820) a.vx *= -1;
      if (a.y < 130 || a.y > 470) a.vy *= -1;
    }
  }

  function updateRiver(dt) {
    let steer = 0;
    if (state.keys.has('ArrowLeft') || state.keys.has('a')) steer--;
    if (state.keys.has('ArrowRight') || state.keys.has('d')) steer++;

    const previousProgress = state.river.progress;
    const throttle = state.keys.has('ArrowUp') || state.keys.has('w');
    const targetSpeed = throttle ? 82 : 66;
    state.river.speed += (targetSpeed - state.river.speed) * Math.min(1, dt * 3.4);
    state.river.x = Math.max(330, Math.min(630, state.river.x + steer * 245 * dt));
    state.river.progress += state.river.speed * dt;

    const riverCheckpoint = Math.floor(state.river.progress / 180) * 180;
    if (riverCheckpoint > state.river.safeProgress && state.river.progress % 180 < 40) state.river.safeProgress = riverCheckpoint;
    if (previousProgress <= 50 && state.river.progress > 50) updateHud();

    const cycle = Math.floor(state.river.progress / 160);
    const phase = state.river.progress % 160;
    const rockY = -45 + (phase / 160) * (H + 110);
    const rockX = 480 + Math.sin(cycle * 3.1) * 142;

    if (rockY > 398 && rockY < 492 && Math.abs(state.river.x - rockX) < 48 && state.river.lastRockCycle !== cycle) {
      state.river.lastRockCycle = cycle;
      state.river.hits++;
      state.river.progress = Math.max(0,state.river.progress - 16);
      state.river.speed = 28;
      toast('Felsen getroffen! Tempo weg.',1.0);
      updateHud();
    }

    if (state.river.progress >= 950) { state.river.progress = 950; setScene('station'); }
  }

  function updateRadioControls() {
    if (!state.radioMode) return false;
    return true;
  }

  function updateWinch(dt) {
    if (state.gameMode !== 'modal' || state.transitioning || !$('winchDialog').open) return;
    state.winchValue += state.winchDir * dt * .62;
    if (state.winchValue >= .94) { state.winchValue = .94; state.winchDir = -1; }
    if (state.winchValue <= .06) { state.winchValue = .06; state.winchDir = 1; }
    $('winchNeedle').style.left = `${state.winchValue * 100}%`;
  }

  function update(now, dt) {
    if (state.toastTimer > 0) { state.toastTimer -= dt; if (state.toastTimer <= 0) $('toast').hidden = true; }
    if (!state.transitioning) {
      if (state.scene === 'jeep') updateJeep(dt);
      else if (state.scene === 'river') updateRiver(dt);
      else { updateGeneral(dt); if (state.scene === 'wildlife') updateAnimals(dt); }
    }
    const timerSecond = Math.floor((now - state.startTime) / 1000);
    if (timerSecond !== lastTimerSecond) {
      lastTimerSecond = timerSecond;
      $('timeBadge').textContent = formatTime(timerSecond);
    }
  }

  function formatTime(sec) { sec = Math.floor(sec); return `⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }

  function renderInteraction() {
    const p = $('interactionPrompt'), b = $('touchInteractBtn');
    if (!state.near || state.gameMode !== 'world' || state.transitioning) { p.hidden = true; b.disabled = true; b.textContent = '✋ Interagieren'; return; }
    p.hidden = false; $('interactionText').textContent = state.near.label; b.disabled = false; b.textContent = `✋ ${state.near.label}`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (state.scene === 'camp') drawCamp();
    else if (state.scene === 'jeep') drawJeep();
    else if (state.scene === 'blocked') drawBlocked();
    else if (state.scene === 'wildlife') drawWildlife();
    else if (state.scene === 'river') drawRiver();
    else if (state.scene === 'station') drawStation();
    else if (state.scene === 'tower') drawTower();
    if (!['jeep', 'river'].includes(state.scene)) drawExplorer();
    if (state.scene === 'camp') drawCampForeground(performance.now());
    if (state.cameraMode) drawCameraOverlay();
  }

  function fillGradient(top, bottom) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function roundRect(x,y,w,h,r,fill,stroke=null){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
  function drawTree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#3e2b19';ctx.fillRect(-7,0,14,58);ctx.fillStyle='#18562f';for(const [dx,dy,r] of [[0,-14,34],[-26,2,25],[27,4,27],[0,16,29]]){ctx.beginPath();ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function drawBush(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#236d39';for(const [dx,dy,r] of [[0,0,19],[-17,7,14],[18,8,16],[4,13,18]]){ctx.beginPath();ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function drawJungleDecor(alpha=1){ctx.save();ctx.globalAlpha=alpha;for(const d of sceneDecor){if(d.type==='tree')drawTree(d.x,d.y,d.s);else drawBush(d.x,d.y,d.s)}ctx.restore()}
  function marker(x,y,label){const pulse=.6+Math.sin(performance.now()/300+x)*.15;ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.fillStyle=`rgba(115,229,139,${pulse})`;ctx.fill();ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#07160e';ctx.fillText(label,x,y+4)}

  function drawLeafShape(x,y,angle,s,fill,vein='rgba(235,255,220,.18)'){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
    ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(18,-19,44,-15,58,0);ctx.bezierCurveTo(39,17,17,18,0,0);ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();
    ctx.strokeStyle=vein;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(48,0);ctx.stroke();
    ctx.restore();
  }

  function drawCampBackground(t){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#a8c8a1');sky.addColorStop(.28,'#5f936e');sky.addColorStop(.72,'#1e563a');sky.addColorStop(1,'#123c2a');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

    const sun=ctx.createRadialGradient(815,78,8,815,78,230);
    sun.addColorStop(0,'rgba(255,239,174,.92)');sun.addColorStop(.2,'rgba(255,214,125,.48)');sun.addColorStop(1,'rgba(255,203,96,0)');
    ctx.fillStyle=sun;ctx.fillRect(570,0,390,310);

    ctx.save();ctx.fillStyle='rgba(12,54,36,.58)';
    for(let i=0;i<15;i++){
      const x=20+i*70+(i%3)*11;const h=95+(i%5)*18;
      ctx.fillRect(x-7,108,14,h);
      for(const [dx,dy,r] of [[0,100,44],[-28,112,30],[31,116,34],[5,82,28]]){
        ctx.beginPath();ctx.arc(x+dx,dy,r,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();

    ctx.fillStyle='rgba(207,226,192,.09)';
    ctx.fillRect(0,185,W,48);
    ctx.fillStyle='rgba(226,235,210,.055)';
    ctx.fillRect(0,245,W,36);

    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<4;i++){
      const wobble=Math.sin(t/1700+i)*12;
      const g=ctx.createLinearGradient(760+i*42,0,420+i*20,540);
      g.addColorStop(0,'rgba(255,226,151,.16)');
      g.addColorStop(1,'rgba(255,226,151,0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.moveTo(745+i*48+wobble,0);ctx.lineTo(825+i*36+wobble,0);ctx.lineTo(560+i*18,560);ctx.lineTo(470+i*15,560);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }

  function drawCampGround(){
    const soil=ctx.createLinearGradient(0,300,0,600);
    soil.addColorStop(0,'#8b6a43');soil.addColorStop(.48,'#735034');soil.addColorStop(1,'#563824');
    ctx.fillStyle=soil;
    ctx.beginPath();ctx.moveTo(50,430);ctx.bezierCurveTo(110,310,300,284,485,325);ctx.bezierCurveTo(655,280,858,320,930,420);ctx.lineTo(960,600);ctx.lineTo(0,600);ctx.closePath();ctx.fill();

    ctx.fillStyle='rgba(213,170,98,.15)';
    ctx.beginPath();ctx.moveTo(370,600);ctx.bezierCurveTo(390,520,470,455,580,405);ctx.bezierCurveTo(680,360,760,350,930,360);ctx.lineTo(960,455);ctx.bezierCurveTo(750,430,590,485,520,600);ctx.closePath();ctx.fill();

    ctx.fillStyle='rgba(36,78,44,.38)';
    for(const [x,y,w] of [[70,485,115],[245,515,85],[600,530,120],[830,500,90]]){
      ctx.beginPath();ctx.ellipse(x,y,w,24,0,0,Math.PI*2);ctx.fill();
    }

    ctx.fillStyle='rgba(255,223,151,.12)';
    for(const [x,y,r] of [[410,455,4],[466,402,3],[525,480,5],[615,420,3],[690,505,4],[300,455,3],[760,447,3]]){
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
  }

  function drawCampTent(t){
    const sway=Math.sin(t/850)*3;
    ctx.save();ctx.translate(318,315);
    ctx.fillStyle='rgba(8,26,17,.32)';ctx.beginPath();ctx.ellipse(0,76,142,30,0,0,Math.PI*2);ctx.fill();

    ctx.strokeStyle='#9b7a4c';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-104,48);ctx.lineTo(-142,102);ctx.moveTo(104,48);ctx.lineTo(142,102);ctx.stroke();

    const canvasGrad=ctx.createLinearGradient(-110,-70,120,100);
    canvasGrad.addColorStop(0,'#e3d39c');canvasGrad.addColorStop(.52,'#c4a86d');canvasGrad.addColorStop(1,'#8d7048');
    ctx.fillStyle=canvasGrad;
    ctx.beginPath();ctx.moveTo(-126,76);ctx.lineTo(-58,-58);ctx.lineTo(72,-58);ctx.lineTo(128,76);ctx.closePath();ctx.fill();

    ctx.fillStyle='#b9975f';
    ctx.beginPath();ctx.moveTo(-126,76);ctx.lineTo(-58,-58);ctx.lineTo(4,8);ctx.lineTo(-10,76);ctx.closePath();ctx.fill();

    ctx.fillStyle='#243c2d';
    ctx.beginPath();ctx.moveTo(4,8);ctx.lineTo(70,-52);ctx.lineTo(88,76);ctx.lineTo(-10,76);ctx.closePath();ctx.fill();

    ctx.strokeStyle='rgba(78,57,35,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-58,-58);ctx.lineTo(72,-58);ctx.stroke();
    ctx.fillStyle='#694d31';ctx.fillRect(-64,-65,140,8);

    ctx.save();ctx.translate(13,-72);ctx.rotate(sway*.01);
    ctx.fillStyle='#d8b457';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(58,10);ctx.lineTo(0,24);ctx.closePath();ctx.fill();
    ctx.restore();

    ctx.fillStyle='rgba(255,235,177,.7)';
    ctx.fillRect(-102,55,38,4);ctx.fillRect(72,55,28,4);
    ctx.restore();
  }

  function drawCampTable(){
    ctx.save();ctx.translate(150,150);
    ctx.fillStyle='rgba(7,24,15,.34)';ctx.beginPath();ctx.ellipse(0,66,92,22,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4f3825';ctx.fillRect(-68,14,10,66);ctx.fillRect(58,14,10,66);
    const wood=ctx.createLinearGradient(-80,0,80,0);wood.addColorStop(0,'#6f4d31');wood.addColorStop(.5,'#9b6e43');wood.addColorStop(1,'#5f4029');
    roundRect(-82,-6,164,32,7,wood,'#3d2a1f');

    ctx.save();ctx.rotate(-.06);
    roundRect(-49,-40,98,58,8,'#17291f','#6b8d72');
    ctx.fillStyle='#b8d6a3';ctx.fillRect(-40,-31,80,40);
    ctx.strokeStyle='#496b4f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-31,1);ctx.lineTo(-6,-12);ctx.lineTo(14,-4);ctx.lineTo(34,-24);ctx.stroke();
    for(const [x,y,c] of [[-31,1,'#d79e45'],[-6,-12,'#e6c662'],[14,-4,'#6d9e62'],[34,-24,'#d46f55']]){
      ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#d9e9cf';ctx.font='700 7px system-ui';ctx.textAlign='center';ctx.fillText('ROUTE 07',0,-17);
    ctx.restore();

    ctx.fillStyle='#d7c18a';ctx.fillRect(-74,29,28,18);
    ctx.strokeStyle='#705b39';ctx.beginPath();ctx.moveTo(-70,34);ctx.lineTo(-52,42);ctx.moveTo(-66,43);ctx.lineTo(-51,33);ctx.stroke();
    ctx.restore();
  }

  function drawCampSupplies(){
    ctx.save();
    ctx.fillStyle='rgba(7,24,15,.28)';ctx.beginPath();ctx.ellipse(470,455,104,26,0,0,Math.PI*2);ctx.fill();
    roundRect(412,395,82,52,5,'#6c4e2f','#3e2a1b');
    ctx.strokeStyle='#a38051';ctx.lineWidth=3;ctx.strokeRect(424,405,58,30);
    ctx.fillStyle='#263d2e';roundRect(506,404,35,50,7,'#31513a','#182b20');ctx.fillStyle='#d9b95c';ctx.fillRect(516,397,14,10);
    ctx.strokeStyle='#c0a36c';ctx.lineWidth=5;
    for(let r=9;r<=23;r+=7){ctx.beginPath();ctx.arc(568,431,r,0,Math.PI*1.7);ctx.stroke();}
    ctx.fillStyle='#b34f3d';roundRect(365,420,30,37,5,'#a64f3d','#583024');ctx.fillStyle='#e3c06a';ctx.fillRect(373,414,14,7);
    ctx.restore();
  }

  function drawCampJeepDetailed(t){
    const age=state.campJeepStartAt ? Math.max(0,t-state.campJeepStartAt) : -1;
    const active=age>=0 && age<760;
    const fade=active ? Math.max(0,1-age/760) : 0;
    const bounce=active ? Math.sin(age/36)*4*fade : 0;

    ctx.save();ctx.translate(760,365+bounce);
    ctx.fillStyle='rgba(5,20,13,.34)';ctx.beginPath();ctx.ellipse(0,54,84,23,0,0,Math.PI*2);ctx.fill();

    if(active){
      for(let i=0;i<8;i++){
        const p=Math.min(1,Math.max(0,(age-i*38)/500));
        if(p<=0)continue;
        ctx.fillStyle=`rgba(206,166,98,${(1-p)*.2})`;
        ctx.beginPath();ctx.arc(-60-i*8-p*40,37+(i%2)*8,7+p*13,0,Math.PI*2);ctx.fill();
      }
    }

    ctx.fillStyle='#17201b';
    for(const x of[-53,53]){ctx.beginPath();ctx.arc(x,36,19,0,Math.PI*2);ctx.fill();ctx.fillStyle='#566052';ctx.beginPath();ctx.arc(x,36,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17201b';}

    const body=ctx.createLinearGradient(0,-28,0,34);body.addColorStop(0,'#e0ad42');body.addColorStop(.55,'#c88728');body.addColorStop(1,'#8c561e');
    roundRect(-76,-18,152,52,14,body,'#6e461f');
    ctx.fillStyle='#b87424';ctx.beginPath();ctx.moveTo(-42,-18);ctx.lineTo(-19,-50);ctx.lineTo(42,-50);ctx.lineTo(61,-18);ctx.closePath();ctx.fill();
    ctx.fillStyle='#263d35';ctx.beginPath();ctx.moveTo(-12,-43);ctx.lineTo(11,-43);ctx.lineTo(11,-22);ctx.lineTo(-27,-22);ctx.closePath();ctx.fill();
    ctx.fillStyle='#35534a';ctx.beginPath();ctx.moveTo(16,-43);ctx.lineTo(36,-43);ctx.lineTo(52,-22);ctx.lineTo(16,-22);ctx.closePath();ctx.fill();

    ctx.strokeStyle='#3e3325';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-25,-54);ctx.lineTo(38,-54);ctx.moveTo(-33,-57);ctx.lineTo(-33,-47);ctx.moveTo(46,-57);ctx.lineTo(46,-47);ctx.stroke();
    ctx.fillStyle='#6d4b2a';ctx.fillRect(-22,-62,48,7);

    ctx.strokeStyle='#6b451e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(0,32);ctx.moveTo(40,-17);ctx.lineTo(40,31);ctx.stroke();
    ctx.fillStyle='#302d24';ctx.beginPath();ctx.arc(72,4,15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6c725f';ctx.lineWidth=3;ctx.stroke();

    const lights=state.solved.has('q1') || active;
    ctx.fillStyle=lights?'#f4df8d':'#7c683d';
    for(const x of[-66,-48]){ctx.beginPath();ctx.arc(x,7,6,0,Math.PI*2);ctx.fill();}
    if(active){
      const glow=ctx.createRadialGradient(-70,7,4,-70,7,45);glow.addColorStop(0,'rgba(255,231,151,.25)');glow.addColorStop(1,'rgba(255,231,151,0)');ctx.fillStyle=glow;ctx.fillRect(-115,-38,90,90);
    }

    ctx.fillStyle='#f2dfab';roundRect(-15,14,51,14,5,'#ead79d','#644820');ctx.fillStyle='#342a1e';ctx.font='800 8px system-ui';ctx.textAlign='center';ctx.fillText('MANGO-1',10,24);
    ctx.fillStyle=state.solved.has('q1')?'#6ee48d':'#6d3f2e';ctx.beginPath();ctx.arc(52,-8,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawCampPollen(t){
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<18;i++){
      const x=(90+i*71+(t*.012*(1+i%3)))%980;
      const y=80+((i*47+t*.008*(2+i%2))%390);
      const a=.08+(i%4)*.025;
      ctx.fillStyle=`rgba(255,231,166,${a})`;
      ctx.beginPath();ctx.arc(x,y,1.3+(i%3)*.5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawRetroTent(x,y){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-76,-54,152,108,'#b89862');
    pixelRect(-69,-47,138,94,'#d2bd84');
    pixelRect(-6,-47,12,94,'#9d7c4e');
    pixelRect(-53,-31,47,62,'#c2a46e');
    pixelRect(6,-31,47,62,'#e0cb91');
    pixelRect(-19,14,38,33,'#263d2e');
    pixelRect(-13,19,26,28,'#1d3024');
    pixelRect(-83,-61,166,8,'#59412a');
    pixelRect(-84,54,8,18,'#59412a');pixelRect(76,54,8,18,'#59412a');
    ctx.restore();
  }

  function drawRetroCampTable(x,y){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-64,9,128,16,'#61452d');
    pixelRect(-56,25,10,38,'#4b3424');pixelRect(46,25,10,38,'#4b3424');
    pixelRect(-47,-29,94,42,'#1f3429');
    pixelRect(-41,-23,82,30,'#9db98b');
    pixelRect(-32,-15,12,5,'#d5a94f');pixelRect(-15,-8,18,5,'#4d744f');pixelRect(6,-17,25,5,'#c7694c');
    pixelRect(-5,-3,17,4,'#6b815d');
    ctx.fillStyle='#e4edd6';ctx.font='800 8px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('ROUTE',0,-8);
    ctx.restore();
  }

  function drawRetroSupplies(x,y){
    pixelRect(x,y,56,38,'#684b30');pixelRect(x+7,y+7,42,24,'#8a653d');
    pixelRect(x+70,y+4,25,39,'#2d5038');pixelRect(x+77,y-2,11,8,'#d3b256');
    ctx.strokeStyle='#c5a56a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+120,y+24,18,0,Math.PI*1.75);ctx.stroke();
    pixelRect(x-36,y+10,25,30,'#9f4e3b');pixelRect(x-29,y+5,11,7,'#d3b256');
  }

  function drawCamp(){
    const t=performance.now();
    drawRetroField(0);

    // Blocky dirt clearing + two paths.
    pixelRect(86,260,788,250,'#8f6a42');
    pixelRect(118,228,724,32,'#987149');
    pixelRect(404,508,152,92,'#8f6a42');
    for(let x=118;x<842;x+=32){
      const h=roadHash(x,7);
      if(h%3===0) pixelRect(x,278+(h%160),6,4,'#6f5034');
      if(h%5===0) pixelRect(x+12,300+(h%130),5,3,'#ad8554');
    }

    // Jungle wall.
    for(let x=36;x<930;x+=82){
      if(x>100&&x<845) drawRetroTree(x,220-(x%3)*9,.96,x);
    }

    drawRetroTent(318,360);
    drawRetroCampTable(150,150);
    drawRetroSupplies(440,405);

    const age=state.campJeepStartAt ? Math.max(0,t-state.campJeepStartAt) : -1;
    const active=age>=0&&age<760;
    const bounce=active?Math.sin(age/34)*4*(1-age/760):0;
    ctx.save();ctx.translate(0,bounce);drawRetroJeep(760,365,t);ctx.restore();

    if(active){
      for(let i=0;i<8;i++){
        const p=Math.max(0,Math.min(1,(age-i*35)/520));
        if(p<=0)continue;
        pixelRect(698-i*9-p*34,407+(i%2)*7,8+p*14,5+p*8,`rgba(128,88,48,${.28*(1-p)})`);
      }
    }

    marker(150,92,'E');
    marker(760,292,'E');

    drawRetroPanel(240,18,280,46,'EXPEDITIONS-CAMP A-07');
    ctx.fillStyle='#cfe0c5';ctx.font='700 10px ui-monospace,monospace';ctx.textAlign='left';
    ctx.fillText('TABLET  ←   START   →  MANGO-1',255,49);
  }

  function drawCampForeground(){
    pixelRect(0,556,960,44,'#123e28');
    for(let x=0;x<960;x+=64){
      pixelRect(x,568-(x%17),18,32,'#1d5834');
      pixelRect(x+15,575-(x%11),24,25,'#286a3d');
    }
    drawRetroTree(28,545,1.08,2);
    drawRetroTree(925,544,1.05,3);
  }

  function pixelRect(x,y,w,h,fill){
    ctx.fillStyle=fill;
    ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
  }

  function drawRetroField(offsetY=0){
    const tile=32;
    let row=0;
    for(let y=-tile+(offsetY%tile);y<H+tile;y+=tile,row++){
      for(let x=0;x<W;x+=tile) drawRetroGrassTile(x,y,row,x/tile);
    }
  }

  function drawRetroPanel(x,y,w,h,title){
    pixelRect(x,y,w,h,'rgba(10,27,18,.92)');
    pixelRect(x+6,y+6,w-12,h-12,'#173d29');
    pixelRect(x+6,y+6,w-12,3,'#5f8b62');
    if(title){
      ctx.fillStyle='#f2ecd7';
      ctx.font='800 12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign='left';
      ctx.fillText(title,x+14,y+25);
    }
  }

  function roadHash(a,b){
    let n=(a*374761393+b*668265263)>>>0;
    n=(n^(n>>>13))*1274126177>>>0;
    return (n^(n>>>16))>>>0;
  }

  function drawRetroTree(x,y,scale=1,variant=0){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
    pixelRect(-8,18,16,31,'#4a3224');
    pixelRect(-12,17,24,8,'#6a4930');
    const dark=variant%2?'#123d29':'#17462d';
    const mid=variant%2?'#1c5a35':'#21633a';
    const light=variant%2?'#357b46':'#3c854a';
    pixelRect(-31,-18,62,34,dark);
    pixelRect(-24,-27,48,15,mid);
    pixelRect(-37,-8,22,20,mid);
    pixelRect(15,-7,22,19,mid);
    pixelRect(-14,-34,28,12,light);
    pixelRect(-25,-17,16,8,light);
    ctx.restore();
  }

  function drawRetroGrassTile(x,y,row,col){
    const h=roadHash(row,col);
    pixelRect(x,y,32,32,(h&1)?'#28633a':'#2d6b3d');
    if((h%5)===0){pixelRect(x+6,y+8,3,10,'#43834e');pixelRect(x+10,y+5,3,13,'#4d9158');}
    if((h%7)===0){pixelRect(x+21,y+19,3,7,'#163f2a');pixelRect(x+25,y+16,3,10,'#1d4b2f');}
    pixelRect(x,y+29,32,3,'rgba(11,45,27,.17)');
  }

  function drawRetroRoadTile(x,y,row,col){
    const h=roadHash(row,col);
    pixelRect(x,y,32,32,(h&1)?'#9a7348':'#a07a4d');
    if(h%4===0) pixelRect(x+5+(h%16),y+8,5,3,'#805b39');
    if(h%6===0) pixelRect(x+20,y+22,4,3,'#b58b58');
    pixelRect(x,y,32,2,'rgba(76,51,31,.10)');
  }

  function drawRetroJungleEdge(y,row){
    for(let x=0;x<288;x+=32) drawRetroGrassTile(x,y,row,x/32);
    for(let x=672;x<W;x+=32) drawRetroGrassTile(x,y,row,x/32);
    if(row%3===0){
      drawRetroTree(44+(row%4)*45,y+20,1.0,row);
      drawRetroTree(895-(row%5)*38,y+15,.95,row+1);
    }
    if(row%4===1){
      pixelRect(238,y+8,34,24,'#1b5232');
      pixelRect(688,y+5,34,27,'#1e5b35');
    }
  }

  function drawRetroRoad(){
    const tile=32;
    const scroll=(state.jeep.distance*JEEP_PX_PER_M)%tile;
    let rowIndex=Math.floor((state.jeep.distance*JEEP_PX_PER_M)/tile);
    for(let y=-tile+scroll;y<H+tile;y+=tile,rowIndex--){
      for(let x=288;x<672;x+=tile) drawRetroRoadTile(x,y,rowIndex,x/tile);
      drawRetroJungleEdge(y,rowIndex);
      pixelRect(280,y,8,tile,'#1b4b2f');
      pixelRect(672,y,8,tile,'#1b4b2f');
      if(rowIndex%5===0){
        pixelRect(300,y+9,5,8,'#c3a167');
        pixelRect(655,y+18,4,6,'#785b38');
      }
    }
    ctx.fillStyle='rgba(92,59,35,.14)';
    ctx.fillRect(400,0,18,H);
    ctx.fillRect(542,0,18,H);
  }

  function drawRetroRock(x,y,variant=0){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-24,-13,48,30,'#4f514a');
    pixelRect(-18,-22,30,10,'#686b61');
    pixelRect(-25,-7,9,17,'#363a34');
    pixelRect(12,-10,14,21,'#3d403a');
    pixelRect(-11,-18,18,5,'#85877c');
    if(variant%2) pixelRect(2,-4,13,7,'#5f6259');
    ctx.restore();
  }

  function drawRetroMud(x,y,t){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-50,-18,100,36,'#664228');
    pixelRect(-43,-25,67,8,'#765034');
    pixelRect(-32,18,62,7,'#4f3423');
    pixelRect(-36,-11,21,10,'#402a1d');
    pixelRect(8,2,30,11,'#4a3020');
    pixelRect(-3,-16,24,8,'#896044');
    const glint=(Math.sin(t/260)+1)*4;
    pixelRect(-20+glint,-7,20,3,'rgba(218,174,111,.25)');
    ctx.restore();
  }

  function drawRetroBranch(x,y){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-49,-7,98,14,'#65452a');
    pixelRect(-37,-11,32,5,'#8a633a');
    pixelRect(18,-20,9,18,'#5b3c25');
    pixelRect(26,-22,24,6,'#365f32');
    pixelRect(37,-30,18,8,'#3f7139');
    ctx.restore();
  }

  function drawRetroRoadblock(x,y){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    pixelRect(-205,-16,410,32,'#5b3d25');
    pixelRect(-186,-23,105,8,'#7d5b36');
    pixelRect(86,-24,74,9,'#7d5b36');
    for(const xx of[-165,-110,-45,28,93,155]){
      pixelRect(xx,-40,24,23,'#17472d');
      pixelRect(xx-9,-31,42,18,'#225f36');
      pixelRect(xx+4,-48,27,15,'#327845');
    }
    pixelRect(-210,-10,9,18,'#3b291d');
    pixelRect(201,-9,9,18,'#3b291d');
    ctx.restore();
  }

  function drawRetroJeep(x,y,t){
    const jeep=state.jeep;
    const bounce=jeep.stuck ? Math.sin(t/55)*2 : Math.sin(t/115)*1.2;
    ctx.save();ctx.translate(Math.round(x),Math.round(y+bounce));

    pixelRect(-42,43,84,14,'rgba(13,25,18,.27)');

    pixelRect(-46,-21,12,27,'#17211b');pixelRect(34,-21,12,27,'#17211b');
    pixelRect(-46,19,12,27,'#17211b');pixelRect(34,19,12,27,'#17211b');
    pixelRect(-43,-15,7,15,'#495247');pixelRect(36,-15,7,15,'#495247');
    pixelRect(-43,24,7,15,'#495247');pixelRect(36,24,7,15,'#495247');

    pixelRect(-36,-39,72,82,'#c98524');
    pixelRect(-31,-34,62,23,'#e2aa38');
    pixelRect(-31,19,62,18,'#a9661f');
    pixelRect(-39,-8,78,28,'#d99629');
    pixelRect(-31,-5,62,22,'#244338');

    // Visible driver face through windshield.
    pixelRect(-10,-2,20,17,'#d8a57c');
    pixelRect(-12,-7,24,8,'#315239');
    pixelRect(-6,5,4,4,'#1c241d');
    pixelRect(3,5,4,4,'#1c241d');
    pixelRect(-2,11,5,2,'#7e4d3b');

    pixelRect(-27,-46,54,5,'#4a3a27');
    pixelRect(-30,-48,5,12,'#4a3a27');pixelRect(25,-48,5,12,'#4a3a27');
    pixelRect(-20,-54,18,8,'#6e5130');pixelRect(3,-54,17,8,'#37553a');

    pixelRect(-29,-40,12,6,'#f2db83');pixelRect(17,-40,12,6,'#f2db83');
    pixelRect(-29,38,58,5,'#66441f');
    pixelRect(-8,29,16,7,'#eed79d');

    if(jeep.stuck){
      pixelRect(-56,37,19,8,'#5d3b25');pixelRect(37,35,22,10,'#5d3b25');
      pixelRect(-62,43,10,7,'#765038');pixelRect(51,42,12,7,'#765038');
    }
    ctx.restore();
  }

  function drawRetroHazards(t){
    for(const hazard of jeepCourse){
      const y=jeepHazardScreenY(hazard);
      if(y<-90||y>H+80) continue;
      const x=JEEP_LANES[hazard.lane];
      if(hazard.type==='rock') drawRetroRock(x,y,roadHash(Math.round(hazard.at),hazard.lane));
      else if(hazard.type==='mud') drawRetroMud(x,y,t);
      else if(hazard.type==='branch') drawRetroBranch(x,y);
      else if(hazard.type==='tree') drawRetroRoadblock(480,y);
    }
  }

  function drawJeepHud(){
    const progress=Math.max(0,Math.min(1,state.jeep.distance/850));
    pixelRect(24,22,212,48,'rgba(10,27,18,.88)');
    pixelRect(31,29,198,34,'#173d29');
    pixelRect(38,48,184,7,'#294d36');
    pixelRect(38,48,184*progress,7,'#e0ad42');
    ctx.fillStyle='#f4efd9';ctx.font='800 14px ui-monospace, SFMono-Regular, Menlo, monospace';ctx.textAlign='left';
    ctx.fillText(`ROUTE ${Math.floor(state.jeep.distance)} / 850 m`,38,43);

    pixelRect(W-191,22,167,48,'rgba(10,27,18,.88)');
    pixelRect(W-184,29,153,34,'#173d29');
    ctx.fillStyle='#f4efd9';ctx.font='800 13px ui-monospace, SFMono-Regular, Menlo, monospace';ctx.textAlign='center';
    ctx.fillText(state.jeep.stuck?'FESTGEFAHREN':'MANGO-1',W-108,43);
    ctx.fillStyle=state.jeep.stuck?'#e8bd4e':'#72d991';
    ctx.fillText(state.jeep.stuck?`↑ ${Math.round(state.jeep.stuckPower*100)}%`:`${Math.round(state.jeep.speed)} km/h`,W-108,57);
  }

  function drawJeep(){
    const t=performance.now();
    const shake=state.jeep.shake>0 ? Math.sin(t/19)*5*(state.jeep.shake/.34) : 0;
    ctx.save();ctx.translate(shake,0);
    drawRetroRoad();
    drawRetroHazards(t);
    drawRetroJeep(state.jeep.x,JEEP_SCREEN_Y,t);

    const fg=(state.jeep.distance*4)%140;
    drawLeafShape(-20,115+fg*.18,.42,1.55,'#103a26');
    drawLeafShape(905,365-fg*.2,2.7,1.45,'#123e28');
    ctx.restore();

    drawJeepHud();

    if(state.jeep.stuck){
      pixelRect(304,500,352,58,'rgba(8,23,15,.93)');
      pixelRect(313,509,334,40,'#173d29');
      ctx.fillStyle='#f3edd8';ctx.font='900 16px ui-monospace, SFMono-Regular, Menlo, monospace';ctx.textAlign='center';
      ctx.fillText('FESTGEFAHREN · ↑ / W HALTEN',480,532);
    }
  }

  function drawBlocked(){
    const t=performance.now();
    const savedDistance=state.jeep.distance;
    state.jeep.distance=812;
    drawRetroRoad();
    state.jeep.distance=savedDistance;

    drawRetroRoadblock(480,250);
    drawRetroJeep(300,438,t);

    pixelRect(655,280,64,42,'#6c4d2d');
    pixelRect(665,288,44,25,'#2d4233');
    pixelRect(676,279,22,7,'#9b7747');
    ctx.strokeStyle='#c4a46c';ctx.lineWidth=4;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(332,414);ctx.lineTo(670,302);ctx.stroke();ctx.setLineDash([]);
    marker(690,270,'E');

    pixelRect(22,22,252,44,'rgba(10,27,18,.88)');
    pixelRect(29,29,238,30,'#173d29');
    ctx.fillStyle='#f3edd8';ctx.font='800 13px ui-monospace, SFMono-Regular, Menlo, monospace';ctx.textAlign='left';
    ctx.fillText('WEG BLOCKIERT · WINDE SUCHEN',39,49);
  }

  function drawRetroAnimal(animal){
    const x=Math.round(animal.x), y=Math.round(animal.y);
    ctx.save();ctx.translate(x,y);
    if(animal.id==='toucan'){
      pixelRect(-14,-5,28,20,'#1c2520');
      pixelRect(-8,-12,17,13,'#f0e6c9');
      pixelRect(8,-10,26,10,'#e9a631');
      pixelRect(22,-8,11,6,'#c76632');
      pixelRect(-6,-9,4,4,'#151d18');
      pixelRect(-4,15,4,10,'#78512e');pixelRect(5,15,4,10,'#78512e');
    } else if(animal.id==='capybara'){
      pixelRect(-26,-7,50,26,'#8a613d');
      pixelRect(15,-15,25,25,'#9b7048');
      pixelRect(20,-20,7,8,'#6f4b32');pixelRect(32,-19,7,8,'#6f4b32');
      pixelRect(30,-8,4,4,'#141b17');
      pixelRect(39,-2,5,3,'#4f3527');
      pixelRect(-20,18,8,10,'#5d412e');pixelRect(10,18,8,10,'#5d412e');
    } else {
      pixelRect(-16,-8,32,27,'#73503a');
      pixelRect(-11,-20,22,18,'#8b6547');
      pixelRect(-6,-14,4,4,'#171e19');pixelRect(4,-14,4,4,'#171e19');
      ctx.strokeStyle='#68442f';ctx.lineWidth=5;ctx.beginPath();ctx.arc(20,2,15,-1.2,1.4);ctx.stroke();
    }
    if(state.photos.has(animal.id)&&animal.target){
      pixelRect(18,-30,18,18,'#1c4d31');ctx.fillStyle='#8bea9f';ctx.font='900 14px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('✓',27,-17);
    }
    ctx.restore();
  }

  function drawWildlife(){
    drawRetroField(0);
    pixelRect(78,314,806,220,'#8e6a43');
    pixelRect(110,282,742,32,'#967249');
    pixelRect(770,420,190,180,'#327f8c');
    pixelRect(800,420,8,180,'#d0b37b');
    pixelRect(848,420,8,180,'#d0b37b');
    pixelRect(806,454,94,9,'#8a633d');
    pixelRect(806,490,94,9,'#8a633d');

    // Sender station.
    pixelRect(524,72,104,86,'#243a31');
    pixelRect(532,80,88,70,'#385246');
    pixelRect(546,94,60,30,state.photos.size>=2?'#75d98b':'#243229');
    pixelRect(568,66,16,12,'#8c7148');
    pixelRect(573,45,5,24,'#b1b9aa');
    pixelRect(566,43,19,4,'#b1b9aa');
    ctx.fillStyle=state.photos.size>=2?'#d7efd8':'#64786b';ctx.font='800 10px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(state.photos.size>=2?'READY':'LOCK',576,114);
    marker(575,175,state.photos.size>=2?'E':'🔒');

    // Dock + boat.
    pixelRect(830,398,110,26,'#65482f');
    pixelRect(839,424,12,87,'#4b3526');pixelRect(910,424,12,87,'#4b3526');
    drawRetroBoat(875,470,performance.now());
    marker(875,390,'E');

    for(const a of state.animals) drawRetroAnimal(a);
    drawRetroPanel(22,22,252,44,'WILDTIER-GEBIET');
  }

  function drawRetroWaterTile(x,y,row,col){
    const h=roadHash(row,col);
    pixelRect(x,y,32,32,(h&1)?'#2c8194':'#2f899c');
    if(h%3===0) pixelRect(x+4,y+9,17,3,'rgba(194,234,226,.22)');
    if(h%5===0) pixelRect(x+15,y+23,12,2,'rgba(216,246,237,.16)');
  }

  function drawRiver(){
    const tile=32;
    const scroll=(state.river.progress*2.2)%tile;
    let row=Math.floor((state.river.progress*2.2)/tile);

    for(let y=-tile+scroll;y<H+tile;y+=tile,row--){
      for(let x=0;x<288;x+=tile) drawRetroGrassTile(x,y,row,x/tile);
      for(let x=672;x<W;x+=tile) drawRetroGrassTile(x,y,row,x/tile);
      for(let x=288;x<672;x+=tile) drawRetroWaterTile(x,y,row,x/tile);
      pixelRect(280,y,8,tile,'#234f37');pixelRect(672,y,8,tile,'#234f37');
      if(row%3===0){drawRetroTree(88+(row%4)*30,y+18,.88,row);drawRetroTree(860-(row%4)*33,y+16,.9,row+1);}
    }

    const cycle=Math.floor(state.river.progress/160);
    const phase=state.river.progress%160;
    const rockY=-45+(phase/160)*(H+110);
    const rockX=480+Math.sin(cycle*3.1)*142;
    drawRetroRock(rockX,rockY,cycle);

    // Wake.
    pixelRect(state.river.x-31,493,62,4,'rgba(210,243,234,.26)');
    pixelRect(state.river.x-42,506,84,3,'rgba(210,243,234,.16)');
    drawRetroBoat(state.river.x,455,performance.now());

    drawRetroPanel(22,22,230,48,'RIO VERDE');
    ctx.fillStyle='#d9eee7';ctx.font='800 10px ui-monospace,monospace';ctx.textAlign='left';
    ctx.fillText(`${Math.floor(state.river.progress)} / 950 m · ${Math.round(state.river.speed)} km/h`,36,54);
  }

  function drawStation(){
    drawRetroField(0);
    pixelRect(64,346,830,210,'#82623f');
    pixelRect(86,320,786,26,'#8f6b44');

    // Research cabin.
    pixelRect(304,72,506,278,state.generator.done?'#bba878':'#6f6a57');
    pixelRect(316,84,482,254,state.generator.done?'#d1c291':'#777362');
    pixelRect(316,84,482,24,'#57452f');
    pixelRect(502,260,110,78,'#24382d');
    pixelRect(516,274,82,64,'#182a21');

    // Windows.
    const windowColor=state.generator.done?'#91d9a1':'#29352e';
    pixelRect(350,130,150,82,'#514735');pixelRect(360,140,130,62,windowColor);
    pixelRect(620,130,130,82,'#514735');pixelRect(630,140,110,62,windowColor);
    if(state.generator.done){
      pixelRect(366,146,118,5,'rgba(236,235,167,.35)');
      pixelRect(636,146,98,5,'rgba(236,235,167,.35)');
    }

    // Generator at exact hotspot.
    pixelRect(116,317,118,86,'#4e4b38');
    pixelRect(126,327,98,66,'#665f43');
    pixelRect(138,339,28,28,'#21362b');
    pixelRect(176,341,36,7,state.generator.done?'#76df8c':'#7d4d36');
    pixelRect(176,354,28,7,'#c4a65e');
    pixelRect(135,404,80,12,'#36362d');
    marker(175,455,'E');

    // Terminal.
    pixelRect(650,116,120,82,'#29352e');
    pixelRect(660,126,100,56,state.generator.done?'#386f4a':'#121b16');
    if(state.generator.done){
      pixelRect(671,138,78,6,'#8be7a0');
      pixelRect(671,152,52,5,'#6fbd81');
      pixelRect(671,164,66,5,'#78c989');
    }
    marker(710,220,state.generator.done?'E':'🔒');

    // Exit gate.
    pixelRect(836,345,70,150,'#354b3e');
    pixelRect(844,353,54,134,'#26382f');
    pixelRect(862,369,18,102,state.solved.has('q3')?'#7b9a7e':'#51645a');
    marker(870,335,state.solved.has('q3')?'E':'🔒');

    drawRetroPanel(22,22,270,44,state.generator.done?'STATION · STROM AN':'STATION · STROM AUS');
  }

  function drawTower(){
    drawRetroField(0);
    pixelRect(96,330,768,226,'#76583a');
    pixelRect(128,300,704,30,'#82613d');

    // Mast.
    pixelRect(474,78,12,314,'#75867c');
    for(let y=110;y<380;y+=44){
      pixelRect(405,y,150,7,'#65766d');
      ctx.strokeStyle='#65766d';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(411,y+2);ctx.lineTo(480,y+40);ctx.moveTo(549,y+2);ctx.lineTo(480,y+40);ctx.stroke();
    }
    pixelRect(459,62,42,16,'#b04e3e');
    pixelRect(470,47,20,15,'#dc6c55');

    // Console.
    pixelRect(410,116,140,92,'#263c32');
    pixelRect(420,126,120,66,'#355345');
    pixelRect(432,138,96,30,'#1b2a22');
    ctx.fillStyle=state.tuned===radioChannel?'#8ce89e':'#e2c261';
    ctx.font='900 18px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(`CH ${state.tuned}`,480,159);
    marker(480,225,'E');

    if(state.radioMode){
      drawRetroPanel(270,470,420,82,'FUNK');
      ctx.fillStyle='#d8e7d7';ctx.font='800 12px ui-monospace,monospace';ctx.textAlign='center';
      ctx.fillText('← / → KANAL     E / ENTER SENDEN',480,516);
      ctx.fillStyle=state.tuned===radioChannel?'#82e89a':'#e4c665';
      ctx.fillText(`AKTUELL ${state.tuned} · ZIEL ${radioChannel}`,480,540);
    }
  }

  function drawExplorer(){
    const p=state.player;
    const walking=state.target || state.keys.has('ArrowLeft') || state.keys.has('ArrowRight') || state.keys.has('ArrowUp') || state.keys.has('ArrowDown') || state.keys.has('w') || state.keys.has('a') || state.keys.has('s') || state.keys.has('d');
    const step=walking ? Math.sin(performance.now()/90)*2 : 0;

    ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));
    pixelRect(-15,24,30,8,'rgba(9,26,17,.24)');
    pixelRect(-12,10+step,9,15,'#3a3026');
    pixelRect(3,10-step,9,15,'#3a3026');
    pixelRect(-15,-14,30,29,'#d69a31');
    pixelRect(-18,-11,7,22,'#9b6c28');
    pixelRect(11,-11,7,22,'#9b6c28');
    pixelRect(-20,-10,5,18,'#31543b');

    // Clear face in the handheld-style explorer sprite.
    pixelRect(-10,-31,20,18,'#d7a47e');
    pixelRect(-12,-37,24,9,'#31523a');
    pixelRect(-8,-40,16,5,'#3d6143');
    pixelRect(-6,-24,4,4,'#18231c');
    pixelRect(3,-24,4,4,'#18231c');
    pixelRect(-2,-18,5,2,'#7a4939');

    pixelRect(-7,-13,14,4,'#e7c15a');
    pixelRect(9,-7,4,4,'#edf0d7');
    ctx.restore();
  }
  function drawJeepSprite(x,y,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);roundRect(-54,-28,108,56,17,'#e0a52e','#5b4a28');ctx.fillStyle='#315b42';ctx.fillRect(-24,-24,48,48);ctx.fillStyle='#17241d';for(const yy of[-31,31])for(const xx of[-36,36]){ctx.beginPath();ctx.arc(xx,yy,9,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#f1d47b';ctx.fillRect(-9,-8,18,16);ctx.fillStyle='#17241d';ctx.fillRect(-5,-3,3,3);ctx.fillRect(2,-3,3,3);ctx.restore()}
  function drawRetroBoat(x,y,t){
    const bob=Math.sin(t/120)*1.5;
    ctx.save();ctx.translate(Math.round(x),Math.round(y+bob));
    pixelRect(-35,-33,70,68,'#8a5f37');
    pixelRect(-29,-39,58,14,'#b07c42');
    pixelRect(-29,21,58,14,'#65452e');
    pixelRect(-24,-21,48,40,'#d1b166');
    pixelRect(-17,-14,34,28,'#2b4639');
    // Explorer face visible in boat.
    pixelRect(-8,-9,16,14,'#d7a47e');
    pixelRect(-10,-14,20,7,'#31523a');
    pixelRect(-5,-2,3,3,'#18231c');pixelRect(3,-2,3,3,'#18231c');
    ctx.restore();
  }

  function drawBoat(x,y){ drawRetroBoat(x,y,performance.now()); }

  function drawCameraOverlay(){
    ctx.save();
    ctx.fillStyle='rgba(4,12,8,.54)';ctx.fillRect(0,0,W,H);
    pixelRect(126,58,708,8,'#e7ead8');pixelRect(126,534,708,8,'#e7ead8');
    pixelRect(126,58,8,484,'#e7ead8');pixelRect(826,58,8,484,'#e7ead8');

    const rx=Math.round(state.reticle.x), ry=Math.round(state.reticle.y);
    ctx.strokeStyle='#f1edd6';ctx.lineWidth=3;ctx.strokeRect(rx-44,ry-34,88,68);
    pixelRect(rx-65,ry-2,42,4,'#f1edd6');pixelRect(rx+23,ry-2,42,4,'#f1edd6');
    pixelRect(rx-2,ry-55,4,34,'#f1edd6');pixelRect(rx-2,ry+21,4,34,'#f1edd6');

    drawRetroPanel(146,76,312,40,'KAMERA · SUCHER AUFS TIER');
    ctx.restore();
  }

  function loop(now)  function loop(now){
    const dt=Math.min(.033,(now-last)/1000);
    last=now;
    const anyDialog=[...document.querySelectorAll('dialog')].some(d=>d.open);
    if(!anyDialog) update(now,dt);
    else if($('winchDialog').open) updateWinch(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
  canvas.addEventListener('pointerdown',e=>{
    const p=canvasPoint(e);
    if(state.transitioning)return;
    if(state.gameMode==='camera'){state.reticle=p;return}
    if(state.gameMode!=='world')return;
    state.target=p;
  });
  canvas.addEventListener('pointermove',e=>{if(state.gameMode==='camera'&&e.buttons){state.reticle=canvasPoint(e)}});

  window.addEventListener('keydown',e=>{
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    if(document.querySelector('dialog[open]'))return;
    if(state.transitioning || state.gameMode==='transition' || state.gameMode==='modal' || state.gameMode==='won')return;

    if(key==='r' && recoverMechanic()){e.preventDefault();return}

    if(state.gameMode==='radio'){
      if(key==='Escape'){recoverMechanic('radio');e.preventDefault();return}
      if(key==='ArrowLeft'||key==='a'){state.tuned=Math.max(1,state.tuned-1);updateHud();e.preventDefault()}
      if(key==='ArrowRight'||key==='d'){state.tuned=Math.min(99,state.tuned+1);updateHud();e.preventDefault()}
      if(key==='Enter'||key==='e'){sendRadio();e.preventDefault()}
      return;
    }

    if(state.gameMode==='camera'){
      if(key==='Escape'){recoverMechanic('camera');e.preventDefault();return}
      if(key==='c'){takePhoto();e.preventDefault()}
      return;
    }

    if(['world','vehicle'].includes(state.gameMode) && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(key)){state.keys.add(key);e.preventDefault()}
    if(state.gameMode==='world' && (key==='e'||key==='Enter') && state.near){interact();e.preventDefault()}
    if(state.gameMode==='world' && key==='c' && state.scene==='wildlife'){takePhoto();e.preventDefault()}
  });
  window.addEventListener('keyup',e=>state.keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

  document.querySelectorAll('.dpad button').forEach(btn=>{
    const map={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};const key=map[btn.dataset.dir];
    const down=e=>{
      e.preventDefault();
      if(state.transitioning || ['transition','modal','won','camera'].includes(state.gameMode))return;
      if(state.gameMode==='radio'){
        if(key==='ArrowLeft')state.tuned=Math.max(1,state.tuned-1);
        if(key==='ArrowRight')state.tuned=Math.min(99,state.tuned+1);
        updateHud();
        return;
      }
      if(['world','vehicle'].includes(state.gameMode))state.keys.add(key);
    };
    const up=e=>{e.preventDefault();state.keys.delete(key)};
    btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
  });

  $('touchInteractBtn').addEventListener('click',()=>{if(state.gameMode==='radio')sendRadio();else if(state.gameMode==='world')interact()});
  $('cameraBtn').addEventListener('click',takePhoto);
  $('recoveryBtn').addEventListener('click',()=>recoverMechanic());
  $('learningForm').addEventListener('submit',checkLearning);
  $('hintBtn').addEventListener('click',()=>{const q=questions[state.activeQuestion];if(q){$('learningFeedback').className='feedback';$('learningFeedback').textContent=`Coco: ${state.learningMode==='transfer'?q.transfer.hint:q.hint}`}});
  $('winchPullBtn').addEventListener('click',pullWinch);
  $('winchResetBtn').addEventListener('click',()=>recoverMechanic('winch'));
  $('winchExitBtn').addEventListener('click',()=>exitMechanicDialog('winch','winchDialog'));
  $('generatorButtons').addEventListener('click',e=>{const b=e.target.closest('button[data-circuit]');if(b)chooseCircuit(b.dataset.circuit,b)});
  $('generatorResetBtn').addEventListener('click',()=>recoverMechanic('generator'));
  $('generatorExitBtn').addEventListener('click',()=>exitMechanicDialog('generator','generatorDialog'));
  document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{
    if(dialog.id==='victoryDialog')return;
    invalidateDelayedActions();
    if(dialog.id==='learningDialog'){
      endResolvingAction('learning');
      state.activeQuestion=null;
      state.selectedAnswer=null;
    }
    if(dialog.id==='winchDialog')endResolvingAction('winch');
    if(dialog.id==='generatorDialog')endResolvingAction('generator');
    if(state.gameMode==='modal')restoreSceneMode();
  }));
  $('restartBtn').addEventListener('click',()=>{const next=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;location.href=`?seed=${next}`});

  setCoco('Notruf aus dem Dschungel', 'Dr. Yara meldet sich nicht. Prüfe zuerst das Tablet links.');
  updateHud();requestAnimationFrame(loop);
})();
