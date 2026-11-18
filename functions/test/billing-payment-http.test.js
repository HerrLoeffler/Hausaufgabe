"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const Stripe = require("stripe");
const { createStripeWebhookVerifier, createWebhookHandler, createLegacyWebhookForwarder } = require("../lib/billing/payment-http");
const { createPaymentHandler } = require("../lib/billing/handlers");
const secret = "whsec_local_test_signature_fixture";
function response() { return { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.body = data; return this; }, send(data) { this.body = data; return this; } }; }
test("raw-body webhook verification rejects missing, old and modified signatures", () => {
  const verify = createStripeWebhookVerifier(secret), body = Buffer.from(JSON.stringify({ id: "evt_test", livemode: false }));
  const signature = Stripe.webhooks.generateTestHeaderString({ payload: body.toString(), secret });
  assert.equal(verify(body, signature).id, "evt_test");
  assert.throws(() => verify(body, undefined));
  assert.throws(() => verify(Buffer.from(body.toString() + " "), signature));
  const old = Stripe.webhooks.generateTestHeaderString({ payload: body.toString(), secret, timestamp: Math.floor(Date.now() / 1000) - 301 });
  assert.throws(() => verify(body, old));
  assert.throws(() => verify(JSON.parse(body.toString()), signature));
});
test("webhook checks project and signature before loading the payment runtime", async () => {
  let calls = 0;
  assert.throws(() => createWebhookHandler({ projectId: "hausaufgabe-staging" }));
  const handler = createWebhookHandler({ projectId: "gradecrew-staging-2026", verify: createStripeWebhookVerifier(secret), getService: () => { calls++; return { processStripeEvent: async () => ({ paid: true }) }; } });
  const invalid = response(); await handler({ method: "POST", rawBody: Buffer.from("{}"), headers: {} }, invalid);
  assert.equal(invalid.statusCode, 400); assert.equal(calls, 0);
  const body = Buffer.from(JSON.stringify({ object: "event", id: "evt_test", livemode: false })), signature = Stripe.webhooks.generateTestHeaderString({ payload: body.toString(), secret });
  const result = response(); await handler({ method: "POST", rawBody: body, headers: { "stripe-signature": signature } }, result);
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { received: true }); assert.equal(calls, 1);
  const live = Buffer.from('{"object":"event","livemode":true}'), liveSignature = Stripe.webhooks.generateTestHeaderString({ payload: live.toString(), secret });
  const denied = response(); await handler({ method: "POST", rawBody: live, headers: { "stripe-signature": liveSignature } }, denied);
  assert.equal(denied.statusCode, 400); assert.equal(calls, 1);
});
test("provider processing errors return retryable generic errors without billing or secret details", async () => {
  const handler = createWebhookHandler({ projectId: "gradecrew-staging-2026", verify: () => ({ object: "event", livemode: false }), getService: () => ({ processStripeEvent: async () => { throw new Error("private customer sk_test_fixture"); } }) });
  const result = response(); await handler({ method: "POST", rawBody: Buffer.from("{}"), headers: { "stripe-signature": "fixture" } }, result);
  assert.equal(result.statusCode, 503); assert.equal(JSON.stringify(result.body).includes("private"), false);
});
test("payment callable requires login and cannot dispatch server-only event processing", async () => {
  const seen = [], handle = createPaymentHandler({ checkout: async request => { seen.push(request.auth.uid); return { url: "https://checkout.stripe.com/test" }; } });
  await assert.rejects(handle({ data: { action: "checkout" } }), { code: "unauthenticated" });
  await assert.rejects(handle({ auth: { uid: "teacher" }, data: { action: "processStripeEvent" } }), { code: "invalid-argument" });
  await handle({ auth: { uid: "teacher" }, data: { action: "checkout", personId: "other" } }); assert.deepEqual(seen, ["teacher"]);
});
test("existing sandbox invoices retain their original handler without creating another signing secret", async () => {
  const forwarded = [], handler = createWebhookHandler({ projectId: "gradecrew-staging-2026", verify: () => ({ object: "event", livemode: false, type: "invoice.paid" }),
    getService: () => ({ processStripeEvent: async () => ({ unmanaged: true }) }), forwardLegacy: async (raw, signature) => { forwarded.push({ raw, signature }); } });
  const raw = Buffer.from('{"legacy":true}'), result = response();
  await handler({ method: "POST", rawBody: raw, headers: { "stripe-signature": "signed fixture" } }, result);
  assert.equal(result.statusCode, 200); assert.equal(forwarded[0].raw, raw); assert.equal(forwarded[0].signature, "signed fixture");
});
test("legacy forwarding has one fixed Stage destination, no redirects and retryable failures", async () => {
  const calls = [], forward = createLegacyWebhookForwarder(async (url, options) => { calls.push({ url, options }); return { status: 204 }; });
  const raw = Buffer.from("{}"); await forward(raw, "signed fixture");
  assert.equal(calls[0].url, "https://gradecrew-billing-sandbox-ybff4nqitq-ew.a.run.app/billing-test/api/webhook");
  assert.equal(calls[0].options.redirect, "error"); assert.equal(calls[0].options.body, raw);
  assert.equal(calls[0].options.headers["Stripe-Signature"], "signed fixture");
  await assert.rejects(createLegacyWebhookForwarder(async () => ({ status: 503 }))(raw, "fixture"));
});
test("unowned new event types are acknowledged without extending the historical invoice.paid contract", async () => {
  let forwarded = 0;
  const handler = createWebhookHandler({ projectId: "gradecrew-staging-2026", verify: () => ({ object: "event", livemode: false, type: "checkout.session.completed" }),
    getService: () => ({ processStripeEvent: async () => ({ unmanaged: true }) }), forwardLegacy: async () => { forwarded++; } });
  const result = response(); await handler({ method: "POST", rawBody: Buffer.from("{}"), headers: { "stripe-signature": "fixture" } }, result);
  assert.equal(result.statusCode, 200); assert.equal(forwarded, 0);
});
test("the actual exported payment endpoints use the existing bounded Stage service identity", () => {
  const manifest = require("../../tools/billing/stage-permissions-plan.json");
  const { billingPayments, billingStripeWebhook } = require("../lib/billing/payment-callables");
  for (const endpoint of [billingPayments, billingStripeWebhook]) assert.equal(endpoint.__endpoint.serviceAccountEmail, manifest.paymentServiceAccount);
});
