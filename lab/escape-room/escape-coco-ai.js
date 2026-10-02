(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const D = window.GradeCrewEscapePrototype;
  const STORAGE_KEY = D ? `gradecrew-escape-teacher-set:${D.world.id}:${D.world.version}` : 'gradecrew-escape-teacher-set';
  const COCO_EXPLORER = 'assets/gradecrew/penguin-guide.svg#pose-5';
  const COCO_HELP = 'assets/gradecrew/penguin-guide.svg#pose-4';
  const REMY_CREATE = 'assets/gradecrew/clay-remy-writing.svg';
  let activeProfile = null;
  let generating = false;
  let generationEpoch = 0;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function addStyles() {
    if ($('escapeCocoAiStyles')) return;
    const style = document.createElement('style');
    style.id = 'escapeCocoAiStyles';
    style.textContent = `
      .explorer{font-size:0!important;display:flex;align-items:center;justify-content:center;overflow:visible}
      .explorer .cocoExplorerArt{width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 5px 5px rgba(15,27,45,.18));pointer-events:none}
      .remyAvatar{overflow:hidden;background:#fff!important;display:flex;align-items:center;justify-content:center}
      .remyAvatar .cocoHelpArt{width:62px;height:62px;object-fit:contain}
      .teacherAiCard{margin:1rem 0 1.15rem;padding:1rem;border:1px solid #cfe0ff;border-radius:18px;background:linear-gradient(145deg,#f7faff,#eef5ff);box-shadow:0 8px 24px rgba(36,91,173,.07)}
      .teacherAiHead{display:grid;grid-template-columns:70px 1fr;gap:.85rem;align-items:center;margin-bottom:.85rem}
      .teacherAiRemy{width:70px;height:70px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(29,55,95,.08)}
      .teacherAiRemy img{width:64px;height:64px;object-fit:contain}
      .teacherAiHead h3{margin:0 0 .2rem;font-size:1.08rem}
      .teacherAiHead p{margin:0;color:#53647c;font-size:.91rem;line-height:1.42}
      .teacherAiGrid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
      .teacherAiGrid label,.teacherAiNotes{display:grid;gap:.28rem;font-size:.78rem;font-weight:750;color:#3f4f66}
      .teacherAiGrid input,.teacherAiGrid select,.teacherAiNotes textarea{width:100%;box-sizing:border-box;border:1px solid #cfd9e8;border-radius:11px;background:#fff;padding:.68rem .75rem;font:inherit;color:#172033}
      .teacherAiTopic{grid-column:1/-1}
      .teacherAiNotes{margin-top:.7rem}
      .teacherAiNotes textarea{resize:vertical;min-height:68px}
      .teacherAiActions{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-top:.85rem}
      .teacherAiActions .primaryButton{margin:0}
      .teacherAiActions .primaryButton:disabled{opacity:.55;cursor:not-allowed}
      .teacherAiVoiceRow{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;margin-top:.7rem}
      .teacherAiMic.listening{background:#fff0f0;border-color:#e25b5b;color:#a81f1f}
      .teacherAiVoiceStatus{font-size:.76rem;color:#607189}
      .teacherAiStatus{margin:.65rem 0 0;padding:.65rem .75rem;border-radius:11px;background:#fff;color:#41526a;font-size:.86rem;line-height:1.4}
      .teacherAiStatus.success{background:#eafaf1;color:#17643b}
      .teacherAiStatus.error{background:#fff0f0;color:#9b2c2c}
      .teacherAiAccount{font-size:.78rem;color:#52709c}
      .teacherAiFineprint{margin:.55rem 0 0;color:#6b7a90;font-size:.75rem;line-height:1.35}
      @media(max-width:720px){.teacherAiGrid{grid-template-columns:1fr}.teacherAiTopic{grid-column:auto}.teacherAiHead{grid-template-columns:58px 1fr}.teacherAiRemy{width:58px;height:58px}.teacherAiRemy img{width:54px;height:54px}.teacherAiVoiceRow{align-items:stretch}.teacherAiMic{width:100%}}
    `;
    document.head.append(style);
  }

  function cocoImage(src, className, alt = '') {
    const image = document.createElement('img');
    image.src = src;
    image.className = className;
    image.alt = alt;
    image.decoding = 'async';
    return image;
  }

  function applyCocoIdentity() {
    const explorer = $('explorer');
    if (explorer && !explorer.querySelector('img')) explorer.replaceChildren(cocoImage(COCO_EXPLORER, 'cocoExplorerArt gcClayCharacter'));

    const avatar = document.querySelector('.remyAvatar');
    if (avatar) avatar.replaceChildren(cocoImage(COCO_HELP, 'cocoHelpArt gcClayCharacter'));
    if ($('remyHelpTitle')) $('remyHelpTitle').textContent = 'Frag Coco';
    if ($('remyAskBtn')) $('remyAskBtn').textContent = 'Coco fragen';
    const microcopy = document.querySelector('#remyHelp .microcopy');
    if (microcopy) microcopy.textContent = 'Coco beantwortet bekannte Fragen lokal. Nur wirklich individuelle Fragen können später über die GradeCrew-KI laufen.';
  }

  function correctAnswers(question) {
    if (!question) return [];
    const checked = window.GradeCrewEscapeQuestionAdapter?.adaptAnswer(question, 0);
    if (!checked || checked.errors.length) return [];
    if (question.type === 'number') {
      const value = Number(question.numericAnswer);
      if (!Number.isFinite(value)) return [];
      const dot = String(value);
      const comma = dot.replace('.', ',');
      return [...new Set([dot, comma, question.unit ? `${dot} ${question.unit}` : '', question.unit ? `${comma} ${question.unit}` : ''].filter(Boolean))];
    }
    if (question.type === 'truefalse') return question.correctBoolean === true ? ['Richtig', 'richtig', 'true'] : ['Falsch', 'falsch', 'false'];
    if (question.type === 'text') return (question.acceptedAnswers || []).map(String).filter(Boolean);
    const correct = (question.options || []).find(option => option?.correct);
    return correct?.text ? [String(correct.text)] : [];
  }

  function answerLabel(question) {
    return correctAnswers(question)[0] || 'die richtige Lösung';
  }

  function strategyFor(question, topic) {
    const focus = String(topic || 'dem Thema').trim();
    if (question?.type === 'number') return `Ich bestimme zuerst, was gegeben und gesucht ist, rechne zu ${focus} Schritt für Schritt und prüfe am Ende die Einheit.`;
    if (question?.type === 'truefalse') return `Ich prüfe die Aussage zu ${focus} Teil für Teil und entscheide erst danach zwischen richtig und falsch.`;
    return `Ich prüfe zu ${focus} jede Antwort fachlich, streiche unpassende Möglichkeiten und begründe die verbleibende Lösung.`;
  }

  function hintFor(question, topic) {
    const focus = String(topic || 'das Thema').trim();
    if (question?.type === 'number') return `Kläre zuerst: Was ist gegeben, was ist gesucht? Nutze dann den passenden Rechenschritt zu ${focus} und prüfe die Einheit.`;
    if (question?.type === 'truefalse') return `Prüfe die Aussage Wort für Wort: Welcher fachliche Zusammenhang aus ${focus} entscheidet über richtig oder falsch?`;
    return `Streiche zuerst Antworten, die fachlich nicht zu ${focus} passen. Begründe anschließend, warum eine Möglichkeit übrig bleibt.`;
  }

  function makeSupport(mainQuestion, transferQuestion, topic) {
    const solution = answerLabel(mainQuestion);
    const transferAnswers = correctAnswers(transferQuestion);
    const strategy = strategyFor(mainQuestion, topic);
    return {
      learningGoal: `Ich kann eine Aufgabe zu ${String(topic || 'diesem Thema').trim()} selbstständig lösen und meine Lösung überprüfen.`,
      hint: hintFor(mainQuestion, topic),
      explanation: `Richtig ist „${solution}“. Prüfe, welcher fachliche Zusammenhang der Aufgabe genau zu dieser Lösung führt.`,
      remediation: {
        explanation: `Die richtige Lösung der Ausgangsaufgabe ist „${solution}“. Nutze jetzt bewusst diese Strategie: ${strategy}`,
        activeTask: {
          instruction: 'Übertrage die Lösestrategie in das Terminal.',
          text: strategy
        },
        transfer: {
          prompt: String(transferQuestion?.text || '').trim(),
          acceptedAnswers: transferAnswers,
          hint: hintFor(transferQuestion, topic),
          explanation: `Richtig: ${answerLabel(transferQuestion)}. Du hast denselben fachlichen Zusammenhang auf eine neue Aufgabe übertragen.`
        }
      },
      tutorAnswers: [
        { patterns: ['wie fange ich an', 'erster schritt'], answer: hintFor(mainQuestion, topic) },
        { patterns: ['welcher schritt', 'was ist wichtig'], answer: strategy }
      ]
    };
  }

  function prepareGeneratedTest(aiResult, settings) {
    const generated = aiResult?.test || aiResult;
    const questions = Array.isArray(generated?.questions) ? generated.questions : [];
    if (questions.length !== 16) {
      return { ok: false, errors: [{ code: 'ai_pair_count', message: `Die KI muss 16 Aufgaben liefern (8 Hauptaufgaben + 8 Transferaufgaben), erhalten: ${questions.length}.` }] };
    }

    const mainQuestions = questions.slice(0, 8).map(clone);
    const transferQuestions = questions.slice(8, 16).map(clone);
    const missingTransfer = transferQuestions.findIndex(question => !String(question?.text || '').trim() || !correctAnswers(question).length);
    if (missingTransfer >= 0) {
      return { ok: false, errors: [{ code: 'invalid_transfer', message: `Transferaufgabe ${missingTransfer + 1} ist nicht automatisch prüfbar.` }] };
    }

    const topic = String(settings?.topic || generated?.description || 'Unterrichtsthema').trim();
    const sourceTest = {
      title: String(generated?.title || `Escape Room · ${topic}`),
      subject: String(settings?.subject || generated?.subject || ''),
      grade: String(settings?.grade || generated?.grade || ''),
      topic,
      questions: mainQuestions
    };
    const supports = mainQuestions.map((question, index) => makeSupport(question, transferQuestions[index], topic));
    // Preserve choice context: transfers are rendered as typed answers, so the
    // alternatives must remain visible even though no radio group is rendered.
    supports.forEach((support, index) => {
      const transfer = transferQuestions[index];
      if (['single', 'dropdown'].includes(transfer.type)) {
        support.remediation.transfer.prompt += '\nAntwortmöglichkeiten: ' + transfer.options.map(option => option.text).join(' · ');
      }
      if (transfer.type === 'number') {
        support.remediation.transfer.answerMode = 'number';
        support.remediation.transfer.numericAnswer = Number(transfer.numericAnswer);
        support.remediation.transfer.tolerance = Number(transfer.tolerance || 0);
        support.remediation.transfer.unit = String(transfer.unit || '');
      }
    });
    const builder = window.GradeCrewEscapeBuilder;
    if (!builder) return { ok: false, errors: [{ code: 'builder_missing', message: 'Escape-Builder ist nicht geladen.' }] };
    const prepared = builder.prepare(sourceTest, { supports });
    if (prepared.ok) {
      prepared.warnings.push({ code: 'didactic_review_required', message: 'Die Lernhilfen sind allgemeine Vorlagen. Bitte Hinweise und Erklärungen fachlich ergänzen; automatisch erzeugte Fragen allein belegen noch keinen passenden Lernweg.' });
    }
    return prepared;
  }

  function safeTypes(subject) {
    const value = String(subject || '').toLowerCase();
    const numeric = /(mathe|mathematik|physik|chemie|wirtschaft|rechnen|informatik)/.test(value);
    return numeric ? ['single', 'truefalse', 'number'] : ['single', 'dropdown', 'truefalse'];
  }

  function generationPayload(settings) {
    const pairing = 'Erstelle genau 16 kurze, eindeutige, bildfreie Aufgaben. Die ersten 8 sind die Hauptaufgaben. Die Aufgaben 9–16 sind in derselben Reihenfolge jeweils neue Transferaufgaben zu Aufgabe 1–8: gleicher Lernschritt bzw. gleiche Kompetenz, aber andere Zahlen, Beispiele oder Formulierungen. Transferaufgaben dürfen die Lösung der Hauptaufgabe nicht einfach wiederholen. Keine Trickfragen, keine Tagesbezüge. Alle Aufgaben müssen automatisch eindeutig prüfbar sein.';
    return {
      schoolType: 'Mittelschule',
      region: 'Bayern',
      subject: settings.subject,
      grade: settings.grade,
      topic: settings.topic,
      difficulty: settings.difficulty,
      count: 16,
      points: 16,
      allowedTypes: safeTypes(settings.subject),
      notes: `${pairing}${settings.notes ? `\nZusätzlicher Wunsch der Lehrkraft: ${settings.notes}` : ''}`,
      imageMode: 'none',
      exactImageCounts: true,
      imageQuestionCount: 0,
      imageAnswerQuestionCount: 0,
      clientRequestId: `escape-${Date.now().toString(36)}`
    };
  }

  function setStatus(text, kind = '') {
    const node = $('teacherAiStatus');
    if (!node) return;
    node.hidden = !text;
    node.className = `teacherAiStatus${kind ? ` ${kind}` : ''}`;
    node.textContent = text;
  }

  function settingsFromUi() {
    return {
      subject: String($('teacherAiSubject')?.value || '').trim(),
      grade: String($('teacherAiGrade')?.value || '').trim(),
      topic: String($('teacherAiTopic')?.value || '').trim(),
      difficulty: String($('teacherAiDifficulty')?.value || 'mittel'),
      notes: String($('teacherAiNotes')?.value || '').trim()
    };
  }

  function updateProfileDisplay() {
    if (!activeProfile || !$('teacherContentProfile')) return;
    $('teacherContentProfile').textContent = `${activeProfile.subject || 'Fach'} · Klasse ${activeProfile.grade || '–'} · ${activeProfile.topic || 'Thema'}`;
  }

  function persistPrepared(prepared, settings) {
    activeProfile = { subject: settings.subject, grade: settings.grade, topic: settings.topic };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: activeProfile, questions: prepared.questions }));
    } catch {}
  }

  function restorePrepared() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!stored?.profile || !Array.isArray(stored.questions)) return;
      activeProfile = stored.profile;
      const result = window.GradeCrewEscapeIntegration?.replaceQuestionSet?.(stored.questions);
      if (result?.ok) updateProfileDisplay();
    } catch {}
  }

  async function callGenerator(payload) {
    if (window.GradeCrewEscapeAiBridge?.generateTest) return window.GradeCrewEscapeAiBridge.generateTest(payload);
    throw new Error('gradecrew-ai-bridge-unavailable');
  }

  async function generate() {
    if (generating) return;
    const settings = settingsFromUi();
    if (!settings.subject || !settings.grade || !settings.topic) return setStatus('Fach, Klasse und Thema werden benötigt.', 'error');
    const button = $('teacherAiGenerateBtn');
    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);
    if (!connected) {
      activeProfile = { subject: settings.subject, grade: settings.grade, topic: settings.topic };
      updateProfileDisplay();
      setStatus('✓ Remy hat deine Angaben für die Lab-Vorschau übernommen. Die vorhandenen Beispielaufgaben bleiben unverändert, damit wir keine echte KI-Erstellung vortäuschen. In GradeCrew erzeugt derselbe Button anschließend die neuen 8 Aufgaben.', 'success');
      window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.remy_preview_prepared', profile: activeProfile } }));
      return;
    }
    generating = true;
    const requestEpoch = generationEpoch;
    if (button) button.disabled = true;
    setStatus('Remy erstellt 8 Lernaufgaben und passende Transferaufgaben mit der GradeCrew-KI …');
    try {
      const result = await callGenerator(generationPayload(settings));
      if (requestEpoch !== generationEpoch || JSON.stringify(settings) !== JSON.stringify(settingsFromUi())) {
        setStatus('Die Angaben wurden während der Erstellung geändert. Das ältere Ergebnis wurde nicht übernommen. Bitte starte die Erstellung mit den aktuellen Angaben erneut.', 'error');
        return;
      }
      const prepared = prepareGeneratedTest(result, settings);
      if (!prepared?.ok) {
        const message = (prepared?.errors || []).map(error => error.message || String(error)).slice(0, 3).join(' · ');
        throw new Error(message || 'Die erzeugten Aufgaben bestehen den Escape-Preflight nicht.');
      }
      activeProfile = { subject: settings.subject, grade: settings.grade, topic: settings.topic };
      const applied = window.GradeCrewEscapeBuilder.apply(prepared);
      if (!applied?.ok) throw new Error((applied?.errors || []).map(error => error.message).join(' · ') || 'Aufgaben konnten nicht übernommen werden.');
      persistPrepared(prepared, settings);
      updateProfileDisplay();
      setStatus('8 Aufgaben übernommen. Bitte Aufgaben und Transfer prüfen und die allgemeinen Lernhilfe-Vorlagen fachlich ergänzen, bevor du die Runde startest.', 'success');
      window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.ai_questions_generated', count: 8, pairedTransfers: 8 } }));
    } catch (error) {
      const bridgeMissing = String(error?.message || '').includes('gradecrew-ai-bridge-unavailable');
      setStatus(bridgeMissing ? 'Die echte GradeCrew-KI wird erst in der integrierten Lehreransicht über deine bestehende Sitzung verbunden. Im Lab ist dafür bewusst keine Extra-Anmeldung nötig.' : `KI-Erstellung fehlgeschlagen: ${error?.message || 'Unbekannter Fehler'}`, 'error');
    } finally {
      generating = false;
      if (button) button.disabled = false;
    }
  }

  function field(labelText, control) {
    const label = document.createElement('label');
    label.append(document.createTextNode(labelText), control);
    return label;
  }

  function input(id, placeholder = '', type = 'text') {
    const node = document.createElement('input');
    node.id = id;
    node.type = type;
    node.placeholder = placeholder;
    node.autocomplete = type === 'password' ? 'current-password' : 'off';
    return node;
  }

  function updateConnectionUi() {
    const button = $('teacherAiGenerateBtn');
    const status = $('teacherAiConnection');
    if (!button || !status) return;
    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);
    button.disabled = generating;
    button.textContent = connected ? '✨ Remy: 8 Escape-Aufgaben erstellen' : '✨ Remy-Vorschau vorbereiten';
    status.textContent = connected
      ? '✓ Remy ist mit der GradeCrew-KI über die vorhandene Lehrersitzung verbunden.'
      : 'Lab-Vorschau: Remy ist ohne Extra-Anmeldung bedienbar. Hier übernimmt er deine Angaben; echte neue KI-Aufgaben werden erst über die geschützte GradeCrew-Lehrersitzung erzeugt.';
  }

  function buildTeacherAiCard() {
    if ($('teacherAiCard')) return;
    const overview = document.querySelector('#teacherDialog .teacherOverview');
    if (!overview) return;

    const card = document.createElement('section');
    card.id = 'teacherAiCard';
    card.className = 'teacherAiCard';
    card.innerHTML = `
      <div class="teacherAiHead">
        <div class="teacherAiRemy"><img class="gcClayCharacter" src="${REMY_CREATE}" alt="Remy"></div>
        <div><h3>Aufgaben mit Remy erstellen</h3><p>Fach, Klasse, Thema und optional ein Wunsch. Remy kümmert sich ums Erstellen; Coco bleibt im Spiel deine Begleitung und Hilfe.</p></div>
      </div>
      <div id="teacherAiConnection" class="teacherAiAccount"></div>
      <div class="teacherAiGrid">
        <label>Fach<input id="teacherAiSubject" type="text" value="Mathematik" placeholder="z. B. Mathematik"></label>
        <label>Klasse<input id="teacherAiGrade" type="text" value="7" placeholder="z. B. 7"></label>
        <label class="teacherAiTopic">Thema<input id="teacherAiTopic" type="text" value="Prozentrechnung" placeholder="z. B. Prozentrechnung"></label>
        <label>Schwierigkeit<select id="teacherAiDifficulty"><option>leicht</option><option selected>mittel</option><option>anspruchsvoll</option><option>gemischt</option></select></label>
      </div>
      <label class="teacherAiNotes">Eigener Wunsch <span style="font-weight:500">(optional)</span><textarea id="teacherAiNotes" maxlength="1200" placeholder="z. B. lebensnahe Aufgaben, keine komplizierten Texte …"></textarea></label>
      <div class="teacherAiVoiceRow"><button id="teacherAiRemyMic" class="secondaryButton teacherAiMic" type="button">🎙 Mit Remy sprechen</button><span id="teacherAiVoiceStatus" class="teacherAiVoiceStatus">Gesprochene Wünsche landen direkt im Wunschfeld.</span></div>
      <div class="teacherAiActions"><button id="teacherAiGenerateBtn" class="primaryButton" type="button">✨ Remy: 8 Escape-Aufgaben erstellen</button><span class="teacherAiAccount">1 KI-Lauf · Transfer wird automatisch mit vorbereitet</span></div>
      <div id="teacherAiStatus" class="teacherAiStatus" role="status" hidden></div>
      <p class="teacherAiFineprint">Remy erzeugt nur Lerninhalte. Räume, Rätsel, Fortschrittslogik und Anti-Raten-Regeln bleiben fest in GradeCrew. Vor dem Start bitte kurz prüfen.</p>
    `;
    overview.insertAdjacentElement('afterend', card);
    $('teacherAiGenerateBtn').onclick = generate;
    updateConnectionUi();
  }

  function clearGeneratedSet() {
    generationEpoch++;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    activeProfile = null;
    if ($('teacherContentProfile') && D) {
      const profile = D.world.contentProfile;
      $('teacherContentProfile').textContent = `${profile.subject} · Klasse ${profile.grade} · ${profile.topic}`;
    }
  }

  function boot() {
    addStyles();
    applyCocoIdentity();
    buildTeacherAiCard();
    restorePrepared();
    $('teacherResetBtn')?.addEventListener('click', clearGeneratedSet);
    window.addEventListener('gradecrew:escape-teacher-rendered', updateProfileDisplay);
    window.addEventListener('gradecrew:escape-ai-bridge-ready', updateConnectionUi);
    window.addEventListener('gradecrew:escape-event', event => {
      if (event.detail?.name === 'teacher.question_edited' && activeProfile) {
        try {
          const questions = window.GradeCrewEscapeIntegration?.getQuestionSet?.();
          if (questions) localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: activeProfile, questions }));
        } catch {}
      }
      if (event.detail?.name === 'teacher.questions_reset') clearGeneratedSet();
    });
  }

  const remyGenerator = Object.freeze({
    prepareGeneratedTest,
    generationPayload,
    correctAnswers,
    safeTypes
  });
  window.GradeCrewEscapeRemyGenerator = remyGenerator;
  window.GradeCrewEscapeAiGenerator = remyGenerator; // compatibility alias

  boot();
})();
