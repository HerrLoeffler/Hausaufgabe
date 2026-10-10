import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { CREW_MEMBERS, resolveLocalCrewRequest } from "./crew-assistant-core.js?v=7";

let memoryUid = "";
let memoryEpoch = 0;
let memoryGeneration = 0;
let memoryQueue = Promise.resolve();
let conversation = [];
let lastCrew = "";
let requestEpoch = 0;
let sending = false;
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
  if (kind.split(/\s+/).includes("user")) node.dataset.i18nContent = "conversation";
  node.textContent = text;
  if (kind === "user" || kind === "assistant") {
    conversation.push({role:kind === "user" ? "user" : "assistant",text:String(text).slice(0,1400)});
    conversation = conversation.slice(-40);
    if (kind === "assistant") {
      const names = [...new Set((String(text).match(/\b(?:Remy|Emmi|Wilma)\b/gi) || []).map(name=>name.toLowerCase()))];
      if (names.length === 1) lastCrew = names[0];
    }
  }
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
  let work={};document.dispatchEvent(new CustomEvent("gradecrew:coco-context",{detail:{respond:value=>{work=value||{};}}}));
  if(work.contextUid!==memoryUid)work={};
  return { ...work, screen: document.querySelector("main .view:not(.hidden)")?.id || "unknown", lastCrew, history:conversation.slice(-12) };
}

async function callCrewAi(payload,expectedUid=memoryUid) {
  if(getAuth(getApp()).currentUser?.uid!==expectedUid)throw new Error("Das Konto wurde gewechselt.");
  const functions = getFunctions(getApp(), "europe-west1");
  const callable = httpsCallable(functions, "crewAssistant", { timeout: 90000 });
  const result = await callable({...payload,accountId:expectedUid,memoryGeneration});
  if(getAuth(getApp()).currentUser?.uid!==expectedUid)throw new Error("Das Konto wurde gewechselt.");
  return result.data || {};
}

async function support(operation,extra={},expectedUid=memoryUid) {
  const uid=getAuth(getApp()).currentUser?.uid;
  if(!uid)throw new Error("Bitte melde dich zuerst an.");
  if(expectedUid!==uid)throw new Error("Das Konto wurde gewechselt.");
  const result=await httpsCallable(getFunctions(getApp(),"europe-west1"),"cocoSupport",{timeout:180000})({operation,...extra,accountId:expectedUid});
  if(getAuth(getApp()).currentUser?.uid!==uid)throw new Error("Das Konto wurde gewechselt.");
  return result.data||{};
}
function queueMemoryWrite(operation,data,uid,epoch=requestEpoch,generation=memoryGeneration) {
  const result=memoryQueue.catch(()=>{}).then(()=>{
    if(epoch!==requestEpoch||uid!==getAuth(getApp()).currentUser?.uid)return {cancelled:true};
    return support(operation,{...data,generation},uid);
  });
  memoryQueue=result.catch(()=>{});return result;
}
function rememberTurn(messages,uid,epoch=requestEpoch,generation=memoryGeneration) {
  if(!uid||getAuth(getApp()).currentUser?.uid!==uid)return;
  void queueMemoryWrite("remember",{messages,turnId:crypto.randomUUID()},uid,epoch,generation).catch(()=>{if(epoch===requestEpoch&&getAuth(getApp()).currentUser?.uid===uid)addMessage("assistant","Das Gespräch konnte gerade nicht dauerhaft gespeichert werden. Falls Erinnerungen auf einem anderen Gerät gelöscht wurden, lade die Seite neu.");});
}
async function searchTests(query,epoch) {
  const r=await support("search",{query});if(epoch!==requestEpoch)return;
  addMessage("assistant",r.matches.length?(r.matches.length===1?"Ich habe einen passenden Test gefunden.":`Ich habe ${r.matches.length} passende Tests gefunden.`):`Ich habe keinen passenden Treffer in den gespeicherten Texten und Bildbeschreibungen gefunden.${r.unindexedImages?" Einige ältere Bilder haben noch keine Motivbeschreibung.":""}${r.failures?" Einige Tests konnten gerade nicht geprüft werden.":""}${r.truncated?" Die Suche war auf die ersten 100 Tests begrenzt.":""}`);
  if(!r.matches.length&&r.unindexedImages){const button=document.createElement("button");button.type="button";button.className="miniButton";button.textContent="Ältere Bilder einmalig beschreiben und erneut suchen";
    button.onclick=async()=>{if(epoch!==requestEpoch)return;const uid=memoryUid;button.disabled=true;try{const result=await support("index_images",{},uid);if(epoch!==requestEpoch)return;addMessage("assistant",`${result.indexed} Bilder neu beschrieben und dauerhaft gespeichert.${result.remaining?` Weitere ${result.remaining} Bilder warten noch auf eine Beschreibung.`:""}${result.failed||result.pending?" Einige Bilder konnten nicht beschrieben werden; ich wiederhole diese Aufrufe nicht automatisch.":""}`);await searchTests(query,epoch);if(epoch===requestEpoch)rememberTurn(conversation.slice(-2).filter(m=>m.role==="assistant"),uid);}catch(e){if(epoch===requestEpoch)addMessage("assistant",e.message);}finally{button.disabled=false;}};
    $("gcCrewMessages").append(button);
  }
  for(const q of r.matches){const card=document.createElement("div");card.className="gcCrewMsg assistant";const title=document.createElement("strong");title.textContent=q.title;const evidence=document.createElement("p");evidence.textContent=q.evidence;
    if(/^(?:https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/.test(q.imageUrl)){const img=document.createElement("img");img.src=q.imageUrl;img.alt="Bild aus dem gefundenen Test";img.style.cssText="max-width:100%;max-height:100px;object-fit:contain";card.append(img);}
    const button=document.createElement("button");button.type="button";button.textContent="Test öffnen";button.onclick=()=>{if(epoch===requestEpoch)void applyGuideAction({type:"choose_editor",quizId:q.id},epoch);};card.append(title,evidence,button);$("gcCrewMessages").append(card);}
}
function installDurableMemory() {
 onAuthStateChanged(getAuth(getApp()),async user=>{
  const epoch=++memoryEpoch;memoryUid=user?.uid||"";memoryGeneration=0;conversation=[];requestEpoch++;
  $("gcCrewMessages")?.replaceChildren();if(!user)return;
  try{const m=await support("read");if(epoch!==memoryEpoch)return;memoryGeneration=Number(m.generation)||0;for(const message of m.history||[])addMessage(message.role,message.text);if(!m.history?.length)addMessage("assistant","Hi, ich bin Coco. Ich kann deine Tests suchen und mir deine Vorlieben dauerhaft merken.");}
  catch(_){if(epoch===memoryEpoch)addMessage("assistant","Cocos Kontogedächtnis ist gerade nicht erreichbar. Ich kann dir trotzdem helfen.");}
 });
}

function requestGuideAction(action) {
  if(getAuth(getApp()).currentUser?.uid!==memoryUid)return Promise.reject(new Error("Das Konto wurde gewechselt."));
  return new Promise((resolve,reject) => {
    const timer=window.setTimeout(()=>reject(new Error("Die Navigation braucht gerade zu lange. Bitte versuche es erneut.")),90000);
    document.dispatchEvent(new CustomEvent("gradecrew:coco-guide",{detail:{action:{...action,requesterUid:memoryUid},respond:result=>{window.clearTimeout(timer);resolve(result);}}}));
  });
}
async function applyGuideAction(action, epoch = requestEpoch) {
  const result=await requestGuideAction(action);
  if (epoch !== requestEpoch) return;
  if (result.lastCrew) lastCrew=result.lastCrew;
  addMessage("assistant",result.error || result.message);
  if (!result.choices) return;
  if (!result.choices.length) { addMessage("assistant","Du hast noch keinen passenden Test. Mit Remy kannst du einen neuen erstellen."); return; }
  const holder=document.createElement("div");holder.className="gcCrewMsg assistant";
  const label=document.createElement("label");label.textContent="Test auswählen";
  const select=document.createElement("select"); select.setAttribute("aria-label","Test auswählen");select.style.maxWidth="100%";
  for (const quiz of result.choices) {const option=document.createElement("option");option.value=quiz.id;option.textContent=[quiz.title,quiz.subject,quiz.grade].filter(Boolean).join(" · ");select.appendChild(option);}
  const evidence=document.createElement("small");evidence.style.display="block";
  const update=()=>{evidence.textContent=result.choices.find(q=>q.id===select.value)?.evidence || "";};select.addEventListener("change",update);update();
  const button=document.createElement("button");button.type="button";button.textContent="Zum Test";button.className="miniButton";
  button.addEventListener("click",async()=>{if(epoch!==requestEpoch)return;button.disabled=true;try{await applyGuideAction({type:result.nextAction,quizId:select.value},epoch);}catch(error){addMessage("assistant",error.message);}finally{button.disabled=false;}});
  label.appendChild(select);holder.append(label,evidence,button);$("gcCrewMessages").appendChild(holder);holder.scrollIntoView({block:"nearest"});
}
async function sendCurrentMessage() {
  const input = $("gcCrewInput");
  const text = String(input?.value || "").trim();
  if (!text || sending) return;
  const epoch=requestEpoch; const turnUid=memoryUid; const turnGeneration=memoryGeneration; sending=true;
  const send=$("gcCrewComposer")?.querySelector(".gcCrewSend");if(send)send.disabled=true;
  stopDictation();input.value="";addMessage("user",text);
  let pending;
  try {
    const context=currentContext();
    if(/(?:merke dir|merk dir|remember that)/i.test(text)) {const m=await support("read",{},turnUid);const preferences=[m.preferences,text.replace(/^(?:merke dir|merk dir|remember that)[: ]*/i,"")].filter(Boolean).join("\n");if(preferences.length>2000){addMessage("assistant","Ich kann gerade keinen weiteren persönlichen Hinweis dauerhaft aufnehmen.");return;}const saved=await queueMemoryWrite("preferences",{preferences},turnUid,epoch,turnGeneration);if(saved?.cancelled||epoch!==requestEpoch)return;addMessage("assistant","Das merke ich mir dauerhaft für unsere Gespräche.");return;}
    if(/(?:gedächtnis|gedaechtnis|erinnerungen|vorlieben|memory)/i.test(text)) {addMessage("assistant","Ich behalte die letzten 40 Nachrichten unseres Gesprächs und deine ausdrücklich genannten persönlichen Hinweise für dein Konto im Hintergrund. Mit „Merke dir …“ kannst du mir einen Hinweis geben.");return;}
    if(/(?:meine meldungen|meine rückmeldungen|gemeldeten fehler|status meiner meldung|my reports)/i.test(text)) {
      const result=await support("feedback_status",{},turnUid);if(epoch!==requestEpoch)return;
      addMessage("assistant",result.reports.length?"Deine gespeicherten Rückmeldungen (bis zu 50):\n"+result.reports.map(r=>[r.category,r.status,r.testCode?"Test "+r.testCode:"",r.createdAt?new Date(r.createdAt).toLocaleDateString():""].filter(Boolean).join(" · ")).join("\n"):"Ich habe keine eigenen Rückmeldungen für dein Konto gefunden.");return;
    }
    const early=resolveLocalCrewRequest({crewId:"coco",text,context,locale:currentUiLocale()});
    if(early.handled&&early.action?.type==="navigate_create"){await applyGuideAction(early.action,epoch);return;}
    const prior=conversation.filter(m=>m.role==="user").slice(-3).map(m=>m.text).join(" ");
    if(/(?:such|find|erinner|hatte|drache|bild|motiv)/i.test(text)&&/(?:test|quiz|drache|bild|motiv)/i.test(prior)) {pending=addMessage("assistant pending","Ich durchsuche deine Tests …");await searchTests(/(?:such|find|test|quiz|drache|dragon|katze|cat)/i.test(text)?text:prior,epoch);return;}

    const local=resolveLocalCrewRequest({crewId:"coco",text,context,locale:currentUiLocale()});
    if(local.handled&&local.action?.type==="find_test"){pending=addMessage("assistant pending","Ich durchsuche deine Tests …");await searchTests(local.action.query||text,epoch);return;}
    if(local.action?.type==="show_feedback")local.action.message=text;
    const repeated=Boolean(local.reply)&&conversation.slice(-4).some(m=>m.role==="assistant"&&m.text===local.reply);
    if (local.handled && !repeated) {
      if (local.intent === "route_remy") lastCrew="remy";
      if (local.action && local.action.type !== "patch_ai_form") {pending=addMessage("assistant pending","Ich suche die passende Stelle …");await applyGuideAction(local.action,epoch);}
      else addMessage("assistant",local.reply);
      return;
    }
    pending=addMessage("assistant pending","Coco denkt mit KI nach …");
    const result=await callCrewAi({crewId:"coco",text,uiLocale:currentUiLocale(),context},turnUid);
    if (epoch!==requestEpoch)return;
    if(result.action?.type==="show_feedback")result.action.message=text;
    if (result.action?.type && !["none","patch_ai_form"].includes(result.action.type)) await applyGuideAction(result.action,epoch);
    else addMessage("assistant",result.reply || "Dazu habe ich gerade noch keine sichere Antwort. Beschreibe bitte, was du erreichen möchtest.");
  } catch(error) { if(epoch===requestEpoch)addMessage("assistant",error.message || "Das klappt gerade nicht. Versuch es bitte noch einmal."); }
  finally {pending?.remove();if(epoch===requestEpoch){rememberTurn([{role:"user",text},...conversation.slice(-1).filter(m=>m.role==="assistant")],turnUid,epoch,turnGeneration);sending=false;if(send)send.disabled=false;}}
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
  active.lang = currentVoiceInputLocale();
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
  const resetConversation = () => {requestEpoch++;conversation=[];lastCrew="";sending=false;const root=$("gcCrewMessages");if(root)root.replaceChildren();const send=$("gcCrewComposer")?.querySelector(".gcCrewSend");if(send)send.disabled=false;};
  document.addEventListener("gradecrew:signed-out",resetConversation);
  document.addEventListener("gradecrew:account-changed", () => {
    resetConversation();
    stopDictation();
    setOpen(false);
    updateLauncherVisibility();
  });
  window.addEventListener("gradecrew:ui-locale-changed", () => {
    // The next recognition cycle picks up the new interface language unless the
    // user has chosen a dedicated voice-input locale.
    if (keepListening) {
      stopDictation();
      updateMicState();
    }
  });
}

export function installCrewAssistant() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  createUi();
  installDurableMemory();
  installVisibilityWatcher();
}

installCrewAssistant();