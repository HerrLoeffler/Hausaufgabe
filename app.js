const APP_VERSION = "2.1.2";
console.info(`Lernplattform v${APP_VERSION}`);

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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const views = [
  "authView",
  "dashboardView",
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
  studentAttempt: null
};

function showView(id) {
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

function setTeacherBar() {
  const loggedIn = Boolean(state.user) && !new URLSearchParams(location.search).has("test");
  $("userBar").classList.toggle("hidden", !loggedIn);
  $("userLabel").textContent = state.profile?.displayName || state.user?.displayName || state.user?.email || "";
}

async function ensureProfileDefaults() {
  if (!state.user) return;
  const ref = doc(db, "users", state.user.uid);
  const current = state.profile || {};
  const patch = {};
  if (!current.settings) patch.settings = deepClone(DEFAULT_SETTINGS);
  if (!Array.isArray(current.gradeScales) || !current.gradeScales.length) patch.gradeScales = [deepClone(DEFAULT_SCALE)];
  if (Object.keys(patch).length) {
    await setDoc(ref, patch, { merge: true });
    state.profile = { ...current, ...patch };
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
    } catch (err) {
      console.error(err);
    }
  }
  setTeacherBar();

  const params = new URLSearchParams(location.search);
  const rawTemplateCode = params.get("template");
  const templateCode = rawTemplateCode ? rawTemplateCode.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  if ($("sharedLoginNotice")) $("sharedLoginNotice").classList.add("hidden");
  if (templateCode) {
    if (!user) {
      showView("authView");
      $("sharedLoginNotice")?.classList.remove("hidden");
      return;
    }
    await loadSharedTemplate(templateCode);
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
$("newQuizBtn").addEventListener("click", createQuiz);
$("emptyNewQuizBtn").addEventListener("click", createQuiz);
$("quizSearch").addEventListener("input", renderQuizList);
$("quizFilter").addEventListener("change", renderQuizList);
$("quizSort")?.addEventListener("change", renderQuizList);
$("backFromEditor").addEventListener("click", leaveEditorToDashboard);
$("backFromResults").addEventListener("click", loadDashboard);
$("settingsBtn").addEventListener("click", openSettings);
$("settingsTopBtn").addEventListener("click", openSettings);
$("aiCreateBtn").addEventListener("click", openAiView);

async function loadDashboard() {
  if (!state.user) return;
  showView("dashboardView");
  $("quizList").innerHTML = `<div class="card">Tests werden geladen …</div>`;
  try {
    const snap = await getDocs(query(collection(db, "quizzes"), where("ownerId", "==", state.user.uid)));
    state.quizzes = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt));
    renderQuizList();
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
  if (q.published) return { label: "Veröffentlicht", cls: "published" };
  return { label: "Entwurf", cls: "draft" };
}

function renderQuizList() {
  const list = $("quizList");
  list.innerHTML = "";
  const filtered = filteredQuizzes();
  $("emptyQuizState").classList.toggle("hidden", state.quizzes.length !== 0);
  $("noFilterState").classList.toggle("hidden", state.quizzes.length === 0 || filtered.length !== 0);
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
    ownerId: state.user.uid,
    published: false,
    ended: false,
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
  if (!confirm(`Test „${q?.title || code}“ wirklich löschen? Aufgaben und Abgaben werden ebenfalls entfernt.`)) return;
  try {
    const qSnap = await getDocs(collection(db, "quizzes", code, "questions"));
    for (const d of qSnap.docs) await deleteDoc(d.ref);
    const sSnap = await getDocs(collection(db, "quizzes", code, "submissions"));
    for (const d of sSnap.docs) await deleteDoc(d.ref);
    const aSnap = await getDocs(collection(db, "quizzes", code, "attempts"));
    for (const d of aSnap.docs) await deleteDoc(d.ref);
    await deleteDoc(doc(db, "quizzes", code));
    toast("Test gelöscht.");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht vollständig gelöscht werden.", "error");
  }
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
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (state.currentQuiz?.id === code) state.currentQuiz = { ...state.currentQuiz, published: false, ended: true };
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
    await updateDoc(doc(db, "quizzes", code), {
      published: true,
      ended: false,
      reopenedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (state.currentQuiz?.id === code) state.currentQuiz = { ...state.currentQuiz, published: true, ended: false };
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
    const link = baseTemplateUrl(code);
    await copyText(link, "Vorlagen-Link kopiert. Dein Kollege erhält eine eigene Kopie.");
  } catch (err) {
    console.error(err);
    toast("Vorlagen-Link konnte nicht erstellt werden. Prüfe nach dem Deploy die neuen Firestore-Regeln.", "error");
  }
}

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
    defaultDescription: $("defaultDescription").value.trim() || "Bearbeite alle Aufgaben sorgfältig.",
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

function openAiView() {
  const settings = getSettings();
  $("aiSubject").value = settings.defaultSubject || "";
  $("aiGrade").value = settings.defaultGrade || "";
  if ($("aiCustomNotes")) $("aiCustomNotes").value = "";
  const root = $("aiTypeChecks");
  root.innerHTML = "";
  QUESTION_TYPES.forEach(([value, label]) => {
    const item = document.createElement("label");
    item.className = "checkTile";
    const defaultChecked = ["single", "multi", "text", "truefalse", "number"].includes(value);
    item.innerHTML = `<input type="checkbox" value="${value}" ${defaultChecked ? "checked" : ""}><span>${escapeHtml(label)}</span>`;
    root.appendChild(item);
  });
  showView("aiView");
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
  const prompt = `Du erstellst einen direkt importierbaren Schultest als JSON.\n\nRahmen:\n- Schulart: ${$("aiSchoolType").value.trim() || "Mittelschule"}\n- Bundesland: ${$("aiRegion").value.trim() || "Bayern"}\n- Fach: ${$("aiSubject").value.trim() || "nicht angegeben"}\n- Klassenstufe: ${$("aiGrade").value.trim() || "nicht angegeben"}\n- Thema: ${$("aiTopic").value.trim()}\n- Schwierigkeit: ${$("aiDifficulty").value}\n- ca. ${Number($("aiCount").value) || 10} Aufgaben\n- Bearbeitungszeit ca. ${Number($("aiDuration").value) || 30} Minuten\n- Gesamtpunkte ca. ${Number($("aiPoints").value) || 20}\n- Erlaubte Aufgabentypen: ${types.join(", ")}${customBlock}\n\nWichtig:\n1. Inhaltlich passend zur genannten Schulart, Klassenstufe und zum Thema.\n2. Klare, altersgerechte Formulierungen.\n3. Keine Aufgaben, deren Lösung vom aktuellen Tagesgeschehen abhängt.\n4. Gib AUSSCHLIESSLICH gültiges JSON zurück, keine Markdown-Codeblöcke und keine Erklärung.\n5. Verwende exakt eines der unten beschriebenen Formate pro Aufgabe.\n6. Punkte dürfen nur in 0,5er-Schritten vergeben werden (z. B. 0,5 / 1 / 1,5 / 2).\n\nGesamtformat:\n{\n  "title": "Titel des Tests",\n  "subject": "Fach",\n  "grade": "Klasse",\n  "description": "Kurzer Hinweis für Schüler",\n  "questions": [ ... ]\n}\n\nGemeinsame Felder jeder Aufgabe:\n{ "type": "...", "text": "...", "points": 1 }\n\nTypen:\n- single / dropdown: zusätzlich "options": [{"text":"...","correct":true}, ...], exakt eine richtige Antwort.\n- multi: "options": [{"text":"...","correct":true/false}, ...], mindestens eine richtige Antwort.\n- text: "acceptedAnswers": ["Antwort", "Alternative"], optional "manualReview": false.\n- truefalse: "correctBoolean": true oder false.\n- gapfill: Schreibe die Lösungen direkt in eckige Klammern im Feld text, Alternativen mit |. Beispiel: "Die Hauptstadt ist [München|Muenchen]."\n- matching: "pairs": [{"left":"Begriff","right":"Zuordnung"}, ...].\n- ordering: "items": ["erster Schritt", "zweiter Schritt", ...] bereits in richtiger Reihenfolge.\n- grouping: "groups": [{"name":"Nomen","items":["Haus","Schule"]},{"name":"Verben","items":["gehen"]}].\n- markwords: "text" ist die Arbeitsanweisung, zusätzlich "passage": "Text zum Markieren" und "targetWords": ["Zielwort1","Zielwort2"]. Jedes passende Wort im Text gilt als richtige Markierung.\n- number: zusätzlich "numericAnswer": 20, "tolerance": 0.01, optional "unit": "€".\n\nAchte darauf, dass Punkte, Lösungen und Aufgaben fachlich zueinander passen.`;
  $("aiPromptOutput").value = prompt;
  toast("Prompt erzeugt.");
}

function stripCodeFence(text) {
  return String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function normalizeImportedQuestion(raw, index) {
  const type = QUESTION_TYPES.some(([value]) => value === raw.type) ? raw.type : "text";
  const q = newQuestion(type, false);
  q.text = String(raw.text || `Aufgabe ${index + 1}`);
  q.points = Math.max(0.5, round1(Number(raw.points) || 1));
  if (["single", "multi", "dropdown"].includes(type)) {
    q.options = Array.isArray(raw.options)
      ? raw.options.map((o) => ({ text: String(o.text || ""), correct: Boolean(o.correct) }))
      : [{ text: "", correct: true }, { text: "", correct: false }];
  }
  if (type === "text") {
    q.acceptedAnswers = Array.isArray(raw.acceptedAnswers) ? raw.acceptedAnswers.map(String) : [];
    q.manualReview = Boolean(raw.manualReview);
  }
  if (type === "truefalse") q.correctBoolean = Boolean(raw.correctBoolean);
  if (type === "matching") {
    q.pairs = Array.isArray(raw.pairs) ? raw.pairs.map((p) => ({ left: String(p.left || ""), right: String(p.right || "") })) : q.pairs;
  }
  if (type === "ordering") q.items = Array.isArray(raw.items) ? raw.items.map(String) : q.items;
  if (type === "grouping") {
    q.groups = Array.isArray(raw.groups)
      ? raw.groups.map((g) => ({ name: String(g.name || ""), items: Array.isArray(g.items) ? g.items.map(String) : [] }))
      : q.groups;
  }
  if (type === "markwords") {
    q.passage = String(raw.passage || "");
    q.targetWords = Array.isArray(raw.targetWords) ? raw.targetWords.map(String) : [];
  }
  if (type === "number") {
    q.numericAnswer = Number(raw.numericAnswer);
    q.tolerance = Math.max(0, Number(raw.tolerance) || 0);
    q.unit = String(raw.unit || "");
  }
  q.position = index + 1;
  return q;
}

async function importAiJson() {
  const rawText = stripCodeFence($("aiJsonInput").value);
  if (!rawText) {
    toast("Bitte zuerst die JSON-Antwort einfügen.", "error");
    return;
  }
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    toast("Das eingefügte Ergebnis ist kein gültiges JSON.", "error");
    return;
  }
  if (!Array.isArray(data.questions) || !data.questions.length) {
    toast("Im JSON wurde keine Aufgabenliste gefunden.", "error");
    return;
  }
  try {
    const questions = data.questions.map(normalizeImportedQuestion);
    const base = {
      ...quizDefaults(),
      title: String(data.title || "KI-Test"),
      subject: String(data.subject || $("aiSubject").value || getSettings().defaultSubject || ""),
      grade: String(data.grade || $("aiGrade").value || getSettings().defaultGrade || ""),
      description: String(data.description || getSettings().defaultDescription),
      questionCount: questions.length,
      totalPoints: round1(questions.reduce((sum, q) => sum + Number(q.points || 0), 0))
    };
    const { code } = await createQuizDocument(base);
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      const ref = doc(collection(db, "quizzes", code, "questions"));
      await setDoc(ref, { ...sanitizeQuestionForSave(q), position: i + 1, updatedAt: serverTimestamp() });
    }
    toast("KI-Test importiert.");
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
$("shareTemplateBtn")?.addEventListener("click", async () => {
  if (!state.currentQuiz) return;
  await shareQuizTemplate(state.currentQuiz.id);
});
$("endQuizBtn")?.addEventListener("click", async () => {
  if (!state.currentQuiz) return;
  if (state.isDirty && !(await saveCurrentQuiz(false))) return;
  endQuiz(state.currentQuiz.id, { returnToEditor: true });
});
$("quizUseTimeLimit")?.addEventListener("change", (e) => {
  $("quizTimeLimitWrap").classList.toggle("hidden", !e.target.checked);
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
    state.currentQuiz = q;
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    state.questions = qs.docs.map((d) => {
      const item = { id: d.id, ...d.data() };
      initializeTypeData(item, item.type || "single");
      return item;
    });
    state.loadedQuestionIds = new Set(state.questions.map((x) => x.id));

    $("quizTitle").value = q.title || "";
    $("quizSubject").value = q.subject || "";
    $("quizGrade").value = q.grade || "";
    $("quizDescription").value = q.description || "";
    populateQuizGradeScaleSelect(q.gradeScaleId || getSettings().defaultGradeScaleId, q.gradeScaleSnapshot);
    $("quizResultMode").value = q.resultMode || "points_grade";
    $("quizShowSolutions").checked = q.showSolutions ?? true;
    const hasTimeLimit = Number(q.timeLimitMinutes) > 0;
    $("quizUseTimeLimit").checked = hasTimeLimit;
    $("quizTimeLimitMinutes").value = hasTimeLimit ? Number(q.timeLimitMinutes) : 10;
    $("quizTimeLimitWrap").classList.toggle("hidden", !hasTimeLimit);
    $("editorHeading").textContent = q.title || "Test bearbeiten";
    showView("editorView");
    renderQuestions();
    markSaved();
    updateEditorPublishControls();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht geöffnet werden.", "error");
  }
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
["quizGradeScale", "quizResultMode", "quizShowSolutions"].forEach((id) => {
  $(id).addEventListener("change", () => markDirty());
});

function renderQuestions() {
  const root = $("questionList");
  root.innerHTML = "";
  state.questions.forEach((q, index) => {
    q.position = index + 1;
    const node = $("questionTemplate").content.firstElementChild.cloneNode(true);
    node.dataset.id = q.id;
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
      q.points = Math.max(0.5, round1(Number(e.target.value) || 1));
      e.target.value = q.points;
      updateSummary();
    });
    node.querySelector(".moveUp").addEventListener("click", () => moveQuestion(index, -1));
    node.querySelector(".moveDown").addEventListener("click", () => moveQuestion(index, 1));
    node.querySelector(".duplicateQuestion").addEventListener("click", () => duplicateQuestion(index));
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
      row.append(correct, text, remove);
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
  $("publishStatus").textContent = state.currentQuiz?.ended ? "Beendet" : state.currentQuiz?.published ? "Veröffentlicht" : "Entwurf";
}

function updateEditorPublishControls() {
  if (!state.currentQuiz) return;
  const ended = Boolean(state.currentQuiz.ended);
  const published = Boolean(state.currentQuiz.published) && !ended;
  $("endQuizBtn")?.classList.toggle("hidden", !published);
  if ($("publishBtn")) $("publishBtn").textContent = ended ? "Erneut öffnen" : published ? "Schülerlink" : "Veröffentlichen";
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
    base.options = (q.options || []).map((o) => ({ text: String(o.text || "").trim(), correct: Boolean(o.correct) }));
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
    const code = state.currentQuiz.id;
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
      questionCount: state.questions.length,
      totalPoints,
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, "quizzes", code), patch);

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
  if (!(await saveCurrentQuiz(false))) return;
  if (state.currentQuiz.published && !state.currentQuiz.ended) {
    showPublish(state.currentQuiz.id);
    return;
  }
  try {
    await updateDoc(doc(db, "quizzes", state.currentQuiz.id), {
      published: true,
      ended: false,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    state.currentQuiz.published = true;
    state.currentQuiz.ended = false;
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
    prompt("Kopieren:", text);
  }
}

async function showPublish(code) {
  try {
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
  } catch (err) {
    console.error(err);
    toast("Freigabe konnte nicht geladen werden.", "error");
  }
}

// ---------- Schüleransicht ----------
async function loadStudentQuiz(code) {
  showView("studentView");
  $("studentQuizCard").innerHTML = `<div id="studentLoading">Test wird geladen …</div>`;
  try {
    const quizSnap = await getDoc(doc(db, "quizzes", code));
    if (!quizSnap.exists()) throw new Error("Dieser Test existiert nicht.");
    const quiz = { id: code, ...quizSnap.data() };
    const preview = new URLSearchParams(location.search).get("preview") === "1";
    const ownerPreview = preview && state.user && quiz.ownerId === state.user.uid;
    if (quiz.ended && !ownerPreview) throw new Error("Dieser Test wurde beendet.");
    if (!quiz.published && !ownerPreview) throw new Error("Dieser Test ist noch nicht veröffentlicht.");
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    const questions = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderStudentQuiz(quiz, questions, { ownerPreview });
  } catch (err) {
    console.error(err);
    $("studentQuizCard").innerHTML = `<h1>Test nicht verfügbar</h1><p>${escapeHtml(err.message)}</p><a class="button primary" href="${escapeHtml(location.pathname)}">Zur Startseite</a>`;
  }
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
            timeLimitMinutes: Number(data.timeLimitMinutes || quiz.timeLimitMinutes)
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

  // Ältere lokale Timer aus Testversionen werden nicht zurückgesetzt, sondern übernommen.
  if (stored?.startedAt && !stored?.attemptId) {
    const attempt = {
      attemptId: null,
      startedAt: Number(stored.startedAt),
      name: stored.name || name,
      timeLimitMinutes: Number(quiz.timeLimitMinutes)
    };
    state.studentAttempt = attempt;
    return attempt;
  }

  const attemptId = randomId("attempt");
  const ref = doc(db, "quizzes", quiz.id, "attempts", attemptId);
  await setDoc(ref, {
    timeLimitMinutes: Math.round(Number(quiz.timeLimitMinutes)),
    startedAt: serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  });
  const snap = await getDoc(ref);
  const startedAt = toMillis(snap.data()?.startedAt) || Date.now();
  const attempt = {
    attemptId,
    startedAt,
    name,
    timeLimitMinutes: Math.round(Number(quiz.timeLimitMinutes))
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
  const root = $("studentQuizCard");
  const minutes = Number(quiz.timeLimitMinutes) > 0 ? Math.round(Number(quiz.timeLimitMinutes)) : 0;
  const timed = minutes > 0 && !ownerPreview;
  const storedTimer = timed ? readStoredTimer(quiz.id) : null;
  const timerMeta = minutes > 0
    ? `<span class="studentTimeInfo">⏱ ${minutes} Minuten${ownerPreview ? " · Vorschau ohne laufenden Timer" : ""}</span>`
    : "";
  root.innerHTML = `
    <div class="studentHead">
      <div class="studentHeadTop"><span class="eyebrow">${escapeHtml(quiz.subject || "Test")} · Klasse ${escapeHtml(quiz.grade || "–")}</span>${timerMeta}</div>
      <h1>${escapeHtml(quiz.title)}</h1>
      <p>${escapeHtml(quiz.description || "")}</p>
      <div class="meta">${questions.length} Aufgaben · ${quiz.totalPoints || round1(questions.reduce((s, q) => s + Number(q.points || 0), 0))} Punkte · Code ${quiz.id}</div>
    </div>
    <form id="studentForm">
      <label class="studentNameLabel">Dein Name oder Kürzel<input id="studentName" type="text" required placeholder="Vorname Nachname" value="${escapeHtml(storedTimer?.name || "")}"></label>
      ${timed ? `<div id="studentStartGate" class="studentStartGate"><div><strong>${storedTimer ? "Laufenden Test fortsetzen" : `Zeitlimit: ${minutes} Minuten`}</strong><p>${storedTimer ? "Der Timer läuft seit deinem ersten Start weiter." : "Der Countdown beginnt erst, wenn du auf „Test starten“ klickst. Bei 00:00 werden deine aktuellen Antworten automatisch abgegeben."}</p></div><button id="studentStartBtn" class="button primary" type="button">${storedTimer ? "Test fortsetzen" : "Test starten"}</button></div>` : ""}
      <div id="studentTimerBar" class="studentTimerBar ${timed ? "hidden" : ""}"><span>Verbleibende Zeit</span><strong id="studentTimerText">${minutes ? `${String(minutes).padStart(2,"0")}:00` : ""}</strong></div>
      <div id="studentQuestions" class="${timed ? "hidden" : ""}"></div>
      <button id="studentSubmitBtn" class="button primary studentSubmit ${timed ? "hidden" : ""}" type="submit">Antworten abgeben</button>
    </form>
    <div id="studentResult" class="studentResult hidden"></div>`;
  const qRoot = $("studentQuestions");

  questions.forEach((q, i) => {
    const section = document.createElement("section");
    section.className = "studentQuestion";
    section.dataset.qid = q.id;
    section.dataset.type = q.type;
    if (q.type !== "gapfill") section.innerHTML = `<h3>${i + 1}. ${escapeHtml(q.text)} <span class="meta">(${Number(q.points)} P.)</span></h3>`;
    else section.innerHTML = `<h3>${i + 1}. Lückentext <span class="meta">(${Number(q.points)} P.)</span></h3>`;

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
      sel.innerHTML = `<option value="">Bitte auswählen …</option>` + (q.options || []).map((o, idx) => `<option value="${idx}">${escapeHtml(o.text)}</option>`).join("");
      section.appendChild(sel);
    } else if (q.type === "single" || q.type === "multi") {
      (q.options || []).forEach((o, idx) => {
        const label = document.createElement("label");
        label.className = "choice";
        label.innerHTML = `<input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${q.id}" value="${idx}"><span>${escapeHtml(o.text)}</span>`;
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

  $("studentForm").addEventListener("submit", (e) => submitStudentQuiz(e, quiz, questions));
  if (timed) {
    $("studentStartBtn").addEventListener("click", () => startTimedStudentQuiz(quiz, questions));
  } else {
    $("studentTimerBar")?.classList.add("hidden");
  }
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
    $("studentStartGate")?.classList.add("hidden");
    $("studentQuestions")?.classList.remove("hidden");
    $("studentSubmitBtn")?.classList.remove("hidden");
    $("studentTimerBar")?.classList.remove("hidden");
    runStudentTimer(quiz, questions, attempt.startedAt, attempt.timeLimitMinutes);
  } catch (err) {
    console.error(err);
    toast("Der Timer konnte nicht gestartet werden. Bitte Seite neu laden und erneut versuchen.", "error");
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = readStoredTimer(quiz.id) ? "Test fortsetzen" : "Test starten";
    }
  }
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
  if (!force && !confirm("Willst du den Test wirklich abgeben?")) return;

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
    };
    points += result.awarded;
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
      startedAtServerMillis: effectiveStart,
      startedAtLocal: effectiveStart ? new Date(effectiveStart).toISOString() : null,
      elapsedSeconds,
      autoSubmitted: Boolean(autoSubmitted),
      submittedAt: serverTimestamp(),
      submittedAtLocal: new Date().toISOString()
    });
    localStorage.removeItem(studentTimerKey(quiz.id));
    state.studentAttempt = null;
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
