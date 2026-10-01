"use strict";
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {secureTokenMatches}=require('./assessment-core');
const {validateBatch,fingerprint,enabled,projectEvent,summarize}=require('./telemetry-core');
const opts={region:'europe-west1',timeoutSeconds:30,memory:'256MiB',enforceAppCheck:false};
function gate(){if(!enabled())throw new HttpsError('failed-precondition','Die Staging-Messung ist nicht aktiviert.');}
async function profile(db,uid){const s=await db.doc('users/'+uid).get();const p=s.data();if(!p||p.status==='suspended')throw new HttpsError('permission-denied','Kein aktiver Zugriff.');return p;}
exports.collectAssessmentTelemetry=onCall(opts,async request=>{
 gate();let batch;try{batch=validateBatch(request.data);}catch{throw new HttpsError('invalid-argument','Ungültige Messdaten.');}
 const db=getFirestore(),scope=batch.scope;
 const quiz=(await db.doc('quizzes/'+scope.quizId).get()).data();if(!quiz||!quiz.ownerId)throw new HttpsError('permission-denied','Kein Zugriff.');
 if(request.auth?.uid){await profile(db,request.auth.uid);if(quiz.ownerId!==request.auth.uid)throw new HttpsError('permission-denied','Kein Zugriff.');}
 else {
  if(!scope.attemptId||!scope.attemptToken)throw new HttpsError('unauthenticated','Bearbeitungsnachweis fehlt.');
  const p=(await db.doc('assessmentPrivate/'+scope.quizId+'_'+scope.attemptId).get()).data();
  if(!p||!secureTokenMatches(scope.attemptToken,p.tokenHash))throw new HttpsError('permission-denied','Kein Zugriff.');
  await profile(db,quiz.ownerId);
 }
 const scopeKey=fingerprint([quiz.ownerId,scope.quizId,scope.attemptId]);
 const now=Date.now(),day=Math.floor(now/86400000);let accepted=0,duplicate=0;
 await db.runTransaction(async tx=>{
  accepted=0;duplicate=0;
  const limit=db.doc('telemetryPrivateRates/'+scopeKey+'_'+day);
  const refs=batch.events.map(e=>db.doc('telemetryPrivateEvents/'+fingerprint([scopeKey,e.id])));
  const rate=await tx.get(limit);const snaps=await Promise.all(refs.map(ref=>tx.get(ref)));
  let fresh=0;
  snaps.forEach((s,i)=>{if(s.exists){if(s.data().payloadHash!==fingerprint([batch.release,batch.events[i]]))throw new HttpsError('already-exists','Widersprüchliche Messkennung.');duplicate++;}else fresh++;});
  if(Number(rate.data()?.count||0)+fresh>500)throw new HttpsError('resource-exhausted','Messlimit erreicht.');
  snaps.forEach((s,i)=>{if(!s.exists){const event=projectEvent(batch.events[i],{ownerId:quiz.ownerId,scopeKey,release:batch.release,now});
   tx.create(refs[i],{...event,payloadHash:fingerprint([batch.release,batch.events[i]]),expiresAt:Timestamp.fromMillis(event.expiresAtMs)});accepted++;}});
  if(fresh)tx.set(limit,{count:Number(rate.data()?.count||0)+fresh,expiresAt:Timestamp.fromMillis(now+2*86400000)},{merge:true});
 });
 return {accepted,duplicate};
});
exports.getAssessmentTelemetrySummary=onCall(opts,async request=>{
 gate();if(!request.auth?.uid)throw new HttpsError('unauthenticated','Bitte anmelden.');
 const db=getFirestore();await profile(db,request.auth.uid);
 const days=request.data?.days??7;if(!Number.isInteger(days)||days<1||days>30||Object.keys(request.data||{}).some(k=>k!=='days'))throw new HttpsError('invalid-argument','Ungültiger Zeitraum.');
 // Tenant-specific access. No browser-selectable owner and no global admin bypass.
 const snap=await db.collection('telemetryPrivateEvents').where('ownerId','==',request.auth.uid).limit(2001).get();
 const truncated=snap.size>2000;const cutoff=Date.now()-days*86400000;
 const rows=snap.docs.slice(0,2000).map(d=>d.data()).filter(r=>r.receivedAtMs>=cutoff&&r.expiresAtMs>Date.now());
 return {...summarize(rows,{truncated}),days,receivedRecords:rows.length};
});
exports.expireAssessmentTelemetry=onSchedule({region:'europe-west1',schedule:'every 24 hours'},async()=>{
 if(!enabled())return;const db=getFirestore();
 for(const collection of ['telemetryPrivateEvents','telemetryPrivateRates']){
  const snap=await db.collection(collection).where('expiresAt','<=',Timestamp.now()).limit(400).get();
  const batch=db.batch();snap.docs.forEach(d=>batch.delete(d.ref));if(snap.size)await batch.commit();
 }
});

exports.getAssessmentRunDiagnostics=onCall(opts,async request=>{
 gate();if(!request.auth?.uid)throw new HttpsError('unauthenticated','Bitte anmelden.');
 const quizId=request.data?.quizId;if(typeof quizId!=='string'||! /^[A-Z0-9]{4,16}$/.test(quizId)||Object.keys(request.data||{}).some(k=>k!=='quizId'))throw new HttpsError('invalid-argument','Ungültiger Testcode.');
 const db=getFirestore();await profile(db,request.auth.uid);
 const quiz=(await db.doc('quizzes/'+quizId).get()).data();if(!quiz||quiz.ownerId!==request.auth.uid)throw new HttpsError('permission-denied','Kein Zugriff.');
 const [attempts,submissions]=await Promise.all(['attempts','submissions'].map(c=>db.collection('quizzes/'+quizId+'/'+c).limit(1001).get()));
 const run=quiz.sessionRunId||null;const counts={ready:0,running:0,submitted:0,unknown:0,manual:0,automatic:0};
 const a=attempts.docs.slice(0,1000).map(d=>d.data()).filter(r=>(r.sessionRunId||null)===run);
 const s=submissions.docs.slice(0,1000).map(d=>d.data()).filter(r=>(r.sessionRunId||null)===run);
 for(const row of a){if(['ready','running','submitted'].includes(row.status))counts[row.status]++;else counts.unknown++;}
 for(const row of s){if(row.autoSubmitted===true)counts.automatic++;else if(row.autoSubmitted===false)counts.manual++;else counts.unknown++;}
 return {schemaVersion:1,source:'server_state',counts,confirmedSubmissions:s.length,observedAttempts:a.length,expectedParticipants:null,startSuccessRate:null,truncated:attempts.size>1000||submissions.size>1000,coverage:'stored-current-run-only'};
});
