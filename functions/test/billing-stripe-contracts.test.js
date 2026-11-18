"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeInvoice, mergePaidPeriods } = require("../lib/billing/domain/stripe-contracts");
const expected = { kind: "personal", customerId: "cus_test", priceId: "price_month", subscriptionId: "sub_test", orderId: "order_test", unitAmount: 1500, quantity: 1 };
function invoice() {
  return { id: "in_test", object: "invoice", livemode: false, customer: "cus_test", currency: "eur", status: "paid", total: 1500, amount_due: 1500, amount_paid: 1500, amount_remaining: 0,
    parent: { type: "subscription_details", subscription_details: { subscription: "sub_test", metadata: { gc_order_id: "order_test" } } },
    lines: { has_more: false, data: [{ id: "il_test", object: "line_item", livemode: false, invoice: "in_test", currency: "eur", quantity: 1, quantity_decimal: "1", pricing: { type: "price_details", price_details: { price: "price_month" } },
      parent: { type: "subscription_item_details", subscription_item_details: { subscription: "sub_test", proration: false } }, period: { start: 1795000000, end: 1797592000 } }] } };
}
test("a bound paid subscription invoice returns a half-open service period in milliseconds", () => {
  const result = normalizeInvoice(invoice(), expected);
  assert.deepEqual(result, { invoiceId: "in_test", customerId: "cus_test", subscriptionId: "sub_test", orderId: "order_test", currency: "eur", total: 1500, paidAmount: 1500, remaining: 0, status: "paid", paid: true, period: { startsAtMs: 1795000000000, endsAtMs: 1797592000000 } });
});
for (const [name, change] of Object.entries({
  "live invoice": i => { i.livemode = true; },
  "foreign buyer": i => { i.customer = "cus_foreign"; },
  "foreign price": i => { i.lines.data[0].pricing.price_details.price = "price_foreign"; },
  "foreign subscription": i => { i.lines.data[0].parent.subscription_item_details.subscription = "sub_foreign"; },
  "foreign order": i => { i.parent.subscription_details.metadata.gc_order_id = "other"; },
  "different currency": i => { i.currency = "usd"; },
  "changed gross price": i => { i.total = 1499; },
  "fractional seats": i => { i.lines.data[0].quantity_decimal = "1.5"; },
  "proration": i => { i.lines.data[0].parent.subscription_item_details.proration = true; },
  "truncated lines": i => { i.lines.has_more = true; },
  "extra line": i => { i.lines.data.push(JSON.parse(JSON.stringify(i.lines.data[0]))); },
  "empty period": i => { i.lines.data[0].period.end = i.lines.data[0].period.start; },
  "invalid amount": i => { i.amount_remaining = -1; },
  "contradictory paid status": i => { i.amount_paid = 0; i.amount_remaining = 1500; },
  "line from another invoice": i => { i.lines.data[0].invoice = "in_other"; }
})) test("rejects " + name, () => { const value = invoice(); change(value); assert.throws(() => normalizeInvoice(value, expected)); });
test("credits or manual off-Stripe settlement do not count as the pilot's full payment", () => {
  for (const amount of [0, 1000]) { const value = invoice(); Object.assign(value, { amount_due: amount, amount_paid: amount }); assert.throws(() => normalizeInvoice(value, expected)); }
  const manual = invoice(); manual.amount_paid_off_stripe = 1500; assert.throws(() => normalizeInvoice(manual, expected));
});
test("school bank transfers of 10 and 20 euros do not pay a 50 euro invoice", () => {
  const value = invoice();
  Object.assign(value, { parent: null, metadata: { gc_order_id: "order_school" }, total: 5000, amount_due: 5000, status: "open" });
  value.lines.data[0].parent = { type: "invoice_item_details", invoice_item_details: { proration: false } };
  value.lines.data[0].pricing.price_details.price = "price_school";
  const school = { kind: "school", customerId: "cus_test", priceId: "price_school", orderId: "order_school", unitAmount: 5000, quantity: 1, startsAtMs: 1795000000000, endsAtMs: 1797592000000 };
  for (const [amount, remaining, status, paid] of [[1000, 4000, "open", false], [3000, 2000, "open", false], [5000, 0, "paid", true], [5000, 0, "open", false]]) {
    Object.assign(value, { amount_paid: amount, amount_remaining: remaining, status });
    const result = normalizeInvoice(value, school);
    assert.equal(result.paid, paid); assert.equal(result.remaining, remaining); assert.equal(result.period, null);
  }
  value.lines.data[0].period.end++;
  assert.throws(() => normalizeInvoice(value, school), "a paid school invoice must cover the agreed annual period");
});
test("paid intervals merge overlaps, adjacent renewals and duplicates without bridging unpaid gaps", () => {
  const periods = [{ startsAtMs: 30, endsAtMs: 40 }, { startsAtMs: 0, endsAtMs: 10 }, { startsAtMs: 10, endsAtMs: 20 }, { startsAtMs: 5, endsAtMs: 12 }, { startsAtMs: 30, endsAtMs: 40 }];
  const saved = JSON.parse(JSON.stringify(periods));
  assert.deepEqual(mergePaidPeriods(periods), [{ startsAtMs: 0, endsAtMs: 20 }, { startsAtMs: 30, endsAtMs: 40 }]);
  assert.deepEqual(periods, saved);
  for (const p of [[{ startsAtMs: 3, endsAtMs: 3 }], [{ startsAtMs: -1, endsAtMs: 2 }], [{ startsAtMs: 2, endsAtMs: null }]]) assert.throws(() => mergePaidPeriods(p));
});
test('discounted and zero-euro invoices require an exact authorized coupon contract',()=>{
 for(const percentOff of [20,100]){
  const value=invoice(),start=value.lines.data[0].period.start*1000;
  const offer={id:'offer_authorized',couponId:'coupon_authorized',discountType:'percent',percentOff,fixedBasis:'invoice',duration:'once',durationMonths:null,applicationStartMs:start};
  const amount=Math.round(1500*percentOff/100);Object.assign(value,{total:1500-amount,amount_due:1500-amount,amount_paid:1500-amount});
  value.discounts=[{id:'di_authorized',object:'discount',start:start/1000,end:null,source:{type:'coupon',coupon:{id:'coupon_authorized',object:'coupon',livemode:false,percent_off:percentOff,amount_off:null,duration:'once',metadata:{gc_offer_id:offer.id,gc_quantity:'1'}}}}];
  value.total_discount_amounts=[{amount,discount:'di_authorized'}];
  const result=normalizeInvoice(value,{...expected,offer});assert.equal(result.paid,true);assert.equal(result.total,1500-amount);
  assert.throws(()=>normalizeInvoice(value,expected));
 }
});
