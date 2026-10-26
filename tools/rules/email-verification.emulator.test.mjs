import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,updateDoc,getDoc,serverTimestamp} from 'firebase/firestore';
const [host,port]=String(process.env.FIRESTORE_EMULATOR_HOST||'').split(':');assert.match(host,/^(127\.0\.0\.1|localhost)$/);
for(const file of ['firestore.rules','firestore.secure-assessment.rules'])test(`${file}: only server verification activates new accounts`,async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-gradecrew-email',firestore:{host,port:Number(port),rules:fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8')}});
 try{
  await env.clearFirestore();
  const pending=env.authenticatedContext('pending',{email:'teacher@example.invalid',email_verified:false}).firestore();
  await assertFails(setDoc(doc(pending,'users','pending'),{role:'teacher',status:'active'}));
  await assertFails(setDoc(doc(pending,'users','pending'),{role:'teacher'}));
  await assertSucceeds(setDoc(doc(pending,'users','pending'),{role:'teacher',status:'pending_verification',createdAt:serverTimestamp()}));
  await assertSucceeds(getDoc(doc(pending,'users','pending')));
  await assertFails(updateDoc(doc(pending,'users','pending'),{status:'active'}));
  await assertFails(setDoc(doc(pending,'quizzes','NEW1'),{ownerId:'pending',published:false}));
  for(const collection of ['emailVerifications','emailVerificationLimits']){
   await assertFails(getDoc(doc(pending,collection,'pending')));await assertFails(setDoc(doc(pending,collection,'pending'),{status:'consumed'}));
  }
  await env.withSecurityRulesDisabled(async c=>{
   await updateDoc(doc(c.firestore(),'users','pending'),{status:'active'});
   await setDoc(doc(c.firestore(),'users','legacy'),{role:'teacher',status:'active'});
  });
  await assertSucceeds(setDoc(doc(pending,'quizzes','NEW1'),{ownerId:'pending',published:false}));
  const legacy=env.authenticatedContext('legacy',{email_verified:false}).firestore();
  await assertSucceeds(setDoc(doc(legacy,'quizzes','OLD1'),{ownerId:'legacy',published:false}));
 }finally{await env.cleanup();}
});
