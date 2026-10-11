import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {doc,setDoc,updateDoc,getDoc,getDocs,collection,serverTimestamp} from 'firebase/firestore';
const requireUi=createRequire(new URL('../ui/package.json',import.meta.url));
const {JSDOM}=requireUi('jsdom');
const [host,port]=String(process.env.FIRESTORE_EMULATOR_HOST||'').split(':');
assert.match(host,/^(127\.0\.0\.1|localhost)$/);
const source=fs.readFileSync(new URL('../../admin-test-account-controls.mjs',import.meta.url),'utf8');
const executable=source.slice(source.indexOf('const STYLE_ID'),source.indexOf('export async function installAdminTestAccountControls'));
for(const file of ['firestore.rules','firestore.secure-assessment.rules'])test(`${file}: actual overlay mark/unmark preserves missing archive flag and archived restriction`,async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-gradecrew-mark-fix',firestore:{host,port:Number(port),rules:fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8')}});
 const dom=new JSDOM('<div id="adminTeacherDetail"><div class="adminDetailActions"></div></div><div id="toast"></div>');
 try{
  await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{
   await setDoc(doc(c.firestore(),'users','admin'),{role:'admin',status:'active'});
   await setDoc(doc(c.firestore(),'users','legacy'),{role:'teacher',status:'active',displayName:'Synthetic legacy'});
   await setDoc(doc(c.firestore(),'users','archived'),{role:'teacher',status:'suspended',isTestAccount:true,isTestAccountArchived:true});
  });
  const db=env.authenticatedContext('admin').firestore(),alerts=[];let write;
  const context={document:dom.window.document,window:dom.window,console,Map,MutationObserver:dom.window.MutationObserver,CustomEvent:dom.window.CustomEvent,
   getApp:()=>({}),getAuth:()=>({currentUser:{uid:'admin'}}),getFirestore:()=>db,doc,collection,getDoc,getDocs,serverTimestamp,
   updateDoc:(ref,patch)=>{write=updateDoc(ref,{...patch});return write;},confirm:()=>true,alert:message=>alerts.push(message)};
  vm.createContext(context);vm.runInContext(executable+'\ncurrentAdmin=true;',context);
  await context.refreshUsers();context.renderDetailControls('legacy');
  dom.window.document.querySelector('#gcToggleTestAccount').click();await write.catch(()=>{});await context.refreshUsers();await new Promise(r=>setImmediate(r));
  let profile=(await getDoc(doc(db,'users','legacy'))).data();assert.equal(profile.isTestAccount,true);assert.equal(Object.hasOwn(profile,'isTestAccountArchived'),false);assert.deepEqual(alerts,[]);
  context.renderDetailControls('legacy');dom.window.document.querySelector('#gcToggleTestAccount').click();await write;await context.refreshUsers();await new Promise(r=>setImmediate(r));
  profile=(await getDoc(doc(db,'users','legacy'))).data();assert.equal(profile.isTestAccount,false);assert.equal(Object.hasOwn(profile,'isTestAccountArchived'),false);
  context.renderDetailControls('archived');const blocked=dom.window.document.querySelector('#gcToggleTestAccount');assert.equal(blocked.disabled,true);blocked.click();
  const archived=(await getDoc(doc(db,'users','archived'))).data();assert.equal(archived.isTestAccount,true);assert.equal(archived.isTestAccountArchived,true);assert.equal(archived.status,'suspended');
 }finally{dom.window.close();await env.cleanup();}
});
