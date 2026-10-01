(() => {
  'use strict';

  const sessionCache = new Map();
  const stats = { cacheHits: 0, knowledgeHits: 0, externalCalls: 0, fallbacks: 0 };

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
