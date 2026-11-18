import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(import.meta.url)('./tools/ui/node_modules/jsdom');
const student=fs.readFileSync('secure-student.js','utf8');
const solutions=fs.readFileSync('secure-solution-release.js','utf8').replace(/^import .*;\n/gm,'');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const waiting={solutionsConfigured:true,solutionsReleased:false,solutionReleaseMode:'exam_after_end',solutions:[{answer:'UNRELEASED_PRIVATE'}]};

for(const origin of ['https://gradecrew.de/','https://hausaufgabe-staging.web.app/','https://gradecrew-staging-2026.web.app/wilma/'])for(const lang of ['de','en']){
 test('saved receipt offers code entry without clearing its credentials: '+origin+lang,t=>{
  const dom=new JSDOM(fs.readFileSync('secure-student.html','utf8'),{url:origin+'secure-student.html?test=OLD12345&lang='+lang+'#old',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window,d=w.document;d.documentElement.lang=lang;
  w.localStorage.setItem('gradecrew_secure_assessment:v2:OLD12345','keep-own-receipt');let clears=0;
  Object.assign(w,{$:id=>d.getElementById(id),confirmationPending:null,clearTimers(){},clearDraft(){clears++;},showOnly(id){d.getElementById(id).classList.remove('hidden');},api:{clear(){assert.fail('A saved receipt must remain accessible');}}});
  w.eval(student.slice(student.indexOf('function showReceipt('),student.indexOf('\nasync function submitAssessment(')));
  w.showReceipt({totalPoints:1,maxPoints:2,percent:50,grade:4});
  const link=[...d.querySelectorAll('#secureResult a')].find(el=>el.textContent==='Neuen Test starten');assert.ok(link,'A visible new-test action must be part of the saved receipt');
  const target=new URL(link.href);assert.equal(target.origin,new URL(origin).origin);assert.equal(target.pathname,new URL('secure-student.html',origin).pathname);assert.equal(target.searchParams.has('test'),false);assert.equal(target.hash,'');assert.equal(target.searchParams.get('lang'),lang);
  assert.equal(w.localStorage.getItem('gradecrew_secure_assessment:v2:OLD12345'),'keep-own-receipt');assert.equal(clears,1);assert.match(d.querySelector('.secureResultScore').textContent,/1 \/ 2/);
 });
}
async function fixture(t){
 const dom=new JSDOM('<section id="secureResult"><h1>Abgabe gespeichert</h1></section>',{url:'https://example.test/secure-student.html?test=FAKE1234',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window;let calls=0,read=async()=>({receipt:waiting});
 Object.assign(w,{getApps:()=>[],initializeApp:()=>({}),firebaseConfig:{},createSecureAssessmentClient:()=>({getReceipt:async()=>{calls++;return read();}})});
 w.eval(solutions);await tick();await tick();
 return{w,doc:w.document,get calls(){return calls;},read(fn){read=fn;},tick,button(){return w.document.querySelector('.secureSolutionRelease button');},status(){return w.document.querySelector('[role=status]');}};
}
test('manual release check visibly reports unchanged locked state and never renders withheld answers',async t=>{
 const f=await fixture(t),before=f.calls;f.button().click();await f.tick();await f.tick();
 assert.match(f.status()?.textContent||'',/noch nicht freigegeben/i);assert.equal(f.doc.body.textContent.includes('UNRELEASED_PRIVATE'),false);assert.equal(f.calls-before,1);assert.equal(f.button().disabled,false);
});
test('manual release check shows loading and ignores double clicks while one request is running',async t=>{
 const f=await fixture(t);let finish;f.read(()=>new Promise(resolve=>finish=resolve));const before=f.calls,button=f.button();button.focus();button.click();button.click();
 assert.equal(button.disabled,true);assert.match(f.status()?.textContent||'',/geprüft/i);assert.equal(f.calls-before,1);
 finish({receipt:waiting});await f.tick();await f.tick();assert.equal(button.disabled,false);assert.equal(f.doc.activeElement,button);assert.match(f.status()?.textContent||'',/noch nicht freigegeben/i);
});
test('a manual check requested during an automatic read shares that read and reports its result',async t=>{
 const f=await fixture(t);let finish;f.read(()=>new Promise(resolve=>finish=resolve));const before=f.calls;
 const automatic=f.w.refreshReceipt();f.w.refreshReceipt({force:true});finish({receipt:waiting});await automatic;await f.tick();
 assert.equal(f.calls-before,1);assert.match(f.status()?.textContent||'',/noch nicht freigegeben/i);
});
test('released solutions become visible after an explicit check and keep the server gate',async t=>{
 const f=await fixture(t);f.read(async()=>({receipt:{...waiting,solutionsReleased:true,solutions:[{position:1,prompt:'Fiktive Frage',answer:'AUTHORIZED_ANSWER'}]}}));f.button().click();await f.tick();await f.tick();
 assert.match(f.doc.querySelector('.secureSolutionList')?.textContent||'',/AUTHORIZED_ANSWER/);assert.equal(f.doc.activeElement?.textContent,'Lösungen');
});
test('network failure gives feedback without removing the receipt or making a hidden answer visible',async t=>{
 const f=await fixture(t);f.read(async()=>{throw Object.assign(new Error('offline'),{code:'unavailable'});});f.button().click();await f.tick();await f.tick();
 assert.match(f.status()?.textContent||'',/nicht geprüft|nicht erreichbar/i);assert.equal(f.doc.querySelector('h1').textContent,'Abgabe gespeichert');assert.equal(f.button().disabled,false);assert.equal(f.doc.body.textContent.includes('UNRELEASED_PRIVATE'),false);
});
test('empty receipt response gives actionable feedback instead of a silent click',async t=>{
 const f=await fixture(t);f.read(async()=>({}));f.button().click();await f.tick();await f.tick();assert.match(f.status()?.textContent||'',/nicht geprüft|erneut/i);assert.equal(f.button().disabled,false);
});
