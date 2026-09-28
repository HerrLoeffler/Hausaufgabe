// GradeCrew mandatory guided onboarding.
// The real product UI is used with deterministic tutorial data so the journey is
// reliable, costs no provider request and can still demonstrate the real workflow.
export const TOUR_VERSION = "gradecrew-live-tour-v7";

export const CREW = Object.freeze({
  guide: { name: "Coco", animal: "Pinguin", role: "Dein Guide", asset: "penguin-guide", intro: "Ich begleite dich Schritt für Schritt." },
  create: { name: "Remy", animal: "Elefant", role: "Erstellen", asset: "elephant-create", intro: "Ich erstelle den ersten Entwurf mit dir." },
  improve: { name: "Emmi", animal: "Fuchs", role: "Überarbeiten", asset: "fox-improve", intro: "Ich helfe dir beim Überarbeiten und bei Varianten." },
  grade: { name: "Wilma", animal: "Eule", role: "Bewerten", asset: "owl-grade", intro: "Ich zeige dir später das Prüfen und Bewerten." }
});

const single = (text, choices, answer, image = "") => ({
  type: "single", text, points: 1,
  options: choices.map((label, index) => ({ text: label, correct: index === answer })),
  ...(image ? {
    imageUrl: `/assets/gradecrew/demo-${image}.svg`,
    imageAlt: ({ backpack: "Ein blauer Schulrucksack.", pencil: "Ein roter Bleistift aus Holz.", books: "Drei Bücher nebeneinander." })[image]
  } : {})
});

export const DEMO_TEST = Object.freeze({
  title: "Übung · Meine erste GradeCrew-Reise",
  subject: "Englisch",
  grade: "4",
  timeLimitMinutes: 1,
  description: "Dein Probetest: 10 kurze Aufgaben, 1 Minute. Hier geht es ums Ausprobieren – nicht um eine echte Schulnote.",
  questions: [
    single("What colour is the schoolbag?", ["red", "blue", "green"], 1, "backpack"),
    single("What can you see?", ["a ruler", "a pencil", "a chair"], 1, "pencil"),
    single("How many books can you see?", ["two", "four", "three"], 2, "books"),
    // Deliberately German so Emmi can demonstrate a meaningful AI rewrite.
    single("Was heißt „Hund“ auf Englisch?", ["cat", "dog", "bird"], 1),
    { type: "truefalse", text: "Decide whether this is correct: „Red“ means „rot“.", points: 1, correctBoolean: true },
    // A DIFFERENT task is used for the variant demonstration.
    single("Choose the English word for „Vogel“.", ["bird", "cat", "dog"], 0),
    { type: "gapfill", text: "Complete the colour word: gr[ee]n.", points: 1 },
    { type: "ordering", text: "Put the colours in this order: red, yellow, green.", points: 1, items: ["red", "yellow", "green"], manualReview: false },
    // Deliberately wrong answer key so the quality-first lesson is concrete.
    single("Which English word means the German colour „gelb“?", ["yellow", "blue", "red"], 1),
    { type: "text", text: "Write one colour in English.", points: 1,
      acceptedAnswers: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown", "grey", "gray"], manualReview: true }
  ]
});
DEMO_TEST.questions[8].options.forEach((option, index) => { option.correct = index === 1; });

export function preparedResponse(_q, { variant = false } = {}) {
  if (variant) {
    const question = single("Look at the picture. Which animal can you see?", ["dog", "bird", "cat"], 2);
    return {
      // The tutorial shows a real image workflow but uses a fixed local asset.
      // mediaIntent stays none so no paid image request can happen during onboarding.
      question: { ...question, mediaIntent: { kind: "none" }, tutorialImageUrl: "/assets/gradecrew/demo-cat.svg" },
      meta: { model: "prepared-tutorial", promptVersion: TOUR_VERSION }
    };
  }
  const question = single("Choose the English word for „Hund“.", ["cat", "dog", "bird"], 1);
  return { question: { ...question, mediaIntent: { kind: "none" } }, meta: { model: "prepared-tutorial", promptVersion: TOUR_VERSION } };
}

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function installCrewTour(api) {
  let active = false;
  let stage = "";
  let owner = "";
  let quizId = "";
  let editSourceId = "";
  let variantSourceId = "";
  let variantQuestionId = "";
  let faultyId = "";
  let submissionId = "";
  let root = null;
  let target = null;
  let targetInteractive = false;
  let freeRegion = null;
  let targetCleanup = null;
  let timer = 0;
  let frame = 0;
  let run = 0;
  let busy = false;
  const offered = new Set();

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const doneKey = () => `${TOUR_VERSION}:${owner}`;
  const owned = () => active && owner === api.uid();
  const image = (role, size = 96) => `<img src="/assets/gradecrew/${CREW[role].asset}.svg" alt="" width="${size}" height="${size}">`;

  function clearTarget() {
    if (targetCleanup) targetCleanup();
    targetCleanup = null;
    target?.classList.remove("gcTourTarget", "gcTourDeleteTarget");
    target = null;
    targetInteractive = false;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function clearWarnings() {
    $$(".gcTourQualityFlag").forEach(node => node.classList.remove("gcTourQualityFlag"));
  }

  function hideCoach() {
    clearTimeout(timer);
    timer = 0;
    clearTarget();
    root?.remove();
    root = null;
    document.body.classList.remove("gcCoachVisible");
  }

  function stop({ done = false } = {}) {
    ++run;
    active = false;
    busy = false;
    freeRegion = null;
    hideCoach();
    clearWarnings();
    document.querySelectorAll(".gcTourInlineHint, .gcTourVariantMentor").forEach(node => node.remove());
    document.body.classList.remove("gcRealTourActive", "gcTourAnswering");
    document.documentElement.classList.remove("gcTourScrollLocked");
    if (done) {
      try { localStorage.setItem(doneKey(), "done"); } catch {}
    }
  }

  function isAllowedNode(node) {
    if (!(node instanceof Node)) return false;
    if (root?.contains(node)) return true;
    if (targetInteractive && target?.contains(node)) return true;
    if (freeRegion?.contains?.(node)) return true;
    return false;
  }

  function nudgeCoach() {
    if (!root) return;
    root.classList.remove("gcCoachNudge");
    void root.offsetWidth;
    root.classList.add("gcCoachNudge");
    setTimeout(() => root?.classList.remove("gcCoachNudge"), 350);
  }

  function blockOutsideTour(event) {
    if (!owned() || !event.isTrusted) return;
    // A whitelisted submit button must be allowed to submit its own form.
    if (event.type === "submit" && targetInteractive && target?.form === event.target) return;
    if (isAllowedNode(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    nudgeCoach();
  }

  function blockKeyboard(event) {
    if (!owned() || !event.isTrusted) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isAllowedNode(event.target)) return;
    if (["Tab", "Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Backspace", "Delete", "Escape"].includes(event.key) || event.key.length === 1) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      nudgeCoach();
      root?.querySelector(".gcCoachNext, input, button")?.focus?.({ preventScroll: true });
    }
  }

  ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "dblclick", "contextmenu", "submit"].forEach(type => document.addEventListener(type, blockOutsideTour, true));
  ["touchstart", "touchmove", "wheel"].forEach(type => document.addEventListener(type, blockOutsideTour, { capture: true, passive: false }));
  document.addEventListener("keydown", blockKeyboard, true);

  function place() {
    frame = 0;
    if (!root?.isConnected) return;
    const rect = root.getBoundingClientRect();
    const margin = 18;
    if (root.classList.contains("gcCoachCentered") || !target?.isConnected) {
      root.style.left = `${Math.max(margin, Math.round((innerWidth - rect.width) / 2))}px`;
      root.style.top = `${Math.max(64, Math.round(Math.min(innerHeight * .12, innerHeight - rect.height - margin)))}px`;
      return;
    }
    const t = target.getBoundingClientRect();
    const gap = 22;
    const candidates = [
      { left: t.right + gap, top: t.top + (t.height - rect.height) / 2 },
      { left: t.left - rect.width - gap, top: t.top + (t.height - rect.height) / 2 },
      { left: t.left + (t.width - rect.width) / 2, top: t.bottom + gap },
      { left: t.left + (t.width - rect.width) / 2, top: t.top - rect.height - gap }
    ];
    const fits = c => c.left >= margin && c.top >= margin && c.left + rect.width <= innerWidth - margin && c.top + rect.height <= innerHeight - margin;
    const chosen = candidates.find(fits) || candidates[2];
    root.style.left = `${Math.round(Math.max(margin, Math.min(chosen.left, innerWidth - rect.width - margin)))}px`;
    root.style.top = `${Math.round(Math.max(margin, Math.min(chosen.top, innerHeight - rect.height - margin)))}px`;
  }

  function schedulePlace() { if (!frame) frame = requestAnimationFrame(place); }

  function setTarget(selectorOrNode, { interactive = false, onClick = null, deleteTarget = false, scroll = true } = {}) {
    clearTarget();
    target = typeof selectorOrNode === "string" ? $(selectorOrNode) : selectorOrNode;
    targetInteractive = Boolean(target && interactive);
    if (!target) { schedulePlace(); return null; }
    target.classList.add("gcTourTarget");
    if (deleteTarget) target.classList.add("gcTourDeleteTarget");
    for (let parent = target.parentElement; parent; parent = parent.parentElement) if (parent.tagName === "DETAILS") parent.open = true;
    // Only the tour may reposition the page. Manual wheel/touch/keyboard scrolling is blocked.
    if (scroll) queueMicrotask(() => target?.isConnected && target.scrollIntoView({ block: "center", behavior: "instant" }));
    const move = () => schedulePlace();
    addEventListener("resize", move, { passive: true });
    addEventListener("scroll", move, { passive: true, capture: true });
    let clickHandler = null;
    if (onClick) {
      clickHandler = event => { if (owned()) setTimeout(() => onClick(event), 0); };
      target.addEventListener("click", clickHandler, { once: true });
    }
    targetCleanup = () => {
      removeEventListener("resize", move);
      removeEventListener("scroll", move, true);
      if (clickHandler) target?.removeEventListener("click", clickHandler);
    };
    schedulePlace();
    return target;
  }

  async function waitForElement(selector, timeout = 5000) {
    const start = performance.now();
    while (owned() && performance.now() - start < timeout) {
      const node = $(selector);
      if (node?.isConnected) return node;
      await sleep(80);
    }
    return null;
  }

  function coach(role, title, text, { target: selector = null, button = "", onButton = null, interactiveTarget = false, onTargetClick = null, centered = false, body = "", deleteTarget = false, className = "" } = {}) {
    hideCoach();
    if (!owned()) return null;
    root = document.createElement("aside");
    root.className = `gcRealCoach${centered ? " gcCoachCentered" : ""}${className ? ` ${className}` : ""}`;
    root.setAttribute("aria-label", `${CREW[role].name} begleitet dich`);
    root.setAttribute("aria-live", "polite");
    root.innerHTML = `<div class="gcCoachIdentity">${image(role)}<div><span>${escapeHtml(CREW[role].name)} · ${escapeHtml(CREW[role].role)}</span><h2>${escapeHtml(title)}</h2></div></div><p>${escapeHtml(text)}</p>${body}${button ? `<button type="button" class="button primary gcCoachNext">${escapeHtml(button)}</button>` : ""}<small>Nur der markierte Schritt ist während der Tour bedienbar.</small>`;
    if (button && onButton) root.querySelector(".gcCoachNext").addEventListener("click", () => { if (!busy) onButton(); });
    document.body.classList.add("gcCoachVisible");
    document.body.append(root);
    if (selector) setTarget(selector, { interactive: interactiveTarget, onClick: onTargetClick, deleteTarget });
    else schedulePlace();
    return root;
  }

  function handoff(fromRole, toRole, title, text, next, buttonLabel = `${CREW[toRole].name} übernimmt`) {
    hideCoach();
    if (!owned()) return;
    root = document.createElement("aside");
    root.className = "gcRealCoach gcCoachCentered gcCoachHandoff";
    const faces = `<div>${image(fromRole,108)}<strong>${escapeHtml(CREW[fromRole].name)}</strong></div><span>→</span><div>${image(toRole,108)}<strong>${escapeHtml(CREW[toRole].name)}</strong></div>`;
    root.innerHTML = `<div class="gcHandoffFaces">${faces}</div><span class="eyebrow">Die Crew arbeitet zusammen</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><button type="button" class="button primary gcCoachNext">${escapeHtml(buttonLabel)}</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click", next);
    document.body.classList.add("gcCoachVisible");
    document.body.append(root);
    schedulePlace();
  }

  function crewIntro() {
    const cards = Object.entries(CREW).map(([role, member]) => `<div class="gcCrewIntroMember">${image(role, role === "guide" ? 104 : 94)}<strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.role)}</span><small>${escapeHtml(member.intro)}</small></div>`).join("");
    coach("guide", "Willkommen bei GradeCrew.", "Mit GradeCrew erstellst und verbesserst du digitale Tests und Übungen. Ich bin Coco und begleite dich durch deine erste GradeCrew-Reise.", {
      centered: true,
      className: "gcCrewIntroCoach",
      body: `<p class="gcCrewIntroLead">Bevor wir loslegen: Das ist deine Crew.</p><div class="gcCrewIntroGrid">${cards}</div>`,
      button: "Mit der Crew starten",
      onButton: () => {
        stage = "new";
        coach("guide", "Wir starten deinen ersten Test.", "Klicke auf „+ Neuer Test“. Alles andere bleibt während dieses Schritts gesperrt.", { target: "#newQuizBtn", interactiveTarget: true });
      }
    });
  }

  function error(message, retry) {
    coach("guide", "Hier hat es noch nicht geklappt.", message, { button: "Erneut versuchen", onButton: retry, centered: true });
  }

  function suppressLegacyGuides() {
    document.getElementById("firstAiGuideBackdrop")?.classList.add("hidden");
    document.getElementById("firstAiGuideCard")?.classList.add("hidden");
    document.querySelectorAll(".firstAiGuideSpotlight").forEach(node => node.classList.remove("firstAiGuideSpotlight"));
    for (const id of ["teacherTourDialog", "announcementDialog"]) {
      const legacy = document.getElementById(id);
      if (legacy?.open) try { legacy.close(); } catch {}
    }
  }

  function start() {
    if (active || !api.uid() || !api.isDashboard()) return;
    suppressLegacyGuides();
    api.beginRun();
    owner = api.uid(); quizId = ""; editSourceId = ""; variantSourceId = ""; variantQuestionId = ""; faultyId = ""; submissionId = ""; freeRegion = null;
    active = true; busy = false; stage = "intro"; ++run;
    document.body.classList.add("gcRealTourActive");
    document.documentElement.classList.add("gcTourScrollLocked");
    crewIntro();
  }

  async function typeField(selector, value, label, token, delay = 16) {
    const input = $(selector);
    if (!input || !owned() || token !== run) return;
    setTarget(input, { interactive: false });
    const status = root?.querySelector(".gcCoachStatus");
    if (status) status.textContent = label;
    input.classList.add("gcTourTyping");
    if (input.tagName === "SELECT" || input.type === "number") {
      input.value = value; input.dispatchEvent(new Event("input",{bubbles:true})); input.dispatchEvent(new Event("change",{bubbles:true})); await sleep(280);
    } else {
      input.value = ""; input.dispatchEvent(new Event("input",{bubbles:true}));
      for (const char of String(value)) { if (!owned() || token !== run) return; input.value += char; input.dispatchEvent(new Event("input",{bubbles:true})); await sleep(delay); }
      input.dispatchEvent(new Event("change",{bubbles:true})); await sleep(240);
    }
    input.classList.remove("gcTourTyping");
  }

  async function ghostFillNotes(token = run) {
    if (!owned() || token !== run) return;
    busy = true; stage = "form-filling";
    coach("create", "Sag mir, was dir wichtig ist.", "Unter „Eigene Wünsche“ kannst du Niveau, Sprache, Schwerpunkt oder besondere Anforderungen genauer vorgeben.", { target: "#aiCustomNotes", body: '<div class="gcCoachStatus">Eigene Wünsche werden ergänzt …</div>' });
    await typeField("#aiCustomNotes", "Kurze, klare Aufgaben für die 4. Klasse Grundschule. Einfache Farben, Tiere und Schulsachen. Alle Arbeitsaufträge auf Englisch. Abwechslungsreiche Aufgabentypen.", "Eigene Wünsche werden ergänzt …", token, 13);
    if (!owned() || token !== run) return;
    busy = false; stage = "form";
    coach("create", "Perfekt – alle nötigen Informationen sind eingetragen.", "Klicke jetzt auf „Test erstellen“. Ich erstelle den ersten Entwurf und prüfe ihn anschließend.", { target: "#generateAiTestBtn", interactiveTarget: true });
  }

  async function ghostFillForm() {
    if (!owned()) return;
    const token = run; busy = true; stage = "form-filling";
    coach("create", "Wir bauen einen Test für Klasse 4.", "Ich trage die wichtigsten Angaben Schritt für Schritt in das echte Formular ein.", { target: "#aiSubject", body: '<div class="gcCoachStatus">Fach auswählen …</div>' });
    const sequence = [
      ["#aiSubject","Englisch","Fach: Englisch"],["#aiGrade","4","Klasse: 4"],["#aiSchoolType","Grundschule","Schulart: Grundschule"],["#aiRegion","Bayern","Bundesland: Bayern"],
      ["#aiTopic","Colours, animals & school things","Thema: Colours, animals & school things"],["#aiCount","10","10 Aufgaben"],["#aiPoints","10","10 Punkte"],["#aiImageQuestionCount","3","3 Aufgaben mit Bild"]
    ];
    for (const step of sequence) { await typeField(...step, token); if (!owned() || token !== run) return; }
    busy = false; stage = "image-choice";
    coach("create", "Bilder plane ich direkt mit ein.", "Für diesen Test wählen wir drei Bildaufgaben. Später kannst du auch eigene PDFs, Fotos, Arbeitsblätter oder Texte hochladen, damit GradeCrew den Test noch genauer an dein Material anpasst.", { target: "#aiImageQuestionCount", button: "Eigene Wünsche ergänzen", onButton: () => ghostFillNotes(token) });
  }

  function markOutlineWarning(questionId, text) {
    const cards = $$("#questionList .questionCard");
    const index = cards.findIndex(card => card.dataset.id === questionId);
    const outline = $$("#questionOutline .questionOutlineItem")[index];
    if (!outline) return null;
    outline.classList.add("gcTourQualityFlag"); outline.title = text; return outline;
  }
  function clearOutlineWarning(questionId) {
    const cards = $$("#questionList .questionCard");
    const index = cards.findIndex(card => card.dataset.id === questionId);
    $$("#questionOutline .questionOutlineItem")[index]?.classList.remove("gcTourQualityFlag");
  }
  function refreshWarnings({ includeEdit = true } = {}) {
    if (includeEdit && editSourceId) markOutlineWarning(editSourceId, "Arbeitsauftrag passt sprachlich nicht zum restlichen Test.");
    if (faultyId) markOutlineWarning(faultyId, "Die hinterlegte Lösung ist falsch.");
  }

  function thankRemy() {
    stage = "draft"; hideCoach(); if (!owned()) return;
    root = document.createElement("aside"); root.className = "gcRealCoach gcCoachCentered gcCoachThanks";
    root.innerHTML = `<div class="gcThanksFaces"><div>${image("guide",118)}<strong>Coco</strong></div><span>♡</span><div>${image("create",126)}<strong>Remy</strong></div></div><span class="eyebrow">Der erste Entwurf steht</span><h2>Danke, Remy!</h2><p>Zehn Aufgaben sind da – drei davon mit Bild. Jetzt schauen wir gemeinsam auf den Feinschliff.</p><button type="button" class="button primary gcCoachNext">Zum Feinschliff</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click", () => handoff("create","improve","Das ist Emmi!","Emmi schaut mit dir genauer hin. Sie hilft dir, Aufgaben zu verbessern und neue Varianten zu erstellen.",()=>coach("improve","Hallo, ich bin Emmi!","Wir prüfen deinen Entwurf, überarbeiten eine Aufgabe und probieren eine Bild-Variante aus.",{centered:true,button:"Gemeinsam prüfen",onButton:showOutlineGuide}),"Zu Emmi"));
    document.body.classList.add("gcCoachVisible"); document.body.append(root); schedulePlace();
  }

  function beginDraftReview() {
    stage = "draft";
    editSourceId = api.questionId(3);      // Aufgabe 4: Überarbeitung
    variantSourceId = api.questionId(5);   // Aufgabe 6: eigene, unabhängige Variante
    faultyId = api.questionId(8);          // Aufgabe 9: bewusst falsche Lösung
    refreshWarnings();
    thankRemy();
  }

  function showOutlineGuide() {
    stage = "outline"; refreshWarnings();
    const outline = $("#questionOutline") || $("#editorView .settingsCard");
    coach("improve", "KI spart Zeit – Qualität geht immer vor.", "GradeCrew prüft den Entwurf automatisch. Links sind zwei Hinweise markiert. Unser Ziel ist nicht nur schnell zu sein, sondern einen möglichst sauberen, direkt einsetzbaren Test zu bekommen.", {
      target: outline, button: "Ersten Hinweis öffnen",
      onButton: () => {
        const warning = markOutlineWarning(editSourceId, "Arbeitsauftrag passt sprachlich nicht zum restlichen Test.");
        stage = "outline-question";
        coach("improve", "Aufgabe 4 fällt auf.", "Fast alle Arbeitsaufträge sind auf Englisch. Nur diese ist noch auf Deutsch – wir lassen sie passend zum restlichen Test auf Englisch formulieren.", {
          target: warning, interactiveTarget: true, onTargetClick: () => { api.focusQuestion(editSourceId); showEditStep(); }
        });
      }
    });
  }

  function showEditStep() {
    stage = "edit"; api.focusQuestion(editSourceId);
    coach("improve", "Überarbeite genau diese Aufgabe.", "Öffne „Mit KI überarbeiten“. Ich trage danach unseren Änderungswunsch für dich ein.", { target: `#questionList .questionCard[data-id="${CSS.escape(editSourceId)}"] .aiEditQuestion`, interactiveTarget: true });
  }

  async function prepareEditPanel() {
    const panel = $(".questionAiPanel"); const input = panel?.querySelector("textarea"); const apply = panel?.querySelector(".aiApply");
    if (!panel || !input || !apply) return error("Das Überarbeitungsfeld wurde nicht gefunden.", showEditStep);
    const token = run; busy = true;
    coach("improve", "So gibst du der KI deinen Wunsch.", "Wir möchten nur die Sprache ändern. Schau zu – der Wunsch wird direkt eingetragen.", { target: input, body: '<div class="gcCoachStatus">Änderungswunsch wird eingetragen …</div>' });
    input.value = ""; input.dispatchEvent(new Event("input",{bubbles:true}));
    for (const char of "Formuliere den Arbeitsauftrag vollständig auf Englisch.") { if (!owned() || token !== run) return; input.value += char; input.dispatchEvent(new Event("input",{bubbles:true})); await sleep(20); }
    busy = false;
    coach("improve", "Alles bereit.", "Klicke auf „Überarbeitung erstellen“. Danach vergleichen wir die Aufgabe.", { target: apply, interactiveTarget: true });
  }

  function editPreviewHtml() {
    return `<div class="gcEditPreview"><div class="gcEditPreviewCard gcEditPreviewBefore"><span>Vorher</span><strong>Was heißt „Hund“ auf Englisch?</strong><div class="gcMiniOptions"><i>cat</i><i class="correct">dog ✓</i><i>bird</i></div></div><b class="gcEditArrow">→</b><div class="gcEditPreviewCard gcEditPreviewAfter"><span>Jetzt im Test</span><strong>Choose the English word for „Hund“.</strong><div class="gcMiniOptions"><i>cat</i><i class="correct">dog ✓</i><i>bird</i></div></div></div>`;
  }

  function celebrateEdit() {
    stage = "edit-success"; refreshWarnings({ includeEdit:false });
    coach("improve", "Die Überarbeitung hat geklappt.", "Die Aufgabe war grundsätzlich gut. Wir haben nur den Arbeitsauftrag passend zum restlichen Test auf Englisch geändert.", {
      centered:true, className:"gcEditSuccess", body:editPreviewHtml(), button:"Weiter", onButton:showVariantIntro
    });
  }

  function showVariantIntro() {
    stage = "variant-intro";
    api.focusQuestion(variantSourceId);
    coach("improve", "Die hier gefällt mir gut.", "Das ist Aufgabe 6 – eine andere Aufgabe als eben. Lass uns daraus zusätzlich eine Variante machen, damit du siehst, wie du aus einer guten Aufgabe schnell eine zweite Version erhältst.", {
      centered:true,
      className:"gcVariantIntro",
      body:'<div class="gcVariantSourcePreview"><span>Aufgabe 6</span><strong>Choose the English word for „Vogel“.</strong><small>bird ✓ · cat · dog</small></div>',
      button:"Variante erstellen",
      onButton:showVariantStep
    });
  }

  async function typeVariantInstruction(input, value, token) {
    input.value = ""; input.dispatchEvent(new Event("input",{bubbles:true})); input.classList.add("gcTourTyping");
    for (const char of value) { if (!owned() || token !== run) return; input.value += char; input.dispatchEvent(new Event("input",{bubbles:true})); await sleep(22); }
    input.dispatchEvent(new Event("change",{bubbles:true})); input.classList.remove("gcTourTyping");
  }

  async function prepareVariantDialog(dialog) {
    if (!owned() || stage !== "variant") return;
    stage = "variant-dialog"; hideCoach();
    if (!dialog?.open) return error("Das Variantenfenster wurde nicht gefunden.", showVariantStep);
    const token = run; busy = true; dialog.classList.add("gcTourVariantDialog");
    const close = dialog.querySelector(".variantRequestClose"); const cancel = dialog.querySelector(".variantRequestCancel");
    if (close) close.hidden = true; if (cancel) cancel.hidden = true;
    const form = dialog.querySelector("form"); const count = dialog.querySelector('[name="count"]'); const media = dialog.querySelector('[name="mediaKind"]'); const instruction = dialog.querySelector('[name="instruction"]'); const submit = dialog.querySelector('button[type="submit"]');
    if (!form || !count || !media || !instruction || !submit) { busy = false; return error("Das Variantenfenster ist unvollständig. Bitte versuche den Schritt erneut.", showVariantStep); }
    let mentor = dialog.querySelector(".gcTourVariantMentor");
    if (!mentor) {
      mentor = document.createElement("div"); mentor.className = "gcTourVariantMentor";
      mentor.innerHTML = `${image("improve",74)}<div><span>Emmi · Überarbeiten</span><strong>Wir bauen eine zweite Version.</strong><p>Aufgabe 6 bleibt erhalten. Zusätzlich kommt eine Katzen-Variante mit Bild dazu.</p><small>Ich fülle die Angaben für dich aus.</small></div>`;
      form.prepend(mentor);
    }
    count.value = "1"; count.dispatchEvent(new Event("change",{bubbles:true})); setTarget(count,{interactive:false,scroll:false}); await sleep(420);
    if (!owned() || token !== run) return;
    media.value = "ai_generated"; media.dispatchEvent(new Event("change",{bubbles:true})); setTarget(media,{interactive:false,scroll:false}); mentor.querySelector("small").textContent = "Diesmal nehmen wir direkt ein Bild dazu."; await sleep(520);
    if (!owned() || token !== run) return;
    setTarget(instruction,{interactive:false,scroll:false}); mentor.querySelector("small").textContent = "Jetzt kommt unser eigener Wunsch dazu …";
    await typeVariantInstruction(instruction, "Erstelle eine Variante mit dem Wort „Katze“ und ergänze ein passendes, freundliches Katzenbild.", token);
    if (!owned() || token !== run) return;
    mentor.querySelector("strong").textContent = "Alles vorbereitet."; mentor.querySelector("p").textContent = "1 Variante · mit Bild · Katze als neues Beispiel."; mentor.querySelector("small").textContent = "Klicke jetzt auf „Erstellen“.";
    busy = false; setTarget(submit,{interactive:true,scroll:false});
  }

  function showVariantStep() {
    stage = "variant"; api.focusQuestion(variantSourceId);
    coach("improve", "Jetzt erstellen wir die Variante.", "Aufgabe 6 bleibt unverändert. Klicke bei dieser Aufgabe auf „Variante hinzufügen“. Danach füllen wir gemeinsam das Variantenfenster aus.", { target:`#questionList .questionCard[data-id="${CSS.escape(variantSourceId)}"] .aiVariantQuestion`, interactiveTarget:true });
  }

  function variantSubmitted() {
    if (!owned() || stage !== "variant-dialog") return;
    busy = false; stage = "variant-wait"; document.querySelectorAll(".gcTourVariantMentor").forEach(node => node.remove());
    coach("improve", "Ich erstelle die Variante …", "Die ursprüngliche Aufgabe bleibt bestehen. Gleich kannst du die neue Katzen-Variante zusätzlich übernehmen.", { target:"#variantBackgroundProgress", body:'<div class="gcTourWorking"><span></span><span></span><span></span><small>1 Variante · Katze mit Bild · wird geprüft</small></div>' });
  }

  async function showVariantOutlineStep() {
    if (!owned()) return;
    const token = run; stage = "variant-outline";
    const card = await waitForElement(`#questionList .questionCard[data-id="${CSS.escape(variantQuestionId)}"]`);
    if (!owned() || token !== run) return;
    const position = Number(card?.dataset.index) + 1;
    const outline = await waitForElement(`#questionOutline [data-position="${position}"].variantReviewOutline`);
    if (!owned() || token !== run) return;
    if (!card || !outline) return error("Die neue Variante ist noch nicht vollständig sichtbar.", showVariantOutlineStep);
    coach("improve", "Eine neue Aufgabe ist da.", "Der grüne Eintrag links gehört zu deiner neuen Bildaufgabe. Klicke darauf, um sie im Test zu öffnen.", {
      target:outline, interactiveTarget:true, onTargetClick:()=>{api.focusQuestion(variantQuestionId);void showVariantReviewStep();}
    });
  }

  async function showVariantReviewStep() {
    if (!owned()) return;
    stage = "variant-review-wait";
    const token = run;
    const selector = `#questionList .questionCard[data-id="${CSS.escape(variantQuestionId)}"]`;
    const card = await waitForElement(selector, 1200);
    const keep = await waitForElement(`${selector} .variantReviewBar .variantKeep`, 5000);
    if (token !== run) return;
    if (!owned()) return;
    if (!card || !keep) return error("Die neue Katzen-Aufgabe wurde noch nicht vollständig eingefügt. Wir bleiben hier, bis sie wirklich im Test sichtbar und bestätigbar ist.", showVariantReviewStep);
    stage = "variant-review";
    coach("improve", "Prüfe die neue Bildaufgabe.", "Die Katze steht jetzt direkt in deiner Aufgabe. Mit „Ändern“ kannst du sie überarbeiten, mit „Entfernen“ verwerfen. Diese Variante passt – klicke auf „✓ Behalten“.", { target:keep, interactiveTarget:true });
  }

  function showGoodFeedbackStep() {
    stage = "feedback-good"; api.focusQuestion(variantQuestionId);
    coach("improve", "Diese Aufgabe gefällt uns.", "„Behalten“ übernimmt die Variante. Mit dem grünen Smiley bewertest du zusätzlich ihre Qualität. Probiere ihn jetzt aus. Deine Übungsrückmeldung wird getrennt von echten KI-Bewertungen gespeichert.", {
      target:`#questionList .questionCard[data-id="${CSS.escape(variantQuestionId)}"] .aiFeedbackGood`, interactiveTarget:true
    });
  }

  function showBadFeedbackStep() {
    stage = "feedback-bad"; refreshWarnings({includeEdit:false}); api.focusQuestion(faultyId);
    coach("improve", "Hier stimmt die Lösung nicht.", "Für „gelb“ ist noch „blue“ markiert. Klicke auf den roten Smiley, um den Fehler zu melden.", {
      target:`#questionList .questionCard[data-id="${CSS.escape(faultyId)}"] .aiFeedbackBad`, interactiveTarget:true,
      onTargetClick:()=>{void showBadFeedbackPanel();}
    });
  }

  async function showBadFeedbackPanel() {
    const token = run; stage = "feedback-panel";
    const panel = await waitForElement(`#questionList .questionCard[data-id="${CSS.escape(faultyId)}"] .aiQualityPanel`);
    if (!owned() || token !== run) return;
    if (!panel) return error("Das Rückmeldefeld ist noch nicht geöffnet.", showBadFeedbackStep);
    const reason = panel.querySelector(".aiQualityReason");
    reason.value = "incorrect"; reason.dispatchEvent(new Event("change",{bubbles:true}));
    coach("improve", "Fehler melden und entfernen.", "Den Grund habe ich eingetragen. Du könntest die Aufgabe auch nur melden oder neu erstellen lassen. Wir wählen „Melden & entfernen“: Die gute Katzen-Variante bleibt, danach sind es wieder zehn Aufgaben.", {
      target:panel.querySelector(".aiQualityRemove"), interactiveTarget:true
    });
  }

  function showSettingsStep() {
    stage="settings"; api.showSettings();
    coach("guide","Durchführung und Bewertung gehören zum Test dazu.","Hier legst du zum Beispiel Zeitlimit, Lösungen, Mischen und Notenschlüssel fest. Für unsere Übung ist bereits eine Minute eingestellt – du musst nichts verändern.",{target:"#editorView .editorSettingsDisclosure",button:"Weiter zur Freigabe",onButton:()=>{
      const issue=api.checkDemo(); if(issue)return error(issue,showSettingsStep);
      stage="publish"; coach("guide","Jetzt darf der Test raus.","Klicke auf „Veröffentlichen“. Erst dann entsteht der Zugang für deine Klasse.",{target:"#publishBtn",interactiveTarget:true});
    }});
  }

  function askName() {
    stage="identity"; hideCoach(); if(!owned())return;
    root=document.createElement("aside"); root.className="gcRealCoach gcCoachCentered gcCoachIdentityPrompt";
    root.innerHTML=`<div class="gcCoachIdentity">${image("guide",124)}<div><span>Coco · Dein Guide</span><h2>Wie heißt du eigentlich?</h2></div></div><p>Ich bin Coco – und du? Ich darf doch du sagen, oder? Für Schüler reicht später auch ein von dir vergebenes Kürzel.</p><label class="gcNamePrompt">Name oder Kürzel<input type="text" maxlength="60" autocomplete="off" placeholder="z. B. Martin oder ML"></label><div class="gcNameError" aria-live="polite"></div><button type="button" class="button primary gcCoachNext">Weiter</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click",()=>{
      const input=root.querySelector("input");const value=input.value.trim();if(!value){root.querySelector(".gcNameError").textContent="Sag Coco kurz, wie wir dich nennen dürfen.";input.focus();return;}
      const realInput=$("#studentName");if(realInput){realInput.value=value;realInput.dispatchEvent(new Event("input",{bubbles:true}));realInput.dispatchEvent(new Event("change",{bubbles:true}));}
      stage="identity-start";coach("guide",`Freut mich, ${value}!`,"Klicke jetzt auf „Test starten“. Dann läuft unsere eine Übungsminute. Bei 00:00 wird automatisch abgegeben.",{target:"#studentStartBtn",interactiveTarget:true});
    });
    document.body.classList.add("gcCoachVisible");document.body.append(root);root.querySelector("input").focus();schedulePlace();
  }

  function ensureOrderingStartsUnsorted() {
    const list=$("#studentQuestions .sortableList");if(!list)return;const rows=[...list.querySelectorAll(".sortItem")];if(rows.length<2)return;
    const byKey=new Map(rows.map(row=>[String(row.dataset.key??""),row]));
    if(["0","1","2"].every(key=>byKey.has(key))){[byKey.get("1"),byKey.get("0"),byKey.get("2")].forEach(row=>list.appendChild(row));return;}
    if(rows[0]&&rows[1])list.insertBefore(rows[1],rows[0]);
  }

  function notify(event,data={}) {
    if(!owned())return;if(data.quizId&&quizId&&data.quizId!==quizId)return;
    if(event==="view"){
      const allowed={
        new:["dashboardView","createView"],handoff:["createView"],choice:["createView","aiView"],"form-intro":["aiView"],"form-filling":["aiView"],"image-choice":["aiView"],form:["aiView"],creating:["aiView","editorView"],
        draft:["editorView"],outline:["editorView"],"outline-question":["editorView"],edit:["editorView"],"edit-success":["editorView"],"variant-intro":["editorView"],variant:["editorView"],"variant-dialog":["editorView"],"variant-wait":["editorView"],"variant-outline":["editorView"],"feedback-good":["editorView"],"feedback-bad":["editorView"],"feedback-panel":["editorView"],"variant-review-wait":["editorView"],"variant-review":["editorView"],"remove-preview":["editorView"],remove:["editorView"],settings:["editorView"],publish:["editorView","publishView"],published:["publishView","studentView"],identity:["studentView"],"identity-start":["studentView"],answering:["studentView"],submitted:["studentView","resultsView"],results:["resultsView"],review:["resultsView"],finish:["resultsView"]
      };
      if(allowed[stage]&&!allowed[stage].includes(data.id)){error("Die Tour ist aus dem vorgesehenen Schritt gesprungen. Lade die Seite neu; die Einführung startet anschließend wieder am Anfang.",()=>location.reload());return;}
    }
    if(event==="view"&&data.id==="createView"&&stage==="new"){
      stage="handoff";handoff("guide","create","Das ist Remy!","Remy erstellt mit dir deinen ersten Test. Er zeigt dir gleich, welche Angaben er dafür braucht. Ich bin danach wieder für dich da.",()=>{stage="choice";coach("create","Wir starten mit KI.","„Mit KI erstellen“ ist der Hauptweg in GradeCrew. Die anderen Möglichkeiten bleiben verfügbar, stehen heute aber nicht im Mittelpunkt.",{target:"#createAiBtn",interactiveTarget:true});});return;
    }
    if(event==="view"&&data.id==="aiView"&&stage==="choice"){
      stage="form-intro";coach("create","Wir bauen einen Test für Klasse 4.","Englisch, Grundschule: Colours, animals & school things. Ich fülle die echten Felder gleich Schritt für Schritt aus.",{button:"Felder ausfüllen",onButton:ghostFillForm,centered:true});return;
    }
    if(event==="edit-opened"&&stage==="edit"){void prepareEditPanel();return;}
    if(event==="edited"&&stage==="edit"){clearOutlineWarning(editSourceId);refreshWarnings({includeEdit:false});celebrateEdit();return;}
    if(event==="tutorial-feedback"&&stage==="feedback-good"&&data.questionId===variantQuestionId&&data.verdict==="good"){showBadFeedbackStep();return;}
    if(event==="tutorial-feedback"&&stage==="feedback-panel"&&data.questionId===faultyId&&data.verdict==="bad"&&data.action==="remove"){showSettingsStep();return;}
    if(event==="published"&&stage==="publish"){stage="published";coach("guide","Das ist der echte Zugang für die Klasse.","Hier stehen Testcode, Link und QR-Code. Klicke auf „Test selbst ausfüllen“ – jetzt wechselst du in die Schülerrolle.",{target:"#openPublishedStudentBtn",interactiveTarget:true});return;}
    if(event==="student-ready"&&stage==="published"){askName();return;}
    if(event==="student-started"&&["identity","identity-start"].includes(stage)){stage="answering";hideCoach();freeRegion=$("#studentForm");document.documentElement.classList.remove("gcTourScrollLocked");document.body.classList.add("gcTourAnswering");setTimeout(()=>{if(owned()&&stage==="answering")ensureOrderingStartsUnsorted();},100);return;}
    if(event==="submitted"&&["answering","identity-start"].includes(stage)){submissionId=data.submissionId;freeRegion=null;document.body.classList.remove("gcTourAnswering");document.documentElement.classList.add("gcTourScrollLocked");stage="submitted";coach("guide","Deine Abgabe ist gespeichert.","Das waren echte Übungsantworten. Öffne jetzt die Lehrkraft-Auswertung – dort wartet Wilma auf dich.",{target:"#studentTeacherResultsBtn",interactiveTarget:true});return;}
    if(event==="results-ready"&&stage==="submitted"){
      stage="results";handoff("guide","grade","Jetzt ist Wilma dran.","Hallo, ich bin Wilma. Ich zeige dir, wie automatische Bewertung und dein eigenes Urteil zusammenarbeiten.",()=>coach("grade","Öffne deine Übungsabgabe.","In deiner Zeile findest du „Bewerten“. Dort siehst du Antworten, Lösungen, Bilder und Punkte.",{target:`#resultsTableWrap .reviewBtn[data-id="${CSS.escape(submissionId)}"]`,interactiveTarget:true}));return;
    }
    if(event==="review-opened"&&stage==="results"&&data.submissionId===submissionId){stage="review";coach("grade","Automatisch, wo es eindeutig ist – du entscheidest beim Rest.","Schau dir die freie Farbangabe am Ende an. Dort kannst du Punkte prüfen und anschließend die Bewertung speichern.",{target:"#reviewPanel",button:"Zur freien Antwort",onButton:()=>{api.focusReviewLast();const input=$("#reviewQuestions .reviewQuestion:last-child .manualPoints");freeRegion=input?.closest(".reviewQuestion")||null;coach("grade","Dein Urteil zählt.","Prüfe die Antwort, passe bei Bedarf die Punkte an und klicke dann auf „Bewertung speichern“.",{target:"#saveReview",interactiveTarget:true});if(input)input.classList.add("gcTourAllowedInput");}});return;}
    if(event==="review-saved"&&stage==="review"&&data.submissionId===submissionId){freeRegion=null;stage="finish";coach("guide","Jetzt gehörst du zur Crew.","Du hast einen Test erstellt, Hinweise geprüft, mit Emmi überarbeitet, eine Variante ergänzt, selbst teilgenommen und mit Wilma bewertet.",{button:"Tour abschließen",onButton:()=>stop({done:true}),centered:true,body:'<div class="gcCoachFinishFlow"><span>Erstellen</span><b>→</b><span>Überarbeiten</span><b>→</b><span>Durchführen</span><b>→</b><span>Bewerten</span></div>'});}
  }

  async function create() {
    if(!owned()||stage!=="form"||busy)return;busy=true;const token=run;stage="creating";
    coach("create","Ich erstelle deinen Test …","Aus deinen Angaben entsteht jetzt der erste Entwurf. Danach wird er geprüft, bevor wir ihn gemeinsam ansehen.",{target:"#aiProgress",body:'<div class="gcTourWorking"><span></span><span></span><span></span><small>10 Aufgaben · 3 Bilder · wird geprüft</small></div>'});
    let delay;const wait=new Promise(resolve=>{delay=setTimeout(resolve,3000);});
    try{const created=quizId||await api.createDemo(DEMO_TEST);if(owned()&&token===run)quizId=created;await wait;if(!owned()||token!==run)return;quizId=created;await api.openEditor(created);if(!owned()||token!==run)return;if(!api.isEditor(created))throw new Error("Der Übungstest konnte nicht geöffnet werden.");beginDraftReview();}
    catch(err){if(owned()&&token===run){stage="form";error(err?.message||"Der Übungstest konnte nicht vorbereitet werden.",create);}}
    finally{clearTimeout(delay);if(token===run)busy=false;}
  }

  function dashboard({uid,firstVisit}) {
    if(active)return;if(owner&&owner!==uid)stop();owner=uid;suppressLegacyGuides();
    let button=$("#gradecrewTourBtn");if(!button){button=document.createElement("button");button.id="gradecrewTourBtn";button.type="button";button.className="button ghost";$(".dashboardActions")?.append(button);}button.textContent="Mit der Crew starten";button.onclick=start;
    if(firstVisit&&!offered.has(uid)){offered.add(uid);let done=false;try{done=localStorage.getItem(doneKey())==="done";}catch{}if(!done)setTimeout(start,350);}
  }

  document.addEventListener("gradecrew:variant-dialog-opened",event=>{if(!owned()||stage!=="variant")return;void prepareVariantDialog(event.detail?.dialog||null);});
  document.addEventListener("gradecrew:variant-submitted",()=>variantSubmitted());
  document.addEventListener("gradecrew:variants-inserted", event=>{
    const data=event.detail;
    if(!owned()||!["variant-dialog","variant-wait"].includes(stage)||data?.quizId!==quizId||data?.ownerId!==owner||data?.sourceId!==variantSourceId||data?.questionIds?.length!==1)return;
    variantQuestionId=data.questionIds[0];refreshWarnings({includeEdit:false});void showVariantOutlineStep();
  });
  document.addEventListener("gradecrew:variant-kept",event=>{if(!owned()||stage!=="variant-review"||event.detail?.id!==variantQuestionId||event.detail?.quizId!==quizId||event.detail?.ownerId!==owner)return;const token=run;queueMicrotask(()=>{if(owned()&&token===run&&stage==="variant-review"){refreshWarnings({includeEdit:false});showGoodFeedbackStep();}});});

  const style=document.createElement("link");style.rel="stylesheet";style.href="./gradecrew-tour.css?v=2.3.1-gc20";document.head.append(style);
  addEventListener("resize",schedulePlace,{passive:true});
  document.addEventListener("gradecrew:account-changed",()=>stop());

  return { start,dashboard,notify,stop,create,get active(){return owned();},get creating(){return owned()&&["form-intro","form-filling","image-choice","form","creating"].includes(stage);},ownsQuiz:id=>owned()&&quizId===id,preparedResponse };
}

