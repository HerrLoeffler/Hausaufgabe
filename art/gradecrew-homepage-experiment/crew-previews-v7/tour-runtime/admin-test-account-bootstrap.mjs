import { getApp } from "./firebase-local.mjs";
import { getAuth, onAuthStateChanged } from "./firebase-local.mjs";

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
