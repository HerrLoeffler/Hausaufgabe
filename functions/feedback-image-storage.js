'use strict';
const {getFirestore}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {createImageService}=require('./lib/feedback-images');
function imageStorage(){
 const db=getFirestore(),bucket=getStorage().bucket();
 const leases={
  get:async id=>(await db.doc('reviewImageLeases/'+id).get()).data(),
  update:(id,fn)=>db.runTransaction(async tx=>{const ref=db.doc('reviewImageLeases/'+id),old=await tx.get(ref),value=fn(old.data());
   if(['pending','ready'].includes(value.state)){const p=(await tx.get(db.doc('users/'+value.ownerId))).data(),member=(await tx.get(db.doc('reviewMembers/'+value.ownerId))).data();if(!p||p.accountDeletionId||(p.status&&p.status!=='active')||!['teacher','admin'].includes(p.role)||(p.role==='teacher'&&member?.enabled===false))throw Object.assign(Error('Konto nicht berechtigt.'),{code:'permission-denied'});}
   if(!old.exists){const rateRef=db.doc('users/'+value.ownerId+'/aiRuntime/visualFeedbackRate'),rate=(await tx.get(rateRef)).data(),day=new Date().toISOString().slice(0,10),count=rate?.day===day?rate.count||0:0;if(count>=30)throw Object.assign(Error('Heute bereits 30 Bildentwürfe. Bitte später erneut versuchen.'),{code:'resource-exhausted'});tx.set(rateRef,{day,count:count+1});}
   tx.set(ref,value);return value;}),
  expired:async at=>(await db.collection('reviewImageLeases').where('cleanupAt','<=',at).limit(100).get()).docs.map(s=>s.data())
 };
 const objects={
  put:async(path,bytes,sha256)=>{const file=bucket.file(path);try{await file.save(bytes,{resumable:false,preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:'image/jpeg',cacheControl:'private, no-store',metadata:{sha256}}});}catch(e){if(![409,412].includes(Number(e.code)))throw e;const [m]=await file.getMetadata();if(m.metadata?.sha256!==sha256)throw Object.assign(new Error('Bildkonflikt'),{code:'already-exists'});}},
  get:async path=>{try{return (await bucket.file(path).download())[0];}catch(e){if(Number(e.code)===404)return null;throw e;}},
  remove:async path=>{await bucket.file(path).delete({ignoreNotFound:true});}
 };
 return {service:createImageService({leases,objects}),db,leases};
}
module.exports={imageStorage};
