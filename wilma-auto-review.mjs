import {reviewItem} from './wilma-answer-review.mjs';
import {questionSnapshot} from './wilma-review-source.mjs';
import {teacherResultSubmittedAt} from './teacher-grading-summary.mjs';

// Answers predating the first recovery rollout require an explicit bounded action.
// Refresh and scroll can inspect receipts but never turn an old cache miss into a bill.
const legacyCutoff=Date.parse('2026-11-18T17:30:00Z');
export function wilmaAutomaticPaidPolicy({context,submission}){
 const submitted=teacherResultSubmittedAt(submission);
 return context.allowAutomaticPaid!==false&&Number.isFinite(submitted)&&submitted>=legacyCutoff;
}

// Only known service messages may add detail; never echo arbitrary provider output.
function preparationFailure(error){
 const reasons={provider_incomplete:'KI-Antwort unvollständig.',provider_refusal:'Die KI hat keinen Vorschlag geliefert.',provider_format:'KI-Antwortformat nicht verwendbar.',provider_timeout:'Zeitüberschreitung beim KI-Dienst.',provider_access:'KI-Dienstzugang nicht verfügbar.',provider_capacity:'KI-Dienst momentan ausgelastet.',provider_unavailable:'KI-Dienst nicht erreichbar.',receipt_invalid:'KI-Vorschlag konnte nicht sicher zugeordnet werden.',result_store_failed:'Vorschlag konnte nicht dauerhaft gespeichert werden.',result_store_unavailable:'Gespeicherter Vorschlag gerade nicht erreichbar.',review_in_progress:'KI-Prüfung läuft bereits. Status später kostenlos aktualisieren.',result_unknown:'Ergebnis des früheren Prüflaufs nicht sicher verfügbar.',receipt_expired:'Gespeicherter Vorschlag abgelaufen.',cache_miss:'Kein gespeicherter Vorschlag verfügbar. Bitte selbst prüfen.'};
 if(reasons[error?.details?.reasonCode])return reasons[error.details.reasonCode];
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
export function createWilmaAutoReview({getContext,parseGaps,analyzeAnswer,enabled=()=>false,onState=()=>{},onIdle=()=>{},maxRequests=2,allowFreeLookups=false,serverBudgeted=false,allowAutomaticPaid=()=>true}) {
 if(!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>2)throw Error('Automatische Testvorschau: höchstens zwei neue Prüfläufe pro Sitzung.');
 let generation=0,running=null;
 const attempted=new Set(),reservedByActor=new Map(),failedByScope=new Map(),states=new Map(),retrySlotsByActor=new Map();
 const scope=ctx=>JSON.stringify([ctx.actor,ctx.quiz?.id]);
 const identity=(ctx,q,s)=>JSON.stringify([ctx.actor,ctx.quiz?.id,q.id,questionSnapshot(q),s.id,s.answers?.[q.id]??'']);
 const hasRubric=q=>q.type==='gapfill'||[q.reviewCriteria,q.acceptedAnswers].some(value=>typeof value==='string'?!!value.trim():Array.isArray(value)&&value.some(x=>String(x).trim()));
 const same=(epoch,ctx,q,s,key)=>{
  if(epoch!==generation)return false;
  const next=getContext(),question=next.questions?.find(x=>x.id===q.id),submission=next.submissions?.find(x=>x.id===s.id);
  return next.actor===ctx.actor&&next.quiz?.id===ctx.quiz?.id&&question&&submission&&identity(next,question,submission)===key;
 };
 const failureState=error=>({phase:error?.details?.reviewState==='running'?'waiting':error?.details?.reasonCode==='cache_miss'?'blocked':'error',message:error?.details?.reasonCode==='cache_miss'?'Noch nicht geprüft.':preparationFailure(error),reasonCode:typeof error?.details?.reasonCode==='string'?error.details.reasonCode:undefined,resumeAllowed:error?.details?.reasonCode==='cache_miss',retryAllowed:error?.details?.retryAllowed===true&&Number.isSafeInteger(error?.details?.failedAt),failedAt:Number.isSafeInteger(error?.details?.failedAt)?error.details.failedAt:undefined});
 const publish=(ctx,q,s,key,value)=>{states.set(key,value);onState({questionId:q.id,submissionId:s.id,...value});};
 const manual=({questionId,submissionId,expectedFailureAt}={},mode='recover')=>{
  const retry=mode==='retry',resume=mode==='resume',paid=retry||resume;
  if(running)return running;
  const ctx=getContext(),epoch=generation;if(!ctx.actor||!ctx.quiz||!enabled(ctx))return Promise.resolve();
  const jobs=ctx.questions.filter(q=>q.id===questionId&&['text','gapfill'].includes(q.type)).flatMap(q=>ctx.submissions.filter(s=>!submissionId||s.id===submissionId).filter(s=>reviewItem(q,s,parseGaps).requiresReview).map(s=>({q,s,key:identity(ctx,q,s)})));
  const operation=Promise.resolve().then(async()=>{for(const {q,s,key} of jobs){
   if(!enabled(getContext())||!same(epoch,ctx,q,s,key))break;
   const prior=states.get(key),reserved=reservedByActor.get(ctx.actor)||new Set();
   if(resume&&(!submissionId||prior?.resumeAllowed!==true||s.grading?.[q.id]?.reviewSuggestion||!serverBudgeted&&!reserved.has(key)&&reserved.size+(retrySlotsByActor.get(ctx.actor)||0)>=maxRequests))continue;
   if(retry&&(!submissionId||prior?.retryAllowed!==true||prior.failedAt!==expectedFailureAt||!serverBudgeted&&reserved.size+(retrySlotsByActor.get(ctx.actor)||0)>=maxRequests))continue;
   if(retry){states.set(key,{...prior,retryAllowed:false});retrySlotsByActor.set(ctx.actor,(retrySlotsByActor.get(ctx.actor)||0)+1);}
   if(resume){reserved.add(key);reservedByActor.set(ctx.actor,reserved);}
   publish(ctx,q,s,key,{phase:'running',message:paid?'KI-Prüfung läuft …':'Gespeicherten Status prüfen …'});
   try{
    await analyzeAnswer({questionId:q.id,submissionId:s.id,allowPaid:paid,...(retry?{retry:true,expectedFailureAt}:{})});
    if(!same(epoch,ctx,q,s,key))break;
    const current=getContext().submissions.find(x=>x.id===s.id);
    if(current.grading?.[q.id]?.reviewState==='confirmed')continue;
    if(!current.grading?.[q.id]?.reviewSuggestion)throw Error('Kein sicher zugeordneter KI-Vorschlag.');
    failedByScope.delete(scope(ctx));
    publish(ctx,q,s,key,{phase:'proposal',message:'Vorschlag bereit · bitte prüfen.',retryAllowed:false,resumeAllowed:false});
   }catch(error){if(same(epoch,ctx,q,s,key)){const next=failureState(error);publish(ctx,q,s,key,!paid&&next.reasonCode==='cache_miss'&&(['error','waiting'].includes(prior?.phase)||prior?.reasonCode&&prior.reasonCode!=='cache_miss')?prior:next);}}
  }}).finally(()=>{if(running===operation){running=null;if(getContext().actor===ctx.actor)onIdle();}});running=operation;return operation;
 };
 return {
  recover:payload=>manual(payload),retry:payload=>manual(payload,'retry'),resume:payload=>manual(payload,'resume'),
  clear({resetSession=false}={}){
   generation++;attempted.clear();
   // A results refresh must preserve the budget, failure guard and in-flight
   // busy protection. A real auth change clears private memory for the new actor.
   if(resetSession){running=null;reservedByActor.clear();failedByScope.clear();states.clear();retrySlotsByActor.clear();}
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
   const priorFailure=failedByScope.get(scope(ctx));
   if(priorFailure&&!allowFreeLookups){for(const {q,s,key} of jobs){attempted.add(key);publish(ctx,q,s,key,{...priorFailure,retryAllowed:false});}return Promise.resolve();}
   if(!reservedByActor.has(ctx.actor))reservedByActor.set(ctx.actor,new Set());
   const reserved=reservedByActor.get(ctx.actor);
   const operation=Promise.resolve().then(async()=>{
    for(const {q,s,key} of jobs){
     if(!enabled(getContext())||!same(epoch,ctx,q,s,key)||failedByScope.has(scope(ctx))&&!allowFreeLookups)break;
     if(attempted.has(key))continue;
     const emit=(phase,message='',extra={})=>{if(same(epoch,ctx,q,s,key))publish(ctx,q,s,key,{phase,message,...extra});};
     attempted.add(key);
     if(!hasRubric(q)){emit('blocked','Bewertungsraster fehlt. Bitte selbst prüfen.');continue;}
     const previous=states.get(key);
     const freeOnly=allowFreeLookups&&(!allowAutomaticPaid({context:ctx,question:q,submission:s})||previous?.resumeAllowed||['error','waiting'].includes(previous?.phase)||!serverBudgeted&&reserved.size+(retrySlotsByActor.get(ctx.actor)||0)>=maxRequests||failedByScope.has(scope(ctx)));
     if(!serverBudgeted&&!freeOnly&&!reserved.has(key)&&reserved.size+(retrySlotsByActor.get(ctx.actor)||0)>=maxRequests){emit('pending','Prüfung ausstehend · Testlimit erreicht.');continue;}
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
       const cacheMiss=error?.details?.reasonCode==='cache_miss'||/^Keine bestätigte Bewertung im Fundus oder Prüfbelegcache\./.test(error?.message||'');
       const next=cacheMiss?(['error','waiting'].includes(previous?.phase)||previous?.reasonCode&&previous.reasonCode!=='cache_miss'?previous:failureState({details:{reasonCode:'cache_miss',reviewState:'not_started'}})):failureState(error);
       if(same(epoch,ctx,q,s,key))publish(ctx,q,s,key,next);
       continue;
      }
      if(error?.code!=='wilma-context-changed'&&getContext().actor===ctx.actor){
       const failure=failureState(error);
       if(!['result_unknown','receipt_invalid','receipt_expired','cache_miss','review_in_progress'].includes(failure.reasonCode))failedByScope.set(scope(ctx),failure);
       if(same(epoch,ctx,q,s,key))publish(ctx,q,s,key,failure);
      }
      if(!allowFreeLookups)break;
     }
    }
   }).finally(()=>{if(running===operation){running=null;if(getContext().actor===ctx.actor)onIdle();}});
   running=operation;return operation;
  }
 };
}
