"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
// Persist private account data only while the same transaction observes a live profile.
async function requireAccountWrite(tx, db, uid) {
  const user = await tx.get(db.doc(`users/${uid}`));
  const deleted = await tx.get(db.doc(`accountDeletions/${uid}`));
  const profile = user.data();
  if (!user.exists || deleted.exists || profile.accountDeletionId || (profile.status && profile.status !== "active")) {
    throw new HttpsError("permission-denied", "Konto nicht aktiv.");
  }
}
module.exports = { requireAccountWrite };
