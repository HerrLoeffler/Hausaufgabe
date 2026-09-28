// Event-driven practice journey. No network, AI jobs, publication or student records.
const TOUR_VERSION = "gradecrew-practice-v2";
const CREW = Object.freeze({
 guide: { name: "Pinguin", role: "Dein Guide", asset: "penguin-guide" },
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

const STEPS = ["Willkommen", "Die Crew", "Auftrag", "Prüfung", "Entwurf", "Verbessern", "Variante", "Einstellungen", "Schüleransicht", "Bewerten", "Freigeben", "Ergebnisse", "Geschafft"];
const offered = new Set();
let dialog, uid = "", step = 0, timer = 0, opener, draft, answers, submitted = false, reviewed = false;
const $ = selector => dialog.querySelector(selector);
const escape = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const key = () => `${TOUR_VERSION}:${uid}`;
const image = role => `<img src="/assets/gradecrew/${CREW[role].asset}.svg" alt="" width="100" height="100">`;
function reset() {
 draft = JSON.parse(JSON.stringify(DEMO_TEST));
 answers = {}; submitted = false; reviewed = false;
}
function cancelTimer() { clearTimeout(timer); timer = 0; }
function closeTour() {
 cancelTimer();
 if (dialog?.open) dialog.close();
 document.body.classList.remove("gcPracticeActive");
 opener?.focus?.();
}
function ensureDialog() {
 if (dialog) return;
 const style = document.createElement("link");
 style.rel = "stylesheet"; style.href = "./gradecrew-tour.css?v=2.3.1-gc10";
 document.head.append(style);
 dialog = document.createElement("dialog");
 dialog.id = "gradecrewPractice"; dialog.className = "gcPractice";
 dialog.setAttribute("aria-labelledby", "gcPracticeTitle");
 document.body.append(dialog);
 dialog.addEventListener("cancel", event => { event.preventDefault(); closeTour(); });
 dialog.addEventListener("close", cancelTimer);
 dialog.addEventListener("click", event => {
  const action = event.target.closest("[data-tour-action]")?.dataset.tourAction;
  if (action === "close") closeTour();
  if (action === "back") render(Math.max(0, step - 1));
  if (action === "next") advance();
  if (action === "improve") {
   draft.questions[3].text = "True or false: You can use a ruler to measure the length of your pencil.";
   render(step);
  }
  if (action === "variant") {
   if (draft.questions.length === 6) draft.questions.push({type:"single",text:"Which word means „grün“?",points:2,options:[{text:"green",correct:true},{text:"red",correct:false}]});
   render(step);
  }
 });
 dialog.addEventListener("input", event => {
  if (event.target.name?.startsWith("answer")) { answers[event.target.name] = event.target.value; reviewed = false; submitted = false; }
  if (event.target.id === "gcQuestionText") draft.questions[0].text = event.target.value;
 });
}
function content(role, title, text, body = "", next = "Weiter") {
 const member = CREW[role];
 dialog.innerHTML = `<header><span>Probedurchlauf · ${step + 1} / ${STEPS.length}</span><button type="button" data-tour-action="close" aria-label="Tutorial schließen">×</button></header>
 <progress max="${STEPS.length}" value="${step + 1}" aria-label="Fortschritt"></progress>
 <div class="gcPracticeSpeaker">${image(role)}<div><span>${member.name} · ${member.role}</span><h2 id="gcPracticeTitle" tabindex="-1">${title}</h2></div></div>
 <p>${text}</p><main>${body}</main><footer><small>Vorgefertigter Übungstest. Keine KI-Anfrage, keine Veröffentlichung.</small><div>${step ? '<button class="button ghost" type="button" data-tour-action="back">Zurück</button>' : ''}<button class="button primary" type="button" data-tour-action="next">${next}</button></div></footer>`;
 $("#gcPracticeTitle").focus({preventScroll:true});
 dialog.scrollTop = 0;
}
function questionList() {
 return `<ol class="gcPracticeQuestions">${draft.questions.map(q => `<li><strong>${escape(q.text)}</strong><small>${q.points} Punkte · ${escape(q.type)}</small></li>`).join("")}</ol>`;
}
function answerFields() {
 const fields = [
  ["Which word means „blau“?", ["blue", "green", "yellow"]],
  ["What is „pencil“ in German?", ["Bleistift", "Lineal", "Heft"]],
  ["Complete: My pencil is … (rot).", ["red", "blue", "green"]],
  ["You can use a ruler to measure your pencil.", ["True", "False"]],
  ["Choose the correct sentence.", ["My schoolbag is green.", "Green schoolbag my is."]],
  ["What is „Schultasche“ in English?", null]
 ];
 return fields.map(([label, options], i) => `<label>${i + 1}. ${label}${options ? `<select name="answer${i}"><option value="">Bitte auswählen</option>${options.map(o => `<option ${answers['answer'+i] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input name="answer${i}" value="${escape(answers['answer'+i] || '')}" autocomplete="off">`}</label>`).join('');
}
function score() {
 const expected = ["blue", "Bleistift", "red", "True", "My schoolbag is green."];
 return expected.reduce((sum, value, i) => sum + (answers['answer'+i] === value ? 2 : 0), 0) + (reviewed ? Number(answers.manualPoints || 0) : 0);
}
function render(index) {
 cancelTimer(); step = index;
 switch(step) {
 case 0:
  content("guide", "Einmal gemeinsam durch GradeCrew.", "Ich begleite dich vom ersten Auftrag bis zur Bewertung. Du probierst alle Schritte mit einem vorbereiteten Englisch-Test aus.", "<p>Deine bestehenden Tests bleiben unverändert. Du kannst jederzeit schließen und neu starten.</p>", "Crew kennenlernen"); break;
 case 1:
  content("guide", "Vier Kollegen, ein gemeinsamer Weg.", "Ich bleibe dein Guide. Der Elefant erstellt, der Fuchs verbessert und die Eule hilft beim Prüfen.", `<div class="gcPracticeCrew">${Object.entries(CREW).map(([role,m])=>`<div>${image(role)}<strong>${m.name}</strong><small>${m.role}</small></div>`).join('')}</div>`, "Test vorbereiten"); break;
 case 2:
  content("create", "Ich habe den Auftrag schon vorbereitet.", "Englisch, Klasse 5: Farben und Schulsachen. Bei einem echten KI-Test legst du hier Thema, Umfang und Wünsche fest. Für die Übung ist alles ausgefüllt.", `<div class="gcPracticeForm"><label>Fach<input value="Englisch" readonly></label><label>Klasse<input value="5" readonly></label><label>Thema<input value="Colours & school things" readonly></label><label>Umfang<input value="6 Aufgaben · 12 Punkte · ohne Bilder" readonly></label></div>`, "Beispiel prüfen"); break;
 case 3:
  content("create", "Der vorbereitete Test wird geprüft.", "Die Übung zeigt den Prüfablauf. Nach drei Sekunden geht es automatisch zum Entwurf. Eine echte KI-Erstellung kann länger dauern.", '<p role="status">6 Aufgaben · Lösungen hinterlegt · 12 Punkte</p>', "Jetzt weiter");
  timer = setTimeout(() => { if (dialog.open && step === 3) render(4); }, 3000); break;
 case 4:
  content("grade", "Prüfe Aufgaben und Lösungen.", "KI-Ergebnisse sind Entwürfe. Lies sie fachlich durch, bevor du sie einsetzt. Hier kannst du die erste Frage direkt umformulieren.", `<label>Aufgabe 1<textarea id="gcQuestionText">${escape(draft.questions[0].text)}</textarea></label><p>Lösung: blue · 2 Punkte</p>${questionList()}`, "Zum Fuchs"); break;
 case 5:
  content("improve", "Eine Aufgabe verständlicher formulieren.", "Im Produkt gibst du unter „KI bearbeiten“ deinen Änderungswunsch an. Hier zeige ich eine vorbereitete Überarbeitung.", `<blockquote>${escape(draft.questions[3].text)}</blockquote><button class="button secondary" data-tour-action="improve" type="button">Beispiel überarbeiten</button>`, "Varianten ausprobieren"); $('[data-tour-action="next"]').disabled = !draft.questions[3].text.includes("length of your pencil"); break;
 case 6:
  content("improve", "Gleicher Aufgabentyp, neuer Inhalt.", "Eine Variante ergänzt eine ähnliche Aufgabe. Füge die vorbereitete Variante hinzu; in dieser Übung bleibt der Schüler-Probetest anschließend bei sechs Aufgaben und zwölf Punkten.", `<button class="button secondary" data-tour-action="variant" type="button" ${draft.questions.length > 6 ? 'disabled' : ''}>${draft.questions.length > 6 ? 'Variante hinzugefügt' : 'Variante hinzufügen'}</button>${draft.questions.length > 6 ? '<p>Which word means „grün“? · Lösung: green</p>' : ''}`, "Durchführung einstellen"); $('[data-tour-action="next"]').disabled = draft.questions.length === 6; break;
 case 7:
  content("guide", "So soll deine Klasse arbeiten.", "Zeitlimit, gemischte Reihenfolge und Ergebnisanzeige stellst du vor der Freigabe ein. Probiere die Schalter aus – sie gelten nur für diese Demonstration.", '<label><input type="checkbox"> Aufgaben mischen</label><label><input type="checkbox"> Ergebnisse nach Abgabe zeigen</label><label>Zeitlimit<select><option>Ohne Zeitlimit</option><option>10 Minuten</option></select></label>', "Selbst ausfüllen"); break;
 case 8:
  content("guide", "Jetzt bist du in der Schülerrolle.", "Fülle die sechs Beispielantworten aus und gib sie ab. Die Zuordnung und Sortierung sind hier für die Übung als kompakte Auswahl dargestellt.", `<div class="gcPracticeForm">${answerFields()}</div><p role="alert" id="gcAnswerError"></p>`, "Antworten abgeben"); break;
 case 9:
  content("grade", "Eine Antwort bewusst nachprüfen.", "Die ersten fünf Antworten sind automatisch bewertet. Prüfe die Freitextantwort und vergib selbst 0, 1 oder 2 Punkte. Hier lautet die Musterlösung „schoolbag“ oder „school bag“.", `<p>Automatisch: ${score() - (reviewed ? Number(answers.manualPoints || 0) : 0)} / 10 Punkte</p><blockquote>${escape(answers.answer5 || 'Keine Antwort')}</blockquote><label>Punkte für die Freitextantwort<select id="gcManualPoints"><option value="">Bitte bewerten</option>${[0,1,2].map(n=>`<option value="${n}" ${reviewed && Number(answers.manualPoints) === n ? 'selected' : ''}>${n} Punkte</option>`).join('')}</select></label><p id="gcAnswerError" role="alert"></p>`, "Bewertung speichern"); break;
 case 10:
  content("guide", "So gibst du einen echten Test frei.", "Nach der Prüfung wählst du „Veröffentlichen“. Danach teilst du Testcode, Link oder QR-Code. In dieser Tour simulieren wir die Freigabe – niemand kann dem Übungstest beitreten.", '<p class="gcPracticeCode">DEMO-01</p><p>Beispielcode · kein gültiger Zugang</p>', "Demo-Ergebnisse öffnen"); break;
 case 11:
  content("grade", "Vom Ergebnis zurück zur Antwort.", "Im echten Ergebnisbereich prüfst du einzelne Antworten und passt die Bewertung an. Unsere Übungsabgabe ist jetzt vollständig bewertet.", `<p class="gcPracticeScore">${score()} / 12 Punkte</p><p>Demo-Schüler · 6 Antworten · ${reviewed ? 'Freitext geprüft' : 'Prüfung offen'}</p>`, "Abschließen"); break;
 case 12:
  content("guide", "Bereit für deinen eigenen Test.", "Du hast einen Auftrag vorbereitet, Aufgaben verbessert, eine Variante ergänzt, Antworten abgegeben und bewertet. Starte deinen echten Test anschließend über „Neuer Test → Mit KI erstellen“.", '<p>Die Übung wurde nicht als echter Test gespeichert.</p>', "Zurück zu GradeCrew"); break;
 }
}
function advance() {
 if (step === 4 && !draft.questions[0].text.trim()) { $("#gcQuestionText").focus(); return; }
 if (step === 5 && !draft.questions[3].text.includes("length of your pencil")) {
  const button = $('[data-tour-action="improve"]'); button.focus(); return;
 }
 if (step === 6 && draft.questions.length === 6) { $('[data-tour-action="variant"]').focus(); return; }
 if (step === 8) {
  if (Array.from({length:6},(_,i)=>answers['answer'+i]?.trim()).some(value=>!value)) {
   $("#gcAnswerError").textContent = "Bitte beantworte zuerst alle sechs Aufgaben."; return;
  }
  submitted = true;
 }
 if (step === 9) {
  const points = $("#gcManualPoints").value;
  if (!submitted || !["0","1","2"].includes(points)) { $("#gcAnswerError").textContent = "Bitte wähle die Punkte für die Freitextantwort."; return; }
  answers.manualPoints = points; reviewed = true;
 }
 if (step === 12) { try { localStorage.setItem(key(), "done"); } catch {} closeTour(); return; }
 render(step + 1);
}
function startTour() {
 if (!uid) return;
 ensureDialog();
 if (dialog.open || document.querySelector("dialog[open]")) return;
 opener = document.activeElement;
 reset(); dialog.showModal(); document.body.classList.add("gcPracticeActive"); render(0);
}
function dashboardReady(event) {
 const nextUid = event.detail?.uid || "";
 if (uid !== nextUid) closeTour();
 uid = nextUid;
 const actions = document.querySelector("#dashboardView .dashboardActions");
 if (actions && !document.getElementById("gradecrewTourBtn")) {
  const button = document.createElement("button"); button.id = "gradecrewTourBtn";
  button.type = "button"; button.className = "button ghost"; button.textContent = "GradeCrew ausprobieren";
  button.addEventListener("click", startTour); actions.append(button);
 }
 // Explicit replay is always available; no body observer or repeated auto-start.
 if (event.detail?.firstVisit && !offered.has(uid)) {
  offered.add(uid);
  let done = false; try { done = localStorage.getItem(key()) === "done"; } catch {}
  if (!done) startTour();
 }
}
document.addEventListener("gradecrew:dashboard-ready", dashboardReady);
document.addEventListener("gradecrew:signed-out", () => { closeTour(); uid = ""; });
export { startTour, DEMO_TEST, CREW };
