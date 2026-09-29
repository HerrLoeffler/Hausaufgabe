let installed = false;
let active = false;
let stepIndex = 0;
let guide = null;
let currentTarget = null;

const $ = selector => document.querySelector(selector);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const STEPS = [
  {
    target: "#aiView .aiGrid > article:first-child",
    eyebrow: "1 von 5 · Test festlegen",
    title: "Was soll entstehen?",
    text: "Fach, Klasse und Thema geben der KI den wichtigsten Rahmen. Schulart und Bundesland helfen beim passenden Niveau. Aufgabenanzahl, Schwierigkeit, Punkte und Aufgabentypen kannst du ganz frei an deinen Unterricht anpassen."
  },
  {
    target: "#aiCustomNotes",
    eyebrow: "2 von 5 · Eigene Wünsche",
    title: "Hier wird es wirklich dein Test.",
    text: "Dieses Feld ist optional und gilt nur für den aktuellen Test. Schreib hier zum Beispiel hinein, welche Schwerpunkte du möchtest, was unbedingt vorkommen soll oder was die KI vermeiden soll."
  },
  {
    target: ".gradecrewPreferenceDetails",
    eyebrow: "3 von 5 · Persönliche KI-Vorgaben",
    title: "Deine Vorlieben für später.",
    text: "Auch das ist optional. Hier kannst du allgemeine Vorlieben speichern, die GradeCrew bei zukünftigen KI-Tests berücksichtigen soll. Für diesen einen Test musst du hier nichts eintragen."
  },
  {
    target: "#aiView .aiGrid > article:nth-child(2)",
    eyebrow: "4 von 5 · Material & Bilder",
    title: "Material nur, wenn es wirklich hilft.",
    text: "Du kannst eigenes Material hochladen und festlegen, wie stark es verwendet werden soll. Vor dem Upload bestätigst du Rechte und Datenschutz. Außerdem bestimmst du selbst, ob und wie viele Aufgaben Bilder bekommen sollen."
  },
  {
    target: "#generateAiTestBtn",
    eyebrow: "5 von 5 · Bereit",
    title: "Du entscheidest, wann es losgeht.",
    text: "Prüfe deine Angaben noch einmal. Du kannst weiterhin jedes Feld ändern. Erst mit „Test erstellen“ startet die KI – danach bekommst du einen Entwurf, den du vollständig prüfen und bearbeiten kannst."
  }
];

function installStyles() {
  if ($('style[data-remy-ai-help]')) return;
  const style = document.createElement("style");
  style.dataset.remyAiHelp = "1";
  style.textContent = `
    #createView .createChoiceGrid{position:relative}
    .gcRemyHelpLauncher{
      grid-column:1 / -1;order:-9;justify-self:end;align-self:start;z-index:4;
      display:inline-flex;align-items:center;gap:8px;margin:-62px 78px 20px 0;padding:8px 12px;
      border:1px solid #b9ccef;border-radius:999px;background:#fff;color:#244f9e;font-size:12px;font-weight:800;
      box-shadow:0 5px 14px rgba(47,100,214,.08);cursor:pointer
    }
    .gcRemyHelpLauncher:hover{border-color:#2f64d6;background:#f7faff}
    .gcRemyHelpLauncher img{width:25px;height:25px;object-fit:contain}
    .gcRemyGuide{
      position:fixed;z-index:1700;width:min(365px,calc(100vw - 28px));padding:19px 20px 17px;
      border:1px solid #d7e1de;border-radius:20px;background:#fffdf9;color:#173b36;
      box-shadow:0 22px 60px rgba(28,49,44,.19)
    }
    .gcRemyGuideHead{display:grid;grid-template-columns:64px 1fr auto;gap:11px;align-items:center}
    .gcRemyGuideHead img{width:64px;height:64px;object-fit:contain}
    .gcRemyGuideHead span{display:block;margin-bottom:3px;color:#667871;font-size:11px}
    .gcRemyGuideHead h2{margin:0;font-size:20px;line-height:1.17;letter-spacing:-.02em}
    .gcRemyGuideClose{align-self:start;border:0;background:transparent;color:#64756f;font-size:23px;line-height:1;cursor:pointer;padding:2px 4px}
    .gcRemyGuide p{margin:13px 0;color:#526760;font-size:13px;line-height:1.58}
    .gcRemyGuideNote{padding:9px 11px;border-radius:10px;background:#eef5ff;color:#315b8d;font-size:11px;line-height:1.45}
    .gcRemyGuideActions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:14px}
    .gcRemyGuideActions>div{display:flex;gap:7px}
    .gcRemyHelpTarget{
      position:relative!important;z-index:1600!important;outline:3px solid #7da1e8!important;outline-offset:5px!important;
      border-radius:12px!important;box-shadow:0 0 0 5px rgba(255,255,255,.88),0 12px 32px rgba(47,100,214,.13)!important;
      scroll-margin-block:140px
    }
    @media(max-width:760px){
      .gcRemyHelpLauncher{margin:-8px 0 10px 0;justify-self:start}
      .gcRemyGuide{left:10px!important;right:10px!important;bottom:10px!important;top:auto!important;width:auto!important;max-height:46dvh;overflow:auto}
      .gcRemyHelpTarget{scroll-margin-block:260px}
    }
  `;
  document.head.appendChild(style);
}

function clearTarget() {
  currentTarget?.classList.remove("gcRemyHelpTarget");
  currentTarget = null;
}

function closeHelp() {
  active = false;
  clearTarget();
  guide?.remove();
  guide = null;
}

function placeGuide(target) {
  if (!guide || !target || innerWidth <= 760) return;
  const rect = target.getBoundingClientRect();
  const width = Math.min(365, innerWidth - 28);
  const gap = 22;
  let left = rect.right + gap;
  if (left + width > innerWidth - 14) left = Math.max(14, rect.left - width - gap);
  const top = Math.max(88, Math.min(rect.top, innerHeight - guide.offsetHeight - 20));
  guide.style.left = `${Math.round(left)}px`;
  guide.style.top = `${Math.round(top)}px`;
}

function renderStep(index) {
  if (!active) return;
  stepIndex = Math.max(0, Math.min(STEPS.length - 1, index));
  const step = STEPS[stepIndex];
  clearTarget();
  currentTarget = $(step.target);
  if (!currentTarget) return closeHelp();
  currentTarget.classList.add("gcRemyHelpTarget");
  currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });

  guide?.remove();
  guide = document.createElement("aside");
  guide.className = "gcRemyGuide";
  guide.setAttribute("aria-label", "Hilfe von Remy");
  guide.innerHTML = `
    <div class="gcRemyGuideHead">
      <img src="/assets/gradecrew/elephant-create.svg" alt="">
      <div><span>Remy · Hilfe beim Erstellen</span><h2>${step.title}</h2></div>
      <button type="button" class="gcRemyGuideClose" aria-label="Hilfe schließen">×</button>
    </div>
    <p>${step.text}</p>
    <div class="gcRemyGuideNote">Du kannst während meiner Hilfe alles frei anklicken, ändern und ausprobieren. Ich erkläre nur – ich sperre nichts.</div>
    <div class="gcRemyGuideActions">
      <button type="button" class="button ghost gcRemyBack" ${stepIndex === 0 ? "disabled" : ""}>Zurück</button>
      <div>
        <button type="button" class="button ghost gcRemyStop">Hilfe beenden</button>
        <button type="button" class="button primary gcRemyNext">${stepIndex === STEPS.length - 1 ? "Alles klar" : "Weiter"}</button>
      </div>
    </div>`;
  document.body.appendChild(guide);
  placeGuide(currentTarget);

  guide.querySelector(".gcRemyGuideClose").addEventListener("click", closeHelp);
  guide.querySelector(".gcRemyStop").addEventListener("click", closeHelp);
  guide.querySelector(".gcRemyBack").addEventListener("click", () => renderStep(stepIndex - 1));
  guide.querySelector(".gcRemyNext").addEventListener("click", () => {
    if (stepIndex === STEPS.length - 1) closeHelp();
    else renderStep(stepIndex + 1);
  });
}

async function startHelp() {
  if (document.body.classList.contains("gcRealTourActive")) return;
  const aiButton = $("#createAiBtn");
  if (!aiButton) return;
  aiButton.click();
  for (let i = 0; i < 50; i += 1) {
    if (!$("#aiView")?.classList.contains("hidden")) break;
    await wait(40);
  }
  if ($("#aiView")?.classList.contains("hidden")) return;
  active = true;
  renderStep(0);
}

function ensureLauncher() {
  const grid = $("#createView .createChoiceGrid");
  const ai = $("#createAiBtn");
  if (!grid || !ai || $("#gcRemyHelpLauncher")) return;
  const button = document.createElement("button");
  button.id = "gcRemyHelpLauncher";
  button.className = "gcRemyHelpLauncher";
  button.type = "button";
  button.innerHTML = '<img src="/assets/gradecrew/elephant-create.svg" alt=""><span>Noch unsicher? Remy hilft</span>';
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    void startHelp();
  });
  ai.insertAdjacentElement("afterend", button);
}

function installListeners() {
  ensureLauncher();
  document.addEventListener("click", event => {
    if (event.target.closest("#newQuizBtn, #emptyNewQuizBtn, #backFromAi, #backFromCreate, #brandBtn")) {
      if (event.target.closest("#backFromAi, #brandBtn")) closeHelp();
      setTimeout(ensureLauncher, 0);
    }
    if (active && event.target.closest("#generateAiTestBtn")) setTimeout(closeHelp, 100);
  }, true);
  addEventListener("resize", () => active && placeGuide(currentTarget), { passive: true });
  document.addEventListener("gradecrew:account-changed", closeHelp);
}

export function installRemyAiHelp() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installListeners();
}

installRemyAiHelp();
