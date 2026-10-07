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
  register: "gcEntryRegister"
});

let activeState = "start";

function setState(next, { focus = true } = {}) {
  if (!stateIds[next]) return;
  const heroDialog = $("gcHeroDialog");
  if (next !== "start" && heroDialog?.open) heroDialog.close();
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
  $("gcEntryLoginOpen")?.classList.toggle("hidden", next !== "start");
  if (!focus) return;
  requestAnimationFrame(() => {
    const root = $(stateIds[next]);
    const target = next === "start" ? root?.querySelector("h1") : root?.querySelector("[data-entry-autofocus], input:not([type=hidden]), button, a[href]");
    if (target && next === "start") target.tabIndex = -1;
    target?.focus?.({ preventScroll: true });
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

function showStart() {
  setState("start");
}

function installHeroViewportFit(authView) {
  let frame = 0;
  const fit = () => {
    frame = 0;
    const page = authView.querySelector('.gcHeroPage');
    const visual = authView.querySelector('.gcHeroVisual');
    const stage = authView.querySelector('.gcHeroStage');
    if (!page || !visual || !stage || authView.classList.contains('hidden') || authView.dataset.entryState !== 'start') return;
    const top = page.getBoundingClientRect().top + window.scrollY;
    const benefits = authView.querySelector('.gcEntryBenefitsCompact')?.getBoundingClientRect().height || 0;
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
    document.body.classList.toggle("gcPublicEntryMode", !authView.classList.contains("hidden"));
    document.body.classList.toggle("gcPublicHeroMode", !authView.classList.contains("hidden") && authView.dataset.entryState === 'start');
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
    <section id="gcEntryStart" class="gcEntryState gcEntryStart" aria-labelledby="gcEntryHeadline">
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
            <button type="button" id="gcHeroCocoTour" data-hero-crew="coco" aria-label="Coco kennenlernen"><strong>Coco</strong><small>Dein Guide</small></button>
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
          <li><img src="./assets/gradecrew/penguin-guide.svg" width="48" height="48" alt="" aria-hidden="true"><strong data-i18n-key="hero.benefitGuide" data-i18n-fallback="Dein Ratgeber">Dein Ratgeber</strong><small data-i18n-key="hero.benefitGuideDetail" data-i18n-fallback="Hilft dir weiter">Hilft dir weiter</small></li>
          <li><img src="./assets/gradecrew/elephant-create.svg" width="48" height="48" alt="" aria-hidden="true"><strong data-i18n-key="hero.benefitCreate" data-i18n-fallback="Schnell erstellt">Schnell erstellt</strong><small data-i18n-key="hero.benefitCreateDetail" data-i18n-fallback="In wenigen Minuten">In wenigen Minuten</small></li>
          <li><img src="./assets/gradecrew/fox-improve.svg" width="48" height="48" alt="" aria-hidden="true"><strong data-i18n-key="hero.benefitImprove" data-i18n-fallback="Frische Ideen">Frische Ideen</strong><small data-i18n-key="hero.benefitImproveDetail" data-i18n-fallback="Neue Aufgabenvarianten">Neue Aufgabenvarianten</small></li>
          <li><img src="./assets/gradecrew/owl-grade.svg" width="48" height="48" alt="" aria-hidden="true"><strong data-i18n-key="hero.benefitGrade" data-i18n-fallback="Direkt ausgewertet">Direkt ausgewertet</strong><small data-i18n-key="hero.benefitGradeDetail" data-i18n-fallback="Ergebnisse im Überblick">Ergebnisse im Überblick</small></li>
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
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück</button>
      <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryLoginTitle">Willkommen zurück</h1><p>Melde dich an und mach dort weiter, wo du aufgehört hast.</p><div id="gcEntryLoginTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryLoginFormHost"></div><p class="gcEntrySwitch">Noch kein Account? <button type="button" id="gcEntrySwitchRegister">Account erstellen</button></p></div>
    </section>

    <section id="gcEntryRegister" class="gcEntryState gcEntryAuth hidden" aria-hidden="true" aria-labelledby="gcEntryRegisterTitle">
      <button type="button" class="gcEntryBack" data-entry-back>← Zurück</button>
      <div class="gcEntryAuthPanel"><img src="${escapeHtml(GRADECREW_ASSETS.brand.icon)}" alt="" width="48" height="48"><span class="gcEntryEyebrow">GradeCrew</span><h1 id="gcEntryRegisterTitle">Account erstellen</h1><p>Deine vorhandene Registrierung bleibt unverändert – hier bekommt sie nur einen eigenen, ruhigen Zustand.</p><div id="gcEntryRegisterTabHost" class="gcEntryCompatTabs"></div><div id="gcEntryRegisterFormHost"></div><p class="gcEntrySwitch">Schon dabei? <button type="button" id="gcEntrySwitchLogin">Anmelden</button></p></div>
    </section>

  </div>`;

  installPublicHeader();

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
  authView.querySelectorAll("[data-entry-back]").forEach(button => button.addEventListener("click", showStart));
  installHeroDemo($("gcEntryStart"));
  translateTree(authView);

  document.addEventListener("gradecrew:signed-out", () => {
    if (!$("authView")?.classList.contains("hidden")) showStart();
  });
  setState("start", { focus: false });
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
