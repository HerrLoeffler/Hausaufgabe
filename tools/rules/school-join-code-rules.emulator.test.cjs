"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc}=require('firebase/firestore');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(localhost|127\.0\.0\.1):\d+$/);
let env;
test.before(async()=>{env=await initializeTestEnvironment({projectId:'demo-gradecrew-billing',firestore:{rules:fs.readFileSync('firestore.secure-assessment.rules','utf8')}});});
test.after(async()=>env.cleanup());
test('code hashes, rate limits and redemption receipts stay private even for a school administrator',async()=>{
 await env.clearFirestore();
 const paths=['billingV2SchoolJoinCodes/hash','billingV2SchoolCodeRedemptions/receipt','billingV2SchoolCodeRateLimits/limit'];
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();for(const path of paths)await setDoc(doc(db,path),{schoolId:'school',personId:'teacher'});await setDoc(doc(db,'users/teacher'),{role:'teacher',status:'active'});await setDoc(doc(db,'users/admin'),{role:'admin',status:'active'});});
 for(const uid of ['teacher','admin',null]){const db=(uid?env.authenticatedContext(uid,{email_verified:true}):env.unauthenticatedContext()).firestore();for(const path of paths){await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),{code:'forged'}));}}
});
test('joining the same school never grants reading a colleague private test',async()=>{
 await env.clearFirestore();await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await setDoc(doc(db,'users/teacher'),{role:'teacher',status:'active'});await setDoc(doc(db,'billingV2Memberships/member'),{schoolId:'school',personId:'teacher',status:'active',role:'teacher',seatAssigned:true});await setDoc(doc(db,'quizzes/PRIVATE1'),{ownerId:'colleague',published:false,title:'Private teacher test'});});
 const db=env.authenticatedContext('teacher',{email_verified:true}).firestore();await assertFails(getDoc(doc(db,'quizzes/PRIVATE1')));
});
