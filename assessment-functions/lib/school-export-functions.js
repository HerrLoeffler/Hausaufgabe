"use strict";

const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldPath } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { createSchoolExportService } = require("./school-export-service");
if (!getApps().length) initializeApp();

function adapter() {
  const db = getFirestore();
  return {
    timestamp: value => Timestamp.fromMillis(value),
    transaction: callback => db.runTransaction(tx => callback({
      get: async path => { const snap = await tx.get(db.doc(path)); return snap.exists ? snap.data() : null; },
      list: async (path, max) => {
        const rows = [];
        let cursor = null;
        while (rows.length <= max) {
          let query = db.collection(path).orderBy(FieldPath.documentId()).limit(Math.min(100, max + 1 - rows.length));
          if (cursor) query = query.startAfter(cursor);
          const page = await tx.get(query);
          rows.push(...page.docs.map(doc => ({ id: doc.id, data: doc.data() })));
          if (page.size < Math.min(100, max + 1 - (rows.length - page.size))) return rows;
          cursor = page.docs.at(-1);
        }
        return rows;
      },
      create: (path, value) => tx.create(db.doc(path), value),
      update: (path, value) => tx.update(db.doc(path), value)
    }));
  };
}

const service = () => createSchoolExportService({ store: adapter(), projectId: process.env.GCLOUD_PROJECT });
const opts = { region: "europe-west1", timeoutSeconds: 60, memory: "512MiB", maxInstances: 2, enforceAppCheck: false };
async function run(action, request) {
  try {
    const data = request.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Object.assign(Error("Ungültige Anfrage."), { code: "invalid-argument" });
    return await service()[action]({ ...data, uid: request.auth?.uid });
  }
  catch (error) {
    if (error instanceof HttpsError) throw error;
    const code = ["unauthenticated", "permission-denied", "invalid-argument", "failed-precondition", "resource-exhausted", "aborted", "already-exists"].includes(error.code) ? error.code : "internal";
    throw new HttpsError(code, code === "internal" ? "Die Testfunktion ist vorübergehend nicht verfügbar." : error.message);
  }
}

exports.schoolSaveReview = onCall(opts, request => run("saveReview", request));
exports.schoolUndoReview = onCall(opts, request => run("undoReview", request));
exports.schoolExportWork = onCall(opts, request => run("exportWork", request));
