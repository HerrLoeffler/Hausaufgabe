const APP_VERSION = "2.3.0";
const BRAND = Object.freeze({ name: "Testify", tagline: "Tests. Einfach digital." });
console.info(`${BRAND.name} v${APP_VERSION}`);

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getCountFromServer,
  collectionGroup,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import * as firebaseModule from "./firebase-config.js?v=2.3.0";
import { parseJsonWithRepair } from "./ai-json-tools.js?v=2.3.0";
import { createAiClient } from "./ai-client.js?v=2.3.1-ai1";
const firebaseConfig = firebaseModule.firebaseConfig;
const appEnvironment = firebaseModule.appEnvironment || "production";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const aiApi = createAiClient(app, () => state.user?.uid || auth.currentUser?.uid || "");

const $ = (id) => document.getElementById(id);
const views = [
  "authView",
  "dashboardView",
  "createView",
  "trashView",
  "adminView",
  "settingsView",
  "aiView",
  "editorView",
  "publishView",
  "resultsView",
  "templateView",
  "studentView"
];

const DEFAULT_SCALE = {
  id: "standard",
  name: "Standard",
  thresholds: [91, 77, 57, 39, 25, 0]
};

const DEFAULT_SETTINGS = {
  defaultSubject: "",
  defaultGrade: "",
  defaultDescription: "Bearbeite alle Aufgaben sorgfältig.",
  defaultGradeScaleId: "standard",
  defaultResultMode: "points_grade",
  defaultShowSolutions: true
};

const QUESTION_TYPES = [
  ["single", "Single Choice"],
  ["multi", "Multiple Choice"],
  ["text", "Freitext"],
  ["dropdown", "Dropdown"],
  ["truefalse", "Richtig / Falsch"],
  ["gapfill", "Lückentext"],
  ["matching", "Zuordnen"],
  ["ordering", "Sortieren / Reihenfolge"],
  ["grouping", "Gruppieren / Kategorien"],
  ["markwords", "Wörter markieren"],
  ["number", "Zahl / Rechenergebnis"]
];

const state = {
  user: null,
  profile: null,
  quizzes: [],
  currentQuiz: null,
  questions: [],
  loadedQuestionIds: new Set(),
  currentResultsQuiz: null,
  resultQuestions: [],
  submissions: [],
  settingsDraft: null,
  gradeScalesDraft: null,
  isDirty: false,
  currentSharedTemplate: null,
  studentTimerInterval: null,
  studentAttempt: null,
  publishUnsubs: [],
  publishClockInterval: null,
  studentQuizUnsub: null,
  studentProgressObserver: null,
  adminUsers: [],
  adminQuizzes: [],
  adminFeedback: [],
  adminAnnouncements: [],
  adminAudit: [],
  shownThisLogin: new Set(),
  activeAnnouncementDialogId: null,
  adminOverviewPeriod: "7d",
  pendingImportReport: null
};

function showView(id) {
  if (id !== "publishView") clearPublishSubscriptions();
  if (id !== "studentView") clearStudentSubscriptions();
  views.forEach((v) => $(v).classList.toggle("hidden", v !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message, type = "success") {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (el.className = "toast"), 3200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeWord(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function toMillis(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  if (typeof value === "string") return Date.parse(value) || 0;
  return 0;
}

function fmtDate(value) {
  const ms = toMillis(value);
  return ms ? new Date(ms).toLocaleString("de-DE") : "–";
}

function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "–";
  const min = Math.floor(total / 60);
  const sec = Math.round(total % 60);
  return `${min}:${String(sec).padStart(2, "0")} min`;
}

function baseStudentUrl(code, preview = false) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("test", code);
  if (preview) url.searchParams.set("preview", "1");
  return url.toString();
}

function baseTemplateUrl(code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("template", code);
  return url.toString();
}

function randomCode(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  crypto.getRandomValues(new Uint32Array(length)).forEach((n) => {
    out += alphabet[n % alphabet.length];
  });
  return out;
}

function randomId(prefix = "id") {
  return `${prefix}_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

function deepClone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

const PENDING_TEMPLATE_KEY = "lernplattformPendingTemplate";

function normalizeTemplateCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, location.href);
    const fromUrl = url.searchParams.get("template");
    if (fromUrl) return String(fromUrl).toUpperCase().replace(/[^A-Z0-9]/g, "");
  } catch {}
  return raw.toUpperCase().replace(/^V[\s-]*/, "").replace(/[^A-Z0-9]/g, "");
}

function rememberPendingTemplate(code) {
  if (code) sessionStorage.setItem(PENDING_TEMPLATE_KEY, code);
}

function clearPendingTemplate() {
  sessionStorage.removeItem(PENDING_TEMPLATE_KEY);
}

function clearPublishSubscriptions() {
  state.publishUnsubs.forEach((fn) => {
    try { fn?.(); } catch {}
  });
  state.publishUnsubs = [];
  if (state.publishClockInterval) clearInterval(state.publishClockInterval);
  state.publishClockInterval = null;
}

function clearStudentSubscriptions() {
  try { state.studentQuizUnsub?.(); } catch {}
  state.studentQuizUnsub = null;
  try { state.studentProgressObserver?.disconnect?.(); } catch {}
  state.studentProgressObserver = null;
}

function round1(n) {
  return Math.round(Number(n || 0) * 2) / 2;
}

function getSettings(profile = state.profile) {
  return { ...DEFAULT_SETTINGS, ...(profile?.settings || {}) };
}

function getGradeScales(profile = state.profile) {
  const raw = Array.isArray(profile?.gradeScales) ? profile.gradeScales : [];
  const cleaned = raw
    .filter((s) => s && s.id && s.name && Array.isArray(s.thresholds) && s.thresholds.length === 6)
    .map((s) => ({ id: String(s.id), name: String(s.name), thresholds: s.thresholds.map(Number) }));
  return cleaned.length ? cleaned : [deepClone(DEFAULT_SCALE)];
}

function getScaleById(id, profile = state.profile) {
  const scales = getGradeScales(profile);
  return deepClone(scales.find((s) => s.id === id) || scales[0] || DEFAULT_SCALE);
}

function getQuizScale(quiz) {
  if (quiz?.gradeScaleSnapshot?.thresholds?.length === 6) return quiz.gradeScaleSnapshot;
  if (quiz?.gradeScaleId) return getScaleById(quiz.gradeScaleId);
  return deepClone(DEFAULT_SCALE);
}

function gradeFromPercent(percent, scale = DEFAULT_SCALE) {
  const thresholds = Array.isArray(scale?.thresholds) && scale.thresholds.length === 6
    ? scale.thresholds.map(Number)
    : DEFAULT_SCALE.thresholds;
  const p = Number(percent) || 0;
  for (let i = 0; i < 6; i += 1) {
    if (p >= thresholds[i]) return i + 1;
  }
  return 6;
}

function scaleRangeText(scale) {
  const t = scale.thresholds.map(Number);
  return t.map((min, i) => {
    const max = i === 0 ? 100 : t[i - 1] - 1;
    return `${i + 1}: ${min}–${max}%`;
  }).join(" · ");
}

function isAdmin() {
  return state.profile?.role === "admin";
}

function isSuspended(profile = state.profile) {
  return profile?.status === "suspended";
}

function activeQuizzes(list = state.quizzes) {
  return list.filter((q) => !q.isDeleted);
}

function deletedQuizzes(list = state.quizzes) {
  return list.filter((q) => Boolean(q.isDeleted));
}

function startOfDaysAgo(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - Number(days || 0));
  return d;
}

function safeDialogOpen(dialog) {
  if (!dialog) return;
  try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
}

function safeDialogClose(dialog) {
  if (!dialog) return;
  try { dialog.close(); } catch { dialog.removeAttribute("open"); }
}

function setTeacherBar() {
  const loggedIn = Boolean(state.user) && !new URLSearchParams(location.search).has("test");
  $("userBar").classList.toggle("hidden", !loggedIn);
  $("userLabel").textContent = state.profile?.displayName || state.user?.displayName || state.user?.email || "";
  $("adminTopBtn")?.classList.toggle("hidden", !loggedIn || !isAdmin());
  $("appFooter")?.classList.toggle("hidden", !loggedIn);
  const staging = appEnvironment === "staging";
  const env = $("environmentBadge");
  if (env) {
    env.textContent = staging ? "TESTUMGEBUNG" : "";
    env.classList.toggle("hidden", !staging || !loggedIn);
  }
  $("stagingBanner")?.classList.toggle("hidden", !staging);
}

async function ensureProfileDefaults() {
  if (!state.user) return;
  const ref = doc(db, "users", state.user.uid);
  const current = state.profile || {};
  const patch = {};
  if (!current.settings) patch.settings = deepClone(DEFAULT_SETTINGS);
  if (!Array.isArray(current.gradeScales) || !current.gradeScales.length) patch.gradeScales = [deepClone(DEFAULT_SCALE)];
  if (!current.role) patch.role = "teacher";
  if (!current.status) patch.status = "active";
  if (Object.keys(patch).length) {
    await setDoc(ref, patch, { merge: true });
    state.profile = { ...current, ...patch };
  }
}

async function touchLastActive() {
  if (!state.user || isSuspended()) return;
  const key = `lastActive:${state.user.uid}`;
  const previous = Number(localStorage.getItem(key) || 0);
  if (Date.now() - previous < 15 * 60 * 1000) return;
  try {
    await updateDoc(doc(db, "users", state.user.uid), { lastActiveAt: serverTimestamp(), appVersion: APP_VERSION });
    localStorage.setItem(key, String(Date.now()));
  } catch (err) {
    console.warn("Letzte Aktivität konnte nicht aktualisiert werden:", err);
  }
}

// ---------- Auth / Landing ----------
$("loginTab").addEventListener("click", () => {
  $("loginTab").classList.add("active");
  $("registerTab").classList.remove("active");
  $("loginForm").classList.remove("hidden");
  $("registerForm").classList.add("hidden");
});

$("registerTab").addEventListener("click", () => {
  $("registerTab").classList.add("active");
  $("loginTab").classList.remove("active");
  $("registerForm").classList.remove("hidden");
  $("loginForm").classList.add("hidden");
});

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, $("loginEmail").value.trim(), $("loginPassword").value);
    toast("Erfolgreich angemeldet.");
  } catch (err) {
    toast(authMessage(err), "error");
  }
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;
  if (password !== $("registerPassword2").value) {
    toast("Die Passwörter stimmen nicht überein.", "error");
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      displayName: name,
      email,
      role: "teacher",
      status: "active",
      lastActiveAt: serverTimestamp(),
      appVersion: APP_VERSION,
      settings: deepClone(DEFAULT_SETTINGS),
      gradeScales: [deepClone(DEFAULT_SCALE)],
      createdAt: serverTimestamp()
    });
    toast("Account erstellt.");
  } catch (err) {
    toast(authMessage(err), "error");
  }
});

$("forgotBtn").addEventListener("click", async () => {
  const email = $("loginEmail").value.trim() || prompt("E-Mail-Adresse für den Passwort-Reset:");
  if (!email) return;
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Reset-E-Mail wurde versendet.");
  } catch (err) {
    toast(authMessage(err), "error");
  }
});

$("logoutBtn").addEventListener("click", () => signOut(auth));

$("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("joinCode").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!code) {
    toast("Bitte einen Testcode eingeben.", "error");
    return;
  }
  if (code.length < 4 || code.length > 16) {
    toast("Der Testcode ist ungültig.", "error");
    return;
  }
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("test", code);
  location.href = url.toString();
});

$("brandBtn").addEventListener("click", () => {
  clearPendingTemplate();
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  location.href = url.toString();
});

function authMessage(err) {
  const map = {
    "auth/invalid-credential": "E-Mail oder Passwort ist falsch.",
    "auth/email-already-in-use": "Für diese E-Mail existiert bereits ein Account.",
    "auth/weak-password": "Das Passwort ist zu schwach.",
    "auth/invalid-email": "Die E-Mail-Adresse ist ungültig.",
    "auth/too-many-requests": "Zu viele Versuche. Bitte später erneut versuchen."
  };
  return map[err?.code] || `Fehler: ${err?.message || "unbekannt"}`;
}

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  state.profile = null;
  if (user) {
    try {
      const p = await getDoc(doc(db, "users", user.uid));
      state.profile = p.exists() ? p.data() : { displayName: user.displayName || user.email };
      await ensureProfileDefaults();
      if (isSuspended()) {
        toast("Dieser Account wurde vorübergehend gesperrt. Bitte wende dich an den Administrator.", "error");
        await signOut(auth);
        return;
      }
      state.shownThisLogin = new Set();
      await touchLastActive();
    } catch (err) {
      console.error(err);
    }
  } else {
    state.shownThisLogin = new Set();
  }
  setTeacherBar();

  const params = new URLSearchParams(location.search);
  const rawTemplateCode = params.get("template");
  const templateCodeFromUrl = normalizeTemplateCode(rawTemplateCode);
  if (templateCodeFromUrl) rememberPendingTemplate(templateCodeFromUrl);
  const pendingTemplateCode = templateCodeFromUrl || normalizeTemplateCode(sessionStorage.getItem(PENDING_TEMPLATE_KEY));
  if ($("sharedLoginNotice")) $("sharedLoginNotice").classList.add("hidden");
  if (pendingTemplateCode) {
    if (!user) {
      showView("authView");
      $("sharedLoginNotice")?.classList.remove("hidden");
      return;
    }
    if (!templateCodeFromUrl) {
      const url = new URL(location.href);
      url.searchParams.set("template", pendingTemplateCode);
      history.replaceState({}, "", url.pathname + url.search);
    }
    await loadSharedTemplate(pendingTemplateCode);
    return;
  }

  const rawStudentCode = params.get("test");
  const studentCode = rawStudentCode ? rawStudentCode.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  if (studentCode) {
    if (studentCode.length < 4 || studentCode.length > 16) {
      showView("studentView");
      $("studentQuizCard").innerHTML = `<h1>Test nicht verfügbar</h1><p>Der Testcode ist ungültig.</p><a class="button primary" href="${escapeHtml(location.pathname)}">Zur Startseite</a>`;
      return;
    }
    await loadStudentQuiz(studentCode);
    return;
  }

  if (user) await loadDashboard();
  else showView("authView");
});

// ---------- Dashboard ----------
$("newQuizBtn").addEventListener("click", openCreateView);
$("emptyNewQuizBtn").addEventListener("click", openCreateView);
$("backFromCreate")?.addEventListener("click", loadDashboard);
$("createManualBtn")?.addEventListener("click", createQuiz);
$("createAiBtn")?.addEventListener("click", openAiView);
$("templateImportForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  openTemplateFromInput($("templateImportInput")?.value || "");
});
$("quizSearch").addEventListener("input", renderQuizList);
$("quizFilter").addEventListener("change", renderQuizList);
$("quizSort")?.addEventListener("change", renderQuizList);
$("backFromEditor").addEventListener("click", leaveEditorToDashboard);
$("backFromResults").addEventListener("click", loadDashboard);
$("settingsBtn")?.addEventListener("click", openSettings);
$("settingsTopBtn").addEventListener("click", openSettings);
$("trashBtn")?.addEventListener("click", openTrash);
$("backFromTrash")?.addEventListener("click", loadDashboard);
$("adminTopBtn")?.addEventListener("click", openAdmin);
$("backFromAdmin")?.addEventListener("click", loadDashboard);
$("refreshAdminBtn")?.addEventListener("click", () => loadAdminData(true));

function openCreateView() {
  if (!state.user) {
    showView("authView");
    return;
  }
  if ($("templateImportInput")) $("templateImportInput").value = "";
  showView("createView");
}

function openTemplateFromInput(value) {
  const code = normalizeTemplateCode(value);
  if (!code || code.length < 4 || code.length > 16) {
    toast("Bitte einen gültigen Freigabelink oder Vorlagencode eingeben.", "error");
    return;
  }
  rememberPendingTemplate(code);
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("template", code);
  history.replaceState({}, "", url.pathname + url.search);
  loadSharedTemplate(code);
}

async function loadDashboard() {
  if (!state.user) return;
  clearPublishSubscriptions();
  clearStudentSubscriptions();
  state.pendingImportReport = null;
  showView("dashboardView");
  $("quizList").innerHTML = `<div class="card">Tests werden geladen …</div>`;
  try {
    const snap = await getDocs(query(collection(db, "quizzes"), where("ownerId", "==", state.user.uid)));
    state.quizzes = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt));
    renderQuizList();
    await loadAnnouncements();
  } catch (err) {
    console.error(err);
    $("quizList").innerHTML = "";
    toast("Tests konnten nicht geladen werden. Prüfe die Firestore-Regeln.", "error");
  }
}

function filteredQuizzes() {
  const term = normalize($("quizSearch")?.value || "");
  const status = $("quizFilter")?.value || "all";
  const sort = $("quizSort")?.value || "updated";
  const list = state.quizzes.filter((q) => {
    if (q.isDeleted) return false;
    const isEnded = Boolean(q.ended);
    const isPublished = Boolean(q.published) && !isEnded;
    if (status === "published" && !isPublished) return false;
    if (status === "ended" && !isEnded) return false;
    if (status === "draft" && (isPublished || isEnded)) return false;
    if (!term) return true;
    const hay = normalize([q.title, q.subject, q.grade, q.id, q.description].join(" "));
    return hay.includes(term);
  });
  const collator = new Intl.Collator("de", { numeric: true, sensitivity: "base" });
  list.sort((a, b) => {
    if (sort === "title") return collator.compare(a.title || "", b.title || "");
    if (sort === "subject") return collator.compare(a.subject || "", b.subject || "") || collator.compare(a.title || "", b.title || "");
    if (sort === "grade") return collator.compare(a.grade || "", b.grade || "") || collator.compare(a.title || "", b.title || "");
    return toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt);
  });
  return list;
}

function quizStatusMeta(q) {
  if (q.ended) return { label: "Beendet", cls: "ended" };
  if (q.published && q.startMode === "teacher" && q.sessionState === "waiting") return { label: "Wartet auf Start", cls: "waiting" };
  if (q.published && q.startMode === "teacher" && q.sessionState === "running") return { label: "Läuft", cls: "running" };
  if (q.published) return { label: "Veröffentlicht", cls: "published" };
  if (Number(q.questionCount || 0) === 0) return { label: "Unvollständig", cls: "incomplete" };
  return { label: "Entwurf", cls: "draft" };
}

function renderQuizList() {
  const list = $("quizList");
  list.innerHTML = "";
  const filtered = filteredQuizzes();
  const active = activeQuizzes();
  $("emptyQuizState").classList.toggle("hidden", active.length !== 0);
  $("noFilterState").classList.toggle("hidden", active.length === 0 || filtered.length !== 0);
  if (!filtered.length) return;

  filtered.forEach((q) => {
    const status = quizStatusMeta(q);
    const card = document.createElement("article");
    card.className = "card quizCard";
    card.innerHTML = `
      <div class="quizCardTop">
        <div>
          <h3>${escapeHtml(q.title || "Unbenannter Test")}</h3>
          <div class="meta">${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · Code ${q.id}</div>
        </div>
        <span class="status ${status.cls}">${status.label}</span>
      </div>
      <div class="quizStats">
        <div><strong>${Number(q.questionCount || 0)}</strong><span>Aufgaben</span></div>
        <div><strong>${Number(q.totalPoints || 0)}</strong><span>Punkte</span></div>
        ${Number(q.timeLimitMinutes) > 0 ? `<div><strong>${Number(q.timeLimitMinutes)}</strong><span>Minuten</span></div>` : ""}
        ${q.startMode === "teacher" ? `<div><strong>Gemeinsam</strong><span>Start</span></div>` : ""}
      </div>
      <div class="quizActions primaryQuizActions">
        <button class="button secondary edit">Bearbeiten</button>
        <button class="button secondary results">Ergebnisse</button>
        ${q.published && !q.ended ? `<button class="button ghost studentShare">Schülerlink</button>` : ""}
      </div>
      <div class="quizActions secondaryQuizActions">
        <button class="button ghost duplicate">Duplizieren</button>
        <button class="button ghost teacherShare">Mit Kollegen teilen</button>
        ${q.published && !q.ended ? `<button class="button ghost end">Beenden</button>` : ""}
        ${q.ended ? `<button class="button ghost reopen">Erneut öffnen</button>` : ""}
        <button class="button danger remove">Löschen</button>
      </div>`;
    card.querySelector(".edit").addEventListener("click", () => openEditor(q.id));
    card.querySelector(".results").addEventListener("click", () => openResults(q.id));
    card.querySelector(".duplicate").addEventListener("click", () => duplicateQuiz(q.id));
    card.querySelector(".studentShare")?.addEventListener("click", () => showPublish(q.id));
    card.querySelector(".teacherShare").addEventListener("click", () => shareQuizTemplate(q.id));
    card.querySelector(".end")?.addEventListener("click", () => endQuiz(q.id));
    card.querySelector(".reopen")?.addEventListener("click", () => reopenQuiz(q.id));
    card.querySelector(".remove").addEventListener("click", () => deleteQuiz(q.id));
    list.appendChild(card);
  });
}

function quizDefaults() {
  const settings = getSettings();
  const scale = getScaleById(settings.defaultGradeScaleId);
  return {
    title: "Neuer Test",
    subject: settings.defaultSubject || "",
    grade: settings.defaultGrade || "",
    description: settings.defaultDescription || "Bearbeite alle Aufgaben sorgfältig.",
    gradeScaleId: scale.id,
    gradeScaleSnapshot: deepClone(scale),
    resultMode: settings.defaultResultMode || "points_grade",
    showSolutions: Boolean(settings.defaultShowSolutions),
    timeLimitMinutes: null,
    startMode: "student",
    shuffleQuestions: false,
    shuffleAnswers: false,
    sessionState: "open",
    sessionRunId: null,
    sessionStartedAt: null,
    ownerId: state.user.uid,
    published: false,
    ended: false,
    isDeleted: false,
    shareEnabled: false,
    questionCount: 0,
    totalPoints: 0
  };
}

async function createQuizDocument(base = {}) {
  if (!state.user) throw new Error("Nicht angemeldet");
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const code = randomCode();
    if (state.quizzes.some((q) => q.id === code)) continue;
    const quiz = {
      ...quizDefaults(),
      ...base,
      ownerId: state.user.uid,
      accessCode: code,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, "quizzes", code), quiz);
      return { code, quiz };
    } catch (err) {
      if (err?.code === "permission-denied" && attempt < 6) continue;
      throw err;
    }
  }
  throw new Error("Testcode konnte nicht erzeugt werden.");
}

async function createQuiz() {
  if (!state.user) {
    toast("Bitte zuerst anmelden.", "error");
    return;
  }
  try {
    const { code } = await createQuizDocument();
    await openEditor(code);
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht erstellt werden.", "error");
  }
}

async function duplicateQuiz(code) {
  const source = state.quizzes.find((q) => q.id === code);
  if (!source) return;
  try {
    const qSnap = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    const questions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const base = {
      title: `${source.title || "Test"} – Kopie`,
      subject: source.subject || "",
      grade: source.grade || "",
      description: source.description || "",
      gradeScaleId: source.gradeScaleId || getSettings().defaultGradeScaleId,
      gradeScaleSnapshot: deepClone(getQuizScale(source)),
      resultMode: source.resultMode || getSettings().defaultResultMode,
      showSolutions: source.showSolutions ?? getSettings().defaultShowSolutions,
      timeLimitMinutes: Number(source.timeLimitMinutes) > 0 ? Number(source.timeLimitMinutes) : null,
      startMode: source.startMode === "teacher" ? "teacher" : "student",
      shuffleQuestions: Boolean(source.shuffleQuestions),
      shuffleAnswers: Boolean(source.shuffleAnswers),
      sessionState: "open",
      sessionRunId: null,
      sessionStartedAt: null,
      published: false,
      ended: false,
      shareEnabled: false,
      questionCount: questions.length,
      totalPoints: round1(questions.reduce((sum, q) => sum + Number(q.points || 0), 0))
    };
    const { code: newCode } = await createQuizDocument(base);
    for (let i = 0; i < questions.length; i += 1) {
      const copy = sanitizeQuestionForSave({ ...deepClone(questions[i]), id: randomId("q"), position: i + 1 });
      const ref = doc(collection(db, "quizzes", newCode, "questions"));
      await setDoc(ref, { ...copy, position: i + 1, updatedAt: serverTimestamp() });
    }
    toast("Test dupliziert.");
    await openEditor(newCode);
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht dupliziert werden.", "error");
  }
}

async function deleteQuiz(code) {
  const q = state.quizzes.find((x) => x.id === code);
  if (!confirm(`Test „${q?.title || code}“ in den Papierkorb verschieben? Aufgaben und Ergebnisse bleiben erhalten.`)) return;
  try {
    await updateDoc(doc(db, "quizzes", code), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: state.user.uid,
      published: false,
      ended: true,
      updatedAt: serverTimestamp()
    });
    toast("Test in den Papierkorb verschoben.");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht in den Papierkorb verschoben werden.", "error");
  }
}

async function restoreQuiz(code, { admin = false } = {}) {
  try {
    await updateDoc(doc(db, "quizzes", code), {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      published: false,
      ended: false,
      updatedAt: serverTimestamp()
    });
    if (admin) await writeAdminAudit("quiz_restored", { quizId: code });
    const localQuiz = state.quizzes.find((x) => x.id === code);
    if (localQuiz) Object.assign(localQuiz, { isDeleted: false, deletedAt: null, deletedBy: null, published: false, ended: false });
    toast("Test als Entwurf wiederhergestellt.");
    if (admin) await loadAdminData(true); else await openTrash();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht wiederhergestellt werden.", "error");
  }
}

function confirmPermanentDelete(quizTitle) {
  const dialog = $("dangerConfirmDialog");
  const title = $("dangerConfirmTitle");
  const text = $("dangerConfirmText");
  const cancelBtn = $("dangerConfirmCancel");
  const confirmBtn = $("dangerConfirmOk");
  if (!dialog || !title || !text || !cancelBtn || !confirmBtn) {
    return Promise.resolve(confirm(`Test „${quizTitle}“ endgültig löschen? Test, Aufgaben und Ergebnisse werden unwiderruflich gelöscht.`));
  }
  title.textContent = "Test endgültig löschen?";
  text.textContent = `„${quizTitle}“ sowie alle Aufgaben und Ergebnisse werden unwiderruflich gelöscht. Dieser Schritt kann nicht rückgängig gemacht werden.`;
  confirmBtn.textContent = "Endgültig löschen";
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      dialog.close();
      cleanup();
      resolve(value);
    };
    const onCancel = (event) => { event?.preventDefault?.(); finish(false); };
    const onConfirm = () => finish(true);
    const onBackdrop = (event) => { if (event.target === dialog) finish(false); };
    const cleanup = () => {
      cancelBtn.removeEventListener("click", onCancel);
      confirmBtn.removeEventListener("click", onConfirm);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onBackdrop);
    };
    cancelBtn.addEventListener("click", onCancel);
    confirmBtn.addEventListener("click", onConfirm);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onBackdrop);
    dialog.showModal();
  });
}

async function permanentlyDeleteQuiz(code, { admin = false } = {}) {
  const q = (admin ? state.adminQuizzes : state.quizzes).find((x) => x.id === code);
  const approved = await confirmPermanentDelete(q?.title || code);
  if (!approved) return;
  try {
    const qSnap = await getDocs(collection(db, "quizzes", code, "questions"));
    for (const d of qSnap.docs) await deleteDoc(d.ref);
    const sSnap = await getDocs(collection(db, "quizzes", code, "submissions"));
    for (const d of sSnap.docs) await deleteDoc(d.ref);
    const aSnap = await getDocs(collection(db, "quizzes", code, "attempts"));
    for (const d of aSnap.docs) await deleteDoc(d.ref);
    await deleteDoc(doc(db, "quizzes", code));
    if (admin) await writeAdminAudit("quiz_deleted_permanently", { quizId: code, title: q?.title || "" });
    state.quizzes = state.quizzes.filter((x) => x.id !== code);
    toast("Test endgültig gelöscht.");
    if (admin) await loadAdminData(true); else await openTrash();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht vollständig gelöscht werden.", "error");
  }
}

async function openTrash() {
  if (!state.user) return;
  showView("trashView");
  const root = $("trashList");
  root.innerHTML = "";
  const items = deletedQuizzes().sort((a, b) => toMillis(b.deletedAt) - toMillis(a.deletedAt));
  $("emptyTrashState")?.classList.toggle("hidden", items.length > 0);
  items.forEach((q) => {
    const card = document.createElement("article");
    card.className = "card quizCard trashCard";
    card.innerHTML = `<div class="trashCardContent"><h3>${escapeHtml(q.title || "Unbenannter Test")}</h3><div class="meta">${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · Code ${escapeHtml(q.id)}</div><p class="trashDeletedAt">Gelöscht: ${escapeHtml(fmtDate(q.deletedAt))}</p></div><div class="quizActions trashActions"><button class="button primary restore">Wiederherstellen</button><button class="button danger purge">Endgültig löschen</button></div>`;
    card.querySelector(".restore").addEventListener("click", () => restoreQuiz(q.id));
    card.querySelector(".purge").addEventListener("click", () => permanentlyDeleteQuiz(q.id));
    root.appendChild(card);
  });
}


// ---------- Teststatus + Teilen mit Kollegen ----------
async function endQuiz(code, { returnToEditor = false } = {}) {
  const quiz = state.quizzes.find((q) => q.id === code) || (state.currentQuiz?.id === code ? state.currentQuiz : null);
  if (!quiz) return;
  if (returnToEditor && state.currentQuiz?.id === code && state.isDirty) {
    const saved = await saveCurrentQuiz(false);
    if (!saved) return;
  }
  if (!confirm(`Test „${quiz.title || code}“ jetzt beenden? Schüler können ihn danach nicht mehr öffnen oder neu abgeben. Ergebnisse bleiben erhalten.`)) return;
  try {
    await updateDoc(doc(db, "quizzes", code), {
      published: false,
      ended: true,
      sessionState: "ended",
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (state.currentQuiz?.id === code) state.currentQuiz = { ...state.currentQuiz, published: false, ended: true, sessionState: "ended" };
    toast("Test beendet.");
    if (returnToEditor) {
      updateSummary();
      updateEditorPublishControls();
    } else {
      await loadDashboard();
    }
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht beendet werden.", "error");
  }
}

async function reopenQuiz(code, { returnToEditor = false } = {}) {
  try {
    const current = state.quizzes.find((q) => q.id === code) || (state.currentQuiz?.id === code ? state.currentQuiz : null) || {};
    const teacherMode = current.startMode === "teacher";
    const runId = teacherMode ? randomId("run") : null;
    await updateDoc(doc(db, "quizzes", code), {
      published: true,
      ended: false,
      sessionState: teacherMode ? "waiting" : "open",
      sessionRunId: runId,
      sessionStartedAt: null,
      reopenedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (state.currentQuiz?.id === code) state.currentQuiz = { ...state.currentQuiz, published: true, ended: false, sessionState: teacherMode ? "waiting" : "open", sessionRunId: runId, sessionStartedAt: null };
    toast("Test wieder geöffnet.");
    if (returnToEditor) {
      updateSummary();
      updateEditorPublishControls();
      showPublish(code);
    } else {
      await loadDashboard();
    }
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht wieder geöffnet werden.", "error");
  }
}

async function shareQuizTemplate(code) {
  if (!state.user) return;
  try {
    if (state.currentQuiz?.id === code && state.isDirty) {
      const saved = await saveCurrentQuiz(false);
      if (!saved) return;
    }
    await updateDoc(doc(db, "quizzes", code), {
      shareEnabled: true,
      sharedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (state.currentQuiz?.id === code) state.currentQuiz.shareEnabled = true;
    openShareDialog(code);
  } catch (err) {
    console.error(err);
    toast("Vorlage konnte nicht freigegeben werden. Prüfe nach dem Deploy die Firestore-Regeln.", "error");
  }
}

function openShareDialog(code) {
  const dialog = $("shareDialog");
  if (!dialog) return;
  $("shareDialogLink").value = baseTemplateUrl(code);