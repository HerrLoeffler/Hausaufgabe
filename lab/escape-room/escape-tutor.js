(() => {
  'use strict';

  const sessionCache = new Map();
  const pending = new Map();
  const CACHE_LIMIT = 100;
  const EXTERNAL_TIMEOUT_MS = 8000;
  let epoch = 0;
  const stats = { cacheHits: 0, knowledgeHits: 0, genericHits: 0, externalCalls: 0, fallbacks: 0 };

  function remember(key, answer, requestEpoch) {
    if (requestEpoch !== epoch) return;
    sessionCache.delete(key);
    sessionCache.set(key, answer);
    if (sessionCache.size > CACHE_LIMIT) sessionCache.delete(sessionCache.keys().next().value);
  }

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
      if ((entry.patterns || []).some(pattern => normalize(pattern) && query.includes(normalize(pattern)))) return entry.answer;
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
    const cacheQuery = String(userText || '').normalize('NFC').trim().replace(/\s+/gu, ' ');
    // An edited question may retain its ID: bind cached help to the actual content/revision/locale.
    const cacheKey = JSON.stringify([question.id, question.revision, question.locale, question.prompt,
      question.hint, question.explanation, question.learningGoal, question.remediation, question.tutorAnswers, cacheQuery]);
    const requestEpoch = epoch;
    if (sessionCache.has(cacheKey)) {
      stats.cacheHits++;
      return { source: 'cache', answer: sessionCache.get(cacheKey) };
    }

    const local = findLocal(question, userText);
    if (local) {
      stats.knowledgeHits++;
      remember(cacheKey, local, requestEpoch);
      return { source: 'knowledge', answer: local };
    }

    const generic = genericHelp(question, userText);
    if (generic) {
      stats.genericHits++;
      remember(cacheKey, generic, requestEpoch);
      return { source: 'generic', answer: generic };
    }

    if (pending.has(cacheKey)) return pending.get(cacheKey).promise;
    if (normalized && String(userText).length <= 800 && window.GradeCrewTutorBridge && typeof window.GradeCrewTutorBridge.ask === 'function') {
      stats.externalCalls++;
      const controller = new AbortController();
      const promise = (async () => {
        let timer;
        try {
          const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(new Error('TUTOR_TIMEOUT')); }, EXTERNAL_TIMEOUT_MS);
            controller.signal.addEventListener('abort', () => reject(new Error('TUTOR_CANCELLED')), { once: true });
          });
          const response = await Promise.race([Promise.resolve().then(() => window.GradeCrewTutorBridge.ask({
            questionId: question.id, learningGoal: question.learningGoal, prompt: question.prompt,
            explanation: question.remediation?.explanation || question.explanation,
            studentQuestion: String(userText || '')
          }, { signal: controller.signal })), timeout]);
          if (requestEpoch !== epoch) return { source: 'cancelled', answer: '' };
          const answer = typeof response?.answer === 'string' ? response.answer.trim() : '';
          if (answer && answer.length <= 2000) { remember(cacheKey, answer, requestEpoch); return { source: 'external', answer }; }
        } catch { /* Use existing learning help; never expose provider errors or student text in logs. */ }
        finally { clearTimeout(timer); if (pending.get(cacheKey)?.promise === promise) pending.delete(cacheKey); }
        if (requestEpoch !== epoch) return { source: 'cancelled', answer: '' };
        stats.fallbacks++;
        return { source: 'fallback', answer: `${question.remediation?.explanation || question.explanation || question.hint || ''} Frag gern konkreter nach einem Begriff oder Rechenschritt.` };
      })();
      pending.set(cacheKey, { promise, controller });
      return promise;
    }

    stats.fallbacks++;
    const fallback = `${question.remediation?.explanation || question.explanation} Frag gern konkreter nach einem Begriff oder Rechenschritt.`;
    remember(cacheKey, fallback, requestEpoch);
    return { source: 'fallback', answer: fallback };
  }

  window.GradeCrewEscapeTutor = Object.freeze({
    ask,
    getStats: () => ({ ...stats }),
    clearSessionCache: () => { epoch++; sessionCache.clear(); for (const entry of pending.values()) entry.controller.abort(); pending.clear(); }
  });
})();
