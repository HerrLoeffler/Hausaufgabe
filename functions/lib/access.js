"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

// AI access is currently open to all active teacher/admin accounts. The old
// per-account beta flag remains in existing profiles but is intentionally
// ignored so onboarding and testing do not depend on manual admin approval.
function aiBetaAllowed(profile = {}) {
  return profile.role === "admin" || profile.role === "teacher";
}

async function requireAiUser(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (!snap.exists) throw new HttpsError("permission-denied", "Benutzerprofil fehlt.");
  const profile = snap.data() || {};
  if (profile.status && profile.status !== "active") throw new HttpsError("permission-denied", "Account ist nicht aktiv.");
  if (!aiBetaAllowed(profile)) throw new HttpsError("permission-denied", "KI-Funktionen sind nur für Lehrkräfte verfügbar.");
  return { uid, profile };
}
module.exports = { requireAiUser, aiBetaAllowed };
