"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createStripeProvider, STRIPE_API_VERSION, SANDBOX_ACCOUNT } = require("../lib/billing/stripe-provider");
function fixture(account = "acct_1UYUaw1l0zkqOtXr") {
  const calls = [];
  class SDK {
    constructor(secret, options) { calls.push({ op: "init", secret, options }); }
    accounts = { retrieve: async () => { calls.push({ op: "account" }); return { id: account }; } };
    customers = { create: async (data, options) => { calls.push({ op: "customer", data, options }); return { id: "cus_test", livemode: false }; } };
    checkout = { sessions: { create: async (data, options) => { calls.push({ op: "checkout", data, options }); return { id: "cs_test", livemode: false, url: "https://checkout.stripe.com/c/pay/cs_test" }; } } };
    prices = { retrieve: async () => ({ id: "price_month", livemode: false, active: true, currency: "eur", unit_amount: 1500, tax_behavior: "inclusive", recurring: { interval: "month", interval_count: 1 } }) };
    invoices = { retrieve: async () => ({ id: "in_test", livemode: false }) };
  }
  return { calls, provider: createStripeProvider({ apiKey: "sk_test_fixture", Stripe: SDK }), SDK };
}
test("pins the reviewed API and configures a private bounded SDK instance", () => {
  const { calls } = fixture();
  assert.equal(STRIPE_API_VERSION, "2026-10-28.endive");
  assert.equal(SANDBOX_ACCOUNT, "acct_1UYUaw1l0zkqOtXr");
  assert.deepEqual(calls[0].options, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 20000 });
  for (const apiKey of ["sk_live_secret", "rk_live_secret", "", null]) assert.throws(() => createStripeProvider({ apiKey }));
});
test("refuses provider writes when the existing key belongs to a different sandbox", async () => {
  const { provider, calls } = fixture("acct_foreign");
  await assert.rejects(provider.createCustomer({ orderId: "order_test", personId: "teacher" }));
  assert.equal(calls.some(c => c.op === "customer"), false);
});
test("repeated customer requests use a stable idempotency key and opaque metadata", async () => {
  const { provider, calls } = fixture();
  await provider.createCustomer({ buyerKey: "personal_teacher", orderId: "order_test" });
  await provider.createCustomer({ buyerKey: "personal_teacher", orderId: "order_second" });
  const customers = calls.filter(c => c.op === "customer");
  assert.equal(customers[0].options.idempotencyKey, customers[1].options.idempotencyKey);
  assert.deepEqual(customers[0].data, customers[1].data);
  assert.equal(customers[0].data.email, undefined);
});
test("a personal sandbox customer is attached to the verified ready test clock before Checkout", async () => {
  const { SDK, calls } = fixture(); let mode = "ready";
  class ClockSDK extends SDK { testHelpers = { testClocks: { retrieve: async id => ({ id, livemode: false, status: mode }) } }; }
  const provider = createStripeProvider({ apiKey: "sk_test_fixture", Stripe: ClockSDK });
  await provider.createCustomer({ buyerKey: "personal_teacher", testClockId: "clock_test" });
  assert.equal(calls.find(c => c.op === "customer").data.test_clock, "clock_test");
  mode = "advancing"; await assert.rejects(provider.createCustomer({ buyerKey: "other_teacher", testClockId: "clock_test" }));
  assert.equal(calls.filter(c => c.op === "customer").length, 1);
});
test("Checkout uses the bound customer, a verified price and server order metadata without a second trial", async () => {
  const { provider, calls } = fixture();
  const input = { orderId: "order_test", customerId: "cus_test", priceId: "price_month", unitAmount: 1500, interval: "month", returnUrl: "https://gradecrew-staging-2026--billing-product-abc.web.app/" };
  await provider.createCheckout(input);
  const data = calls.find(c => c.op === "checkout").data;
  assert.equal(data.mode, "subscription"); assert.equal(data.customer, "cus_test");
  assert.deepEqual(data.line_items, [{ price: "price_month", quantity: 1 }]);
  assert.deepEqual(data.subscription_data.metadata, { gc_order_id: "order_test" });
  assert.equal(data.subscription_data.trial_period_days, undefined);
  assert.equal(data.payment_method_types, undefined); assert.equal(data.allow_promotion_codes, undefined);
  assert.equal(data.automatic_tax.enabled, false);
  await assert.rejects(provider.createCheckout({ ...input, unitAmount: 1 }));
  await assert.rejects(provider.createCheckout({ ...input, returnUrl: "https://evil.example/" }));
  assert.equal(calls.filter(c => c.op === "checkout").length, 1);
});
test("Stripe errors cannot expose secret values or raw provider messages", async () => {
  const { SDK } = fixture();
  class Broken extends SDK { accounts = { retrieve: async () => { throw new Error("sk_test_private raw billing details"); } }; }
  const provider = createStripeProvider({ apiKey: "rk_test_fixture", Stripe: Broken });
  await assert.rejects(provider.createCustomer({ buyerKey: "personal_teacher" }), error => error.message === "Zahlungsanbieter vorübergehend nicht verfügbar.");
});
test("school invoice creation isolates its line items, supports EU bank transfer and sends no email", async () => {
  const { SDK, calls } = fixture();
  class SchoolSDK extends SDK {
    prices = { retrieve: async () => ({ id: "price_school", active: true, livemode: false, currency: "eur", unit_amount: 5000, tax_behavior: "inclusive", recurring: null }) };
    invoices = {
      create: async (data, options) => { calls.push({ op: "invoice", data, options }); return { id: "in_school", livemode: false }; },
      finalizeInvoice: async (id, data, options) => { calls.push({ op: "finalize", id, data, options }); return { id, livemode: false, hosted_invoice_url: "https://invoice.stripe.com/i/test" }; }
    };
    invoiceItems = { create: async (data, options) => { calls.push({ op: "line", data, options }); return { id: "ii_test", livemode: false }; } };
  }
  const provider = createStripeProvider({ apiKey: "sk_test_fixture", Stripe: SchoolSDK });
  const input = { orderId: "school_order", customerId: "cus_school", priceId: "price_school", unitAmount: 5000, quantity: 2, startsAtMs: 1795000000000, endsAtMs: 1826536000000 };
  await provider.createSchoolInvoice(input);
  await provider.createSchoolInvoice(input);
  const created = calls.filter(c => c.op === "invoice");
  assert.deepEqual(created[0], created[1]);
  assert.equal(created[0].data.collection_method, "send_invoice");
  assert.equal(created[0].data.auto_advance, false);
  assert.equal(created[0].data.pending_invoice_items_behavior, "exclude");
  assert.deepEqual(created[0].data.payment_settings.payment_method_types, ["customer_balance"]);
  assert.deepEqual(created[0].data.payment_settings.payment_method_options.customer_balance, { funding_type: "bank_transfer", bank_transfer: { type: "eu_bank_transfer", eu_bank_transfer: { country: "DE" } } });
  assert.equal(calls.find(c => c.op === "line").data.invoice, "in_school");
  assert.equal(calls.find(c => c.op === "line").data.quantity, 2);
  assert.equal(calls.find(c => c.op === "finalize").data.auto_advance, false);
});
test("portal return address is constrained to the GradeCrew test preview", async () => {
  const { SDK } = fixture();
  let active = true;
  class PortalSDK extends SDK { billingPortal = { configurations: { retrieve: async id => ({ id, active, livemode: false, features: { invoice_history: { enabled: true }, subscription_cancel: { enabled: true, mode: "at_period_end" }, subscription_update: { enabled: false } } }) }, sessions: { create: async data => ({ url: "https://billing.stripe.com/test", ...data }) } }; }
  const provider = createStripeProvider({ apiKey: "sk_test_fixture", Stripe: PortalSDK });
  const input = { customerId: "cus_test", configurationId: "bpc_test", returnUrl: "https://gradecrew-staging-2026--billing-product-test.web.app/" };
  await assert.rejects(provider.createPortal({ ...input, returnUrl: "https://gradecrew.de" }));
  const session = await provider.createPortal(input);
  assert.match(session.url, /billing.stripe/); assert.equal(session.configuration, "bpc_test");
  active = false; await assert.rejects(provider.createPortal(input));
  await assert.rejects(provider.createPortal({ ...input, configurationId: undefined }));
});
test("the real pinned SDK transport canonicalizes exact invoice decimals before domain validation", async () => {
  const ActualStripe = require("stripe");
  const expected = { kind: "school", orderId: "school_order", customerId: "cus_school", priceId: "price_school", unitAmount: 5000, quantity: 1, startsAtMs: 1795000000000, endsAtMs: 1826536000000 };
  let quantity = "1";
  const wire = () => ({ id: "in_school", object: "invoice", livemode: false, customer: "cus_school", currency: "eur", total: 5000, amount_due: 5000, amount_paid: 5000, amount_remaining: 0, status: "paid", metadata: { gc_order_id: "school_order" }, parent: null,
    lines: { object: "list", has_more: false, data: [{ object: "line_item", invoice: "in_school", currency: "eur", livemode: false, quantity: 1, quantity_decimal: quantity, period: { start: 1795000000, end: 1826536000 }, pricing: { type: "price_details", price_details: { price: "price_school" } }, parent: { type: "invoice_item_details", invoice_item_details: { proration: false } } }] } });
  class TransportSDK extends ActualStripe {
    constructor(key, options) { super(key, { ...options, httpClient: ActualStripe.createFetchHttpClient(async url => new globalThis.Response(JSON.stringify(String(url).endsWith("/account") ? { id: SANDBOX_ACCOUNT } : wire()), { status: 200, headers: { "content-type": "application/json" } })) }); }
  }
  const provider = createStripeProvider({ apiKey: "sk_test_fixture", Stripe: TransportSDK });
  const { normalizeInvoice } = require("../lib/billing/domain/stripe-contracts");
  for (const exact of ["1", "1.00"]) {
    quantity = exact; const result = await provider.retrieveInvoice("in_school");
    assert.equal(typeof result.lines.data[0].quantity_decimal, "string");
    assert.equal(normalizeInvoice(result, expected).paid, true);
  }
  quantity = "1.00000000000000001";
  assert.throws(() => normalizeInvoice(wire(), expected));
  assert.throws(() => normalizeInvoice({ ...wire(), lines: { ...wire().lines, data: [{ ...wire().lines.data[0], quantity_decimal: "1.00000000000000001" }] } }, expected));
  const precise = await provider.retrieveInvoice("in_school");
  assert.equal(precise.lines.data[0].quantity_decimal, "1.00000000000000001");
  assert.throws(() => normalizeInvoice(precise, expected));
});
