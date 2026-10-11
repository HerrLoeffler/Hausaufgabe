import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const STYLE_ID = "gcAdminTestAccountStyles";
const TOOLBAR_ID = "gcAdminTestAccountToolbar";
const CONTROLS_ID = "gcAdminTestAccountControls";

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let currentAdmin = false;
let selectedUid = "";
let showArchived = false;
let userCache = new Map();
let refreshTimer = 0;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .gcAdminTestAccountToolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px}
    .gcAdminTestAccountToolbar .gcAdminTestHint{font-size:12px;color:#667085}
    .gcAdminTestBadge{display:inline-flex;align-items:center;min-height:22px;padding:2px 7px;margin-left:7px;border-radius:999px;background:#eef4ff;color:#2457bd;font-size:11px;font-weight:800;vertical-align:middle}
    .gcAdminArchivedBadge{background:#f2f4f7;color:#667085}
    .gcAdminArchivedRow{opacity:.65}
    .gcAdminTestAccountControls{display:flex;align-items:end;gap:10px;flex-wrap:wrap;width:100%;padding-top:12px;margin-top:4px;border-top:1px solid #e5e7eb}
    .gcAdminTestAccountControls label{display:grid;gap:5px;font-size:12px;font-weight:750;color:#475467}
    .gcAdminTestAccountControls select{min-width:150px;min-height:42px;padding:8px 10px;border:1px solid #cfd8e6;border-radius:10px;background:#fff;color:#172033;font:inherit}
    .gcAdminTestAccountControls .gcAdminTestNote{flex-basis:100%;margin:0;font-size:12px;color:#667085;line-height:1.4}
  `;
  document.head.appendChild(style);
}

async function readCurrentRole() {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.role === "admin" && (!snap.data()?.status || snap.data()?.status === "active") && !snap.data()?.accountDeletionId;
  } catch (_) {
    return false;
  }
}

async function refreshUsers() {
  if (!currentAdmin) return;
  const caller = auth.currentUser?.uid;
  const snap = await getDocs(collection(db, "users"));
  if (auth.currentUser?.uid !== caller || !currentAdmin) return;
  userCache = new Map(snap.docs.map(item => [item.id, { id: item.id, ...item.data() }]));
}

function profile(uid) {
  return userCache.get(uid) || null;
}

function scheduleDecorate(delay = 0) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    decorateTeacherTable();
    if (selectedUid) renderDetailControls(selectedUid);
  }, delay);
}

function installToolbar() {
  const tableRoot = document.getElementById("adminTeachersTable");
  if (!tableRoot || document.getElementById(TOOLBAR_ID)) return;
  const toolbar = document.createElement("div");
  toolbar.id = TOOLBAR_ID;
  toolbar.className = "gcAdminTestAccountToolbar";
  toolbar.innerHTML = `
    <button type="button" class="button ghost" id="gcToggleArchivedTestAccounts">Archivierte Testkonten anzeigen</button>
    <span class="gcAdminTestHint">Testkonten bleiben normale Lehrkraft-Konten. Archivieren sperrt nur den Login und blendet sie aus – es löscht noch nichts endgültig.</span>
  `;
  tableRoot.before(toolbar);
  toolbar.querySelector("#gcToggleArchivedTestAccounts")?.addEventListener("click", event => {
    showArchived = !showArchived;
    event.currentTarget.textContent = showArchived ? "Archivierte Testkonten ausblenden" : "Archivierte Testkonten anzeigen";
    tableRoot.dataset.gcShowArchived = showArchived ? "1" : "0";
    document.dispatchEvent(new CustomEvent("gradecrew:admin-archived-visibility"));
    decorateTeacherTable();
  });
}

function decorateTeacherTable() {
  if (!currentAdmin) return;
  installToolbar();
  const buttons = document.querySelectorAll("#adminTeachersTable .adminTeacherOpen[data-id]");
  for (const button of buttons) {
    const uid = button.dataset.id || "";
    const user = profile(uid);
    const row = button.closest("tr");
    if (!row || !user) continue;

    const nameCell = row.querySelector("td[data-account-name]") || row.querySelector("td:first-child");
    nameCell?.querySelectorAll(".gcAdminTestBadge").forEach(node => node.remove());
    if (user.isTestAccount === true && nameCell) {
      const badge = document.createElement("span");
      badge.className = "gcAdminTestBadge";
      badge.textContent = "Testkonto";
      nameCell.querySelector("strong")?.appendChild(badge);
    }
    if (user.isTestAccountArchived === true && nameCell) {
      const badge = document.createElement("span");
      badge.className = "gcAdminTestBadge gcAdminArchivedBadge";
      badge.textContent = "archiviert";
      nameCell.querySelector("strong")?.appendChild(badge);
    }

    row.classList.toggle("gcAdminArchivedRow", user.isTestAccountArchived === true);
    row.hidden = user.isTestAccountArchived === true && !showArchived;
  }
}

async function saveUser(uid, patch, message) {
  await updateDoc(doc(db, "users", uid), {
    ...patch,
    updatedAt: serverTimestamp()
  });
  await refreshUsers();
  scheduleDecorate();
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 2600);
  }
}

function roleLabel(role) {
  return role === "admin" ? "Admin" : "Lehrkraft";
}

function renderDetailControls(uid) {
  if (!currentAdmin) return;
  const root = document.getElementById("adminTeacherDetail");
  const actions = root?.querySelector(".adminDetailActions");
  const user = profile(uid);
  if (!root || !actions || !user) return;

  const ownAccount = auth.currentUser?.uid === uid;
  const isAdmin = user.role === "admin";
  const isTest = user.isTestAccount === true;
  const isArchived = user.isTestAccountArchived === true;
  const signature = [uid, user.role || "teacher", isTest ? "test" : "real", isArchived ? "archived" : "active", ownAccount ? "self" : "other"].join(":");
  const existing = document.getElementById(CONTROLS_ID);
  if (existing?.dataset.signature === signature && existing.closest("#adminTeacherDetail")) return;
  existing?.remove();

  const controls = document.createElement("div");
  controls.id = CONTROLS_ID;
  controls.dataset.signature = signature;
  controls.className = "gcAdminTestAccountControls";
  controls.innerHTML = `
    <button type="button" class="button secondary" id="gcToggleTestAccount" ${isAdmin || isArchived ? "disabled" : ""}>${isTest ? "Testkonto entfernen" : "Als Testkonto markieren"}</button>
    ${isTest && !ownAccount ? `<button type="button" class="button ${isArchived ? "secondary" : "ghost"}" id="gcArchiveTestAccount">${isArchived ? "Testkonto wieder aktivieren" : "Testkonto archivieren"}</button>` : ""}
    <p class="gcAdminTestNote">${isArchived ? "Archivierte Testkonten sind gesperrt. Vor dem Entfernen der Testkonto-Markierung bitte zuerst wieder aktivieren." : isTest ? `Dieses Konto ist als Testkonto markiert. Rolle: ${escapeHtml(roleLabel(user.role))}.` : "Testkonto markieren trennt Entwicklungs-/Testkonten von echten Lehrkräften. Admin-Konten können nicht als Testkonto markiert werden."}</p>
  `;
  actions.appendChild(controls);

  controls.querySelector("#gcToggleTestAccount")?.addEventListener("click", async event => {
    const nextValue = !isTest;
    if (!confirm(nextValue
      ? `${user.displayName || user.email || "Dieses Konto"} als Testkonto markieren?`
      : `Testkonto-Markierung bei ${user.displayName || user.email || "diesem Konto"} entfernen?`)) return;
    event.currentTarget.disabled = true;
    try {
      await saveUser(uid, {
        isTestAccount: nextValue,
        isTestAccountArchived: false,
        testAccountUpdatedAt: serverTimestamp(),
        testAccountUpdatedBy: auth.currentUser?.uid || ""
      }, nextValue ? "Als Testkonto markiert." : "Testkonto-Markierung entfernt.");
      renderDetailControls(uid);
    } catch (error) {
      console.error(error);
      alert("Testkonto-Markierung konnte nicht geändert werden.");
      event.currentTarget.disabled = false;
    }
  });

  controls.querySelector("#gcArchiveTestAccount")?.addEventListener("click", () => {
    if (!isTest || ownAccount) return;
    document.dispatchEvent(new CustomEvent("gradecrew:admin-account-action", {detail:{action:"archive",targets:[uid],value:!isArchived}}));
  });
}

function installListeners() {
  document.addEventListener("click", event => {
    const open = event.target.closest?.(".adminTeacherOpen[data-id]");
    if (open) {
      selectedUid = open.dataset.id || "";
      scheduleDecorate(0);
      window.setTimeout(() => renderDetailControls(selectedUid), 0);
      window.setTimeout(() => renderDetailControls(selectedUid), 80);
      return;
    }
    if (event.target.closest?.(".adminToggleUser")) {
      window.setTimeout(async () => {
        await refreshUsers();
        scheduleDecorate();
      }, 500);
    }
  }, true);

  const observer = new MutationObserver(() => scheduleDecorate(20));
  observer.observe(document.body, { subtree: true, childList: true });
}

export async function installAdminTestAccountControls() {
  if (document.documentElement.dataset.gcAdminTestAccountControls === "1") return;
  document.documentElement.dataset.gcAdminTestAccountControls = "1";
  installStyles();
  currentAdmin = await readCurrentRole();
  if (!currentAdmin) return;
  await refreshUsers();
  installListeners();
  document.addEventListener("gradecrew:admin-accounts-updated", async () => { await refreshUsers(); scheduleDecorate(); });
  onAuthStateChanged(auth, async user => {
    const uid = user?.uid; selectedUid = ""; userCache.clear(); currentAdmin = false;
    document.getElementById(CONTROLS_ID)?.remove();
    document.getElementById(TOOLBAR_ID)?.remove();
    if (!uid) return;
    const allowed = await readCurrentRole();
    if (auth.currentUser?.uid !== uid) return;
    currentAdmin = allowed;
    if (allowed) { await refreshUsers(); if (auth.currentUser?.uid === uid) scheduleDecorate(); }
  });
  scheduleDecorate();
}

void installAdminTestAccountControls();
