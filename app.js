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
import { createAiClient } from "./ai-client.js?v=2.3.1-ai10";
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
  defaultDescription: "Viel Erfolg beim Test!",
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
  newManualQuiz: false,
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
  pendingImportReport: null,
  aiMaterials: [],
  teacherTourConfig: null
};


const DEFAULT_TEACHER_TOUR_CONFIG = Object.freeze({
  enabled: true,
  version: "ai-beta-tour-v3",
  steps: [
    {
      icon: "👋",
      title: "Schön, dass du da bist!",
      text: "Du testest die neuen KI-Funktionen von Testify. Die wichtigsten Neuerungen zeigen wir dir kurz in vier Schritten.",
      bullets: ["KI-Tests bleiben Entwürfe, bis du sie geprüft und veröffentlicht hast."]
    },
    {
      icon: "✨",
      title: "Tests mit KI erstellen",
      text: "Unter „+ Neuer Test“ kannst du einen kompletten Test mit KI erzeugen und anschließend im Editor anpassen.",
      bullets: ["Fach, Klasse, Thema, Aufgabentypen, Punkte und Bilder vorgeben.", "⚠ Jede KI-Generierung verursacht Kosten. Bitte KI-Funktionen gezielt und sparsam nutzen – auch „KI bearbeiten“ und „Variante hinzufügen“."]
    },
    {
      icon: "☺",
      title: "KI-Aufgaben kurz bewerten",
      text: "Bewerte möglichst jede KI-Aufgabe mit ☺ oder ☹. So lernt Testify, was gut funktioniert und wo typische Fehler entstehen.",
      bullets: ["☺ Gut: Aufgabe kann so bleiben.", "☹ Problem: Grund auswählen und Aufgabe behalten, ersetzen oder entfernen."]
    },
    {
      icon: "↻",
      title: "Aufgaben gezielt verändern",
      text: "„KI bearbeiten“ verbessert eine Aufgabe nach deinem Hinweis. „Variante hinzufügen“ erstellt eine gleichwertige neue Aufgabe.",
      bullets: ["Neue oder veränderte Aufgaben bitte kurz prüfen und bewerten.", "💬 Fehler, Wünsche oder Ideen? Nutze unten die Feedback-Funktion – Rückmeldungen helfen besonders in der aktuellen Entwicklungsphase."]
    }
  ]
});

function normalizeTeacherTourConfig(raw = {}) {
  const sourceSteps = Array.isArray(raw.steps) ? raw.steps : DEFAULT_TEACHER_TOUR_CONFIG.steps;
  const steps = sourceSteps
    .slice(0, 10)
    .map((step, index) => ({
      icon: String(step?.icon || "•").trim().slice(0, 8) || "•",
      title: String(step?.title || `Schritt ${index + 1}`).trim().slice(0, 120),
      text: String(step?.text || "").trim().slice(0, 1200),
      bullets: (Array.isArray(step?.bullets) ? step.bullets : String(step?.bullets || "").split("\n"))
        .map(value => String(value || "").trim().slice(0, 500))
        .filter(Boolean)
        .slice(0, 8)
    }))
    .filter(step => step.title || step.text || step.bullets.length);
  return {
    enabled: raw.enabled !== false,
    version: String(raw.version || DEFAULT_TEACHER_TOUR_CONFIG.version).trim().slice(0, 120) || DEFAULT_TEACHER_TOUR_CONFIG.version,
    steps: steps.length ? steps : deepClone(DEFAULT_TEACHER_TOUR_CONFIG.steps)
  };
}

async function loadTeacherTourConfig({ force = false } = {}) {
  if (state.teacherTourConfig && !force) return state.teacherTourConfig;
  try {
    const snap = await getDoc(doc(db, "appConfig", "teacherTour"));
    state.teacherTourConfig = normalizeTeacherTourConfig(snap.exists() ? snap.data() : DEFAULT_TEACHER_TOUR_CONFIG);
  } catch (err) {
    console.warn("Tutorial-Konfiguration konnte nicht geladen werden:", err);
    state.teacherTourConfig = normalizeTeacherTourConfig(DEFAULT_TEACHER_TOUR_CONFIG);
  }
  return state.teacherTourConfig;
}

function currentTeacherTourConfig() {
  return state.teacherTourConfig || normalizeTeacherTourConfig(DEFAULT_TEACHER_TOUR_CONFIG);
}

let teacherTourIndex = 0;

function teacherTourStorageKey() {
  const config = currentTeacherTourConfig();
  return state.user ? `teacherTour:${state.user.uid}:${config.version}` : "";
}

function renderTeacherTourStep() {
  const config = currentTeacherTourConfig();
  const steps = config.steps || [];
  const step = steps[teacherTourIndex] || steps[0];
  if (!step) return;
  $("teacherTourStepLabel").textContent = `${teacherTourIndex + 1} von ${steps.length}`;
  $("teacherTourIcon").textContent = step.icon;
  $("teacherTourTitle").textContent = step.title;
  $("teacherTourText").textContent = step.text;
  $("teacherTourBullets").innerHTML = step.bullets.map(item => {
    const warning = item.trim().startsWith("⚠");
    return `<div class="teacherTourBullet${warning ? " warning" : ""}"><span>${warning ? "⚠" : "✓"}</span><p>${escapeHtml(warning ? item.replace(/^⚠\\s*/, "") : item)}</p></div>`;
  }).join("");
  $("teacherTourDots").innerHTML = steps.map((_, index) => `<span class="teacherTourDot${index === teacherTourIndex ? " active" : ""}"></span>`).join("");
  $("teacherTourBack").disabled = teacherTourIndex === 0;
  $("teacherTourNext").textContent = teacherTourIndex === steps.length - 1 ? "Los geht’s" : "Weiter";
}

function maybeShowTeacherTour() {
  if (!state.user || isSuspended()) return false;
  const config = currentTeacherTourConfig();
  if (!config.enabled || !config.steps?.length) return false;
  const key = teacherTourStorageKey();
  try { if (key && localStorage.getItem(key) === "done") return false; } catch (_) {}
  teacherTourIndex = 0;
  renderTeacherTourStep();
  safeDialogOpen($("teacherTourDialog"));
  return true;
}

async function finishTeacherTour() {
  const key = teacherTourStorageKey();
  try { if (key) localStorage.setItem(key, "done"); } catch (_) {}
  safeDialogClose($("teacherTourDialog"));
  await loadAnnouncements();
}

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

const REPORTABLE_ERROR_CODES = Object.freeze({
  aiCreate: "AI-CREATE-001",
  aiSimilar: "AI-SIMILAR-001",
  aiEdit: "AI-EDIT-001",
  aiVariant: "AI-VARIANT-001",
  dataLoad: "APP-DATA-001",
  unexpected: "APP-UNEXPECTED-001"
});

function currentViewId() {
  return views.find((id) => !$(id)?.classList.contains("hidden")) || "unknown";
}

function shortErrorFingerprint(value) {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
}

function cleanTechnicalDetails(details = {}) {
  const out = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (value == null) out[key] = null;
    else if (typeof value === "boolean" || typeof value === "number") out[key] = value;
    else out[key] = String(value).slice(0, 1000);
  }
  return out;
}

function ensureReportableErrorHost() {
  let host = $("reportableErrorHost");
  if (host) return host;
  host = document.createElement("div");
  host.id = "reportableErrorHost";
  host.className = "reportableErrorHost";
  host.setAttribute("aria-live", "assertive");
  document.body.appendChild(host);
  return host;
}

function showReportableError({ code = REPORTABLE_ERROR_CODES.unexpected, message = "Etwas hat nicht funktioniert.", error = null, action = "unknown", details = {} } = {}) {
  const host = ensureReportableErrorHost();
  const rawMessage = String(error?.message || error || "").slice(0, 1800);
  const providerCode = String(error?.code || error?.status || "").slice(0, 160);
  const stack = String(error?.stack || "").slice(0, 7000);
  const cleanedDetails = cleanTechnicalDetails(details);
  const fingerprint = shortErrorFingerprint([code, action, providerCode, rawMessage, stack.split("\n").slice(0, 3).join("|")].join("|"));
  const existing = host.querySelector(`[data-error-fingerprint="${fingerprint}"]`);
  if (existing) {
    existing.__reportPayload.occurrences += 1;
    const count = existing.querySelector(".reportableErrorOccurrences");
    if (count) count.textContent = ` · ${existing.__reportPayload.occurrences}× aufgetreten`;
    existing.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return existing.__reportPayload;
  }

  const quiz = state.currentQuiz || state.currentResultsQuiz || null;
  const payload = {
    errorCode: code,
    fingerprint,
    action: String(action || "unknown").slice(0, 120),
    userMessage: String(message || "Etwas hat nicht funktioniert.").slice(0, 800),
    errorName: String(error?.name || "Error").slice(0, 120),
    providerCode,
    rawMessage,
    stack,
    view: currentViewId(),
    pageUrl: location.href.slice(0, 1200),
    testCode: String(quiz?.id || "").slice(0, 80),
    questionCount: Array.isArray(state.questions) ? state.questions.length : 0,
    appVersion: APP_VERSION,
    environment: appEnvironment || "production",
    userAgent: navigator.userAgent.slice(0, 1200),
    language: String(navigator.language || "").slice(0, 40),
    online: navigator.onLine,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    occurredAtClient: new Date().toISOString(),
    occurrences: 1,
    details: cleanedDetails
  };

  const card = document.createElement("section");
  card.className = "reportableErrorCard";
  card.dataset.errorFingerprint = fingerprint;
  card.__reportPayload = payload;
  card.innerHTML = `<div class="reportableErrorHead"><div><strong>Das hat leider nicht funktioniert.</strong><span class="reportableErrorCode">${escapeHtml(code)}</span><span class="reportableErrorOccurrences"></span></div><button type="button" class="reportableErrorClose" aria-label="Fehlermeldung schließen">×</button></div><p>${escapeHtml(payload.userMessage)}</p><small class="reportableErrorHint">Die Meldung bleibt sichtbar. Mit „Problem melden“ werden technische Informationen automatisch an Testify gesendet – keine Schülerantworten.</small><div class="reportableErrorActions"><button type="button" class="button primary reportableErrorSend">Problem melden</button><span class="reportableErrorStatus"></span></div>`;
  card.querySelector(".reportableErrorClose").addEventListener("click", () => card.remove());
  card.querySelector(".reportableErrorSend").addEventListener("click", () => submitTechnicalErrorReport(card));
  host.prepend(card);
  return payload;
}

async function submitTechnicalErrorReport(card) {
  const payload = card?.__reportPayload;
  const button = card?.querySelector(".reportableErrorSend");
  const status = card?.querySelector(".reportableErrorStatus");
  if (!payload || !button) return;
  if (!state.user) {
    if (status) status.textContent = "Bitte als Lehrkraft anmelden, um den Fehler zu melden.";
    return;
  }
  button.disabled = true;
  button.textContent = "Wird gemeldet …";
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase()}`;
  try {
    await setDoc(doc(db, "feedback", `err-${reportId.toLowerCase()}`), {
      userId: state.user.uid,
      displayName: state.profile?.displayName || state.user.displayName || "",
      email: state.user.email || state.profile?.email || "",
      category: "app_error",
      message: `Technischer Fehler ${payload.errorCode}: ${payload.userMessage}`,
      errorCode: payload.errorCode,
      reportId,
      fingerprint: payload.fingerprint,
      action: payload.action,
      testCode: payload.testCode || null,
      feedbackSchemaVersion: 3,
      appVersion: payload.appVersion,
      environment: payload.environment,
      userAgent: payload.userAgent,
      pageUrl: payload.pageUrl,
      technicalDetails: {
        errorName: payload.errorName,
        providerCode: payload.providerCode,
        rawMessage: payload.rawMessage,
        stack: payload.stack,
        view: payload.view,
        questionCount: payload.questionCount,
        language: payload.language,
        online: payload.online,
        viewport: payload.viewport,
        screen: payload.screen,
        occurredAtClient: payload.occurredAtClient,
        occurrences: payload.occurrences,
        ...payload.details
      },
      status: "new",
      createdAt: serverTimestamp()
    });
    card.classList.add("reported");
    button.textContent = "Gemeldet ✓";
    if (status) status.textContent = `Report ${reportId}`;
  } catch (reportError) {
    console.error("Technischer Fehler konnte nicht gemeldet werden:", reportError);
    button.disabled = false;
    button.textContent = "Problem melden";
    if (status) status.textContent = "Melden fehlgeschlagen – bitte erneut versuchen.";
  }
}

window.addEventListener("error", (event) => {
  if (!event.error) return;
  if (event.filename && !event.filename.startsWith(location.origin)) return;
  showReportableError({
    code: REPORTABLE_ERROR_CODES.unexpected,
    message: "In Testify ist ein unerwarteter Fehler aufgetreten.",
    error: event.error,
    action: "window_error",
    details: { file: event.filename || "", line: event.lineno || 0, column: event.colno || 0 }
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Unbekannter Promise-Fehler"));
  showReportableError({
    code: REPORTABLE_ERROR_CODES.unexpected,
    message: "Eine Aktion konnte nicht vollständig abgeschlossen werden.",
    error: reason,
    action: "unhandled_promise"
  });
});

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
  const settings = { ...DEFAULT_SETTINGS, ...(profile?.settings || {}) };
  if (!settings.defaultDescription || settings.defaultDescription === "Bearbeite alle Aufgaben sorgfältig.") {
    settings.defaultDescription = DEFAULT_SETTINGS.defaultDescription;
  }
  return settings;
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

$("logoutBtn").addEventListener("click", async () => {
  await Promise.race([
    Promise.allSettled(state.aiMaterials.map(m => aiApi.removeMaterial(m))),
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);
  state.aiMaterials = [];
  await signOut(auth);
});

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
  if (state.user?.uid !== user?.uid) state.aiMaterials = [];
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
    await loadTeacherTourConfig();
    const tourOpened = maybeShowTeacherTour();
    if (!tourOpened) await loadAnnouncements();
  } catch (err) {
    console.error(err);
    $("quizList").innerHTML = "";
    showReportableError({
      code: REPORTABLE_ERROR_CODES.dataLoad,
      message: "Tests konnten nicht geladen werden.",
      error: err,
      action: "load_dashboard"
    });
  }
}

function filteredQuizzes() {
  const term = normalize($("quizSearch")?.value || "");
  const status = $("quizFilter")?.value || "all";
  const sort = $("quizSort")?.value || "updated";
  const list = state.quizzes.filter((q) => {
    if (q.isDeleted) return false;
    const isEnded = Boolean(q.ended);
    const isPublished = Boolean(q.published) && !isEnded && !q.rightsHold;
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
  if (q.rightsHold) return { label: "Zugang gesperrt", cls: "rightsHold" };
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
        ${q.published && !q.ended && !q.rightsHold ? `<button class="button ghost studentShare">Schülerlink</button>` : ""}
      </div>
      <div class="quizActions secondaryQuizActions">
        ${q.rightsHold ? "" : '<button class="button ghost duplicate">Duplizieren</button><button class="button ghost teacherShare">Mit Kollegen teilen</button>'}
        ${q.published && !q.ended && !q.rightsHold ? `<button class="button ghost end">Beenden</button>` : ""}
        ${q.ended && !q.rightsHold ? `<button class="button ghost reopen">Erneut öffnen</button>` : ""}
        <button class="button danger remove">Löschen</button>
      </div>`;
    card.querySelector(".edit").addEventListener("click", () => openEditor(q.id));
    card.querySelector(".results").addEventListener("click", () => openResults(q.id));
    card.querySelector(".duplicate")?.addEventListener("click", () => duplicateQuiz(q.id));
    card.querySelector(".studentShare")?.addEventListener("click", () => showPublish(q.id));
    card.querySelector(".teacherShare")?.addEventListener("click", () => shareQuizTemplate(q.id));
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
    description: settings.defaultDescription || "Viel Erfolg beim Test!",
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
    rightsHold: false,
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
  const code = randomCode();
  state.newManualQuiz = true;
  state.currentQuiz = { ...quizDefaults(), id: code };
  state.questions = [];
  state.loadedQuestionIds = new Set();
  state.pendingImportReport = null;
  renderEditorState(state.currentQuiz);
}

async function duplicateQuiz(code) {
  const source = state.quizzes.find((q) => q.id === code);
  if (!source) return;
  if (source.rightsHold) return toast("Dieser Test ist wegen eines Rechtehinweises vorübergehend gesperrt.", "error");
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
    if (current.rightsHold) return toast("Dieser Test ist wegen eines Rechtehinweises vorübergehend gesperrt.", "error");
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
  if (state.quizzes.find(q => q.id === code)?.rightsHold || (state.currentQuiz?.id === code && state.currentQuiz.rightsHold)) return toast("Dieser Test ist wegen eines Rechtehinweises vorübergehend gesperrt.", "error");
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
  $("shareDialogLink").value = baseTemplateUrl(code);  $("shareDialogCode").value = `V-${code}`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeShareDialog() {
  const dialog = $("shareDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

$("closeShareDialog")?.addEventListener("click", closeShareDialog);
$("doneShareDialog")?.addEventListener("click", closeShareDialog);
$("copyShareLinkBtn")?.addEventListener("click", () => copyText($("shareDialogLink")?.value || "", "Vorlagen-Link kopiert."));
$("copyShareCodeBtn")?.addEventListener("click", () => copyText($("shareDialogCode")?.value || "", "Vorlagencode kopiert."));
$("shareDialog")?.addEventListener("click", (e) => {
  if (e.target === $("shareDialog")) closeShareDialog();
});

async function loadSharedTemplate(code) {
  showView("templateView");
  $("templateCard").innerHTML = `<div>Vorlage wird geladen …</div>`;
  try {
    const snap = await getDoc(doc(db, "quizzes", code));
    if (!snap.exists()) throw new Error("Diese Vorlage existiert nicht mehr.");
    const quiz = { id: code, ...snap.data() };
    if (!quiz.shareEnabled && quiz.ownerId !== state.user?.uid) throw new Error("Die Freigabe dieser Vorlage wurde deaktiviert.");
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    const questions = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    state.currentSharedTemplate = { quiz, questions };
    const timeInfo = Number(quiz.timeLimitMinutes) > 0 ? ` · ${Number(quiz.timeLimitMinutes)} Min. Zeitlimit` : "";
    $("templateCard").innerHTML = `
      <button id="backTemplateDashboard" class="linkButton left" type="button">← Zu meinen Tests</button>
      <span class="eyebrow">Von einer Lehrkraft geteilt</span>
      <h1>${escapeHtml(quiz.title || "Geteilter Test")}</h1>
      <p>${escapeHtml(quiz.description || "")}</p>
      <div class="templateMeta">${escapeHtml(quiz.subject || "–")} · Klasse ${escapeHtml(quiz.grade || "–")} · ${questions.length} Aufgaben · ${Number(quiz.totalPoints || 0)} Punkte${timeInfo}</div>
      <div class="shareInfoBox">Du erhältst eine unabhängige Kopie. Schülernamen, Abgaben und Ergebnisse des Kollegen werden nicht übernommen.</div>
      <div class="actions templateActions">
        <button id="importTemplateCopy" class="button primary" type="button">Als Kopie zu meinen Tests hinzufügen</button>
        <button id="cancelTemplateCopy" class="button ghost" type="button">Abbrechen</button>
      </div>`;
    $("backTemplateDashboard").addEventListener("click", clearTemplateUrlAndDashboard);
    $("cancelTemplateCopy").addEventListener("click", clearTemplateUrlAndDashboard);
    $("importTemplateCopy").addEventListener("click", importSharedTemplate);
  } catch (err) {
    console.error(err);
    $("templateCard").innerHTML = `<h1>Vorlage nicht verfügbar</h1><p>${escapeHtml(err.message || "Die Vorlage konnte nicht geladen werden.")}</p><button id="templateErrorBack" class="button primary" type="button">Zu meinen Tests</button>`;
    $("templateErrorBack")?.addEventListener("click", clearTemplateUrlAndDashboard);
  }
}

function clearTemplateUrlAndDashboard() {
  const url = new URL(location.href);
  url.searchParams.delete("template");
  history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
  state.currentSharedTemplate = null;
  clearPendingTemplate();
  loadDashboard();
}

async function importSharedTemplate() {
  const source = state.currentSharedTemplate;
  if (!source?.quiz || !state.user) return;
  const btn = $("importTemplateCopy");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Wird kopiert …";
  }
  try {
    const quiz = source.quiz;
    const base = {
      title: `${quiz.title || "Geteilter Test"} – Kopie`,
      subject: quiz.subject || "",
      grade: quiz.grade || "",
      description: quiz.description || "",
      gradeScaleId: quiz.gradeScaleId || "shared-scale",
      gradeScaleSnapshot: quiz.gradeScaleSnapshot?.thresholds?.length === 6
        ? deepClone(quiz.gradeScaleSnapshot)
        : deepClone(getScaleById(getSettings().defaultGradeScaleId)),
      resultMode: quiz.resultMode || getSettings().defaultResultMode,
      showSolutions: quiz.showSolutions ?? getSettings().defaultShowSolutions,
      timeLimitMinutes: Number(quiz.timeLimitMinutes) > 0 ? Number(quiz.timeLimitMinutes) : null,
      startMode: quiz.startMode === "teacher" ? "teacher" : "student",
      shuffleQuestions: Boolean(quiz.shuffleQuestions),
      shuffleAnswers: Boolean(quiz.shuffleAnswers),
      sessionState: "open",
      sessionRunId: null,
      sessionStartedAt: null,
      published: false,
      ended: false,
      shareEnabled: false,
      questionCount: source.questions.length,
      totalPoints: round1(source.questions.reduce((sum, q) => sum + Number(q.points || 0), 0))
    };
    const { code: newCode } = await createQuizDocument(base);
    for (let i = 0; i < source.questions.length; i += 1) {
      const original = source.questions[i];
      const ref = doc(collection(db, "quizzes", newCode, "questions"));
      const copy = sanitizeQuestionForSave({ ...deepClone(original), id: ref.id, position: i + 1 });
      await setDoc(ref, { ...copy, position: i + 1, updatedAt: serverTimestamp() });
    }
    const url = new URL(location.href);
    url.searchParams.delete("template");
    history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    state.currentSharedTemplate = null;
    clearPendingTemplate();
    toast("Vorlage als eigene Kopie hinzugefügt.");
    await openEditor(newCode);
  } catch (err) {
    console.error(err);
    toast("Vorlage konnte nicht kopiert werden.", "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Als Kopie zu meinen Tests hinzufügen";
    }
  }
}

// ---------- Einstellungen ----------
$("backFromSettings").addEventListener("click", loadDashboard);
$("saveSettingsBtn").addEventListener("click", saveSettings);
$("addGradeScaleBtn").addEventListener("click", () => {
  state.gradeScalesDraft.push({
    id: randomId("scale"),
    name: `Notenschlüssel ${state.gradeScalesDraft.length + 1}`,
    thresholds: [91, 77, 57, 39, 25, 0]
  });
  renderGradeScaleSettings();
});

function openSettings() {
  if (state.isDirty && !confirm("Es gibt ungespeicherte Änderungen im Test. Wirklich ohne Speichern zu den Einstellungen wechseln?")) return;
  state.isDirty = false;
  state.settingsDraft = deepClone(getSettings());
  state.gradeScalesDraft = deepClone(getGradeScales());
  $("defaultSubject").value = state.settingsDraft.defaultSubject || "";
  $("defaultGrade").value = state.settingsDraft.defaultGrade || "";
  $("defaultDescription").value = state.settingsDraft.defaultDescription || "";
  $("defaultResultMode").value = state.settingsDraft.defaultResultMode || "points_grade";
  $("defaultShowSolutions").checked = Boolean(state.settingsDraft.defaultShowSolutions);
  renderGradeScaleSettings();
  showView("settingsView");
}

function renderGradeScaleSettings() {
  const root = $("gradeScaleList");
  root.innerHTML = "";
  const defaultId = state.settingsDraft?.defaultGradeScaleId || state.gradeScalesDraft[0]?.id;
  state.gradeScalesDraft.forEach((scale, index) => {
    const card = document.createElement("div");
    card.className = "gradeScaleCard";
    card.innerHTML = `
      <div class="gradeScaleTop">
        <label class="growField">Name<input class="scaleName" type="text" value="${escapeHtml(scale.name)}"></label>
        <label class="defaultScaleRadio"><input type="radio" name="defaultScale" value="${escapeHtml(scale.id)}" ${scale.id === defaultId ? "checked" : ""}> Standard</label>
        <button class="iconButton danger deleteScale" type="button" title="Notenschlüssel löschen">×</button>
      </div>
      <div class="thresholdGrid">
        ${scale.thresholds.map((t, i) => `<label>Note ${i + 1} ab<input class="thresholdInput" data-index="${i}" type="number" min="0" max="100" step="1" value="${Number(t)}" ${i === 5 ? "readonly" : ""}></label>`).join("")}
      </div>
      <div class="scalePreview">${escapeHtml(scaleRangeText(scale))}</div>`;

    card.querySelector(".scaleName").addEventListener("input", (e) => {
      scale.name = e.target.value;
    });
    card.querySelector(".defaultScaleRadio input").addEventListener("change", () => {
      state.settingsDraft.defaultGradeScaleId = scale.id;
    });
    card.querySelectorAll(".thresholdInput").forEach((input) => {
      input.addEventListener("input", (e) => {
        const i = Number(e.target.dataset.index);
        scale.thresholds[i] = i === 5 ? 0 : clamp(Number(e.target.value) || 0, 0, 100);
        card.querySelector(".scalePreview").textContent = scaleRangeText(scale);
      });
    });
    card.querySelector(".deleteScale").addEventListener("click", () => {
      if (state.gradeScalesDraft.length <= 1) {
        toast("Mindestens ein Notenschlüssel muss vorhanden bleiben.", "error");
        return;
      }
      if (!confirm(`Notenschlüssel „${scale.name}“ löschen? Bereits gespeicherte Tests behalten ihre Kopie.`)) return;
      state.gradeScalesDraft.splice(index, 1);
      if (!state.gradeScalesDraft.some((s) => s.id === state.settingsDraft.defaultGradeScaleId)) {
        state.settingsDraft.defaultGradeScaleId = state.gradeScalesDraft[0].id;
      }
      renderGradeScaleSettings();
    });
    root.appendChild(card);
  });
}

function validateGradeScales(scales) {
  for (const scale of scales) {
    if (!scale.name.trim()) return "Jeder Notenschlüssel braucht einen Namen.";
    const t = scale.thresholds.map(Number);
    if (t.length !== 6) return `Notenschlüssel „${scale.name}“ ist unvollständig.`;
    if (t[5] !== 0) return `Bei „${scale.name}“ muss Note 6 bei 0 % beginnen.`;
    for (let i = 0; i < 5; i += 1) {
      if (!(t[i] > t[i + 1])) return `Bei „${scale.name}“ müssen die Grenzen von Note 1 bis 6 streng absteigend sein.`;
      if (t[i] < 0 || t[i] > 100) return `Bei „${scale.name}“ liegt eine Grenze außerhalb von 0–100 %.`;
    }
  }
  return "";
}

async function saveSettings() {
  const scales = state.gradeScalesDraft.map((s) => ({
    id: s.id,
    name: s.name.trim(),
    thresholds: s.thresholds.map(Number)
  }));
  const scaleError = validateGradeScales(scales);
  if (scaleError) {
    toast(scaleError, "error");
    return;
  }
  const selectedDefault = document.querySelector('input[name="defaultScale"]:checked')?.value || scales[0].id;
  const settings = {
    defaultSubject: $("defaultSubject").value.trim(),
    defaultGrade: $("defaultGrade").value.trim(),
    defaultDescription: $("defaultDescription").value.trim() || "Viel Erfolg beim Test!",
    defaultGradeScaleId: selectedDefault,
    defaultResultMode: $("defaultResultMode").value,
    defaultShowSolutions: $("defaultShowSolutions").checked
  };
  try {
    await updateDoc(doc(db, "users", state.user.uid), { settings, gradeScales: scales });
    state.profile = { ...state.profile, settings, gradeScales: scales };
    toast("Einstellungen gespeichert.");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    toast("Einstellungen konnten nicht gespeichert werden.", "error");
  }
}

// ---------- KI Prompt + JSON Import ----------
$("backFromAi").addEventListener("click", loadDashboard);
$("generatePromptBtn").addEventListener("click", generateAiPrompt);
$("copyPromptBtn").addEventListener("click", () => copyText($("aiPromptOutput").value, "Prompt kopiert."));
$("importJsonBtn").addEventListener("click", importAiJson);
$("openChatGptBtn")?.addEventListener("click", () => openAiProvider("https://chatgpt.com/", "ChatGPT"));
$("openClaudeBtn")?.addEventListener("click", () => openAiProvider("https://claude.ai/new", "Claude"));
$("openGeminiBtn")?.addEventListener("click", () => openAiProvider("https://gemini.google.com/app", "Gemini"));
$("generateAiTestBtn")?.addEventListener("click", generateAiTestNative);
$("aiMaterialInput")?.addEventListener("change", handleAiMaterialFiles);
$("aiTypeChecks")?.addEventListener("change", updateAiTypeCount);
["aiImageQuestionCount", "aiImageAnswerCount", "aiCount"].forEach(id => $(id)?.addEventListener("input", updateAiImageControls));
["aiCount", "aiPoints"].forEach(id => $(id)?.addEventListener("input", updateAiPointsControls));

function updateAiTypeCount() {
  const selected = $("aiTypeChecks")?.querySelectorAll('input[type="checkbox"]:checked').length || 0;
  if ($("aiTypeCount")) $("aiTypeCount").textContent = `${selected} ausgewählt`;
}

async function openAiView() {
  const settings = getSettings();
  $("aiMaterialConfirmed").checked = false;
  $("aiSubject").value = settings.defaultSubject || "";
  $("aiGrade").value = settings.defaultGrade || "";
  if ($("aiCustomNotes")) $("aiCustomNotes").value = "";
  $("aiMaterialMode").value = "inspiration";
  const root = $("aiTypeChecks");
  root.innerHTML = "";
  const types = [...QUESTION_TYPES.filter(([value]) => !["text", "number"].includes(value)), ...QUESTION_TYPES.filter(([value]) => ["text", "number"].includes(value))];
  types.forEach(([value, label]) => {
    const item = document.createElement("label");
    item.className = "checkTile";
    const defaultChecked = !["text", "number"].includes(value);
    item.innerHTML = `<input type="checkbox" value="${value}" ${defaultChecked ? "checked" : ""}><span>${escapeHtml(label)}</span>`;
    root.appendChild(item);
  });
  updateAiTypeCount();
  renderAiMaterials();
  updateAiImageControls();
  updateAiPointsControls();
  showView("aiView");
  const notice = $("aiBetaNotice");
  try {
    notice.className = "aiStatusNotice";
    notice.textContent = "KI-Verbindung wird geprüft …";
    notice.classList.remove("hidden");
    state.aiStatus = await aiApi.status({});
    notice.textContent = state.aiStatus?.beta ? "KI-Beta aktiv · aktuell nur für freigeschaltete Admin-Konten." : "KI ist bereit.";
  } catch (err) {
    console.warn("KI-Status nicht verfügbar:", err);
    state.aiStatus = null;
    notice.className = "aiStatusNotice error";
    notice.textContent = aiFriendlyError(err, "KI-Backend ist noch nicht erreichbar. Prüfe Functions, Secret und Staging-Deployment.");
  }
}

function aiFriendlyError(err, fallback = "Die KI-Anfrage ist fehlgeschlagen.") {
  const code = String(err?.code || "");
  const reference = String(err?.details?.reference || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  const suffix = reference ? ` (Fehlernummer ${reference})` : "";
  if (code.includes("internal") || String(err?.message || "").trim().toLowerCase() === "internal") {
    return `Bei der KI-Erstellung ist ein technischer Fehler aufgetreten. Bitte erneut versuchen${suffix}.`;
  }
  if (code.includes("permission-denied")) return "Die KI-Beta ist für dieses Konto noch nicht freigeschaltet.";
  if (code.includes("resource-exhausted")) return `Das KI-Limit ist gerade erreicht. Bitte später erneut versuchen${suffix}.`;
  if (code.includes("deadline-exceeded")) return `Die KI braucht gerade zu lange. Bitte erneut versuchen${suffix}.`;
  if (code.includes("unauthenticated")) return "Bitte neu anmelden und erneut versuchen.";
  if (code.includes("failed-precondition") && Array.isArray(err?.details?.errors)) return `Die KI konnte noch kein gültiges Ergebnis erstellen: ${err.details.errors.slice(0, 2).join(" ")}`.slice(0, 360);
  const message = String(err?.message || fallback).replace(/^Firebase:\s*/i, "");
  return `${message}${suffix}`.slice(0, 300) || fallback;
}

function setAiProgress(message = "", isError = false, percent = null, hint = "", targetId = "aiProgress") {
  const box = $(targetId);
  if (!box) return;
  if (!message) { box.classList.add("hidden"); box.textContent = ""; return; }
  box.setAttribute("aria-live", percent === null ? "polite" : "off");
  if (percent === null) box.textContent = message;
  else {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    box.innerHTML = `<div class="aiProgressHeading"><strong>${escapeHtml(message)}</strong><span>ca. ${value} %</span></div><div class="aiProgressTrack" role="progressbar" aria-label="Geschätzter Fortschritt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><div class="aiProgressFill" style="width:${value}%"></div></div><small>${escapeHtml(hint || "Die Erstellung kann mehrere Minuten dauern. Bitte warte, bis der Entwurf geöffnet wird.")}</small>`;
  }
  box.classList.toggle("error", isError);
  box.classList.remove("hidden");
}

function updateAiImageControls() {
  const imageInput = $("aiImageQuestionCount");
  const answerInput = $("aiImageAnswerCount");
  const images = Number(imageInput.value);
  const answers = Number(answerInput.value);
  const count = Number($("aiCount").value);
  const imageInvalid = !imageInput.value.trim() || !Number.isInteger(images) || images < 0 || images > 5;
  const answerInvalid = !answerInput.value.trim() || !Number.isInteger(answers) || answers < 0 || answers > 3;
  const combinedInvalid = !imageInvalid && !answerInvalid && Number.isInteger(count) && count >= 1 && images + answers > Math.min(count, 5);
  const hint = $("aiImageCountHint");
  imageInput.setAttribute("aria-invalid", String(imageInvalid || combinedInvalid));
  answerInput.setAttribute("aria-invalid", String(answerInvalid || combinedInvalid));
  const errors = [];
  if (imageInvalid) errors.push("Für Aufgaben mit einem Bild bitte eine ganze Zahl von 0 bis 5 eingeben.");
  if (answerInvalid) errors.push("Für Bildantworten bitte eine ganze Zahl von 0 bis 3 eingeben.");
  if (combinedInvalid) errors.push(`Zusammen sind höchstens ${Math.min(count, 5)} Bildaufgaben bei ${count} Aufgaben möglich. Bitte die Zahlen korrigieren.`);
  if (hint) {
    hint.textContent = errors.length ? errors.join(" ") : images + answers ? `${images + answers} Aufgaben mit Bildern · ${images + answers * 2} bis ${images + answers * 4} Bildgenerierungen (Bildantworten: 2–4 Bilder je Aufgabe). Zusammen höchstens 5 Bildaufgaben.` : "Ohne Bilder. Zusammen sind höchstens 5 Bildaufgaben möglich.";
    hint.classList.toggle("aiInputError", errors.length > 0);
  }
}

function updateAiPointsControls() {
  const input = $("aiPoints");
  const hint = $("aiPointsHint");
  const count = Number($("aiCount").value);
  const points = Number(input.value);
  const invalid = !input.value.trim() || !Number.isFinite(points) || points < 0.5 || Math.abs(points * 2 - Math.round(points * 2)) > 1e-8 || (Number.isInteger(count) && count > 0 && points < count / 2);
  input.setAttribute("aria-invalid", String(invalid));
  if (hint) {
    hint.textContent = invalid ? `Bitte eine Gesamtpunktzahl in 0,5er-Schritten wählen${Number.isInteger(count) && count > 0 ? `; bei ${count} Aufgaben mindestens ${count / 2} Punkte` : ""}.` : "Jede Aufgabe erhält mindestens 0,5 Punkte.";
    hint.classList.toggle("aiInputError", invalid);
  }
}

function renderAiMaterials() {
  const root = $("aiMaterialList");
  if (!root) return;
  root.innerHTML = "";
  $("aiMaterialMode").disabled = state.aiMaterials.length === 0;
  if (!state.aiMaterials.length) $("aiMaterialMode").value = "inspiration";
  state.aiMaterials.forEach((m) => {
    const row = document.createElement("div"); row.className = "aiMaterialItem";
    const size = m.size ? `${Math.max(1, Math.round(m.size / 1024))} KB` : "";
    row.innerHTML = `<div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.mimeType)}${size ? ` · ${size}` : ""}</small></div><button type="button" class="miniButton">Entfernen</button>`;
    row.querySelector("button").addEventListener("click", async () => {
      row.classList.add("questionAiBusy");
      try {
        await aiApi.removeMaterial(m);
        state.aiMaterials = state.aiMaterials.filter(x => x.id !== m.id);
        renderAiMaterials();
      } catch (err) {
        row.classList.remove("questionAiBusy");
        toast(aiFriendlyError(err, "Material konnte nicht gelöscht werden. Bitte erneut versuchen."), "error");
      }
    });
    root.appendChild(row);
  });
}

async function handleAiMaterialFiles(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (files.length && !$("aiMaterialConfirmed").checked) {
    toast("Bitte zuerst die Prüfung von Daten und Nutzungsrechten bestätigen.", "error");
    $("aiMaterialConfirmed").focus();
    return;
  }
  for (const file of files) {
    if (state.aiMaterials.length >= 5) { toast("Maximal fünf Materialien pro Generierung.", "error"); break; }
    try {
      setAiProgress(`${file.name} wird hochgeladen …`);
      const material = await aiApi.uploadMaterial(file, pct => setAiProgress(`${file.name} wird hochgeladen … ${pct}%`));
      state.aiMaterials.push(material); renderAiMaterials();
    } catch (err) { toast(aiFriendlyError(err, "Material konnte nicht hochgeladen werden."), "error"); }
  }
  setAiProgress();
}

function collectAiRequest() {
  if (state.aiMaterials.length && !$("aiMaterialConfirmed").checked) throw new Error("Bitte die Prüfung der hochgeladenen Materialien bestätigen.");
  const allowedTypes = Array.from($("aiTypeChecks").querySelectorAll('input[type="checkbox"]:checked')).map(x => x.value);
  if (!$("aiTopic").value.trim()) throw new Error("Bitte ein Thema eingeben.");
  if (!allowedTypes.length) throw new Error("Bitte mindestens einen Aufgabentyp auswählen.");
  if (!$("aiImageQuestionCount").value.trim() || !$("aiImageAnswerCount").value.trim()) throw new Error("Bitte beide Bildanzahlen angeben (0 ist möglich).");
  const count = Number($("aiCount").value);
  const points = Number($("aiPoints").value);
  const imageQuestionCount = Number($("aiImageQuestionCount").value);
  const imageAnswerQuestionCount = Number($("aiImageAnswerCount").value);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error("Bitte 1 bis 50 Aufgaben wählen.");
  if (!$("aiPoints").value.trim() || !Number.isFinite(points) || points < 0.5 || Math.abs(points * 2 - Math.round(points * 2)) > 1e-8) throw new Error("Bitte eine Gesamtpunktzahl in 0,5er-Schritten wählen.");
  if (points < count / 2) throw new Error(`Bei ${count} Aufgaben sind mindestens ${count / 2} Gesamtpunkte nötig.`);
  if (!Number.isInteger(imageQuestionCount) || imageQuestionCount < 0 || imageQuestionCount > 5) throw new Error("Bitte 0 bis 5 Aufgaben mit einem Bild wählen.");
  if (!Number.isInteger(imageAnswerQuestionCount) || imageAnswerQuestionCount < 0 || imageAnswerQuestionCount > 3) throw new Error("Bitte 0 bis 3 Aufgaben mit Bildantworten wählen.");
  if (imageQuestionCount + imageAnswerQuestionCount > Math.min(count, 5)) throw new Error("Insgesamt höchstens 5 Bildaufgaben und nicht mehr Bildaufgaben als Aufgaben wählen.");
  if (imageAnswerQuestionCount && !allowedTypes.some(type => ["single", "multi"].includes(type))) throw new Error("Für Bildantworten bitte Single Choice oder Multiple Choice erlauben.");
  return {
    subject: $("aiSubject").value.trim(), grade: $("aiGrade").value.trim(), schoolType: $("aiSchoolType").value.trim() || "Mittelschule", region: $("aiRegion").value.trim() || "Bayern",
    topic: $("aiTopic").value.trim(), difficulty: $("aiDifficulty").value, count, points,
    allowedTypes, notes: $("aiCustomNotes")?.value.trim() || "", materials: state.aiMaterials.map(({ id, storagePath, mimeType, name }) => ({ id, storagePath, mimeType, name })), materialMode: $("aiMaterialMode").value,
    imageMode: imageQuestionCount + imageAnswerQuestionCount ? "exact" : "none", imageQuestionCount, imageAnswerQuestionCount
  };
}

async function applyGeneratedMedia(rawQuestion, q, code, questionId) {
  const intent = rawQuestion?.mediaIntent;
  if (!intent || intent.kind === "none") return;
  if (intent.kind === "ai_generated" && intent.prompt) {
    const result = await aiApi.generateQuestionMedia({ quizId: code, questionId, prompt: intent.prompt, expectedScene: intent.prompt, altText: intent.altText || "Abbildung zur Aufgabe" });
    Object.assign(q, result.asset || {});
  } else if (intent.kind === "image_choices" && ["single", "multi"].includes(q.type)) {
    const choices = [];
    for (let i = 0; i < q.options.length; i += 1) {
      const opt = q.options[i];
      const rawOpt = rawQuestion?.options?.[i] || {};
      const scene = String(rawOpt.imageScene || opt.imageScene || opt.text || "").trim();
      if (!scene || /^(?:bild|abbildung)\s*[a-d1-4]?\s*$/i.test(scene)) {
        throw new Error(`Bildantwort ${i + 1} hat keine konkrete Szenenbeschreibung.`);
      }
      opt.imageScene = scene;
      const prompt = `Erzeuge ausschließlich diese konkrete Antwortszene: „${scene}“. Kontext der Frage: „${rawQuestion.text}“. Zeige genau die in dieser Antwort beschriebenen Gegenstände und ihre räumliche Beziehung; tausche keinen Gegenstand gegen einen anderen aus. Kein Text, keine Beschriftung und keine Markierung der Lösung. Einheitlicher sachlicher Stil, quadratisch.`;
      const result = await aiApi.generateQuestionMedia({ quizId: code, questionId: `${questionId}-opt-${i}`, prompt, expectedScene: scene, altText: `Bildantwort ${i + 1}`, purpose: "option" });
      if (!result.asset?.imageDataUrl) throw new Error("Bildantwort fehlt.");
      choices.push({ imageDataUrl: result.asset.imageDataUrl, imageAlt: `Bildantwort ${i + 1}` });
    }
    choices.forEach((asset, i) => Object.assign(q.options[i], asset));
    q.imageChoicesOnly = true;
  }
}

async function generateAiTestNative() {
  try { await createAiTestFromRequest(collectAiRequest()); }
  catch (err) { setAiProgress(aiFriendlyError(err), true); toast(aiFriendlyError(err), "error"); }
}

async function createAiTestFromRequest(request, { similar = false, sourceQuiz = null } = {}) {
  const btn = $(similar ? "createSimilarTestBtn" : "generateAiTestBtn");
  const targetId = similar ? "similarTestProgress" : "aiProgress";
  const show = (message, percent = null, isError = false, hint = "") => setAiProgress(message, isError, percent, hint, targetId);
  let timer;
  let incompleteQuizCode = null;
  let errorStage = "prepare_request";
  let errorQuestionPosition = 0;
  try {
    btn.disabled = true;
    const start = Date.now();
    const planning = "Dein Test wird erstellt …";
    const renderPlanning = () => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      const estimate = Math.min(65, 8 + Math.floor(57 * (1 - Math.exp(-seconds / 50))));
      show(planning, estimate, false, `Seit ${seconds} Sekunden · geschätzter Fortschritt. Die Erstellung kann mehrere Minuten dauern. Bitte dieses Fenster geöffnet lassen.`);
    };
    renderPlanning();
    timer = setInterval(renderPlanning, 1000);
    errorStage = "generate_test";
    const response = await aiApi.generateTest(request);
    clearInterval(timer); timer = null;
    errorStage = "prepare_questions";
    const data = response?.test;
    if (!data?.questions?.length) throw new Error("Die KI hat keine Aufgaben geliefert.");
    show("Aufgaben und Bilder werden vorbereitet …", 70);
    const qualityWarnings = Array.isArray(response?.meta?.qualityWarnings)
      ? response.meta.qualityWarnings.map(value => String(value).slice(0, 300))
      : [];
    const report = { warnings: qualityWarnings.map(value => `KI-Qualitätsprüfung: ${value}`), repairs: [] };
    const inherited = sourceQuiz ? {
      gradeScaleId: sourceQuiz.gradeScaleId, gradeScaleSnapshot: deepClone(getQuizScale(sourceQuiz)),
      resultMode: sourceQuiz.resultMode, showSolutions: sourceQuiz.showSolutions,
      timeLimitMinutes: sourceQuiz.timeLimitMinutes, startMode: sourceQuiz.startMode,
      shuffleQuestions: sourceQuiz.shuffleQuestions, shuffleAnswers: sourceQuiz.shuffleAnswers
    } : {};
    const base = { ...quizDefaults(), ...inherited, title: String(data.title || "KI-Test"), subject: String(data.subject || request.subject || ""), grade: String(data.grade || request.grade || ""), description: String(getSettings().defaultDescription || "Viel Erfolg beim Test!"), questionCount: data.questions.length, totalPoints: round1(data.questions.reduce((sum, raw) => sum + Number(raw.points || 0), 0)) };
    // Prepare every task and generated image before creating a quiz document.
    // A media failure must not leave an empty draft in the teacher's dashboard.
    const mediaRequestId = `AI-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const prepared = [];
    for (let i = 0; i < data.questions.length; i += 1) {
      errorQuestionPosition = i + 1;
      errorStage = "prepare_question";
      const raw = data.questions[i]; const q = normalizeImportedQuestion(raw, i, report);
      q.aiOrigin = { kind: similar ? "similar" : "generated", model: String(response?.meta?.model || ""), promptVersion: String(response?.meta?.promptVersion || "") };
      q.id = doc(collection(db, "quizzes", mediaRequestId, "questions")).id; q.position = i + 1;
      show(`Aufgabe ${i + 1} von ${data.questions.length} wird vorbereitet …`, 70 + (29 * i / data.questions.length));
      if (raw.mediaIntent?.kind && raw.mediaIntent.kind !== "none" && request.imageMode !== "none" && raw.mediaIntent.kind !== "uploaded_crop") {
        show(`Aufgabe ${i + 1} von ${data.questions.length}: Bild wird erstellt …`, 70 + (29 * i / data.questions.length), false, "Bildgenerierung kann etwas dauern. Die Anzeige wird nach jeder Aufgabe aktualisiert.");
        errorStage = "generate_media";
        await applyGeneratedMedia(raw, q, mediaRequestId, q.id);
        errorStage = "prepare_question";
      }
      prepared.push(q);
    }
    show("Entwurf wird gespeichert …", 99);
    errorStage = "save_quiz";
    errorQuestionPosition = 0;
    const { code } = await createQuizDocument(base);
    incompleteQuizCode = code;
    errorStage = "save_questions";
    for (const q of prepared) {
      errorQuestionPosition = q.position || 0;
      await setDoc(doc(db, "quizzes", code, "questions", q.id), { ...sanitizeQuestionForSave(q), position: q.position, updatedAt: serverTimestamp() });
    }
    incompleteQuizCode = null;
    show("Entwurf fertig.", 100, false, report.warnings.length ? "Der Test wurde gespeichert. Bitte die markierten Qualitäts-Hinweise prüfen." : "Der neue Test wird geöffnet.");
    if (report.warnings.length) toast(`KI-Entwurf erstellt – ${report.warnings.length} Qualitäts-Hinweis${report.warnings.length === 1 ? "" : "e"} bitte prüfen.`);
    else toast(similar ? "Ähnlicher Test als neuer Entwurf erstellt." : "KI-Entwurf erstellt.");
    await openEditor(code);
    setAiProgress("", false, null, "", targetId);
    state.pendingImportReport = { ...report, quizId: code };
    renderImportReviewBanner();
  } catch (err) {
    if (incompleteQuizCode) {
      try {
        const partial = await getDocs(collection(db, "quizzes", incompleteQuizCode, "questions"));
        for (const question of partial.docs) await deleteDoc(question.ref);
        await deleteDoc(doc(db, "quizzes", incompleteQuizCode));
      } catch (cleanupError) { console.error("Unvollständiger KI-Entwurf konnte nicht gelöscht werden:", cleanupError); }
    }
    console.error(err);
    const friendly = aiFriendlyError(err);
    show(friendly, null, true);
    showReportableError({
      code: similar ? REPORTABLE_ERROR_CODES.aiSimilar : REPORTABLE_ERROR_CODES.aiCreate,
      message: friendly,
      error: err,
      action: similar ? "create_similar_test" : "create_ai_test",
      details: {
        stage: errorStage,
        questionPosition: errorQuestionPosition,
        requestedCount: Number(request?.count || 0),
        targetPoints: Number(request?.points || 0),
        imageMode: String(request?.imageMode || "none"),
        imageQuestionCount: Number(request?.imageQuestionCount || 0),
        imageAnswerQuestionCount: Number(request?.imageAnswerQuestionCount || 0),
        materialCount: Array.isArray(request?.materials) ? request.materials.length : 0,
        allowedTypeCount: Array.isArray(request?.allowedTypes) ? request.allowedTypes.length : 0
      }
    });
  } finally {
    if (timer) clearInterval(timer);
    if (request.materials.length) {
      const ids = new Set(request.materials.map(m => m.id));
      const uploaded = state.aiMaterials.filter(m => ids.has(m.id));
      const results = await Promise.allSettled(uploaded.map(m => aiApi.removeMaterial(m)));
      const failedIds = new Set(uploaded.filter((m, i) => results[i].status === "rejected").map(m => m.id));
      state.aiMaterials = state.aiMaterials.filter(m => !ids.has(m.id) || failedIds.has(m.id));
      renderAiMaterials();
      if (failedIds.size) toast("Ein Material konnte nicht bestätigt gelöscht werden. Bitte bei „Entfernen“ erneut versuchen.", "error");
    }
    btn.disabled = false;
  }
}

function generateAiPrompt() {
  const types = Array.from($("aiTypeChecks").querySelectorAll('input[type="checkbox"]:checked')).map((x) => x.value);
  if (!$("aiTopic").value.trim()) {
    toast("Bitte ein Thema eingeben.", "error");
    return;
  }
  if (!types.length) {
    toast("Bitte mindestens einen Aufgabentyp auswählen.", "error");
    return;
  }
  const customNotes = $("aiCustomNotes")?.value.trim() || "";
  const customBlock = customNotes ? `\n\nZusätzliche Wünsche der Lehrkraft:\n${customNotes}` : "";
  const prompt = `WICHTIG: Antworte ausschließlich mit einem einzigen gültigen JSON-Objekt. Keine Einleitung, keine Erklärung, kein Markdown und keine Markdown-Codeblöcke.\n\nDu erstellst einen direkt importierbaren Schultest als JSON.\n\nRahmen:\n- Schulart: ${$("aiSchoolType").value.trim() || "Mittelschule"}\n- Bundesland: ${$("aiRegion").value.trim() || "Bayern"}\n- Fach: ${$("aiSubject").value.trim() || "nicht angegeben"}\n- Klassenstufe: ${$("aiGrade").value.trim() || "nicht angegeben"}\n- Thema: ${$("aiTopic").value.trim()}\n- Schwierigkeit: ${$("aiDifficulty").value}\n- ca. ${Number($("aiCount").value) || 10} Aufgaben\n- Gesamtpunkte ca. ${Number($("aiPoints").value) || 20}\n- Erlaubte Aufgabentypen: ${types.join(", ")}${customBlock}\n\nWichtig:\n1. Inhaltlich passend zur genannten Schulart, Klassenstufe und zum Thema.\n2. Klare, altersgerechte Formulierungen.\n3. Keine Aufgaben, deren Lösung vom aktuellen Tagesgeschehen abhängt.\n4. Gib AUSSCHLIESSLICH gültiges JSON zurück, keine Markdown-Codeblöcke und keine Erklärung.\n5. Verwende exakt eines der unten beschriebenen Formate pro Aufgabe.\n6. Punkte dürfen nur in 0,5er-Schritten vergeben werden (z. B. 0,5 / 1 / 1,5 / 2).\n7. Verwende für JSON-Schlüssel und Textwerte ausschließlich gerade ASCII-Anführungszeichen " (U+0022). Verwende niemals typografische Anführungszeichen wie „ “ ” als JSON-Begrenzungszeichen. Typografische Anführungszeichen dürfen nur innerhalb eines Textwerts als normaler Inhalt vorkommen.\n\nGesamtformat:\n{\n  "title": "Titel des Tests",\n  "subject": "Fach",\n  "grade": "Klasse",\n  "description": "Kurzer Hinweis für Schüler",\n  "questions": [ ... ]\n}\n\nGemeinsame Felder jeder Aufgabe:\n{ "type": "...", "text": "...", "points": 1 }\n\nTypen:\n- single / dropdown: zusätzlich "options": [{"text":"...","correct":true}, ...], exakt eine richtige Antwort.\n- multi: "options": [{"text":"...","correct":true/false}, ...], mindestens eine richtige Antwort.\n- text: "acceptedAnswers": ["Antwort", "Alternative"], optional "manualReview": false.\n- truefalse: "correctBoolean": true oder false.\n- gapfill: Schreibe die Lösungen direkt in eckige Klammern im Feld text, Alternativen mit |. Beispiel: "Die Hauptstadt ist [München|Muenchen]."\n- matching: "pairs": [{"left":"Begriff","right":"Zuordnung"}, ...].\n- ordering: "items": ["erster Schritt", "zweiter Schritt", ...] bereits in richtiger Reihenfolge.\n- grouping: "groups": [{"name":"Nomen","items":["Haus","Schule"]},{"name":"Verben","items":["gehen"]}].\n- markwords: "text" ist die Arbeitsanweisung, zusätzlich "passage": "Text zum Markieren" und "targetWords": ["Zielwort1","Zielwort2"]. Jedes passende Wort im Text gilt als richtige Markierung.\n- number: zusätzlich "numericAnswer": 20, "tolerance": 0.01, optional "unit": "€".\n\nAchte darauf, dass Punkte, Lösungen und Aufgaben fachlich zueinander passen.\n\nABSCHLUSSREGEL: Deine gesamte Antwort muss direkt mit { beginnen und mit } enden. Schreibe davor und danach nichts.`;
  $("aiPromptOutput").value = prompt;
  toast("Prompt erzeugt.");
}

function canonicalImportToken(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function looseField(obj, aliases, fallback = undefined) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return fallback;
  const wanted = new Set(aliases.map(canonicalImportToken));
  for (const [key, value] of Object.entries(obj)) {
    if (wanted.has(canonicalImportToken(key))) return value;
  }
  return fallback;
}

function numberLoose(value, fallback = NaN) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const text = String(value ?? "").trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanLoose(value, fallback = null) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const token = canonicalImportToken(value);
  if (["true", "wahr", "richtig", "yes", "ja", "correct", "1"].includes(token)) return true;
  if (["false", "falsch", "no", "nein", "incorrect", "0"].includes(token)) return false;
  return fallback;
}

function pushUnique(list, message) {
  if (message && !list.includes(message)) list.push(message);
}

function normalizeQuestionTypeLoose(value) {
  const token = canonicalImportToken(value);
  const map = {
    single: "single", singlechoice: "single", singleanswer: "single", radio: "single", mcq: "single",
    multi: "multi", multiple: "multi", multiplechoice: "multi", multichoice: "multi", checkbox: "multi", checkboxes: "multi",
    text: "text", freitext: "text", freetext: "text", shortanswer: "text", openanswer: "text", open: "text",
    dropdown: "dropdown", select: "dropdown", auswahl: "dropdown",
    truefalse: "truefalse", boolean: "truefalse", richtigfalsch: "truefalse", wahrfalsch: "truefalse",
    gapfill: "gapfill", fillblank: "gapfill", fillintheblank: "gapfill", lueckentext: "gapfill", luckentext: "gapfill",
    matching: "matching", match: "matching", zuordnen: "matching", zuordnung: "matching",
    ordering: "ordering", order: "ordering", sorting: "ordering", sortieren: "ordering", reihenfolge: "ordering",
    grouping: "grouping", group: "grouping", categorization: "grouping", kategorisieren: "grouping", gruppieren: "grouping",
    markwords: "markwords", highlightwords: "markwords", highlight: "markwords", woertermarkieren: "markwords", wortemarkieren: "markwords",
    number: "number", numeric: "number", zahl: "number", rechenaufgabe: "number", calculation: "number"
  };
  return map[token] || null;
}

function normalizeOptionList(rawOptions) {
  if (!Array.isArray(rawOptions)) return [];
  return rawOptions.map((option) => {
    if (typeof option === "string" || typeof option === "number") return { text: String(option), correct: false };
    if (!option || typeof option !== "object") return { text: "", correct: false };
    return {
      text: String(looseField(option, ["text", "label", "answer", "option", "antwort"], "") || ""),
      correct: Boolean(booleanLoose(looseField(option, ["correct", "isCorrect", "right", "richtig"], false), false)),
      imageScene: String(option.imageScene || ""),
      imageDataUrl: String(option.imageDataUrl || ""),
      imageAlt: String(option.imageAlt || "")
    };
  });
}

function applyCorrectHint(options, hint, multiple = false) {
  if (!options.length || hint == null) return false;
  const hints = Array.isArray(hint) ? hint : [hint];
  let matched = false;
  const normalizedHints = new Set(hints.map((x) => canonicalImportToken(x)).filter(Boolean));

  hints.forEach((rawHint) => {
    const n = numberLoose(rawHint, NaN);
    if (Number.isInteger(n)) {
      let idx = -1;
      if (n === 0) idx = 0;
      else if (n >= 1 && n <= options.length) idx = n - 1;
      if (idx >= 0 && idx < options.length) {
        options[idx].correct = true;
        matched = true;
      }
    }
  });

  options.forEach((option) => {
    if (normalizedHints.has(canonicalImportToken(option.text))) {
      option.correct = true;
      matched = true;
    }
  });

  if (matched && !multiple) {
    const first = options.findIndex((o) => o.correct);
    options.forEach((o, i) => { o.correct = i === first; });
  }
  return matched;
}

function normalizeImportedQuestion(rawInput, index, report) {
  const raw = rawInput && typeof rawInput === "object" && !Array.isArray(rawInput) ? rawInput : { text: String(rawInput ?? "") };
  const rawType = looseField(raw, ["type", "questionType", "aufgabentyp", "format"], "text");
  let type = normalizeQuestionTypeLoose(rawType);
  if (!type) {
    type = "text";
    pushUnique(report.warnings, `Aufgabe ${index + 1}: Unbekannter Aufgabentyp „${String(rawType || "–")}“ wurde als Freitext übernommen.`);
  } else if (canonicalImportToken(rawType) !== type) {
    pushUnique(report.repairs, `Aufgabe ${index + 1}: Aufgabentyp „${String(rawType)}“ wurde als „${type}“ erkannt.`);
  }

  const q = newQuestion(type, false);
  const rawText = looseField(raw, ["text", "question", "prompt", "frage", "instruction", "aufgabe"], "");
  q.text = String(rawText || "").trim();
  if (!q.text) {
    q.text = `Aufgabe ${index + 1}`;
    pushUnique(report.warnings, `Aufgabe ${index + 1}: Fragetext fehlt und muss im Editor ergänzt werden.`);
  }

  const rawPoints = numberLoose(looseField(raw, ["points", "point", "score", "punkte"], 1), 1);
  q.points = Math.max(0.5, Math.round(rawPoints * 2) / 2);
  if (Math.abs(q.points - rawPoints) > 0.001) {
    pushUnique(report.repairs, `Aufgabe ${index + 1}: Punkte wurden auf ${q.points} (0,5er-Schritt) angepasst.`);
  }

  if (["single", "multi", "dropdown"].includes(type)) {
    const rawOptions = looseField(raw, ["options", "answers", "choices", "antworten", "answerOptions"], []);
    q.options = normalizeOptionList(rawOptions);
    if (q.options.length < 2) {
      while (q.options.length < 2) q.options.push({ text: "", correct: false });
      pushUnique(report.warnings, `Aufgabe ${index + 1}: Es fehlen Antwortmöglichkeiten; bitte im Editor ergänzen.`);
    }

    const correctHint = looseField(raw, ["correctAnswer", "correctAnswers", "solution", "solutions", "richtigeAntwort", "richtigeAntworten"], null);
    if (!q.options.some((o) => o.correct) && correctHint != null && applyCorrectHint(q.options, correctHint, type === "multi")) {
      pushUnique(report.repairs, `Aufgabe ${index + 1}: Richtige Antwort(en) aus dem Lösungsfeld übernommen.`);
    }

    const correctCount = q.options.filter((o) => o.correct).length;
    if (type === "multi") {
      if (!correctCount) pushUnique(report.warnings, `Aufgabe ${index + 1}: Keine richtige Antwort markiert; bitte prüfen.`);
    } else if (!correctCount) {
      q.options[0].correct = true;
      pushUnique(report.warnings, `Aufgabe ${index + 1}: Keine richtige Antwort markiert. Die erste Antwort wurde vorläufig gewählt – bitte prüfen.`);
    } else if (correctCount > 1) {
      const first = q.options.findIndex((o) => o.correct);
      q.options.forEach((o, i) => { o.correct = i === first; });
      pushUnique(report.warnings, `Aufgabe ${index + 1}: Mehrere Antworten waren als richtig markiert. Nur die erste wurde übernommen – bitte prüfen.`);
    }
  }

  if (type === "text") {
    const answers = looseField(raw, ["acceptedAnswers", "answers", "solutions", "correctAnswers", "musterloesungen", "musterlosungen"], []);
    q.acceptedAnswers = Array.isArray(answers) ? answers.map(String).map((x) => x.trim()).filter(Boolean) : (answers ? [String(answers).trim()] : []);
    q.manualReview = Boolean(booleanLoose(looseField(raw, ["manualReview", "manual", "manuellPruefen", "manuellprufen"], null), !q.acceptedAnswers.length));
    if (!q.acceptedAnswers.length && !q.manualReview) q.manualReview = true;
    if (!q.acceptedAnswers.length) pushUnique(report.repairs, `Aufgabe ${index + 1}: Freitext ohne Musterlösung wird zur manuellen Prüfung markiert.`);
  }

  if (type === "truefalse") {
    const bool = booleanLoose(looseField(raw, ["correctBoolean", "correct", "answer", "solution", "richtig"], null), null);
    if (bool == null) {
      q.correctBoolean = true;
      pushUnique(report.warnings, `Aufgabe ${index + 1}: Lösung für Richtig/Falsch fehlt. „Richtig“ wurde vorläufig gesetzt – bitte prüfen.`);
    } else q.correctBoolean = bool;
  }

  if (type === "gapfill") {
    const hasGap = /\[[^\]]+\]/.test(q.text);
    if (!hasGap) {
      const answersRaw = looseField(raw, ["answers", "correctAnswers", "solutions", "acceptedAnswers", "gaps"], []);
      const answers = Array.isArray(answersRaw) ? answersRaw.map(String).filter(Boolean) : (answersRaw ? [String(answersRaw)] : []);
      const blanks = q.text.match(/_{2,}|\{\s*blank\s*\}|\[\s*\]/gi) || [];
      if (answers.length && blanks.length === answers.length) {
        let cursor = 0;
        q.text = q.text.replace(/_{2,}|\{\s*blank\s*\}|\[\s*\]/gi, () => `[${answers[cursor++]}]`);
        pushUnique(report.repairs, `Aufgabe ${index + 1}: Lücken und Lösungen wurden automatisch in Testify-Format umgewandelt.`);
      } else {
        pushUnique(report.warnings, `Aufgabe ${index + 1}: Im Lückentext wurde keine eindeutig erkennbare Lösung in [Klammern] gefunden.`);
      }
    }
  }

  if (type === "matching") {
    const pairsRaw = looseField(raw, ["pairs", "matches", "matching", "zuordnungen"], []);
    let pairs = [];
    if (Array.isArray(pairsRaw)) {
      pairs = pairsRaw.map((p) => {
        if (Array.isArray(p)) return { left: String(p[0] ?? ""), right: String(p[1] ?? "") };
        return {
          left: String(looseField(p, ["left", "term", "from", "begriff"], "") || ""),
          right: String(looseField(p, ["right", "match", "to", "zuordnung"], "") || "")
        };
      });
    } else if (pairsRaw && typeof pairsRaw === "object") {
      pairs = Object.entries(pairsRaw).map(([left, right]) => ({ left, right: String(right) }));
      pushUnique(report.repairs, `Aufgabe ${index + 1}: Zuordnungstabelle wurde in Paare umgewandelt.`);
    }
    q.pairs = pairs.length ? pairs : q.pairs;
    if (q.pairs.length < 2 || q.pairs.some((p) => !p.left.trim() || !p.right.trim())) pushUnique(report.warnings, `Aufgabe ${index + 1}: Zuordnungspaare bitte prüfen bzw. ergänzen.`);
  }

  if (type === "ordering") {
    const items = looseField(raw, ["items", "steps", "order", "elements", "reihenfolge"], []);
    q.items = Array.isArray(items) ? items.map(String).map((x) => x.trim()).filter(Boolean) : q.items;
    if (q.items.length < 2) pushUnique(report.warnings, `Aufgabe ${index + 1}: Für eine Reihenfolge werden mindestens zwei Elemente benötigt.`);
  }

  if (type === "grouping") {
    const groupsRaw = looseField(raw, ["groups", "categories", "kategorien", "gruppen"], []);
    if (Array.isArray(groupsRaw)) {
      q.groups = groupsRaw.map((g, groupIndex) => ({
        name: String(looseField(g, ["name", "category", "title", "gruppe"], `Kategorie ${groupIndex + 1}`) || `Kategorie ${groupIndex + 1}`),
        items: (() => {
          const items = looseField(g, ["items", "elements", "words", "begriffe"], []);
          return Array.isArray(items) ? items.map(String).map((x) => x.trim()).filter(Boolean) : [];
        })()
      }));
    } else if (groupsRaw && typeof groupsRaw === "object") {
      q.groups = Object.entries(groupsRaw).map(([name, items]) => ({ name, items: Array.isArray(items) ? items.map(String) : [String(items)] }));
      pushUnique(report.repairs, `Aufgabe ${index + 1}: Kategorien wurden in Testify-Gruppen umgewandelt.`);
    }
    if (q.groups.length < 2 || q.groups.some((g) => !g.name.trim() || !g.items.length)) pushUnique(report.warnings, `Aufgabe ${index + 1}: Kategorien und Inhalte bitte prüfen.`);
  }

  if (type === "markwords") {
    q.passage = String(looseField(raw, ["passage", "sourceText", "markText", "textToMark", "markiertext"], "") || "").trim();
    const targetWords = looseField(raw, ["targetWords", "words", "correctWords", "targets", "zielwoerter", "zielworter"], []);
    q.targetWords = Array.isArray(targetWords) ? targetWords.map(String).map((x) => x.trim()).filter(Boolean) : (targetWords ? [String(targetWords)] : []);
    if (!q.passage) pushUnique(report.warnings, `Aufgabe ${index + 1}: Der Text zum Markieren fehlt.`);
    if (!q.targetWords.length) pushUnique(report.warnings, `Aufgabe ${index + 1}: Die Zielwörter fehlen.`);
    else {
      const hay = normalize(q.passage);
      const missing = q.targetWords.filter((word) => !hay.includes(normalize(word)));
      if (missing.length) pushUnique(report.warnings, `Aufgabe ${index + 1}: ${missing.length} Zielwort/Zielwörter kommen im Markiertext nicht eindeutig vor.`);
    }
  }

  if (type === "number") {
    const answer = numberLoose(looseField(raw, ["numericAnswer", "answer", "correctAnswer", "solution", "result", "ergebnis"], NaN), NaN);
    if (Number.isFinite(answer)) q.numericAnswer = answer;
    else {
      q.numericAnswer = 0;
      pushUnique(report.warnings, `Aufgabe ${index + 1}: Das richtige Rechenergebnis fehlt. 0 wurde vorläufig gesetzt – bitte prüfen.`);
    }
    q.tolerance = Math.max(0, numberLoose(looseField(raw, ["tolerance", "tol", "abweichung"], 0), 0));
    q.unit = String(looseField(raw, ["unit", "einheit"], "") || "");
  }

  q.position = index + 1;
  return q;
}

function normalizeImportedPayload(data, parseInfo = {}) {
  const report = {
    repairedSyntax: Boolean(parseInfo.repaired),
    repairs: [...(parseInfo.changes || [])],
    warnings: []
  };

  let root = data;
  if (Array.isArray(root)) {
    root = { questions: root };
    pushUnique(report.repairs, "Aufgabenliste ohne Testhülle wurde automatisch erkannt.");
  }
  if (!root || typeof root !== "object") return { ok: false, error: "Die KI-Antwort enthält kein Test-Objekt.", report };

  let questionsRaw = looseField(root, ["questions", "tasks", "aufgaben", "items"], null);
  if (!Array.isArray(questionsRaw)) {
    const nested = looseField(root, ["test", "quiz", "assessment"], null);
    if (nested && typeof nested === "object") {
      root = nested;
      questionsRaw = looseField(root, ["questions", "tasks", "aufgaben", "items"], null);
      if (Array.isArray(questionsRaw)) pushUnique(report.repairs, "Verschachteltes Test-Objekt wurde automatisch erkannt.");
    }
  }
  if (!Array.isArray(questionsRaw) || !questionsRaw.length) return { ok: false, error: "Es wurde keine Aufgabenliste erkannt.", report };

  const questions = questionsRaw.map((raw, index) => normalizeImportedQuestion(raw, index, report));
  const meta = {
    title: String(looseField(root, ["title", "name", "testTitle", "titel"], "KI-Test") || "KI-Test").trim(),
    subject: String(looseField(root, ["subject", "fach"], "") || "").trim(),
    grade: String(looseField(root, ["grade", "class", "classLevel", "gradeLevel", "klasse", "klassenstufe"], "") || "").trim(),
    description: String(looseField(root, ["description", "instructions", "instruction", "hinweis", "beschreibung"], "") || "").trim()
  };
  return { ok: true, meta, questions, report };
}

function setAiImportHelp({ title, message, details = [], tone = "error" }) {
  const help = $("aiJsonHelp");
  if (!help) return;
  help.className = `jsonHelp ${tone}`;
  help.innerHTML = `<strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ""}${details.length ? `<ul>${details.slice(0, 8).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}`;
}

function clearAiImportHelp() {
  const help = $("aiJsonHelp");
  if (!help) return;
  help.className = "jsonHelp hidden";
  help.innerHTML = "";
}

function renderImportReviewBanner() {
  const host = $("importReviewBanner");
  if (!host) return;
  const report = state.pendingImportReport;
  if (!report || report.quizId !== state.currentQuiz?.id || (!report.repairs?.length && !report.warnings?.length)) {
    host.classList.add("hidden");
    host.innerHTML = "";
    return;
  }
  const warningCount = report.warnings?.length || 0;
  host.classList.remove("hidden");
  host.innerHTML = `<div class="importReviewIcon">${warningCount ? "⚠️" : "✅"}</div><div class="importReviewText"><strong>${warningCount ? `Test importiert – ${warningCount} Hinweis${warningCount === 1 ? "" : "e"} bitte prüfen` : "Test importiert"}</strong><p>${warningCount ? "Einige Stellen waren nicht eindeutig und wurden zur Prüfung markiert." : "Du kannst den Test jetzt prüfen, bearbeiten und anschließend veröffentlichen."}</p>${warningCount ? `<details><summary>Hinweise anzeigen</summary><ul>${report.warnings.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></details>` : ""}</div><button class="iconButton closeImportReview" type="button" aria-label="Hinweise schließen">×</button>`;
  host.querySelector(".closeImportReview")?.addEventListener("click", () => {
    state.pendingImportReport = null;
    host.classList.add("hidden");
  });
}

async function openAiProvider(url, label) {
  const prompt = $("aiPromptOutput")?.value?.trim();
  if (!prompt) {
    toast("Bitte zuerst den Prompt erzeugen.", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(prompt);
    window.open(url, "_blank", "noopener");
    toast(`Prompt kopiert – ${label} wurde geöffnet.`);
  } catch (err) {
    console.error(err);
    window.open(url, "_blank", "noopener");
    toast(`${label} wurde geöffnet. Bitte den Prompt manuell kopieren.`, "error");
  }
}

async function importAiJson() {
  const source = $("aiJsonInput").value;
  if (!source.trim()) {
    toast("Bitte zuerst die Antwort deiner KI einfügen.", "error");
    return;
  }

  const parsed = parseJsonWithRepair(source);
  if (!parsed.ok) {
    setAiImportHelp({
      title: "Die Antwort konnte noch nicht sicher erkannt werden.",
      message: "Prüfe, ob du die vollständige Antwort deiner KI kopiert hast, und versuche den Import erneut.",
      details: [parsed.error?.message || "Unbekannter Formatfehler"],
      tone: "error"
    });
    toast("KI-Antwort konnte nicht importiert werden.", "error");
    return;
  }

  const normalized = normalizeImportedPayload(parsed.data, parsed);
  if (!normalized.ok) {
    setAiImportHelp({
      title: "Die Antwort ist lesbar, aber noch kein vollständiger Test.",
      message: normalized.error,
      details: normalized.report?.repairs || [],
      tone: "warning"
    });
    toast(normalized.error, "error");
    return;
  }

  const { meta, questions, report } = normalized;
  clearAiImportHelp();
  try {
    const base = {
      ...quizDefaults(),
      title: meta.title || "KI-Test",
      subject: meta.subject || $("aiSubject").value || getSettings().defaultSubject || "",
      grade: meta.grade || $("aiGrade").value || getSettings().defaultGrade || "",
      description: meta.description || getSettings().defaultDescription,
      questionCount: questions.length,
      totalPoints: round1(questions.reduce((sum, q) => sum + Number(q.points || 0), 0))
    };
    const { code } = await createQuizDocument(base);
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      q.aiOrigin = { kind: "imported", model: "extern", promptVersion: "" };
      const ref = doc(collection(db, "quizzes", code, "questions"));
      await setDoc(ref, { ...sanitizeQuestionForSave(q), position: i + 1, updatedAt: serverTimestamp() });
    }
    state.pendingImportReport = { ...report, quizId: code };
    if (report.warnings.length) toast(`Test importiert – ${report.warnings.length} Hinweis${report.warnings.length === 1 ? "" : "e"} bitte prüfen.`);
    else if (report.repairs.length) toast("Test importiert.");
    else toast("KI-Test importiert.");
    await openEditor(code);
  } catch (err) {
    console.error(err);
    toast("Der Test konnte nicht importiert werden.", "error");
  }
}

// ---------- Editor ----------
$("addQuestionBtn").addEventListener("click", () => {
  state.questions.push(newQuestion());
  renderQuestions();
  markDirty();
});
$("saveQuizBtn").addEventListener("click", () => saveCurrentQuiz(true));
$("publishBtn").addEventListener("click", publishCurrentQuiz);
$("createSimilarTestBtn")?.addEventListener("click", createSimilarTest);
$("shareTemplateBtn")?.addEventListener("click", async () => {
  if (!state.currentQuiz) return;
  await shareQuizTemplate(state.currentQuiz.id);
});
$("endQuizBtn")?.addEventListener("click", async () => {
  if (!state.currentQuiz) return;
  if (state.isDirty && !(await saveCurrentQuiz(false))) return;
  endQuiz(state.currentQuiz.id, { returnToEditor: true });
});
function updateTimeLimitHint() {
  const teacherMode = $("quizStartMode")?.value === "teacher";
  const hint = $("timeLimitHint");
  if (!hint) return;
  hint.textContent = teacherMode
    ? "Die Schüler warten zunächst im Warteraum. Der Countdown startet für alle gleichzeitig, wenn du den Test freigibst."
    : "Der Countdown startet erst, wenn der Schüler auf „Test starten“ klickt. Bei 00:00 werden die aktuellen Antworten automatisch abgegeben.";
}

$("quizUseTimeLimit")?.addEventListener("change", (e) => {
  $("quizTimeLimitWrap").classList.toggle("hidden", !e.target.checked);
  updateTimeLimitHint();
  markDirty();
});
$("quizTimeLimitMinutes")?.addEventListener("input", markDirty);
$("previewBtn").addEventListener("click", async () => {
  if (!state.currentQuiz) return;
  if (!(await saveCurrentQuiz(false))) return;
  window.open(baseStudentUrl(state.currentQuiz.id, true), "_blank", "noopener");
});

function newQuestion(type = "single", needsFirestoreId = true) {
  let id;
  if (needsFirestoreId && state.currentQuiz?.id) id = doc(collection(db, "quizzes", state.currentQuiz.id, "questions")).id;
  else id = randomId("q");
  const q = {
    id,
    type,
    text: "",
    points: type === "multi" ? 2 : 1,
    position: state.questions.length + 1
  };
  initializeTypeData(q, type);
  return q;
}

function initializeTypeData(q, type) {
  q.points = Math.max(0.5, round1(Number(q.points) || (type === "multi" ? 2 : 1)));
  if (["single", "multi", "dropdown"].includes(type)) {
    q.options = q.options?.length ? q.options : [{ text: "", correct: true }, { text: "", correct: false }];
    if (type !== "multi") {
      const firstCorrect = Math.max(0, q.options.findIndex((o) => o.correct));
      q.options.forEach((o, i) => (o.correct = i === firstCorrect));
    }
  }
  if (type === "text") {
    q.acceptedAnswers = q.acceptedAnswers || [];
    q.manualReview = Boolean(q.manualReview);
  }
  if (type === "truefalse") q.correctBoolean = q.correctBoolean ?? true;
  if (type === "matching") q.pairs = q.pairs?.length ? q.pairs : [{ left: "", right: "" }, { left: "", right: "" }];
  if (type === "ordering") q.items = q.items?.length ? q.items : ["", ""];
  if (type === "grouping") q.groups = q.groups?.length ? q.groups : [{ name: "Kategorie 1", items: [] }, { name: "Kategorie 2", items: [] }];
  if (type === "markwords") {
    q.passage = q.passage || "";
    q.targetWords = q.targetWords || [];
  }
  if (type === "number") {
    q.numericAnswer = Number.isFinite(Number(q.numericAnswer)) ? Number(q.numericAnswer) : 0;
    q.tolerance = Math.max(0, Number(q.tolerance) || 0);
    q.unit = q.unit || "";
  }
}

async function openEditor(code) {
  try {
    const quizSnap = await getDoc(doc(db, "quizzes", code));
    if (!quizSnap.exists()) throw new Error("Test nicht gefunden");
    const q = { id: quizSnap.id, ...quizSnap.data() };
    if (q.ownerId !== state.user.uid) throw new Error("Kein Zugriff");
    state.newManualQuiz = false;
    state.currentQuiz = q;
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    state.questions = qs.docs.map((d) => {
      const item = { id: d.id, ...d.data() };
      initializeTypeData(item, item.type || "single");
      return item;
    });
    state.loadedQuestionIds = new Set(state.questions.map((x) => x.id));
    renderEditorState(q);
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht geöffnet werden.", "error");
  }
}

function renderEditorState(q) {
  $("quizTitle").value = q.title || "";
  $("quizSubject").value = q.subject || "";
  $("quizGrade").value = q.grade || "";
  $("quizDescription").value = q.description || "";
  populateQuizGradeScaleSelect(q.gradeScaleId || getSettings().defaultGradeScaleId, q.gradeScaleSnapshot);
  $("quizResultMode").value = q.resultMode || "points_grade";
  $("quizShowSolutions").checked = q.showSolutions ?? true;
  $("quizStartMode").value = q.startMode === "teacher" ? "teacher" : "student";
  $("quizShuffleQuestions").checked = Boolean(q.shuffleQuestions);
  $("quizShuffleAnswers").checked = Boolean(q.shuffleAnswers);
  const hasTimeLimit = Number(q.timeLimitMinutes) > 0;
  $("quizUseTimeLimit").checked = hasTimeLimit;
  $("quizTimeLimitMinutes").value = hasTimeLimit ? Number(q.timeLimitMinutes) : 10;
  $("quizTimeLimitWrap").classList.toggle("hidden", !hasTimeLimit);
  updateTimeLimitHint();
  $("editorHeading").textContent = q.title || "Test bearbeiten";
  showView("editorView");
  renderImportReviewBanner();
  renderQuestions();
  if (state.newManualQuiz) {
    state.isDirty = false;
    $("saveState").textContent = "Noch nicht gespeichert";
    $("saveState").style.color = "#667085";
  } else markSaved();
  updateEditorPublishControls();
}

function populateQuizGradeScaleSelect(selectedId, snapshot = null) {
  const sel = $("quizGradeScale");
  const scales = getGradeScales();
  const options = [...scales];
  if (selectedId && !options.some((s) => s.id === selectedId) && snapshot?.thresholds?.length === 6) {
    options.unshift({ id: selectedId, name: `${snapshot.name || "Gespeicherter Schlüssel"} (im Test gespeichert)`, thresholds: snapshot.thresholds });
  }
  sel.innerHTML = options.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join("");
  sel.value = options.some((s) => s.id === selectedId) ? selectedId : options[0].id;
}

["quizTitle", "quizSubject", "quizGrade", "quizDescription"].forEach((id) => {
  $(id).addEventListener("input", () => {
    updateSummary();
    markDirty();
  });
});
["quizGradeScale", "quizResultMode", "quizShowSolutions", "quizShuffleQuestions", "quizShuffleAnswers"].forEach((id) => {
  $(id).addEventListener("change", () => markDirty());
});
$("quizStartMode")?.addEventListener("change", () => {
  updateTimeLimitHint();
  markDirty();
});

let draggedQuestionIndex = null;

function renderQuestions() {
  const root = $("questionList");
  root.innerHTML = "";
  state.questions.forEach((q, index) => {
    q.position = index + 1;
    const node = $("questionTemplate").content.firstElementChild.cloneNode(true);
    node.dataset.id = q.id;
    node.dataset.index = String(index);
    node.querySelector(".questionNumber").textContent = `Aufgabe ${index + 1}`;
    const text = node.querySelector(".qText");
    const type = node.querySelector(".qType");
    const points = node.querySelector(".qPoints");
    const caption = node.querySelector(".questionTextCaption");
    const textLabel = node.querySelector(".questionTextLabel");

    caption.textContent = q.type === "markwords" ? "Arbeitsauftrag" : "Frage";
    text.placeholder = "Frage eingeben …";
    text.value = q.text || "";
    type.value = q.type;
    points.value = Math.max(0.5, round1(q.points || 1));

    if (q.type === "gapfill") textLabel.classList.add("hidden");

    text.addEventListener("input", (e) => {
      q.text = e.target.value;
      markDirty();
    });
    type.addEventListener("change", (e) => {
      const previousType = q.type;
      q.type = e.target.value;
      if (previousType === "gapfill" && q.type !== "gapfill") q.text = gapTextToPlain(q.text);
      q.points = q.type === "multi" ? 2 : 1;
      initializeTypeData(q, q.type);
      renderQuestions();
      markDirty();
    });
    points.addEventListener("input", (e) => {
      q.points = Math.max(0.5, Number(e.target.value) || 1);
      updateSummary();
      markDirty();
    });
    points.addEventListener("change", (e) => {
      q.points = Math.max(0.5, round1(Number(e.target.value) || 1));      e.target.value = q.points;
      updateSummary();
    });
    node.querySelector(".moveUp").addEventListener("click", () => moveQuestion(index, -1));
    node.querySelector(".moveDown").addEventListener("click", () => moveQuestion(index, 1));
    node.querySelector(".collapseQuestion")?.addEventListener("click", (e) => {
      const collapsed = node.classList.toggle("collapsed");
      e.currentTarget.textContent = collapsed ? "⌄" : "⌃";
      e.currentTarget.title = collapsed ? "Aufgabe ausklappen" : "Aufgabe einklappen";
    });
    node.querySelector(".duplicateQuestion").addEventListener("click", () => duplicateQuestion(index));
    node.querySelector(".aiEditQuestion")?.addEventListener("click", () => toggleQuestionAiPanel(node, q, index));
    node.querySelector(".aiVariantQuestion")?.addEventListener("click", () => regenerateQuestionWithAi(q, index, { variant: true }));
    const canRate = isAdmin() || Boolean(q.aiOrigin);
    for (const verdict of ["Good", "Bad"]) node.querySelector(`.aiFeedback${verdict}`)?.classList.toggle("hidden", !canRate);
    node.querySelector(".aiFeedbackGood")?.classList.toggle("aiFeedbackSelected", q._aiFeedbackVerdict === "good");
    node.querySelector(".aiFeedbackBad")?.classList.toggle("aiFeedbackSelected", q._aiFeedbackVerdict === "bad");
    node.querySelector(".aiFeedbackGood")?.setAttribute("aria-pressed", String(q._aiFeedbackVerdict === "good"));
    node.querySelector(".aiFeedbackBad")?.setAttribute("aria-pressed", String(q._aiFeedbackVerdict === "bad"));
    if (canRate) {
      node.querySelector(".aiFeedbackGood")?.addEventListener("click", () => submitAiQuestionFeedback(q, index, { verdict: "good", action: "keep" }));
      node.querySelector(".aiFeedbackBad")?.addEventListener("click", () => toggleAiQualityPanel(node, q, index));
    }

    const dragHandle = node.querySelector(".dragHandle");
    dragHandle?.addEventListener("mousedown", () => { node.draggable = true; });
    node.addEventListener("dragstart", (e) => {
      draggedQuestionIndex = index;
      node.classList.add("questionDragging");
      e.dataTransfer.effectAllowed = "move";
    });
    node.addEventListener("dragover", (e) => {
      if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;
      e.preventDefault();
      node.classList.add("questionDropTarget");
    });
    node.addEventListener("dragleave", () => node.classList.remove("questionDropTarget"));
    node.addEventListener("drop", (e) => {
      e.preventDefault();
      node.classList.remove("questionDropTarget");
      if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;
      const [moved] = state.questions.splice(draggedQuestionIndex, 1);
      state.questions.splice(index, 0, moved);
      draggedQuestionIndex = null;
      renderQuestions();
      markDirty();
    });
    node.addEventListener("dragend", () => {
      draggedQuestionIndex = null;
      node.draggable = false;
      node.classList.remove("questionDragging");
      document.querySelectorAll(".questionDropTarget").forEach((el) => el.classList.remove("questionDropTarget"));
    });
    node.querySelector(".deleteQuestion").addEventListener("click", () => {
      if (confirm("Aufgabe löschen?")) {
        state.questions.splice(index, 1);
        renderQuestions();
        markDirty();
      }
    });

    const imageEditor = document.createElement("div");
    imageEditor.className = "questionImageEditor";
    node.querySelector(".answerEditor").before(imageEditor);
    renderQuestionImageEditor(imageEditor, q);
    renderAnswerEditor(node.querySelector(".answerEditor"), q);
    root.appendChild(node);
  });
  updateSummary();
}

function questionContext(index) {
  const others = state.questions.filter((_, i) => i !== index).slice(0, 50);
  return {
    title: state.currentQuiz?.title || $("quizTitle")?.value || "", subject: $("quizSubject")?.value || state.currentQuiz?.subject || "", grade: $("quizGrade")?.value || state.currentQuiz?.grade || "",
    existingQuestions: others.map(q => ({ type: q.type, text: String(q.text || "").slice(0, 300), options: (q.options || []).map(o => ({ text: String(o.text || "").slice(0, 100), correct: Boolean(o.correct) })), acceptedAnswers: (q.acceptedAnswers || []).slice(0, 4), numericAnswer: q.numericAnswer, unit: q.unit, mediaIntent: { kind: q.imageChoicesOnly ? "image_choices" : getQuestionImageSrc(q) ? "ai_generated" : "none" } }))
  };
}

function questionForAi(q) {
  const copy = sanitizeQuestionForSave(q);
  delete copy.imageDataUrl; delete copy.imageUrl; delete copy.imagePath; delete copy.imageByteSize; delete copy.imageAlt;
  delete copy.aiOrigin;
  if (copy.options) copy.options = copy.options.map(({ imageDataUrl, imageAlt, ...option }) => option);
  return copy;
}

const AI_QUALITY_REASONS = Object.freeze({
  incorrect: "Fachlich falsch, unsinnig oder mehrdeutig",
  answer_leak: "Lösung wird bereits verraten",
  image_mismatch: "Bild oder Bildantwort passt nicht",
  duplicate: "Doppelt oder zu ähnlich",
  other: "Anderer Grund"
});

function aiQuestionFeedbackSnapshot(q) {
  return {
    type: String(q.type || "").slice(0, 30), text: String(q.text || "").slice(0, 900), points: Number(q.points) || 1,
    options: (q.options || []).slice(0, 6).map(o => ({ text: String(o.text || "").slice(0, 180), correct: Boolean(o.correct) })),
    acceptedAnswers: (q.acceptedAnswers || []).slice(0, 4).map(answer => String(answer).slice(0, 120)),
    numericAnswer: q.type === "number" && Number.isFinite(Number(q.numericAnswer)) ? Number(q.numericAnswer) : null,
    passage: String(q.passage || "").slice(0, 600),
    imageChoices: Boolean(q.imageChoicesOnly), imagePresent: Boolean(getQuestionImageSrc(q) || q.options?.some(o => o.imageDataUrl))
  };
}

async function submitAiQuestionFeedback(q, index, { verdict, reason = "", comment = "", action = "keep" }) {
  if (!state.user || !state.currentQuiz?.id) return;
  if (action !== "keep" && state.currentQuiz.published && !state.currentQuiz.ended) {
    toast("Während ein Test veröffentlicht ist, kannst du die Aufgabe nur melden. Änderungen bitte nach dem Beenden vornehmen.", "error");
    return false;
  }
  const note = String(comment || "").trim().slice(0, 500);
  if (verdict === "bad" && (!Object.hasOwn(AI_QUALITY_REASONS, reason) || (reason === "other" && !note))) {
    toast("Bitte einen Grund wählen und bei „Anderer Grund“ kurz beschreiben, was nicht passt.", "error");
    return;
  }
  try {
    const snapshot = aiQuestionFeedbackSnapshot(q);
    const fingerprint = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(snapshot)));
    const hash = Array.from(new Uint8Array(fingerprint)).slice(0, 10).map(byte => byte.toString(16).padStart(2, "0")).join("");
    const id = `aiq-${state.currentQuiz.id}-${q.id}-${state.user.uid}-${hash}`;
    const label = AI_QUALITY_REASONS[reason] || "";
    const entry = {
    userId: state.user.uid, displayName: state.profile?.displayName || state.user.displayName || "", email: state.user.email || "",
    category: "ai_question", testCode: state.currentQuiz.id, questionId: q.id, questionPosition: index + 1,
    subject: String($("quizSubject")?.value || state.currentQuiz?.subject || "").trim().slice(0, 120),
    grade: String($("quizGrade")?.value || state.currentQuiz?.grade || "").trim().slice(0, 60),
    questionType: String(q.type || "").slice(0, 30), feedbackSchemaVersion: 2,
    message: verdict === "good" ? "Gute Aufgabe – behalten." : `${label}${note ? `: ${note}` : ""}`,
    verdict, reason, teacherComment: note, action, questionSnapshot: snapshot,
    model: String(q.aiOrigin?.model || "").slice(0, 60), promptVersion: String(q.aiOrigin?.promptVersion || "").slice(0, 60),
    appVersion: APP_VERSION, environment: appEnvironment, status: verdict === "good" ? "done" : "new", createdAt: serverTimestamp()
    };
    await setDoc(doc(db, "feedback", id), entry);
    q._aiFeedbackVerdict = verdict;
    const card = document.querySelector(`.questionCard[data-id="${CSS.escape(q.id)}"]`);
    card?.querySelector(".aiFeedbackGood")?.classList.toggle("aiFeedbackSelected", verdict === "good");
    card?.querySelector(".aiFeedbackBad")?.classList.toggle("aiFeedbackSelected", verdict === "bad");
    card?.querySelector(".aiFeedbackGood")?.setAttribute("aria-pressed", String(verdict === "good"));
    card?.querySelector(".aiFeedbackBad")?.setAttribute("aria-pressed", String(verdict === "bad"));
    if (action === "remove") {
      state.questions.splice(index, 1);
      renderQuestions(); markDirty(); toast("Rückmeldung gespeichert und Aufgabe entfernt. Bitte den Test speichern.");
    } else if (action === "replace") {
      toast("Rückmeldung gespeichert. Neue Aufgabe wird erstellt …");
      const instruction = `Erstelle eine neue, eigenständige Aufgabe. Fehler der bisherigen Aufgabe: ${label}. ${note} Vermeide denselben Fehler und prüfe die Lösung. Bei Bildantworten müssen alle Bilder zum Fragetext passen; bei Komma-Zählfragen dürfen noch keine Kommas im Beispielsatz stehen.`;
      await regenerateQuestionWithAi(q, index, { instruction, requireDifferent: true });
    } else toast(verdict === "good" ? "Gute Aufgabe vermerkt." : "Problem gemeldet. Die Aufgabe bleibt zur Bearbeitung im Entwurf.");
    return true;
  } catch (err) {
    console.error(err);
    toast("Aufgabenfeedback konnte nicht gespeichert werden.", "error");
    return false;
  }
}

function toggleAiQualityPanel(node, q, index) {
  const current = node.querySelector(".aiQualityPanel");
  if (current) { current.remove(); return; }
  const panel = document.createElement("div");
  panel.className = "aiQualityPanel";
  const live = state.currentQuiz?.published && !state.currentQuiz?.ended;
  panel.innerHTML = `<strong>🙁 Was stimmt mit dieser Aufgabe nicht?</strong>${live ? "<p>Ein veröffentlichter Test kann hier nur bewertet werden.</p>" : ""}<label>Grund<select class="aiQualityReason"><option value="">Bitte wählen</option>${Object.entries(AI_QUALITY_REASONS).map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`).join("")}</select></label><label>Hinweis zur Aufgabe <small>(optional, bei „Anderer Grund“ erforderlich)</small><textarea class="aiQualityComment" maxlength="500" placeholder="Was genau ist falsch oder unklar?"></textarea></label><div class="aiQualityActions"><button class="button secondary aiQualityReport" type="button">Nur melden</button>${live ? "" : '<button class="button primary aiQualityReplace" type="button">Melden &amp; neu erstellen</button><button class="button danger aiQualityRemove" type="button">Melden &amp; entfernen</button>'}<button class="button ghost aiQualityCancel" type="button">Abbrechen</button></div>`;
  panel.querySelector(".aiQualityCancel").addEventListener("click", () => panel.remove());
  for (const [selector, action] of [[".aiQualityReport", "keep"], [".aiQualityReplace", "replace"], [".aiQualityRemove", "remove"]]) {
    panel.querySelector(selector)?.addEventListener("click", async () => {
      const buttons = panel.querySelectorAll("button");
      buttons.forEach(button => { button.disabled = true; });
      try {
        const saved = await submitAiQuestionFeedback(q, index, { verdict: "bad", reason: panel.querySelector(".aiQualityReason").value, comment: panel.querySelector(".aiQualityComment").value, action });
        if (saved) panel.remove();
      } finally { buttons.forEach(button => { button.disabled = false; }); }
    });
  }
  node.querySelector(".questionGrid").after(panel);
  panel.querySelector(".aiQualityReason").focus();
}

async function createSimilarTest() {
  if (!state.currentQuiz || !state.questions.length) return toast("Für einen ähnlichen Test brauchst du mindestens eine Aufgabe.", "error");
  if (state.currentQuiz.rightsHold) return toast("Dieser Test ist wegen eines Rechtehinweises vorübergehend gesperrt.", "error");
  if (state.isDirty) return toast("Bitte speichere zuerst deine Änderungen am Ausgangstest.", "error");
  if (!confirm("Für einen ähnlichen Test werden die Texte, Antwortoptionen und Lösungen des Ausgangstests an OpenAI gesendet. Bitte prüfe vorher, dass sie keine personenbezogenen Daten oder nicht für externe KI freigegebenen Materialien enthalten. Test erstellen?")) return;
  const questions = state.questions;
  const hasImageAnswers = q => ["single", "multi"].includes(q.type) && q.options?.length >= 2 && q.options?.length <= 4 && q.options.every(o => o.imageDataUrl);
  const imageAnswerQuestionCount = Math.min(3, questions.filter(hasImageAnswers).length);
  const imageQuestionCount = Math.min(5 - imageAnswerQuestionCount, questions.filter(q => !hasImageAnswers(q) && getQuestionImageSrc(q)).length);
  const request = {
    schoolType: "Mittelschule", region: "Bayern", subject: $("quizSubject").value.trim(), grade: $("quizGrade").value.trim(),
    topic: $("quizTitle").value.trim() || "Ähnlicher Test", difficulty: "gemischt", count: questions.length,
    points: round1(questions.reduce((sum, q) => sum + Number(q.points || 0), 0)),
    allowedTypes: [...new Set(questions.map(q => q.type))], notes: "Erstelle eine eigenständige Variante mit gleicher Kompetenz, ähnlichem Schwierigkeitsgrad und neuen Beispielen. Verwende keine wortgleichen Aufgaben.",
    materials: [], materialMode: "consider", imageMode: imageQuestionCount + imageAnswerQuestionCount ? "exact" : "none", imageQuestionCount, imageAnswerQuestionCount,
    sourceTest: { title: $("quizTitle").value.trim(), questions: questions.map(q => ({ ...questionForAi(q), mediaIntent: { kind: hasImageAnswers(q) ? "image_choices" : getQuestionImageSrc(q) ? "ai_generated" : "none" } })) }
  };
  await createAiTestFromRequest(request, { similar: true, sourceQuiz: state.currentQuiz });
}

function toggleQuestionAiPanel(node, q, index) {
  let panel = node.querySelector(".questionAiPanel");
  if (panel) { panel.remove(); return; }
  panel = document.createElement("div"); panel.className = "questionAiPanel";
  panel.innerHTML = `<strong>✨ Aufgabe mit KI bearbeiten</strong><textarea placeholder="Was soll anders werden? z. B. schwieriger, längere Sätze, andere Zahlen, weniger offensichtliche Antworten …"></textarea><div class="questionAiChips"></div><div class="questionAiActions"><button type="button" class="button primary aiApply">Änderung erstellen</button><button type="button" class="button secondary aiCancel">Abbrechen</button></div>`;
  const chips = ["Einfacher", "Schwieriger", "Kürzer", "Anderes Beispiel", "Neue Zahlen", "Antwortoptionen verbessern"];
  const input = panel.querySelector("textarea");
  chips.forEach(label => { const b = makeMiniButton(label, () => { input.value = label; input.focus(); }); panel.querySelector(".questionAiChips").appendChild(b); });
  if (q._aiUndo) { const undo = makeMiniButton("↶ Letzte KI-Änderung rückgängig", () => { const old = deepClone(q._aiUndo); old._aiUndo = null; state.questions[index] = old; renderQuestions(); markDirty(); }); panel.querySelector(".questionAiChips").appendChild(undo); }
  panel.querySelector(".aiCancel").addEventListener("click", () => panel.remove());
  panel.querySelector(".aiApply").addEventListener("click", () => regenerateQuestionWithAi(q, index, { instruction: input.value.trim(), panel }));
  node.querySelector(".questionGrid").after(panel); input.focus();
}

async function regenerateQuestionWithAi(q, index, { instruction = "", variant = false, panel = null, requireDifferent = false } = {}) {
  if (!variant && !instruction) return toast("Bitte kurz beschreiben, was geändert werden soll.", "error");
  if (variant && state.questions.length >= 50) return toast("Ein Test kann höchstens 50 Aufgaben enthalten.", "error");
  const old = deepClone(q); const card = panel || document.querySelector(`.questionCard[data-id="${CSS.escape(q.id)}"]`);
  card?.classList.add("questionAiBusy");
  try {
    const response = await aiApi.regenerateQuestion({ question: questionForAi(q), instruction, variant, requireDifferent, testContext: questionContext(index), allowedTypes: QUESTION_TYPES.map(([v]) => v), allowImages: true, allowImageChoices: true, materials: [] });
    const report = { warnings: [], repairs: [] }; const next = normalizeImportedQuestion(response.question, index, report);
    next.aiOrigin = { kind: variant ? "variant" : "regenerated", model: String(response?.meta?.model || q.aiOrigin?.model || ""), promptVersion: String(response?.meta?.promptVersion || q.aiOrigin?.promptVersion || "") };
    next.id = variant ? doc(collection(db, "quizzes", state.currentQuiz.id, "questions")).id : q.id;
    next.position = variant ? index + 2 : q.position;
    if (!variant) next._aiUndo = old;
    if (response.question?.mediaIntent?.kind && response.question.mediaIntent.kind !== "none" && response.question.mediaIntent.kind !== "uploaded_crop") {
      await applyGeneratedMedia(response.question, next, state.currentQuiz.id, next.id);
    } else if (!variant && (q.imageDataUrl || q.imageUrl)) { next.imageDataUrl = q.imageDataUrl || ""; next.imageUrl = q.imageUrl || ""; next.imagePath = q.imagePath || ""; next.imageAlt = q.imageAlt || ""; }
    if (variant) state.questions.splice(index + 1, 0, next);
    else state.questions[index] = next;
    renderQuestions(); markDirty(); toast(variant ? "Zusätzliche Variante hinzugefügt. Bitte speichern." : "Aufgabe überarbeitet.");
  } catch (err) {
    console.error(err);
    const friendly = aiFriendlyError(err, variant ? "Variante konnte nicht erstellt werden." : "Aufgabe konnte nicht überarbeitet werden.");
    showReportableError({
      code: variant ? REPORTABLE_ERROR_CODES.aiVariant : REPORTABLE_ERROR_CODES.aiEdit,
      message: friendly,
      error: err,
      action: variant ? "add_ai_variant" : "edit_question_with_ai",
      details: {
        questionPosition: index + 1,
        questionType: String(q?.type || ""),
        mediaKind: String(q?.mediaIntent?.kind || "none"),
        instructionLength: String(instruction || "").length,
        requireDifferent: Boolean(requireDifferent),
        testQuestionCount: Array.isArray(state.questions) ? state.questions.length : 0
      }
    });
  }
  finally { card?.classList.remove("questionAiBusy"); }
}

function moveQuestion(index, delta) {
  const next = index + delta;
  if (next < 0 || next >= state.questions.length) return;
  [state.questions[index], state.questions[next]] = [state.questions[next], state.questions[index]];
  renderQuestions();
  markDirty();
}

function duplicateQuestion(index) {
  const source = state.questions[index];
  const copy = deepClone(source);
  copy.id = doc(collection(db, "quizzes", state.currentQuiz.id, "questions")).id;
  copy.text += " (Kopie)";
  state.questions.splice(index + 1, 0, copy);
  renderQuestions();
  markDirty();
}

function makeMiniButton(text, handler) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "miniButton";
  btn.textContent = text;
  btn.addEventListener("click", handler);
  return btn;
}


async function blobToImage(blob) {
  if ("createImageBitmap" in window) {
    try { return await createImageBitmap(blob); } catch (_) {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht gelesen werden.")); };
    img.src = url;
  });
}

async function compressQuestionImage(blob) {
  const image = await blobToImage(blob);
  const sourceWidth = image.width || image.naturalWidth;
  const sourceHeight = image.height || image.naturalHeight;
  const MAX_BYTES = 280 * 1024;
  const MAX_SIDE = 1400;
  const MIN_SIDE = 420;

  let scale = Math.min(1, MAX_SIDE / Math.max(sourceWidth, sourceHeight));
  let best = null;

  const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

  for (let pass = 0; pass < 6; pass += 1) {
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const out = (await toBlob(canvas, "image/webp", quality)) || (await toBlob(canvas, "image/jpeg", quality));
      if (!out) continue;
      if (!best || out.size < best.size) best = out;
      if (out.size <= MAX_BYTES) {
        if (typeof image.close === "function") image.close();
        return out;
      }
    }

    const longest = Math.max(width, height);
    if (longest <= MIN_SIDE) break;
    scale *= 0.78;
  }

  if (typeof image.close === "function") image.close();
  if (best && best.size <= 360 * 1024) return best;
  throw new Error("IMAGE_TOO_LARGE_AFTER_COMPRESSION");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(blob);
  });
}

function getQuestionImageSrc(q) {
  return String(q?.imageDataUrl || q?.imageUrl || "");
}

async function uploadQuestionImage(blob, q) {
  if (!state.user || !state.currentQuiz?.id || !q?.id) {
    toast("Bild kann diesem Test gerade nicht zugeordnet werden.", "error");
    return;
  }
  if (!blob?.type?.startsWith("image/")) {
    toast("Bitte eine Bilddatei verwenden.", "error");
    return;
  }
  if (blob.size > 20 * 1024 * 1024) {
    toast("Das Bild ist zu groß. Maximal 20 MB vor der Komprimierung.", "error");
    return;
  }
  try {
    toast("Bild wird vorbereitet …");
    const optimized = await compressQuestionImage(blob);
    const dataUrl = await blobToDataUrl(optimized);
    if (dataUrl.length > 500000) throw new Error("IMAGE_DATA_TOO_LARGE");
    q.imageDataUrl = dataUrl;
    q.imageByteSize = optimized.size;
    q.imageAlt = q.imageAlt || "";
    // Falls ein alter Storage-Link vorhanden war, hat die neue lokale Bildversion Vorrang.
    q.imageUrl = "";
    q.imagePath = "";
    markDirty();
    renderQuestions();
    toast("Bild eingefügt. Es wird zusammen mit der Aufgabe gespeichert.");
  } catch (err) {
    console.error(err);
    if (String(err?.message || err).includes("IMAGE_")) {
      toast("Das Bild ist auch nach der Komprimierung noch zu groß. Bitte einen kleineren Ausschnitt verwenden.", "error");
    } else {
      toast("Bild konnte nicht eingefügt werden.", "error");
    }
  }
}

function renderQuestionImageEditor(container, q) {
  container.innerHTML = "";
  const title = document.createElement("div");
  title.className = "imageEditorTitle";
  title.innerHTML = `<span class="labelLike">Bild zur Aufgabe <small>(optional)</small></span>`;
  container.appendChild(title);

  if (getQuestionImageSrc(q)) {
    const preview = document.createElement("div");
    preview.className = "questionImagePreview";
    preview.innerHTML = `<img src="${escapeHtml(getQuestionImageSrc(q))}" alt="${escapeHtml(q.imageAlt || "Abbildung zur Aufgabe")}">`;
    container.appendChild(preview);

    const alt = document.createElement("label");
    alt.className = "stack compact imageAltField";
    alt.innerHTML = `<span>Bildbeschreibung <small>(optional)</small></span><input type="text" value="${escapeHtml(q.imageAlt || "")}" placeholder="z. B. Zimmer mit Tisch und Teddy">`;
    alt.querySelector("input").addEventListener("input", (e) => { q.imageAlt = e.target.value; markDirty(); });
    container.appendChild(alt);

    const actions = document.createElement("div");
    actions.className = "imageActions";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.className = "hidden";
    file.addEventListener("change", () => file.files?.[0] && uploadQuestionImage(file.files[0], q));
    const replace = makeMiniButton("Bild ersetzen", () => file.click());
    const shot = makeMiniButton("Screenshot", () => captureScreenForQuestion(q));
    const remove = makeMiniButton("Bild entfernen", () => {
      q.imageDataUrl = "";
      q.imageByteSize = 0;
      q.imageUrl = "";
      q.imagePath = "";
      q.imageAlt = "";
      markDirty();
      renderQuestions();
    });
    remove.classList.add("dangerMini");
    actions.append(replace, shot, remove, file);
    container.appendChild(actions);
    return;
  }

  const open = makeMiniButton("+ Bild hinzufügen", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) panel.focus();
  });
  open.classList.add("imageAddButton");
  container.appendChild(open);

  const panel = document.createElement("div");
  panel.className = "imageDropPanel hidden";
  panel.tabIndex = 0;
  panel.innerHTML = `<strong>Bild einfügen</strong><p>Datei hier hineinziehen oder hier klicken und mit <kbd>Cmd</kbd>/<kbd>Strg</kbd> + <kbd>V</kbd> aus der Zwischenablage einfügen.</p><div class="imageActions"></div>`;
  const actions = panel.querySelector(".imageActions");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.className = "hidden";
  file.addEventListener("change", () => file.files?.[0] && uploadQuestionImage(file.files[0], q));
  actions.append(makeMiniButton("Datei auswählen", () => file.click()), makeMiniButton("Screenshot aufnehmen", () => captureScreenForQuestion(q)), file);

  ["dragenter", "dragover"].forEach((name) => panel.addEventListener(name, (e) => {
    e.preventDefault();
    panel.classList.add("dragOver");
  }));
  ["dragleave", "drop"].forEach((name) => panel.addEventListener(name, (e) => {
    e.preventDefault();
    panel.classList.remove("dragOver");
  }));
  panel.addEventListener("drop", (e) => {
    const image = Array.from(e.dataTransfer?.files || []).find((f) => f.type.startsWith("image/"));
    if (image) uploadQuestionImage(image, q);
    else toast("In der Ablage wurde kein Bild gefunden.", "error");
  });
  panel.addEventListener("paste", (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((x) => x.type.startsWith("image/"));
    const image = item?.getAsFile();
    if (image) {
      e.preventDefault();
      uploadQuestionImage(image, q);
    }
  });
  container.appendChild(panel);
}

async function captureScreenForQuestion(q) {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    toast("Dieser Browser unterstützt direkte Screenshots nicht.", "error");
    return;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    await video.play();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Screenshot konnte nicht erzeugt werden.");
    openScreenshotCropper(blob, q);
  } catch (err) {
    stream?.getTracks().forEach((track) => track.stop());
    if (err?.name !== "NotAllowedError") {
      console.error(err);
      toast("Screenshot konnte nicht aufgenommen werden.", "error");
    }
  }
}

function openScreenshotCropper(blob, q) {
  const url = URL.createObjectURL(blob);
  const overlay = document.createElement("div");
  overlay.className = "cropOverlay";
  overlay.innerHTML = `<div class="cropDialog"><div class="cropHead"><div><h2>Screenshot zuschneiden</h2><p>Ziehe einen Rahmen um den Bereich, den du verwenden möchtest.</p></div><button class="iconButton cropClose" type="button">×</button></div><div class="cropStage"><img alt="Screenshot-Vorschau"><div class="cropSelection hidden"></div></div><div class="cropActions"><button class="button ghost cropCancel" type="button">Abbrechen</button><button class="button secondary cropFull" type="button">Gesamtes Bild</button><button class="button primary cropUse" type="button">Ausschnitt übernehmen</button></div></div>`;
  document.body.appendChild(overlay);
  const img = overlay.querySelector("img");
  const stage = overlay.querySelector(".cropStage");
  const selection = overlay.querySelector(".cropSelection");
  img.src = url;
  let rect = null;
  let start = null;

  const cleanup = () => {
    URL.revokeObjectURL(url);
    overlay.remove();
  };
  overlay.querySelector(".cropClose").addEventListener("click", cleanup);
  overlay.querySelector(".cropCancel").addEventListener("click", cleanup);

  const point = (e) => {
    const r = stage.getBoundingClientRect();
    return { x: clamp(e.clientX - r.left, 0, r.width), y: clamp(e.clientY - r.top, 0, r.height), stageRect: r };
  };
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    start = point(e);
    rect = { x: start.x, y: start.y, w: 0, h: 0 };
    selection.classList.remove("hidden");
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!start) return;
    const p = point(e);
    rect = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
    Object.assign(selection.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` });
  });
  const endSelection = () => { start = null; };
  stage.addEventListener("pointerup", endSelection);
  stage.addEventListener("pointercancel", endSelection);

  const cropAndUpload = async (useFull = false) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const display = img.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const imageOffsetX = display.left - stageRect.left;
    const imageOffsetY = display.top - stageRect.top;
    const chosen = useFull ? { x: imageOffsetX, y: imageOffsetY, w: display.width, h: display.height } : rect;
    if (!chosen || chosen.w < 8 || chosen.h < 8) {
      toast("Bitte zuerst einen Bereich markieren.", "error");
      return;
    }
    const x = clamp(chosen.x - imageOffsetX, 0, display.width);
    const y = clamp(chosen.y - imageOffsetY, 0, display.height);
    const w = clamp(chosen.w, 1, display.width - x);
    const h = clamp(chosen.h, 1, display.height - y);
    const sx = Math.round((x / display.width) * img.naturalWidth);
    const sy = Math.round((y / display.height) * img.naturalHeight);
    const sw = Math.max(1, Math.round((w / display.width) * img.naturalWidth));
    const sh = Math.max(1, Math.round((h / display.height) * img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const cropped = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    cleanup();
    if (cropped) await uploadQuestionImage(cropped, q);
  };
  overlay.querySelector(".cropFull").addEventListener("click", () => cropAndUpload(true));
  overlay.querySelector(".cropUse").addEventListener("click", () => cropAndUpload(false));
}

function serializeGapComposer(root) {
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node;
    if (el.classList?.contains("gapChip")) {
      let answers = [];
      try { answers = JSON.parse(el.dataset.answers || "[]"); } catch (_) {}
      return `[${answers.map((x) => String(x).trim()).filter(Boolean).join("|")}]`;
    }
    if (el.tagName === "BR") return "\n";
    const inner = Array.from(el.childNodes).map(walk).join("");
    return ["DIV", "P"].includes(el.tagName) ? `${inner}\n` : inner;
  };
  return Array.from(root.childNodes).map(walk).join("").replace(/\n+$/, "");
}

function makeGapChip(answers, q, editor) {
  const initial = answers.map((x) => String(x).trim()).filter(Boolean);
  const span = document.createElement("span");
  span.className = "gapChip";
  span.contentEditable = "false";
  span.dataset.answers = JSON.stringify(initial);
  const label = document.createElement("span");
  label.className = "gapChipLabel";
  label.textContent = initial[0] || "Lücke";
  label.title = "Klicken, um alternative richtige Antworten einzutragen";
  label.addEventListener("click", () => {
    let current = [];
    try { current = JSON.parse(span.dataset.answers || "[]"); } catch (_) {}
    const value = prompt("Akzeptierte Antworten, durch Kommas getrennt:", current.join(", "));
    if (value === null) return;
    const next = value.split(",").map((x) => x.trim()).filter(Boolean);
    if (!next.length) return toast("Mindestens eine richtige Antwort erforderlich.", "error");
    span.dataset.answers = JSON.stringify(next);
    label.textContent = next[0];
    q.text = serializeGapComposer(editor);
    markDirty();
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "gapChipRemove";
  remove.textContent = "×";
  remove.title = "Lücke entfernen";
  remove.addEventListener("click", () => {
    let current = [];
    try { current = JSON.parse(span.dataset.answers || "[]"); } catch (_) {}
    span.replaceWith(document.createTextNode(current[0] || ""));
    q.text = serializeGapComposer(editor);
    markDirty();
  });
  span.append(label, remove);
  return span;
}

function fillGapComposer(editor, q) {
  editor.innerHTML = "";
  const source = String(q.text || "");
  const regex = /\[([^\]]+)\]/g;
  let last = 0;
  let match;
  while ((match = regex.exec(source))) {
    if (match.index > last) editor.appendChild(document.createTextNode(source.slice(last, match.index)));
    editor.appendChild(makeGapChip(match[1].split("|"), q, editor));
    last = match.index + match[0].length;
  }
  if (last < source.length) editor.appendChild(document.createTextNode(source.slice(last)));
}

function renderGapfillEditor(container, q) {
  const info = document.createElement("p");
  info.className = "hint";
  info.textContent = "Schreibe deinen Text, markiere anschließend ein Wort oder einen Ausdruck und klicke auf „Als Lücke markieren“.";
  const editor = document.createElement("div");
  editor.className = "gapComposer";
  editor.contentEditable = "true";
  editor.dataset.placeholder = "z. B. Die Hauptstadt von Bayern ist München.";
  fillGapComposer(editor, q);
  editor.addEventListener("input", () => { q.text = serializeGapComposer(editor); markDirty(); });
  editor.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    q.text = serializeGapComposer(editor);
    markDirty();
  });
  const actions = document.createElement("div");
  actions.className = "gapActions";
  const mark = makeMiniButton("Als Lücke markieren", () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return toast("Markiere zuerst das Wort oder den Ausdruck für die Lücke.", "error");
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return toast("Die Markierung muss im Lückentext liegen.", "error");
    const selected = selection.toString().trim();
    if (!selected) return toast("Markiere zuerst einen Text für die Lücke.", "error");
    range.deleteContents();
    const chip = makeGapChip([selected], q, editor);
    range.insertNode(chip);
    range.setStartAfter(chip);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    q.text = serializeGapComposer(editor);
    markDirty();
  });
  actions.appendChild(mark);
  const note = document.createElement("small");
  note.className = "hint";
  note.textContent = "Tipp: Klicke auf eine markierte Lücke, um alternative richtige Antworten einzutragen.";
  container.append(info, editor, actions, note);
}

function renderAnswerEditor(container, q) {
  container.innerHTML = "";

  if (["single", "multi", "dropdown"].includes(q.type)) {
    const info = document.createElement("p");
    info.className = "hint";
    info.textContent = q.type === "multi" ? "Mehrere richtige Antworten sind möglich." : "Markiere genau eine richtige Antwort.";
    container.appendChild(info);
    q.options = q.options || [];
    q.options.forEach((opt, idx) => {
      const row = document.createElement("div");
      row.className = "optionRow";
      const correct = document.createElement("input");
      correct.type = q.type === "multi" ? "checkbox" : "radio";
      correct.name = `correct-${q.id}`;
      correct.checked = Boolean(opt.correct);
      correct.addEventListener("change", () => {
        if (q.type !== "multi") q.options.forEach((o, i) => (o.correct = i === idx));
        else opt.correct = correct.checked;
        renderQuestions();
        markDirty();
      });
      const text = document.createElement("input");
      text.value = opt.text || "";
      text.placeholder = `Antwort ${idx + 1}`;
      text.addEventListener("input", (e) => {
        opt.text = e.target.value;
        markDirty();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "removeOption";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        if (q.options.length <= 2) {
          toast("Mindestens zwei Antworten erforderlich.", "error");
          return;
        }
        q.options.splice(idx, 1);
        renderQuestions();
        markDirty();
      });
      if (opt.imageDataUrl) {
        const img = document.createElement("img"); img.className = "optionImageThumb"; img.src = opt.imageDataUrl; img.alt = opt.imageAlt || `Abbildung zu Antwort ${idx + 1}`; row.append(correct, img, text, remove);
      } else row.append(correct, text, remove);
      container.appendChild(row);
    });
    container.appendChild(makeMiniButton("+ Antwortmöglichkeit", () => {
      q.options.push({ text: "", correct: false });
      renderQuestions();
      markDirty();
    }));
    return;
  }

  if (q.type === "text") {
    const label = document.createElement("label");
    label.className = "stack compact";
    label.innerHTML = `<span>Automatisch akzeptierte Antworten <small>(durch Kommas getrennt)</small></span><input type="text" value="${escapeHtml((q.acceptedAnswers || []).join(", "))}" placeholder="z. B. spannend, interessant">`;
    label.querySelector("input").addEventListener("input", (e) => {
      q.acceptedAnswers = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
      markDirty();
    });
    container.appendChild(label);
    const manual = document.createElement("label");
    manual.className = "manualRow";
    manual.innerHTML = `<input type="checkbox" ${q.manualReview ? "checked" : ""}> Antwort grundsätzlich manuell prüfen`;
    manual.querySelector("input").addEventListener("change", (e) => {
      q.manualReview = e.target.checked;
      markDirty();
    });
    container.appendChild(manual);
    return;
  }

  if (q.type === "truefalse") {
    const wrap = document.createElement("div");
    wrap.className = "trueFalseEditor";
    wrap.innerHTML = `<span class="labelLike">Richtige Antwort</span><label class="choice compactChoice"><input type="radio" name="tf-${q.id}" value="true" ${q.correctBoolean ? "checked" : ""}><span>Richtig</span></label><label class="choice compactChoice"><input type="radio" name="tf-${q.id}" value="false" ${!q.correctBoolean ? "checked" : ""}><span>Falsch</span></label>`;
    wrap.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => {
      q.correctBoolean = input.value === "true";
      markDirty();
    }));
    container.appendChild(wrap);
    return;
  }

  if (q.type === "gapfill") {
    renderGapfillEditor(container, q);
    return;
  }

  if (q.type === "matching") {
    const info = document.createElement("p");
    info.className = "hint";
    info.textContent = "Erstelle passende Paare. Schüler ziehen die rechten Begriffe zur passenden linken Seite.";
    container.appendChild(info);
    q.pairs.forEach((pair, idx) => {
      const row = document.createElement("div");
      row.className = "pairRow";
      row.innerHTML = `<input class="pairLeft" placeholder="Begriff / Frage" value="${escapeHtml(pair.left)}"><span>↔</span><input class="pairRight" placeholder="Zuordnung" value="${escapeHtml(pair.right)}"><button class="removeOption" type="button">×</button>`;
      row.querySelector(".pairLeft").addEventListener("input", (e) => { pair.left = e.target.value; markDirty(); });
      row.querySelector(".pairRight").addEventListener("input", (e) => { pair.right = e.target.value; markDirty(); });
      row.querySelector("button").addEventListener("click", () => {
        if (q.pairs.length <= 2) return toast("Mindestens zwei Paare erforderlich.", "error");
        q.pairs.splice(idx, 1);
        renderQuestions();
        markDirty();
      });
      container.appendChild(row);
    });
    container.appendChild(makeMiniButton("+ Paar", () => {
      q.pairs.push({ left: "", right: "" });
      renderQuestions();
      markDirty();
    }));
    return;
  }

  if (q.type === "ordering") {
    const info = document.createElement("p");
    info.className = "hint";
    info.textContent = "Gib die Elemente bereits in der richtigen Reihenfolge ein. Für Schüler werden sie gemischt.";
    container.appendChild(info);
    q.items.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "listEditorRow";
      row.innerHTML = `<span class="orderBadge">${idx + 1}</span><input value="${escapeHtml(item)}" placeholder="Element ${idx + 1}"><button class="removeOption" type="button">×</button>`;
      row.querySelector("input").addEventListener("input", (e) => { q.items[idx] = e.target.value; markDirty(); });
      row.querySelector("button").addEventListener("click", () => {
        if (q.items.length <= 2) return toast("Mindestens zwei Elemente erforderlich.", "error");
        q.items.splice(idx, 1);
        renderQuestions();
        markDirty();
      });
      container.appendChild(row);
    });
    container.appendChild(makeMiniButton("+ Element", () => {
      q.items.push("");
      renderQuestions();
      markDirty();
    }));
    return;
  }

  if (q.type === "grouping") {
    const info = document.createElement("p");
    info.className = "hint";
    info.textContent = "Lege Kategorien an und schreibe pro Zeile ein Element hinein. Schüler ziehen die gemischten Elemente in die passenden Kategorien.";
    container.appendChild(info);
    q.groups.forEach((group, idx) => {
      const card = document.createElement("div");
      card.className = "groupEditorCard";
      card.innerHTML = `<div class="groupEditorHead"><input class="groupName" value="${escapeHtml(group.name)}" placeholder="Kategorie ${idx + 1}"><button class="removeOption" type="button">×</button></div><textarea rows="4" placeholder="Ein Element pro Zeile">${escapeHtml((group.items || []).join("\n"))}</textarea>`;
      card.querySelector(".groupName").addEventListener("input", (e) => { group.name = e.target.value; markDirty(); });
      card.querySelector("textarea").addEventListener("input", (e) => {
        group.items = e.target.value.split(/\n/).map((s) => s.trim()).filter(Boolean);
        markDirty();
      });
      card.querySelector("button").addEventListener("click", () => {
        if (q.groups.length <= 2) return toast("Mindestens zwei Kategorien erforderlich.", "error");
        q.groups.splice(idx, 1);
        renderQuestions();
        markDirty();
      });
      container.appendChild(card);
    });
    container.appendChild(makeMiniButton("+ Kategorie", () => {
      q.groups.push({ name: `Kategorie ${q.groups.length + 1}`, items: [] });
      renderQuestions();
      markDirty();
    }));
    return;
  }

  if (q.type === "markwords") {
    const passage = document.createElement("label");
    passage.className = "stack compact";
    passage.innerHTML = `<span>Text, in dem markiert wird</span><textarea rows="5" placeholder="Hier den Text einfügen …">${escapeHtml(q.passage || "")}</textarea>`;
    passage.querySelector("textarea").addEventListener("input", (e) => { q.passage = e.target.value; markDirty(); });
    container.appendChild(passage);
    const targets = document.createElement("label");
    targets.className = "stack compact markTargets";
    targets.innerHTML = `<span>Zielwörter <small>(durch Kommas getrennt)</small></span><input value="${escapeHtml((q.targetWords || []).join(", "))}" placeholder="z. B. ich, du, wir"><small class="hint">Jedes passende Wort im Text gilt als richtige Markierung.</small>`;
    targets.querySelector("input").addEventListener("input", (e) => {
      q.targetWords = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
      markDirty();
    });
    container.appendChild(targets);
    return;
  }

  if (q.type === "number") {
    const grid = document.createElement("div");
    grid.className = "numberEditorGrid";
    grid.innerHTML = `<label>Richtiges Ergebnis<input class="numAnswer" type="number" step="any" value="${Number(q.numericAnswer)}"></label><label>Toleranz ±<input class="numTolerance" type="number" min="0" step="any" value="${Number(q.tolerance || 0)}"></label><label>Einheit (optional)<input class="numUnit" value="${escapeHtml(q.unit || "")}" placeholder="z. B. €"></label>`;
    grid.querySelector(".numAnswer").addEventListener("input", (e) => { q.numericAnswer = Number(e.target.value); markDirty(); });
    grid.querySelector(".numTolerance").addEventListener("input", (e) => { q.tolerance = Math.max(0, Number(e.target.value) || 0); markDirty(); });
    grid.querySelector(".numUnit").addEventListener("input", (e) => { q.unit = e.target.value; markDirty(); });
    container.appendChild(grid);
  }
}

function updateSummary() {
  $("questionCount").textContent = state.questions.length;
  $("totalPoints").textContent = round1(state.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0));
  $("publishStatus").textContent = state.currentQuiz?.rightsHold ? "Zugang gesperrt" : state.currentQuiz?.ended ? "Beendet" : state.currentQuiz?.published ? "Veröffentlicht" : "Entwurf";
}

function updateEditorPublishControls() {
  if (!state.currentQuiz) return;
  const ended = Boolean(state.currentQuiz.ended);
  const published = Boolean(state.currentQuiz.published) && !ended;
  const blocked = Boolean(state.currentQuiz.rightsHold);
  $("endQuizBtn")?.classList.toggle("hidden", !published || blocked);
  if ($("shareTemplateBtn")) $("shareTemplateBtn").disabled = state.newManualQuiz || blocked;
  if ($("createSimilarTestBtn")) $("createSimilarTestBtn").disabled = state.newManualQuiz || blocked;
  if ($("publishBtn")) { $("publishBtn").disabled = blocked; $("publishBtn").textContent = blocked ? "Zugang gesperrt" : ended ? "Erneut öffnen" : published ? "Schülerlink" : "Veröffentlichen"; }
}

function markDirty() {
  state.isDirty = true;
  $("saveState").textContent = "Ungespeicherte Änderungen";
  $("saveState").style.color = "#9a6700";
}

function markSaved() {
  state.isDirty = false;
  $("saveState").textContent = "✓ Gespeichert";
  $("saveState").style.color = "#15803d";
  updateSummary();
  updateEditorPublishControls();
}

function leaveEditorToDashboard() {
  if (state.isDirty && !confirm("Es gibt ungespeicherte Änderungen. Wirklich ohne Speichern zurückgehen?")) return;
  state.isDirty = false;
  state.newManualQuiz = false;
  state.currentQuiz = null;
  loadDashboard();
}

window.addEventListener("beforeunload", (event) => {
  if (!state.isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

function gapTextToPlain(text) {
  return String(text || "").replace(/\[([^\]]+)\]/g, (_, inside) => String(inside).split("|")[0].trim());
}

function parseGaps(text) {
  const matches = [];
  const regex = /\[([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(String(text || "")))) {
    matches.push({ full: match[0], answers: match[1].split("|").map((s) => s.trim()).filter(Boolean), index: match.index });
  }
  return matches;
}

function tokenizeWords(text) {
  const pieces = String(text || "").match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu) || [];
  let wordIndex = 0;
  return pieces.map((piece) => {
    const isWord = /[\p{L}\p{N}]/u.test(piece[0] || "");
    return { text: piece, isWord, wordIndex: isWord ? wordIndex++ : null };
  });
}

function markwordCorrectIndexes(q) {
  const targets = new Set((q.targetWords || []).map(normalizeWord).filter(Boolean));
  return tokenizeWords(q.passage).filter((t) => t.isWord && targets.has(normalizeWord(t.text))).map((t) => String(t.wordIndex));
}

function validateQuiz() {
  if (!$("quizTitle").value.trim()) return "Bitte einen Titel eingeben.";
  if (!state.questions.length) return "Bitte mindestens eine Aufgabe hinzufügen.";
  if ($("quizUseTimeLimit")?.checked) {
    const minutes = Number($("quizTimeLimitMinutes")?.value);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 300) return "Das Zeitlimit muss zwischen 1 und 300 ganzen Minuten liegen.";
  }
  for (let i = 0; i < state.questions.length; i += 1) {
    const q = state.questions[i];
    if (!q.text.trim()) return `Aufgabe ${i + 1}: Fragetext fehlt.`;
    if (!(Number(q.points) > 0)) return `Aufgabe ${i + 1}: Punkte müssen größer als 0 sein.`;
    if (q.type === "text" && !q.manualReview && !(q.acceptedAnswers || []).length) return `Aufgabe ${i + 1}: Hinterlege mindestens eine akzeptierte Antwort oder aktiviere die manuelle Prüfung.`;
    if (["single", "multi", "dropdown"].includes(q.type)) {
      if ((q.options || []).some((o) => !o.text.trim())) return `Aufgabe ${i + 1}: Eine Antwortmöglichkeit ist leer.`;
      if (!(q.options || []).some((o) => o.correct)) return `Aufgabe ${i + 1}: Markiere mindestens eine richtige Antwort.`;
      if (q.type !== "multi" && q.options.filter((o) => o.correct).length !== 1) return `Aufgabe ${i + 1}: Genau eine Antwort muss richtig sein.`;
    }
    if (q.type === "gapfill") {
      const gaps = parseGaps(q.text);
      if (!gaps.length || gaps.some((g) => !g.answers.length)) return `Aufgabe ${i + 1}: Markiere mindestens eine Stelle als Lücke.`;
    }
    if (q.type === "matching") {
      if ((q.pairs || []).length < 2 || q.pairs.some((p) => !p.left.trim() || !p.right.trim())) return `Aufgabe ${i + 1}: Mindestens zwei vollständige Zuordnungspaare erforderlich.`;
    }
    if (q.type === "ordering") {
      if ((q.items || []).length < 2 || q.items.some((x) => !String(x).trim())) return `Aufgabe ${i + 1}: Mindestens zwei vollständige Elemente für die Reihenfolge erforderlich.`;
    }
    if (q.type === "grouping") {
      if ((q.groups || []).length < 2 || q.groups.some((g) => !g.name.trim() || !(g.items || []).length)) return `Aufgabe ${i + 1}: Jede Kategorie braucht einen Namen und mindestens ein Element.`;
    }
    if (q.type === "markwords") {
      if (!q.passage?.trim()) return `Aufgabe ${i + 1}: Der Text zum Markieren fehlt.`;
      if (!(q.targetWords || []).length) return `Aufgabe ${i + 1}: Mindestens ein Zielwort fehlt.`;
      if (!markwordCorrectIndexes(q).length) return `Aufgabe ${i + 1}: Keines der Zielwörter kommt im Text vor.`;
    }
    if (q.type === "number" && !Number.isFinite(Number(q.numericAnswer))) return `Aufgabe ${i + 1}: Das richtige Rechenergebnis fehlt.`;
  }
  return "";
}

function sanitizeQuestionForSave(q) {
  const base = {
    type: q.type,
    text: String(q.text || "").trim(),
    points: Math.max(0.5, round1(Number(q.points) || 1)),
    position: Number(q.position || 0)
  };
  if (q.aiOrigin?.kind) base.aiOrigin = { kind: String(q.aiOrigin.kind).slice(0, 30), model: String(q.aiOrigin.model || "").slice(0, 60), promptVersion: String(q.aiOrigin.promptVersion || "").slice(0, 60) };
  if (q.imageDataUrl) {
    base.imageDataUrl = String(q.imageDataUrl);
    base.imageByteSize = Number(q.imageByteSize || 0);
    base.imageAlt = String(q.imageAlt || "").trim();
  } else if (q.imageUrl) {
    // Abwärtskompatibilität für eventuell bereits vorhandene Storage-Bilder.
    base.imageUrl = String(q.imageUrl);
    base.imagePath = String(q.imagePath || "");
    base.imageAlt = String(q.imageAlt || "").trim();
  }
  if (["single", "multi", "dropdown"].includes(q.type)) {
    base.options = (q.options || []).map((o) => ({ text: String(o.text || "").trim(), correct: Boolean(o.correct), ...(o.imageDataUrl ? { imageDataUrl: String(o.imageDataUrl), imageAlt: String(o.imageAlt || "").trim() } : {}) }));
    if (q.imageChoicesOnly) base.imageChoicesOnly = true;
  }
  if (q.type === "text") {
    base.acceptedAnswers = (q.acceptedAnswers || []).map((x) => String(x).trim()).filter(Boolean);
    base.manualReview = Boolean(q.manualReview);
  }
  if (q.type === "truefalse") base.correctBoolean = Boolean(q.correctBoolean);
  if (q.type === "matching") base.pairs = (q.pairs || []).map((p) => ({ left: String(p.left || "").trim(), right: String(p.right || "").trim() }));
  if (q.type === "ordering") base.items = (q.items || []).map((x) => String(x).trim());
  if (q.type === "grouping") base.groups = (q.groups || []).map((g) => ({ name: String(g.name || "").trim(), items: (g.items || []).map((x) => String(x).trim()).filter(Boolean) }));
  if (q.type === "markwords") {
    base.passage = String(q.passage || "").trim();
    base.targetWords = (q.targetWords || []).map((x) => String(x).trim()).filter(Boolean);
  }
  if (q.type === "number") {
    base.numericAnswer = Number(q.numericAnswer);
    base.tolerance = Math.max(0, Number(q.tolerance) || 0);
    base.unit = String(q.unit || "").trim();
  }
  return base;
}

async function saveCurrentQuiz(showMessage = true) {
  const error = validateQuiz();
  if (error) {
    toast(error, "error");
    return false;
  }
  try {
    let code = state.currentQuiz.id;
    const totalPoints = round1(state.questions.reduce((s, q) => s + (Number(q.points) || 0), 0));
    const selectedScaleId = $("quizGradeScale").value;
    const scaleChanged = selectedScaleId !== state.currentQuiz.gradeScaleId;
    const scaleSnapshot = scaleChanged ? getScaleById(selectedScaleId) : deepClone(getQuizScale(state.currentQuiz));
    const patch = {
      title: $("quizTitle").value.trim(),
      subject: $("quizSubject").value.trim(),
      grade: $("quizGrade").value.trim(),
      description: $("quizDescription").value.trim(),
      gradeScaleId: selectedScaleId,
      gradeScaleSnapshot: scaleSnapshot,
      resultMode: $("quizResultMode").value,
      showSolutions: $("quizShowSolutions").checked,
      timeLimitMinutes: $("quizUseTimeLimit").checked ? Number($("quizTimeLimitMinutes").value) : null,
      startMode: $("quizStartMode").value === "teacher" ? "teacher" : "student",
      shuffleQuestions: $("quizShuffleQuestions").checked,
      shuffleAnswers: $("quizShuffleAnswers").checked,
      questionCount: state.questions.length,
      totalPoints,
      updatedAt: serverTimestamp()
    };
    if (!state.newManualQuiz && state.currentQuiz.published && !state.currentQuiz.ended && patch.startMode !== state.currentQuiz.startMode) {
      patch.sessionState = patch.startMode === "teacher" ? "waiting" : "open";
      patch.sessionRunId = patch.startMode === "teacher" ? randomId("run") : null;
      patch.sessionStartedAt = null;
    }
    if (state.newManualQuiz) {
      const created = await createQuizDocument(patch);
      code = created.code;
      state.currentQuiz = { ...created.quiz, ...patch, id: code };
      state.newManualQuiz = false;
    } else await updateDoc(doc(db, "quizzes", code), patch);

    const currentIds = new Set();
    for (let i = 0; i < state.questions.length; i += 1) {
      const q = state.questions[i];
      q.position = i + 1;
      currentIds.add(q.id);
      await setDoc(doc(db, "quizzes", code, "questions", q.id), {
        ...sanitizeQuestionForSave(q),
        position: q.position,
        updatedAt: serverTimestamp()
      });
    }
    for (const oldId of state.loadedQuestionIds) {
      if (!currentIds.has(oldId)) await deleteDoc(doc(db, "quizzes", code, "questions", oldId));
    }
    state.loadedQuestionIds = currentIds;
    state.currentQuiz = { ...state.currentQuiz, ...patch };
    $("editorHeading").textContent = patch.title;
    markSaved();
    if (showMessage) toast("Test gespeichert.");
    return true;
  } catch (err) {
    console.error(err);
    toast("Speichern fehlgeschlagen.", "error");
    return false;
  }
}

async function publishCurrentQuiz() {
  if (state.currentQuiz?.rightsHold) return toast("Dieser Test ist wegen eines Rechtehinweises vorübergehend gesperrt.", "error");
  if (!(await saveCurrentQuiz(false))) return;
  if (state.currentQuiz.published && !state.currentQuiz.ended) {
    showPublish(state.currentQuiz.id);
    return;
  }
  try {
    const teacherMode = state.currentQuiz.startMode === "teacher";
    const runId = teacherMode ? randomId("run") : null;
    await updateDoc(doc(db, "quizzes", state.currentQuiz.id), {
      published: true,
      ended: false,
      sessionState: teacherMode ? "waiting" : "open",
      sessionRunId: runId,
      sessionStartedAt: null,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    state.currentQuiz.published = true;
    state.currentQuiz.ended = false;
    state.currentQuiz.sessionState = teacherMode ? "waiting" : "open";
    state.currentQuiz.sessionRunId = runId;
    state.currentQuiz.sessionStartedAt = null;
    updateSummary();
    updateEditorPublishControls();
    toast("Test veröffentlicht.");
    showPublish(state.currentQuiz.id);
  } catch (err) {
    console.error(err);
    toast("Veröffentlichen fehlgeschlagen.", "error");
  }
}

// ---------- Teilen / QR ----------
$("backFromPublish").addEventListener("click", () => openEditor(state.currentQuiz?.id || $("publishedCode").textContent));
$("copyCodeBtn").addEventListener("click", () => copyText($("publishedCode").textContent, "Testcode kopiert."));
$("copyLinkBtn").addEventListener("click", () => copyText($("publishedLink").value, "Link kopiert."));

async function copyText(text, message) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    prompt("Kopieren:", text);  }
}

async function showPublish(code) {
  try {
    clearPublishSubscriptions();
    const snap = await getDoc(doc(db, "quizzes", code));
    if (!snap.exists()) return;
    state.currentQuiz = { id: code, ...snap.data() };
    const link = baseStudentUrl(code);
    $("publishedCode").textContent = code;
    $("publishedLink").value = link;
    showView("publishView");
    const qr = $("qrcode");
    qr.innerHTML = "";
    if (window.QRCode) new window.QRCode(qr, { text: link, width: 190, height: 190, correctLevel: window.QRCode.CorrectLevel.M });
    else qr.textContent = "QR-Code-Bibliothek konnte nicht geladen werden.";
    setupTeacherLivePanel(code);
  } catch (err) {
    console.error(err);
    toast("Freigabe konnte nicht geladen werden.", "error");
  }
}

function setupTeacherLivePanel(code) {
  clearPublishSubscriptions();
  const panel = $("teacherLivePanel");
  if (!panel) return;
  let liveQuiz = state.currentQuiz;
  let attempts = [];
  let submissions = [];
  const render = () => renderTeacherLivePanel(liveQuiz, attempts, submissions);

  state.publishUnsubs.push(onSnapshot(doc(db, "quizzes", code), (snap) => {
    if (!snap.exists()) return;
    liveQuiz = { id: code, ...snap.data() };
    state.currentQuiz = liveQuiz;
    render();
  }, (err) => console.warn("Live-Teststatus:", err)));

  state.publishUnsubs.push(onSnapshot(collection(db, "quizzes", code, "attempts"), (snap) => {
    attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => console.warn("Warteraum:", err)));

  state.publishUnsubs.push(onSnapshot(collection(db, "quizzes", code, "submissions"), (snap) => {
    submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => console.warn("Live-Abgaben:", err)));
  render();
}

function renderTeacherLivePanel(quiz, attempts, submissions) {
  const panel = $("teacherLivePanel");
  if (!panel || !quiz) return;
  if (state.publishClockInterval) clearInterval(state.publishClockInterval);
  state.publishClockInterval = null;

  const runId = quiz.sessionRunId || "";
  const runAttempts = attempts.filter((a) => !runId || a.sessionRunId === runId);
  const runSubmissions = submissions.filter((a) => !runId || a.sessionRunId === runId);
  const startMode = quiz.startMode === "teacher" ? "teacher" : "student";
  const minutes = Number(quiz.timeLimitMinutes) > 0 ? Number(quiz.timeLimitMinutes) : 0;

  if (quiz.ended) {
    panel.innerHTML = `<div class="liveStatusRow"><div class="liveIcon muted">■</div><div><span class="eyebrow">Test beendet</span><h3>Der Schülerzugang ist geschlossen</h3><p>Alle bisherigen Ergebnisse bleiben erhalten.</p></div></div>`;
    return;
  }

  if (startMode !== "teacher") {
    panel.innerHTML = `<div class="liveStatusRow"><div class="liveIcon">▶</div><div><span class="eyebrow">Startmodus</span><h3>Schüler starten selbst</h3><p>${minutes ? `Jeder Schüler startet seinen eigenen ${minutes}-Minuten-Countdown.` : "Die Aufgaben sind nach Eingabe des Namens direkt verfügbar."}</p></div></div>`;
    return;
  }

  if (quiz.sessionState === "running") {
    panel.innerHTML = `
      <div class="liveStatusRow running"><div class="livePulse"></div><div class="liveGrow"><span class="eyebrow">Live im Unterricht</span><h3>Test läuft</h3><p><strong>${runAttempts.length}</strong> beigetreten · <strong>${runSubmissions.length}</strong> abgegeben</p></div>
      <div class="liveClock"><small>${minutes ? "Verbleibend" : "Läuft seit"}</small><strong id="teacherSessionClock">--:--</strong></div></div>
      <div class="liveActions"><button id="liveResultsBtn" class="button secondary" type="button">Ergebnisse ansehen</button><button id="liveEndBtn" class="button danger" type="button">Test beenden</button></div>`;
    $("liveResultsBtn")?.addEventListener("click", () => openResults(quiz.id));
    $("liveEndBtn")?.addEventListener("click", () => endQuiz(quiz.id));
    const tick = () => updateTeacherSessionClock(quiz);
    tick();
    state.publishClockInterval = setInterval(tick, 1000);
    return;
  }

  panel.innerHTML = `
    <div class="liveStatusRow waiting"><div class="liveIcon waiting">⌛</div><div class="liveGrow"><span class="eyebrow">Warteraum</span><h3>${runAttempts.length} ${runAttempts.length === 1 ? "Schüler ist" : "Schüler sind"} bereit</h3><p>Die Aufgaben bleiben verborgen, bis du den Test für alle startest.${minutes ? ` Dann laufen für alle gleichzeitig ${minutes} Minuten.` : ""}</p></div></div>
    <div class="liveActions"><button id="liveStartBtn" class="button primary bigAction" type="button">Test für alle starten</button><button id="liveRefreshResultsBtn" class="button ghost" type="button">Ergebnisse</button></div>`;
  $("liveStartBtn")?.addEventListener("click", () => startTeacherSession(quiz.id, runAttempts.length));
  $("liveRefreshResultsBtn")?.addEventListener("click", () => openResults(quiz.id));
}

function updateTeacherSessionClock(quiz) {
  const el = $("teacherSessionClock");
  if (!el) return;
  const started = toMillis(quiz.sessionStartedAt);
  if (!started) {
    el.textContent = "00:00";
    return;
  }
  const elapsed = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const minutes = Number(quiz.timeLimitMinutes) > 0 ? Number(quiz.timeLimitMinutes) : 0;
  const seconds = minutes ? Math.max(0, Math.round(minutes * 60) - elapsed) : elapsed;
  el.textContent = formatDuration(seconds);
  el.classList.toggle("clockWarning", Boolean(minutes && seconds <= 60));
}

async function startTeacherSession(code, readyCount = 0) {
  const message = readyCount
    ? `${readyCount} ${readyCount === 1 ? "Schüler ist" : "Schüler sind"} bereit. Test jetzt für alle starten?`
    : "Noch niemand ist im Warteraum. Test trotzdem starten?";
  if (!confirm(message)) return;
  try {
    await updateDoc(doc(db, "quizzes", code), {
      sessionState: "running",
      sessionStartedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    toast("Test für alle gestartet.");
  } catch (err) {
    console.error(err);
    toast("Der Test konnte nicht gestartet werden.", "error");
  }
}

// ---------- Schüleransicht ----------
async function loadStudentQuiz(code) {
  clearStudentSubscriptions();
  showView("studentView");
  $("studentQuizCard").innerHTML = `<div id="studentLoading" class="studentLoadingCard"><span class="loadingDot"></span><div><strong>Test wird geladen …</strong><small>Einen Moment bitte.</small></div></div>`;
  try {
    const quizSnap = await getDoc(doc(db, "quizzes", code));
    if (!quizSnap.exists()) throw new Error("Dieser Test existiert nicht.");
    const quiz = { id: code, ...quizSnap.data() };
    const preview = new URLSearchParams(location.search).get("preview") === "1";
    const ownerPreview = preview && state.user && quiz.ownerId === state.user.uid;
    if (quiz.ended && !ownerPreview) throw new Error("Dieser Test wurde beendet.");
    if (!quiz.published && !ownerPreview) throw new Error("Dieser Test ist noch nicht veröffentlicht.");
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    const sourceQuestions = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    const questions = prepareStudentQuestions(quiz, sourceQuestions, ownerPreview);
    renderStudentQuiz(quiz, questions, { ownerPreview });
  } catch (err) {
    console.error(err);
    $("studentQuizCard").innerHTML = `<div class="studentUnavailable"><span class="studentUnavailableIcon">!</span><h1>Test nicht verfügbar</h1><p>${escapeHtml(err.message)}</p><a class="button primary" href="${escapeHtml(location.pathname)}">Zur Startseite</a></div>`;
  }
}

function hashString(value) {
  let h = 2166136261;
  for (const ch of String(value)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getStudentShuffleSeed(quizId) {
  const key = `lernplattform_seed_${quizId}`;
  let seed = sessionStorage.getItem(key);
  if (!seed) {
    seed = `${Date.now()}_${Math.random()}_${crypto.randomUUID?.() || ""}`;
    sessionStorage.setItem(key, seed);
  }
  return seed;
}

function seededShuffle(array, seedText) {
  const copy = [...array];
  let seed = hashString(seedText) || 1;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareStudentQuestions(quiz, questions, ownerPreview = false) {
  if (!quiz.shuffleQuestions || ownerPreview) return questions;
  return seededShuffle(questions, `${getStudentShuffleSeed(quiz.id)}:questions`);
}

function studentOptionEntries(quiz, q, ownerPreview = false) {
  const entries = (q.options || []).map((option, originalIndex) => ({ option, originalIndex }));
  if (!quiz.shuffleAnswers || ownerPreview) return entries;
  return seededShuffle(entries, `${getStudentShuffleSeed(quiz.id)}:answers:${q.id}`);
}

function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderGapfillStudent(section, q) {
  const wrap = document.createElement("div");
  wrap.className = "gapSentence";
  let last = 0;
  let gapIndex = 0;
  const regex = /\[([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(q.text))) {
    wrap.appendChild(document.createTextNode(q.text.slice(last, match.index)));
    const input = document.createElement("input");
    input.className = "inlineGap";
    input.dataset.gapIndex = String(gapIndex++);
    input.type = "text";
    input.placeholder = "…";
    wrap.appendChild(input);
    last = match.index + match[0].length;
  }
  wrap.appendChild(document.createTextNode(q.text.slice(last)));
  section.appendChild(wrap);
}

function makeDragItem(text, key) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "dragItem";
  item.draggable = true;
  item.dataset.key = String(key);
  item.textContent = text;
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", String(key));
    item.classList.add("dragging");
  });
  item.addEventListener("dragend", () => item.classList.remove("dragging"));
  return item;
}

function setupMoveableBank(container) {
  let selected = null;
  const items = () => Array.from(container.querySelectorAll(".dragItem"));
  const zones = () => Array.from(container.querySelectorAll(".dropZone, .dragBank"));

  items().forEach((item) => {
    item.addEventListener("click", () => {
      items().forEach((x) => x.classList.remove("selectedDrag"));
      if (selected === item) {
        selected = null;
        return;
      }
      selected = item;
      item.classList.add("selectedDrag");
    });
  });

  zones().forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const key = e.dataTransfer.getData("text/plain");
      const item = container.querySelector(`.dragItem[data-key="${CSS.escape(key)}"]`);
      if (item) moveItemToZone(item, zone, container);
    });
    zone.addEventListener("click", (e) => {
      if (e.target.closest(".dragItem")) return;
      if (selected) {
        moveItemToZone(selected, zone, container);
        selected.classList.remove("selectedDrag");
        selected = null;
      }
    });
  });
}

function moveItemToZone(item, zone, container) {
  if (zone.classList.contains("singleDrop") && zone.querySelector(".dragItem")) {
    const existing = zone.querySelector(".dragItem");
    container.querySelector(".dragBank")?.appendChild(existing);
  }
  zone.appendChild(item);
}

function renderMatchingStudent(section, q) {
  const root = document.createElement("div");
  root.className = "interactionBox matchingBox";
  const bank = document.createElement("div");
  bank.className = "dragBank";
  bank.innerHTML = `<span class="dropHint">Zuordnungen</span>`;
  shuffled(q.pairs.map((p, idx) => ({ ...p, idx }))).forEach((p) => bank.appendChild(makeDragItem(p.right, p.idx)));
  root.appendChild(bank);
  q.pairs.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "matchRow";
    row.innerHTML = `<div class="matchLeft">${escapeHtml(p.left)}</div><div class="dropZone singleDrop" data-slot="${idx}"><span class="dropHint">hier ablegen</span></div>`;
    root.appendChild(row);
  });
  section.appendChild(root);
  setupMoveableBank(root);
}

function renderOrderingStudent(section, q) {
  const list = document.createElement("div");
  list.className = "sortableList";
  shuffled(q.items.map((text, idx) => ({ text, idx }))).forEach(({ text, idx }) => {
    const row = document.createElement("div");
    row.className = "sortItem";
    row.draggable = true;
    row.dataset.key = String(idx);
    row.innerHTML = `<span class="sortGrip">⋮⋮</span><span class="sortText">${escapeHtml(text)}</span><div class="sortButtons"><button type="button" class="iconButton up">↑</button><button type="button" class="iconButton down">↓</button></div>`;
    row.querySelector(".up").addEventListener("click", () => {
      const prev = row.previousElementSibling;
      if (prev) list.insertBefore(row, prev);
    });
    row.querySelector(".down").addEventListener("click", () => {
      const next = row.nextElementSibling;
      if (next) list.insertBefore(next, row);
    });
    row.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", row.dataset.key);
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    list.appendChild(row);
  });
  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = list.querySelector(".dragging");
    if (!dragging) return;
    const others = [...list.querySelectorAll(".sortItem:not(.dragging)")];
    const target = others.find((el) => e.clientY <= el.getBoundingClientRect().top + el.offsetHeight / 2);
    if (target) list.insertBefore(dragging, target);
    else list.appendChild(dragging);
  });
  section.appendChild(list);
}

function renderGroupingStudent(section, q) {
  const root = document.createElement("div");
  root.className = "interactionBox groupingBox";
  const bank = document.createElement("div");
  bank.className = "dragBank";
  bank.innerHTML = `<span class="dropHint">Elemente</span>`;
  const items = [];
  q.groups.forEach((g, gi) => (g.items || []).forEach((text, ii) => items.push({ text, key: `g${gi}_i${ii}` })));
  shuffled(items).forEach((item) => bank.appendChild(makeDragItem(item.text, item.key)));
  root.appendChild(bank);
  const grid = document.createElement("div");
  grid.className = "groupDropGrid";
  q.groups.forEach((g, gi) => {
    const zone = document.createElement("div");
    zone.className = "dropZone groupDrop";
    zone.dataset.group = String(gi);
    zone.innerHTML = `<strong>${escapeHtml(g.name)}</strong><span class="dropHint">hier ablegen</span>`;
    grid.appendChild(zone);
  });
  root.appendChild(grid);
  section.appendChild(root);
  setupMoveableBank(root);
}

function renderMarkwordsStudent(section, q) {
  const wrap = document.createElement("div");
  wrap.className = "markWordsBox";
  tokenizeWords(q.passage).forEach((token) => {
    if (!token.isWord) {
      wrap.appendChild(document.createTextNode(token.text));
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wordToken";
    btn.dataset.wordIndex = String(token.wordIndex);
    btn.textContent = token.text;
    btn.addEventListener("click", () => btn.classList.toggle("marked"));
    wrap.appendChild(btn);
  });
  section.appendChild(wrap);
}

function studentTimerKey(quizId) {
  return `lernplattform_timer_${quizId}`;
}

function readStoredTimer(quizId) {
  try {
    const value = JSON.parse(localStorage.getItem(studentTimerKey(quizId)) || "null");
    return value && (value.attemptId || Number(value.startedAt) > 0) ? value : null;
  } catch {
    return null;
  }
}

function saveStoredTimer(quizId, value) {
  localStorage.setItem(studentTimerKey(quizId), JSON.stringify(value));
}

async function resolveStudentAttempt(quiz, name) {
  const stored = readStoredTimer(quiz.id);
  if (stored?.attemptId) {
    try {
      const snap = await getDoc(doc(db, "quizzes", quiz.id, "attempts", stored.attemptId));
      if (snap.exists()) {
        const data = snap.data();
        const startedAt = toMillis(data.startedAt) || Number(stored.startedAt) || 0;
        if (startedAt) {
          const attempt = {
            attemptId: stored.attemptId,
            startedAt,
            name: data.studentName || stored.name || name,
            timeLimitMinutes: Number(data.timeLimitMinutes || quiz.timeLimitMinutes),
            sessionRunId: data.sessionRunId || quiz.sessionRunId || null,
            mode: data.mode || "student"
          };
          saveStoredTimer(quiz.id, attempt);
          state.studentAttempt = attempt;
          return attempt;
        }
      }
    } catch (err) {
      console.warn("Gespeicherter Zeitversuch konnte nicht geladen werden:", err);
    }
  }

  if (stored?.startedAt && !stored?.attemptId) {
    const attempt = {
      attemptId: null,
      startedAt: Number(stored.startedAt),
      name: stored.name || name,
      timeLimitMinutes: Number(quiz.timeLimitMinutes),
      sessionRunId: quiz.sessionRunId || null,
      mode: "student"
    };
    state.studentAttempt = attempt;
    return attempt;
  }

  const attemptId = randomId("attempt");
  const ref = doc(db, "quizzes", quiz.id, "attempts", attemptId);
  await setDoc(ref, {
    studentName: name,
    mode: "student",
    status: "running",
    timeLimitMinutes: Math.round(Number(quiz.timeLimitMinutes)),
    sessionRunId: quiz.sessionRunId || null,
    joinedAt: serverTimestamp(),
    startedAt: serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  });
  const snap = await getDoc(ref);
  const startedAt = toMillis(snap.data()?.startedAt) || Date.now();
  const attempt = {
    attemptId,
    startedAt,
    name,
    timeLimitMinutes: Math.round(Number(quiz.timeLimitMinutes)),
    sessionRunId: quiz.sessionRunId || null,
    mode: "student"
  };
  saveStoredTimer(quiz.id, attempt);
  state.studentAttempt = attempt;
  return attempt;
}

async function joinTeacherSession(quiz, name) {
  const stored = readStoredTimer(quiz.id);
  if (stored?.attemptId && stored.sessionRunId === quiz.sessionRunId) {
    try {
      const snap = await getDoc(doc(db, "quizzes", quiz.id, "attempts", stored.attemptId));
      if (snap.exists()) {
        const attempt = {
          attemptId: stored.attemptId,
          name: snap.data().studentName || stored.name || name,
          sessionRunId: quiz.sessionRunId || null,
          timeLimitMinutes: Number(quiz.timeLimitMinutes) > 0 ? Number(quiz.timeLimitMinutes) : null,
          mode: "teacher",
          startedAt: toMillis(quiz.sessionStartedAt) || null
        };
        saveStoredTimer(quiz.id, attempt);
        state.studentAttempt = attempt;
        return attempt;
      }
    } catch (err) {
      console.warn("Gespeicherter Warteraum-Eintrag konnte nicht geladen werden:", err);
    }
  }

  const attemptId = randomId("attempt");
  const ref = doc(db, "quizzes", quiz.id, "attempts", attemptId);
  await setDoc(ref, {
    studentName: name,
    mode: "teacher",
    status: quiz.sessionState === "running" ? "running" : "ready",
    timeLimitMinutes: Number(quiz.timeLimitMinutes) > 0 ? Math.round(Number(quiz.timeLimitMinutes)) : null,
    sessionRunId: quiz.sessionRunId || null,
    joinedAt: serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  });
  const attempt = {
    attemptId,
    name,
    sessionRunId: quiz.sessionRunId || null,
    timeLimitMinutes: Number(quiz.timeLimitMinutes) > 0 ? Number(quiz.timeLimitMinutes) : null,
    mode: "teacher",
    startedAt: toMillis(quiz.sessionStartedAt) || null
  };
  saveStoredTimer(quiz.id, attempt);
  state.studentAttempt = attempt;
  return attempt;
}

function stopStudentTimer() {
  if (state.studentTimerInterval) clearInterval(state.studentTimerInterval);
  state.studentTimerInterval = null;
}

function renderStudentQuiz(quiz, questions, { ownerPreview = false } = {}) {
  stopStudentTimer();
  clearStudentSubscriptions();
  const root = $("studentQuizCard");
  const minutes = Number(quiz.timeLimitMinutes) > 0 ? Math.round(Number(quiz.timeLimitMinutes)) : 0;
  const timed = minutes > 0 && !ownerPreview;
  const teacherControlled = quiz.startMode === "teacher" && !ownerPreview;
  const storedAttempt = !ownerPreview ? readStoredTimer(quiz.id) : null;
  const storedForRun = storedAttempt && (!teacherControlled || storedAttempt.sessionRunId === quiz.sessionRunId) ? storedAttempt : null;
  const selfTimedGate = timed && !teacherControlled;
  const gateRequired = teacherControlled || selfTimedGate;
  const timerMeta = minutes > 0
    ? `<span class="studentTimeInfo">⏱ ${minutes} Minuten${ownerPreview ? " · Vorschau ohne laufenden Timer" : teacherControlled ? " · gemeinsamer Start" : ""}</span>`
    : teacherControlled ? `<span class="studentTimeInfo">👩‍🏫 gemeinsamer Start</span>` : "";

  let gateHtml = "";
  if (teacherControlled) {
    const running = quiz.sessionState === "running";
    gateHtml = `<div id="studentStartGate" class="studentStartGate teacherGate">
      <div class="studentGateIcon">${running ? "▶" : "⌛"}</div>
      <div class="studentGateCopy"><strong>${running ? "Der Test läuft bereits" : storedForRun ? "Du bist im Warteraum" : "Gemeinsamer Start durch die Lehrkraft"}</strong>
      <p>${running ? "Du kannst jetzt noch beitreten. Bei einem Zeitlimit bekommst du nur die verbleibende Zeit." : storedForRun ? "Du bist bereit. Warte, bis deine Lehrkraft den Test für alle startet." : "Gib deinen Namen ein und melde dich als bereit. Die Aufgaben erscheinen erst nach dem Start durch die Lehrkraft."}</p></div>
      <button id="studentStartBtn" class="button primary" type="button">${running ? "Jetzt beitreten" : storedForRun ? "Bereit ✓" : "Ich bin bereit"}</button>
    </div>`;
  } else if (selfTimedGate) {
    gateHtml = `<div id="studentStartGate" class="studentStartGate"><div class="studentGateIcon">⏱</div><div class="studentGateCopy"><strong>${storedForRun ? "Laufenden Test fortsetzen" : `Zeitlimit: ${minutes} Minuten`}</strong><p>${storedForRun ? "Der Timer läuft seit deinem ersten Start weiter." : "Der Countdown beginnt erst, wenn du auf „Test starten“ klickst. Bei 00:00 werden deine aktuellen Antworten automatisch abgegeben."}</p></div><button id="studentStartBtn" class="button primary" type="button">${storedForRun ? "Test fortsetzen" : "Test starten"}</button></div>`;
  }

  root.innerHTML = `
    <div class="studentHead">
      <div class="studentHeadTop"><span class="eyebrow">${escapeHtml(quiz.subject || "Test")} · Klasse ${escapeHtml(quiz.grade || "–")}</span>${timerMeta}</div>
      <h1>${escapeHtml(quiz.title)}</h1>
      <p>${escapeHtml(quiz.description || "")}</p>
      <div class="studentMetaRow"><span>${questions.length} Aufgaben</span><span>${quiz.totalPoints || round1(questions.reduce((s, q) => s + Number(q.points || 0), 0))} Punkte</span><span>Code ${quiz.id}</span></div>
    </div>
    <form id="studentForm">
      <div class="studentIdentityCard"><label class="studentNameLabel">Dein Name oder Kürzel<input id="studentName" type="text" required placeholder="Vorname Nachname" value="${escapeHtml(storedForRun?.name || "")}"></label><small>Dein Name wird nur deiner Lehrkraft zusammen mit der Abgabe angezeigt.</small></div>
      ${gateHtml}
      <div id="studentTimerBar" class="studentTimerBar hidden"><span>Verbleibende Zeit</span><strong id="studentTimerText">${minutes ? `${String(minutes).padStart(2,"0")}:00` : ""}</strong></div>
      <div id="studentProgressBar" class="studentProgressWrap ${gateRequired ? "hidden" : ""}">
        <div class="studentProgressTop"><strong id="studentProgressText">0 von ${questions.length} bearbeitet</strong><span id="studentOpenCount">${questions.length} offen</span></div>
        <div class="studentProgressTrack"><span id="studentProgressFill"></span></div>
        <div id="studentQuestionNav" class="studentQuestionNav" aria-label="Aufgabennavigation"></div>
      </div>
      <div id="studentQuestions" class="${gateRequired ? "hidden" : ""}"></div>
      <div id="studentSubmitArea" class="studentSubmitArea ${gateRequired ? "hidden" : ""}"><div><strong>Fertig?</strong><small>Prüfe offene Aufgaben noch einmal, bevor du endgültig abgibst.</small></div><button id="studentSubmitBtn" class="button primary studentSubmit" type="submit">Antworten abgeben</button></div>
    </form>
    <div id="studentResult" class="studentResult hidden"></div>`;
  const qRoot = $("studentQuestions");

  questions.forEach((q, i) => {
    const section = document.createElement("section");
    section.className = "studentQuestion";
    section.dataset.qid = q.id;
    section.dataset.type = q.type;
    section.dataset.index = String(i);
    if (q.type !== "gapfill") section.innerHTML = `<div class="studentQuestionHead"><span class="studentQuestionNo">Aufgabe ${i + 1}</span><span class="studentPoints">${Number(q.points)} P.</span></div><h3>${escapeHtml(q.text)}</h3>`;
    else section.innerHTML = `<div class="studentQuestionHead"><span class="studentQuestionNo">Aufgabe ${i + 1}</span><span class="studentPoints">${Number(q.points)} P.</span></div><h3>Lückentext</h3>`;

    if (getQuestionImageSrc(q)) {
      const figure = document.createElement("figure");
      figure.className = "studentQuestionImage";
      figure.innerHTML = `<img src="${escapeHtml(getQuestionImageSrc(q))}" alt="${escapeHtml(q.imageAlt || "Abbildung zur Aufgabe")}">`;
      section.appendChild(figure);
    }

    if (q.type === "text") {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.name = q.id;
      inp.placeholder = "Antwort eingeben";
      section.appendChild(inp);
    } else if (q.type === "number") {
      const row = document.createElement("div");
      row.className = "numberStudentRow";
      row.innerHTML = `<input class="numberStudentInput" type="text" inputmode="decimal" placeholder="Ergebnis"><span>${escapeHtml(q.unit || "")}</span>`;
      section.appendChild(row);
    } else if (q.type === "dropdown") {
      const sel = document.createElement("select");
      sel.name = q.id;
      const entries = studentOptionEntries(quiz, q, ownerPreview);
      sel.innerHTML = `<option value="">Bitte auswählen …</option>` + entries.map(({ option, originalIndex }) => `<option value="${originalIndex}">${escapeHtml(option.text)}</option>`).join("");
      section.appendChild(sel);
    } else if (q.type === "single" || q.type === "multi") {
      const imageOnly = q.options?.length >= 2 && q.options.every(o => o.imageDataUrl) &&
        (q.imageChoicesOnly || q.options.every(o => /^Abbildung:\s*/i.test(o.imageAlt || "")));
      studentOptionEntries(quiz, q, ownerPreview).forEach(({ option, originalIndex }, shownIndex) => {
        const label = document.createElement("label");
        label.className = "choice";
        const text = imageOnly ? `Bild ${String.fromCharCode(65 + shownIndex)}` : option.text;
        const alt = imageOnly ? "" : option.imageAlt || `Abbildung: ${option.text}`;
        label.innerHTML = `<input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${q.id}" value="${originalIndex}">${option.imageDataUrl ? `<img class="choiceImage" src="${escapeHtml(option.imageDataUrl)}" alt="${escapeHtml(alt)}">` : ""}<span>${escapeHtml(text)}</span>`;
        section.appendChild(label);
      });
    } else if (q.type === "truefalse") {
      [true, false].forEach((value) => {
        const label = document.createElement("label");
        label.className = "choice";
        label.innerHTML = `<input type="radio" name="${q.id}" value="${value}"><span>${value ? "Richtig" : "Falsch"}</span>`;
        section.appendChild(label);
      });
    } else if (q.type === "gapfill") {
      renderGapfillStudent(section, q);
    } else if (q.type === "matching") {
      renderMatchingStudent(section, q);
    } else if (q.type === "ordering") {
      renderOrderingStudent(section, q);
    } else if (q.type === "grouping") {
      renderGroupingStudent(section, q);
    } else if (q.type === "markwords") {
      renderMarkwordsStudent(section, q);
    }

    qRoot.appendChild(section);
  });

  setupStudentProgress(questions);
  $("studentForm").addEventListener("submit", (e) => submitStudentQuiz(e, quiz, questions));
  $("studentName").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) return;
    e.preventDefault();
    if (!e.currentTarget.value.trim()) return toast("Bitte zuerst deinen Namen oder dein Kürzel eingeben.", "error");
    e.currentTarget.blur();
    const next = $("studentStartBtn") && !$("studentStartBtn").disabled
      ? $("studentStartBtn") : $("studentQuestions")?.querySelector("input, select, textarea, button");
    next?.focus();
    toast("Name übernommen. Abgabe erst über „Antworten abgeben“.");
  });

  if (teacherControlled) {
    const btn = $("studentStartBtn");
    if (storedForRun && quiz.sessionState !== "running") {
      $("studentName").readOnly = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Bereit ✓";
      }
      watchTeacherStart(quiz, questions, storedForRun);
    } else if (storedForRun && quiz.sessionState === "running") {
      $("studentName").readOnly = true;
      activateStudentTest(quiz, questions, storedForRun, { teacherControlled: true });
      watchTeacherStart(quiz, questions, storedForRun);
    } else {
      btn?.addEventListener("click", () => joinTeacherControlledQuiz(quiz, questions));
    }
  } else if (selfTimedGate) {
    $("studentStartBtn")?.addEventListener("click", () => startTimedStudentQuiz(quiz, questions));
  } else {
    $("studentTimerBar")?.classList.add("hidden");
    refreshStudentProgress(questions);
  }
}

async function joinTeacherControlledQuiz(quiz, questions) {
  const nameInput = $("studentName");
  const name = nameInput?.value.trim() || "";
  if (!name) {
    toast("Bitte zuerst deinen Namen oder dein Kürzel eingeben.", "error");
    nameInput?.focus();
    return;
  }
  const btn = $("studentStartBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Wird angemeldet …";
  }
  try {
    const latestSnap = await getDoc(doc(db, "quizzes", quiz.id));
    if (!latestSnap.exists()) throw new Error("Test nicht gefunden");
    const latestQuiz = { id: quiz.id, ...latestSnap.data() };
    if (latestQuiz.ended || !latestQuiz.published) throw new Error("Der Test ist nicht mehr geöffnet.");
    const attempt = await joinTeacherSession(latestQuiz, name);
    nameInput.value = attempt.name || name;
    nameInput.readOnly = true;
    if (latestQuiz.sessionState === "running") {
      activateStudentTest(latestQuiz, questions, attempt, { teacherControlled: true });
    } else {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Bereit ✓";
      }
      const copy = $("studentStartGate")?.querySelector(".studentGateCopy");
      if (copy) copy.innerHTML = `<strong>Du bist bereit</strong><p>Warte, bis deine Lehrkraft den Test für alle startet. Diese Seite aktualisiert sich automatisch.</p>`;
    }
    watchTeacherStart(latestQuiz, questions, attempt);
  } catch (err) {
    console.error(err);
    toast(err.message || "Der Warteraum konnte nicht geöffnet werden.", "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Ich bin bereit";
    }
  }
}

function watchTeacherStart(quiz, questions, attempt) {
  try { state.studentQuizUnsub?.(); } catch {}
  state.studentQuizUnsub = onSnapshot(doc(db, "quizzes", quiz.id), (snap) => {
    if (!snap.exists()) return;
    const liveQuiz = { id: quiz.id, ...snap.data() };
    if (liveQuiz.ended || !liveQuiz.published) {
      stopStudentTimer();
      const gate = $("studentStartGate");
      if (gate) gate.innerHTML = `<div class="studentGateIcon">■</div><div class="studentGateCopy"><strong>Der Test wurde beendet</strong><p>Bitte wende dich an deine Lehrkraft.</p></div>`;
      $("studentQuestions")?.classList.add("hidden");
      $("studentSubmitArea")?.classList.add("hidden");
      $("studentProgressBar")?.classList.add("hidden");
      return;
    }
    if (attempt.sessionRunId && liveQuiz.sessionRunId && attempt.sessionRunId !== liveQuiz.sessionRunId) {
      const gate = $("studentStartGate");
      if (gate) gate.innerHTML = `<div class="studentGateIcon">↻</div><div class="studentGateCopy"><strong>Eine neue Testrunde wurde vorbereitet</strong><p>Lade die Seite neu und melde dich erneut als bereit.</p></div><button class="button primary" type="button" onclick="location.reload()">Neu laden</button>`;
      return;
    }
    if (liveQuiz.sessionState === "running") {
      activateStudentTest(liveQuiz, questions, { ...attempt, startedAt: toMillis(liveQuiz.sessionStartedAt) || attempt.startedAt }, { teacherControlled: true });
    }
  }, (err) => console.warn("Live-Start konnte nicht beobachtet werden:", err));
}

function activateStudentTest(quiz, questions, attempt, { teacherControlled = false } = {}) {
  const gate = $("studentStartGate");
  if (gate?.dataset.activated === "1") return;
  const startedAt = Number(attempt?.startedAt || toMillis(quiz.sessionStartedAt) || 0);
  const minutes = Number(attempt?.timeLimitMinutes || quiz.timeLimitMinutes) > 0 ? Number(attempt?.timeLimitMinutes || quiz.timeLimitMinutes) : 0;
  state.studentAttempt = { ...(attempt || {}), startedAt: startedAt || null, timeLimitMinutes: minutes || null, sessionRunId: attempt?.sessionRunId || quiz.sessionRunId || null };
  if (state.studentAttempt.attemptId) saveStoredTimer(quiz.id, state.studentAttempt);
  if (teacherControlled && minutes && startedAt) {
    const remaining = Math.round(minutes * 60) - Math.floor((Date.now() - startedAt) / 1000);
    if (remaining <= 0) {
      if (gate) gate.innerHTML = `<div class="studentGateIcon">⌛</div><div class="studentGateCopy"><strong>Die Bearbeitungszeit ist abgelaufen</strong><p>Bitte wende dich an deine Lehrkraft.</p></div>`;
      return;
    }
  }
  if (gate) {
    gate.dataset.activated = "1";
    gate.classList.add("hidden");
  }
  $("studentQuestions")?.classList.remove("hidden");
  $("studentSubmitArea")?.classList.remove("hidden");
  $("studentProgressBar")?.classList.remove("hidden");
  if ($("studentName")) $("studentName").readOnly = true;
  if (minutes && startedAt) {
    $("studentTimerBar")?.classList.remove("hidden");
    runStudentTimer(quiz, questions, startedAt, minutes);
  } else {
    $("studentTimerBar")?.classList.add("hidden");
  }
  refreshStudentProgress(questions);
  setTimeout(() => $("studentProgressBar")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}

async function startTimedStudentQuiz(quiz, questions) {
  const nameInput = $("studentName");
  let name = nameInput.value.trim();
  if (!name) {
    toast("Bitte zuerst deinen Namen oder dein Kürzel eingeben.", "error");
    nameInput.focus();
    return;
  }
  const startBtn = $("studentStartBtn");
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = "Timer wird gestartet …";
  }
  try {
    const attempt = await resolveStudentAttempt(quiz, name);
    name = attempt.name || name;
    nameInput.value = name;
    nameInput.readOnly = true;
    activateStudentTest(quiz, questions, attempt);
  } catch (err) {
    console.error(err);
    toast("Der Timer konnte nicht gestartet werden. Bitte Seite neu laden und erneut versuchen.", "error");
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = readStoredTimer(quiz.id) ? "Test fortsetzen" : "Test starten";
    }
  }
}

function setupStudentProgress(questions) {
  const nav = $("studentQuestionNav");
  if (!nav) return;
  nav.innerHTML = questions.map((q, i) => `<button class="questionNavDot" type="button" data-qid="${escapeHtml(q.id)}" title="Aufgabe ${i + 1}">${i + 1}</button>`).join("");
  nav.querySelectorAll(".questionNavDot").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = document.querySelector(`.studentQuestion[data-qid="${CSS.escape(btn.dataset.qid)}"]`);
      section?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  const root = $("studentQuestions");
  const markTouched = (event) => {
    const section = event.target.closest?.(".studentQuestion");
    if (section) section.dataset.touched = "1";
    setTimeout(() => refreshStudentProgress(questions), 0);
  };
  root?.addEventListener("input", markTouched);
  root?.addEventListener("change", markTouched);
  root?.addEventListener("click", markTouched);
  state.studentProgressObserver = new MutationObserver(() => refreshStudentProgress(questions));
  if (root) state.studentProgressObserver.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
}

function studentAnswerIsComplete(q, given) {
  if (q.type === "text" || q.type === "number" || q.type === "dropdown" || q.type === "single" || q.type === "truefalse") return String(given ?? "").trim() !== "";
  if (q.type === "multi") return Array.isArray(given) && given.length > 0;
  if (q.type === "gapfill") return Array.isArray(given) && given.length > 0 && given.every((x) => String(x || "").trim() !== "");
  if (q.type === "matching") return Object.keys(given || {}).length === (q.pairs || []).length && Object.values(given || {}).every((x) => String(x) !== "");
  if (q.type === "grouping") {
    const expected = (q.groups || []).reduce((sum, g) => sum + (g.items || []).length, 0);
    return Object.keys(given || {}).length === expected;
  }
  if (q.type === "ordering") {
    const section = document.querySelector(`.studentQuestion[data-qid="${CSS.escape(q.id)}"]`);
    return section?.dataset.touched === "1" && Array.isArray(given) && given.length === (q.items || []).length;
  }
  if (q.type === "markwords") return Array.isArray(given) && given.length > 0;
  return false;
}

function getUnansweredQuestions(questions) {
  return questions.filter((q) => !studentAnswerIsComplete(q, readStudentAnswer(q)));
}

function refreshStudentProgress(questions) {
  if (!$("studentProgressBar") || $("studentProgressBar").classList.contains("hidden")) return;
  const unanswered = getUnansweredQuestions(questions);
  const done = questions.length - unanswered.length;
  const percent = questions.length ? Math.round((done / questions.length) * 100) : 0;
  if ($("studentProgressText")) $("studentProgressText").textContent = `${done} von ${questions.length} bearbeitet`;
  if ($("studentOpenCount")) $("studentOpenCount").textContent = unanswered.length ? `${unanswered.length} offen` : "Alles bearbeitet ✓";
  if ($("studentProgressFill")) $("studentProgressFill").style.width = `${percent}%`;
  questions.forEach((q) => {
    const btn = $("studentQuestionNav")?.querySelector(`[data-qid="${CSS.escape(q.id)}"]`);
    if (!btn) return;
    const complete = !unanswered.includes(q);
    btn.classList.toggle("complete", complete);
  });
}

function runStudentTimer(quiz, questions, startedAt, attemptLimitMinutes = null) {
  stopStudentTimer();
  const limitMinutes = Number(attemptLimitMinutes) > 0 ? Number(attemptLimitMinutes) : Number(quiz.timeLimitMinutes);
  const totalSeconds = Math.max(60, Math.round(limitMinutes * 60));
  let autoSubmitting = false;
  const tick = () => {
    const elapsed = Math.floor((Date.now() - Number(startedAt)) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsed);
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    if ($("studentTimerText")) $("studentTimerText").textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    $("studentTimerBar")?.classList.toggle("timerWarning", remaining <= 60);
    if (remaining <= 0 && !autoSubmitting) {
      autoSubmitting = true;
      stopStudentTimer();
      toast("Zeit abgelaufen – der Test wird automatisch abgegeben.");
      submitStudentQuiz(null, quiz, questions, { force: true, autoSubmitted: true, startedAt });
    }
  };
  tick();
  state.studentTimerInterval = window.setInterval(tick, 1000);
}

function readStudentAnswer(q) {
  const section = document.querySelector(`.studentQuestion[data-qid="${CSS.escape(q.id)}"]`);
  if (!section) return "";
  if (q.type === "multi") return Array.from(section.querySelectorAll(`input[name="${CSS.escape(q.id)}"]:checked`)).map((x) => x.value);
  if (["single", "truefalse"].includes(q.type)) return section.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`)?.value ?? "";
  if (["text", "dropdown"].includes(q.type)) return section.querySelector(`[name="${CSS.escape(q.id)}"]`)?.value ?? "";
  if (q.type === "number") return section.querySelector(".numberStudentInput")?.value ?? "";
  if (q.type === "gapfill") return Array.from(section.querySelectorAll(".inlineGap")).map((x) => x.value);
  if (q.type === "matching") {
    const out = {};
    section.querySelectorAll(".dropZone[data-slot]").forEach((zone) => {
      out[zone.dataset.slot] = zone.querySelector(".dragItem")?.dataset.key ?? "";
    });
    return out;
  }
  if (q.type === "ordering") return Array.from(section.querySelectorAll(".sortItem")).map((x) => x.dataset.key);
  if (q.type === "grouping") {
    const out = {};
    section.querySelectorAll(".groupDrop").forEach((zone) => {
      zone.querySelectorAll(".dragItem").forEach((item) => (out[item.dataset.key] = zone.dataset.group));
    });
    return out;
  }
  if (q.type === "markwords") return Array.from(section.querySelectorAll(".wordToken.marked")).map((x) => x.dataset.wordIndex);
  return "";
}

function evaluateAnswer(q, given) {
  const max = round1(Number(q.points) || 0);
  if (q.type === "text") {
    if (q.manualReview) return { awarded: 0, max, needsReview: true, correct: null };
    const ok = (q.acceptedAnswers || []).map(normalize).includes(normalize(given));
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (q.type === "number") {
    const value = Number(String(given || "").trim().replace(",", "."));
    const ok = Number.isFinite(value) && Math.abs(value - Number(q.numericAnswer)) <= Math.max(0, Number(q.tolerance) || 0) + 1e-9;
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (q.type === "truefalse") {
    const ok = String(given) === String(Boolean(q.correctBoolean));
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (q.type === "gapfill") {
    const gaps = parseGaps(q.text);
    const values = Array.isArray(given) ? given : [];
    let good = 0;
    gaps.forEach((gap, i) => {
      if (gap.answers.map(normalize).includes(normalize(values[i]))) good += 1;
    });
    const ratio = gaps.length ? good / gaps.length : 0;
    return { awarded: round1(ratio * max), max, needsReview: false, correct: good === gaps.length };
  }
  if (q.type === "matching") {
    const total = (q.pairs || []).length;
    let good = 0;
    for (let i = 0; i < total; i += 1) if (String(given?.[i] ?? "") === String(i)) good += 1;
    const ratio = total ? good / total : 0;
    return { awarded: round1(ratio * max), max, needsReview: false, correct: good === total };
  }
  if (q.type === "ordering") {
    const total = (q.items || []).length;
    const values = Array.isArray(given) ? given : [];
    let good = 0;
    for (let i = 0; i < total; i += 1) if (String(values[i]) === String(i)) good += 1;
    const ratio = total ? good / total : 0;
    return { awarded: round1(ratio * max), max, needsReview: false, correct: good === total };
  }
  if (q.type === "grouping") {
    let total = 0;
    let good = 0;
    (q.groups || []).forEach((g, gi) => (g.items || []).forEach((_, ii) => {
      total += 1;
      if (String(given?.[`g${gi}_i${ii}`] ?? "") === String(gi)) good += 1;
    }));
    const ratio = total ? good / total : 0;
    return { awarded: round1(ratio * max), max, needsReview: false, correct: good === total };
  }
  if (q.type === "markwords") {
    const correctIndexes = markwordCorrectIndexes(q);
    const selected = Array.isArray(given) ? given.map(String) : [];
    const good = selected.filter((v) => correctIndexes.includes(v)).length;
    const bad = selected.filter((v) => !correctIndexes.includes(v)).length;
    const ratio = Math.max(0, Math.min(1, (good - bad) / Math.max(1, correctIndexes.length)));
    return {
      awarded: round1(ratio * max),
      max,
      needsReview: false,
      correct: good === correctIndexes.length && bad === 0 && selected.length === correctIndexes.length
    };
  }

  const correctIndexes = (q.options || []).map((o, i) => (o.correct ? String(i) : null)).filter((v) => v !== null);
  if (q.type === "multi") {
    const selected = Array.isArray(given) ? given : [];
    const good = selected.filter((v) => correctIndexes.includes(String(v))).length;
    const bad = selected.filter((v) => !correctIndexes.includes(String(v))).length;
    const ratio = Math.max(0, Math.min(1, (good - bad) / Math.max(1, correctIndexes.length)));
    return { awarded: round1(ratio * max), max, needsReview: false, correct: good === correctIndexes.length && bad === 0 && selected.length === correctIndexes.length };
  }
  const ok = correctIndexes.includes(String(given));
  return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
}

async function submitStudentQuiz(e, quiz, questions, { force = false, autoSubmitted = false, startedAt = null } = {}) {
  e?.preventDefault?.();
  const name = $("studentName")?.value.trim() || readStoredTimer(quiz.id)?.name || "";
  if (!name) {
    toast("Bitte deinen Namen eingeben.", "error");
    return;
  }
  if (!force) {
    const unanswered = getUnansweredQuestions(questions);
    const message = unanswered.length
      ? `${unanswered.length} ${unanswered.length === 1 ? "Aufgabe ist" : "Aufgaben sind"} noch offen. Trotzdem endgültig abgeben?`
      : "Alles bearbeitet. Test jetzt endgültig abgeben?";
    if (!confirm(message)) return;
  }

  const answers = {};
  const grading = {};
  let points = 0;
  let maxPoints = 0;
  let needsReview = false;
  for (const q of questions) {
    const given = readStudentAnswer(q);
    answers[q.id] = given;
    const result = evaluateAnswer(q, given);
    grading[q.id] = {
      autoPoints: result.awarded,
      awardedPoints: result.awarded,
      maxPoints: result.max,
      needsReview: result.needsReview
    };    points += result.awarded;
    maxPoints += result.max;
    needsReview ||= result.needsReview;
  }
  points = round1(points);
  maxPoints = round1(maxPoints);
  const percent = maxPoints ? Math.round((points / maxPoints) * 100) : 0;
  const scale = deepClone(getQuizScale(quiz));
  const grade = needsReview ? null : gradeFromPercent(percent, scale);
  const storedTimer = readStoredTimer(quiz.id);
  const activeAttempt = state.studentAttempt?.startedAt ? state.studentAttempt : storedTimer;
  const effectiveStart = Number(startedAt || activeAttempt?.startedAt || 0) || null;
  const elapsedSeconds = effectiveStart ? Math.max(0, Math.round((Date.now() - effectiveStart) / 1000)) : null;

  try {
    stopStudentTimer();
    if ($("studentSubmitBtn")) {
      $("studentSubmitBtn").disabled = true;
      $("studentSubmitBtn").textContent = autoSubmitted ? "Zeit abgelaufen – wird gespeichert …" : "Wird gespeichert …";
    }
    await addDoc(collection(db, "quizzes", quiz.id, "submissions"), {
      studentName: name,
      answers,
      grading,
      autoPoints: points,
      totalPoints: points,
      maxPoints,
      percent,
      grade,
      gradeScaleSnapshot: scale,
      status: needsReview ? "review" : "graded",
      timeLimitMinutes: Number(activeAttempt?.timeLimitMinutes || quiz.timeLimitMinutes) > 0 ? Number(activeAttempt?.timeLimitMinutes || quiz.timeLimitMinutes) : null,
      attemptId: activeAttempt?.attemptId || null,
      sessionRunId: activeAttempt?.sessionRunId || quiz.sessionRunId || null,
      startMode: quiz.startMode === "teacher" ? "teacher" : "student",
      startedAtServerMillis: effectiveStart,
      startedAtLocal: effectiveStart ? new Date(effectiveStart).toISOString() : null,
      elapsedSeconds,
      autoSubmitted: Boolean(autoSubmitted),
      submittedAt: serverTimestamp(),
      submittedAtLocal: new Date().toISOString()
    });
    localStorage.removeItem(studentTimerKey(quiz.id));
    state.studentAttempt = null;
    clearStudentSubscriptions();
    renderStudentResult(quiz, questions, answers, grading, points, maxPoints, percent, needsReview);
    toast(autoSubmitted ? "Zeit abgelaufen. Deine Abgabe wurde gespeichert." : "Abgabe erfolgreich gespeichert.");
  } catch (err) {
    console.error(err);
    toast("Abgabe konnte nicht gespeichert werden.", "error");
    if ($("studentSubmitBtn")) {
      $("studentSubmitBtn").disabled = false;
      $("studentSubmitBtn").textContent = "Antworten abgeben";
    }
    if (Number(quiz.timeLimitMinutes) > 0 && effectiveStart && !autoSubmitted) runStudentTimer(quiz, questions, effectiveStart, activeAttempt?.timeLimitMinutes);
  }
}

function answerDisplay(q, given) {
  if (q.type === "text") return String(given || "(leer)");
  if (q.type === "number") return given === "" ? "(leer)" : `${given}${q.unit ? ` ${q.unit}` : ""}`;
  if (q.type === "truefalse") return given === "true" ? "Richtig" : given === "false" ? "Falsch" : "(leer)";
  if (q.type === "gapfill") return Array.isArray(given) ? given.map((x, i) => `Lücke ${i + 1}: ${x || "(leer)"}`).join("; ") : "(leer)";
  if (q.type === "matching") {
    return (q.pairs || []).map((p, i) => {
      const selected = q.pairs?.[Number(given?.[i])]?.right || "(leer)";
      return `${p.left} → ${selected}`;
    }).join("; ");
  }
  if (q.type === "ordering") return (Array.isArray(given) ? given : []).map((v) => q.items?.[Number(v)]).filter(Boolean).join(" → ") || "(leer)";
  if (q.type === "grouping") {
    return (q.groups || []).map((g, gi) => {
      const selected = [];
      (q.groups || []).forEach((source, sgi) => (source.items || []).forEach((text, ii) => {
        if (String(given?.[`g${sgi}_i${ii}`] ?? "") === String(gi)) selected.push(text);
      }));
      return `${g.name}: ${selected.join(", ") || "–"}`;
    }).join("; ");
  }
  if (q.type === "markwords") {
    const wanted = new Set((given || []).map(String));
    return tokenizeWords(q.passage).filter((t) => t.isWord && wanted.has(String(t.wordIndex))).map((t) => t.text).join(", ") || "(leer)";
  }
  if (q.type === "multi") return (given || []).map((v) => q.options?.[Number(v)]?.text).filter(Boolean).join(", ") || "(leer)";
  if (given === "" || given === null || given === undefined) return "(leer)";
  return q.options?.[Number(given)]?.text || "(leer)";
}

function correctDisplay(q) {
  if (q.type === "text") return q.manualReview ? "wird von der Lehrkraft geprüft" : (q.acceptedAnswers || []).join(", ");
  if (q.type === "number") return `${q.numericAnswer}${q.unit ? ` ${q.unit}` : ""}${Number(q.tolerance) ? ` (±${q.tolerance})` : ""}`;
  if (q.type === "truefalse") return q.correctBoolean ? "Richtig" : "Falsch";
  if (q.type === "gapfill") return parseGaps(q.text).map((g, i) => `Lücke ${i + 1}: ${g.answers.join(" / ")}`).join("; ");
  if (q.type === "matching") return (q.pairs || []).map((p) => `${p.left} → ${p.right}`).join("; ");
  if (q.type === "ordering") return (q.items || []).join(" → ");
  if (q.type === "grouping") return (q.groups || []).map((g) => `${g.name}: ${(g.items || []).join(", ")}`).join("; ");
  if (q.type === "markwords") return tokenizeWords(q.passage).filter((t) => t.isWord && markwordCorrectIndexes(q).includes(String(t.wordIndex))).map((t) => t.text).join(", ");
  return (q.options || []).filter((o) => o.correct).map((o) => o.text).join(", ");
}

function renderStudentResult(quiz, questions, answers, grading, points, maxPoints, percent, needsReview) {
  $("studentForm").classList.add("hidden");
  const box = $("studentResult");
  box.classList.remove("hidden");
  const mode = quiz.resultMode || "points_grade";
  const showSolutions = Boolean(quiz.showSolutions);
  const scale = getQuizScale(quiz);

  let summary = `<h2>Abgabe gespeichert ✓</h2>`;
  if (mode === "none") {
    summary += `<p>Deine Antworten wurden erfolgreich gespeichert.</p>`;
  } else {
    summary += `<div class="scoreBig">${round1(points)}/${round1(maxPoints)} Punkte</div>`;
    if (mode === "points_percent" || mode === "points_grade") summary += `<p>${percent}%${needsReview ? " · vorläufiges Ergebnis" : ""}</p>`;
    if (mode === "points_grade" && !needsReview) summary += `<p class="studentGrade">Note ${gradeFromPercent(percent, scale)}</p>`;
    if (needsReview) summary += `<p>Mindestens eine Antwort wird noch von der Lehrkraft geprüft.</p>`;
  }
  if (showSolutions && mode !== "none") summary += `<div id="studentResultDetails"></div>`;
  box.innerHTML = summary;

  const details = $("studentResultDetails");
  if (!details) return;
  questions.forEach((q, i) => {
    const g = grading[q.id];
    const div = document.createElement("div");
    div.className = "studentResultDetail";
    div.innerHTML = `<strong>${i + 1}. ${escapeHtml(q.type === "gapfill" ? "Lückentext" : q.text)}</strong><div>Deine Antwort: ${escapeHtml(answerDisplay(q, answers[q.id]))}</div><div>Lösung: ${escapeHtml(correctDisplay(q))}</div><div>Punkte: ${g.awardedPoints}/${g.maxPoints}${g.needsReview ? " · Prüfung ausstehend" : ""}</div>`;
    details.appendChild(div);
  });
}

// ---------- Ergebnisse / manuelle Bewertung ----------
$("refreshResultsBtn").addEventListener("click", () => state.currentResultsQuiz && openResults(state.currentResultsQuiz.id));
$("exportResultsBtn").addEventListener("click", exportResultsCsv);

async function openResults(code) {
  try {
    const quizSnap = await getDoc(doc(db, "quizzes", code));
    if (!quizSnap.exists()) throw new Error("Test nicht gefunden");
    const quiz = { id: code, ...quizSnap.data() };
    if (quiz.ownerId !== state.user.uid) throw new Error("Kein Zugriff");
    state.currentResultsQuiz = quiz;
    const qSnap = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    state.resultQuestions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const sSnap = await getDocs(collection(db, "quizzes", code, "submissions"));
    state.submissions = sSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => toMillis(b.submittedAt || b.submittedAtLocal) - toMillis(a.submittedAt || a.submittedAtLocal));
    $("resultsHeading").textContent = quiz.title;
    const timeMeta = Number(quiz.timeLimitMinutes) > 0 ? ` · Zeitlimit: ${Number(quiz.timeLimitMinutes)} Min.` : "";
    $("resultsMeta").textContent = `${state.submissions.length} Abgaben · ${quiz.totalPoints || 0} Punkte maximal · Notenschlüssel: ${getQuizScale(quiz).name || "Standard"}${timeMeta}`;
    showView("resultsView");
    renderResultsTable();
    $("reviewPanel").classList.add("hidden");
  } catch (err) {
    console.error(err);
    toast("Ergebnisse konnten nicht geladen werden.", "error");
  }
}

function submissionGrade(s) {
  if (s.status === "review") return "–";
  if (Number.isFinite(Number(s.grade)) && Number(s.grade) >= 1 && Number(s.grade) <= 6) return Number(s.grade);
  const scale = s.gradeScaleSnapshot?.thresholds?.length === 6 ? s.gradeScaleSnapshot : getQuizScale(state.currentResultsQuiz);
  return gradeFromPercent(Number(s.percent || 0), scale);
}

function renderResultsTable() {
  const wrap = $("resultsTableWrap");
  if (!state.submissions.length) {
    wrap.innerHTML = `<div class="empty"><h2>Noch keine Abgaben</h2><p>Sobald Schüler den Test abgeben, erscheinen die Ergebnisse hier.</p></div>`;
    return;
  }
  let html = `<table class="resultTable"><thead><tr><th>Name</th><th>Punkte</th><th>%</th><th>Note</th><th>Status</th><th>Dauer</th><th>Abgegeben</th><th></th></tr></thead><tbody>`;
  state.submissions.forEach((s) => {
    const duration = formatDuration(s.elapsedSeconds);
    const autoTag = s.autoSubmitted ? ` <span class="pill timedOut">Auto</span>` : "";
    html += `<tr><td><strong>${escapeHtml(s.studentName)}</strong></td><td>${escapeHtml(s.totalPoints)}/${escapeHtml(s.maxPoints)}</td><td>${escapeHtml(s.percent)}%</td><td>${submissionGrade(s)}</td><td><span class="pill ${s.status === "review" ? "review" : "graded"}">${s.status === "review" ? "Prüfen" : "Bewertet"}</span>${autoTag}</td><td>${escapeHtml(duration)}</td><td>${escapeHtml(fmtDate(s.submittedAt || s.submittedAtLocal))}</td><td><button class="button secondary reviewBtn" data-id="${s.id}">Bewerten</button></td></tr>`;
  });
  html += "</tbody></table>";
  wrap.innerHTML = html;
  wrap.querySelectorAll(".reviewBtn").forEach((btn) => btn.addEventListener("click", () => openReview(btn.dataset.id)));
}

function openReview(id) {
  const s = state.submissions.find((x) => x.id === id);
  if (!s) return;
  const panel = $("reviewPanel");
  panel.classList.remove("hidden");
  panel.innerHTML = `<div class="reviewHeader"><div><span class="eyebrow">Manuelle Bewertung</span><h2>${escapeHtml(s.studentName)}</h2><p>${escapeHtml(fmtDate(s.submittedAt || s.submittedAtLocal))}</p></div><button id="closeReview" class="button ghost">Schließen</button></div><div id="reviewQuestions"></div><div class="reviewHeader"><strong id="reviewTotal"></strong><button id="saveReview" class="button primary">Bewertung speichern</button></div>`;
  const root = $("reviewQuestions");
  state.resultQuestions.forEach((q, i) => {
    const g = s.grading?.[q.id] || { awardedPoints: 0, maxPoints: Number(q.points) || 0 };
    const div = document.createElement("div");
    div.className = "reviewQuestion";
    div.innerHTML = `<strong>${i + 1}. ${escapeHtml(q.type === "gapfill" ? "Lückentext" : q.text)}</strong><div class="meta">Antwort: ${escapeHtml(answerDisplay(q, s.answers?.[q.id]))}</div><div class="meta">Lösung: ${escapeHtml(correctDisplay(q))}</div><div class="reviewPoints"><label>Punkte:</label><input class="manualPoints" data-qid="${q.id}" type="number" min="0" max="${Number(q.points)}" step="0.5" value="${round1(Number(g.awardedPoints ?? g.autoPoints ?? 0))}"><span>/ ${Number(q.points)}</span></div>`;
    root.appendChild(div);
  });

  const recompute = () => {
    const pts = Array.from(panel.querySelectorAll(".manualPoints")).reduce((sum, x) => {
      const q = state.resultQuestions.find((item) => item.id === x.dataset.qid);
      const max = Number(q?.points || 0);
      return sum + Math.max(0, Math.min(max, round1(Number(x.value) || 0)));
    }, 0);
    const max = state.resultQuestions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    const pc = max ? Math.round((pts / max) * 100) : 0;
    const scale = s.gradeScaleSnapshot?.thresholds?.length === 6 ? s.gradeScaleSnapshot : getQuizScale(state.currentResultsQuiz);
    $("reviewTotal").textContent = `${round1(pts)}/${round1(max)} Punkte · ${pc}% · Note ${gradeFromPercent(pc, scale)}`;
  };
  panel.querySelectorAll(".manualPoints").forEach((x) => {
    x.addEventListener("input", recompute);
    x.addEventListener("change", () => {
      const q = state.resultQuestions.find((item) => item.id === x.dataset.qid);
      const max = round1(Number(q?.points || 0));
      x.value = Math.max(0, Math.min(max, round1(Number(x.value) || 0)));
      recompute();
    });
  });
  recompute();
  $("closeReview").addEventListener("click", () => panel.classList.add("hidden"));
  $("saveReview").addEventListener("click", () => saveReview(s.id));
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveReview(submissionId) {
  const panel = $("reviewPanel");
  const submission = state.submissions.find((x) => x.id === submissionId);
  if (!submission) return;
  const grading = { ...(submission.grading || {}) };
  let total = 0;
  let max = 0;
  panel.querySelectorAll(".manualPoints").forEach((inp) => {
    const q = state.resultQuestions.find((x) => x.id === inp.dataset.qid);
    const qMax = Number(q?.points || 0);
    const awarded = Math.max(0, Math.min(qMax, round1(Number(inp.value) || 0)));
    grading[inp.dataset.qid] = {
      ...(grading[inp.dataset.qid] || {}),
      awardedPoints: round1(awarded),
      maxPoints: qMax,
      needsReview: false
    };
    total += awarded;
    max += qMax;
  });
  total = round1(total);
  max = round1(max);
  const percent = max ? Math.round((total / max) * 100) : 0;
  const scale = submission.gradeScaleSnapshot?.thresholds?.length === 6 ? submission.gradeScaleSnapshot : getQuizScale(state.currentResultsQuiz);
  const grade = gradeFromPercent(percent, scale);
  try {
    await updateDoc(doc(db, "quizzes", state.currentResultsQuiz.id, "submissions", submissionId), {
      grading,
      totalPoints: total,
      maxPoints: max,
      percent,
      grade,
      gradeScaleSnapshot: scale,
      status: "graded",
      reviewedAt: serverTimestamp(),
      reviewedBy: state.user.uid
    });
    toast("Bewertung gespeichert.");
    await openResults(state.currentResultsQuiz.id);
  } catch (err) {
    console.error(err);
    toast("Bewertung konnte nicht gespeichert werden.", "error");
  }
}

function exportResultsCsv() {
  if (!state.currentResultsQuiz || !state.submissions.length) {
    toast("Keine Ergebnisse zum Exportieren.", "error");
    return;
  }
  const header = ["Name", ...state.resultQuestions.map((_, i) => `Aufgabe ${i + 1}`), "Punkte", "Max", "Prozent", "Note", "Status", "Bearbeitungszeit", "Auto-Abgabe", "Abgegeben"];
  const rows = [header];
  state.submissions.forEach((s) => {
    const r = [s.studentName];
    state.resultQuestions.forEach((q) => r.push(answerDisplay(q, s.answers?.[q.id])));
    r.push(s.totalPoints, s.maxPoints, s.percent, s.status === "review" ? "" : submissionGrade(s), s.status, formatDuration(s.elapsedSeconds), s.autoSubmitted ? "Ja" : "Nein", fmtDate(s.submittedAt || s.submittedAtLocal));
    rows.push(r);
  });
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(state.currentResultsQuiz.title || "ergebnisse").replace(/[^a-z0-9äöüß_-]+/gi, "_")}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


// ---------- Mitteilungen, Feedback & Administration (V2.2.3) ----------
$("openRightsReport")?.addEventListener("click", () => {
  $("rightsReportForm")?.reset();
  $("rightsReportStatus").textContent = "";
  const code = new URLSearchParams(location.search).get("test");
  if (code) $("rightsTarget").value = code;
  safeDialogOpen($("rightsReportDialog"));
});
$("closeRightsReport")?.addEventListener("click", () => safeDialogClose($("rightsReportDialog")));
$("cancelRightsReport")?.addEventListener("click", () => safeDialogClose($("rightsReportDialog")));
$("rightsReportForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("sendRightsReport");
  button.disabled = true;
  $("rightsReportStatus").textContent = "Meldung wird übermittelt …";
  try {
    const receipt = await aiApi.reportRightsIssue({
      target: $("rightsTarget").value.trim(), work: $("rightsWork").value.trim(),
      email: $("rightsEmail").value.trim(), explanation: $("rightsExplanation").value.trim()
    });
    safeDialogClose($("rightsReportDialog"));
    toast(`Ihr Rechtehinweis ist eingegangen${receipt?.reference ? ` (Kennung ${receipt.reference})` : ""}.`);
  } catch (err) {
    $("rightsReportStatus").textContent = String(err?.code || "").includes("invalid-argument") || String(err?.code || "").includes("resource-exhausted")
      ? String(err.message || "Bitte Eingaben prüfen.")
      : "Der Hinweis konnte gerade nicht zugestellt werden. Bitte später erneut versuchen.";
  } finally { button.disabled = false; }
});
$("footerFeedbackBtn")?.addEventListener("click", openFeedbackDialog);
$("footerWhatsNewBtn")?.addEventListener("click", () => safeDialogOpen($("whatsNewDialog")));
$("closeWhatsNewDialog")?.addEventListener("click", () => safeDialogClose($("whatsNewDialog")));
$("whatsNewOk")?.addEventListener("click", () => safeDialogClose($("whatsNewDialog")));
$("teacherTourBack")?.addEventListener("click", () => { if (teacherTourIndex > 0) { teacherTourIndex -= 1; renderTeacherTourStep(); } });
$("teacherTourNext")?.addEventListener("click", async () => {
  if (teacherTourIndex < currentTeacherTourConfig().steps.length - 1) { teacherTourIndex += 1; renderTeacherTourStep(); return; }
  await finishTeacherTour();
});
$("teacherTourSkip")?.addEventListener("click", finishTeacherTour);
$("teacherTourClose")?.addEventListener("click", finishTeacherTour);
$("teacherTourDialog")?.addEventListener("cancel", (event) => { event.preventDefault(); finishTeacherTour(); });
$("closeFeedbackDialog")?.addEventListener("click", () => safeDialogClose($("feedbackDialog")));
$("cancelFeedbackBtn")?.addEventListener("click", () => safeDialogClose($("feedbackDialog")));
$("sendFeedbackBtn")?.addEventListener("click", sendFeedback);
$("feedbackCategory")?.addEventListener("change", updateFeedbackPrompt);
$("closeAnnouncementDialog")?.addEventListener("click", dismissCurrentAnnouncement);
$("announcementDialogOk")?.addEventListener("click", dismissCurrentAnnouncement);
$("announcementDialog")?.addEventListener("cancel", (event) => {
  event.preventDefault();
  dismissCurrentAnnouncement();
});
renderAnnouncementPreview();

const FEEDBACK_PROMPTS = {
  bug: {
    hint: "Was ist passiert? Beschreibe kurz, was du gemacht hast.",
    placeholder: "Was ist passiert? Was hast du gemacht, bevor der Fehler auftrat?"
  },
  idea: {
    hint: "Beschreibe kurz deine Idee und wobei sie dir helfen würde.",
    placeholder: "Was würdest du dir wünschen? Was würde dir den Schulalltag erleichtern?"
  },
  question: {
    hint: "Stell deine Frage so konkret wie möglich.",
    placeholder: "Was möchtest du wissen?"
  },
  other: {
    hint: "Für alles, was in keine andere Kategorie passt.",
    placeholder: "Was möchtest du uns mitteilen?"
  }
};

// Initialisierung erst nach FEEDBACK_PROMPTS: sonst stoppt das Modul
// mit einer ReferenceError und nachfolgende Admin-Event-Listener werden nicht registriert.
updateFeedbackPrompt();

function updateFeedbackPrompt() {
  const category = $("feedbackCategory")?.value || "other";
  const prompt = FEEDBACK_PROMPTS[category] || FEEDBACK_PROMPTS.other;
  if ($("feedbackMessageHint")) $("feedbackMessageHint").textContent = prompt.hint;
  if ($("feedbackMessage")) $("feedbackMessage").placeholder = prompt.placeholder;
}

function openFeedbackDialog() {
  if (!state.user) return;
  $("feedbackMessage").value = "";
  $("feedbackTestCode").value = state.currentQuiz?.id || state.currentResultsQuiz?.id || "";
  $("feedbackCategory").value = "bug";
  updateFeedbackPrompt();
  safeDialogOpen($("feedbackDialog"));
}

async function sendFeedback() {
  const message = $("feedbackMessage")?.value.trim();
  if (!message) {
    toast("Bitte kurz beschreiben, worum es geht.", "error");
    return;
  }
  const btn = $("sendFeedbackBtn");
  if (btn) btn.disabled = true;
  try {
    await addDoc(collection(db, "feedback"), {
      userId: state.user.uid,
      displayName: state.profile?.displayName || state.user.displayName || "",
      email: state.user.email || state.profile?.email || "",
      category: $("feedbackCategory")?.value || "other",
      testCode: $("feedbackTestCode")?.value.trim().toUpperCase() || null,
      message,
      appVersion: APP_VERSION,
      environment: appEnvironment || "production",
      userAgent: navigator.userAgent,
      pageUrl: location.href,
      status: "new",
      createdAt: serverTimestamp()
    });
    safeDialogClose($("feedbackDialog"));
    toast("Danke! Dein Feedback wurde gesendet.");
  } catch (err) {
    console.error(err);
    toast("Feedback konnte nicht gesendet werden.", "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function announcementIsActive(a) {
  if (a.active === false) return false;
  const now = Date.now();
  const start = a.startsAt ? Date.parse(a.startsAt) : 0;
  const end = a.endsAt ? Date.parse(a.endsAt) : 0;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function announcementIcon(type) {
  return ({ welcome: "👋", news: "✨", info: "ℹ️", warning: "⚠️" })[type] || "ℹ️";
}

async function loadAnnouncements() {
  if (!state.user || isSuspended()) return;
  const host = $("announcementHost");
  if (!host) return;
  host.innerHTML = "";
  try {
    const [aSnap, seenSnap] = await Promise.all([
      getDocs(collection(db, "announcements")),
      getDocs(collection(db, "users", state.user.uid, "announcementViews"))
    ]);
    const seen = new Map(seenSnap.docs.map((d) => [d.id, d.data()]));
    const announcements = aSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(announcementIsActive)
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    let popup = null;
    for (const a of announcements) {
      const view = seen.get(a.id);
      const frequency = a.frequency || "once";
      if (frequency === "once" && view?.seenAt) continue;
      if (frequency === "until_closed" && view?.dismissedAt) continue;
      if (frequency === "every_login" && state.shownThisLogin.has(a.id)) continue;
      if (a.display === "popup" && !popup) {
        popup = a;
        continue;
      }
      renderAnnouncementBanner(a);
      if (frequency === "once") await markAnnouncementView(a.id, { seenAt: serverTimestamp() });
      if (frequency === "every_login") state.shownThisLogin.add(a.id);
    }
    if (popup) await showAnnouncementPopup(popup);
  } catch (err) {
    console.warn("Mitteilungen konnten nicht geladen werden:", err);
  }
}

function renderAnnouncementBanner(a) {
  const host = $("announcementHost");
  const box = document.createElement("article");
  box.className = `announcementBanner announcement-${a.type || "info"}`;
  box.innerHTML = `<span class="announcementIcon">${announcementIcon(a.type)}</span><div class="announcementBody"><strong>${escapeHtml(a.title || "Hinweis")}</strong><p>${escapeHtml(a.text || "")}</p></div><button class="announcementClose iconButton" type="button" aria-label="Schließen">×</button>`;
  box.querySelector(".announcementClose").addEventListener("click", async () => {
    box.remove();
    if ((a.frequency || "once") === "until_closed") await markAnnouncementView(a.id, { dismissedAt: serverTimestamp() });
    else if ((a.frequency || "once") === "once") await markAnnouncementView(a.id, { seenAt: serverTimestamp() });
  });
  host.appendChild(box);
}

async function showAnnouncementPopup(a) {
  state.activeAnnouncementDialogId = a.id;
  $("announcementDialogEyebrow").textContent = `${announcementIcon(a.type)} ${announcementTypeLabel(a.type)}`;
  $("announcementDialogTitle").textContent = a.title || "Hinweis";
  $("announcementDialogText").textContent = a.text || "";
  safeDialogOpen($("announcementDialog"));
  if ((a.frequency || "once") === "once") await markAnnouncementView(a.id, { seenAt: serverTimestamp() });
  if ((a.frequency || "once") === "every_login") state.shownThisLogin.add(a.id);
}

async function dismissCurrentAnnouncement() {
  const id = state.activeAnnouncementDialogId;
  safeDialogClose($("announcementDialog"));
  state.activeAnnouncementDialogId = null;
  if (!id) return;
  try {
    const snap = await getDoc(doc(db, "announcements", id));
    if (snap.exists() && (snap.data().frequency || "once") === "until_closed") {
      await markAnnouncementView(id, { dismissedAt: serverTimestamp() });
    }
  } catch (err) { console.warn(err); }
}

async function markAnnouncementView(id, patch) {
  try {
    await setDoc(doc(db, "users", state.user.uid, "announcementViews", id), {
      announcementId: id,
      ...patch,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) { console.warn("Mitteilung konnte nicht als gesehen markiert werden:", err); }
}

function announcementTypeLabel(type) {
  return ({ welcome: "Begrüßung", news: "Neuigkeit", info: "Info", warning: "Warnung" })[type] || "Hinweis";
}

// ----- Admin -----
document.querySelectorAll(".adminTab").forEach((btn) => btn.addEventListener("click", () => switchAdminTab(btn.dataset.adminTab)));
document.querySelectorAll(".adminPeriodBtn").forEach((btn) => btn.addEventListener("click", async () => {
  state.adminOverviewPeriod = btn.dataset.period || "7d";
  document.querySelectorAll(".adminPeriodBtn").forEach((b) => b.classList.toggle("active", b === btn));
  await renderAdminOverview();
}));
$("adminTeacherSearch")?.addEventListener("input", renderAdminTeachers);
$("adminTeacherStatusFilter")?.addEventListener("change", renderAdminTeachers);
$("exportAdminTeachersBtn")?.addEventListener("click", exportAdminTeachersCsv);
$("adminTestSearch")?.addEventListener("input", renderAdminTests);
$("adminTestStatusFilter")?.addEventListener("change", renderAdminTests);
$("adminTestOwnerFilter")?.addEventListener("change", renderAdminTests);
$("adminTestPeriodFilter")?.addEventListener("change", renderAdminTests);
$("exportAdminTestsBtn")?.addEventListener("click", exportAdminTestsCsv);
$("adminFeedbackSearch")?.addEventListener("input", renderAdminFeedback);
$("adminFeedbackCategory")?.addEventListener("change", renderAdminFeedback);
$("adminFeedbackFilter")?.addEventListener("change", renderAdminFeedback);
$("saveAnnouncementBtn")?.addEventListener("click", saveAnnouncement);
$("resetAnnouncementBtn")?.addEventListener("click", resetAnnouncementForm);
$("addTeacherTourStepBtn")?.addEventListener("click", () => addAdminTeacherTourStep());
$("saveTeacherTourBtn")?.addEventListener("click", saveAdminTeacherTour);
$("showTeacherTourPreviewBtn")?.addEventListener("click", showAdminTeacherTourPreview);
["announcementType","announcementDisplay","announcementFrequency","announcementTitle","announcementText","announcementActive","announcementStart","announcementEnd"].forEach((id) => {
  $(id)?.addEventListener("input", renderAnnouncementPreview);
  $(id)?.addEventListener("change", renderAnnouncementPreview);
});

async function openAdmin() {
  if (!state.user || !isAdmin()) {
    toast("Dieser Bereich ist nur für Administratoren verfügbar.", "error");
    return;
  }
  showView("adminView");
  switchAdminTab("overview", false);
  await loadAdminData(true);
}

function switchAdminTab(name, scroll = true) {
  document.querySelectorAll(".adminTab").forEach((btn) => btn.classList.toggle("active", btn.dataset.adminTab === name));
  document.querySelectorAll(".adminPanel").forEach((panel) => panel.classList.add("hidden"));
  const map = { overview: "adminPanelOverview", teachers: "adminPanelTeachers", tests: "adminPanelTests", messages: "adminPanelMessages", feedback: "adminPanelFeedback", audit: "adminPanelAudit" };
  $(map[name] || map.overview)?.classList.remove("hidden");
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadAdminData(showToast = false) {
  if (!isAdmin()) return;
  const refresh = $("refreshAdminBtn");
  if (refresh) { refresh.disabled = true; refresh.textContent = "Lädt …"; }
  try {
    const [usersSnap, quizzesSnap, announcementsSnap, feedbackSnap, auditSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "quizzes")),
      getDocs(collection(db, "announcements")),
      getDocs(collection(db, "feedback")),
      getDocs(collection(db, "adminAudit"))
    ]);
    state.adminUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    state.adminQuizzes = quizzesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    state.adminAnnouncements = announcementsSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b)=>toMillis(b.createdAt)-toMillis(a.createdAt));
    state.adminFeedback = feedbackSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b)=>toMillis(b.createdAt)-toMillis(a.createdAt));
    const openRightsCount = state.adminFeedback.filter(f => f.category === "rights" && f.status !== "done").length;
    const openErrorCount = state.adminFeedback.filter(f => f.category === "app_error" && f.status !== "done").length;
    const feedbackTab = document.querySelector('[data-admin-tab="feedback"]');
    if (feedbackTab) {
      const parts = [];
      if (openErrorCount) parts.push(`${openErrorCount} Fehler`);
      if (openRightsCount) parts.push(`${openRightsCount} Rechtehinweis${openRightsCount === 1 ? "" : "e"}`);
      feedbackTab.textContent = parts.length ? `Feedback · ${parts.join(" · ")}` : "Feedback";
    }
    state.adminAudit = auditSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b)=>toMillis(b.createdAt)-toMillis(a.createdAt)).slice(0, 100);
    renderAdminFilterOptions();
    await renderAdminOverview();
    renderAdminTeachers();
    renderAdminTests();
    await loadTeacherTourConfig({ force: true });
    renderAdminAnnouncements();
    renderAdminTeacherTour();
    renderAdminFeedback();
    renderAdminAudit();
    if (showToast) toast("Admin-Daten aktualisiert.");
  } catch (err) {
    console.error(err);
    toast("Admin-Daten konnten nicht geladen werden. Prüfe Rolle und Firestore-Regeln.", "error");
  } finally {
    if (refresh) { refresh.disabled = false; refresh.textContent = "Aktualisieren"; }
  }
}

async function renderAdminOverview() {
  const period = state.adminOverviewPeriod || "7d";
  const since = adminPeriodStart(period);
  const inPeriod = (value) => !since || toMillis(value) >= since.getTime();
  const activeTests = state.adminQuizzes.filter((q) => !q.isDeleted);

  const activeTeachers = state.adminUsers.filter((u) => inPeriod(u.lastActiveAt || u.createdAt)).length;
  const newTeachers = state.adminUsers.filter((u) => inPeriod(u.createdAt)).length;
  const createdTests = state.adminQuizzes.filter((q) => inPeriod(q.createdAt)).length;
  const publishedTests = state.adminQuizzes.filter((q) => q.publishedAt && inPeriod(q.publishedAt)).length;
  const endedTests = state.adminQuizzes.filter((q) => q.endedAt && inPeriod(q.endedAt)).length;
  const submissions = await adminSubmissionCount(since);

  const periodLabels = { today: "heute", "7d": "in den letzten 7 Tagen", "30d": "in den letzten 30 Tagen", all: "seit Start" };
  const description = $("adminPeriodDescription");
  if (description) description.textContent = `Aktivität ${periodLabels[period] || periodLabels["7d"]}.`;

  const cards = period === "all" ? [
    ["Lehrkräfte registriert", state.adminUsers.length, "◎"],
    ["Tests erstellt", state.adminQuizzes.length, "✎"],
    ["Jemals veröffentlicht", state.adminQuizzes.filter((q) => q.publishedAt).length, "↗"],
    ["Tests beendet", state.adminQuizzes.filter((q) => q.endedAt).length, "✓"],
    ["Abgaben", submissions, "↓"],
    ["Feedback erhalten", state.adminFeedback.length, "💬"]
  ] : [
    ["Aktive Lehrkräfte", activeTeachers, "◎"],
    ["Neu registriert", newTeachers, "+"],
    ["Tests erstellt", createdTests, "✎"],
    ["Veröffentlicht", publishedTests, "↗"],
    ["Beendet", endedTests, "✓"],
    ["Abgaben", submissions, "↓"]
  ];
  $("adminStats").innerHTML = cards.map(([label, value, icon]) => `<article class="card adminStatCard"><span>${icon}</span><div><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div></article>`).join("");

  const publishedNow = activeTests.filter((q) => q.published && !q.ended).length;
  const trashCount = state.adminQuizzes.filter((q) => q.isDeleted).length;
  const inventory = [
    ["Lehrkräfte gesamt", state.adminUsers.length],
    ["Tests gesamt", activeTests.length],
    ["Aktuell veröffentlicht", publishedNow],
    ["Offenes Feedback", state.adminFeedback.filter((f) => f.status !== "done").length]
  ];
  $("adminInventoryStats").innerHTML = `${inventory.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}<div class="inventorySecondary"><span>🗑 Papierkorb</span><strong>${escapeHtml(trashCount)}</strong></div>`;

  $("adminSystemInfo").innerHTML = `<div><span>Marke</span><strong>${escapeHtml(BRAND.name)}</strong></div><div><span>App-Version</span><strong>v${APP_VERSION}</strong></div><div><span>Umgebung</span><strong>${escapeHtml(appEnvironment || "production")}</strong></div><div><span>Firebase-Projekt</span><strong>${escapeHtml(firebaseConfig.projectId)}</strong></div>`;
  const consoleLink = $("adminFirebaseConsoleLink");
  if (consoleLink) consoleLink.href = `https://console.firebase.google.com/project/${encodeURIComponent(firebaseConfig.projectId)}/overview`;
}

function adminPeriodStart(period) {
  if (period === "all") return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "7d") d.setDate(d.getDate() - 6);
  if (period === "30d") d.setDate(d.getDate() - 29);
  return d;
}

async function adminSubmissionCount(since = null) {
  try {
    const ref = collectionGroup(db, "submissions");
    const source = since ? query(ref, where("submittedAt", ">=", Timestamp.fromDate(since))) : ref;
    const c = await getCountFromServer(source);
    return c.data().count;
  } catch (err) {
    console.warn("Abgaben-Zählung nicht verfügbar:", err);
    return "–";
  }
}

function renderAdminFilterOptions() {
  const select = $("adminTestOwnerFilter");
  if (!select) return;
  const current = select.value || "all";
  const users = [...state.adminUsers].sort((a, b) => String(a.displayName || a.email || "").localeCompare(String(b.displayName || b.email || ""), "de"));
  select.innerHTML = `<option value="all">Alle Lehrkräfte</option>${users.map((u) => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.displayName || u.email || "Lehrkraft")}</option>`).join("")}`;
  select.value = users.some((u) => u.id === current) ? current : "all";
}

function teacherQuizCount(uid) {
  return state.adminQuizzes.filter((q) => q.ownerId === uid && !q.isDeleted).length;
}

function adminUserStatusKey(u) {
  if (u.status === "suspended") return "suspended";
  if (u.role === "admin") return "admin";
  return "active";
}

function renderAdminTeachers() {
  const root = $("adminTeachersTable");
  if (!root) return;
  const term = normalize($("adminTeacherSearch")?.value || "");
  const status = $("adminTeacherStatusFilter")?.value || "all";
  const users = state.adminUsers
    .filter((u) => !term || normalize(`${u.displayName || ""} ${u.email || ""}`).includes(term))
    .filter((u) => status === "all" || adminUserStatusKey(u) === status)
    .sort((a,b)=>String(a.displayName||a.email||"").localeCompare(String(b.displayName||b.email||""),"de"));
  if (!users.length) { root.innerHTML = `<div class="emptyInline">Keine Lehrkräfte gefunden.</div>`; return; }
  root.innerHTML = `<table><thead><tr><th>Lehrkraft</th><th>Status</th><th>Registriert</th><th>Letzte Aktivität</th><th>Tests</th><th></th></tr></thead><tbody>${users.map((u)=>`<tr><td><strong>${escapeHtml(u.displayName || "–")}</strong><small>${escapeHtml(u.email || "")}</small></td><td><span class="status ${u.status === "suspended" ? "ended" : "published"}">${u.status === "suspended" ? "Gesperrt" : (u.role === "admin" ? "Admin" : "Aktiv")}</span></td><td>${escapeHtml(fmtDate(u.createdAt))}</td><td>${escapeHtml(fmtDate(u.lastActiveAt))}</td><td>${teacherQuizCount(u.id)}</td><td><button class="button ghost adminTeacherOpen" data-id="${escapeHtml(u.id)}" type="button">Öffnen</button></td></tr>`).join("")}</tbody></table>`;
  root.querySelectorAll(".adminTeacherOpen").forEach((btn)=>btn.addEventListener("click",()=>openAdminTeacher(btn.dataset.id)));
}

function exportAdminTeachersCsv() {
  const users = state.adminUsers.map((u) => [
    u.displayName || "", u.email || "", u.role || "teacher", u.status || "active",
    fmtDate(u.createdAt), fmtDate(u.lastActiveAt), teacherQuizCount(u.id), u.appVersion || ""
  ]);
  downloadAdminCsv("testify_lehrkraefte.csv", [["Name","E-Mail","Rolle","Status","Registriert","Letzte Aktivität","Tests","App-Version"], ...users]);
}

function openAdminTeacher(uid) {
  const u = state.adminUsers.find((x)=>x.id===uid);
  if (!u) return;
  const tests = state.adminQuizzes.filter((q)=>q.ownerId===uid && !q.isDeleted).sort((a,b)=>toMillis(b.updatedAt)-toMillis(a.updatedAt));
  const detail = $("adminTeacherDetail");
  detail.classList.remove("hidden");
  detail.innerHTML = `<div class="sectionHead"><div><span class="eyebrow">Lehrkraft</span><h2>${escapeHtml(u.displayName || u.email || "Lehrkraft")}</h2><p>${escapeHtml(u.email || "")}</p></div><button class="iconButton closeAdminDetail" type="button">×</button></div><div class="adminDetailMeta"><span>Registriert: <strong>${escapeHtml(fmtDate(u.createdAt))}</strong></span><span>Letzte Aktivität: <strong>${escapeHtml(fmtDate(u.lastActiveAt))}</strong></span><span>Rolle: <strong>${u.role === "admin" ? "Admin" : "Lehrkraft"}</strong></span><span>Status: <strong>${u.status === "suspended" ? "Gesperrt" : "Aktiv"}</strong></span><span>Tests: <strong>${tests.length}</strong></span><span>App-Version: <strong>${escapeHtml(u.appVersion || "–")}</strong></span></div><div class="actions adminDetailActions"><button class="button secondary adminResetPassword" type="button">Reset-Mail senden</button>${u.id !== state.user.uid ? `<button class="button ${u.status === "suspended" ? "primary" : "danger"} adminToggleUser" type="button">${u.status === "suspended" ? "Entsperren" : "Account sperren"}</button>` : ""}</div><h3>Tests</h3><div class="miniTestList">${tests.length ? tests.map((q)=>`<button type="button" class="miniTest adminOpenTestFromTeacher" data-id="${escapeHtml(q.id)}"><span><strong>${escapeHtml(q.title || "Unbenannter Test")}</strong><small>${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · ${escapeHtml(q.id)}</small></span><span>→</span></button>`).join("") : `<p class="hint">Noch keine Tests.</p>`}</div>`;
  detail.querySelector(".closeAdminDetail").addEventListener("click",()=>detail.classList.add("hidden"));
  detail.querySelector(".adminResetPassword").addEventListener("click",()=>adminSendPasswordReset(u));
  detail.querySelector(".adminToggleUser")?.addEventListener("click",()=>toggleUserSuspension(u));
  detail.querySelectorAll(".adminOpenTestFromTeacher").forEach((btn)=>btn.addEventListener("click",()=>{ switchAdminTab("tests"); openAdminTest(btn.dataset.id); }));
  detail.scrollIntoView({behavior:"smooth",block:"start"});
}

async function adminSendPasswordReset(user) {
  if (!user?.email) return;
  if (!confirm(`Passwort-Reset-Mail an ${user.email} senden?`)) return;
  try {
    await sendPasswordResetEmail(auth, user.email);
    await writeAdminAudit("password_reset_sent", { userId: user.id, email: user.email });
    toast("Reset-Mail wurde versendet.");
  } catch (err) { console.error(err); toast("Reset-Mail konnte nicht versendet werden.", "error"); }
}

async function toggleUserSuspension(user) {
  if (!user || user.id === state.user.uid) return;
  const suspend = user.status !== "suspended";
  const verb = suspend ? "sperren" : "entsperren";
  if (!confirm(`${user.displayName || user.email} wirklich ${verb}?`)) return;
  try {
    await updateDoc(doc(db, "users", user.id), { status: suspend ? "suspended" : "active", statusUpdatedAt: serverTimestamp(), statusUpdatedBy: state.user.uid });
    await writeAdminAudit(suspend ? "user_suspended" : "user_unsuspended", { userId: user.id, email: user.email || "" });
    toast(suspend ? "Account gesperrt." : "Account entsperrt.");
    await loadAdminData(false);
    openAdminTeacher(user.id);
  } catch (err) { console.error(err); toast("Accountstatus konnte nicht geändert werden.", "error"); }
}

function adminQuizStatus(q) {
  if (q.isDeleted) return "Papierkorb";
  if (q.ended) return "Beendet";
  if (q.published) return "Veröffentlicht";
  if (Number(q.questionCount || 0) === 0) return "Unvollständig";
  return "Entwurf";
}

function ownerLabel(uid) {
  const u = state.adminUsers.find((x)=>x.id===uid);
  return u?.displayName || u?.email || uid || "–";
}

function adminTestMatchesStatus(q, status) {
  if (status === "all") return true;
  if (status === "trash") return Boolean(q.isDeleted);
  if (q.isDeleted) return false;
  if (status === "ended") return Boolean(q.ended);
  if (status === "published") return Boolean(q.published && !q.ended);
  if (status === "draft") return !q.published && !q.ended;
  return true;
}

function adminTestPeriodStart(period) {
  if (!period || period === "all") return null;
  const days = Number(period.replace("d", ""));
  if (!Number.isFinite(days)) return null;
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - Math.max(0, days - 1));
  return d;
}

function filteredAdminTests() {
  const term = normalize($("adminTestSearch")?.value || "");
  const status = $("adminTestStatusFilter")?.value || "all";
  const owner = $("adminTestOwnerFilter")?.value || "all";
  const since = adminTestPeriodStart($("adminTestPeriodFilter")?.value || "all");
  return state.adminQuizzes
    .filter((q) => !term || normalize(`${q.title||""} ${q.subject||""} ${q.grade||""} ${q.id} ${ownerLabel(q.ownerId)}`).includes(term))
    .filter((q) => adminTestMatchesStatus(q, status))
    .filter((q) => owner === "all" || q.ownerId === owner)
    .filter((q) => !since || toMillis(q.updatedAt || q.createdAt) >= since.getTime())
    .sort((a,b)=>toMillis(b.updatedAt||b.createdAt)-toMillis(a.updatedAt||a.createdAt));
}

function renderAdminTests() {
  const root = $("adminTestsTable");
  if (!root) return;
  const list = filteredAdminTests();
  if (!list.length) { root.innerHTML = `<div class="emptyInline">Keine Tests für diese Filter gefunden.</div>`; return; }
  root.innerHTML = `<table><thead><tr><th>Test</th><th>Lehrkraft</th><th>Status</th><th>Aufgaben</th><th>Zuletzt geändert</th><th></th></tr></thead><tbody>${list.map((q)=>`<tr><td><strong>${escapeHtml(q.title || "Unbenannter Test")}</strong><small>${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · ${escapeHtml(q.id)}</small></td><td>${escapeHtml(ownerLabel(q.ownerId))}</td><td><span class="adminStatusPill status-${escapeHtml(adminQuizStatus(q).toLowerCase())}">${escapeHtml(adminQuizStatus(q))}</span></td><td>${Number(q.questionCount||0)}</td><td>${escapeHtml(fmtDate(q.updatedAt||q.createdAt))}</td><td><button class="button ghost adminTestOpen" data-id="${escapeHtml(q.id)}" type="button">Ansehen</button></td></tr>`).join("")}</tbody></table>`;
  root.querySelectorAll(".adminTestOpen").forEach((btn)=>btn.addEventListener("click",()=>openAdminTest(btn.dataset.id)));
}

function exportAdminTestsCsv() {
  const rows = filteredAdminTests().map((q) => [q.id, q.title || "", q.subject || "", q.grade || "", ownerLabel(q.ownerId), adminQuizStatus(q), Number(q.questionCount || 0), fmtDate(q.createdAt), fmtDate(q.updatedAt)]);
  downloadAdminCsv("testify_tests.csv", [["Testcode","Titel","Fach","Klasse","Lehrkraft","Status","Aufgaben","Erstellt","Zuletzt geändert"], ...rows]);
}

function downloadAdminCsv(filename, rows) {
  const safeCell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((r) => r.map(safeCell).join(";")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function openAdminTest(code) {
  const q = state.adminQuizzes.find((x)=>x.id===code);
  if (!q) return;
  const detail = $("adminTestDetail");
  detail.classList.remove("hidden");
  detail.innerHTML = `<div class="sectionHead"><div><span class="eyebrow">Supportansicht</span><h2>${escapeHtml(q.title || "Unbenannter Test")}</h2><p>${escapeHtml(ownerLabel(q.ownerId))} · Code ${escapeHtml(q.id)}</p></div><button class="iconButton closeAdminTestDetail" type="button">×</button></div><div class="adminDetailMeta"><span>Status: <strong>${escapeHtml(adminQuizStatus(q))}</strong></span><span>Fach: <strong>${escapeHtml(q.subject||"–")}</strong></span><span>Klasse: <strong>${escapeHtml(q.grade||"–")}</strong></span><span>Aufgaben: <strong>${Number(q.questionCount||0)}</strong></span></div><div id="adminQuestionPreview" class="adminQuestionPreview">Aufgaben werden geladen …</div><div class="actions">${q.isDeleted ? `<button class="button primary adminRestoreQuiz" type="button">Wiederherstellen</button><button class="button danger adminPurgeQuiz" type="button">Endgültig löschen</button>` : ""}</div>`;
  detail.querySelector(".closeAdminTestDetail").addEventListener("click",()=>detail.classList.add("hidden"));
  detail.querySelector(".adminRestoreQuiz")?.addEventListener("click",()=>restoreQuiz(code,{admin:true}));
  detail.querySelector(".adminPurgeQuiz")?.addEventListener("click",()=>permanentlyDeleteQuiz(code,{admin:true}));
  try {
    const snap = await getDocs(query(collection(db,"quizzes",code,"questions"),orderBy("position")));
    const qs = snap.docs.map((d)=>({id:d.id,...d.data()}));
    $("adminQuestionPreview").innerHTML = qs.length ? qs.map((item,i)=>`<div class="adminQuestionRow"><span>${i+1}</span><div><strong>${escapeHtml(item.text||"Ohne Fragetext")}</strong><small>${escapeHtml(QUESTION_TYPES.find(([v])=>v===item.type)?.[1]||item.type||"–")} · ${Number(item.points||0)} P.</small></div></div>`).join("") : `<p class="hint">Keine Aufgaben.</p>`;
  } catch (err) { console.error(err); $("adminQuestionPreview").textContent="Aufgaben konnten nicht geladen werden."; }
  detail.scrollIntoView({behavior:"smooth",block:"start"});
}

function announcementDisplayLabel(value) {
  return value === "popup" ? "Popup beim Öffnen" : "Karte im Dashboard";
}

function announcementFrequencyLabel(value) {
  return ({ once: "einmal pro Nutzer", every_login: "bei jedem Login", until_closed: "bis zum Schließen" })[value] || "einmal pro Nutzer";
}

function announcementPreviewFallback(type) {
  return ({
    welcome: ["Schön, dass du da bist!", "Viel Spaß beim Erstellen und Ausprobieren."],
    news: ["Neu in Testify", "Hier kannst du kurz auf eine neue Funktion aufmerksam machen."],
    info: ["Kurzer Hinweis", "Hier steht eine sachliche Information für die Lehrkräfte."],
    warning: ["Wichtiger Hinweis", "Hier steht eine wichtige Information, die nicht übersehen werden sollte."]
  })[type] || ["Hinweis", "Hier erscheint deine Mitteilung."];
}

function renderAnnouncementPreview() {
  const root = $("announcementPreview");
  if (!root) return;
  const type = $("announcementType")?.value || "info";
  const display = $("announcementDisplay")?.value || "banner";
  const frequency = $("announcementFrequency")?.value || "once";
  const fallback = announcementPreviewFallback(type);
  const title = $("announcementTitle")?.value.trim() || fallback[0];
  const text = $("announcementText")?.value.trim() || fallback[1];
  const active = $("announcementActive")?.checked !== false;
  const meta = `${announcementDisplayLabel(display)} · ${announcementFrequencyLabel(frequency)}${active ? "" : " · deaktiviert"}`;
  if ($("announcementPreviewMeta")) $("announcementPreviewMeta").textContent = meta;

  if (display === "popup") {
    root.innerHTML = `<div class="announcementPreviewBackdrop"><div class="announcementPreviewDialog"><div class="announcementPreviewDialogHead"><div><span class="eyebrow">${announcementIcon(type)} ${escapeHtml(announcementTypeLabel(type))}</span><strong>${escapeHtml(title)}</strong></div><span class="announcementPreviewX">×</span></div><p>${escapeHtml(text)}</p><div class="announcementPreviewDialogFoot"><span>Alles klar</span></div></div></div>`;
  } else {
    root.innerHTML = `<div class="announcementBanner announcement-${escapeHtml(type)} announcementPreviewBanner"><span class="announcementIcon">${announcementIcon(type)}</span><div class="announcementBody"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div><span class="announcementPreviewX">×</span></div>`;
  }
  root.classList.toggle("previewInactive", !active);
}

function resetAnnouncementForm() {
  $("announcementEditId").value="";
  $("announcementType").value="welcome";
  $("announcementDisplay").value="banner";
  $("announcementFrequency").value="once";
  $("announcementActive").checked=true;
  $("announcementTitle").value="";
  $("announcementText").value="";
  $("announcementStart").value="";
  $("announcementEnd").value="";
  $("saveAnnouncementBtn").textContent="Mitteilung veröffentlichen";
  renderAnnouncementPreview();
}

function localDateTimeValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p=(n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function editAnnouncement(id) {
  const a=state.adminAnnouncements.find((x)=>x.id===id); if(!a)return;
  $("announcementEditId").value=a.id;
  $("announcementType").value=a.type||"info";
  $("announcementDisplay").value=a.display||"banner";
  $("announcementFrequency").value=a.frequency||"once";
  $("announcementActive").checked=a.active!==false;
  $("announcementTitle").value=a.title||"";
  $("announcementText").value=a.text||"";
  $("announcementStart").value=localDateTimeValue(a.startsAt);
  $("announcementEnd").value=localDateTimeValue(a.endsAt);
  $("saveAnnouncementBtn").textContent="Änderungen speichern";
  renderAnnouncementPreview();
  window.scrollTo({top:0,behavior:"smooth"});
}

async function saveAnnouncement() {
  if (!isAdmin()) return;
  const title=$("announcementTitle").value.trim(); const text=$("announcementText").value.trim();
  if(!title||!text){toast("Titel und Nachricht dürfen nicht leer sein.","error");return;}
  const startRaw=$("announcementStart").value; const endRaw=$("announcementEnd").value;
  if(startRaw&&endRaw&&new Date(endRaw)<=new Date(startRaw)){toast("Das Enddatum muss nach dem Start liegen.","error");return;}
  const id=$("announcementEditId").value.trim();
  const data={type:$("announcementType").value,display:$("announcementDisplay").value,frequency:$("announcementFrequency").value,active:$("announcementActive").checked,title,text,startsAt:startRaw?new Date(startRaw).toISOString():null,endsAt:endRaw?new Date(endRaw).toISOString():null,updatedAt:serverTimestamp(),updatedBy:state.user.uid};
  try{
    if(id){await updateDoc(doc(db,"announcements",id),data);await writeAdminAudit("announcement_updated",{announcementId:id,title});}
    else{const ref=await addDoc(collection(db,"announcements"),{...data,createdAt:serverTimestamp(),createdBy:state.user.uid});await writeAdminAudit("announcement_created",{announcementId:ref.id,title});}
    resetAnnouncementForm(); toast(id ? "Änderungen gespeichert." : "Mitteilung veröffentlicht."); await loadAdminData(false);
  }catch(err){console.error(err);toast("Mitteilung konnte nicht gespeichert werden.","error");}
}

async function deleteAnnouncement(id) {
  const a=state.adminAnnouncements.find((x)=>x.id===id); if(!a)return;
  if(!confirm(`Mitteilung „${a.title||"Hinweis"}“ löschen?`))return;
  try{await deleteDoc(doc(db,"announcements",id));await writeAdminAudit("announcement_deleted",{announcementId:id,title:a.title||""});toast("Mitteilung gelöscht.");await loadAdminData(false);}catch(err){console.error(err);toast("Mitteilung konnte nicht gelöscht werden.","error");}
}

function renderAdminAnnouncements() {
  const root=$("adminAnnouncementList"); if(!root)return;
  if(!state.adminAnnouncements.length){root.innerHTML=`<p class="hint">Noch keine Mitteilungen.</p>`;return;}
  root.innerHTML=state.adminAnnouncements.map((a)=>`<article class="adminAnnouncementItem"><div><span class="announcementMiniIcon">${announcementIcon(a.type)}</span><div><strong>${escapeHtml(a.title||"Hinweis")}</strong><small>${escapeHtml(announcementTypeLabel(a.type))} · ${a.display==="popup"?"Popup":"Dashboard"} · ${a.frequency==="every_login"?"jeder Login":a.frequency==="until_closed"?"bis geschlossen":"einmal"}${a.active===false?" · deaktiviert":""}</small></div></div><div class="actions"><button class="button ghost editAnnouncement" data-id="${escapeHtml(a.id)}" type="button">Bearbeiten</button><button class="button danger deleteAnnouncement" data-id="${escapeHtml(a.id)}" type="button">Löschen</button></div></article>`).join("");
  root.querySelectorAll(".editAnnouncement").forEach((b)=>b.addEventListener("click",()=>editAnnouncement(b.dataset.id)));
  root.querySelectorAll(".deleteAnnouncement").forEach((b)=>b.addEventListener("click",()=>deleteAnnouncement(b.dataset.id)));
}

function teacherTourStepEditor(step, index, total) {
  return `<article class="teacherTourAdminStep" data-index="${index}">
    <div class="teacherTourAdminStepHead">
      <strong>Schritt ${index + 1}</strong>
      <div class="teacherTourAdminStepActions">
        <button class="button ghost tourMoveUp" type="button" ${index === 0 ? "disabled" : ""}>↑</button>
        <button class="button ghost tourMoveDown" type="button" ${index === total - 1 ? "disabled" : ""}>↓</button>
        <button class="button danger tourRemove" type="button" ${total <= 1 ? "disabled" : ""}>Löschen</button>
      </div>
    </div>
    <div class="teacherTourAdminFields">
      <label>Symbol<input class="tourStepIcon" type="text" maxlength="8" value="${escapeHtml(step.icon || "")}" placeholder="✨" /></label>
      <label class="tourStepTitleField">Titel<input class="tourStepTitle" type="text" maxlength="120" value="${escapeHtml(step.title || "")}" /></label>
      <label class="span2">Text<textarea class="tourStepText" rows="3" maxlength="1200">${escapeHtml(step.text || "")}</textarea></label>
      <label class="span2">Hinweise <small>(eine Zeile pro Punkt)</small><textarea class="tourStepBullets" rows="4" maxlength="3500">${escapeHtml((step.bullets || []).join("\n"))}</textarea></label>
    </div>
  </article>`;
}

function renderAdminTeacherTour() {
  const root = $("teacherTourAdminList");
  if (!root) return;
  const config = currentTeacherTourConfig();
  if ($("teacherTourAdminEnabled")) $("teacherTourAdminEnabled").checked = config.enabled;
  if ($("teacherTourAdminVersion")) $("teacherTourAdminVersion").textContent = config.version;
  root.innerHTML = config.steps.map((step, index) => teacherTourStepEditor(step, index, config.steps.length)).join("");
  bindAdminTeacherTourStepButtons();
}

function readAdminTeacherTourSteps() {
  return Array.from(document.querySelectorAll(".teacherTourAdminStep")).map((card, index) => ({
    icon: card.querySelector(".tourStepIcon")?.value.trim() || "•",
    title: card.querySelector(".tourStepTitle")?.value.trim() || `Schritt ${index + 1}`,
    text: card.querySelector(".tourStepText")?.value.trim() || "",
    bullets: (card.querySelector(".tourStepBullets")?.value || "").split("\n").map(value => value.trim()).filter(Boolean)
  }));
}

function bindAdminTeacherTourStepButtons() {
  document.querySelectorAll(".teacherTourAdminStep").forEach((card, index, cards) => {
    card.querySelector(".tourMoveUp")?.addEventListener("click", () => moveAdminTeacherTourStep(index, -1));
    card.querySelector(".tourMoveDown")?.addEventListener("click", () => moveAdminTeacherTourStep(index, 1));
    card.querySelector(".tourRemove")?.addEventListener("click", () => removeAdminTeacherTourStep(index));
  });
}

function syncAdminTeacherTourDraft(steps) {
  state.teacherTourConfig = normalizeTeacherTourConfig({
    ...currentTeacherTourConfig(),
    enabled: $("teacherTourAdminEnabled")?.checked !== false,
    steps
  });
  renderAdminTeacherTour();
}

function moveAdminTeacherTourStep(index, delta) {
  const steps = readAdminTeacherTourSteps();
  const next = index + delta;
  if (next < 0 || next >= steps.length) return;
  [steps[index], steps[next]] = [steps[next], steps[index]];
  syncAdminTeacherTourDraft(steps);
}

function removeAdminTeacherTourStep(index) {
  const steps = readAdminTeacherTourSteps();
  if (steps.length <= 1) return;
  steps.splice(index, 1);
  syncAdminTeacherTourDraft(steps);
}

function addAdminTeacherTourStep() {
  const steps = readAdminTeacherTourSteps();
  steps.push({ icon: "ℹ️", title: "Neue Information", text: "", bullets: [] });
  syncAdminTeacherTourDraft(steps);
}

async function saveAdminTeacherTour() {
  if (!isAdmin()) return;
  const button = $("saveTeacherTourBtn");
  if (button) button.disabled = true;
  try {
    const previous = currentTeacherTourConfig();
    const steps = readAdminTeacherTourSteps();
    if (!steps.length) throw new Error("Mindestens ein Tutorial-Schritt ist erforderlich.");
    const reshow = $("teacherTourReshow")?.checked !== false;
    const version = reshow ? `admin-${Date.now()}` : previous.version;
    const config = normalizeTeacherTourConfig({
      enabled: $("teacherTourAdminEnabled")?.checked !== false,
      version,
      steps
    });
    await setDoc(doc(db, "appConfig", "teacherTour"), {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy: state.user.uid
    }, { merge: true });
    state.teacherTourConfig = config;
    await writeAdminAudit("teacher_tour_updated", { version, steps: config.steps.length, enabled: config.enabled, reshow });
    renderAdminTeacherTour();
    toast(reshow ? "Tutorial gespeichert. Es wird Lehrkräften erneut angezeigt." : "Tutorial gespeichert.");
  } catch (err) {
    console.error(err);
    toast(err?.message || "Tutorial konnte nicht gespeichert werden.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

function showAdminTeacherTourPreview() {
  if (!isAdmin()) return;
  const steps = readAdminTeacherTourSteps();
  state.teacherTourConfig = normalizeTeacherTourConfig({
    ...currentTeacherTourConfig(),
    enabled: true,
    steps
  });
  teacherTourIndex = 0;
  renderTeacherTourStep();
  safeDialogOpen($("teacherTourDialog"));
}

function feedbackCategoryLabel(v){return({rights:"Rechtehinweis",ai_question:"KI-Aufgabe",app_error:"Technischer Fehler",bug:"Fehler",idea:"Wunsch / Idee",question:"Frage",other:"Sonstiges"})[v]||v||"Feedback";}
function renderAdminFeedback(){
  const root=$("adminFeedbackList"); if(!root)return;
  const status=$("adminFeedbackFilter")?.value||"all";
  const category=$("adminFeedbackCategory")?.value||"all";
  const term=normalize($("adminFeedbackSearch")?.value||"");
  const list=state.adminFeedback
    .filter((f)=>status==="all"||f.status===status)
    .filter((f)=>category==="all"||f.category===category)
    .filter((f)=>!term||normalize(`${f.id||""} ${f.displayName||""} ${f.email||""} ${f.message||""} ${f.testCode||""} ${f.questionSnapshot?.text||""} ${f.errorCode||""} ${f.reportId||""} ${f.action||""} ${f.technicalDetails?.rawMessage||""}`).includes(term))
    .sort((a,b)=>(b.category==="rights"&&b.status!=="done")-(a.category==="rights"&&a.status!=="done"));
  const aiItems = list.filter(f => f.category === "ai_question");
  const reasonCounts = Object.entries({ ...AI_QUALITY_REASONS, ambiguous: "Mehrdeutig (ältere Meldungen)" }).map(([key, label]) => ({ label, count: aiItems.filter(f => f.reason === key && f.verdict === "bad").length })).filter(item => item.count);
  const summary = aiItems.length ? `<div class="aiFeedbackSummary"><strong>KI-Aufgaben:</strong> ${aiItems.filter(f => f.verdict === "good").length} gut · ${aiItems.filter(f => f.verdict === "bad").length} problematisch${reasonCounts.length ? `<br>${reasonCounts.map(item => `${escapeHtml(item.label)}: ${item.count}`).join(" · ")}` : ""}</div>` : "";
  const errorItems = list.filter(f => f.category === "app_error");
  const errorGroups = [...errorItems.reduce((map, item) => {
    const key = item.errorCode || "UNBEKANNT";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const errorSummary = errorItems.length ? `<div class="aiFeedbackSummary errorFeedbackSummary"><strong>Technische Fehler:</strong> ${errorItems.length} Meldung${errorItems.length === 1 ? "" : "en"}${errorGroups.length ? `<br>${errorGroups.map(([key, count]) => `${escapeHtml(key)}: ${count}`).join(" · ")}` : ""}</div>` : "";
  const openRights = state.adminFeedback.filter(f => f.category === "rights" && f.status !== "done").length;
  const rightsSummary = openRights ? `<div class="aiFeedbackSummary"><strong>${openRights} offene Rechtehinweis${openRights === 1 ? "" : "e"} – zeitnah prüfen und betroffene Zugänge bei begründetem Verdacht sperren.</strong></div>` : "";
  root.innerHTML = rightsSummary + errorSummary + summary + (list.length ? list.map(f => {
    const q = f.questionSnapshot;
    const snapshot = f.category === "ai_question" && q ? `<div class="aiFeedbackSnapshot"><strong>Aufgabe ${Number(f.questionPosition) || "?"} · ${escapeHtml(q.type || "")}</strong><p>${escapeHtml(q.text || "")}</p>${(q.options || []).length ? `<small>Antworten: ${(q.options || []).map(o => `${escapeHtml(o.text || "")}${o.correct ? " ✓" : ""}`).join(" · ")}</small>` : ""}<small>Aktion: ${escapeHtml(({ keep: "behalten", replace: "ersetzen", remove: "entfernen" })[f.action] || "–")}${q.imagePresent ? " · Bild im Test vorhanden oder vorhanden gewesen" : ""}${f.promptVersion ? ` · Prompt ${escapeHtml(f.promptVersion)}` : ""}${f.model ? ` · Modell ${escapeHtml(f.model)}` : ""}</small></div>` : "";
    const technical = f.category === "app_error" ? (f.technicalDetails || {}) : null;
    const errorSnapshot = technical ? `<div class="errorReportSnapshot"><div class="errorReportHeadline"><strong>${escapeHtml(f.errorCode || "Technischer Fehler")}</strong>${f.reportId ? `<span>${escapeHtml(f.reportId)}</span>` : ""}</div><p>${escapeHtml(f.action || "Unbekannte Aktion")}</p><small>${escapeHtml(technical.rawMessage || "Keine technische Fehlermeldung gespeichert.")}</small><div class="errorReportMeta"><span>Ansicht: ${escapeHtml(technical.view || "–")}</span><span>Phase: ${escapeHtml(technical.stage || "–")}</span><span>Aufgabe: ${escapeHtml(technical.questionPosition || "–")}</span><span>Fingerprint: ${escapeHtml(f.fingerprint || "–")}</span></div></div>` : "";
    const quiz = f.category === "rights" ? state.adminQuizzes.find(q => q.id === f.testCode) : null;
    const rightsAction = quiz ? `<div class="rightsReportActions"><button class="button ${quiz.rightsHold ? "secondary" : "danger"} rightsHoldToggle" type="button" data-code="${escapeHtml(quiz.id)}" data-hold="${quiz.rightsHold ? "false" : "true"}">${quiz.rightsHold ? "Sperre nach Klärung aufheben" : "Testzugang vorübergehend sperren"}</button></div>` : "";
    return `<article class="card feedbackItem"><div class="feedbackTop"><div><span class="eyebrow">${escapeHtml(feedbackCategoryLabel(f.category))}${f.category === "ai_question" ? ` · ${f.verdict === "good" ? "🙂 gut" : "🙁 schlecht"}` : ""}</span><h3>${escapeHtml(f.displayName || f.email || "Lehrkraft")}</h3><small>${escapeHtml(fmtDate(f.createdAt))}${f.testCode ? ` · Test ${escapeHtml(f.testCode)}` : ""}</small></div><select class="feedbackStatus" data-id="${escapeHtml(f.id)}"><option value="new" ${f.status === "new" ? "selected" : ""}>Neu</option><option value="working" ${f.status === "working" ? "selected" : ""}>In Bearbeitung</option><option value="done" ${f.status === "done" ? "selected" : ""}>Erledigt</option></select></div><p>${escapeHtml(f.message || "")}</p>${rightsAction}${snapshot}${errorSnapshot}<details><summary>Supportinformationen</summary><div class="supportMeta"><span>E-Mail: ${escapeHtml(f.email || "–")}</span><span>Version: ${escapeHtml(f.appVersion || "–")}</span><span>Umgebung: ${escapeHtml(f.environment || "–")}</span><span>Browser: ${escapeHtml(f.userAgent || "–")}</span>${technical ? `<span>Provider-Code: ${escapeHtml(technical.providerCode || "–")}</span><span>Viewport: ${escapeHtml(technical.viewport || "–")}</span><span>Online: ${technical.online === false ? "nein" : "ja"}</span><span>Client-Zeit: ${escapeHtml(technical.occurredAtClient || "–")}</span>` : ""}</div>${technical?.stack ? `<pre class="supportStack">${escapeHtml(technical.stack)}</pre>` : ""}</details></article>`;
  }).join("") : `<div class="emptyInline">Kein Feedback für diese Filter gefunden.</div>`);
  root.querySelectorAll(".feedbackStatus").forEach((sel)=>sel.addEventListener("change",()=>updateFeedbackStatus(sel.dataset.id,sel.value)));
  root.querySelectorAll(".rightsHoldToggle").forEach(button => button.addEventListener("click", () => toggleRightsHold(button.dataset.code, button.dataset.hold === "true")));
}

async function toggleRightsHold(code, hold) {
  if (!confirm(hold ? `Test ${code} für Schüler und Freigabelinks vorübergehend sperren?` : `Sperre für Test ${code} nach Klärung aufheben?`)) return;
  try {
    await updateDoc(doc(db, "quizzes", code), { rightsHold: hold, rightsHoldAt: hold ? serverTimestamp() : null, rightsHoldBy: hold ? state.user.uid : null });
    await writeAdminAudit(hold ? "rights_hold_placed" : "rights_hold_released", { quizId: code });
    const quiz = state.adminQuizzes.find(q => q.id === code);
    if (quiz) quiz.rightsHold = hold;
    renderAdminFeedback();
    toast(hold ? "Testzugang gesperrt. Bitte den Hinweis prüfen und die meldende Person informieren." : "Testzugang wieder freigegeben.");
  } catch (err) { console.error(err); toast("Testzugang konnte nicht geändert werden.", "error"); }
}

async function updateFeedbackStatus(id,status){try{await updateDoc(doc(db,"feedback",id),{status,updatedAt:serverTimestamp(),updatedBy:state.user.uid});await writeAdminAudit("feedback_status_changed",{feedbackId:id,status});const f=state.adminFeedback.find((x)=>x.id===id);if(f)f.status=status;renderAdminFeedback();const rights=state.adminFeedback.filter(x=>x.category==="rights"&&x.status!=="done").length;const errors=state.adminFeedback.filter(x=>x.category==="app_error"&&x.status!=="done").length;const tab=document.querySelector('[data-admin-tab="feedback"]');if(tab){const parts=[];if(errors)parts.push(`${errors} Fehler`);if(rights)parts.push(`${rights} Rechtehinweis${rights===1?"":"e"}`);tab.textContent=parts.length?`Feedback · ${parts.join(" · ")}`:"Feedback";}toast("Feedbackstatus aktualisiert.");}catch(err){console.error(err);toast("Status konnte nicht geändert werden.","error");}}

function auditActionInfo(action) {
  return ({
    announcement_created: ["📣", "Mitteilung veröffentlicht"],
    announcement_updated: ["✏️", "Mitteilung geändert"],
    announcement_deleted: ["🗑️", "Mitteilung gelöscht"],
    teacher_tour_updated: ["🧭", "Lehrer-Tutorial geändert"],
    feedback_status_changed: ["💬", "Feedbackstatus geändert"],
    password_reset_sent: ["🔑", "Passwort-Reset versendet"],
    user_suspended: ["⛔", "Lehrkraft gesperrt"],
    user_unsuspended: ["✅", "Lehrkraft entsperrt"],
    quiz_restored: ["↩️", "Test wiederhergestellt"],
    quiz_deleted_permanently: ["🗑️", "Test endgültig gelöscht"]
  })[action] || ["⚙️", action || "Admin-Aktion"];
}

function auditStatusLabel(status) {
  return ({ new: "Neu", working: "In Bearbeitung", done: "Erledigt" })[status] || status || "";
}

function auditDetailText(entry) {
  const d = entry.details || {};
  if (entry.action?.startsWith("announcement_")) return d.title ? `„${d.title}“` : "Mitteilung";
  if (entry.action === "teacher_tour_updated") return `${d.steps || "?"} Schritte · ${d.enabled === false ? "deaktiviert" : "aktiv"}${d.reshow ? " · erneut anzeigen" : ""}`;
  if (entry.action === "feedback_status_changed") return `Neuer Status: ${auditStatusLabel(d.status)}`;
  if (["password_reset_sent","user_suspended","user_unsuspended"].includes(entry.action)) return d.email || "Lehrkraft";
  if (entry.action === "quiz_restored") return d.quizId ? `Test ${d.quizId}` : "Test";
  if (entry.action === "quiz_deleted_permanently") return d.title ? `${d.title}${d.quizId ? ` · ${d.quizId}` : ""}` : (d.quizId ? `Test ${d.quizId}` : "Test");
  return "";
}

function renderAdminAudit(){
  const root=$("adminAuditList");
  if(!root)return;
  root.innerHTML=state.adminAudit.length?state.adminAudit.map((a)=>{
    const [icon,label]=auditActionInfo(a.action);
    const detail=auditDetailText(a);
    return `<div class="auditItem"><span class="auditIcon">${icon}</span><div class="auditMain"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(a.adminEmail||a.adminUid||"Admin")} · ${escapeHtml(fmtDate(a.createdAt))}</small>${detail?`<p>${escapeHtml(detail)}</p>`:""}</div></div>`;
  }).join(""):`<p class="hint">Noch keine Admin-Aktionen protokolliert.</p>`;
}

async function writeAdminAudit(action,details={}){if(!isAdmin())return;try{await addDoc(collection(db,"adminAudit"),{action,details,adminUid:state.user.uid,adminEmail:state.user.email||"",appVersion:APP_VERSION,createdAt:serverTimestamp()});}catch(err){console.warn("Admin-Log konnte nicht geschrieben werden:",err);}}
