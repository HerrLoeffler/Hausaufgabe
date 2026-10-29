import {createHash} from 'node:crypto';
import {createReviewService,ReviewError} from './core.mjs';
import {quoteReview,reserveBalance,settleBalance,normalizeLegacyAllowance,MODEL} from './budget.mjs';
import {questionSnapshot} from './source.mjs';
import {fundusKey,fundusEvidence,readEvidence,mergeEvidence} from './fundus.mjs';
import {createDecisionService} from './decision.mjs';
const fail=(status,message)=>{throw new ReviewError(status,message);};
const digest=value=>createHash('sha256').update(value).digest('hex');
export function createTeacherWilmaRuntime({projectId,db,requireTeacher,requireAccountWrite,consumeQuota,provider,resultStore,now=Date.now,aiRequestCap=7,monthlyBudget=false,model=MODEL}) {
 if(!['gradecrew-staging-2026','hausaufgabe-staging'].includes(projectId))throw Error('Wilma: Projekt nicht zugelassen.');
 if(monthlyBudget&&projectId!=='gradecrew-staging-2026')throw Error('Monatsbudget zunächst nur auf Staging.');
 if(!Number.isInteger(aiRequestCap)||aiRequestCap<1||aiRequestCap>100)throw Error('Wilma: Ungültiges Pilotbudget.');
 return async request=>{
  const {uid}=await requireTeacher(request);
  const data=request.data;
  if(!data||!['review','decision','learn'].includes(data.action)||Buffer.byteLength(JSON.stringify(data))>60000)fail(400,'Ungültige Bewertungsanfrage.');
  const privateDoc=(section,id)=>db.doc(`users/${uid}/aiRuntime/${section}/operations/${id}`);
  const checkedProfile=async tx=>{await requireAccountWrite(tx,db,uid);const snap=await tx.get(db.doc('users/'+uid));return snap.exists?snap.data():null;};
  if(data.action==='learn'){
   if(!monthlyBudget||![data.quizId,data.submissionId].every(v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)))fail(400,'Ungültige Fundusanfrage.');
   return db.runTransaction(async tx=>{
    await checkedProfile(tx);
    const quiz=(await tx.get(db.doc('quizzes/'+data.quizId))).data();
    if(!quiz||quiz.ownerId!==uid||quiz.isDeleted||quiz.rightsHold)fail(403,'Nur eigene Tests sind zugelassen.');
    const submission=(await tx.get(db.doc('quizzes/'+data.quizId+'/submissions/'+data.submissionId))).data();
    if(!submission||submission.status!=='graded'||submission.reviewedBy!==uid||!submission.reviewedAt||JSON.stringify(submission.answers)!==JSON.stringify(data.expectedAnswers))fail(409,'Bestätigte Abgabe wurde verändert. Bitte aktualisieren.');
    const questions=(await tx.get(db.collection('quizzes/'+data.quizId+'/questions'))).docs.map(doc=>({id:doc.id,...doc.data()}));
    const entries=[];
    for(const q of questions){
     if(!['text','gapfill'].includes(q.type))continue;
     if(data.expectedQuestionStates?.[q.id]!==questionSnapshot(q))fail(409,'Bewertungsraster wurde geändert. Bitte aktualisieren.');
     const evidence=fundusEvidence({quizId:data.quizId,questionId:q.id,quiz,q,submission,submissionId:data.submissionId,now:now()});
     if(evidence){const ref=privateDoc('wilma-fundus',evidence.key);const old=(await tx.get(ref)).data();entries.push({ref,evidence,old});}
    }
    for(const {ref,evidence,old} of entries)tx.set(ref,mergeEvidence(evidence,old));
    return {learned:entries.length};
   });
  }
  if(data.action==='decision'){
   const decide=createDecisionService({projectId,now,transact:fn=>db.runTransaction(async tx=>fn({
    getQuiz:async id=>{const snap=await tx.get(db.doc('quizzes/'+id));return snap.exists?snap.data():null;},
    getProfile:async()=>checkedProfile(tx),
    getSubmission:async(quiz,sid)=>{const snap=await tx.get(db.doc(`quizzes/${quiz}/submissions/${sid}`));return snap.exists?snap.data():null;},
    getQuestions:async quiz=>{const snap=await tx.get(db.collection(`quizzes/${quiz}/questions`));return snap.docs.map(doc=>({id:doc.id,...doc.data()}));},
    getOperation:async id=>{const snap=await tx.get(privateDoc('wilma-decisions',id));return snap.exists?snap.data():null;},
    ...(monthlyBudget?{prepareFundus:async evidence=>{const ref=privateDoc('wilma-fundus',evidence.key);const old=(await tx.get(ref)).data();tx.set(ref,mergeEvidence(evidence,old));}}:{}),
    writeSubmission:(quiz,sid,patch)=>tx.update(db.doc(`quizzes/${quiz}/submissions/${sid}`),patch),
    createOperation:(id,operation)=>tx.create(privateDoc('wilma-decisions',id),operation)
   }))});
   return decide({uid,data});
  }
  await db.runTransaction(tx=>checkedProfile(tx));
  const load=async path=>{const snap=await db.doc(path).get();return snap.exists?snap.data():null;};
  const cachePath=fingerprint=>`aiGeneratedCache/${digest(uid).slice(0,24)}/wilma-${fingerprint}.json`;
  const budget=db.doc('_wilmaPilotPrivate/'+(projectId==='hausaufgabe-staging'?'live-v1':'budget-v1'));
  let activeReservation=null;
  const settle=async(fingerprint,usage)=>{
   if(!monthlyBudget||!activeReservation||!usage)return;
   await db.runTransaction(async tx=>{
    await checkedProfile(tx);const ref=privateDoc('wilma-reviews',fingerprint),job=(await tx.get(ref)).data();
    if(!job?.costReservation||job.costSettled)return;
    const monthly=db.doc('_wilmaPilotPrivate/month-'+job.costReservation.month);const ledger=(await tx.get(monthly)).data();
    const next=settleBalance(ledger,job.costReservation,usage);tx.set(monthly,{...next,updatedAt:now()});tx.update(ref,{costSettled:true,usage:{input_tokens:usage.input_tokens,output_tokens:usage.output_tokens}});
   });
  };
  const review=createReviewService({projectId,allowCustomCriteria:!monthlyBudget,
   loadQuiz:quiz=>load('quizzes/'+quiz),loadQuestion:(quiz,q)=>load(`quizzes/${quiz}/questions/${q}`),loadSubmission:(quiz,sid)=>load(`quizzes/${quiz}/submissions/${sid}`),
   readFundus:async args=>{
    if(!monthlyBudget||typeof args.criteria==='string'&&args.criteria.trim())return null;
    const evidence=await load(privateDoc('wilma-fundus',fundusKey(args)).path);
    if(!evidence)return null;
    const submission=await load('quizzes/'+args.quizId+'/submissions/'+evidence.submissionId);
    return readEvidence(evidence,{...args,submission,now:now()});
   },
   readCache:async fingerprint=>{
    const job=await load(privateDoc('wilma-reviews',fingerprint).path);
    if(!job||job.phase!=='completed')return null;
    if(job.uid!==uid||job.cachePath!==cachePath(fingerprint))fail(409,'Gespeicherter KI-Beleg konnte nicht sicher zugeordnet werden.');
    const cached=await resultStore.read(job.cachePath);
    if(!cached)fail(409,'Der gespeicherte Vorschlag ist abgelaufen. Es wird keine zweite Berechnung gestartet.');
    return cached;
   },
   reserve:async(fingerprint,task)=>{
    const quote=monthlyBudget?quoteReview(task,model,now()):null;
    await consumeQuota(uid,'assistant');
    await db.runTransaction(async tx=>{
     await checkedProfile(tx);
     const ref=privateDoc('wilma-reviews',fingerprint),job=await tx.get(ref),counter=await tx.get(budget);
     if(job.exists)fail(409,'Dieser Prüflauf wurde bereits gestartet. Bitte Ergebnis aktualisieren; kein automatischer Neuversuch.');
     let monthly,next;
     if(quote){monthly=db.doc('_wilmaPilotPrivate/month-'+quote.month);const old=(await tx.get(monthly)).data();const ledger=normalizeLegacyAllowance(old,quote.month);next=reserveBalance(ledger,quote);}
     if(!monthlyBudget&&(counter.data()?.started||0)>=aiRequestCap)fail(429,'Das begrenzte Wilma-Testkontingent ist aufgebraucht. Manuelles Bewerten bleibt möglich.');
     tx.create(ref,{uid,phase:'started',createdAt:now(),fingerprint,...(quote?{costReservation:quote,costSettled:false}:{})});
     if(quote)tx.set(monthly,{...next,currency:'EUR',limitMicros:20000000,pricingVersion:quote.version,updatedAt:now()});
     tx.set(budget,{...counter.data(),started:(counter.data()?.started||0)+1,updatedAt:now()});
    });
    activeReservation={fingerprint,quote};
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
   provider:async task=>{
    try{const result=await provider(task,{uid});if(monthlyBudget&&activeReservation)await settle(activeReservation.fingerprint,result.usage).catch(()=>{});return result;}
    catch(error){if(monthlyBudget&&activeReservation&&error.usage)await settle(activeReservation.fingerprint,error.usage).catch(()=>{});throw error;}
   }
  });
  return review({uid,data});
 };
}
