import { getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

let selectedUserId = "";
let refreshToken = 0;
let decorating = false;

function toast(message, type = "success") {
  const node = document.getElementById("toast");
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("error", type === "error");
  node.classList.toggle("success", type !== "error");
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 3200);
}

function removeExisting() {
  document.getElementById("adminAiBetaMeta")?.remove();
  document.getElementById("adminAiBetaToggle")?.remove();
}

async function decorateTeacherDetail() {
  if (decorating) return;
  const detail = document.getElementById("adminTeacherDetail");
  const uid = selectedUserId;
  if (!detail || detail.classList.contains("hidden") || !uid) return;

  decorating = true;
  const token = ++refreshToken;
  const app = getApps()[0];
  if (!app) {
    decorating = false;
    return;
  }
  const db = getFirestore(app);

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (token !== refreshToken || selectedUserId !== uid || !snap.exists()) return;
    const profile = snap.data() || {};

    const meta = detail.querySelector(".adminDetailMeta");
    const actions = detail.querySelector(".adminDetailActions");
    if (!meta || !actions) return;

    removeExisting();
    const alwaysAllowed = profile.role === "admin";
    const enabled = alwaysAllowed || profile.aiBetaEnabled === true;

    const metaItem = document.createElement("span");
    metaItem.id = "adminAiBetaMeta";
    metaItem.innerHTML = `KI-Beta: <strong class="${enabled ? "aiAccessOn" : "aiAccessOff"}">${alwaysAllowed ? "Admin · immer freigeschaltet" : enabled ? "Freigeschaltet" : "Nicht freigeschaltet"}</strong>`;
    meta.appendChild(metaItem);

    if (alwaysAllowed) return;

    const button = document.createElement("button");
    button.id = "adminAiBetaToggle";
    button.type = "button";
    button.className = `button ${enabled ? "ghost" : "primary"}`;
    button.textContent = enabled ? "KI-Zugriff sperren" : "KI-Beta freigeben";
    button.title = enabled ? "Diese Lehrkraft kann danach keine KI-Funktionen mehr starten." : "Diese Lehrkraft darf danach KI-Tests und KI-Bearbeitung verwenden.";
    actions.appendChild(button);

    button.addEventListener("click", async () => {
      const next = !enabled;
      if (!next && !window.confirm("KI-Zugriff für diese Lehrkraft wirklich sperren? Bereits gespeicherte Tests bleiben erhalten.")) return;
      button.disabled = true;
      button.textContent = next ? "Wird freigeschaltet …" : "Wird gesperrt …";
      try {
        await updateDoc(doc(db, "users", uid), { aiBetaEnabled: next });
        toast(next ? "KI-Beta wurde freigeschaltet." : "KI-Zugriff wurde gesperrt.");
        await decorateTeacherDetail();
      } catch (err) {
        console.error("KI-Beta-Recht konnte nicht geändert werden:", err);
        toast("KI-Beta-Recht konnte nicht geändert werden.", "error");
        button.disabled = false;
        button.textContent = enabled ? "KI-Zugriff sperren" : "KI-Beta freigeben";
      }
    });
  } catch (err) {
    console.warn("KI-Beta-Status konnte nicht geladen werden:", err);
  } finally {
    decorating = false;
  }
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  const open = target?.closest(".adminTeacherOpen");
  if (open?.dataset.id) {
    selectedUserId = open.dataset.id;
    window.setTimeout(decorateTeacherDetail, 0);
  }
  if (target?.closest(".closeAdminDetail")) {
    selectedUserId = "";
    refreshToken += 1;
    removeExisting();
  }
}, true);
