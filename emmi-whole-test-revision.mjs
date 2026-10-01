let installed = false;
let busy = false;
let lastInstruction = "";

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
  style.dataset.emmiWholeTest = "1";
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
    .emmiWholeTestMic.listening{box-shadow:0 0 0 3px rgba(201,106,59,.16)}
    .emmiWholeTestSuggestions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
    .emmiWholeTestChip{border:1px solid #e8d9cf;background:#fff;color:#65534a;border-radius:999px;padding:5px 9px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
    .emmiWholeTestChip:hover{border-color:#c9906c;background:#fff9f4}
    .emmiWholeTestActions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap}
    .emmiWholeTestNote{font-size:10px;line-height:1.45;color:#81736b;max-width:520px}
    .emmiWholeTestStatus{margin-top:10px;padding:9px 11px;border-radius:10px;background:#f6f2ef;color:#61554f;font-size:12px;line-height:1.45}
    .emmiWholeTestStatus.success{background:#eef8f2;color:#326044}
    .emmiWholeTestStatus.error{background:#fff0ef;color:#8e3f3b}
    .emmiWholeTestStatus.busy{background:#fff7ec;color:#77532d}
    .emmiWholeTestUndo{margin-left:7px}
    @media(max-width:720px){
      #editorView .emmiWholeTestPanel{grid-template-columns:1fr;padding:15px}
      .emmiWholeTestMascot{width:58px;height:58px}
      .emmiWholeTestHead{margin-top:-66px;padding-left:70px;min-height:58px}
      .emmiWholeTestInputRow{grid-template-columns:minmax(0,1fr) 44px}
    }
  `;
  document.head.appendChild(style);
}

function makePanel() {
  const panel = document.createElement("section");
  panel.id = "emmiWholeTestPanel";
  panel.className = "emmiWholeTestPanel";
  panel.setAttribute("aria-label", "Gesamten Test mit Emmi überarbeiten");
  panel.innerHTML = `
    <img class="emmiWholeTestMascot" src="assets/gradecrew/fox-improve.svg" alt="Emmi">
    <div class="emmiWholeTestCopy">
      <div class="emmiWholeTestHead">
        <div><span class="eyebrow">Emmi · Überarbeiten</span><h2>Gesamten Test überarbeiten</h2><p>Sag Emmi einfach, was am ganzen Test anders werden soll.</p></div>
        <span class="emmiWholeTestBadge">ganzer Test</span>
      </div>
      <div class="emmiWholeTestInputRow">
        <textarea id="emmiWholeTestInstruction" maxlength="2400" placeholder="z. B. Formuliere alle Aufgaben etwas einfacher, behalte aber die Lernziele. Oder: mehr Transfer und weniger offensichtliche Antwortmöglichkeiten."></textarea>
        <button id="emmiWholeTestMic" class="button secondary emmiWholeTestMic" type="button" aria-label="Wunsch diktieren" title="Wunsch diktieren">🎙</button>
      </div>
      <div class="emmiWholeTestSuggestions" aria-label="Beispiele">
        <button type="button" class="emmiWholeTestChip">Einfacher formulieren</button>
        <button type="button" class="emmiWholeTestChip">Anspruchsvoller machen</button>
        <button type="button" class="emmiWholeTestChip">Mehr Transfer</button>
        <button type="button" class="emmiWholeTestChip">Kürzer und klarer</button>
        <button type="button" class="emmiWholeTestChip">Antwortoptionen verbessern</button>
      </div>
      <div class="emmiWholeTestActions">
        <span class="emmiWholeTestNote">Anzahl und Punkte bleiben stabil. Emmi speichert nicht automatisch; du prüfst den Entwurf danach selbst. Bitte keine personenbezogenen Schülerdaten eingeben.</span>
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
}

function startDictation(button, input) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus("Diktieren wird von diesem Browser nicht direkt unterstützt. Du kannst den Wunsch weiterhin eintippen.", "error");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.classList.add("listening");
  button.textContent = "●";
  recognition.addEventListener("result", event => {
    const spoken = String(event.results?.[0]?.[0]?.transcript || "").trim();
    if (!spoken) return;
    input.value = input.value.trim() ? `${input.value.trim()} ${spoken}` : spoken;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  recognition.addEventListener("error", () => setStatus("Das Diktat konnte nicht übernommen werden. Bitte erneut versuchen oder tippen.", "error"));
  recognition.addEventListener("end", () => {
    button.classList.remove("listening");
    button.textContent = "🎙";
  });
  recognition.start();
}

function submitRevision(input) {
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
  setStatus("Emmi liest den gesamten Test und überarbeitet ihn als zusammenhängenden Entwurf …", "busy");
}

function bindPanel(panel) {
  const input = panel.querySelector("#emmiWholeTestInstruction");
  panel.querySelectorAll(".emmiWholeTestChip").forEach(button => button.addEventListener("click", () => {
    const text = String(button.textContent || "").trim();
    input.value = text;
    input.focus();
  }));
  panel.querySelector("#emmiWholeTestRun")?.addEventListener("click", () => submitRevision(input));
  panel.querySelector("#emmiWholeTestMic")?.addEventListener("click", event => startDictation(event.currentTarget, input));
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
  panel.classList.toggle("hidden", !editorOpen());
}

function start() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  syncVisibility();
  const editor = $("#editorView");
  if (editor) new MutationObserver(syncVisibility).observe(editor, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("gradecrew:emmi-whole-test-result", handleResult);
  document.addEventListener("gradecrew:emmi-whole-test-error", handleError);
  document.addEventListener("gradecrew:emmi-whole-test-undone", handleUndone);
  document.addEventListener("gradecrew:account-changed", () => {
    setBusy(false);
    lastInstruction = "";
    setStatus("");
  });
}

start();
