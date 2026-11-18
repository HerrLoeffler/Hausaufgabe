import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
const tick=()=>new Promise(r=>setTimeout(r,0));
const code='ABCD-1234-EFAB-5678-ABCD-1234-EFAB-5678';
test('school code is reviewed before joining and uses the same normal-account client',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');
 const dom=new JSDOM('<main></main>',{url:'http://localhost:8188/'}),calls=[];
 await mountSchoolPanel(dom.window.document.querySelector('main'),{uid:'teacher',client:{request:async(action,data)=>{calls.push({action,data});if(action==='listSchools')return{schools:[]};if(action==='previewSchoolJoinCode')return{schoolId:'school',schoolName:'Testschule mit langem Namen'};return{schoolId:'school'};},refresh:async()=>{}}});
 const input=dom.window.document.querySelector('[name=schoolCode]');assert.ok(input);input.value=code;
 dom.window.document.querySelector('[data-action=preview-school-code]').click();await tick();assert.match(dom.window.document.body.textContent,/Testschule mit langem Namen/);
 assert.equal(calls.some(c=>c.action==='redeemSchoolJoinCode'),false);
 dom.window.document.querySelector('[data-action=join-school-code]').click();await tick();
 assert.deepEqual(calls.find(c=>c.action==='redeemSchoolJoinCode').data,{code});
 assert.match(dom.window.document.body.textContent,/zugeordnet/);
});
test('editing the school code discards a slow old preview and prevents joining the wrong school',async()=>{
 const {mountSchoolJoinCodeForm}=await import('./school-join-code-panel.mjs');
 const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');let done;
 mountSchoolJoinCodeForm(root,{client:{request:async()=>new Promise(r=>{done=r;})}});
 const input=root.querySelector('input');input.value=code;root.querySelector('button').click();await tick();
 input.value='1234';input.dispatchEvent(new dom.window.Event('input'));done({schoolName:'Wrong old school'});await tick();
 assert.equal(root.querySelector('[data-action=join-school-code]'),null);assert.doesNotMatch(root.textContent,/Wrong old school/);
});
test('admin can issue and revoke a school code while ordinary members cannot see management',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');
 const dom=new JSDOM('<main></main>',{url:'http://localhost:8188/'}),root=dom.window.document.querySelector('main'),calls=[];dom.window.confirm=()=>true;
 let canManage=true;
 const client={request:async(action,data)=>{calls.push({action,data});if(action==='listSchools')return{schools:[{id:'school',name:'Schule'}]};if(action==='getSchool')return{school:{id:'school',name:'Schule',seats:40,usedSeats:1,reservedSeats:0},canManage,canBill:false,myRole:canManage?'school_admin':'teacher',members:[]};if(action==='createSchoolJoinCode')return{code,codeId:'code-id',expiresAtMs:Date.now()+86400000};return{revoked:true};}};
 await mountSchoolPanel(root,{client,uid:'teacher'});root.querySelector('[data-school]').click();await tick();
 root.querySelector('[data-action=create-school-code]').click();await tick();assert.equal(root.querySelector('[name=generatedSchoolCode]').value,code);
 root.querySelector('[data-action=revoke-school-code]').click();await tick();assert.deepEqual(calls.find(c=>c.action==='revokeSchoolJoinCode').data,{schoolId:'school',codeId:'code-id'});
 assert.equal(root.querySelector('[name=generatedSchoolCode]'),null);
 canManage=false;await mountSchoolPanel(root,{client,uid:'teacher'});root.querySelector('[data-school]').click();await tick();assert.equal(root.querySelector('[data-action=create-school-code]'),null);
});
test('a pending join cannot be submitted twice and a failed request leaves a clear retry',async()=>{
 const {mountSchoolJoinCodeForm}=await import('./school-join-code-panel.mjs');
 const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');let count=0,done;
 mountSchoolJoinCodeForm(root,{client:{request:async action=>action==='previewSchoolJoinCode'?{schoolName:'Testschule'}:(count++,new Promise((_,reject)=>{done=reject;}))}});
 root.querySelector('input').value=code;root.querySelector('button').click();await tick();const join=root.querySelector('[data-action=join-school-code]');join.click();join.click();assert.equal(count,1);
 done(new Error('Alle Lehrkraftplätze sind belegt.'));await tick();assert.match(root.textContent,/belegt/);assert.equal(join.disabled,false);
});
test('the school-code form shows a failed preview once, without a duplicate page-level error',async()=>{
 const {mountSchoolPanel}=await import('./billing-school-panel.mjs');const dom=new JSDOM('<main></main>',{url:'http://localhost:8188/'}),root=dom.window.document.querySelector('main');
 await mountSchoolPanel(root,{uid:'teacher',client:{request:async action=>{if(action==='listSchools')return{schools:[]};throw new Error('Keine Plätze verfügbar.');}}});
 root.querySelector('[name=schoolCode]').value=code;root.querySelector('[data-action=preview-school-code]').click();await tick();assert.equal(root.textContent.split('Keine Plätze verfügbar.').length-1,1);
});
