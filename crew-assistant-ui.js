import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { CREW_MEMBERS, resolveLocalCrewRequest } from "./crew-assistant-core.js?v=1";

let installed = false;
let open = false;
let activeCrewId = "remy";
let speech = null;
const sessionStats = { local: 0, ai: 0, intents: Object.create(null) };

const $ = id => document.getElementById(id);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function installStyles() {
  if (document.querySelector("style[data-crew-assistant]")) return;
  const style = document.createElement("style");
  style.dataset.crewAssistant = "1";
  style.textContent = `
    .gcCrewLauncher{position:fixed;right:22px;bottom:22px;z-index:1450;display:flex;align-items:center;gap:9px;border:1px solid #cfd9ee;border-radius:999px;background:#fff;color:#234f9f;padding:9px 14px 9px 9px;box-shadow:0 14px 38px rgba(31,52,86,.17);font:inherit;font-weight:800;cursor:pointer}
    .gcCrewLauncher:hover{transform:translateY(-1px);box-shadow:0 18px 44px rgba(31,52,86,.21)}
    .gcCrewLauncher img{width:38px;height:38px;object-fit:contain}
    .gcCrewLauncher[hidden]{display:none!important}
    .gcCrewPanel{position:fixed;right:22px;bottom:82px;z-index:1460;width:min(430px,calc(100vw - 28px));height:min(650px,calc(100dvh - 110px));display:grid;grid-template-rows:auto auto 1fr auto;border:1px solid #d9e1ec;border-radius:24px;background:#fff;box-shadow:0 28px 80px rgba(22,40,68,.24);overflow:hidden;color:#183b36}
    .gcCrewPanel[hidden]{display:none!important}
    .gcCrewHead{display:flex;align-items:center;gap:10px;padding:14px 15px;border-bottom:1px solid #edf0f4;background:#fffdf9}
    .gcCrewHead img{width:48px;height:48px;object-fit:contain}
    .gcCrewHeadCopy{min-width:0;flex:1}.gcCrewHeadCopy strong{display:block;font-size:16px}.gcCrewHeadCopy span{display:block;color:#6b747f;font-size:12px;margin-top:2px}
    .gcCrewClose{border:0;background:transparent;color:#66727d;font-size:25px;line-height:1;cursor:pointer;padding:5px}
    .gcCrewTabs{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:8px;background:#f7f9fc;border-bottom:1px solid #edf0f4}
    .gcCrewTab{border:1px solid transparent;border-radius:12px;background:transparent;padding:7px 4px;color:#54616d;font:inherit;font-size:11px;font-weight:800;cursor:pointer;min-width:0}
    .gcCrewTab img{display:block;width:32px;height:32px;object-fit:contain;margin:0 auto 3px}.gcCrewTab[aria-selected="true"]{background:#fff;border-color:#cfdaf0;color:#244f9e;box-shadow:0 3px 12px rgba(34,65,112,.08)}
    .gcCrewMessages{overflow:auto;padding:14px 14px 8px;background:#fbfcfe;scroll-behavior:smooth}
    .gcCrewMsg{max-width:88%;margin:0 0 10px;padding:10px 12px;border-radius:15px;font-size:13px;line-height:1.48;white-space:pre-wrap;overflow-wrap:anywhere}
    .gcCrewMsg.user{margin-left:auto;background:#2f64d6;color:#fff;border-bottom-right-radius:5px}.gcCrewMsg.assistant{background:#fff;border:1px solid #e2e7ed;border-bottom-left-radius:5px}.gcCrewMsg.pending{color:#68747e;font-style:italic}
    .gcCrewSource{display:block;margin-top:5px;color:#8b949d;font-size:10px;font-style:normal}.gcCrewMsg.user .gcCrewSource{color:#dbe7ff}
    .gcCrewComposer{padding:10px 12px 12px;border-top:1px solid #edf0f4;background:#fff}
    .gcCrewComposerRow{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:end}.gcCrewComposer textarea{resize:none;min-height:43px;max-height:110px;padding:10px 11px;border:1px solid #cfd8e5;border-radius:13px;font:inherit;font-size:13px;line-height:1.4}.gcCrewComposer textarea:focus{outline:2px solid rgba(47,100,214,.18);border-color:#2f64d6}
    .gcCrewMic,.gcCrewSend{width:43px;height:43px;border-radius:13px;border:1px solid #cfd8e5;background:#fff;font-size:18px;cursor:pointer}.gcCrewSend{background:#2f64d6;color:#fff;border-color:#2f64d6}.gcCrewMic.listening{background:#fff0f0;border-color:#e25b5b;color:#b42318;animation:gcCrewPulse 1.2s ease-in-out infinite}
    .gcCrewHint{margin:6px 2px 0;color:#7b8490;font-size:10px;line-height:1.35}.gcCrewHint strong{color:#53606d}
    .gcCrewQuick{display:flex;gap:6px;overflow:auto;padding:0 0 7px}.gcCrewQuick button{white-space:nowrap;border:1px solid #d7dfeb;border-radius:999px;background:#fff;color:#4d5c6b;padding:6px 9px;font:inherit;font-size:10px;cursor:pointer}
    @keyframes gcCrewPulse{50%{transform:scale(.95);box-shadow:0 0 0 5px rgba(226,91,91,.12)}}
    @media(max-width:620px){.gcCrewLauncher{right:12px;bottom:12px}.gcCrewPanel{right:8px;bottom:70px;width:calc(100vw - 16px);height:min(72dvh,660px);border-radius:20px}.gcCrewLauncher span{display:none}.gcCrewLauncher{padding:7px}.gcCrewLauncher img{width:40px;height:40px}}
    @media(prefers-reduced-motion:reduce){.gcCrewLauncher:hover,.gcCrewMic.listening{transform:none;animation:none}}
  `;
  document.head.appendChild(style);
}

function teacherUiAvailable() {
  const userBar = $("userBar");
  const studentVisible = $("studentView") && !$("studentView").classList.contains("hidden");
  const authVisible = $("authView") && !$("authView").classList.contains("hidden");
  return Boolean(userBar && !userBar.classList.contains("hidden") && !studentVisible && !authVisible);
}

function updateLauncherVisibility() {
  const launcher = $("gcCrewLauncher");
  if (!launcher) return;
  launcher.hidden = !teacherUiAvailable();
  if (launcher.hidden) setOpen(false);
}

function createUi() {
  if ($("gcCrewLauncher")) return;
  const launcher = document.createElement("button");
  launcher.id = "gcCrewLauncher";
  launcher.className = "gcCrewLauncher";
  launcher.type = "button";
  launcher.setAttribute("aria-controls", "gcCrewPanel");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = `<img src="${CREW_MEMBERS.remy.asset}" alt=""><span>Crew fragen</span>`;

  const panel = document.createElement("aside");
  panel.id = "gcCrewPanel";
  panel.className = "gcCrewPanel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Mit der GradeCrew sprechen");
  panel.innerHTML = `
    <div class="gcCrewHead">
      <img id="gcCrewHeadImage" src="${CREW_MEMBERS.remy.asset}" alt="">
      <div class="gcCrewHeadCopy"><strong id="gcCrewHeadName">Remy</strong><span id="gcCrewHeadRole">${escapeHtml(CREW_MEMBERS.remy.role)}</span></div>
      <button id="gcCrewClose" class="gcCrewClose" type="button" aria-label="Crew schließen">×</button>
    </div>
    <div class="gcCrewTabs" role="tablist" aria-label="Crew auswählen">
      ${Object.values(CREW_MEMBERS).map(member => `<button class="gcCrewTab" type="button" role="tab" data-crew-id="${member.id}" aria-selected="${member.id === "remy" ? "true" : "false"}"><img src="${member.asset}" alt=""><span>${member.name}</span></button>`).join("")}
    </div>
    <div id="gcCrewMessages" class="gcCrewMessages" aria-live="polite"></div>
    <form id="gcCrewComposer" class="gcCrewComposer">
      <div class="gcCrewQuick"><button type="button" data-prompt="Was kannst du?">Was kannst du?</button><button type="button" data-prompt="Erstelle einen Englischtest für die 4. Klasse zum Thema Farben, leicht, 10 Aufgaben und 20 Punkte.">Test diktieren</button><button type="button" data-prompt="Wie spart GradeCrew API-Kosten?">API sparen</button></div>
      <div class="gcCrewComposerRow">
        <button id="gcCrewMic" class="gcCrewMic" type="button" aria-label="Diktieren" title="Diktieren">🎙</button>
        <textarea id="gcCrewInput" rows="1" maxlength="2500" placeholder="Sag oder schreib, was du brauchst …"></textarea>
        <button class="gcCrewSend" type="submit" aria-label="Senden">➜</button>
      </div>
      <div class="gcCrewHint"><strong>Datenschutz:</strong> Keine personenbezogenen Schülerdaten. Häufige Standardfragen werden lokal beantwortet; KI nur wenn nötig.</div>
    </form>`;

  document.body.append(launcher, panel);
  launcher.addEventListener("click", () => setOpen(!open));
  $("gcCrewClose").addEventListener("click", () => setOpen(false));
  panel.querySelectorAll(".gcCrewTab").forEach(tab => tab.addEventListener("click", () => selectCrew(tab.dataset.crewId)));
  panel.querySelectorAll(".gcCrewQuick button").forEach(button => button.addEventListener("click", () => {
    $("gcCrewInput").value = button.dataset.prompt || "";
    $("gcCrewInput").focus();
  }));
  $("gcCrewComposer").addEventListener("submit", event => {
    event.preventDefault();
    void sendCurrentMessage();
  });
  $("gcCrewInput").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  });
  $("gcCrewMic").addEventListener("click", toggleSpeechInput);
  addMessage("assistant", CREW_MEMBERS.remy.greeting, "direkt");
  updateLauncherVisibility();
}

function setOpen(next) {
  open = Boolean(next);
  const panel = $("gcCrewPanel");
  const launcher = $("gcCrewLauncher");
  if (!panel || !launcher) return;
  panel.hidden = !open;
  launcher.setAttribute("aria-expanded", String(open));
  if (open) window.setTimeout(() => $("gcCrewInput")?.focus(), 0);
}

function selectCrew(id) {
  if (!CREW_MEMBERS[id]) return;
  activeCrewId = id;
  const member = CREW_MEMBERS[id];
  $("gcCrewHeadImage").src = member.asset;
  $("gcCrewHeadName").textContent = member.name;
  $("gcCrewHeadRole").textContent = member.role;
  document.querySelectorAll(".gcCrewTab").forEach(tab => tab.setAttribute("aria-selected", String(tab.dataset.crewId === id)));
  addMessage("assistant", member.greeting, "direkt");
}

function addMessage(kind, text, source = "") {
  const root = $("gcCrewMessages");
  if (!root) return null;
  const node = document.createElement("div");
  node.className = `gcCrewMsg ${kind}`;
  node.textContent = text;
  if (source) {
    const meta = document.createElement("span");
    meta.className = "gcCrewSource";
    meta.textContent = source;
    node.appendChild(meta);
  }
  root.appendChild(node);
  root.scrollTop = root.scrollHeight;
  return node;
}

function currentContext() {
  const aiVisible = $("aiView") && !$("aiView").classList.contains("hidden");
  return {
    screen: aiVisible ? "ai_create" : document.querySelector("main .view:not(.hidden)")?.id || "unknown",
    aiForm: aiVisible ? {
      subject: $("aiSubject")?.value || "",
      grade: $("aiGrade")?.value || "",
      schoolType: $("aiSchoolType")?.value || "",
      region: $("aiRegion")?.value || "",
      topic: $("aiTopic")?.value || "",
      difficulty: $("aiDifficulty")?.value || "",
      count: Number($("aiCount")?.value) || null,
      points: Number($("aiPoints")?.value) || null
    } : null
  };
}

function countIntent(source, intent) {
  sessionStats[source] = Number(sessionStats[source] || 0) + 1;
  if (intent) sessionStats.intents[intent] = Number(sessionStats.intents[intent] || 0) + 1;
}

async function sendCurrentMessage() {
  const input = $("gcCrewInput");
  const text = String(input?.value || "").trim();
  if (!text) return;
  input.value = "";
  addMessage("user", text);

  const local = resolveLocalCrewRequest({ crewId: activeCrewId, text, context: currentContext() });
  if (local.handled) {
    countIntent("local", local.intent);
    addMessage("assistant", local.reply, "direkt · kein KI-Aufruf");
    if (local.action) await performAction(local.action);
    return;
  }

  const pending = addMessage("assistant pending", `${CREW_MEMBERS[activeCrewId].name} denkt nach …`);
  try {
    const result = await callCrewAi({ crewId: activeCrewId, text, context: currentContext() });
    pending?.remove();
    countIntent("ai", result.intent || "ai_unknown");
    addMessage("assistant", result.reply || "Ich konnte dazu noch keine passende Antwort formulieren.", "KI");
    if (result.action && result.action.type !== "none") await performAction(result.action);
  } catch (error) {
    pending?.remove();
    console.warn("Crew-Assistent KI-Fallback nicht verfügbar:", error?.code || error?.message || error);
    addMessage("assistant", "Das kann ich noch nicht sicher direkt beantworten. Der KI-Fallback ist in diesem Entwurf gerade nicht erreichbar – deine Eingabe wurde nicht als Chatverlauf gespeichert.", "Fallback nicht verfügbar");
  }
}

async function callCrewAi(payload) {
  const functions = getFunctions(getApp(), "europe-west1");
  const callable = httpsCallable(functions, "crewAssistant", { timeout: 90000 });
  const result = await callable(payload);
  return result.data || {};
}

async function ensureAiView() {
  if ($("aiView") && !$("aiView").classList.contains("hidden")) return true;
  if ($("brandBtn")) $("brandBtn").click();
  for (let i = 0; i < 30; i += 1) {
    if ($("dashboardView") && !$("dashboardView").classList.contains("hidden")) break;
    await wait(40);
  }
  $("newQuizBtn")?.click();
  for (let i = 0; i < 30; i += 1) {
    if ($("createView") && !$("createView").classList.contains("hidden")) break;
    await wait(40);
  }
  $("createAiBtn")?.click();
  for (let i = 0; i < 50; i += 1) {
    if ($("aiView") && !$("aiView").classList.contains("hidden")) return true;
    await wait(40);
  }
  return false;
}

function setField(id, value) {
  const field = $(id);
  if (!field || value === undefined || value === null || value === "") return false;
  field.value = String(value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function appendNote(text) {
  const field = $("aiCustomNotes");
  if (!field || !text) return;
  const current = field.value.trim();
  if (current.toLocaleLowerCase("de-DE").includes(text.toLocaleLowerCase("de-DE"))) return;
  field.value = [current, text].filter(Boolean).join(current ? "\n" : "");
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyTypePatch(patch) {
  const root = $("aiTypeChecks");
  if (!root) return;
  const boxes = Array.from(root.querySelectorAll('input[type="checkbox"]'));
  if (Array.isArray(patch.allowedTypes) && patch.allowedTypes.length) {
    const wanted = new Set(patch.allowedTypes);
    boxes.forEach(box => {
      box.checked = wanted.has(box.value);
      box.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  if (Array.isArray(patch.excludeTypes) && patch.excludeTypes.length) {
    const blocked = new Set(patch.excludeTypes);
    boxes.forEach(box => {
      if (blocked.has(box.value) && box.checked) {
        box.checked = false;
        box.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
  if (!boxes.some(box => box.checked) && boxes[0]) {
    boxes[0].checked = true;
    boxes[0].dispatchEvent(new Event("change", { bubbles: true }));
  }
}

async function patchAiForm(patch = {}) {
  if (!await ensureAiView()) {
    addMessage("assistant", "Ich konnte das Testformular gerade nicht öffnen. Deine bisherigen Daten habe ich nicht verändert.", "Aktion abgebrochen");
    return;
  }
  setField("aiSubject", patch.subject);
  setField("aiGrade", patch.grade);
  setField("aiSchoolType", patch.schoolType);
  setField("aiRegion", patch.region);
  setField("aiTopic", patch.topic);
  setField("aiDifficulty", patch.difficulty);
  setField("aiCount", patch.count);
  setField("aiPoints", patch.points);
  applyTypePatch(patch);
  if (patch.notes) appendNote(String(patch.notes).slice(0, 1500));
  if (patch.durationMinutes) appendNote(`Gewünschte Bearbeitungszeit: ca. ${patch.durationMinutes} Minuten.`);
  addMessage("assistant", "Die erkannten Angaben stehen jetzt im echten GradeCrew-Formular. Ich habe den Test noch nicht gestartet – prüfe kurz alles und entscheide dann selbst.", "Formular aktualisiert");
  setOpen(false);
  window.setTimeout(() => $("aiTopic")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
}

async function performAction(action) {
  if (!action || action.type === "none") return;
  if (action.type === "patch_ai_form") return patchAiForm(action.patch || {});
  addMessage("assistant", "Diese Aktion kenne ich im ersten Entwurf noch nicht. Ich habe deshalb nichts verändert.", "keine Änderung");
}

function speechConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function toggleSpeechInput() {
  if (speech) {
    speech.stop();
    return;
  }
  const SpeechRecognition = speechConstructor();
  if (!SpeechRecognition) {
    addMessage("assistant", "Diktieren wird von diesem Browser hier noch nicht unterstützt. Du kannst denselben Wunsch eintippen. Die endgültige GradeCrew-Sprachlösung bekommt einen eigenen, browserunabhängigen Audio-Weg.", "Gerätehinweis");
    return;
  }
  speech = new SpeechRecognition();
  speech.lang = "de-DE";
  speech.interimResults = true;
  speech.continuous = false;
  const mic = $("gcCrewMic");
  mic?.classList.add("listening");
  let finalTranscript = "";
  speech.onresult = event => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0]?.transcript || "";
      if (event.results[i].isFinal) finalTranscript += transcript;
      else interim += transcript;
    }
    if ($("gcCrewInput")) $("gcCrewInput").value = `${finalTranscript}${interim}`.trim();
  };
  speech.onerror = () => addMessage("assistant", "Ich konnte das Diktat gerade nicht verstehen. Versuch es noch einmal oder tippe den Wunsch ein.", "Diktat");
  speech.onend = () => {
    speech = null;
    mic?.classList.remove("listening");
    if ($("gcCrewInput")?.value.trim()) $("gcCrewInput").focus();
  };
  try { speech.start(); }
  catch (_) { speech = null; mic?.classList.remove("listening"); }
}

function installVisibilityWatcher() {
  const observer = new MutationObserver(updateLauncherVisibility);
  const targets = [$("userBar"), $("authView"), $("studentView")].filter(Boolean);
  targets.forEach(target => observer.observe(target, { attributes: true, attributeFilter: ["class"] }));
  document.addEventListener("gradecrew:account-changed", updateLauncherVisibility);
}

export function installCrewAssistant() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  createUi();
  installVisibilityWatcher();
  window.gradecrewCrewAssistant = Object.freeze({
    open: crewId => { if (CREW_MEMBERS[crewId]) selectCrew(crewId); setOpen(true); },
    stats: () => JSON.parse(JSON.stringify(sessionStats))
  });
}

installCrewAssistant();
