let installed = false;

function tourActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function heading(coach) {
  return coach?.querySelector("h2")?.textContent?.trim() || "";
}

function paragraph(coach) {
  return coach?.querySelector(":scope > p");
}

function clearReviewPresentation() {
  document.querySelectorAll(".gc23ReviewFocus, .gc23SaveReviewFloating").forEach(node =>
    node.classList.remove("gc23ReviewFocus", "gc23SaveReviewFloating"));
  document.querySelectorAll(".gc23FreeAnswerCoach").forEach(node => node.classList.remove("gc23FreeAnswerCoach"));
}

function clearFocus() {
  document.querySelectorAll(".gc23TutorialFocus").forEach(node => node.classList.remove("gc23TutorialFocus"));
  clearReviewPresentation();
}

function installStyles() {
  if (document.querySelector("style[data-gc23-tour-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gc23TourPolish = "1";
  style.textContent = `
    .gc23TutorialFocus{
      position:relative!important;
      z-index:1202!important;
      outline:3px solid #2f64d6!important;
      outline-offset:5px!important;
      border-radius:10px;
      background:#fff!important;
      box-shadow:0 0 0 6px rgba(255,255,255,.96),0 12px 34px rgba(47,100,214,.16)!important
    }
    .gc23ReviewFocus{
      outline:3px solid #4fa57d!important;
      outline-offset:6px!important;
      border-radius:14px;
      background:#fbfffd!important;
      scroll-margin-block:180px
    }
    .gc23FinaleResult{
      margin:14px 0 4px;padding:12px 14px;border:1px solid #cce2d7;border-radius:13px;
      background:#f3faf6;color:#315b50;font-size:13px;line-height:1.5
    }
    .gc23FinaleResult strong{display:block;margin-bottom:3px;color:#173b36;font-size:14px}
    .gc23SaveHint{
      margin:12px 0 4px;padding:10px 12px;border-radius:11px;background:#eef5ff;
      color:#315b8d;font-size:12px;line-height:1.45
    }
    .gc23FreeAnswerCoach{
      position:fixed!important;
      left:auto!important;
      right:24px!important;
      top:50%!important;
      transform:translateY(-50%)!important;
      max-width:min(360px,calc(100vw - 32px))!important
    }
    #saveReview.gc23SaveReviewFloating{
      position:fixed!important;
      right:36px!important;
      bottom:28px!important;
      z-index:1205!important;
      box-shadow:0 0 0 5px rgba(255,255,255,.96),0 12px 30px rgba(47,100,214,.2)!important
    }
    @media(max-width:900px){
      .gc23FreeAnswerCoach{right:12px!important;top:auto!important;bottom:88px!important;transform:none!important;max-width:calc(100vw - 24px)!important}
      #saveReview.gc23SaveReviewFloating{right:18px!important;bottom:18px!important}
      .gc23ReviewFocus{scroll-margin-block:280px}
    }
  `;
  document.head.appendChild(style);
}

function patchPreferencesCoach(coach) {
  if (coach.dataset.gc23Preferences === "1") return;
  coach.dataset.gc23Preferences = "1";

  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  const originalButton = coach.querySelector(".gcCoachNext");
  const ownWishes = document.getElementById("aiCustomNotes");
  const preferences = document.querySelector(".gradecrewPreferenceDetails");
  const preferenceSummary = preferences?.querySelector(":scope > summary");
  if (!title || !copy || !originalButton || !ownWishes || !preferenceSummary) return;

  const continueButton = originalButton.cloneNode(true);
  originalButton.replaceWith(continueButton);
  document.getElementById("aiPersonalPreferences")?.classList.remove("gcTourTarget");
  ownWishes.classList.add("gc23TutorialFocus");
  preferences.open = false;

  title.textContent = "Passt das so?";
  copy.textContent = "Das sind unsere Wünsche für genau diesen Test. Schau sie dir kurz an – so kannst du GradeCrew sehr konkret sagen, was dir wichtig ist.";
  continueButton.textContent = "Wünsche übernehmen";

  continueButton.addEventListener("click", () => {
    ownWishes.classList.remove("gc23TutorialFocus");
    preferenceSummary.classList.add("gc23TutorialFocus");
    title.textContent = "Noch ein Tipp für später.";
    copy.textContent = "„Eigene Wünsche“ gelten nur für diesen Test. Unter „Vorgaben für Remy“ kannst du dagegen Vorlieben hinterlegen, die GradeCrew bei deinen künftigen KI-Tests berücksichtigt.";
    continueButton.textContent = "Verstanden – weiter";
    continueButton.replaceWith(continueButton.cloneNode(true));
    const finalButton = coach.querySelector(".gcCoachNext");
    finalButton.addEventListener("click", () => {
      preferenceSummary.classList.remove("gc23TutorialFocus");
      originalButton.click();
    }, { once: true });
  }, { once: true });
}

function patchGoodFeedback(coach) {
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  if (!title || !copy) return;
  title.textContent = "Probier den grünen Smiley aus.";
  copy.textContent = "Mit den Smileys zeigst du mir, welche Aufgaben du gerne magst – und welche eher nicht. Klicke hier einmal auf den grünen Smiley. In dieser Tour üben wir nur; deine Auswahl wird nicht gespeichert.";
}

function patchSecondWarning(coach) {
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  if (!title || !copy) return;
  title.textContent = "Ach stimmt – da war ja noch was!";
  copy.textContent = "Bevor wir fertig sind: Ich hatte links noch einen zweiten Hinweis markiert. Den schauen wir uns schnell noch an.";
}

function patchBadFeedback(coach) {
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  if (!title || !copy) return;
  title.textContent = "Schauen wir noch auf den zweiten Hinweis.";
  copy.textContent = "Bei „gelb“ ist versehentlich „blue“ als richtige Lösung markiert. Natürlich kannst du das direkt auf „yellow“ (gelb) ändern. Hier üben wir, wie du einen Fehler mit dem roten Smiley meldest.";
}

function patchBadFeedbackPanel(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Du könntest die Lösung auch einfach auf „yellow“ (gelb) ändern. Hier üben wir das Melden: Den Grund habe ich schon eingetragen. Du kannst die Aufgabe nur melden, neu erstellen lassen oder entfernen. Wir wählen jetzt „Melden & entfernen“.";
}

function patchThankEmmi(coach) {
  const copy = paragraph(coach);
  const button = coach.querySelector(".gcCoachNext");
  if (copy) copy.textContent = "Aus Remys erstem Entwurf ist jetzt unser eigener, geprüfter Test geworden: eine Aufgabe überarbeitet, eine Variante ergänzt und eine fehlerhafte Aufgabe entfernt – und am Ende stehen wieder zehn Aufgaben. So schnell kann aus einem ersten Entwurf ein passender Test werden.";
  if (button) button.textContent = "Weiter";
}

function patchWilmaIntro(coach) {
  const copy = paragraph(coach);
  const button = coach.querySelector(".gcCoachNext");
  if (copy) copy.textContent = "Bevor wir den Test freigeben, schauen wir uns doch kurz die Einstellungen für unseren Test an. Danach probierst du ihn selbst aus.";
  if (button) button.textContent = "Testeinstellungen ansehen";
}

function patchSettingsCoach(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Das sind die Einstellungen dieses Tests – nicht deine allgemeinen Einstellungen im Hauptmenü. Hier legst du zum Beispiel Zeit, Startmodus, Reihenfolge und Ergebnisanzeige fest. Für unseren Probetest sind eine Minute und eine feste Aufgabenreihenfolge eingestellt.";
}

function patchPublishCoach(coach) {
  const copy = paragraph(coach);
  if (!copy || coach.querySelector(".gc23SaveHint")) return;
  copy.textContent = "Klicke jetzt auf „Veröffentlichen“. Dadurch entsteht der Zugang für deine Klasse.";
  const note = document.createElement("div");
  note.className = "gc23SaveHint";
  note.innerHTML = "💾 <strong>Speichern nicht vergessen:</strong> Du kannst jederzeit separat speichern. Beim Veröffentlichen speichert GradeCrew den aktuellen Stand automatisch mit.";
  coach.insertBefore(note, coach.querySelector(".gcCoachNext") || coach.querySelector("small"));
}

function patchIdentityCoach(coach) {
  const title = coach.querySelector("h2");
  if (!title) return;
  title.textContent = "Ach, fast vergessen!";
  const ps = [...coach.querySelectorAll(":scope > p")];
  if (ps[0]) ps[0].textContent = "Wie unhöflich von mir – ich habe dich noch gar nicht gefragt, wie ich dich nennen darf. Ich darf doch du sagen, oder?";
  ps.slice(1).forEach(node => node.remove());
  const label = coach.querySelector(".gcNamePrompt");
  const input = label?.querySelector("input");
  if (label?.firstChild?.nodeType === Node.TEXT_NODE) label.firstChild.textContent = "Wie soll ich dich nennen?";
  if (input) input.placeholder = "z. B. Martin, Herr Löffler oder ML";
}

function finaleSentence(points) {
  if (points >= 2) return "Stark – die komplette Crew war in der richtigen Reihenfolge. Alle vier sitzen!";
  if (points >= 1.5) return "Fast komplett: Drei von vier Crew-Mitgliedern waren an der richtigen Stelle.";
  if (points >= 1) return "Schon ziemlich gut: Zwei von vier Crew-Mitgliedern saßen an der richtigen Stelle.";
  if (points >= 0.5) return "Eins sitzt schon – und spätestens jetzt kennst du die ganze Crew.";
  return "Diesmal war noch keine Position richtig – spätestens jetzt kennst du die Crew aber auf jeden Fall.";
}

function patchFreeAnswerCoach(coach) {
  if (coach.dataset.gc23FreeAnswer === "1") return;
  coach.dataset.gc23FreeAnswer = "1";
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  const reviewCards = [...document.querySelectorAll("#reviewQuestions .reviewQuestion")];
  const freeCard = reviewCards.find(card => /Write one colour in English|Punkte für Aufgabe 5/i.test(card.textContent || ""));
  const saveButton = document.getElementById("saveReview");
  if (!title || !copy || !freeCard || !saveButton) return;

  clearReviewPresentation();
  freeCard.classList.add("gc23ReviewFocus");
  saveButton.classList.add("gc23SaveReviewFloating");
  coach.classList.add("gc23FreeAnswerCoach");
  title.textContent = "Dein Urteil zählt.";
  copy.textContent = "Hier ist die freie Antwort aus Aufgabe 5. Prüfe sie und passe bei Bedarf die Punkte an. Wenn alles passt, speichere deine Bewertung mit dem markierten Button.";
  queueMicrotask(() => freeCard.isConnected && freeCard.scrollIntoView({ block: "center", behavior: "instant" }));
}

function patchReviewCoach(coach) {
  if (coach.dataset.gc23Review === "1") return;
  coach.dataset.gc23Review = "1";
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  const originalButton = coach.querySelector(".gcCoachNext");
  if (!title || !copy || !originalButton) return;

  const reviewCards = [...document.querySelectorAll("#reviewQuestions .reviewQuestion")];
  const finaleCard = reviewCards.find(card => /Crew-Finale/.test(card.textContent || ""));
  const finaleInput = finaleCard?.querySelector(".manualPoints");
  if (!finaleCard || !finaleInput) return;

  clearReviewPresentation();
  finaleCard.classList.add("gc23ReviewFocus");
  finaleCard.scrollIntoView({ block: "center", behavior: "instant" });
  const points = Math.max(0, Math.min(2, Number(finaleInput.value) || 0));

  const nextButton = originalButton.cloneNode(true);
  originalButton.replaceWith(nextButton);
  title.textContent = "Erst unser Crew-Finale.";
  copy.textContent = "Alles Eindeutige hat GradeCrew bereits automatisch bewertet. Schauen wir zuerst, wie gut du dir die Reihenfolge unserer Crew gemerkt hast.";
  const result = document.createElement("div");
  result.className = "gc23FinaleResult";
  result.innerHTML = `<strong>${points.toLocaleString("de-DE")} von 2 Punkten</strong>${finaleSentence(points)}`;
  coach.insertBefore(result, nextButton);
  nextButton.textContent = "Weiter zur freien Antwort";
  nextButton.addEventListener("click", () => {
    finaleCard.classList.remove("gc23ReviewFocus");
    originalButton.click();
    // V7 briefly targets the save button while opening the next scene. Move the
    // viewport back to the actual free-response card before the browser paints.
    queueMicrotask(() => {
      const current = [...document.querySelectorAll(".gcRealCoach")].at(-1);
      if (heading(current) === "Dein Urteil zählt.") patchFreeAnswerCoach(current);
    });
  }, { once: true });
}

function patchCoach(coach) {
  if (!(coach instanceof Element) || !coach.classList.contains("gcRealCoach")) return;
  const title = heading(coach);
  if (title === "Stopp – ein kleiner Unterschied!") patchPreferencesCoach(coach);
  else if (title === "Diese Aufgabe gefällt uns.") patchGoodFeedback(coach);
  else if (title === "Ein Hinweis wartet noch auf uns.") patchSecondWarning(coach);
  else if (title === "Hier stimmt die Lösung nicht.") patchBadFeedback(coach);
  else if (title === "Fehler melden und entfernen.") patchBadFeedbackPanel(coach);
  else if (title === "Danke, Emmi!") patchThankEmmi(coach);
  else if (title === "Hallo, ich bin Wilma!") patchWilmaIntro(coach);
  else if (title === "So ist unser Probetest eingestellt.") patchSettingsCoach(coach);
  else if (title === "Schwupps – dein Test ist bereit!") patchPublishCoach(coach);
  else if (title === "Wie heißt du eigentlich?") patchIdentityCoach(coach);
  else if (title === "Automatisch, wo es eindeutig ist – du entscheidest beim Rest.") patchReviewCoach(coach);
  else if (title === "Dein Urteil zählt.") patchFreeAnswerCoach(coach);
  else if (title === "Super – du gehörst jetzt zur Crew!") clearReviewPresentation();
}

function installObserver() {
  document.querySelectorAll(".gcRealCoach").forEach(patchCoach);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) queueMicrotask(() => patchCoach(node));
        node.querySelectorAll?.(".gcRealCoach").forEach(coach => queueMicrotask(() => patchCoach(coach)));
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true });
}

export function installGc23TourPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installObserver();
  document.addEventListener("gradecrew:account-changed", clearFocus);
}

installGc23TourPolish();

