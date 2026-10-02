(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let recognition = null;
  let listening = false;
  let writing = false;

  function status(text) {
    if ($('teacherAiVoiceStatus')) $('teacherAiVoiceStatus').textContent = text;
  }
  function updateButton() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.classList.toggle('listening', listening);
    button.textContent = listening ? '● Remy hört zu …' : '🎙 Mit Remy sprechen';
    button.setAttribute('aria-pressed', String(listening));
  }
  function cancel() {
    const previous = recognition;
    recognition = null;
    listening = false;
    try { previous?.abort(); } catch {}
    updateButton();
  }
  function start() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      status('Diktieren wird von diesem Browser noch nicht unterstützt. Du kannst deinen Wunsch direkt eintippen.');
      return;
    }
    cancel();
    const baseText = String($('teacherAiNotes')?.value || '').trim();
    let finalText = '';
    let active;
    const applyTranscript = interim => {
      if (recognition !== active) return;
      const notes = $('teacherAiNotes');
      if (!notes) return;
      writing = true;
      try {
        notes.value = [baseText, finalText, interim].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 1200);
        notes.dispatchEvent(new Event('input', { bubbles: true }));
      } finally { writing = false; }
    };
    try {
      active = new SpeechRecognition();
      recognition = active;
      active.lang = 'de-DE';
      active.interimResults = true;
      active.continuous = true;
      active.maxAlternatives = 1;
      active.onresult = event => {
        if (recognition !== active) return;
        let interim = '';
        for (let index = event.resultIndex; index < event.results.length; index++) {
          const transcript = String(event.results[index][0]?.transcript || '').trim();
          if (!transcript) continue;
          if (event.results[index].isFinal) finalText = `${finalText} ${transcript}`.trim();
          else interim = `${interim} ${transcript}`.trim();
        }
        applyTranscript(interim);
      };
      active.onerror = event => {
        if (recognition !== active) return;
        status(['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)
          ? 'Remy bekommt gerade keinen Mikrofonzugriff. Prüfe bitte die Browser-Freigabe.'
          : 'Diktat unterbrochen. Du kannst deinen Wunsch weiter eintippen.');
        cancel();
      };
      active.onend = () => {
        if (recognition !== active) return;
        applyTranscript('');
        recognition = null;
        listening = false;
        updateButton();
        status(finalText ? '✓ Remy hat deinen gesprochenen Wunsch übernommen.' : 'Diktat beendet.');
      };
      listening = true;
      updateButton();
      status('Sprich deinen Wunsch. Noch einmal tippen beendet das Diktat.');
      active.start();
    } catch {
      cancel();
      status('Das Mikrofon konnte nicht gestartet werden.');
    }
  }
  function toggle() {
    if (!listening) return start();
    // stop() may emit a final result before onend. A new session or close
    // invalidates this instance, so late callbacks cannot overwrite new input.
    listening = false;
    updateButton();
    try { recognition?.stop(); } catch { cancel(); }
  }

  const button = $('teacherAiRemyMic');
  if (!button) return;
  updateButton();
  button.addEventListener('click', toggle);
  $('teacherAiNotes')?.addEventListener('input', () => {
    if (!writing && recognition) {
      cancel();
      status('Diktat beendet; deine manuelle Änderung bleibt erhalten.');
    }
  });
  $('teacherDialog')?.addEventListener('close', cancel);
  $('teacherDialog')?.addEventListener('cancel', cancel);
  $('teacherStartBtn')?.addEventListener('click', cancel);
  $('teacherAiGenerateBtn')?.addEventListener('click', cancel);
  window.addEventListener('pagehide', cancel);
})();
