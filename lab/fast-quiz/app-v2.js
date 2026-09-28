(() => {
  'use strict';

  const TOPICS = {
    percent: { label: 'Mathematik · Prozentrechnung', short: 'Prozentrechnung', code: 'P' },
    mental: { label: 'Mathematik · Kopfrechnen', short: 'Kopfrechnen', code: 'K' },
    wordclass: { label: 'Deutsch · Wortarten', short: 'Wortarten', code: 'W' }
  };

  const LEVELS = {
    easy: { label: 'Leicht', code: 'L' },
    medium: { label: 'Mittel', code: 'M' },
    hard: { label: 'Anspruchsvoll', code: 'H' }
  };

  const TOPIC_FROM_CODE = Object.fromEntries(Object.entries(TOPICS).map(([key, value]) => [value.code, key]));
  const LEVEL_FROM_CODE = Object.fromEntries(Object.entries(LEVELS).map(([key, value]) => [value.code, key]));

  const WORD_ITEMS = {
    easy: [
      ['Hund', 'Nomen', 'Der Hund schläft.'], ['laufen', 'Verb', 'Wir laufen zur Schule.'],
      ['freundlich', 'Adjektiv', 'Sie ist freundlich.'], ['Schule', 'Nomen', 'Die Schule beginnt.'],
      ['denken', 'Verb', 'Ich muss kurz denken.'], ['leise', 'Adjektiv', 'Die Musik ist leise.'],
      ['Fenster', 'Nomen', 'Das Fenster ist offen.'], ['schreiben', 'Verb', 'Wir schreiben heute.'],
      ['mutig', 'Adjektiv', 'Das war mutig.'], ['Wasser', 'Nomen', 'Das Wasser ist kalt.'],
      ['springen', 'Verb', 'Die Kinder springen hoch.'], ['hell', 'Adjektiv', 'Das helle Licht blendet.'],
      ['Pause', 'Nomen', 'Die Pause beginnt gleich.'], ['ruhig', 'Adjektiv', 'Der ruhige Raum hilft beim Lernen.'],
      ['rechnen', 'Verb', 'Wir rechnen im Kopf.'], ['Ball', 'Nomen', 'Der Ball liegt dort.']
    ],
    medium: [
      ['wir', 'Pronomen', 'Wir beginnen jetzt.'], ['gestern', 'Adverb', 'Gestern war Montag.'],
      ['schnell', 'Adjektiv', 'Das schnelle Fahrrad ist neu.'], ['arbeiten', 'Verb', 'Sie arbeiten konzentriert.'],
      ['Gedanke', 'Nomen', 'Der Gedanke gefällt mir.'], ['dort', 'Adverb', 'Dort steht mein Fahrrad.'],
      ['ihnen', 'Pronomen', 'Ich helfe ihnen.'], ['deutlich', 'Adjektiv', 'Die deutliche Antwort überzeugt.'],
      ['entscheiden', 'Verb', 'Wir entscheiden gemeinsam.'], ['heute', 'Adverb', 'Heute schreiben wir einen Test.'],
      ['mein', 'Pronomen', 'Das ist mein Heft.'], ['Lösung', 'Nomen', 'Die Lösung stimmt.'],
      ['morgen', 'Adverb', 'Morgen beginnt das Projekt.'], ['unser', 'Pronomen', 'Unser Ergebnis ist korrekt.'],
      ['gründlich', 'Adjektiv', 'Die gründliche Kontrolle lohnt sich.'], ['erklären', 'Verb', 'Sie erklären den Rechenweg.'],
      ['Aufgabe', 'Nomen', 'Die Aufgabe ist lösbar.'], ['hier', 'Adverb', 'Hier beginnt der zweite Abschnitt.']
    ],
    hard: [
      ['obwohl', 'Konjunktion', 'Obwohl es regnet, gehen wir.'], ['unter', 'Präposition', 'Das Heft liegt unter dem Tisch.'],
      ['deshalb', 'Adverb', 'Deshalb komme ich später.'], ['welcher', 'Pronomen', 'Welcher gehört dir?'],
      ['während', 'Präposition', 'Während des Unterrichts ist es ruhig.'], ['aber', 'Konjunktion', 'Ich komme, aber etwas später.'],
      ['gegenüber', 'Präposition', 'Die Schule liegt gegenüber dem Park.'], ['dennoch', 'Adverb', 'Dennoch versuchte er es erneut.'],
      ['dessen', 'Pronomen', 'Das ist der Schüler, dessen Heft fehlt.'], ['falls', 'Konjunktion', 'Falls du Zeit hast, komm vorbei.'],
      ['zwischen', 'Präposition', 'Der Ball liegt zwischen den Stühlen.'], ['damit', 'Konjunktion', 'Ich übe, damit ich sicherer werde.'],
      ['außerhalb', 'Präposition', 'Außerhalb des Gebäudes wartet die Gruppe.'], ['wodurch', 'Adverb', 'Wodurch ist der Fehler entstanden?'],
      ['sobald', 'Konjunktion', 'Sobald die Zeit endet, wird abgegeben.'], ['jenen', 'Pronomen', 'Jenen Ordner brauche ich noch.'],
      ['innerhalb', 'Präposition', 'Innerhalb einer Minute löste sie die Aufgabe.'], ['trotzdem', 'Adverb', 'Trotzdem blieb er ruhig.']
    ]
  };

  const WORD_OPTIONS = {
    easy: ['Nomen', 'Verb', 'Adjektiv', 'Pronomen'],
    medium: ['Nomen', 'Verb', 'Adjektiv', 'Pronomen', 'Adverb'],
    hard: ['Pronomen', 'Adverb', 'Präposition', 'Konjunktion', 'Adjektiv']
  };

  const ids = [
    'setupView', 'quizView', 'resultView', 'setupForm', 'topic', 'level', 'rerollSeedBtn', 'roundCode',
    'activeTopic', 'activeRoundCode', 'timerFill', 'timer', 'correctCount', 'streakCount', 'scoreCount',
    'questionNumber', 'difficultyLabel', 'questionTitle', 'answers', 'feedback', 'resultSummary', 'resultCorrect',
    'resultAccuracy', 'resultStreak', 'resultScore', 'sameRoundBtn', 'newRoundBtn', 'settingsBtn', 'sessionDump',
    'modePractice', 'modeChallenge', 'challengeTools', 'joinCode', 'loadChallengeBtn', 'copyChallengeBtn',
    'bestValue', 'bestLabel', 'resultBest', 'copyResultChallengeBtn'
  ];
  const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  const state = {
    mode: 'practice', seed: createSeed(), rng: null, durationSec: 180, topic: 'percent', level: 'medium',
    startedAt: 0, endsAt: 0, questionStartedAt: 0, timerId: null, questionIndex: 0,
    currentQuestion: null, locked: false, finished: false, correct: 0, total: 0,
    streak: 0, bestStreak: 0, score: 0, events: [], seen: new Set()
  };

  function createSeed() {
    return Math.floor(Math.random() * (36 ** 5));
  }

  function selectedDuration() {
    const input = document.querySelector('input[name="duration"]:checked');
    return Number(input?.value || 3);
  }

  function setDuration(minutes) {
    const input = document.querySelector(`input[name="duration"][value="${minutes}"]`);
    if (input) input.checked = true;
  }

  function currentConfig() {
    return { topic: els.topic.value, level: els.level.value, durationMin: selectedDuration(), seed: state.seed };
  }

  function roundCode(config = currentConfig()) {
    const seedCode = Number(config.seed).toString(36).toUpperCase().padStart(5, '0').slice(-5);
    return `FQ-${TOPICS[config.topic].code}${LEVELS[config.level].code}${config.durationMin}-${seedCode}`;
  }

  function parseRoundCode(raw) {
    const match = String(raw || '').trim().toUpperCase().match(/^FQ-([PKW])([LMH])([1-5])-([0-9A-Z]{1,5})$/);
    if (!match) return null;
    const topic = TOPIC_FROM_CODE[match[1]];
    const level = LEVEL_FROM_CODE[match[2]];
    const durationMin = Number(match[3]);
    const seed = parseInt(match[4], 36);
    if (!topic || !level || !Number.isFinite(seed) || seed < 0 || seed >= 36 ** 5) return null;
    return { topic, level, durationMin, seed };
  }

  function applyCode(code) {
    const parsed = parseRoundCode(code);
    if (!parsed) return false;
    els.topic.value = parsed.topic;
    els.level.value = parsed.level;
    setDuration(parsed.durationMin);
    state.seed = parsed.seed;
    els.modeChallenge.checked = true;
    state.mode = 'challenge';
    updateModeUI();
    renderRoundCode();
    renderBest();
    return true;
  }

  function challengeUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('code', roundCode());
    return url.toString();
  }

  async function copyChallengeLink(button) {
    const text = challengeUrl();
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = 'Link kopiert';
      window.setTimeout(() => { button.textContent = original; }, 1200);
    } catch {
      window.prompt('Challenge-Link kopieren:', text);
    }
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomInt(min, max) {
    return Math.floor(state.rng() * (max - min + 1)) + min;
  }

  function pick(list) {
    return list[Math.floor(state.rng() * list.length)];
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(state.rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function uniqueNumericOptions(correct, candidates) {
    const seen = new Set([String(correct)]);
    const values = [correct];
    for (const value of candidates) {
      if (value < 0 || !Number.isFinite(value)) continue;
      const normalized = Number.isInteger(value) ? value : Number(value.toFixed(1));
      if (seen.has(String(normalized))) continue;
      seen.add(String(normalized));
      values.push(normalized);
      if (values.length === 4) break;
    }
    let offset = 1;
    while (values.length < 4) {
      const candidate = Number(correct) + offset;
      if (!seen.has(String(candidate))) {
        seen.add(String(candidate));
        values.push(candidate);
      }
      offset += 1;
    }
    return shuffle(values).map(String);
  }

  function percentQuestion() {
    const level = state.level;
    const bases = level === 'easy' ? [40, 60, 80, 100, 120, 160, 200]
      : level === 'medium' ? [40, 60, 80, 120, 160, 200, 240, 300, 400]
      : [80, 120, 160, 240, 280, 320, 360, 480, 600, 800];
    const percents = level === 'easy' ? [10, 20, 25, 50]
      : level === 'medium' ? [5, 10, 15, 20, 25, 30, 40, 50, 75]
      : [5, 12.5, 15, 17.5, 20, 25, 30, 35, 40, 60, 75];
    const mode = level === 'easy' ? 'value' : pick(level === 'medium' ? ['value', 'percent'] : ['value', 'percent', 'base']);
    let base = pick(bases);
    let percent = pick(percents);
    let value = base * percent / 100;
    let guard = 0;
    while (!Number.isInteger(value) && guard < 12) {
      base = pick(bases); percent = pick(percents); value = base * percent / 100; guard += 1;
    }
    if (mode === 'percent') {
      const correct = percent;
      return {
        id: `percent-percent-${base}-${value}`,
        prompt: `${value} sind wie viel Prozent von ${base}?`,
        options: uniqueNumericOptions(correct, [correct + 5, correct - 5, correct + 10, correct / 2, correct * 2]).map(v => `${v} %`),
        correct: `${correct} %`, explanation: `${value} ÷ ${base} × 100 = ${correct} %.`
      };
    }
    if (mode === 'base') {
      const correct = base;
      return {
        id: `percent-base-${percent}-${value}`,
        prompt: `${percent} % entsprechen ${value}. Wie groß ist der Grundwert?`,
        options: uniqueNumericOptions(correct, [correct + 40, correct - 40, correct + 80, value * 100 / Math.max(1, percent + 5)]).map(String),
        correct: String(correct), explanation: `${value} ÷ ${percent} × 100 = ${correct}.`
      };
    }
    const correct = value;
    return {
      id: `percent-value-${percent}-${base}`,
      prompt: `Wie viel sind ${percent} % von ${base}?`,
      options: uniqueNumericOptions(correct, [correct + 5, correct - 5, correct + 10, correct * 2, base - correct]).map(String),
      correct: String(correct), explanation: `${base} × ${percent / 100} = ${correct}.`
    };
  }

  function mentalQuestion() {
    const level = state.level;
    if (level === 'easy') {
      const a = randomInt(12, 80); const b = randomInt(4, 35); const add = state.rng() > .45;
      const correct = add ? a + b : Math.max(a, b) - Math.min(a, b);
      const prompt = add ? `${a} + ${b} = ?` : `${Math.max(a, b)} − ${Math.min(a, b)} = ?`;
      return { id: `mental-easy-${prompt}`, prompt, options: uniqueNumericOptions(correct, [correct + 1, correct - 1, correct + 10, correct - 10]), correct: String(correct), explanation: `Das Ergebnis ist ${correct}.` };
    }
    if (level === 'medium') {
      const useDivision = state.rng() > .55; const a = randomInt(3, 12); const b = randomInt(3, 12); const product = a * b;
      const prompt = useDivision ? `${product} ÷ ${a} = ?` : `${a} × ${b} = ?`; const correct = useDivision ? b : product;
      return { id: `mental-medium-${prompt}`, prompt, options: uniqueNumericOptions(correct, [correct + 1, correct - 1, correct + a, correct + b]), correct: String(correct), explanation: `Das Ergebnis ist ${correct}.` };
    }
    const a = randomInt(4, 15); const b = randomInt(3, 12); const c = randomInt(2, 9); const plus = state.rng() > .5;
    const correct = a * b + (plus ? c : -c); const prompt = `${a} × ${b} ${plus ? '+' : '−'} ${c} = ?`;
    return { id: `mental-hard-${prompt}`, prompt, options: uniqueNumericOptions(correct, [correct + c, correct - c, a * (b + c), (a + b) * c]), correct: String(correct), explanation: `Zuerst multiplizieren, dann ${plus ? 'addieren' : 'subtrahieren'}: ${correct}.` };
  }

  function wordClassQuestion() {
    const [word, correct, sentence] = pick(WORD_ITEMS[state.level]);
    const pool = WORD_OPTIONS[state.level];
    const distractors = shuffle(pool.filter(option => option !== correct)).slice(0, 3);
    return {
      id: `word-${state.level}-${word}-${sentence}`,
      prompt: `${sentence} Welche Wortart ist „${word}“ in diesem Satz?`,
      options: shuffle([correct, ...distractors]), correct,
      explanation: `„${word}“ ist hier ein ${correct}.`
    };
  }

  function generateQuestion() {
    const factory = state.topic === 'percent' ? percentQuestion : state.topic === 'mental' ? mentalQuestion : wordClassQuestion;
    let question = factory();
    for (let attempt = 0; attempt < 8 && state.seen.has(question.id); attempt += 1) question = factory();
    state.seen.add(question.id);
    return question;
  }

  function resetRuntime() {
    state.rng = mulberry32(state.seed);
    state.startedAt = 0; state.endsAt = 0; state.questionStartedAt = 0; state.questionIndex = 0;
    state.currentQuestion = null; state.locked = false; state.finished = false; state.correct = 0; state.total = 0;
    state.streak = 0; state.bestStreak = 0; state.score = 0; state.events = []; state.seen = new Set();
    clearInterval(state.timerId); state.timerId = null;
  }

  function showView(view) {
    for (const el of [els.setupView, els.quizView, els.resultView]) el.hidden = el !== view;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function modeValue() {
    return els.modeChallenge.checked ? 'challenge' : 'practice';
  }

  function updateModeUI() {
    state.mode = modeValue();
    els.challengeTools.hidden = state.mode !== 'challenge';
    els.copyChallengeBtn.hidden = state.mode !== 'challenge';
    renderBest();
  }

  function renderRoundCode() {
    els.roundCode.textContent = roundCode();
  }

  function bestStorageKey() {
    const cfg = currentConfig();
    return state.mode === 'challenge'
      ? `gradecrew-fastquiz:v2:challenge:${roundCode(cfg)}`
      : `gradecrew-fastquiz:v2:practice:${cfg.topic}:${cfg.level}:${cfg.durationMin}`;
  }

  function readBest() {
    try { return JSON.parse(localStorage.getItem(bestStorageKey()) || 'null'); } catch { return null; }
  }

  function renderBest() {
    const best = readBest();
    els.bestValue.textContent = best ? best.score.toLocaleString('de-DE') : '–';
    els.bestLabel.textContent = state.mode === 'challenge' ? 'Dein Bestwert in dieser Challenge' : 'Dein persönlicher Bestwert';
  }

  function saveBest(summary) {
    const old = readBest();
    const isBest = !old || summary.score > old.score || (summary.score === old.score && summary.accuracy > old.accuracy);
    if (isBest) {
      localStorage.setItem(bestStorageKey(), JSON.stringify({ ...summary, savedAt: new Date().toISOString() }));
    }
    return { isBest, previous: old };
  }

  function syncConfigFromSetup() {
    state.topic = els.topic.value;
    state.level = els.level.value;
    state.durationSec = selectedDuration() * 60;
    state.mode = modeValue();
  }

  function startRound() {
    syncConfigFromSetup();
    resetRuntime();
    els.activeTopic.textContent = TOPICS[state.topic].short;
    els.activeRoundCode.textContent = roundCode({ topic: state.topic, level: state.level, durationMin: state.durationSec / 60, seed: state.seed });
    els.difficultyLabel.textContent = LEVELS[state.level].label;
    updateCounters();
    showView(els.quizView);
    state.startedAt = Date.now(); state.endsAt = state.startedAt + state.durationSec * 1000;
    updateTimer(); state.timerId = setInterval(updateTimer, 250); nextQuestion();
  }

  function nextQuestion() {
    if (state.finished || Date.now() >= state.endsAt) return finishRound();
    state.locked = false; state.questionIndex += 1; state.currentQuestion = generateQuestion(); state.questionStartedAt = Date.now();
    els.questionNumber.textContent = `Aufgabe ${state.questionIndex}`; els.questionTitle.textContent = state.currentQuestion.prompt;
    els.feedback.textContent = ''; els.feedback.className = 'feedback'; els.answers.replaceChildren();
    state.currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'answerButton'; button.dataset.answer = option;
      button.innerHTML = `<span class="answerKey">${index + 1}</span><span></span>`; button.lastElementChild.textContent = option;
      button.addEventListener('click', () => answerQuestion(option, button)); els.answers.append(button);
    });
  }

  function answerQuestion(answer, button) {
    if (state.locked || state.finished) return;
    state.locked = true; const now = Date.now(); const latencyMs = Math.max(0, now - state.questionStartedAt);
    const isCorrect = answer === state.currentQuestion.correct; state.total += 1;
    if (isCorrect) {
      state.correct += 1; state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak);
      const speedBonus = Math.max(0, 50 - Math.floor(latencyMs / 200)); const streakBonus = Math.min(50, Math.max(0, state.streak - 1) * 5);
      state.score += 100 + speedBonus + streakBonus; els.feedback.textContent = state.currentQuestion.explanation; els.feedback.className = 'feedback good';
    } else {
      state.streak = 0; els.feedback.textContent = `Richtig wäre: ${state.currentQuestion.correct}. ${state.currentQuestion.explanation}`; els.feedback.className = 'feedback bad';
    }
    for (const answerButton of els.answers.querySelectorAll('.answerButton')) {
      answerButton.disabled = true; if (answerButton.dataset.answer === state.currentQuestion.correct) answerButton.classList.add('isCorrect');
    }
    if (!isCorrect) button.classList.add('isWrong');
    state.events.push({ n: state.questionIndex, questionId: state.currentQuestion.id, answer, correctAnswer: state.currentQuestion.correct, correct: isCorrect, latencyMs });
    updateCounters(); window.setTimeout(() => { if (!state.finished) nextQuestion(); }, 520);
  }

  function updateCounters() {
    els.correctCount.textContent = state.correct; els.streakCount.textContent = state.streak; els.scoreCount.textContent = state.score.toLocaleString('de-DE');
  }

  function updateTimer() {
    const remainingMs = Math.max(0, state.endsAt - Date.now()); const remainingSec = Math.ceil(remainingMs / 1000);
    els.timer.textContent = `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`;
    const progress = state.durationSec ? remainingMs / (state.durationSec * 1000) : 0;
    els.timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    if (remainingMs <= 0) finishRound();
  }

  function finishRound() {
    if (state.finished) return;
    state.finished = true; clearInterval(state.timerId); state.timerId = null;
    for (const button of els.answers.querySelectorAll('button')) button.disabled = true;
    const minutes = Math.round(state.durationSec / 60); const accuracy = state.total ? Math.round(state.correct / state.total * 100) : 0;
    const summary = { answered: state.total, correct: state.correct, accuracy, bestStreak: state.bestStreak, score: state.score };
    const best = saveBest(summary);
    els.resultSummary.textContent = `Du hast in ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'} ${state.total} ${state.total === 1 ? 'Aufgabe' : 'Aufgaben'} bearbeitet.`;
    els.resultCorrect.textContent = `${state.correct} / ${state.total}`; els.resultAccuracy.textContent = `${accuracy} %`; els.resultStreak.textContent = state.bestStreak; els.resultScore.textContent = state.score.toLocaleString('de-DE');
    els.resultBest.textContent = best.isBest ? (best.previous ? `Neuer Bestwert · vorher ${best.previous.score.toLocaleString('de-DE')}` : 'Erster Bestwert gespeichert') : `Bestwert: ${best.previous.score.toLocaleString('de-DE')} Punkte`;
    els.copyResultChallengeBtn.hidden = state.mode !== 'challenge';
    els.sessionDump.textContent = JSON.stringify({ format: 'gradecrew-fast-quiz-session/v2', mode: state.mode, roundCode: roundCode({ topic: state.topic, level: state.level, durationMin: minutes, seed: state.seed }), seed: state.seed, topic: state.topic, level: state.level, durationSec: state.durationSec, summary, events: state.events }, null, 2);
    showView(els.resultView);
  }

  function refreshSetup() {
    state.mode = modeValue(); renderRoundCode(); updateModeUI(); renderBest();
  }

  els.setupForm.addEventListener('submit', event => { event.preventDefault(); startRound(); });
  els.modePractice.addEventListener('change', refreshSetup); els.modeChallenge.addEventListener('change', refreshSetup);
  els.topic.addEventListener('change', refreshSetup); els.level.addEventListener('change', refreshSetup);
  document.querySelectorAll('input[name="duration"]').forEach(input => input.addEventListener('change', refreshSetup));

  els.rerollSeedBtn.addEventListener('click', () => { state.seed = createSeed(); refreshSetup(); });
  els.loadChallengeBtn.addEventListener('click', () => {
    if (!applyCode(els.joinCode.value)) {
      els.joinCode.setCustomValidity('Bitte einen gültigen Fast-Quiz-Code eingeben.'); els.joinCode.reportValidity(); els.joinCode.setCustomValidity('');
    }
  });
  els.joinCode.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); els.loadChallengeBtn.click(); } });
  els.copyChallengeBtn.addEventListener('click', () => copyChallengeLink(els.copyChallengeBtn));
  els.copyResultChallengeBtn.addEventListener('click', () => copyChallengeLink(els.copyResultChallengeBtn));

  els.sameRoundBtn.addEventListener('click', () => startRound());
  els.newRoundBtn.addEventListener('click', () => { state.seed = createSeed(); renderRoundCode(); startRound(); });
  els.settingsBtn.addEventListener('click', () => { resetRuntime(); refreshSetup(); showView(els.setupView); });

  document.addEventListener('keydown', event => {
    if (els.quizView.hidden || state.locked || state.finished) return;
    const index = Number(event.key) - 1; const buttons = [...els.answers.querySelectorAll('.answerButton')];
    if (index >= 0 && index < buttons.length) buttons[index].click();
  });

  const incomingCode = new URL(window.location.href).searchParams.get('code');
  if (incomingCode) {
    els.joinCode.value = incomingCode.toUpperCase();
    applyCode(incomingCode);
  } else {
    refreshSetup();
  }
})();
