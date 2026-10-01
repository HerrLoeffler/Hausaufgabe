(() => {
  'use strict';

  const sessionCache = new Map();
  const stats = { cacheHits: 0, knowledgeHits: 0, genericHits: 0, externalCalls: 0, fallbacks: 0 };

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}%/]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function findLocal(question, userText) {
    const query = normalize(userText);
    for (const entry of question.tutorAnswers || []) {
      if ((entry.patterns || []).some(pattern => query.includes(normalize(pattern)))) return entry.answer;
    }
    return '';
  }

  function genericHelp(question, userText) {
    const query = normalize(userText);
    if (!query) return '';

    if (['losung', 'antwort sagen', 'sag mir die antwort', 'richtige antwort'].some(pattern => query.includes(pattern))) {
      return `Ich verrate dir die Lösung nicht direkt. Nutze diesen Hinweis: ${question.hint}`;
    }

    if (['wie fange ich an', 'wie anfangen', 'anfangen', 'erster schritt'].some(pattern => query.includes(pattern))) {
      return `Starte mit diesem Gedanken: ${question.hint}`;
    }

    if (['welcher schritt', 'rechenschritt', 'welcher rechenschritt', 'wichtig'].some(pattern => query.includes(pattern))) {
      return `Der wichtige Ansatz ist: ${question.hint}`;
    }

    if (['einfacher', 'einfach erklaren', 'noch einfacher', 'verstehe ich nicht'].some(pattern => query.includes(pattern))) {
      return question.remediation?.explanation || question.explanation || question.hint;
    }

    if (['beispiel', 'ahnliche aufgabe', 'ubung'].some(pattern => query.includes(pattern)) && question.remediation?.transfer?.prompt) {
      return `Probier als ähnliches Beispiel: ${question.remediation.transfer.prompt} Nutze dieselbe Strategie; die Lösung verrate ich dir noch nicht.`;
    }

    return '';
  }

  async function ask(question, userText) {
    const normalized = normalize(userText);
    const cacheKey = `${question.id}:${normalized}`;
    if (sessionCache.has(cacheKey)) {
      stats.cacheHits++;
      return { source: 'cache', answer: sessionCache.get(cacheKey) };
    }

    const local = findLocal(question, userText);
    if (local) {
      stats.knowledgeHits++;
      sessionCache.set(cacheKey, local);
      return { source: 'knowledge', answer: local };
    }

    const generic = genericHelp(question, userText);
    if (generic) {
      stats.genericHits++;
      sessionCache.set(cacheKey, generic);
      return { source: 'generic', answer: generic };
    }

    if (window.GradeCrewTutorBridge && typeof window.GradeCrewTutorBridge.ask === 'function') {
      stats.externalCalls++;
      const response = await window.GradeCrewTutorBridge.ask({
        questionId: question.id,
        learningGoal: question.learningGoal,
        prompt: question.prompt,
        explanation: question.remediation?.explanation || question.explanation,
        studentQuestion: String(userText || '')
      });
      const answer = String(response?.answer || '').trim();
      if (answer) {
        sessionCache.set(cacheKey, answer);
        return { source: 'external', answer };
      }
    }

    stats.fallbacks++;
    const fallback = `${question.remediation?.explanation || question.explanation} Frag gern konkreter nach einem Begriff oder Rechenschritt.`;
    sessionCache.set(cacheKey, fallback);
    return { source: 'fallback', answer: fallback };
  }

  window.GradeCrewEscapeTutor = Object.freeze({
    ask,
    getStats: () => ({ ...stats }),
    clearSessionCache: () => sessionCache.clear()
  });
})();
