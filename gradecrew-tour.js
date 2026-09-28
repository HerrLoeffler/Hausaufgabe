// Guided onboarding uses the real GradeCrew UI, but deterministic tutorial data.
// The tour owns navigation only while it is active; the app still owns persistence,
// rendering, grading and all normal AI flows outside the tutorial.
export const TOUR_VERSION = "gradecrew-live-tour-v5";

export const CREW = Object.freeze({
  guide: { name: "Coco", animal: "Pinguin", role: "Dein Guide", asset: "penguin-guide" },
  create: { name: "Remy", animal: "Elefant", role: "Erstellen", asset: "elephant-create" },
  improve: { name: "Emmi", animal: "Fuchs", role: "Überarbeiten", asset: "fox-improve" },
  grade: { name: "Wilma", animal: "Eule", role: "Bewerten", asset: "owl-grade" }
});

const single = (text, choices, answer, image = "") => ({
  type: "single",
  text,
  points: 1,
  options: choices.map((label, index) => ({ text: label, correct: index === answer })),
  ...(image ? {
    imageUrl: `/assets/gradecrew/demo-${image}.svg`,
    imageAlt: ({
      backpack: "Ein blauer Schulrucksack.",
      pencil: "Ein roter Bleistift aus Holz.",
      books: "Drei Bücher nebeneinander."
    })[image]
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
    // Intentionally inconsistent language so Emmi can demonstrate a useful AI edit.
    single("Was heißt „Hund“ auf Englisch?", ["cat", "dog", "bird"], 1),
    { type: "truefalse", text: "Decide whether this is correct: „Red“ means „rot“.", points: 1, correctBoolean: true },
    { type: "dropdown", text: "Choose the English word for „blau“.", points: 1, options: [
      { text: "green", correct: false }, { text: "blue", correct: true }, { text: "yellow", correct: false }
    ] },
    { type: "gapfill", text: "Complete the colour word: gr[ee]n.", points: 1 },
    { type: "ordering", text: "Put the colours in this order: red, yellow, green.", points: 1, items: ["red", "yellow", "green"], manualReview: false },
    // Deliberately wrong answer key. The tour later explains that AI can make mistakes
    // and removes this task after a useful variant has been added.
    single("Which English word means the German colour „gelb“?", ["yellow", "blue", "red"], 1),
    { type: "text", text: "Write one colour in English.", points: 1,
      acceptedAnswers: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown", "grey", "gray"], manualReview: true }
  ]
});
// Make the deliberately faulty task actually faulty: blue is marked as correct.
DEMO_TEST.questions[8].options.forEach((option, index) => { option.correct = index === 1; });

export function preparedResponse(_q, { variant = false, mediaKind = "none" } = {}) {
  if (variant) {
    if (mediaKind !== "none") throw new Error("Die vorbereitete Katze-Variante dieser Tour wird ohne zusätzliches Bild erstellt.");
    const question = single("Choose the English word for „Katze“.", ["dog", "bird", "cat"], 2);
    return { question: { ...question, mediaIntent: { kind: "none" } }, meta: { model: "prepared-tutorial", promptVersion: TOUR_VERSION } };
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
  let sourceId = "";
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
    document.body.classList.remove("gcRealTourActive");
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
    window.setTimeout(() => root?.classList.remove("gcCoachNudge"), 350);
  }

  function blockOutsideTour(event) {
    if (!owned() || !event.isTrusted) return;
    // A highlighted submit button also needs its form's submit event to pass.
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

  ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "dblclick", "contextmenu", "submit"].forEach(type => {
    document.addEventListener(type, blockOutsideTour, true);
  });
  ["touchstart", "touchmove", "wheel"].forEach(type => {
    document.addEventListener(type, blockOutsideTour, { capture: true, passive: false });
  });
  document.addEventListener("keydown", blockKeyboard, true);

  function place() {
    frame = 0;
    if (!root?.isConnected) return;
    const rect = root.getBoundingClientRect();
    const margin = 18;
    if (root.classList.contains("gcCoachCentered") || !target?.isConnected) {
      root.style.left = `${Math.max(margin, Math.round((innerWidth - rect.width) / 2))}px`;
      root.style.top = `${Math.max(70, Math.round(Math.min(innerHeight * .14, innerHeight - rect.height - margin)))}px`;
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
    const fits = candidate => candidate.left >= margin && candidate.top >= margin && candidate.left + rect.width <= innerWidth - margin && candidate.top + rect.height <= innerHeight - margin;
    const chosen = candidates.find(fits) || candidates[2];
    root.style.left = `${Math.round(Math.max(margin, Math.min(chosen.left, innerWidth - rect.width - margin)))}px`;
    root.style.top = `${Math.round(Math.max(margin, Math.min(chosen.top, innerHeight - rect.height - margin)))}px`;
  }

  function schedulePlace() {
    if (!frame) frame = requestAnimationFrame(place);
  }

  function setTarget(selectorOrNode, { interactive = false, onClick = null, deleteTarget = false, scroll = true } = {}) {
    clearTarget();
    target = typeof selectorOrNode === "string" ? $(selectorOrNode) : selectorOrNode;
    targetInteractive = Boolean(target && interactive);
    if (!target) {
      schedulePlace();
      return null;
    }
    target.classList.add("gcTourTarget");
    if (deleteTarget) target.classList.add("gcTourDeleteTarget");
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === "DETAILS") parent.open = true;
    }
    if (scroll) queueMicrotask(() => target?.isConnected && target.scrollIntoView({ block: "center", behavior: "smooth" }));
    const move = () => schedulePlace();
    addEventListener("resize", move, { passive: true });
    addEventListener("scroll", move, { passive: true, capture: true });
    let clickHandler = null;
    if (onClick) {
      clickHandler = event => {
        if (!owned()) return;
        window.setTimeout(() => onClick(event), 0);
      };
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

  function coach(role, title, text, {
    target: selector = null,
    button = "",
    onButton = null,
    interactiveTarget = false,
    onTargetClick = null,
    centered = false,
    body = "",
    deleteTarget = false
  } = {}) {
    hideCoach();
    if (!owned()) return null;
    root = document.createElement("aside");
    root.className = `gcRealCoach${centered ? " gcCoachCentered" : ""}`;
    root.setAttribute("aria-label", `${CREW[role].name} begleitet dich`);
    root.setAttribute("aria-live", "polite");
    root.innerHTML = `
      <div class="gcCoachIdentity">${image(role)}<div><span>${escapeHtml(CREW[role].name)} · ${escapeHtml(CREW[role].role)}</span><h2>${escapeHtml(title)}</h2></div></div>
      <p>${escapeHtml(text)}</p>${body}
      ${button ? `<button type="button" class="button primary gcCoachNext">${escapeHtml(button)}</button>` : ""}
      <small>Nur der markierte Schritt ist während der Tour bedienbar.</small>`;
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
    root.innerHTML = `
      <div class="gcHandoffFaces"><div>${image(fromRole, 108)}<strong>${escapeHtml(CREW[fromRole].name)}</strong></div><span>→</span><div>${image(toRole, 108)}<strong>${escapeHtml(CREW[toRole].name)}</strong></div></div>
      <span class="eyebrow">Die Crew arbeitet zusammen</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p>
      <button type="button" class="button primary gcCoachNext">${escapeHtml(buttonLabel)}</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click", next);
    document.body.classList.add("gcCoachVisible");
    document.body.append(root);
    schedulePlace();
  }

  function crewIntro() {
    const cards = Object.entries(CREW).map(([role, member]) => `
      <div class="gcCrewIntroMember">${image(role, role === "guide" ? 104 : 94)}<strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.role)}</span></div>`).join("");
    coach("guide", "Willkommen bei GradeCrew.", "Ich bin Coco und begleite dich durch deine erste GradeCrew-Reise. Bevor wir loslegen: Das ist deine Crew.", {
      centered: true,
      body: `<div class="gcCrewIntroGrid">${cards}</div><p class="gcCrewIntroPromise">Remy erstellt · Emmi überarbeitet · Wilma bewertet · Coco führt dich durch alles.</p>`,
      button: "Mit der Crew starten",
      onButton: () => {
        stage = "new";
        coach("guide", "Wir starten deinen ersten Test.", "Klicke auf „+ Neuer Test“. Alles andere bleibt während dieses Schritts gesperrt.", {
          target: "#newQuizBtn",
          interactiveTarget: true
        });
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
    owner = api.uid();
    quizId = "";
    sourceId = "";
    faultyId = "";
    submissionId = "";
    freeRegion = null;
    active = true;
    busy = false;
    stage = "intro";
    ++run;
    document.body.classList.add("gcRealTourActive");
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
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(280);
    } else {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      for (const char of String(value)) {
        if (!owned() || token !== run) return;
        input.value += char;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(delay);
      }
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(240);
    }
    input.classList.remove("gcTourTyping");
  }

  async function ghostFillNotes(token = run) {
    if (!owned() || token !== run) return;
    busy = true;
    stage = "form-filling";
    coach("create", "Sag mir, was dir wichtig ist.", "Unter „Eigene Wünsche“ kannst du Niveau, Sprache, Schwerpunkt oder besondere Anforderungen genauer vorgeben.", {
      target: "#aiCustomNotes",
      body: '<div class="gcCoachStatus">Eigene Wünsche werden ergänzt …</div>'
    });
    await typeField("#aiCustomNotes", "Kurze, klare Aufgaben für Klasse 4. Einfache Farben, Tiere und Schulsachen. Alle Arbeitsaufträge auf Englisch. Abwechslungsreiche Aufgabentypen.", "Eigene Wünsche werden ergänzt …", token, 13);
    if (!owned() || token !== run) return;
    busy = false;
    stage = "form";
    coach("create", "Alles klar.", "Damit habe ich genug. Klicke jetzt auf „Test erstellen“ – ich erstelle den ersten Entwurf und prüfe ihn anschließend.", {
      target: "#generateAiTestBtn",
      interactiveTarget: true
    });
  }

  async function ghostFillForm() {
    if (!owned()) return;
    const token = run;
    busy = true;
    stage = "form-filling";
    coach("create", "Ich trage die Eckdaten ein.", "Wir bauen einen Englischtest für Klasse 4. Schau zu – die Angaben schreiben sich Schritt für Schritt ins echte Formular.", {
      target: "#aiSubject",
      body: '<div class="gcCoachStatus">Fach auswählen …</div>'
    });
    const sequence = [
      ["#aiSubject", "Englisch", "Fach: Englisch"],
      ["#aiGrade", "4", "Klasse: 4"],
      ["#aiSchoolType", "Grundschule", "Schulart: Grundschule"],
      ["#aiRegion", "Bayern", "Bundesland: Bayern"],
      ["#aiTopic", "Colours, animals & school things", "Thema: Farben, Tiere & Schulsachen"],
      ["#aiCount", "10", "10 Aufgaben"],
      ["#aiPoints", "10", "10 Punkte"],
      ["#aiImageQuestionCount", "3", "3 Aufgaben mit Bild"]
    ];
    for (const step of sequence) {
      await typeField(...step, token);
      if (!owned() || token !== run) return;
    }
    busy = false;
    stage = "image-choice";
    coach("create", "Bilder kann ich gleich mitplanen.", "Für unseren Test haben wir drei Aufgaben mit Bild ausgewählt. Das ist besonders praktisch bei Sprachtests und jüngeren Klassen.", {
      target: "#aiImageQuestionCount",
      button: "Eigene Wünsche ergänzen",
      onButton: () => ghostFillNotes(token)
    });
  }

  function markOutlineWarning(questionId, text) {
    const cards = $$("#questionList .questionCard");
    const index = cards.findIndex(card => card.dataset.id === questionId);
    const outline = $$("#questionOutline .questionOutlineItem")[index];
    if (!outline) return null;
    outline.classList.add("gcTourQualityFlag");
    outline.title = text;
    return outline;
  }

  function clearOutlineWarning(questionId) {
    const cards = $$("#questionList .questionCard");
    const index = cards.findIndex(card => card.dataset.id === questionId);
    $$("#questionOutline .questionOutlineItem")[index]?.classList.remove("gcTourQualityFlag");
  }

  function refreshWarnings({ includeSource = true } = {}) {
    if (includeSource && sourceId) markOutlineWarning(sourceId, "Arbeitsauftrag passt sprachlich nicht zum restlichen Test.");
    if (faultyId) markOutlineWarning(faultyId, "Die hinterlegte Lösung ist falsch.");
  }

  function thankRemy() {
    stage = "draft";
    hideCoach();
    if (!owned()) return;
    root = document.createElement("aside");
    root.className = "gcRealCoach gcCoachCentered gcCoachThanks";
    root.innerHTML = `
      <div class="gcThanksFaces"><div>${image("guide", 118)}<strong>Coco</strong></div><span>♡</span><div>${image("create", 126)}<strong>Remy</strong></div></div>
      <span class="eyebrow">Der erste Entwurf steht</span>
      <h2>Danke, Remy!</h2>
      <p>Zehn Aufgaben sind da – drei davon mit Bild. Jetzt schauen wir gemeinsam auf den Feinschliff.</p>
      <button type="button" class="button primary gcCoachNext">Zum Feinschliff</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click", () => {
      handoff("create", "improve", "Emmi übernimmt jetzt.", "Remy gibt den Test direkt an Emmi weiter. Sie zeigt dir, wie du Hinweise prüfst, Aufgaben mit KI überarbeitest und Varianten erstellst.", showOutlineGuide);
    });
    document.body.classList.add("gcCoachVisible");
    document.body.append(root);
    schedulePlace();
  }

  function beginDraftReview() {
    stage = "draft";
    sourceId = api.questionId(3);
    faultyId = api.questionId(8);
    refreshWarnings();
    thankRemy();
  }

  function showOutlineGuide() {
    stage = "outline";
    refreshWarnings();
    const outline = $("#questionOutline") || $("#editorView .settingsCard");
    coach("improve", "KI kann Fehler machen – deshalb prüfen wir.", "GradeCrew prüft den Entwurf automatisch. Für die Einführung sind links zwei Hinweise markiert, damit du siehst, wie du gezielt eingreifen kannst.", {
      target: outline,
      button: "Ersten Hinweis öffnen",
      onButton: () => {
        const warning = markOutlineWarning(sourceId, "Arbeitsauftrag passt sprachlich nicht zum restlichen Test.");
        stage = "outline-question";
        coach("improve", "Aufgabe 4 fällt auf.", "Klicke auf die markierte Aufgabe. Der Arbeitsauftrag ist noch auf Deutsch – wir lassen ihn passend zum restlichen Test auf Englisch formulieren.", {
          target: warning,
          interactiveTarget: true,
          onTargetClick: () => {
            api.focusQuestion(sourceId);
            showEditStep();
          }
        });
      }
    });
  }

  function showEditStep() {
    stage = "edit";
    api.focusQuestion(sourceId);
    coach("improve", "Überarbeite genau diese Aufgabe.", "Öffne „Mit KI überarbeiten“. Ich trage danach unseren Änderungswunsch für dich ein.", {
      target: `#questionList .questionCard[data-id="${CSS.escape(sourceId)}"] .aiEditQuestion`,
      interactiveTarget: true
    });
  }

  async function prepareEditPanel() {
    const panel = $(".questionAiPanel");
    const input = panel?.querySelector("textarea");
    const apply = panel?.querySelector(".aiApply");
    if (!panel || !input || !apply) return error("Das Überarbeitungsfeld wurde nicht gefunden.", showEditStep);
    const token = run;
    busy = true;
    coach("improve", "So gibst du der KI deinen Wunsch.", "Wir möchten nur die Sprache ändern. Schau zu – der Wunsch wird direkt eingetragen.", {
      target: input,
      body: '<div class="gcCoachStatus">Änderungswunsch wird eingetragen …</div>'
    });
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const text = "Formuliere den Arbeitsauftrag vollständig auf Englisch.";
    for (const char of text) {
      if (!owned() || token !== run) return;
      input.value += char;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(20);
    }
    busy = false;
    coach("improve", "Alles bereit.", "Klicke auf „Überarbeitung erstellen“. Danach vergleichen wir die Aufgabe.", {
      target: apply,
      interactiveTarget: true
    });
  }

  function celebrateEdit() {
    stage = "edit-success";
    refreshWarnings({ includeSource: false });
    coach("improve", "Super – die KI-Überarbeitung hat geklappt.", "Die Frage ist jetzt auf Englisch. Die ursprüngliche Aufgabe wurde gezielt angepasst, ohne dass du sie neu bauen musstest.", {
      centered: true,
      button: "Jetzt eine Variante erstellen",
      onButton: showVariantStep
    });
  }

  async function typeVariantInstruction(input, value, token) {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.classList.add("gcTourTyping");
    for (const char of value) {
      if (!owned() || token !== run) return;
      input.value += char;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(22);
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.classList.remove("gcTourTyping");
  }

  async function prepareVariantDialog(dialog) {
    if (!owned() || stage !== "variant") return;
    stage = "variant-dialog";
    hideCoach();
    if (!dialog?.open) return error("Das Variantenfenster wurde nicht gefunden.", showVariantStep);
    const token = run;
    busy = true;
    dialog.classList.add("gcTourVariantDialog");
    const close = dialog.querySelector(".variantRequestClose");
    const cancel = dialog.querySelector(".variantRequestCancel");
    if (close) close.hidden = true;
    if (cancel) cancel.hidden = true;
    const form = dialog.querySelector("form");
    const count = dialog.querySelector('[name="count"]');
    const media = dialog.querySelector('[name="mediaKind"]');
    const instruction = dialog.querySelector('[name="instruction"]');
    const submit = dialog.querySelector('button[type="submit"]');
    if (!form || !count || !media || !instruction || !submit) {
      busy = false;
      return error("Das Variantenfenster ist unvollständig. Bitte versuche den Schritt erneut.", showVariantStep);
    }
    let mentor = dialog.querySelector(".gcTourVariantMentor");
    if (!mentor) {
      mentor = document.createElement("div");
      mentor.className = "gcTourVariantMentor";
      mentor.innerHTML = `${image("improve", 74)}<div><span>Emmi · Überarbeiten</span><strong>Wir bauen eine zweite Version.</strong><p>Die Hund-Aufgabe bleibt. Dazu kommt gleich eine Variante mit „Katze“.</p><small>Ich fülle die Angaben für dich aus.</small></div>`;
      form.prepend(mentor);
    }
    count.value = "1";
    count.dispatchEvent(new Event("change", { bubbles: true }));
    setTarget(count, { interactive: false, scroll: false });
    await sleep(450);
    if (!owned() || token !== run) return;
    media.value = "none";
    media.dispatchEvent(new Event("change", { bubbles: true }));
    setTarget(media, { interactive: false, scroll: false });
    mentor.querySelector("small").textContent = "Für diese Variante brauchen wir kein zusätzliches Bild.";
    await sleep(550);
    if (!owned() || token !== run) return;
    setTarget(instruction, { interactive: false, scroll: false });
    mentor.querySelector("small").textContent = "Jetzt kommt unser eigener Wunsch dazu …";
    await typeVariantInstruction(instruction, "Nutze statt „Hund“ das Wort „Katze“.", token);
    if (!owned() || token !== run) return;
    mentor.querySelector("strong").textContent = "Alles vorbereitet.";
    mentor.querySelector("p").textContent = "1 Variante · ohne Bild · Katze statt Hund.";
    mentor.querySelector("small").textContent = "Klicke jetzt auf „Erstellen“.";
    busy = false;
    setTarget(submit, { interactive: true, scroll: false });
  }

  function showVariantStep() {
    stage = "variant";
    api.focusQuestion(sourceId);
    coach("improve", "Jetzt bauen wir eine echte Variante.", "Die Hund-Aufgabe bleibt erhalten. Zusätzlich erstellen wir dieselbe Idee mit „Katze“. Klicke auf „Variante hinzufügen“.", {
      target: `#questionList .questionCard[data-id="${CSS.escape(sourceId)}"] .aiVariantQuestion`,
      interactiveTarget: true
    });
  }

  function variantSubmitted() {
    if (!owned() || stage !== "variant-dialog") return;
    busy = false;
    stage = "variant-wait";
    document.querySelectorAll(".gcTourVariantMentor").forEach(node => node.remove());
    coach("improve", "Ich erstelle die Variante …", "Die Hund-Aufgabe bleibt bestehen. Gleich kannst du die neue Katze-Variante zusätzlich übernehmen.", {
      target: "#variantBackgroundProgress",
      body: '<div class="gcTourWorking"><span></span><span></span><span></span><small>1 Variante · ohne Bild · wird geprüft</small></div>'
    });
  }

  function showFaultyDeleteStep() {
    stage = "remove-preview";
    refreshWarnings({ includeSource: false });
    api.focusQuestion(faultyId);
    coach("improve", "Ein Hinweis ist noch offen.", "Bei Aufgabe 9 ist für „gelb“ fälschlich „blue“ als richtige Lösung hinterlegt. KI kann Fehler machen – deshalb bleibt die Lehrkraft in der Kontrolle.", {
      target: `#questionList .questionCard[data-id="${CSS.escape(faultyId)}"]`,
      button: "Fehlerhafte Aufgabe löschen",
      onButton: () => {
        stage = "remove";
        const deleteButton = $(`#questionList .questionCard[data-id="${CSS.escape(faultyId)}"] .deleteQuestion`);
        if (deleteButton) {
          deleteButton.textContent = "×";
          deleteButton.title = "Fehlerhafte Aufgabe löschen";
          deleteButton.setAttribute("aria-label", "Fehlerhafte Aufgabe löschen");
        }
        coach("improve", "Diesen Fehler brauchen wir nicht.", "Klicke auf das rote × und bestätige das Löschen. Die neue Katze-Variante bleibt – danach sind es wieder genau zehn Aufgaben.", {
          target: deleteButton,
          interactiveTarget: true,
          deleteTarget: true
        });
      }
    });
  }

  function showSettingsStep() {
    stage = "settings";
    api.showSettings();
    coach("guide", "Durchführung und Bewertung gehören zum Test dazu.", "Hier legst du zum Beispiel Zeitlimit, Lösungen, Mischen und Notenschlüssel fest. Für unsere Übung ist bereits eine Minute eingestellt – du musst nichts verändern.", {
      target: "#editorView .editorSettingsDisclosure",
      button: "Weiter zur Freigabe",
      onButton: () => {
        const issue = api.checkDemo();
        if (issue) return error(issue, showSettingsStep);
        stage = "publish";
        coach("guide", "Jetzt darf der Test raus.", "Klicke auf „Veröffentlichen“. Erst dann entsteht der Zugang für deine Klasse.", {
          target: "#publishBtn",
          interactiveTarget: true
        });
      }
    });
  }

  function askName() {
    stage = "identity";
    hideCoach();
    if (!owned()) return;
    root = document.createElement("aside");
    root.className = "gcRealCoach gcCoachCentered gcCoachIdentityPrompt";
    root.innerHTML = `
      <div class="gcCoachIdentity">${image("guide", 124)}<div><span>Coco · Dein Guide</span><h2>Wie heißt du eigentlich?</h2></div></div>
      <p>Ich bin Coco – und du? Ich darf doch du sagen, oder? Für Schüler reicht später auch ein von dir vergebenes Kürzel.</p>
      <label class="gcNamePrompt">Name oder Kürzel<input type="text" maxlength="60" autocomplete="off" placeholder="z. B. Martin oder ML"></label>
      <div class="gcNameError" aria-live="polite"></div>
      <button type="button" class="button primary gcCoachNext">Weiter</button>`;
    root.querySelector(".gcCoachNext").addEventListener("click", () => {
      const input = root.querySelector("input");
      const value = input.value.trim();
      if (!value) {
        root.querySelector(".gcNameError").textContent = "Sag Coco kurz, wie wir dich nennen dürfen.";
        input.focus();
        return;
      }
      const realInput = $("#studentName");
      if (realInput) {
        realInput.value = value;
        realInput.dispatchEvent(new Event("input", { bubbles: true }));
        realInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      stage = "identity-start";
      coach("guide", `Freut mich, ${value}!`, "Klicke jetzt auf „Test starten“. Dann läuft unsere eine Übungsminute. Bei 00:00 wird automatisch abgegeben.", {
        target: "#studentStartBtn",
        interactiveTarget: true
      });
    });
    document.body.classList.add("gcCoachVisible");
    document.body.append(root);
    root.querySelector("input").focus();
    schedulePlace();
  }

  function ensureOrderingStartsUnsorted() {
    const list = $("#studentQuestions .sortableList");
    if (!list) return;
    const rows = [...list.querySelectorAll(".sortItem")];
    if (rows.length < 2) return;
    const byKey = new Map(rows.map(row => [String(row.dataset.key ?? ""), row]));
    if (["0", "1", "2"].every(key => byKey.has(key))) {
      // Deterministic wrong order for the tutorial so the sorting controls are meaningful.
      [byKey.get("1"), byKey.get("0"), byKey.get("2")].forEach(row => list.appendChild(row));
      return;
    }
    const first = rows[0];
    const second = rows[1];
    if (first && second) list.insertBefore(second, first);
  }

  function notify(event, data = {}) {
    if (!owned()) return;
    if (data.quizId && quizId && data.quizId !== quizId) return;

    if (event === "view") {
      const allowed = {
        new: ["dashboardView", "createView"],
        handoff: ["createView"],
        choice: ["createView", "aiView"],
        "form-intro": ["aiView"],
        "form-filling": ["aiView"],
        "image-choice": ["aiView"],
        form: ["aiView"],
        creating: ["aiView", "editorView"],
        draft: ["editorView"],
        outline: ["editorView"],
        "outline-question": ["editorView"],
        edit: ["editorView"],
        "edit-success": ["editorView"],
        variant: ["editorView"],
        "variant-dialog": ["editorView"],
        "variant-wait": ["editorView"],
        "variant-apply": ["editorView"],
        "remove-preview": ["editorView"],
        remove: ["editorView"],
        settings: ["editorView"],
        publish: ["editorView", "publishView"],
        published: ["publishView", "studentView"],
        identity: ["studentView"],
        "identity-start": ["studentView"],
        answering: ["studentView"],
        submitted: ["studentView", "resultsView"],
        results: ["resultsView"],
        review: ["resultsView"],
        finish: ["resultsView"]
      };
      if (allowed[stage] && !allowed[stage].includes(data.id)) {
        error("Die Tour ist aus dem vorgesehenen Schritt gesprungen. Lade die Seite neu; die Einführung startet anschließend wieder am Anfang.", () => location.reload());
        return;
      }
    }

    if (event === "view" && data.id === "createView" && stage === "new") {
      stage = "handoff";
      handoff("guide", "create", "Für den ersten Entwurf hole ich Remy dazu.", "Remy hat den größten Kopf in der Crew – viel Platz zum Denken. Er kümmert sich ums Erstellen.", () => {
        stage = "choice";
        coach("create", "Wir starten mit KI.", "„Mit KI erstellen“ ist der Hauptweg in GradeCrew. Die anderen Möglichkeiten bleiben verfügbar, stehen heute aber nicht im Mittelpunkt.", {
          target: "#createAiBtn",
          interactiveTarget: true
        });
      });
      return;
    }

    if (event === "view" && data.id === "aiView" && stage === "choice") {
      stage = "form-intro";
      coach("create", "Wir bauen einen Test für Klasse 4.", "Thema: Colours, Tiere und Schulsachen. Ich fülle die echten Felder jetzt von selbst aus – inklusive Bildanzahl und „Eigene Wünsche“.", {
        button: "Felder ausfüllen",
        onButton: ghostFillForm,
        centered: true
      });
      return;
    }

    if (event === "edit-opened" && stage === "edit") {
      void prepareEditPanel();
      return;
    }

    if (event === "edited" && stage === "edit") {
      clearOutlineWarning(sourceId);
      refreshWarnings({ includeSource: false });
      celebrateEdit();
      return;
    }

    if (event === "variants-ready" && ["variant-dialog", "variant-wait", "variant"].includes(stage)) {
      stage = "variant-apply";
      document.querySelectorAll(".gcTourInlineHint, .gcTourVariantMentor").forEach(node => node.remove());
      refreshWarnings({ includeSource: false });
      coach("improve", "Die Katze-Variante ist fertig.", "Übernimm genau diese Variante. Die Hund-Aufgabe bleibt dabei erhalten – eine Variante ist eine zusätzliche Aufgabe.", {
        target: "#variantBackgroundProgress .applyVariants",
        interactiveTarget: true
      });
      return;
    }

    if (event === "variants-applied" && stage === "variant-apply") {
      refreshWarnings({ includeSource: false });
      showFaultyDeleteStep();
      return;
    }

    if (event === "question-deleted" && stage === "remove" && data.questionId === faultyId) {
      showSettingsStep();
      return;
    }

    if (event === "published" && stage === "publish") {
      stage = "published";
      coach("guide", "Das ist der echte Zugang für die Klasse.", "Hier stehen Testcode, Link und QR-Code. Klicke auf „Test selbst ausfüllen“ – jetzt wechselst du in die Schülerrolle.", {
        target: "#openPublishedStudentBtn",
        interactiveTarget: true
      });
      return;
    }

    if (event === "student-ready" && stage === "published") {
      askName();
      return;
    }

    if (event === "student-started" && ["identity", "identity-start"].includes(stage)) {
      stage = "answering";
      hideCoach();
      freeRegion = $("#studentForm");
      window.setTimeout(ensureOrderingStartsUnsorted, 80);
      return;
    }

    if (event === "submitted" && ["answering", "identity-start"].includes(stage)) {
      submissionId = data.submissionId;
      freeRegion = null;
      stage = "submitted";
      coach("guide", "Deine Abgabe ist gespeichert.", "Das waren echte Übungsantworten. Öffne jetzt die Lehrkraft-Auswertung – dort wartet Wilma auf dich.", {
        target: "#studentTeacherResultsBtn",
        interactiveTarget: true
      });
      return;
    }

    if (event === "results-ready" && stage === "submitted") {
      stage = "results";
      handoff("guide", "grade", "Jetzt ist Wilma dran.", "Wilma ist unsere Eule fürs Bewerten. Sie schaut genau hin, wenn automatische Auswertung allein nicht reicht.", () => {
        coach("grade", "Öffne deine Übungsabgabe.", "In deiner Zeile findest du „Bewerten“. Dort siehst du Antworten, Lösungen, Bilder und Punkte.", {
          target: `#resultsTableWrap .reviewBtn[data-id="${CSS.escape(submissionId)}"]`,
          interactiveTarget: true
        });
      });
      return;
    }

    if (event === "review-opened" && stage === "results" && data.submissionId === submissionId) {
      stage = "review";
      coach("grade", "Automatisch, wo es eindeutig ist – du entscheidest beim Rest.", "Schau dir die freie Farbangabe am Ende an. Dort kannst du Punkte prüfen und anschließend die Bewertung speichern.", {
        target: "#reviewPanel",
        button: "Zur freien Antwort",
        onButton: () => {
          api.focusReviewLast();
          const input = $("#reviewQuestions .reviewQuestion:last-child .manualPoints");
          freeRegion = input?.closest(".reviewQuestion") || null;
          coach("grade", "Dein Urteil zählt.", "Prüfe die Antwort, passe bei Bedarf die Punkte an und klicke dann auf „Bewertung speichern“.", {
            target: "#saveReview",
            interactiveTarget: true
          });
          if (input) input.classList.add("gcTourAllowedInput");
        }
      });
      return;
    }

    if (event === "review-saved" && stage === "review" && data.submissionId === submissionId) {
      freeRegion = null;
      stage = "finish";
      coach("guide", "Jetzt gehörst du zur Crew.", "Du hast einen Test erstellt, Hinweise geprüft, mit Emmi überarbeitet, eine Variante ergänzt, selbst teilgenommen und mit Wilma bewertet.", {
        button: "Tour abschließen",
        onButton: () => stop({ done: true }),
        centered: true,
        body: '<div class="gcCoachFinishFlow"><span>Erstellen</span><b>→</b><span>Überarbeiten</span><b>→</b><span>Durchführen</span><b>→</b><span>Bewerten</span></div>'
      });
    }
  }

  async function create() {
    if (!owned() || stage !== "form" || busy) return;
    busy = true;
    const token = run;
    stage = "creating";
    coach("create", "Ich erstelle deinen Test …", "Aus deinen Angaben entsteht jetzt der erste Entwurf. Danach wird er geprüft, bevor wir ihn gemeinsam ansehen.", {
      target: "#aiProgress",
      body: '<div class="gcTourWorking"><span></span><span></span><span></span><small>10 Aufgaben · 3 Bilder · wird geprüft</small></div>'
    });
    let delay;
    const wait = new Promise(resolve => { delay = setTimeout(resolve, 3000); });
    try {
      const created = quizId || await api.createDemo(DEMO_TEST);
      if (owned() && token === run) quizId = created;
      await wait;
      if (!owned() || token !== run) return;
      quizId = created;
      await api.openEditor(created);
      if (!owned() || token !== run) return;
      if (!api.isEditor(created)) throw new Error("Der Übungstest konnte nicht geöffnet werden.");
      beginDraftReview();
    } catch (err) {
      if (owned() && token === run) {
        stage = "form";
        error(err?.message || "Der Übungstest konnte nicht vorbereitet werden.", create);
      }
    } finally {
      clearTimeout(delay);
      if (token === run) busy = false;
    }
  }

  function dashboard({ uid, firstVisit }) {
    if (active) return;
    if (owner && owner !== uid) stop();
    owner = uid;
    suppressLegacyGuides();
    let button = $("#gradecrewTourBtn");
    if (!button) {
      button = document.createElement("button");
      button.id = "gradecrewTourBtn";
      button.type = "button";
      button.className = "button ghost";
      $(".dashboardActions")?.append(button);
    }
    button.textContent = "Mit der Crew starten";
    button.onclick = start;
    if (firstVisit && !offered.has(uid)) {
      offered.add(uid);
      let done = false;
      try { done = localStorage.getItem(doneKey()) === "done"; } catch {}
      if (!done) window.setTimeout(start, 350);
    }
  }

  document.addEventListener("gradecrew:variant-dialog-opened", event => {
    if (!owned() || stage !== "variant") return;
    void prepareVariantDialog(event.detail?.dialog || null);
  });
  document.addEventListener("gradecrew:variant-submitted", () => variantSubmitted());

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "./gradecrew-tour.css?v=2.3.1-gc14";
  document.head.append(style);
  addEventListener("resize", schedulePlace, { passive: true });
  addEventListener("scroll", schedulePlace, { passive: true, capture: true });
  document.addEventListener("gradecrew:account-changed", () => stop());

  return {
    start,
    dashboard,
    notify,
    stop,
    create,
    get active() { return owned(); },
    get creating() { return owned() && ["form-intro", "form-filling", "image-choice", "form", "creating"].includes(stage); },
    ownsQuiz: id => owned() && quizId === id,
    preparedResponse
  };
}
