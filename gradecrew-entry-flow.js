import { GRADECREW_ASSETS } from "./generated/gradecrew-assets.js?v=1.2.0";
import { CREW, DEMO_TEST } from "./gradecrew-tour.js?v=2.3.1-gc28-entry";

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const stateIds = Object.freeze({
  start: "gcEntryStart",
  login: "gcEntryLogin",
  register: "gcEntryRegister",
  tutorialName: "gcEntryTutorialName",
  tutorial: "gcEntryTutorial",
  accountGate: "gcEntryAccountGate"
});

let activeState = "start";
let guestName = "";
let tutorialStep = 0;
let tutorialChoice = "";

function canonicalCrewCards() {
  const roles = [
    ["coco", "Coco", "Guide"],
    ["remy", "Remy", "Erstellen"],
    ["emmi", "Emmi", "Verbessern"],
    ["wilma", "Wilma", "Bewerten"]
  ];
  return roles.map(([key, name, role]) => {
    const mascot = GRADECREW_ASSETS.mascots?.[key];
    return `<div class="gcEntryCrewMember"><img src="${escapeHtml(mascot?.primary || "")}" alt="" width="58" height="58"><span><strong>${name}</strong><small>${role}</small></span></div>`;
  }).join("");
}

function setState(next, { focus = true } = {}) {
  if (!stateIds[next]) return;
  activeState = next;
  for (const [name, id] of Object.entries(stateIds)) {
    const section = $(id);
    if (!section) continue;
    const hidden = name !== next;
    section.classList.toggle("hidden", hidden);
    section.setAttribute("aria-hidden", String(hidden));
  }
  const authView = $("authView");
  if (authView) authView.dataset.entryState = next;
  if (!focus) return;
  requestAnimationFrame(() => {
    const root = $(stateIds[next]);
    root?.querySelector("[data-entry-autofocus], input:not([type=hidden]), button, a[href]")?.focus?.({ preventScroll: true });
  });
}

function showLogin() {
  $("loginTab")?.click();
  setState("login");
}

function showRegister() {
  $("registerTab")?.click();
  setState("register");
}

function showStart() {
  tutorialStep = 0;
  tutorialChoice = "";
  setState("start");
}

function renderTutorial() {
  const host = $("gcEntryTutorialBody");
  if (!host) return;
  const safeName = escapeHtml(guestName || "du");
  const steps = [
    {
      image: GRADECREW_ASSETS.mascots.coco.nameScene,
      eyebrow: "Willkommen",
      title: `Schön, dass du da bist, ${safeName}.`,
      text: `${CREW.guide.name} begleitet dich durch GradeCrew. Du kannst dich hier erst einmal umsehen – ohne E-Mail, Passwort oder Registrierung.`
    },
    {
      image: GRADECREW_ASSETS.scenes.introduceRemy,
      eyebrow: "Erstellen",
      title: `${CREW.create.name} macht aus deiner Idee einen Testentwurf.`,
      text: "Fach, Klasse und Thema reichen als Start. Der Entwurf bleibt deiner – du prüfst und änderst ihn, bevor etwas veröffentlicht wird."
    },
    {
      image: GRADECREW_ASSETS.scenes.introduceEmmi,
      eyebrow: "Verbessern",
      title: `${CREW.improve.name} schaut mit dir über die Aufgaben.`,
      text: "Unklare Formulierungen, Varianten und Rückmeldungen werden direkt am Test bearbeitet – nicht in einem separaten Demo-Werkzeug."
    },
    {
      image: GRADECREW_ASSETS.scenes.introduceWilma,
      eyebrow: "Bewerten",
      title: `${CREW.grade.name} hilft beim Prüfen und Auswerten.`,
      text: "Eindeutige Antworten können automatisch ausgewertet werden. Unsichere Freitextfälle bleiben sichtbar, damit die Lehrkraft entscheidet."
    },
    {
      image: GRADECREW_ASSETS.scenes.yourTurn,
      eyebrow: "Probier es aus",
      title: "Welche Mini-Aufgabe soll Remy vorbereiten?",
      text: "Diese kleine Aktion benutzt die vorbereiteten Tutorialdaten – ohne KI-Anfrage und ohne etwas dauerhaft zu speichern.",
      action: true
    },
    {
      image: GRADECREW_ASSETS.scenes.finale,
      eyebrow: "Fertig",
      title: "So fühlt sich GradeCrew an.",
      text: "Du hast die Crew kennengelernt und eine vorbereitete Aufgabe ausprobiert. Für einen eigenen Test brauchst du erst dann ein Konto, wenn dein Fortschritt dauerhaft gespeichert werden soll.",
      result: true
    }
  ];
  const current = steps[Math.max(0, Math.min(tutorialStep, steps.length - 1))];
  const sourceQuestion = DEMO_TEST.questions.find(q => q.type === "single") || DEMO_TEST.questions[0];
  const optionText = sourceQuestion?.options?.map(option => option.text).filter(Boolean).slice(0, 3) || [];
  const actionHtml = current.action ? `<div class="gcEntryTry" role="group" aria-label="Vorbereitete Beispielaufgabe wählen">
      <button type="button" class="gcEntryChoice ${tutorialChoice === "farben" ? "selected" : ""}" data-tutorial-choice="farben">Farben · Englisch 4</button>
      <button type="button" class="gcEntryChoice ${tutorialChoice === "tiere" ? "selected" : ""}" data-tutorial-choice="tiere">Tiere · Englisch 4</button>
      <button type="button" class="gcEntryChoice ${tutorialChoice === "schule" ? "selected" : ""}" data-tutorial-choice="schule">Schulsachen · Englisch 4</button>
    </div>${tutorialChoice ? `<div class="gcEntryPrepared"><span>Remys vorbereitete Aufgabe</span><strong>${escapeHtml(sourceQuestion?.text || "What colour is the schoolbag?")}</strong><small>${optionText.map(escapeHtml).join(" · ")}</small><button type="button" class="button secondary" id="gcEntryPreparedKeep">Passt – weiter</button></div>` : ""}` : "";
  const resultHtml = current.result && tutorialChoice ? `<p class="gcEntryResult"><strong>Deine Auswahl:</strong> ${escapeHtml(tutorialChoice)} · keine Daten gespeichert</p>` : "";
  host.innerHTML = `<div class="gcEntryTutorialVisual"><img src="${escapeHtml(current.image)}" alt="" decoding="async"></div>
    <div class="gcEntryTutorialCopy"><span class="gcEntryEyebrow">${escapeHtml(current.eyebrow)}</span><h2>${current.title}</h2><p>${escapeHtml(current.text)}</p>${actionHtml}${resultHtml}</div>`;
  $("gcEntryTutorialProgress").textContent = `${tutorialStep + 1} / ${steps.length}`;
  const prev = $("gcEntryTutorialPrev");
  const next = $("gcEntryTutorialNext");
  prev.disabled = tutorialStep === 0;
  next.textContent = tutorialStep === steps.length - 1 ? "Mit GradeCrew loslegen" : "Weiter";
  next.disabled = Boolean(current.action && !tutorialChoice);
  host.querySelectorAll("[data-tutorial-choice]").forEach(button => button.addEventListener("click", () => {
    tutorialChoice = button.dataset.tutorialChoice || "";
    renderTutorial();
  }));
  $("gcEntryPreparedKeep")?.addEventListener("click", () => {
    tutorialStep = Math.min(steps.length - 1, tutorialStep + 1);
    renderTutorial();
  });
}

function startGuestTutorial() {
  const input = $("gcEntryGuestName");
  guestName = String(input?.value || "").trim().slice(0, 60);
  if (!guestName) {
    input?.focus();
    input?.setAttribute("aria-invalid", "true");
    $("gcEntryGuestNameError")?.classList.remove("hidden");
    return;
  }
  input?.removeAttribute("aria-invalid");
  $("gcEntryGuestNameError")?.classList.add("hidden");
  tutorialStep = 0;
  tutorialChoice = "";
  setState("tutorial");
  renderTutorial();
}

function buildEntrySurface() {
  const authView = $("authView");
  const joinForm = $("joinForm");
  const loginForm = $("loginForm");
  const registerForm = $("registerForm");
  const loginTab = $("loginTab");
  const registerTab = $("registerTab");
  if (!authView || !joinForm || !loginForm || !registerForm || !loginTab || !registerTab) return false;
  if ($("gcEntryStart")) return true;

  const notice = $("sharedLoginNotice");
  const fragments = { joinForm, loginForm, registerForm, loginTab, registerTab, notice };
  Object.values(fragments).forEach(node => node?.remove());

  authView.innerHTML = `<div class="gcEntryShell">
    <section id="gcEntryStart" class="gcEntryState gcEntryStart" aria-labelledby="gcEntryHeadline">
      <div class="gcEntryBrand"><img src="${escapeHtml(GRADECREW_ASSETS.brand.primary)}" alt="GradeCrew" class="gcEntryLogo"></div>
      <div class="gcEntryHero">
        <div class="gcEntryLead">
          <span class="gcEntryEyebrow">Deine Crew für digitale Tests</span>
          <h1 id="gcEntryHeadline">Willkommen bei GradeCrew.</h1>
          <p>Dein Team für bessere Tests.</p>
          <div class="gcEntryActions">
            <button type="button" class="button primary gcEntryTutorialStart" id="gcEntryTutorialStart" data-entry-autofocus>Tutorial starten <small>Ohne Registrierung</small></button>
            <button type="button" class="button secondary gcEntryLoginOpen" id="gcEntryLoginOpen">Anmelden</button>
            <button type="button" class="gcEntryTextAction" id="gcEntryRegisterOpen">Account erstellen</button>
          </div>
        </div>
        <div class="gcEntryCrewScene" aria-label="Coco, Remy, Emmi und Wilma – die GradeCrew">
          <img src="${escapeHtml(GRADECREW_ASSETS.scenes.welcome)}" alt="" class="gcEntryCrewSceneImage" decoding="async">
          <div class="gcEntryCrewStrip">${canonicalCrewCards()}</div>
        </div>
      </div>
      <aside class="gcEntryStudent" aria-labelledby="gcEntryStudentTitle">
        <div><span class="gcEntryEyebrow">Für Schülerinnen und Schüler</span><h2 id="gcEntryStudentTitle">Testcode eingeben</h2><p>Direkt zum Test – kein Account nötig.</p></div>
        <div id="gcEntryJoinHost"></div>
      </aside>
    </section>

    <section id="gcEntryLogin" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryLoginTitle">
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück</button>
      <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryLoginTitle">Willkommen zurück</h1><p>Melde dich an und mach dort weiter, wo du aufgehört hast.</p><div id="gcEntryLoginTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryLoginFormHost"></div><p class="gcEntrySwitch">Noch kein Account? <button type="button" id="gcEntrySwitchRegister">Account erstellen</button></p></div>
    </section>

    <section id="gcEntryRegister" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryRegisterTitle">
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück</button>
      <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryRegisterTitle">Account erstellen</h1><p>Deine vorhandene Registrierung bleibt unverändert – hier bekommt sie nur einen eigenen, ruhigen Zustand.</p><div id="gcEntryRegisterTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryRegisterFormHost"></div><p class="gcEntrySwitch">Schon dabei? <button type="button" id="gcEntrySwitchLogin">Anmelden</button></p></div>
    </section>

    <section id="gcEntryTutorialName" class="gcEntryState gcEntryAuth gcEntryTutorialName hidden" aria-hidden="true" aria-labelledby="gcEntryNameTitle">
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück</button>
      <div class="gcEntryAuthPanel gcEntryNamePanel"><img src="${escapeHtml(GRADECREW_ASSETS.mascots.coco.nameScene)}" alt="" class="gcEntryNameCoco"><span class="gcEntryEyebrow">Bevor wir starten</span><h1 id="gcEntryNameTitle">Wie dürfen wir dich nennen?</h1><p>Nur für diese Einführung. Keine E-Mail, kein Passwort, keine Registrierung.</p><label for="gcEntryGuestName">Name oder Anzeigename</label><input id="gcEntryGuestName" autocomplete="nickname" maxlength="60" placeholder="z. B. Martin, Herr Löffler oder ML" data-entry-autofocus><p id="gcEntryGuestNameError" class="fieldError hidden" role="alert">Bitte gib kurz an, wie Coco dich ansprechen darf.</p><button type="button" class="button primary" id="gcEntryGuestContinue">Tutorial beginnen</button></div>
    </section>

    <section id="gcEntryTutorial" class="gcEntryState gcEntryTutorial hidden" aria-hidden="true" aria-labelledby="gcEntryTutorialTitle">
      <div class="gcEntryTutorialTop"><button type="button" class="gcEntryBack" id="gcEntryTutorialExit">← Tutorial verlassen</button><span id="gcEntryTutorialProgress" aria-live="polite"></span></div>
      <div id="gcEntryTutorialBody" class="gcEntryTutorialBody"></div>
      <div class="gcEntryTutorialNav"><button type="button" class="button secondary" id="gcEntryTutorialPrev">Zurück</button><button type="button" class="button primary" id="gcEntryTutorialNext">Weiter</button></div>
    </section>

    <section id="gcEntryAccountGate" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryGateTitle">
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück zum Start</button>
      <div class="gcEntryAuthPanel gcEntryGatePanel"><img src="${escapeHtml(GRADECREW_ASSETS.scenes.save)}" alt="" class="gcEntryGateArt"><span class="gcEntryEyebrow">Erst wenn du speichern möchtest</span><h1 id="gcEntryGateTitle">Möchtest du deinen Fortschritt speichern?</h1><p>Für eigene Tests, Klassen, Einstellungen und Ergebnisse brauchst du einen Account. Die Einführung selbst war ohne Registrierung.</p><div class="gcEntryGateActions"><button type="button" class="button primary" id="gcEntryGateRegister">Account erstellen</button><button type="button" class="button secondary" id="gcEntryGateLogin">Anmelden</button><button type="button" class="gcEntryTextAction" id="gcEntryGateLater">Später</button></div></div>
    </section>
  </div>`;

  $("gcEntryJoinHost").append(joinForm);
  $("gcEntryLoginTabHost").append(loginTab);
  $("gcEntryLoginFormHost").append(loginForm);
  $("gcEntryRegisterTabHost").append(registerTab);
  $("gcEntryRegisterFormHost").append(registerForm);
  if (notice) authView.prepend(notice);

  loginTab.classList.add("gcEntryCompatTab");
  registerTab.classList.add("gcEntryCompatTab");
  loginTab.setAttribute("aria-hidden", "true");
  registerTab.setAttribute("aria-hidden", "true");
  loginTab.tabIndex = -1;
  registerTab.tabIndex = -1;

  $("gcEntryTutorialStart").addEventListener("click", () => setState("tutorialName"));
  $("gcEntryLoginOpen").addEventListener("click", showLogin);
  $("gcEntryRegisterOpen").addEventListener("click", showRegister);
  $("gcEntrySwitchRegister").addEventListener("click", showRegister);
  $("gcEntrySwitchLogin").addEventListener("click", showLogin);
  $("gcEntryGuestContinue").addEventListener("click", startGuestTutorial);
  $("gcEntryGuestName").addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); startGuestTutorial(); }
  });
  authView.querySelectorAll("[data-entry-back]").forEach(button => button.addEventListener("click", showStart));
  $("gcEntryTutorialExit").addEventListener("click", showStart);
  $("gcEntryTutorialPrev").addEventListener("click", () => { tutorialStep = Math.max(0, tutorialStep - 1); renderTutorial(); });
  $("gcEntryTutorialNext").addEventListener("click", () => {
    if (tutorialStep >= 5) { setState("accountGate"); return; }
    tutorialStep += 1;
    renderTutorial();
  });
  $("gcEntryGateRegister").addEventListener("click", showRegister);
  $("gcEntryGateLogin").addEventListener("click", showLogin);
  $("gcEntryGateLater").addEventListener("click", showStart);

  document.addEventListener("gradecrew:signed-out", () => {
    if (!$("authView")?.classList.contains("hidden")) showStart();
  });
  document.addEventListener("gradecrew:account-changed", () => {
    tutorialStep = 0;
    tutorialChoice = "";
  });

  setState("start", { focus: false });
  return true;
}

export function installGradeCrewEntryFlow() {
  if (buildEntrySurface()) return true;
  const observer = new MutationObserver(() => {
    if (buildEntrySurface()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return false;
}

installGradeCrewEntryFlow();
