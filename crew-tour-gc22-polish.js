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

function clearFocus() {
  document.querySelectorAll(".gc22TutorialFocus, .gc22ReviewFocus").forEach(node =>
    node.classList.remove("gc22TutorialFocus", "gc22ReviewFocus"));
}

function installStyles() {
  if (document.querySelector("style[data-gc22-tour-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gc22TourPolish = "1";
  style.textContent = `
    .gc22TutorialFocus{
      position:relative!important;
      z-index:1202!important;
      outline:3px solid #2f64d6!important;
      outline-offset:5px!important;
      border-radius:10px;
      background:#fff!important;
      box-shadow:0 0 0 6px rgba(255,255,255,.96),0 12px 34px rgba(47,100,214,.16)!important
    }
    .gc22ReviewFocus{
      outline:3px solid #4fa57d!important;
      outline-offset:6px!important;
      border-radius:14px;
      background:#fbfffd!important;
      scroll-margin-block:160px
    }
    .gc22FinaleResult{
      margin:14px 0 4px;padding:12px 14px;border:1px solid #cce2d7;border-radius:13px;
      background:#f3faf6;color:#315b50;font-size:13px;line-height:1.5
    }
    .gc22FinaleResult strong{display:block;margin-bottom:3px;color:#173b36;font-size:14px}
    .gc22SaveHint{
      margin:12px 0 4px;padding:10px 12px;border-radius:11px;background:#eef5ff;
      color:#315b8d;font-size:12px;line-height:1.45
    }
    .gc22PreferenceHint{
      margin:12px 0 4px;padding:10px 12px;border-radius:11px;background:#f4f8f6;
      color:#466159;font-size:12px;line-height:1.45
    }
  `;
  document.head.appendChild(style);
}

function patchPreferencesCoach(coach) {
  if (coach.dataset.gc22Preferences === "1") return;
  coach.dataset.gc22Preferences = "1";

  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  const originalButton = coach.querySelector(".gcCoachNext");
  const ownWishes = document.getElementById("aiCustomNotes");
  const preferences = document.querySelector(".gradecrewPreferenceDetails");
  const preferenceSummary = preferences?.querySelector(":scope > summary");
  if (!title || !copy || !originalButton || !ownWishes || !preferenceSummary) return;

  // Keep the just-filled test wishes visible first. The original V7 action is
  // retained off-DOM and only executed after the second explanation.
  const continueButton = originalButton.cloneNode(true);
  originalButton.replaceWith(continueButton);
  document.getElementById("aiPersonalPreferences")?.classList.remove("gcTourTarget");
  ownWishes.classList.add("gc22TutorialFocus");
  preferences.open = false;

  title.textContent = "Passt das so?";
  copy.textContent = "Das sind unsere Wünsche für genau diesen Test. Schau sie dir kurz an – so kannst du GradeCrew sehr konkret sagen, was dir wichtig ist.";
  continueButton.textContent = "Wünsche übernehmen";

  continueButton.addEventListener("click", () => {
    ownWishes.classList.remove("gc22TutorialFocus");
    preferenceSummary.classList.add("gc22TutorialFocus");
    title.textContent = "Noch ein Tipp für später.";
    copy.textContent = "„Eigene Wünsche“ gelten nur für diesen Test. Unter „Persönliche KI-Vorgaben“ kannst du dagegen Vorlieben hinterlegen, die GradeCrew bei deinen künftigen KI-Tests berücksichtigt.";
    continueButton.textContent = "Verstanden – weiter";
    continueButton.replaceWith(continueButton.cloneNode(true));
    const finalButton = coach.querySelector(".gcCoachNext");
    finalButton.addEventListener("click", () => {
      preferenceSummary.classList.remove("gc22TutorialFocus");
      originalButton.click();
    }, { once: true });
  }, { once: true });
}

function patchBadFeedback(coach) {
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  if (!title || !copy) return;
  title.textContent = "Schauen wir noch auf den zweiten Hinweis.";
  copy.textContent = "Bei „gelb“ ist versehentlich „blue“ als richtige Lösung markiert. Natürlich kannst du das direkt auf „yellow“ (gelb) ändern. Hier üben wir, wie du einen Fehler mit dem roten Smiley meldest.";
}

function patchThankEmmi(coach) {
  const button = coach.querySelector(".gcCoachNext");
  if (button?.textContent?.trim() === "Weiter mit Coco") button.textContent = "Weiter";
}

function patchSettingsCoach(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  coach.classList.add("gc22SettingsCoach");
  copy.textContent = "Das sind die Einstellungen dieses Tests – nicht deine allgemeinen Einstellungen im Hauptmenü. Hier legst du zum Beispiel Zeit, Startmodus, Reihenfolge und Ergebnisanzeige fest. Für unseren Probetest sind eine Minute und eine feste Aufgabenreihenfolge eingestellt.";
}

function patchPublishCoach(coach) {
  const copy = paragraph(coach);
  if (!copy || coach.querySelector(".gc22SaveHint")) return;
  copy.textContent = "Klicke jetzt auf „Veröffentlichen“. Dadurch entsteht der Zugang für deine Klasse.";
  const note = document.createElement("div");
  note.className = "gc22SaveHint";
  note.innerHTML = "💾 <strong>Speichern nicht vergessen:</strong> Du kannst jederzeit separat speichern. Beim Veröffentlichen speichert GradeCrew den aktuellen Stand automatisch mit.";
  coach.insertBefore(note, coach.querySelector(".gcCoachNext") || coach.querySelector("small"));
}

function patchIdentityCoach(coach) {
  const title = coach.querySelector("h2");
  if (!title || !/Wie heißt du eigentlich/.test(title.textContent || "")) return;
  title.textContent = "Wie soll ich dich nennen?";
  const ps = [...coach.querySelectorAll(":scope > p")];
  if (ps[0]) ps[0].innerHTML = "Ich bin Coco – und du?<br>Ich darf doch du sagen, oder?";
  ps.find(node => /Schülerinnen|Kürzel/.test(node.textContent || ""))?.remove();
  const label = coach.querySelector(".gcNamePrompt");
  const input = label?.querySelector("input");
  if (label?.firstChild?.nodeType === Node.TEXT_NODE) label.firstChild.textContent = "Dein Name";
  if (input) input.placeholder = "z. B. Martin";
}

function finaleSentence(points) {
  if (points >= 2) return "Stark – die komplette Crew war in der richtigen Reihenfolge. Alle vier sitzen!";
  if (points >= 1.5) return "Fast komplett: Drei von vier Crew-Mitgliedern waren an der richtigen Stelle.";
  if (points >= 1) return "Schon ziemlich gut: Zwei von vier Crew-Mitgliedern saßen in der richtigen Reihenfolge.";
  if (points >= 0.5) return "Eins sitzt schon – und spätestens jetzt kennst du die ganze Crew.";
  return "Diesmal war noch keine Position richtig – kein Problem: Jetzt kennst du die Crew auf jeden Fall.";
}

function patchReviewCoach(coach) {
  if (coach.dataset.gc22Review === "1") return;
  coach.dataset.gc22Review = "1";
  const title = coach.querySelector("h2");
  const copy = paragraph(coach);
  const originalButton = coach.querySelector(".gcCoachNext");
  if (!title || !copy || !originalButton) return;

  const reviewCards = [...document.querySelectorAll("#reviewQuestions .reviewQuestion")];
  const finaleCard = reviewCards.find(card => /Crew-Finale/.test(card.textContent || ""));
  const finaleInput = finaleCard?.querySelector(".manualPoints");
  if (!finaleCard || !finaleInput) return;

  clearFocus();
  finaleCard.classList.add("gc22ReviewFocus");
  finaleCard.scrollIntoView({ block: "center", behavior: "instant" });
  const points = Math.max(0, Math.min(2, Number(finaleInput.value) || 0));

  const nextButton = originalButton.cloneNode(true);
  originalButton.replaceWith(nextButton);
  title.textContent = "Erst unser Crew-Finale.";
  copy.textContent = "Alles Eindeutige hat GradeCrew bereits automatisch bewertet. Schauen wir zuerst, wie gut du dir die Reihenfolge unserer Crew gemerkt hast.";
  const result = document.createElement("div");
  result.className = "gc22FinaleResult";
  result.innerHTML = `<strong>${points.toLocaleString("de-DE")} von 2 Punkten</strong>${finaleSentence(points)}`;
  coach.insertBefore(result, nextButton);
  nextButton.textContent = "Weiter zur freien Antwort";
  nextButton.addEventListener("click", () => {
    finaleCard.classList.remove("gc22ReviewFocus");
    originalButton.click();
  }, { once: true });
}

function patchCoach(coach) {
  if (!(coach instanceof Element) || !coach.classList.contains("gcRealCoach")) return;
  const title = heading(coach);
  if (title === "Stopp – ein kleiner Unterschied!") patchPreferencesCoach(coach);
  else if (title === "Hier stimmt die Lösung nicht.") patchBadFeedback(coach);
  else if (title === "Danke, Emmi!") patchThankEmmi(coach);
  else if (title === "So ist unser Probetest eingestellt.") patchSettingsCoach(coach);
  else if (title === "Schwupps – dein Test ist bereit!") patchPublishCoach(coach);
  else if (title === "Wie heißt du eigentlich?") patchIdentityCoach(coach);
  else if (title === "Automatisch, wo es eindeutig ist – du entscheidest beim Rest.") patchReviewCoach(coach);
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

export function installGc22TourPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installObserver();
  document.addEventListener("gradecrew:account-changed", clearFocus);
}

installGc22TourPolish();
