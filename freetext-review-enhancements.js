import { getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { classifyFreeTextAnswer, summarizeFreeTextClassifications } from "./free-text-review.mjs?v=2.3.1-gc28";

const CONTEXT_KEY = "gradecrew.freeTextReviewContext.v1";
const PRIORITY = Object.freeze({ red: 0, yellow: 1, green: 2 });
let context = readContext();
let bundlePromise = null;
let bundleCode = "";
let decorationQueued = false;

function readContext() {
  try {
    const value = JSON.parse(sessionStorage.getItem(CONTEXT_KEY) || "null");
    return value && /^[A-Z0-9-]{4,40}$/i.test(String(value.code || "")) ? value : null;
  } catch (_) {
    return null;
  }
}

function saveContext(next) {
  context = next;
  try {
    if (next) sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(CONTEXT_KEY);
  } catch (_) {}
}

function quizCodeFromCard(card) {
  const match = String(card?.textContent || "").match(/\bCode\s+([A-Z0-9-]{4,40})\b/i);
  return match?.[1] || "";
}

function activeCode() {
  if (/^[A-Z0-9-]{4,40}$/i.test(String(context?.code || ""))) return context.code;
  const published = String(document.getElementById("publishedCode")?.textContent || "").trim();
  return /^[A-Z0-9-]{4,40}$/i.test(published) ? published : "";
}

function invalidateBundle() {
  bundlePromise = null;
  bundleCode = "";
}

async function loadBundle(code) {
  if (!code) return null;
  if (bundlePromise && bundleCode === code) return bundlePromise;
  const app = getApps()[0];
  if (!app) return null;
  bundleCode = code;
  bundlePromise = (async () => {
    const db = getFirestore(app);
    const [questionsSnap, submissionsSnap] = await Promise.all([
      getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position"))),
      getDocs(collection(db, "quizzes", code, "submissions"))
    ]);
    return {
      questions: questionsSnap.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })),
      submissions: new Map(submissionsSnap.docs.map(snapshot => [snapshot.id, { id: snapshot.id, ...snapshot.data() }]))
    };
  })().catch(error => {
    console.warn("Freitext-Priorisierung konnte nicht geladen werden:", error);
    invalidateBundle();
    return null;
  });
  return bundlePromise;
}

function classifyQuestion(question, submission) {
  if (!question || question.type !== "text") return null;
  return classifyFreeTextAnswer({
    given: submission?.answers?.[question.id] ?? "",
    acceptedAnswers: question.acceptedAnswers || [],
    manualReview: Boolean(question.manualReview),
    maxPoints: Number(question.points) || 0
  });
}

function classificationsForSubmission(questions, submission) {
  return questions
    .filter(question => question.type === "text")
    .map(question => ({ question, classification: classifyQuestion(question, submission) }));
}

function priorityFor(items) {
  const values = items.map(item => PRIORITY[item.classification?.level] ?? 3);
  return values.length ? Math.min(...values) : 3;
}

function badgeHtml(classification) {
  const icon = classification.level === "green" ? "🟢" : classification.level === "yellow" ? "🟡" : "🔴";
  return `<span class="gcFreeTextBadge gcFreeTextBadge-${classification.level}" title="${escapeAttribute(classification.reason)}">${icon} ${escapeHtml(classification.label)}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function ensureResultsToolbar(table) {
  let toolbar = document.getElementById("gcFreeTextResultsToolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "gcFreeTextResultsToolbar";
    toolbar.className = "gcFreeTextToolbar";
    toolbar.innerHTML = `<div><strong>Freitext-Prüfhilfe</strong><small>🟢 eindeutig · 🟡 prüfen · 🔴 unklar. Die Ampel ist keine endgültige Bewertung.</small></div><div class="gcFreeTextToolbarActions"><button class="button secondary gcSortUncertain" type="button">Unsichere zuerst</button><button class="button ghost gcRestoreOrder" type="button">Reihenfolge zurücksetzen</button></div>`;
    table.parentElement?.insertBefore(toolbar, table);
  }
  if (toolbar.dataset.gcBound !== "1") {
    toolbar.dataset.gcBound = "1";
    toolbar.querySelector(".gcSortUncertain")?.addEventListener("click", () => sortResultRows(table, true));
    toolbar.querySelector(".gcRestoreOrder")?.addEventListener("click", () => sortResultRows(table, false));
  }
  return toolbar;
}

function sortResultRows(table, uncertainFirst) {
  const body = table.querySelector("tbody");
  if (!body) return;
  const rows = [...body.querySelectorAll("tr")];
  rows.sort((a, b) => {
    if (!uncertainFirst) return Number(a.dataset.gcOriginalOrder || 0) - Number(b.dataset.gcOriginalOrder || 0);
    const priorityDiff = Number(a.dataset.gcFreeTextPriority ?? 3) - Number(b.dataset.gcFreeTextPriority ?? 3);
    if (priorityDiff) return priorityDiff;
    const redDiff = Number(b.dataset.gcFreeTextRed || 0) - Number(a.dataset.gcFreeTextRed || 0);
    if (redDiff) return redDiff;
    const yellowDiff = Number(b.dataset.gcFreeTextYellow || 0) - Number(a.dataset.gcFreeTextYellow || 0);
    if (yellowDiff) return yellowDiff;
    return Number(a.dataset.gcOriginalOrder || 0) - Number(b.dataset.gcOriginalOrder || 0);
  });
  rows.forEach(row => body.appendChild(row));
}

async function decorateResults() {
  const view = document.getElementById("resultsView");
  const table = view?.querySelector(".resultTable");
  if (!view || view.classList.contains("hidden") || !table) return;
  const code = activeCode();
  if (!code) return;
  const bundle = await loadBundle(code);
  if (!bundle) return;

  const rows = [...table.querySelectorAll("tbody tr")];
  let hasFreeText = false;
  rows.forEach((row, originalIndex) => {
    if (row.dataset.gcOriginalOrder === undefined) row.dataset.gcOriginalOrder = String(originalIndex);
    const submissionId = row.querySelector(".reviewBtn")?.dataset.id || "";
    const submission = bundle.submissions.get(submissionId);
    if (!submission) return;
    const items = classificationsForSubmission(bundle.questions, submission);
    if (!items.length) return;
    hasFreeText = true;
    const summary = summarizeFreeTextClassifications(items.map(item => item.classification));
    row.dataset.gcFreeTextPriority = String(priorityFor(items));
    row.dataset.gcFreeTextRed = String(summary.red);
    row.dataset.gcFreeTextYellow = String(summary.yellow);
    const signature = `${summary.red}:${summary.yellow}:${summary.green}`;
    if (row.dataset.gcFreeTextSignature === signature && row.querySelector(".gcFreeTextRowSummary")) return;
    row.dataset.gcFreeTextSignature = signature;
    row.querySelector(".gcFreeTextRowSummary")?.remove();
    const statusCell = row.children[4] || row.lastElementChild;
    if (!statusCell) return;
    const summaryNode = document.createElement("div");
    summaryNode.className = "gcFreeTextRowSummary";
    summaryNode.setAttribute("aria-label", `Freitext: ${summary.red} unklar, ${summary.yellow} prüfen, ${summary.green} eindeutig`);
    summaryNode.innerHTML = `${summary.red ? `<span>🔴 ${summary.red}</span>` : ""}${summary.yellow ? `<span>🟡 ${summary.yellow}</span>` : ""}${summary.green ? `<span>🟢 ${summary.green}</span>` : ""}`;
    statusCell.appendChild(summaryNode);
  });

  if (!hasFreeText) {
    document.getElementById("gcFreeTextResultsToolbar")?.remove();
    return;
  }
  ensureResultsToolbar(table);
}

function setSuggestedPoints(input, points) {
  if (!input || points === null || points === undefined) return;
  input.value = String(points);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.focus({ preventScroll: true });
}

function sortReviewQuestions(root, uncertainFirst) {
  const rows = [...root.children];
  rows.sort((a, b) => {
    if (!uncertainFirst) return Number(a.dataset.gcOriginalOrder || 0) - Number(b.dataset.gcOriginalOrder || 0);
    const priorityDiff = Number(a.dataset.gcFreeTextPriority ?? 3) - Number(b.dataset.gcFreeTextPriority ?? 3);
    if (priorityDiff) return priorityDiff;
    return Number(a.dataset.gcOriginalOrder || 0) - Number(b.dataset.gcOriginalOrder || 0);
  });
  rows.forEach(row => root.appendChild(row));
}

async function decorateReviewPanel() {
  const panel = document.getElementById("reviewPanel");
  const root = document.getElementById("reviewQuestions");
  if (!panel || panel.classList.contains("hidden") || !root) return;
  const code = activeCode();
  const submissionId = context?.submissionId || "";
  if (!code || !submissionId) return;
  const key = `${code}:${submissionId}:${root.children.length}`;
  if (root.dataset.gcFreeTextReviewKey === key) return;

  const bundle = await loadBundle(code);
  const submission = bundle?.submissions.get(submissionId);
  if (!bundle || !submission) return;
  root.dataset.gcFreeTextReviewKey = key;
  panel.querySelector(".gcFreeTextReviewToolbar")?.remove();

  const classifications = [];
  const questionNodes = [...root.children];
  bundle.questions.forEach((question, index) => {
    const node = questionNodes[index];
    if (!node) return;
    if (node.dataset.gcOriginalOrder === undefined) node.dataset.gcOriginalOrder = String(index);
    node.querySelector(".gcFreeTextQuestionHint")?.remove();
    if (question.type !== "text") {
      node.dataset.gcFreeTextPriority = "3";
      return;
    }

    const classification = classifyQuestion(question, submission);
    classifications.push(classification);
    node.dataset.gcFreeTextPriority = String(PRIORITY[classification.level] ?? 3);
    node.classList.add("gcFreeTextReviewQuestion", `gcFreeTextReview-${classification.level}`);

    const hint = document.createElement("div");
    hint.className = "gcFreeTextQuestionHint";
    hint.innerHTML = `<div class="gcFreeTextQuestionHintHead">${badgeHtml(classification)}<small>${escapeHtml(classification.reason)}</small></div>`;

    const pointsInput = node.querySelector(".manualPoints");
    const currentPoints = Number(pointsInput?.value);
    if (classification.suggestedPoints !== null && classification.suggestedPoints !== undefined && Math.abs(currentPoints - Number(classification.suggestedPoints)) > 0.001) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "miniButton gcFreeTextSuggestion";
      button.textContent = `${classification.suggestedPoints} P als Vorschlag übernehmen`;
      button.addEventListener("click", () => setSuggestedPoints(pointsInput, classification.suggestedPoints));
      hint.appendChild(button);
    }
    node.querySelector(".reviewPoints")?.before(hint);
  });

  if (!classifications.length) return;
  const summary = summarizeFreeTextClassifications(classifications);
  const toolbar = document.createElement("div");
  toolbar.className = "gcFreeTextToolbar gcFreeTextReviewToolbar";
  toolbar.innerHTML = `<div><strong>Freitext-Prüfhilfe</strong><small>🔴 ${summary.red} unklar · 🟡 ${summary.yellow} prüfen · 🟢 ${summary.green} eindeutig. Vorschläge werden erst durch „Bewertung speichern“ übernommen.</small></div><div class="gcFreeTextToolbarActions"><button class="button secondary gcReviewSort" type="button">Unsichere zuerst</button><button class="button ghost gcReviewRestore" type="button">Originalreihenfolge</button></div>`;
  root.before(toolbar);
  toolbar.querySelector(".gcReviewSort")?.addEventListener("click", () => sortReviewQuestions(root, true));
  toolbar.querySelector(".gcReviewRestore")?.addEventListener("click", () => sortReviewQuestions(root, false));
}

function scheduleDecoration() {
  if (decorationQueued) return;
  decorationQueued = true;
  requestAnimationFrame(async () => {
    decorationQueued = false;
    await Promise.all([decorateResults(), decorateReviewPanel()]);
  });
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const liveResults = target.closest("#liveResultsBtn");
  if (liveResults) {
    const code = String(document.getElementById("publishedCode")?.textContent || "").trim();
    if (code) saveContext({ code, submissionId: "", at: Date.now() });
  }

  const dashboardResults = target.closest("#dashboardView .quizCard .results");
  if (dashboardResults) {
    const code = quizCodeFromCard(dashboardResults.closest(".quizCard"));
    if (code) saveContext({ code, submissionId: "", at: Date.now() });
  }

  const review = target.closest(".reviewBtn");
  if (review?.dataset.id) {
    saveContext({ code: activeCode(), submissionId: review.dataset.id, at: Date.now() });
    window.setTimeout(scheduleDecoration, 0);
  }

  if (target.closest("#refreshResultsBtn")) {
    invalidateBundle();
    window.setTimeout(scheduleDecoration, 120);
  }
}, true);

const observer = new MutationObserver(scheduleDecoration);
if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
else document.addEventListener("DOMContentLoaded", () => observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }), { once: true });

const style = document.createElement("style");
style.dataset.gradecrewFreeTextReview = "1";
style.textContent = `
.gcFreeTextToolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;margin:0 0 12px;border:1px solid #dce3ed;border-radius:12px;background:#f8fafc}
.gcFreeTextToolbar>div:first-child{display:grid;gap:3px}.gcFreeTextToolbar small{color:#667085;line-height:1.35}.gcFreeTextToolbarActions{display:flex;gap:8px;flex-wrap:wrap}
.gcFreeTextRowSummary{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;font-size:11px}.gcFreeTextRowSummary span{white-space:nowrap}
.gcFreeTextQuestionHint{display:grid;gap:7px;margin:10px 0;padding:10px 12px;border-radius:10px;border:1px solid #dde3ea;background:#fafbfc}
.gcFreeTextQuestionHintHead{display:flex;align-items:flex-start;gap:9px;flex-wrap:wrap}.gcFreeTextQuestionHintHead small{flex:1 1 260px;color:#586579;line-height:1.45}
.gcFreeTextBadge{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap}
.gcFreeTextBadge-green{background:#e9f8ef;color:#176b3a}.gcFreeTextBadge-yellow{background:#fff7dc;color:#795700}.gcFreeTextBadge-red{background:#fff0f0;color:#9c2d2d}
.gcFreeTextReviewQuestion.gcFreeTextReview-red{border-left:4px solid #d85151}.gcFreeTextReviewQuestion.gcFreeTextReview-yellow{border-left:4px solid #d6a524}.gcFreeTextReviewQuestion.gcFreeTextReview-green{border-left:4px solid #39a866}
.gcFreeTextSuggestion{justify-self:start}
@media(max-width:720px){.gcFreeTextToolbar{align-items:stretch;flex-direction:column}.gcFreeTextToolbarActions{width:100%}.gcFreeTextToolbarActions .button{flex:1 1 auto}}
`;
document.head.appendChild(style);

scheduleDecoration();
