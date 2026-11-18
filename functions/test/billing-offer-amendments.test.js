"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { AsyncLocalStorage } = require("node:async_hooks");
const { SANDBOX_ACCOUNT } = require("../lib/billing/stripe-provider");
function factory() {
  let value;
  try { value = require("../lib/billing/offer-amendments").createOfferAmendmentOperations; } catch (error) { if (error.code !== "MODULE_NOT_FOUND") throw error; }
  assert.equal(typeof value, "function", "existing subscription amendment operations must exist"); return value;
}
function fixture() {
  let at = Date.UTC(2026, 10, 19, 12); const transactionScope = new AsyncLocalStorage();
  const key = (...parts) => createHash("sha256").update(JSON.stringify(parts)).digest("hex");
  const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
  const identifier = value => { if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) fail("invalid-argument", "id"); return value; };
  const config = { enabled: true, allowedUids: ["admin", "teacher_one", "teacher_two"], payments: { enabled: true, ready: true, offersReady: true, accountId: SANDBOX_ACCOUNT, personalTestClockId: "clock_test", portalConfigurationId: "bpc_test", returnUrl: "https://gradecrew-staging-2026--billing-product-test.web.app/", prices: { "personal-monthly": "price_month", "personal-yearly": "price_year", "school-yearly": "price_school" } } };
  const offer = { id: "offer_one", fingerprint: "offer_fingerprint", title: "Angebot", planCode: "personal-monthly", audience: "public", targetIds: [], discountType: "percent", percentOff: 20, fixedBasis: "invoice", duration: "months", durationMonths: 3, startsAtMs: at - 60000, endsAtMs: at + 86400000, status: "active", providerCouponId: "coupon_published", redemptionCount: 0, reservedCount: 0 };
  const records = new Map([["appConfig/billingProduct", config], ["billingV2Offers/offer_one", offer], ["users/admin", { role: "admin", status: "active", emailVerified: true }]]);
  const subscriptions = new Map();
  for (const suffix of ["one", "two"]) {
    const personId = "teacher_" + suffix, orderId = "order_" + suffix;
    const order = { id: orderId, kind: "personal", ownerId: personId, personId, planCode: "personal-monthly", priceId: "price_month", unitAmount: 1500, quantity: 1, interval: "month", subscriptionId: "sub_" + suffix, customerId: "cus_" + suffix, state: "paid", offerChanges: [] };
    records.set("billingV2Orders/" + orderId, order); records.set("users/" + personId, { role: "teacher", status: "active" });
    subscriptions.set(order.subscriptionId, { id: order.subscriptionId, livemode: false, status: "active", customer: order.customerId, metadata: { gc_order_id: orderId }, currency: "eur", collection_method: "charge_automatically", cancel_at: null, cancel_at_period_end: false, items: { has_more: false, data: [{ quantity: 1, current_period_start: Math.floor((at - 86400000) / 1000), current_period_end: Math.floor((at + 29 * 86400000) / 1000), price: { id: "price_month", livemode: false, active: true, currency: "eur", unit_amount: 1500, tax_behavior: "inclusive", recurring: { interval: "month", interval_count: 1 } } }] } });
  }
  let serial = Promise.resolve(); const queries = [];
  const store = { transaction(work) {
    const result = serial.then(() => transactionScope.run(true, async () => {
       const writes = []; let writing = false;
      const read = () => { assert.equal(writing, false, "Firestore reads must precede writes"); };
      const tx = {
        get: async path => { read(); return globalThis.structuredClone(records.get(path) || null); },
        find: async (collection, filters, limit = 50) => { read(); queries.push({ collection, filters }); return [...records.entries()].filter(([path, row]) => path.startsWith(collection + "/") && path.split("/").length === 2 && filters.every(([field, op, value]) => op === "==" && row[field] === value)).slice(0, limit).map(([path, row]) => ({ ...globalThis.structuredClone(row), id: path.split("/")[1] })); },
        create: (path, value) => { writing = true; writes.push(() => { assert.equal(records.has(path), false, "duplicate create"); records.set(path, globalThis.structuredClone(value)); }); },
        patch: (path, value) => { writing = true; writes.push(() => { assert.ok(records.has(path)); records.set(path, { ...records.get(path), ...globalThis.structuredClone(value) }); }); },
        put: (path, value) => { writing = true; writes.push(() => records.set(path, globalThis.structuredClone(value))); }
      };
      const result = await work(tx); for (const write of writes) write(); return result;
    })); serial = result.catch(() => {}); return result;
  } };
  const calls = [], promises = new Map();
  const controls = { lose: null, fail: null, hook: null };
  const provider = {
    inspectOfferSchedule: async input => { calls.push({op:"inspect",input}); const result = promises.get(input.amendmentId); if (!result) throw Error("Not scheduled"); return result; },
    retrieveSubscription: async id => { assert.notEqual(transactionScope.getStore(), true); calls.push({ op: "retrieve", id }); return globalThis.structuredClone(subscriptions.get(id)); },
    createOfferCoupon: async ({ offer }) => { assert.notEqual(transactionScope.getStore(), true); calls.push({ op: "coupon", offerId: offer.id }); return { couponId: "coupon_" + offer.id }; },
    scheduleOffer: async input => {
      assert.notEqual(transactionScope.getStore(), true); calls.push({ op: "schedule", input: globalThis.structuredClone(Object.fromEntries(Object.entries(input).filter(([,v])=>typeof v!=="function"))) });
      if (controls.fail === input.subscriptionId) throw new Error("sk_test_raw secret");
      if (!promises.has(input.amendmentId)) promises.set(input.amendmentId, { scheduleId: "sched_" + input.subscriptionId, effectiveAtMs: input.expectedPeriodEndMs, discountStartsAtMs: input.expectedPeriodEndMs, discountEndsAtMs: null });
      if (input.onSchedule) await input.onSchedule("sched_" + input.subscriptionId);
      if (controls.hook) await controls.hook(input);
      if (controls.lose === input.subscriptionId) { controls.lose = null; throw new Error("lost response sk_test_raw"); }
      return globalThis.structuredClone(promises.get(input.amendmentId));
    }
  };
  const request = data => ({ auth: { uid: "admin", token: { auth_time: Math.floor(at / 1000) } }, data });
  const deps = { store, now: () => at, caller: async req => { if (!req.auth) fail("unauthenticated", "login"); return { uid: req.auth.uid }; }, context: async (tx, actor) => { const config = await tx.get("appConfig/billingProduct"), person = await tx.get("users/" + actor.uid); if (!config.allowedUids.includes(actor.uid) || !person || person.status !== "active") fail("permission-denied", "inactive"); return { config, person }; }, admin: (ctx, req, now) => { if (ctx.person.role !== "admin" || !ctx.person.emailVerified || req.auth.token.auth_time * 1000 < now - 900000) fail("permission-denied", "admin"); }, provider, fail, key, identifier, requestId: identifier };
  return { records, subscriptions, calls, promises, controls, queries, key, request, advance: ms => { at += ms; }, ops: factory()(deps) };
}
const preview = (f, data = {}) => f.ops.previewExistingOffer(f.request({ offerId: "offer_one", personIds: ["teacher_one"], ...data }));
const apply = (f, id, data = {}) => f.ops.applyExistingOffer(f.request({ previewId: id, requestId: "request_one", reason: "Bewusst bestätigte Aktion", ...data }));
test("preview and application require a fresh verified platform administrator and enabled bounded pilot", async () => {
  const f = fixture();
  await assert.rejects(f.ops.previewExistingOffer({ data: {} }), { code: "unauthenticated" });
  await assert.rejects(f.ops.previewExistingOffer({ ...f.request({ offerId: "offer_one", personIds: "all" }), auth: { uid: "teacher_one", token: { auth_time: Date.now() / 1000 } } }), { code: "permission-denied" });
  f.records.get("appConfig/billingProduct").payments.offersReady = false;
  await assert.rejects(preview(f), { code: "failed-precondition" });
  assert.equal(f.calls.length, 0);
});
test("preview binds exact personal customer/order/price/period snapshots and excludes nonallowed targets", async () => {
  const f = fixture(); const { preview: p } = await preview(f);
  assert.equal(p.count, 1); assert.equal(p.subscriptions[0].totalMinor, 1200); assert.equal(p.subscriptions[0].baseAmountMinor, 1500);
  assert.equal(p.subscriptions[0].personId, "teacher_one"); assert.equal(p.subscriptions[0].effectiveAtMs, p.subscriptions[0].periodEndMs);
  assert.equal(p.expiresAtMs - f.records.get("billingV2OfferAmendmentPreviews/" + p.id).createdAtMs, 300000);
  await assert.rejects(preview(f, { personIds: ["not_allowed"] }));
  f.records.get("billingV2Offers/offer_one").audience = "accounts"; f.records.get("billingV2Offers/offer_one").targetIds = ["teacher_two"];
  await assert.rejects(preview(f));
});
test("wrong Stripe owner, period, status and school offers are rejected during preview", async () => {
  for (const mutate of [s => { s.customer = "cus_foreign"; }, s => { s.metadata.gc_order_id = "foreign"; }, s => { s.status = "unpaid"; }, s => { s.cancel_at_period_end = true; }, s => { s.items.data[0].quantity = 2; }, s => { s.items.data[0].price.id = "price_wrong"; }]) {
    const f = fixture(); mutate(f.subscriptions.get("sub_one")); await assert.rejects(preview(f));
    assert.equal(f.calls.some(c => c.op === "schedule"), false);
  }
  const f = fixture(); f.records.get("billingV2Offers/offer_one").planCode = "school-yearly"; await assert.rejects(preview(f));
});
test("apply appends one future immutable discount snapshot and leaves paid original fields intact", async () => {
  const f = fixture(); const { preview: p } = await preview(f); const before = globalThis.structuredClone(f.records.get("billingV2Orders/order_one"));
  const result = await apply(f, p.id); assert.equal(result.status, "scheduled"); assert.equal(result.completedCount, 1);
  const order = f.records.get("billingV2Orders/order_one"); assert.equal(order.unitAmount, before.unitAmount); assert.equal(order.state, before.state);
  assert.equal(order.offerChanges.length, 1); assert.equal(order.offerChanges[0].offer.couponId, "coupon_offer_one");
  assert.equal(order.offerChanges[0].offer.applicationStartMs, p.subscriptions[0].effectiveAtMs);
  assert.equal(order.offerChanges[0].effectiveAtMs, p.subscriptions[0].effectiveAtMs);
  assert.equal(f.records.get("billingV2Offers/offer_one").redemptionCount, 1); assert.equal(f.records.get("billingV2Offers/offer_one").reservedCount, 0);
  const scheduled = f.calls.find(c => c.op === "schedule").input;
  assert.equal(scheduled.expectedOrderId, "order_one"); assert.equal(scheduled.expectedPeriodEndMs, p.subscriptions[0].periodEndMs);
  const replay = await apply(f, p.id); assert.equal(replay.completedCount, 1); assert.equal(order.offerChanges.length, 1);
  assert.equal(f.calls.filter(c => c.op === "schedule").length, 1);
});
test("fresh preview expiry, changed period/config, missing reason and ended offers cannot start provider writes", async () => {
  for (const mutate of [f => f.advance(300001), f => { f.subscriptions.get("sub_one").items.data[0].current_period_end++; }, f => { f.records.get("appConfig/billingProduct").payments.prices["personal-monthly"] = "price_changed"; }, f => { f.records.get("billingV2Offers/offer_one").status = "ended"; }]) {
    const f = fixture(); const { preview: p } = await preview(f); mutate(f);
    const result = await apply(f, p.id).catch(error => error);
    assert.notEqual(result.status, "scheduled"); assert.equal(f.calls.filter(c => c.op === "schedule").length, 0);
  }
  const f = fixture(); const { preview: p } = await preview(f); await assert.rejects(apply(f, p.id, { reason: "" }));
});
test("lost provider response retains reservation and lock then resumes the same amendment after expiry or campaign end", async () => {
  const f = fixture(); const { preview: p } = await preview(f); f.controls.lose = "sub_one";
  const first = await apply(f, p.id); assert.equal(first.status, "pending"); assert.equal(first.results[0].state, "pending");
  assert.equal(JSON.stringify(first).includes("sk_test_raw"), false);
  assert.equal(f.records.get("billingV2Orders/order_one").offerChanges.length, 0);
  assert.equal(f.records.get("billingV2Offers/offer_one").reservedCount, 1);
  f.advance(360000); f.records.get("billingV2Offers/offer_one").status = "ended";
  const second = await apply(f, p.id); assert.equal(second.status, "scheduled");
  const calls = f.calls.filter(c => c.op === "schedule"); assert.equal(calls.length, 1); assert.equal(calls[0].input.amendmentId, f.calls.find(c => c.op === "inspect").input.amendmentId);
  assert.equal(f.promises.size, 1); assert.equal(f.records.get("billingV2Orders/order_one").offerChanges.length, 1);
});
test("partial successes stay scheduled while failed provider targets remain pending without fabricated overall success", async () => {
  const f = fixture(); const { preview: p } = await preview(f, { personIds: "all" }); f.controls.fail = "sub_two";
  const result = await apply(f, p.id); assert.equal(result.status, "partial"); assert.equal(result.completedCount, 1); assert.equal(result.count, 2);
  assert.deepEqual(result.results.map(r => r.state), ["scheduled", "pending"]);
  assert.equal(f.records.get("billingV2Orders/order_one").offerChanges.length, 1); assert.equal(f.records.get("billingV2Orders/order_two").offerChanges.length, 0);
});
test("different previews cannot concurrently reserve the same order or exceed campaign capacity", async () => {
  const f = fixture(); const first = (await preview(f)).preview; f.advance(1); const second = (await preview(f)).preview;
  f.controls.lose = "sub_one";
  const results = await Promise.all([apply(f, first.id), apply(f, second.id, { requestId: "request_two" })]);
  assert.equal(results.filter(r => r.status === "scheduled").length, 0);
  assert.equal(f.promises.size, 1); assert.equal(f.records.get("billingV2Offers/offer_one").reservedCount, 1);
  const limited = fixture(); limited.records.get("billingV2Offers/offer_one").maxRedemptions = 1;
  const p = (await preview(limited, { personIds: "all" })).preview; const result = await apply(limited, p.id);
  assert.equal(result.status, "partial"); assert.equal(result.completedCount, 1);
  assert.equal(limited.records.get("billingV2Offers/offer_one").redemptionCount, 1);
});
test("explicit removal schedules null future offer without changing paid periods or original discount", async () => {
  const f = fixture(); f.records.get("billingV2Orders/order_one").offer = { id: "old_offer", duration: "forever" };
  const p = (await preview(f, { offerId: null })).preview; const result = await apply(f, p.id, { reason: "Dauerhaften Rabatt ausdrücklich beenden" });
  assert.equal(result.status, "scheduled"); const call = f.calls.find(c => c.op === "schedule").input;
  assert.equal(call.offer, null); assert.equal(call.couponId, null); assert.equal(f.calls.some(c => c.op === "coupon"), false);
  const order = f.records.get("billingV2Orders/order_one"); assert.equal(order.offer.id, "old_offer"); assert.equal(order.offerChanges[0].offer, null);
});
test("a cancellation racing the provider response cannot overwrite the local order or unlock uncertain work", async () => {
  const f = fixture(); const p = (await preview(f)).preview;
  f.controls.hook = async () => { f.records.get("billingV2Orders/order_one").state = "canceled"; };
  const result = await apply(f, p.id); assert.equal(result.status, "pending");
  assert.equal(f.records.get("billingV2Orders/order_one").state, "canceled"); assert.equal(f.records.get("billingV2Orders/order_one").offerChanges.length, 0);
});
test("explicit admin assignment supports code campaigns but records its own channel without impersonating promotion redemption", async () => {
  const f = fixture(); const offer = f.records.get("billingV2Offers/offer_one"); offer.audience = "code"; offer.code = "PRIVATE-CODE"; offer.promotionCodeId = "promo_customer";
  const p = (await preview(f)).preview; const result = await apply(f, p.id);
  assert.equal(result.status, "scheduled");
  const amendment = [...f.records.entries()].find(([path]) => path.startsWith("billingV2OfferAmendments/"))[1];
  assert.equal(amendment.applicationChannel, "admin_assignment");
  const bound = f.records.get("billingV2Orders/order_one").offerChanges[0].offer;
  assert.equal(bound.promotionCodeId, undefined); assert.equal(bound.applicationChannel, "admin_assignment");
  const firstTime = fixture(); firstTime.records.get("billingV2Offers/offer_one").firstTimeOnly = true;
  await assert.rejects(preview(firstTime));
});
test("a persisted offer whose ID differs from its document cannot redirect an amendment to another offer", async () => {
  const f = fixture(); f.records.get("billingV2Offers/offer_one").id = "offer_other";
  await assert.rejects(preview(f));
});

test("preview queries only explicitly allowed customer bindings", async () => {
  const f = fixture(); await preview(f);
  for (const query of f.queries.filter(query => query.collection === "billingV2Orders")) {
    assert.ok(query.filters.some(([field, operator, value]) => field === "personId" && operator === "==" && value === "teacher_one"));
  }
});

test("preview states the promised discount end and lost-reply recovery survives period rollover", async () => {
  const f = fixture(); const { preview: p } = await preview(f);
  assert.equal(p.subscriptions[0].discountEndsAtMs, require("../lib/billing/domain/offers").addMonths(p.subscriptions[0].effectiveAtMs, 3));
  f.controls.lose = "sub_one"; assert.equal((await apply(f, p.id)).status, "pending");
  const item = f.subscriptions.get("sub_one").items.data[0]; item.current_period_start = item.current_period_end; item.current_period_end += 30 * 86400;
  f.advance(30 * 86400000);
  assert.equal((await apply(f, p.id)).status, "scheduled");
  assert.equal(f.records.get("billingV2Orders/order_one").offerChanges.length, 1);
});
