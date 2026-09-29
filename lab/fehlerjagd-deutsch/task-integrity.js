(() => {
  'use strict';

  const api = window.FehlerjagdDeutsch;
  if (!api?.createEngine) return;
  const originalCreateEngine = api.createEngine;

  const OVERRIDES = {
    'case-05': {
      prompt: 'Welche Schreibweise ist richtig?',
      options: ['Sie liebt das Schwimmen.','Sie liebt das schwimmen.','Sie liebt Das schwimmen.','Sie liebt Das Schwimmen.'],
      correct: 'Sie liebt das Schwimmen.',
      explanation: 'Der Artikel „das“ nominalisiert das Verb „schwimmen“. Deshalb heißt es „das Schwimmen“.'
    },
    'case-09': {
      prompt: 'Welche Schreibweise ist richtig?',
      options: ['Die beiden Ersten der Rangliste erhalten eine Urkunde.','Die beiden ersten der Rangliste erhalten eine Urkunde.','Die beiden Ersten der rangliste erhalten eine Urkunde.','Die Beiden Ersten der Rangliste erhalten eine Urkunde.'],
      correct: 'Die beiden Ersten der Rangliste erhalten eine Urkunde.',
      explanation: '„Ersten“ wird hier substantivisch gebraucht: Gemeint sind die beiden erstplatzierten Personen. Deshalb wird es großgeschrieben.'
    },
    'gz-07': {
      prompt: 'Welche Schreibweise passt, wenn sich zwei Personen nach langer Zeit erneut treffen?',
      options: ['wiedersehen','wieder sehen','wieder-sehen','Wieder sehen'],
      correct: 'wiedersehen',
      explanation: 'In der Bedeutung „erneut begegnen/treffen“ bildet „wiedersehen“ ein Verb mit eigener Gesamtbedeutung und wird zusammengeschrieben.'
    },
    'pun-04': {
      prompt: 'Welche Zeichensetzung ist korrekt?',
      options: ['Ich lerne, aber meine Schwester liest.','Ich lerne aber, meine Schwester liest.','Ich lerne aber meine Schwester, liest.','Ich lerne aber meine Schwester liest.'],
      correct: 'Ich lerne, aber meine Schwester liest.',
      explanation: 'Die Konjunktion „aber“ verbindet hier zwei Teilsätze und wird durch ein Komma abgetrennt.'
    },
    'multi-04': {
      prompt: 'Welche Änderungen sind nötig?',
      context: 'Ich weiß dass du kommst obwohl du müde bist.',
      options: [
        { label:'nach „weiß“ ein Komma', correct:true },
        { label:'nach „kommst“ ein Komma', correct:true },
        { label:'nach „du“ ein Komma', correct:false },
        { label:'vor „bist“ ein Komma', correct:false }
      ],
      explanation: 'Richtig heißt der Satz: „Ich weiß, dass du kommst, obwohl du müde bist.“ Beide Nebensätze werden durch Kommas abgegrenzt.'
    }
  };

  function patchTask(task) {
    const override = OVERRIDES[task.id];
    if (!override) return task;
    const patched = { ...task, ...structuredClone(override) };
    if (patched.type === 'multi') {
      patched.options = patched.options.map((option, index) => ({ ...option, key: `m${index}` }));
    }
    return patched;
  }

  function validSingle(task) {
    if (!Array.isArray(task.options) || task.options.length < 3) return false;
    const normalized = task.options.map(option => String(option).trim());
    if (new Set(normalized).size !== normalized.length) return false;
    return normalized.filter(option => option === String(task.correct).trim()).length === 1;
  }

  function validMulti(task) {
    if (!Array.isArray(task.options) || task.options.length < 3) return false;
    const labels = task.options.map(option => String(option.label || '').trim());
    if (labels.some(label => !label) || new Set(labels).size !== labels.length) return false;
    const correctCount = task.options.filter(option => option.correct === true).length;
    return correctCount > 0 && correctCount < task.options.length;
  }

  function taskIsValid(task) {
    if (!task?.id || !task?.prompt || !task?.explanation) return false;
    if (task.type === 'single') return validSingle(task);
    if (task.type === 'multi') return validMulti(task);
    return false;
  }

  api.createEngine = function createCheckedEngine(config) {
    const engine = originalCreateEngine(config);
    return {
      ...engine,
      next() {
        for (let attempt = 0; attempt < 25; attempt += 1) {
          const task = patchTask(engine.next());
          if (taskIsValid(task)) return task;
        }
        throw new Error('Für diese Auswahl konnte keine eindeutig prüfbare Aufgabe geladen werden.');
      }
    };
  };
})();
