import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const html=fs.readFileSync('secure-student.html','utf8');
const source=fs.readFileSync('secure-student.js','utf8').replace(/^import .*;\n/gm,'');
function runtime(t,search='',api={}){
 const dom=new JSDOM(html,{url:'https://gradecrew.de/secure-student.html'+search});t.after(()=>dom.window.close());
 const w=dom.window, calls=[];
 // A real DOM with transport-only doubles; no Firebase auth or data APIs supplied.
 const location={search,href:'https://gradecrew.de/secure-student.html'+search,reload(){calls.push('reload')}};
 const context={document:w.document,location,URL,URLSearchParams,navigator:{onLine:true},initializeApp:()=>({}),firebaseConfig:{},createSecureAssessmentClient:()=>({getInfo:async code=>{calls.push(code);throw new Error('synthetic unavailable')},...api}),addEventListener:()=>{},setInterval:()=>1,clearInterval(){},console};
 vm.runInNewContext(source,context);return {w,d:w.document,location,calls,context};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('both homepage student links use the isolated current browser route',()=>{
 const d=new JSDOM(fs.readFileSync('homepage/index.html','utf8')).window.document;
 const links=[...d.querySelectorAll('a[data-i18n="studentEntry"]')];
 assert.equal(links.length,2);for(const a of links)assert.equal(a.getAttribute('href'),'/secure-student.html');
 assert.ok(d.querySelector('.header-actions a[data-i18n="studentEntry"]'));
 assert.ok(d.querySelector('.public-links a[data-i18n="studentEntry"]'));
});
test('code-free pupil entry stays public and never touches an existing teacher session',async t=>{
 const r=runtime(t);r.w.localStorage.setItem('firebase:authUser:teacher','synthetic-teacher-session');await flush();
 assert.equal(r.d.getElementById('secureJoin').classList.contains('hidden'),false);
 assert.equal(r.d.getElementById('secureError').classList.contains('hidden'),true);
 assert.deepEqual(r.calls,[]);
 assert.equal(r.w.localStorage.getItem('firebase:authUser:teacher'),'synthetic-teacher-session');
});
test('blank and short codes stay in the form; formatted code opens only the secure route',async t=>{
 const r=runtime(t);await flush();const form=r.d.getElementById('secureJoinForm'),input=r.d.getElementById('secureJoinCode');
 assert.ok(form);for(const code of ['', 'A']){input.value=code;form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(new URL(r.location.href).search,'');assert.ok(r.d.getElementById('secureJoinError').textContent);}
 input.value='ab12 cd34';form.dispatchEvent(new r.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(r.location.href,'https://gradecrew.de/secure-student.html?test=AB12CD34');assert.deepEqual(r.calls,[]);
});
test('direct invalid URL does not call public info and offers code correction',async t=>{
 const r=runtime(t,'?test=A');await flush();assert.deepEqual(r.calls,[]);assert.equal(r.d.getElementById('secureError').classList.contains('hidden'),false);assert.ok(r.d.querySelector('#secureError a[href="./secure-student.html"]'));
});
test('valid synthetic info opens alias form without starting any attempt; alias restored for same test',async t=>{
 let starts=0;const r=runtime(t,'?test=AB12CD34',{getInfo:async()=>({quiz:{title:'SYSTEMTEST',questionCount:1,totalPoints:1}}),readSession:()=>({studentName:'SYN-01'}),start:async()=>{starts++}});await flush();
 assert.equal(r.d.getElementById('secureIntro').classList.contains('hidden'),false);assert.equal(r.d.getElementById('secureStudentName').value,'SYN-01');assert.equal(starts,0);
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
