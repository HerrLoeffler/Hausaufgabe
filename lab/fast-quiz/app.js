(() => {
  'use strict';

  const TOPICS = {
    percent: { label: 'Mathematik · Prozentrechnung', short: 'Prozentrechnung' },
    mental: { label: 'Mathematik · Kopfrechnen', short: 'Kopfrechnen' },
    wordclass: { label: 'Deutsch · Wortarten', short: 'Wortarten' }
  };

  const LEVELS = {
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Anspruchsvoll'
  };

  const WORD_ITEMS = {
    easy: [
      ['Hund', 'Nomen', 'Der Hund schläft.'], ['laufen', 'Verb', 'Wir laufen zur Schule.'],
      ['freundlich', 'Adjektiv', 'Sie ist freundlich.'], ['Schule', 'Nomen', 'Die Schule beginnt.'],
      ['denken', 'Verb', 'Ich muss kurz denken.'], ['leise', 'Adjektiv', 'Die Musik ist leise.'],
      ['Fenster', 'Nomen', 'Das Fenster ist offen.'], ['schreiben', 'Verb', 'Wir schreiben heute.'],
      ['mutig', 'Adjektiv', 'Das war mutig.'], ['Wasser', 'Nomen', 'Das Wasser ist kalt.']
    ],
    medium: [
      ['wir', 'Pronomen', 'Wir beginnen jetzt.'], ['gestern', 'Adverb', 'Gestern war Montag.'],
      ['schnell', 'Adjektiv', 'Das schnelle Fahrrad ist neu.'], ['arbeiten', 'Verb', 'Sie arbeiten konzentriert.'],
      ['Gedanke', 'Nomen', 'Der Gedanke gefällt mir.'], ['dort', 'Adverb', 'Dort steht mein Fahrrad.'],
      ['ihnen', 'Pronomen', 'Ich helfe ihnen.'], ['deutlich', 'Adjektiv', 'Die deutliche Antwort überzeugt.'],
      ['entscheiden', 'Verb', 'Wir entscheiden gemeinsam.'], ['heute', 'Adverb', 'Heute schreiben wir einen Test.'],
      ['mein', 'Pronomen', 'Das ist mein Heft.'], ['Lösung', 'Nomen', 'Die Lösung stimmt.']
    ],
    hard: [
      ['obwohl', 'Konjunktion', 'Obwohl es regnet, gehen wir.'], ['unter', 'Präposition', 'Das Heft liegt unter dem Tisch.'],
      ['deshalb', 'Adverb', 'Deshalb komme ich später.'], ['welcher', 'Pronomen', 'Welcher gehört dir?'],
      ['während', 'Präposition', 'Während des Unterrichts ist es ruhig.'], ['aber', 'Konjunktion', 'Ich komme, aber etwas später.'],
      ['gegenüber', 'Präposition', 'Die Schule liegt gegenüber dem Park.'], ['dennoch', 'Adverb', 'Dennoch versuchte er es erneut.'],
      ['dessen', 'Pronomen', 'Das ist der Schüler, dessen Heft fehlt.'], ['falls', 'Konjunktion', 'Falls du Zeit hast, komm vorbei.'],
      ['zwischen', 'Präposition', 'Der Ball liegt zwischen den Stühlen.'], ['damit', 'Konjunktion', 'Ich übe, damit ich sicherer werde.']
    ]
  };

  const WORD_OPTIONS = {
    easy: ['Nomen', 'Verb', 'Adjektiv', 'Pronomen'],
    medium: ['Nomen', 'Verb', 'Adjektiv', 'Pronomen', 'Adverb'],
    hard: ['Pronomen', 'Adverb', 'Präposition', 'Konjunktion', 'Adjektiv']
  };

  const els = Object.fromEntries([
    'setupView', 'quizView', 'resultView', 'setupForm', 'topic', 'level', 'rerollSeedBtn', 'roundCode',
    'activeTopic', 'activeRoundCode', 'timerFill', 'timer', 'correctCount', 'streakCount', 'scoreCount',
    'questionNumber', 'difficultyLabel', 'questionTitle', 'answers', 'feedback', 'resultSummary', 'resultCorrect',
    'resultAccuracy', 'resultStreak', 'resultScore', 'againBtn', 'settingsBtn', 'sessionDump'
  ].map(id => [id, document.getElementById(id)]));

  const state = {
    seed: createSeed(), rng: null, durationSec: 180, topic: 'percent', level: 'medium',
    startedAt: 0, endsAt: 0, questionStartedAt: 0, timerId: null, questionIndex: 0,
    currentQuestion: null, locked: false, finished: false, correct: 0, total: 0,
    streak: 0, bestStreak: 0, score: 0, events: [], seen: new Set()
  };

  function createSeed() {
    return Math.floor(Math.random() * (36 ** 5));
  }

  function codeFromSeed(seed) {
    return `FAST-${seed.toString(36).toUpperCase().padStart(5, '0').slice(-5)}`;
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
        correct: `${correct} %`,
        explanation: `${value} ÷ ${base} × 100 = ${correct} %.`
      };
    }

    if (mode === 'base') {
      const correct = base;
      return {
        id: `percent-base-${percent}-${value}`,
        prompt: `${percent} % entsprechen ${value}. Wie groß ist der Grundwert?`,
        options: uniqueNumericOptions(correct, [correct + 40, correct - 40, correct + 80, value * 100 / Math.max(1, percent + 5)]).map(v => `${v}`),
        correct: `${correct}`,
        explanation: `${value} ÷ ${percent} × 100 = ${correct}.`
      };
    }

    const correct = value;
    return {
      id: `percent-value-${percent}-${base}`,
      prompt: `Wie viel sind ${percent} % von ${base}?`,
      options: uniqueNumericOptions(correct, [correct + 5, correct - 5, correct + 10, correct * 2, base - correct]).map(String),
      correct: String(correct),
      explanation: `${base} × ${percent / 100} = ${correct}.`
    };
  }

  function mentalQuestion() {
    const level = state.level;
    if (level === 'easy') {
      const a = randomInt(12, 80);
      const b = randomInt(4, 35);
      const add = state.rng() > .45;
      const correct = add ? a + b : Math.max(a, b) - Math.min(a, b);
      const prompt = add ? `${a} + ${b} = ?` : `${Math.max(a, b)} − ${Math.min(a, b)} = ?`;
      return {
        id: `mental-easy-${prompt}`,
        prompt,
        options: uniqueNumericOptions(correct, [correct + 1, correct - 1, correct + 10, correct - 10]),
        correct: String(correct),
        explanation: `Das Ergebnis ist ${correct}.`
      };
    }

    if (level === 'medium') {
      const useDivision = state.rng() > .55;
      const a = randomInt(3, 12);
      const b = randomInt(3, 12);
      const correct = a * b;
      const prompt = useDivision ? `${correct} ÷ ${a} = ?` : `${a} × ${b} = ?`;
      const answer = useDivision ? b : correct;
      return {
        id: `mental-medium-${prompt}`,
        prompt,
        options: uniqueNumericOptions(answer, [answer + 1, answer - 1, answer + a, answer + b]),
        correct: String(answer),
        explanation: `Das Ergebnis ist ${answer}.`
      };
    }

    const a = randomInt(4, 15);
    const b = randomInt(3, 12);
    const c = randomInt(2, 9);
    const plus = state.rng() > .5;
    const correct = a * b + (plus ? c : -c);
    const prompt = `${a} × ${b} ${plus ? '+' : '−'} ${c} = ?`;
    return {
      id: `mental-hard-${prompt}`,
      prompt,
      options: uniqueNumericOptions(correct, [correct + c, correct - c, a * (b + c), (a + b) * c]),
      correct: String(correct),
      explanation: `Zuerst multiplizieren, dann ${plus ? 'addieren' : 'subtrahieren'}: ${correct}.`
    };
  }

  function wordClassQuestion() {
    const item = pick(WORD_ITEMS[state.level]);
    const [word, correct, sentence] = item;
    const pool = WORD_OPTIONS[state.level];
    const distractors = shuffle(pool.filter(option => option !== correct)).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    return {
      id: `word-${state.level}-${word}-${sentence}`,
      prompt: `${sentence} Welche Wortart ist „${word}“ in diesem Satz?`,
      options,
      correct,
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

  function resetRound({ newSeed = false } = {}) {
    if (newSeed) state.seed = createSeed();
    state.rng = mulberry32(state.seed);
    state.startedAt = 0;
    state.endsAt = 0;
    state.questionStartedAt = 0;
    state.questionIndex = 0;
    state.currentQuestion = null;
    state.locked = false;
    state.finished = false;
    state.correct = 0;
    state.total = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.score = 0;
    state.events = [];
    state.seen = new Set();
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function showView(view) {
    for (const el of [els.setupView, els.quizView, els.resultView]) el.hidden = el !== view;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderSeed() {
    els.roundCode.textContent = codeFromSeed(state.seed);
  }

  function selectedDuration() {
    const input = document.querySelector('input[name="duration"]:checked');
    return Number(input?.value || 3);
  }

  function startRound() {
    state.topic = els.topic.value;
    state.level = els.level.value;
    state.durationSec = selectedDuration() * 60;
    resetRound();

    els.activeTopic.textContent = TOPICS[state.topic].short;
    els.activeRoundCode.textContent = codeFromSeed(state.seed);
    els.difficultyLabel.textContent = LEVELS[state.level];
    updateCounters();
    showView(els.quizView);

    state.startedAt = Date.now();
    state.endsAt = state.startedAt + state.durationSec * 1000;
    updateTimer();
    state.timerId = setInterval(updateTimer, 250);
    nextQuestion();
  }

  function nextQuestion() {
    if (state.finished || Date.now() >= state.endsAt) return finishRound();
    state.locked = false;
    state.questionIndex += 1;
    state.currentQuestion = generateQuestion();
    state.questionStartedAt = Date.now();

    els.questionNumber.textContent = `Aufgabe ${state.questionIndex}`;
    els.questionTitle.textContent = state.currentQuestion.prompt;
    els.feedback.textContent = '';
    els.feedback.className = 'feedback';
    els.answers.replaceChildren();

    state.currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answerButton';
      button.dataset.answer = option;
      button.innerHTML = `<span class="answerKey">${index + 1}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener('click', () => answerQuestion(option, button));
      els.answers.append(button);
    });
  }

  function answerQuestion(answer, button) {
    if (state.locked || state.finished) return;
    state.locked = true;
    const now = Date.now();
    const latencyMs = Math.max(0, now - state.questionStartedAt);
    const isCorrect = answer === state.currentQuestion.correct;
    state.total += 1;

    if (isCorrect) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const speedBonus = Math.max(0, 50 - Math.floor(latencyMs / 200));
      const streakBonus = Math.min(50, Math.max(0, state.streak - 1) * 5);
      state.score += 100 + speedBonus + streakBonus;
      els.feedback.textContent = state.currentQuestion.explanation;
      els.feedback.className = 'feedback good';
    } else {
      state.streak = 0;
      els.feedback.textContent = `Richtig wäre: ${state.currentQuestion.correct}. ${state.currentQuestion.explanation}`;
      els.feedback.className = 'feedback bad';
    }

    for (const answerButton of els.answers.querySelectorAll('.answerButton')) {
      answerButton.disabled = true;
      if (answerButton.dataset.answer === state.currentQuestion.correct) answerButton.classList.add('isCorrect');
    }
    if (!isCorrect) button.classList.add('isWrong');

    state.events.push({
      n: state.questionIndex,
      questionId: state.currentQuestion.id,
      answer,
      correctAnswer: state.currentQuestion.correct,
      correct: isCorrect,
      latencyMs
    });
    updateCounters();

    window.setTimeout(() => {
      if (!state.finished) nextQuestion();
    }, 520);
  }

  function updateCounters() {
    els.correctCount.textContent = state.correct;
    els.streakCount.textContent = state.streak;
    els.scoreCount.textContent = state.score.toLocaleString('de-DE');
  }

  function updateTimer() {
    const remainingMs = Math.max(0, state.endsAt - Date.now());
    const remainingSec = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    els.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const progress = state.durationSec ? remainingMs / (state.durationSec * 1000) : 0;
    els.timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    if (remainingMs <= 0) finishRound();
  }

  function finishRound() {
    if (state.finished) return;
    state.finished = true;
    clearInterval(state.timerId);
    state.timerId = null;
    for (const button of els.answers.querySelectorAll('button')) button.disabled = true;

    const minutes = Math.round(state.durationSec / 60);
    const accuracy = state.total ? Math.round(state.correct / state.total * 100) : 0;
    els.resultSummary.textContent = `Du hast in ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'} ${state.total} ${state.total === 1 ? 'Aufgabe' : 'Aufgaben'} bearbeitet.`;
    els.resultCorrect.textContent = `${state.correct} / ${state.total}`;
    els.resultAccuracy.textContent = `${accuracy} %`;
    els.resultStreak.textContent = state.bestStreak;
    els.resultScore.textContent = state.score.toLocaleString('de-DE');

    const dump = {
      format: 'gradecrew-fast-quiz-session/v1',
      roundCode: codeFromSeed(state.seed),
      seed: state.seed,
      topic: state.topic,
      level: state.level,
      durationSec: state.durationSec,
      summary: { answered: state.total, correct: state.correct, accuracy, bestStreak: state.bestStreak, score: state.score },
      events: state.events
    };
    els.sessionDump.textContent = JSON.stringify(dump, null, 2);
    showView(els.resultView);
  }

  els.setupForm.addEventListener('submit', event => {
    event.preventDefault();
    startRound();
  });

  els.rerollSeedBtn.addEventListener('click', () => {
    state.seed = createSeed();
    renderSeed();
  });

  els.againBtn.addEventListener('click', () => {
    state.seed = createSeed();
    renderSeed();
    startRound();
  });

  els.settingsBtn.addEventListener('click', () => {
    resetRound();
    renderSeed();
    showView(els.setupView);
  });

  document.addEventListener('keydown', event => {
    if (els.quizView.hidden || state.locked || state.finished) return;
    const index = Number(event.key) - 1;
    const buttons = [...els.answers.querySelectorAll('.answerButton')];
    if (index >= 0 && index < buttons.length) buttons[index].click();
  });

  renderSeed();
})();
