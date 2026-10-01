import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { CREW_MEMBERS, resolveLocalCrewRequest } from "./crew-assistant-core.js?v=2";

let installed = false;
let open = false;
let recognition = null;
let keepListening = false;
let restartTimer = null;
let stopTimer = null;
let dictationBase = "";
let dictationFinal = "";

const $ = id => document.getElementById(id);
const COCO = CREW_MEMBERS.coco;

function installStyles() {
  if (document.querySelector("style[data-crew-assistant]")) return;
  const style = document.createElement("style");
  style.dataset.crewAssistant = "2";
  style.textContent = `
    .gcCrewLauncher{position:fixed;right:22px;bottom:22px;z-index:1450;display:flex;align-items:center;gap:8px;border:1px solid #cfd9ee;border-radius:999px;background:#fff;color:#234f9f;padding:8px 13px 8px 8px;box-shadow:0 14px 38px rgba(31,52,86,.17);font:inherit;font-weight:800;cursor:pointer}
    .gcCrewLauncher:hover{transform:translateY(-1px);box-shadow:0 18px 44px rgba(31,52,86,.2)}
    .gcCrewLauncher img{width:40px;height:40px;object-fit:contain}.gcCrewLauncher[hidden]{display:none!important}
    .gcCrewPanel{position:fixed;right:22px;bottom:82px;z-index:1460;width:min(390px,calc(100vw - 28px));height:min(500px,calc(100dvh - 110px));display:grid;grid-template-rows:auto 1fr auto;border:1px solid #d9e1ec;border-radius:22px;background:#fff;box-shadow:0 28px 80px rgba(22,40,68,.22);overflow:hidden;color:#183b36}
    .gcCrewPanel[hidden]{display:none!important}.gcCrewHead{display:flex;align-items:center;gap:10px;padding:13px 14px;border-bottom:1px solid #edf0f4;background:#fffdf9}
    .gcCrewHead img{width:46px;height:46px;object-fit:contain}.gcCrewHeadCopy{min-width:0;flex:1}.gcCrewHeadCopy strong{display:block;font-size:16px}.gcCrewHeadCopy span{display:block;color:#6b747f;font-size:12px;margin-top:2px}
    .gcCrewClose{border:0;background:transparent;color:#66727d;font-size:24px;line-height:1;cursor:pointer;padding:4px}
    .gcCrewMessages{overflow:auto;padding:14px;background:#fbfcfe;scroll-behavior:smooth}.gcCrewMsg{max-width:88%;margin:0 0 9px;padding:9px 11px;border-radius:14px;font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
    .gcCrewMsg.user{margin-left:auto;background:#2f64d6;color:#fff;border-bottom-right-radius:5px}.gcCrewMsg.assistant{background:#fff;border:1px solid #e2e7ed;border-bottom-left-radius:5px}.gcCrewMsg.pending{color:#68747e;font-style:italic}
    .gcCrewComposer{padding:10px 12px 12px;border-top:1px solid #edf0f4;background:#fff}.gcCrewComposerRow{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:end}
    .gcCrewComposer textarea{resize:none;min-height:43px;max-height:110px;padding:10px 11px;border:1px solid #cfd8e5;border-radius:13px;font:inherit;font-size:13px;line-height:1.4}.gcCrewComposer textarea:focus{outline:2px solid rgba(47,100,214,.18);border-color:#2f64d6}
    .gcCrewMic,.gcCrewSend{width:43px;height:43px;border-radius:13px;border:1px solid #cfd8e5;background:#fff;font-size:18px;cursor:pointer}.gcCrewSend{background:#2f64d6;color:#fff;border-color:#2f64d6}.gcCrewMic.listening{background:#fff0f0;border-color:#e25b5b;color:#b42318;animation:gcCrewPulse 1.2s ease-in-out infinite}
    @keyframes gcCrewPulse{50%{transform:scale(.95);box-shadow:0 0 0 5px rgba(226,91,91,.12)}}
    @media(max-width:620px){.gcCrewLauncher{right:12px;bottom:12px;padding:7px}.gcCrewLauncher span{display:none}.gcCrewPanel{right:8px;bottom:70px;width:calc(100vw - 16px);height:min(68dvh,560px);border-radius:20px}}
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

function addMessage(kind, text) {
  const root = $("gcCrewMessages");
  if (!root || !text) return null;
  const node = document.createElement("div");
  node.className = `gcCrewMsg ${kind}`;
  node.textContent = text;
  root.appendChild(node);
  root.scrollTop = root.scrollHeight;
  return node;
}

function setOpen(next) {
  open = Boolean(next);
  const panel = $("gcCrewPanel");
  const launcher = $("gcCrewLauncher");
  if (!panel || !launcher) return;
  panel.hidden = !open;
  launcher.setAttribute("aria-expanded", String(open));
  if (!open) stopDictation();
  if (open) window.setTimeout(() => $("gcCrewInput")?.focus(), 0);
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
  launcher.innerHTML = `<img src="${COCO.asset}" alt=""><span>Coco</span>`;

  const panel = document.createElement("aside");
  panel.id = "gcCrewPanel";
  panel.className = "gcCrewPanel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Coco – Hilfe und Orientierung");
  panel.innerHTML = `
    <div class="gcCrewHead">
      <img src="${COCO.asset}" alt="">
      <div class="gcCrewHeadCopy"><strong>Coco</strong><span>Hilfe & Orientierung</span></div>
      <button id="gcCrewClose" class="gcCrewClose" type="button" aria-label="Coco schließen">×</button>
    </div>
    <div id="gcCrewMessages" class="gcCrewMessages" aria-live="polite"></div>
    <form id="gcCrewComposer" class="gcCrewComposer">
      <div class="gcCrewComposerRow">
        <button id="gcCrewMic" class="gcCrewMic" type="button" aria-label="Diktieren" title="Diktieren">🎙</button>
        <textarea id="gcCrewInput" rows="1" maxlength="2500" placeholder="Frag Coco …"></textarea>
        <button class="gcCrewSend" type="submit" aria-label="Senden">➜</button>
      </div>
    </form>`;

  document.body.append(launcher, panel);
  launcher.addEventListener("click", () => setOpen(!open));
  $("gcCrewClose")?.addEventListener("click", () => setOpen(false));
  $("gcCrewComposer")?.addEventListener("submit", event => {
    event.preventDefault();
    void sendCurrentMessage();
  });
  $("gcCrewInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  });
  $("gcCrewMic")?.addEventListener("click", toggleDictation);
  addMessage("assistant", "Hi, ich bin Coco. Wobei kann ich dir helfen?");
  updateLauncherVisibility();
}

function currentContext() {
  return { screen: document.querySelector("main .view:not(.hidden)")?.id || "unknown" };
}

async function callCrewAi(payload) {
  const functions = getFunctions(getApp(), "europe-west1");
  const callable = httpsCallable(functions, "crewAssistant", { timeout: 90000 });
  const result = await callable(payload);
  return result.data || {};
}

async function sendCurrentMessage() {
  const input = $("gcCrewInput");
  const text = String(input?.value || "").trim();
  if (!text) return;
  stopDictation();
  input.value = "";
  addMessage("user", text);

  const local = resolveLocalCrewRequest({ crewId: "coco", text, context: currentContext() });
  if (local.handled) {
    addMessage("assistant", local.reply);
    return;
  }

  const pending = addMessage("assistant pending", "Coco denkt nach …");
  try {
    const result = await callCrewAi({ crewId: "coco", text, context: currentContext() });
    pending?.remove();
    addMessage("assistant", result.reply || "Dazu habe ich gerade noch keine sichere Antwort.");
  } catch (error) {
    pending?.remove();
    console.warn("Coco KI-Fallback nicht verfügbar:", error?.code || error?.message || error);
    addMessage("assistant", "Das klappt gerade nicht. Versuch es bitte noch einmal.");
  }
}

function speechConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function updateMicState() {
  const mic = $("gcCrewMic");
  mic?.classList.toggle("listening", keepListening);
  if (mic) mic.textContent = keepListening ? "●" : "🎙";
}

function stopDictation() {
  keepListening = false;
  window.clearTimeout(restartTimer);
  window.clearTimeout(stopTimer);
  restartTimer = null;
  stopTimer = null;
  const active = recognition;
  recognition = null;
  try { active?.stop(); } catch (_) {}
  updateMicState();
}

function startRecognitionCycle() {
  if (!keepListening || recognition) return;
  const SpeechRecognition = speechConstructor();
  if (!SpeechRecognition) {
    stopDictation();
    addMessage("assistant", "Diktieren wird von diesem Browser nicht unterstützt.");
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
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = String(event.results[index][0]?.transcript || "").trim();
      if (!transcript) continue;
      if (event.results[index].isFinal) dictationFinal = `${dictationFinal} ${transcript}`.trim();
      else interim = `${interim} ${transcript}`.trim();
    }
    const input = $("gcCrewInput");
    if (input) input.value = [dictationBase, dictationFinal, interim].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  };

  active.onerror = event => {
    if (["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error)) {
      keepListening = false;
      addMessage("assistant", "Ich bekomme gerade keinen Mikrofonzugriff.");
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
  const SpeechRecognition = speechConstructor();
  if (!SpeechRecognition) {
    addMessage("assistant", "Diktieren wird von diesem Browser nicht unterstützt.");
    return;
  }
  const input = $("gcCrewInput");
  dictationBase = String(input?.value || "").trim();
  dictationFinal = "";
  keepListening = true;
  updateMicState();
  startRecognitionCycle();
  stopTimer = window.setTimeout(stopDictation, 60000);
}

function installVisibilityWatcher() {
  const observer = new MutationObserver(updateLauncherVisibility);
  [$("userBar"), $("authView"), $("studentView")].filter(Boolean)
    .forEach(target => observer.observe(target, { attributes: true, attributeFilter: ["class"] }));
  document.addEventListener("gradecrew:account-changed", () => {
    stopDictation();
    setOpen(false);
    updateLauncherVisibility();
  });
}

export function installCrewAssistant() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  createUi();
  installVisibilityWatcher();
}

installCrewAssistant();
