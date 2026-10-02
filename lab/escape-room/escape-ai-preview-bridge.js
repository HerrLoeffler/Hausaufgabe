(() => {
  'use strict';

  const HOST_PATTERN = /^hausaufgabe-staging--gradecrew-escape-dev-[a-z0-9-]+\.web\.app$/i;
  if (!HOST_PATTERN.test(window.location.hostname)) return;

  const endpoint = '/api/escape-preview';

  function safePayload(input = {}) {
    return {
      subject: String(input.subject || '').slice(0, 120),
      grade: String(input.grade || '').slice(0, 60),
      topic: String(input.topic || '').slice(0, 300),
      difficulty: String(input.difficulty || 'mittel').slice(0, 30),
      notes: String(input.notes || '').slice(0, 1200)
    };
  }

  async function generateTest(input) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 170000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(safePayload(input)),
        signal: controller.signal,
        credentials: 'same-origin'
      });
      let payload = null;
      try { payload = await response.json(); } catch {}
      if (!response.ok || !payload?.ok) {
        const message = String(payload?.error || `Staging-KI nicht erreichbar (${response.status}).`).slice(0, 300);
        const error = new Error(message);
        error.reference = payload?.reference || '';
        throw error;
      }
      return payload.result;
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('Remy braucht gerade zu lange. Bitte versuche es erneut.');
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  window.GradeCrewEscapeAiBridge = Object.freeze({
    mode: 'staging-preview',
    generateTest
  });

  window.dispatchEvent(new CustomEvent('gradecrew:escape-ai-bridge-ready'));

  const connection = document.getElementById('teacherAiConnection');
  if (connection) connection.textContent = '✓ Kollegentest aktiv: Remy ist mit der begrenzten GradeCrew-Staging-KI verbunden. Keine Extra-Anmeldung nötig.';
})();
