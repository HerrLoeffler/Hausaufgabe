import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
const {JSDOM}=createRequire(import.meta.url)('../tools/ui/node_modules/jsdom');
import {installAccountWorkspace} from './account-workspace.mjs';import {openLocalRoster} from '../tools/classroom-preview/local-roster-store.mjs';
const tick=()=>new Promise(r=>setTimeout(r,0));
test('school setup preview, account invitation and self class selection use original shell and preserve quizzes',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document,store=openLocalRoster(':memory:');
 let uid='a',listener,visible='dashboardView';
 store.mutate('a',{command:'createClass',payload:{name:'8b',schoolYear:'2026/27'},expectedRevision:0,operationId:crypto.randomUUID()});
 const dashboard=doc.getElementById('dashboardView'),login=doc.getElementById('loginForm');
 const port={getSession:()=>uid?{uid,displayName:`Person ${uid}`}:null,listTests:()=>[{id:'MY-QUIZ',grade:'8b',title:'Mein vorhandener Test'}],currentView:()=>visible,registerView(){},showView:id=>{visible=id;},showTests:()=>{visible='dashboardView';},subscribe:f=>(listener=f,()=>{})};
 const client={read:async()=>store.read(uid),mutate:async(command,payload,expectedRevision,operationId)=>store.mutate(uid,{command,payload,expectedRevision,operationId,contextId:store.read(uid).contextId})};
 const schoolClient={read:async()=>store.school.read(uid),previewSetup:async p=>store.school.previewSetup(uid,p),command:async(command,payload,state)=>store.school.command(uid,{command,payload,expectedRevision:state.revision,operationId:crypto.randomUUID(),contextId:state.currentSchool?.id||null})};
 const shell=installAccountWorkspace({document:doc,port,client,schoolClient});
 const submit=selector=>doc.querySelector(selector).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 try{
  await tick();assert.ok(doc.querySelector('[data-account-nav=school]'),'school section is additive to original navigation');doc.querySelector('[data-account-nav=school]').click();
  let form=doc.querySelector('[data-school-setup]');assert.ok(form);form.elements.schoolName.value='Beispielschule';form.elements.displayName.value='Ada';submit('[data-school-setup]');await tick();
  assert.equal(store.school.read('a').currentSchool,null);assert.match(doc.getElementById('accountSchoolView').textContent,/1 Klassen/);
  assert.equal(doc.querySelector('[data-school-commit-setup]').disabled,true);const approval=doc.querySelector('[data-school-setup-approval]');approval.checked=true;approval.dispatchEvent(new dom.window.Event('change'));doc.querySelector('[data-school-commit-setup]').click();await tick();await tick();
  assert.equal(store.school.read('a').currentSchool.name,'Beispielschule');assert.match(doc.getElementById('accountSchoolView').textContent,/Ada/);
  form=doc.querySelector('[data-school-invite]');form.elements.inviteName.value='Bea';form.elements.role.value='admin';submit('[data-school-invite]');await tick();const secret=doc.querySelector('[data-school-invite-code]').value;assert.equal(secret.length,43);
  uid='b';listener();await tick();doc.querySelector('[data-account-nav=school]').click();assert.equal(doc.querySelector('[data-school-invite-code]'),null,'secret cleared on account change');
  form=doc.querySelector('[data-school-claim]');form.elements.secret.value=secret;form.elements.displayName.value='Bea';submit('[data-school-claim]');await tick();assert.match(doc.getElementById('accountSchoolView').textContent,/Bestätigung/);assert.equal(store.school.read('b').currentSchool,null);
  uid='a';listener();await tick();doc.querySelector('[data-account-nav=school]').click();doc.querySelector('[data-school-approve]').click();await tick();
  uid='b';listener();await tick();doc.querySelector('[data-account-nav=school]').click();assert.equal(store.school.read('b').currentSchool.role,'admin');
  const checkbox=doc.querySelector('[data-school-class]');checkbox.checked=true;submit('[data-school-classes]');await tick();assert.equal(store.school.read('b').selectedClassIds.length,1);
  doc.querySelector('[data-account-nav=tests]').click();assert.equal(doc.getElementById('dashboardView'),dashboard);assert.equal(doc.getElementById('loginForm'),login);
  uid=null;visible='authView';listener();assert.doesNotMatch(doc.getElementById('accountSchoolView').textContent,/Beispielschule|Bea|Ada/);
 }finally{shell.destroy();store.close();dom.window.close();}
});

test('school refresh invalidates personal roster after approval and exposes a sole remaining membership',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document,s=openLocalRoster(':memory:');
 const op=(command,payload,expectedRevision=0)=>({command,payload,expectedRevision,operationId:crypto.randomUUID()});
 const setup=(uid,name)=>{const p=s.school.previewSetup(uid,{name,displayName:uid});s.school.command(uid,op('createSchool',{name,displayName:uid,previewHash:p.planHash},p.revision));};
 const invite=(from)=>{let a=s.school.read(from);return s.school.command(from,op('invite',{name:'Bea',role:'teacher'},a.revision)).invitation.secret;};
 const approve=(from)=>{const a=s.school.read(from);s.school.command(from,op('approveRequest',{requestId:a.requests[0].id},a.revision));};
 setup('a','Schule A');setup('c','Schule C');s.mutate('b',op('createClass',{name:'Privater Altbestand',schoolYear:'2026/27'}));
 let visible='dashboardView';const port={getSession:()=>({uid:'b',displayName:'Bea'}),listTests:()=>[],currentView:()=>visible,registerView(){},showView:id=>{visible=id;},showTests(){},subscribe:()=>()=>{}};
 const client={read:async()=>s.read('b')},schoolClient={read:async()=>s.school.read('b'),command:async(command,payload,state)=>s.school.command('b',{...op(command,payload,state.revision),contextId:state.currentSchool?.id||null})};
 const shell=installAccountWorkspace({document:doc,port,client,schoolClient});
 try{
  await tick();doc.querySelector('[data-account-nav=classes]').click();assert.match(doc.getElementById('accountClassesView').textContent,/Privater Altbestand/);
  s.school.command('b',op('claimInvitation',{secret:invite('a'),displayName:'Bea'}));approve('a');
  doc.querySelector('[data-account-nav=school]').click();doc.querySelector('[data-school-refresh]').click();await tick();await tick();doc.querySelector('[data-account-nav=classes]').click();
  assert.doesNotMatch(doc.getElementById('accountClassesView').textContent,/Privater Altbestand/,'approval refresh must invalidate old roster');
  assert.equal(doc.querySelector('[data-roster-create-class]').disabled,false,'confirmed teacher can now create shared classes');
  s.school.command('b',op('claimInvitation',{secret:invite('c'),displayName:'Bea'}));approve('c');let a=s.school.read('a');s.school.command('a',op('removeMember',{memberId:a.members.find(m=>m.displayName==='Bea').id},a.revision));
  doc.querySelector('[data-account-nav=school]').click();doc.querySelector('[data-school-refresh]').click();await tick();await tick();
  assert.ok(doc.querySelector('[data-school-switch]'),'one remaining school can be selected after removal');
 }finally{shell.destroy();s.close();dom.window.close();}
});

test('a conflict followed by failed reload remains a recoverable visible error',async()=>{
 const {createSchoolAdministration}=await import('./school-administration.mjs');
 const dom=new JSDOM('<section id="host"></section>'),host=dom.window.document.getElementById('host');let reads=0;
 const state={revision:1,currentSchool:{id:'school',name:'Schule',role:'teacher'},schools:[{id:'school',name:'Schule'}],classChoices:[],selectedClassIds:[],members:[],requests:[],invitations:[],pending:[]};
 const ui=createSchoolAdministration({document:dom.window.document,host,port:{getSession:()=>({uid:'a'})},client:{read:async()=>{if(reads++)throw Error('Neu laden fehlgeschlagen');return state;},command:async()=>{const e=Error('Bestand geändert');e.code='revision-conflict';throw e;}}});
 try{ui.setAccount('a');await tick();host.querySelector('[data-school-classes]').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert.match(host.textContent,/Neu laden fehlgeschlagen/);assert.equal(host.querySelector('[data-school-refresh]').disabled,false);}finally{ui.destroy();dom.window.close();}
});
