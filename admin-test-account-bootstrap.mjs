import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const auth = getAuth(getApp());
let controlsLoaded = false;
let observerInstalled = false;

async function loadAdminControls() {
  if (controlsLoaded) return;
  controlsLoaded = true;
  try {
    await import("./admin-test-account-controls.mjs?v=2");
  } catch (error) {
    controlsLoaded = false;
    console.warn("GradeCrew Admin-Steuerung konnte nicht geladen werden.", error);
    window.setTimeout(() => {
      if (auth.currentUser) void loadAdminControls();
    }, 1000);
  }
}

export function startAdminTestAccountBootstrap() {
  if (auth.currentUser) {
    void loadAdminControls();
    return;
  }
  if (observerInstalled) return;
  observerInstalled = true;
  onAuthStateChanged(auth, user => {
    if (user) void loadAdminControls();
  });
}

startAdminTestAccountBootstrap();
