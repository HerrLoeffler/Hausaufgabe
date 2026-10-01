/* One catalogue for the hub, its build, and navigation inside every game. */
(() => {
  'use strict';
  const modes = [
    { id: 'practice', label: 'Üben', action: 'Training einstellen', description: 'Wähle Inhalte und Regeln für dein eigenes Training.' },
    { id: 'highscore', label: 'All-Time-Highscore', action: 'Bestenliste öffnen', description: 'Spiele mit festen Regeln. Jede Disziplin hat ihre eigene Bestenliste.' },
    { id: 'live', label: 'Live mit Lehrkraft', action: 'Live-Runde vorbereiten', description: 'Die Lehrkraft stellt die Runde ein. Bis zu 30 Personen treten per QR-Code oder Rundencode bei.' }
  ];
  const games = [
    {
      id: 'fast-quiz', name: 'Fast Quiz', subject: 'Mathematik', subjectId: 'math', icon: 'math',
      description: 'Rechnen und Runden – von natürlichen Zahlen bis zu Brüchen.',
      topics: ['Grundrechenarten', 'Runden', 'Dezimalzahlen', 'Brüche', 'Ganze Zahlen'],
      features: ['+ − × ÷ und Runden', '4 Niveaus', '1–5 Minuten'],
      modes: ['practice', 'highscore', 'live'], buildScript: 'tools/build-lab-fast-quiz.mjs',
      entry: { modeAttribute: 'data-open-mode', gameView: 'quizView', teacherView: 'teacherRoomView' },
      backend: { codebase: 'fastquiz', api: 'fastQuizApi' }
    },
    {
      id: 'fehlerjagd-deutsch', name: 'Fehlerjagd Deutsch', subject: 'Deutsch', subjectId: 'german', icon: 'german',
      description: 'Fehler entdecken, Regeln verstehen und Sprache gezielt verbessern.',
      topics: ['Rechtschreibung', 'Grammatik', 'Wortarten', 'Satzglieder', 'Zeitformen', 'Quali'],
      features: ['Jgst. 5–9 und Quali', 'Kompetenzprofil', '4 Niveaus'],
      modes: ['practice', 'highscore', 'live'], buildScript: 'tools/build-lab-fehlerjagd-deutsch.mjs',
      entry: { modeAttribute: 'data-open', gameView: 'gameView', teacherView: 'teacherView' },
      backend: { codebase: 'fehlerjagd', api: 'fehlerjagdApi' }
    },
    {
      id: 'vocab-rush', name: 'Vocab Rush', subject: 'Englisch', subjectId: 'english', icon: 'english',
      description: 'Englisch trainieren – mit Lehrplan-Themen oder eigenen Vokabelsets.',
      topics: ['Vokabeln', 'Englisch', 'Grammatik', 'Lehrplan', 'Vokabelsets', 'Foto', 'PDF'],
      features: ['Jgst. 5–9', 'Eigene Vokabelsets', 'Foto- und PDF-Import'],
      modes: ['practice', 'highscore', 'live'], buildScript: 'tools/build-lab-vocab-rush.mjs',
      entry: { modeAttribute: 'data-open', gameView: 'gameView', teacherView: 'teacherView' },
      backend: { codebase: 'vocabrush', api: 'vocabRushApi' }
    },
    {
      id: 'escape-room', name: 'Escape Room', subject: 'Fächerübergreifend', subjectId: 'mixed', icon: 'escape',
      description: 'Lernfragen öffnen Hinweise, Gegenstände und den Weg aus der verriegelten Schule.',
      topics: ['Escape Room', 'Lernfragen', 'Rätsel', 'Mathematik', 'Deutsch', 'Englisch'],
      features: ['3 Räume + Finale', '8 Lernfragen', '10–15 Minuten'],
      modes: ['practice'], buildScript: 'tools/build-lab-escape-room.mjs',
      entry: { modeAttribute: 'data-open-mode', gameView: 'gameView', teacherView: 'teacherGameView' }
    }
  ];
  function deepFreeze(value) {
    Object.values(value).forEach(child => { if (child && typeof child === 'object') deepFreeze(child); });
    return Object.freeze(value);
  }
  globalThis.GradeCrewGames = deepFreeze({ format: 1, modes, games });
})();
