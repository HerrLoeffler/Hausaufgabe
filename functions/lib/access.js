"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

async function requireAiUser(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (!snap.exists) throw new HttpsError("permission-denied", "Benutzerprofil fehlt.");
  const profile = snap.data() || {};
  if (profile.status && profile.status !== "active") throw new HttpsError("permission-denied", "Account ist nicht aktiv.");
  // Beta zunächst bewusst nur für Admins. Später auf teacher erweitern.
  if (profile.role !== "admin") throw new HttpsError("permission-denied", "KI-Beta ist derzeit nur für Admins freigeschaltet.");
  return { uid, profile };
}
module.exports = { requireAiUser };