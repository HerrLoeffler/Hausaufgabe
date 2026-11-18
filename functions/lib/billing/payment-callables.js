"use strict";
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { createPaymentHandler } = require("./handlers");
const { getPaymentRuntime, projectId, firebaseError } = require("./runtime");
const { createStripeWebhookVerifier, createWebhookHandler, createLegacyWebhookForwarder } = require("./payment-http");
const stripeKey = defineSecret("GRADECREW_BILLING_SANDBOX_STRIPE_API_KEY");
const webhookSecret = defineSecret("GRADECREW_BILLING_SANDBOX_STRIPE_WEBHOOK_SECRET");
const limits = { region: "europe-west1", timeoutSeconds: 60, memory: "256MiB", maxInstances: 1, concurrency: 10,
  serviceAccount: "gradecrew-billing-sandbox@gradecrew-staging-2026.iam.gserviceaccount.com" };
const billingPayments = onCall({ ...limits, secrets: [stripeKey],
  cors: /^https:\/\/gradecrew-staging-2026--billing-(?:product|plan-01)-[a-z0-9]+\.web\.app$/, enforceAppCheck: false
}, async request => {
  try { return await createPaymentHandler(getPaymentRuntime(stripeKey.value()).service)(request); }
  catch (error) { const converted = firebaseError(error); if (converted instanceof HttpsError) throw converted; throw new HttpsError("unavailable", "Der Zahlungstest ist gerade nicht erreichbar."); }
});
const billingStripeWebhook = onRequest({ ...limits, secrets: [stripeKey, webhookSecret], cors: false }, async (request, response) => {
  try {
    return await createWebhookHandler({ projectId: projectId(), verify: createStripeWebhookVerifier(webhookSecret.value()), getService: () => getPaymentRuntime(stripeKey.value()).service,
      forwardLegacy: createLegacyWebhookForwarder() })(request, response);
  } catch { return response.status(503).json({ received: false }); }
});
module.exports = { billingPayments, billingStripeWebhook };
