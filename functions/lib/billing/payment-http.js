"use strict";
const { BillingError } = require("./application");
function createStripeWebhookVerifier(secret, Stripe = require("stripe")) {
  if (typeof secret !== "string" || !/^whsec_[A-Za-z0-9_]+$/.test(secret)) throw new TypeError("Webhook-Konfiguration fehlt.");
  return (raw, signature) => {
    if (!Buffer.isBuffer(raw) || raw.length > 1048576 || typeof signature !== "string" || signature.length > 2048) throw new TypeError("Ungültige Stripe-Signatur.");
    try { return Stripe.webhooks.constructEvent(raw, signature, secret, 300); }
    catch { throw new TypeError("Ungültige Stripe-Signatur."); }
  };
}
function createLegacyWebhookForwarder(send = (...args) => globalThis.fetch(...args)) {
  return async (raw, signature) => {
    const result = await send("https://gradecrew-billing-sandbox-ybff4nqitq-ew.a.run.app/billing-test/api/webhook", {
      method: "POST", redirect: "error", signal: globalThis.AbortSignal.timeout(15000), body: raw,
      headers: { "Content-Type": "application/json", "Stripe-Signature": signature }
    });
    if (result.status < 200 || result.status >= 300) throw new Error("Bisherige Testverarbeitung nicht erreichbar.");
  };
}
function createWebhookHandler({ projectId, verify, getService, forwardLegacy }) {
  if (projectId !== "gradecrew-staging-2026") throw new BillingError("failed-precondition", "Stripe-Webhook nur in der getrennten Testumgebung.");
  return async (request, response) => {
    if (request.method !== "POST") return response.status(405).json({ received: false });
    let event;
    try {
      event = verify(request.rawBody, request.headers?.["stripe-signature"]);
      if (event?.object !== "event" || event.livemode !== false) throw new Error("Test event required");
    } catch { return response.status(400).json({ received: false }); }
    try {
      const result = await getService().processStripeEvent(event);
      if (result?.unmanaged && event.type === "invoice.paid") {
        if (!forwardLegacy) throw new Error("Legacy routing required");
        await forwardLegacy(request.rawBody, request.headers["stripe-signature"]);
      }
      return response.status(200).json({ received: true });
    }
    catch { return response.status(503).json({ received: false }); }
  };
}
module.exports = { createStripeWebhookVerifier, createWebhookHandler, createLegacyWebhookForwarder };
