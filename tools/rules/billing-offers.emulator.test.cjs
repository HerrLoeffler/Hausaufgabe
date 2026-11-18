'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const req=require('node:module').createRequire(path.resolve(__dirname,'../../functions/package.json'));
const {initializeApp,deleteApp}=req('firebase-admin/app'),{getFirestore}=req('firebase-admin/firestore');
const {createBillingService,key}=req('./lib/billing/application'),{createFirestoreBillingStore}=req('./lib/billing/firestore-store');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);
const app=initializeApp({projectId:'demo-gradecrew-billing'},'offers-tests'),db=getFirestore(app);
let service,time,coupons,calls,failCoupon,subscriptions,invoices,provider, couponHook, sessions, loseCheckout;
const base=Date.UTC(2026,10,18,12),request=(uid='admin',data={})=>({auth:{uid,token:{auth_time:time/1000}},data});
const input=extra=>({name:'Testaktion',title:'20 % zum Start',planCode:'personal-monthly',audience:'public',discountType:'percent',percentOff:20,fixedBasis:'invoice',startsOn:'2026-11-18',endsOn:'2026-12-18',duration:'once',firstTimeOnly:false,reason:'Explizite Sandbox-Testaktion',...extra});
async function seed(){
 couponHook=null;sessions=new Map();loseCheckout=false;time=base;coupons=new Map();calls=[];failCoupon=false;subscriptions=new Map();invoices=new Map();
 const collections=['users','accountDeletions','appConfig','quizzes','billingV2Accounts','billingV2Grants','billingV2Schools','billingV2Memberships','billingV2Periods','billingV2Invitations','billingV2Audit','billingV2Orders','billingV2Buyers','billingV2PurchaseLocks','billingV2StripeEvents','billingV2Invoices','billingV2Offers','billingV2OfferQuotes','billingV2OfferReservations','billingV2OfferAttempts','billingV2OfferAmendmentPreviews','billingV2OfferAmendments','billingV2OfferAmendmentLocks'];
 for(const name of collections)await db.recursiveDelete(db.collection(name));
 for(const uid of ['admin','teacher','other'])await db.doc('users/'+uid).set({role:uid==='admin'?'admin':'teacher',status:'active'});
 await db.doc('appConfig/billingProduct').set({enabled:true,allowedUids:['admin','teacher','other'],payments:{enabled:true,ready:true,offersReady:true,accountId:'acct_1UYUaw1l0zkqOtXr',portalConfigurationId:'bpc_test',personalTestClockId:'clock_test',returnUrl:'https://gradecrew-staging-2026--billing-product-test.web.app',prices:{'personal-monthly':'price_month','personal-yearly':'price_year','school-yearly':'price_school'}}});
 provider={
  createOfferCoupon:async({offer,quantity=1})=>{calls.push(['coupon',offer.id,quantity]);if(couponHook)await couponHook(offer);if(failCoupon){failCoupon=false;throw Error('Synthetic uncertain coupon response');}const couponId='coupon_'+offer.id+'_'+quantity;coupons.set(couponId,{id:couponId,object:'coupon',livemode:false,metadata:{gc_offer_id:offer.id,gc_quantity:String(quantity)},percent_off:offer.discountType==='percent'?offer.percentOff:null,amount_off:offer.discountType==='fixed'?offer.amountOffMinor*(offer.fixedBasis==='seat'?quantity:1):null,currency:offer.discountType==='fixed'?'eur':null,duration:offer.duration==='months'?'repeating':offer.duration,duration_in_months:offer.durationMonths});return{couponId};},
  retrieveOfferCoupon:async id=>coupons.get(id),createOfferPromotion:async({offer,customerId})=>({promotionCodeId:'promo_'+key(offer.id,customerId)}),
  createCustomer:async data=>({id:'cus_'+data.buyerKey,livemode:false}),
  createCheckout:async data=>{assert.ok(!(data.couponId&&data.promotionCodeId),'provider accepts only one discount reference');calls.push(['checkout',data]);const id='cs_'+data.orderId;subscriptions.set('sub_'+data.orderId,{id:'sub_'+data.orderId,livemode:false,customer:data.customerId,start_date:time/1000,metadata:{gc_order_id:data.orderId},items:{has_more:false,data:[{price:{id:data.priceId},quantity:1,current_period_start:time/1000,current_period_end:time/1000+30*86400}]}});const session={id,livemode:false,mode:'subscription',status:'open',customer:data.customerId,client_reference_id:data.orderId,metadata:{gc_order_id:data.orderId},url:'https://checkout.stripe.com/c/pay/'+id,expires_at:Math.floor(data.checkoutExpiresAtMs/1000)};sessions.set(id,session);if(loseCheckout){loseCheckout=false;throw Error('Lost checkout response');}return session;},
  createSchoolInvoice:async data=>{assert.ok(!(data.couponId&&data.promotionCodeId),'provider accepts only one discount reference');calls.push(['school',data]);await data.onDraft('in_school');return{id:'in_school',livemode:false,hosted_invoice_url:'https://invoice.stripe.com/i/school'};},
  retrieveInvoice:async id=>invoices.get(id),retrieveSubscription:async id=>subscriptions.get(id),retrieveCheckout:async id=>sessions.get(id),findCheckoutForOrder:async({orderId,customerId})=>[...sessions.values()].find(s=>s.metadata.gc_order_id===orderId&&s.customer===customerId)||null
 };
 service=createBillingService({store:createFirestoreBillingStore(db),provider,now:()=>time,projectId:'demo-gradecrew-billing',getIdentity:async uid=>({uid,email:uid+'@example.invalid',emailVerified:true,disabled:false,metadata:{creationTime:new Date(base-86400000).toISOString()}})});
}
async function publish(extra={},rid='offer-request-001'){
 const saved=await service.saveOffer(request('admin',{offer:input(extra),requestId:rid}));
 return(await service.publishOffer(request('admin',{offerId:saved.offer.id,requestId:'publish-'+rid}))).offer;
}
const quote=(uid='teacher',data={})=>service.offerQuote(request(uid,{planCode:'personal-monthly',...data}));
const buy=(uid,q)=>service.checkout(request(uid,{planCode:'personal-monthly',quoteId:q.quote.id,requestId:'purchase-'+uid+'-'+q.quote.id}));
async function paid(orderId,percent){
 const order=(await db.doc('billingV2Orders/'+orderId).get()).data(),start=time/1000,id='in_'+order.id,amount=Math.round(1500*percent/100);
 const invoice={id,object:'invoice',livemode:false,customer:order.customerId,currency:'eur',status:'paid',total:1500-amount,amount_due:1500-amount,amount_paid:1500-amount,amount_remaining:0,created:start,parent:{type:'subscription_details',subscription_details:{subscription:'sub_'+order.id,metadata:{gc_order_id:order.id}}},lines:{has_more:false,data:[{object:'line_item',livemode:false,invoice:id,currency:'eur',quantity:1,pricing:{type:'price_details',price_details:{price:order.priceId}},parent:{type:'subscription_item_details',subscription_item_details:{subscription:'sub_'+order.id,proration:false}},period:{start,end:start+30*86400}}]},discounts:[{id:'di_test',object:'discount',customer:order.customerId,subscription:'sub_'+order.id,start,end:null,promotion_code:order.offer?.promotionCodeId||null,source:{type:'coupon',coupon:coupons.get(order.offer?.couponId)}}],total_discount_amounts:[{discount:'di_test',amount}]};if(!percent){invoice.discounts=[];invoice.total_discount_amounts=[];}invoices.set(id,invoice);return{id:'evt_'+order.id,object:'event',livemode:false,type:'invoice.paid',data:{object:{id}}};
}
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('offer changes require fresh platform administration and immutable request IDs',async()=>{
 await seed();await assert.rejects(service.saveOffer(request('teacher',{offer:input(),requestId:'forbidden-request'})),{code:'permission-denied'});
 const old=request('admin',{offer:input(),requestId:'stale-request'});old.auth.token.auth_time-=901;await assert.rejects(service.saveOffer(old),{code:'permission-denied'});
 const a=await service.saveOffer(request('admin',{offer:input(),requestId:'repeat-request'})),b=await service.saveOffer(request('admin',{offer:input(),requestId:'repeat-request'}));assert.equal(a.offer.id,b.offer.id);
 await assert.rejects(service.saveOffer(request('admin',{offer:input({percentOff:30}),requestId:'repeat-request'})),{code:'already-exists'});
});
test('public listing never includes private targets/codes and only synchronized active offers can be quoted',async()=>{
 await seed();await publish();await publish({audience:'accounts',targetIds:['other']},'private-request');await publish({audience:'code',code:'CREW20'},'code-request');
 const visible=await service.publicOffers({data:{}});assert.equal(visible.offers.length,1);assert.equal(JSON.stringify(visible).includes('other'),false);assert.equal(JSON.stringify(visible).includes('CREW20'),false);
 const q=await quote();assert.equal(q.quote.totalMinor,1200);assert.equal(q.quote.offer.targetIds,undefined);assert.equal((await service.getAccess(request('teacher'))).canManageOffers,false);
});
test('overlapping public offers cannot both publish and uncertain coupon sync can be resumed',async()=>{
 await seed();const first=await publish();const second=await service.saveOffer(request('admin',{offer:input({percentOff:30}),requestId:'second-request'}));await assert.rejects(service.publishOffer(request('admin',{offerId:second.offer.id,requestId:'second-publish'})),{code:'already-exists'});
 await service.endOffer(request('admin',{offerId:first.id,requestId:'end-first-request',reason:'Aktion bewusst beenden'}));failCoupon=true;
 await assert.rejects(service.publishOffer(request('admin',{offerId:second.offer.id,requestId:'second-publish'})));
 assert.equal((await service.publishOffer(request('admin',{offerId:second.offer.id,requestId:'second-publish'}))).offer.status,'active');
});
test('quotes cannot be reused by foreign owners, after expiry or with client supplied prices',async()=>{
 await seed();await publish();const q=await quote();await assert.rejects(buy('other',q),{code:'permission-denied'});
 time+=300001;await assert.rejects(buy('teacher',q),{code:'failed-precondition'});
 const fresh=await quote();await buy('teacher',fresh);const call=calls.find(x=>x[0]==='checkout')[1];assert.equal(call.unitAmount,1500);assert.ok(call.couponId);assert.ok(call.checkoutExpiresAtMs-time<=35*60000&&call.checkoutExpiresAtMs-time>35*60000-1000);
});
test('parallel buyers cannot overrun an offer redemption limit and repeated checkout reserves once',async()=>{
 await seed();await publish({maxRedemptions:1});const a=await quote('teacher'),b=await quote('other');
 const results=await Promise.allSettled([buy('teacher',a),buy('other',b)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const offers=(await db.collection('billingV2Offers').get()).docs;assert.equal(offers[0].data().reservedCount,1);
 const winner=results[0].status==='fulfilled'?'teacher':'other';await buy(winner,winner==='teacher'?a:b);assert.equal((await offers[0].ref.get()).data().reservedCount,1);
});
for(const percent of [20,100])test('authorized '+percent+' percent purchase grants once only after invoice confirmation',async()=>{
 await seed();const offer=await publish({percentOff:percent}),q=await quote(),checkout=await buy('teacher',q);assert.notEqual((await service.getAccess(request('teacher'))).tier,'personal_premium');
 await service.endOffer(request('admin',{offerId:offer.id,requestId:'end-after-reservation',reason:'Neue Einlösungen beenden'}));const event=await paid(checkout.orderId,percent);await service.processStripeEvent(event);await service.processStripeEvent(event);
 assert.equal((await service.getAccess(request('teacher'))).tier,'personal_premium');const stored=(await db.doc('billingV2Offers/'+offer.id).get()).data();assert.equal(stored.redemptionCount,1);assert.equal(stored.reservedCount,0);
});
test('private and code conflicts require an explicit resolved offer rather than stacking',async()=>{
 await seed();await publish();await publish({audience:'accounts',targetIds:['teacher']},'private-override');assert.equal((await quote()).quote.totalMinor,1200);await publish({audience:'accounts',targetIds:['teacher'],percentOff:30},'private-conflict');await assert.rejects(quote(),{code:'failed-precondition'});
 await assert.rejects(quote('other',{code:'NONEXISTENT'}),{code:'not-found'});
});
test('a code is bound to its own buyer and its exact authorized discount',async()=>{
 await seed();await publish({audience:'code',code:'CREW20',targetIds:['teacher']});
 await assert.rejects(quote('other',{code:'CREW20'}),{code:'not-found'});
 const q=await quote('teacher',{code:'crew20'}),checkout=await buy('teacher',q),stored=(await db.doc('billingV2Orders/'+checkout.orderId).get()).data();
 assert.ok(stored.offer.promotionCodeId);const event=await paid(checkout.orderId,20);await service.processStripeEvent(event);assert.equal((await service.getAccess(request('teacher'))).tier,'personal_premium');
});
test('a discounted school invoice retains its agreed total through partial payments and pays its full year only at zero remaining',async()=>{
 await seed();await publish({planCode:'school-yearly',percentOff:20});
 const school=await service.createSchool(request('admin',{name:'Synthetic discounted school',ownerId:'teacher',seats:1,startDate:'2026-11-18',requestId:'school-discount-test'}));
 const q=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId,quantity:500}));assert.equal(q.quote.quantity,1);assert.equal(q.quote.totalMinor,4000);
 const checkout=await service.schoolInvoice(request('teacher',{schoolId:school.schoolId,quoteId:q.quote.id,requestId:'school-invoice-discount'}));
 const order=(await db.doc('billingV2Orders/'+checkout.orderId).get()).data(),coupon=coupons.get(order.offer.couponId);
 const value={id:'in_school',object:'invoice',livemode:false,customer:order.customerId,currency:'eur',status:'open',total:4000,amount_due:4000,amount_paid:0,amount_remaining:4000,created:time/1000,parent:null,metadata:{gc_order_id:order.id},hosted_invoice_url:'https://invoice.stripe.com/i/school',lines:{has_more:false,data:[{object:'line_item',livemode:false,invoice:'in_school',currency:'eur',quantity:1,pricing:{type:'price_details',price_details:{price:order.priceId}},parent:{type:'invoice_item_details',invoice_item_details:{proration:false}},period:{start:order.startsAtMs/1000,end:order.endsAtMs/1000}}]},discounts:[{id:'di_school',object:'discount',customer:order.customerId,invoice:'in_school',start:time/1000,end:null,source:{type:'coupon',coupon}}],total_discount_amounts:[{amount:1000,discount:'di_school'}]};invoices.set(value.id,value);
 for(const amount of [1000,3000,4000]){
  Object.assign(value,{amount_paid:amount,amount_remaining:4000-amount,status:amount===4000?'paid':'open'});
  await service.processStripeEvent({id:'evt_school_'+amount,object:'event',livemode:false,type:amount===4000?'invoice.paid':'invoice.updated',data:{object:{id:value.id}}});
  assert.equal((await service.getAccess(request('teacher',{scope:{kind:'school',id:school.schoolId}}))).tier,amount===4000?'school':'free');
 }
 assert.equal((await service.getSchool(request('teacher',{schoolId:school.schoolId}))).period.amountMinor,4000);
});
test('a once discount returns to the full price for a consecutive renewal without removing paid access',async()=>{
 await seed();await publish();const checkout=await buy('teacher',await quote());const first=await paid(checkout.orderId,20);await service.processStripeEvent(first);
 const firstInvoice=invoices.get(first.data.object.id),next=structuredClone(firstInvoice);next.id='in_renewal';next.total=next.amount_due=next.amount_paid=1500;next.discounts=[];next.total_discount_amounts=[];
 next.lines.data[0].invoice=next.id;next.lines.data[0].period.start+=30*86400;next.lines.data[0].period.end+=30*86400;invoices.set(next.id,next);
 await service.processStripeEvent({id:'evt_renewal',object:'event',livemode:false,type:'invoice.paid',data:{object:{id:next.id}}});
 const access=await service.getAccess(request('teacher'));assert.equal(access.tier,'personal_premium');assert.equal(access.validUntil,time+60*86400000);
});
test('administrative target search uses names/emails within permitted accounts and never opens to teachers',async()=>{
 await seed();await db.doc('users/teacher').update({displayName:'Frau Muster'});await db.doc('users/not-allowed').set({role:'teacher',status:'active',displayName:'Frau Muster extern'});
 await assert.rejects(service.offerTargets(request('teacher',{query:'muster',kind:'person'})),{code:'permission-denied'});
 const result=await service.offerTargets(request('admin',{query:'muster',kind:'person'}));assert.equal(result.targets.length,1);assert.equal(result.targets[0].label,'Frau Muster');assert.equal(result.targets[0].id,'teacher');assert.equal(result.targets[0].email,'teacher@example.invalid');
 await assert.rejects(service.offerTargets(request('admin',{query:'m',kind:'person'})),{code:'invalid-argument'});
});
test('a fully allocated public offer stops being advertised while its bound order keeps its promised price',async()=>{
 await seed();await publish({maxRedemptions:1});const q=await quote(),order=await buy('teacher',q);
 assert.equal((await service.publicOffers()).offers.length,0);assert.equal((await service.getAccess(request('other'))).offerViews.length,0);assert.equal((await quote('other')).quote.totalMinor,1500);
 assert.equal((await buy('teacher',q)).orderId,order.orderId);
});

test('uncertain public publication retains overlap exclusion and final admin authorization',async()=>{
 await seed();const a=await service.saveOffer(request('admin',{offer:input(),requestId:'uncertain-public'}));failCoupon=true;
 await assert.rejects(service.publishOffer(request('admin',{offerId:a.offer.id,requestId:'publish-request-a'})));
 const b=await service.saveOffer(request('admin',{offer:input({percentOff:30}),requestId:'overlapping-public'}));
 await assert.rejects(service.publishOffer(request('admin',{offerId:b.offer.id,requestId:'publish-request-b'})),{code:'already-exists'});
 couponHook=async()=>db.doc('users/admin').update({role:'teacher'});
 await assert.rejects(service.publishOffer(request('admin',{offerId:a.offer.id,requestId:'publish-request-a'})),{code:'permission-denied'});
 assert.equal((await service.publicOffers()).offers.length,0);
});
test('a later lower quote never redirects to a previously bound full-price checkout or school invoice',async()=>{
 await seed();const original=await quote();await buy('teacher',original);await publish();
 await assert.rejects(buy('teacher',await quote()),{code:'failed-precondition'});
 assert.equal((await buy('teacher',original)).replayed,true);
 const school=await service.createSchool(request('admin',{name:'Quote binding school',ownerId:'teacher',seats:1,startDate:'2026-11-18',requestId:'school-quote-test'}));
 const qa=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId}));await publish({planCode:'school-yearly'},'school-other-terms');const qb=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId}));
 await service.schoolInvoice(request('teacher',{schoolId:school.schoolId,quoteId:qa.quote.id,requestId:'first-school'}));
 await assert.rejects(service.schoolInvoice(request('teacher',{schoolId:school.schoolId,quoteId:qb.quote.id,requestId:'second-school'})),{code:'failed-precondition'});
});
test('payments without offers enabled retain a server-confirmed standard-price purchase',async()=>{
 await seed();await db.doc('appConfig/billingProduct').update({'payments.offersReady':false});
 const q=await quote();assert.equal(q.quote.totalMinor,1500);assert.equal(q.quote.offer,null);await buy('teacher',q);
 await assert.rejects(quote('other',{code:'CREW20'}),{code:'failed-precondition'});
});
test('school code promotion expiry is fixed across a lost provider response',async()=>{
 await seed();await publish({planCode:'school-yearly',audience:'code',code:'SCHOOL20'});
 const school=await service.createSchool(request('admin',{name:'Code school',ownerId:'teacher',seats:1,startDate:'2026-11-18',requestId:'school-code-test'}));
 const q=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId,code:'SCHOOL20'}));let first;
 provider.createOfferPromotion=async data=>{if(!first){first=data;throw Error('lost');}assert.equal(data.reservationEndsAtMs,first.reservationEndsAtMs);return{promotionCodeId:'promo_school_fixed'};};
 const req=request('teacher',{schoolId:school.schoolId,quoteId:q.quote.id,requestId:'school-code-invoice'});
 await assert.rejects(service.schoolInvoice(req));time+=60000;await service.schoolInvoice(req);
 const call=calls.find(c=>c[0]==='school')[1];assert.equal(call.couponId,undefined);assert.equal(call.promotionCodeId,'promo_school_fixed');
});
test('lost Checkout response can expire authoritatively and release capacity without a local Checkout ID',async()=>{
 await seed();time+=345;const offer=await publish({maxRedemptions:1});const q=await quote();loseCheckout=true;await assert.rejects(buy('teacher',q));
 const session=[...sessions.values()][0];session.status='expired';time=session.expires_at*1000+1;
 await service.processStripeEvent({id:'evt_lost_expired',object:'event',livemode:false,type:'checkout.session.expired',data:{object:{id:session.id}}});
 assert.equal((await db.doc('billingV2Offers/'+offer.id).get()).data().reservedCount,0);
 await buy('teacher',await quote());
});
test('a never-created checkout releases its reservation after proof of absence and permits a fresh quote',async()=>{
 await seed();const offer=await publish({maxRedemptions:1}),q=await quote();const original=provider.createCustomer;
 provider.createCustomer=async data=>{time+=6*60000;return original(data);};
 await assert.rejects(buy('teacher',q),{code:'failed-precondition'});
 assert.equal(calls.some(c=>c[0]==='checkout'),false);
 assert.equal((await db.doc('billingV2Offers/'+offer.id).get()).data().reservedCount,0);
 provider.createCustomer=original;await buy('teacher',await quote());
});
test('a paid school agreement survives campaign end and the next expressly confirmed annual period',async()=>{
 await seed();const offer=await publish({planCode:'school-yearly',duration:'forever'});
 const school=await service.createSchool(request('admin',{name:'Continuing school',ownerId:'teacher',seats:1,startDate:'2026-11-18',requestId:'continuing-school'}));
 const first=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId}));
 const invoice=await service.schoolInvoice(request('teacher',{schoolId:school.schoolId,quoteId:first.quote.id,requestId:'year-one'}));
 const order=(await db.doc('billingV2Orders/'+invoice.orderId).get()).data();
 // Agreement is committed by authoritative payment, never by a price view alone.
 const coupon=coupons.get(order.offer.couponId),value={id:'in_school',object:'invoice',livemode:false,customer:order.customerId,currency:'eur',status:'paid',total:4000,amount_due:4000,amount_paid:4000,amount_remaining:0,created:time/1000,metadata:{gc_order_id:order.id},parent:null,lines:{has_more:false,data:[{object:'line_item',livemode:false,invoice:'in_school',currency:'eur',quantity:1,pricing:{type:'price_details',price_details:{price:order.priceId}},parent:{type:'invoice_item_details',invoice_item_details:{proration:false}},period:{start:order.startsAtMs/1000,end:order.endsAtMs/1000}}]},discounts:[{id:'di_school',object:'discount',customer:order.customerId,invoice:'in_school',start:time/1000,end:null,source:{type:'coupon',coupon}}],total_discount_amounts:[{amount:1000,discount:'di_school'}]};invoices.set(value.id,value);
 await service.processStripeEvent({id:'evt_school_agreement',object:'event',livemode:false,type:'invoice.paid',data:{object:{id:value.id}}});
 await service.endOffer(request('admin',{offerId:offer.id,requestId:'end-school-offer',reason:'Neue Einlösungen enden'}));
 const periodId='explicitly_confirmed_year_two';const period=(await db.doc('billingV2Periods/'+order.periodId).get()).data();
 await db.doc('billingV2Periods/'+periodId).set({...period,id:periodId,startsAtMs:period.endsAtMs,endsAtMs:period.endsAtMs+365*86400000,paymentStatus:'open',invoiceId:null,orderId:null});
 await db.doc('billingV2Schools/'+school.schoolId).update({currentPeriodId:periodId});time+=365*86400000;
 const next=await service.offerQuote(request('teacher',{planCode:'school-yearly',schoolId:school.schoolId}));assert.equal(next.quote.totalMinor,4000);
 await service.schoolInvoice(request('teacher',{schoolId:school.schoolId,quoteId:next.quote.id,requestId:'year-two'}));
 assert.equal((await db.doc('billingV2Offers/'+offer.id).get()).data().redemptionCount,1);
});

test('paid renewal recovers a lost scheduled amendment before invoice validation and grants exactly once',async()=>{
 await seed();const checkout=await buy('teacher',await quote()),order=(await db.doc('billingV2Orders/'+checkout.orderId).get()).data();
 const sub=subscriptions.get('sub_'+order.id);Object.assign(sub,{status:'active',currency:'eur',collection_method:'charge_automatically'});
 Object.assign(sub.items.data[0].price,{livemode:false,active:true,unit_amount:1500,currency:'eur',tax_behavior:'inclusive',recurring:{interval:'month',interval_count:1}});
 await db.doc('billingV2Orders/'+order.id).update({state:'paid',subscriptionId:sub.id});
 const offer=await publish({duration:'forever'}),promises=new Map();let lost=true;
 provider.scheduleOffer=async data=>{const result={scheduleId:'sched_renewal',effectiveAtMs:data.expectedPeriodEndMs,discountStartsAtMs:data.expectedPeriodEndMs,discountEndsAtMs:null};promises.set(data.amendmentId,result);await data.onSchedule(result.scheduleId);if(lost){lost=false;throw Error('reply lost after provider write');}return result;};
 provider.inspectOfferSchedule=async data=>{assert.equal(data.scheduleId,'sched_renewal');return promises.get(data.amendmentId);};
 const {preview}=await service.previewExistingOffer(request('admin',{offerId:offer.id,personIds:['teacher']}));
 const applied=await service.applyExistingOffer(request('admin',{previewId:preview.id,requestId:'renewal-amendment',reason:'Bestandsaktion bestätigt'}));assert.equal(applied.status,'pending');
 assert.equal((await db.doc('billingV2Orders/'+order.id).get()).data().offerChanges,undefined);
 const amendment=(await db.collection('billingV2OfferAmendments').get()).docs[0].data();
 const start=preview.subscriptions[0].effectiveAtMs/1000;time=start*1000+1000;sub.items.data[0].current_period_start=start;sub.items.data[0].current_period_end=start+30*86400;
 const event=await paid(order.id,0),invoice=invoices.get(event.data.object.id);invoice.id='in_AfterRollover';invoice.created=start;invoice.lines.data[0].invoice=invoice.id;invoice.lines.data[0].period={start,end:start+30*86400};invoice.total=invoice.amount_due=invoice.amount_paid=1200;
 invoice.discounts=[{id:'di_amended',object:'discount',customer:order.customerId,subscription:sub.id,start,end:null,source:{type:'coupon',coupon:coupons.get(amendment.couponId)}}];invoice.total_discount_amounts=[{discount:'di_amended',amount:300}];invoices.set(invoice.id,invoice);event.id='evt_amended_renewal';event.data.object.id=invoice.id;
 await service.processStripeEvent(event);await service.processStripeEvent(event);
 const saved=(await db.doc('billingV2Orders/'+order.id).get()).data();assert.equal(saved.offerChanges.length,1);assert.equal(saved.offerChanges[0].offer.couponId,amendment.couponId);
 assert.equal((await db.doc('billingV2Offers/'+offer.id).get()).data().redemptionCount,1);
 const grant=(await db.collection('billingV2Grants').get()).docs[0].data();assert.equal(grant.paidPeriods.length,1);assert.equal(grant.paidPeriods[0].endsAtMs,(start+30*86400)*1000);
 assert.equal((await service.getAccess(request('teacher'))).tier,'personal_premium');
});

test('a lost Checkout completion binds only its authoritative order and does not grant before invoice payment',async()=>{
 await seed();await publish();loseCheckout=true;await assert.rejects(buy('teacher',await quote()));const session=[...sessions.values()][0];session.status='complete';session.subscription='sub_'+session.metadata.gc_order_id;
 await service.processStripeEvent({id:'evt_lost_complete',object:'event',livemode:false,type:'checkout.session.completed',data:{object:{id:session.id}}});
 assert.notEqual((await service.getAccess(request('teacher'))).tier,'personal_premium');
 await service.processStripeEvent(await paid(session.metadata.gc_order_id,20));assert.equal((await service.getAccess(request('teacher'))).tier,'personal_premium');
});
test('an expired Checkout is reconciled on the next purchase even when its expiry webhook is delayed',async()=>{
 await seed();const offer=await publish({maxRedemptions:2}),old=await buy('teacher',await quote()),session=sessions.get('cs_'+old.orderId);session.status='expired';time=session.expires_at*1000+1;
 const fresh=await quote(),next=await buy('teacher',fresh);assert.notEqual(next.orderId,old.orderId);
 assert.equal((await db.doc('billingV2Orders/'+old.orderId).get()).data().state,'expired');assert.equal((await db.doc('billingV2Offers/'+offer.id).get()).data().reservedCount,1);
});
test('a refreshed identical price quote can resume the existing Checkout without changing the agreement',async()=>{
 await seed();await publish();const first=await buy('teacher',await quote()),fresh=await quote();
 const replay=await buy('teacher',fresh);assert.equal(replay.orderId,first.orderId);assert.equal(replay.replayed,true);
 assert.equal((await db.collection('billingV2Orders').get()).size,1);
});
