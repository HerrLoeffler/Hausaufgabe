'use strict';
const {createHash,randomUUID}=require('node:crypto');
const {feedbackMemory,qualityMemoryPrompt}=require('./quality');
const VERSION='task-feedback-v1';
const TYPES=new Set(['single','multi','text','dropdown','truefalse','gapfill','matching','ordering','grouping','markwords','number']);
const REASONS=new Set(['incorrect','answer_leak','image_mismatch','ambiguous','duplicate','other']);
const millis=v=>typeof v?.toMillis==='function'?v.toMillis():typeof v==='number'&&Number.isFinite(v)?v:0;
const norm=v=>String(v||'').normalize('NFKC').trim().toLowerCase();
const fail=(code,message)=>{throw Object.assign(Error(message),{code});};
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
function signature(row){return createHash('sha256').update(JSON.stringify(canonical({userId:row.userId||'',testCode:row.testCode||'',questionId:row.questionId||'',questionType:row.questionType||'',verdict:row.verdict||'',reason:row.reason||'',subject:row.subject||'',grade:row.grade||'',questionSnapshot:row.questionSnapshot||{},reviewOutcome:row.reviewOutcome||'',createdAt:millis(row.createdAt)}))).digest('hex');}
function approved(row){return row.sharedLearning?.decision==='approved'&&row.sharedLearning?.reviewSignature===signature(row);}
function usable(row){return row?.category==='ai_question'&&['good','bad'].includes(row.verdict)&&row.reviewOutcome!=='false_positive';}
function clean(row){
 const q=row.questionSnapshot||{},candidateType=q.type||row.questionType,type=TYPES.has(candidateType)?candidateType:'Aufgabe';
 const mediaKind=q.imageChoices===true||q.mediaIntent?.kind==='image_choices'?'image_choices':q.imagePresent===true||q.mediaIntent?.kind==='ai_generated'?'ai_generated':q.imagePresent===false||q.mediaIntent?.kind==='none'?'none':'unknown';
 const reason=({content_wrong:'incorrect',answer_wrong:'incorrect',unclear:'ambiguous',off_topic:'other'})[row.reason]||row.reason;
 return {category:'ai_question',userId:row.userId,verdict:row.verdict,reason:REASONS.has(reason)?reason:'other',subject:String(row.subject||'').slice(0,120),grade:String(row.grade||'').slice(0,60),questionType:type,
 questionSnapshot:{type,text:'x'.repeat(Math.min(900,String(q.text||'').length)),points:Number.isFinite(q.points)&&q.points>0&&q.points<=100?q.points:0,options:Array.from({length:Math.min(6,Array.isArray(q.options)?q.options.length:0)},()=>({text:'',correct:false})),imagePresent:q.imagePresent===true||q.mediaIntent?.kind==='ai_generated',imageChoices:q.imageChoices===true||q.mediaIntent?.kind==='image_choices',passage:q.passage?'x':'',mediaIntent:{kind:mediaKind}}};
}
function latestFeedback(rows){
 const latest=new Map();for(const row of [...rows].filter(r=>r?.category==='ai_question'&&['good','bad'].includes(r.verdict)).sort((a,b)=>millis(b.createdAt)-millis(a.createdAt)||String(b.id).localeCompare(String(a.id)))){
  if(!/^[\w-]{1,128}$/.test(row.id||''))continue;const key=[row.userId||'',row.testCode||'',row.questionId||row.id].join(':');if(!latest.has(key))latest.set(key,row);
 }return [...latest.values()];
}
function relevant(row,context){const type=row.questionType||row.questionSnapshot?.type;return usable(row)&&!(context.subject&&row.subject&&norm(context.subject)!==norm(row.subject)||context.grade&&row.grade&&norm(context.grade)!==norm(row.grade)||context.questionType&&type&&context.questionType!==type);}
function buildFeedbackLearning(rows,context={},uid=''){
 const current=latestFeedback(rows).filter(row=>relevant(row,context));const own=current.filter(r=>uid&&r.userId===uid).slice(0,50),shared=current.filter(approved).slice(0,50);
 const memory=feedbackMemory(shared.map(clean),context);memory.personal=feedbackMemory(own.map(clean),context);
 // Raw negative examples and comments are deliberately never supplied to a provider.
 memory.negativeQuestions=[];memory.personal.negativeQuestions=[];
 memory.learning={version:VERSION,generationId:randomUUID(),sources:[...own.map(r=>({id:r.id,scope:'personal',signature:signature(r)})),...shared.map(r=>({id:r.id,scope:'shared',signature:signature(r),reviewRevision:r.sharedLearning.revision}))]};
 return memory;
}
function learningPrompt(memory={}){
 const personal=memory.personal?.stats||{},shared=memory.stats||{};const lines=[];
 if(personal.total)lines.push(`Bewertungsgedächtnis persönlich: ${personal.total} eigene Signale (${personal.good||0} gut, ${personal.bad||0} gemeldet). Als Präferenz und zusätzlichen Prüfauftrag berücksichtigen; fachliche Richtigkeit niemals überschreiben. Bei Meldungen ohne konkreten Grund Verständlichkeit und Lösung besonders prüfen.\n${qualityMemoryPrompt(memory.personal)}`);
 if(shared.total)lines.push(`Bewertungsgedächtnis gemeinsam: ${shared.total} fachlich freigegebene strukturierte Signale (${shared.good||0} gut, ${shared.bad||0} gemeldet). Keine fremden Aufgaben kopieren; Richtigkeit unabhängig prüfen.\n${qualityMemoryPrompt(memory)}`);
 return lines.join('\n');
}
async function loadFeedbackLearning(db,context={},uid=''){
 const fields=['category','userId','testCode','questionId','verdict','reason','subject','grade','questionType','reviewOutcome','createdAt','feedbackSchemaVersion','sharedLearning.decision','sharedLearning.revision','sharedLearning.reviewSignature'];
 const base=()=>db.collection('feedback').where('category','==','ai_question');
 // The recent metadata window includes withdrawals/unapproved replacements. No unreviewed foreign task text is selected.
 const queries=[base().orderBy('createdAt','desc').limit(500).select(...fields)];if(uid)queries.push(base().where('userId','==',uid).orderBy('createdAt','desc').limit(100).select(...fields,'questionSnapshot'));
 const snapshots=await Promise.all(queries.map(q=>q.get()));const rows=new Map();for(const snap of snapshots)for(const doc of snap.docs)rows.set(doc.id,{...doc.data(),id:doc.id});
 const candidates=latestFeedback([...rows.values()]).filter(row=>relevant(row,context)&&row.sharedLearning?.decision==='approved').slice(0,50);
 for(const row of candidates){if(!row.questionSnapshot){const doc=await db.doc('feedback/'+row.id).get();if(doc.exists)rows.set(row.id,{...doc.data(),id:row.id});}}
 const memory=buildFeedbackLearning([...rows.values()],context,uid);
 if(uid){try{const profile=await db.doc('users/'+uid).get();memory.teacherPreferences=String(profile.data()?.aiPreferences||'').slice(0,1000);}catch{memory.teacherPreferences='';}}
 return memory;
}

function learningProjection(row){
 const sig=signature(row),personal=row.learningUse?.personal,shared=row.learningUse?.shared,decision=row.sharedLearning?.decision;
 const ownUsed=personal?.signature===sig&&personal.version===VERSION,sharedUsed=shared?.signature===sig&&shared.version===VERSION&&shared.reviewRevision===row.sharedLearning?.revision&&approved(row);
 return {reviewSignalSignature:sig,learningVersion:VERSION,personalLearningStatus:!usable(row)?'not_eligible':ownUsed?'applied':'eligible_no_evidence',sharedLearningStatus:decision==='rejected'?'rejected':decision==='approved'?(!approved(row)?'review_outdated':sharedUsed?'applied':'approved_pending_use'):'pending_review',
 personalAppliedAt:ownUsed?millis(personal.at)||null:null,sharedAppliedAt:sharedUsed?millis(shared.at)||null:null,personalAppliedOperation:ownUsed?String(personal.operation||''): '',sharedAppliedOperation:sharedUsed?String(shared.operation||''):'',reviewEvidence:String(row.sharedLearning?.evidence||'').slice(0,1000),reviewRevision:Number(row.sharedLearning?.revision)||0,
 processingEvidence:ownUsed||sharedUsed?'model_prompt_use_recorded':row.feedbackSchemaVersion===4?'no_model_use_receipt':'legacy_no_prior_evidence'};
}
async function reviewFeedbackLearning({tx,uid,data,now,toTimestamp}){
 if(Object.keys(data).some(k=>!['action','id','decision','revision','evidence','expectedSignature'].includes(k))||!/^[\w-]{1,128}$/.test(data.id||'')||!['approved','rejected'].includes(data.decision)||!Number.isInteger(data.revision)||!/^[a-f0-9]{64}$/.test(data.expectedSignature||'')||typeof data.evidence!=='string'||!data.evidence.trim()||data.evidence.length>1000)fail('invalid-argument','Prüfung und kurze fachliche Begründung erforderlich.');
 const path='feedback/'+data.id,row=await tx.get(path);if(!usable(row))fail('invalid-argument','Keine verwendbare Aufgabenbewertung.');
 if(data.expectedSignature!==signature(row)||(row.sharedLearning?.revision||0)!==data.revision)fail('aborted','Die Lernfreigabe wurde inzwischen geändert. Bitte aktualisieren.');
 const reviewed={...row,sharedLearning:{decision:data.decision,revision:data.revision+1,evidence:data.evidence.trim(),reviewedBy:uid,reviewedAt:toTimestamp(now),reviewSignature:signature(row)}};tx.set(path,reviewed);
 tx.set(`adminAudit/feedback-learning-${data.id}-${data.revision+1}`,{action:'feedback_learning_reviewed',actorId:uid,createdAt:toTimestamp(now),details:{feedbackId:data.id,decision:data.decision,revision:data.revision+1}});
 return {id:data.id,learning:learningProjection(reviewed)};
}
async function recordLearningUse(db,memory,{uid,operation,at=Date.now(),toTimestamp=n=>require('firebase-admin/firestore').Timestamp.fromMillis(n)}){
 if(!['generateTest','generateTestVariant','regenerateQuestion','reviseWholeTest'].includes(operation))fail('invalid-argument','Ungültige Lernoperation.');
 const sources=memory?.learning?.sources||[];if(!sources.length)return {recorded:0};
 const real=typeof db.doc==='function';
 return db.runTransaction(async tx=>{
  const unique=[...new Set(sources.map(s=>s.id))];const current=new Map();
  for(const id of unique){const raw=await tx.get(real?db.doc('feedback/'+id):'feedback/'+id);current.set(id,real?(raw.exists?raw.data():null):raw);}
  let recorded=0;
  for(const id of unique){const row=current.get(id);if(!row)continue;let use={...row.learningUse};let changed=false;
   for(const source of sources.filter(s=>s.id===id)){
    if(source.signature!==signature(row)||source.scope==='personal'&&row.userId!==uid||source.scope==='shared'&&(!approved(row)||row.sharedLearning.revision!==source.reviewRevision))continue;
    const previous=use[source.scope]||{};const seen=previous.recentGenerationIds||[previous.generationId].filter(Boolean);if(seen.includes(memory.learning.generationId))continue;
    const entry={version:VERSION,generationId:memory.learning.generationId,signature:source.signature,operation,at:toTimestamp(at),...(source.scope==='shared'?{reviewRevision:source.reviewRevision}:{})};
    use[source.scope]={...(millis(previous.at)>at?previous:entry),count:(Number(previous.count)||0)+1,recentGenerationIds:[...seen,memory.learning.generationId].slice(-50)};changed=true;recorded++;
   }
   if(changed){if(real)tx.set(db.doc('feedback/'+id),{learningUse:use},{merge:true});else tx.set('feedback/'+id,{...row,learningUse:use});}
  }
  return {recorded};
 });
}
async function loadFeedbackLearningSafe(db,context={},uid=''){try{return await loadFeedbackLearning(db,context,uid);}catch(error){console.warn('Bewertungsgedächtnis nicht verfügbar.',{code:error?.code||'unavailable'});return {...feedbackMemory([],context),unavailable:true};}}
async function recordLearningUseSafe(db,memory,options){try{return await recordLearningUse(db,memory,options);}catch(error){console.warn('Bewertungseinsatz konnte nicht protokolliert werden.',{code:error?.code||'unavailable'});return {recorded:0,unavailable:true};}}
module.exports={VERSION,loadFeedbackLearningSafe,recordLearningUseSafe,signalSignature:signature,buildFeedbackLearning,learningPrompt,loadFeedbackLearning,learningProjection,reviewFeedbackLearning,recordLearningUse};
