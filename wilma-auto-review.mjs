import {reviewItem} from './wilma-answer-review.mjs';
import {questionSnapshot} from './wilma-review-source.mjs';

// Preparation only: the existing host owns auth, persistent cache and quota.
// Two NEW identities per tab/auth session; exact cached identities can reload.
export function createWilmaAutoReview({getContext,parseGaps,analyzeAnswer,enabled=()=>false,onState=()=>{},onIdle=()=>{},maxRequests=2}) {
 if(!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>2)throw Error('Automatische Testvorschau: höchstens zwei neue Prüfläufe pro Sitzung.');
 let generation=0,running=null;
 const attempted=new Set(),reservedByActor=new Map(),failedByActor=new Map();
 const identity=(ctx,q,s)=>JSON.stringify([ctx.actor,ctx.quiz?.id,q.id,questionSnapshot(q),s.id,s.answers?.[q.id]??'']);
 const hasRubric=q=>q.type==='gapfill'||[q.reviewCriteria,q.acceptedAnswers].some(value=>typeof value==='string'?!!value.trim():Array.isArray(value)&&value.some(x=>String(x).trim()));
 const same=(epoch,ctx,q,s,key)=>{
  if(epoch!==generation)return false;
  const next=getContext(),question=next.questions?.find(x=>x.id===q.id),submission=next.submissions?.find(x=>x.id===s.id);
  return next.actor===ctx.actor&&next.quiz?.id===ctx.quiz?.id&&question&&submission&&identity(next,question,submission)===key;
 };
 return {
  clear({resetSession=false}={}){
   generation++;attempted.clear();
   // A results refresh must preserve the budget, failure guard and in-flight
   // busy protection. A real auth change clears private memory for the new actor.
   if(resetSession){running=null;reservedByActor.clear();failedByActor.clear();}
  },
  isRunning:()=>!!running,
  run(){
   if(running)return running;
   const ctx=getContext(),epoch=generation;
   if(!ctx.actor||!ctx.quiz||!enabled(ctx))return Promise.resolve();
   const jobs=ctx.questions.flatMap(q=>['text','gapfill'].includes(q.type)?ctx.submissions.filter(s=>{
    const row=reviewItem(q,s,parseGaps);
    return ['submitted','review','graded'].includes(s.status)&&row.requiresReview&&row.semanticPending&&!row.confirmed&&!row.deferred&&!row.technical&&row.proposal?.source!=='wilma-ai';
   }).map(s=>({q,s,key:identity(ctx,q,s)})):[]).filter(job=>!attempted.has(job.key));
   if(!jobs.length)return Promise.resolve();
   const priorFailure=failedByActor.get(ctx.actor);
   if(priorFailure){for(const {q,s,key} of jobs){attempted.add(key);onState({questionId:q.id,submissionId:s.id,phase:'error',message:priorFailure});}return Promise.resolve();}
   if(!reservedByActor.has(ctx.actor))reservedByActor.set(ctx.actor,new Set());
   const reserved=reservedByActor.get(ctx.actor);
   const operation=Promise.resolve().then(async()=>{
    for(const {q,s,key} of jobs){
     if(!same(epoch,ctx,q,s,key)||failedByActor.has(ctx.actor))break;
     if(attempted.has(key))continue;
     const emit=(phase,message='')=>{if(same(epoch,ctx,q,s,key))onState({questionId:q.id,submissionId:s.id,phase,message});};
     attempted.add(key);
     if(!hasRubric(q)){emit('blocked','Bewertungsraster fehlt. Bitte selbst prüfen.');continue;}
     if(!reserved.has(key)&&reserved.size>=maxRequests){emit('pending','Prüfung ausstehend · Testlimit erreicht.');continue;}
     reserved.add(key);emit('running','KI-Prüfung läuft …');
     try{
      await analyzeAnswer({questionId:q.id,submissionId:s.id});
      if(!same(epoch,ctx,q,s,key))break;
      const current=getContext().submissions.find(x=>x.id===s.id);
      if(current.grading?.[q.id]?.reviewState==='confirmed')continue;
      if(!current.grading?.[q.id]?.reviewSuggestion)throw Error('Kein sicher zugeordneter KI-Vorschlag.');
      emit('proposal','KI-Vorschlag bereit · bitte prüfen.');
     }catch(error){
      if(error?.code!=='wilma-context-changed'&&getContext().actor===ctx.actor){
       const quota=/resource-exhausted/.test(error?.code||'')||/limit|kontingent|quota/i.test(error?.message||'');
       const message=quota?'Prüfung ausstehend · Testkontingent erreicht. Manuell bewerten.':'Prüfung ausstehend · KI gerade nicht verfügbar. Manuell bewerten.';
       failedByActor.set(ctx.actor,message);emit('error',message);
      }
      break;
     }
    }
   }).finally(()=>{if(running===operation){running=null;if(getContext().actor===ctx.actor)onIdle();}});
   running=operation;return operation;
  }
 };
}
