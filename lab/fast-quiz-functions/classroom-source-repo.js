'use strict';
// Reuses Test-Rallye PR236 owner/profile policy and Wissensreise PR238 compact
// source fields. Runtime copies never modify the source quiz or answer keys.
function createSourceRepo({db,getAuth,fail}){
 async function assertOwnerActive(uid){
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid||''))fail('teacher_forbidden','Ein freigeschaltetes Lehrkraft-Testkonto ist erforderlich.',403);
  const [profile,deletion]=await Promise.all([db.doc(`users/${uid}`).get(),db.doc(`accountDeletions/${uid}`).get()]),p=profile.data()||{};
  if(!profile.exists||deletion.exists||p.accountDeletionId||p.disabled===true||(p.status&&p.status!=='active')||!['teacher','admin'].includes(p.role))fail('teacher_forbidden','Ein freigeschaltetes Lehrkraft-Testkonto ist erforderlich.',403);
  const user=await getAuth().getUser(uid);if(user.disabled)fail('teacher_disabled','Dieses Lehrkraftkonto ist nicht freigeschaltet.',403);
  return p;
 }
 async function identity(context){const raw=String(context?.authorization||'');if(!raw.startsWith('Bearer '))fail('auth_required','Bitte im Testprojekt anmelden.',401);const decoded=await getAuth().verifyIdToken(raw.slice(7),true);await assertOwnerActive(decoded.uid);return{uid:decoded.uid};}
 const playable=q=>q&&q.isDeleted!==true&&q.rightsHold!==true&&(!q.published||q.ended===true)&&!['queued','running','failed'].includes(q.generationStatus);
 async function list(uid){await assertOwnerActive(uid);const result=await db.collection('quizzes').where('ownerId','==',uid).limit(100).get();return result.docs.filter(d=>playable(d.data())).map(d=>({id:d.id,title:String(d.data().title||'Eigener Test').slice(0,160),subject:String(d.data().subject||''),grade:String(d.data().grade||'')}));}
 async function load(uid,id){await assertOwnerActive(uid);if(!/^[A-Za-z0-9_-]{1,120}$/.test(id||''))fail('source_invalid','Ungültiger Test.');const quizRef=db.doc(`quizzes/${id}`),snap=await quizRef.get(),quiz=snap.data();if(!snap.exists||quiz.ownerId!==uid||!playable(quiz))fail('source_forbidden','Dieser eigene Test ist nicht verfügbar oder läuft noch als Prüfung.',403);const data=await quizRef.collection('questions').orderBy('order').limit(101).get();if(!data.size||data.size>100)fail('source_size','Bitte einen Test mit 1 bis 100 Aufgaben wählen.');const fields=['type','text','options','acceptedAnswers','manualReview','numericAnswer','tolerance','unit','imageUrl','imageDataUrl','audioPresentation','audioAnswerMode','audioIntent'];const questions=data.docs.map(d=>({id:d.id,...Object.fromEntries(fields.filter(k=>d.data()[k]!==undefined).map(k=>[k,d.data()[k]]))}));const source={id,kind:'test',title:String(quiz.title||'Eigener Test'),subject:String(quiz.subject||''),grade:String(quiz.grade||''),questions};if(Buffer.byteLength(JSON.stringify(source),'utf8')>60000)fail('source_size','Die kompakte Lernkopie ist größer als 60.000 Bytes. Bitte einen kleineren Test verwenden.');return source;}
 return{identity,list,load,assertOwnerActive};
}
module.exports={createSourceRepo};
