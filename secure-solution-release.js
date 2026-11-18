import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { createSecureAssessmentClient } from "./secure-assessment-client.js";

const params = new URLSearchParams(location.search);
const quizId = String(params.get("test") || "").trim();
const host = document.getElementById("secureResult");
const app = getApps().find(item => item.name === "gradecrew-secure-solutions")
  || initializeApp(firebaseConfig, "gradecrew-secure-solutions");
const api = createSecureAssessmentClient(app);
let busy = false;
let manualRefreshRequested = false;
let lastRenderedState = "";

function removeLegacyNote() {
  host?.querySelectorAll("p").forEach(node => {
    if (node.textContent?.trim() === "Lösungen werden nicht automatisch mit der Abgabe freigegeben.") node.remove();
  });
}

function solutionPanel() {
  let panel = host?.querySelector("[data-secure-solution-release]");
  if (!panel && host) {
    panel = document.createElement("section");
    panel.dataset.secureSolutionRelease = "1";
    panel.className = "secureSolutionRelease";
    host.appendChild(panel);
  }
  return panel;
}

function renderSolutions(receipt) {
  const panel = solutionPanel();
  if (!panel) return;
  panel.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Lösungen";
  const intro = document.createElement("p");
  intro.textContent = receipt.solutionReleaseMode === "practice_after_submit"
    ? "Deine Lehrkraft hat die Lösungen nach deiner Abgabe freigegeben."
    : "Der Test wurde beendet. Deine Lehrkraft hat die Lösungsanzeige freigegeben.";
  panel.append(heading, intro);

  const list = document.createElement("div");
  list.className = "secureSolutionList";
  (receipt.solutions || []).forEach((solution, index) => {
    const article = document.createElement("article");
    article.className = "secureSolutionItem";
    const title = document.createElement("strong");
    title.textContent = `${Number(solution.position) || index + 1}. ${solution.prompt || "Aufgabe"}`;
    const answer = document.createElement("p");
    answer.textContent = solution.answer || "–";
    article.append(title, answer);
    const src = String(solution.audio?.src || "");
    if (src.startsWith("data:audio/")) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = src;
      audio.setAttribute("aria-label", `Audio-Lösung zu Aufgabe ${Number(solution.position) || index + 1} anhören`);
      article.appendChild(audio);
      if (solution.audio?.aiGenerated !== false) {
        const disclosure = document.createElement("small");
        disclosure.className = "secureSolutionAudioDisclosure";
        disclosure.textContent = "KI-generierte Stimme";
        article.appendChild(disclosure);
      }
    }
    list.appendChild(article);
  });
  panel.appendChild(list);
  if (receipt.solutionAudioPartial) {
    const note = document.createElement("p");
    note.textContent = "Einige Lösungsaudios sind zu umfangreich. Die Textlösungen sind vollständig verfügbar.";
    panel.appendChild(note);
  }
}

function renderAvailable(receipt) {
  const panel = solutionPanel();
  if (!panel) return;
  panel.replaceChildren();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button secondary";
  button.textContent = "Lösungen anzeigen";
  button.addEventListener("click", () => renderSolutions(receipt));
  panel.appendChild(button);
}

function renderWaiting(receipt) {
  const panel = solutionPanel();
  if (!panel) return;
  panel.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Warten auf Freigabe";
  panel.appendChild(heading);
  const note = document.createElement("p");
  note.className = "secureSolutionNote";
  note.textContent = receipt.solutionsConfigured
    ? receipt.solutionReleaseMode === "practice_after_submit"
      ? "Deine Lehrkraft hat die Lösungen für diese Übung noch nicht freigegeben."
      : "Lösungen bleiben bis zum Testende und dem Ablauf der kurzen Abgabe-Nachfrist geschützt."
    : "Für diesen Test ist keine Lösungsanzeige freigegeben.";
  panel.appendChild(note);

  if (receipt.solutionsConfigured) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button secondary";
    button.dataset.secureReleaseCheck = "1";
    button.textContent = "Lösungsfreigabe prüfen";
    button.addEventListener("click", () => refreshReceipt({ force: true }));
    panel.appendChild(button);
  }
}

function renderReceiptSolutions(receipt) {
  removeLegacyNote();
  const state = receipt.solutionsReleased
    ? `released:${JSON.stringify(receipt.solutions || [])}`
    : `waiting:${receipt.solutionsConfigured === true}:${receipt.solutionReleaseMode || "exam_after_end"}`;
  if (state === lastRenderedState && host?.querySelector("[data-secure-solution-release]")) return;
  lastRenderedState = state;
  if (receipt.solutionsReleased && Array.isArray(receipt.solutions)) renderAvailable(receipt);
  else renderWaiting(receipt);
}

function showRefreshStatus(text, error = false) {
  const panel = solutionPanel();
  if (!panel) return;
  let message = panel.querySelector("[data-secure-release-status]");
  if (!message) {
    message = document.createElement("p");
    message.dataset.secureReleaseStatus = "1";
    message.setAttribute("role", "status");
    panel.appendChild(message);
  }
  message.className = error ? "secureSolutionRefreshError" : "secureSolutionRefreshStatus";
  message.textContent = text;
}

async function refreshReceipt({ force = false } = {}) {
  if (!quizId || !host) return;
  if (host.classList.contains("hidden") && !force) return;
  if (!host.querySelector("h1") && !force) return;
  if (force) {
    manualRefreshRequested = true;
    showRefreshStatus("Die Lösungsfreigabe wird geprüft …");
  }
  if (busy) return;
  busy = true;
  const button = host.querySelector("[data-secure-release-check]");
  if (button) button.disabled = true;
  try {
    const response = await api.getReceipt(quizId);
    if (response?.receipt) renderReceiptSolutions(response.receipt);
    if (manualRefreshRequested) {
      const receipt = response?.receipt;
      if (receipt?.solutionsReleased && Array.isArray(receipt.solutions)) {
        renderSolutions(receipt);
        const heading = solutionPanel()?.querySelector("h2");
        if (heading) { heading.tabIndex = -1; heading.focus(); }
      } else if (receipt) {
        showRefreshStatus(receipt.solutionsConfigured
          ? "Noch nicht freigegeben. Bitte warte auf deine Lehrkraft."
          : "Für diesen Test ist keine Lösungsanzeige freigegeben.");
      } else {
        showRefreshStatus("Die Freigabe konnte gerade nicht geprüft werden. Bitte später erneut versuchen.", true);
      }
    }
  } catch (error) {
    if (!manualRefreshRequested) return;
    showRefreshStatus(error?.code === "unavailable"
      ? "Die Freigabe konnte gerade nicht geprüft werden. Bitte später erneut versuchen."
      : "Die Lösungsfreigabe ist noch nicht verfügbar.", true);
  } finally {
    manualRefreshRequested = false;
    busy = false;
    const currentButton = host.querySelector("[data-secure-release-check]");
    if (currentButton) currentButton.disabled = false;
  }
}

if (host && quizId) {
  const observer = new MutationObserver(records => {
    if (records.some(record => record.target === host && (record.type === "attributes"
      || [...record.addedNodes].some(node => node.nodeName === "H1")))) void refreshReceipt();
  });
  observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  void refreshReceipt();
}
