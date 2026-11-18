'use strict';
const {createHash}=require('node:crypto');
const OpenAI=require('openai');
const {HttpsError}=require('firebase-functions/v2/https');
const {parseStructuredResponse}=require('../../../functions/lib/structured-response');
const {RUN,VERSION,cases}=require('./cases.cjs');
const {profile,planSchema,judgeSchema,generatorInstruction,judgeInstruction}=require('./prompts.cjs');
const {buildCandidate,visibleProblem}=require('./builder.cjs');
const {checkCandidate}=require('./checker.cjs');
const {reserve,settle,authorizeRun,runRef}=require('./store.cjs');
const {score}=require('../review.cjs');
const {core,parseVisualTask}=require('../../../functions/lib/visual-task');
const graph=require('./graph.cjs');
const autoManifest=require('./auto-manifest.cjs');
const variants={
  [VERSION]:{version:VERSION,run:RUN,cases,profile,planSchema,judgeSchema,generatorInstruction,judgeInstruction,build:buildCandidate,visible:visibleProblem,check:checkCandidate},
  [graph.GRAPH_VERSION]:{version:graph.GRAPH_VERSION,run:graph.GRAPH_RUN,cases:graph.GRAPH_CASES,profile:graph.graphProfile,
    planSchema:graph.graphSchema,judgeSchema:graph.graphJudgeSchema,generatorInstruction:graph.graphInstruction,judgeInstruction:graph.graphJudgeInstruction,
    build:graph.buildGraph,visible:graph.visibleGraph,check:graph.checkGraph}
};
function variant(version=VERSION){
  if(!variants[version])throw new HttpsError('failed-precondition','Unbekannte Rezeptversion.');
  return variants[version];
}
const PREFIX='training:';
const ID=/^[a-z0-9-]{1,70}$/;
const PRICES={'gpt-6-luna':{input:.1,output:.5},'gpt-6.2-sol':{input:2,output:10}};
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const safeError=e=>String(e.message||'Auftrag unbestätigt.').slice(0,300);
const now=()=>new Date().toISOString();

async function getRun(db,id,uid){
  if(typeof id!=='string'||!ID.test(id))throw new HttpsError('invalid-argument','Ungültige Serie.');
  const run=(await runRef(db,id).get()).data();
  if(!authorizeRun(run,uid))throw new HttpsError('permission-denied','Keine eigene oder freigegebene Erprobung.');
  return run;
}
async function createRun({db,uid,data}){
  let auto=null;
  if(data.autoPhase!==undefined){try{auto=autoManifest.phasePlan(data.autoPhase);}catch(e){throw new HttpsError('invalid-argument',e.message);}}
  const calibration=data.calibration===true||!!auto;
  if(auto&&uid!=='gc-visual255-e2e')throw new HttpsError('permission-denied','Nur das synthetische Testkonto darf automatische Phasen anlegen.');
  const automatic=auto?await require('./auto-loop.cjs').preparePhase(db,auto.phase,data.strategyHint):null;
  const strategyHint=automatic?.strategyHint||'';
  if(strategyHint.length>800||auto&&['dev0','test0'].includes(auto.phase)&&strategyHint)throw new HttpsError('invalid-argument','Unzulässiger Rezeptvergleich.');
  if(data.family!==undefined&&!['dreisatz','fields-arrows'].includes(data.family))throw new HttpsError('invalid-argument','Unbekannte Aufgabenfamilie.');
  const config=variant(auto||data.family==='fields-arrows'?graph.GRAPH_VERSION:VERSION);
  if(calibration&&uid!=='gc-visual255-e2e')throw new HttpsError('permission-denied','Die Referenzserie wird nur einmal durch das Testkonto angelegt.');
  const wish=typeof data.wish==='string'?data.wish.trim():'';
  if(!calibration&&(!/^[a-f0-9-]{36}$/i.test(data.requestId||'')||wish.length<8||wish.length>1000))throw new HttpsError('invalid-argument','Wunsch in 8 bis 1000 Zeichen angeben.');
  const id=auto?auto.runId:calibration?config.run:(config.version===VERSION?'wish-'+digest([uid,data.requestId]).slice(0,32):'graph-'+digest([uid,data.requestId,config.version]).slice(0,32));
  const manifest=auto?auto.cases:calibration?config.cases:[{id:'wish',family:'free-wish',wish}];
  const hash=digest([config.version,manifest,...(auto?[strategyHint]:[])]);
  const run=runRef(db,id),recipe=db.doc('taskLearningRecipes/'+config.version);
  const quota=db.doc('taskLearningQuotas/'+digest([uid,new Date().toISOString().slice(0,10)]));
  await db.runTransaction(async tx=>{
    const old=await tx.get(run);
    if(old.exists){if(old.data().manifestHash!==hash)throw new HttpsError('failed-precondition','Die Anfrage-ID gehört zu einem anderen Wunsch.');return;}
    const priorRecipe=await tx.get(recipe),current=await tx.get(quota);
    const session=auto?db.doc('taskLearningAutoRuns/'+autoManifest.SESSION):null;
    const priorSession=session?await tx.get(session):null;
    const count=current.data()?.count||0;
    if(!calibration&&count>=6)throw new HttpsError('resource-exhausted','Heute sind die sechs neuen Erprobungswünsche aufgebraucht.');
    if(session&&!priorSession.exists)tx.create(session,{id:autoManifest.SESSION,ownerId:uid,limitMicros:5000000,reservedMicros:0,spentMicros:0,status:'running',createdAt:now(),authorization:'Martin approved 5 USD total for first autonomous experiment'});
    if(auto?.phase==='probe'){const saved=priorSession.data();if(saved.status!=='completed'||saved.reservedMicros!==0)throw new HttpsError('failed-precondition','Studie erst abschließen.');tx.update(session,{probeStatus:'running',studySpentMicros:saved.studySpentMicros??saved.spentMicros,probeStartedAt:now()});}
    if(!priorRecipe.exists)tx.create(recipe,{...config.profile,createdAt:now()});
    tx.create(run,{id,ownerId:uid,sharedPilot:calibration,recipeVersion:config.version,manifestHash:hash,expected:manifest.length,
      ...(auto?{autoSessionId:autoManifest.SESSION,autoPhase:auto.phase,strategyHint,recipeHash:automatic.recipeHash,...(auto.phase==='probe'?{autoPostStudyProbe:true}:{})}:{}),
      limitMicros:auto?.phase==='probe'?200000:auto?5000000:calibration?(config.version===VERSION?5000000:1000000):200000,spentMicros:0,reservedMicros:0,status:'running',createdAt:now(),
      priceSnapshot:{at:'2026-11-18',currency:'USD',perMillionTokens:PRICES,source:'https://developers.openai.com/api/docs/pricing'}});
    if(!calibration)tx.set(quota,{ownerId:uid,count:count+1});
    for(const [position,c] of manifest.entries())tx.create(db.doc(run.path+'/cases/'+c.id),{...c,position,attempt:1,status:'pending',createdAt:now()});
  });
  return {runId:id,quizId:PREFIX+id};
}
function providerRequest(phase,input,version=VERSION){
  const config=variant(version);
  const model=phase==='generate'?'gpt-6-luna':'gpt-6.2-sol';
  return {model,store:false,max_output_tokens:3000,reasoning:{effort:'low'},
    input:[{role:'system',content:phase==='generate'?config.generatorInstruction:config.judgeInstruction},
      {role:'user',content:JSON.stringify(input)}],
    text:{format:{type:'json_schema',name:'remy_training_'+phase,strict:true,schema:phase==='generate'?config.planSchema:config.judgeSchema}}};
}
function reservationCost(request){
  const inputBound=Buffer.byteLength(JSON.stringify(request),'utf8')+2048;
  return Math.ceil(inputBound*PRICES[request.model].input+request.max_output_tokens*PRICES[request.model].output);
}
async function providerCall({db,runId,stepId,phase,input,secret,client,version=VERSION,customRequest}){
  const request=customRequest||providerRequest(phase,input,version);
  if(!PRICES[request.model]||request.max_output_tokens>3000)throw Error('Nicht zugelassener Providerauftrag.');
  const amount=reservationCost(request);
  const reservation=await reserve(db,runId,stepId,amount);
  if(!reservation.dispatch){
    if(reservation.call.status==='completed'&&reservation.call.response)return reservation.call.response;
    const error=new HttpsError('failed-precondition','Dieser Aufruf ist gespeichert, sein Ergebnis noch unbestätigt. Es wird kein zweiter gestartet.');
    error.pendingProvider=true;
    throw error;
  }
  await db.doc(runRef(db,runId).path+'/providerCalls/'+stepId).update({phase,recipeVersion:version,requestHash:digest(request),request});
  let response;
  try{
    const api=client||new OpenAI({apiKey:secret.value(),timeout:60000,maxRetries:0});
    response=await api.responses.create(request);
  }catch(error){
    const known=Number.isInteger(error.status)&&error.status>=400&&error.status<500&&error.status!==408;
    await settle(db,runId,stepId,{status:known?'completed':'uncertain',...(known?{costMicros:0}:{}),error:safeError(error),httpStatus:error.status||0});
    throw error;
  }
  const usage=response.usage;
  const costMicros=usage&&Number.isFinite(usage.input_tokens)&&Number.isFinite(usage.output_tokens)?
    Math.ceil(usage.input_tokens*PRICES[request.model].input+usage.output_tokens*PRICES[request.model].output):amount;
  await settle(db,runId,stepId,{status:'completed',costMicros,usage:usage||{},model:response.model||request.model,
    responseId:response.id||'',providerRequestId:response._request_id||'',response});
  return response;
}
function fullAnswer(q){
  if(q.type==='diagram'||q.type==='notice')return graph.graphAnswer(q);
  if(q.type==='single')return q.options.findIndex(x=>x.correct);
  return core.solutionResponse(parseVisualTask(q.visualTask,{points:q.points}));
}
async function stepCase({db,uid,data,secret,client}){
  const run=await getRun(db,data.runId,uid);
  if(run.ownerId!==uid)throw new HttpsError('permission-denied','Nur der Eigentümer kann kostenpflichtige Schritte auslösen.');
  if(run.status==='paused')throw new HttpsError('failed-precondition','Die Serie ist pausiert.');
  if(typeof data.caseId!=='string'||!ID.test(data.caseId))throw new HttpsError('invalid-argument','Ungültiger Fall.');
  const ref=db.doc(runRef(db,run.id).path+'/cases/'+data.caseId);
  const c=(await ref.get()).data();
  if(run.autoSessionId&&run.status!=='running')throw new HttpsError('failed-precondition','Automatische Phase ist abgeschlossen und unveränderlich.');
  const config=variant(run.recipeVersion);
  if(!c)throw new HttpsError('not-found','Prüffall fehlt.');
  if(['ready','rejected','uncertain'].includes(c.status))return {status:c.status,attempt:c.attempt};
  const phase=c.status==='generated'?'judge':'generate',stepId=c.id+'-a'+c.attempt+'-'+phase+(phase==='judge'&&(c.checkRevision||1)>1?'-r'+c.checkRevision:'');
  const archive=db.doc(ref.path+'/attempts/a'+c.attempt);
  try{
    let update;
    if(phase==='generate'){
      const recipe=(await db.doc('taskLearningRecipes/'+run.recipeVersion).get()).data();
      // Only the signed-in teacher's explicit judgments and fixed test feedback are eligible.
      const learned=run.autoSessionId?{docs:[]}:await db.collection('taskLearningExamples').where('ownerId','==',uid).where('reviewerId','==',uid).where('recipeVersion','==',run.recipeVersion).limit(30).get();
      const memory=run.autoSessionId?{docs:[]}:await db.collection('taskLearningTeacherMemory/'+uid+'/examples').orderBy('reviewedAt','desc').limit(100).get();
      const words=text=>new Set(String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]),wanted=words(c.wish);
      const relevance=x=>{const terms=words(x.wish);return [...wanted].filter(w=>terms.has(w)).length/Math.max(1,wanted.size);};
      const byId=new Map([...learned.docs,...memory.docs].map(d=>[d.id,d.data()]));
      const examples=[...byId.values()].filter(x=>x.ownerId===uid&&x.recipeVersion===run.recipeVersion&&x.humanVerdict&&x.reviewerId===uid)
        .sort((a,b)=>relevance(b)-relevance(a)||(Date.parse(b.reviewedAt)||Number(b.reviewedAt)||0)-(Date.parse(a.reviewedAt)||Number(a.reviewedAt)||0)).slice(0,6)
        .map(x=>({wish:x.wish,decision:x.kind,verdict:x.humanVerdict,reason:x.humanComment||'',structure:x.blueprint||null}));
      const response=await providerCall({db,runId:run.id,stepId,phase,secret,client,
        version:run.recipeVersion,input:{wish:c.wish,recipe:{prerequisites:recipe.prerequisites,exclusions:recipe.exclusions,rules:recipe.generationRules},
          requiredModes:c.modes||null,teacherExamples:examples,recipeImprovement:run.strategyHint||'',repair:c.repairNotes||''}});
      const plan=parseStructuredResponse(response);
      const q=config.build(plan,{id:c.id,modes:c.modes||plan.arrowModes});
      update={status:'generated',plan,q,generatedAt:now(),errors:[]};
    }else{
      const response=await providerCall({db,runId:run.id,stepId,phase,secret,client,version:run.recipeVersion,input:{wish:c.reviewWish||c.wish,studentView:config.visible(c.q)}});
      const judge=parseStructuredResponse(response),check=config.check(c.plan,judge,c.expected,c.q);
      if(check.ok&&c.q.type!=='notice'){
        const full=score(c.q,fullAnswer(c.q)),blank=score(c.q,null);
        if(full!==c.q.points||blank!==0)throw Error('Bewertung und unabhängiger Schlüssel widersprechen sich.');
      }
      update={status:check.ok?'ready':'rejected',judge,check,errors:check.errors,checkedAt:now()};
    }
    return await db.runTransaction(async tx=>{
      const current=(await tx.get(ref)).data();
      if(current.attempt!==c.attempt||current.status!==c.status||(current.checkRevision||1)!==(c.checkRevision||1))return {status:current.status,attempt:current.attempt};
      const example=db.doc('taskLearningExamples/'+digest([run.id,c.id,c.attempt]));
      const priorExample=update.status==='ready'?await tx.get(example):null;
      tx.set(db.doc(ref.path+'/checks/'+stepId),{phase,attempt:c.attempt,revision:c.checkRevision||1,...update,at:now()});
      tx.set(archive,{attempt:c.attempt,...(c.plan?{plan:c.plan,q:c.q}:{}),...update},{merge:true});
      tx.update(ref,update);
      if(update.status==='ready'&&!priorExample.exists){
        tx.create(example,{ownerId:run.ownerId,runId:run.id,caseId:c.id,attempt:c.attempt,recipeVersion:run.recipeVersion,family:c.family,
          kind:c.plan.kind,wish:c.wish,systemStatus:'checked',humanVerdict:'',createdAt:now()});
      }
      return {status:update.status,attempt:c.attempt,errors:update.errors};
    });
  }catch(error){
    if(error.pendingProvider){
      const current=(await ref.get()).data();
      return {status:current.status,attempt:current.attempt};
    }
    const call=(await db.doc(runRef(db,run.id).path+'/providerCalls/'+stepId).get()).data();
    const status=call?.status==='uncertain'||call?.status==='dispatching'?'uncertain':'rejected';
    return db.runTransaction(async tx=>{
      const current=(await tx.get(ref)).data();
      if(current.attempt!==c.attempt||current.status!==c.status||(current.checkRevision||1)!==(c.checkRevision||1))return {status:current.status,attempt:current.attempt};
      const errors=[safeError(error)];
      tx.update(ref,{status,errors,checkedAt:now()});
      tx.set(archive,{attempt:c.attempt,status,errors,...(c.plan?{plan:c.plan,q:c.q}:{})},{merge:true});
      return {status,attempt:c.attempt,errors};
    });
  }
}
async function repairCase({db,uid,data}){
  const run=await getRun(db,data.runId,uid);
  if(run.ownerId!==uid)throw new HttpsError('permission-denied','Nur der Eigentümer kann Reparaturen starten.');
  if(run.autoSessionId&&run.status!=='running')throw new HttpsError('failed-precondition','Automatische Phase ist abgeschlossen und unveränderlich.');
  const ref=db.doc(runRef(db,run.id).path+'/cases/'+data.caseId);
  if(typeof data.caseId!=='string'||!ID.test(data.caseId)||!/^[a-f0-9-]{36}$/i.test(data.requestId||''))throw new HttpsError('invalid-argument','Ungültige Korrekturanfrage.');
  return db.runTransaction(async tx=>{
    const c=(await tx.get(ref)).data();
    if(!c)throw new HttpsError('not-found','Fall fehlt.');
    if(c.repairRequestId===data.requestId)return {status:c.status,attempt:c.attempt};
    const recovery=run.id===graph.GRAPH_RUN&&uid==='gc-visual255-e2e'&&c.attempt===3&&typeof data.technicalCorrection==='string'&&data.technicalCorrection.length>=12&&data.technicalCorrection.length<=500&&/^[a-f0-9]{40}$/.test(data.sourceCommit||'');
    if((c.status!=='rejected'&&!(run.autoSessionId&&c.status==='ready'&&c.adversary?.passed===false))||(c.attempt>=3&&!recovery))throw new HttpsError('failed-precondition','Hier ist keine weitere automatische Nachbesserung vorgesehen.');
    if(recovery)tx.set(db.doc(ref.path+'/technicalRecoveries/'+data.requestId),{reason:data.technicalCorrection,sourceCommit:data.sourceCommit,previousAttempt:c.attempt,at:now()});
    tx.update(ref,{status:'pending',attempt:c.attempt+1,repairRequestId:data.requestId,
      repairNotes:[...(c.errors||[]),c.judge?.reason||'',c.adversary?.concreteIssue||''].join(' ').slice(0,1600),errors:[],q:null,plan:null,judge:null,check:null,...(run.autoSessionId?{adversary:null}:{})});
    return {status:'pending',attempt:c.attempt+1};
  });
}
async function recheckCase({db,uid,data}){
  const run=await getRun(db,data.runId,uid);
  if(run.ownerId!==uid)throw new HttpsError('permission-denied','Nur der Eigentümer kann eine neue Prüfung beauftragen.');
  if(run.autoSessionId)throw new HttpsError('failed-precondition','Automatische Versuche und Finalisten sind unveränderlich; nur neue begrenzte Versuche sind zulässig.');
  if(!ID.test(data.caseId||'')||!/^[a-f0-9-]{36}$/i.test(data.requestId||'')||typeof data.reason!=='string'||data.reason.length<8||data.reason.length>300)
    throw new HttpsError('invalid-argument','Eine konkrete Prüferkorrektur mit stabiler Anfrage-ID angeben.');
  const ref=db.doc(runRef(db,run.id).path+'/cases/'+data.caseId);
  return db.runTransaction(async tx=>{
    const c=(await tx.get(ref)).data();
    if(!c)throw new HttpsError('not-found','Fall fehlt.');
    if(c.recheckRequestId===data.requestId)return {status:c.status,revision:c.checkRevision};
    if(!['ready','rejected'].includes(c.status)||(c.checkRevision||1)>=3)
      throw new HttpsError('failed-precondition','Keine weitere Prüfung dieser Fassung vorgesehen.');
    let plan=c.plan,q=c.q;
    if(!plan||!q){
      const generation=(await tx.get(db.doc(runRef(db,run.id).path+'/providerCalls/'+c.id+'-a'+c.attempt+'-generate'))).data();
      if(!generation?.response)throw new HttpsError('failed-precondition','Kein gespeicherter vollständiger Entwurf für eine technische Neuprüfung.');
      plan=parseStructuredResponse(generation.response);
      q=variant(run.recipeVersion).build(plan,{id:c.id,modes:c.modes||plan.arrowModes});
    }
    const revision=(c.checkRevision||1)+1;
    tx.set(db.doc(ref.path+'/rechecks/'+data.requestId),{reason:data.reason,previousStatus:c.status,
      previousCheck:c.check||null,previousJudge:c.judge||null,revision,at:now()});
    tx.update(ref,{status:'generated',plan,q,checkRevision:revision,recheckRequestId:data.requestId,errors:[]});
    return {status:'generated',revision};
  });
}
async function status({db,uid,data}){
  const run=await getRun(db,data.runId,uid),snap=await db.collection(runRef(db,run.id).path+'/cases').get();
  const rows=snap.docs.map(s=>s.data());
  return {runId:run.id,quizId:PREFIX+run.id,expected:run.expected,status:run.status,spentMicros:run.spentMicros,
    reservedMicros:run.reservedMicros,limitMicros:run.limitMicros,
    cases:rows.map(c=>({id:c.id,status:c.status,family:c.family,attempt:c.attempt,errors:c.errors||[]}))};
}
async function resolveTraining({db,uid,quizId}){
  const id=quizId.slice(PREFIX.length);
  const run=await getRun(db,id,uid),snap=await db.collection(runRef(db,id).path+'/cases').get();
  const stored=snap.docs.map(s=>s.data()).filter(c=>c.status==='ready'&&c.q);
  const order=new Map(variant(run.recipeVersion).cases.map((c,i)=>[c.id,i]));
  stored.sort((a,b)=>(a.position??order.get(a.id)??0)-(b.position??order.get(b.id)??0));
  return {tasks:stored.map(c=>({...c.q,shape:c.q.type==='notice'?'Nächster Schritt':c.q.shape||(c.q.type==='single'?'Eignungsprobe zur Darstellung':'Dreisatz')})),group:'training',runId:id,expected:run.expected};
}
async function details({db,uid,data}){
  const run=await getRun(db,data.runId,uid);
  if(!ID.test(data.caseId||''))throw new HttpsError('invalid-argument','Ungültiger Fall.');
  const c=(await db.doc(runRef(db,run.id).path+'/cases/'+data.caseId).get()).data();
  if(c?.status!=='ready')throw new HttpsError('failed-precondition','Dieser Fall ist noch nicht freigegeben.');
  return {wish:c.wish,decision:c.plan.kind,reason:c.plan.reason,independentCheck:c.judge.reason,attempt:c.attempt,
    solutionNote:c.q.trainingPolicy==='relation-choice-v1'?'Ein möglicher Beispielweg. Andere exakt richtige Zwischenwerte und Rechenwege werden ebenfalls bewertet.':'',
    solution:solutionDisplay(c.q),points:c.q.points};
}
function solutionDisplay(q){
  if(q.type==='notice')return [];
  if(q.type==='diagram')return q.fields.map(f=>({label:f.label,value:f.accepted[0]}));
  if(q.type==='single')return [{label:'Passende Vorgehensweise',value:q.options.find(x=>x.correct).text}];
  const task=JSON.parse(q.visualTask);
  if(task.format==='connections')return task.solution.edges.map(([a,b])=>({label:task.spec.nodes.find(n=>n.id===a).label,value:task.spec.nodes.find(n=>n.id===b).label}));
  return Object.entries(fullAnswer(q)).map(([id,value])=>{
    const match=id.match(/^r(\d)c(\d)$/),row=Number(match[1]),column=Number(match[2]);
    const rows={1:'Ausgangswert',2:'Erster Pfeil',3:'Zwischenwert',4:'Zweiter Pfeil',5:'Zielwert'};
    const columns={1:'Rechenzeichen links',2:'Faktor links',3:'Zahl links',4:'Zahl rechts',5:'Rechenzeichen rechts',6:'Faktor rechts'};
    return {label:rows[row]+' · '+columns[column],value:String(value).replace('.',',')};
  });
}
async function recordTrainingFeedback({db,uid,quizId,q,data,event,latest,rating}){
  const id=quizId.slice(PREFIX.length),run=await getRun(db,id,uid);
  const ref=db.doc(runRef(db,id).path+'/cases/'+q.id),c=(await ref.get()).data();
  if(c?.status!=='ready')return;
  const example=db.doc('taskLearningExamples/'+digest([id,q.id,c.attempt,uid]));
  const review=db.doc(ref.path+'/teacherReviews/'+data.eventId);
  const value={reviewerId:uid,version:data.version,verdict:data.verdict,reason:data.reason||'',comment:data.comment||'',createdAt:now()};
  return db.runTransaction(async tx=>{
    const prior=await tx.get(review);
    const existing=event?await tx.get(event):null;
    const previous=latest?await tx.get(latest):null;
    if(existing?.exists){
      if(existing.data().version!==data.version)throw new HttpsError('failed-precondition','Rückmeldungs-ID bereits belegt.');
      return {rating:previous?.data()||rating};
    }
    if(prior.exists)return {rating:previous?.data()||rating};
    if(event){
      const saved={...rating,quizId,questionId:q.id,group:'training',updatedAt:now()};
      tx.create(event,saved);tx.set(latest,saved);
    }
    tx.create(review,value);
    const learned={ownerId:uid,reviewerId:uid,runId:id,caseId:q.id,attempt:c.attempt,recipeVersion:run.recipeVersion,family:c.family,
      kind:c.plan.kind,wish:c.wish,blueprint:c.plan,taskVersion:data.version,systemStatus:'checked',humanVerdict:data.verdict,humanComment:data.comment||'',
      humanReason:data.reason||'',reviewedAt:now()};
    tx.set(example,learned);
    tx.set(db.doc('taskLearningTeacherMemory/'+uid+'/examples/'+example.id),learned);
    return {rating:rating||value};
  });
}
async function handleTraining(input){
  const {data}=input;
  if(data.action.startsWith('trainingAuto'))return require('./auto-loop.cjs').handle({...input,engine:{providerCall,getRun}});
  if(data.action==='trainingCreate')return createRun(input);
  if(data.action==='trainingStep')return stepCase(input);
  if(data.action==='trainingRepair')return repairCase(input);
  if(data.action==='trainingRecheck')return recheckCase(input);
  if(data.action==='trainingStatus')return status(input);
  if(data.action==='trainingDetails')return details(input);
  throw new HttpsError('invalid-argument','Unbekannte Erprobungsaktion.');
}
module.exports={PREFIX,createRun,stepCase,repairCase,status,resolveTraining,handleTraining,recordTrainingFeedback,
  providerRequest,reservationCost,fullAnswer,recheckCase};
