import {createRequire} from 'node:module';import {randomBytes,randomUUID} from 'node:crypto';import {makeVariation} from './variations.mjs';
const require=createRequire(import.meta.url);const core=require('../../assessment-functions/lib/assessment-core.js');const decoder=require('../../assessment-functions/lib/teacher-answer-decoder.js');const schoolExport=require('../../assessment-functions/lib/school-export-core.js');
const clone=v=>structuredClone(v);
export function createExtendedService({state={draft:null,published:null,attempts:{}},persist=async()=>{},ai=null}={}){
 const metadata=()=>({id:'EXTENDED',title:state.published.quiz.title,subject:state.published.quiz.subject,grade:state.published.quiz.grade,gradeScaleSnapshot:clone(state.published.quiz.gradeScaleSnapshot),description:'Lokaler Aufgabentest · Abgaben bleiben auf diesem Mac',questionCount:state.published.questions.length,totalPoints:state.published.questions.reduce((n,q)=>n+q.points,0),timeLimitMinutes:0,startMode:'student',resultMode:'points_grade',showSolutions:false,sessionRunId:state.published.revision,published:true,ended:false});
 const access=data=>{const a=state.attempts[data.attemptId];if(!a||!core.secureTokenMatches(data.attemptToken,a.tokenHash))throw Error('Lokaler Bearbeitungsversuch nicht berechtigt.');return a;};
 async function execute(action,data={}){
  if(['ai-start','ai-status','ai-active'].includes(action)){if(!ai)throw Error('Die vorhandene Test-KI ist für diesen lokalen Start nicht aktiviert.');if(action==='ai-start'){try{return await ai.start(data);}catch(e){if(!state.aiJobs?.[data.requestId])e.code='invalid-argument';throw e;}}return action==='ai-status'?ai.status(data.requestId):{job:ai.active()};}
  if(action==='preview-grade'){
   return {grading:Object.fromEntries((data.questions||[]).map(q=>{const key=core.buildGradingKey(q,'local-preview'),r=core.gradeQuestion(key,data.answers?.[q.id]);return [q.id,{awarded:r.awardedPoints,max:r.maxPoints,needsReview:r.needsReview,correct:r.correct}];}))};
  }
  if(action==='emmi')throw Error('Bitte echte KI-Überarbeitung verwenden.');
  if(action==='teacher')return {test:state.draft};
  if(action==='generate'){
   if(data.count!==undefined&&data.count!==9||data.points!==undefined&&data.points!==24)throw Error('Die vorbereiteten Varianten haben je9Aufgaben und24Punkte.');
   state.draft=makeVariation(Number(data.variant)||1);await persist(state);return {test:clone(state.draft),simulated:true};
  }

  if(action==='save'||action==='publish'){
   if(!data.quiz||!Array.isArray(data.questions)||data.questions.length>20)throw Error('Ungültiger Beispieltest.');
   const questions=clone(data.questions);const secret=randomBytes(32).toString('base64url');const contract=core.buildAssessmentContract(questions,secret);core.assertNoSolutionLeak(contract.paper);
   state.draft={...clone(data.quiz),questions};
   if(action==='publish')state.published={quiz:clone(data.quiz),questions,secret,contract,revision:randomUUID()};
   await persist(state);return {saved:true};
  }
  if(action==='review'){
   const a=state.attempts[data.submissionId];if(!a?.receipt||a.revision!==state.published?.revision)throw Error('Keine aktuelle lokale Abgabe.');
   if(typeof data.operationId!=='string'||!/^op_[a-f0-9]{32}$/.test(data.operationId)||typeof data.reason!=='string'||data.reason.trim().length<4)throw Error('Bitte einen Korrekturgrund angeben.');
   const existing=(a.reviewHistory||[]).find(event=>event.id===data.operationId);if(existing)return {saved:true,repeated:true};
   const keys=a.contract.gradingKey;const points=data.points;
   if(!points||Object.keys(points).length!==keys.length||keys.some(k=>!Number.isFinite(points[k.id])||points[k.id]<0||points[k.id]>k.points||points[k.id]*2!==Math.round(points[k.id]*2)))throw Error('Ungültige Korrekturpunkte.');
   const before={grading:clone(a.result.grading),totalPoints:a.result.totalPoints,maxPoints:a.result.maxPoints,percent:a.result.percent,grade:a.receipt.grade,status:a.receipt.needsReview?'review':'graded'};
   for(const k of keys)a.result.grading[k.id]={...a.result.grading[k.id],awardedPoints:points[k.id],needsReview:false};
   a.result.totalPoints=Object.values(points).reduce((n,v)=>n+v,0);a.result.percent=Math.round(a.result.totalPoints/a.result.maxPoints*100);a.result.needsReview=false;
   a.receipt={...a.receipt,...a.result,grade:core.gradeFromPercent(a.result.percent,a.quiz.gradeScaleSnapshot?.thresholds),localBreakdown:Object.values(a.result.grading).map((g,i)=>({number:i+1,points:g.awardedPoints,max:g.maxPoints}))};
   const after={grading:clone(a.result.grading),totalPoints:a.result.totalPoints,maxPoints:a.result.maxPoints,percent:a.result.percent,grade:a.receipt.grade,status:'graded'};
   a.reviewHistory=[...(a.reviewHistory||[]),{id:data.operationId,kind:'review',atMillis:Date.now(),actorUid:'local-example-teacher',reason:data.reason.trim(),before,after}];
   await persist(state);return {saved:true};
  }
  if(action==='school-export'){
   const a=state.attempts[data.submissionId];if(!a?.receipt||a.revision!==state.published?.revision)throw Error('Keine aktuelle lokale Abgabe.');
   const submission={studentName:a.studentName,answers:decoder.decodeSubmissionAnswersFromShape(decoder.buildTeacherDecoderShape(a.questions),a.answers,a.secret),grading:a.result.grading,totalPoints:a.result.totalPoints,maxPoints:a.result.maxPoints,percent:a.result.percent,grade:a.receipt.grade,gradeScaleSnapshot:a.quiz.gradeScaleSnapshot,status:a.result.needsReview?'review':'graded',secureAssessmentVersion:2,questionSnapshotVersion:1,startedAtServerMillis:null};
   const questions=a.questions.map(q=>({id:q.id,data:q,source:'submission-snapshot',recordedAtMillis:Date.parse(a.submittedAt)}));
   const record=schoolExport.buildExportRecord({quizId:'EXTENDED',submissionId:a.id,quiz:a.quiz,submission,questions,events:a.reviewHistory||[],exportedAtMillis:Date.now()});
   record.gaps.push({field:'serverSubmissionReceipt',reason:'local-synthetic-preview-only'});
   return record;
  }
  if(action==='undo'){
   const a=state.attempts[data.submissionId];if(!a?.receipt||a.revision!==state.published?.revision)throw Error('Keine aktuelle lokale Abgabe.');
   if(typeof data.operationId!=='string'||!/^op_[a-f0-9]{32}$/.test(data.operationId)||typeof data.reason!=='string'||data.reason.trim().length<4)throw Error('Bitte einen Rücknahmegrund angeben.');
   const existing=(a.reviewHistory||[]).find(event=>event.id===data.operationId);if(existing)return {saved:true,repeated:true};
   const latest=a.reviewHistory?.at(-1);if(!latest||latest.kind==='undo')throw Error('Keine letzte Korrektur zum Zurücknehmen.');
   if(JSON.stringify(a.result.grading)!==JSON.stringify(latest.after.grading)||a.result.totalPoints!==latest.after.totalPoints)throw Error('Bewertung inzwischen geändert. Bitte neu laden.');
   const before=clone(latest.after);
   a.result.grading=clone(latest.before.grading);a.result.totalPoints=latest.before.totalPoints;a.result.maxPoints=latest.before.maxPoints;a.result.percent=latest.before.percent;a.result.needsReview=latest.before.status==='review';
   a.receipt={...a.receipt,...a.result,grade:latest.before.grade};
   const after=clone(latest.before);
   a.reviewHistory.push({id:data.operationId,kind:'undo',undoOf:latest.id,atMillis:Date.now(),actorUid:'local-example-teacher',reason:data.reason.trim(),before,after});
   await persist(state);return {saved:true};
  }
  if(action==='results'){
   const submissions=Object.values(state.attempts).filter(a=>a.receipt&&a.revision===state.published?.revision).map(a=>({id:a.id,studentName:a.studentName,answers:decoder.decodeSubmissionAnswersFromShape(decoder.buildTeacherDecoderShape(a.questions),a.answers,a.secret),...a.receipt,...a.result,status:'graded',submittedAtLocal:a.submittedAt,reviewCount:a.reviewHistory?.length||0,schoolReviewLastKind:a.reviewHistory?.at(-1)?.kind||null}));return {submissions,questions:state.published?.questions||[],quiz:state.published?.quiz||null};
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
