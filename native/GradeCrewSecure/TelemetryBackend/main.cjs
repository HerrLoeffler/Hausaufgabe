'use strict';
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {normalize,tokenMatches,mergeMetrics,questionIDs}=require('./core.cjs');
initializeApp();
const db=getFirestore(),DAY=86400000,region='europe-west1';
function staging(){if(process.env.GCLOUD_PROJECT!=='hausaufgabe-staging')throw new HttpsError('failed-precondition','Staging only');}
const millis=x=>x?.toMillis?.()||0;
const expiry=ms=>Timestamp.fromMillis(ms);
const hash=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
// All collection names are new and denied by the existing default-deny client rules.
async function record(quizId,attemptId,event,token,fromServer=false){
 staging();
 const now=Date.now(),key=quizId+'_'+attemptId;
 return db.runTransaction(async tx=>{
  const refs=[db.doc(`quizzes/${quizId}`),db.doc(`quizzes/${quizId}/attempts/${attemptId}`),db.doc(`assessmentPrivate/${key}`),db.doc(`quizzes/${quizId}/submissions/${attemptId}`),db.doc(`secureTelemetryAttempts/${key}`),db.doc(`secureTelemetryEvents/${key}_${event.eventId}`)];
  const [q,a,p,s,m,e]=await Promise.all(refs.map(r=>tx.get(r)));
  if(!a.exists||!q.exists||a.data().secureAssessmentVersion!==2||(!fromServer&&!tokenMatches(token,p.data()?.tokenHash)))throw new HttpsError('permission-denied','Ungültiger Prüfungsversuch.');
  const attempt=a.data(),previous=m.data()||{};
  if(fromServer&&!m.exists)return {accepted:true,ignored:true};
  const started=millis(attempt.startedAt),joined=millis(attempt.joinedAt)||millis(attempt.createdAt);
  // Drop, rather than recount, events after the dedupe retention window.
  if(!joined||now-joined>30*DAY)return {accepted:true,expired:true};
  if(e.exists)return {accepted:true,duplicate:true};
  if((previous.eventCount||0)>=2048)return {accepted:true,capped:true};
  const validIds=questionIDs(p.data(),s.data());
  if(['completedIds','touchedIds'].some(k=>event[k]?.some(id=>!validIds.has(id))))throw new HttpsError('invalid-argument','Unbekannte Aufgabe.');
  const teacher=String(q.data().ownerId||'');if(!teacher)throw new HttpsError('failed-precondition','Lehrkraft fehlt.');
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(joined));
  const daily=db.doc(`secureTelemetryDaily/${hash(teacher+'|'+date)}`),dailyDoc=await tx.get(daily),totals=dailyDoc.data()||{};
  const receipt=s.data(),submitted=millis(receipt?.submittedAt),confirmed=!!submitted&&['graded','review'].includes(receipt.status);
  const next={...mergeMetrics(previous,event),schemaVersion:1,quizId,attemptId,teacherId:teacher,sessionRunId:attempt.sessionRunId||null,questionCount:attempt.questionCount||0,serverStartedAtMillis:started||null,serverDeadlineAtMillis:millis(attempt.deadlineAt)||null,timeLimitMinutes:attempt.timeLimitMinutes||null,serverSubmittedAtMillis:confirmed?submitted:null,lastReceivedAt:Timestamp.fromMillis(now),expireAt:expiry(joined+30*DAY),eventCount:(previous.eventCount||0)+1};
  let starts=0,ends=0,manual=0,automatic=0,duration=0;
  if(started&&!previous.countedStart){starts=1;next.countedStart=true;}
  if(confirmed&&!previous.countedSubmission){ends=1;next.countedSubmission=true;receipt.autoSubmitted===true?automatic++:manual++;duration=Math.max(0,submitted-started);}
  if(confirmed){next.completion=receipt.autoSubmitted===true?'timeout_or_server_end':'manual';next.serverDurationMillis=started?Math.max(0,submitted-started):null;}
  tx.set(refs[4],next);
  tx.create(refs[5],{schemaVersion:1,...event,quizId,attemptId,source:fromServer?'server_receipt':'client_observed',receivedAt:Timestamp.fromMillis(now),expireAt:expiry(joined+30*DAY)});
  tx.set(daily,{schemaVersion:1,date,teacherId:teacher,participations:(totals.participations||0)+starts,confirmedSubmissions:(totals.confirmedSubmissions||0)+ends,manualSubmissions:(totals.manualSubmissions||0)+manual,automaticSubmissions:(totals.automaticSubmissions||0)+automatic,serverDurationMillis:(totals.serverDurationMillis||0)+duration,observedInterruptions:(totals.observedInterruptions||0)+(event.kind==='interrupted'?1:0),expireAt:expiry(joined+397*DAY)});
  // Presence documents allow distinct tests/rounds/teachers to be counted without aliases.
  for(const [kind,value] of [['teacher',teacher],['test',quizId],['round',quizId+'|'+(attempt.sessionRunId||'selfpaced')]])
   tx.set(db.doc(`secureTelemetryPresence/${hash(date+'|'+kind+'|'+value)}`),{schemaVersion:1,date,teacherId:teacher,kind,reference:hash(value),expireAt:expiry(joined+397*DAY)});
  return {accepted:true};
 });
}
exports.recordSecureExamTelemetry=onCall({region,invoker:"public",maxInstances:10,timeoutSeconds:30,memory:'256MiB'},async request=>{
 staging();const d=request.data||{};
 if(Object.keys(d).some(k=>!['quizId','attemptId','attemptToken','event'].includes(k))||!/^[A-Z0-9]{4,16}$/.test(d.quizId||'')||!/^a_[a-f0-9]{28}$/.test(d.attemptId||''))throw new HttpsError('invalid-argument','Ungültige Statistik-Anfrage.');
 let event;try{event=normalize(d.event);}catch{throw new HttpsError('invalid-argument','Ungültiges Statistik-Ereignis.');}
 if(event.observedAt>Date.now()+5*60*1000)throw new HttpsError('invalid-argument','Ungültige Zeit.');
 return record(d.quizId,d.attemptId,event,d.attemptToken);
});
exports.secureTelemetrySubmission=onDocumentCreated({document:'quizzes/{quizId}/submissions/{attemptId}',region,retry:true,maxInstances:5},async event=>{
 staging();if(event.data?.data()?.secureAssessmentVersion!==2)return;
 const {quizId,attemptId}=event.params;
 await record(quizId,attemptId,{eventId:hash('receipt|'+quizId+'|'+attemptId).slice(0,32),kind:'receipt_confirmed',observedAt:0},null,true);
});
exports.cleanupSecureTelemetry=onSchedule({schedule:'every 24 hours',timeZone:'Europe/Berlin',region,timeoutSeconds:300,maxInstances:1,retryCount:3},async()=>{
 staging();
 for(const collection of ['secureTelemetryEvents','secureTelemetryAttempts','secureTelemetryDaily','secureTelemetryPresence']){
  for(let page=0;page<40;page++){
   const old=await db.collection(collection).where('expireAt','<=',Timestamp.now()).limit(400).get();if(old.empty)break;
   const batch=db.batch();old.docs.forEach(d=>batch.delete(d.ref));await batch.commit();if(old.size<400)break;
  }
 }
});
