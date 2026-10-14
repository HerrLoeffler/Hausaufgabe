import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { createSecureAssessmentClient } from "./secure-assessment-client.js";

const params = new URLSearchParams(location.search);
const quizId = String(params.get("test") || "").trim();
const form = document.getElementById("secureAssessmentForm");
const timerText = document.getElementById("secureTimerText");
const result = document.getElementById("secureResult");
const connection = document.getElementById("secureConnection");
const submitButton = document.getElementById("secureSubmitBtn");

const app = getApps().find(item => item.name === "gradecrew-secure-deadline")
  || initializeApp(firebaseConfig, "gradecrew-secure-deadline");
const api = createSecureAssessmentClient(app);

let frozenAnswers = null;
let retryTimer = null;
let retryBusy = false;
let stopped = false;

function answerFromSection(section) {
  const type = section?.dataset.type || "";
  if (["single", "truefalse"].includes(type)) return section.querySelector("input:checked")?.value || "";
  if (type === "multi") return [...section.querySelectorAll("input:checked")].map(input => input.value);
  if (["text", "number", "dropdown"].includes(type)) return section.querySelector("textarea,input,select")?.value || "";
  if (type === "gapfill") return [...section.querySelectorAll(".secureGap")].map(input => input.value);
  if (type === "matching") return Object.fromEntries([...section.querySelectorAll("select[data-left-id]")].map(select => [select.dataset.leftId, select.value]));
  if (type === "ordering") return [...section.querySelectorAll(".secureOrderItem")].map(item => item.dataset.itemId);
  if (type === "grouping") return Object.fromEntries([...section.querySelectorAll("select[data-item-id]")].map(select => [select.dataset.itemId, select.value]));
  if (type === "markwords") return [...section.querySelectorAll(".secureWord.selected")].map(button => button.dataset.wordIndex);
  return "";
}

function captureAnswers() {
  return Object.fromEntries([...document.querySelectorAll(".secureQuestion[data-qid]")].map(section => [
    section.dataset.qid,
    answerFromSection(section)
  ]));
}

function cloneSnapshot(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function lockAssessmentAtDeadline() {
  if (frozenAnswers || !form || form.closest(".hidden")) return false;
  frozenAnswers = cloneSnapshot(captureAnswers());
  form.dataset.deadlineLocked = "1";
  form.inert = true;
  form.querySelectorAll("input, textarea, select, button").forEach(control => {
    control.disabled = true;
  });
  if (submitButton) submitButton.textContent = "Zeit abgelaufen – Abgabe wird gesichert …";
  return true;
}

function clearRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
}

function showDeadlineMessage(text, kind = "pending") {
  const host = form?.querySelector(".secureSubmit");
  if (!host) return;
  let message = host.querySelector(".secureDeadlineGuardMessage");
  if (!message) {
    message = document.createElement("p");
    message.className = "secureDeadlineGuardMessage";
    message.setAttribute("role", "status");
    host.appendChild(message);
  }
  message.dataset.state = kind;
  message.textContent = text;
}

function resultVisible() {
  return Boolean(result && !result.classList.contains("hidden"));
}

async function submitFrozenSnapshot() {
  if (!frozenAnswers || retryBusy || stopped || resultVisible()) return;
  retryBusy = true;
  clearRetry();
  try {
    await api.submit(quizId, frozenAnswers, { autoSubmitted: true });
    stopped = true;
    if (connection) {
      connection.textContent = "Sicher gespeichert";
      connection.classList.add("online");
      connection.classList.remove("offline");
    }
    showDeadlineMessage("Zeit abgelaufen. Deine eingefrorenen Antworten wurden sicher gespeichert.", "saved");
    setTimeout(() => {
      if (!resultVisible()) location.reload();
    }, 350);
  } catch (error) {
    if (error?.code === "unavailable" && !stopped) {
      if (connection) {
        connection.textContent = "Verbindung unterbrochen · Abgabe wird erneut versucht";
        connection.classList.remove("online");
        connection.classList.add("offline");
      }
      showDeadlineMessage("Zeit abgelaufen. Deine Antworten sind eingefroren. GradeCrew versucht die Abgabe mit exakt diesem Stand erneut.", "retrying");
      retryTimer = setTimeout(() => void submitFrozenSnapshot(), 1500);
    } else {
      stopped = true;
      showDeadlineMessage(error?.message || "Die automatische Abgabe konnte nicht bestätigt werden. Bitte sofort die Lehrkraft informieren.", "error");
    }
  } finally {
    retryBusy = false;
  }
}

function handleDeadline() {
  if (stopped || resultVisible()) return;
  lockAssessmentAtDeadline();
  if (frozenAnswers) void submitFrozenSnapshot();
}

function checkTimer() {
  if (timerText?.textContent?.trim() === "00:00") handleDeadline();
}

if (quizId && form && timerText) {
  const observer = new MutationObserver(checkTimer);
  observer.observe(timerText, { childList: true, characterData: true, subtree: true });
  addEventListener("online", () => {
    if (frozenAnswers && !stopped) void submitFrozenSnapshot();
  });
  addEventListener("pagehide", clearRetry);
  checkTimer();
}
