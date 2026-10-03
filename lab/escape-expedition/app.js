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
      title: 'Route freischalten',
      prompt: `Der Jeep-Tank fasst ${q1Base} l. Für die Expedition sind noch 25 % Reserve eingeplant. Wie viele Liter sind das?`,
      options: q1Mc.options, correct: q1Mc.correct,
      hint: '25 % sind genau ein Viertel.',
      explanation: `${q1Base} ÷ 4 = ${q1Answer}.`,
      transfer: makeTransfer(25, pick([40, 60, 100, 140])),
      reward: 'jeepKey'
    },
    q2: {
      title: 'Wildtier-Sender prüfen',
      prompt: `Der Ortungssender hat ${q2Base} Wh. 30 % davon sind für die Nacht reserviert. Wie viele Wh sind das?`,
      options: q2Mc.options, correct: q2Mc.correct,
      hint: `10 % von ${q2Base} sind ${q2Base / 10}.`,
      explanation: `30 % sind drei 10-%-Schritte: 3 × ${q2Base / 10} = ${q2Answer}.`,
      transfer: makeTransfer(30, pick([20, 40, 60, 80])),
      reward: 'riverMap'
    },
    q3: {
      title: 'Stationscomputer starten',
      prompt: `Der Generator liefert maximal ${q3Base} W. Das Terminal benötigt 40 %. Wie viel Leistung sind das?`,
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
    return { prompt: `Neue Aufgabe: Wie viel sind ${percent} % von ${base}?`, options: choices.options, correct: choices.correct, hint: `${percent} % kannst du über 10-%-Schritte oder einen passenden Bruch berechnen.` };
  }

  const SCENES = {
    camp: { stage: 1, title: 'Expeditionscamp', mission: 'Starte die Suche', steps: ['Route prüfen', 'Jeep-Schlüssel holen', 'Mit MANGO-1 losfahren'] },
    jeep: { stage: 2, title: 'Dschungelpiste', mission: 'Durch den Dschungel', steps: ['Jeep auf der Piste halten', 'Bis zum Hindernis fahren', 'Weg freimachen'] },
    blocked: { stage: 2, title: 'Blockierter Pfad', mission: 'Der Baum muss weg', steps: ['Zum Baum gehen', 'Seilwinde ansetzen', 'Drei sichere Züge schaffen'] },
    wildlife: { stage: 3, title: 'Wildtierzone', mission: 'Dokumentiere die Tiere', steps: ['Tukan fotografieren', 'Capybara fotografieren', 'Ortungssender lösen', 'Boot erreichen'] },
    river: { stage: 4, title: 'Rio Verde', mission: 'Fluss zur Station', steps: ['Boot steuern', 'Felsen ausweichen', 'Forschungsstation erreichen'] },
    station: { stage: 5, title: 'Forschungsstation', mission: 'Strom und Funk reparieren', steps: ['Generator aktivieren', 'Stationscomputer starten', 'Funkkanal erhalten', 'Zum Sendemast'] },
    tower: { stage: 6, title: 'Funkmast', mission: 'Rettungssignal senden', steps: ['Funkkonsole aktivieren', `Kanal ${radioChannel} einstellen`, 'Signal senden'] }
  };

  const state = {
    scene: 'camp',
    player: { x: 470, y: 470, r: 16, speed: 215, facing: -Math.PI / 2 },
    keys: new Set(), target: null, near: null,
    items: new Set(['fieldBook']), solved: new Set(), attempts: { q1: 0, q2: 0, q3: 0 },
    activeQuestion: null, learningMode: 'main', selectedAnswer: null,
    winchHits: 0, winchValue: 0.08, winchDir: 1, winchTimer: 0,
    jeep: { x: 480, distance: 0, bumps: 0 },
    photos: new Set(), cameraMode: false, reticle: { x: 480, y: 300 },
    animals: [
      { id: 'toucan', emoji: '🦜', x: 700, y: 170, vx: 38, vy: 0, target: true },
      { id: 'capybara', emoji: '🦫', x: 280, y: 420, vx: 25, vy: -12, target: true },
      { id: 'monkey', emoji: '🐒', x: 520, y: 215, vx: -30, vy: 8, target: false }
    ],
    river: { x: 480, progress: 0, hits: 0 },
    generator: { seq: [], done: false },
    radioMode: false, tuned: 35,
    startTime: performance.now(), won: false, toastTimer: 0,
    sceneEntered: performance.now()
  };

  const inventoryInfo = {
    fieldBook: ['📗', 'Feldbuch'], jeepKey: ['🔑', 'Jeep-Schlüssel'], winch: ['🪝', 'Seilwinde'],
    photos: ['📷', 'Tierfotos'], riverMap: ['🗺️', 'Flusskarte'], radio: ['📻', `Kanal ${radioChannel}`]
  };

  const sceneDecor = Array.from({ length: 42 }, () => ({ x: 40 + rnd() * 880, y: 60 + rnd() * 500, s: .6 + rnd() * .8, type: rnd() > .55 ? 'leaf' : 'tree' }));
  let last = performance.now();

  function setCoco(title, text) { $('cocoTitle').textContent = title; $('cocoText').textContent = text; }
  function toast(text, seconds = 2.1) { $('toast').textContent = text; $('toast').hidden = false; state.toastTimer = seconds; }
  function clearMovement() { state.target = null; state.keys.clear(); }

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
  }

  function missionText() {
    switch (state.scene) {
      case 'camp': return 'Dr. Yaras Station ist seit dem Sturm stumm. Auf dem Routentablet liegt der Schlüsselcode.';
      case 'jeep': return 'MANGO-1 läuft. Die Piste ist eng, matschig und erstaunlich voller Steine.';
      case 'blocked': return 'Ein umgestürzter Baum versperrt den einzigen Weg. Gut, dass der Jeep eine Seilwinde hat.';
      case 'wildlife': return 'Dr. Yara wollte zwei Arten dokumentieren. Vielleicht hat sie Hinweise bei den Senderdaten hinterlassen.';
      case 'river': return 'Die Station liegt flussaufwärts. Nicht jeder Felsen möchte fotografiert werden.';
      case 'station': return 'Alles dunkel. Erst Generator, dann Terminal. Der rote Knopf bleibt unangetastet.';
      case 'tower': return `Der letzte Stationslog nennt Kanal ${radioChannel}. Stelle ihn ein und sende ein Signal.`;
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
    state.scene = name; state.sceneEntered = performance.now(); state.cameraMode = false; state.radioMode = false; clearMovement();
    if (spawn) { state.player.x = spawn.x; state.player.y = spawn.y; }
    else { state.player.x = 480; state.player.y = 470; }
    if (name === 'blocked') state.items.add('winch');
    if (name === 'wildlife') { state.player.x = 120; state.player.y = 470; setCoco('Kamera bereit', 'Die zwei Zielarten sind Tukan und Capybara. Geh nah genug heran und nutze die Kamera.'); }
    if (name === 'river') setCoco('Boot los!', 'Links/rechts steuern. Die Strömung trägt dich automatisch flussaufwärts.');
    if (name === 'station') { state.player.x = 480; state.player.y = 500; setCoco('Kein Strom', 'Der Generator links sieht reparierbar aus. Und nein: den großen roten Knopf drücken wir nicht.'); }
    if (name === 'tower') { state.player.x = 500; state.player.y = 490; setCoco('Fast geschafft', `Am Funkmast muss Kanal ${radioChannel} eingestellt werden.`); }
    updateHud();
  }

  function generalHotspots() {
    if (state.scene === 'camp') return [
      { id: 'tablet', x: 150, y: 150, r: 72, label: 'Routentablet prüfen' },
      { id: 'jeep', x: 760, y: 365, r: 88, label: 'In MANGO-1 einsteigen' }
    ];
    if (state.scene === 'blocked') return [{ id: 'tree', x: 690, y: 270, r: 105, label: 'Seilwinde ansetzen' }];
    if (state.scene === 'wildlife') return [
      { id: 'sender', x: 570, y: 120, r: 76, label: state.photos.size >= 2 ? 'Ortungssender auswerten' : 'Sender ist noch gesperrt' },
      { id: 'dock', x: 875, y: 455, r: 85, label: 'Zum Boot' }
    ];
    if (state.scene === 'station') return [
      { id: 'generator', x: 175, y: 360, r: 86, label: 'Generator öffnen' },
      { id: 'terminal', x: 710, y: 175, r: 78, label: state.generator.done ? 'Stationscomputer starten' : 'Terminal ohne Strom' },
      { id: 'towerGate', x: 870, y: 430, r: 78, label: 'Zum Funkmast' }
    ];
    if (state.scene === 'tower') return [{ id: 'radioConsole', x: 480, y: 160, r: 90, label: 'Funkkonsole bedienen' }];
    return [];
  }

  function interact() {
    if (!state.near || state.won) return;
    const id = state.near.id;
    if (state.scene === 'camp' && id === 'tablet') return openLearning('q1');
    if (state.scene === 'camp' && id === 'jeep') {
      if (!state.solved.has('q1')) return toast('Das Jeep-Terminal verlangt zuerst die freigeschaltete Route.');
      setCoco('MANGO-1 startet!', 'Lenke mit links/rechts. Die Piste übernimmt den Rest. Fast wie Autopilot, nur mit mehr Matsch.');
      return setScene('jeep');
    }
    if (state.scene === 'blocked' && id === 'tree') return openWinch();
    if (state.scene === 'wildlife' && id === 'sender') {
      if (state.photos.size < 2) return toast('Erst Tukan und Capybara dokumentieren.');
      return openLearning('q2');
    }
    if (state.scene === 'wildlife' && id === 'dock') {
      if (!state.solved.has('q2')) return toast('Die Flusskarte fehlt noch.');
      return setScene('river');
    }
    if (state.scene === 'station' && id === 'generator') return openGenerator();
    if (state.scene === 'station' && id === 'terminal') {
      if (!state.generator.done) return toast('Ohne Generator bleibt das Terminal schwarz.');
      return openLearning('q3');
    }
    if (state.scene === 'station' && id === 'towerGate') {
      if (!state.solved.has('q3')) return toast('Der Funkkanal fehlt noch.');
      return setScene('tower');
    }
    if (state.scene === 'tower' && id === 'radioConsole') {
      state.radioMode = true; state.tuned = 35; clearMovement();
      setCoco('Funkkonsole aktiv', `Stelle mit ←/→ den Kanal ein. Ziel laut Logbuch: ${radioChannel}. Mit E/Enter sendest du.`);
      return updateHud();
    }
  }

  function rewardQuestion(id) {
    state.solved.add(id);
    if (id === 'q1') { state.items.add('jeepKey'); setCoco('Route bestätigt', 'Schlüssel akzeptiert. MANGO-1 wartet rechts im Camp.'); }
    if (id === 'q2') { state.items.add('riverMap'); setCoco('Flusskarte gefunden', 'Der Sender enthält Dr. Yaras letzte Route. Das Boot liegt am rechten Rand.'); }
    if (id === 'q3') { state.items.add('radio'); setCoco('Funkkanal entschlüsselt', `Stationslog: Rettungskanal ${radioChannel}. Ab zum Sendemast!`); }
    updateHud();
  }

  function openLearning(id) {
    if (state.solved.has(id)) return toast('Dieses Lern-Gate ist bereits gelöst.');
    state.activeQuestion = id; state.learningMode = 'main'; state.selectedAnswer = null;
    renderLearning(); $('learningDialog').showModal(); setTimeout(() => $('learningDialog').focus(), 50);
  }

  function renderLearning() {
    const q = questions[state.activeQuestion];
    const data = state.learningMode === 'main' ? q : q.transfer;
    $('learningTitle').textContent = state.learningMode === 'main' ? q.title : 'Neue Aufgabe zum selben Prinzip';
    $('learningPrompt').textContent = data.prompt;
    $('learningOptions').innerHTML = '';
    data.options.forEach((opt, i) => {
      const label = document.createElement('label'); label.className = 'answer-option';
      label.innerHTML = `<input type="radio" name="learningAnswer" value="${i}"><span>${opt}</span>`;
      label.addEventListener('click', () => { state.selectedAnswer = i; [...$('learningOptions').children].forEach(x => x.classList.remove('selected')); label.classList.add('selected'); });
      $('learningOptions').append(label);
    });
    $('learningFeedback').className = 'feedback';
    $('learningFeedback').textContent = state.learningMode === 'main' ? 'Wähle eine Antwort.' : 'Transfercheck: Erst diese neue Aufgabe schaltet den Fortschritt frei.';
  }

  function checkLearning(e) {
    e.preventDefault();
    const id = state.activeQuestion; const q = questions[id]; const data = state.learningMode === 'main' ? q : q.transfer;
    if (state.selectedAnswer === null) { $('learningFeedback').textContent = 'Wähle zuerst eine Antwort.'; return; }
    if (state.selectedAnswer !== data.correct) {
      $('learningFeedback').className = 'feedback error';
      if (state.learningMode === 'transfer') { $('learningFeedback').textContent = `Noch nicht. ${q.transfer.hint}`; return; }
      state.attempts[id]++;
      $('learningFeedback').textContent = state.attempts[id] === 1 ? `Noch nicht. Coco: ${q.hint}` : `Noch nicht sicher. ${q.explanation} Jetzt folgt eine neue Aufgabe zum selben Prinzip.`;
      if (state.attempts[id] >= 2) setTimeout(() => { state.learningMode = 'transfer'; state.selectedAnswer = null; renderLearning(); }, 850);
      return;
    }
    if (state.learningMode === 'main' && state.attempts[id] > 0) {
      $('learningFeedback').className = 'feedback success'; $('learningFeedback').textContent = `Richtig. Weil du vorher einen Fehlversuch hattest, folgt noch ein Transfercheck.`;
      return setTimeout(() => { state.learningMode = 'transfer'; state.selectedAnswer = null; renderLearning(); }, 650);
    }
    $('learningFeedback').className = 'feedback success'; $('learningFeedback').textContent = 'Richtig – Fortschritt freigeschaltet.';
    setTimeout(() => { $('learningDialog').close(); rewardQuestion(id); state.activeQuestion = null; }, 500);
  }

  function openWinch() {
    state.winchValue = .08; state.winchDir = 1; $('winchStatus').textContent = `${state.winchHits} / 3 sichere Züge`;
    $('winchDialog').showModal();
  }
  function pullWinch() {
    if (state.winchValue >= .38 && state.winchValue <= .62) {
      state.winchHits++; $('winchStatus').textContent = `${state.winchHits} / 3 sichere Züge`; toast('Sauberer Zug! Der Stamm bewegt sich.');
      if (state.winchHits >= 3) setTimeout(() => { $('winchDialog').close(); setCoco('Weg frei!', 'Das war überraschend professionell. Weiter zu Fuß – hier wird die Piste zu eng.'); setScene('wildlife'); }, 650);
    } else {
      state.winchHits = Math.max(0, state.winchHits - 1); $('winchStatus').textContent = `${state.winchHits} / 3 sichere Züge`; toast('Zu viel oder zu wenig Spannung. Versuch den grünen Bereich.');
    }
  }

  function openGenerator() { $('generatorDialog').showModal(); }
  function chooseCircuit(name, button) {
    if (state.generator.done) return;
    const order = ['leaf', 'sun', 'river'];
    const expected = order[state.generator.seq.length];
    if (name === expected) {
      state.generator.seq.push(name); button.classList.add('active');
      $('generatorFeedback').className = 'feedback success'; $('generatorFeedback').textContent = `Kreis ${state.generator.seq.length}/3 aktiv.`;
      if (state.generator.seq.length === 3) {
        state.generator.done = true; setCoco('Strom ist da!', 'Die Station erwacht. Das Terminal rechts oben sollte jetzt reagieren.');
        setTimeout(() => $('generatorDialog').close(), 650); updateHud();
      }
    } else {
      state.generator.seq = []; document.querySelectorAll('#generatorButtons button').forEach(b => b.classList.remove('active'));
      $('generatorFeedback').className = 'feedback error'; $('generatorFeedback').textContent = 'Sicherung raus. Nochmal: 🌿 → ☀️ → 🌊';
    }
  }

  function takePhoto() {
    if (state.scene !== 'wildlife') return;
    if (!state.cameraMode) { state.cameraMode = true; state.reticle = { x: state.player.x + 110, y: state.player.y - 40 }; clearMovement(); setCoco('Kameramodus', 'Bewege den Sucher mit Maus/Finger auf ein Tier und drücke nochmal auf Kamera.'); updateHud(); return; }
    let best = null; let dist = 999;
    for (const a of state.animals) {
      const d = Math.hypot(a.x - state.reticle.x, a.y - state.reticle.y);
      if (d < dist) { dist = d; best = a; }
    }
    flashScreen();
    if (best && dist < 58 && best.target) {
      if (!state.photos.has(best.id)) { state.photos.add(best.id); toast(best.id === 'toucan' ? '🦜 Tukan dokumentiert!' : '🦫 Capybara dokumentiert!'); }
      else toast('Dieses Tier hast du schon. Es posiert trotzdem gern.');
      if (state.photos.size >= 2) { state.items.add('photos'); setCoco('Beide Fotos im Feldbuch', 'Jetzt kannst du den Ortungssender oben im Dschungel auswerten.'); }
    } else if (best && dist < 58) toast('🐒 Tolles Foto – aber Dr. Yara sucht Tukan und Capybara.');
    else toast('Nur Blätter. Sehr seltene Blätter, bestimmt.');
    updateHud();
  }

  function flashScreen() {
    canvas.classList.add('flash'); setTimeout(() => canvas.classList.remove('flash'), 90);
  }

  function sendRadio() {
    if (!state.radioMode) return;
    if (state.tuned !== radioChannel) { toast(`Nur Rauschen auf Kanal ${state.tuned}.`); return; }
    state.won = true; updateHud();
    setCoco('Antwort!', 'Dr. Yara meldet sich: „Mir geht’s gut! Ein Capybara hat den Stationsschlüssel geklaut. Lange Geschichte.“');
    const sec = Math.round((performance.now() - state.startTime) / 1000);
    $('victoryText').textContent = 'Dr. Yara ist sicher, der Funk läuft wieder und das Capybara behält den Schlüssel vorerst. Forschungsergebnis: Tiere lesen keine Hausordnung.';
    $('victoryStats').innerHTML = `<span>🧠 ${state.solved.size}/3 Lern-Gates</span><span>📷 ${state.photos.size}/2 Zielfotos</span><span>🚙 ${state.jeep.bumps} Rempler</span><span>🚤 ${state.river.hits} Felskontakte</span><span>⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</span>`;
    setTimeout(() => $('victoryDialog').showModal(), 700);
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
    state.near = nearest; renderInteraction();
  }

  function updateJeep(dt) {
    let steer = 0; if (state.keys.has('ArrowLeft') || state.keys.has('a')) steer--; if (state.keys.has('ArrowRight') || state.keys.has('d')) steer++;
    state.jeep.x = Math.max(320, Math.min(640, state.jeep.x + steer * 250 * dt));
    state.jeep.distance += 58 * dt * (state.keys.has('ArrowUp') || state.keys.has('w') ? 1.25 : 1);
    const obstaclePhase = state.jeep.distance % 180;
    const obstacleX = 400 + Math.sin(Math.floor(state.jeep.distance / 180) * 2.7) * 140;
    if (obstaclePhase > 145 && obstaclePhase < 151 && Math.abs(state.jeep.x - obstacleX) < 58) { state.jeep.bumps++; state.jeep.distance -= 20; toast('💦 Matschloch! MANGO-1 nennt das „Geländekomfort“.', 1.1); }
    if (state.jeep.distance >= 850) { state.jeep.distance = 850; setScene('blocked', { x: 300, y: 430 }); setCoco('Straße zu', 'Ein Baum liegt quer. Rechts daneben ist genug Platz für die Seilwinde.'); }
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
    state.river.x = Math.max(270, Math.min(690, state.river.x + steer * 260 * dt));
    state.river.progress += 66 * dt * (state.keys.has('ArrowUp') || state.keys.has('w') ? 1.2 : 1);
    const phase = state.river.progress % 160; const rockX = 480 + Math.sin(Math.floor(state.river.progress / 160) * 3.1) * 175;
    if (phase > 130 && phase < 136 && Math.abs(state.river.x - rockX) < 52) { state.river.hits++; state.river.progress -= 18; toast('🪨 BONK. Das war ein Felsen.', 1.0); }
    if (state.river.progress >= 950) { state.river.progress = 950; setScene('station'); }
  }

  function updateRadioControls() {
    if (!state.radioMode) return false;
    return true;
  }

  function update(now, dt) {
    if (state.toastTimer > 0) { state.toastTimer -= dt; if (state.toastTimer <= 0) $('toast').hidden = true; }
    if (state.scene === 'jeep') updateJeep(dt);
    else if (state.scene === 'river') updateRiver(dt);
    else { updateGeneral(dt); if (state.scene === 'wildlife') updateAnimals(dt); }
    if ($('winchDialog').open) { state.winchValue += state.winchDir * dt * .62; if (state.winchValue >= .94) { state.winchValue = .94; state.winchDir = -1; } if (state.winchValue <= .06) { state.winchValue = .06; state.winchDir = 1; } $('winchNeedle').style.left = `${state.winchValue * 100}%`; }
    $('timeBadge').textContent = formatTime((now - state.startTime) / 1000);
    updateHud();
  }

  function formatTime(sec) { sec = Math.floor(sec); return `⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }

  function renderInteraction() {
    const p = $('interactionPrompt'), b = $('touchInteractBtn');
    if (!state.near || state.cameraMode || state.radioMode || state.scene === 'jeep' || state.scene === 'river') { p.hidden = true; b.disabled = true; b.textContent = '✋ Interagieren'; return; }
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

  function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;const anyDialog=[...document.querySelectorAll('dialog')].some(d=>d.open);if(!anyDialog)update(now,dt);else if($('winchDialog').open)update(now,dt);draw();requestAnimationFrame(loop)}

  function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
  canvas.addEventListener('pointerdown',e=>{const p=canvasPoint(e);if(state.cameraMode){state.reticle=p;return}if(['jeep','river'].includes(state.scene)||state.radioMode)return;state.target=p});
  canvas.addEventListener('pointermove',e=>{if(state.cameraMode&&e.buttons){state.reticle=canvasPoint(e)}});

  window.addEventListener('keydown',e=>{
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    if(document.querySelector('dialog[open]'))return;
    if(state.radioMode){if(key==='ArrowLeft'||key==='a'){state.tuned=Math.max(1,state.tuned-1);e.preventDefault()}if(key==='ArrowRight'||key==='d'){state.tuned=Math.min(99,state.tuned+1);e.preventDefault()}if(key==='Enter'||key==='e'){sendRadio();e.preventDefault()}return}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(key)){state.keys.add(key);e.preventDefault()}
    if((key==='e'||key==='Enter')&&state.near){interact();e.preventDefault()}
    if(key==='c'&&state.scene==='wildlife'){takePhoto();e.preventDefault()}
    if(key==='Escape'&&state.cameraMode){state.cameraMode=false;updateHud()}
  });
  window.addEventListener('keyup',e=>state.keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

  document.querySelectorAll('.dpad button').forEach(btn=>{
    const map={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};const key=map[btn.dataset.dir];
    const down=e=>{e.preventDefault();if(state.radioMode){if(key==='ArrowLeft')state.tuned=Math.max(1,state.tuned-1);if(key==='ArrowRight')state.tuned=Math.min(99,state.tuned+1);return}state.keys.add(key)};
    const up=e=>{e.preventDefault();state.keys.delete(key)};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
  });

  $('touchInteractBtn').addEventListener('click',()=>state.radioMode?sendRadio():interact());
  $('cameraBtn').addEventListener('click',takePhoto);
  $('learningForm').addEventListener('submit',checkLearning);
  $('hintBtn').addEventListener('click',()=>{const q=questions[state.activeQuestion];if(q){$('learningFeedback').className='feedback';$('learningFeedback').textContent=`Coco: ${state.learningMode==='transfer'?q.transfer.hint:q.hint}`}});
  $('winchPullBtn').addEventListener('click',pullWinch);
  $('generatorButtons').addEventListener('click',e=>{const b=e.target.closest('button[data-circuit]');if(b)chooseCircuit(b.dataset.circuit,b)});
  document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.close).close()));
  $('restartBtn').addEventListener('click',()=>{const next=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;location.href=`?seed=${next}`});

  setCoco('Notruf aus dem Dschungel', 'Dr. Yaras Forschungsstation ist seit dem Sturm offline. Prüfe zuerst das Routentablet links.');
  updateHud();requestAnimationFrame(loop);
})();
