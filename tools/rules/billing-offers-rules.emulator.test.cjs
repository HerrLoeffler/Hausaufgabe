'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,deleteDoc}=require('firebase/firestore');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);
let env;
test.before(async()=>{env=await initializeTestEnvironment({projectId:'demo-gradecrew-billing',firestore:{rules:fs.readFileSync(process.env.GRADECREW_BILLING_RULES_FILE||'firestore.secure-assessment.rules','utf8')}});});
test.after(async()=>{await env.cleanup();});
test('offer versions, quotes, code targets and amendments are never directly readable or writable by any client role',async()=>{
 await env.clearFirestore();
 const collections=['billingV2Offers','billingV2OfferQuotes','billingV2OfferReservations','billingV2OfferAttempts','billingV2OfferAmendmentPreviews','billingV2OfferAmendments','billingV2OfferAmendmentLocks'];
 await env.withSecurityRulesDisabled(async context=>{const db=context.firestore();for(const uid of ['admin','teacher'])await setDoc(doc(db,'users/'+uid),{role:uid,status:'active'});for(const collection of collections)await setDoc(doc(db,collection+'/private'),{private:true,targetIds:['teacher']});});
 for(const context of [env.unauthenticatedContext(),env.authenticatedContext('teacher',{email_verified:true}),env.authenticatedContext('admin',{email_verified:true})])for(const collection of collections){const ref=doc(context.firestore(),collection+'/private');await assertFails(getDoc(ref));await assertFails(setDoc(ref,{discountType:'percent',percentOff:100}));await assertFails(deleteDoc(ref));}
});
