let installed = false;

function heading(coach) {
  return coach?.querySelector("h2")?.textContent?.trim() || "";
}

function paragraph(coach) {
  return coach?.querySelector(":scope > p");
}

function installStyles() {
  if (document.querySelector("style[data-gc25-final-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gc25FinalPolish = "1";
  style.textContent = `
    .gcRealCoach.gc25InlineReviewCoach{
      position:relative!important;
      inset:auto!important;
      left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
      transform:none!important;
      width:min(760px,100%)!important;
      max-width:100%!important;
      max-height:none!important;
      margin:0 auto 18px!important;
      box-sizing:border-box!important;
      z-index:1204!important;
    }
    .gc25InlineReviewCoach .gcCoachIdentity{align-items:center}
    .gc25InlineReviewCoach + .reviewQuestion{scroll-margin-top:24px}
    .gc25ResponsiveReview{
      scroll-margin-top:24px!important;
      scroll-margin-bottom:130px!important;
    }
    .gradecrewPreferenceDetails>summary .gc25RemyPreferenceLabel{font-weight:inherit}
    @media(max-width:760px){
      .gcRealCoach.gc25InlineReviewCoach{
        width:100%!important;
        margin:0 0 14px!important;
        border-radius:16px!important;
      }
      .gc25InlineReviewCoach .gcCoachIdentity img{width:52px!important;height:58px!important}
      .gc25ResponsiveReview{scroll-margin-bottom:160px!important}
    }
    @media(max-height:680px) and (min-width:761px){
      .gcRealCoach:not(.gcCoachCentered){max-height:58dvh!important;overflow:auto!important}
      .gcRealCoach .gcCoachIdentity img{max-height:66px!important}
      .gcRealCoach p{margin-block:8px!important;line-height:1.45!important}
    }
  `;
  document.head.appendChild(style);
}

function relabelRemyPreferences() {
  const summary = document.querySelector(".gradecrewPreferenceDetails > summary");
  if (summary && summary.dataset.gc25Remy !== "1") {
    summary.dataset.gc25Remy = "1";
    summary.innerHTML = '<span class="gc25RemyPreferenceLabel">Vorgaben für Remy</span> <small>optional</small>';
  }
  const fieldLabel = document.querySelector(".gradecrewPreferenceDetails .aiNotesField");
  if (fieldLabel && fieldLabel.dataset.gc25Remy !== "1") {
    fieldLabel.dataset.gc25Remy = "1";
    for (const node of fieldLabel.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = "Was Remy bei meinen Tests beachten soll ";
        break;
      }
    }
  }
}

function patchImageHelp(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Für diesen Test wählen wir drei Bildaufgaben. Später kannst du mir auch eigene PDFs, Fotos, Arbeitsblätter oder Texte mitgeben – dann kann ich deinen Test noch genauer an dein Material anpassen.";
}

function patchPreferenceTip(coach) {
  if (coach.dataset.gc25PreferenceTip === "1") return;
  coach.dataset.gc25PreferenceTip = "1";
  const copy = paragraph(coach);
  if (copy) copy.textContent = "„Eigene Wünsche“ gelten nur für diesen Test. Unter „Vorgaben für Remy“ kannst du mir dagegen dauerhaft mitgeben, was dir bei deinen künftigen Tests wichtig ist.";
}

function patchTestSettings(coach) {
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  if (title) title.textContent = "So läuft unser Probetest.";
  if (copy) copy.textContent = "Hier stellst du Zeit, Start, Reihenfolge und Ergebnisanzeige ein. Für unseren Probetest bleiben eine Minute Zeit und eine feste Aufgabenreihenfolge eingestellt.";
}

function patchFinish(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  const lead = coach.querySelector(".gc24FinishLead");
  if (lead) lead.textContent = "Mit jedem Test wirst du vertrauter mit GradeCrew und findest schneller deinen Weg. So bleibt mehr Zeit für das, was zählt: Zuhören, miteinander lachen und für die Kinder da sein. Schön, dass du zur Crew gehörst!";
  const prompt = [...coach.querySelectorAll(".gc24FinishLead")].find(node => node !== lead && /Einstellungen/i.test(node.textContent || ""));
  if (prompt) prompt.textContent = "Wenn du möchtest, schauen wir vorher noch gemeinsam in die allgemeinen Einstellungen – dort legst du deine Standardwerte für neue Tests fest.";
}

function findFreeResponseCard() {
  return [...document.querySelectorAll("#reviewQuestions .reviewQuestion")]
    .find(card => /Write one colour in English|Punkte für Aufgabe 5/i.test(card.textContent || ""));
}

function makeReviewLayoutResponsive(coach) {
  const freeCard = findFreeResponseCard();
  if (!freeCard?.parentElement) return;
  const firstPlacement = coach.dataset.gc25InlineReview !== "1";
  if (coach.dataset.gc25InlineReview !== "1") {
    coach.dataset.gc25InlineReview = "1";
    coach.classList.remove("gc23FreeAnswerCoach");
    coach.classList.add("gc25InlineReviewCoach");
    freeCard.classList.add("gc25ResponsiveReview");

    // Keep the explanation in normal document flow directly above the answer.
    // It therefore cannot cover points or answer controls on notebooks, tablets
    // or phones, regardless of the viewport width.
    freeCard.parentElement.insertBefore(coach, freeCard);
  }
  // Opening the on-screen keyboard must not repeatedly recenter the card.
  if (!firstPlacement) return;
  coach.scrollIntoView({ block: "start", behavior: "instant" });
  requestAnimationFrame(() => {
    if (coach.isConnected) coach.scrollIntoView({ block: "start", behavior: "instant" });
  });
}

function patchReview(coach) {
  const copy = paragraph(coach);
  if (copy) copy.textContent = "Hier ist die freie Antwort aus Aufgabe 5. Prüfe sie in Ruhe und passe bei Bedarf die Punkte an. Wenn alles passt, speichere anschließend deine Bewertung.";
  makeReviewLayoutResponsive(coach);
}

function patchCoach(coach) {
  if (!(coach instanceof Element) || !coach.classList.contains("gcRealCoach")) return;
  const title = heading(coach);
  if (title === "Bilder plane ich direkt mit ein.") patchImageHelp(coach);
  else if (title === "Noch ein Tipp für später." || title === "Stopp – ein kleiner Unterschied!") patchPreferenceTip(coach);
  else if (title === "So ist unser Probetest eingestellt." || title === "So läuft unser Probetest.") patchTestSettings(coach);
  else if (title === "Dein Urteil zählt.") patchReview(coach);
  else if (title === "Super – du gehörst jetzt zur Crew!") patchFinish(coach);
}

function installObserver() {
  relabelRemyPreferences();
  document.querySelectorAll(".gcRealCoach").forEach(patchCoach);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      const changedCoach = record.target instanceof Element
        ? record.target.closest?.(".gcRealCoach")
        : record.target?.parentElement?.closest?.(".gcRealCoach");
      if (changedCoach && ["Noch ein Tipp für später.", "Stopp – ein kleiner Unterschied!"].includes(heading(changedCoach))) {
        queueMicrotask(() => patchPreferenceTip(changedCoach));
      }
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) queueMicrotask(() => patchCoach(node));
        node.querySelectorAll?.(".gcRealCoach").forEach(coach => queueMicrotask(() => patchCoach(coach)));
        if (node.matches?.("#aiView, .gradecrewPreferenceDetails") || node.querySelector?.(".gradecrewPreferenceDetails")) queueMicrotask(relabelRemyPreferences);
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
}

export function installGc25FinalPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installObserver();
  addEventListener("resize", () => {
    const coach = document.querySelector(".gc25InlineReviewCoach");
    if (coach) makeReviewLayoutResponsive(coach);
  }, { passive: true });
}

installGc25FinalPolish();
