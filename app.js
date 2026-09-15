const APP_VERSION = "2.1.0";
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
  gradeScalesDraft: null
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

function baseStudentUrl(code, preview = false) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("test", code);
  if (preview) url.searchParams.set("preview", "1");
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
  return Math.round(Number(n || 0) * 10) / 10;
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

  const rawStudentCode = new URLSearchParams(location.search).get("test");
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
$("backFromEditor").addEventListener("click", loadDashboard);
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
  return state.quizzes.filter((q) => {
    if (status === "published" && !q.published) return false;
    if (status === "draft" && q.published) return false;
    if (!term) return true;
    const hay = normalize([q.title, q.subject, q.grade, q.id].join(" "));
    return hay.includes(term);
  });
}

function renderQuizList() {
  const list = $("quizList");
  list.innerHTML = "";
  const filtered = filteredQuizzes();
  $("emptyQuizState").classList.toggle("hidden", state.quizzes.length !== 0);
  $("noFilterState").classList.toggle("hidden", state.quizzes.length === 0 || filtered.length !== 0);
  if (!filtered.length) return;

  filtered.forEach((q) => {
    const card = document.createElement("article");
    card.className = "card quizCard";
    card.innerHTML = `
      <div class="quizCardTop">
        <div>
          <h3>${escapeHtml(q.title || "Unbenannter Test")}</h3>
          <div class="meta">${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · Code ${q.id}</div>
        </div>
        <span class="status ${q.published ? "published" : "draft"}">${q.published ? "Veröffentlicht" : "Entwurf"}</span>
      </div>
      <div class="quizStats">
        <div><strong>${Number(q.questionCount || 0)}</strong><span>Aufgaben</span></div>
        <div><strong>${Number(q.totalPoints || 0)}</strong><span>Punkte</span></div>
      </div>
      <div class="quizActions">
        <button class="button secondary edit">Bearbeiten</button>
        <button class="button secondary results">Ergebnisse</button>
        <button class="button ghost duplicate">Duplizieren</button>
        ${q.published ? `<button class="button ghost share">Teilen</button>` : ""}
        <button class="button danger remove">Löschen</button>
      </div>`;
    card.querySelector(".edit").addEventListener("click", () => openEditor(q.id));
    card.querySelector(".results").addEventListener("click", () => openResults(q.id));
    card.querySelector(".duplicate").addEventListener("click", () => duplicateQuiz(q.id));
    card.querySelector(".share")?.addEventListener("click", () => showPublish(q.id));
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
    ownerId: state.user.uid,
    published: false,
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
      published: false,
      questionCount: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + Number(q.points || 0), 0)
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
    await deleteDoc(doc(db, "quizzes", code));
    toast("Test gelöscht.");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    toast("Test konnte nicht vollständig gelöscht werden.", "error");
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
  const prompt = `Du erstellst einen direkt importierbaren Schultest als JSON.\n\nRahmen:\n- Schulart: ${$("aiSchoolType").value.trim() || "Mittelschule"}\n- Bundesland: ${$("aiRegion").value.trim() || "Bayern"}\n- Fach: ${$("aiSubject").value.trim() || "nicht angegeben"}\n- Klassenstufe: ${$("aiGrade").value.trim() || "nicht angegeben"}\n- Thema: ${$("aiTopic").value.trim()}\n- Schwierigkeit: ${$("aiDifficulty").value}\n- ca. ${Number($("aiCount").value) || 10} Aufgaben\n- Bearbeitungszeit ca. ${Number($("aiDuration").value) || 30} Minuten\n- Gesamtpunkte ca. ${Number($("aiPoints").value) || 20}\n- Erlaubte Aufgabentypen: ${types.join(", ")}\n\nWichtig:\n1. Inhaltlich passend zur genannten Schulart, Klassenstufe und zum Thema.\n2. Klare, altersgerechte Formulierungen.\n3. Keine Aufgaben, deren Lösung vom aktuellen Tagesgeschehen abhängt.\n4. Gib AUSSCHLIESSLICH gültiges JSON zurück, keine Markdown-Codeblöcke und keine Erklärung.\n5. Verwende exakt eines der unten beschriebenen Formate pro Aufgabe.\n\nGesamtformat:\n{\n  "title": "Titel des Tests",\n  "subject": "Fach",\n  "grade": "Klasse",\n  "description": "Kurzer Hinweis für Schüler",\n  "questions": [ ... ]\n}\n\nGemeinsame Felder jeder Aufgabe:\n{ "type": "...", "text": "...", "points": 1 }\n\nTypen:\n- single / dropdown: zusätzlich "options": [{"text":"...","correct":true}, ...], exakt eine richtige Antwort.\n- multi: "options": [{"text":"...","correct":true/false}, ...], mindestens eine richtige Antwort.\n- text: "acceptedAnswers": ["Antwort", "Alternative"], optional "manualReview": false.\n- truefalse: "correctBoolean": true oder false.\n- gapfill: Schreibe die Lösungen direkt in eckige Klammern im Feld text, Alternativen mit |. Beispiel: "Die Hauptstadt ist [München|Muenchen]."\n- matching: "pairs": [{"left":"Begriff","right":"Zuordnung"}, ...].\n- ordering: "items": ["erster Schritt", "zweiter Schritt", ...] bereits in richtiger Reihenfolge.\n- grouping: "groups": [{"name":"Nomen","items":["Haus","Schule"]},{"name":"Verben","items":["gehen"]}].\n- markwords: "text" ist die Arbeitsanweisung, zusätzlich "passage": "Text zum Markieren" und "targetWords": ["Zielwort1","Zielwort2"]. Alle Vorkommen dieser Wörter gelten als richtig.\n- number: zusätzlich "numericAnswer": 20, "tolerance": 0.01, optional "unit": "€".\n\nAchte darauf, dass Punkte, Lösungen und Aufgaben fachlich zueinander passen.`;
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
  q.points = Math.max(0.5, Number(raw.points) || 1);
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
      totalPoints: questions.reduce((sum, q) => sum + Number(q.points || 0), 0)
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
    $("editorHeading").textContent = q.title || "Test bearbeiten";
    showView("editorView");
    renderQuestions();
    markSaved();
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

    caption.textContent = q.type === "gapfill" ? "Lückentext" : q.type === "markwords" ? "Arbeitsauftrag" : "Frage";
    text.placeholder = q.type === "gapfill" ? "z. B. Die Hauptstadt von Bayern ist [München]." : "Frage eingeben …";
    text.value = q.text || "";
    type.value = q.type;
    points.value = q.points || 1;

    text.addEventListener("input", (e) => {
      q.text = e.target.value;
      markDirty();
    });
    type.addEventListener("change", (e) => {
      q.type = e.target.value;
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
    label.innerHTML = `<span>Automatisch akzeptierte Antworten <small>(mit Komma trennen)</small></span><input type="text" value="${escapeHtml((q.acceptedAnswers || []).join(", "))}" placeholder="z. B. spannend, interessant">`;
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
    const box = document.createElement("div");
    box.className = "infoBox";
    box.innerHTML = `<strong>So funktioniert der Lückentext</strong><p>Schreibe die Lösung direkt im Fragetext in eckige Klammern. Alternativen trennst du mit <code>|</code>.</p><code>Die Hauptstadt von Bayern ist [München|Muenchen].</code><p>Die Lösungen werden Schülern nicht im Aufgabentext angezeigt.</p>`;
    container.appendChild(box);
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
    targets.innerHTML = `<span>Zielwörter <small>(mit Komma trennen; alle Vorkommen werden als richtig gewertet)</small></span><input value="${escapeHtml((q.targetWords || []).join(", "))}" placeholder="z. B. ich, du, wir">`;
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
  $("publishStatus").textContent = state.currentQuiz?.published ? "Veröffentlicht" : "Entwurf";
}

function markDirty() {
  $("saveState").textContent = "Ungespeicherte Änderungen";
  $("saveState").style.color = "#9a6700";
}

function markSaved() {
  $("saveState").textContent = "✓ Gespeichert";
  $("saveState").style.color = "#15803d";
  updateSummary();
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
      if (!gaps.length || gaps.some((g) => !g.answers.length)) return `Aufgabe ${i + 1}: Der Lückentext braucht mindestens eine Lösung in [eckigen Klammern].`;
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
    points: Number(q.points),
    position: Number(q.position || 0)
  };
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
  try {
    await updateDoc(doc(db, "quizzes", state.currentQuiz.id), {
      published: true,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    state.currentQuiz.published = true;
    updateSummary();
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
    if (!quiz.published && !ownerPreview) throw new Error("Dieser Test ist noch nicht veröffentlicht.");
    const qs = await getDocs(query(collection(db, "quizzes", code, "questions"), orderBy("position")));
    const questions = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderStudentQuiz(quiz, questions);
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

function renderStudentQuiz(quiz, questions) {
  const root = $("studentQuizCard");
  root.innerHTML = `
    <div class="studentHead">
      <span class="eyebrow">${escapeHtml(quiz.subject || "Test")} · Klasse ${escapeHtml(quiz.grade || "–")}</span>
      <h1>${escapeHtml(quiz.title)}</h1>
      <p>${escapeHtml(quiz.description || "")}</p>
      <div class="meta">${questions.length} Aufgaben · ${quiz.totalPoints || round1(questions.reduce((s, q) => s + Number(q.points || 0), 0))} Punkte · Code ${quiz.id}</div>
    </div>
    <form id="studentForm">
      <label class="studentNameLabel">Dein Name oder Kürzel<input id="studentName" type="text" required placeholder="Vorname Nachname"></label>
      <div id="studentQuestions"></div>
      <button id="studentSubmitBtn" class="button primary studentSubmit" type="submit">Antworten abgeben</button>
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
  const max = Number(q.points) || 0;
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

async function submitStudentQuiz(e, quiz, questions) {
  e.preventDefault();
  const name = $("studentName").value.trim();
  if (!name) {
    toast("Bitte deinen Namen eingeben.", "error");
    return;
  }
  if (!confirm("Willst du den Test wirklich abgeben?")) return;

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

  try {
    $("studentSubmitBtn").disabled = true;
    $("studentSubmitBtn").textContent = "Wird gespeichert …";
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
      submittedAt: serverTimestamp(),
      submittedAtLocal: new Date().toISOString()
    });
    renderStudentResult(quiz, questions, answers, grading, points, maxPoints, percent, needsReview);
    toast("Abgabe erfolgreich gespeichert.");
  } catch (err) {
    console.error(err);
    toast("Abgabe konnte nicht gespeichert werden.", "error");
    $("studentSubmitBtn").disabled = false;
    $("studentSubmitBtn").textContent = "Antworten abgeben";
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
    $("resultsMeta").textContent = `${state.submissions.length} Abgaben · ${quiz.totalPoints || 0} Punkte maximal · Notenschlüssel: ${getQuizScale(quiz).name || "Standard"}`;
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
  let html = `<table class="resultTable"><thead><tr><th>Name</th><th>Punkte</th><th>%</th><th>Note</th><th>Status</th><th>Zeit</th><th></th></tr></thead><tbody>`;
  state.submissions.forEach((s) => {
    html += `<tr><td><strong>${escapeHtml(s.studentName)}</strong></td><td>${escapeHtml(s.totalPoints)}/${escapeHtml(s.maxPoints)}</td><td>${escapeHtml(s.percent)}%</td><td>${submissionGrade(s)}</td><td><span class="pill ${s.status === "review" ? "review" : "graded"}">${s.status === "review" ? "Prüfen" : "Bewertet"}</span></td><td>${escapeHtml(fmtDate(s.submittedAt || s.submittedAtLocal))}</td><td><button class="button secondary reviewBtn" data-id="${s.id}">Bewerten</button></td></tr>`;
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
    div.innerHTML = `<strong>${i + 1}. ${escapeHtml(q.type === "gapfill" ? "Lückentext" : q.text)}</strong><div class="meta">Antwort: ${escapeHtml(answerDisplay(q, s.answers?.[q.id]))}</div><div class="meta">Lösung: ${escapeHtml(correctDisplay(q))}</div><div class="reviewPoints"><label>Punkte:</label><input class="manualPoints" data-qid="${q.id}" type="number" min="0" max="${Number(q.points)}" step="0.1" value="${Number(g.awardedPoints ?? g.autoPoints ?? 0)}"><span>/ ${Number(q.points)}</span></div>`;
    root.appendChild(div);
  });

  const recompute = () => {
    const pts = Array.from(panel.querySelectorAll(".manualPoints")).reduce((sum, x) => {
      const q = state.resultQuestions.find((item) => item.id === x.dataset.qid);
      const max = Number(q?.points || 0);
      return sum + Math.max(0, Math.min(max, Number(x.value) || 0));
    }, 0);
    const max = state.resultQuestions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    const pc = max ? Math.round((pts / max) * 100) : 0;
    const scale = s.gradeScaleSnapshot?.thresholds?.length === 6 ? s.gradeScaleSnapshot : getQuizScale(state.currentResultsQuiz);
    $("reviewTotal").textContent = `${round1(pts)}/${round1(max)} Punkte · ${pc}% · Note ${gradeFromPercent(pc, scale)}`;
  };
  panel.querySelectorAll(".manualPoints").forEach((x) => x.addEventListener("input", recompute));
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
    const awarded = Math.max(0, Math.min(qMax, Number(inp.value) || 0));
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
  const header = ["Name", ...state.resultQuestions.map((_, i) => `Aufgabe ${i + 1}`), "Punkte", "Max", "Prozent", "Note", "Status", "Zeit"];
  const rows = [header];
  state.submissions.forEach((s) => {
    const r = [s.studentName];
    state.resultQuestions.forEach((q) => r.push(answerDisplay(q, s.answers?.[q.id])));
    r.push(s.totalPoints, s.maxPoints, s.percent, s.status === "review" ? "" : submissionGrade(s), s.status, fmtDate(s.submittedAt || s.submittedAtLocal));
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
