import {reviewItem} from './wilma-answer-review.mjs';
import {questionSnapshot} from './wilma-review-source.mjs';

// Preparation only. The existing host transport owns auth, persistent cache,
// quota and provider requests; this scheduler never confirms or writes points.
export function createWilmaAutoReview({getContext,parseGaps,analyzeAnswer,enabled=()=>false,onState=()=>{},onIdle=()=>{},maxRequests=2}) {
 if(!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>2)throw Error('Automatische Testvorschau: höchstens zwei Anfragen pro Sitzung.');
 let generation=0,running=null,halted=false,used=0;
 const attempted=new Set();
 const identity=(ctx,q,s)=>JSON.stringify([ctx.actor,ctx.quiz?.id,q.id,questionSnapshot(q),s.id,s.answers?.[q.id]??'']);
 const hasRubric=q=>q.type==='gapfill'||[q.reviewCriteria,q.acceptedAnswers].some(value=>typeof value==='string'?!!value.trim():Array.isArray(value)&&value.some(x=>String(x).trim()));
 const same=(epoch,ctx,q,s,key)=>{
  if(epoch!==generation)return false;
  const next=getContext(),question=next.questions?.find(x=>x.id===q.id),submission=next.submissions?.find(x=>x.id===s.id);
  return next.actor===ctx.actor&&next.quiz?.id===ctx.quiz?.id&&question&&submission&&identity(next,question,submission)===key;
 };
 return {
  clear(){generation++;running=null;attempted.clear();halted=false;used=0;},
  isRunning:()=>!!running,
  run(){
   if(running)return running;
   const ctx=getContext(),epoch=generation;
   if(!ctx.actor||!ctx.quiz||!enabled(ctx)||halted)return Promise.resolve();
   const jobs=ctx.questions.flatMap(q=>['text','gapfill'].includes(q.type)?ctx.submissions.filter(s=>{
    const row=reviewItem(q,s,parseGaps);
    return ['submitted','review','graded'].includes(s.status)&&row.requiresReview&&row.semanticPending&&!row.confirmed&&!row.deferred&&!row.technical&&row.proposal?.source!=='wilma-ai';
   }).map(s=>({q,s,key:identity(ctx,q,s)})):[]);
   running=Promise.resolve().then(async()=>{
    for(const {q,s,key} of jobs){
     if(!same(epoch,ctx,q,s,key)||halted)break;
     if(attempted.has(key))continue;
     const emit=(phase,message='')=>{if(same(epoch,ctx,q,s,key))onState({questionId:q.id,submissionId:s.id,phase,message});};
     if(!hasRubric(q)){emit('blocked','Bewertungsraster fehlt. Bitte selbst prüfen.');attempted.add(key);continue;}
     if(used>=maxRequests){emit('pending','Prüfung ausstehend · Testlimit erreicht.');continue;}
     attempted.add(key);used++;emit('running','KI-Prüfung läuft …');
     try{
      await analyzeAnswer({questionId:q.id,submissionId:s.id});
      if(!same(epoch,ctx,q,s,key))break;
      const current=getContext().submissions.find(x=>x.id===s.id);
      if(current.grading?.[q.id]?.reviewState==='confirmed')continue;
      if(!current.grading?.[q.id]?.reviewSuggestion)throw Error('Kein sicher zugeordneter KI-Vorschlag.');
      emit('proposal','KI-Vorschlag bereit · bitte prüfen.');
     }catch(error){
      if(same(epoch,ctx,q,s,key)){halted=true;const quota=/resource-exhausted/.test(error?.code||'')||/limit|kontingent|quota/i.test(error?.message||'');emit('error',quota?'Prüfung ausstehend · Testkontingent erreicht. Manuell bewerten.':'Prüfung ausstehend · KI gerade nicht verfügbar. Manuell bewerten.');}
      break;
     }
    }
   }).finally(()=>{if(epoch===generation){running=null;onIdle();}});
   return running;
  }
 };
}
