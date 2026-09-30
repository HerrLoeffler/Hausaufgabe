import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { appEnvironment, firebaseConfig } from "./firebase-config.js";

const REGION = "europe-west1";
const PARTICIPANTS = 30;
const POLL_ROUNDS = 3;
const STUDENT_APP_NAME = "gradecrew-gate-e-students";
const SYSTEM_TITLE = "SYSTEMTEST – Gate E – 30 Teilnehmer";
const FORBIDDEN_PAPER_KEYS = new Set([
  "correct", "correctBoolean", "acceptedAnswers", "numericAnswer", "tolerance",
  "targetWords", "acceptedOrders", "gradingKey", "answerKey", "solutions",
  "solutionSnapshot", "paperSecret", "tokenHash", "teacherDecoder"
]);

const $ = selector => document.querySelector(selector);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const bytes = value => new TextEncoder().encode(JSON.stringify(value ?? null)).length;

function randomUrlSafe(size = 32) {
  const data = new Uint8Array(size);
  crypto.getRandomValues(data);
  let binary = "";
  data.forEach(value => { binary += String.fromCharCode(value); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const data = new Uint8Array(8);
  crypto.getRandomValues(data);
  return "GE" + [...data].map(value => alphabet[value % alphabet.length]).join("");
}

function largeImageDataUrl() {
  // About 100 kB of valid SVG markup: large enough to exercise real paper payloads
  // while staying comfortably below Firestore's per-document limit.
  const rows = [];
  for (let index = 0; index < 1150; index += 1) {
    const x = 12 + (index % 50) * 15;
    const y = 12 + Math.floor(index / 50) * 15;
    rows.push(`<circle cx="${x}" cy="${y}" r="4" fill="hsl(${index % 360} 55% 65%)"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="380" viewBox="0 0 780 380"><rect width="780" height="380" fill="white"/><text x="24" y="350" font-family="sans-serif" font-size="22">GradeCrew Gate E Payload</text>${rows.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function systemQuestions() {
  return [
    {
      id: "ge-single", type: "single", position: 1, points: 1,
      text: "Welche Stadt ist die Hauptstadt von Deutschland?",
      options: [
        { text: "Hamburg", correct: false },
        { text: "Berlin", correct: true },
        { text: "München", correct: false }
      ],
      imageDataUrl: largeImageDataUrl(), imageAlt: "Technisches Testbild für den Gate-E-Payloadtest."
    },
    {
      id: "ge-multi", type: "multi", position: 2, points: 1,
      text: "Welche Zahlen sind gerade?",
      options: [
        { text: "2", correct: true },
        { text: "3", correct: false },
        { text: "4", correct: true },
        { text: "5", correct: false }
      ]
    },
    {
      id: "ge-text", type: "text", position: 3, points: 1,
      text: "Nenne die Landeshauptstadt von Bayern.",
      acceptedAnswers: ["München", "Muenchen"], manualReview: false
    },
    {
      id: "ge-dropdown", type: "dropdown", position: 4, points: 1,
      text: "Wähle den Stoff, der bei Raumtemperatur typischerweise flüssig ist.",
      options: [
        { text: "Eisen", correct: false },
        { text: "Wasser", correct: true },
        { text: "Stein", correct: false }
      ]
    },
    {
      id: "ge-truefalse", type: "truefalse", position: 5, points: 1,
      text: "Richtig oder falsch: 7 · 8 = 56.", correctBoolean: true
    },
    {
      id: "ge-gapfill", type: "gapfill", position: 6, points: 1,
      text: "[Berlin] ist die Hauptstadt von [Deutschland]."
    },
    {
      id: "ge-matching", type: "matching", position: 7, points: 1,
      text: "Ordne Bundesland und Landeshauptstadt zu.",
      pairs: [
        { left: "Bayern", right: "München" },
        { left: "Hessen", right: "Wiesbaden" },
        { left: "Sachsen", right: "Dresden" }
      ]
    },
    {
      id: "ge-ordering", type: "ordering", position: 8, points: 1,
      text: "Bringe den Arbeitsablauf in eine sinnvolle Reihenfolge.",
      items: ["Planen", "Erstellen", "Prüfen", "Veröffentlichen"]
    },
    {
      id: "ge-grouping", type: "grouping", position: 9, points: 1,
      text: "Ordne die Lebensmittel den Gruppen zu.",
      groups: [
        { name: "Obst", items: ["Apfel", "Birne"] },
        { name: "Gemüse", items: ["Karotte", "Gurke"] }
      ]
    },
    {
      id: "ge-markwords", type: "markwords", position: 10, points: 1,
      text: "Markiere die beiden Farbwörter.",
      passage: "Heute sehe ich einen roten Ball und einen blauen Stift.",
      targetWords: ["roten", "blauen"]
    },
    {
      id: "ge-number", type: "number", position: 11, points: 1,
      text: "Berechne 6 · 7.", numericAnswer: 42, tolerance: 0, unit: ""
    }
  ];
}

function quizDocument(ownerId, code) {
  return {
    title: `${SYSTEM_TITLE} · ${new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}`,
    subject: "Systemtest",
    grade: "–",
    description: "Automatisch erzeugter Staging-Systemtest für Gate E. Enthält alle 11 Aufgabentypen und eine größere Bild-Payload.",
    gradeScaleId: "standard",
    gradeScaleSnapshot: { id: "standard", name: "Standard", thresholds: [91, 77, 57, 39, 25, 0] },
    resultMode: "points_grade",
    showSolutions: true,
    timeLimitMinutes: null,
    startMode: "student",
    shuffleQuestions: true,
    shuffleAnswers: true,
    sessionState: "open",
    sessionRunId: null,
    sessionStartedAt: null,
    ownerId,
    accessCode: code,
    published: false,
    ended: false,
    isDeleted: false,
    rightsHold: false,
    shareEnabled: false,
    questionCount: 11,
    totalPoints: 11,
    systemTest: true,
    systemTestKind: "gate-e",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

function questionForSave(question) {
  const { id, ...data } = question;
  return { ...data, updatedAt: serverTimestamp(), systemTest: true };
}

function assertNoSolutionLeak(value, path = "paper") {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PAPER_KEYS.has(key)) throw new Error(`Lösungsleck im Schülerpapier: ${path}.${key}`);
    assertNoSolutionLeak(child, `${path}.${key}`);
  }
}

function normalizedWord(value) {
  return String(value || "").trim().toLocaleLowerCase("de-DE").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function wordIndexes(passage, targets) {
  const wanted = new Set(targets.map(normalizedWord));
  const pieces = String(passage || "").split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu).filter(Boolean);
  let index = 0;
  const result = [];
  for (const piece of pieces) {
    if (!/[\p{L}\p{N}]/u.test(piece[0] || "")) continue;
    if (wanted.has(normalizedWord(piece))) result.push(String(index));
    index += 1;
  }
  return result;
}

function answerQuestion(question) {
  const option = text => question.options?.find(entry => entry.text === text)?.id || "";
  if (question.id === "ge-single") return option("Berlin");
  if (question.id === "ge-multi") return [option("2"), option("4")].filter(Boolean);
  if (question.id === "ge-text") return "München";
  if (question.id === "ge-dropdown") return option("Wasser");
  if (question.id === "ge-truefalse") return "true";
  if (question.id === "ge-gapfill") return ["Berlin", "Deutschland"];
  if (question.id === "ge-matching") {
    const correct = { Bayern: "München", Hessen: "Wiesbaden", Sachsen: "Dresden" };
    const rights = new Map((question.rightItems || []).map(item => [item.text, item.id]));
    return Object.fromEntries((question.leftItems || []).map(item => [item.id, rights.get(correct[item.text]) || ""]));
  }
  if (question.id === "ge-ordering") {
    const byText = new Map((question.items || []).map(item => [item.text, item.id]));
    return ["Planen", "Erstellen", "Prüfen", "Veröffentlichen"].map(text => byText.get(text)).filter(Boolean);
  }
  if (question.id === "ge-grouping") {
    const target = { Apfel: "Obst", Birne: "Obst", Karotte: "Gemüse", Gurke: "Gemüse" };
    const groups = new Map((question.groups || []).map(group => [group.name, group.id]));
    return Object.fromEntries((question.items || []).map(item => [item.id, groups.get(target[item.text]) || ""]));
  }
  if (question.id === "ge-markwords") return wordIndexes(question.passage, ["roten", "blauen"]);
  if (question.id === "ge-number") return "42";
  return null;
}

function answersForPaper(paper) {
  return Object.fromEntries((paper || []).map(question => [question.id, answerQuestion(question)]));
}

function percentile(values, fraction) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))];
}

function metrics(values) {
  return {
    p50: Math.round(percentile(values, 0.50)),
    p95: Math.round(percentile(values, 0.95)),
    p99: Math.round(percentile(values, 0.99)),
    max: Math.round(Math.max(0, ...values))
  };
}

function hasSolutions(receipt) {
  return Boolean(receipt?.solutions || receipt?.solutionsReleased === true);
}

function receiptId(receipt) {
  return String(receipt?.submissionId || receipt?.attemptId || "");
}

function panel() {
  let root = $("#gateELab");
  if (root) return root;
  root = document.createElement("aside");
  root.id = "gateELab";
  root.setAttribute("aria-label", "Gate E Systemtest");
  root.innerHTML = `
    <div class="ge-head"><strong>🧪 Gate E · Staging-Lab</strong><button type="button" class="ge-close" aria-label="Schließen">×</button></div>
    <p>Erzeugt <strong>einen echten Systemtest</strong> in deinem eingeloggten Lehrkraftkonto und lässt anschließend <strong>30 virtuelle Schüler</strong> über die echten Secure-Functions teilnehmen.</p>
    <div class="ge-warning">Nur Staging. Produktion wird nicht verwendet.</div>
    <button type="button" class="ge-start">Systemtest + 30 Teilnehmer starten</button>
    <div class="ge-status" aria-live="polite">Bereit.</div>
    <pre class="ge-report hidden"></pre>`;
  const style = document.createElement("style");
  style.textContent = `
    #gateELab{position:fixed;right:18px;bottom:18px;z-index:2147483000;width:min(430px,calc(100vw - 24px));max-height:calc(100vh - 36px);overflow:auto;background:#fff;border:1px solid #d9dee8;border-radius:18px;box-shadow:0 18px 60px rgba(31,41,55,.22);padding:16px;font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#18212f}
    #gateELab .ge-head{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:16px}
    #gateELab .ge-close{border:0;background:transparent;font-size:24px;cursor:pointer;color:#596274}
    #gateELab .ge-warning{padding:9px 11px;border-radius:10px;background:#fff7d6;margin:10px 0;font-weight:650}
    #gateELab .ge-start{width:100%;border:0;border-radius:12px;padding:11px 14px;background:#273a76;color:white;font-weight:750;cursor:pointer}
    #gateELab .ge-start:disabled{opacity:.55;cursor:wait}
    #gateELab .ge-status{margin-top:12px;white-space:pre-line}
    #gateELab .ge-report{margin-top:10px;padding:10px;border-radius:10px;background:#f5f7fb;overflow:auto;font-size:12px;white-space:pre-wrap}
    #gateELab .hidden{display:none!important}`;
  document.head.appendChild(style);
  document.body.appendChild(root);
  root.querySelector(".ge-close")?.addEventListener("click", () => root.remove());
  return root;
}

function setStatus(root, text) {
  const node = root.querySelector(".ge-status");
  if (node) node.textContent = text;
}

async function createSystemTest(db, user) {
  const code = randomCode();
  const questions = systemQuestions();
  const quizRef = doc(db, "quizzes", code);
  await setDoc(quizRef, quizDocument(user.uid, code));
  try {
    const batch = writeBatch(db);
    questions.forEach(question => batch.set(doc(db, "quizzes", code, "questions", question.id), questionForSave(question)));
    await batch.commit();
    await updateDoc(quizRef, {
      published: true,
      ended: false,
      sessionState: "open",
      sessionRunId: null,
      sessionStartedAt: null,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    await updateDoc(quizRef, { isDeleted: true, published: false, updatedAt: serverTimestamp() }).catch(() => {});
    throw error;
  }
  return { code, questions };
}

async function runLoadTest(studentApp, quizId, onProgress) {
  const functions = getFunctions(studentApp, REGION);
  const calls = Object.fromEntries([
    "getAssessmentInfo", "startAssessmentAttempt", "resumeAssessmentAttempt",
    "submitAssessmentAttempt", "getAssessmentReceipt"
  ].map(name => [name, httpsCallable(functions, name)]));
  const latency = Object.fromEntries(Object.keys(calls).map(name => [name, []]));
  const payloads = Object.fromEntries(Object.keys(calls).map(name => [name, []]));

  async function invoke(name, data) {
    const started = performance.now();
    const response = await calls[name](data);
    latency[name].push(performance.now() - started);
    payloads[name].push(bytes(response?.data));
    return response?.data || {};
  }

  onProgress("1/4 · Öffentlichen Teststatus prüfen …");
  const info = await invoke("getAssessmentInfo", { quizId });
  if (info?.quiz?.questionCount !== 11) throw new Error(`Systemtest meldet ${info?.quiz?.questionCount ?? "?"} statt 11 Aufgaben.`);

  onProgress(`2/4 · ${PARTICIPANTS} Schüler nahezu gleichzeitig starten …`);
  const students = Array.from({ length: PARTICIPANTS }, (_, index) => ({
    name: `GateE-${String(index + 1).padStart(2, "0")}`,
    clientAttemptId: randomUrlSafe(24),
    attemptToken: randomUrlSafe(32)
  }));
  const started = await Promise.all(students.map(async student => {
    const response = await invoke("startAssessmentAttempt", {
      quizId,
      studentName: student.name,
      clientAttemptId: student.clientAttemptId,
      attemptToken: student.attemptToken
    });
    const paper = Array.isArray(response.paper) ? response.paper : [];
    if (response.status !== "running") throw new Error(`${student.name}: Status ${response.status || "?"} statt running.`);
    if (paper.length !== 11) throw new Error(`${student.name}: ${paper.length} statt 11 Aufgaben erhalten.`);
    assertNoSolutionLeak(paper);
    return { ...student, attemptId: response.attemptId, paper, answers: answersForPaper(paper), paperBytes: bytes(paper) };
  }));
  const uniqueAttempts = new Set(started.map(student => student.attemptId));
  if (uniqueAttempts.size !== PARTICIPANTS) throw new Error(`Nur ${uniqueAttempts.size}/${PARTICIPANTS} eindeutige Attempts.`);

  onProgress(`3/4 · ${POLL_ROUNDS * PARTICIPANTS} Status-Polls und Doppelabgaben ausführen …`);
  for (let round = 0; round < POLL_ROUNDS; round += 1) {
    await Promise.all(started.map(async student => {
      const response = await invoke("resumeAssessmentAttempt", {
        quizId,
        attemptId: student.attemptId,
        attemptToken: student.attemptToken,
        stateOnly: true
      });
      if (response.status !== "running") throw new Error(`${student.name}: Poll meldet ${response.status || "?"}.`);
      if (response.paper) throw new Error(`${student.name}: stateOnly-Poll lieferte unerwartet ein Aufgabenpapier.`);
    }));
  }

  const submitReceipts = await Promise.all(started.map(async student => {
    const payload = {
      quizId,
      attemptId: student.attemptId,
      attemptToken: student.attemptToken,
      answers: student.answers,
      autoSubmitted: false
    };
    const [first, duplicate] = await Promise.all([
      invoke("submitAssessmentAttempt", payload),
      invoke("submitAssessmentAttempt", payload)
    ]);
    const firstReceipt = first.receipt || first;
    const duplicateReceipt = duplicate.receipt || duplicate;
    const firstId = receiptId(firstReceipt);
    const duplicateId = receiptId(duplicateReceipt);
    if (!firstId || firstId !== duplicateId) throw new Error(`${student.name}: Doppelabgabe war nicht idempotent.`);
    if (hasSolutions(firstReceipt) || hasSolutions(duplicateReceipt)) throw new Error(`${student.name}: Lösung vor Testende ausgeliefert.`);
    return firstReceipt;
  }));

  onProgress(`4/4 · ${PARTICIPANTS} Receipts nachprüfen …`);
  const finalReceipts = await Promise.all(started.map(async student => {
    const response = await invoke("getAssessmentReceipt", {
      quizId,
      attemptId: student.attemptId,
      attemptToken: student.attemptToken
    });
    const receipt = response.receipt || response;
    if (hasSolutions(receipt)) throw new Error(`${student.name}: Receipt enthält vor Testende Lösungen.`);
    if (!receiptId(receipt)) throw new Error(`${student.name}: Receipt enthält keine Abgabe-ID.`);
    if (Number(receipt.totalPoints) !== Number(receipt.maxPoints) || Number(receipt.maxPoints) !== 11) {
      throw new Error(`${student.name}: erwartete 11/11 Punkte, erhalten ${receipt.totalPoints ?? "?"}/${receipt.maxPoints ?? "?"}.`);
    }
    return receipt;
  }));

  return {
    gate: "E",
    pass: true,
    quizId,
    participants: PARTICIPANTS,
    uniqueAttempts: uniqueAttempts.size,
    polls: POLL_ROUNDS * PARTICIPANTS,
    duplicateSubmits: PARTICIPANTS,
    submissions: submitReceipts.length,
    receipts: finalReceipts.length,
    maxPaperBytes: Math.max(...started.map(student => student.paperBytes)),
    latencyMs: Object.fromEntries(Object.entries(latency).map(([name, values]) => [name, metrics(values)])),
    responsePayloadBytes: Object.fromEntries(Object.entries(payloads).map(([name, values]) => [name, metrics(values)])),
    finishedAt: new Date().toISOString()
  };
}

async function runGateE(root, teacherApp, studentApp, user) {
  const button = root.querySelector(".ge-start");
  const report = root.querySelector(".ge-report");
  button.disabled = true;
  report.classList.add("hidden");
  report.textContent = "";
  let code = "";
  try {
    setStatus(root, "Systemtest wird in deinem Staging-Konto angelegt …");
    const db = getFirestore(teacherApp);
    const created = await createSystemTest(db, user);
    code = created.code;
    setStatus(root, `Test ${code} wurde veröffentlicht.\n30 virtuelle Schüler werden gestartet …`);
    await sleep(250);
    const result = await runLoadTest(studentApp, code, text => setStatus(root, `${text}\nTestcode: ${code}`));
    await updateDoc(doc(db, "quizzes", code), {
      gateELastRunAt: serverTimestamp(),
      gateELastRunPass: true,
      gateELastRunParticipants: PARTICIPANTS,
      updatedAt: serverTimestamp()
    });
    setStatus(root, `PASS ✅\n${PARTICIPANTS}/${PARTICIPANTS} Starts · ${result.polls}/${result.polls} Polls · ${result.submissions}/${PARTICIPANTS} Abgaben · ${result.receipts}/${PARTICIPANTS} Receipts\nTestcode: ${code}\nDie 30 Abgaben bleiben zur Sichtprüfung in „Ergebnisse“ erhalten.`);
    report.textContent = JSON.stringify(result, null, 2);
    report.classList.remove("hidden");
  } catch (error) {
    if (code) {
      await updateDoc(doc(getFirestore(teacherApp), "quizzes", code), {
        gateELastRunAt: serverTimestamp(),
        gateELastRunPass: false,
        gateELastRunError: String(error?.message || error).slice(0, 600),
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }
    setStatus(root, `FAIL ❌\n${error?.message || error}${code ? `\nTestcode: ${code}` : ""}`);
    console.error("Gate E Lab failed", error);
  } finally {
    button.disabled = false;
    button.textContent = "Neuen Gate-E-Systemtest starten";
  }
}

export function installGateELab() {
  const params = new URLSearchParams(location.search);
  if (appEnvironment !== "staging" || params.get("gateE") !== "1") return;
  const teacherApp = getApp();
  const studentApp = getApps().find(app => app.name === STUDENT_APP_NAME)
    || initializeApp(firebaseConfig, STUDENT_APP_NAME);
  const auth = getAuth(teacherApp);
  const root = panel();
  setStatus(root, "Warte auf das eingeloggte Staging-Konto …");
  onAuthStateChanged(auth, user => {
    const button = root.querySelector(".ge-start");
    if (!user) {
      button.disabled = true;
      setStatus(root, "Bitte zuerst normal bei GradeCrew anmelden. Danach erscheint der Startknopf automatisch.");
      return;
    }
    button.disabled = false;
    setStatus(root, "Bereit. Der Systemtest wird dem aktuell eingeloggten Lehrkraftkonto zugeordnet. Die 30 Schüler laufen getrennt und ohne Lehrkraft-Login.");
    if (!button.dataset.bound) {
      button.dataset.bound = "1";
      button.addEventListener("click", () => runGateE(root, teacherApp, studentApp, auth.currentUser));
    }
  });
}
