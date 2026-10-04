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
  intro.textContent = "Der Test wurde beendet. Deine Lehrkraft hat die Lösungsanzeige freigegeben.";
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
}

function renderWaiting(receipt) {
  const panel = solutionPanel();
  if (!panel) return;
  panel.replaceChildren();
  const note = document.createElement("p");
  note.className = "secureSolutionNote";
  note.textContent = receipt.solutionsConfigured
    ? "Lösungen bleiben bis zum Testende und dem Ablauf der kurzen Abgabe-Nachfrist geschützt."
    : "Für diesen Test ist keine Lösungsanzeige freigegeben.";
  panel.appendChild(note);

  if (receipt.solutionsConfigured) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button secondary";
    button.textContent = "Lösungsfreigabe prüfen";
    button.addEventListener("click", () => refreshReceipt({ force: true }));
    panel.appendChild(button);
  }
}

function renderReceiptSolutions(receipt) {
  removeLegacyNote();
  const state = receipt.solutionsReleased
    ? `released:${JSON.stringify(receipt.solutions || [])}`
    : `waiting:${receipt.solutionsConfigured === true}`;
  if (state === lastRenderedState && host?.querySelector("[data-secure-solution-release]")) return;
  lastRenderedState = state;
  if (receipt.solutionsReleased && Array.isArray(receipt.solutions)) renderSolutions(receipt);
  else renderWaiting(receipt);
}

async function refreshReceipt({ force = false } = {}) {
  if (!quizId || !host || busy) return;
  if (host.classList.contains("hidden") && !force) return;
  if (!host.querySelector("h1") && !force) return;
  busy = true;
  try {
    const response = await api.getReceipt(quizId);
    if (response?.receipt) renderReceiptSolutions(response.receipt);
  } catch (error) {
    if (!force) return;
    const panel = solutionPanel();
    if (!panel) return;
    const message = panel.querySelector(".secureSolutionRefreshError") || document.createElement("p");
    message.className = "secureSolutionRefreshError";
    message.textContent = error?.code === "unavailable"
      ? "Die Freigabe konnte gerade nicht geprüft werden. Bitte später erneut versuchen."
      : "Die Lösungsfreigabe ist noch nicht verfügbar.";
    panel.appendChild(message);
  } finally {
    busy = false;
  }
}

if (host && quizId) {
  const observer = new MutationObserver(() => void refreshReceipt());
  observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  void refreshReceipt();
}
