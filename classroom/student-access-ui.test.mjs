import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
const {JSDOM}=createRequire(import.meta.url)('../tools/ui/node_modules/jsdom');import {openStudentAccess} from './student-access-dialog.mjs';
const tick=()=>new Promise(r=>setTimeout(r,0));
test('access dialog issues only approved missing codes and opens an enabled printable preview',async()=>{
 const dom=new JSDOM('<body></body>',{url:'http://127.0.0.1:8782/'}),doc=dom.window.document;let active=false,calls=[];
 const row={studentId:'s',firstName:'Mila',lastName:'Muster',className:'8b',version:1,status:'active'};
 const client={request:async(command,payload)=>{calls.push({command,payload});if(command==='issue')active=true;if(command==='print')return {rows:[{...row,code:'7K4M9R2X'}]};return {rows:[{...row,status:active?'active':'missing'}],counts:{active:active?1:0,missing:active?0:1,blocked:0}};}};
 const view=openStudentAccess({document:doc,client,state:{contextId:'school',revision:1},students:[{id:'s',firstName:'Mila',lastName:'Muster'}],isCurrent:()=>true});
 try{
  await tick();assert.equal(doc.querySelector('[data-access-issue]').disabled,true);const check=doc.querySelector('[data-access-approval]');check.checked=true;check.dispatchEvent(new dom.window.Event('change'));doc.querySelector('[data-access-issue]').click();await tick();
  assert.equal(calls.filter(x=>x.command==='issue').length,1);assert.equal(doc.querySelector('[data-access-preview]').disabled,false);doc.querySelector('[data-access-preview]').click();await tick();
  assert.equal(doc.querySelector('[data-access-print]').disabled,false);assert.match(doc.querySelector('[data-access-pages]').textContent,/1 Personen.*1 Seite/);assert.match(doc.querySelector('iframe').srcdoc,/7K4M9R2X/);
 }finally{view.destroy();dom.window.close();}
});
test('student entry uses a separate dialog and shows its own empty account without modifying the teacher login',async()=>{
 let module;try{module=await import('./student-portal.mjs');}catch{}assert.ok(module?.installStudentPortal,'student portal exists');
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document,original=doc.getElementById('loginForm');let logged=false,requests=[];
 const fetchImpl=async(url,init)=>{requests.push({url,init});if(url.endsWith('/login'))logged=true;if(url.endsWith('/logout'))logged=false;return {ok:logged||url.endsWith('/logout'),status:logged?200:401,json:async()=>logged?{student:{firstName:'Mila',className:'8b'},school:{name:'Schule'},assignments:[]}: {error:{message:'Bitte anmelden.'}}};};
 const ui=module.installStudentPortal({document:doc,fetchImpl});try{
  doc.querySelector('[data-student-access-open]').click();await tick();doc.querySelector('[data-student-access-code]').value='7K4M9R2X';doc.querySelector('[data-student-access-form]').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.match(doc.querySelector('[data-student-portal]').textContent,/Mila/);assert.match(doc.querySelector('[data-student-portal]').textContent,/keine Tests zugewiesen/);assert.equal(doc.getElementById('loginForm'),original);
  assert.ok(requests.every(x=>!x.init.headers?.Authorization));assert.equal(requests.find(x=>x.url.endsWith('/login')).init.credentials,'same-origin');
 }finally{ui.destroy();dom.window.close();}
});
test('pupil entry defaults to shared device, permits explicit personal choice and keeps logout visible without exercise UI',async()=>{
 const {installStudentPortal}=await import('./student-portal.mjs');const dom=new JSDOM('<form id="joinForm"></form><form id="loginForm"></form>',{url:'http://127.0.0.1:8782/'});let body=null,logged=false;
 const fetchImpl=async(url,init)=>{if(url.endsWith('/login')){body=JSON.parse(init.body);logged=true;}if(url.endsWith('/logout'))logged=false;return {ok:logged||url.endsWith('/logout'),status:logged?200:401,json:async()=>logged?{student:{firstName:'Mila',className:'8b'},school:{name:'Schule'},session:{deviceMode:body.deviceMode},assignments:[]}:{error:{message:'Bitte anmelden.'}}};};
 const ui=installStudentPortal({document:dom.window.document,fetchImpl});try{ui.open();await tick();const doc=dom.window.document;assert.equal(doc.querySelector('[data-student-device-mode]').value,'shared');doc.querySelector('[data-student-device-mode]').value='personal';doc.querySelector('[data-student-access-code]').value='7K4M9R2X';doc.querySelector('form[data-student-access-form]').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert.equal(body.deviceMode,'personal');assert.match(doc.querySelector('dialog').textContent,/Persönliches Gerät/);assert.match(doc.querySelector('dialog').textContent,/Abmelden.*Person wechseln/);assert.doesNotMatch(doc.querySelector('dialog').textContent,/Üben/);assert.ok(doc.getElementById('loginForm'));}finally{ui.destroy();dom.window.close();}
});
test('shared-device expiry removes the former pupil view and offers code entry again',async()=>{
 const {installStudentPortal}=await import('./student-portal.mjs');const dom=new JSDOM('<form id="joinForm"></form>',{url:'http://127.0.0.1:8782/'});let tickSession,locked=false;
 dom.window.setInterval=fn=>{tickSession=fn;return 1;};dom.window.clearInterval=()=>{};
 const fetchImpl=async()=>({ok:!locked,status:locked?401:200,json:async()=>locked?{error:{message:'Gerät gesperrt. Bitte erneut anmelden.'}}:{student:{firstName:'Mila',className:'8b'},school:{name:'Schule'},session:{deviceMode:'shared'},assignments:[]}});
 const ui=installStudentPortal({document:dom.window.document,fetchImpl});try{ui.open();await tick();assert.match(dom.window.document.querySelector('dialog').textContent,/Mila/);locked=true;tickSession();await tick();const text=dom.window.document.querySelector('dialog').textContent;assert.doesNotMatch(text,/Hallo Mila/);assert.match(text,/Gerät gesperrt/);assert.ok(dom.window.document.querySelector('[data-student-access-code]'));}finally{ui.destroy();dom.window.close();}
});
test('a different pupil cookie in another tab cannot leave the previous name on screen',async()=>{
 const {installStudentPortal}=await import('./student-portal.mjs');const dom=new JSDOM('<form id="joinForm"></form>',{url:'http://127.0.0.1:8782/'});let poll,id='mila';dom.window.setInterval=fn=>{poll=fn;return 1;};dom.window.clearInterval=()=>{};
 const fetchImpl=async()=>({ok:true,status:200,json:async()=>({student:{id,firstName:id==='mila'?'Mila':'Ben',className:'8b'},school:{id:'school',name:'Schule'},session:{deviceMode:'shared'},assignments:[]})});const ui=installStudentPortal({document:dom.window.document,fetchImpl});try{ui.open();await tick();assert.match(dom.window.document.querySelector('dialog').textContent,/Hallo Mila/);id='ben';poll();await tick();assert.doesNotMatch(dom.window.document.querySelector('dialog').textContent,/Hallo Mila/);assert.ok(dom.window.document.querySelector('[data-student-access-code]'));}finally{ui.destroy();dom.window.close();}
});
