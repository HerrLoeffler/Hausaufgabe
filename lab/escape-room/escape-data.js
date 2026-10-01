(() => {
  'use strict';

  const questions = [
    {
      id: 'q1',
      prompt: '25 % von 80 sind …',
      options: ['15', '20', '25', '30'],
      correctIndex: 1,
      hint: 'Ein Viertel von 80 entspricht 25 %.',
      explanation: '80 ÷ 4 = 20.'
    },
    {
      id: 'q2',
      prompt: 'Welche Zahl ist 30 % von 50?',
      options: ['10', '15', '20', '25'],
      correctIndex: 1,
      hint: '10 % von 50 sind 5.',
      explanation: '3 × 5 = 15.'
    },
    {
      id: 'q3',
      prompt: 'Ein Pullover kostet 60 €. Er wird um 20 % reduziert. Wie hoch ist der Rabatt?',
      options: ['6 €', '10 €', '12 €', '20 €'],
      correctIndex: 2,
      hint: '10 % von 60 € sind 6 €.',
      explanation: '20 % entsprechen zweimal 10 %, also 12 €.'
    },
    {
      id: 'q4',
      prompt: '75 % entsprechen welchem Bruch?',
      options: ['1/4', '1/2', '3/4', '4/5'],
      correctIndex: 2,
      hint: '75 von 100 lässt sich kürzen.',
      explanation: '75/100 = 3/4.'
    },
    {
      id: 'q5',
      prompt: 'Eine Klasse hat 24 Kinder. 50 % davon sind 12 Kinder. Welche Aussage stimmt?',
      options: ['12 sind die Hälfte von 24', '12 sind 25 % von 24', '24 sind 50 % von 12', '6 sind 50 % von 24'],
      correctIndex: 0,
      hint: '50 % bedeutet die Hälfte.',
      explanation: 'Die Hälfte von 24 ist 12.'
    },
    {
      id: 'q6',
      prompt: '10 % einer Zahl sind 8. Wie groß ist die Zahl?',
      options: ['18', '40', '80', '800'],
      correctIndex: 2,
      hint: 'Von 10 % zu 100 % musst du mit 10 multiplizieren.',
      explanation: '8 × 10 = 80.'
    },
    {
      id: 'q7',
      prompt: 'Ein Preis steigt von 50 € auf 55 €. Um wie viel Prozent ist er gestiegen?',
      options: ['5 %', '10 %', '11 %', '50 %'],
      correctIndex: 1,
      hint: 'Die Erhöhung beträgt 5 €. Vergleiche sie mit dem Grundwert 50 €.',
      explanation: '5/50 = 0,1 = 10 %.'
    },
    {
      id: 'q8',
      prompt: '40 % von 120 sind …',
      options: ['36', '40', '48', '60'],
      correctIndex: 2,
      hint: '10 % von 120 sind 12.',
      explanation: '4 × 12 = 48.'
    }
  ];

  const world = {
    id: 'locked-school-v1',
    title: 'Die verriegelte Schule',
    version: '0.1.0',
    estimatedMinutes: [10, 15],
    rooms: [
      { id: 'classroom', label: 'Klassenzimmer', questionIds: ['q1', 'q2', 'q3'] },
      { id: 'hallway', label: 'Flur', questionIds: ['q4', 'q5'] },
      { id: 'office', label: 'Sekretariat', questionIds: ['q6', 'q7', 'q8'] }
    ],
    classroomDoorCode: '784',
    lockerNumber: '12',
    lockerSequence: ['triangle', 'circle', 'square'],
    keySequence: ['star', 'diamond', 'circle'],
    supportedQuestionTypes: ['single_choice']
  };

  function validateWorldDefinition(candidateWorld = world, candidateQuestions = questions) {
    const errors = [];
    const warnings = [];
    const ids = new Set();
    for (const question of candidateQuestions) {
      if (!question.id || ids.has(question.id)) errors.push(`Ungültige oder doppelte Frage-ID: ${question.id || '(leer)'}`);
      ids.add(question.id);
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`Frage ${question.id}: mindestens zwei Antwortoptionen erforderlich.`);
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`Frage ${question.id}: correctIndex ungültig.`);
      if (!question.prompt?.trim()) errors.push(`Frage ${question.id}: Fragetext fehlt.`);
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

  window.GradeCrewEscapePrototype = Object.freeze({
    questions: Object.freeze(questions.map(question => Object.freeze({ ...question, options: Object.freeze([...question.options]) }))),
    world: Object.freeze({ ...world, rooms: Object.freeze(world.rooms.map(room => Object.freeze({ ...room, questionIds: Object.freeze([...room.questionIds]) }))) }),
    validateWorldDefinition
  });
})();
