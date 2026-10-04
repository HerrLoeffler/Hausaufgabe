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
    jeep: { x: 480, distance: 0, bumps: 0, safeDistance: 0 },
    photos: new Set(), cameraMode: false, reticle: { x: 480, y: 300 },
    animals: [
      { id: 'toucan', emoji: '🦜', x: 700, y: 170, vx: 38, vy: 0, target: true },
      { id: 'capybara', emoji: '🦫', x: 280, y: 420, vx: 25, vy: -12, target: true },
      { id: 'monkey', emoji: '🐒', x: 520, y: 215, vx: -30, vy: 8, target: false }
    ],
    river: { x: 480, progress: 0, hits: 0, safeProgress: 0 },
    generator: { seq: [], done: false },
    radioMode: false, tuned: 35,
    startTime: performance.now(), won: false, toastTimer: 0,
    sceneEntered: performance.now(),
    gameMode: 'world', transitioning: false, sceneEpoch: 0, actionEpoch: 0,
    resolvingAction: null
  };

  const inventoryInfo = {
    fieldBook: ['📗', 'Feldbuch'], jeepKey: ['🔑', 'Jeep-Schlüssel'], winch: ['🪝', 'Seilwinde'],
    photos: ['📷', 'Tierfotos'], riverMap: ['🗺️', 'Flusskarte'], radio: ['📻', `Kanal ${radioChannel}`]
  };

  const sceneDecor = Array.from({ length: 42 }, () => ({ x: 40 + rnd() * 880, y: 60 + rnd() * 500, s: .6 + rnd() * .8, type: rnd() > .55 ? 'leaf' : 'tree' }));
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
    if (state.won || state.transitioning) return null;
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
      setCoco('MANGO-1 startet!', 'Lenke links oder rechts. Der Jeep fährt automatisch.');
      return setScene('jeep');
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
    let steer = 0; if (state.keys.has('ArrowLeft') || state.keys.has('a')) steer--; if (state.keys.has('ArrowRight') || state.keys.has('d')) steer++;
    const previousDistance = state.jeep.distance;
    state.jeep.x = Math.max(320, Math.min(640, state.jeep.x + steer * 250 * dt));
    state.jeep.distance += 58 * dt * (state.keys.has('ArrowUp') || state.keys.has('w') ? 1.25 : 1);
    const jeepCheckpoint = Math.floor(state.jeep.distance / 180) * 180;
    if (jeepCheckpoint > state.jeep.safeDistance && state.jeep.distance % 180 < 40) state.jeep.safeDistance = jeepCheckpoint;
    if (previousDistance <= 80 && state.jeep.distance > 80) updateHud();
    const obstaclePhase = state.jeep.distance % 180;
    const obstacleX = 400 + Math.sin(Math.floor(state.jeep.distance / 180) * 2.7) * 140;
    if (obstaclePhase > 145 && obstaclePhase < 151 && Math.abs(state.jeep.x - obstacleX) < 58) { state.jeep.bumps++; state.jeep.distance -= 20; toast('💦 Matschloch! Weiter geht’s.', 1.1); }
    if (state.jeep.distance >= 850) { state.jeep.distance = 850; setScene('blocked', { x: 300, y: 430 }); setCoco('Baum im Weg', 'Geh zur Seilwinde.'); }
  }

  function updateAnimals(dt) {
    for (const a of state.animals) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 180 || a.x > 820) a.vx *= -1;
      if (a.y < 130 || a.y > 470) a.vy *= -1;
    }
  }

  function updateRiver(dt) {
    let steer = 0; if (state.keys.has('ArrowLeft') || state.keys.has('a')) steer--; if (state.keys.has('ArrowRight') || state.keys.has('d')) steer++;
    const previousProgress = state.river.progress;
    state.river.x = Math.max(270, Math.min(690, state.river.x + steer * 260 * dt));
    state.river.progress += 66 * dt * (state.keys.has('ArrowUp') || state.keys.has('w') ? 1.2 : 1);
    const riverCheckpoint = Math.floor(state.river.progress / 180) * 180;
    if (riverCheckpoint > state.river.safeProgress && state.river.progress % 180 < 40) state.river.safeProgress = riverCheckpoint;
    if (previousProgress <= 50 && state.river.progress > 50) updateHud();
    const phase = state.river.progress % 160; const rockX = 480 + Math.sin(Math.floor(state.river.progress / 160) * 3.1) * 175;
    if (phase > 130 && phase < 136 && Math.abs(state.river.x - rockX) < 52) { state.river.hits++; state.river.progress -= 18; toast('🪨 Felsen getroffen!', 1.0); updateHud(); }
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
    if (state.cameraMode) drawCameraOverlay();
  }

  function fillGradient(top, bottom) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function roundRect(x,y,w,h,r,fill,stroke=null){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
  function drawTree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#3e2b19';ctx.fillRect(-7,0,14,58);ctx.fillStyle='#18562f';for(const [dx,dy,r] of [[0,-14,34],[-26,2,25],[27,4,27],[0,16,29]]){ctx.beginPath();ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function drawBush(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#236d39';for(const [dx,dy,r] of [[0,0,19],[-17,7,14],[18,8,16],[4,13,18]]){ctx.beginPath();ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function drawJungleDecor(alpha=1){ctx.save();ctx.globalAlpha=alpha;for(const d of sceneDecor){if(d.type==='tree')drawTree(d.x,d.y,d.s);else drawBush(d.x,d.y,d.s)}ctx.restore()}
  function marker(x,y,label){const pulse=.6+Math.sin(performance.now()/300+x)*.15;ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.fillStyle=`rgba(115,229,139,${pulse})`;ctx.fill();ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#07160e';ctx.fillText(label,x,y+4)}

  function drawCamp(){
    fillGradient('#4a9561','#204e35'); drawJungleDecor(.55); ctx.fillStyle='#8d6338';ctx.beginPath();ctx.ellipse(480,420,390,145,0,0,Math.PI*2);ctx.fill();
    roundRect(70,80,230,145,18,'#d9c58a','#6c5730');ctx.fillStyle='#395b43';ctx.fillRect(85,100,200,85);ctx.font='900 18px system-ui';ctx.fillStyle='#f5ebcc';ctx.textAlign='center';ctx.fillText('EXPEDITIONSKARTE',185,128);ctx.font='24px system-ui';ctx.fillText('🗺️  →  🌴  →  📡',185,175);marker(150,150,'?');
    drawJeepSprite(760,365,0); marker(760,330,'E');
    ctx.font='900 18px system-ui';ctx.fillStyle='#f7edcf';ctx.fillText('MANGO-1',760,430);
    ctx.fillStyle='#f0d56d';ctx.beginPath();ctx.arc(635,115,42,0,Math.PI*2);ctx.fill();ctx.font='28px system-ui';ctx.fillText('🦜',635,124);
  }

  function drawJeep(){
    fillGradient('#2f7044','#163b27');
    ctx.fillStyle='#a87943';ctx.fillRect(285,0,390,H);ctx.fillStyle='#7c5b36';for(let y=(state.jeep.distance*2)%80-80;y<H;y+=80)ctx.fillRect(470,y,20,42);
    for(let y=50;y<H;y+=115){drawBush(245,y,1.1);drawBush(715,y+35,.9)}
    const phase=state.jeep.distance%180;const obstacleY=H-(phase/180)*H;const obstacleX=400+Math.sin(Math.floor(state.jeep.distance/180)*2.7)*140;ctx.font='42px system-ui';ctx.textAlign='center';ctx.fillText('🪨',obstacleX,obstacleY);
    drawJeepSprite(state.jeep.x,430,-Math.PI/2);
    ctx.fillStyle='rgba(5,18,10,.75)';roundRect(350,20,260,48,16,'rgba(5,18,10,.78)','#508461');ctx.fillStyle='#e9f5e9';ctx.font='900 16px system-ui';ctx.fillText(`Piste ${Math.floor(state.jeep.distance)} / 850 m`,480,50);
  }

  function drawBlocked(){
    fillGradient('#3c8650','#1d4a30');drawJungleDecor(.55);ctx.fillStyle='#8a6037';ctx.beginPath();ctx.ellipse(480,430,390,120,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(690,270);ctx.rotate(-.22);ctx.fillStyle='#6c4324';roundRect(-145,-20,290,40,18,'#6c4324');for(let x=-125;x<130;x+=42){ctx.fillStyle='#245e32';ctx.beginPath();ctx.arc(x,-28,25,0,Math.PI*2);ctx.fill()}ctx.restore();marker(690,340,'E');
    drawJeepSprite(190,400,0);ctx.strokeStyle='#d7b77a';ctx.lineWidth=4;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(255,390);ctx.lineTo(610,320);ctx.stroke();ctx.setLineDash([]);
  }

  function drawWildlife(){
    fillGradient('#3f9456','#183f2b');drawJungleDecor(.78);ctx.fillStyle='#9a7245';ctx.beginPath();ctx.moveTo(60,520);ctx.quadraticCurveTo(400,350,900,500);ctx.lineTo(900,590);ctx.lineTo(60,590);ctx.closePath();ctx.fill();
    roundRect(520,70,110,92,14,'#33423a','#7da88b');ctx.fillStyle='#9ee8ad';ctx.fillRect(540,88,70,42);ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('📡',575,118);marker(575,175,state.photos.size>=2?'E':'🔒');
    roundRect(830,410,100,120,10,'#6a4a2d','#c3925c');ctx.fillStyle='#6ec4d9';ctx.fillRect(838,435,84,80);marker(875,390,'E');
    for(const a of state.animals){ctx.font=`${a.id==='capybara'?44:38}px system-ui`;ctx.textAlign='center';ctx.fillText(a.emoji,a.x,a.y);if(state.photos.has(a.id)&&a.target){ctx.font='18px system-ui';ctx.fillText('✓',a.x+25,a.y-25)}}
  }

  function drawRiver(){
    fillGradient('#245b38','#123523');ctx.fillStyle='#2e8cab';ctx.beginPath();ctx.moveTo(230,0);ctx.bezierCurveTo(370,170,210,330,280,600);ctx.lineTo(710,600);ctx.bezierCurveTo(790,360,620,170,730,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(210,245,255,.22)';ctx.lineWidth=3;for(let y=((state.river.progress*2)%95)-95;y<H;y+=95){ctx.beginPath();ctx.moveTo(330,y);ctx.quadraticCurveTo(470,y+20,630,y);ctx.stroke()}
    for(let y=60;y<H;y+=110){drawBush(170,y,.9);drawBush(800,y+40,1.0)}
    const phase=state.river.progress%160;const rockY=H-(phase/160)*H;const rockX=480+Math.sin(Math.floor(state.river.progress/160)*3.1)*175;ctx.font='44px system-ui';ctx.textAlign='center';ctx.fillText('🪨',rockX,rockY);
    drawBoat(state.river.x,455);roundRect(350,20,260,48,16,'rgba(5,18,10,.78)','#69b2c0');ctx.fillStyle='#e9f7f7';ctx.font='900 16px system-ui';ctx.fillText(`Fluss ${Math.floor(state.river.progress)} / 950 m`,480,50);
  }

  function drawStation(){
    fillGradient(state.generator.done?'#497b5d':'#22382b',state.generator.done?'#213f2f':'#101c15');drawJungleDecor(.35);
    roundRect(310,75,500,350,24,state.generator.done?'#c3b58d':'#5c5a4d','#e1d3a7');ctx.fillStyle=state.generator.done?'#8bc8a0':'#273329';ctx.fillRect(345,110,190,100);ctx.fillRect(575,110,190,100);ctx.fillStyle='#294034';ctx.fillRect(515,335,90,90);
    roundRect(95,290,160,150,18,'#5e5138','#ad9a69');ctx.font='40px system-ui';ctx.textAlign='center';ctx.fillText('⚡',175,360);marker(175,455,'E');
    roundRect(650,110,120,80,12,state.generator.done?'#173a2a':'#151a17',state.generator.done?'#7bd78f':'#444');ctx.font='32px system-ui';ctx.fillText(state.generator.done?'💻':'⬛',710,160);marker(710,220,state.generator.done?'E':'🔒');
    ctx.fillStyle='#bd3d36';ctx.beginPath();ctx.arc(430,300,15,0,Math.PI*2);ctx.fill();ctx.font='900 12px system-ui';ctx.fillStyle='#efe2c4';ctx.fillText('NICHT DRÜCKEN',430,330);
    roundRect(830,355,80,150,10,'#33483b','#738e7a');marker(870,335,state.solved.has('q3')?'E':'🔒');
  }

  function drawTower(){
    fillGradient('#172b27','#071713');ctx.fillStyle='#14351f';for(let x=0;x<W;x+=90)drawTree(x+30,470+(x%180?20:0),.9);
    ctx.strokeStyle='#8ba69a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(480,440);ctx.lineTo(480,80);ctx.stroke();ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(480,80);ctx.lineTo(360,440);ctx.moveTo(480,80);ctx.lineTo(600,440);ctx.moveTo(390,340);ctx.lineTo(570,340);ctx.moveTo(420,250);ctx.lineTo(540,250);ctx.moveTo(450,160);ctx.lineTo(510,160);ctx.stroke();
    ctx.fillStyle='#db5647';ctx.beginPath();ctx.arc(480,68,10,0,Math.PI*2);ctx.fill();
    roundRect(390,110,180,100,16,'#1e332c','#7fa694');ctx.fillStyle='#89e4a0';ctx.font='900 30px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(`CH ${state.tuned}`,480,164);marker(480,225,'E');
    if(state.radioMode){roundRect(260,470,440,82,18,'rgba(4,15,10,.88)','#5b8b6c');ctx.fillStyle='#dcecdf';ctx.font='800 15px system-ui';ctx.fillText('← / → Kanal ändern · E / Enter Signal senden',480,500);ctx.font='900 22px system-ui';ctx.fillStyle=state.tuned===radioChannel?'#78e293':'#f0d271';ctx.fillText(`Aktuell ${state.tuned} · Ziel ${radioChannel}`,480,532)}
  }

  function drawExplorer(){
    const p=state.player;ctx.save();ctx.translate(p.x,p.y);ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=10;ctx.shadowOffsetY=5;ctx.beginPath();ctx.ellipse(0,8,15,20,0,0,Math.PI*2);ctx.fillStyle='#e6a938';ctx.fill();ctx.shadowColor='transparent';ctx.beginPath();ctx.arc(0,-12,12,0,Math.PI*2);ctx.fillStyle='#f0c5a0';ctx.fill();ctx.fillStyle='#315a3f';ctx.beginPath();ctx.arc(0,-17,13,Math.PI,0);ctx.fill();ctx.rotate(p.facing);ctx.fillStyle='#f7e5a9';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(7,-4);ctx.lineTo(7,4);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawJeepSprite(x,y,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);roundRect(-54,-28,108,56,17,'#e0a52e','#5b4a28');ctx.fillStyle='#315b42';ctx.fillRect(-24,-24,48,48);ctx.fillStyle='#17241d';for(const yy of[-31,31])for(const xx of[-36,36]){ctx.beginPath();ctx.arc(xx,yy,9,0,Math.PI*2);ctx.fill()}ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText('🥭',0,7);ctx.restore()}
  function drawBoat(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#a36f3c';ctx.beginPath();ctx.moveTo(-44,-20);ctx.lineTo(44,-20);ctx.lineTo(30,30);ctx.lineTo(-30,30);ctx.closePath();ctx.fill();ctx.fillStyle='#f2d170';ctx.fillRect(-5,-45,10,45);ctx.fillStyle='#f3eee0';ctx.beginPath();ctx.moveTo(5,-43);ctx.lineTo(40,-15);ctx.lineTo(5,-15);ctx.closePath();ctx.fill();ctx.font='22px system-ui';ctx.textAlign='center';ctx.fillText('🐧',0,16);ctx.restore()}
  function drawCameraOverlay(){ctx.save();ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#f3f5e7';ctx.lineWidth=3;ctx.strokeRect(160,80,640,440);ctx.beginPath();ctx.arc(state.reticle.x,state.reticle.y,45,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(state.reticle.x-65,state.reticle.y);ctx.lineTo(state.reticle.x+65,state.reticle.y);ctx.moveTo(state.reticle.x,state.reticle.y-65);ctx.lineTo(state.reticle.x,state.reticle.y+65);ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 15px system-ui';ctx.textAlign='left';ctx.fillText('KAMERAMODUS · Sucher bewegen · Kamera = Auslösen',175,110);ctx.restore()}

  function loop(now){
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
