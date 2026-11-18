"use strict";
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { createPilotHandler } = require("./handlers");
const { getRuntime, firebaseError } = require("./runtime");

const billingPilot = onCall({ region: "europe-west1", timeoutSeconds: 60, memory: "256MiB", maxInstances: 1,
  cors: /^https:\/\/gradecrew-staging-2026--billing-(?:product|plan-01)-[a-z0-9]+\.web\.app$/,
  enforceAppCheck: false
}, async request => {
  try { return await createPilotHandler(getRuntime().service)(request); }
  catch (error) {
    const converted = firebaseError(error);
    if (converted instanceof HttpsError) throw converted;
    console.error("Billing pilot failed", { code: String(error.code || "internal").slice(0, 60) });
    throw new HttpsError("internal", "Die Zugangsverwaltung ist gerade nicht erreichbar.");
  }
});
module.exports = { billingPilot };
