"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { REGION } = require("./lib/constants");
const {
  normalizeRole,
  canChangeRole,
  canSetTestAccount,
  canDeleteTestAccount
} = require("./lib/admin-user-policy");

const opts = {
  region: REGION,
  timeoutSeconds: 120,
  memory: "512MiB",
  enforceAppCheck: false
};

function cleanUid(value) {
  const uid = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(uid)) throw new HttpsError("invalid-argument", "Ungültige Benutzer-ID.");
  return uid;
}

async function requireAdmin(request) {
  const actorUid = request.auth?.uid;
  if (!actorUid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  const db = getFirestore();
  const snap = await db.doc(`users/${actorUid}`).get();
  const profile = snap.data() || {};
  if (!snap.exists || profile.role !== "admin" || profile.status === "suspended") {
    throw new HttpsError("permission-denied", "Nur für aktive Administratoren.");
  }
  return { actorUid, actorProfile: profile };
}

async function loadTarget(targetUid) {
  const ref = getFirestore().doc(`users/${targetUid}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Benutzerkonto nicht gefunden.");
  return { ref, profile: snap.data() || {} };
}

async function writeAudit(actorUid, action, targetUid, details = {}) {
  await getFirestore().collection("adminAudit").add({
    actorUid,
    action,
    targetUid,
    details,
    createdAt: FieldValue.serverTimestamp()
  });
}

async function queryOwnedQuizzes(targetUid) {
  return getFirestore().collection("quizzes").where("ownerId", "==", targetUid).get();
}

async function deleteMatchingDocs(query) {
  const db = getFirestore();
  const snap = await query.get();
  for (const doc of snap.docs) await db.recursiveDelete(doc.ref);
  return snap.size;
}

async function inspectTarget(targetUid) {
  const { profile } = await loadTarget(targetUid);
  const quizzes = await queryOwnedQuizzes(targetUid);
  return {
    uid: targetUid,
    displayName: String(profile.displayName || "").slice(0, 160),
    email: String(profile.email || "").slice(0, 320),
    role: normalizeRole(profile.role),
    status: profile.status === "suspended" ? "suspended" : "active",
    isTestAccount: profile.isTestAccount === true,
    ownedQuizCount: quizzes.size
  };
}

const manageAdminUser = onCall(opts, async request => {
  const { actorUid } = await requireAdmin(request);
  const action = String(request.data?.action || "");
  const targetUid = cleanUid(request.data?.targetUid);
  const { ref, profile } = await loadTarget(targetUid);

  if (action === "inspect") return inspectTarget(targetUid);

  if (action === "set_role") {
    const nextRole = normalizeRole(request.data?.role);
    const policy = canChangeRole({
      actorUid,
      targetUid,
      currentRole: normalizeRole(profile.role),
      nextRole,
      isTestAccount: profile.isTestAccount === true
    });
    if (!policy.ok) throw new HttpsError("failed-precondition", `Rollenänderung nicht erlaubt: ${policy.reason}.`);
    await ref.update({ role: nextRole, updatedAt: FieldValue.serverTimestamp() });
    await writeAudit(actorUid, "user_role_changed", targetUid, { role: nextRole });
    return { ok: true, role: nextRole };
  }

  if (action === "set_test_account") {
    const nextValue = request.data?.value === true;
    const policy = canSetTestAccount({
      actorUid,
      targetUid,
      targetRole: normalizeRole(profile.role),
      nextValue
    });
    if (!policy.ok) throw new HttpsError("failed-precondition", `Testkonto-Änderung nicht erlaubt: ${policy.reason}.`);
    await ref.update({
      isTestAccount: nextValue,
      testAccountUpdatedAt: FieldValue.serverTimestamp(),
      testAccountUpdatedBy: actorUid,
      updatedAt: FieldValue.serverTimestamp()
    });
    await writeAudit(actorUid, nextValue ? "user_marked_test_account" : "user_unmarked_test_account", targetUid);
    return { ok: true, isTestAccount: nextValue };
  }

  if (action === "delete_test_account") {
    const quizzes = await queryOwnedQuizzes(targetUid);
    const deleteData = request.data?.deleteData === true;
    const policy = canDeleteTestAccount({
      actorUid,
      targetUid,
      targetRole: normalizeRole(profile.role),
      isTestAccount: profile.isTestAccount === true,
      ownedQuizCount: quizzes.size,
      deleteData
    });
    if (!policy.ok) {
      throw new HttpsError("failed-precondition", `Testkonto kann nicht gelöscht werden: ${policy.reason}.`, {
        ownedQuizCount: quizzes.size,
        reason: policy.reason
      });
    }
    if (quizzes.size > 50) {
      throw new HttpsError("failed-precondition", "Dieses Testkonto besitzt ungewöhnlich viele Tests. Bitte zuerst manuell prüfen.", {
        ownedQuizCount: quizzes.size,
        reason: "too-many-quizzes"
      });
    }

    // Erst den Auth-Account deaktivieren, damit während der Bereinigung keine neuen
    // Daten mehr erzeugt werden können. Bei einem Fehler bleibt er damit sicher gesperrt.
    try { await getAuth().updateUser(targetUid, { disabled: true }); }
    catch (error) {
      if (error?.code !== "auth/user-not-found") throw error;
    }

    let deletedQuizzes = 0;
    if (deleteData) {
      const db = getFirestore();
      for (const quiz of quizzes.docs) {
        await db.recursiveDelete(quiz.ref);
        deletedQuizzes += 1;
      }
      await deleteMatchingDocs(db.collection("feedback").where("userId", "==", targetUid));
      await deleteMatchingDocs(db.collection("aiJobs").where("ownerId", "==", targetUid));
    }

    await getFirestore().recursiveDelete(ref);
    try { await getAuth().deleteUser(targetUid); }
    catch (error) {
      if (error?.code !== "auth/user-not-found") throw error;
    }
    await writeAudit(actorUid, "test_account_deleted", targetUid, {
      deletedQuizzes,
      deletedData: deleteData
    });
    return { ok: true, deleted: true, deletedQuizzes };
  }

  throw new HttpsError("invalid-argument", "Unbekannte Admin-Aktion.");
});

module.exports = { manageAdminUser, inspectTarget };
