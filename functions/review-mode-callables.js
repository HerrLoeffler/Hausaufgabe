'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getFirestore,FieldPath,Timestamp}=require('firebase-admin/firestore');
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
   list:async (name,{owner,cursor,limit,category})=>{
    let query=db.collection(name);if(category)query=query.where('category','==',category);if(owner)query=query.where('authorId','==',owner);
    query=query.orderBy(FieldPath.documentId()).limit(limit);if(cursor)query=query.startAfter(cursor);
    const snap=await transaction.get(query);return snap.docs.map(doc=>({...doc.data(),id:doc.id}));
   }
  });
  for(const [path,value] of writes)transaction.set(db.doc(path),value);
  return result;
 })};
 try{
  const service=createReviewService({store,toTimestamp:value=>Timestamp.fromMillis(value),projectId:process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT});
  const uid=request.auth?.uid,data=request.data||{};if(data.actorUid&&data.actorUid!==uid)throw new HttpsError('permission-denied','Das Feedbackkonto wurde gewechselt.');
  if(['uploadVisualImage','readVisualImage','deleteVisualImage'].includes(data.action)){
   await service.execute({uid,data:{action:'access'}});
   const images=require('./feedback-image-storage').imageStorage().service;
   if(data.action==='uploadVisualImage')return await images.upload(uid,data);
   const access=await service.execute({uid,data:{action:'visualImageAccess',id:data.id}});
   if(data.action==='deleteVisualImage')return await images.remove(access);
   return await images.read(access);
  }
  return await service.execute({uid,data});
 }
 catch(error){if(['unauthenticated','permission-denied','invalid-argument','failed-precondition','aborted','already-exists','resource-exhausted'].includes(error.code))throw new HttpsError(error.code,error.message);throw new HttpsError('unavailable','Hinweise konnten gerade nicht gespeichert oder geladen werden.');}
});
