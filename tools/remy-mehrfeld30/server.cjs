'use strict';
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {quizCode,seedOwner,canReview,ownsPilotJob,ownsSeedJob,present,feedback,score}=require('./review.cjs');
const seed=require('./seed.json');
const app=initializeApp();
const db=getFirestore(app);

async function loadQuiz(quizId,uid){
  if(typeof quizId!=='string'||!quizCode.test(quizId))throw new HttpsError('invalid-argument','Ungültiger Testcode.');
  const quiz=(await db.doc('quizzes/'+quizId).get()).data();
  if(!quiz||quiz.published||quiz.isDeleted||quiz.rightsHold||!(/^[a-f0-9]{40}$/.test(quiz.generationJobId||'')))
    throw new HttpsError('permission-denied','Diese Aufgabe ist für dieses Labor nicht verfügbar.');
  const entry=seed.find(row=>row.jobId===quiz.generationJobId);
  if(quiz.ownerId!==(entry?seedOwner:uid))throw new HttpsError('permission-denied','Kein eigener Laborauftrag.');
  const job=(await db.doc('aiJobs/'+quiz.generationJobId).get()).data();
  if(entry&&ownsSeedJob(job,entry)&&job.quizId===quizId)return entry.group;
  if(!ownsPilotJob(job,uid,quizId))throw new HttpsError('permission-denied','Kein eigener Laborauftrag.');
  return 'eigener';
}
exports.remyMehrfeld30Review=onCall({region:'europe-west1',maxInstances:2,timeoutSeconds:40},async request=>{
  if((app.options.projectId||process.env.GCLOUD_PROJECT)!=='gradecrew-staging-2026')throw new HttpsError('failed-precondition','Nur im GradeCrew-Testprojekt verfügbar.');
  const uid=request.auth?.uid;
  if(!uid)throw new HttpsError('unauthenticated','Bitte mit deinem Testkonto anmelden.');
  const profile=(await db.doc('users/'+uid).get()).data()||{};
  if(!canReview(uid,profile))throw new HttpsError('permission-denied','Dieses Labor benötigt ein freigegebenes Testkonto.');
  const data=request.data||{};
  const owner=db.collection('remyMehrfeld30Reviewers').doc(uid);
  const latest=owner.collection('ratings');
  if(data.action==='list'){
    const quizIds=data.quizId?[data.quizId]:(await db.getAll(...seed.map(row=>db.doc('aiJobs/'+row.jobId))))
      .flatMap((snap,i)=>{const job=snap.data();return ownsSeedJob(job,seed[i])?[job.quizId]:[];});
    const rows=(await Promise.all(quizIds.map(async quizId=>{
      const group=await loadQuiz(quizId,uid);
      const questions=await db.collection('quizzes/'+quizId+'/questions').orderBy('position').limit(30).get();
      return questions.docs.map(s=>present(quizId,group,{...s.data(),id:s.id}));
    }))).flat();
    if(!rows.length)return {tasks:[],expected:30};
    const notes=await db.getAll(...rows.map(task=>latest.doc(task.version)));
    return {tasks:rows.map((task,i)=>({...task,review:notes[i].data()||null})),expected:data.quizId?rows.length:30};
  }
  if(!['rate','score'].includes(data.action)||typeof data.id!=='string'||!(/^[A-Za-z0-9_-]{1,100}$/.test(data.id)))
    throw new HttpsError('invalid-argument','Ungültige Laboranfrage.');
  const group=await loadQuiz(data.quizId,uid);
  const raw=(await db.doc('quizzes/'+data.quizId+'/questions/'+data.id).get()).data();
  if(!raw)throw new HttpsError('not-found','Aufgabe fehlt.');
  const q={...raw,id:data.id};
  const task=present(data.quizId,group,q);
  if(task.version!==data.version)throw new HttpsError('failed-precondition','Die Aufgabe hat sich geändert. Bitte lade sie neu.');
  if(data.action==='score'){
    if(JSON.stringify(data.answer??null).length>5000)throw new HttpsError('invalid-argument','Die Eingabe ist zu lang.');
    return {points:score(q,data.answer),maxPoints:task.points};
  }
  let rating;
  try{rating=feedback(task,data);}catch(error){throw new HttpsError('invalid-argument',error.message);}
  const event=owner.collection('events').doc(data.eventId);
  return db.runTransaction(async tx=>{
    const current=await tx.get(event);
    if(current.exists){
      if(current.data()?.version!==task.version)throw new HttpsError('failed-precondition','Rückmeldungs-ID bereits belegt.');
      return {rating:(await tx.get(latest.doc(task.version))).data()};
    }
    const value={...rating,quizId:task.quizId,questionId:task.id,group,updatedAt:FieldValue.serverTimestamp()};
    tx.create(event,value);
    tx.set(latest.doc(task.version),value);
    return {rating};
  });
});
