import {assertLabQuestions,labQuestionAllowed} from './format-policy.mjs';import {makeTableExamples} from './table-examples.mjs';
import {createRequire} from 'node:module';import {randomBytes,randomUUID} from 'node:crypto';import {makeVariation} from './variations.mjs';
const require=createRequire(import.meta.url);const core=require('../../assessment-functions/lib/assessment-core.js');const decoder=require('../../assessment-functions/lib/teacher-answer-decoder.js');
const clone=v=>structuredClone(v);
export function createExtendedService({state={draft:null,published:null,attempts:{}},persist=async()=>{},ai=null}={}){
 const metadata=()=>({id:'EXTENDED',title:state.published.quiz.title,subject:state.published.quiz.subject,grade:state.published.quiz.grade,gradeScaleSnapshot:clone(state.published.quiz.gradeScaleSnapshot),description:'Lokaler Aufgabentest · Abgaben bleiben auf diesem Mac',questionCount:state.published.questions.length,totalPoints:state.published.questions.reduce((n,q)=>n+q.points,0),timeLimitMinutes:0,startMode:'student',resultMode:'points_grade',showSolutions:false,sessionRunId:state.published.revision,published:true,ended:false});
 const access=data=>{const a=state.attempts[data.attemptId];if(!a||!core.secureTokenMatches(data.attemptToken,a.tokenHash))throw Error('Lokaler Bearbeitungsversuch nicht berechtigt.');return a;};
 function archiveDraft(draft,reason){if(!draft||!Array.isArray(draft.questions))return;state.draftArchive??=[];state.draftArchive.push({at:new Date().toISOString(),reason,draft:clone(draft)});}
 async function execute(action,data={}){
  if(['ai-start','ai-status','ai-active'].includes(action)){if(!ai)throw Error('Die vorhandene Test-KI ist für diesen lokalen Start nicht aktiviert.');if(action==='ai-start'){try{return await ai.start(data);}catch(e){if(!state.aiJobs?.[data.requestId])e.code='invalid-argument';throw e;}}return action==='ai-status'?ai.status(data.requestId):{job:ai.active()};}
  if(action==='preview-grade'){
   return {grading:Object.fromEntries((data.questions||[]).map(q=>{const key=core.buildGradingKey(q,'local-preview'),r=core.gradeQuestion(key,data.answers?.[q.id]);return [q.id,{awarded:r.awardedPoints,max:r.maxPoints,needsReview:r.needsReview,correct:r.correct}];}))};
  }
  if(action==='emmi')throw Error('Bitte echte KI-Überarbeitung verwenden.');
  if(action==='teacher'){const old=state.draft?.questions||[],kept=old.filter(labQuestionAllowed),removedCount=old.length-kept.length;if(removedCount){state.retiredDraftArchive??=[];state.retiredDraftArchive.push({at:new Date().toISOString(),draft:clone(state.draft)});state.draft=kept.length?{...state.draft,questions:kept.map((q,i)=>({...q,position:i+1}))}:null;await persist(state);}return {test:state.draft,removedCount};}
  if(action==='table-examples'){archiveDraft(data.currentDraft||state.draft,'Tabellenbeispiele geöffnet');state.draft=makeTableExamples();await persist(state);return {test:clone(state.draft)};}
  if(action==='drafts')return {drafts:[...(state.draftArchive||[]).map((x,i)=>({id:'draft'+i,...x})),...(state.retiredDraftArchive||[]).map((x,i)=>({id:'retired'+i,...x}))].sort((a,b)=>b.at.localeCompare(a.at)).map(x=>({id:x.id,title:x.draft.title||'Entwurf',at:x.at,questionCount:x.draft.questions.length}))};
  if(action==='restore-draft'){const match=/^(draft|retired)(\d+)$/.exec(data.id||'');const item=match&&(match[1]==='draft'?state.draftArchive:state.retiredDraftArchive)?.[Number(match[2])];if(!item)throw Error('Gesicherter Entwurf nicht gefunden.');const restored=clone(item.draft);restored.questions=restored.questions.filter(labQuestionAllowed).map((q,i)=>({...q,position:i+1}));if(!restored.questions.length)throw Error('Dieser alte Entwurf enthält keine der acht freigegebenen Aufgabenarten. Das Original bleibt gesichert.');archiveDraft(data.currentDraft||state.draft,'Vor Wiederherstellung');state.draft=restored;await persist(state);return {test:clone(state.draft)};}
  if(action==='generate'){
   if(data.count!==undefined&&data.count!==9||data.points!==undefined&&data.points!==24)throw Error('Die vorbereiteten Varianten haben je9Aufgaben und24Punkte.');
   archiveDraft(data.currentDraft||state.draft,'Beispielmischung geöffnet');state.draft=makeVariation(Number(data.variant)||1);await persist(state);return {test:clone(state.draft),simulated:true};
  }

  if(action==='save'||action==='publish'){
   if(!data.quiz||!Array.isArray(data.questions)||data.questions.length>20)throw Error('Ungültiger Beispieltest.');
   assertLabQuestions(data.questions);const questions=clone(data.questions);const secret=randomBytes(32).toString('base64url');const contract=core.buildAssessmentContract(questions,secret);core.assertNoSolutionLeak(contract.paper);
   state.draft={...clone(data.quiz),questions};
   if(action==='publish')state.published={quiz:clone(data.quiz),questions,secret,contract,revision:randomUUID()};
   await persist(state);return {saved:true};
  }
  if(action==='review'){
   const a=state.attempts[data.submissionId];if(!a?.receipt||a.revision!==state.published?.revision)throw Error('Keine aktuelle lokale Abgabe.');
   const keys=a.contract.gradingKey;const points=data.points;
   if(!points||Object.keys(points).length!==keys.length||keys.some(k=>!Number.isFinite(points[k.id])||points[k.id]<0||points[k.id]>k.points||points[k.id]*2!==Math.round(points[k.id]*2)))throw Error('Ungültige Korrekturpunkte.');
   a.reviewHistory=[...(a.reviewHistory||[]),{at:new Date().toISOString(),actor:'local-example-teacher',previousPoints:a.receipt.totalPoints}];
   for(const k of keys)a.result.grading[k.id]={...a.result.grading[k.id],awardedPoints:points[k.id],needsReview:false};
   a.result.totalPoints=Object.values(points).reduce((n,v)=>n+v,0);a.result.percent=Math.round(a.result.totalPoints/a.result.maxPoints*100);a.result.needsReview=false;
   a.receipt={...a.receipt,...a.result,grade:core.gradeFromPercent(a.result.percent,a.quiz.gradeScaleSnapshot?.thresholds),localBreakdown:Object.values(a.result.grading).map((g,i)=>({number:i+1,points:g.awardedPoints,max:g.maxPoints}))};await persist(state);return {saved:true};
  }
  if(action==='results'){
   const submissions=Object.values(state.attempts).filter(a=>a.receipt&&a.revision===state.published?.revision).map(a=>({id:a.id,studentName:a.studentName,answers:decoder.decodeSubmissionAnswersFromShape(decoder.buildTeacherDecoderShape(a.questions),a.answers,a.secret),...a.receipt,...a.result,status:'graded',submittedAtLocal:a.submittedAt}));return {submissions,questions:state.published?.questions||[],quiz:state.published?.quiz||null};
  }
  if(!state.published)throw Error('Zuerst den lokalen Beispieltest im Editor veröffentlichen.');
  if(action==='getAssessmentInfo')return {quiz:metadata()};
  if(action==='startAssessmentAttempt'){
   if(typeof data.studentName!=='string'||!data.studentName.trim()||data.studentName.length>120||!core.validAttemptToken(data.attemptToken))throw Error('Ungültiger Beispielstart.');
   let a=Object.values(state.attempts).find(a=>a.clientAttemptId===data.clientAttemptId&&a.revision===state.published.revision);
   if(a){if(!core.secureTokenMatches(data.attemptToken,a.tokenHash))throw Error('Starttoken stimmt nicht.');}
   else {const p=state.published;a={id:randomUUID(),clientAttemptId:data.clientAttemptId,tokenHash:core.tokenHash(data.attemptToken),revision:p.revision,studentName:data.studentName,contract:p.contract,secret:p.secret,questions:p.questions,quiz:metadata()};state.attempts[a.id]=a;await persist(state);}
   return {attemptId:a.id,studentName:a.studentName,status:a.receipt?'submitted':'running',sessionRunId:a.revision,quiz:a.quiz,...(a.receipt?{receipt:a.receipt}:{paper:a.contract.paper})};
  }
  const a=access(data);
  if(action==='submitAssessmentAttempt'){
   if(!a.receipt){a.answers=core.sanitizeAnswersForStorage(a.contract.gradingKey,data.answers);a.result=core.gradeSubmission(a.contract.gradingKey,a.answers);a.receipt={...a.result,grade:core.gradeFromPercent(a.result.percent,a.quiz.gradeScaleSnapshot?.thresholds),attemptId:a.id,resultMode:'points_grade',localPrototype:true,localBreakdown:Object.values(a.result.grading).map((g,i)=>({number:i+1,points:g.awardedPoints,max:g.maxPoints}))};a.submittedAt=new Date().toISOString();await persist(state);}
   return {receipt:a.receipt};
  }
  if(action==='resumeAssessmentAttempt'||action==='getAssessmentReceipt')return {attemptId:a.id,studentName:a.studentName,status:a.receipt?'submitted':'running',sessionRunId:a.revision,quiz:a.quiz,...(a.receipt?{receipt:a.receipt}:data.stateOnly?{}:{paper:a.contract.paper})};
  throw Error('Dieser lokale Beispielaufruf ist nicht implementiert.');
 }
 return {execute,state};
}
