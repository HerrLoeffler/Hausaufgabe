'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const {REGION}=require('../constants');
const {getOpenAI}=require('../openai-client');
const {consumeQuota,recordUsage}=require('../usage');
const {requireAccountWrite}=require('../account-state');
const {getCatalog}=require('./catalog');
const {createService,firestoreStore,LearningError}=require('./service');
const {createAI}=require('./ai');
const {firestorePool}=require('./fundus');
const {requireLearningIdentity}=require('./contracts');
const opts={region:REGION,timeoutSeconds:120,memory:'512MiB',enforceAppCheck:false,secrets:[defineSecret('OPENAI_API_KEY')]};
function testProject(){if((process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT)!=='gradecrew-staging-2026')throw new HttpsError('failed-precondition','Das Lerngehirn ist nur in der getrennten Testumgebung verfügbar.');}
async function identity(request){
 testProject();const uid=request.auth?.uid;if(!uid)throw new HttpsError('unauthenticated','Bitte mit deinem eigenen Zugang anmelden.');
 const db=getFirestore();const [user,deleted]=await Promise.all([db.doc(`users/${uid}`).get(),db.doc(`accountDeletions/${uid}`).get()]);const profile=user.data();
 try{return requireLearningIdentity({project:process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT,uid,profile,deleted:deleted.exists});}catch(error){throw new HttpsError(error.code,error.message);}
}
function service(uid){return createService({catalog:getCatalog(),store:firestoreStore(getFirestore(),requireAccountWrite),quota:id=>consumeQuota(id,'assistant'),ai:createAI({client:getOpenAI(),pool:firestorePool(getFirestore(),uid),record:(usage,operation)=>recordUsage(uid,'learning-brain',usage,{operation,promptVersion:'learning-brain-2026-10-21'})})});}
function handler(method){return onCall(opts,async request=>{
 const uid=await identity(request);
 if(request.data?.uid||request.data?.studentId||request.data?.ownerUid)throw new HttpsError('invalid-argument','Es wird ausschließlich dein eigenes Profil verwendet.');
 try{return await service(uid)[method](uid,request.data||{});}
 catch(error){if(error instanceof HttpsError)throw error;if(error instanceof LearningError)throw new HttpsError(error.code,error.message,{stage:error.stage||"validation"});console.warn('Lerngehirn-Schritt fehlgeschlagen',{code:error?.code,name:error?.name});throw new HttpsError('unavailable','Der KI-Schritt konnte noch nicht zuverlässig abgeschlossen werden. Dein bestätigter Stand bleibt gespeichert. Bitte erneut versuchen.');}
});}
module.exports={
 learningBrainCatalog:onCall({region:REGION,timeoutSeconds:30,memory:'256MiB'},async request=>{await identity(request);return getCatalog();}),
 learningBrainProfile:handler('profile'),learningBrainStart:handler('start'),learningBrainTurn:handler('turn')
};
