import { getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const CONTEXT_KEY = "gradecrew.resultsContext.v1";
let context = readContext();
let returnToLiveAfterDashboard = false;
let decorateScheduled = false;

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
  const text = card?.textContent || "";
  const match = text.match(/\bCode\s+([A-Z0-9-]{4,40})\b/i);
  return match?.[1] || "";
}

function visible(element) {
  return element instanceof HTMLElement && !element.classList.contains("hidden") && element.offsetParent !== null;
}

function notify(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle("error", type === "error");
  toast.classList.toggle("success", type !== "error");
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

function renameLiveButtons(root = document) {
  root.querySelectorAll?.("#dashboardView .quizCard .studentShare").forEach(button => {
    button.textContent = "Live-Ansicht";
    button.title = "Testcode, QR-Code und Live-Status öffnen";
  });
}

function captureResultsContext(target) {
  const live = target.closest("#liveResultsBtn");
  if (live) {
    const code = String(document.getElementById("publishedCode")?.textContent || "").trim();
    if (code) saveContext({ code, live: true, source: "live", at: Date.now() });
    return;
  }
  const results = target.closest("#dashboardView .quizCard .results");
  if (!results) return;
  const card = results.closest(".quizCard");
  const code = quizCodeFromCard(card);
  if (code) saveContext({ code, live: Boolean(card?.querySelector(".studentShare")), source: "dashboard", at: Date.now() });
}

function findLiveCard(code) {
  return [...document.querySelectorAll("#dashboardView .quizCard")]
    .find(card => quizCodeFromCard(card) === code && card.querySelector(".studentShare"));
}

function openLiveAfterDashboard(attempt = 0) {
  if (!returnToLiveAfterDashboard || !context?.code) return;
  const dashboard = document.getElementById("dashboardView");
  const card = findLiveCard(context.code);
  const button = card?.querySelector(".studentShare");
  if (visible(dashboard) && button instanceof HTMLElement) {
    returnToLiveAfterDashboard = false;
    button.click();
    return;
  }
  if (attempt >= 50) {
    returnToLiveAfterDashboard = false;
    notify("Die Live-Ansicht konnte nicht automatisch geöffnet werden.", "error");
    return;
  }
  window.setTimeout(() => openLiveAfterDashboard(attempt + 1), 80);
}

function goBackToLive() {
  if (!context?.code) return;
  returnToLiveAfterDashboard = true;
  document.getElementById("backFromResults")?.click();
  window.setTimeout(() => openLiveAfterDashboard(), 0);
}

function ensureResetDialog() {
  let dialog = document.getElementById("clearResultsDialog");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "clearResultsDialog";
  dialog.className = "shareDialog clearResultsDialog";
  dialog.innerHTML = `<form class="stack compact" method="dialog">
    <h2>Alle Ergebnisse löschen?</h2>
    <p>Alle Abgaben und Beitritte dieses Tests werden unwiderruflich gelöscht. Der Test und seine Aufgaben bleiben erhalten.</p>
    <div class="dangerConfirmBox"><strong>Zur Bestätigung LÖSCHEN eingeben</strong><input name="confirmText" autocomplete="off" spellcheck="false" placeholder="LÖSCHEN" /></div>
    <div class="actions"><button type="button" class="button ghost cancelClearResults">Abbrechen</button><button type="button" class="button danger confirmClearResults" disabled>Ergebnisse endgültig löschen</button></div>
  </form>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector('input[name="confirmText"]');
  const confirm = dialog.querySelector(".confirmClearResults");
  const valid = () => ["LÖSCHEN", "LOESCHEN"].includes(String(input?.value || "").trim().toLocaleUpperCase("de"));
  input?.addEventListener("input", () => { confirm.disabled = !valid(); });
  dialog.querySelector(".cancelClearResults")?.addEventListener("click", () => dialog.close());
  confirm?.addEventListener("click", async () => {
    if (!valid() || !context?.code) return;
    confirm.disabled = true;
    confirm.textContent = "Wird gelöscht …";
    try {
      await clearAllRunData(context.code);
      dialog.close();
      notify("Ergebnisse und Beitritte wurden gelöscht.");
      document.getElementById("refreshResultsBtn")?.click();
    } catch (err) {
      console.error("Ergebnisse löschen fehlgeschlagen:", err);
      notify(err?.message || "Ergebnisse konnten nicht gelöscht werden.", "error");
    } finally {
      confirm.textContent = "Ergebnisse endgültig löschen";
      input.value = "";
      confirm.disabled = true;
    }
  });
  return dialog;
}

async function deleteDocsInChunks(db, docs, chunkSize = 400) {
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    docs.slice(i, i + chunkSize).forEach(snapshot => batch.delete(snapshot.ref));
    await batch.commit();
  }
}

async function clearAllRunData(code) {
  const app = getApps()[0];
  if (!app) throw new Error("Firebase ist noch nicht bereit.");
  const db = getFirestore(app);
  const quizSnap = await getDoc(doc(db, "quizzes", code));
  if (!quizSnap.exists()) throw new Error("Test wurde nicht gefunden.");
  const quiz = quizSnap.data() || {};
  if (quiz.published === true && quiz.ended !== true && quiz.sessionState === "running") {
    throw new Error("Der Test läuft gerade. Beende den laufenden Test zuerst, bevor du Ergebnisse löschst.");
  }
  const [submissions, attempts] = await Promise.all([
    getDocs(collection(db, "quizzes", code, "submissions")),
    getDocs(collection(db, "quizzes", code, "attempts"))
  ]);
  await deleteDocsInChunks(db, submissions.docs);
  await deleteDocsInChunks(db, attempts.docs);
}

function openResetDialog() {
  if (!context?.code) return notify("Test konnte nicht zugeordnet werden.", "error");
  const dialog = ensureResetDialog();
  try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
  window.setTimeout(() => dialog.querySelector('input[name="confirmText"]')?.focus(), 0);
}

function decorateResultsView() {
  const view = document.getElementById("resultsView");
  if (!view || view.classList.contains("hidden")) return;
  const back = document.getElementById("backFromResults");
  if (back) back.textContent = context?.live ? "← Live-Ansicht" : "← Meine Tests";
  const actions = view.querySelector(".pageHead > .actions");
  if (!actions) return;

  let liveButton = document.getElementById("resultsLiveViewBtn");
  if (context?.live) {
    if (!liveButton) {
      liveButton = document.createElement("button");
      liveButton.id = "resultsLiveViewBtn";
      liveButton.type = "button";
      liveButton.className = "button secondary";
      liveButton.textContent = "Live-Ansicht";
      liveButton.addEventListener("click", goBackToLive);
      actions.prepend(liveButton);
    }
  } else liveButton?.remove();

  if (!document.getElementById("clearResultsBtn")) {
    const clear = document.createElement("button");
    clear.id = "clearResultsBtn";
    clear.type = "button";
    clear.className = "button danger resultsDangerButton";
    clear.textContent = "Ergebnisse löschen";
    clear.title = "Alle Abgaben und Beitritte dieses Tests löschen";
    clear.addEventListener("click", openResetDialog);
    actions.appendChild(clear);
  }
}

function scheduleDecorate() {
  if (decorateScheduled) return;
  decorateScheduled = true;
  requestAnimationFrame(() => {
    decorateScheduled = false;
    renameLiveButtons();
    decorateResultsView();
  });
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  captureResultsContext(target);
  if (target.closest("#backFromResults") && context?.live) {
    returnToLiveAfterDashboard = true;
    window.setTimeout(() => openLiveAfterDashboard(), 0);
  }
}, true);

const observer = new MutationObserver(scheduleDecorate);
if (document.body) {
  scheduleDecorate();
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    scheduleDecorate();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }, { once: true });
}

const style = document.createElement("style");
style.id = "gradecrewTeacherResultsStyles";
style.textContent = `
/* Dashboard cards: consistent without creating giant empty cards */
#dashboardView .quizGrid{align-items:stretch!important}
#dashboardView .quizCard{height:100%;min-height:286px!important;align-self:stretch!important;display:flex!important}
#dashboardView .quizCardTop{min-height:78px!important}
#dashboardView .quizCardTop>div:first-child{min-width:0}
#dashboardView .quizCard h3{min-height:41px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
#dashboardView .quizCard .meta{min-height:34px}
#dashboardView .quizStats{min-height:62px;align-items:center}
#dashboardView .primaryQuizActions{margin-top:auto!important}
#dashboardView .quizMore{margin-top:0}
#dashboardView .studentShare{white-space:nowrap}

/* Results navigation and destructive reset */
#resultsView .pageHead>.actions{align-items:center}
.resultsDangerButton{margin-left:4px}
.clearResultsDialog{position:fixed!important;inset:0!important;margin:auto!important;width:min(520px,calc(100vw - 28px));max-height:calc(100dvh - 32px);overflow:auto}
.clearResultsDialog p{margin-top:-4px}
.dangerConfirmBox{padding:12px;border:1px solid #f2c5c5;border-radius:11px;background:#fff8f8;display:grid;gap:8px;color:#8f2525;font-size:12px}
.dangerConfirmBox input{text-transform:none;background:#fff}
@media(max-width:700px){#dashboardView .quizCard{min-height:0!important}#dashboardView .quizCardTop,#dashboardView .quizCard h3,#dashboardView .quizCard .meta,#dashboardView .quizStats{min-height:0!important}.resultsDangerButton{margin-left:0}}
`;
document.head.appendChild(style);
