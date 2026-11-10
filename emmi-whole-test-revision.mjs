let installed = false;
let busy = false;
let lastInstruction = "";
let recognition = null;
let keepListening = false;
let restartTimer = null;
let stopTimer = null;
let dictationBase = "";
let dictationFinal = "";
let dictationTarget = null;

const $ = selector => document.querySelector(selector);

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function editorOpen() {
  const editor = $("#editorView");
  return Boolean(editor && !editor.classList.contains("hidden"));
}

function installStyles() {
  if ($('style[data-emmi-whole-test]')) return;
  const style = document.createElement("style");
  style.dataset.emmiWholeTest = "2";
  style.textContent = `
    #editorView .emmiWholeTestPanel{
      display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:start;
      margin:0 0 18px;padding:18px 20px;border:1px solid #efd3bf;border-radius:18px;
      background:linear-gradient(135deg,#fffaf6 0%,#fff 72%);box-shadow:0 8px 24px rgba(99,61,37,.06)
    }
    .emmiWholeTestMascot{width:72px;height:72px;object-fit:contain}
    .emmiWholeTestCopy{min-width:0}
    .emmiWholeTestHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:9px}
    .emmiWholeTestHead h2{margin:2px 0 3px;font-size:18px;line-height:1.25;color:#3d342e}
    .emmiWholeTestHead p{margin:0;color:#6b625d;font-size:12px;line-height:1.45}
    .emmiWholeTestBadge{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;background:#fff0e5;color:#8a4f2c;font-size:10px;font-weight:800;white-space:nowrap}
    .emmiWholeTestInputRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:stretch}
    .emmiWholeTestInputRow textarea{min-height:76px;resize:vertical}
    .emmiWholeTestMic{min-width:44px;padding:0 10px;font-size:18px}
    .emmiWholeTestMic.listening{background:#fff0f0;border-color:#e25b5b;color:#b42318;animation:emmiMicPulse 1.2s ease-in-out infinite}
    .emmiWholeTestSuggestions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
    .emmiWholeTestChip{border:1px solid #e8d9cf;background:#fff;color:#65534a;border-radius:999px;padding:5px 9px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
    .emmiWholeTestChip:hover{border-color:#c9906c;background:#fff9f4}
    .emmiWholeTestActions{display:flex;justify-content:flex-end;margin-top:10px}
    .emmiWholeTestStatus{margin-top:10px;padding:9px 11px;border-radius:10px;background:#f6f2ef;color:#61554f;font-size:12px;line-height:1.45}
    .emmiWholeTestStatus.success{background:#eef8f2;color:#326044}
    .emmiWholeTestStatus.error{background:#fff0ef;color:#8e3f3b}
    .emmiWholeTestStatus.busy{background:#fff7ec;color:#77532d}
    .emmiWholeTestUndo{margin-left:7px}
    @keyframes emmiMicPulse{50%{transform:scale(.95);box-shadow:0 0 0 5px rgba(226,91,91,.12)}}
    @media(max-width:720px){
      #editorView .emmiWholeTestPanel{grid-template-columns:1fr;padding:15px}
      .emmiWholeTestMascot{width:58px;height:58px}
      .emmiWholeTestHead{margin-top:-66px;padding-left:70px;min-height:58px}
      .emmiWholeTestInputRow{grid-template-columns:minmax(0,1fr) 44px}
    }
    @media(prefers-reduced-motion:reduce){.emmiWholeTestMic.listening{animation:none}}
  `;
  document.head.appendChild(style);
}

function makePanel() {
  const panel = document.createElement("section");
  panel.id = "emmiWholeTestPanel";
  panel.className = "emmiWholeTestPanel";
  panel.setAttribute("aria-label", "Gesamten Test mit Emmi überarbeiten");
  panel.innerHTML = `
    <img class="emmiWholeTestMascot" src="assets/gradecrew/emmi-colors.png" alt="Emmi">
    <div class="emmiWholeTestCopy">
      <div class="emmiWholeTestHead">
        <div><span class="eyebrow">Emmi · Überarbeiten</span><h2>Emmi hilft dir beim Überarbeiten.</h2><p>Sag Emmi, was du an deinem Test ändern möchtest.</p></div>
        <span class="emmiWholeTestBadge">ganzer Test</span>
      </div>
      <div class="emmiWholeTestInputRow">
        <textarea id="emmiWholeTestInstruction" maxlength="2400" placeholder="z. B. Formuliere alle Aufgaben etwas einfacher oder: mehr Transfer und weniger offensichtliche Antwortmöglichkeiten."></textarea>
        <button id="emmiWholeTestMic" class="button secondary emmiWholeTestMic" type="button" aria-label="Wunsch diktieren" title="Diktieren">🎙</button>
      </div>
      <div class="emmiWholeTestSuggestions" aria-label="Beispiele">
        <button type="button" class="emmiWholeTestChip">Einfacher formulieren</button>
        <button type="button" class="emmiWholeTestChip">Anspruchsvoller machen</button>
        <button type="button" class="emmiWholeTestChip">Mehr Transfer</button>
        <button type="button" class="emmiWholeTestChip">Kürzer und klarer</button>
        <button type="button" class="emmiWholeTestChip">Antwortoptionen verbessern</button>
      </div>
      <div class="emmiWholeTestActions">
        <button id="emmiWholeTestRun" class="button primary" type="button">Mit Emmi überarbeiten</button>
      </div>
      <div id="emmiWholeTestStatus" class="emmiWholeTestStatus hidden" role="status" aria-live="polite"></div>
    </div>`;
  return panel;
}

function ensurePanel() {
  const editor = $("#editorView");
  if (!editor) return null;
  let panel = $("#emmiWholeTestPanel");
  if (panel) return panel;
  const head = editor.querySelector(".pageHead");
  panel = makePanel();
  if (head) head.insertAdjacentElement("afterend", panel);
  else editor.prepend(panel);
  bindPanel(panel);
  return panel;
}

function setStatus(message = "", kind = "") {
  const host = $("#emmiWholeTestStatus");
  if (!host) return;
  host.className = `emmiWholeTestStatus${kind ? ` ${kind}` : ""}${message ? "" : " hidden"}`;
  host.innerHTML = message;
}

function setBusy(next) {
  busy = Boolean(next);
  const run = $("#emmiWholeTestRun");
  const input = $("#emmiWholeTestInstruction");
  if (run) {
    run.disabled = busy;
    run.textContent = busy ? "Emmi überarbeitet …" : "Mit Emmi überarbeiten";
  }
  if (input) input.disabled = busy;
  $("#emmiWholeTestMic")?.toggleAttribute("disabled", busy);
  document.querySelectorAll(".emmiWholeTestChip").forEach(button => { button.disabled = busy; });
  if (busy && !dictationTarget?.dialog) stopDictation();
}

function speechConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function updateMicState(target, listening) {
  const button = target?.button;
  if (!button) return;
  button.classList.toggle("listening", listening);
  button.textContent = listening ? "●" : "🎙";
  button.setAttribute("aria-pressed", String(listening));
  button.setAttribute("aria-label", listening ? "Diktat beenden" : target.label);
}

function setDictationStatus(target, message, type) {
  if (!target.dialog) return setStatus(message, type);
  if (!target.dialog.open) return;
  const status = target.dialog.querySelector(".questionActionMicStatus");
  status.textContent = message;
  status.hidden = !message;
}

function stopDictation() {
  const target = dictationTarget;
  keepListening = false;
  dictationTarget = null;
  window.clearTimeout(restartTimer);
  window.clearTimeout(stopTimer);
  restartTimer = null;
  stopTimer = null;
  const active = recognition;
  recognition = null;
  try { active?.stop(); } catch (_) {}
  updateMicState(target, false);
}

function appendDictatedText(input, transcript) {
  const separator = input.value && !/\s$/.test(input.value) ? " " : "";
  const addition = separator + transcript;
  const remaining = input.maxLength < 0 ? addition.length : Math.max(0, input.maxLength - input.value.length);
  input.value += addition.slice(0, remaining).trimEnd();
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function startRecognitionCycle() {
  const target = dictationTarget;
  if (!keepListening || recognition || !target) return;
  const targetActive = () => target.input.isConnected && !target.input.disabled && (!target.dialog || target.dialog.open);
  if (!targetActive()) return stopDictation();
  const SpeechRecognition = speechConstructor();
  if (!SpeechRecognition) {
    stopDictation();
    setDictationStatus(target, "Diktieren wird von diesem Browser nicht unterstützt.", "error");
    return;
  }

  const active = new SpeechRecognition();
  recognition = active;
  active.lang = target.dialog && document.documentElement.lang.startsWith("en") ? "en-GB" : "de-DE";
  active.interimResults = !target.dialog;
  active.continuous = true;
  active.maxAlternatives = 1;

  active.addEventListener("result", event => {
    if (recognition !== active || dictationTarget !== target || !targetActive()) return;
    let interim = "";
    const final = [];
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = String(event.results[index][0]?.transcript || "").trim();
      if (!transcript) continue;
      if (event.results[index].isFinal) final.push(transcript);
      else interim = `${interim} ${transcript}`.trim();
    }
    if (target.dialog) {
      if (final.length) appendDictatedText(target.input, final.join(" "));
      return;
    }
    if (final.length) dictationFinal = [dictationFinal, ...final].filter(Boolean).join(" ");
    target.input.value = [dictationBase, dictationFinal, interim].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    target.input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  active.addEventListener("error", event => {
    if (recognition !== active || dictationTarget !== target) return;
    const messages = {
      "not-allowed": "Mikrofonzugriff blockiert. Prüfe die Browserberechtigung.",
      "service-not-allowed": "Mikrofonzugriff blockiert. Prüfe die Browserberechtigung.",
      "audio-capture": "Das Mikrofon ist gerade nicht verfügbar.",
      network: "Die Spracherkennung hat keine Verbindung. Dein Text bleibt erhalten.",
      "no-speech": "Ich habe nichts verstanden. Du kannst es erneut versuchen."
    };
    stopDictation();
    setDictationStatus(target, messages[event.error] || "Diktat beendet. Dein Text bleibt erhalten.", "error");
  });

  active.addEventListener("end", () => {
    if (recognition !== active || dictationTarget !== target) return;
    recognition = null;
    if (!targetActive()) return stopDictation();
    restartTimer = window.setTimeout(startRecognitionCycle, 180);
  });

  try { active.start(); }
  catch (_) {
    stopDictation();
    setDictationStatus(target, "Das Diktat konnte nicht gestartet werden. Bitte versuche es erneut.", "error");
  }
}

function toggleDictation(target) {
  if (!target.input || !target.button || target.input.disabled) return;
  const sameField = dictationTarget?.input === target.input;
  if (keepListening) stopDictation();
  if (sameField) {
    setDictationStatus(target, "Diktat beendet.");
    return;
  }
  if (!speechConstructor()) {
    setDictationStatus(target, "Diktieren wird von diesem Browser nicht unterstützt.", "error");
    return;
  }
  dictationTarget = target;
  dictationBase = target.input.value.trim();
  dictationFinal = "";
  keepListening = true;
  updateMicState(target, true);
  setDictationStatus(target, "Ich höre zu …");
  startRecognitionCycle();
  if (dictationTarget === target) stopTimer = window.setTimeout(() => {
    stopDictation();
    setDictationStatus(target, "Diktat beendet.");
  }, 60000);
}

function handleQuestionDictationClick(event) {
  const button = event.target.closest?.(".questionActionMic");
  const dialog = button?.closest("dialog.questionActionDialog[open]");
  if (!dialog) return;
  toggleDictation({
    dialog, button, input: button.closest(".questionActionInputRow")?.querySelector("textarea"),
    label: dialog.classList.contains("aiQualityPanel") ? "Hinweis diktieren" : "Änderungswunsch diktieren"
  });
}

function stopQuestionDictation(event) {
  if (dictationTarget?.dialog === event.target) stopDictation();
}

function submitRevision(input) {
  stopDictation();
  const instruction = String(input.value || "").trim();
  if (instruction.length < 3) {
    setStatus("Schreib Emmi bitte kurz, was sie am gesamten Test ändern soll.", "error");
    input.focus();
    return;
  }
  const detail = { instruction, accepted: false };
  document.dispatchEvent(new CustomEvent("gradecrew:emmi-whole-test-request", { detail }));
  if (!detail.accepted) {
    setStatus("Dieser Test kann gerade nicht als Ganzes überarbeitet werden. Prüfe, ob der Editor noch geöffnet ist und keine andere KI-Aktion läuft.", "error");
    return;
  }
  lastInstruction = instruction;
  setBusy(true);
  setStatus("Emmi überarbeitet den Test …", "busy");
}

function bindPanel(panel) {
  const input = panel.querySelector("#emmiWholeTestInstruction");
  panel.querySelectorAll(".emmiWholeTestChip").forEach(button => button.addEventListener("click", () => {
    const text = String(button.textContent || "").trim();
    input.value = text;
    input.focus();
  }));
  panel.querySelector("#emmiWholeTestRun")?.addEventListener("click", () => submitRevision(input));
  const mic = panel.querySelector("#emmiWholeTestMic");
  mic?.addEventListener("click", () => toggleDictation({ input, button: mic, label: "Wunsch diktieren" }));
  input?.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submitRevision(input);
    }
  });
}

function handleResult(event) {
  setBusy(false);
  const detail = event.detail || {};
  const changed = Math.max(0, Number(detail.changedCount) || 0);
  const unchanged = Math.max(0, Number(detail.unchangedCount) || 0);
  const locked = Math.max(0, Number(detail.lockedCount) || 0);
  const invalid = Math.max(0, Number(detail.invalidCount) || 0);
  const extras = [];
  if (unchanged) extras.push(`${unchanged} unverändert`);
  if (locked) extras.push(`${locked} Bildaufgabe${locked === 1 ? "" : "n"} geschützt`);
  if (invalid) extras.push(`${invalid} unsichere Änderung verworfen`);
  const suffix = extras.length ? ` · ${extras.join(" · ")}` : "";
  setStatus(`✓ Emmi hat ${changed} Aufgabe${changed === 1 ? "" : "n"} überarbeitet${suffix}. Bitte prüfe den Test vor dem Speichern.<button type="button" class="button ghost emmiWholeTestUndo">↶ Ganze Überarbeitung rückgängig</button>`, "success");
  $("#emmiWholeTestStatus .emmiWholeTestUndo")?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("gradecrew:emmi-whole-test-undo"));
  });
}

function handleError(event) {
  setBusy(false);
  const message = escapeText(event.detail?.message || "Emmi konnte den Test nicht zuverlässig überarbeiten. Bitte erneut versuchen.");
  setStatus(message, "error");
}

function handleUndone() {
  setBusy(false);
  setStatus("Die gesamte Emmi-Überarbeitung wurde rückgängig gemacht. Dein vorheriger Bearbeitungsstand ist wieder da.", "success");
  const input = $("#emmiWholeTestInstruction");
  if (input && !input.value.trim()) input.value = lastInstruction;
}

function syncVisibility() {
  const panel = ensurePanel();
  if (!panel) return;
  const visible = editorOpen();
  panel.classList.toggle("hidden", !visible);
  if (!visible) stopDictation();
}

function start() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  syncVisibility();
  const editor = $("#editorView");
  if (editor) new MutationObserver(syncVisibility).observe(editor, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("click", handleQuestionDictationClick);
  document.addEventListener("close", stopQuestionDictation, true);
  document.addEventListener("gradecrew:question-dictation-stop", stopQuestionDictation);
  document.addEventListener("gradecrew:emmi-whole-test-result", handleResult);
  document.addEventListener("gradecrew:emmi-whole-test-error", handleError);
  document.addEventListener("gradecrew:emmi-whole-test-undone", handleUndone);
  document.addEventListener("gradecrew:account-changed", () => {
    stopDictation();
    setBusy(false);
    lastInstruction = "";
    setStatus("");
  });
}

start();
