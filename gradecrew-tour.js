const TOUR_VERSION = "gradecrew-crew-tour-v1";
const TOUR_DONE_KEY = `gradecrewCrewTour:${TOUR_VERSION}`;
const TOUR_FORCE = new URLSearchParams(location.search).get("crewTour") === "1";
const ASSET = (name) => `/assets/gradecrew/${name}.svg`;

const CREW = Object.freeze({
  guide: { name: "Pinguin", role: "Guide", asset: "penguin-guide" },
  create: { name: "Elefant", role: "Erstellen", asset: "elephant-create" },
  improve: { name: "Fuchs", role: "Verbessern", asset: "fox-improve" },
  grade: { name: "Eule", role: "Prüfen", asset: "owl-grade" }
});

const DEMO_TEST = Object.freeze({
  title: "GradeCrew-Demo · Colours & school things",
  subject: "Englisch",
  grade: "5",
  description: "Kurzer Beispieltest für die GradeCrew-Tour. Prüfe jede Aufgabe, bevor du einen echten Test einsetzt.",
  questions: [
    {
      type: "single",
      text: "Which word means „blau“?",
      points: 2,
      options: [
        { text: "blue", correct: true },
        { text: "green", correct: false },
        { text: "yellow", correct: false },
        { text: "red", correct: false }
      ]
    },
    {
      type: "matching",
      text: "Match the school things with the German words.",
      points: 2,
      pairs: [
        { left: "pencil", right: "Bleistift" },
        { left: "ruler", right: "Lineal" },
        { left: "exercise book", right: "Heft" },
        { left: "schoolbag", right: "Schultasche" }
      ]
    },
    {
      type: "gapfill",
      text: "Complete the sentences: My pencil is [red]. My exercise book is [blue].",
      points: 2
    },
    {
      type: "truefalse",
      text: "A ruler is something you can use to measure.",
      points: 2,
      correctBoolean: true
    },
    {
      type: "ordering",
      text: "Put the words in the correct order.",
      points: 2,
      items: ["My", "schoolbag", "is", "green."]
    },
    {
      type: "text",
      text: "What is „Schultasche“ in English?",
      points: 2,
      acceptedAnswers: ["schoolbag", "school bag"],
      manualReview: false
    }
  ]
});

let active = false;
let stage = "";
let root = null;
let target = null;
let targetCleanup = null;
let positionRaf = 0;
let observer = null;
let typingAbort = 0;
let importStarted = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const qs = (selector, base = document) => base.querySelector(selector);
const qsa = (selector, base = document) => [...base.querySelectorAll(selector)];
const isVisible = (node) => Boolean(node && !node.classList.contains("hidden") && node.getClientRects().length);

function ensureStyles() {
  if (document.querySelector('link[data-gradecrew-tour-style]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./gradecrew-tour.css?v=2.3.1-gc3";
  link.dataset.gradecrewTourStyle = "1";
  document.head.appendChild(link);
}

function replaceFalconWithElephant(scope = document) {
  qsa('img[src*="falcon-create.svg"]', scope).forEach(img => {
    img.src = img.src.replace("falcon-create.svg", "elephant-create.svg");
  });
  const aiArtwork = qs("#aiView .pageCrewArtwork");
  if (aiArtwork) aiArtwork.src = ASSET("elephant-create");
  const aiIcon = qs("#createAiBtn .choiceIcon img");
  if (aiIcon) aiIcon.src = ASSET("elephant-create");
  const empty = qs("#emptyQuizState .gradecrewEmptyMascot img");
  if (empty) empty.src = ASSET("elephant-create");
}

function polishCreateChoice() {
  const grid = qs("#createView .createChoiceGrid");
  const ai = qs("#createAiBtn");
  const manual = qs("#createManualBtn");
  if (!grid || !ai || !manual) return;
  if (grid.firstElementChild !== ai) grid.insertBefore(ai, grid.firstElementChild);
  ai.classList.add("gradecrewAiPrimary");
  if (!qs(".gradecrewRecommended", ai)) {
    const badge = document.createElement("span");
    badge.className = "gradecrewRecommended";
    badge.textContent = "Empfohlen";
    ai.appendChild(badge);
  }
  const manualSmall = qs(".choiceText small", manual);
  if (manualSmall) manualSmall.textContent = "Oder ganz klassisch: leer starten und jede Aufgabe selbst bauen.";
}

function suppressLegacyGuides() {
  const backdrop = qs("#firstAiGuideBackdrop");
  const card = qs("#firstAiGuideCard");
  backdrop?.classList.add("hidden");
  card?.classList.add("hidden");
  qsa(".firstAiGuideSpotlight").forEach(node => node.classList.remove("firstAiGuideSpotlight"));
  const legacyDialog = qs("#teacherTourDialog");
  if (legacyDialog?.open) {
    try { legacyDialog.close(); } catch (_) {}
  }
}

function installRestartButton() {
  const actions = qs("#dashboardView .dashboardActions");
  if (!actions || qs("#gradecrewTourBtn")) return;
  const button = document.createElement("button");
  button.id = "gradecrewTourBtn";
  button.className = "button ghost gradecrewTourLaunch";
  button.type = "button";
  button.innerHTML = '<span aria-hidden="true">◌</span> Crew kennenlernen';
  button.addEventListener("click", () => startTour({ restart: true }));
  actions.insertBefore(button, actions.firstChild);
}

function ensureRoot() {
  if (root?.isConnected) return root;
  root = document.createElement("div");
  root.id = "gradecrewCrewTour";
  root.className = "gcTourRoot hidden";
  root.innerHTML = `
    <div class="gcTourShade gcTourShadeTop"></div>
    <div class="gcTourShade gcTourShadeRight"></div>
    <div class="gcTourShade gcTourShadeBottom"></div>
    <div class="gcTourShade gcTourShadeLeft"></div>
    <div class="gcTourHighlight" aria-hidden="true"></div>
    <section class="gcTourCard" role="dialog" aria-modal="false" aria-live="polite"></section>`;
  document.body.appendChild(root);
  return root;
}

function speakerHtml(role = "guide") {
  const speaker = CREW[role] || CREW.guide;
  return `<div class="gcTourSpeaker"><img src="${ASSET(speaker.asset)}" width="58" height="58" alt=""><div><strong>${speaker.name}</strong><span>${speaker.role}</span></div></div>`;
}

function crewHtml() {
  return `<div class="gcTourCrewGrid">
    ${Object.entries(CREW).map(([, member]) => `<div class="gcTourCrewMember"><img src="${ASSET(member.asset)}" width="70" height="70" alt=""><div><strong>${member.name}</strong><span>${member.role}</span></div></div>`).join("")}
  </div>`;
}

function renderCard({ role = "guide", eyebrow = "GradeCrew", title, text = "", body = "", primary = "Weiter", secondary = "Tour beenden", centered = false, onPrimary = null }) {
  ensureRoot();
  root.classList.remove("hidden");
  root.classList.toggle("centered", centered);
  const card = qs(".gcTourCard", root);
  card.innerHTML = `${speakerHtml(role)}
    <div class="gcTourCopy"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${text ? `<p>${text}</p>` : ""}${body}</div>
    <div class="gcTourActions">${secondary ? `<button class="button ghost gcTourExit" type="button">${secondary}</button>` : ""}${primary ? `<button class="button primary gcTourNext" type="button">${primary}</button>` : ""}</div>`;
  qs(".gcTourExit", card)?.addEventListener("click", () => finishTour({ done: false }));
  if (onPrimary) qs(".gcTourNext", card)?.addEventListener("click", onPrimary);
  requestAnimationFrame(positionCard);
  return card;
}

function clearTarget() {
  if (targetCleanup) targetCleanup();
  targetCleanup = null;
  target = null;
  root?.classList.remove("hasTarget");
  cancelAnimationFrame(positionRaf);
}

function positionCard() {
  if (!root || root.classList.contains("hidden")) return;
  const card = qs(".gcTourCard", root);
  if (!card) return;
  if (!target || !isVisible(target)) {
    root.classList.remove("hasTarget");
    card.style.removeProperty("left");
    card.style.removeProperty("top");
    return;
  }
  root.classList.add("hasTarget");
  const rect = target.getBoundingClientRect();
  const padding = 10;
  const hole = {
    left: Math.max(8, rect.left - padding),
    top: Math.max(8, rect.top - padding),
    right: Math.min(innerWidth - 8, rect.right + padding),
    bottom: Math.min(innerHeight - 8, rect.bottom + padding)
  };
  const topShade = qs(".gcTourShadeTop", root);
  const rightShade = qs(".gcTourShadeRight", root);
  const bottomShade = qs(".gcTourShadeBottom", root);
  const leftShade = qs(".gcTourShadeLeft", root);
  Object.assign(topShade.style, { left: "0px", top: "0px", width: "100vw", height: `${hole.top}px` });
  Object.assign(bottomShade.style, { left: "0px", top: `${hole.bottom}px`, width: "100vw", height: `${Math.max(0, innerHeight - hole.bottom)}px` });
  Object.assign(leftShade.style, { left: "0px", top: `${hole.top}px`, width: `${hole.left}px`, height: `${Math.max(0, hole.bottom - hole.top)}px` });
  Object.assign(rightShade.style, { left: `${hole.right}px`, top: `${hole.top}px`, width: `${Math.max(0, innerWidth - hole.right)}px`, height: `${Math.max(0, hole.bottom - hole.top)}px` });
  const highlight = qs(".gcTourHighlight", root);
  Object.assign(highlight.style, { left: `${hole.left}px`, top: `${hole.top}px`, width: `${hole.right - hole.left}px`, height: `${hole.bottom - hole.top}px` });

  const cardRect = card.getBoundingClientRect();
  const gap = 18;
  const margin = 12;
  let left = Math.min(Math.max(margin, hole.left), Math.max(margin, innerWidth - cardRect.width - margin));
  let top = hole.bottom + gap;
  if (top + cardRect.height > innerHeight - margin) top = hole.top - cardRect.height - gap;
  if (top < margin) {
    top = Math.max(margin, Math.min(hole.top, innerHeight - cardRect.height - margin));
    left = hole.right + gap;
    if (left + cardRect.width > innerWidth - margin) left = hole.left - cardRect.width - gap;
    left = Math.max(margin, Math.min(left, innerWidth - cardRect.width - margin));
  }
  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}

function watchPosition() {
  const onMove = () => {
    cancelAnimationFrame(positionRaf);
    positionRaf = requestAnimationFrame(positionCard);
  };
  addEventListener("resize", onMove);
  addEventListener("scroll", onMove, true);
  return () => {
    removeEventListener("resize", onMove);
    removeEventListener("scroll", onMove, true);
  };
}

function spotlight(selectorOrNode, { click = null, scroll = true } = {}) {
  clearTarget();
  target = typeof selectorOrNode === "string" ? qs(selectorOrNode) : selectorOrNode;
  if (!target) return false;
  if (scroll) target.scrollIntoView({ behavior: "smooth", block: "center" });
  const cleanupPosition = watchPosition();
  let clickHandler = null;
  if (click) {
    clickHandler = (event) => {
      if (!active) return;
      click(event, target);
    };
    target.addEventListener("click", clickHandler, true);
  }
  targetCleanup = () => {
    cleanupPosition();
    if (clickHandler) target?.removeEventListener("click", clickHandler, true);
  };
  requestAnimationFrame(positionCard);
  return true;
}

async function waitForVisible(selector, timeout = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const node = qs(selector);
    if (isVisible(node)) return node;
    await sleep(80);
  }
  return null;
}

function setInputValue(input, value) {
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function typeValue(input, value, token) {
  if (!input) return;
  input.focus({ preventScroll: true });
  input.value = "";
  for (const char of String(value)) {
    if (!active || typingAbort !== token) return;
    input.value += char;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(25);
  }
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function prefillDemoForm() {
  const token = ++typingAbort;
  const card = qs(".gcTourCard", root);
  const live = qs(".gcTourLiveLine", card);
  const sequence = [
    ["#aiSubject", "Englisch", "Fach: Englisch"],
    ["#aiGrade", "5", "Klasse: 5"],
    ["#aiTopic", "Colours & school things", "Thema: Farben und Schulsachen"],
    ["#aiCount", "6", "6 abwechslungsreiche Aufgaben"],
    ["#aiPoints", "12", "12 Punkte insgesamt"],
    ["#aiCustomNotes", "Kurze, klare Aufgaben. Wortschatz: Farben und Schulsachen. Abwechslungsreiche Aufgabentypen.", "Klare Vorgaben für den Entwurf"]
  ];
  setInputValue(qs("#aiImageQuestionCount"), "0");
  for (const [selector, value, label] of sequence) {
    if (!active || typingAbort !== token) return;
    if (live) live.textContent = label;
    const input = qs(selector);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(180);
    await typeValue(input, value, token);
    await sleep(180);
  }
  if (!active || typingAbort !== token) return;
  if (live) live.innerHTML = "<strong>Fertig.</strong> Der Elefant hat die Eckdaten im Kopf – jetzt entsteht unser Beispieltest.";
  const next = qs(".gcTourNext", card);
  if (next) {
    next.disabled = false;
    next.textContent = "Beispieltest übernehmen";
  }
}

async function importDemoTest() {
  if (importStarted) return;
  importStarted = true;
  clearTarget();
  renderCard({
    role: "create",
    eyebrow: "Der Elefant baut den Entwurf",
    title: "Sechs Aufgaben werden vorbereitet",
    text: "Für die Tour verwenden wir einen vorbereiteten Test. So entstehen keine KI-Kosten und jeder sieht denselben Ablauf.",
    body: '<div class="gcTourWorking"><span></span><span></span><span></span><small>Colours · school things · verschiedene Aufgabentypen</small></div>',
    primary: "",
    secondary: "",
    centered: true
  });
  const input = qs("#aiJsonInput");
  const button = qs("#importJsonBtn");
  if (!input || !button) {
    importStarted = false;
    return failTour("Der Beispieltest konnte nicht vorbereitet werden. Bitte die Seite neu laden.");
  }
  input.value = JSON.stringify(DEMO_TEST);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  button.click();
  const editor = await waitForVisible("#editorView", 10000);
  importStarted = false;
  if (!editor) return failTour("Der Beispieltest konnte nicht geöffnet werden. Bitte die Tour neu starten.");
  await sleep(350);
  showEditorOverview();
}

function failTour(message) {
  clearTarget();
  renderCard({ role: "guide", eyebrow: "Tour pausiert", title: "Das hat noch nicht geklappt", text: message, primary: "Zur Übersicht", secondary: "", centered: true, onPrimary: () => finishTour({ done: false }) });
}

function intro() {
  stage = "intro";
  clearTarget();
  renderCard({
    role: "guide",
    eyebrow: "Willkommen bei GradeCrew",
    title: "Du bist ab jetzt Teil der Crew.",
    text: "Ich bin dein Pinguin-Guide. Ich zeige dir nicht nur Menüs – wir bauen zusammen einen kleinen Test und gehen den kompletten Weg bis zur Durchführung durch.",
    body: '<div class="gcTourPromise"><strong>Kein trockener Rundgang.</strong><span>Du klickst, siehst echte Ansichten und probierst die wichtigsten Werkzeuge selbst aus.</span></div>',
    primary: "Meine Crew kennenlernen",
    secondary: "Später",
    centered: true,
    onPrimary: introduceCrew
  });
}

function introduceCrew() {
  stage = "crew";
  clearTarget();
  renderCard({
    role: "guide",
    eyebrow: "Vier Rollen · ein Ablauf",
    title: "Ich stelle dir meine Kollegen vor.",
    text: "Der Elefant denkt den ersten Entwurf vor, der Fuchs macht gute Aufgaben besser und die Eule schaut am Ende besonders genau hin. Ich bleibe die ganze Zeit an deiner Seite.",
    body: `${crewHtml()}<div class="gcTourQuote">Großer Kopf, viel Platz zum Denken: Unser Elefant übernimmt das Erstellen.</div>`,
    primary: "Gemeinsam loslegen",
    centered: true,
    onPrimary: showNewTestStep
  });
}

async function showNewTestStep() {
  stage = "new";
  let dashboard = await waitForVisible("#dashboardView", 4000);
  if (!dashboard) {
    qs("#brandBtn")?.click();
    dashboard = await waitForVisible("#dashboardView", 4000);
  }
  const newButton = qs("#newQuizBtn") || qs("#emptyNewQuizBtn");
  if (!newButton) return failTour("Ich finde den Einstieg für einen neuen Test gerade nicht.");
  renderCard({ role: "guide", eyebrow: "1 · Start", title: "Alles beginnt mit einem neuen Test.", text: "Klicke auf den markierten Button. Diesmal darfst du wirklich klicken – der Bereich bleibt frei bedienbar.", primary: "", secondary: "Später" });
  spotlight(newButton, { click: () => setTimeout(showAiChoiceStep, 120) });
}

async function showAiChoiceStep() {
  stage = "choice";
  clearTarget();
  const createView = await waitForVisible("#createView", 4000);
  if (!createView) return failTour("Die Auswahl für einen neuen Test wurde nicht geöffnet.");
  polishCreateChoice();
  const ai = qs("#createAiBtn");
  renderCard({
    role: "create",
    eyebrow: "2 · Erstellen",
    title: "Hier übernimmt der Elefant.",
    text: "Für die meisten Tests ist „Mit KI erstellen“ der schnellste Start. Du gibst die Richtung vor, GradeCrew baut den Entwurf – und du entscheidest danach über jede Aufgabe.",
    body: '<div class="gcTourQuote">Natürlich kannst du auch komplett manuell starten. Der Elefant findet nur: Dein Nachmittag kann spannendere Aufgaben haben.</div>',
    primary: "",
    secondary: "Später"
  });
  spotlight(ai, { click: () => setTimeout(showElephantFormStep, 140) });
}

async function showElephantFormStep() {
  stage = "form";
  clearTarget();
  const aiView = await waitForVisible("#aiView", 4000);
  if (!aiView) return failTour("Die KI-Erstellung wurde nicht geöffnet.");
  const formCard = qs("#aiView .aiGrid > .card");
  renderCard({
    role: "create",
    eyebrow: "3 · Der erste Entwurf",
    title: "Sag mir kurz, was du brauchst.",
    text: "Für unsere Tour nehme ich Englisch in Klasse 5. Schau zu: Die Eckdaten schreiben sich jetzt Schritt für Schritt in das echte Formular.",
    body: '<div class="gcTourLiveLine">Ich fange mit dem Fach an …</div><small class="gcTourFinePrint">Die Tour nutzt danach einen vorbereiteten Demo-Test. Es wird keine kostenpflichtige KI-Erstellung ausgelöst.</small>',
    primary: "Wird vorbereitet …",
    secondary: "Später"
  });
  const next = qs(".gcTourNext", root);
  if (next) {
    next.disabled = true;
    next.addEventListener("click", importDemoTest, { once: true });
  }
  spotlight(formCard, { scroll: false });
  prefillDemoForm();
}

function showEditorOverview() {
  stage = "editor";
  clearTarget();
  renderCard({
    role: "guide",
    eyebrow: "4 · Dein Arbeitsplatz",
    title: "Der Entwurf gehört jetzt dir.",
    text: "Links springst du zwischen den Aufgaben. Oben findest du Schüleransicht, Speichern und Veröffentlichen. Nichts geht an deine Klasse, bevor du es freigibst.",
    body: '<div class="gcTourChecklist"><span>6 Aufgaben</span><span>12 Punkte</span><span>Entwurf</span></div>',
    primary: "Aufgaben prüfen",
    secondary: "Tour beenden",
    onPrimary: showFeedbackStep
  });
  spotlight(qs("#editorView .editorLayout"), { scroll: false });
}

function demoQuestionCards() {
  return qsa("#questionList .questionCard");
}

function showFeedbackStep() {
  stage = "feedback";
  clearTarget();
  const first = demoQuestionCards()[0];
  const good = qs(".aiFeedbackGood", first);
  if (!good) return showFoxIntro();
  renderCard({
    role: "grade",
    eyebrow: "5 · Qualität lernen",
    title: "Die Eule sammelt dein Urteil.",
    text: "Ist eine KI-Aufgabe gut, sag es kurz. So versteht GradeCrew, welche Aufgaben funktionieren. Klicke jetzt auf den grünen Smiley.",
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(good, { click: (event, button) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    button.classList.add("aiFeedbackSelected");
    button.setAttribute("aria-pressed", "true");
    setTimeout(showFoxIntro, 220);
  }});
}

function showFoxIntro() {
  stage = "fox";
  clearTarget();
  const cards = demoQuestionCards();
  const card = cards[3] || cards[0];
  const edit = qs(".aiEditQuestion", card);
  if (!edit) return showVariantStep();
  renderCard({
    role: "improve",
    eyebrow: "6 · Verbessern",
    title: "Jetzt kommt der Fuchs.",
    text: "Eine Aufgabe ist fachlich okay, aber noch etwas trocken? „KI bearbeiten“ ist für gezielten Feinschliff gedacht. In der Tour simulieren wir das ohne KI-Kosten.",
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(edit, { click: (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const textarea = qs(".qText", card);
    setInputValue(textarea, "True or false: You can use a ruler to measure the length of your pencil.");
    card.classList.add("gcTourChangedQuestion");
    setTimeout(showVariantStep, 360);
  }});
}

function showVariantStep() {
  stage = "variant";
  clearTarget();
  const card = demoQuestionCards()[0];
  const variant = qs(".aiVariantQuestion", card);
  if (!variant) return showSettingsStep();
  renderCard({
    role: "improve",
    eyebrow: "7 · Varianten",
    title: "Gute Idee – neuer Inhalt.",
    text: "Mit „Variante hinzufügen“ erzeugst du eine gleichwertige neue Aufgabe. Probier es aus. Für die Tour baut der Fuchs eine vorbereitete Variante, ohne einen KI-Aufruf zu starten.",
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(variant, { click: async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const before = demoQuestionCards().length;
    const duplicate = qs(".duplicateQuestion", card);
    duplicate?.click();
    for (let i = 0; i < 20 && demoQuestionCards().length <= before; i += 1) await sleep(40);
    const cards = demoQuestionCards();
    const newCard = cards[Math.min(1, cards.length - 1)];
    if (newCard && newCard !== card) {
      setInputValue(qs(".qText", newCard), "Which word means „grün“?");
      const optionInputs = qsa('.optionRow input[type="text"]', newCard);
      ["green", "red", "yellow", "blue"].forEach((value, index) => setInputValue(optionInputs[index], value));
      newCard.classList.add("gcTourChangedQuestion");
    }
    setTimeout(showSettingsStep, 420);
  }});
}

function showSettingsStep() {
  stage = "settings";
  clearTarget();
  const settings = qs("#editorView .editorSettingsDisclosure");
  if (settings) settings.open = true;
  renderCard({
    role: "guide",
    eyebrow: "8 · Durchführung festlegen",
    title: "Der Inhalt ist nur die halbe Arbeit.",
    text: "Hier legst du Notenschlüssel, Ergebnisanzeige, Zeitlimit und gemischte Reihenfolgen fest. Das sind echte Einstellungen des Tests – ändere sie später so, wie es zu deiner Klasse passt.",
    body: '<div class="gcTourChecklist"><span>Zeitlimit</span><span>Lösungen</span><span>Mischen</span><span>Notenschlüssel</span></div>',
    primary: "Schüleransicht ansehen",
    secondary: "Tour beenden",
    onPrimary: showPreviewStep
  });
  spotlight(settings, { scroll: true });
}

function showPreviewStep() {
  stage = "preview";
  clearTarget();
  const preview = qs("#previewBtn");
  renderCard({
    role: "guide",
    eyebrow: "9 · Perspektive wechseln",
    title: "Schau immer einmal durch Schüleraugen.",
    text: "Klicke auf „Schüleransicht“. GradeCrew öffnet den Test in einem neuen Tab. Schau kurz hinein und komm danach zu diesem Tab zurück.",
    body: '<small class="gcTourFinePrint">Der Beispieltest wird dabei gespeichert. Er bleibt als Demo in „Meine Tests“, damit du später weiterprobieren kannst.</small>',
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(preview, { click: () => {
    setTimeout(() => {
      clearTarget();
      renderCard({
        role: "guide",
        eyebrow: "Schüleransicht",
        title: "So sieht deine Klasse den Test.",
        text: "Im neuen Tab kannst du Antworten ausprobieren. Zurück hier machen wir den Test bereit für die Klasse.",
        primary: "Weiter zur Veröffentlichung",
        secondary: "Tour beenden",
        centered: true,
        onPrimary: showPublishStep
      });
    }, 500);
  }});
}

function showPublishStep() {
  stage = "publish";
  clearTarget();
  const publish = qs("#publishBtn");
  renderCard({
    role: "grade",
    eyebrow: "10 · Freigeben",
    title: "Die Eule macht den letzten Check.",
    text: "Erst wenn du zufrieden bist, veröffentlichst du. Dann entstehen Testcode, Link und QR-Code. Klicke auf „Veröffentlichen“.",
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(publish, { click: () => setTimeout(showLiveStep, 350) });
}

async function showLiveStep() {
  stage = "live";
  clearTarget();
  const publishView = await waitForVisible("#publishView", 8000);
  if (!publishView) return failTour("Die Veröffentlichungsansicht wurde nicht geöffnet. Prüfe bitte, ob der Demo-Test gespeichert werden konnte.");
  renderCard({
    role: "grade",
    eyebrow: "11 · Live im Unterricht",
    title: "Code, QR und Live-Status an einem Ort.",
    text: "Hier gibst du den Zugang an deine Klasse weiter. Während der Durchführung siehst du, wie viele beigetreten sind, abgegeben haben und – bei Zeitlimit – wie viel Zeit bleibt.",
    body: '<div class="gcTourChecklist"><span>Testcode</span><span>QR-Code</span><span>Beigetreten</span><span>Abgegeben</span></div>',
    primary: "Ergebnisse kennenlernen",
    secondary: "Tour beenden",
    onPrimary: showResultsStep
  });
  spotlight(qs("#publishView .publishCard"), { scroll: false });
}

function showResultsStep() {
  stage = "results";
  clearTarget();
  const button = qs("#liveResultsBtn");
  if (!button) return showResultsExample();
  renderCard({
    role: "grade",
    eyebrow: "12 · Ergebnisse",
    title: "Nach der Abgabe übernimmt die Eule.",
    text: "Klicke auf „Ergebnisse ansehen“. In unserer Demo gibt es noch keine echten Schülerabgaben – ich zeige dir gleich trotzdem, was dort passiert.",
    primary: "",
    secondary: "Tour beenden"
  });
  spotlight(button, { click: () => setTimeout(showResultsExample, 300) });
}

async function showResultsExample() {
  stage = "results-example";
  clearTarget();
  await waitForVisible("#resultsView", 4000);
  renderCard({
    role: "grade",
    eyebrow: "13 · Auswerten & nachprüfen",
    title: "Automatisch, wo es eindeutig ist. Du entscheidest beim Rest.",
    text: "Geschlossene Aufgaben werden automatisch ausgewertet. Freitext oder markierte Fälle kannst du nachprüfen und Punkte anpassen.",
    body: `<div class="gcTourResultExample" aria-label="Beispiel für Ergebnisse"><div><strong>Beispiel A</strong><span>10 / 12 P.</span><b>✓ bewertet</b></div><div><strong>Beispiel B</strong><span>8 / 12 P.</span><b class="review">1 Antwort prüfen</b></div></div><small class="gcTourFinePrint">Diese zwei Zeilen sind nur eine Tutorial-Vorschau und keine echten Schülerdaten.</small>`,
    primary: "Tour abschließen",
    secondary: "",
    centered: true,
    onPrimary: finishScene
  });
}

function finishScene() {
  stage = "finish";
  clearTarget();
  renderCard({
    role: "guide",
    eyebrow: "Willkommen in der Crew",
    title: "Du kennst jetzt den kompletten Weg.",
    text: "Elefant erstellt, Fuchs verbessert, Eule prüft – und du triffst die Entscheidungen. Der Demo-Test bleibt in deiner Übersicht, damit du ohne Risiko weiterklicken kannst.",
    body: `${crewHtml()}<div class="gcTourFinalFlow"><span>Erstellen</span><b>→</b><span>Verbessern</span><b>→</b><span>Prüfen</span><b>→</b><span>Durchführen</span></div>`,
    primary: "Zurück zu meinen Tests",
    secondary: "",
    centered: true,
    onPrimary: () => finishTour({ done: true, dashboard: true })
  });
}

function finishTour({ done = false, dashboard = false } = {}) {
  active = false;
  typingAbort += 1;
  clearTarget();
  if (done) {
    try { localStorage.setItem(TOUR_DONE_KEY, "done"); } catch (_) {}
  }
  root?.classList.add("hidden");
  document.body.classList.remove("gcTourActive");
  if (dashboard) {
    const backResults = qs("#backFromResults");
    const backPublish = qs("#backFromPublish");
    if (isVisible(backResults)) backResults.click();
    else if (isVisible(backPublish)) backPublish.click();
    else qs("#brandBtn")?.click();
  }
}

function startTour({ restart = false } = {}) {
  if (active) return;
  active = true;
  importStarted = false;
  document.body.classList.add("gcTourActive");
  suppressLegacyGuides();
  if (restart) {
    try { localStorage.removeItem(TOUR_DONE_KEY); } catch (_) {}
  }
  intro();
}

function shouldAutoStart() {
  if (TOUR_FORCE) return true;
  try { if (localStorage.getItem(TOUR_DONE_KEY) === "done") return false; } catch (_) {}
  const dashboard = qs("#dashboardView");
  if (!isVisible(dashboard)) return false;
  const empty = qs("#emptyQuizState");
  return isVisible(empty);
}

function maintainUi() {
  replaceFalconWithElephant();
  polishCreateChoice();
  installRestartButton();
  suppressLegacyGuides();
  if (!active && shouldAutoStart()) {
    setTimeout(() => {
      if (!active && shouldAutoStart()) startTour();
    }, 700);
  }
}

function start() {
  ensureStyles();
  document.body.classList.add("gradecrewCrewTourReady");
  maintainUi();
  observer = new MutationObserver(() => maintainUi());
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "open"] });
  if (TOUR_FORCE) setTimeout(() => {
    if (!active && isVisible(qs("#dashboardView"))) startTour({ restart: true });
  }, 900);
}

if (document.body) start();
else addEventListener("DOMContentLoaded", start, { once: true });

export { startTour, DEMO_TEST, CREW };
