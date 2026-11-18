"use strict";
const { createHash } = require("node:crypto");
const { URL } = require("node:url");
const STRIPE_API_VERSION = "2026-10-28.endive";
const SANDBOX_ACCOUNT = "acct_1UYUaw1l0zkqOtXr";
const INTEGRATION_IDENTIFIER = "gradecrew_billing_pilot_vnqmkzpt";

function id(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new TypeError("Ungültige Zahlungskennung.");
  return value;
}
const idem = (...parts) => "gc_" + createHash("sha256").update(JSON.stringify(parts)).digest("hex");
function returnAddress(value) {
  let url;
  try { url = new URL(value); } catch { throw new TypeError("Ungültige Rücksprungadresse."); }
  if (url.protocol !== "https:" || url.username || url.password || url.port || !/^gradecrew-staging-2026--billing-(product|plan-01)-[a-z0-9-]+\.web\.app$/.test(url.hostname)) throw new TypeError("Ungültige Rücksprungadresse.");
  url.pathname = "/"; url.search = ""; url.hash = "";
  return url;
}
function createStripeProvider({ apiKey, Stripe = require("stripe") } = {}) {
  if (typeof apiKey !== "string" || !/^(sk|rk)_test_[A-Za-z0-9]+$/.test(apiKey)) throw new TypeError("Stripe-Testschlüssel erforderlich.");
  const client = new Stripe(apiKey, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 20000 });
  async function guarded(work) {
    try {
      const account = await client.accounts.retrieve();
      if (account.id !== SANDBOX_ACCOUNT) throw new Error("Account mismatch");
      return await work();
    } catch { throw new Error("Zahlungsanbieter vorübergehend nicht verfügbar."); }
  }
  function testObject(value, expectedId) {
    if (value?.livemode !== false || (expectedId && value.id !== expectedId)) throw new TypeError("Ungültiges Stripe-Testobjekt.");
    return value;
  }
  async function checkPrice({ priceId, unitAmount, interval, quantity = 1 }) {
    id(priceId);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0 || !["month", "year", null].includes(interval)) throw new TypeError("Ungültiger Tarif.");
    const price = testObject(await client.prices.retrieve(priceId), priceId);
    if (!price.active || price.currency !== "eur" || price.unit_amount !== unitAmount || price.tax_behavior !== "inclusive" ||
      (interval === null ? price.recurring != null : price.recurring?.interval !== interval || price.recurring?.interval_count !== 1)) throw new TypeError("Ungültiger Tarif.");
    return price;
  }
  async function createCustomer({ buyerKey }) {
    id(buyerKey);
    return guarded(async () => testObject(await client.customers.create({ metadata: { gc_buyer_key: buyerKey } }, { idempotencyKey: idem("customer", buyerKey) })));
  }
  async function createCheckout(input) {
    const { orderId, customerId, priceId } = input;
    id(orderId); id(customerId);
    const success = returnAddress(input.returnUrl); success.searchParams.set("billing", "return");
    const cancel = returnAddress(input.returnUrl); cancel.searchParams.set("billing", "cancel");
    return guarded(async () => {
      await checkPrice(input);
      return testObject(await client.checkout.sessions.create({ mode: "subscription", customer: customerId,
        client_reference_id: orderId, metadata: { gc_order_id: orderId }, subscription_data: { metadata: { gc_order_id: orderId } },
        line_items: [{ price: priceId, quantity: 1 }], automatic_tax: { enabled: false },
        integration_identifier: INTEGRATION_IDENTIFIER, success_url: success.href, cancel_url: cancel.href
      }, { idempotencyKey: idem("checkout", orderId) }));
    });
  }
  const retrieveInvoice = invoiceId => { id(invoiceId); return guarded(async () => {
    const invoice = testObject(await client.invoices.retrieve(invoiceId), invoiceId);
    // Stripe23 materializes decimal-string fields as exact Decimal objects.
    // Keep that SDK type inside this adapter; no Number coercion or rounding.
    if (!invoice.lines?.data) return invoice;
    return { ...invoice, lines: { ...invoice.lines, data: invoice.lines.data.map(line => ({ ...line,
      quantity_decimal: line.quantity_decimal == null ? null : canonicalQuantity(line.quantity_decimal)
    })) } };
  }); };
  function canonicalQuantity(value) {
    if (typeof value === "string") return Stripe.Decimal.from(value).toString();
    if (typeof value !== "object" || Object.getPrototypeOf(value) !== Object.getPrototypeOf(Stripe.Decimal.from("0"))) throw new TypeError("Ungültige Rechnungsmenge.");
    return Stripe.Decimal.from(value.toString()).toString();
  }
  const retrieveSubscription = subscriptionId => { id(subscriptionId); return guarded(async () => testObject(await client.subscriptions.retrieve(subscriptionId), subscriptionId)); };
  const retrieveCheckout = checkoutId => { id(checkoutId); return guarded(async () => testObject(await client.checkout.sessions.retrieve(checkoutId), checkoutId)); };
  async function createPortal({ customerId, returnUrl }) {
    id(customerId); const address = returnAddress(returnUrl);
    return guarded(() => client.billingPortal.sessions.create({ customer: customerId, return_url: address.href }));
  }
  async function createSchoolInvoice(input) {
    id(input.orderId); id(input.customerId);
    if (!Number.isSafeInteger(input.startsAtMs) || !Number.isSafeInteger(input.endsAtMs) || input.startsAtMs < 0 || input.startsAtMs >= input.endsAtMs) throw new TypeError("Ungültiger Rechnungszeitraum.");
    return guarded(async () => {
      await checkPrice({ ...input, interval: null });
      const invoice = testObject(await client.invoices.create({ customer: input.customerId, collection_method: "send_invoice", days_until_due: 14,
        auto_advance: false, pending_invoice_items_behavior: "exclude", automatic_tax: { enabled: false }, metadata: { gc_order_id: input.orderId },
        // Required by Stripe's bank-transfer invoice API; Checkout continues
        // to use dynamic payment methods. Finalizing does not send an email.
        payment_settings: { payment_method_types: ["customer_balance"], payment_method_options: { customer_balance: {
          funding_type: "bank_transfer", bank_transfer: { type: "eu_bank_transfer", eu_bank_transfer: { country: "DE" } }
        } } }
      }, { idempotencyKey: idem("school-invoice", input.orderId) }));
      if (input.onDraft) await input.onDraft(invoice.id);
      testObject(await client.invoiceItems.create({ customer: input.customerId, invoice: invoice.id, pricing: { price: input.priceId }, quantity: input.quantity,
        period: { start: Math.floor(input.startsAtMs / 1000), end: Math.floor(input.endsAtMs / 1000) }
      }, { idempotencyKey: idem("school-line", input.orderId) }));
      return testObject(await client.invoices.finalizeInvoice(invoice.id, { auto_advance: false }, { idempotencyKey: idem("school-finalize", input.orderId) }), invoice.id);
    });
  }
  return { createCustomer, createCheckout, retrieveInvoice, retrieveSubscription, retrieveCheckout, createPortal, createSchoolInvoice };
}

module.exports = { createStripeProvider, STRIPE_API_VERSION, SANDBOX_ACCOUNT };
