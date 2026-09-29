let installed = false;

function heading(coach) {
  return coach?.querySelector("h2")?.textContent?.trim() || "";
}

function paragraph(coach) {
  return coach?.querySelector(":scope > p");
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function installStyles() {
  if (document.querySelector("style[data-gc24-tour-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gc24TourPolish = "1";
  style.textContent = `
    .gc24TimeHero{
      display:grid;grid-template-columns:auto auto 1fr;align-items:baseline;justify-content:center;
      gap:8px;margin:16px auto 12px;padding:13px 18px;border:1px solid #d7e3df;border-radius:15px;
      background:#f4f8f6;color:#49635d;max-width:560px;text-align:center
    }
    .gc24TimeHero strong{font-size:24px;line-height:1;color:#173b36;white-space:nowrap}
    .gc24FinishLead{margin:12px auto 0!important;max-width:590px;text-align:center;color:#536860!important}
    .gc24FinishChoice{margin-top:12px!important}
    .gc24SettingsGuide{
      position:fixed;z-index:1500;width:min(360px,calc(100vw - 28px));padding:22px;
      border:1px solid #d8e1df;border-radius:20px;background:#fffdf9;color:#173b36;
      box-shadow:0 24px 60px rgba(26,46,42,.18)
    }
    .gc24SettingsGuide .gc24GuideIdentity{display:flex;gap:12px;align-items:center;margin-bottom:12px}
    .gc24SettingsGuide img{width:64px;height:64px;object-fit:contain}
    .gc24SettingsGuide span{display:block;color:#61766f;font-size:12px}
    .gc24SettingsGuide h2{margin:2px 0 0;font-size:21px;line-height:1.15}
    .gc24SettingsGuide p{margin:10px 0 16px;color:#526861;line-height:1.5}
    .gc24SettingsGuide .gc24GuideActions{display:flex;gap:8px;flex-wrap:wrap}
    .gc24SettingsFocus{
      position:relative!important;z-index:1499!important;outline:3px solid #2f64d6!important;
      outline-offset:6px!important;border-radius:16px!important;background:#fff!important;
      box-shadow:0 0 0 9999px rgba(26,36,44,.36),0 14px 38px rgba(47,100,214,.17)!important
    }
    @media(max-width:720px){
      .gc24TimeHero{grid-template-columns:1fr;gap:4px}
      .gc24TimeHero strong{font-size:22px}
      .gc24SettingsGuide{left:14px!important;right:14px!important;bottom:14px!important;top:auto!important;width:auto!important}
    }
  `;
  document.head.appendChild(style);
}

function patchGoodFeedback(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Mit den Smileys zeigst du mir, welche Aufgaben du gerne magst – und welche vielleicht nicht so gerne. Probier hier einmal den grünen Smiley aus. In dieser Tour üben wir nur; deine Auswahl wird nicht gespeichert.";
}

function patchBadFeedback(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Bei „gelb“ ist versehentlich noch „blue“ als richtige Lösung markiert. Natürlich könntest du einfach „yellow“ als richtige Antwort markieren. Für unsere Übung sind wir mit der Aufgabe insgesamt nicht zufrieden – deshalb probieren wir jetzt den roten Smiley aus.";
}

function patchThankEmmi(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Geschafft: Wir haben einen Test erstellt, eine Aufgabe gezielt überarbeitet, aus einer anderen Aufgabe eine neue Variante gemacht und eine fehlerhafte Aufgabe entfernt. Und schon steht wieder ein kompletter Test mit zehn Aufgaben – nur besser auf uns zugeschnitten.";
}

function patchIdentity(coach) {
  const copy = paragraph(coach);
  if (!copy) return;
  copy.textContent = "Wie unhöflich von mir – ich habe dich noch gar nicht gefragt, wie ich dich nennen darf. Ich darf doch du sagen, oder?";
  const input = coach.querySelector(".gcNamePrompt input");
  if (input) input.placeholder = "z. B. Martin, Herr Löffler oder ML";
}

function removeDashboardEndActions(scope = document) {
  scope.querySelectorAll?.("#quizList .quizCard .end, #quizList .quizCard .reopen").forEach(button => button.remove());
}

function clearSettingsGuide() {
  document.querySelector(".gc24SettingsGuide")?.remove();
  document.querySelectorAll(".gc24SettingsFocus").forEach(node => node.classList.remove("gc24SettingsFocus"));
}

function placeGuide(guide, target) {
  if (!guide || !target) return;
  const rect = target.getBoundingClientRect();
  const width = Math.min(360, innerWidth - 28);
  const leftCandidate = rect.right + 22;
  const left = leftCandidate + width <= innerWidth - 14 ? leftCandidate : Math.max(14, rect.left - width - 22);
  const top = Math.max(84, Math.min(rect.top, innerHeight - guide.offsetHeight - 20));
  guide.style.left = `${Math.round(left)}px`;
  guide.style.top = `${Math.round(top)}px`;
}

function showMainSettingsGuide(step = 0) {
  clearSettingsGuide();
  const cards = [...document.querySelectorAll("#settingsView .settingsPageGrid > article")];
  const target = step === 0 ? cards[0] : cards[1];
  if (!target) return;
  target.classList.add("gc24SettingsFocus");
  target.scrollIntoView({ block: "center", behavior: "instant" });

  const guide = document.createElement("aside");
  guide.className = "gc24SettingsGuide";
  guide.innerHTML = step === 0
    ? `<div class="gc24GuideIdentity"><img src="/assets/gradecrew/owl-grade.svg" alt=""><div><span>Wilma · Bewerten</span><h2>Hier sparst du dir später Klicks.</h2></div></div><p>Diese Standardwerte gelten für neue Tests: Fach, Klassenstufe, Schülerhinweis und was nach der Abgabe angezeigt werden soll. Passe sie einmal an – GradeCrew füllt sie danach automatisch vor.</p><div class="gc24GuideActions"><button type="button" class="button primary gc24Next">Weiter</button></div>`
    : `<div class="gc24GuideIdentity"><img src="/assets/gradecrew/owl-grade.svg" alt=""><div><span>Wilma · Bewerten</span><h2>Und dein Notenschlüssel.</h2></div></div><p>Auch deinen Standard-Notenschlüssel kannst du hier hinterlegen. Neue Tests übernehmen ihn automatisch – und du kannst ihn im einzelnen Test trotzdem jederzeit ändern.</p><div class="gc24GuideActions"><button type="button" class="button primary gc24Done">Alles klar – viel Spaß beim Testen!</button></div>`;
  document.body.appendChild(guide);
  placeGuide(guide, target);
  if (step === 0) guide.querySelector(".gc24Next").addEventListener("click", () => showMainSettingsGuide(1));
  else guide.querySelector(".gc24Done").addEventListener("click", () => {
    clearSettingsGuide();
    document.getElementById("backFromSettings")?.click();
  });
}

async function openMainSettingsAfterFinish(finishAction) {
  try { finishAction?.(); } catch (error) { console.warn("GradeCrew-Tour konnte nicht sauber abgeschlossen werden.", error); }
  for (let i = 0; i < 80; i += 1) {
    if (!document.body.classList.contains("gcRealTourActive")) break;
    await wait(50);
  }
  document.getElementById("settingsTopBtn")?.click();
  for (let i = 0; i < 60; i += 1) {
    if (!document.getElementById("settingsView")?.classList.contains("hidden")) break;
    await wait(50);
  }
  if (!document.getElementById("settingsView")?.classList.contains("hidden")) showMainSettingsGuide(0);
}

function patchFinish(coach) {
  if (coach.dataset.gc24Finish === "1") return;
  coach.dataset.gc24Finish = "1";
  const copy = paragraph(coach);
  const choices = coach.querySelector(".gcFinishChoices");
  const primary = coach.querySelector(".gcCoachNext");
  if (!copy || !choices || !primary) return;

  const match = copy.textContent.match(/In\s+([^ ]+\s+Minuten)\s+hast du/i);
  const elapsed = match?.[1] || "kurzer Zeit";
  copy.innerHTML = `<span class="gc24TimeHero"><span>In</span><strong>${elapsed}</strong><span>hast du deinen ersten GradeCrew-Test einmal komplett erlebt.</span></span><span class="gc24FinishLead">Du hast erstellt, überarbeitet, selbst getestet und bewertet. Viel Spaß beim Erkunden von GradeCrew!</span>`;

  primary.textContent = "Eigenen Test erstellen";

  const oldButtons = [...choices.querySelectorAll("button")];
  const plainFinish = oldButtons.find(button => /Tour abschließen/i.test(button.textContent || ""));
  const finishAction = plainFinish?.onclick ? plainFinish.onclick.bind(plainFinish) : null;
  choices.replaceChildren();
  choices.classList.add("gc24FinishChoice");

  const prompt = document.createElement("p");
  prompt.className = "gc24FinishLead";
  prompt.textContent = "Oder wollen wir noch kurz gemeinsam in die allgemeinen Einstellungen schauen? Dort legst du Standardwerte für neue Tests fest.";
  coach.insertBefore(prompt, choices);

  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "button secondary";
  settings.textContent = "Zu den allgemeinen Einstellungen";
  settings.addEventListener("click", () => { void openMainSettingsAfterFinish(finishAction); });
  choices.appendChild(settings);
}

function patchCoach(coach) {
  if (!(coach instanceof Element) || !coach.classList.contains("gcRealCoach")) return;
  const title = heading(coach);
  if (title === "Probier den grünen Smiley aus." || title === "Diese Aufgabe gefällt uns.") patchGoodFeedback(coach);
  else if (title === "Schauen wir noch auf den zweiten Hinweis." || title === "Hier stimmt die Lösung nicht.") patchBadFeedback(coach);
  else if (title === "Danke, Emmi!") patchThankEmmi(coach);
  else if (title === "Ach, fast vergessen!" || title === "Wie heißt du eigentlich?") patchIdentity(coach);
  else if (title === "Super – du gehörst jetzt zur Crew!") patchFinish(coach);
}

function installObserver() {
  document.querySelectorAll(".gcRealCoach").forEach(patchCoach);
  removeDashboardEndActions();
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) queueMicrotask(() => patchCoach(node));
        node.querySelectorAll?.(".gcRealCoach").forEach(coach => queueMicrotask(() => patchCoach(coach)));
        if (node.matches?.("#quizList, .quizCard") || node.querySelector?.(".quizCard")) queueMicrotask(() => removeDashboardEndActions(node.matches?.("#quizList") ? node : document));
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
}

export function installGc24TourPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installObserver();
  document.addEventListener("gradecrew:account-changed", clearSettingsGuide);
}

installGc24TourPolish();
