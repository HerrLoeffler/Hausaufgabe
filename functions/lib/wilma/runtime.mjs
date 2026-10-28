import {createHash} from 'node:crypto';
import {createReviewService,ReviewError} from './core.mjs';
import {createDecisionService} from './decision.mjs';
const fail=(status,message)=>{throw new ReviewError(status,message);};
const digest=value=>createHash('sha256').update(value).digest('hex');
export function createTeacherWilmaRuntime({projectId,db,requireTeacher,requireAccountWrite,consumeQuota,provider,resultStore,now=Date.now,aiRequestCap=7}) {
 if(!['gradecrew-staging-2026','hausaufgabe-staging'].includes(projectId))throw Error('Wilma: Projekt nicht zugelassen.');
 if(!Number.isInteger(aiRequestCap)||aiRequestCap<1||aiRequestCap>100)throw Error('Wilma: Ungültiges Pilotbudget.');
 return async request=>{
  const {uid}=await requireTeacher(request);
  const data=request.data;
  if(!data||!['review','decision'].includes(data.action)||Buffer.byteLength(JSON.stringify(data))>60000)fail(400,'Ungültige Bewertungsanfrage.');
  const privateDoc=(section,id)=>db.doc(`users/${uid}/aiRuntime/${section}/operations/${id}`);
  const checkedProfile=async tx=>{await requireAccountWrite(tx,db,uid);const snap=await tx.get(db.doc('users/'+uid));return snap.exists?snap.data():null;};
  if(data.action==='decision'){
   const decide=createDecisionService({projectId,now,transact:fn=>db.runTransaction(async tx=>fn({
    getQuiz:async id=>{const snap=await tx.get(db.doc('quizzes/'+id));return snap.exists?snap.data():null;},
    getProfile:async()=>checkedProfile(tx),
    getSubmission:async(quiz,sid)=>{const snap=await tx.get(db.doc(`quizzes/${quiz}/submissions/${sid}`));return snap.exists?snap.data():null;},
    getQuestions:async quiz=>{const snap=await tx.get(db.collection(`quizzes/${quiz}/questions`));return snap.docs.map(doc=>({id:doc.id,...doc.data()}));},
    getOperation:async id=>{const snap=await tx.get(privateDoc('wilma-decisions',id));return snap.exists?snap.data():null;},
    writeSubmission:(quiz,sid,patch)=>tx.update(db.doc(`quizzes/${quiz}/submissions/${sid}`),patch),
    createOperation:(id,operation)=>tx.create(privateDoc('wilma-decisions',id),operation)
   }))});
   return decide({uid,data});
  }
  await db.runTransaction(tx=>checkedProfile(tx));
  const load=async path=>{const snap=await db.doc(path).get();return snap.exists?snap.data():null;};
  const cachePath=fingerprint=>`aiGeneratedCache/${digest(uid).slice(0,24)}/wilma-${fingerprint}.json`;
  const budget=db.doc('_wilmaPilotPrivate/'+(projectId==='hausaufgabe-staging'?'live-v1':'budget-v1'));
  const review=createReviewService({projectId,
   loadQuiz:quiz=>load('quizzes/'+quiz),loadQuestion:(quiz,q)=>load(`quizzes/${quiz}/questions/${q}`),loadSubmission:(quiz,sid)=>load(`quizzes/${quiz}/submissions/${sid}`),
   readCache:async fingerprint=>{
    const job=await load(privateDoc('wilma-reviews',fingerprint).path);
    if(!job||job.phase!=='completed')return null;
    if(job.uid!==uid||job.cachePath!==cachePath(fingerprint))fail(409,'Gespeicherter KI-Beleg konnte nicht sicher zugeordnet werden.');
    const cached=await resultStore.read(job.cachePath);
    if(!cached)fail(409,'Der gespeicherte Vorschlag ist abgelaufen. Es wird keine zweite Berechnung gestartet.');
    return cached;
   },
   reserve:async fingerprint=>{
    await consumeQuota(uid,'assistant');
    await db.runTransaction(async tx=>{
     await checkedProfile(tx);
     const ref=privateDoc('wilma-reviews',fingerprint),job=await tx.get(ref),counter=await tx.get(budget);
     if(job.exists)fail(409,'Dieser Prüflauf wurde bereits gestartet. Bitte Ergebnis aktualisieren; kein automatischer Neuversuch.');
     if((counter.data()?.started||0)>=aiRequestCap)fail(429,'Das begrenzte Wilma-Testkontingent ist aufgebraucht. Manuelles Bewerten bleibt möglich.');
     tx.create(ref,{uid,phase:'started',createdAt:now(),fingerprint});
     tx.set(budget,{...counter.data(),started:(counter.data()?.started||0)+1,updatedAt:now()});
    });
   },
   finish:async(fingerprint,info)=>{
    const ref=privateDoc('wilma-reviews',fingerprint),path=cachePath(fingerprint);
    const check=async tx=>{await checkedProfile(tx);const job=await tx.get(ref);if(!job.exists||job.data().uid!==uid)fail(409,'Prüfbeleg fehlt.');};
    if(info.phase==='completed'){
     await db.runTransaction(check);
     await resultStore.write(path,info.receipt);
    }
    try{await db.runTransaction(async tx=>{await check(tx);tx.update(ref,{phase:info.phase,requestId:info.requestId||null,updatedAt:now(),...(info.phase==='completed'?{cachePath:path}:{})});});}
    catch(error){if(info.phase==='completed')await resultStore.remove?.(path).catch(()=>{});throw error;}
   },
   provider:task=>provider(task,{uid})
  });
  return review({uid,data});
 };
}
