(() => {
  'use strict';

  const ROOM_PREFIX = 'gradecrew-fastquiz-room-v3:';
  const BEST_PREFIX = 'gradecrew-fastquiz-best-v3:';
  const { createEngine, OP_SYMBOL, DOMAIN_LABEL, LEVEL_LABEL } = window.FastQuizMath;

  const ids = [
    'homeView','setupView','joinView','teacherRoomView','waitingView','quizView','resultView','setupForm','setupEyebrow','setupTitle','setupSubtitle',
    'teacherOnlyRules','rulesHint','level','wrongPenalty','lockSeconds','speedBonus','streakBonus','allowNegative','showSolution','leaderboardMode','roundMode','scoreRulePreview','formError','setupSubmit',
    'joinCode','joinName','joinError','joinBtn','teacherRoundSummary','teacherRoomCode','copyJoinLinkBtn','playerCount','roomStatusBadge','playerList','teacherRuleSummary','teacherStartBtn','teacherResetBtn','teacherLeaderboardWrap','teacherLeaderboard',
    'waitingName','waitingCode','countdown','activeRoundLabel','activePlayerLabel','activeRoundCode','timerFill','timer','correctCount','streakCount','scoreCount','questionNumber','questionMeta','questionTitle','answers','penaltyLock','penaltyLockTime','feedback',
    'resultSummary','resultCorrect','resultAccuracy','resultStreak','resultScore','personalBestCard','personalBest','personalBestNote','playerLeaderboardWrap','playerLeaderboard','sameRoundBtn','newRoundBtn','homeBtn','resultActionText','sessionDump'
  ];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  const state = {
    setupMode: 'solo', role: 'solo', roomCode: null, playerId: null, playerName: '', config: null, seed: 0,
    engine: null, startedAt: 0, endsAt: 0, timerId: null, lockTimerId: null, teacherTimerId: null,
    questionStartedAt: 0, questionIndex: 0, currentQuestion: null, locked: false, finished: false,
    correct: 0, total: 0, streak: 0, bestStreak: 0, score: 0, events: [], breakdown: {}
  };

  function randSeed() {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1); crypto.getRandomValues(values); return values[0];
    }
    return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
  }

  function randomCode() {
    for (let i = 0; i < 20; i += 1) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      if (!readRoom(code)) return code;
    }
    return String(Date.now()).slice(-6);
  }

  function roomKey(code) { return `${ROOM_PREFIX}${code}`; }
  function readRoom(code) {
    try { return JSON.parse(localStorage.getItem(roomKey(code)) || 'null'); }
    catch { return null; }
  }
  function writeRoom(room) {
    room.updatedAt = Date.now();
    localStorage.setItem(roomKey(room.code), JSON.stringify(room));
    handleRoomUpdate(room);
  }

  function showView(target) {
    for (const view of [el.homeView, el.setupView, el.joinView, el.teacherRoomView, el.waitingView, el.quizView, el.resultView]) view.hidden = view !== target;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function checkedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  }

  function selectedDuration() {
    return Number(document.querySelector('input[name="duration"]:checked')?.value || 3);
  }

  function gatherConfig() {
    const operations = checkedValues('operation');
    const domains = checkedValues('domain');
    if (!operations.length) throw new Error('Bitte mindestens eine Grundrechenart auswählen.');
    if (!domains.length) throw new Error('Bitte mindestens einen Zahlenbereich auswählen.');
    return {
      version: 3,
      operations,
      domains,
      level: el.level.value,
      durationSec: selectedDuration() * 60,
      scoring: {
        correctPoints: 100,
        wrongPenalty: Number(el.wrongPenalty.value),
        lockSeconds: Number(el.lockSeconds.value),
        speedBonus: el.speedBonus.checked,
        streakBonus: el.streakBonus.checked,
        allowNegative: el.allowNegative.checked,
        showSolution: el.showSolution.checked
      },
      leaderboardMode: state.setupMode === 'teacher' ? el.leaderboardMode.value : 'hidden',
      roundMode: state.setupMode === 'teacher' ? el.roundMode.value : 'solo'
    };
  }

  function configSummary(config) {
    const ops = config.operations.map(op => OP_SYMBOL[op]).join(' ');
    const domains = config.domains.map(d => DOMAIN_LABEL[d]).join(', ');
    return `${ops} · ${domains} · ${LEVEL_LABEL[config.level]} · ${Math.round(config.durationSec / 60)} min`;
  }

  function ruleSummary(config) {
    const s = config.scoring;
    return `+${s.correctPoints} richtig · ${s.wrongPenalty ? `−${s.wrongPenalty} falsch` : 'keine Minuspunkte'} · ${s.lockSeconds ? `${s.lockSeconds} s Sperre` : 'keine Sperre'}${s.speedBonus ? ' · Zeitbonus' : ''}${s.streakBonus ? ' · Serienbonus' : ''}`;
  }

  function updateRulePreview() {
    const penalty = Number(el.wrongPenalty.value);
    const lock = Number(el.lockSeconds.value);
    const parts = [penalty ? `−${penalty} falsch` : 'keine Minuspunkte', lock ? `${lock} s Sperre` : 'keine Sperre'];
    if (el.speedBonus.checked) parts.push('Zeitbonus');
    if (el.streakBonus.checked) parts.push('Serienbonus');
    el.scoreRulePreview.textContent = parts.join(' · ');
  }

  function openSetup(mode) {
    state.setupMode = mode;
    el.teacherOnlyRules.hidden = mode !== 'teacher';
    el.rulesHint.textContent = mode === 'teacher' ? 'Für alle Teilnehmenden dieser Runde.' : 'Für dein Training.';
    el.setupEyebrow.textContent = mode === 'teacher' ? 'LEHRER-RUNDE' : 'TRAINING';
    el.setupTitle.textContent = mode === 'teacher' ? 'Runde konfigurieren' : 'Fast Quiz einstellen';
    el.setupSubtitle.textContent = mode === 'teacher' ? 'Lege Inhalt, Wertung und Ablauf für alle fest.' : 'Stelle dein Rechentraining zusammen.';
    el.setupSubmit.textContent = mode === 'teacher' ? 'Runde erstellen' : 'Training starten';
    el.formError.textContent = '';
    showView(el.setupView);
  }

  function resetGameState(seed) {
    clearInterval(state.timerId); clearInterval(state.lockTimerId);
    Object.assign(state, {
      seed, engine: createEngine({ ...state.config, seed }), startedAt: 0, endsAt: 0, questionStartedAt: 0,
      timerId: null, lockTimerId: null, questionIndex: 0, currentQuestion: null, locked: false, finished: false,
      correct: 0, total: 0, streak: 0, bestStreak: 0, score: 0, events: [], breakdown: {}
    });
  }

  function startSolo(config, seed = randSeed()) {
    state.role = 'solo'; state.roomCode = null; state.playerId = null; state.playerName = ''; state.config = config;
    resetGameState(seed);
    beginGame(Date.now(), Date.now() + config.durationSec * 1000);
  }

  function createTeacherRoom(config) {
    const code = randomCode();
    const room = {
      version: 3, code, seed: randSeed(), config, status: config.roundMode === 'live' ? 'waiting' : 'open',
      createdAt: Date.now(), startsAt: null, endsAt: null, players: []
    };
    state.role = 'teacher'; state.roomCode = code; state.config = config;
    writeRoom(room);
    renderTeacherRoom(room);
    showView(el.teacherRoomView);
    startTeacherHeartbeat();
  }

  function joinRoom() {
    const code = el.joinCode.value.replace(/\D/g, '').slice(0, 6);
    const name = el.joinName.value.trim().slice(0, 24);
    el.joinError.textContent = '';
    if (code.length !== 6) { el.joinError.textContent = 'Bitte einen sechsstelligen Rundencode eingeben.'; return; }
    if (!name) { el.joinError.textContent = 'Bitte ein Kürzel oder einen kurzen Namen eingeben.'; return; }
    const room = readRoom(code);
    if (!room) { el.joinError.textContent = 'Diese Runde wurde im aktuellen Lab-Browser nicht gefunden.'; return; }
    if (room.status === 'finished') { el.joinError.textContent = 'Diese Live-Runde ist bereits beendet.'; return; }
    if (room.config.roundMode === 'live' && room.status === 'running') { el.joinError.textContent = 'Die Live-Runde läuft bereits.'; return; }

    const playerId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    room.players.push({ id: playerId, name, status: 'ready', score: 0, correct: 0, total: 0, bestStreak: 0, joinedAt: Date.now(), finishedAt: null });
    state.role = 'player'; state.roomCode = code; state.playerId = playerId; state.playerName = name; state.config = room.config; state.seed = room.seed;
    writeRoom(room);

    if (room.config.roundMode === 'self') {
      const startAt = Date.now();
      const endAt = startAt + room.config.durationSec * 1000;
      updatePlayerInRoom({ status: 'running', startedAt: startAt, endsAt: endAt });
      resetGameState(room.seed);
      beginGame(startAt, endAt);
    } else {
      renderWaiting(room);
      showView(el.waitingView);
    }
  }

  function renderWaiting(room) {
    el.waitingName.textContent = `${state.playerName} ist bereit.`;
    el.waitingCode.textContent = room.code;
    el.countdown.hidden = true;
  }

  function beginCountdown(room) {
    if (state.startedAt || state.finished) return;
    showView(el.waitingView);
    el.countdown.hidden = false;
    const tick = () => {
      const left = room.startsAt - Date.now();
      const value = Math.max(0, Math.ceil(left / 1000));
      el.countdown.textContent = value || 'GO';
      if (left <= 0) {
        clearInterval(timer);
        state.config = room.config;
        resetGameState(room.seed);
        beginGame(room.startsAt, room.endsAt);
      }
    };
    tick();
    const timer = setInterval(tick, 100);
  }

  function beginGame(startAt, endAt) {
    state.startedAt = startAt; state.endsAt = endAt;
    el.activeRoundLabel.textContent = configSummary(state.config);
    el.activePlayerLabel.textContent = state.role === 'solo' ? 'Training' : state.playerName;
    el.activeRoundCode.textContent = state.roomCode || 'SOLO';
    updateCounters();
    showView(el.quizView);
    updateTimer();
    state.timerId = setInterval(updateTimer, 200);
    nextQuestion();
  }

  function nextQuestion() {
    if (state.finished || Date.now() >= state.endsAt) { finishGame(); return; }
    state.locked = false;
    el.penaltyLock.hidden = true;
    state.questionIndex += 1;
    state.currentQuestion = state.engine.next();
    state.questionStartedAt = Date.now();
    el.questionNumber.textContent = `Aufgabe ${state.questionIndex}`;
    el.questionMeta.textContent = `${DOMAIN_LABEL[state.currentQuestion.domain]} · ${OP_SYMBOL[state.currentQuestion.operation]} · ${LEVEL_LABEL[state.config.level]}`;
    el.questionTitle.textContent = state.currentQuestion.prompt;
    el.feedback.textContent = '';
    el.feedback.className = 'feedback';
    el.answers.replaceChildren();
    state.currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'answerButton'; button.dataset.answer = option;
      button.innerHTML = `<span class="answerKey">${index + 1}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener('click', () => answerQuestion(option, button));
      el.answers.append(button);
    });
  }

  function answerQuestion(answer, selectedButton) {
    if (state.locked || state.finished) return;
    state.locked = true;
    const now = Date.now();
    const latencyMs = Math.max(0, now - state.questionStartedAt);
    const isCorrect = answer === state.currentQuestion.correct;
    const scoring = state.config.scoring;
    state.total += 1;
    const key = `${state.currentQuestion.domain}:${state.currentQuestion.operation}`;
    state.breakdown[key] ||= { total: 0, correct: 0 };
    state.breakdown[key].total += 1;

    if (isCorrect) {
      state.correct += 1; state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak); state.breakdown[key].correct += 1;
      const speed = scoring.speedBonus ? Math.max(0, 50 - Math.floor(latencyMs / 200)) : 0;
      const streak = scoring.streakBonus ? Math.min(50, Math.max(0, state.streak - 1) * 5) : 0;
      state.score += scoring.correctPoints + speed + streak;
      el.feedback.textContent = `${state.currentQuestion.explanation}${speed || streak ? ` +${scoring.correctPoints + speed + streak} Punkte.` : ''}`;
      el.feedback.className = 'feedback good';
    } else {
      state.streak = 0;
      state.score -= scoring.wrongPenalty;
      if (!scoring.allowNegative) state.score = Math.max(0, state.score);
      el.feedback.textContent = scoring.showSolution
        ? `Richtig wäre: ${state.currentQuestion.correct}. ${scoring.wrongPenalty ? `−${scoring.wrongPenalty} Punkte.` : ''}`
        : `Falsch.${scoring.wrongPenalty ? ` −${scoring.wrongPenalty} Punkte.` : ''}`;
      el.feedback.className = 'feedback bad';
    }

    for (const button of el.answers.querySelectorAll('.answerButton')) {
      button.disabled = true;
      if ((isCorrect || scoring.showSolution) && button.dataset.answer === state.currentQuestion.correct) button.classList.add('isCorrect');
    }
    if (!isCorrect) selectedButton.classList.add('isWrong');

    state.events.push({
      n: state.questionIndex, questionId: state.currentQuestion.id, domain: state.currentQuestion.domain, operation: state.currentQuestion.operation,
      answer, correctAnswer: state.currentQuestion.correct, correct: isCorrect, latencyMs, scoreAfter: state.score
    });
    updateCounters();
    if (state.role === 'player') updatePlayerProgress();

    if (!isCorrect && scoring.lockSeconds > 0) startPenaltyLock(scoring.lockSeconds);
    else setTimeout(() => { if (!state.finished) nextQuestion(); }, isCorrect ? 430 : 650);
  }

  function startPenaltyLock(seconds) {
    clearInterval(state.lockTimerId);
    const unlockAt = Date.now() + seconds * 1000;
    el.penaltyLock.hidden = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
      el.penaltyLockTime.textContent = remaining;
      if (remaining <= 0 || Date.now() >= state.endsAt) {
        clearInterval(state.lockTimerId); state.lockTimerId = null; el.penaltyLock.hidden = true;
        if (!state.finished) nextQuestion();
      }
    };
    tick(); state.lockTimerId = setInterval(tick, 200);
  }

  function updateCounters() {
    el.correctCount.textContent = state.correct;
    el.streakCount.textContent = state.streak;
    el.scoreCount.textContent = state.score.toLocaleString('de-DE');
  }

  function updateTimer() {
    const remainingMs = Math.max(0, state.endsAt - Date.now());
    const sec = Math.ceil(remainingMs / 1000);
    el.timer.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    const progress = state.config?.durationSec ? remainingMs / (state.config.durationSec * 1000) : 0;
    el.timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    if (remainingMs <= 0) finishGame();
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true; clearInterval(state.timerId); clearInterval(state.lockTimerId);
    for (const button of el.answers.querySelectorAll('button')) button.disabled = true;
    const accuracy = state.total ? Math.round(state.correct / state.total * 100) : 0;
    el.resultSummary.textContent = `${state.total} ${state.total === 1 ? 'Aufgabe' : 'Aufgaben'} in ${Math.round(state.config.durationSec / 60)} ${state.config.durationSec === 60 ? 'Minute' : 'Minuten'}.`;
    el.resultCorrect.textContent = `${state.correct} / ${state.total}`;
    el.resultAccuracy.textContent = `${accuracy} %`;
    el.resultStreak.textContent = state.bestStreak;
    el.resultScore.textContent = state.score.toLocaleString('de-DE');

    if (state.role === 'solo') renderPersonalBest();
    else {
      el.personalBestCard.hidden = true;
      updatePlayerInRoom({ status: 'finished', score: state.score, correct: state.correct, total: state.total, bestStreak: state.bestStreak, finishedAt: Date.now() });
      renderPlayerLeaderboard(readRoom(state.roomCode));
    }

    const dump = {
      format: 'gradecrew-fast-quiz-session/v3', role: state.role, roomCode: state.roomCode, seed: state.seed,
      config: state.config, summary: { answered: state.total, correct: state.correct, accuracy, bestStreak: state.bestStreak, score: state.score },
      breakdown: state.breakdown, events: state.events
    };
    el.sessionDump.textContent = JSON.stringify(dump, null, 2);
    el.sameRoundBtn.hidden = state.role !== 'solo'; el.newRoundBtn.hidden = state.role !== 'solo';
    el.resultActionText.textContent = state.role === 'solo' ? 'Gleiche Einstellungen – mit denselben oder neuen Aufgaben.' : 'Dein Ergebnis wurde in der Lab-Runde gespeichert.';
    showView(el.resultView);
  }

  function bestKey() {
    const c = state.config;
    const s = c.scoring;
    return `${BEST_PREFIX}${[...c.operations].sort().join('')}:${[...c.domains].sort().join('')}:${c.level}:${c.durationSec}:${s.wrongPenalty}:${s.lockSeconds}:${Number(s.speedBonus)}:${Number(s.streakBonus)}:${Number(s.allowNegative)}`;
  }

  function renderPersonalBest() {
    el.personalBestCard.hidden = false;
    const key = bestKey();
    const previous = Number(localStorage.getItem(key) || '-Infinity');
    if (state.score > previous) {
      localStorage.setItem(key, String(state.score));
      el.personalBest.textContent = state.score.toLocaleString('de-DE');
      el.personalBestNote.textContent = Number.isFinite(previous) ? `Neuer Rekord – vorher ${previous.toLocaleString('de-DE')}.` : 'Erster Rekord für genau diese Einstellungen.';
    } else {
      el.personalBest.textContent = previous.toLocaleString('de-DE');
      el.personalBestNote.textContent = `${Math.max(0, previous - state.score).toLocaleString('de-DE')} Punkte bis zum Rekord.`;
    }
  }

  function updatePlayerProgress() {
    updatePlayerInRoom({ status: 'running', score: state.score, correct: state.correct, total: state.total, bestStreak: state.bestStreak });
  }

  function updatePlayerInRoom(patch) {
    if (!state.roomCode || !state.playerId) return;
    const room = readRoom(state.roomCode); if (!room) return;
    const player = room.players.find(p => p.id === state.playerId); if (!player) return;
    Object.assign(player, patch);
    writeRoom(room);
  }

  function sortedPlayers(room) {
    return [...(room?.players || [])].sort((a, b) => b.score - a.score || b.correct - a.correct || a.joinedAt - b.joinedAt);
  }

  function renderLeaderboard(target, room) {
    target.replaceChildren();
    sortedPlayers(room).forEach((player, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="rank">${index + 1}</span><span class="name"></span><span class="score"></span>`;
      li.querySelector('.name').textContent = player.name;
      li.querySelector('.score').textContent = `${Number(player.score || 0).toLocaleString('de-DE')} P`;
      target.append(li);
    });
  }

  function renderPlayerLeaderboard(room) {
    const show = room && room.config.leaderboardMode !== 'hidden' && (room.config.leaderboardMode === 'live' || state.finished || room.status === 'finished');
    el.playerLeaderboardWrap.hidden = !show;
    if (show) renderLeaderboard(el.playerLeaderboard, room);
  }

  function renderTeacherRoom(room) {
    if (!room) return;
    el.teacherRoomCode.textContent = room.code;
    el.teacherRoundSummary.textContent = configSummary(room.config);
    el.teacherRuleSummary.textContent = ruleSummary(room.config);
    el.playerCount.textContent = `${room.players.length} ${room.players.length === 1 ? 'bereit' : 'bereit'}`;
    el.roomStatusBadge.textContent = room.status === 'waiting' ? 'WARTET' : room.status === 'open' ? 'OFFEN' : room.status === 'running' ? 'LÄUFT' : 'BEENDET';
    el.roomStatusBadge.classList.toggle('live', room.status === 'running');
    el.playerList.replaceChildren();
    if (!room.players.length) {
      const p = document.createElement('p'); p.className = 'emptyText'; p.textContent = 'Noch niemand beigetreten.'; el.playerList.append(p);
    } else {
      for (const player of room.players) {
        const row = document.createElement('div'); row.className = 'playerRow';
        const label = player.status === 'ready' ? 'bereit' : player.status === 'running' ? `${player.score || 0} P` : `${player.score || 0} P · fertig`;
        row.innerHTML = '<strong></strong><span></span>'; row.querySelector('strong').textContent = player.name; row.querySelector('span').textContent = label; el.playerList.append(row);
      }
    }
    const live = room.config.roundMode === 'live';
    el.teacherStartBtn.hidden = !live || room.status !== 'waiting';
    el.teacherStartBtn.disabled = !room.players.length;
    el.teacherLeaderboardWrap.hidden = !room.players.length || room.config.leaderboardMode === 'hidden';
    if (!el.teacherLeaderboardWrap.hidden) renderLeaderboard(el.teacherLeaderboard, room);
  }

  function startTeacherHeartbeat() {
    clearInterval(state.teacherTimerId);
    state.teacherTimerId = setInterval(() => {
      if (state.role !== 'teacher' || !state.roomCode) return;
      const room = readRoom(state.roomCode); if (!room) return;
      if (room.status === 'running' && room.endsAt && Date.now() >= room.endsAt) {
        room.status = 'finished'; writeRoom(room);
      } else renderTeacherRoom(room);
    }, 500);
  }

  function startTeacherRound() {
    const room = readRoom(state.roomCode); if (!room || !room.players.length || room.status !== 'waiting') return;
    room.status = 'running'; room.startsAt = Date.now() + 3500; room.endsAt = room.startsAt + room.config.durationSec * 1000;
    room.players.forEach(player => { player.status = 'ready'; player.score = 0; player.correct = 0; player.total = 0; player.bestStreak = 0; player.finishedAt = null; });
    writeRoom(room);
  }

  function handleRoomUpdate(room) {
    if (!room || room.code !== state.roomCode) return;
    if (state.role === 'teacher') { renderTeacherRoom(room); return; }
    if (state.role === 'player') {
      if (room.config.roundMode === 'live' && room.status === 'running' && !state.startedAt && !state.finished) beginCountdown(room);
      if (room.config.leaderboardMode === 'live' && !el.quizView.hidden) renderPlayerLeaderboard(room);
      if (room.status === 'finished' && state.startedAt && !state.finished) finishGame();
      if (!el.resultView.hidden) renderPlayerLeaderboard(room);
    }
  }

  window.addEventListener('storage', event => {
    if (!event.key?.startsWith(ROOM_PREFIX) || !event.newValue) return;
    try { handleRoomUpdate(JSON.parse(event.newValue)); } catch { /* ignore malformed lab data */ }
  });

  document.querySelectorAll('[data-open-mode]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.openMode;
    if (mode === 'join') showView(el.joinView); else openSetup(mode);
  }));
  document.querySelectorAll('[data-back-home]').forEach(button => button.addEventListener('click', () => showView(el.homeView)));

  el.setupForm.addEventListener('submit', event => {
    event.preventDefault(); el.formError.textContent = '';
    try {
      const config = gatherConfig();
      if (state.setupMode === 'teacher') createTeacherRoom(config); else startSolo(config);
    } catch (err) { el.formError.textContent = err.message; }
  });

  for (const input of [el.wrongPenalty, el.lockSeconds, el.speedBonus, el.streakBonus]) input.addEventListener('change', updateRulePreview);
  updateRulePreview();

  el.joinCode.addEventListener('input', () => { el.joinCode.value = el.joinCode.value.replace(/\D/g, '').slice(0, 6); });
  el.joinBtn.addEventListener('click', joinRoom);
  el.copyJoinLinkBtn.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?room=${encodeURIComponent(state.roomCode)}`;
    try { await navigator.clipboard.writeText(url); el.copyJoinLinkBtn.textContent = 'Link kopiert'; setTimeout(() => { el.copyJoinLinkBtn.textContent = 'Link kopieren'; }, 1400); }
    catch { prompt('Link kopieren:', url); }
  });
  el.teacherStartBtn.addEventListener('click', startTeacherRound);
  el.teacherResetBtn.addEventListener('click', () => { clearInterval(state.teacherTimerId); openSetup('teacher'); });

  el.sameRoundBtn.addEventListener('click', () => { if (state.role !== 'solo') return; resetGameState(state.seed); beginGame(Date.now(), Date.now() + state.config.durationSec * 1000); });
  el.newRoundBtn.addEventListener('click', () => { if (state.role !== 'solo') return; const seed = randSeed(); resetGameState(seed); beginGame(Date.now(), Date.now() + state.config.durationSec * 1000); });
  el.homeBtn.addEventListener('click', () => { clearInterval(state.teacherTimerId); state.role = 'solo'; state.roomCode = null; state.playerId = null; showView(el.homeView); });

  document.addEventListener('keydown', event => {
    if (el.quizView.hidden || state.locked || state.finished) return;
    const index = Number(event.key) - 1;
    const buttons = [...el.answers.querySelectorAll('.answerButton')];
    if (index >= 0 && index < buttons.length) buttons[index].click();
  });

  const params = new URLSearchParams(location.search);
  const requestedRoom = params.get('room')?.replace(/\D/g, '').slice(0, 6);
  if (requestedRoom) { el.joinCode.value = requestedRoom; showView(el.joinView); }
})();
