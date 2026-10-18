import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
const {JSDOM}=createRequire(import.meta.url)('../tools/ui/node_modules/jsdom');
import {installAccountWorkspace} from './account-workspace.mjs';
import {openLocalRoster} from '../tools/classroom-preview/local-roster-store.mjs';
const tick=()=>new Promise(r=>setTimeout(r,0));
test('original app gains manual named students and classes, editing and account isolation',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document;
 const store=openLocalRoster(':memory:');let uid='teacher-a',listener,view='dashboardView';
 const port={getSession:()=>uid?{uid}:null,listTests:()=>[{id:'ORIGINAL',title:'Mein Test',grade:'9b',subject:'Technik'}],currentView:()=>view,subscribe:f=>(listener=f,()=>{}),registerView(){},showView:id=>{view=id;},showTests(){view='dashboardView';},openQuiz(){},openResults(){}};
 const client={read:async()=>store.read(uid),mutate:async(command,payload,expectedRevision,operationId)=>store.mutate(uid,{command,payload,expectedRevision,operationId})};
 const original=doc.getElementById('dashboardView');const shell=installAccountWorkspace({document:doc,port,client});await tick();
 try{
  doc.querySelector('[data-account-nav=classes]').click();
  assert.ok(doc.querySelector('[data-roster-create-class]'),'real classes get an add action');
  doc.querySelector('[data-roster-create-class]').click();
  let form=doc.querySelector('[data-roster-form]');form.elements.name.value='9b';form.elements.schoolYear.value='2026/27';form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.equal(store.read(uid).classes.length,1);assert.match(doc.getElementById('accountClassesView').textContent,/9b/);
  doc.querySelector('[data-account-nav=pupils]').click();doc.querySelector('[data-roster-create-student]').click();
  form=doc.querySelector('[data-roster-form]');form.elements.firstName.value='Mila Marie';form.elements.lastName.value='von Beispiel';form.elements.classId.value=store.read(uid).classes[0].id;
  form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.match(doc.getElementById('accountPupilsView').textContent,/Mila Marie/);assert.match(doc.getElementById('accountPupilsView').textContent,/von Beispiel/);
  const id=store.read(uid).students[0].id;doc.querySelector('[data-roster-edit-student]').click();form=doc.querySelector('[data-roster-form]');form.elements.firstName.value='Mila';form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.equal(store.read(uid).students[0].id,id);assert.equal(store.read(uid).students[0].firstName,'Mila');
  doc.querySelector('[data-account-nav=tests]').click();assert.equal(doc.getElementById('dashboardView'),original);
  uid='teacher-b';listener();await tick();doc.querySelector('[data-account-nav=pupils]').click();assert.doesNotMatch(doc.getElementById('accountPupilsView').textContent,/Mila|von Beispiel/);
  uid=null;listener();assert.equal(doc.querySelector('[data-roster-form]'),null);assert.doesNotMatch(doc.getElementById('accountPupilsView').textContent,/Mila/);
 }finally{shell.destroy();store.close();dom.window.close();}
});
