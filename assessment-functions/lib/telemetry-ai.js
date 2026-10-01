"use strict";
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { enabled } = require("./telemetry-core");
const { summarizeAiEvents, summarizeTeacherFeedback } = require("./telemetry-ai-core");

const opts = { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB", enforceAppCheck: false };

function gate() {
  if (!enabled()) throw new HttpsError("failed-precondition", "Die Staging-Messung ist nicht aktiviert.");
}

async function activeProfile(db, uid) {
  const snap = await db.doc(`users/${uid}`).get();
  const profile = snap.data();
  if (!profile || profile.status === "suspended") throw new HttpsError("permission-denied", "Kein aktiver Zugriff.");
  return profile;
}

exports.getExistingAiTelemetrySummary = onCall(opts, async request => {
  gate();
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  if (request.data && Object.keys(request.data).length) throw new HttpsError("invalid-argument", "Diese Auswertung erwartet keine Parameter.");

  const db = getFirestore();
  const uid = request.auth.uid;
  await activeProfile(db, uid);

  const eventsQuery = db.collection(`users/${uid}/aiEvents`)
    .select("kind", "inputTokens", "outputTokens", "totalTokens", "model", "promptVersion", "failed", "questionCount", "replacedQuestions", "questionRepairAttempts", "qualityReviewPasses")
    .limit(1001);
  const feedbackQuery = db.collection("feedback")
    .where("userId", "==", uid)
    .where("category", "==", "ai_question")
    .select("category", "verdict", "reason", "promptVersion", "reviewOutcome", "reviewerReason")
    .limit(1001);

  const [eventsSnap, feedbackSnap] = await Promise.all([eventsQuery.get(), feedbackQuery.get()]);
  const eventRows = eventsSnap.docs.slice(0, 1000).map(doc => doc.data());
  const feedbackRows = feedbackSnap.docs.slice(0, 1000).map(doc => doc.data());

  return {
    schemaVersion: 1,
    source: "existing-stored-data",
    aiUsage: summarizeAiEvents(eventRows, { truncated: eventsSnap.size > 1000 }),
    teacherFeedback: summarizeTeacherFeedback(feedbackRows, { truncated: feedbackSnap.size > 1000 }),
    cost: null,
    costReason: "no-versioned-model-price-ledger-in-stored-data",
    publicationUseLink: null,
    publicationUseLinkReason: "generation-events-are-not-yet-linked-to-published-and-used-test-versions"
  };
});
