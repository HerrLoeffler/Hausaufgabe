const CAT_IMAGE = "/assets/gradecrew/demo-cat.jpg";
let installed = false;
let beforeVariantIds = null;
let heldDeleteCoach = null;
let currentVariantCard = null;

function tourActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function text(node, selector, value) {
  const target = node?.querySelector(selector);
  if (target) target.textContent = value;
  return target;
}

function addOnce(parent, className, html, before = null) {
  if (!parent || parent.querySelector(`.${className}`)) return;
  const node = document.createElement("div");
  node.className = className;
  node.innerHTML = html;
  if (before) parent.insertBefore(node, before);
  else parent.append(node);
}

function installStyles() {
  if (document.querySelector("style[data-gc-tour-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gcTourPolish = "1";
  style.textContent = `
    .gcCoachThanks { text-align:center !important; }
    .gcCoachThanks .gcThanksFaces { justify-content:center; }
    .gcCoachThanks .gcCoachNext { margin-inline:auto; }
    .gcTourMaterialTip{margin:12px 0 4px;padding:11px 12px;border:1px solid #dce6f4;border-radius:12px;background:#f7faff;color:#526277;font-size:12px;line-height:1.5}
    .gcTourProductIntro{margin:12px 0 0;padding:12px 14px;border-radius:13px;background:#f4f8f6;color:#35564d;font-size:13px;line-height:1.55;text-align:left}
    .gcEditSuccessPreview{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:stretch;margin:16px 0 18px}
    .gcEditSuccessCard{border:1px solid #dfe6ee;border-radius:15px;background:#fff;padding:11px;display:grid;gap:8px;text-align:left}
    .gcEditSuccessCard.after{background:#f5fbf8;border-color:#cde5d9}
    .gcEditSuccessCard small{font-weight:800;color:#6a7b74}.gcEditSuccessCard strong{font-size:13px;color:#203c39;line-height:1.35}
    .gcEditSuccessCard img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;border:1px solid #e3e7ec}
    .gcEditSuccessChoices{display:flex;gap:5px;flex-wrap:wrap}.gcEditSuccessChoices span{font-size:10px;border:1px solid #d9e1ea;border-radius:999px;padding:4px 7px;background:#fff;color:#4c5f70}.gcEditSuccessChoices .correct{border-color:#83c8a8;background:#edf9f2;color:#246445;font-weight:800}
    .gcEditSuccessArrow{align-self:center;font-size:25px;color:#6f8192}
    .gcVariantApplyCoach{left:auto!important;right:24px!important;top:108px!important;transform:none!important;max-width:360px}
    .gcTutorialVariantReview{margin:10px 0 0;padding:12px;border-radius:13px;border:1px solid #cfe2d8;background:#f5fbf8;display:grid;gap:9px}
    .gcTutorialVariantReview img{width:100%;max-height:220px;object-fit:cover;border-radius:11px}
    .gcTutorialVariantReview strong{font-size:14px;color:#173b36}.gcTutorialVariantReview p{margin:0!important;font-size:12px!important}
    .gcTutorialCatFigure{margin:10px 0 14px}.gcTutorialCatFigure img{display:block;width:min(100%,420px);max-height:300px;object-fit:cover;border-radius:14px;border:1px solid #e1e7ed;box-shadow:0 10px 24px rgba(24,45,70,.08)}
    .gcTutorialVariantCard{outline:3px solid #4fa57d!important;outline-offset:5px!important;scroll-margin-top:150px}
    .gcTourCoachHeld{visibility:hidden!important;pointer-events:none!important}
    .gcTutorialVariantKeepBar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:10px 12px;border:1px solid #b9d9ca;border-radius:12px;background:#f1faf5;color:#315b50}
    .gcTutorialVariantKeepBar strong{font-size:12px}.gcTutorialVariantKeepBar button{min-height:38px}
    @media(max-width:700px){.gcEditSuccessPreview{grid-template-columns:1fr}.gcEditSuccessArrow{transform:rotate(90deg);justify-self:center}.gcVariantApplyCoach{right:10px!important;top:84px!important;max-width:calc(100vw - 20px)}}
  `;
  document.head.appendChild(style);
}

function enhanceCoach(coach) {
  if (!coach?.classList?.contains("gcRealCoach")) return;
  const heading = coach.querySelector("h2")?.textContent?.trim() || "";
  const paragraph = coach.querySelector(":scope > p");

  if (heading === "Willkommen bei GradeCrew.") {
    if (paragraph) paragraph.textContent = "GradeCrew ist deine Plattform, um digitale Leistungsnachweise, Tests und Übungen zu erstellen, durchzuführen und auszuwerten. Ich bin Coco und begleite dich jetzt einmal durch den gesamten Ablauf.";
    addOnce(coach, "gcTourProductIntro", "<strong>Vom ersten Entwurf bis zur Bewertung:</strong> Remy erstellt, Emmi überarbeitet, Wilma bewertet – und Coco führt dich durch die Crew.", coach.querySelector(".gcCoachNext"));
  }

  if (heading === "Wir bauen einen Test für Klasse 4.") {
    text(coach, "h2", "Wir bauen einen Englischtest für Klasse 4.");
    if (paragraph) paragraph.textContent = "Thema: Colours, animals & school things. Ich fülle die Angaben jetzt Schritt für Schritt für dich aus – inklusive Bildanzahl und eigener Wünsche.";
  }

  if (heading === "Bilder kann ich gleich mitplanen.") {
    if (paragraph) paragraph.textContent = "Für unseren Englischtest haben wir drei Aufgaben mit Bild ausgewählt. Bilder helfen besonders bei Wortschatz, Zuordnungen und anschaulichen Aufgaben.";
    addOnce(coach, "gcTourMaterialTip", "📎 <strong>Später kannst du auch eigene Materialien hochladen</strong> – zum Beispiel Arbeitsblätter, Texte, PDFs oder Fotos. So kann GradeCrew den Test noch passender zu deinem Unterricht erstellen.", coach.querySelector(".gcCoachNext"));
  }

  if (heading === "Alles klar.") {
    text(coach, "h2", "Perfekt – wir haben alle nötigen Informationen.");
    if (paragraph) paragraph.textContent = "Klicke jetzt auf „Test erstellen“. Remy erstellt daraus den ersten Entwurf und GradeCrew prüft ihn anschließend.";
  }

  if (heading === "Danke, Remy!") coach.classList.add("gcCoachThanks");

  if (heading === "Super – die KI-Überarbeitung hat geklappt.") {
    if (paragraph) paragraph.textContent = "Die Aufgabe ist jetzt auf Englisch formuliert. Hier siehst du direkt, was sich durch deinen Wunsch verändert hat.";
    if (!coach.querySelector(".gcEditSuccessPreview")) {
      const preview = document.createElement("div");
      preview.className = "gcEditSuccessPreview";
      preview.innerHTML = `
        <div class="gcEditSuccessCard"><small>Vorher · deutsch</small><strong>Was heißt „Hund“ auf Englisch?</strong><div class="gcEditSuccessChoices"><span>cat</span><span class="correct">dog</span><span>bird</span></div></div>
        <div class="gcEditSuccessArrow">→</div>
        <div class="gcEditSuccessCard after"><small>Nachher · englisch</small><strong>Choose the English word for „Hund“.</strong><div class="gcEditSuccessChoices"><span>cat</span><span class="correct">dog</span><span>bird</span></div></div>`;
      coach.insertBefore(preview, coach.querySelector(".gcCoachNext"));
    }
  }

  if (heading === "Die Katze-Variante ist fertig.") {
    coach.classList.add("gcVariantApplyCoach");
    if (paragraph) paragraph.textContent = "Klicke jetzt auf den blau markierten Button „1 Variante übernehmen“. Danach schauen wir uns die neue Katze-Aufgabe kurz an und bestätigen sie wie später im normalen Editor.";
  }
}

function polishVariantDialog(dialog) {
  if (!dialog || !tourActive()) return;
  const media = dialog.querySelector('[name="mediaKind"]');
  const mentor = dialog.querySelector(".gcTourVariantMentor");
  if (media) {
    const none = media.querySelector('option[value="none"]');
    if (none) none.textContent = "Mit Bild (Tutorial)";
  }
  if (mentor) {
    const small = mentor.querySelector("small");
    const p = mentor.querySelector("p");
    if (small) small.textContent = "Für die Katze ergänzen wir gleich auch ein Bild.";
    if (p && p.textContent.includes("ohne Bild")) p.textContent = p.textContent.replace("ohne Bild", "mit Bild");
  }
}

function decorateCatCard(card) {
  if (!card || card.querySelector(".gcTutorialCatFigure")) return;
  const qText = card.querySelector(".qText")?.value || card.textContent || "";
  if (!/Katze|cat/i.test(qText)) return;
  const grid = card.querySelector(".questionGrid") || card;
  const figure = document.createElement("div");
  figure.className = "gcTutorialCatFigure";
  figure.innerHTML = `<img src="${CAT_IMAGE}" alt="Sehr niedliche orangefarbene Katze">`;
  grid.after(figure);
}

function holdDeleteStepUntilVariantReviewed(card) {
  currentVariantCard = card;
  card.classList.add("gcTutorialVariantCard");
  decorateCatCard(card);
  if (!card.querySelector(".gcTutorialVariantKeepBar")) {
    const bar = document.createElement("div");
    bar.className = "gcTutorialVariantKeepBar";
    bar.innerHTML = `<div><strong>Neue KI-Variante</strong><div>Katze + Bild · kurz prüfen und bestätigen.</div></div><button type="button" class="button primary gcTutorialVariantKeep">✓ Variante behalten</button>`;
    card.querySelector(".questionTop")?.after(bar) || card.prepend(bar);
  }
  const coaches = [...document.querySelectorAll(".gcRealCoach")];
  const deleteCoach = coaches.find(node => /Ein Hinweis ist noch offen\.|Diesen Fehler brauchen wir nicht\./.test(node.querySelector("h2")?.textContent || ""));
  if (deleteCoach) {
    heldDeleteCoach = deleteCoach;
    deleteCoach.classList.add("gcTourCoachHeld");
  }
  card.scrollIntoView({ block: "center", behavior: "smooth" });
}

function releaseDeleteStep() {
  currentVariantCard?.classList.remove("gcTutorialVariantCard");
  currentVariantCard?.querySelector(".gcTutorialVariantKeepBar")?.remove();
  currentVariantCard = null;
  if (heldDeleteCoach) {
    heldDeleteCoach.classList.remove("gcTourCoachHeld");
    heldDeleteCoach = null;
  }
}

function decorateStudentCat() {
  if (!tourActive()) return;
  document.querySelectorAll("#studentQuestions .studentQuestion").forEach(section => {
    if (!/Katze|cat/i.test(section.textContent || "") || section.querySelector(".gcTutorialCatFigure")) return;
    const figure = document.createElement("div");
    figure.className = "gcTutorialCatFigure";
    figure.innerHTML = `<img src="${CAT_IMAGE}" alt="Sehr niedliche orangefarbene Katze">`;
    const head = section.querySelector(".studentQuestionHead");
    head?.after(figure);
  });
}

function detectAddedVariant() {
  if (!beforeVariantIds) return;
  const cards = [...document.querySelectorAll("#questionList .questionCard")];
  const added = cards.filter(card => card.dataset.id && !beforeVariantIds.has(card.dataset.id));
  beforeVariantIds = null;
  const cat = added.find(card => /Katze|cat/i.test(card.querySelector(".qText")?.value || card.textContent || "")) || added[0];
  if (cat) window.setTimeout(() => holdDeleteStepUntilVariantReviewed(cat), 80);
}

function installEvents() {
  // Registered before the guided tour installs its blocker; this one explicit
  // tutorial confirmation is therefore allowed while every unrelated click stays blocked.
  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const keep = target?.closest(".gcTutorialVariantKeep");
    if (keep && tourActive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      releaseDeleteStep();
      heldDeleteCoach?.querySelector(".gcCoachNext")?.focus?.();
      return;
    }
    const apply = target?.closest("#variantBackgroundProgress .applyVariants");
    if (apply && tourActive()) {
      beforeVariantIds = new Set([...document.querySelectorAll("#questionList .questionCard")].map(card => card.dataset.id).filter(Boolean));
      window.setTimeout(detectAddedVariant, 180);
    }
  }, true);

  document.addEventListener("gradecrew:variant-dialog-opened", event => {
    if (!tourActive()) return;
    window.setTimeout(() => polishVariantDialog(event.detail?.dialog), 1250);
  });
}

function installObservers() {
  const bodyObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) window.setTimeout(() => enhanceCoach(node), 0);
        node.querySelectorAll?.(".gcRealCoach").forEach(coach => enhanceCoach(coach));
      }
    }
  });
  if (document.body) bodyObserver.observe(document.body, { childList: true });

  const questionList = document.getElementById("questionList");
  if (questionList) new MutationObserver(() => {
    document.querySelectorAll("#questionList .questionCard").forEach(decorateCatCard);
  }).observe(questionList, { childList: true, subtree: true });

  const studentQuestions = document.getElementById("studentQuestions");
  if (studentQuestions) new MutationObserver(decorateStudentCat).observe(studentQuestions, { childList: true, subtree: true });
}

export function installCrewTourPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installEvents();
  installObservers();
}

installCrewTourPolish();
