import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,updateDoc,deleteDoc,getDoc} from 'firebase/firestore';
const [host,port]=String(process.env.FIRESTORE_EMULATOR_HOST||'').split(':');
assert.match(host,/^(127\.0\.0\.1|localhost)$/);
for(const file of ['firestore.rules','firestore.secure-assessment.rules']){
 test(`${file}: privileged profile fields, tombstones and private ownership are server-only`,async()=>{
  const env=await initializeTestEnvironment({projectId:'demo-gradecrew-admin-rules',firestore:{host,port:Number(port),rules:fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8')}});
  try{await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{for(const [id,p] of [['a',{role:'admin',status:'active'}],['t',{role:'teacher',status:'active'}],['gone',{role:'teacher',status:'deleting',accountDeletionId:'op'}]])await setDoc(doc(c.firestore(),'users',id),p);await setDoc(doc(c.firestore(),'accountDeletions','gone'),{operationId:'op'});await setDoc(doc(c.firestore(),'users','gone','announcementViews','one'),{read:true});});
   const admin=env.authenticatedContext('a').firestore(),owner=env.authenticatedContext('t').firestore(),gone=env.authenticatedContext('gone').firestore();
   for(const patch of [{role:'teacher'},{status:'suspended'},{accountDeletionId:'op'},{isTestAccountArchived:true}])await assertFails(updateDoc(doc(admin,'users','a'),patch));
   await assertFails(deleteDoc(doc(admin,'users','a')));await assertFails(deleteDoc(doc(owner,'users','t')));
   await assertSucceeds(updateDoc(doc(owner,'users','t'),{displayName:'Own synthetic preference'}));
   await assertSucceeds(updateDoc(doc(admin,'users','t'),{isTestAccount:true}));
   await assertFails(updateDoc(doc(admin,'users','a'),{isTestAccount:true}));
   await assertFails(getDoc(doc(gone,'users','gone','announcementViews','one')));
   await assertFails(getDoc(doc(gone,'users','gone')));
   await assertFails(getDoc(doc(admin,'users','gone','announcementViews','one')));
   await assertFails(setDoc(doc(admin,'accountActionControl','revision'),{revision:1}));
   await assertFails(getDoc(doc(admin,'accountActions','some')));
   await env.withSecurityRulesDisabled(c=>deleteDoc(doc(c.firestore(),'users','gone')));
   await assertFails(setDoc(doc(gone,'users','gone'),{role:'teacher',status:'active'}));
  }finally{await env.cleanup();}
 });
}
