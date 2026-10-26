import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const html=fs.readFileSync('secure-student.html','utf8');
const source=fs.readFileSync('secure-student.js','utf8').replace(/^import .*;\n/gm,'');
function runtime(t,search='',api={},handoff=null){
 const dom=new JSDOM(html,{url:'https://gradecrew.de/secure-student.html'+search});t.after(()=>dom.window.close());
 const w=dom.window, calls=[];
 if(handoff)w.sessionStorage.setItem("gradecrew.studentEntry.v1",JSON.stringify(handoff));
 w.localStorage.setItem("firebase:authUser:teacher","synthetic-teacher-session");
 // A real DOM with transport-only doubles; no Firebase auth or data APIs supplied.
 const location={search,href:'https://gradecrew.de/secure-student.html'+search,reload(){calls.push('reload')}};
 const context={document:w.document,sessionStorage:w.sessionStorage,location,URL,URLSearchParams,navigator:{onLine:true},initializeApp:()=>({}),firebaseConfig:{},createSecureAssessmentClient:()=>({getInfo:async code=>{calls.push(code);throw new Error('synthetic unavailable')},...api}),addEventListener:w.addEventListener.bind(w),setInterval:()=>1,clearInterval(){},console};
 vm.runInNewContext(source,context);return {w,d:w.document,location,calls,context};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('only the header exposes the direct isolated student route',()=>{
 const d=new JSDOM(fs.readFileSync('homepage/index.html','utf8')).window.document;
 const links=[...d.querySelectorAll('a[data-i18n="studentEntry"]')];
 assert.equal(links.length,1);for(const a of links)assert.equal(a.getAttribute('href'),'/secure-student.html');
 assert.ok(d.querySelector('.site-header a[data-i18n="studentEntry"]'));
 assert.equal(d.querySelector('.public-links a[data-i18n="studentEntry"]'),null);
});
test('code-free pupil entry stays public and never touches an existing teacher session',async t=>{
 const r=runtime(t);await flush();
 assert.equal(r.d.getElementById('secureJoin').classList.contains('hidden'),false);assert.equal(r.d.body.classList.contains('secureEntryMode'),true);
 assert.equal(r.d.getElementById('secureError').classList.contains('hidden'),true);
 assert.deepEqual(r.calls,[]);
 assert.equal(r.w.localStorage.getItem('firebase:authUser:teacher'),'synthetic-teacher-session');
});
test('blank and short codes stay in the form; formatted code opens only the secure route',async t=>{
 const r=runtime(t);await flush();const form=r.d.getElementById('secureJoinForm'),input=r.d.getElementById('secureJoinCode');
 assert.ok(form);r.d.getElementById('secureJoinName').value='SYN-01';for(const code of ['', 'A']){input.value=code;form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(new URL(r.location.href).search,'');assert.ok(r.d.getElementById('secureJoinError').textContent);}
 input.value='ab12 cd34';form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(r.location.href,'https://gradecrew.de/secure-student.html?test=AB12CD34');assert.deepEqual(r.calls,[]);
});
test('direct invalid URL does not call public info and offers code correction',async t=>{
 const r=runtime(t,'?test=A');await flush();assert.deepEqual(r.calls,[]);assert.equal(r.d.getElementById('secureError').classList.contains('hidden'),false);assert.ok(r.d.querySelector('#secureError a[href="./secure-student.html"]'));
});
test('valid synthetic info opens alias form without starting any attempt; alias restored for same test',async t=>{
 let starts=0;const r=runtime(t,'?test=AB12CD34',{getInfo:async()=>({quiz:{title:'SYSTEMTEST',questionCount:1,totalPoints:1}}),readSession:()=>({studentName:'SYN-01'}),start:async()=>{starts++}});await flush();
 assert.equal(r.d.getElementById('secureIntro').classList.contains('hidden'),false);assert.equal(r.d.body.classList.contains('secureEntryMode'),false);assert.equal(r.d.getElementById('secureStudentName').value,'SYN-01');assert.equal(starts,0);
});
test('failed start keeps the alias and exposes a retry of the intro instead of clearing it',async t=>{
 const r=runtime(t,'?test=AB12CD34',{getInfo:async()=>({quiz:{title:'SYSTEMTEST'}}),readSession:()=>null,start:async()=>{throw new Error('synthetic offline')}});await flush();r.d.getElementById('secureStudentName').value='SYN-02';
 r.d.getElementById('secureStartForm').dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));await flush();
 const retry=[...r.d.querySelectorAll('#secureError button')].find(x=>/Zurück zur Eingabe/.test(x.textContent));assert.ok(retry);retry.click();assert.equal(r.d.getElementById('secureIntro').classList.contains('hidden'),false);assert.equal(r.d.getElementById('secureStudentName').value,'SYN-02');assert.deepEqual(r.calls,[]);
});
test('a failed request preserves the alias in the existing attempt record for reload, isolated by test',async()=>{
 const store=new Map([['firebase:authUser:teacher','unchanged']]);
 const ctx={getFunctions:()=>({}),httpsCallable:()=>async()=>{throw new Error('offline')},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},crypto:{getRandomValues:a=>a.fill(7)},btoa:s=>Buffer.from(s,'binary').toString('base64')};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('secure-assessment-client.js','utf8').replace(/^import .*;\n/gm,'').replace('export function createSecureAssessmentClient','function createSecureAssessmentClient')+'\nthis.client=createSecureAssessmentClient({});',ctx);
 await assert.rejects(()=>ctx.client.start('AB12CD34','SYN-03'));
 assert.equal(ctx.client.readSession('AB12CD34').studentName,'SYN-03');assert.equal(ctx.client.readSession('OTHER123'),null);assert.equal(store.get('firebase:authUser:teacher'),'unchanged');
});
test('the old workspace route actually selects teacher dashboard when authenticated and auth surface otherwise',async()=>{
 const app=fs.readFileSync('app.js','utf8');const start=app.indexOf('  const params = new URLSearchParams(location.search);',app.indexOf('onAuthStateChanged(auth'));
 const end=app.indexOf('// ---------- Dashboard ----------',start);const body=app.slice(start,end).replace(/\}\);\s*$/,'');
 for(const user of [null,{uid:'synthetic-teacher'}]){
  const seen=[];const ctx={URLSearchParams,location:{search:''},normalizeTemplateCode:()=>'',sessionStorage:{getItem:()=>null},PENDING_TEMPLATE_KEY:'unused',$:()=>null,loadDashboard:async()=>seen.push('dashboard'),showView:view=>seen.push(view),user};vm.createContext(ctx);await vm.runInContext('(async(user)=>{'+body+'})(user)',ctx);assert.deepEqual(seen,[user?'dashboard':'authView']);
 }
});
test('direct lowercase or formatted old links retain the existing draft key after normalization at API boundary',async t=>{
 for(const raw of ['ab12cd34','ab12-cd34']){
  const r=runtime(t,'?test='+raw);await flush();vm.runInContext('currentAttempt={attemptId:"owned-attempt"};',r.context);
  // The existing companion restores its volatile draft with the raw URL code.
  const restoredKey=`gradecrew_secure_answers:v1:${raw}:owned-attempt`;
  assert.equal(vm.runInContext('draftKey()',r.context),restoredKey);
 }
});


test('entry requires an alias, passes it for one test, and never places it in the URL or starts an attempt', async t=>{
 const r=runtime(t);await flush();const form=r.d.getElementById('secureJoinForm');r.d.getElementById('secureJoinCode').value='ab12 cd34';
 form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(new URL(r.location.href).search,'');
 assert.ok(r.d.getElementById('secureJoinError').textContent);r.d.getElementById('secureJoinName').value='  SYN-ALIAS  ';
 form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(r.location.href,'https://gradecrew.de/secure-student.html?test=AB12CD34');
 assert.equal(JSON.parse(r.w.sessionStorage.getItem('gradecrew.studentEntry.v1')).studentName,'SYN-ALIAS');assert.deepEqual(r.calls,[]);
});

test('entry alias is consumed once for its test, expires, and cannot replace an owned attempt identity',async t=>{
 for(const [saved,owned,want] of [
  [{quizId:'AB12CD34',studentName:'SYN-NEW',expiresAt:Date.now()+60000},null,'SYN-NEW'],
  [{quizId:'AB12CD34',studentName:'SYN-NEW',expiresAt:Date.now()+60000},{studentName:'SYN-FAILED'},'SYN-NEW'],
  [{quizId:'OTHER123',studentName:'SYN-OTHER',expiresAt:Date.now()+60000},null,''],
  [{quizId:'AB12CD34',studentName:'SYN-OLD',expiresAt:Date.now()-1000},null,''],
  [{quizId:'AB12CD34',studentName:'SYN-NEW',expiresAt:Date.now()+60000},{attemptId:'owned',studentName:'SYN-OWNER'},'SYN-OWNER']
 ]){
  const r=runtime(t,'?test=AB12CD34',{getInfo:async()=>({quiz:{title:'SYSTEMTEST'}}),readSession:()=>owned,resume:async()=>({status:'running',attempt:owned,questions:[]})},saved);await flush();
  assert.equal(r.d.getElementById('secureStudentName').value,want);assert.equal(r.w.sessionStorage.getItem('gradecrew.studentEntry.v1'),null);
 }
});

test('the one-time student handoff preserves English UI without putting the alias in the address',async t=>{
 const r=runtime(t);await flush();r.d.documentElement.lang='en-GB';r.d.getElementById('secureJoinCode').value='AB12CD34';r.d.getElementById('secureJoinName').value='SYN-EN';r.d.getElementById('secureJoinForm').dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));
 const u=new URL(r.location.href);assert.equal(u.searchParams.get('lang'),'en');assert.equal(u.searchParams.get('test'),'AB12CD34');assert.equal(u.href.includes('SYN-EN'),false);
});


test('an anonymous plain workspace returns to the public homepage while account and tutorial routes stay intact',async()=>{
 const app=fs.readFileSync('app.js','utf8'),start=app.indexOf('  const params = new URLSearchParams(location.search);',app.indexOf('onAuthStateChanged(auth')),end=app.indexOf('// ---------- Dashboard ----------',start),body=app.slice(start,end).replace(/\}\);\s*$/,'');
 for(const [search,user,expected] of [['',null,'https://gradecrew.de/'],['?lang=en',null,'https://gradecrew.de/?lang=en'],['',{uid:'synthetic'},'dashboard'],['?intent=login',null,'authView'],['?firstGuide=1',null,'authView']]){
 const seen=[],ctx={URL,URLSearchParams,location:{search,pathname:'/workspace.html',href:'https://gradecrew.de/workspace.html'+search,replace:v=>seen.push(v)},document:{documentElement:{lang:'de'}},normalizeTemplateCode:()=>'',sessionStorage:{getItem:()=>null},PENDING_TEMPLATE_KEY:'unused',$:()=>null,loadDashboard:async()=>seen.push('dashboard'),showView:v=>seen.push(v),user};vm.createContext(ctx);await vm.runInContext('(async(user)=>{'+body+'})(user)',ctx);assert.deepEqual(seen,[expected]);
 }
});


test('both student homepage links keep the current UI language after switching languages',async t=>{
 const r=runtime(t);await flush();
 for(const [lang,expected] of [['en-GB','en'],['de-DE',null]]){r.d.documentElement.lang=lang;r.w.dispatchEvent(new r.w.Event('gradecrew:ui-locale-changed'));for(const link of r.d.querySelectorAll('.secureBrand,.secureEntryBack')){const u=new URL(link.href);assert.equal(u.pathname,'/');assert.equal(u.searchParams.get('lang'),expected);}}
});
