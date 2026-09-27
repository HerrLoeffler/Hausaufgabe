"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

function aiBetaAllowed(profile = {}) {
  return profile.role === "admin" || (profile.role === "teacher" && profile.aiBetaEnabled === true);
}

async function requireAiUser(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (!snap.exists) throw new HttpsError("permission-denied", "Benutzerprofil fehlt.");
  const profile = snap.data() || {};
  if (profile.status && profile.status !== "active") throw new HttpsError("permission-denied", "Account ist nicht aktiv.");
  if (!aiBetaAllowed(profile)) throw new HttpsError("permission-denied", "Die KI-Beta ist für diesen Account noch nicht freigeschaltet.");
  return { uid, profile };
}
module.exports = { requireAiUser, aiBetaAllowed };