import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
test('school billing exposes its invoice only to authorized billing roles',async()=>{
  const {mountSchoolPanel}=await import('./billing-school-panel.mjs');
  const dom=new JSDOM('<main></main>',{url:'https://gradecrew-staging-2026--billing-product-test.web.app/'}),calls=[];
  const client={request:async(action,data)=>{calls.push({action,data});if(action==='listSchools')return{schools:[{id:'school',name:'School'}]};if(action==='offerQuote')return{quote:{id:'q',planCode:'school-yearly',quantity:1,baseAmountMinor:5000,discountAmountMinor:0,totalMinor:5000,expiresAtMs:Date.now()+300000}};if(action==='schoolInvoice')return{invoiceId:'in_school',url:'https://invoice.stripe.com/i/test'};return{school:{id:'school',name:'School',seats:1,usedSeats:1,reservedSeats:0},period:{paymentStatus:'open',amountMinor:5000,remainingMinor:2000},canBill:true,canManage:false,paymentsEnabled:true,myRole:'billing'};}};
  await mountSchoolPanel(dom.window.document.querySelector('main'),{client,uid:'teacher'});
  dom.window.document.querySelector('[data-school=school]').click();await new Promise(r=>setTimeout(r,0));
  assert.equal(dom.window.document.querySelector('[data-action=quote-school-invoice]'),null,'part-paid invoice must preserve its agreed amount');
  const button=dom.window.document.querySelector('[data-action=school-invoice]');assert.ok(button);
  button.click();await new Promise(r=>setTimeout(r,0));
  assert.equal(calls.filter(c=>c.action==='schoolInvoice').length,1);assert.equal(calls.some(c=>c.action==='offerQuote'),false);assert.match(dom.window.document.querySelector('[data-action=open-school-invoice]').href,/invoice.stripe.com/);
  assert.match(dom.window.document.body.textContent,/20,00/);
});
test('school panel accepts only a reviewed invitation for the current account',async()=>{
  const {mountSchoolPanel}=await import('./billing-school-panel.mjs');
  const dom=new JSDOM('<main></main>',{url:'http://localhost:8176/'}),calls=[];
  const client={request:async(action,data)=>{calls.push({action,data});if(action==='listSchools')return{schools:[],canCreate:false};if(action==='previewSchoolInvitation')return{schoolName:'Synthetic school',role:'teacher',paymentStatus:'paid'};return{};},refresh:async()=>{}};
  await mountSchoolPanel(dom.window.document.querySelector('main'),{client,uid:'teacher'});
  const field=dom.window.document.querySelector('[name=invitation]');field.value='a'.repeat(64)+'.'+'b'.repeat(43);
  dom.window.document.querySelector('[data-action=preview]').click();await new Promise(r=>setTimeout(r,0));
  assert.equal(calls.filter(c=>c.action==='acceptSchoolInvitation').length,0);
  assert.match(dom.window.document.body.textContent,/Synthetic school/);
  dom.window.document.querySelector('[data-action=accept]').click();await new Promise(r=>setTimeout(r,0));
  assert.equal(calls.filter(c=>c.action==='acceptSchoolInvitation').length,1);
});
test('ordinary school members see status without invitations, member list or finances',async()=>{
  const {mountSchoolPanel}=await import('./billing-school-panel.mjs');
  const dom=new JSDOM('<main></main>',{url:'http://localhost:8176/'});
  const client={request:async action=>action==='listSchools'?{schools:[{id:'school',name:'School'}]}:{school:{id:'school',name:'School',seats:2,usedSeats:2,reservedSeats:0},period:{paymentStatus:'open',endsAtMs:Date.now()+86400000},canManage:false,canBill:false,myRole:'teacher'}};
  await mountSchoolPanel(dom.window.document.querySelector('main'),{client,uid:'teacher'});
  dom.window.document.querySelector('[data-school=school]').click();await new Promise(r=>setTimeout(r,0));
  assert.match(dom.window.document.body.textContent,/Zahlung offen/);
  assert.equal(dom.window.document.querySelector('[name=email]'),null);
  assert.equal(dom.window.document.querySelector('[data-action=create-school]'),null);
  assert.ok(dom.window.document.querySelector('[data-action=leave-school]'));
});

test('school invoice creation requires a server quote and forwards no client price or quantity',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');const dom=new JSDOM('<main></main>',{url:'https://test.example/workspace.html'}),root=dom.window.document.querySelector('main'),calls=[];
 const client={request:async(action,data)=>{calls.push({action,data});if(action==='listSchools')return{schools:[{id:'school',name:'Schule'}]};if(action==='offerQuote')return{eligible:true,quote:{id:'school-quote',planCode:'school-yearly',quantity:20,unitAmount:5000,baseAmountMinor:100000,discountAmountMinor:20000,totalMinor:80000,expiresAtMs:Date.now()+300000,offer:{title:'Schulangebot',fixedBasis:'seat',duration:'once'}}};if(action==='schoolInvoice')return{url:'https://invoice.stripe.com/i/test'};return{school:{id:'school',name:'Schule',seats:20,usedSeats:10,reservedSeats:0},period:{paymentStatus:'open',amountMinor:100000},canBill:true,canManage:false,paymentsEnabled:true};}};
 await mountSchoolPanel(root,{client});root.querySelector('[data-school=school]').click();await new Promise(r=>setTimeout(r,0));const review=root.querySelector('[data-action=quote-school-invoice]');assert.ok(review,'school invoice needs a separate quote review');review.click();await new Promise(r=>setTimeout(r,0));assert.deepEqual(calls.find(c=>c.action==='offerQuote').data,{planCode:'school-yearly',schoolId:'school'});assert.match(root.textContent,/800/);assert.match(root.textContent,/20 Plätze/);assert.equal(calls.some(c=>c.action==='schoolInvoice'),false);root.querySelector('[data-action=school-invoice]').click();await new Promise(r=>setTimeout(r,0));const purchase=calls.find(c=>c.action==='schoolInvoice').data;assert.equal(purchase.quoteId,'school-quote');assert.equal(purchase.quantity,undefined);assert.equal(purchase.amountMinor,undefined);
});
test('school code and invitation are distinct collapsed join options',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');await mountSchoolPanel(root,{client:{request:async()=>({schools:[]})}});const code=root.querySelector('[name=schoolCode]').closest('details'),invite=root.querySelector('[name=invitation]').closest('details');assert.ok(code);assert.notEqual(code,invite);assert.equal(code.open,false);assert.equal(invite.open,false);
});
test('editing an invitation invalidates a slow old preview',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');let finish;await mountSchoolPanel(root,{client:{request:async action=>action==='listSchools'?{schools:[]}:new Promise(resolve=>{finish=resolve;})}});const input=root.querySelector('[name=invitation]');input.value='a'.repeat(64)+'.'+'b'.repeat(43);root.querySelector('[data-action=preview]').click();input.value='changed';input.dispatchEvent(new dom.window.Event('input'));finish({schoolName:'Obsolete school',role:'teacher'});await new Promise(r=>setTimeout(r,0));assert.doesNotMatch(root.textContent,/Obsolete school/);assert.equal(root.querySelector('[data-action=accept]'),null);
});
