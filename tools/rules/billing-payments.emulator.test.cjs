"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const req = require("node:module").createRequire(require("node:path").resolve(__dirname, "../../functions/package.json"));
const { initializeApp, deleteApp } = req("firebase-admin/app");
const { getFirestore } = req("firebase-admin/firestore");
const { createBillingService, key } = req("./lib/billing/application");
const { createFirestoreBillingStore } = req("./lib/billing/firestore-store");
const { createWebhookHandler } = req("./lib/billing/payment-http");
assert.match(process.env.FIRESTORE_EMULATOR_HOST || "", /^(127\.0\.0\.1|localhost):\d+$/);
const app = initializeApp({ projectId: "demo-gradecrew-billing" }, "billing-payments");
const db = getFirestore(app), day = 86400000, start = Date.UTC(2026, 10, 1);
let time, service, calls, invoices, subscriptions, sessions, failCheckout, schoolPaymentBeforeReply;
const request = (uid = "teacher", data = {}) => ({ auth: { uid, token: { auth_time: time / 1000 } }, data });
const purchase = (extra = {}) => request("teacher", { planCode: "personal-monthly", requestId: "purchase-request", ...extra });
async function seed() {
  time = start + 20 * day; calls = []; invoices = new Map(); subscriptions = new Map(); sessions = new Map(); failCheckout = false; schoolPaymentBeforeReply = false;
  for (const c of ["users", "accountDeletions", "appConfig", "billingV2Accounts", "billingV2Grants", "billingV2Orders", "billingV2Buyers", "billingV2PurchaseLocks", "billingV2StripeEvents", "billingV2Invoices", "billingV2Reviews", "billingV2Schools", "billingV2Periods", "billingV2Memberships", "billingV2Audit", "billingV2Ledger", "quizzes"]) await db.recursiveDelete(db.collection(c));
  for (const uid of ["teacher", "other", "admin"]) await db.doc("users/" + uid).set({ role: uid === "admin" ? "admin" : "teacher", status: "active" });
  await db.doc("appConfig/billingProduct").set({ enabled: true, allowedUids: ["teacher", "other", "admin"], payments: { enabled: true, ready: true, accountId: "acct_1UYUaw1l0zkqOtXr", portalConfigurationId: "bpc_test", personalTestClockId: "clock_test", returnUrl: "https://gradecrew-staging-2026--billing-product-test.web.app/", prices: { "personal-monthly": "price_month", "personal-yearly": "price_year", "school-yearly": "price_school" } } });
  const provider = {
    createCustomer: async data => { calls.push(["customer", data]); return { id: "cus_" + data.buyerKey, livemode: false }; },
    createCheckout: async data => {
      calls.push(["checkout", data]);
      const value = { id: "cs_" + data.orderId, customer: data.customerId, subscription: "sub_" + data.orderId, livemode: false, metadata: { gc_order_id: data.orderId }, mode: "subscription", client_reference_id: data.orderId, status: "complete", url: "https://checkout.stripe.com/c/pay/cs_test", expires_at: Math.floor(data.checkoutExpiresAtMs / 1000) };
      sessions.set(value.id, value);
      subscriptions.set(value.subscription, { id: value.subscription, customer: data.customerId, livemode: false, metadata: { gc_order_id: data.orderId }, status: "active", items: { has_more: false, data: [{ price: { id: data.priceId }, quantity: 1 }] } });
      if (failCheckout) { failCheckout = false; throw new Error("Synthetic lost provider response"); }
      return value;
    },
    createSchoolInvoice: async data => {
      calls.push(["school", data]); if (data.onDraft) await data.onDraft("in_school");
      if (schoolPaymentBeforeReply) {
        schoolPaymentBeforeReply = false;
        const value = paidInvoice({ ...data, id: data.orderId }, "in_school"); value.parent = null; value.metadata = { gc_order_id: data.orderId }; value.lines.data[0].parent = { type: "invoice_item_details", invoice_item_details: { proration: false } }; value.hosted_invoice_url = "https://invoice.stripe.com/i/test";
        invoices.set(value.id, value); await service.processStripeEvent(event("evt_early_school", "invoice.paid", { id: value.id }));
        throw new Error("Synthetic lost finalized school response");
      }
      return { id: "in_school", livemode: false, hosted_invoice_url: "https://invoice.stripe.com/i/test" };
    },
    createPortal: async data => { calls.push(["portal", data]); return { url: "https://billing.stripe.com/p/session/test" }; },
    retrieveInvoice: async id => invoices.get(id), retrieveSubscription: async id => subscriptions.get(id), retrieveCheckout: async id => sessions.get(id), findCheckoutForOrder: async ({orderId,customerId}) => [...sessions.values()].find(value => value.metadata.gc_order_id === orderId && value.customer === customerId) || null
  };
  service = createBillingService({ store: createFirestoreBillingStore(db), now: () => time, projectId: "demo-gradecrew-billing", provider,
    getIdentity: async uid => ({ uid, email: uid + "@example.invalid", emailVerified: true, disabled: false, metadata: { creationTime: new Date(start).toISOString() } }) });
}
function event(id, type, object) { return { id, object: "event", livemode: false, type, data: { object }, created: Math.floor(time / 1000) }; }
function paidInvoice(order, id = "in_first", from = time, until = time + 30 * day) {
  if (order.kind === "school") { from = order.startsAtMs; until = order.endsAtMs; }
  return { id, object: "invoice", customer: order.customerId, livemode: false, currency: "eur", status: "paid", total: order.unitAmount, amount_due: order.unitAmount, amount_paid: order.unitAmount, amount_remaining: 0,
    parent: { type: "subscription_details", subscription_details: { subscription: "sub_" + order.id, metadata: { gc_order_id: order.id } } },
    lines: { has_more: false, data: [{ object: "line_item", livemode: false, invoice: id, currency: "eur", quantity: 1, pricing: { type: "price_details", price_details: { price: order.priceId } }, parent: { type: "subscription_item_details", subscription_item_details: { subscription: "sub_" + order.id, proration: false } }, period: { start: from / 1000, end: until / 1000 } }] } };
}
async function ordered() { const result = await service.checkout(purchase()); return (await db.doc("billingV2Orders/" + result.orderId).get()).data(); }
test.after(async () => { await db.terminate(); await deleteApp(app); });
test("payment controls require an explicitly ready server configuration and personal invoices stay private", async () => {
  await seed(); assert.equal((await service.getAccess(request())).purchasingEnabled, true);
  await db.doc("appConfig/billingProduct").update({ "payments.ready": false });
  assert.equal((await service.getAccess(request())).purchasingEnabled, false);
  await assert.rejects(service.checkout(purchase()), { code: "failed-precondition" });
  await db.doc("appConfig/billingProduct").update({ "payments.ready": true });
  const order = await ordered(), value = paidInvoice(order); invoices.set(value.id, value);
  await service.processStripeEvent(event("evt_invoice_view", "invoice.paid", { id: value.id }));
  assert.equal((await service.getAccess(request())).payments.invoices.length, 1);
  assert.equal((await service.getAccess(request("other"))).payments.invoices.length, 0);
});
test("concurrent purchase requests reuse one server order and buyer, independently of caller request IDs", async () => {
  await seed();
  const values = await Promise.all([service.checkout(purchase()), service.checkout(purchase({ requestId: "parallel-request" }))]);
  assert.equal(values[0].orderId, values[1].orderId);
  assert.equal((await db.collection("billingV2Orders").get()).size, 1);
  assert.equal((await db.collection("billingV2Buyers").get()).size, 1);
  assert.equal(new Set(calls.filter(c => c[0] === "checkout").map(c => c[1].orderId)).size, 1);
  assert.equal((await service.getAccess(request())).tier, "free");
});
test("a lost Checkout response resumes the same provider operation without granting access", async () => {
  await seed(); failCheckout = true;
  await assert.rejects(service.checkout(purchase()), /Synthetic lost/);
  const result = await service.checkout(purchase());
  assert.equal(calls.filter(c => c[0] === "checkout")[0][1].orderId, result.orderId);
  assert.equal((await db.collection("billingV2Grants").get()).size, 0);
});
test("stale unresolved provider operations stop before Stripe's idempotency retention expires", async () => {
  await seed(); failCheckout = true; await assert.rejects(service.checkout(purchase()));
  time += day;
  await assert.rejects(service.checkout(purchase()), { code: "failed-precondition" });
  assert.equal(calls.filter(c => c[0] === "checkout").length, 1);
});
test("clients cannot supply prices, buyers, foreign return URLs or disable the closed pilot", async () => {
  await seed(); await service.checkout(purchase({ customerId: "cus_foreign", unitAmount: 1, returnUrl: "https://evil.invalid/", priceId: "price_foreign" }));
  const actual = calls.find(c => c[0] === "checkout")[1];
  assert.equal(actual.unitAmount, 1500); assert.equal(actual.priceId, "price_month"); assert.match(actual.returnUrl, /billing-product-test/);
  await assert.rejects(service.checkout(purchase({ planCode: "free" })), { code: "invalid-argument" });
  await db.doc("appConfig/billingProduct").update({ "payments.enabled": false });
  await assert.rejects(service.checkout(request("other", purchase().data)), { code: "failed-precondition" });
});
test("personal test-clock binding is persisted with the buyer and does not attach the school buyer", async () => {
  await seed(); await ordered();
  assert.equal(calls.find(c => c[0] === "customer")[1].testClockId, "clock_test");
  const made = await service.createSchool(request("admin", { ownerId: "teacher", name: "Clock independent school", seats: 1, startDate: "2026-11-21", requestId: "school-clock-test" }));
  await service.schoolInvoice(request("teacher", { schoolId: made.schoolId, requestId: "school-clock-invoice" }));
  assert.equal(calls.filter(c => c[0] === "customer")[1][1].testClockId, null);
});
test("checkout completion binds the subscription but never activates Premium", async () => {
  await seed(); const order = await ordered();
  await service.processStripeEvent(event("evt_complete", "checkout.session.completed", { id: "cs_" + order.id }));
  assert.equal((await service.getAccess(request())).tier, "free");
  assert.equal((await db.collection("billingV2Grants").get()).size, 0);
});
test("a paid invoice arriving before checkout completion activates real creation exactly once", async () => {
  await seed(); const order = await ordered(), value = paidInvoice(order); invoices.set(value.id, value);
  await assert.rejects(service.createQuiz(request("teacher", { requestId: "before-payment", kind: "manual", quiz: { title: "Not paid" } })), { code: "permission-denied" });
  await service.processStripeEvent(event("evt_paid", "invoice.paid", { id: value.id }));
  await service.processStripeEvent(event("evt_paid", "invoice.paid", { id: value.id }));
  await service.processStripeEvent(event("evt_duplicate", "invoice.paid", { id: value.id }));
  assert.equal((await service.getAccess(request())).tier, "personal_premium");
  assert.ok((await service.createQuiz(request("teacher", { requestId: "after-payment", kind: "manual", quiz: { title: "Paid creation" } }))).code);
  assert.equal((await db.collection("billingV2Grants").get()).size, 1);
  assert.equal((await db.collection("billingV2Invoices").get()).size, 1);
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs, time + 30 * day);
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().createdCount, 0);
});
test("future renewal extends continuous access and payment failure cannot remove paid or complimentary time", async () => {
  await seed(); const order = await ordered();
  for (const [id, from, until] of [["in_future", time + 30 * day, time + 60 * day], ["in_first", time, time + 30 * day]]) {
    const value = paidInvoice(order, id, from, until); invoices.set(id, value); await service.processStripeEvent(event("evt_" + id, "invoice.paid", { id }));
  }
  assert.equal((await service.getAccess(request())).validUntil, time + 60 * day);
  const failed = paidInvoice(order, "in_failed", time + 60 * day, time + 90 * day); Object.assign(failed, { status: "open", amount_paid: 0, amount_remaining: 1500 }); invoices.set(failed.id, failed);
  await service.processStripeEvent(event("evt_failed", "invoice.payment_failed", { id: failed.id }));
  assert.equal((await service.getAccess(request())).validUntil, time + 60 * day);
  await service.grantPremium(request("admin", { personId: "teacher", requestId: "manual-unchanged", reason: "Colleague", endsAtMs: null }));
  await service.processStripeEvent(event("evt_failed_again", "invoice.payment_failed", { id: failed.id }));
  assert.equal((await service.getAccess(request())).validUntil, null);
});
test("paid gaps remain closed and access ends at the exact service boundary", async () => {
  await seed(); const order = await ordered(), original = time;
  for (const [id, from, until] of [["in_first", time, time + day], ["in_later", time + 2 * day, time + 3 * day]]) {
    const value = paidInvoice(order, id, from, until); invoices.set(id, value); await service.processStripeEvent(event("evt_" + id, "invoice.paid", { id }));
  }
  time = original + day; assert.equal((await service.getAccess(request())).tier, "free");
  time = original + 2 * day; assert.equal((await service.getAccess(request())).tier, "personal_premium");
  time = original + 3 * day; assert.equal((await service.getAccess(request())).tier, "free");
});
test("foreign customer, wrong order or live events cannot activate a local account", async () => {
  await seed(); const order = await ordered(), value = paidInvoice(order); value.customer = "cus_other"; invoices.set(value.id, value);
  await assert.rejects(service.processStripeEvent(event("evt_foreign", "invoice.paid", { id: value.id })));
  value.customer = order.customerId; value.parent.subscription_details.metadata.gc_order_id = "unknown";
  await assert.rejects(service.processStripeEvent(event("evt_unknown", "invoice.paid", { id: value.id })));
  const live = event("evt_live", "invoice.paid", { id: value.id }); live.livemode = true;
  await assert.rejects(service.processStripeEvent(live));
  assert.equal((await db.collection("billingV2Grants").get()).size, 0);
});
test("a school buyer is separate and only the full 50 euros activate its paid period", async () => {
  await seed(); await ordered();
  const made = await service.createSchool(request("admin", { ownerId: "teacher", name: "Synthetic School", seats: 1, startDate: "2026-11-21", requestId: "school-purchase" }));
  await assert.rejects(service.schoolInvoice(request("other", { schoolId: made.schoolId, requestId: "foreign-invoice" })), { code: "permission-denied" });
  const response = await service.schoolInvoice(request("teacher", { schoolId: made.schoolId, requestId: "school-invoice" }));
  const order = (await db.doc("billingV2Orders/" + response.orderId).get()).data();
  assert.notEqual(order.customerId, calls.find(c => c[0] === "checkout")[1].customerId);
  const value = paidInvoice({ ...order, unitAmount: 5000 }, "in_school"); value.parent = null; value.metadata = { gc_order_id: order.id }; value.lines.data[0].parent = { type: "invoice_item_details", invoice_item_details: { proration: false } };
  for (const [amount, remaining, status, expected] of [[1000, 4000, "open", "open"], [3000, 2000, "open", "open"], [5000, 0, "paid", "paid"]]) {
    Object.assign(value, { amount_paid: amount, amount_remaining: remaining, status }); invoices.set(value.id, value);
    await service.processStripeEvent(event("evt_school" + amount, "invoice.updated", { id: value.id }));
    assert.equal((await db.doc("billingV2Periods/" + made.periodId).get()).data().paymentStatus, expected);
    assert.equal((await service.getAccess(request())).tier, expected === "paid" ? "school" : "free");
  }
  assert.equal(calls.filter(c => c[0] === "school").length, 1);
});
test("portal always uses the caller's personal buyer and refund events become review cases", async () => {
  await seed(); await ordered();
  await service.portal(request("teacher", { customerId: "cus_foreign" }));
  assert.equal(calls.find(c => c[0] === "portal")[1].customerId, calls.find(c => c[0] === "checkout")[1].customerId);
  assert.equal(calls.find(c => c[0] === "portal")[1].configurationId, "bpc_test");
  await assert.rejects(service.portal(request("other", { customerId: "cus_foreign" })), { code: "not-found" });
  await service.processStripeEvent(event("evt_refund", "charge.refunded", { id: "ch_test", customer: "cus_x" }));
  assert.equal((await db.collection("billingV2Reviews").get()).size, 1);
  const record = (await db.doc("billingV2StripeEvents/evt_refund").get()).data();
  assert.equal(JSON.stringify(record).includes("cus_x"), false);
});
test("a school payment before a lost finalize reply preserves the same invoice and its authorized link", async () => {
  await seed(); const made = await service.createSchool(request("admin", { ownerId: "teacher", name: "Synthetic school recovery", seats: 1, startDate: "2026-11-21", requestId: "school-recovery" }));
  schoolPaymentBeforeReply = true;
  await assert.rejects(service.schoolInvoice(request("teacher", { schoolId: made.schoolId, requestId: "school-lost-reply" })), /Synthetic lost/);
  assert.equal((await db.doc("billingV2Periods/" + made.periodId).get()).data().paymentStatus, "paid");
  const result = await service.schoolInvoice(request("teacher", { schoolId: made.schoolId, requestId: "school-retry-reply" }));
  assert.equal(result.invoiceId, "in_school"); assert.match(result.url, /invoice.stripe.com/); assert.equal(calls.filter(c => c[0] === "school").length, 1);
});
test("school payment unlocks the separate assessment guard without a subsequent account refresh", async () => {
  await seed(); const made = await service.createSchool(request("admin", { ownerId: "teacher", name: "Immediate school activation", seats: 1, startDate: "2026-11-01", requestId: "school-auto-activate" }));
  const assessment = require("node:module").createRequire(require("node:path").resolve(__dirname, "../../assessment-functions/package.json"));
  const { requireBillingPublish } = assessment("./lib/billing-access");
  const publish = () => db.runTransaction(tx => requireBillingPublish(tx, db, { auth: { token: { email_verified: true } } }, "teacher"));
  const account = (await db.doc("billingV2Accounts/teacher").get()).data();
  assert.equal(account?.emailVerified, true);
  await assert.rejects(publish(), { code: "permission-denied" });
  const result = await service.schoolInvoice(request("teacher", { schoolId: made.schoolId, requestId: "school-auto-invoice" }));
  const order = (await db.doc("billingV2Orders/" + result.orderId).get()).data();
  const value = paidInvoice(order, "in_school"); value.parent = null; value.metadata = { gc_order_id: order.id }; value.lines.data[0].parent = { type: "invoice_item_details", invoice_item_details: { proration: false } };
  invoices.set(value.id, value); await service.processStripeEvent(event("evt_auto_school", "invoice.paid", { id: value.id }));
  await publish();
});
test("the actual event-to-HTTP path forwards only historical unowned paid invoices", async () => {
  await seed(); let forwarded = 0;
  invoices.set("in_legacy", { id: "in_legacy", livemode: false }); sessions.set("cs_legacy", { id: "cs_legacy", livemode: false });
  for (const [type, id, count] of [["invoice.paid", "in_legacy", 1], ["checkout.session.completed", "cs_legacy", 1]]) {
    const handler = createWebhookHandler({ projectId: "gradecrew-staging-2026", verify: () => event("evt_" + id, type, { id }), getService: () => service, forwardLegacy: async () => { forwarded++; } });
    const response = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json() { return this; } };
    await handler({ method: "POST", rawBody: Buffer.from("{}"), headers: { "stripe-signature": "fixture" } }, response);
    assert.equal(response.statusCode, 200); assert.equal(forwarded, count);
  }
});
