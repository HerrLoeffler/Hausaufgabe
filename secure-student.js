import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { createSecureAssessmentClient } from "./secure-assessment-client.js";

const app = initializeApp(firebaseConfig, "gradecrew-secure-student");
const api = createSecureAssessmentClient(app);
const params = new URLSearchParams(location.search);
const quizId = String(params.get("test") || "").trim();
const $ = id => document.getElementById(id);

let currentQuiz = null;
let currentAttempt = null;
let currentPaper = [];
let waitingPoll = null;
let timerInterval = null;
let submitting = false;
let runningPoll = null;
let frozenAnswers = null;

function setConnection(online, text) {
  const node = $("secureConnection");
  node.textContent = text || (online ? "Verbunden" : "Offline");
  node.classList.toggle("online", Boolean(online));
  node.classList.toggle("offline", !online);
}

function showOnly(id) {
  ["secureLoading", "secureIntro", "secureWaiting", "secureAssessment", "secureResult", "secureError"]
    .forEach(name => $(name)?.classList.toggle("hidden", name !== id));
}

function clearTimers() {
  if (waitingPoll) clearInterval(waitingPoll);
  if (timerInterval) clearInterval(timerInterval);
  if (runningPoll) clearInterval(runningPoll);
  waitingPoll = null;
  timerInterval = null;
  runningPoll = null;
}

function freezeAnswers() {
  if (!frozenAnswers) frozenAnswers = JSON.parse(JSON.stringify(collectAnswers()));
  const form = $("secureAssessmentForm");
  if (form) {
    form.inert = true;
    form.querySelectorAll("input, textarea, select, button").forEach(control => { control.disabled = true; });
  }
  return frozenAnswers;
}

function watchRunningAssessment() {
  let busy = false;
  runningPoll = setInterval(async () => {
    if (busy || submitting) return;
    busy = true;
    try {
      // Lightweight authenticated status read: no questions/paper are loaded.
      const response = await api.resume(quizId, { stateOnly: true });
      if (response?.status === "submitted" && response.receipt) {
        showReceipt(response.receipt);
      } else if (response?.quiz?.ended || frozenAnswers) {
        freezeAnswers();
        await submitAssessment(true);
      }
    } catch (error) {
      if (error.code === "unavailable") setConnection(false, "Verbindung unterbrochen");
      else { saveDraft(); clearTimers(); showError(error); }
    } finally { busy = false; }
  }, 5000);
}

function draftKey() {
  return `gradecrew_secure_answers:v1:${quizId}:${currentAttempt?.attemptId || "pending"}`;
}

function readDraft() {
  try { return JSON.parse(sessionStorage.getItem(draftKey()) || "null") || {}; }
  catch { return {}; }
}

function saveDraft() {
  if (!currentAttempt?.attemptId || !currentPaper.length) return;
  try { sessionStorage.setItem(draftKey(), JSON.stringify(collectAnswers())); }
  catch {}
}

function clearDraft() {
  try { sessionStorage.removeItem(draftKey()); } catch {}
}

function formatMinutes(minutes) {
  const value = Number(minutes);
  if (!value) return "Ohne Zeitlimit";
  return `${value} ${value === 1 ? "Minute" : "Minuten"}`;
}

function formatClock(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function fillIntro(quiz) {
  currentQuiz = quiz;
  $("secureMeta").textContent = [quiz.subject, quiz.grade ? `Klasse ${quiz.grade}` : ""].filter(Boolean).join(" · ");
  $("secureTitle").textContent = quiz.title || "Test";
  $("secureDescription").textContent = quiz.description || "";
  $("secureFacts").replaceChildren();
  [
    `${Number(quiz.questionCount) || 0} Aufgaben`,
    `${Number(quiz.totalPoints) || 0} Punkte`,
    formatMinutes(quiz.timeLimitMinutes),
    quiz.startMode === "teacher" ? "Gemeinsamer Start" : "Eigener Start"
  ].forEach(text => {
    const span = document.createElement("span");
    span.textContent = text;
    $("secureFacts").appendChild(span);
  });
  $("secureStartBtn").textContent = quiz.startMode === "teacher" ? "Ich bin bereit" : "Test starten";
}

function showError(error, { retry = true } = {}) {
  clearTimers();
  const host = $("secureError");
  host.replaceChildren();
  const icon = document.createElement("div");
  icon.className = "secureResultIcon";
  icon.textContent = "!";
  const title = document.createElement("h1");
  title.textContent = "Test kann gerade nicht fortgesetzt werden";
  const copy = document.createElement("p");
  copy.textContent = (error?.message || "Unbekannter Fehler.") + (error?.reference ? ` · Fehlerkennung: ${error.reference}` : "");
  host.append(icon, title, copy);
  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button primary";
    button.textContent = "Erneut versuchen";
    button.addEventListener("click", () => location.reload());
    host.appendChild(button);
  }
  showOnly("secureError");
}

function showWaiting(attempt) {
  currentAttempt = attempt;
  showOnly("secureWaiting");
  $("secureWaitingName").textContent = attempt.studentName || "";
  if (waitingPoll) clearInterval(waitingPoll);
  let busy = false;
  waitingPoll = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const response = await api.resume(quizId);
      setConnection(true, "Verbunden");
      if (!response) return;
      if (response.status === "running" && Array.isArray(response.paper)) {
        clearInterval(waitingPoll);
        waitingPoll = null;
        enterAssessment(response);
      } else if (response.status === "submitted" && response.receipt) {
        clearInterval(waitingPoll);
        waitingPoll = null;
        showReceipt(response.receipt);
      }
    } catch (error) {
      if (error.code === "unavailable") setConnection(false, "Verbindung unterbrochen");
      else showError(error);
    } finally {
      busy = false;
    }
  }, 1800);
}

function questionShell(question, index) {
  const section = document.createElement("section");
  section.className = "secureQuestion";
  section.dataset.qid = question.id;
  section.dataset.type = question.type;

  const head = document.createElement("div");
  head.className = "secureQuestionHead";
  const no = document.createElement("span");
  no.className = "secureQuestionNo";
  no.textContent = `Aufgabe ${index + 1}`;
  const points = document.createElement("span");
  points.className = "securePoints";
  points.textContent = `${Number(question.points) || 0} P.`;
  head.append(no, points);
  section.appendChild(head);

  const title = document.createElement("h2");
  title.textContent = question.type === "gapfill" ? "Lückentext" : question.text || "Aufgabe";
  section.appendChild(title);

  if (question.image?.src) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.className = "secureQuestionImage";
    image.src = question.image.src;
    image.alt = question.image.alt || "Abbildung zur Aufgabe";
    figure.appendChild(image);
    section.appendChild(figure);
  }
  return section;
}

function renderOptions(section, question, multiple = false) {
  (question.options || []).forEach(option => {
    const label = document.createElement("label");
    label.className = "secureChoice";
    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = `q_${question.id}`;
    input.value = option.id;
    const body = document.createElement("span");
    const text = document.createElement("span");
    text.textContent = option.text || "Antwort";
    body.appendChild(text);
    if (option.image?.src) {
      const image = document.createElement("img");
      image.className = "secureOptionImage";
      image.src = option.image.src;
      image.alt = option.image.alt || "Antwortabbildung";
      body.appendChild(image);
    }
    label.append(input, body);
    section.appendChild(label);
  });
}

function renderDropdown(section, question) {
  const select = document.createElement("select");
  select.name = `q_${question.id}`;
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Bitte auswählen …";
  select.appendChild(blank);
  (question.options || []).forEach(option => {
    const node = document.createElement("option");
    node.value = option.id;
    node.textContent = option.text || "Antwort";
    select.appendChild(node);
  });
  section.appendChild(select);
}

function renderGapfill(section, question) {
  const wrap = document.createElement("div");
  wrap.className = "secureGapText";
  let gapIndex = 0;
  (question.segments || []).forEach(segment => {
    if (segment.type === "text") {
      wrap.appendChild(document.createTextNode(segment.text || ""));
      return;
    }
    const input = document.createElement("input");
    input.type = "text";
    input.className = "secureGap";
    input.dataset.gapIndex = String(gapIndex++);
    input.dataset.gapId = segment.id || "";
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Lücke ${gapIndex}`);
    wrap.appendChild(input);
  });
  section.appendChild(wrap);
}

function renderMatching(section, question) {
  (question.leftItems || []).forEach(left => {
    const row = document.createElement("div");
    row.className = "secureMatchingRow";
    const label = document.createElement("strong");
    label.textContent = left.text;
    const select = document.createElement("select");
    select.dataset.leftId = left.id;
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Zuordnen …";
    select.appendChild(blank);
    (question.rightItems || []).forEach(right => {
      const option = document.createElement("option");
      option.value = right.id;
      option.textContent = right.text;
      select.appendChild(option);
    });
    row.append(label, select);
    section.appendChild(row);
  });
}

function moveOrderItem(button, direction) {
  const item = button.closest(".secureOrderItem");
  const list = item?.parentElement;
  if (!item || !list) return;
  if (direction < 0 && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
  if (direction > 0 && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
  onAnswerChanged();
}

function renderOrdering(section, question) {
  const list = document.createElement("div");
  list.className = "secureOrderList";
  (question.items || []).forEach(item => {
    const row = document.createElement("div");
    row.className = "secureOrderItem";
    row.dataset.itemId = item.id;
    const text = document.createElement("span");
    text.textContent = item.text;
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "↑";
    up.setAttribute("aria-label", `${item.text} nach oben`);
    up.addEventListener("click", () => moveOrderItem(up, -1));
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "↓";
    down.setAttribute("aria-label", `${item.text} nach unten`);
    down.addEventListener("click", () => moveOrderItem(down, 1));
    row.append(text, up, down);
    list.appendChild(row);
  });
  section.appendChild(list);
}

function renderGrouping(section, question) {
  (question.items || []).forEach(item => {
    const row = document.createElement("div");
    row.className = "secureGroupingRow";
    const label = document.createElement("strong");
    label.textContent = item.text;
    const select = document.createElement("select");
    select.dataset.itemId = item.id;
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Gruppe wählen …";
    select.appendChild(blank);
    (question.groups || []).forEach(group => {
      const option = document.createElement("option");
      option.value = group.id;
      option.textContent = group.name;
      select.appendChild(option);
    });
    row.append(label, select);
    section.appendChild(row);
  });
}

function tokenizeWords(text) {
  const pieces = String(text || "").split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu).filter(Boolean);
  let wordIndex = 0;
  return pieces.map(piece => {
    const isWord = /[\p{L}\p{N}]/u.test(piece[0] || "");
    return { text: piece, isWord, wordIndex: isWord ? wordIndex++ : null };
  });
}

function renderMarkwords(section, question) {
  const wrap = document.createElement("div");
  wrap.className = "secureMarkPassage";
  tokenizeWords(question.passage).forEach(token => {
    if (!token.isWord) {
      wrap.appendChild(document.createTextNode(token.text));
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secureWord";
    button.dataset.wordIndex = String(token.wordIndex);
    button.textContent = token.text;
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      button.setAttribute("aria-pressed", button.classList.contains("selected") ? "true" : "false");
      onAnswerChanged();
    });
    wrap.appendChild(button);
  });
  section.appendChild(wrap);
}

function renderQuestion(question, index) {
  const section = questionShell(question, index);
  if (question.type === "single") renderOptions(section, question, false);
  else if (question.type === "multi") renderOptions(section, question, true);
  else if (question.type === "dropdown") renderDropdown(section, question);
  else if (question.type === "truefalse") {
    renderOptions(section, { ...question, options: [{ id: "true", text: "Richtig" }, { id: "false", text: "Falsch" }] }, false);
  } else if (question.type === "text") {
    const input = document.createElement("textarea");
    input.name = `q_${question.id}`;
    input.rows = 4;
    input.placeholder = "Antwort eingeben";
    section.appendChild(input);
  } else if (question.type === "number") {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.name = `q_${question.id}`;
    input.placeholder = question.unit ? `Ergebnis in ${question.unit}` : "Ergebnis";
    section.appendChild(input);
  } else if (question.type === "gapfill") renderGapfill(section, question);
  else if (question.type === "matching") renderMatching(section, question);
  else if (question.type === "ordering") renderOrdering(section, question);
  else if (question.type === "grouping") renderGrouping(section, question);
  else if (question.type === "markwords") renderMarkwords(section, question);
  return section;
}

function collectQuestionAnswer(question, section) {
  if (!section) return null;
  if (["single", "truefalse"].includes(question.type)) return section.querySelector("input:checked")?.value || "";
  if (question.type === "multi") return [...section.querySelectorAll("input:checked")].map(input => input.value);
  if (["text", "number", "dropdown"].includes(question.type)) return section.querySelector("textarea,input,select")?.value || "";
  if (question.type === "gapfill") return [...section.querySelectorAll(".secureGap")].map(input => input.value);
  if (question.type === "matching") return Object.fromEntries([...section.querySelectorAll("select[data-left-id]")].map(select => [select.dataset.leftId, select.value]));
  if (question.type === "ordering") return [...section.querySelectorAll(".secureOrderItem")].map(item => item.dataset.itemId);
  if (question.type === "grouping") return Object.fromEntries([...section.querySelectorAll("select[data-item-id]")].map(select => [select.dataset.itemId, select.value]));
  if (question.type === "markwords") return [...section.querySelectorAll(".secureWord.selected")].map(button => button.dataset.wordIndex);
  return null;
}

function collectAnswers() {
  return Object.fromEntries(currentPaper.map(question => [
    question.id,
    collectQuestionAnswer(question, document.querySelector(`.secureQuestion[data-qid="${CSS.escape(question.id)}"]`))
  ]));
}

function answerIsComplete(question, value) {
  if (question.type === "ordering") return Array.isArray(value) && value.length === (question.items || []).length;
  if (["multi", "markwords"].includes(question.type)) return Array.isArray(value) && value.length > 0;
  if (question.type === "gapfill") return Array.isArray(value) && value.length > 0 && value.every(item => String(item || "").trim());
  if (["matching", "grouping"].includes(question.type)) {
    const values = value && typeof value === "object" ? Object.values(value) : [];
    const expected = question.type === "matching" ? (question.leftItems || []).length : (question.items || []).length;
    return values.length === expected && values.every(Boolean);
  }
  return String(value ?? "").trim().length > 0;
}

function refreshProgress() {
  const answers = collectAnswers();
  const done = currentPaper.filter(question => answerIsComplete(question, answers[question.id])).length;
  const total = currentPaper.length;
  $("secureProgressText").textContent = `${done} von ${total} bearbeitet`;
  $("secureOpenText").textContent = `${Math.max(0, total - done)} offen`;
  $("secureProgressFill").style.width = `${total ? Math.round(done / total * 100) : 0}%`;
}

function onAnswerChanged() {
  refreshProgress();
  saveDraft();
}

function applyDraft(draft) {
  for (const question of currentPaper) {
    const value = draft?.[question.id];
    if (value == null) continue;
    const section = document.querySelector(`.secureQuestion[data-qid="${CSS.escape(question.id)}"]`);
    if (!section) continue;
    if (["single", "truefalse"].includes(question.type)) {
      const input = [...section.querySelectorAll("input")].find(node => node.value === String(value));
      if (input) input.checked = true;
    } else if (question.type === "multi") {
      const selected = new Set(Array.isArray(value) ? value.map(String) : []);
      section.querySelectorAll("input").forEach(input => { input.checked = selected.has(input.value); });
    } else if (["text", "number", "dropdown"].includes(question.type)) {
      const field = section.querySelector("textarea,input,select");
      if (field) field.value = String(value);
    } else if (question.type === "gapfill") {
      section.querySelectorAll(".secureGap").forEach((input, index) => { input.value = String(Array.isArray(value) ? value[index] || "" : ""); });
    } else if (question.type === "matching") {
      section.querySelectorAll("select[data-left-id]").forEach(select => { select.value = String(value?.[select.dataset.leftId] || ""); });
    } else if (question.type === "grouping") {
      section.querySelectorAll("select[data-item-id]").forEach(select => { select.value = String(value?.[select.dataset.itemId] || ""); });
    } else if (question.type === "ordering" && Array.isArray(value)) {
      const list = section.querySelector(".secureOrderList");
      const byId = new Map([...list.querySelectorAll(".secureOrderItem")].map(item => [item.dataset.itemId, item]));
      value.forEach(id => { const item = byId.get(String(id)); if (item) list.appendChild(item); });
    } else if (question.type === "markwords") {
      const selected = new Set(Array.isArray(value) ? value.map(String) : []);
      section.querySelectorAll(".secureWord").forEach(button => {
        const active = selected.has(button.dataset.wordIndex);
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
  }
  refreshProgress();
}

function enterAssessment(response) {
  clearTimers();
  frozenAnswers = null;
  currentAttempt = response;
  currentQuiz = response.quiz || currentQuiz;
  currentPaper = Array.isArray(response.paper) ? response.paper : [];
  if (!currentPaper.length) return showError(new Error("Der Prüfungsserver hat keine Aufgaben freigegeben."));

  $("secureRunningMeta").textContent = [currentQuiz?.subject, currentQuiz?.grade ? `Klasse ${currentQuiz.grade}` : ""].filter(Boolean).join(" · ");
  $("secureRunningTitle").textContent = currentQuiz?.title || "Test";
  const root = $("secureQuestions");
  root.replaceChildren(...currentPaper.map(renderQuestion));
  root.addEventListener("input", onAnswerChanged);
  root.addEventListener("change", onAnswerChanged);
  applyDraft(readDraft());
  showOnly("secureAssessment");
  watchRunningAssessment();

  if (response.deadlineAtMillis) {
    $("secureTimer").classList.remove("hidden");
    const serverNow = Number(response.serverNowMillis) || Date.now();
    const receivedAt = performance.now();
    const tick = () => {
      const remaining = Number(response.deadlineAtMillis) - (serverNow + performance.now() - receivedAt);
      $("secureTimerText").textContent = formatClock(remaining);
      $("secureTimer").classList.toggle("warning", remaining <= 60_000);
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        void submitAssessment(true);
      }
    };
    tick();
    timerInterval = setInterval(tick, 500);
  } else $("secureTimer").classList.add("hidden");
}

function showReceipt(receipt) {
  clearTimers();
  clearDraft();
  const host = $("secureResult");
  host.replaceChildren();
  const icon = document.createElement("div");
  icon.className = "secureResultIcon";
  icon.textContent = "✓";
  const title = document.createElement("h1");
  title.textContent = receipt.needsReview ? "Abgabe gespeichert – Bewertung folgt" : "Abgabe gespeichert";
  const copy = document.createElement("p");
  copy.textContent = receipt.needsReview
    ? "Ein Teil deiner Antworten wird noch von deiner Lehrkraft geprüft. Du kannst diese Seite jetzt schließen."
    : "Deine Abgabe wurde serverseitig gespeichert. Du kannst diese Seite jetzt schließen.";
  host.append(icon, title, copy);

  if (!receipt.needsReview && receipt.resultMode !== "none" && Number.isFinite(Number(receipt.maxPoints))) {
    const score = document.createElement("div");
    score.className = "secureResultScore";
    score.textContent = `${Number(receipt.totalPoints) || 0} / ${Number(receipt.maxPoints) || 0} Punkte`;
    host.appendChild(score);
    const meta = document.createElement("div");
    meta.className = "secureResultMeta";
    if (Number.isFinite(Number(receipt.percent))) {
      const p = document.createElement("span");
      p.textContent = `${Number(receipt.percent)} %`;
      meta.appendChild(p);
    }
    if (receipt.grade != null) {
      const g = document.createElement("span");
      g.textContent = `Note ${receipt.grade}`;
      meta.appendChild(g);
    }
    host.appendChild(meta);
  }
  const solutionNote = document.createElement("p");
  solutionNote.textContent = "Lösungen werden nicht automatisch mit der Abgabe freigegeben.";
  host.appendChild(solutionNote);
  showOnly("secureResult");
}

async function submitAssessment(autoSubmitted = false) {
  if (submitting) return;
  if (autoSubmitted) freezeAnswers();
  submitting = true;
  saveDraft();
  const button = $("secureSubmitBtn");
  if (button) {
    button.disabled = true;
    button.textContent = autoSubmitted ? "Test beendet – wird abgegeben …" : "Wird abgegeben …";
  }
  try {
    const response = await api.submit(quizId, frozenAnswers || collectAnswers(), { autoSubmitted });
    setConnection(true, "Sicher gespeichert");
    showReceipt(response.receipt);
  } catch (error) {
    submitting = false;
    if (button) {
      button.disabled = false;
      button.textContent = "Antworten erneut abgeben";
    }
    setConnection(error.code !== "unavailable", error.code === "unavailable" ? "Verbindung unterbrochen" : "Abgabe nicht gespeichert");
    const message = document.createElement("p");
    message.className = "secureInlineError";
    message.textContent = `${error.message}${error.reference ? ` · Fehlerkennung: ${error.reference}` : ""} Deine Antworten bleiben in diesem Tab erhalten.`;
    document.querySelector(".secureSubmit .secureInlineError")?.remove();
    $("secureSubmitBtn")?.parentElement?.appendChild(message);
  }
}

async function restoreOrShowIntro(info) {
  fillIntro(info.quiz);
  const stored = api.readSession(quizId);
  if (!stored?.attemptId) {
    showOnly("secureIntro");
    return;
  }
  try {
    const response = await api.resume(quizId);
    if (!response) return showOnly("secureIntro");
    if (response.status === "submitted" && response.receipt) return showReceipt(response.receipt);
    if (response.status === "ready") return showWaiting(response);
    if (response.status === "running" && response.paper) return enterAssessment(response);
    showOnly("secureIntro");
  } catch (error) {
    if (error.code === "not-found") {
      api.clear(quizId);
      showOnly("secureIntro");
      return;
    }
    showError(error);
  }
}

$("secureStartForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const name = $("secureStudentName").value.trim();
  if (!name) return;
  const button = $("secureStartBtn");
  button.disabled = true;
  button.textContent = currentQuiz?.startMode === "teacher" ? "Wird angemeldet …" : "Test wird gestartet …";
  try {
    const response = await api.start(quizId, name);
    setConnection(true, "Verbunden");
    if (response.status === "ready") showWaiting(response);
    else if (response.status === "running" && response.paper) enterAssessment(response);
    else if (response.status === "submitted" && response.receipt) showReceipt(response.receipt);
    else showError(new Error("Der Prüfungsserver hat einen unerwarteten Status zurückgegeben."));
  } catch (error) {
    button.disabled = false;
    button.textContent = currentQuiz?.startMode === "teacher" ? "Ich bin bereit" : "Test starten";
    showError(error);
  }
});

$("secureAssessmentForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const answers = collectAnswers();
  const open = currentPaper.filter(question => !answerIsComplete(question, answers[question.id])).length;
  if (open && !confirm(`${open} ${open === 1 ? "Aufgabe ist" : "Aufgaben sind"} noch offen. Trotzdem endgültig abgeben?`)) return;
  void submitAssessment(false);
});

addEventListener("online", () => setConnection(true, "Verbunden"));
addEventListener("offline", () => setConnection(false, "Offline"));
addEventListener("beforeunload", saveDraft);

async function bootstrap() {
  if (!quizId) {
    showError(new Error("In diesem Link fehlt der Testcode."), { retry: false });
    return;
  }
  setConnection(navigator.onLine, navigator.onLine ? "Prüfungsserver wird geprüft …" : "Offline");
  try {
    const info = await api.getInfo(quizId);
    setConnection(true, "Verbunden");
    await restoreOrShowIntro(info);
  } catch (error) {
    setConnection(false, "Nicht verbunden");
    showError(error);
  }
}

void bootstrap();
