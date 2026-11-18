"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeOffer,offerAmount,offerWindow,discountForInvoice}=require('../lib/billing/domain/offers');
const input=extra=>({name:'Startaktion',title:'20 % zum Start',planCode:'personal-monthly',audience:'public',discountType:'percent',percentOff:20,fixedBasis:'invoice',startsOn:'2026-03-28',endsOn:'2026-03-29',duration:'months',durationMonths:3,firstTimeOnly:false,reason:'Freigegebene Testaktion',...extra});
test('offers normalize the explicit Berlin day window across DST and distinguish redemption from duration',()=>{
 const offer=normalizeOffer(input());assert.equal(offer.startsAtMs,Date.parse('2026-03-27T23:00:00Z'));assert.equal(offer.endsAtMs,Date.parse('2026-03-29T22:00:00Z'));
 assert.equal(offerWindow(offer,offer.startsAtMs),true);assert.equal(offerWindow(offer,offer.endsAtMs),false);assert.equal(offer.durationMonths,3);
});
test('percent/fixed rules calculate cents and distinguish school per-seat from invoice discounts',()=>{
 assert.deepEqual(offerAmount(normalizeOffer(input()),{unitAmount:1500,quantity:1}),{baseAmountMinor:1500,discountAmountMinor:300,totalMinor:1200});
 const fixed=input({planCode:'school-yearly',discountType:'fixed',percentOff:undefined,amountOffMinor:1000,fixedBasis:'seat'});
 assert.equal(offerAmount(normalizeOffer(fixed),{unitAmount:5000,quantity:20}).totalMinor,80000);
 assert.equal(offerAmount(normalizeOffer({...fixed,fixedBasis:'invoice'}),{unitAmount:5000,quantity:20}).totalMinor,99000);
 assert.equal(offerAmount(normalizeOffer(input({percentOff:100})),{unitAmount:1500,quantity:1}).totalMinor,0);
 assert.equal(offerAmount(normalizeOffer(input({discountType:'fixed',percentOff:undefined,amountOffMinor:2000})),{unitAmount:1500,quantity:1}).totalMinor,0);
});
test('offer validation rejects unbound amounts, impossible dates, ambiguous school basis and injected provider IDs',()=>{
 for(const change of [{percentOff:0},{percentOff:101},{percentOff:0.5},{durationMonths:0},{startsOn:'2026-02-30'},{endsOn:'2026-03-20'},{audience:'accounts',targetIds:[]},{audience:'code',code:'<script>'},{providerCouponId:'coupon_attacker'}])assert.throws(()=>normalizeOffer(input(change)));
 assert.throws(()=>normalizeOffer(input({planCode:'school-yearly',discountType:'fixed',percentOff:undefined,amountOffMinor:1000,fixedBasis:undefined})));
});
function sample(extra={}){
 const start=Date.parse('2026-01-31T12:00:00Z');
 const offer={...normalizeOffer(input({startsOn:'2026-01-01',endsOn:'2026-01-31'})),id:'offer_version',couponId:'gc_coupon',applicationStartMs:start,...extra};
 const order={kind:'personal',customerId:'cus_own',subscriptionId:'sub_own',unitAmount:1500,quantity:1,offer};
 const coupon={id:'gc_coupon',object:'coupon',livemode:false,percent_off:offer.percentOff,amount_off:null,duration:offer.duration==='months'?'repeating':offer.duration,duration_in_months:offer.durationMonths||null,metadata:{gc_offer_id:'offer_version',gc_quantity:'1'}};
 const d={id:'di_own',object:'discount',customer:'cus_own',subscription:'sub_own',invoice:null,invoice_item:null,subscription_item:null,promotion_code:null,start:start/1000,end:offer.duration==='months'?Date.parse('2026-04-30T12:00:00Z')/1000:null,source:{type:'coupon',coupon}};
 const discountAmountMinor=offer.percentOff*15;
 const invoice={id:'in_own',discounts:[d],total_discount_amounts:[{amount:discountAmountMinor,discount:'di_own'}],lines:{data:[{period:{start:start/1000,end:start/1000+86400}}]}};
 return {order,invoice,start,d};
}
test('a known coupon authorizes only its exact owned discount and resulting total',()=>{
 const {order,invoice}=sample();assert.equal(discountForInvoice(order,invoice).totalMinor,1200);
 for(const mutate of [v=>{v.discounts[0].source.coupon.id='wrong';},v=>{v.total_discount_amounts[0].amount=301;},v=>{v.discounts[0].source.coupon.percent_off=30;},v=>{v.discounts[0].start++;},v=>{v.discounts[0].promotion_code='promo_unknown';}]){const changed=globalThis.structuredClone(invoice);mutate(changed);assert.throws(()=>discountForInvoice(order,changed));}
});
test('100 percent is an explicit zero-euro authorization, never an arbitrary zero or credit allowance',()=>{
 const {order,invoice}=sample({percentOff:100});assert.equal(discountForInvoice(order,invoice).totalMinor,0);
 assert.throws(()=>discountForInvoice({...order,offer:null},invoice));
});
test('coupon application window expiration affects future invoices without shortening an annual paid period',()=>{
 const {order,invoice}=sample();invoice.lines.data[0].period.end=Date.parse('2027-01-31T12:00:00Z')/1000;
 assert.equal(discountForInvoice(order,invoice).totalMinor,1200);
 const later={id:'in_later',discounts:[],total_discount_amounts:[],lines:{data:[{period:{start:Date.parse('2027-01-31T12:00:00Z')/1000,end:Date.parse('2028-01-31T12:00:00Z')/1000}}]}};
 assert.equal(discountForInvoice(order,later).totalMinor,1500);
});
test('once and forever have separate invoice semantics and existing contract changes preserve earlier invoices',()=>{
 const once=sample({duration:'once',durationMonths:null});assert.equal(discountForInvoice(once.order,once.invoice).totalMinor,1200);
 const next={id:'in_next',discounts:[],total_discount_amounts:[],lines:{data:[{period:{start:once.start/1000+86400,end:once.start/1000+172800}}]}};
 assert.equal(discountForInvoice(once.order,next).totalMinor,1500);
 const old={...once.order,offer:null,offerChanges:[{effectiveAtMs:once.start+86400000,offer:once.order.offer}]};
 assert.equal(discountForInvoice(old,{...once.invoice,discounts:[],total_discount_amounts:[]}).totalMinor,1500);
 const forever=sample({duration:'forever',durationMonths:null});forever.invoice.lines.data[0].period.start+=86400;assert.equal(discountForInvoice(forever.order,forever.invoice).totalMinor,1200);
});
test('an annual school invoice may start its service before the coupon is applied at invoice creation',()=>{
 const {order,invoice,start}=sample({duration:'once',durationMonths:null});order.kind='school';order.subscriptionId=null;order.offer.applicationStartMs=undefined;
 invoice.created=start/1000;invoice.lines.data[0].period.start-=43200;invoice.discounts[0].subscription=null;invoice.discounts[0].invoice=invoice.id;
 assert.equal(discountForInvoice(order,invoice).totalMinor,1200);
});
