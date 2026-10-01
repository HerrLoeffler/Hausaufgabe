(() => {
  'use strict';

  const D = window.GradeCrewEscapePrototype;
  const Tutor = window.GradeCrewEscapeTutor;
  if (!D) throw new Error('Escape-Room-Daten fehlen.');

  const $ = id => document.getElementById(id);
  const KEY = `gradecrew-escape-save:${D.world.id}:${D.world.version}`;
  const clone = value => JSON.parse(JSON.stringify(value));
  let questionBank = D.questions.map(clone);

  const fresh = () => ({
    version: D.world.version,
    startedAt: null,
    activeSeconds: 0,
    room: 'classroom',
    completedQuestions: [],
    attempts: {},
    transferAttempts: {},
    remediationStage: {},
    remediationCompleted: {},
    inventory: [],
    selectedItem: null,
    puzzleAttempts: {},
    clueReviewRequired: {},
    flags: {
      deskOpened: false,
      flashlightFound: false,
      flashlightReady: false,
      code4: false,
      code7: false,
      code8: false,
      classroomDoorOpen: false,
      lockerHint: false,
      lockerSolved: false,
      accessCard: false,
      officeDoorOpen: false,
      officeSequenceKnown: false,
      keyBoardSolved: false,
      mainKey: false,
      finalAuthorized: false,
      gameComplete: false
    },
    hintsUsed: 0,
    puzzleCompletions: 0,
    currentHintStep: 0,
    feedback: null
  });

  let S = fresh();
  let activeQuestion = null;
  let activePuzzle = null;
  let puzzleInput = [];
  let timer = null;
  let lastTick = Date.now();
  let docActive = !document.hidden;
  let teacherEditId = null;

  function event(name, detail = {}) {
    window.dispatchEvent(new CustomEvent('gradecrew:escape-event', {
      detail: {
        name,
        worldId: D.world.id,
        worldVersion: D.world.version,
        room: S.room,
        ...detail
      }
    }));
  }

  function currentCheck() {
    return D.validateWorldDefinition(D.world, questionBank);
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return saved?.version === D.world.version && saved.startedAt && !saved.flags?.gameComplete ? saved : null;
    } catch {
      return null;
    }
  }

  function clearSave() {
    try { localStorage.removeItem(KEY); } catch {}
  }

  function show(id) {
    ['homeView', 'gameView', 'resultView'].forEach(viewId => {
      $(viewId).hidden = viewId !== id;
    });
  }

  function msg(text) {
    $('messageBar').textContent = text;
  }

  function fmt(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function q(id) {
    return questionBank.find(question => question.id === id);
  }

  function done(id) {
    return S.completedQuestions.includes(id);
  }

  function markDone(id) {
    if (!done(id)) S.completedQuestions.push(id);
    save();
    renderProgress();
  }

  function renderProgress() {
    const count = S.completedQuestions.length;
    $('progressText').textContent = `${count} / ${questionBank.length} Fragen`;
    $('progressFill').style.width = `${Math.round(count / questionBank.length * 100)}%`;
  }

  function startTimer() {
    stopTimer();
    lastTick = Date.now();
    timer = setInterval(() => {
      const now = Date.now();
      if (docActive && !S.flags.gameComplete && !$('gameView').hidden) {
        S.activeSeconds += Math.max(0, Math.round((now - lastTick) / 1000));
        $('timer').textContent = fmt(S.activeSeconds);
        if (S.activeSeconds % 10 === 0) save();
      }
      lastTick = now;
    }, 1000);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  document.addEventListener('visibilitychange', () => {
    docActive = !document.hidden;
    lastTick = Date.now();
  });

  function addItem(id, label, icon) {
    if (!S.inventory.some(item => item.id === id)) {
      S.inventory.push({ id, label, icon });
      event('item.collected', { itemId: id });
      save();
    }
    renderInventory();
  }

  function removeItem(id) {
    S.inventory = S.inventory.filter(item => item.id !== id);
    if (S.selectedItem === id) S.selectedItem = null;
    save();
    renderInventory();
  }

  function renderInventory() {
    const container = $('inventory');
    container.replaceChildren();
    $('inventoryCount').textContent = `${S.inventory.length} / 3`;

    if (!S.inventory.length) {
      const empty = document.createElement('p');
      empty.className = 'emptyText';
      empty.textContent = 'Noch leer.';
      container.append(empty);
      return;
    }

    for (const item of S.inventory) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'inventoryItem';
      button.classList.toggle('selected', S.selectedItem === item.id);
      button.setAttribute('aria-pressed', String(S.selectedItem === item.id));
      button.textContent = `${item.icon} ${item.label}`;
      button.onclick = () => {
        S.selectedItem = S.selectedItem === item.id ? null : item.id;
        renderInventory();
        msg(S.selectedItem ? `${item.label} ausgewählt. Tippe jetzt auf ein passendes Ziel.` : 'Auswahl aufgehoben.');
      };
      container.append(button);
    }
  }

  function setRoom(room) {
    S.room = room;
    S.currentHintStep = 0;
    $('roomScene').className = `roomScene room-${room}`;
    const index = D.world.rooms.findIndex(entry => entry.id === room);
    $('roomEyebrow').textContent = `RAUM ${index + 1} VON ${D.world.rooms.length}`;
    $('roomTitle').textContent = D.world.rooms[index].label;
    moveExplorer('center');
    renderMission();
    renderHotspots();
    save();
    event('room.entered', { roomId: room });
  }

  function renderHotspots() {
    document.querySelectorAll('.hotspot').forEach(button => button.classList.remove('completed'));
    const mark = action => document.querySelector(`[data-action="${action}"]`)?.classList.add('completed');

    if (S.room === 'classroom') {
      if (done('q1')) mark('desk');
      if (S.flags.flashlightReady) mark('cabinet');
      if (done('q2')) mark('shelf');
      if (done('q3')) mark('computer');
      if (S.flags.code8) mark('board');
      if (S.flags.classroomDoorOpen) mark('door');
    } else if (S.room === 'hallway') {
      if (S.flags.lockerSolved) mark('desk');
      if (done('q4')) mark('shelf');
      if (S.flags.officeDoorOpen) mark('door');
    } else {
      if (done('q6')) mark('computer');
      if (S.flags.keyBoardSolved) mark('shelf');
      if (done('q7')) mark('cabinet');
      if (S.flags.finalAuthorized) mark('door');
    }
  }

  function renderMission() {
    let text = '';
    if (S.room === 'classroom') {
      text = !S.flags.deskOpened
        ? 'Untersuche das Lehrerpult.'
        : !S.flags.flashlightReady
          ? 'Die Batterie muss irgendwo nützlich sein.'
          : !(S.flags.code4 && S.flags.code7 && S.flags.code8)
            ? 'Finde alle drei Teile des Türcodes.'
            : 'Öffne die Klassenzimmertür mit dem vollständigen Code.';
      $('codeDisplay').hidden = !(S.flags.code4 && S.flags.code7 && S.flags.code8);
    } else if (S.room === 'hallway') {
      $('codeDisplay').hidden = true;
      text = !S.flags.lockerHint
        ? 'Suche nach einem Hinweis auf den richtigen Spind.'
        : !S.flags.accessCard
          ? 'Öffne Spind 12 und finde die Zugangskarte.'
          : !S.flags.officeDoorOpen
            ? 'Nutze die Zugangskarte am Sekretariat.'
            : 'Betritt das Sekretariat.';
    } else {
      $('codeDisplay').hidden = true;
      text = !S.flags.officeSequenceKnown
        ? 'Aktiviere den Sekretariatscomputer.'
        : !S.flags.keyBoardSolved
          ? 'Nutze die Symbolfolge am Schlüsselbrett.'
          : !S.flags.mainKey
            ? 'Öffne den Notfallkasten.'
            : !S.flags.finalAuthorized
              ? 'Gehe zur Notentriegelung.'
              : 'Drücke die Notentriegelung.';
    }

    $('missionText').textContent = text;
  }

  const solvedHandlers = {
    q1Battery() {
      S.flags.deskOpened = true;
      addItem('battery', 'Batterie', '🔋');
      msg('Die Schublade öffnet sich. Du findest eine Batterie.');
    },
    q2Code() {
      S.flags.code4 = true;
      msg('Unter dem Regal leuchtet die Zahl 4 auf. Codefragment gefunden.');
    },
    q3Code() {
      S.flags.code7 = true;
      msg('Der Computer zeigt die Zahl 7. Codefragment gefunden.');
    },
    q4Locker() {
      S.flags.lockerHint = true;
      msg('Am Schwarzen Brett steht: „Fach 12 enthält einen wichtigen Hinweis.“');
    },
    q5Office() {
      removeItem('access-card');
      S.flags.officeDoorOpen = true;
      msg('Sicherheitsprüfung bestanden. Die Sekretariatstür ist entriegelt.');
    },
    q6Sequence() {
      S.flags.officeSequenceKnown = true;
      msg('Der Computer zeigt die Folge ★ ◆ ●.');
    },
    q7Key() {
      S.flags.mainKey = true;
      addItem('main-key', 'Hauptschlüssel', '🔑');
      msg('Der Hauptschlüssel wird freigegeben.');
    },
    q8Final() {
      removeItem('main-key');
      S.flags.finalAuthorized = true;
      msg('Letzte Prüfung bestanden. Drücke jetzt die Notentriegelung.');
    }
  };

  function shuffledOptions(question) {
    const list = question.options.map((text, originalIndex) => ({ text, originalIndex }));
    for (let index = list.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [list[index], list[swap]] = [list[swap], list[index]];
    }
    return list;
  }

  function resetQuestionUi() {
    $('questionFeedback').hidden = true;
    $('questionFeedback').className = 'questionFeedback';
    $('remyHelp').hidden = true;
    $('remyAnswer').hidden = true;
    $('remyAnswer').textContent = '';
    $('remyQuestion').value = '';
    $('questionHintBtn').hidden = false;
    $('questionHintBtn').textContent = 'Fachlicher Hinweis';
    $('submitAnswerBtn').textContent = 'Antwort prüfen';
  }

  function renderChoiceOptions(question) {
    const nodes = shuffledOptions(question).map(option => {
      const label = document.createElement('label');
      label.className = 'answerOption';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = String(option.originalIndex);
      const text = document.createElement('span');
      text.textContent = option.text;
      label.append(radio, text);
      return label;
    });
    $('questionOptions').replaceChildren(...nodes);
  }

  function openQuestion(id, handler) {
    if (done(id)) {
      msg('Diese Lernaufgabe ist bereits gelöst.');
      return;
    }

    const question = q(id);
    if (!question) return;
    activeQuestion = { id, handler, phase: 'main' };
    resetQuestionUi();

    if (S.remediationStage[id] === 'copy') {
      renderRemediation(question);
    } else if (S.remediationStage[id] === 'transfer') {
      renderTransfer(question);
    } else {
      $('questionTitle').textContent = `Aufgabe ${id.slice(1)}`;
      $('questionPrompt').textContent = question.prompt;
      renderChoiceOptions(question);
    }

    $('questionDialog').showModal();
    event('question.presented', { questionId: id, phase: activeQuestion.phase });
  }

  function showFeedback(text, kind = '') {
    const box = $('questionFeedback');
    box.hidden = false;
    box.className = `questionFeedback${kind ? ` ${kind}` : ''}`;
    box.textContent = text;
  }

  function normalizeAnswer(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[€]/g, ' euro ')
      .replace(/[×x]/g, ' mal ')
      .replace(/\s+/g, ' ')
      .replace(/\s*([=%/+\-])\s*/g, '$1')
      .trim();
  }

  function copyMatches(input, expected) {
    const a = normalizeAnswer(input).replace(/[.,;:!?]/g, '');
    const b = normalizeAnswer(expected).replace(/[.,;:!?]/g, '');
    if (a === b) return true;
    const words = b.split(' ').filter(Boolean);
    if (!words.length || a.length < b.length * 0.72) return false;
    return words.filter(word => a.includes(word)).length / words.length >= 0.88;
  }

  function beginRemediation(question, reason) {
    S.remediationStage[question.id] = 'copy';
    save();
    renderRemediation(question);
    event('remediation.started', { questionId: question.id, reason });
  }

  function renderRemediation(question) {
    activeQuestion.phase = 'remediation';
    $('questionTitle').textContent = 'Kurz verstehen, dann weiter';
    $('questionPrompt').textContent = question.remediation.explanation;
    $('questionHintBtn').hidden = true;
    $('submitAnswerBtn').textContent = 'Lerncheck starten';
    $('remyHelp').hidden = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'activeLearningTask';

    const instruction = document.createElement('strong');
    instruction.textContent = question.remediation.activeTask.instruction;

    const target = document.createElement('div');
    target.className = 'copyTarget';
    target.textContent = question.remediation.activeTask.text;

    const input = document.createElement('textarea');
    input.id = 'remediationInput';
    input.rows = 2;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = 'Hier eintippen …';

    wrapper.append(instruction, target, input);
    $('questionOptions').replaceChildren(wrapper);
  }

  function renderTransfer(question) {
    activeQuestion.phase = 'transfer';
    S.remediationStage[question.id] = 'transfer';
    save();

    $('questionTitle').textContent = 'Neue Aufgabe – zeig, dass es sitzt';
    $('questionPrompt').textContent = question.remediation.transfer.prompt;
    $('questionHintBtn').hidden = false;
    $('questionHintBtn').textContent = 'Transfer-Hinweis';
    $('submitAnswerBtn').textContent = 'Neue Aufgabe prüfen';
    $('remyHelp').hidden = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'activeLearningTask transferTask';
    const input = document.createElement('input');
    input.id = 'transferInput';
    input.type = 'text';
    input.autocomplete = 'off';
    input.inputMode = 'text';
    input.placeholder = 'Antwort eingeben';
    wrapper.append(input);
    $('questionOptions').replaceChildren(wrapper);
  }

  $('questionHintBtn').onclick = () => {
    if (!activeQuestion) return;
    const question = q(activeQuestion.id);
    const text = activeQuestion.phase === 'transfer'
      ? question.remediation.transfer.hint
      : question.hint;
    showFeedback(`💡 ${text}`);
    S.hintsUsed++;
    save();
    event('hint.used', { kind: activeQuestion.phase === 'transfer' ? 'transfer' : 'question', questionId: question.id });
  };

  $('questionForm').addEventListener('submit', eventObject => {
    eventObject.preventDefault();
    if (!activeQuestion) return;
    const question = q(activeQuestion.id);

    if (activeQuestion.phase === 'remediation') {
      const input = $('remediationInput');
      if (!input || !copyMatches(input.value, question.remediation.activeTask.text)) {
        showFeedback('Noch nicht vollständig. Übernimm den Merksatz sorgfältig – danach bekommst du eine neue Aufgabe.', 'error');
        return;
      }
      S.remediationCompleted[question.id] = true;
      event('remediation.active_task_completed', { questionId: question.id });
      renderTransfer(question);
      showFeedback('Gut. Jetzt kommt eine neue, ähnliche Aufgabe.', 'success');
      return;
    }

    if (activeQuestion.phase === 'transfer') {
      const input = $('transferInput');
      const answer = normalizeAnswer(input?.value || '');
      const accepted = question.remediation.transfer.acceptedAnswers.map(normalizeAnswer);
      const correct = accepted.includes(answer);
      S.transferAttempts[question.id] = (S.transferAttempts[question.id] || 0) + 1;
      event('transfer.answered', {
        questionId: question.id,
        correct,
        attempt: S.transferAttempts[question.id]
      });

      if (!correct) {
        const attempts = S.transferAttempts[question.id];
        const extra = attempts >= 2 ? ` ${question.remediation.transfer.explanation}` : '';
        showFeedback(`Noch nicht. ${question.remediation.transfer.hint}${extra}`, 'error');
        save();
        return;
      }

      showFeedback(`Richtig. ${question.remediation.transfer.explanation}`, 'success');
      delete S.remediationStage[question.id];
      finishQuestion(question.id, activeQuestion.handler);
      setTimeout(() => $('questionDialog').close(), 450);
      return;
    }

    const picked = $('questionOptions').querySelector('input:checked');
    if (!picked) {
      showFeedback('Wähle zuerst eine Antwort.');
      return;
    }

    const correct = Number(picked.value) === question.correctIndex;
    S.attempts[question.id] = (S.attempts[question.id] || 0) + 1;
    const attempt = S.attempts[question.id];

    event('question.answered', { questionId: question.id, correct, attempt });

    if (correct && attempt < D.world.remediationPolicy.remediationAtAttempt) {
      showFeedback(`Richtig. ${question.explanation}`, 'success');
      finishQuestion(question.id, activeQuestion.handler);
      setTimeout(() => $('questionDialog').close(), 450);
      return;
    }

    if (correct) {
      showFeedback('Richtig gefunden. Weil vorher mehrere Versuche nötig waren, folgt noch ein kurzer Lerncheck.', 'success');
      beginRemediation(question, 'correct_after_repeated_attempts');
      return;
    }

    if (attempt >= D.world.remediationPolicy.remediationAtAttempt) {
      showFeedback('Mehrfach versucht. Jetzt klären wir kurz den Rechenweg, bevor das Spiel weitergeht.', 'error');
      beginRemediation(question, 'three_wrong_answers');
      return;
    }

    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {
      $('remyHelp').hidden = false;
      showFeedback('Noch nicht richtig. Die Antworten wurden neu gemischt. Du kannst Remy jetzt auch konkret fragen, was unklar ist.', 'error');
    } else {
      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');
    }
    renderChoiceOptions(question);
    save();
  });

  function finishQuestion(id, handler) {
    markDone(id);
    delete S.remediationStage[id];
    solvedHandlers[handler]?.();
    renderMission();
    renderHotspots();
    save();
  }

  async function askRemy(text) {
    if (!activeQuestion || !Tutor) return;
    const question = q(activeQuestion.id);
    const clean = String(text || '').trim();
    if (!clean) return;

    $('remyAnswer').hidden = false;
    $('remyAnswer').textContent = 'Remy denkt kurz nach …';
    $('remyAskBtn').disabled = true;

    try {
      const result = await Tutor.ask(question, clean);
      $('remyAnswer').textContent = result.answer;
      event('tutor.requested', { questionId: question.id, source: result.source });
    } catch {
      $('remyAnswer').textContent = 'Die Hilfe ist gerade nicht erreichbar. Nutze den fachlichen Hinweis oder lies die kurze Erklärung.';
      event('tutor.failed', { questionId: question.id });
    } finally {
      $('remyAskBtn').disabled = false;
    }
  }

  $('remyAskBtn').onclick = () => askRemy($('remyQuestion').value);
  $('remyQuestion').addEventListener('keydown', eventObject => {
    if (eventObject.key === 'Enter' && !eventObject.shiftKey) {
      eventObject.preventDefault();
      askRemy($('remyQuestion').value);
    }
  });
  document.querySelectorAll('[data-remy-question]').forEach(button => {
    button.onclick = () => {
      $('remyQuestion').value = button.dataset.remyQuestion;
      askRemy(button.dataset.remyQuestion);
    };
  });

  const symbols = { triangle: '▲', circle: '●', square: '■', star: '★', diamond: '◆' };

  function openPuzzle(id, title, text) {
    if (S.clueReviewRequired[id]) {
      const review = id === 'locker-sequence'
        ? 'Schau zuerst noch einmal am Schwarzen Brett nach.'
        : id === 'key-sequence'
          ? 'Lies zuerst die Symbolfolge am Computer noch einmal.'
          : 'Prüfe zuerst die gefundenen Hinweise.';
      msg(`Nicht weiter raten. ${review}`);
      return;
    }

    activePuzzle = id;
    puzzleInput = [];
    $('puzzleTitle').textContent = title;
    $('puzzleText').textContent = text;
    $('puzzleFeedback').hidden = true;
    renderPuzzle();
    $('puzzleDialog').showModal();
    event('puzzle.started', { puzzleId: id });
  }

  function renderPuzzle() {
    const body = $('puzzleBody');
    body.replaceChildren();

    if (activePuzzle === 'board-pattern') {
      const grid = document.createElement('div');
      grid.className = 'symbolGrid';
      ['7', '8', '10'].forEach(value => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'symbolButton';
        button.textContent = value;
        button.onclick = () => checkBoard(value);
        grid.append(button);
      });
      body.append(grid);
      return;
    }

    if (activePuzzle === 'door-code') {
      const display = document.createElement('div');
      display.className = 'keypadDisplay';
      display.textContent = puzzleInput.join('').padEnd(3, '–');
      body.append(display);

      const keypad = document.createElement('div');
      keypad.className = 'keypad';
      for (let number = 1; number <= 9; number++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = number;
        button.onclick = () => {
          if (puzzleInput.length < 3) puzzleInput.push(String(number));
          renderPuzzle();
          if (puzzleInput.length === 3) checkPuzzle();
        };
        keypad.append(button);
      }
      body.append(keypad);
      return;
    }

    const allowed = activePuzzle === 'locker-sequence' ? D.world.lockerSequence : D.world.keySequence;
    const sequence = document.createElement('div');
    sequence.className = 'symbolSequence';
    for (let index = 0; index < 3; index++) {
      const slot = document.createElement('span');
      slot.textContent = puzzleInput[index] ? symbols[puzzleInput[index]] : '·';
      sequence.append(slot);
    }
    body.append(sequence);

    const grid = document.createElement('div');
    grid.className = 'symbolGrid';
    [...new Set(allowed)].forEach(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'symbolButton';
      button.textContent = symbols[value];
      button.onclick = () => {
        if (puzzleInput.length < 3) puzzleInput.push(value);
        renderPuzzle();
        if (puzzleInput.length === 3) checkPuzzle();
      };
      grid.append(button);
    });
    body.append(grid);
  }

  function puzzleError() {
    S.puzzleAttempts[activePuzzle] = (S.puzzleAttempts[activePuzzle] || 0) + 1;
    const attempts = S.puzzleAttempts[activePuzzle];
    const feedback = $('puzzleFeedback');
    feedback.hidden = false;
    feedback.className = 'questionFeedback error';

    if (attempts >= 2 && ['locker-sequence', 'key-sequence'].includes(activePuzzle)) {
      S.clueReviewRequired[activePuzzle] = true;
      feedback.textContent = 'Nicht weiter raten. Das Rätsel wird geschlossen – lies den ursprünglichen Hinweis noch einmal.';
      const puzzleId = activePuzzle;
      event('puzzle.guess_guard', { puzzleId, attempts });
      save();
      setTimeout(() => {
        $('puzzleDialog').close();
        msg(puzzleId === 'locker-sequence'
          ? 'Schau noch einmal am Schwarzen Brett nach, bevor du den Spind erneut öffnest.'
          : 'Lies die Symbolfolge am Computer noch einmal, bevor du das Schlüsselbrett erneut versuchst.');
      }, 450);
      return;
    }

    feedback.textContent = 'Das passt noch nicht. Setze das Rätsel zurück und prüfe deine Hinweise.';
    event('puzzle.failed', { puzzleId: activePuzzle, attempts });
    save();
  }

  function checkBoard(value) {
    if (value !== '8') return puzzleError();
    S.flags.code8 = true;
    solvePuzzle('board-pattern', 'Muster gelöst. Das dritte Codefragment ist 8.');
  }

  function checkPuzzle() {
    const answer = puzzleInput.join('|');
    let correct = false;

    if (activePuzzle === 'door-code') correct = puzzleInput.join('') === D.world.classroomDoorCode;
    if (activePuzzle === 'locker-sequence') correct = answer === D.world.lockerSequence.join('|');
    if (activePuzzle === 'key-sequence') correct = answer === D.world.keySequence.join('|');
    if (!correct) return puzzleError();

    if (activePuzzle === 'door-code') S.flags.classroomDoorOpen = true;
    if (activePuzzle === 'locker-sequence') {
      S.flags.lockerSolved = true;
      S.flags.accessCard = true;
      addItem('access-card', 'Zugangskarte', '🪪');
    }
    if (activePuzzle === 'key-sequence') S.flags.keyBoardSolved = true;

    const text = activePuzzle === 'door-code'
      ? 'Die Klassenzimmertür ist entriegelt.'
      : activePuzzle === 'locker-sequence'
        ? 'Spind 12 öffnet sich. Du findest eine Zugangskarte.'
        : 'Das richtige Fach öffnet sich. Der Notfallkasten ist jetzt zugänglich.';

    solvePuzzle(activePuzzle, text);
  }

  function solvePuzzle(id, text) {
    S.puzzleCompletions++;
    S.puzzleAttempts[id] = 0;
    delete S.clueReviewRequired[id];
    event('puzzle.completed', { puzzleId: id });
    save();
    renderMission();
    renderHotspots();

    const feedback = $('puzzleFeedback');
    feedback.hidden = false;
    feedback.className = 'questionFeedback success';
    feedback.textContent = 'Gelöst!';
    setTimeout(() => {
      $('puzzleDialog').close();
      msg(text);
    }, 350);
  }

  $('puzzleResetBtn').onclick = () => {
    puzzleInput = [];
    renderPuzzle();
    $('puzzleFeedback').hidden = true;
  };

  function useItem(target) {
    if (!S.selectedItem) return false;

    if (S.selectedItem === 'battery' && target === 'cabinet' && S.flags.flashlightFound) {
      S.flags.flashlightReady = true;
      removeItem('battery');
      event('item.used', { itemId: 'battery', target: 'flashlight' });
      msg('Die Batterie passt. Die Taschenlampe funktioniert jetzt.');
      renderMission();
      renderHotspots();
      save();
      return true;
    }

    if (S.selectedItem === 'access-card' && target === 'door' && S.room === 'hallway') {
      openQuestion('q5', 'q5Office');
      return true;
    }

    if (S.selectedItem === 'main-key' && target === 'door' && S.room === 'office') {
      openQuestion('q8', 'q8Final');
      return true;
    }

    msg('Dieser Gegenstand passt hier nicht.');
    event('item.mismatch', { itemId: S.selectedItem, target });
    return true;
  }

  const explorerPositions = {
    classroom: {
      center: [50, 78], desk: [20, 78], cabinet: [86, 72], shelf: [13, 46], computer: [46, 68], board: [52, 35], door: [73, 72]
    },
    hallway: {
      center: [50, 78], desk: [17, 72], shelf: [42, 48], door: [84, 72]
    },
    office: {
      center: [50, 78], computer: [33, 67], shelf: [69, 64], cabinet: [86, 71], door: [94, 71]
    }
  };

  function moveExplorer(action) {
    const explorer = $('explorer');
    if (!explorer) return;
    const position = explorerPositions[S.room]?.[action] || explorerPositions[S.room]?.center || [50, 78];
    explorer.style.left = `${position[0]}%`;
    explorer.style.top = `${position[1]}%`;
    explorer.style.bottom = 'auto';
    explorer.classList.add('moving');
    setTimeout(() => explorer.classList.remove('moving'), 320);
  }

  $('roomScene').addEventListener('click', eventObject => {
    const button = eventObject.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    moveExplorer(action);
    if (useItem(action)) return;
    if (S.room === 'classroom') classroom(action);
    else if (S.room === 'hallway') hallway(action);
    else office(action);
  });

  function classroom(action) {
    if (action === 'desk') return openQuestion('q1', 'q1Battery');

    if (action === 'cabinet') {
      S.flags.flashlightFound = true;
      msg(S.flags.flashlightReady
        ? 'Die Taschenlampe ist einsatzbereit.'
        : 'Im Schrank liegt eine Taschenlampe ohne Batterie. Wähle die Batterie im Inventar und tippe erneut auf den Schrank.');
      save();
      return;
    }

    if (action === 'shelf') return S.flags.flashlightReady ? openQuestion('q2', 'q2Code') : msg('Unter dem Regal ist es zu dunkel.');
    if (action === 'computer') return openQuestion('q3', 'q3Code');
    if (action === 'board') return S.flags.code8
      ? msg('Die Tafel zeigt: 2 – 4 – 6 – 8.')
      : openPuzzle('board-pattern', 'Muster an der Tafel', '2 – 4 – 6 – ? Welche Zahl setzt das Muster fort?');

    if (action === 'door') {
      if (!(S.flags.code4 && S.flags.code7 && S.flags.code8)) return msg('Das Zahlenschloss braucht einen dreistelligen Code. Dir fehlen noch Hinweise.');
      if (!S.flags.classroomDoorOpen) return openPuzzle('door-code', 'Zahlenschloss', 'Gib den dreistelligen Code ein.');
      setRoom('hallway');
      msg('Du bist auf dem Flur. Wo könnte die Zugangskarte sein?');
    }
  }

  function hallway(action) {
    if (action === 'shelf') {
      if (done('q4') && S.clueReviewRequired['locker-sequence']) {
        delete S.clueReviewRequired['locker-sequence'];
        S.puzzleAttempts['locker-sequence'] = 0;
        save();
        return msg('Hinweis erneut gelesen: Spind 12 · Symbolfolge ▲ ● ■.');
      }
      return openQuestion('q4', 'q4Locker');
    }

    if (action === 'desk') {
      if (!S.flags.lockerHint) return msg('Viele Spinde. Ohne Hinweis wäre das nur Raten.');
      if (S.flags.lockerSolved) return msg('Spind 12 ist bereits geöffnet.');
      return openPuzzle('locker-sequence', 'Spind 12', 'Stelle die Symbolfolge ▲ ● ■ nach.');
    }

    if (action === 'door') {
      if (S.flags.officeDoorOpen) {
        setRoom('office');
        return msg('Du bist im Sekretariat. Finde die Notentriegelung.');
      }
      if (!S.flags.accessCard) return msg('Die Tür hat einen Kartenleser.');
      return msg('Wähle die Zugangskarte im Inventar und tippe erneut auf die Sekretariatstür.');
    }

    msg('Hier gibt es gerade nichts Wichtiges.');
  }

  function office(action) {
    if (action === 'computer') {
      if (done('q6') && S.clueReviewRequired['key-sequence']) {
        delete S.clueReviewRequired['key-sequence'];
        S.puzzleAttempts['key-sequence'] = 0;
        save();
        return msg('Computerhinweis erneut gelesen: ★ ◆ ●.');
      }
      return openQuestion('q6', 'q6Sequence');
    }

    if (action === 'shelf') {
      if (!S.flags.officeSequenceKnown) return msg('Am Schlüsselbrett sind viele Symbole. Du brauchst zuerst die richtige Reihenfolge.');
      if (S.flags.keyBoardSolved) return msg('Das richtige Schlüsselfach ist bereits geöffnet.');
      return openPuzzle('key-sequence', 'Schlüsselbrett', 'Der Computer zeigte ★ ◆ ●. Stelle die Folge nach.');
    }

    if (action === 'cabinet') {
      if (!S.flags.keyBoardSolved) return msg('Der Notfallkasten ist noch verriegelt.');
      return openQuestion('q7', 'q7Key');
    }

    if (action === 'door') {
      if (S.flags.finalAuthorized) return complete();
      if (!S.flags.mainKey) return msg('Die Notentriegelung verlangt den Hauptschlüssel.');
      return msg('Wähle den Hauptschlüssel im Inventar und tippe erneut auf die Notentriegelung.');
    }

    msg('Hier gibt es gerade nichts Wichtiges.');
  }

  const hints = {
    classroom: [
      'Beginne am Lehrerpult.',
      'Im Schrank liegt etwas, das eine Batterie gebrauchen könnte.',
      'Mit Licht kannst du unter das Regal schauen. Computer und Tafel liefern weitere Code-Hinweise.'
    ],
    hallway: [
      'Schau zuerst am Schwarzen Brett nach.',
      'Der Hinweis nennt einen bestimmten Spind.',
      'Die Zugangskarte gehört zum Kartenleser am Sekretariat.'
    ],
    office: [
      'Der Computer ist der erste sinnvolle Anlaufpunkt.',
      'Merke dir die Symbolfolge und suche sie am Schlüsselbrett.',
      'Nach dem Schlüsselbrett ist der Notfallkasten wichtig.'
    ]
  };

  $('hintBtn').onclick = () => {
    const list = hints[S.room];
    const index = Math.min(S.currentHintStep, list.length - 1);
    msg(`💡 ${list[index]}`);
    S.currentHintStep++;
    S.hintsUsed++;
    save();
    event('hint.used', { kind: 'escape', step: index + 1 });
  };

  function complete() {
    S.flags.gameComplete = true;
    save();
    stopTimer();
    $('resultQuestions').textContent = `${S.completedQuestions.length} / ${questionBank.length}`;
    $('resultPuzzles').textContent = String(S.puzzleCompletions);
    $('resultHints').textContent = String(S.hintsUsed);
    $('resultTime').textContent = fmt(S.activeSeconds);
    show('resultView');
    clearSave();
    event('game.completed', {
      activeSeconds: S.activeSeconds,
      hintsUsed: S.hintsUsed,
      remediationCompleted: Object.keys(S.remediationCompleted).length
    });
  }

  function start(resume = false) {
    const check = currentCheck();
    if (!check.ok) {
      alert('Der Prototyp ist nicht startbar. Prüfe die Lehrer-Vorschau.');
      return;
    }

    if (!resume) S = fresh();
    if (!S.startedAt) S.startedAt = new Date().toISOString();
    show('gameView');
    setRoom(S.room || 'classroom');
    renderInventory();
    renderProgress();
    $('timer').textContent = fmt(S.activeSeconds || 0);
    startTimer();
    save();
    event(resume ? 'game.resumed' : 'game.started');
  }

  function teacherCard(question) {
    const card = document.createElement('article');
    card.className = 'teacherQuestion';

    const top = document.createElement('div');
    top.className = 'teacherQuestionTop';

    const title = document.createElement('strong');
    title.textContent = `${question.id.toUpperCase()} · ${question.learningGoal}`;

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'smallButton';
    edit.textContent = 'Bearbeiten';
    edit.onclick = () => openTeacherEdit(question.id);

    top.append(title, edit);

    const prompt = document.createElement('p');
    prompt.textContent = question.prompt;

    const solution = document.createElement('span');
    solution.textContent = `Lösung: ${question.options[question.correctIndex]} · Hinweis: ${question.hint}`;

    const support = document.createElement('span');
    support.textContent = `Nach 3 Versuchen: ${question.remediation.explanation} · Transfer: ${question.remediation.transfer.prompt}`;

    card.append(top, prompt, solution, support);
    return card;
  }

  function renderTeacher() {
    const check = currentCheck();
    const preflight = $('preflightStatus');
    preflight.classList.toggle('invalid', !check.ok);
    preflight.textContent = check.ok
      ? `✓ Preflight bestanden · ${check.warnings.length ? `${check.warnings.length} Hinweis(e)` : 'keine Blocker'}`
      : `✕ Preflight fehlgeschlagen · ${check.errors.join(' · ')}`;

    $('teacherContentProfile').textContent =
      `${D.world.contentProfile.subject} · Klasse ${D.world.contentProfile.grade} · ${D.world.contentProfile.topic}`;

    const route = [
      'Klassenzimmer: Q1 → Batterie/Taschenlampe → Q2/Q3 + Tafel → Code 784 → Tür',
      'Flur: Q4 → Spind 12 → ▲ ● ■ → Zugangskarte → Q5 → Sekretariat',
      'Sekretariat: Q6 → ★ ◆ ● → Schlüsselbrett → Q7 → Hauptschlüssel → Q8 → Notentriegelung'
    ];

    $('teacherRoute').replaceChildren(...route.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));

    $('teacherQuestions').replaceChildren(...questionBank.map(teacherCard));
  }

  function openTeacherEdit(id) {
    const question = q(id);
    if (!question) return;
    teacherEditId = id;

    $('teacherEditTitle').textContent = `${id.toUpperCase()} bearbeiten`;
    $('editLearningGoal').value = question.learningGoal || '';
    $('editPrompt').value = question.prompt;
    question.options.forEach((option, index) => {
      $(`editOption${index}`).value = option;
    });
    $('editCorrectIndex').value = String(question.correctIndex);
    $('editHint').value = question.hint;
    $('editExplanation').value = question.explanation;
    $('editRemediation').value = question.remediation.explanation;
    $('editCopyText').value = question.remediation.activeTask.text;
    $('editTransferPrompt').value = question.remediation.transfer.prompt;
    $('editTransferAnswers').value = question.remediation.transfer.acceptedAnswers.join(' | ');
    $('teacherEditFeedback').hidden = true;
    $('teacherEditDialog').showModal();
  }

  $('teacherEditForm').addEventListener('submit', eventObject => {
    eventObject.preventDefault();
    if (!teacherEditId) return;

    const index = questionBank.findIndex(question => question.id === teacherEditId);
    if (index < 0) return;

    const previous = clone(questionBank[index]);
    const next = clone(previous);
    next.learningGoal = $('editLearningGoal').value.trim();
    next.prompt = $('editPrompt').value.trim();
    next.options = [0, 1, 2, 3].map(optionIndex => $(`editOption${optionIndex}`).value.trim());
    next.correctIndex = Number($('editCorrectIndex').value);
    next.hint = $('editHint').value.trim();
    next.explanation = $('editExplanation').value.trim();
    next.remediation.explanation = $('editRemediation').value.trim();
    next.remediation.activeTask.text = $('editCopyText').value.trim();
    next.remediation.transfer.prompt = $('editTransferPrompt').value.trim();
    next.remediation.transfer.acceptedAnswers = $('editTransferAnswers').value
      .split('|')
      .map(value => value.trim())
      .filter(Boolean);

    const candidate = questionBank.map((question, questionIndex) => questionIndex === index ? next : question);
    const check = D.validateWorldDefinition(D.world, candidate);
    if (!check.ok) {
      $('teacherEditFeedback').hidden = false;
      $('teacherEditFeedback').textContent = check.errors.join(' · ');
      return;
    }

    questionBank = candidate;
    renderTeacher();
    $('teacherEditDialog').close();
    event('teacher.question_edited', { questionId: teacherEditId });
  });

  $('teacherResetBtn').onclick = () => {
    if (!confirm('Alle Aufgabenänderungen dieser Vorschau zurücksetzen?')) return;
    questionBank = D.questions.map(clone);
    renderTeacher();
    event('teacher.questions_reset');
  };

  window.GradeCrewEscapeIntegration = Object.freeze({
    getQuestionSet: () => questionBank.map(clone),
    replaceQuestionSet(candidateQuestions) {
      const candidate = Array.isArray(candidateQuestions) ? candidateQuestions.map(clone) : [];
      const check = D.validateWorldDefinition(D.world, candidate);
      if (!check.ok) return { ok: false, errors: [...check.errors], warnings: [...check.warnings] };
      questionBank = candidate;
      renderTeacher();
      event('teacher.question_set_replaced', { count: candidate.length });
      return { ok: true, errors: [], warnings: [...check.warnings] };
    }
  });

  $('teacherPreviewBtn').onclick = () => {
    renderTeacher();
    $('teacherDialog').showModal();
  };
  $('startBtn').onclick = () => start(false);
  $('resumeBtn').onclick = () => {
    const saved = load();
    if (saved) {
      S = saved;
      start(true);
    }
  };
  $('restartBtn').onclick = () => {
    if (confirm('Spiel wirklich neu starten? Dein aktueller Fortschritt geht verloren.')) {
      clearSave();
      S = fresh();
      start(false);
    }
  };
  $('homeBtn').onclick = () => {
    S = fresh();
    show('homeView');
    updateResume();
  };

  document.querySelectorAll('[data-feedback]').forEach(button => {
    button.onclick = () => {
      S.feedback = Number(button.dataset.feedback);
      document.querySelectorAll('[data-feedback]').forEach(candidate => {
        candidate.setAttribute('aria-pressed', String(candidate === button));
      });
      event('feedback.selected', { rating: S.feedback });
    };
  });

  function updateResume() {
    $('resumeBtn').hidden = !load();
  }

  window.addEventListener('beforeunload', () => {
    if (S.startedAt && !S.flags.gameComplete) save();
  });

  const initialCheck = currentCheck();
  if (!initialCheck.ok) console.error('Escape preflight failed', initialCheck.errors);
  updateResume();
  renderTeacher();
  show('homeView');
})();
