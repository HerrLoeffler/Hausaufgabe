"use strict";

const PLANS = new Set(["personal-monthly", "personal-yearly", "school-yearly"]);
const safe = value => Number.isSafeInteger(value) && value >= 0;
const objectId = value => typeof value === "string" ? value : value?.id;
function check(condition) { if (!condition) throw new TypeError("Ungültige oder widersprüchliche Rabattregel."); }
function text(value, min, max) { check(typeof value === "string"); const result = value.trim(); check(result.length >= min && result.length <= max); return result; }
function berlinDay(value, plus = 0) {
  check(typeof value === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(value));
  const date = new Date(value + "T00:00:00Z"); check(!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value);
  date.setUTCDate(date.getUTCDate() + plus);
  const offset = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "longOffset", hour: "2-digit" }).formatToParts(date).find(p => p.type === "timeZoneName")?.value;
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset || ""); check(match);
  return date.getTime() - (match[1] === "+" ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3])) * 60000;
}
function normalizeOffer(input) {
  check(input && typeof input === "object" && !Array.isArray(input));
  const fields = new Set(["name", "title", "planCode", "audience", "targetIds", "code", "discountType", "percentOff", "amountOffMinor", "fixedBasis", "startsOn", "endsOn", "duration", "durationMonths", "maxRedemptions", "firstTimeOnly", "reason"]);
  check(Object.keys(input).every(k => fields.has(k)));
  const name = text(input.name, 2, 100), title = text(input.title, 1, 100), reason = text(input.reason, 3, 500);
  check(PLANS.has(input.planCode) && ["public", "accounts", "code"].includes(input.audience));
  const targets = input.targetIds ?? [];
  check(Array.isArray(targets) && targets.length <= 100 && targets.every(id => typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id)));
  check(new Set(targets).size === targets.length && (input.audience !== "accounts" || targets.length > 0) && (input.audience !== "public" || targets.length === 0));
  const code = input.code ? text(input.code, 3, 32).toUpperCase() : null;
  check(input.audience === "code" ? !!code && /^[A-Z0-9][A-Z0-9-]{2,31}$/.test(code) : code === null);
  const percent = input.discountType === "percent";
  check(percent || input.discountType === "fixed");
  check(percent ? Number.isInteger(input.percentOff) && input.percentOff > 0 && input.percentOff <= 100 && input.amountOffMinor == null
    : safe(input.amountOffMinor) && input.amountOffMinor > 0 && input.percentOff == null);
  const fixedBasis = input.fixedBasis ?? (input.planCode === "school-yearly" && !percent ? null : "invoice");
  check(["invoice", "seat"].includes(fixedBasis) && (input.planCode === "school-yearly" || fixedBasis === "invoice"));
  check(["once", "months", "forever"].includes(input.duration));
  check(input.duration === "months" ? Number.isInteger(input.durationMonths) && input.durationMonths >= 1 && input.durationMonths <= 36 : input.durationMonths == null);
  const startsAtMs = berlinDay(input.startsOn), endsAtMs = berlinDay(input.endsOn, 1); check(startsAtMs < endsAtMs);
  check(input.maxRedemptions == null || Number.isInteger(input.maxRedemptions) && input.maxRedemptions >= 1 && input.maxRedemptions <= 100000);
  check(input.firstTimeOnly == null || typeof input.firstTimeOnly === "boolean");
  return { name, title, reason, planCode: input.planCode, audience: input.audience, targetIds: [...targets].sort(), code,
    discountType: input.discountType, percentOff: percent ? input.percentOff : null, amountOffMinor: percent ? null : input.amountOffMinor,
    fixedBasis, startsOn: input.startsOn, endsOn: input.endsOn, startsAtMs, endsAtMs, duration: input.duration,
    durationMonths: input.duration === "months" ? input.durationMonths : null, maxRedemptions: input.maxRedemptions ?? null, firstTimeOnly: input.firstTimeOnly === true };
}
function offerAmount(offer, { unitAmount, quantity }) {
  check(safe(unitAmount) && unitAmount > 0 && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 500 && safe(unitAmount * quantity));
  const baseAmountMinor = unitAmount * quantity;
  let amount;
  if (offer.discountType === "percent") { check(Number.isInteger(offer.percentOff) && offer.percentOff > 0 && offer.percentOff <= 100); amount = Math.round(baseAmountMinor * offer.percentOff / 100); }
  else { check(offer.discountType === "fixed" && safe(offer.amountOffMinor) && offer.amountOffMinor > 0 && ["invoice", "seat"].includes(offer.fixedBasis)); amount = offer.amountOffMinor * (offer.fixedBasis === "seat" ? quantity : 1); }
  check(safe(amount)); const discountAmountMinor = Math.min(baseAmountMinor, amount);
  return { baseAmountMinor, discountAmountMinor, totalMinor: baseAmountMinor - discountAmountMinor };
}
function offerWindow(offer, at) { return safe(at) && safe(offer?.startsAtMs) && safe(offer?.endsAtMs) && offer.startsAtMs <= at && at < offer.endsAtMs; }
function addMonths(at, count) {
  check(safe(at) && Number.isInteger(count) && count > 0);
  const date = new Date(at), day = date.getUTCDate(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + count);
  date.setUTCDate(Math.min(day, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate())); return date.getTime();
}
function discountForInvoice(order, invoice) {
  const baseAmountMinor = order.unitAmount * order.quantity; check(safe(baseAmountMinor));
  const periodStart = invoice.lines?.data?.[0]?.period?.start * 1000; check(safe(periodStart));
  let offer = order.offer || null;
  const changes = order.offerChanges || []; check(Array.isArray(changes) && changes.length <= 50);
  for (const change of [...changes].sort((a, b) => a.effectiveAtMs - b.effectiveAtMs)) {
    check(safe(change.effectiveAtMs)); if (change.effectiveAtMs <= periodStart) offer = change.offer || null;
  }
  const discounts = invoice.discounts || [], totals = invoice.total_discount_amounts || [];
  check(Array.isArray(discounts) && Array.isArray(totals));
  const full = () => { check(discounts.length === 0 && totals.every(d => d.amount === 0)); return { baseAmountMinor, discountAmountMinor: 0, totalMinor: baseAmountMinor, discountApplied: false }; };
  if (!offer) return full();
  const start = offer.applicationStartMs ?? (order.kind === "school" ? invoice.created * 1000 : order.subscriptionStartsAtMs); check(safe(start));
  const billingStart = order.kind === "school" ? invoice.created * 1000 : periodStart;
  check(safe(billingStart) && billingStart >= start);
  const end = offer.duration === "months" ? addMonths(start, offer.durationMonths) : null;
  if ((offer.duration === "once" && billingStart > start) || (end !== null && billingStart >= end)) return full();
  check(discounts.length === 1 && totals.length === 1);
  const discount = discounts[0], coupon = discount?.source?.coupon;
  check(discount?.object === "discount" && typeof discount.id === "string" && discount.source.type === "coupon");
  check(coupon?.object === "coupon" && coupon.livemode === false && !coupon.deleted && coupon.id === offer.couponId);
  check(coupon.metadata?.gc_offer_id === offer.id && coupon.metadata?.gc_quantity === String(order.quantity));
  check(discount.start * 1000 === start && (end === null ? discount.end == null : discount.end * 1000 === end));
  check(!discount.customer || objectId(discount.customer) === order.customerId);
  check(!discount.subscription || objectId(discount.subscription) === order.subscriptionId);
  check(!discount.invoice || objectId(discount.invoice) === invoice.id);
  check(!discount.invoice_item && !discount.subscription_item);
  check(offer.promotionCodeId ? objectId(discount.promotion_code) === offer.promotionCodeId : !discount.promotion_code);
  check(coupon.duration === (offer.duration === "months" ? "repeating" : offer.duration));
  check(offer.duration !== "months" || coupon.duration_in_months === offer.durationMonths);
  if (offer.discountType === "percent") check(coupon.percent_off === offer.percentOff && coupon.amount_off == null);
  else check(coupon.percent_off == null && coupon.currency === "eur" && coupon.amount_off === offer.amountOffMinor * (offer.fixedBasis === "seat" ? order.quantity : 1));
  const amount = offerAmount(offer, order);
  check(totals[0].amount === amount.discountAmountMinor && objectId(totals[0].discount) === discount.id);
  for (const lineDiscount of invoice.lines.data[0].discount_amounts || []) check(objectId(lineDiscount.discount) === discount.id && lineDiscount.amount === amount.discountAmountMinor);
  return { ...amount, discountApplied: true, applicationStartMs: start, applicationEndMs: end };
}

module.exports = { normalizeOffer, offerAmount, offerWindow, discountForInvoice, addMonths };
