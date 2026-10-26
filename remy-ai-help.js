import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { CREW_MEMBERS, patchSummary, resolveLocalCrewRequest } from "./crew-assistant-core.js?v=7";
import {
  recordRemyMetric,
  recordRemySubmission,
  recordRemyPatch,
  resetRemyTelemetryContext
} from "./crew-telemetry-client.mjs?v=2";

let installed = false;
let recognition = null;
let keepListening = false;
let restartTimer = null;
let stopTimer = null;
let dictationBase = "";
let dictationFinal = "";
let busy = false;
let currentInputMode = "text";
let dictationTargetId = "gcRemyCreateInput";
let pendingProposal = null;

const REMY = CREW_MEMBERS.remy;
const $ = selector => document.querySelector(selector);

function currentUiLocale() {
  return /^en(?:-|$)/i.test(String(window.GradeCrewI18n?.locale || "")) ? "en-GB" : "de-DE";
}

function currentVoiceInputLocale() {
  try {
    const explicit = String(localStorage.getItem("gradecrew.voiceInputLocale") || "");
    if (/^en(?:-|$)/i.test(explicit)) return "en-GB";
    if (/^de(?:-|$)/i.test(explicit)) return "de-DE";
  } catch (_) {}
  return currentUiLocale();
}

function uiText(german, english) {
  return currentUiLocale() === "en-GB" ? english : german;
}

function installStyles() {
  if ($('style[data-remy-ai-help]')) return;
  const style = document.createElement("style");
  style.dataset.remyAiHelp = "2";
  style.textContent = `
    #aiView .gcRemyCreatePanel{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;align-items:center;margin:0 0 16px;padding:14px 16px;border:1px solid #d9e2f2;border-radius:18px;background:#fbfdff;box-shadow:0 7px 22px rgba(42,73,126,.06)}
    .gcRemyCreateMascot{width:64px;height:68px;object-fit:contain}.gcRemyCreateBody{min-width:0}.gcRemyCreateHead{display:flex;align-items:baseline;gap:8px;margin:1px 0 8px}.gcRemyCreateHead strong{font-size:16px}.gcRemyCreateHead span{color:#6c7786;font-size:12px}
    .gcRemyCreateForm{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:7px;align-items:center}.gcRemyCreateForm textarea{resize:vertical;min-height:46px;max-height:120px;padding:10px 11px;border:1px solid #cfd8e5;border-radius:13px;font:inherit;font-size:13px;line-height:1.4;background:#fff}.gcRemyCreateForm textarea:focus{outline:2px solid rgba(47,100,214,.16);border-color:#2f64d6}
    .gcRemyCreateMic,.gcRemyCreateSend{width:44px;height:44px;border-radius:13px;border:1px solid #cfd8e5;background:#fff;font:inherit;font-size:18px;cursor:pointer}.gcRemyCreateSend{background:#2f64d6;color:#fff;border-color:#2f64d6}.gcRemyCreateMic.listening{background:#fff0f0;border-color:#e25b5b;color:#b42318;animation:gcRemyPulse 1.2s ease-in-out infinite}
    .gcRemyCreateStatus{margin-top:7px;color:#536274;font-size:12px;line-height:1.4}.gcRemyCreateStatus.success{color:#2f6a46}.gcRemyCreateStatus.error{color:#9a3e38}.gcRemyCreateStatus[hidden]{display:none!important}
    .gcRemyProposal{margin-top:10px;padding:12px;border:1px solid #cbd9f0;border-radius:13px;background:#fff}.gcRemyProposal h3{margin:0 0 5px;font-size:14px}.gcRemyProposal p{margin:0 0 9px;color:#596579;font-size:12px;line-height:1.45}.gcRemyProposalFields{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.gcRemyProposalField{display:grid;gap:4px;font-size:12px;font-weight:650}.gcRemyProposalField input,.gcRemyProposalField textarea{width:100%;min-width:0;padding:7px;border:1px solid #cfd8e5;border-radius:8px;font:inherit}.gcRemyProposalField textarea{min-height:58px}.gcRemyProposalField input:disabled,.gcRemyProposalField textarea:disabled{background:#f5f7fa;color:#344054}.gcRemyProposalFields fieldset{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;border:1px solid #d7deea;border-radius:8px}.gcRemyProposalFields fieldset label{font-size:12px}.gcRemyProposalActions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.gcRemyProposalActions .button{min-height:38px}
    .gcRemyOriginalWishAction:empty{display:none}.gcRemyOriginalWishAction:not(:empty){margin-top:7px}.gcRemyOriginalWishAction .button{min-height:36px}
    .gcRemyFilled{animation:gcRemyFilled 1.6s ease}.gcRemyFilled input,.gcRemyFilled select,.gcRemyFilled textarea{border-color:#5d8ce5!important;box-shadow:0 0 0 3px rgba(93,140,229,.12)!important}
    @keyframes gcRemyPulse{50%{transform:scale(.95);box-shadow:0 0 0 5px rgba(226,91,91,.12)}}@keyframes gcRemyFilled{0%,100%{background:transparent}30%{background:#f2f7ff}}
    @media(max-width:700px){#aiView .gcRemyCreatePanel{grid-template-columns:48px minmax(0,1fr);padding:12px}.gcRemyCreateMascot{width:48px;height:48px}.gcRemyCreateForm{grid-column:1 / -1;grid-template-columns:44px minmax(0,1fr) 44px}.gcRemyCreateHead{margin-top:4px}}
    @media(prefers-reduced-motion:reduce){.gcRemyCreateMic.listening,.gcRemyFilled{animation:none}}
  `;
  document.head.appendChild(style);
}

function ensurePanel() {
  const aiView = $("#aiView");
  if (!aiView || $("#gcRemyCreatePanel")) return;
  const panel = document.createElement("section");
  panel.id = "gcRemyCreatePanel";
  panel.className = "gcRemyCreatePanel";
  panel.setAttribute("aria-label", "Eckdaten mit Remy festlegen");
  panel.innerHTML = `
    <img class="gcRemyCreateMascot" src="assets/gradecrew/remy-test-input-microphone.png" width="64" height="68" alt="Remy mit Handmikrofon">
    <div class="gcRemyCreateBody">
      <div class="gcRemyCreateHead"><strong>Remy</strong><span>Welche Eckdaten hat dein Test?</span></div>
      <form id="gcRemyCreateForm" class="gcRemyCreateForm">
        <button id="gcRemyCreateMic" class="gcRemyCreateMic" type="button" aria-label="Eckdaten diktieren" title="Eckdaten diktieren">🎙</button>
        <textarea id="gcRemyCreateInput" rows="2" maxlength="2500" aria-label="Eckdaten für deinen Test" aria-describedby="gcRemyCreateHint" placeholder="z. B. Mathematik, Klasse 7, Prozentrechnung, mittel, 10 Aufgaben"></textarea>
        <button id="gcRemyCreateSend" class="gcRemyCreateSend" type="submit" aria-label="Eckdaten übernehmen">➜</button>
      </form>
      <p id="gcRemyCreateHint" class="gcRemyCreateStatus">Hier nur die Eckdaten: Fach, Klasse, Thema, Schwierigkeit und Aufgabenanzahl. Was im Test genau drankommen soll, beschreibst du unten unter „Was soll der Test genau abfragen?“.</p>
      <div id="gcRemyCreateStatus" class="gcRemyCreateStatus" role="status" aria-live="polite" hidden></div>
      <div id="gcRemyOriginalWishAction" class="gcRemyOriginalWishAction" role="group" aria-label="Originalen Wunsch übernehmen"></div>
    </div>`;
  aiView.querySelector(".pageHead")?.insertAdjacentElement("afterend", panel);
  ensureNotesMic();
  panel.querySelector("#gcRemyCreateForm")?.addEventListener("submit", event => {
    event.preventDefault();
    void submitRequest();
  });
  panel.querySelector("#gcRemyCreateMic")?.addEventListener("click", () => toggleDictation("gcRemyCreateInput"));
  panel.querySelector("#gcRemyCreateInput")?.addEventListener("input", event => {
    if (event.isTrusted && !keepListening) currentInputMode = "text";
  });
  panel.querySelector("#gcRemyCreateInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitRequest();
    }
  });
}

function ensureNotesMic() {
  const field = $("#aiCustomNotes");
  const label = field?.closest("label");
  if (!field || !label || $("#gcRemyNotesMic")) return;
  const heading = document.createElement("span");
  heading.className = "gcRemyNotesHead";
  const title = document.createElement("span");
  title.textContent = "Was soll der Test genau abfragen?";
  const optional = label.querySelector("small");
  const mic = document.createElement("button");
  mic.id = "gcRemyNotesMic";
  mic.className = "gcRemyCreateMic gcRemyNotesMic";
  mic.type = "button";
  mic.setAttribute("aria-label", "Wünsche diktieren");
  mic.title = "Wünsche diktieren";
  mic.textContent = "🎙";
  heading.append(title);
  if (optional) heading.append(optional);
  heading.append(mic);
  label.insertBefore(heading, field);
  Array.from(label.childNodes).forEach(node => {
    if (node !== heading && node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.remove();
  });
  const status = document.createElement("span");
  status.id = "gcRemyNotesMicStatus";
  status.className = "gcRemyCreateStatus";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  label.append(status);
  mic.addEventListener("click", () => toggleDictation("aiCustomNotes"));
  Object.assign(heading.style, { display: "flex", alignItems: "center", gap: "7px" });
  Object.assign(mic.style, { width: "34px", height: "34px", fontSize: "15px" });
}

function currentContext() {
  return {
    screen: "ai_create",
    aiForm: {
      subject: $("#aiSubject")?.value || "",
      grade: $("#aiGrade")?.value || "",
      schoolType: $("#aiSchoolType")?.value || "",
      region: $("#aiRegion")?.value || "",
      topic: $("#aiTopic")?.value || "",
      difficulty: $("#aiDifficulty")?.value || "",
      count: Number($("#aiCount")?.value) || null,
      points: Number($("#aiPoints")?.value) || null,
      imageQuestionCount: Number($("#aiImageQuestionCount")?.value) || 0,
      audioQuestionCount: Number($("#aiAudioQuestionCount")?.value) || 0,
      audioAnswerQuestionCount: Number($("#aiAudioAnswerQuestionCount")?.value) || 0,
      solutionAudioQuestionCount: Number($("#aiSolutionAudioQuestionCount")?.value) || 0
    }
  };
}

function setStatus(message = "", kind = "") {
  const host = $("#gcRemyCreateStatus");
  if (!host) return;
  host.textContent = message;
  host.className = `gcRemyCreateStatus${kind ? ` ${kind}` : ""}`;
  host.hidden = !message;
  $("#gcRemyOriginalWishAction")?.replaceChildren();
}

function setMicStatus(targetId, message = "", kind = "") {
  if (targetId === "aiCustomNotes") {
    const host = $("#gcRemyNotesMicStatus");
    if (!host) return;
    host.textContent = message;
    host.className = `gcRemyCreateStatus${kind ? ` ${kind}` : ""}`;
    host.hidden = !message;
    return;
  }
  setStatus(message, kind);
}

function setBusy(next) {
  busy = Boolean(next);
  $("#gcRemyCreateSend")?.toggleAttribute("disabled", busy);
  $("#gcRemyCreateInput")?.toggleAttribute("disabled", busy);
  $("#gcRemyNotesMic")?.toggleAttribute("disabled", busy);
  if (busy && keepListening) {
    const targetId = dictationTargetId;
    stopDictation();
    setMicStatus(targetId, uiText("Diktat beendet. Der bisherige Text bleibt im Feld.", "Dictation stopped. Your text remains in the field."));
  }
}

function highlightField(field) {
  const label = field?.closest("label") || field;
  if (!label) return;
  label.classList.remove("gcRemyFilled");
  void label.offsetWidth;
  label.classList.add("gcRemyFilled");
  window.setTimeout(() => label.classList.remove("gcRemyFilled"), 1800);
}

function setField(id, value) {
  const field = $(id);
  if (!field || value === undefined || value === null || value === "") return false;
  field.value = String(value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  highlightField(field);
  return true;
}

function appendNote(text) {
  const field = $("#aiCustomNotes");
  if (!field || !text) return true;
  const optionalSettings = field.closest("details.aiOptionalTestOptions");
  if (optionalSettings) optionalSettings.open = true;
  const current = field.value.trim();
  if (current.toLocaleLowerCase().includes(text.toLocaleLowerCase())) return true;
  const next = [current, text].filter(Boolean).join(current ? "\n" : "");
  if (next.length > 6000) {
    setStatus(uiText("Eigene Wünsche dürfen höchstens 6.000 Zeichen enthalten. Kürze den Vorschlag, bevor du ihn übernimmst.", "Your wishes can contain up to 6,000 characters. Shorten the suggestion before applying it."), "error");
    field.focus({ preventScroll: true });
    return false;
  }
  field.value = next;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  highlightField(field);
  return true;
}

function canApplyPatchNotes(patch = {}) {
  const field = $("#aiCustomNotes");
  if (!field) return true;
  const current = field.value.trim();
  const additions = [];
  if (patch.notes) additions.push(String(patch.notes).trim());
  if (patch.durationMinutes) additions.push(uiText(
    `Gewünschte Bearbeitungszeit: ca. ${patch.durationMinutes} Minuten.`,
    `Requested working time: approx. ${patch.durationMinutes} minutes.`
  ));
  const next = [...new Set(additions.filter(Boolean).filter(text => !current.toLocaleLowerCase().includes(text.toLocaleLowerCase())))];
  const combined = [current, ...next].filter(Boolean).join(current ? "\n" : "");
  if (combined.length <= 6000) return true;
  setStatus(uiText("Eigene Wünsche dürfen höchstens 6.000 Zeichen enthalten. Kürze den Vorschlag, bevor du ihn übernimmst.", "Your wishes can contain up to 6,000 characters. Shorten the suggestion before applying it."), "error");
  field.focus({ preventScroll: true });
  return false;
}

function applyTypePatch(patch) {
  const root = $("#aiTypeChecks");
  if (!root) return;
  const boxes = Array.from(root.querySelectorAll('input[type="checkbox"]'));
  let changed = false;
  if (Array.isArray(patch.allowedTypes) && patch.allowedTypes.length) {
    const wanted = new Set(patch.allowedTypes);
    boxes.forEach(box => {
      const next = wanted.has(box.value);
      if (box.checked !== next) changed = true;
      box.checked = next;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  if (Array.isArray(patch.excludeTypes) && patch.excludeTypes.length) {
    const blocked = new Set(patch.excludeTypes);
    boxes.forEach(box => {
      if (blocked.has(box.value) && box.checked) {
        changed = true;
        box.checked = false;
        box.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
  if (!boxes.some(box => box.checked) && boxes[0]) {
    boxes[0].checked = true;
    boxes[0].dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (changed) highlightField(root.closest("details") || root);
}

function stagePatch(patch = {}, options = {}) {
  if (pendingProposal) return;
  const panel = $("#gcRemyCreatePanel");
  if (!panel) return applyPatch(patch);
  pendingProposal = patch;
  const proposal = document.createElement("section");
  proposal.id = "gcRemyProposal";
  proposal.className = "gcRemyProposal";
  proposal.setAttribute("aria-labelledby", "gcRemyProposalTitle");
  const title = document.createElement("h3");
  title.id = "gcRemyProposalTitle";
  title.textContent = options.title || uiText("Vorschlag prüfen", "Review this suggestion");
  const description = document.createElement("p");
  description.textContent = options.description || uiText("Die Angaben werden erst nach „Übernehmen“ in die genannten Felder eingetragen.", "Nothing is applied until you choose Apply.");
  const fields = document.createElement("div");
  fields.className = "gcRemyProposalFields";
  const labels = {
    contentLocale: uiText("Testsprache", "Test language"), subject: uiText("Fach", "Subject"), grade: uiText("Klasse", "Grade"),
    schoolType: uiText("Schulart", "School type"), region: uiText("Bundesland", "Region"), topic: uiText("Thema", "Topic"),
    difficulty: uiText("Schwierigkeit", "Difficulty"), count: uiText("Aufgabenanzahl", "Question count"), points: uiText("Gesamtpunkte", "Total points"),
    imageQuestionCount: uiText("Aufgaben mit Bild", "Questions with images"), audioQuestionCount: uiText("Höraufgaben", "Listening tasks"),
    audioAnswerQuestionCount: uiText("Aufgaben mit vorgelesenen Antwortoptionen", "Questions with spoken answer options"),
    solutionAudioQuestionCount: uiText("Lösungen als Audio", "Audio solutions"), notes: uiText("Eigene Wünsche", "Your wishes"),
    durationMinutes: uiText("Bearbeitungszeit", "Working time")
  };
  const editableKeys = Object.keys(labels).filter(key => patch[key] !== undefined && patch[key] !== null && patch[key] !== "");
  editableKeys.forEach(key => {
    const label = document.createElement("label");
    label.className = "gcRemyProposalField";
    const caption = document.createElement("span");
    caption.textContent = labels[key];
    const input = key === "notes" ? document.createElement("textarea") : document.createElement("input");
    input.dataset.proposalKey = key;
    input.value = String(patch[key]);
    if (key === "notes") input.maxLength = 6000;
    input.disabled = true;
    if (key !== "notes" && typeof patch[key] === "number") input.type = "number";
    label.append(caption, input);
    fields.append(label);
  });
  if (Array.isArray(patch.allowedTypes) || Array.isArray(patch.excludeTypes)) {
    const fieldset = document.createElement("fieldset");
    fieldset.dataset.proposalKey = "allowedTypes";
    const legend = document.createElement("legend");
    legend.textContent = uiText("Aufgabentypen", "Question types");
    fieldset.append(legend);
    const sourceBoxes = Array.from(document.querySelectorAll('#aiTypeChecks input[type="checkbox"]'));
    sourceBoxes.forEach(source => {
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = source.value;
      box.checked = Array.isArray(patch.allowedTypes) ? patch.allowedTypes.includes(source.value) : source.checked && !patch.excludeTypes.includes(source.value);
      box.disabled = true;
      label.append(box, document.createTextNode(source.closest("label")?.textContent.trim() || source.value));
      fieldset.append(label);
    });
    fields.append(fieldset);
  }
  const actions = document.createElement("div");
  actions.className = "gcRemyProposalActions";
  const edit = document.createElement("button");
  edit.id = "gcRemyProposalEdit";
  edit.type = "button";
  edit.className = "button secondary";
  edit.textContent = uiText("Anpassen", "Adjust");
  const accept = document.createElement("button");
  accept.id = "gcRemyProposalApply";
  accept.type = "button";
  accept.className = "button primary";
  accept.textContent = options.acceptLabel || uiText("Übernehmen", "Apply");
  actions.append(edit, accept);
  proposal.append(title, description, fields, actions);
  panel.querySelector(".gcRemyCreateBody")?.append(proposal);
  edit.addEventListener("click", () => {
    proposal.querySelectorAll("input,textarea").forEach(input => { input.disabled = false; });
    edit.disabled = true;
    proposal.querySelector("input,textarea")?.focus();
    setStatus(uiText("Du kannst den Vorschlag jetzt ändern. Noch ist nichts übernommen.", "You can now edit the suggestion. Nothing has been applied yet."));
  });
  accept.addEventListener("click", () => {
    if (!pendingProposal) return;
    const accepted = { ...pendingProposal };
    proposal.querySelectorAll("[data-proposal-key]").forEach(input => {
      const key = input.dataset.proposalKey;
      if (key === "allowedTypes") accepted.allowedTypes = Array.from(input.querySelectorAll('input[type="checkbox"]:checked')).map(box => box.value);
      else if (key === "notes") accepted.notes = input.value.trim();
      else if (typeof accepted[key] === "number") accepted[key] = Number(input.value);
      else accepted[key] = input.value.trim();
    });
    if (!canApplyPatchNotes(accepted)) return;
    pendingProposal = null;
    proposal.remove();
    applyPatch(accepted);
    const changed = editableKeys.map(key => labels[key]);
    if (Array.isArray(accepted.allowedTypes) || Array.isArray(accepted.excludeTypes)) changed.push(labels.allowedTypes || uiText("Aufgabentypen", "Question types"));
    if (accepted.durationMinutes) changed.push(labels.durationMinutes);
    setStatus(uiText(`✓ Übernommen in: ${changed.join(", ")}.`, `✓ Applied to: ${changed.join(", ")}.`), "success");
    $("#aiCustomNotes")?.focus({ preventScroll: true });
  });
  setStatus(options.status || uiText("Remy hat einen Vorschlag vorbereitet. Prüfe die Felder und wähle „Übernehmen“ oder „Anpassen“.", "Remy prepared a suggestion. Review the fields and choose Apply or Adjust."));
  accept.focus();
}

function offerOriginalWish(text, reply = "") {
  const original = String($("#gcRemyCreateInput")?.value ?? text ?? "").trim().slice(0, 6000);
  if (!original) return false;
  setStatus(reply || uiText("Ich konnte daraus noch keine sicheren Angaben übernehmen.", "I couldn\'t safely apply any details from that yet."));
  const host = $("#gcRemyOriginalWishAction");
  if (!host) return false;
  const button = document.createElement("button");
  button.type = "button";
  button.id = "gcRemyOriginalWish";
  button.className = "button secondary";
  button.textContent = uiText("Als zusätzlichen Wunsch übernehmen", "Use as an additional wish");
  host.append(button);
  button.addEventListener("click", () => {
    stagePatch({ notes: original }, {
      title: uiText("Dein Wunsch", "Your wish"),
      description: [reply, uiText("Vorschau aus deinem Originaltext. Du kannst ihn anpassen; erst danach wird er in „Eigene Wünsche“ eingetragen.", "Preview from your original text. You can adjust it before it is added to Your wishes.")].filter(Boolean).join(" "),
      acceptLabel: uiText("Als Wunsch übernehmen", "Apply as a wish"),
      status: uiText("Dein Originaltext wartet auf Bestätigung.", "Your original text is waiting for confirmation.")
    });
  });
  return true;
}

function applyPatch(patch = {}) {
  if (!canApplyPatchNotes(patch)) return false;
  if (["de-DE", "en-GB"].includes(patch.contentLocale)) setField("#aiContentLocale", patch.contentLocale);
  setField("#aiSubject", patch.subject);
  setField("#aiGrade", patch.grade);
  setField("#aiSchoolType", patch.schoolType);
  setField("#aiRegion", patch.region);
  setField("#aiTopic", patch.topic);
  setField("#aiDifficulty", patch.difficulty);
  setField("#aiCount", patch.count);
  setField("#aiPoints", patch.points);
  if (patch.imageQuestionCount !== undefined && patch.imageQuestionCount !== null) setField("#aiImageQuestionCount", patch.imageQuestionCount);
  if (patch.audioQuestionCount !== undefined && patch.audioQuestionCount !== null) setField("#aiAudioQuestionCount", patch.audioQuestionCount);
  if (patch.audioAnswerQuestionCount !== undefined && patch.audioAnswerQuestionCount !== null) setField("#aiAudioAnswerQuestionCount", patch.audioAnswerQuestionCount);
  if (patch.solutionAudioQuestionCount !== undefined && patch.solutionAudioQuestionCount !== null) setField("#aiSolutionAudioQuestionCount", patch.solutionAudioQuestionCount);
  applyTypePatch(patch);
  if (patch.notes) appendNote(String(patch.notes));
  if (patch.durationMinutes) appendNote(uiText(
    `Gewünschte Bearbeitungszeit: ca. ${patch.durationMinutes} Minuten.`,
    `Requested working time: approx. ${patch.durationMinutes} minutes.`
  ));
  const summary = patchSummary(patch, currentUiLocale());
  setStatus(summary
    ? uiText(`✓ Eingetragen: ${summary}`, `✓ Added: ${summary}`)
    : uiText("✓ Eingetragen.", "✓ Added."), "success");
  $("#aiTopic")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function callRemyAi(text) {
  const functions = getFunctions(getApp(), "europe-west1");
  const callable = httpsCallable(functions, "crewAssistant", { timeout: 90000 });
  const result = await callable({ crewId: "remy", text, uiLocale: currentUiLocale(), context: currentContext() });
  return result.data || {};
}

function errorType(error) {
  const value = String(error?.code || error?.message || "").toLowerCase();
  if (value.includes("permission") || value.includes("unauth")) return "permission";
  if (value.includes("network") || value.includes("fetch")) return "network";
  if (value.includes("unavailable") || value.includes("timeout")) return "unavailable";
  return "unknown";
}

async function submitRequest() {
  if (busy) return;
  if (pendingProposal) {
    setStatus(uiText("Bitte übernimm oder passe den offenen Vorschlag zuerst an.", "Apply or adjust the pending suggestion first."));
    return;
  }
  const input = $("#gcRemyCreateInput");
  const text = String(input?.value || "").trim();
  if (!text) return;
  const mode = currentInputMode;
  const startedAt = performance.now();
  recordRemySubmission(mode);
  setBusy(true);
  setStatus(uiText("Remy trägt ein …", "Remy is applying your request …"));
  try {
    const local = resolveLocalCrewRequest({ crewId: "remy", text, context: currentContext(), locale: currentUiLocale() });
    if (local.handled && local.action?.type === "patch_ai_form") {
      const patch = local.action.patch || {};
      stagePatch(patch);
      recordRemyPatch(patch, { inputMode: mode, source: "local", latencyMs: performance.now() - startedAt });
      return;
    }
    if (local.handled) {
      recordRemyMetric("local_response", { inputMode: mode, source: "local", latencyMs: performance.now() - startedAt });
      if (!offerOriginalWish(text, local.reply)) setStatus(local.reply || uiText("Sag mir kurz, welchen Test du brauchst.", "Tell me briefly what test you need."));
      return;
    }
    recordRemyMetric("ai_fallback_started", { inputMode: mode, source: "ai" });
    const result = await callRemyAi(text);
    if (result.action?.type === "patch_ai_form") {
      const patch = result.action.patch || {};
      stagePatch(patch);
      recordRemyPatch(patch, { inputMode: mode, source: "ai", latencyMs: performance.now() - startedAt });
      return;
    }
    if (!offerOriginalWish(text, result.reply)) setStatus(result.reply || uiText("Ich konnte daraus noch keine sicheren Angaben übernehmen.", "I couldn\'t safely apply any details from that yet."));
  } catch (error) {
    console.warn("Remy konnte den Testwunsch nicht verarbeiten:", error?.code || error?.message || error);
    recordRemyMetric("request_failed", { inputMode: mode, latencyMs: performance.now() - startedAt, errorType: errorType(error) });
    setStatus(uiText("Das hat gerade nicht geklappt. Versuch es bitte noch einmal.", "That didn\'t work just now. Please try again."), "error");
  } finally {
    currentInputMode = "text";
    setBusy(false);
  }
}

function speechConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function updateMicState() {
  ["gcRemyCreateMic", "gcRemyNotesMic"].forEach(id => {
    const button = $(`#${id}`);
    const listening = keepListening && dictationTargetId === (id === "gcRemyNotesMic" ? "aiCustomNotes" : "gcRemyCreateInput");
    button?.classList.toggle("listening", listening);
    if (button) {
      button.textContent = listening ? "●" : "🎙";
      button.setAttribute("aria-label", listening ? uiText("Diktat abbrechen", "Stop dictation") : id === "gcRemyNotesMic" ? uiText("Wünsche diktieren", "Dictate wishes") : uiText("Eckdaten diktieren", "Dictate test details"));
      button.title = listening ? uiText("Diktat abbrechen", "Stop dictation") : uiText("Diktieren", "Dictate");
    }
  });
}

function stopDictation() {
  const wasListening = keepListening;
  keepListening = false;
  window.clearTimeout(restartTimer);
  window.clearTimeout(stopTimer);
  restartTimer = null;
  stopTimer = null;
  const active = recognition;
  recognition = null;
  try { active?.stop(); } catch (_) {}
  updateMicState();
  if (wasListening) recordRemyMetric("voice_stopped", { inputMode: "voice" });
}

function startRecognitionCycle() {
  if (!keepListening || recognition) return;
  const SpeechRecognition = speechConstructor();
  if (!SpeechRecognition) {
    stopDictation();
    setStatus(uiText("Diktieren wird von diesem Browser nicht unterstützt.", "Dictation isn\'t supported by this browser."), "error");
    return;
  }

  const active = new SpeechRecognition();
  recognition = active;
  active.lang = currentVoiceInputLocale();
  active.interimResults = true;
  active.continuous = true;
  active.maxAlternatives = 1;

  active.onresult = event => {
    let interim = "";
    currentInputMode = "voice";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = String(event.results[index][0]?.transcript || "").trim();
      if (!transcript) continue;
      if (event.results[index].isFinal) dictationFinal = `${dictationFinal} ${transcript}`.trim();
      else interim = `${interim} ${transcript}`.trim();
    }
    const input = $(`#${dictationTargetId}`);
    if (input) input.value = [dictationBase, dictationFinal, interim].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  };

  active.onerror = event => {
    keepListening = false;
    const errorType = ["not-allowed", "service-not-allowed"].includes(event.error) ? "permission" : event.error === "audio-capture" ? "unavailable" : event.error === "network" ? "network" : "unknown";
    recordRemyMetric("request_failed", { inputMode: "voice", errorType });
    const messages = {
      permission: uiText("Ich bekomme gerade keinen Mikrofonzugriff. Prüfe die Browserberechtigung.", "Microphone access is blocked. Check your browser permission."),
      unavailable: uiText("Das Mikrofon ist gerade nicht verfügbar.", "The microphone is not available right now."),
      network: uiText("Die Spracherkennung hat keine Verbindung. Dein bisheriger Text bleibt erhalten.", "Speech recognition lost its connection. Your text is preserved."),
      unknown: event.error === "no-speech" ? uiText("Ich habe nichts verstanden. Du kannst es erneut versuchen.", "I didn\'t hear anything. You can try again.") : uiText("Die Spracherkennung wurde beendet. Dein bisheriger Text bleibt erhalten.", "Speech recognition stopped. Your text is preserved.")
    };
    setMicStatus(dictationTargetId, messages[errorType], "error");
    stopDictation();
  };

  active.onend = () => {
    if (recognition === active) recognition = null;
    if (!keepListening) return updateMicState();
    restartTimer = window.setTimeout(startRecognitionCycle, 180);
  };

  try { active.start(); }
  catch (_) {
    recognition = null;
    if (keepListening) restartTimer = window.setTimeout(startRecognitionCycle, 300);
  }
}

function toggleDictation(targetId = "gcRemyCreateInput") {
  if (keepListening && dictationTargetId === targetId) {
    stopDictation();
    setMicStatus(targetId, uiText("Diktat beendet. Der bisherige Text bleibt im Feld.", "Dictation stopped. Your text remains in the field."));
    return;
  }
  if (keepListening) {
    const previousTarget = dictationTargetId;
    stopDictation();
    setMicStatus(previousTarget, uiText("Diktat beendet. Der bisherige Text bleibt im Feld.", "Dictation stopped. Your text remains in the field."));
  }
  if (!speechConstructor()) {
    recordRemyMetric("request_failed", { inputMode: "voice", errorType: "unsupported" });
    setMicStatus(targetId, uiText("Diktieren wird von diesem Browser nicht unterstützt.", "Dictation isn\'t supported by this browser."), "error");
    return;
  }
  dictationTargetId = targetId;
  const input = $(`#${targetId}`);
  dictationBase = String(input?.value || "").trim();
  dictationFinal = "";
  currentInputMode = "voice";
  keepListening = true;
  recordRemyMetric("voice_started", { inputMode: "voice" });
  updateMicState();
  setMicStatus(targetId, uiText("Ich höre zu …", "I\'m listening …"));
  startRecognitionCycle();
  stopTimer = window.setTimeout(() => {
    stopDictation();
    if ($(`#${targetId}`)?.value.trim()) setMicStatus(targetId, uiText("Diktat übernommen.", "Dictation added."));
  }, 60000);
}

function installLifecycle() {
  const aiView = $("#aiView");
  if (aiView) {
    new MutationObserver(() => {
      if (aiView.classList.contains("hidden")) stopDictation();
    }).observe(aiView, { attributes: true, attributeFilter: ["class"] });
  }
  document.addEventListener("gradecrew:account-changed", () => {
    stopDictation();
    pendingProposal = null;
    $("#gcRemyProposal")?.remove();
    resetRemyTelemetryContext();
    currentInputMode = "text";
    const input = $("#gcRemyCreateInput");
    if (input) input.value = "";
    setStatus("");
  });
  document.addEventListener("gradecrew:ai-form-reset", () => {
    stopDictation();
    pendingProposal = null;
    $("#gcRemyProposal")?.remove();
    dictationBase = "";
    dictationFinal = "";
    currentInputMode = "text";
    const input = $("#gcRemyCreateInput");
    if (input) input.value = "";
    setStatus("");
  });
  window.addEventListener("gradecrew:ui-locale-changed", () => {
    if (keepListening) stopDictation();
  });
}

export function installRemyAiHelp() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  ensurePanel();
  installLifecycle();
}

installRemyAiHelp();
