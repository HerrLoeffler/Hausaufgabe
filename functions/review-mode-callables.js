'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getFirestore,FieldPath}=require('firebase-admin/firestore');
const {createReviewService}=require('./lib/review-mode');
const {REGION}=require('./lib/constants');
exports.reviewMode=onCall({region:REGION,timeoutSeconds:30,memory:'256MiB',enforceAppCheck:false},async request=>{
 const db=getFirestore();
 const store={transaction:fn=>db.runTransaction(async transaction=>{
  // Buffer writes so all authorization/reference reads precede Firestore writes.
  const writes=[];
  const result=await fn({
   get:async path=>{const snap=await transaction.get(db.doc(path));return snap.exists?snap.data():null;},
   set:(path,value)=>writes.push([path,value]),
   list:async (name,{owner,cursor,limit})=>{
    let query=db.collection(name);if(owner)query=query.where('authorId','==',owner);
    query=query.orderBy(FieldPath.documentId()).limit(limit);if(cursor)query=query.startAfter(cursor);
    const snap=await transaction.get(query);return snap.docs.map(doc=>({...doc.data(),id:doc.id}));
   }
  });
  for(const [path,value] of writes)transaction.set(db.doc(path),value);
  return result;
 })};
 try{return await createReviewService({store,projectId:process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT}).execute({uid:request.auth?.uid,data:request.data});}
 catch(error){if(['unauthenticated','permission-denied','invalid-argument','failed-precondition','aborted','already-exists'].includes(error.code))throw new HttpsError(error.code,error.message);throw new HttpsError('unavailable','Hinweise konnten gerade nicht gespeichert oder geladen werden.');}
});
