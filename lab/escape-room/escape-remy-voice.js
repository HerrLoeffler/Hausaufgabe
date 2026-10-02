(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let recognition = null;
  let listening = false;
  let writing = false;

  const MIC_SVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z"/>
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>
    </svg>`;

  function installVoiceStyles() {
    if (document.querySelector('style[data-gradecrew-voice-button]')) return;
    const style = document.createElement('style');
    style.dataset.gradecrewVoiceButton = '1';
    style.textContent = `
      .teacherAiMic.gcVoiceButton{
        min-height:43px;display:inline-flex;align-items:center;justify-content:center;gap:9px;
        padding:7px 13px 7px 8px;border:1px solid #cfd8e5;border-radius:13px;background:#fff;
        color:#234f9f;font:inherit;font-weight:800;cursor:pointer;box-shadow:0 3px 12px rgba(34,65,112,.06);
        transition:border-color .16s ease,background .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease;
      }
      .teacherAiMic.gcVoiceButton:hover{border-color:#9fb8e6;box-shadow:0 6px 16px rgba(34,65,112,.1);transform:translateY(-1px)}
      .gcVoiceMicIcon{
        width:31px;height:31px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;
        flex:0 0 31px;background:#edf4ff;color:#2f64d6;
      }
      .gcVoiceMicIcon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .gcVoiceLabel{white-space:nowrap}
      .teacherAiMic.gcVoiceButton.listening{background:#fff7f7;border-color:#e25b5b;color:#a81f1f;animation:gcVoicePulse 1.2s ease-in-out infinite}
      .teacherAiMic.gcVoiceButton.listening .gcVoiceMicIcon{background:#ffe7e7;color:#b42318}
      @keyframes gcVoicePulse{50%{box-shadow:0 0 0 5px rgba(226,91,91,.12)}}
      @media(max-width:720px){.teacherAiMic.gcVoiceButton{width:100%}}
      @media(prefers-reduced-motion:reduce){.teacherAiMic.gcVoiceButton:hover{transform:none}.teacherAiMic.gcVoiceButton.listening{animation:none}}
    `;
    document.head.append(style);
  }

  function status(text) {
    if ($('teacherAiVoiceStatus')) $('teacherAiVoiceStatus').textContent = text;
  }

  function updateButton() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.classList.add('gcVoiceButton');
    button.classList.toggle('listening', listening);
    const label = listening ? 'Remy hört zu …' : 'Mit Remy sprechen';
    button.innerHTML = `<span class="gcVoiceMicIcon">${MIC_SVG}</span><span class="gcVoiceLabel">${label}</span>`;
    button.setAttribute('aria-pressed', String(listening));
    button.setAttribute('aria-label', listening ? 'Diktat stoppen – Remy hört zu' : 'Mit Remy sprechen');
    button.title = listening ? 'Diktat stoppen' : 'Mit Remy sprechen';
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
  installVoiceStyles();
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
