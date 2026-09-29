let installed = false;

const LOCK_VERSION = 1;
const LOCK_TTL_MS = 6 * 60 * 60 * 1000;

function params() {
  return new URLSearchParams(location.search);
}

function quizCode() {
  return String(params().get("test") || "").trim();
}

function isStudentRoute() {
  return Boolean(quizCode()) && params().get("preview") !== "1";
}

function timerKey(code) {
  return `lernplattform_timer_${code}`;
}

function lockKey(code) {
  return `gradecrew_submission_lock_v${LOCK_VERSION}:${code}`;
}

function untimedKey(code) {
  return `gradecrew_untimed_attempt_v${LOCK_VERSION}:${code}`;
}

function safeJson(value) {
  try { return JSON.parse(value || "null"); } catch { return null; }
}

function readTimer(code) {
  return safeJson(localStorage.getItem(timerKey(code)));
}

function untimedAttemptId(code) {
  let id = sessionStorage.getItem(untimedKey(code));
  if (!id) {
    id = `untimed-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    sessionStorage.setItem(untimedKey(code), id);
  }
  return id;
}

function currentAttempt(code) {
  const timer = readTimer(code);
  if (timer?.attemptId) {
    return {
      attemptId: String(timer.attemptId),
      sessionRunId: timer.sessionRunId ? String(timer.sessionRunId) : "",
      startedAt: Number(timer.startedAt || 0) || null,
      mode: timer.mode || "timed"
    };
  }
  return { attemptId: untimedAttemptId(code), sessionRunId: "", startedAt: null, mode: "untimed" };
}

function readLock(code) {
  const lock = safeJson(localStorage.getItem(lockKey(code)));
  if (!lock || Number(lock.version) !== LOCK_VERSION) return null;
  if (!Number(lock.savedAt) || Date.now() - Number(lock.savedAt) > LOCK_TTL_MS) {
    localStorage.removeItem(lockKey(code));
    return null;
  }
  return lock;
}

function writeLock(code, attempt) {
  const value = {
    version: LOCK_VERSION,
    quizId: code,
    attemptId: attempt?.attemptId || untimedAttemptId(code),
    sessionRunId: attempt?.sessionRunId || "",
    savedAt: Date.now()
  };
  localStorage.setItem(lockKey(code), JSON.stringify(value));
  return value;
}

function sameAttempt(lock, attempt) {
  if (!lock || !attempt) return false;
  if (lock.sessionRunId && attempt.sessionRunId && lock.sessionRunId !== attempt.sessionRunId) return false;
  if (lock.attemptId && attempt.attemptId && lock.attemptId !== attempt.attemptId) return false;
  return true;
}

function activeLock(code) {
  const lock = readLock(code);
  if (!lock) return null;
  const attempt = currentAttempt(code);
  return sameAttempt(lock, attempt) ? lock : null;
}

function installSolutionShield() {
  if (document.querySelector("style[data-student-solution-shield]")) return;
  const style = document.createElement("style");
  style.dataset.studentSolutionShield = "1";
  style.textContent = `
    body.gcStudentPublicRun #studentResultDetails{display:none!important}
    .gcStudentResultNotice{margin:16px 0;padding:14px 16px;border:1px solid #d9e3df;border-radius:14px;background:#f7faf8;color:#36524a;line-height:1.45}
    .gcStudentLockedCard{padding:24px;text-align:center}
    .gcStudentLockedCard strong{display:block;font-size:20px;margin-bottom:8px;color:#173b36}
    .gcStudentLockedCard p{margin:0;color:#526861}
  `;
  document.head.appendChild(style);
}

function hideSolutions() {
  const details = document.getElementById("studentResultDetails");
  if (!details) return;
  if (details.childNodes.length) details.replaceChildren();
  if (!details.previousElementSibling?.classList?.contains("gcStudentResultNotice")) {
    const note = document.createElement("div");
    note.className = "gcStudentResultNotice";
    note.textContent = "Die Abgabe ist gespeichert. Lösungen werden während einer laufenden Durchführung nicht angezeigt.";
    details.insertAdjacentElement("beforebegin", note);
  }
}

function sealForm() {
  const form = document.getElementById("studentForm");
  if (!form) return;
  if (form.dataset.submitted !== "true") form.dataset.submitted = "true";
  if (form.getAttribute("aria-hidden") !== "true") form.setAttribute("aria-hidden", "true");
  if (!form.classList.contains("hidden")) form.classList.add("hidden");
  form.querySelectorAll("input, select, textarea, button").forEach(control => {
    if (!control.disabled) control.disabled = true;
  });
}

function showLockedNotice() {
  const root = document.getElementById("studentQuizCard");
  if (!root) return;
  sealForm();
  const result = document.getElementById("studentResult");
  if (result && !result.classList.contains("hidden")) {
    hideSolutions();
    return;
  }
  let box = root.querySelector(".gcStudentLockedCard");
  if (!box) {
    box = document.createElement("div");
    box.className = "gcStudentLockedCard";
    box.innerHTML = "<strong>Abgabe bereits gespeichert ✓</strong><p>Eine erneute Abgabe ist in diesem Durchgang nicht möglich.</p>";
    root.appendChild(box);
  }
}

let pendingAttempt = null;
let sealedThisPage = false;
let resultObserver = null;

function resultWasSaved() {
  const result = document.getElementById("studentResult");
  return Boolean(result && !result.classList.contains("hidden") && /Abgabe gespeichert/i.test(result.textContent || ""));
}

function stopResultObserver() {
  resultObserver?.disconnect();
  resultObserver = null;
}

function sealSuccessfulSubmission() {
  if (!isStudentRoute() || !resultWasSaved()) return false;
  const code = quizCode();
  const attempt = pendingAttempt || currentAttempt(code);
  writeLock(code, attempt);
  sealedThisPage = true;
  sealForm();
  hideSolutions();
  stopResultObserver();
  return true;
}

function blockDuplicateSubmit(event) {
  if (!isStudentRoute()) return;
  const form = event.target?.closest?.("#studentForm");
  if (!form) return;
  const code = quizCode();
  const lock = activeLock(code);
  if (lock || sealedThisPage) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    showLockedNotice();
    return;
  }
  pendingAttempt = currentAttempt(code);
}

function restoreGuard() {
  if (!isStudentRoute()) return;
  if (!document.body.classList.contains("gcStudentPublicRun")) document.body.classList.add("gcStudentPublicRun");
  installSolutionShield();
  const code = quizCode();
  if (activeLock(code)) showLockedNotice();
  sealSuccessfulSubmission();
}

function installObserver() {
  const root = document.getElementById("studentQuizCard") || document.body;
  if (!root || resultObserver) return;
  resultObserver = new MutationObserver(() => {
    if (sealSuccessfulSubmission()) return;
    const code = quizCode();
    if (activeLock(code)) showLockedNotice();
  });
  resultObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
}

export function installStudentAttemptGuard() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  if (!isStudentRoute()) return;
  document.body.classList.add("gcStudentPublicRun");
  installSolutionShield();
  document.addEventListener("submit", blockDuplicateSubmit, true);
  window.addEventListener("pageshow", restoreGuard);
  window.addEventListener("popstate", restoreGuard);
  installObserver();
  restoreGuard();
}

installStudentAttemptGuard();
