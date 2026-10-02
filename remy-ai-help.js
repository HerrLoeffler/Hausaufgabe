import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { CREW_MEMBERS, patchSummary, resolveLocalCrewRequest } from "./crew-assistant-core.js?v=3";
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

const REMY = CREW_MEMBERS.remy;
const $ = selector => document.querySelector(selector);

function installStyles() {
  if ($('style[data-remy-ai-help]')) return;
  const style = document.createElement("style");
  style.dataset.remyAiHelp = "2";
  style.textContent = `
    #aiView .gcRemyCreatePanel{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;align-items:start;margin:0 0 16px;padding:14px 16px;border:1px solid #d9e2f2;border-radius:18px;background:#fbfdff;box-shadow:0 7px 22px rgba(42,73,126,.06)}
    .gcRemyCreateMascot{width:58px;height:58px;object-fit:contain}.gcRemyCreateBody{min-width:0}.gcRemyCreateHead{display:flex;align-items:baseline;gap:8px;margin:1px 0 8px}.gcRemyCreateHead strong{font-size:16px}.gcRemyCreateHead span{color:#6c7786;font-size:12px}
    .gcRemyCreateForm{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:7px;align-items:end}.gcRemyCreateForm textarea{resize:vertical;min-height:46px;max-height:120px;padding:10px 11px;border:1px solid #cfd8e5;border-radius:13px;font:inherit;font-size:13px;line-height:1.4;background:#fff}.gcRemyCreateForm textarea:focus{outline:2px solid rgba(47,100,214,.16);border-color:#2f64d6}
    .gcRemyCreateMic,.gcRemyCreateSend{width:44px;height:44px;border-radius:13px;border:1px solid #cfd8e5;background:#fff;font:inherit;font-size:18px;cursor:pointer}.gcRemyCreateSend{background:#2f64d6;color:#fff;border-color:#2f64d6}.gcRemyCreateMic.listening{background:#fff0f0;border-color:#e25b5b;color:#b42318;animation:gcRemyPulse 1.2s ease-in-out infinite}
    .gcRemyCreateStatus{margin-top:7px;color:#536274;font-size:12px;line-height:1.4}.gcRemyCreateStatus.success{color:#2f6a46}.gcRemyCreateStatus.error{color:#9a3e38}.gcRemyCreateStatus[hidden]{display:none!important}
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
  panel.setAttribute("aria-label", "Test mit Remy vorbereiten");
  panel.innerHTML = `
    <img class="gcRemyCreateMascot" src="${REMY.asset}" alt="Remy">
    <div class="gcRemyCreateBody">
      <div class="gcRemyCreateHead"><strong>Remy</strong><span>Sag mir, welchen Test du brauchst.</span></div>
      <form id="gcRemyCreateForm" class="gcRemyCreateForm">
        <button id="gcRemyCreateMic" class="gcRemyCreateMic" type="button" aria-label="Testwunsch diktieren" title="Diktieren">🎙</button>
        <textarea id="gcRemyCreateInput" rows="2" maxlength="2500" placeholder="z. B. Englisch, 4. Klasse, Farben, leicht, 10 Aufgaben …"></textarea>
        <button id="gcRemyCreateSend" class="gcRemyCreateSend" type="submit" aria-label="Übernehmen">➜</button>
      </form>
      <div id="gcRemyCreateStatus" class="gcRemyCreateStatus" role="status" aria-live="polite" hidden></div>
    </div>`;
  aiView.querySelector(".pageHead")?.insertAdjacentElement("afterend", panel);
  panel.querySelector("#gcRemyCreateForm")?.addEventListener("submit", event => {
    event.preventDefault();
    void submitRequest();
  });
  panel.querySelector("#gcRemyCreateMic")?.addEventListener("click", toggleDictation);
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
      points: Number($("#aiPoints")?.value) || null
    }
  };
}

function setStatus(message = "", kind = "") {
  const host = $("#gcRemyCreateStatus");
  if (!host) return;
  host.textContent = message;
  host.className = `gcRemyCreateStatus${kind ? ` ${kind}` : ""}`;
  host.hidden = !message;
}

function setBusy(next) {
  busy = Boolean(next);
  $("#gcRemyCreateSend")?.toggleAttribute("disabled", busy);
  $("#gcRemyCreateInput")?.toggleAttribute("disabled", busy);
  if (busy) stopDictation();
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
  if (!field || !text) return;
  const current = field.value.trim();
  if (current.toLocaleLowerCase("de-DE").includes(text.toLocaleLowerCase("de-DE"))) return;
  field.value = [current, text].filter(Boolean).join(current ? "\n" : "");
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  highlightField(field);
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

function applyPatch(patch = {}) {
  setField("#aiSubject", patch.subject);
  setField("#aiGrade", patch.grade);
  setField("#aiSchoolType", patch.schoolType);
  setField("#aiRegion", patch.region);
  setField("#aiTopic", patch.topic);
  setField("#aiDifficulty", patch.difficulty);
  setField("#aiCount", patch.count);
  setField("#aiPoints", patch.points);
  applyTypePatch(patch);
  if (patch.notes) appendNote(String(patch.notes).slice(0, 1500));
  if (patch.durationMinutes) appendNote(`Gewünschte Bearbeitungszeit: ca. ${patch.durationMinutes} Minuten.`);
  const summary = patchSummary(patch);
  setStatus(summary ? `✓ Eingetragen: ${summary}` : "✓ Eingetragen.", "success");
  $("#aiTopic")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function callRemyAi(text) {
  const functions = getFunctions(getApp(), "europe-west1");
  const callable = httpsCallable(functions, "crewAssistant", { timeout: 90000 });
  const result = await callable({ crewId: "remy", text, context: currentContext() });
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
  const input = $("#gcRemyCreateInput");
  const text = String(input?.value || "").trim();
  if (!text) return;
  const mode = currentInputMode;
  const startedAt = performance.now();
  recordRemySubmission(mode);
  stopDictation();
  setBusy(true);
  setStatus("Remy trägt ein …");
  try {
    const local = resolveLocalCrewRequest({ crewId: "remy", text, context: currentContext() });
    if (local.handled && local.action?.type === "patch_ai_form") {
      const patch = local.action.patch || {};
      applyPatch(patch);
      recordRemyPatch(patch, { inputMode: mode, source: "local", latencyMs: performance.now() - startedAt });
      return;
    }
    if (local.handled) {
      recordRemyMetric("local_response", { inputMode: mode, source: "local", latencyMs: performance.now() - startedAt });
      setStatus(local.reply || "Sag mir kurz, welchen Test du brauchst.");
      return;
    }
    recordRemyMetric("ai_fallback_started", { inputMode: mode, source: "ai" });
    const result = await callRemyAi(text);
    if (result.action?.type === "patch_ai_form") {
      const patch = result.action.patch || {};
      applyPatch(patch);
      recordRemyPatch(patch, { inputMode: mode, source: "ai", latencyMs: performance.now() - startedAt });
      return;
    }
    setStatus(result.reply || "Ich konnte daraus noch keine sicheren Angaben übernehmen.");
  } catch (error) {
    console.warn("Remy konnte den Testwunsch nicht verarbeiten:", error?.code || error?.message || error);
    recordRemyMetric("request_failed", { inputMode: mode, latencyMs: performance.now() - startedAt, errorType: errorType(error) });
    setStatus("Das hat gerade nicht geklappt. Versuch es bitte noch einmal.", "error");
  } finally {
    currentInputMode = "text";
    setBusy(false);
  }
}

function speechConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function updateMicState() {
  const button = $("#gcRemyCreateMic");
  button?.classList.toggle("listening", keepListening);
  if (button) button.textContent = keepListening ? "●" : "🎙";
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
    setStatus("Diktieren wird von diesem Browser nicht unterstützt.", "error");
    return;
  }

  const active = new SpeechRecognition();
  recognition = active;
  active.lang = "de-DE";
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
    const input = $("#gcRemyCreateInput");
    if (input) input.value = [dictationBase, dictationFinal, interim].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  };

  active.onerror = event => {
    if (["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error)) {
      keepListening = false;
      recordRemyMetric("request_failed", { inputMode: "voice", errorType: event.error === "audio-capture" ? "unavailable" : "permission" });
      setStatus("Ich bekomme gerade keinen Mikrofonzugriff.", "error");
    }
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

function toggleDictation() {
  if (keepListening) return stopDictation();
  if (!speechConstructor()) {
    recordRemyMetric("request_failed", { inputMode: "voice", errorType: "unsupported" });
    setStatus("Diktieren wird von diesem Browser nicht unterstützt.", "error");
    return;
  }
  const input = $("#gcRemyCreateInput");
  dictationBase = String(input?.value || "").trim();
  dictationFinal = "";
  currentInputMode = "voice";
  keepListening = true;
  recordRemyMetric("voice_started", { inputMode: "voice" });
  updateMicState();
  setStatus("Ich höre zu …");
  startRecognitionCycle();
  stopTimer = window.setTimeout(() => {
    stopDictation();
    if ($("#gcRemyCreateInput")?.value.trim()) setStatus("Diktat übernommen.");
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
    resetRemyTelemetryContext();
    currentInputMode = "text";
    const input = $("#gcRemyCreateInput");
    if (input) input.value = "";
    setStatus("");
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
