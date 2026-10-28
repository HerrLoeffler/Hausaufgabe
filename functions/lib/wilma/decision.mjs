import {createHash} from 'node:crypto';
import {ReviewError} from './core.mjs';
import {reviewItem} from './scoring.mjs';
import {canonicalJson as json,canonicalDecisionState,decisionQuestionSnapshot} from './decision-state.mjs';
const digestText=v=>createHash('sha256').update(v).digest('hex');
const hash=v=>digestText(json(v));
const clone=v=>JSON.parse(JSON.stringify(v));
const fail=(code,message)=>{throw new ReviewError(code,message);};
const validId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
export const decisionState=s=>digestText(canonicalDecisionState(s));
function parseGaps(text){return [...String(text||'').matchAll(/\[([^\]]+)\]/g)].map(m=>({answers:m[1].split('|').map(s=>s.trim()).filter(Boolean)}));}
function selectScale(s,quiz,profile){
 const scale=s.gradeScaleSnapshot||quiz.gradeScaleSnapshot||(quiz.gradeScaleId?(profile?.gradeScales||[]).find(x=>x.id===quiz.gradeScaleId):{id:'standard',name:'Standard',thresholds:[91,77,57,39,25,0]});
 if(!scale||!Array.isArray(scale.thresholds)||scale.thresholds.length!==6||scale.thresholds.some((v,i,a)=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100||i>0&&v>a[i-1])||scale.thresholds[5]!==0)fail(409,'Notenschlüssel unklar. Bitte Testeinstellungen prüfen.');
 return scale;
}
function recalc(current,grading,questions,scale){
 const working={...current,status:'review',grading};
 let pending=false,total=0,max=0;
 for(const q of questions){
  const points=Number(q.points);if(!Number.isFinite(points)||points<0||points>100)fail(409,'Punkterahmen einer Aufgabe ist unklar.');
  const row=reviewItem(q,working,parseGaps);pending ||= row.requiresReview;total+=row.awarded;max+=points;
 }
 total=Math.round(total*10)/10;max=Math.round(max*10)/10;const percent=max?Math.round(total/max*100):0;
 pending ||= max===0;
 const grade=pending?null:Math.min(6,scale.thresholds.findIndex(v=>percent>=v)+1||6);
 return {grading,totalPoints:total,maxPoints:max,percent,grade,status:pending?'review':'graded',gradeScaleSnapshot:scale};
}
export function createDecisionService({projectId,transact,now=Date.now}){
 if(!['gradecrew-staging-2026','hausaufgabe-staging'].includes(projectId))throw new Error('Bewertungen sind für dieses Cloudprojekt nicht zugelassen.');
 return async({uid,data})=>{
  if(!uid)fail(401,'Bitte anmelden.');
  if(!data||![data.quizId,data.submissionId,data.questionId].every(validId)||typeof data.operationId!=='string'||! /^[A-Za-z0-9_-]{16,80}$/.test(data.operationId))fail(400,'Ungültige Bewertungsanfrage.');
  if(typeof data.expectedState!=='string'||! /^[a-f0-9]{64}$/.test(data.expectedState)||!data.expectedQuestions||typeof data.expectedQuestions!=='object')fail(400,'Bewertungsstand fehlt.');
  if(!!data.decision===!!data.undoOperationId)fail(400,'Genau eine Bewertungsaktion wählen.');
  const {quizId,submissionId,questionId,operationId}=data;
  const opKey=id=>hash(uid).slice(0,20)+'_'+id;
  const requestHash=hash({quizId,submissionId,questionId,decision:data.decision,undoOperationId:data.undoOperationId,expectedState:data.expectedState,expectedQuestions:data.expectedQuestions});
  return transact(async store=>{
   const quiz=await store.getQuiz(quizId),profile=await store.getProfile(uid);
   if(!quiz||quiz.ownerId!==uid||quiz.isDeleted||quiz.rightsHold||profile?.status==='suspended')fail(403,'Kein Zugriff auf diesen Test.');
   const current=await store.getSubmission(quizId,submissionId);
   if(!current)fail(404,'Abgabe nicht mehr vorhanden.');
   if(current.recoveryReviewRequired&&current.status!=='graded')fail(409,'Nachübertragung bitte in der vollständigen Abgabe prüfen.');
   const questions=await store.getQuestions(quizId);
   if(!Array.isArray(questions)||!questions.length||questions.length>100||new Set(questions.map(q=>q.id)).size!==questions.length)fail(409,'Aufgabenbestand unklar.');
   if(json(Object.fromEntries(questions.map(q=>[q.id,digestText(decisionQuestionSnapshot(q))])))!==json(data.expectedQuestions))fail(409,'Aufgabenfassung wurde inzwischen geändert. Bitte Ergebnisse aktualisieren.');
   const priorOp=await store.getOperation(opKey(operationId));
   if(priorOp){
    if(priorOp.uid!==uid||priorOp.requestHash!==requestHash)fail(409,'Diese Bewertungskennung wurde bereits anders verwendet.');
    if((current.wilmaDecisionRevision||0)!==priorOp.receipt.revision||decisionState(current)!==priorOp.afterState)fail(409,'Bewertung ist bereits gespeichert; es gibt einen neueren Stand. Bitte aktualisieren.');
    return {...priorOp.receipt,replayed:true};
   }
   if(decisionState(current)!==data.expectedState)fail(409,'Bewertung oder Antwort wurde inzwischen geändert. Bitte Ergebnisse aktualisieren.');
   if(Object.keys(current.grading||{}).some(id=>!questions.some(q=>q.id===id)))fail(409,'Bewertung enthält eine nicht mehr vorhandene Aufgabe.');
   const q=questions.find(q=>q.id===questionId);if(!q)fail(404,'Aufgabe nicht mehr vorhanden.');
   const grading=clone(current.grading||{});
   // Existing complete manual reviews stay complete when one point value changes.
   if(current.status==='graded'&&current.reviewedAt&&!Object.values(grading).some(g=>g.reviewState))for(const g of Object.values(grading))if(g.needsReview===false)g.reviewState='confirmed';
   const before=grading[questionId]?clone(grading[questionId]):null;
   if(data.undoOperationId){
    if(typeof data.undoOperationId!=='string'||! /^[A-Za-z0-9_-]{16,80}$/.test(data.undoOperationId))fail(400,'Ungültiger Rückgängig-Beleg.');
    const undo=await store.getOperation(opKey(data.undoOperationId));
    if(!undo||undo.uid!==uid||decisionState(current)!==undo.afterState||undo.quizId!==quizId||undo.submissionId!==submissionId||undo.questionId!==questionId||undo.questionsHash!==hash(data.expectedQuestions)||undo.receipt.revision!==(current.wilmaDecisionRevision||0)||current.wilmaLastOperationId!==data.undoOperationId)fail(409,'Diese Änderung kann nicht mehr sicher rückgängig gemacht werden.');
    if(undo.before===null)delete grading[questionId];else grading[questionId]=clone(undo.before);
   }else{
    const decision=data.decision;
    if(!decision||!['confirmed','deferred'].includes(decision.status))fail(400,'Unbekannte Bewertungsaktion.');
    const maximum=Number(q.points);
    if(decision.status==='confirmed'){
     if(grading[questionId]?.reviewIssue==='incomplete-transfer')fail(409,'Technischen Antwortverlust zuerst klären.');
     if(typeof decision.points!=='number'||!Number.isFinite(decision.points)||decision.points<0||decision.points>maximum||decision.points*2%1)fail(400,'Bitte gültige Punkte in 0,5-Schritten vergeben.');
    }
    grading[questionId]={...grading[questionId],maxPoints:maximum,needsReview:decision.status!=='confirmed',reviewState:decision.status};
    if(decision.status==='confirmed')grading[questionId].awardedPoints=decision.points;
   }
   const revision=(current.wilmaDecisionRevision||0)+1;
   const patch={...recalc(current,grading,questions,selectScale(current,quiz,profile)),wilmaDecisionRevision:revision,wilmaLastOperationId:operationId,wilmaLastQuestionId:questionId,reviewedAt:now(),reviewedBy:uid};
   const receipt={operationId,questionId,submissionId,revision,patch};
   store.writeSubmission(quizId,submissionId,patch);
   store.createOperation(opKey(operationId),{uid,quizId,submissionId,questionId,requestHash,questionsHash:hash(data.expectedQuestions),before,afterState:decisionState({...current,...patch}),receipt,createdAt:now(),action:data.undoOperationId?'undo':data.decision.status});
   return receipt;
  });
 };
}
