"use strict";

const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");

const REGION = "europe-west1";

exports.cleanupAssessmentPrivateOnQuizDelete = onDocumentDeleted({
  document: "quizzes/{quizId}",
  region: REGION,
  memory: "256MiB",
  timeoutSeconds: 60
}, async event => {
  const quizId = String(event.params.quizId || "");
  if (!quizId) return;
  const db = getFirestore();
  const snapshot = await db.collection("assessmentPrivate").where("quizId", "==", quizId).get();
  if (snapshot.empty) return;

  // Classroom-sized assessments stay far below 500 attempts. Chunking keeps the
  // cleanup correct even if a test was used by many cohorts before deletion.
  const docs = snapshot.docs;
  for (let offset = 0; offset < docs.length; offset += 400) {
    const batch = db.batch();
    docs.slice(offset, offset + 400).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
});
