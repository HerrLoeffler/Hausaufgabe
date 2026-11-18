import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
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
});
