import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";

const REGION = "europe-west1";
const STORAGE_VERSION = "v2";

function normalizeQuizId(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function randomUrlSafe(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  let binary = "";
  buffer.forEach(value => { binary += String.fromCharCode(value); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sessionKey(quizId) {
  return `gradecrew_secure_assessment:${STORAGE_VERSION}:${normalizeQuizId(quizId)}`;
}

function readSession(quizId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(sessionKey(quizId)) || "null");
    if (!parsed || parsed.version !== STORAGE_VERSION) return null;
    if (typeof parsed.clientAttemptId !== "string" || typeof parsed.attemptToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearSession(quizId) {
  localStorage.removeItem(sessionKey(quizId));
}

function writeSession(quizId, session) {
  const normalizedId = normalizeQuizId(quizId);
  const safe = {
    version: STORAGE_VERSION,
    quizId: normalizedId,
    clientAttemptId: String(session.clientAttemptId),
    attemptToken: String(session.attemptToken),
    attemptId: session.attemptId ? String(session.attemptId) : null,
    studentName: session.studentName ? String(session.studentName) : null,
    status: session.status ? String(session.status) : null,
    sessionRunId: session.sessionRunId ? String(session.sessionRunId) : null,
    updatedAt: Date.now()
  };
  localStorage.setItem(sessionKey(normalizedId), JSON.stringify(safe));
  return safe;
}

function newSession(quizId) {
  return writeSession(quizId, {
    clientAttemptId: randomUrlSafe(24),
    attemptToken: randomUrlSafe(32),
    attemptId: null,
    studentName: null,
    status: "new",
    sessionRunId: null
  });
}

function ensureSession(quizId) {
  return readSession(quizId) || newSession(quizId);
}

function normalizeCallableError(error) {
  const code = String(error?.code || "").replace(/^functions\//, "");
  const known = {
    "invalid-argument": "Die Anfrage war ungültig. Bitte lade die Seite neu.",
    "not-found": "Dieser Test oder Bearbeitungsversuch wurde nicht gefunden.",
    "permission-denied": "Dieser Bearbeitungsversuch gehört nicht zu diesem Browser.",
    "failed-precondition": error?.message || "Der Test kann gerade nicht fortgesetzt werden.",
    "aborted": "Der Test wurde gerade geändert. Bitte versuche es erneut.",
    "deadline-exceeded": "Die serverseitige Abgabefrist ist abgelaufen. Bitte wende dich an deine Lehrkraft.",
    "resource-exhausted": "Zu viele Startversuche. Bitte kurz warten oder die Lehrkraft informieren.",
    "unavailable": "GradeCrew ist gerade nicht erreichbar. Deine Eingaben bleiben im Browser; versuche es gleich erneut."
  };
  const wrapped = new Error(known[code] || error?.message || "Die Verbindung zum Prüfungsserver ist fehlgeschlagen.");
  wrapped.code = code || "unknown";
  wrapped.cause = error;
  wrapped.reference = /^[A-Za-z0-9-]{1,80}$/.test(error?.details?.reference || "") ? error.details.reference : "";
  return wrapped;
}

export function createSecureAssessmentClient(firebaseApp) {
  const functions = getFunctions(firebaseApp, REGION);
  const infoCall = httpsCallable(functions, "getAssessmentInfo");
  const startCall = httpsCallable(functions, "startAssessmentAttempt");
  const resumeCall = httpsCallable(functions, "resumeAssessmentAttempt");
  const submitCall = httpsCallable(functions, "submitAssessmentAttempt");
  const receiptCall = httpsCallable(functions, "getAssessmentReceipt");

  async function invoke(callable, data) {
    try {
      const response = await callable(data);
      return response?.data || {};
    } catch (error) {
      throw normalizeCallableError(error);
    }
  }

  async function getInfo(rawQuizId) {
    const quizId = normalizeQuizId(rawQuizId);
    try {
      const response = await invoke(infoCall, { quizId });
      const session = readSession(quizId);
      const quiz = response?.quiz;
      if (
        session?.sessionRunId
        && quiz?.sessionRunId
        && String(session.sessionRunId) !== String(quiz.sessionRunId)
      ) clearSession(quizId);
      return response;
    } catch (infoError) {
      // A finished assessment must stay closed to new browsers, but the browser
      // that already owns a submitted attempt may still retrieve its own signed
      // receipt (and, after teacher release, its solutions). Resume is protected
      // by attemptId + the locally held high-entropy token.
      const session = readSession(quizId);
      if (session?.attemptId && session?.attemptToken) {
        try {
          const resumed = await invoke(resumeCall, {
            quizId,
            attemptId: session.attemptId,
            attemptToken: session.attemptToken
          });
          if (resumed?.status === "submitted" && resumed?.receipt && resumed?.quiz) {
            writeSession(quizId, {
              ...session,
              studentName: resumed.studentName || session.studentName,
              status: "submitted",
              sessionRunId: resumed.sessionRunId || session.sessionRunId || null
            });
            return { quiz: resumed.quiz, submittedAttemptAvailable: true };
          }
        } catch {
          // Preserve the original public-info error. A running/ready attempt is
          // not allowed to bypass an ended/blocked test through this fallback.
        }
      }
      throw infoError;
    }
  }

  async function start(rawQuizId, studentName) {
    const quizId = normalizeQuizId(rawQuizId);
    const session = ensureSession(quizId);
    const response = await invoke(startCall, {
      quizId,
      studentName: String(studentName || "").trim(),
      clientAttemptId: session.clientAttemptId,
      attemptToken: session.attemptToken
    });
    writeSession(quizId, {
      ...session,
      attemptId: response.attemptId,
      studentName: response.studentName || studentName,
      status: response.status,
      sessionRunId: response.sessionRunId || null
    });
    return response;
  }

  async function resume(rawQuizId, { stateOnly = false } = {}) {
    const quizId = normalizeQuizId(rawQuizId);
    const session = readSession(quizId);
    if (!session?.attemptId || !session?.attemptToken) return null;
    const response = await invoke(resumeCall, {
      quizId,
      attemptId: session.attemptId,
      attemptToken: session.attemptToken,
      stateOnly: Boolean(stateOnly)
    });
    writeSession(quizId, {
      ...session,
      studentName: response.studentName || session.studentName,
      status: response.status,
      sessionRunId: response.sessionRunId || session.sessionRunId || null
    });
    return response;
  }

  async function submit(rawQuizId, answers, { autoSubmitted = false } = {}) {
    const quizId = normalizeQuizId(rawQuizId);
    const session = readSession(quizId);
    if (!session?.attemptId || !session?.attemptToken) throw new Error("Dieser Test wurde in diesem Browser noch nicht gestartet.");
    const response = await invoke(submitCall, {
      quizId,
      attemptId: session.attemptId,
      attemptToken: session.attemptToken,
      answers: answers && typeof answers === "object" ? answers : {},
      autoSubmitted: Boolean(autoSubmitted)
    });
    writeSession(quizId, { ...session, status: "submitted" });
    return response;
  }

  async function getReceipt(rawQuizId) {
    const quizId = normalizeQuizId(rawQuizId);
    const session = readSession(quizId);
    if (!session?.attemptId || !session?.attemptToken) return null;
    return invoke(receiptCall, {
      quizId,
      attemptId: session.attemptId,
      attemptToken: session.attemptToken
    });
  }

  function clear(rawQuizId) {
    clearSession(normalizeQuizId(rawQuizId));
  }

  return {
    getInfo,
    start,
    resume,
    submit,
    getReceipt,
    readSession,
    clear
  };
}
