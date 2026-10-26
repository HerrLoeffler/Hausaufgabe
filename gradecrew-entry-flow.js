import { GRADECREW_ASSETS } from "./generated/gradecrew-assets.js?v=1.2.0";
import { translateTree } from "./shared/i18n/browser-runtime.mjs?v=3";
import "./gradecrew-hero-copy.mjs?v=1";
import { installHeroDemo } from "./gradecrew-hero-demo.mjs?v=1";

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const stateIds = Object.freeze({
  start: "gcEntryStart",
  login: "gcEntryLogin",
  register: "gcEntryRegister",
  reset: "gcEntryReset"
});

let activeState = "start";

function initialEntryState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("test") || params.get("preview") === "1") return "start";
  const intent = params.get("intent");
  if (["login", "register", "reset"].includes(intent)) return intent;
  if (window.location.pathname.endsWith("/workspace.html") && params.get("firstGuide") !== "1" && !params.has("mode")) return "login";
  return "start";
}

function syncEntryIntent(next) {
  const url = new URL(window.location.href);
  if (next === "start") url.searchParams.delete("intent");
  else url.searchParams.set("intent", next);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

function setState(next, { focus = true } = {}) {
  if (!stateIds[next]) return;
  const heroDialog = $("gcHeroDialog");
  if (next !== "start" && heroDialog?.open) heroDialog.close();
  activeState = next;
  for (const [name, id] of Object.entries(stateIds)) {
    const section = $(id);
    if (!section) continue;
    const hidden = name !== next;
    section.hidden = hidden;
    section.classList.toggle("hidden", hidden);
    section.setAttribute("aria-hidden", String(hidden));
  }
  const authView = $("authView");
  if (authView) {
    authView.dataset.entryState = next;
    authView.dataset.entryRevision = String((Number(authView.dataset.entryRevision) || 0) + 1);
  }
  $("gcEntryLoginOpen")?.classList.toggle("hidden", next !== "start");
  if (!focus) return;
  syncEntryIntent(next);
  requestAnimationFrame(() => {
    const root = $(stateIds[next]);
    const target = next === "start" ? root?.querySelector("h1") : (root?.querySelector("[data-entry-autofocus]") || root?.querySelector("input:not([type=hidden])") || root?.querySelector("button, a[href]"));
    if (target && next === "start") target.tabIndex = -1;
    target?.focus?.({ preventScroll: true });
    if (next !== "start") target?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  });
}

function showLogin() {
  $("loginForm")?.classList.remove("hidden");
  $("registerForm")?.classList.add("hidden");
  setState("login");
}

function showRegister() {
  $("registerForm")?.classList.remove("hidden");
  $("loginForm")?.classList.add("hidden");
  setState("register");
}

function showReset() {
  $("resetEmail").value = $("loginEmail")?.value.trim() || "";
  $("resetStatus").textContent = "";
  setState("reset");
}

function showStart() {
  setState("start");
}

function installHeroViewportFit(authView) {
  let frame = 0;
  const fit = () => {
    frame = 0;
    const visibleHeight = window.visualViewport?.height || window.innerHeight;
    document.body?.style?.setProperty('--gc-entry-viewport-height', `${visibleHeight}px`);
    const page = authView.querySelector('.gcHeroPage');
    const visual = authView.querySelector('.gcHeroVisual');
    const stage = authView.querySelector('.gcHeroStage');
    if (!page || !visual || !stage || authView.classList.contains('hidden') || authView.dataset.entryState !== 'start') return;
    const top = page.getBoundingClientRect().top + window.scrollY;
    const benefits = authView.querySelector('.gcEntryBenefitsCompact')?.getBoundingClientRect().height || 0;
    const strip = authView.querySelector('.gcEntryBenefitsCompact');
    if (strip) {
      const stripRect = strip.getBoundingClientRect();
      const sprites = [...strip.querySelectorAll('.gcBenefitSprite')];
      const spacing = Math.min(window.innerWidth >= 781 ? 82 : 58, (stripRect.width - 24) / 4);
      strip.style.setProperty('--gc-paper-origin-x', `${1.5 * spacing}px`);
      strip.querySelectorAll('.gcCrewPaper').forEach((paper, index) => {
        const distance = -(0.9 + index * 0.9) * spacing;
        paper.style.setProperty('--gc-paper-half-x', `${distance * 0.48}px`);
        paper.style.setProperty('--gc-paper-end-x', `${distance}px`);
      });
      const layoutPosition = node => {
        let left = 0, top = 0;
        for (let current = node; current; current = current.offsetParent) {
          left += current.offsetLeft;
          top += current.offsetTop;
        }
        return { left: left - window.scrollX, top: top - window.scrollY };
      };
      sprites.forEach((sprite, index) => {
        const origin = layoutPosition(sprite);
        const targetX = stripRect.left + stripRect.width / 2 + (index - 1.5) * spacing;
        const targetY = stripRect.top + stripRect.height / 2;
        sprite.style.setProperty('--gc-gather-x', `${targetX - origin.left - sprite.offsetWidth / 2}px`);
        sprite.style.setProperty('--gc-gather-y', `${targetY - origin.top - sprite.offsetHeight / 2}px`);
        sprite.style.setProperty('--gc-run-from', `${-targetX - sprite.offsetWidth}px`);
      });
    }
    // Reserve the available window height; CSS gives controls their own rows.
    const available = window.innerHeight - top - benefits;
    stage.style.setProperty('--gc-stage-height', `${Math.max(window.innerWidth >= 781 ? 0 : 580, available)}px`);
    if (window.innerWidth >= 781) {
      const width = page.getBoundingClientRect().width;
      const height = Math.max(0, available);
      const scale = Math.max(width / 1774, height / 887);
      const left = (width - 1774 * scale) / 2;
      const top = (height - 887 * scale) / 2;
      const anchors = [[0.29,0.68],[0.48,0.61],[0.62,0.62],[0.75,0.62]];
      authView.querySelectorAll?.('.gcHeroRoles button').forEach((button,index) => {
        const anchor = anchors[index]; if (!anchor) return;
        button.style.left = `${left + anchor[0] * 1774 * scale}px`;
        button.style.top = `${top + anchor[1] * 887 * scale}px`;
      });
    } else {
      authView.querySelectorAll?.('.gcHeroRoles button').forEach(button => {button.style.removeProperty('left');button.style.removeProperty('top');});
    }


  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  new MutationObserver(schedule).observe(authView, { attributes: true, attributeFilter: ['class', 'data-entry-state'] });
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(schedule);
    const header = document.querySelector('.topbar');
    if (header) observer.observe(header);
    const benefits = authView.querySelector('.gcEntryBenefitsCompact');
    if (benefits) observer.observe(benefits);
  }
  schedule();
}

function installPublicHeader() {
  const authView = $("authView");
  if (!authView) return;
  $("gcPublicNav")?.remove();

  const syncMode = () => {
    const body = authView.ownerDocument?.body;
    if (!body || !authView.isConnected) return;
    body.classList.toggle("gcPublicEntryMode", !authView.classList.contains("hidden"));
    body.classList.toggle("gcModernAuthMode", !authView.classList.contains("hidden") && ["login", "register", "reset"].includes(authView.dataset.entryState));
    body.classList.toggle("gcPublicHeroMode", !authView.classList.contains("hidden") && authView.dataset.entryState === 'start');
  };
  syncMode();
  if (!authView.dataset.entryModeObserved) {
    const observer = new MutationObserver(syncMode);
    observer.observe(authView, { attributes: true, attributeFilter: ["class", "data-entry-state"] });
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
    <section id="gcEntryStart" hidden class="gcEntryState gcEntryStart" aria-labelledby="gcEntryHeadline">
      <div class="gcHeroPage">
        <div class="gcHeroStage">
          <div class="gcHeroVisual"><img class="gcHeroArtwork" src="./assets/gradecrew/crew-classroom-wide-v4.png" width="1774" height="887" alt="" fetchpriority="high">
            <div id="gcEntryCrew" class="gcHeroCrew" role="group" aria-label="Coco, Remy, Emmi und Wilma">
              <button type="button" class="gcHeroHit gcHeroHit-remy" data-hero-crew="remy" aria-label="Remys Beispiel ansehen"></button>
              <button type="button" class="gcHeroHit gcHeroHit-emmi" data-hero-crew="emmi" aria-label="Emmis Beispiel ansehen"></button>
              <button type="button" class="gcHeroHit gcHeroHit-wilma" data-hero-crew="wilma" aria-label="Wilmas Beispiel ansehen"></button>
            </div>
          </div>
          <div class="gcHeroLead">
            <h1 id="gcEntryHeadline"><strong><span data-i18n-key="hero.welcome" data-i18n-fallback="Willkommen bei">Willkommen bei</span> GradeCrew.</strong></h1>
            <p data-i18n-key="hero.subtitle" data-i18n-fallback="Digitale Tests. Schnell & einfach.">Digitale Tests. Schnell &amp; einfach.</p>

          </div>
          <div class="gcHeroRoles" aria-label="Deine Crew">
            <button type="button" id="gcHeroCocoTour" data-hero-crew="coco" aria-label="Coco kennenlernen"><strong>Coco</strong><small data-i18n-key="hero.cocoRole" data-i18n-fallback="Dein Guide">Dein Guide</small></button>
            <button type="button" data-hero-crew="remy"><strong>Remy</strong><small data-i18n-key="hero.remyRole" data-i18n-fallback="Erstellen">Erstellen</small></button>
            <button type="button" data-hero-crew="emmi"><strong>Emmi</strong><small data-i18n-key="hero.emmiRole" data-i18n-fallback="Verbessern">Verbessern</small></button>
            <button type="button" data-hero-crew="wilma"><strong>Wilma</strong><small data-i18n-key="hero.wilmaRole" data-i18n-fallback="Prüfen">Prüfen</small></button>
          </div>
          <div class="gcHeroActions">
            <div class="gcHeroTutorialEntry"><button type="button" class="button primary" id="gcEntryTutorialStart" data-entry-autofocus data-i18n-key="hero.meetCrew" data-i18n-fallback="Crew kennenlernen">Crew kennenlernen</button><small id="gcHeroTutorialDuration" data-i18n-key="hero.tutorialDuration" data-i18n-fallback="Tutorial · ca. 6–7 Minuten">Tutorial · ca. 6–7 Minuten</small></div>
          </div>
          <div class="gcHeroJoin"><label for="joinCode" data-i18n-key="hero.student" data-i18n-fallback="Schüler? Testcode eingeben.">Schüler? Testcode eingeben.</label><div id="gcEntryJoinHost"></div></div>
        </div>
        <ul id="gcEntryBenefits" class="gcEntryBenefitsCompact">
          <li><span class="gcBenefitSprite gcBenefitSprite--coco" aria-hidden="true"><i class="gcBenefitLetter"><i class="gcBenefitLetterArt"></i></i><i class="gcBenefitGlance"></i></span><strong data-i18n-key="hero.benefitGuide" data-i18n-fallback="Dein Ratgeber">Dein Ratgeber</strong><small data-i18n-key="hero.benefitGuideDetail" data-i18n-fallback="Hilft dir weiter">Hilft dir weiter</small></li>
          <li><span class="gcBenefitSprite gcBenefitSprite--remy" aria-hidden="true"><i class="gcBenefitLetter"><i class="gcBenefitLetterArt"></i></i><i class="gcBenefitGlance"></i></span><strong data-i18n-key="hero.benefitCreate" data-i18n-fallback="Schnell erstellt">Schnell erstellt</strong><small data-i18n-key="hero.benefitCreateDetail" data-i18n-fallback="In wenigen Minuten">In wenigen Minuten</small></li>
          <li><span class="gcBenefitSprite gcBenefitSprite--emmi" aria-hidden="true"><i class="gcBenefitLetter"><i class="gcBenefitLetterArt"></i></i><i class="gcBenefitGlance"></i></span><strong data-i18n-key="hero.benefitImprove" data-i18n-fallback="Frische Ideen">Frische Ideen</strong><small data-i18n-key="hero.benefitImproveDetail" data-i18n-fallback="Neue Aufgabenvarianten">Neue Aufgabenvarianten</small></li>
          <li><span class="gcBenefitSprite gcBenefitSprite--wilma" aria-hidden="true"><i class="gcBenefitLetter"><i class="gcBenefitLetterArt"></i></i><i class="gcBenefitGlance"></i></span><strong data-i18n-key="hero.benefitGrade" data-i18n-fallback="Direkt ausgewertet">Direkt ausgewertet</strong><small data-i18n-key="hero.benefitGradeDetail" data-i18n-fallback="Ergebnisse im Überblick">Ergebnisse im Überblick</small></li>
          <li class="gcCrewPaper gcCrewPaper--1" aria-hidden="true"></li><li class="gcCrewPaper gcCrewPaper--2" aria-hidden="true"></li><li class="gcCrewPaper gcCrewPaper--3" aria-hidden="true"></li><li class="gcCrewPaper gcCrewPaper--4" aria-hidden="true"></li>
        </ul>
      </div>
      <dialog id="gcHeroDialog" class="gcHeroDialog" aria-labelledby="gcHeroDialogTitle">
        <button id="gcHeroDialogClose" class="gcHeroDialogClose" type="button" aria-label="Schließen">×</button>
        <p id="gcHeroDialogEyebrow" class="gcHeroDialogEyebrow"></p><h2 id="gcHeroDialogTitle"></h2>
        <p id="gcHeroDemoStatus" role="status" aria-live="polite"></p>
        <div id="gcHeroDemoWorkspace" class="gcHeroDemoWorkspace"></div>
        <div class="gcHeroDemoControls"><button id="gcHeroDemoPause" type="button"></button><button id="gcHeroDemoNext" type="button"></button><button id="gcHeroDemoReplay" type="button"></button></div>
      </dialog>
    </section>

    <section id="gcEntryLogin" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryLoginTitle">
      <a href="./" class="gcEntryBack" data-entry-back>← Zurück</a>
      <div class="gcEntryLoginScene">
        <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryLoginTitle">Willkommen zurück in der Crew.</h1><p>Melde dich an und mach dort weiter, wo du aufgehört hast.</p><div id="gcEntryLoginTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryLoginFormHost"></div><p class="gcEntrySwitch">Neu bei GradeCrew? <button type="button" id="gcEntrySwitchRegister">Konto erstellen</button></p></div>
        <div class="gcEntryAuthArtwork"><div class="gcAuthCrewCopy"><p>Deine Crew. Dein Unterricht.</p><h2>Gute Tests entstehen im Team.</h2><p>Erstellen, verbessern und auswerten – mit deiner Crew an deiner Seite.</p></div><img src="./homepage/assets/crew-cutout-v2.png" alt="Coco, Remy, Emmi und Wilma heißen dich in der Crew willkommen."></div>
      </div>
    </section>

    <section id="gcEntryRegister" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryRegisterTitle">
      <a href="./" class="gcEntryBack" data-entry-back>← Zurück</a>
      <div class="gcEntryLoginScene">
        <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryRegisterTitle">Werde Teil der Crew.</h1><p>Dein Konto für eigene Tests, neue Ideen und gemeinsame Lernmomente.</p><div id="gcEntryRegisterTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryRegisterFormHost"></div><p class="gcEntrySwitch">Schon dabei? <button type="button" id="gcEntrySwitchLogin">Anmelden</button></p></div>
        <div class="gcEntryAuthArtwork"><div class="gcAuthCrewCopy"><p>Deine Crew. Dein Unterricht.</p><h2>Gute Tests entstehen im Team.</h2><p>Erstellen, verbessern und auswerten – mit deiner Crew an deiner Seite.</p></div><img src="./homepage/assets/crew-cutout-v2.png" alt="Coco, Remy, Emmi und Wilma heißen dich in der Crew willkommen."></div>
      </div>
    </section>

    <section id="gcEntryReset" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryResetTitle">
      <button type="button" class="gcEntryBack" id="gcEntryResetBack">← Zur Anmeldung</button>
      <div class="gcEntryAuthPanel">
        <h1 id="gcEntryResetTitle">Passwort vergessen?</h1><p>Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst.</p>
        <form id="resetForm" class="stack authForm">
          <label for="resetEmail">E-Mail<input id="resetEmail" type="email" autocomplete="email" required data-entry-autofocus /></label>
          <button id="resetSubmit" class="button primary" type="submit">Link senden</button>
          <p id="resetStatus" class="hint" role="status" aria-live="polite"></p>
        </form>
        <p class="gcEntrySwitch"><button type="button" id="gcEntryResetLogin">Zur Anmeldung</button></p>
      </div>
    </section>
  </div>`;

  $("gcEntryJoinHost").append(joinForm);
  const joinSubmit = joinForm.querySelector('button[type="submit"]');
  if (joinSubmit) {
    joinSubmit.textContent = "Test öffnen";
    joinSubmit.setAttribute("aria-label", "Test öffnen");
    joinSubmit.classList.add("gcEntryJoinSubmit");
  }
  $("gcEntryLoginTabHost").append(loginTab);
  $("gcEntryLoginFormHost").append(loginForm);
  $("gcEntryRegisterTabHost").append(registerTab);
  $("gcEntryRegisterFormHost").append(registerForm);
  if (notice) authView.prepend(notice);
  loginForm.setAttribute("aria-labelledby", "gcEntryLoginTitle");
  registerForm.setAttribute("aria-labelledby", "gcEntryRegisterTitle");
  const registerHeading = registerForm.querySelector("h2");
  if (registerHeading) registerHeading.hidden = true;
  registerForm.querySelector('button[type="submit"]').textContent = "Konto erstellen";

  loginTab.classList.add("gcEntryCompatTab");
  registerTab.classList.add("gcEntryCompatTab");
  loginTab.setAttribute("aria-hidden", "true");
  registerTab.setAttribute("aria-hidden", "true");
  loginTab.tabIndex = -1;
  registerTab.tabIndex = -1;

  $("gcEntryTutorialStart").addEventListener("click", () => {
    document.dispatchEvent(new document.defaultView.Event("gradecrew:start-guest-tour"));
  });
  $("gcEntryLoginOpen").addEventListener("click", showLogin);
  $("gcEntrySwitchRegister").addEventListener("click", showRegister);
  $("gcEntrySwitchLogin").addEventListener("click", showLogin);
  $("forgotBtn").addEventListener("click", showReset);
  $("gcEntryResetBack").addEventListener("click", showLogin);
  $("gcEntryResetLogin").addEventListener("click", showLogin);
  const home = new URL("./", window.location.href);
  if (String(document.documentElement.lang).startsWith("en") || new URLSearchParams(window.location.search).get("lang")?.startsWith("en")) home.searchParams.set("lang", "en");
  authView.querySelectorAll("[data-entry-back]").forEach(link => {
    link.href = home.href;
    link.addEventListener("click", event => {
      if (window.location.pathname.endsWith("/workspace.html")) {
        const target = new URL("./", window.location.href);
        if (String(document.documentElement.lang).startsWith("en")) target.searchParams.set("lang", "en");
        link.href = target.href;
        return;
      }
      event.preventDefault();
      showStart();
    });
  });
  installHeroDemo($("gcEntryStart"));
  translateTree(authView);

  document.addEventListener("gradecrew:signed-out", () => {
    if (!$("authView")?.classList.contains("hidden")) setState(initialEntryState(), { focus: false });
  });
  const initialState = initialEntryState();
  loginForm.classList.toggle("hidden", initialState === "register");
  registerForm.classList.toggle("hidden", initialState !== "register");
  setState(initialState, { focus: false });
  installPublicHeader();
  authView.dataset.entryReady = "true";
  installHeroViewportFit(authView);
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
