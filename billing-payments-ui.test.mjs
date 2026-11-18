import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createBillingClient} from './billing-client.mjs';
import {paintBillingPanel} from './billing-panel.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
test('returning from Stripe waits for authoritative paid access, with bounded retries',async()=>{
  let calls=0;
  const client=createBillingClient({getUid:()=> 'teacher',call:async()=>({tier:++calls<3?'free':'personal_premium',featureCodes:[],enforced:true})});
  const result=await client.refreshAfterPayment({wait:async()=>{},attempts:4});
  assert.equal(result.tier,'personal_premium');assert.equal(calls,3);
});
test('an unconfirmed payment cannot optimistically show Premium',async()=>{
  let calls=0;
  const client=createBillingClient({getUid:()=> 'teacher',call:async()=>{calls++;return{tier:'free',featureCodes:[],enforced:true};}});
  assert.equal((await client.refreshAfterPayment({wait:async()=>{},attempts:3})).tier,'free');assert.equal(calls,3);
});
test('account changes terminate payment-return polling',async()=>{
  let uid='teacher',calls=0;
  const client=createBillingClient({getUid:()=>uid,call:async()=>{calls++;return{tier:'free',featureCodes:[],enforced:true};}});
  const result=await client.refreshAfterPayment({wait:async()=>{uid='other';client.reset();},attempts:3});
  assert.equal(result,null);assert.equal(calls,1);
});
test('personal Premium shows its own invoice status and a management button instead of a second subscription',()=>{
  const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');let opened=0;
  paintBillingPanel(root,{tier:'personal_premium',featureCodes:[],purchasingEnabled:true,plans:[{code:'personal-monthly',interval:'month',currency:'eur',amountMinor:1500}],payments:{portalAvailable:true,hasSubscription:true,invoices:[{id:'in_paid',invoiceNumber:'GC-0001',total:1500,remaining:0,status:'paid'}]}},{onManage:()=>{opened++;}});
  const button=root.querySelector('[data-action=manage-subscription]');assert.ok(button);button.click();assert.equal(opened,1);
  assert.equal(root.textContent.includes('Monatsabo wählen'),false);assert.match(root.textContent,/GC-0001/);assert.equal(root.textContent.includes('in_paid'),false);assert.match(root.textContent,/Bezahlt/);
});
