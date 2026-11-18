"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Stripe = require("stripe");
const { createStripeProvider, SANDBOX_ACCOUNT, STRIPE_API_VERSION } = require("../lib/billing/stripe-provider");
const offer = { id: "offer_v1", title: "Herbstangebot", planCode: "personal-monthly", discountType: "percent", percentOff: 20, fixedBasis: "invoice", duration: "months", durationMonths: 3, endsAtMs: Date.now() + 86400000 };
function fixture({ interval = "month", account = SANDBOX_ACCOUNT } = {}) {
  const calls = [], coupons = new Map();
  const now = Math.floor(Date.now() / 1000);
  const state = { subscription: { id: "sub_test", object: "subscription", livemode: false, customer: "cus_test", currency: "eur", status: "active", metadata: { gc_order_id: "order_test" }, cancel_at: null, cancel_at_period_end: false, canceled_at: null, pause_collection: null, pending_update: null, discounts: [], collection_method: "charge_automatically", billing_cycle_anchor: now - 86400, automatic_tax: { enabled: false }, items: { data: [{ id: "si_test", object: "subscription_item", quantity: 1, current_period_start: now - 86400, current_period_end: now + (interval === "year" ? 364 : 29) * 86400, discounts: [], price: { id: "price_test", object: "price", livemode: false, active: true, currency: "eur", unit_amount: interval === "year" ? 12000 : 1500, tax_behavior: "inclusive", recurring: { interval, interval_count: 1, usage_type: "licensed" } } }] } }, schedule: null, coupon: null, loseUpdate: false, loseCreate: false, sessions: [] };
  const json = value => new globalThis.Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } });
  class TransportSDK extends Stripe {
    constructor(key, options) {
      super(key, { ...options, maxNetworkRetries: 0, httpClient: Stripe.createFetchHttpClient(async (url, init) => {
        const path = new globalThis.URL(url).pathname; const data = new globalThis.URLSearchParams(init.body); const method = init.method;
        calls.push({ path, method, data, headers: Object.fromEntries(new globalThis.Headers(init.headers)), query: new globalThis.URL(url).searchParams });
        if (path === "/v1/account") return json({ id: account });
        if (path === "/v1/coupons" && method === "POST") {
          if (state.rejectDuplicateCoupon && state.coupon) return new globalThis.Response(JSON.stringify({ error: { type: "invalid_request_error", message: "Coupon already exists" } }), { status: 400 });
          state.coupon = { id: data.get("id"), object: "coupon", livemode: false, valid: true, duration: data.get("duration"), duration_in_months: data.has("duration_in_months") ? +data.get("duration_in_months") : null, percent_off: data.has("percent_off") ? +data.get("percent_off") : null, amount_off: data.has("amount_off") ? +data.get("amount_off") : null, currency: data.get("currency"), metadata: { gc_offer_id: data.get("metadata[gc_offer_id]"), gc_quantity: data.get("metadata[gc_quantity]") } };
          coupons.set(state.coupon.id, state.coupon); return json(state.coupon);
        }
        if (path.startsWith("/v1/coupons/")) return coupons.has(path.split("/").pop()) ? json(coupons.get(path.split("/").pop())) : new globalThis.Response(JSON.stringify({ error: { type: "invalid_request_error", code: "resource_missing" } }), { status: 404 });
        if (path === "/v1/checkout/sessions" && method === "GET") return json({ object:"list",data:state.sessions,has_more:false });
        if (path === "/v1/promotion_codes") return json({ id: "promo_bound", object: "promotion_code", livemode: false });
        if (path === "/v1/subscriptions/sub_test") return json(state.subscription);
        if (path === "/v1/subscription_schedules" && method === "POST") {
          if (!state.schedule) state.schedule = { id: "sub_sched_test", object: "subscription_schedule", livemode: false, customer: "cus_test", subscription: "sub_test", status: "active", metadata: {}, end_behavior: "release", current_phase: { start_date: state.subscription.items.data[0].current_period_start, end_date: state.subscription.items.data[0].current_period_end }, default_settings: { collection_method: "charge_automatically", default_payment_method: "pm_saved", automatic_tax: { enabled: false } }, phases: [{ start_date: state.subscription.items.data[0].current_period_start, end_date: state.subscription.items.data[0].current_period_end, currency: "eur", items: [{ price: "price_test", plan: "price_test", quantity: 1, metadata: { retained: "item" }, tax_rates: [] }], default_payment_method: "pm_phase", collection_method: "charge_automatically", description: "Erhalten", automatic_tax: { enabled: false, liability: null }, metadata: { retained: "phase" }, discounts: [], default_tax_rates: [], add_invoice_items: [], proration_behavior: "create_prorations" }] };
          state.subscription.schedule = state.schedule.id;
          if (state.loseCreate) { state.loseCreate = false; throw new Error("lost creation response"); }
          return json(state.schedule);
        }
        if (path === "/v1/subscription_schedules/sub_sched_test") {
          if (method === "POST") {
            state.schedule.metadata = { gc_amendment_id: data.get("metadata[gc_amendment_id]"), gc_order_id: data.get("metadata[gc_order_id]"), gc_offer_amendment_id: data.get("metadata[gc_offer_amendment_id]"), gc_offer_id: data.get("metadata[gc_offer_id]"), gc_coupon_id: data.get("metadata[gc_coupon_id]") };
            state.schedule.metadata = Object.fromEntries(Object.entries(state.schedule.metadata).filter(([, v]) => v));
            const end = new Date(+data.get("phases[1][start_date]") * 1000); end.setUTCFullYear(end.getUTCFullYear() + 1);
            state.schedule.phases[1] = { start_date: +data.get("phases[1][start_date]"), end_date: end.getTime() / 1000, billing_cycle_anchor: data.get("phases[1][billing_cycle_anchor]"), proration_behavior: data.get("phases[1][proration_behavior]"), items: [{ price: data.get("phases[1][items][0][price]"), quantity: +data.get("phases[1][items][0][quantity]") }], discounts: data.get("phases[1][discounts]") === "" ? [] : [{ coupon: data.get("phases[1][discounts][0][coupon]") }] };
            if (state.loseUpdate) { state.loseUpdate = false; throw new Error("lost update response"); }
          }
          return json(state.schedule);
        }
        if (path === "/v1/invoices/in_offer") return json({ id: "in_offer", object: "invoice", livemode: false, discounts: [{ id: "di_test", object: "discount", source: { type: "coupon", coupon: state.coupon }, promotion_code: { id: "promo_bound", object: "promotion_code", livemode: false } }], lines: { data: [{ quantity_decimal: "1.00000000000000001" }] } });
        throw new Error(`Unexpected test request ${method} ${path}`);
      }) });
    }
  }
  return { state, calls, provider: createStripeProvider({ apiKey: "sk_test_fixture", Stripe: TransportSDK }) };
}
const posts = (calls, path) => calls.filter(call => call.method === "POST" && call.path === path);
async function scheduleInput(f, overrides = {}) {
  const couponOffer = { ...offer, planCode: f.state.subscription.items.data[0].price.recurring.interval === "year" ? "personal-yearly" : "personal-monthly" };
  const { couponId } = await f.provider.createOfferCoupon({ offer: couponOffer });
  const item = f.state.subscription.items.data[0];
  return { amendmentId: "amendment_one", subscriptionId: "sub_test", customerId: "cus_test", priceId: "price_test", offer: couponOffer, couponId, expectedOrderId: "order_test", expectedPeriodStartMs: item.current_period_start * 1000, expectedPeriodEndMs: item.current_period_end * 1000, ...overrides };
}
test("real pinned SDK creates immutable bound percent and school fixed coupons without campaign expiry", async () => {
  const f = fixture();
  assert.equal(typeof f.provider.createOfferCoupon, "function");
  const a = await f.provider.createOfferCoupon({ offer });
  const b = await f.provider.createOfferCoupon({ offer });
  assert.equal(a.couponId, b.couponId);
  const requests = posts(f.calls, "/v1/coupons");
  assert.equal(requests[0].data.get("percent_off"), "20");
  assert.equal(requests[0].data.get("duration"), "repeating");
  assert.equal(requests[0].data.get("duration_in_months"), "3");
  assert.equal(requests[0].data.get("redeem_by"), null);
  assert.equal(requests[0].data.get("metadata[gc_offer_id]"), offer.id);
  assert.equal(requests[0].headers["stripe-version"], STRIPE_API_VERSION);
  assert.equal(requests.length, 1);
  await f.provider.createOfferCoupon({ offer: { ...offer, id: "school_seat", planCode: "school-yearly", discountType: "fixed", amountOffMinor: 1000, fixedBasis: "seat", duration: "once" }, quantity: 20 });
  const seat = posts(f.calls, "/v1/coupons").at(-1).data;
  assert.equal(seat.get("amount_off"), "20000"); assert.equal(seat.get("currency"), "eur");
  await f.provider.createOfferCoupon({ offer: { ...offer, id: "school_invoice", planCode: "school-yearly", discountType: "fixed", amountOffMinor: 1000, fixedBasis: "invoice", duration: "forever" }, quantity: 20 });
  assert.equal(posts(f.calls, "/v1/coupons").at(-1).data.get("amount_off"), "1000");
  assert.equal((await f.provider.retrieveOfferCoupon(a.couponId)).id, a.couponId);
});
test("invalid discounts and the wrong Stripe account cannot create coupons", async () => {
  const f = fixture(); assert.equal(typeof f.provider.createOfferCoupon, "function");
  for (const percentOff of [0, -1, 1.5, 101]) await assert.rejects(f.provider.createOfferCoupon({ offer: { ...offer, percentOff } }));
  await assert.rejects(f.provider.createOfferCoupon({ offer, quantity: 0 }));
  const wrong = fixture({ account: "acct_other" });
  await assert.rejects(wrong.provider.createOfferCoupon({ offer }));
  assert.equal(posts(wrong.calls, "/v1/coupons").length, 0);
});
test("promotion redemption is bound to one customer, one reservation and the current API promotion envelope", async () => {
  const f = fixture(); assert.equal(typeof f.provider.createOfferPromotion, "function");
  const expiry = Date.now() + 35 * 60000;
  const input = { offer: { ...offer, audience: "code", code: "PRIVATE-CODE", firstTimeOnly: true }, quantity: 1, customerId: "cus_test", couponId: "coupon_test", reservationEndsAtMs: expiry };
  assert.deepEqual(await f.provider.createOfferPromotion(input), { promotionCodeId: "promo_bound" });
  await f.provider.createOfferPromotion(input);
  const requests = posts(f.calls, "/v1/promotion_codes"); const data = requests[0].data;
  assert.equal(data.get("promotion[type]"), "coupon"); assert.equal(data.get("promotion[coupon]"), "coupon_test");
  assert.equal(data.get("coupon"), null); assert.equal(data.get("customer"), "cus_test");
  assert.equal(data.get("max_redemptions"), "1"); assert.equal(data.get("expires_at"), String(Math.floor(expiry / 1000)));
  assert.equal(data.get("restrictions[first_time_transaction]"), "true");
  assert.equal(data.get("code"), null); // GradeCrew validates the private code; Stripe gets an opaque reservation code.
  assert.equal(requests[0].headers["idempotency-key"], requests[1].headers["idempotency-key"]);
  await assert.rejects(f.provider.createOfferPromotion({ ...input, customerId: null }));
});
test("invoice retrieval requests real Discount.source.coupon expansion and preserves exact SDK decimal quantities", async () => {
  const f = fixture(); await f.provider.createOfferCoupon({ offer });
  const invoice = await f.provider.retrieveInvoice("in_offer");
  const request = f.calls.find(c => c.path === "/v1/invoices/in_offer");
  assert.deepEqual([...request.query.entries()].filter(([key]) => key.startsWith("expand[")).map(([, value]) => value), ["discounts.source.coupon", "discounts.promotion_code"]);
  assert.equal(invoice.discounts[0].source.coupon.metadata.gc_offer_id, offer.id);
  assert.equal(invoice.lines.data[0].quantity_decimal, "1.00000000000000001");
});
test("annual billing stays untouched until its next full period despite a three-month discount", async () => {
  const f = fixture({ interval: "year" }); const input = await scheduleInput(f);
  const result = await f.provider.scheduleOffer(input);
  const create = posts(f.calls, "/v1/subscription_schedules")[0];
  assert.equal(create.data.get("from_subscription"), "sub_test"); assert.equal(create.data.get("phases"), null);
  const update = posts(f.calls, "/v1/subscription_schedules/sub_sched_test")[0].data;
  assert.equal(update.get("proration_behavior"), "none"); assert.equal(update.get("end_behavior"), "release");
  assert.equal(update.get("phases[0][start_date]"), String(input.expectedPeriodStartMs / 1000));
  assert.equal(update.get("phases[0][end_date]"), String(input.expectedPeriodEndMs / 1000));
  assert.equal(update.get("phases[0][default_payment_method]"), "pm_phase");
  assert.equal(update.get("phases[0][description]"), "Erhalten");
  assert.equal(update.get("phases[0][metadata][retained]"), "phase");
  assert.equal(update.get("phases[0][items][0][metadata][retained]"), "item");
  assert.equal(update.get("phases[1][start_date]"), String(input.expectedPeriodEndMs / 1000));
  assert.equal(update.get("phases[1][duration][interval]"), "year");
  assert.equal(update.get("phases[1][duration][interval_count]"), "1");
  assert.equal(update.get("phases[1][billing_cycle_anchor]"), "automatic");
  assert.equal(update.get("phases[1][discounts][0][coupon]"), input.couponId);
  assert.equal(update.get("phases[1][proration_behavior]"), "none");
  assert.equal(update.get("default_settings"), null); // Migrated defaults remain on Stripe.
  assert.equal(result.effectiveAtMs, input.expectedPeriodEndMs); assert.equal(result.discountStartsAtMs, input.expectedPeriodEndMs);
  assert.ok(result.discountEndsAtMs > result.effectiveAtMs); assert.ok(result.discountEndsAtMs < result.effectiveAtMs + 100 * 86400000);
});
test("monthly scheduling uses twelve cycles, and lost create/update responses recover the same amendment", async () => {
  for (const failure of ["loseCreate", "loseUpdate"]) {
    const f = fixture(); const input = await scheduleInput(f); f.state[failure] = true;
    await assert.rejects(f.provider.scheduleOffer(input));
    const result = await f.provider.scheduleOffer(input);
    assert.equal(result.scheduleId, "sub_sched_test");
    const updates = posts(f.calls, "/v1/subscription_schedules/sub_sched_test");
    assert.equal(updates[0].data.get("phases[1][duration][interval]"), "month");
    assert.equal(updates[0].data.get("phases[1][duration][interval_count]"), "12");
    const creates = posts(f.calls, "/v1/subscription_schedules");
    if (creates.length > 1) assert.equal(creates[0].headers["idempotency-key"], creates[1].headers["idempotency-key"]);
  }
});
test("wrong owner, order, quantity, price, cancellation, unpaid state and changed period are rejected before schedule writes", async () => {
  const variants = [s => { s.customer = "cus_foreign"; }, s => { s.metadata.gc_order_id = "order_foreign"; }, s => { s.status = "unpaid"; }, s => { s.cancel_at_period_end = true; }, s => { s.items.data[0].quantity = 2; }, s => { s.items.data[0].price.id = "price_foreign"; }, s => { s.items.data[0].current_period_end++; }, s => { s.pending_update = { expires_at: 1 }; }];
  for (const mutate of variants) {
    const f = fixture(); const input = await scheduleInput(f); mutate(f.state.subscription);
    await assert.rejects(f.provider.scheduleOffer(input));
    assert.equal(posts(f.calls, "/v1/subscription_schedules").length, 0);
  }
});
test("existing foreign schedules and unsupported migrated phase settings are never overwritten", async () => {
  const foreign = fixture(); const input = await scheduleInput(foreign);
  foreign.state.subscription.schedule = "sub_sched_test";
  foreign.state.schedule = { id: "sub_sched_test", livemode: false, metadata: { gc_amendment_id: "foreign" } };
  await assert.rejects(foreign.provider.scheduleOffer(input));
  assert.equal(posts(foreign.calls, "/v1/subscription_schedules/sub_sched_test").length, 0);
  const unsupported = fixture(); const input2 = await scheduleInput(unsupported);
  // First response is lost; the resulting schedule is then mutated by another operator.
  unsupported.state.loseCreate = true; await assert.rejects(unsupported.provider.scheduleOffer(input2));
  unsupported.state.schedule.phases[0].add_invoice_items = [{ price: "price_extra", quantity: 1 }];
  await assert.rejects(unsupported.provider.scheduleOffer(input2));
  assert.equal(posts(unsupported.calls, "/v1/subscription_schedules/sub_sched_test").length, 0);
});
test("explicit removal clears only the next period of an owned schedule", async () => {
  const f = fixture(); const input = await scheduleInput(f);
  await f.provider.scheduleOffer(input);
  const result = await f.provider.scheduleOffer({ ...input, amendmentId: "amendment_remove", offer: null, couponId: null });
  const update = posts(f.calls, "/v1/subscription_schedules/sub_sched_test").at(-1).data;
  assert.equal(update.get("phases[1][discounts]"), "");
  assert.equal(update.get("phases[0][end_date]"), String(input.expectedPeriodEndMs / 1000));
  assert.equal(update.get("metadata[gc_order_id]"), "order_test");
  assert.equal(update.get("metadata[gc_offer_amendment_id]"), "amendment_remove");
  assert.equal(result.effectiveAtMs, input.expectedPeriodEndMs);
  assert.equal(result.discountEndsAtMs, null);
});
test("schedule retry detects a changed future price, coupon or duration instead of claiming the old amendment succeeded", async () => {
  for (const mutate of [
    s => { s.phases[1].items[0].price = "price_foreign"; },
    s => { s.phases[1].discounts[0].coupon = "coupon_foreign"; },
    s => { s.phases[1].end_date++; },
    s => { s.phases[1].billing_cycle_anchor = "phase_start"; },
    s => { s.phases[1].proration_behavior = "always_invoice"; }
  ]) {
    const f = fixture(); const input = await scheduleInput(f); await f.provider.scheduleOffer(input);
    mutate(f.state.schedule);
    await assert.rejects(f.provider.scheduleOffer(input));
  }
});
test("a new amendment rejects unsupported subscription settings before migration", async () => {
  for (const mutate of [
    s => { s.collection_method = "send_invoice"; },
    s => { s.items.data[0].price.active = false; },
    s => { s.application_fee_percent = 10; },
    s => { s.transfer_data = { destination: "acct_other" }; },
    s => { s.automatic_tax = { enabled: true }; }
  ]) {
    const f = fixture(); const input = await scheduleInput(f); mutate(f.state.subscription);
    await assert.rejects(f.provider.scheduleOffer(input));
    assert.equal(posts(f.calls, "/v1/subscription_schedules").length, 0);
  }
});
test("school discount request reaches the real SDK invoice create before its draft is persisted and finalized", async () => {
  const calls = []; let draft = false;
  class SDK extends Stripe {
    constructor(key, options) { super(key, { ...options, httpClient: Stripe.createFetchHttpClient(async (url, init) => {
      const path = new globalThis.URL(url).pathname; const data = new globalThis.URLSearchParams(init.body);
      calls.push({ path, data });
      let result;
      if (path === "/v1/account") result = { id: SANDBOX_ACCOUNT };
      else if (path === "/v1/prices/price_school") result = { id: "price_school", livemode: false, active: true, currency: "eur", unit_amount: 5000, tax_behavior: "inclusive", recurring: null };
      else if (path === "/v1/invoices") { assert.equal(draft, false); result = { id: "in_school", livemode: false }; }
      else if (path === "/v1/invoiceitems") { assert.equal(draft, true); result = { id: "ii_school", livemode: false }; }
      else if (path === "/v1/invoices/in_school/finalize") { assert.equal(draft, true); result = { id: "in_school", livemode: false }; }
      else throw new Error("Unexpected school request");
      return new globalThis.Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
    }) }); }
  }
  const provider = createStripeProvider({ apiKey: "sk_test_fixture", Stripe: SDK });
  await provider.createSchoolInvoice({ orderId: "order_school", customerId: "cus_school", priceId: "price_school", unitAmount: 5000, quantity: 20, startsAtMs: 1795000000000, endsAtMs: 1826536000000, couponId: "coupon_school", onDraft: async invoiceId => { assert.equal(invoiceId, "in_school"); draft = true; } });
  const data = calls.find(c => c.path === "/v1/invoices").data;
  assert.equal(data.get("discounts[0][coupon]"), "coupon_school");
  assert.equal(data.get("auto_advance"), "false");
  assert.equal(data.get("pending_invoice_items_behavior"), "exclude");
});
test("editing an owned current discount reuses its Discount ID so repeating and once clocks do not restart", async () => {
  const f = fixture(); const input = await scheduleInput(f); await f.provider.scheduleOffer(input);
  f.state.subscription.discounts = [{ id: "di_original", object: "discount", source: { type: "coupon", coupon: f.state.coupon } }];
  f.state.schedule.phases[0].discounts = [{ coupon: input.couponId, discount: null, promotion_code: null }];
  await f.provider.scheduleOffer({ ...input, amendmentId: "amendment_remove", offer: null, couponId: null });
  const data = posts(f.calls, "/v1/subscription_schedules/sub_sched_test").at(-1).data;
  assert.equal(data.get("phases[0][discounts][0][discount]"), "di_original");
  assert.equal(data.get("phases[0][discounts][0][coupon]"), null);
});
test("migration response with a different current-period boundary is rejected rather than shortened", async () => {
  const f = fixture(); const input = await scheduleInput(f);
  f.state.loseCreate = true; await assert.rejects(f.provider.scheduleOffer(input));
  f.state.schedule.phases[0].end_date++;
  f.state.schedule.current_phase.end_date++;
  await assert.rejects(f.provider.scheduleOffer(input));
  assert.equal(posts(f.calls, "/v1/subscription_schedules/sub_sched_test").length, 0);
});

test("retained deterministic coupon is retrieved after Stripe idempotency cache has expired", async () => {
  const f = fixture(); const first = await f.provider.createOfferCoupon({ offer });
  f.state.rejectDuplicateCoupon = true;
  assert.deepEqual(await f.provider.createOfferCoupon({ offer }), first);
  assert.equal(posts(f.calls, "/v1/coupons").length, 1);
  f.state.coupon.percent_off = 99;
  await assert.rejects(f.provider.createOfferCoupon({ offer }));
});
test("removal replay accepts Stripe's absent unset metadata without another schedule update", async () => {
  const f = fixture(); const input = await scheduleInput(f); await f.provider.scheduleOffer(input);
  const remove = { ...input, amendmentId: "amendment_remove", offer: null, couponId: null };
  await f.provider.scheduleOffer(remove); const count = posts(f.calls, "/v1/subscription_schedules/sub_sched_test").length;
  await f.provider.scheduleOffer(remove);
  assert.equal(posts(f.calls, "/v1/subscription_schedules/sub_sched_test").length, count);
});
test("owned checkout discount can migrate for replacement/removal while foreign discount is refused", async () => {
  for (const removal of [false, true]) {
    const f = fixture(); const input = await scheduleInput(f);
    f.state.subscription.discounts = [{ id: "di_checkout", object: "discount", start: input.expectedPeriodStartMs / 1000, end: null, customer: "cus_test", subscription: "sub_test", source: { type: "coupon", coupon: f.state.coupon } }];
    // A from_subscription schedule copies the currently applied Discount.
    f.state.loseCreate = true;
    const ownedDiscount = { ...offer, couponId: input.couponId, applicationStartMs: input.expectedPeriodStartMs };
    const request = { ...input, currentOffer: ownedDiscount, ...(removal ? { offer: null, couponId: null } : {}) };
    await assert.rejects(f.provider.scheduleOffer(request));
    assert.ok(f.state.schedule, "migration was authorized for the owned discount");
    f.state.schedule.phases[0].discounts = [{ discount: "di_checkout" }];
    await f.provider.scheduleOffer(request);
    assert.equal(posts(f.calls, "/v1/subscription_schedules/sub_sched_test").at(-1).data.get("phases[0][discounts][0][discount]"), "di_checkout");
  }
  const f = fixture(); const input = await scheduleInput(f); f.state.subscription.discounts = [{ id: "di_foreign" }];
  await assert.rejects(f.provider.scheduleOffer(input));
  assert.equal(posts(f.calls, "/v1/subscription_schedules").length, 0);
});
test("authoritative schedule inspection recovers a lost reply after rollover and rejects a changed phase", async () => {
  const f = fixture(); const input = await scheduleInput(f); f.state.loseUpdate = true;
  await assert.rejects(f.provider.scheduleOffer(input));
  const item = f.state.subscription.items.data[0]; item.current_period_start = item.current_period_end; item.current_period_end += 30 * 86400;
  const recovered = await f.provider.inspectOfferSchedule({ ...input, scheduleId: f.state.schedule.id });
  assert.equal(recovered.effectiveAtMs, input.expectedPeriodEndMs);
  assert.equal(posts(f.calls, "/v1/subscription_schedules/sub_sched_test").length, 1);
  f.state.schedule.phases[1].discounts[0].coupon = "coupon_foreign";
  await assert.rejects(f.provider.inspectOfferSchedule({ ...input, scheduleId: f.state.schedule.id }));
});

test("read-only Checkout recovery proves a unique buyer/order session or authoritative absence", async () => {
  const f = fixture(), input = {orderId:"order_test",customerId:"cus_test",createdAtMs:Date.now()-60000};
  assert.equal(await f.provider.findCheckoutForOrder(input),null);
  f.state.sessions=[{id:"cs_test",livemode:false,customer:"cus_test",metadata:{gc_order_id:"order_test"},client_reference_id:"order_test",mode:"subscription",status:"expired"}];
  assert.equal((await f.provider.findCheckoutForOrder(input)).id,"cs_test");
  f.state.sessions.push({...f.state.sessions[0],id:"cs_other"});await assert.rejects(f.provider.findCheckoutForOrder(input));
  f.state.sessions=[{...f.state.sessions[0],customer:"cus_foreign"}];await assert.rejects(f.provider.findCheckoutForOrder(input));
});
test("a migrated but not updated schedule reports no applied amendment and can be resumed",async()=>{
 const f=fixture(), input=await scheduleInput(f);f.state.loseCreate=true;await assert.rejects(f.provider.scheduleOffer(input));
 assert.deepEqual(await f.provider.inspectOfferSchedule({...input,scheduleId:f.state.schedule.id}),{applied:false});
 await f.provider.scheduleOffer(input);assert.equal((await f.provider.inspectOfferSchedule({...input,scheduleId:f.state.schedule.id})).effectiveAtMs,input.expectedPeriodEndMs);
});
