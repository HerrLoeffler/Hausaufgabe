import {reviewItem} from './wilma-answer-review.mjs';
import {questionSnapshot} from './wilma-review-source.mjs';

// Only known service messages may add detail; never echo arbitrary provider output.
function preparationFailure(error){
 const code=String(error?.code||'').replace(/^functions\//,'');
 const known=['Ungültige Testkennung.','Ungültige Anfrage.','Ungültige Bewertungsanfrage.','Bitte 1 bis 10 unterschiedliche Antworten wählen.','Diese Aufgabe wird in der Vorschau nicht unterstützt.','Punkterahmen nicht unterstützt.','Antwortabgleich fehlt.','Bewertungsraster ist zu lang.','Bitte das Raster zuerst in der Aufgabe speichern.','Antwortformat nicht unterstützt.','Eine Antwort ist zu lang für den Pilot.'];
 if(code==='invalid-argument')return 'Anfrage abgelehnt · '+(known.includes(error.message)?error.message:'Aufgabe und Antwortformat prüfen.')+' Manuell bewerten.';
 if(code==='unauthenticated')return 'Anmeldung abgelaufen. Bitte erneut anmelden; vorhandene Punkte bleiben erhalten.';
 if(code==='permission-denied')return 'Zugriff auf die KI-Prüfung nicht erlaubt. Vorhandene Punkte bleiben erhalten.';
 if(code==='failed-precondition')return 'Prüfstand nicht aktuell oder Prüflauf bereits gestartet. Ergebnisse aktualisieren; kein automatischer Neuversuch.';
 if(code==='resource-exhausted'||/limit|kontingent|quota/i.test(error?.message||''))return 'Prüfung ausstehend · KI-Kontingent erreicht. Manuell bewerten.';
 return 'KI-Prüfung unterbrochen. Ergebnis nicht sicher verfügbar; kein automatischer Neuversuch. Manuell bewerten.';
}

// Preparation only: the existing host owns auth, persistent cache and quota.
// Two NEW identities per tab/auth session; exact cached identities can reload.
export function createWilmaAutoReview({getContext,parseGaps,analyzeAnswer,enabled=()=>false,onState=()=>{},onIdle=()=>{},maxRequests=2,allowFreeLookups=false,serverBudgeted=false}) {
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
    return ['submitted','review','graded'].includes(s.status)&&row.requiresReview&&row.semanticPending&&!row.confirmed&&!row.deferred&&!row.technical&&!row.sourceIssue&&row.proposal?.source!=='wilma-ai';
   }).map(s=>({q,s,key:identity(ctx,q,s)})):[]).filter(job=>!attempted.has(job.key));
   if(!jobs.length)return Promise.resolve();
   const priorFailure=failedByActor.get(ctx.actor);
   if(priorFailure&&!allowFreeLookups){for(const {q,s,key} of jobs){attempted.add(key);onState({questionId:q.id,submissionId:s.id,phase:'error',message:priorFailure});}return Promise.resolve();}
   if(!reservedByActor.has(ctx.actor))reservedByActor.set(ctx.actor,new Set());
   const reserved=reservedByActor.get(ctx.actor);
   const operation=Promise.resolve().then(async()=>{
    for(const {q,s,key} of jobs){
     if(!enabled(getContext())||!same(epoch,ctx,q,s,key)||failedByActor.has(ctx.actor)&&!allowFreeLookups)break;
     if(attempted.has(key))continue;
     const emit=(phase,message='')=>{if(same(epoch,ctx,q,s,key))onState({questionId:q.id,submissionId:s.id,phase,message});};
     attempted.add(key);
     if(!hasRubric(q)){emit('blocked','Bewertungsraster fehlt. Bitte selbst prüfen.');continue;}
     const freeOnly=allowFreeLookups&&(!serverBudgeted&&reserved.size>=maxRequests||failedByActor.has(ctx.actor));
     if(!serverBudgeted&&!freeOnly&&!reserved.has(key)&&reserved.size>=maxRequests){emit('pending','Prüfung ausstehend · Testlimit erreicht.');continue;}
     if(!freeOnly)reserved.add(key);emit('running','KI-Prüfung läuft …');
     try{
      await analyzeAnswer({questionId:q.id,submissionId:s.id,...(allowFreeLookups?{allowPaid:!freeOnly}:{})});
      if(!same(epoch,ctx,q,s,key))break;
      const current=getContext().submissions.find(x=>x.id===s.id);
      if(current.grading?.[q.id]?.reviewState==='confirmed')continue;
      if(!current.grading?.[q.id]?.reviewSuggestion)throw Error('Kein sicher zugeordneter KI-Vorschlag.');
      if(['teacher-fundus','accepted-rule'].includes(current.grading?.[q.id]?.reviewSuggestion?.origin))reserved.delete(key);
      emit('proposal',current.grading?.[q.id]?.reviewSuggestion?.origin==='teacher-fundus'?'Aus deinem Fundus · bitte bestätigen.':'KI-Vorschlag bereit · bitte prüfen.');
     }catch(error){
      if(freeOnly){
       const cacheMiss=/^Keine bestätigte Bewertung im Fundus oder Prüfbelegcache\./.test(error?.message||'');
       const first=failedByActor.get(ctx.actor);
       emit(cacheMiss?'pending':'error',cacheMiss?(first?first+' ':'')+'Kein gespeicherter Vorschlag verfügbar. Bitte selbst prüfen.':preparationFailure(error));
       continue;
      }
      if(error?.code!=='wilma-context-changed'&&getContext().actor===ctx.actor){
       const message=preparationFailure(error);
       failedByActor.set(ctx.actor,message);emit('error',message);
      }
      if(!allowFreeLookups)break;
     }
    }
   }).finally(()=>{if(running===operation){running=null;if(getContext().actor===ctx.actor)onIdle();}});
   running=operation;return operation;
  }
 };
}
