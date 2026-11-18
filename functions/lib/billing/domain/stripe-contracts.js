"use strict";
const { discountForInvoice } = require("./offers");

// Pure provider boundary: deliberately narrower than Stripe's general invoice
// model. Discounts require an explicit immutable order authorization; credits,
// prorations and changed prices cannot silently turn into an entitlement.
const safe = value => Number.isSafeInteger(value) && value >= 0;
const objectId = value => typeof value === "string" ? value : value?.id;
function requireValue(condition) { if (!condition) throw new TypeError("Unstimmige Stripe-Rechnung."); }

function mergePaidPeriods(periods) {
  if (!Array.isArray(periods)) throw new TypeError("Paid periods required");
  const sorted = periods.map(p => {
    if (!safe(p?.startsAtMs) || !safe(p?.endsAtMs) || p.startsAtMs >= p.endsAtMs) throw new TypeError("Invalid paid period");
    return { startsAtMs: p.startsAtMs, endsAtMs: p.endsAtMs };
  }).sort((a, b) => a.startsAtMs - b.startsAtMs);
  const result = [];
  for (const p of sorted) {
    const previous = result[result.length - 1];
    if (previous && p.startsAtMs <= previous.endsAtMs) previous.endsAtMs = Math.max(previous.endsAtMs, p.endsAtMs);
    else result.push(p);
  }
  return result;
}

function normalizeInvoice(invoice, expected) {
  const e = expected;
  requireValue(e && ["personal", "school"].includes(e.kind) && typeof e.orderId === "string" && e.orderId.length > 0);
  requireValue(safe(e.unitAmount) && e.unitAmount > 0 && Number.isSafeInteger(e.quantity) && e.quantity > 0 && safe(e.unitAmount * e.quantity));
  requireValue(invoice?.object === "invoice" && /^in_[A-Za-z0-9]+$/.test(invoice.id) && invoice.livemode === false);
  requireValue(typeof e.customerId === "string" && objectId(invoice.customer) === e.customerId && invoice.currency === "eur");
  requireValue(safe(invoice.total));
  for (const name of ["amount_due", "amount_paid", "amount_remaining"]) requireValue(safe(invoice[name]));
  requireValue(invoice.amount_paid + invoice.amount_remaining === invoice.amount_due && invoice.amount_due === invoice.total);
  requireValue(invoice.amount_paid_off_stripe == null || invoice.amount_paid_off_stripe === 0);
  requireValue(["draft", "open", "paid", "void", "uncollectible"].includes(invoice.status));
  requireValue(invoice.status !== "paid" || invoice.amount_remaining === 0);
  requireValue(invoice.lines?.has_more === false && invoice.lines.data?.length === 1);
  const line = invoice.lines.data[0];
  requireValue(line.object === "line_item" && line.livemode === false && objectId(line.invoice) === invoice.id && line.currency === "eur");
  requireValue(line.quantity === e.quantity && (line.quantity_decimal == null || line.quantity_decimal === String(e.quantity)));
  requireValue(typeof e.priceId === "string" && line.pricing?.type === "price_details" && objectId(line.pricing.price_details?.price) === e.priceId);
  let period = null, subscriptionId = null, metadata;
  if (e.kind === "personal") {
    const parent = invoice.parent?.subscription_details;
    const item = line.parent?.subscription_item_details;
    subscriptionId = objectId(parent?.subscription);
    requireValue(typeof e.subscriptionId === "string" && subscriptionId === e.subscriptionId);
    requireValue(invoice.parent?.type === "subscription_details" && line.parent?.type === "subscription_item_details" && item?.proration === false && objectId(item.subscription) === subscriptionId);
    metadata = parent.metadata;
    const start = line.period?.start * 1000, end = line.period?.end * 1000;
    requireValue(safe(start) && safe(end) && start < end);
    // Stripe's subscription billing boundaries are consecutive timestamps;
    // GradeCrew access always treats the end as exclusive.
    period = { startsAtMs: start, endsAtMs: end };
  } else {
    requireValue(!invoice.parent?.subscription_details && line.parent?.type === "invoice_item_details" && line.parent.invoice_item_details?.proration === false);
    requireValue(safe(e.startsAtMs) && safe(e.endsAtMs) && e.startsAtMs < e.endsAtMs && line.period?.start * 1000 === e.startsAtMs && line.period?.end * 1000 === e.endsAtMs);
    metadata = invoice.metadata;
  }
  requireValue(metadata?.gc_order_id === e.orderId);
  const amount = discountForInvoice(e, invoice);
  requireValue(invoice.total === amount.totalMinor);
  return { invoiceId: invoice.id, customerId: e.customerId, subscriptionId, orderId: e.orderId, currency: "eur", total: invoice.total,
    ...(typeof invoice.number === "string" && invoice.number.length > 0 && invoice.number.length <= 100 ? { invoiceNumber: invoice.number } : {}),
    paidAmount: invoice.amount_paid, remaining: invoice.amount_remaining, status: invoice.status,
    paid: invoice.status === "paid" && invoice.amount_remaining === 0, period };
}

module.exports = { mergePaidPeriods, normalizeInvoice };
