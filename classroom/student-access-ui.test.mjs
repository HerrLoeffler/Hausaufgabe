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
