import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,updateDoc,getDoc,serverTimestamp,deleteField} from 'firebase/firestore';
const [host,port]=String(process.env.FIRESTORE_EMULATOR_HOST||'').split(':');assert.match(host,/^(127\.0\.0\.1|localhost)$/);
const source=fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('async function ensureProfileDefaults('),source.indexOf('async function touchLastActive('));
const defaults=JSON.parse(JSON.stringify(vm.runInNewContext(source.slice(source.indexOf('const DEFAULT_SCALE'),source.indexOf('const QUESTION_TYPES'))+'\n({DEFAULT_SCALE,DEFAULT_SETTINGS})')));
for(const file of ['firestore.rules','firestore.secure-assessment.rules'])test(`${file}: actual own login bootstrap safely adds only absent defaults`,async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-gradecrew-legacy-fix',firestore:{host,port:Number(port),rules:fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8')}});
 try{
  await env.clearFirestore();const profiles=[['both',{}],['role',{status:'active'}],['status',{role:'teacher'}],['admin-status',{role:'admin'}],['suspended',{role:'teacher',status:'suspended'}],['deleted',{}],['foreign-default',{role:'teacher'}]];
  await env.withSecurityRulesDisabled(async c=>{for(const[id,p]of profiles)await setDoc(doc(c.firestore(),'users',id),{displayName:'Synthetic legacy',...p});await setDoc(doc(c.firestore(),'accountDeletions','deleted'),{operationId:'synthetic'});});
  for(const[id,p]of profiles.slice(0,4)){
   const db=env.authenticatedContext(id).firestore(),state={user:{uid:id},profile:{displayName:'Synthetic legacy',...p}};
   const context=vm.createContext({...defaults,state,db,doc,deepClone:v=>JSON.parse(JSON.stringify(v)),setDoc:(ref,patch,options)=>setDoc(ref,JSON.parse(JSON.stringify(patch)),{...options})});vm.runInContext(code,context);await context.ensureProfileDefaults();
   const actual=(await getDoc(doc(db,'users',id))).data();assert.equal(actual.role,p.role||'teacher');assert.equal(actual.status,'active');assert.equal(actual.settings.defaultResultMode,'points_grade');assert.deepEqual(actual.gradeScales[0].thresholds,[91,77,57,39,25,0]);
   await assertFails(updateDoc(doc(db,'users',id),{role:p.role==='admin'?'teacher':'admin'}));await assertFails(updateDoc(doc(db,'users',id),{status:'suspended'}));await assertFails(updateDoc(doc(db,'users',id),{role:deleteField()}));await assertFails(updateDoc(doc(db,'users',id),{status:deleteField()}));
  }
  const admin=env.authenticatedContext('admin-status').firestore();await assertFails(updateDoc(doc(admin,'users','foreign-default'),{status:'active'}));
  const legacy=env.authenticatedContext('both').firestore();await assertFails(updateDoc(doc(legacy,'users','role'),{role:'admin'}));
  const suspended=env.authenticatedContext('suspended').firestore();await assertFails(updateDoc(doc(suspended,'users','suspended'),{status:'active'}));
  const deleted=env.authenticatedContext('deleted').firestore();await assertFails(setDoc(doc(deleted,'users','deleted'),{role:'teacher',status:'active'},{merge:true}));
  const fresh=env.authenticatedContext('fresh').firestore();await assertSucceeds(setDoc(doc(fresh,'users','fresh'),{role:'teacher',status:'active',displayName:'Synthetic registered',email:'fresh@example.invalid',createdAt:serverTimestamp()}));await assertFails(updateDoc(doc(fresh,'users','fresh'),{role:'admin'}));
 }finally{await env.cleanup();}
});
