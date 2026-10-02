(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  let recognition = null;
  let listening = false;
  let baseText = '';
  let finalText = '';

  function speechConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function setVoiceStatus(text) {
    const node = $('teacherAiVoiceStatus');
    if (node) node.textContent = text;
  }

  function updateButton() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.classList.toggle('listening', listening);
    button.textContent = listening ? '● Remy hört zu …' : '🎙 Mit Remy sprechen';
    button.setAttribute('aria-pressed', String(listening));
  }

  function stop() {
    listening = false;
    const active = recognition;
    recognition = null;
    try { active?.stop(); } catch {}
    updateButton();
  }

  function applyTranscript(interim = '') {
    const notes = $('teacherAiNotes');
    if (!notes) return;
    notes.value = [baseText, finalText, interim].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 1200);
    notes.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function start() {
    const SpeechRecognition = speechConstructor();
    if (!SpeechRecognition) {
      setVoiceStatus('Diktieren wird von diesem Browser noch nicht unterstützt. In GradeCrew bleibt dafür derselbe Remy-/Voice-Vertrag vorgesehen.');
      return;
    }

    const notes = $('teacherAiNotes');
    baseText = String(notes?.value || '').trim();
    finalText = '';
    listening = true;
    updateButton();
    setVoiceStatus('Sprich deinen Wunsch. Noch einmal auf den roten Button tippen beendet das Diktat.');

    const active = new SpeechRecognition();
    recognition = active;
    active.lang = 'de-DE';
    active.interimResults = true;
    active.continuous = true;
    active.maxAlternatives = 1;

    active.onresult = event => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = String(event.results[index][0]?.transcript || '').trim();
        if (!transcript) continue;
        if (event.results[index].isFinal) finalText = `${finalText} ${transcript}`.trim();
        else interim = `${interim} ${transcript}`.trim();
      }
      applyTranscript(interim);
    };

    active.onerror = event => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        setVoiceStatus('Remy bekommt gerade keinen Mikrofonzugriff. Prüfe bitte die Browser-Freigabe.');
        stop();
      }
    };

    active.onend = () => {
      if (recognition === active) recognition = null;
      if (!listening) return updateButton();
      listening = false;
      applyTranscript();
      updateButton();
      setVoiceStatus(finalText ? '✓ Remy hat deinen gesprochenen Wunsch übernommen.' : 'Diktat beendet.');
    };

    try { active.start(); }
    catch {
      recognition = null;
      listening = false;
      updateButton();
      setVoiceStatus('Das Mikrofon konnte nicht gestartet werden.');
    }
  }

  function toggle() {
    if (listening) {
      stop();
      applyTranscript();
      setVoiceStatus(finalText ? '✓ Remy hat deinen gesprochenen Wunsch übernommen.' : 'Diktat beendet.');
      return;
    }
    start();
  }

  function boot() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', toggle);
    window.addEventListener('pagehide', stop, { once: true });
  }

  boot();
})();
