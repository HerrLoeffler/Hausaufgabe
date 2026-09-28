(() => {
  'use strict';

  const API_URL = 'https://europe-west1-hausaufgabe-staging.cloudfunctions.net/fastQuizApi';
  const BEST_PREFIX = 'gradecrew-fastquiz-practice-best-v4:';
  const PLAYER_KEY_STORAGE = 'gradecrew-fastquiz-player-key-v4';
  const NAME_STORAGE = 'gradecrew-fastquiz-name-v4';
  const { createEngine, OP_SYMBOL, DOMAIN_LABEL, LEVEL_LABEL, LEVEL_RULES } = window.FastQuizMath;

  const ids = [
    'homeView','setupView','highscoreView','joinView','teacherRoomView','waitingView','quizView','resultView',
    'quickJoinCode','quickJoinBtn','setupForm','setupEyebrow','setupTitle','setupSubtitle','rulesHint','teacherOnlyRules','leaderboardMode',
    'wrongPenalty','lockSeconds','speedBonus','streakBonus','allowNegative','showSolution','scoreRulePreview','formError','setupSubmit','levelDetails',
    'highscoreName','highscoreDomain','highscoreLevel','highscoreLevelDetails','highscoreError','startHighscoreBtn','refreshHighscoreBtn','highscoreBoardLabel','highscoreLeaderboard',
    'joinCode','joinName','joinError','joinBtn','teacherRoundSummary','teacherRoomCode','teacherQr','copyJoinLinkBtn','playerCount','roomStatusBadge','playerList','teacherRuleSummary','teacherStartBtn','teacherResetBtn','teacherLeaderboardStatus','teacherLeaderboard',
    'waitingName','waitingCode','countdown','activeRoundLabel','activePlayerLabel','activeRoundCode','timerFill','timer','correctCount','streakCount','scoreCount','questionNumber','questionMeta','questionTitle','answers','penaltyLock','penaltyLockTime','feedback',
    'resultSummary','resultCorrect','resultAccuracy','resultStreak','resultScore','personalBestCard','personalBestLabel','personalBest','personalBestNote','playerLeaderboardWrap','resultLeaderboardTitle','playerLeaderboard','sameRoundBtn','newRoundBtn','homeBtn','resultActionText','sessionDump'
  ];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  const state = {
    mode: 'practice',
    config: null,
    seed: 0,
    engine: null,
    roomCode: null,
    hostToken: null,
    playerId: null,
    playerToken: null,
    playerName: '',
    highscoreAttemptId: null,
    highscoreAttemptToken: null,
    highscoreBoardId: null,
    gameStarted: false,
    startedAt: 0,
    endsAt: 0,
    timerId: null,
    lockTimerId: null,
    pollId: null,
    progressId: null,
    countdownId: null,
    questionStartedAt: 0,
    questionIndex: 0,
    currentQuestion: null,
    locked: false,
    finished: false,
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    events: []
  };

  function randomSeed() {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0];
    }
    return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
  }

  function playerKey() {
    let key = localStorage.getItem(PLAYER_KEY_STORAGE);
    if (!key) {
      key = globalThis.crypto?.randomUUID?.().replace(/-/g, '') || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
      localStorage.setItem(PLAYER_KEY_STORAGE, key);
    }
    return key;
  }

  function showView(target) {
    [el.homeView, el.setupView, el.highscoreView, el.joinView, el.teacherRoomView, el.waitingView, el.quizView, el.resultView]
      .forEach(view => { view.hidden = view !== target; });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function stopAsync() {
    clearInterval(state.timerId); clearInterval(state.lockTimerId); clearInterval(state.pollId); clearInterval(state.progressId); clearInterval(state.countdownId);
    state.timerId = state.lockTimerId = state.pollId = state.progressId = state.countdownId = null;
  }

  async function api(action, payload = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.ok) throw new Error(body?.error?.message || `Fast Quiz Backend: ${response.status}`);
      return body.data;
    } catch (err) {
      if (err?.name === 'AbortError') throw new Error('Die Verbindung zum Fast-Quiz-Backend dauert zu lange.');
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function checkedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  }
  function selectedLevel() { return document.querySelector('input[name="level"]:checked')?.value || 'n2'; }
  function selectedDuration() { return Number(document.querySelector('input[name="duration"]:checked')?.value || 3); }

  function scoringConfig() {
    return {
      correctPoints: 100,
      wrongPenalty: Number(el.wrongPenalty.value),
      lockSeconds: Number(el.lockSeconds.value),
      speedBonus: el.speedBonus.checked,
      streakBonus: el.streakBonus.checked,
      allowNegative: el.allowNegative.checked,
      showSolution: el.showSolution.checked
    };
  }

  function gatherConfig() {
    const operations = checkedValues('operation');
    const domains = checkedValues('domain');
    if (!operations.length) throw new Error('Bitte mindestens eine Grundrechenart auswählen.');
    if (!domains.length) throw new Error('Bitte mindestens einen Zahlenbereich auswählen.');
    return {
      version: 4,
      operations,
      domains,
      level: selectedLevel(),
      durationSec: selectedDuration() * 60,
      scoring: scoringConfig(),
      leaderboardMode: state.mode === 'liveTeacher' ? el.leaderboardMode.value : 'hidden',
      roundMode: state.mode === 'liveTeacher' ? 'live' : 'practice'
    };
  }

  function configSummary(config) {
    const ops = config.operations.map(op => OP_SYMBOL[op]).join(' ');
    const domains = config.domains.map(domain => DOMAIN_LABEL[domain]).join(', ');
    return `${ops} · ${domains} · ${LEVEL_LABEL[config.level]} · ${Math.round(config.durationSec / 60)} min`;
  }

  function ruleSummary(config) {
    const s = config.scoring;
    return `+${s.correctPoints} richtig · ${s.wrongPenalty ? `−${s.wrongPenalty} falsch` : 'keine Minuspunkte'} · ${s.lockSeconds ? `${s.lockSeconds} s Sperre` : 'keine Sperre'}${s.speedBonus ? ' · Zeitbonus' : ''}${s.streakBonus ? ' · Serienbonus' : ''}`;
  }

  function updateRulePreview() {
    const parts = [Number(el.wrongPenalty.value) ? `−${el.wrongPenalty.value} falsch` : 'keine Minuspunkte', Number(el.lockSeconds.value) ? `${el.lockSeconds.value} s Sperre` : 'keine Sperre'];
    if (el.speedBonus.checked) parts.push('Zeitbonus');
    if (el.streakBonus.checked) parts.push('Serienbonus');
    el.scoreRulePreview.textContent = parts.join(' · ');
  }

  function renderLevelDetails(target, domains, level) {
    const effective = domains.length ? domains : ['natural'];
    target.replaceChildren(...effective.map(domain => {
      const row = document.createElement('div');
      row.className = 'levelRule';
      const strong = document.createElement('strong'); strong.textContent = DOMAIN_LABEL[domain];
      const span = document.createElement('span'); span.textContent = LEVEL_RULES[domain][level];
      row.append(strong, span);
      return row;
    }));
  }

  function refreshSetupLevelDetails() {
    renderLevelDetails(el.levelDetails, checkedValues('domain'), selectedLevel());
  }

  function highscoreSelection() {
    return { domain: el.highscoreDomain.value, level: el.highscoreLevel.value };
  }

  function refreshHighscoreLevelDetails() {
    const { domain, level } = highscoreSelection();
    const domains = domain === 'mixed' ? ['natural', 'integer', 'decimal', 'fraction'] : [domain];
    renderLevelDetails(el.highscoreLevelDetails, domains, level);
    el.highscoreBoardLabel.textContent = `${domain === 'mixed' ? 'Mix' : DOMAIN_LABEL[domain]} · ${LEVEL_LABEL[level]}`;
  }

  function openSetup(mode) {
    stopAsync();
    state.mode = mode;
    const live = mode === 'liveTeacher';
    el.teacherOnlyRules.hidden = !live;
    el.rulesHint.textContent = live ? 'Diese Regeln gelten für alle Teilnehmenden.' : 'Für dein persönliches Training.';
    el.setupEyebrow.textContent = live ? 'LIVE MIT LEHRKRAFT' : 'ÜBEN';
    el.setupTitle.textContent = live ? 'Live-Runde konfigurieren' : 'Training konfigurieren';
    el.setupSubtitle.textContent = live ? 'Lege Inhalt, Niveau, Zeit und Fehlerregeln fest. Danach entsteht der QR-Code.' : 'Wähle genau, was du trainieren möchtest.';
    el.setupSubmit.textContent = live ? 'Live-Runde erstellen' : 'Training starten';
    el.formError.textContent = '';
    refreshSetupLevelDetails();
    showView(el.setupView);
  }

  function openJoin(code = '') {
    stopAsync();
    el.joinCode.value = String(code || '').replace(/\D/g, '').slice(0, 6);
    const remembered = localStorage.getItem(NAME_STORAGE) || '';
    if (!el.joinName.value) el.joinName.value = remembered;
    el.joinError.textContent = '';
    showView(el.joinView);
    if (el.joinCode.value.length === 6) el.joinName.focus(); else el.joinCode.focus();
  }

  function practiceBestKey(config) {
    return `${BEST_PREFIX}${config.level}:${config.durationSec}:${config.operations.join(',')}:${config.domains.join(',')}:${config.scoring.wrongPenalty}:${config.scoring.lockSeconds}:${Number(config.scoring.speedBonus)}:${Number(config.scoring.streakBonus)}`;
  }

  function resetGame(seed) {
    clearInterval(state.timerId); clearInterval(state.lockTimerId); clearInterval(state.progressId);
    state.seed = seed >>> 0;
    state.engine = createEngine({ ...state.config, seed: state.seed });
    state.startedAt = 0; state.endsAt = 0; state.questionStartedAt = 0; state.questionIndex = 0; state.currentQuestion = null;
    state.locked = false; state.finished = false; state.correct = 0; state.total = 0; state.streak = 0; state.bestStreak = 0; state.score = 0; state.events = [];
    state.gameStarted = false;
  }

  function startPractice(config, seed = randomSeed()) {
    state.mode = 'practice'; state.config = config; state.roomCode = null; state.playerName = '';
    resetGame(seed);
    const now = Date.now();
    beginGame(now, now + config.durationSec * 1000);
  }

  function beginGame(startAt, endAt) {
    if (state.gameStarted) return;
    state.gameStarted = true;
    state.startedAt = startAt; state.endsAt = endAt;
    el.activeRoundLabel.textContent = configSummary(state.config);
    el.activePlayerLabel.textContent = state.mode === 'practice' ? 'Üben' : state.playerName || (state.mode === 'highscore' ? 'Highscore' : 'Live');
    el.activeRoundCode.textContent = state.roomCode || (state.mode === 'highscore' ? 'HIGHSCORE' : 'SOLO');
    updateCounters();
    showView(el.quizView);
    updateTimer();
    state.timerId = setInterval(updateTimer, 200);
    if (state.mode === 'livePlayer') state.progressId = setInterval(() => submitLiveProgress(false), 1800);
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
    el.questionMeta.textContent = `${LEVEL_LABEL[state.config.level]} · ${DOMAIN_LABEL[state.currentQuestion.domain]}`;
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

  function answerQuestion(answer, button) {
    if (state.locked || state.finished) return;
    state.locked = true;
    const now = Date.now();
    const latencyMs = Math.max(0, now - state.questionStartedAt);
    const correct = answer === state.currentQuestion.correct;
    const s = state.config.scoring;
    state.total += 1;
    let delta = 0;

    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const speed = s.speedBonus ? Math.max(0, 50 - Math.floor(latencyMs / 180)) : 0;
      const streak = s.streakBonus ? Math.min(60, Math.max(0, state.streak - 1) * 6) : 0;
      delta = s.correctPoints + speed + streak;
      state.score += delta;
      el.feedback.textContent = `${state.currentQuestion.explanation} +${delta} Punkte.`;
      el.feedback.className = 'feedback good';
    } else {
      state.streak = 0;
      delta = -s.wrongPenalty;
      state.score += delta;
      if (!s.allowNegative) state.score = Math.max(0, state.score);
      el.feedback.textContent = s.showSolution ? `Richtig wäre: ${state.currentQuestion.correct}. ${state.currentQuestion.explanation}` : 'Falsch. Nächste Aufgabe nach der Sperrzeit.';
      el.feedback.className = 'feedback bad';
    }

    for (const answerButton of el.answers.querySelectorAll('.answerButton')) {
      answerButton.disabled = true;
      if (s.showSolution && answerButton.dataset.answer === state.currentQuestion.correct) answerButton.classList.add('isCorrect');
    }
    if (!correct) button.classList.add('isWrong');

    state.events.push({
      n: state.questionIndex,
      questionId: state.currentQuestion.id,
      domain: state.currentQuestion.domain,
      operation: state.currentQuestion.operation,
      answer,
      correctAnswer: state.currentQuestion.correct,
      correct,
      latencyMs,
      delta,
      score: state.score
    });
    updateCounters();

    if (!correct && s.lockSeconds > 0) {
      startPenaltyLock(s.lockSeconds);
    } else {
      window.setTimeout(nextQuestion, correct ? 380 : 500);
    }
  }

  function startPenaltyLock(seconds) {
    let remaining = seconds;
    el.penaltyLock.hidden = false;
    el.penaltyLockTime.textContent = remaining;
    clearInterval(state.lockTimerId);
    state.lockTimerId = setInterval(() => {
      remaining -= 1;
      el.penaltyLockTime.textContent = Math.max(0, remaining);
      if (remaining <= 0 || Date.now() >= state.endsAt) {
        clearInterval(state.lockTimerId); state.lockTimerId = null; el.penaltyLock.hidden = true;
        if (!state.finished) nextQuestion();
      }
    }, 1000);
  }

  function updateCounters() {
    el.correctCount.textContent = state.correct;
    el.streakCount.textContent = state.streak;
    el.scoreCount.textContent = state.score.toLocaleString('de-DE');
  }

  function updateTimer() {
    const remainingMs = Math.max(0, state.endsAt - Date.now());
    const remainingSec = Math.ceil(remainingMs / 1000);
    el.timer.textContent = `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`;
    const progress = state.config?.durationSec ? remainingMs / (state.config.durationSec * 1000) : 0;
    el.timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    if (remainingMs <= 0) finishGame();
  }

  function summary() {
    return { total: state.total, answered: state.total, correct: state.correct, bestStreak: state.bestStreak, score: state.score };
  }

  async function finishGame() {
    if (state.finished) return;
    state.finished = true;
    clearInterval(state.timerId); clearInterval(state.lockTimerId); clearInterval(state.progressId);
    state.timerId = state.lockTimerId = state.progressId = null;
    for (const button of el.answers.querySelectorAll('button')) button.disabled = true;

    const accuracy = state.total ? Math.round(state.correct / state.total * 100) : 0;
    el.resultSummary.textContent = `Du hast ${state.total} ${state.total === 1 ? 'Aufgabe' : 'Aufgaben'} bearbeitet.`;
    el.resultCorrect.textContent = `${state.correct} / ${state.total}`;
    el.resultAccuracy.textContent = `${accuracy} %`;
    el.resultStreak.textContent = state.bestStreak;
    el.resultScore.textContent = state.score.toLocaleString('de-DE');
    el.playerLeaderboardWrap.hidden = true;
    el.personalBestCard.hidden = false;
    el.sameRoundBtn.hidden = false;
    el.newRoundBtn.hidden = false;
    el.resultActionText.textContent = 'Gleiche Einstellungen – mit denselben oder neuen Aufgaben.';

    if (state.mode === 'practice') {
      const key = practiceBestKey(state.config);
      const old = Number(localStorage.getItem(key) || Number.NEGATIVE_INFINITY);
      const best = Math.max(old, state.score);
      localStorage.setItem(key, String(best));
      el.personalBestLabel.textContent = 'Persönlicher Rekord für diese Einstellungen';
      el.personalBest.textContent = best.toLocaleString('de-DE');
      el.personalBestNote.textContent = state.score > old ? 'Neuer Rekord.' : state.score === old ? 'Rekord eingestellt.' : `${(best - state.score).toLocaleString('de-DE')} Punkte bis zum Rekord.`;
    } else if (state.mode === 'highscore') {
      el.sameRoundBtn.hidden = true;
      el.personalBestLabel.textContent = 'Highscore';
      el.personalBest.textContent = 'wird gespeichert …';
      el.personalBestNote.textContent = 'Die Bestenliste wird vom GradeCrew-Lab-Backend geladen.';
      el.resultActionText.textContent = 'Jeder neue Versuch bekommt eine neue, gleichwertige Aufgabenfolge.';
      try {
        const result = await api('finishHighscoreAttempt', { attemptId: state.highscoreAttemptId, attemptToken: state.highscoreAttemptToken, summary: summary() });
        el.personalBest.textContent = Number(result.personalBest || state.score).toLocaleString('de-DE');
        el.personalBestNote.textContent = result.improved ? 'Neuer persönlicher All-Time-Bestwert.' : 'Dein bisheriger Bestwert bleibt bestehen.';
        el.playerLeaderboardWrap.hidden = false;
        el.resultLeaderboardTitle.textContent = 'All-Time-Bestenliste';
        renderLeaderboard(el.playerLeaderboard, result.leaderboard);
      } catch (err) {
        el.personalBest.textContent = state.score.toLocaleString('de-DE');
        el.personalBestNote.textContent = `Speichern fehlgeschlagen: ${err.message}`;
      }
    } else if (state.mode === 'livePlayer') {
      el.sameRoundBtn.hidden = true;
      el.newRoundBtn.hidden = true;
      el.personalBestCard.hidden = true;
      el.resultActionText.textContent = 'Die Rangliste wird von der Lehrkraft gesteuert.';
      await submitLiveProgress(true);
      try {
        const room = await api('roomState', { code: state.roomCode });
        if (room.leaderboard?.length) {
          el.playerLeaderboardWrap.hidden = false;
          el.resultLeaderboardTitle.textContent = 'Live-Rangliste';
          renderLeaderboard(el.playerLeaderboard, room.leaderboard);
        }
      } catch {}
    }

    el.sessionDump.textContent = JSON.stringify({ mode: state.mode, config: state.config, seed: state.seed, roomCode: state.roomCode, summary: { ...summary(), accuracy }, events: state.events }, null, 2);
    showView(el.resultView);
  }

  function renderLeaderboard(target, rows = []) {
    target.replaceChildren();
    if (!rows.length) {
      const li = document.createElement('li'); li.className = 'emptyLeaderboard'; li.textContent = 'Noch keine Einträge.'; target.append(li); return;
    }
    rows.forEach((row, index) => {
      const li = document.createElement('li');
      const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = `${row.rank || index + 1}.`;
      const name = document.createElement('span'); name.className = 'name'; name.textContent = row.name || '—';
      const score = document.createElement('span'); score.className = 'score'; score.textContent = Number(row.score || 0).toLocaleString('de-DE');
      li.append(rank, name, score); target.append(li);
    });
  }

  async function loadHighscoreBoard() {
    refreshHighscoreLevelDetails();
    el.highscoreError.textContent = '';
    try {
      const selection = highscoreSelection();
      const result = await api('highscoreBoard', selection);
      renderLeaderboard(el.highscoreLeaderboard, result.leaderboard);
    } catch (err) {
      el.highscoreError.textContent = err.message;
      renderLeaderboard(el.highscoreLeaderboard, []);
    }
  }

  async function startHighscore() {
    const name = el.highscoreName.value.trim().slice(0, 24);
    if (!name) { el.highscoreError.textContent = 'Bitte ein Kürzel oder einen kurzen Namen eingeben.'; return; }
    localStorage.setItem(NAME_STORAGE, name);
    el.highscoreError.textContent = '';
    el.startHighscoreBtn.disabled = true;
    try {
      const result = await api('createHighscoreAttempt', { ...highscoreSelection(), name, playerKey: playerKey() });
      state.mode = 'highscore'; state.playerName = name; state.config = result.config; state.highscoreAttemptId = result.attemptId; state.highscoreAttemptToken = result.attemptToken; state.highscoreBoardId = result.boardId;
      resetGame(result.seed);
      beginGame(result.startsAtMs, result.endsAtMs);
    } catch (err) {
      el.highscoreError.textContent = err.message;
    } finally {
      el.startHighscoreBtn.disabled = false;
    }
  }

  async function createLiveRoom(config) {
    el.setupSubmit.disabled = true;
    el.formError.textContent = '';
    try {
      const result = await api('createRoom', { config });
      state.mode = 'liveTeacher'; state.config = result.config; state.roomCode = result.code; state.hostToken = result.hostToken;
      renderTeacherShell();
      showView(el.teacherRoomView);
      await pollTeacherRoom();
      state.pollId = setInterval(pollTeacherRoom, 1000);
    } catch (err) {
      el.formError.textContent = err.message;
    } finally {
      el.setupSubmit.disabled = false;
    }
  }

  function joinUrl(code) {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('join', code);
    return url.toString();
  }

  function renderTeacherShell() {
    el.teacherRoomCode.textContent = state.roomCode;
    el.teacherRoundSummary.textContent = configSummary(state.config);
    el.teacherRuleSummary.textContent = ruleSummary(state.config);
    el.teacherQr.replaceChildren();
    if (globalThis.QRCode) {
      new QRCode(el.teacherQr, { text: joinUrl(state.roomCode), width: 100, height: 100, correctLevel: QRCode.CorrectLevel.M });
    } else {
      el.teacherQr.textContent = 'QR';
    }
  }

  async function pollTeacherRoom() {
    if (state.mode !== 'liveTeacher' || !state.roomCode) return;
    try {
      const room = await api('roomState', { code: state.roomCode, hostToken: state.hostToken });
      el.playerCount.textContent = `${room.playerCount} / ${room.maxPlayers} ${room.status === 'waiting' ? 'bereit' : 'Teilnehmende'}`;
      el.roomStatusBadge.textContent = room.status === 'waiting' ? 'WARTET' : room.status === 'running' ? 'LÄUFT' : 'BEENDET';
      el.roomStatusBadge.classList.toggle('live', room.status === 'running');
      el.teacherStartBtn.disabled = room.status !== 'waiting' || room.playerCount < 1;
      renderPlayerList(room.players);
      renderLeaderboard(el.teacherLeaderboard, room.leaderboard || room.players);
      el.teacherLeaderboardStatus.textContent = room.status === 'waiting' ? 'erscheint ab dem Start' : room.status === 'running' ? 'wird laufend aktualisiert' : 'Endstand';
    } catch (err) {
      el.teacherLeaderboardStatus.textContent = err.message;
    }
  }

  function renderPlayerList(players = []) {
    el.playerList.replaceChildren();
    if (!players.length) {
      const p = document.createElement('p'); p.className = 'emptyText'; p.textContent = 'Noch niemand beigetreten.'; el.playerList.append(p); return;
    }
    players.forEach(player => {
      const row = document.createElement('div'); row.className = 'playerRow';
      const name = document.createElement('strong'); name.textContent = player.name;
      const status = document.createElement('span'); status.textContent = player.status === 'ready' ? 'bereit' : player.status === 'finished' ? 'fertig' : `${Number(player.score || 0).toLocaleString('de-DE')} P`;
      row.append(name, status); el.playerList.append(row);
    });
  }

  async function startTeacherRoom() {
    el.teacherStartBtn.disabled = true;
    try {
      await api('startRoom', { code: state.roomCode, hostToken: state.hostToken });
      await pollTeacherRoom();
    } catch (err) {
      el.teacherLeaderboardStatus.textContent = err.message;
      el.teacherStartBtn.disabled = false;
    }
  }

  async function joinLiveRoom() {
    const code = el.joinCode.value.replace(/\D/g, '').slice(0, 6);
    const name = el.joinName.value.trim().slice(0, 24);
    if (code.length !== 6) { el.joinError.textContent = 'Bitte einen sechsstelligen Rundencode eingeben.'; return; }
    if (!name) { el.joinError.textContent = 'Bitte ein Kürzel oder einen kurzen Namen eingeben.'; return; }
    el.joinError.textContent = '';
    el.joinBtn.disabled = true;
    try {
      const result = await api('joinRoom', { code, name });
      localStorage.setItem(NAME_STORAGE, name);
      state.mode = 'livePlayer'; state.roomCode = result.code; state.playerId = result.playerId; state.playerToken = result.playerToken; state.playerName = result.name; state.config = result.config; state.seed = result.seed;
      el.waitingName.textContent = `${name} ist bereit.`;
      el.waitingCode.textContent = result.code;
      el.countdown.hidden = true;
      showView(el.waitingView);
      await pollPlayerRoom();
      state.pollId = setInterval(pollPlayerRoom, 800);
    } catch (err) {
      el.joinError.textContent = err.message;
    } finally {
      el.joinBtn.disabled = false;
    }
  }

  async function pollPlayerRoom() {
    if (state.mode !== 'livePlayer' || state.gameStarted || !state.roomCode) return;
    try {
      const room = await api('roomState', { code: state.roomCode });
      if (room.status === 'running' && room.startsAtMs && room.endsAtMs) startLiveCountdown(room);
      else if (room.status === 'finished') { el.joinError.textContent = 'Diese Runde ist bereits beendet.'; showView(el.joinView); }
    } catch (err) {
      el.waitingName.textContent = err.message;
    }
  }

  function startLiveCountdown(room) {
    if (state.gameStarted || state.countdownId) return;
    clearInterval(state.pollId); state.pollId = null;
    state.config = room.config; state.seed = room.seed;
    el.countdown.hidden = false;
    const tick = () => {
      const left = room.startsAtMs - Date.now();
      if (left <= 0) {
        clearInterval(state.countdownId); state.countdownId = null;
        el.countdown.textContent = 'GO';
        resetGame(room.seed);
        window.setTimeout(() => beginGame(room.startsAtMs, room.endsAtMs), 180);
        return;
      }
      el.countdown.textContent = Math.ceil(left / 1000);
    };
    tick();
    state.countdownId = setInterval(tick, 100);
  }

  async function submitLiveProgress(finished) {
    if (state.mode !== 'livePlayer' || !state.playerId || !state.playerToken) return;
    try {
      await api('submitLive', { code: state.roomCode, playerId: state.playerId, playerToken: state.playerToken, summary: summary(), finished });
    } catch (err) {
      if (finished) el.personalBestNote.textContent = err.message;
    }
  }

  el.setupForm.addEventListener('submit', event => {
    event.preventDefault();
    el.formError.textContent = '';
    try {
      const config = gatherConfig();
      if (state.mode === 'liveTeacher') createLiveRoom(config); else startPractice(config);
    } catch (err) { el.formError.textContent = err.message; }
  });

  document.querySelectorAll('[data-open-mode]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.openMode;
    if (mode === 'practice') openSetup('practice');
    else if (mode === 'live') openSetup('liveTeacher');
    else {
      stopAsync();
      state.mode = 'highscore';
      el.highscoreName.value = localStorage.getItem(NAME_STORAGE) || '';
      refreshHighscoreLevelDetails();
      showView(el.highscoreView);
      loadHighscoreBoard();
    }
  }));

  document.querySelectorAll('[data-back-home]').forEach(button => button.addEventListener('click', () => { stopAsync(); showView(el.homeView); }));
  document.querySelectorAll('input[name="domain"],input[name="level"]').forEach(input => input.addEventListener('change', refreshSetupLevelDetails));
  [el.wrongPenalty, el.lockSeconds, el.speedBonus, el.streakBonus].forEach(control => control.addEventListener('change', updateRulePreview));
  [el.highscoreDomain, el.highscoreLevel].forEach(control => control.addEventListener('change', loadHighscoreBoard));
  el.refreshHighscoreBtn.addEventListener('click', loadHighscoreBoard);
  el.startHighscoreBtn.addEventListener('click', startHighscore);
  el.quickJoinBtn.addEventListener('click', () => openJoin(el.quickJoinCode.value));
  el.quickJoinCode.addEventListener('keydown', event => { if (event.key === 'Enter') openJoin(el.quickJoinCode.value); });
  el.joinBtn.addEventListener('click', joinLiveRoom);
  el.joinCode.addEventListener('input', () => { el.joinCode.value = el.joinCode.value.replace(/\D/g, '').slice(0, 6); });
  el.teacherStartBtn.addEventListener('click', startTeacherRoom);
  el.teacherResetBtn.addEventListener('click', () => openSetup('liveTeacher'));
  el.copyJoinLinkBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(joinUrl(state.roomCode)); el.copyJoinLinkBtn.textContent = 'Link kopiert'; setTimeout(() => { el.copyJoinLinkBtn.textContent = 'Beitrittslink kopieren'; }, 1400); } catch {}
  });
  el.sameRoundBtn.addEventListener('click', () => {
    if (state.mode !== 'practice') return;
    resetGame(state.seed);
    const now = Date.now(); beginGame(now, now + state.config.durationSec * 1000);
  });
  el.newRoundBtn.addEventListener('click', () => {
    if (state.mode === 'practice') startPractice(state.config, randomSeed());
    else if (state.mode === 'highscore') startHighscore();
  });
  el.homeBtn.addEventListener('click', () => { stopAsync(); history.replaceState({}, '', location.pathname); showView(el.homeView); });

  document.addEventListener('keydown', event => {
    if (el.quizView.hidden || state.locked || state.finished) return;
    const index = Number(event.key) - 1;
    const buttons = [...el.answers.querySelectorAll('.answerButton')];
    if (index >= 0 && index < buttons.length) buttons[index].click();
  });

  updateRulePreview();
  refreshSetupLevelDetails();
  refreshHighscoreLevelDetails();

  const joinParam = new URLSearchParams(location.search).get('join');
  if (joinParam && /^\d{6}$/.test(joinParam)) {
    el.quickJoinCode.value = joinParam;
    openJoin(joinParam);
  }
})();
