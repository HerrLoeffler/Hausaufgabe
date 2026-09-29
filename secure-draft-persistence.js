const params = new URLSearchParams(location.search);
const normalizeQuizId = value => String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
const quizId = normalizeQuizId(params.get("test"));
const SESSION_VERSION = "v2";
const DRAFT_VERSION = "v1";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const result = document.getElementById("secureResult");

function credentialKey() {
  return `gradecrew_secure_assessment:${SESSION_VERSION}:${quizId}`;
}

function readCredential() {
  try {
    const value = JSON.parse(localStorage.getItem(credentialKey()) || "null");
    if (!value || value.version !== SESSION_VERSION || !value.attemptId) return null;
    if (normalizeQuizId(value.quizId) !== quizId) return null;
    return value;
  } catch {
    return null;
  }
}

function volatileDraftKey(attemptId) {
  return `gradecrew_secure_answers:v1:${quizId}:${attemptId}`;
}

function persistentDraftKey(attemptId) {
  return `gradecrew_secure_answers_persist:${DRAFT_VERSION}:${quizId}:${attemptId}`;
}

function clearExpiredDrafts() {
  const prefix = `gradecrew_secure_answers_persist:${DRAFT_VERSION}:${quizId}:`;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      if (!stored || Date.now() - Number(stored.savedAt || 0) > MAX_AGE_MS) localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }
}

function restorePersistentDraft() {
  const credential = readCredential();
  if (!credential?.attemptId) return;
  const sessionKey = volatileDraftKey(credential.attemptId);
  if (sessionStorage.getItem(sessionKey)) return;
  try {
    const persistentKey = persistentDraftKey(credential.attemptId);
    const stored = JSON.parse(localStorage.getItem(persistentKey) || "null");
    if (!stored || stored.version !== DRAFT_VERSION) return;
    if (Date.now() - Number(stored.savedAt || 0) > MAX_AGE_MS) {
      localStorage.removeItem(persistentKey);
      return;
    }
    if (!stored.answers || typeof stored.answers !== "object" || Array.isArray(stored.answers)) return;
    sessionStorage.setItem(sessionKey, JSON.stringify(stored.answers));
  } catch {}
}

function persistCurrentDraft() {
  const credential = readCredential();
  if (!credential?.attemptId || credential.status === "submitted") return;
  try {
    const volatile = sessionStorage.getItem(volatileDraftKey(credential.attemptId));
    if (!volatile) return;
    const answers = JSON.parse(volatile);
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) return;
    localStorage.setItem(persistentDraftKey(credential.attemptId), JSON.stringify({
      version: DRAFT_VERSION,
      savedAt: Date.now(),
      answers
    }));
  } catch {}
}

function clearCurrentPersistentDraft() {
  const credential = readCredential();
  if (!credential?.attemptId) return;
  try { localStorage.removeItem(persistentDraftKey(credential.attemptId)); } catch {}
}

function queuePersist() {
  queueMicrotask(persistCurrentDraft);
}

if (quizId) {
  clearExpiredDrafts();
  restorePersistentDraft();
  document.addEventListener("input", queuePersist);
  document.addEventListener("change", queuePersist);
  document.addEventListener("click", event => {
    if (event.target.closest("#secureQuestions")) queuePersist();
  });
  addEventListener("pagehide", persistCurrentDraft);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistCurrentDraft();
  });
  if (result) {
    const observer = new MutationObserver(() => {
      if (!result.classList.contains("hidden") && result.querySelector("h1")) clearCurrentPersistentDraft();
    });
    observer.observe(result, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
}
