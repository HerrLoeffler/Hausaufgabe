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

function entryIcon(name) {
  const icons = {
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    improve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V4Z"/><path d="M8 8h7M8 12h5M8 16h4"/><path d="m17 14 1.2 2.2L21 17.5l-2.8 1.3L17 21l-1.2-2.2-2.8-1.3 2.8-1.3L17 14Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/></svg>',
    class: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4c3 2 7 2 10 0v-4M21 10v6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V10M12 20V5M19 20V2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>'
  };
  return icons[name] || "";
}

function supportCrewCards() {
  const roles = [
    ["remy", "Remy", "Erstellen", "edit"],
    ["emmi", "Emmi", "Verbessern", "improve"],
    ["wilma", "Wilma", "Prüfen", "check"]
  ];
  return roles.map(([key, name, role, icon]) => {
    const mascot = GRADECREW_ASSETS.mascots?.[key];
    return `<article class="gcEntryCrewMember gcEntryCrewMember-${key}">
      <img src="${escapeHtml(mascot?.welcome || mascot?.primary || "")}" alt="" width="190" height="220" decoding="async">
      <span class="gcEntryCrewRole"><span class="gcEntryCrewRoleIcon">${entryIcon(icon)}</span><span class="gcEntryCrewRoleCopy"><strong>${name}</strong><small>${role}</small></span></span>
    </article>`;
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
    <div class="gcEntryTutorialCopy"><span class="gcEntryEyebrow">${escapeHtml(current.eyebrow)}</span><h2 id="gcEntryTutorialTitle">${current.title}</h2><p>${escapeHtml(current.text)}</p>${actionHtml}${resultHtml}</div>`;
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

function installPublicHeader() {
  const topbar = document.querySelector(".topbar");
  const authView = $("authView");
  if (!topbar || !authView) return;

  let nav = $("gcPublicNav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.id = "gcPublicNav";
    nav.className = "gcPublicNav";
    nav.setAttribute("aria-label", "GradeCrew Navigation");
    nav.innerHTML = `
      <button type="button" data-entry-nav="features"><span data-i18n-key="nav.features" data-i18n-fallback="Funktionen">Funktionen</span></button>
      <button type="button" data-entry-nav="crew"><span data-i18n-key="nav.crew" data-i18n-fallback="Die Crew">Die Crew</span></button>
      <button type="button" data-entry-nav="teacher"><span data-i18n-key="nav.teachers" data-i18n-fallback="Für Lehrkräfte">Für Lehrkräfte</span></button>
      <button type="button" data-entry-nav="help" class="gcPublicNavHelp"><span aria-hidden="true">?</span> <span data-i18n-key="nav.help" data-i18n-fallback="Hilfe">Hilfe</span></button>
    `;
    topbar.insertBefore(nav, $("userBar") || null);

    nav.addEventListener("click", event => {
      const button = event.target.closest("[data-entry-nav]");
      if (!button) return;
      const target = button.dataset.entryNav;
      if (target === "teacher") {
        showLogin();
        return;
      }
      if (target === "help") {
        showStart();
        requestAnimationFrame(() => $("gcEntryTutorialStart")?.click());
        return;
      }
      showStart();
      requestAnimationFrame(() => {
        const node = target === "crew" ? $("gcEntryCrew") : $("gcEntryBenefits");
        node?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      });
    });
  }

  const syncMode = () => {
    document.body.classList.toggle("gcPublicEntryMode", !authView.classList.contains("hidden"));
  };
  syncMode();
  if (!authView.dataset.entryModeObserved) {
    const observer = new MutationObserver(syncMode);
    observer.observe(authView, { attributes: true, attributeFilter: ["class"] });
    authView.dataset.entryModeObserved = "1";
  }
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
      <div class="gcEntryWelcome">
        <div class="gcEntryHero">
          <div class="gcEntryClassroom" aria-hidden="true">
            <div class="gcEntrySunGlow"></div>
            <div class="gcEntryDoor"><span class="gcEntryDoorSign">Schön,<br>dass du da bist!<b>♡</b></span><i class="gcEntryDoorKnob"></i></div>
            <div class="gcEntryWindow"><span></span><span></span></div>
            <div class="gcEntryBoard">Gemeinsam<br>bessere Tests! <span>♡</span></div>
            <div class="gcEntryShelf">
              <i></i><i></i><i></i><i></i>
              <span class="gcEntryPlant"></span>
            </div>
            <div class="gcEntryDeskDecor"></div>
          </div>

          <div class="gcEntryLead">
            <h1 id="gcEntryHeadline"><span>Hi! Ich bin Coco.</span><strong>Willkommen bei GradeCrew.</strong></h1>
            <p>Digitale Tests, schnell &amp; einfach.</p>
          </div>

          <div id="gcEntryCrew" class="gcEntryCharacterStage" aria-label="Coco, Remy, Emmi und Wilma – die GradeCrew">
            <div class="gcEntryCoco">
              <img src="${escapeHtml(GRADECREW_ASSETS.mascots.coco.welcome || GRADECREW_ASSETS.mascots.coco.primary)}" alt="Coco, dein GradeCrew-Guide" decoding="async">
              <span class="gcEntryCocoNote">Ich zeige dir<br>mein Team!</span>
            </div>
            <div class="gcEntrySupportCrew">${supportCrewCards()}</div>
          </div>

          <div class="gcEntryActions">
            <button type="button" class="button primary gcEntryTutorialStart" id="gcEntryTutorialStart" data-entry-autofocus>Crew kennenlernen <span aria-hidden="true">→</span></button>
            <button type="button" class="button secondary gcEntryLoginOpen" id="gcEntryLoginOpen">Direkt anmelden</button>
          </div>

          <aside class="gcEntryStudent" aria-labelledby="gcEntryStudentTitle">
            <span class="gcEntryStudentIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M15 14a4.5 4.5 0 0 1 6 4v2"/></svg></span>
            <div class="gcEntryStudentCopy"><h2 id="gcEntryStudentTitle">Schüler? Testcode eingeben.</h2><p>Kein Account nötig.</p></div>
            <div id="gcEntryJoinHost"></div>
          </aside>
        </div>

        <div id="gcEntryBenefits" class="gcEntryBenefits" aria-label="GradeCrew Vorteile">
          <span><i class="gcEntryBenefitIcon">${entryIcon("bolt")}</i><span><strong>Schnell erstellt</strong><small>In wenigen Minuten</small></span></span>
          <span><i class="gcEntryBenefitIcon">${entryIcon("class")}</i><span><strong>Einfach durchgeführt</strong><small>Für deine Klasse</small></span></span>
          <span><i class="gcEntryBenefitIcon">${entryIcon("chart")}</i><span><strong>Direkt ausgewertet</strong><small>Mit klaren Ergebnissen</small></span></span>
          <span><i class="gcEntryBenefitIcon">${entryIcon("heart")}</i><span><strong>Für Lehrkräfte gemacht</strong><small>Praxisnah. Sicher. Zuverlässig.</small></span></span>
        </div>
      </div>
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

  installPublicHeader();

  $("gcEntryJoinHost").append(joinForm);
  const joinSubmit = joinForm.querySelector('button[type="submit"]');
  if (joinSubmit) {
    joinSubmit.textContent = "→";
    joinSubmit.setAttribute("aria-label", "Test öffnen");
    joinSubmit.classList.add("gcEntryJoinSubmit");
  }
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
