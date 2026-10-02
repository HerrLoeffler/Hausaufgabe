(() => {
  'use strict';

  const questions = [
    {
      id: 'q1',
      answerMode: 'choice',
      learningGoal: 'Prozentwert als Anteil eines Grundwerts berechnen',
      prompt: '25 % von 80 sind …',
      options: ['15', '20', '25', '30'],
      correctIndex: 1,
      hint: 'Ein Viertel von 80 entspricht 25 %.',
      explanation: '80 ÷ 4 = 20.',
      remediation: {
        explanation: '25 % bedeutet ein Viertel. Bei 80 kannst du deshalb durch 4 teilen: 80 ÷ 4 = 20.',
        activeTask: { instruction: 'Übertrage den Merksatz in das Terminal.', text: '25 % bedeutet ein Viertel.' },
        transfer: { prompt: 'Wie viel sind 25 % von 40?', acceptedAnswers: ['10'], hint: 'Teile 40 durch 4.', explanation: '40 ÷ 4 = 10.' }
      },
      tutorAnswers: [
        { patterns: ['warum durch 4', 'viertel'], answer: '25 % sind 25 von 100, also genau ein Viertel. Deshalb kannst du bei 25 % durch 4 teilen.' },
        { patterns: ['was bedeutet prozent', '25 prozent'], answer: 'Prozent heißt „von hundert“. 25 % sind 25 von 100 und damit ein Viertel.' }
      ]
    },
    {
      id: 'q2',
      answerMode: 'choice',
      learningGoal: 'Prozentwert über 10-%-Schritte berechnen',
      prompt: 'Welche Zahl ist 30 % von 50?',
      options: ['10', '15', '20', '25'],
      correctIndex: 1,
      hint: '10 % von 50 sind 5.',
      explanation: '3 × 5 = 15.',
      remediation: {
        explanation: 'Wenn 10 % von 50 gleich 5 sind, sind 30 % dreimal so viel: 3 × 5 = 15.',
        activeTask: { instruction: 'Übertrage den Rechenweg.', text: '10 % von 50 = 5, also 30 % = 15.' },
        transfer: { prompt: 'Wie viel sind 30 % von 20?', acceptedAnswers: ['6'], hint: '10 % von 20 sind 2.', explanation: '3 × 2 = 6.' }
      },
      tutorAnswers: [
        { patterns: ['warum mal 3', '30 prozent'], answer: '30 % bestehen aus drei 10-%-Schritten. Wenn du 10 % kennst, nimmst du diesen Wert dreimal.' },
        { patterns: ['wie finde ich 10 prozent', '10 prozent'], answer: '10 % erhältst du, indem du den Grundwert durch 10 teilst.' }
      ]
    },
    {
      id: 'q3',
      answerMode: 'choice',
      learningGoal: 'Rabatt als Prozentwert berechnen',
      prompt: 'Ein Pullover kostet 60 €. Er wird um 20 % reduziert. Wie hoch ist der Rabatt?',
      options: ['6 €', '10 €', '12 €', '20 €'],
      correctIndex: 2,
      hint: '10 % von 60 € sind 6 €.',
      explanation: '20 % entsprechen zweimal 10 %, also 12 €.',
      remediation: {
        explanation: 'Ein Rabatt von 20 % bedeutet: Du suchst 20 % des ursprünglichen Preises. 10 % von 60 € sind 6 €, also sind 20 % gleich 12 €.',
        activeTask: { instruction: 'Übertrage den wichtigsten Schritt.', text: '20 % Rabatt von 60 € sind 12 €.' },
        transfer: { prompt: 'Wie hoch sind 20 % Rabatt bei 40 €?', acceptedAnswers: ['8', '8 €', '8 euro'], hint: '10 % von 40 € sind 4 €.', explanation: '20 % sind 2 × 4 € = 8 €.' }
      },
      tutorAnswers: [
        { patterns: ['rabatt', 'was muss ich berechnen'], answer: 'Beim Rabatt berechnest du den Prozentwert vom ursprünglichen Preis. Der Rabatt ist also der Teil, der abgezogen wird.' },
        { patterns: ['warum nicht 48', 'endpreis'], answer: 'Gefragt ist nur nach dem Rabatt, nicht nach dem neuen Preis. 48 € wäre der Preis nach dem Abzug von 12 €.' }
      ]
    },
    {
      id: 'q4',
      answerMode: 'choice',
      learningGoal: 'Prozentangaben in Brüche umwandeln',
      prompt: '75 % entsprechen welchem Bruch?',
      options: ['1/4', '1/2', '3/4', '4/5'],
      correctIndex: 2,
      hint: '75 von 100 lässt sich kürzen.',
      explanation: '75/100 = 3/4.',
      remediation: {
        explanation: '75 % bedeutet 75 von 100. Kürzt man 75/100 durch 25, erhält man 3/4.',
        activeTask: { instruction: 'Übertrage die Umwandlung.', text: '75 % = 75/100 = 3/4.' },
        transfer: { prompt: 'Welchem Bruch entsprechen 50 %?', acceptedAnswers: ['1/2', '1 / 2', 'ein halb', '½'], hint: '50 von 100 lässt sich durch 50 kürzen.', explanation: '50/100 = 1/2.' }
      },
      tutorAnswers: [
        { patterns: ['wie wird prozent zum bruch', 'bruch'], answer: 'Schreibe die Prozentzahl zuerst über 100 und kürze dann den Bruch so weit wie möglich.' }
      ]
    },
    {
      id: 'q5',
      answerMode: 'choice',
      learningGoal: '50 % als Hälfte erkennen',
      prompt: 'Eine Klasse hat 24 Kinder. 50 % davon sind 12 Kinder. Welche Aussage stimmt?',
      options: ['12 sind die Hälfte von 24', '12 sind 25 % von 24', '24 sind 50 % von 12', '6 sind 50 % von 24'],
      correctIndex: 0,
      hint: '50 % bedeutet die Hälfte.',
      explanation: 'Die Hälfte von 24 ist 12.',
      remediation: {
        explanation: '50 % sind die Hälfte eines Ganzen. Die Hälfte von 24 erhältst du mit 24 ÷ 2 = 12.',
        activeTask: { instruction: 'Übertrage den Merksatz.', text: '50 % bedeutet die Hälfte.' },
        transfer: { prompt: 'Wie viel sind 50 % von 18?', acceptedAnswers: ['9'], hint: 'Teile 18 durch 2.', explanation: '18 ÷ 2 = 9.' }
      },
      tutorAnswers: [
        { patterns: ['50 prozent', 'hälfte'], answer: '50 % bedeutet immer die Hälfte. Du kannst den Grundwert also durch 2 teilen.' }
      ]
    },
    {
      id: 'q6',
      answerMode: 'choice',
      learningGoal: 'Vom Prozentwert auf den Grundwert schließen',
      prompt: '10 % einer Zahl sind 8. Wie groß ist die Zahl?',
      options: ['18', '40', '80', '800'],
      correctIndex: 2,
      hint: 'Von 10 % zu 100 % musst du mit 10 multiplizieren.',
      explanation: '8 × 10 = 80.',
      remediation: {
        explanation: 'Wenn 10 % gleich 8 sind, besteht das Ganze aus zehn solchen 10-%-Teilen. Deshalb rechnest du 8 × 10 = 80.',
        activeTask: { instruction: 'Übertrage den Rechenweg.', text: '10 % = 8, deshalb sind 100 % = 80.' },
        transfer: { prompt: '10 % einer Zahl sind 6. Wie groß ist die Zahl?', acceptedAnswers: ['60'], hint: 'Von 10 % zu 100 % ist es das Zehnfache.', explanation: '6 × 10 = 60.' }
      },
      tutorAnswers: [
        { patterns: ['warum mal 10', '100 prozent'], answer: '100 % bestehen aus zehn 10-%-Teilen. Deshalb wird aus 8 bei 10 % der Wert 80 bei 100 %.' }
      ]
    },
    {
      id: 'q7',
      answerMode: 'choice',
      learningGoal: 'Prozentuale Veränderung auf den Ausgangswert beziehen',
      prompt: 'Ein Preis steigt von 50 € auf 55 €. Um wie viel Prozent ist er gestiegen?',
      options: ['5 %', '10 %', '11 %', '50 %'],
      correctIndex: 1,
      hint: 'Die Erhöhung beträgt 5 €. Vergleiche sie mit dem Grundwert 50 €.',
      explanation: '5/50 = 0,1 = 10 %.',
      remediation: {
        explanation: 'Zuerst bestimmst du die Erhöhung: 55 € − 50 € = 5 €. Diese 5 € vergleichst du mit dem alten Preis 50 €: 5/50 = 10 %.',
        activeTask: { instruction: 'Übertrage den ersten Schritt.', text: '55 € − 50 € = 5 € Erhöhung.' },
        transfer: { prompt: 'Ein Preis steigt von 40 € auf 44 €. Wie viel Prozent sind das?', acceptedAnswers: ['10', '10 %', '10%'], hint: 'Die Erhöhung beträgt 4 €. Vergleiche 4 mit 40.', explanation: '4/40 = 0,1 = 10 %.' }
      },
      tutorAnswers: [
        { patterns: ['warum durch 50', 'grundwert'], answer: 'Bei einer prozentualen Steigerung vergleichst du die Veränderung mit dem alten Wert. Hier ist der alte Wert 50 €.' },
        { patterns: ['warum nicht 5 prozent', '5 euro'], answer: '5 € ist die absolute Erhöhung. Prozent sagt, wie groß diese 5 € im Verhältnis zum Ausgangswert 50 € sind.' }
      ]
    },
    {
      id: 'q8',
      answerMode: 'choice',
      learningGoal: 'Prozentwert über 10-%-Schritte berechnen',
      prompt: '40 % von 120 sind …',
      options: ['36', '40', '48', '60'],
      correctIndex: 2,
      hint: '10 % von 120 sind 12.',
      explanation: '4 × 12 = 48.',
      remediation: {
        explanation: '10 % von 120 sind 12. Für 40 % brauchst du vier 10-%-Teile: 4 × 12 = 48.',
        activeTask: { instruction: 'Übertrage den Rechenweg.', text: '10 % von 120 = 12, also 40 % = 48.' },
        transfer: { prompt: 'Wie viel sind 40 % von 50?', acceptedAnswers: ['20'], hint: '10 % von 50 sind 5.', explanation: '4 × 5 = 20.' }
      },
      tutorAnswers: [
        { patterns: ['40 prozent', 'warum mal 4'], answer: '40 % sind viermal 10 %. Wenn du 10 % kennst, multiplizierst du diesen Wert mit 4.' }
      ]
    }
  ];

  const world = {
    id: 'locked-school-v1',
    title: 'Die verriegelte Schule',
    version: '0.2.1',
    estimatedMinutes: [10, 15],
    contentProfile: { subject: 'Mathematik', grade: '7', topic: 'Prozentrechnung' },
    rooms: [
      { id: 'classroom', label: 'Klassenzimmer', questionIds: ['q1', 'q2', 'q3'] },
      { id: 'hallway', label: 'Flur', questionIds: ['q4', 'q5'] },
      { id: 'office', label: 'Sekretariat', questionIds: ['q6', 'q7', 'q8'] }
    ],
    classroomDoorCode: '784',
    lockerNumber: '12',
    lockerSequence: ['triangle', 'circle', 'square'],
    keySequence: ['star', 'diamond', 'circle'],
    supportedQuestionTypes: ['choice', 'text', 'number'],
    remediationPolicy: { retryBeforeSupport: 2, remediationAtAttempt: 3, requireTransferAfterRemediation: true }
  };

  function validateWorldDefinition(candidateWorld = world, candidateQuestions = questions) {
    const errors = [];
    const warnings = [];
    const ids = new Set();
    const modes = new Set(candidateWorld.supportedQuestionTypes || ['choice']);

    for (const question of candidateQuestions) {
      if (!question.id || ids.has(question.id)) errors.push(`Ungültige oder doppelte Frage-ID: ${question.id || '(leer)'}`);
      ids.add(question.id);
      if (!question.prompt?.trim()) errors.push(`Frage ${question.id}: Fragetext fehlt.`);
      if (!question.learningGoal?.trim()) warnings.push(`Frage ${question.id}: Lernziel fehlt.`);

      const mode = question.answerMode || 'choice';
      if (!modes.has(mode)) errors.push(`Frage ${question.id}: Antwortmodus ${mode} wird nicht unterstützt.`);
      if (mode === 'choice') {
        if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`Frage ${question.id}: mindestens zwei Antwortoptionen erforderlich.`);
        if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= (question.options || []).length) errors.push(`Frage ${question.id}: correctIndex ungültig.`);
      }
      if (mode === 'text') {
        if (!Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.filter(value => String(value || '').trim()).length < 1) errors.push(`Frage ${question.id}: akzeptierte Freitextantworten fehlen.`);
      }
      if (mode === 'number') {
        if (!['number', 'string'].includes(typeof question.numericAnswer) || String(question.numericAnswer).trim() === '' || !Number.isFinite(Number(question.numericAnswer))) errors.push(`Frage ${question.id}: numerische Lösung fehlt.`);
        if (!Number.isFinite(Number(question.tolerance)) || Number(question.tolerance) < 0) errors.push(`Frage ${question.id}: Toleranz ungültig.`);
      }

      const remediation = question.remediation;
      if (!remediation?.explanation?.trim()) errors.push(`Frage ${question.id}: kurze Fehlererklärung fehlt.`);
      if (!remediation?.activeTask?.text?.trim()) errors.push(`Frage ${question.id}: aktive Lernaufgabe fehlt.`);
      if (!remediation?.transfer?.prompt?.trim()) errors.push(`Frage ${question.id}: Transferfrage fehlt.`);
      if (!Array.isArray(remediation?.transfer?.acceptedAnswers) || !remediation.transfer.acceptedAnswers.some(value => typeof value === 'string' && value.trim())) errors.push(`Frage ${question.id}: Transferantworten fehlen.`);
      if (remediation?.transfer?.answerMode === 'number') {
        if (typeof remediation.transfer.numericAnswer !== 'number' || !Number.isFinite(remediation.transfer.numericAnswer) || !Number.isFinite(remediation.transfer.tolerance) || remediation.transfer.tolerance < 0) errors.push(`Frage ${question.id}: numerische Transferlösung ungültig.`);
      }
    }

    const referenced = candidateWorld.rooms.flatMap(room => room.questionIds || []);
    for (const id of referenced) if (!ids.has(id)) errors.push(`Welt verweist auf fehlende Frage ${id}.`);
    for (const id of ids) if (!referenced.includes(id)) warnings.push(`Frage ${id} wird in keinem Raum verwendet.`);
    if (referenced.length !== 8) warnings.push(`MVP erwartet 8 Frage-Slots, gefunden: ${referenced.length}.`);
    if (!/^\d{3}$/.test(candidateWorld.classroomDoorCode || '')) errors.push('Klassenzimmertür benötigt einen dreistelligen Code.');
    if ((candidateWorld.lockerSequence || []).length !== 3) errors.push('Spindrätsel benötigt drei Symbole.');
    if ((candidateWorld.keySequence || []).length !== 3) errors.push('Schlüsselbrett benötigt drei Symbole.');

    return { ok: errors.length === 0, errors, warnings };
  }

  const freezeQuestion = question => Object.freeze({
    ...question,
    options: Object.freeze([...(question.options || [])]),
    acceptedAnswers: Object.freeze([...(question.acceptedAnswers || [])]),
    remediation: Object.freeze({
      ...question.remediation,
      activeTask: Object.freeze({ ...question.remediation.activeTask }),
      transfer: Object.freeze({
        ...question.remediation.transfer,
        acceptedAnswers: Object.freeze([...question.remediation.transfer.acceptedAnswers])
      })
    }),
    tutorAnswers: Object.freeze((question.tutorAnswers || []).map(entry => Object.freeze({ ...entry, patterns: Object.freeze([...entry.patterns]) })))
  });

  window.GradeCrewEscapePrototype = Object.freeze({
    questions: Object.freeze(questions.map(freezeQuestion)),
    world: Object.freeze({
      ...world,
      contentProfile: Object.freeze({ ...world.contentProfile }),
      remediationPolicy: Object.freeze({ ...world.remediationPolicy }),
      supportedQuestionTypes: Object.freeze([...world.supportedQuestionTypes]),
      rooms: Object.freeze(world.rooms.map(room => Object.freeze({ ...room, questionIds: Object.freeze([...room.questionIds]) })))
    }),
    validateWorldDefinition
  });
})();
