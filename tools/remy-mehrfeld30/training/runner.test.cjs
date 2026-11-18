'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {TestDatabase}=require('./test-db.cjs');
const {createRun,stepCase,repairCase,status,resolveTraining,recordTrainingFeedback,providerRequest,reservationCost}=require('./runner.cjs');
const {present}=require('../review.cjs');
const {RUN}=require('./cases.cjs');
const uid='gc-visual255-e2e';
const plan={kind:'inverse',relationship:'inverse',a:'3',b:'24',c:'8',title:'Druckauftrag',subject:'Mathematik',labels:['Drucker','Zeit (min)'],
  text:'Drei gleich schnelle Drucker brauchen für denselben Auftrag 24 Minuten. Wie lange brauchen acht gleich schnelle Drucker?',constantRate:false,constantWork:true,equalRate:true,arrowModes:['factor','select','free','given'],reason:'Konstante Arbeitsmenge.'};
const judgment={kind:'inverse',a:'3',b:'24',c:'8',answer:'9',matchesWish:true,appropriate:true,unambiguous:true,leaksAnswer:false,reason:'Eindeutig.'};
test('two provider stages persist private attempts and replay without duplicate calls',async()=>{
  const db=new TestDatabase(),data={requestId:'00000000-0000-4000-8000-000000000001',wish:plan.text};
  const run=await createRun({db,uid,data});
  await assert.rejects(createRun({db,uid,data:{...data,wish:'Ein anderer Wunsch mit neuer Bedeutung.'}}),/anderen Wunsch/);
  let calls=0;
  const client={responses:{create:async request=>{
    calls++;
    const user=JSON.parse(request.input[1].content);
    if(calls===2){assert.ok(user.studentView);assert.equal(Object.hasOwn(user,'solution'),false);assert.equal(Object.hasOwn(user,'plan'),false);}
    return {id:'r'+calls,status:'completed',output_text:JSON.stringify(calls===1?plan:judgment),usage:{input_tokens:100,output_tokens:100}};
  }}};
  const input={db,uid,data:{runId:run.runId,caseId:'wish'},client};
  assert.equal((await stepCase(input)).status,'generated');
  assert.equal((await stepCase(input)).status,'ready');
  assert.equal((await stepCase(input)).status,'ready');
  assert.equal(calls,2);
  const list=await resolveTraining({db,uid,quizId:run.quizId});
  assert.equal(list.tasks.length,1);
  assert.equal((await status({db,uid,data:{runId:run.runId}})).reservedMicros,0);
  await assert.rejects(resolveTraining({db,uid:'other',quizId:run.quizId}),/Keine eigene/);
  const q=list.tasks[0],projected=present(run.quizId,'training',q);
  assert.doesNotMatch(JSON.stringify(projected),/"solution"|"accepted"/);
  const feedback={eventId:'00000000-0000-4000-8000-000000000002',version:projected.version,verdict:'bad',comment:'Mehr Platz',reason:'anderes'};
  await recordTrainingFeedback({db,uid,quizId:run.quizId,q,data:feedback});
  await recordTrainingFeedback({db,uid,quizId:run.quizId,q,data:feedback});
  assert.equal([...db.docs.keys()].filter(p=>p.includes('/teacherReviews/')).length,1);
  assert.equal([...db.docs.entries()].find(([p,v])=>p.startsWith('taskLearningExamples/')&&v.reviewerId===uid)[1].humanVerdict,'bad');
});
test('a timed-out provider call stays uncertain, cannot be retried or repaired automatically and retains cost',async()=>{
  const db=new TestDatabase(),run=await createRun({db,uid,data:{calibration:true}});
  const client={responses:{create:async()=>{throw Error('connection lost');}}};
  const input={db,uid,data:{runId:RUN,caseId:'direct-01'},client};
  assert.equal((await stepCase(input)).status,'uncertain');
  assert.equal((await stepCase(input)).status,'uncertain');
  await assert.rejects(repairCase({db,uid,data:{...input.data,requestId:'00000000-0000-4000-8000-000000000003'}}),/keine weitere/);
  assert.ok((await status({db,uid,data:{runId:run.runId}})).reservedMicros>0);
});
test('bad independent judgments are rejected, archived and bounded to two explicit repairs',async()=>{
  const db=new TestDatabase(),run=await createRun({db,uid,data:{requestId:'00000000-0000-4000-8000-000000000004',wish:plan.text}});
  const client={responses:{create:async request=>({status:'completed',output_text:JSON.stringify(request.model==='gpt-6-luna'?plan:{...judgment,answer:'72'}),usage:{input_tokens:10,output_tokens:10}})}};
  const input={db,uid,data:{runId:run.runId,caseId:'wish'},client};
  for(let attempt=1;attempt<=3;attempt++){
    assert.equal((await stepCase(input)).status,'generated');
    assert.equal((await stepCase(input)).status,'rejected');
    if(attempt<3){
      const data={...input.data,requestId:'00000000-0000-4000-8000-00000000000'+(attempt+4)};
      assert.equal((await repairCase({db,uid,data})).attempt,attempt+1);
      assert.equal((await repairCase({db,uid,data})).attempt,attempt+1);
    }
  }
  await assert.rejects(repairCase({db,uid,data:{...input.data,requestId:'00000000-0000-4000-8000-000000000009'}}),/keine weitere/);
  assert.equal((await resolveTraining({db,uid,quizId:run.quizId})).tasks.length,0);
  assert.equal([...db.docs.keys()].filter(p=>p.includes('/attempts/')).length,3);
});
test('concurrent duplicate generation reserves exactly one provider call',async()=>{
  const db=new TestDatabase(),run=await createRun({db,uid,data:{requestId:'00000000-0000-4000-8000-000000000010',wish:plan.text}});
  let calls=0,release;
  const wait=new Promise(resolve=>{release=resolve;});
  const client={responses:{create:async()=>{calls++;await wait;return {status:'completed',output_text:JSON.stringify(plan),usage:{input_tokens:10,output_tokens:10}};}}};
  const input={db,uid,data:{runId:run.runId,caseId:'wish'},client};
  const first=stepCase(input);
  while(calls===0)await new Promise(resolve=>setImmediate(resolve));
  await stepCase(input);
  const intermediate=db.docs.get('taskLearningRuns/'+run.runId+'/cases/wish').status;
  release();await first;
  assert.equal(intermediate,'pending');
  assert.equal(calls,1);
});
test('cost reservation includes schema, prompt and maximum output, not an optimistic average',()=>{
  assert.ok(reservationCost(providerRequest('judge',{wish:plan.text}))>30000);
});

test('shared readers cannot spend another owners budget or contaminate that owners feedback examples',async()=>{
  const db=new TestDatabase();
  const run=await createRun({db,uid,data:{calibration:true}});
  const input={db,uid:'teacher-b',data:{runId:run.runId,caseId:'direct-01'}};
  await assert.rejects(stepCase(input),/Eigentümer/);
  await assert.rejects(repairCase({...input,data:{...input.data,requestId:'00000000-0000-4000-8000-000000000011'}}),/Eigentümer/);
  const ref=db.doc('taskLearningRuns/'+run.runId+'/cases/direct-01');
  const q=require('./builder.cjs').buildCandidate(plan,{id:'direct-01'});
  await ref.update({status:'ready',q,plan});
  await recordTrainingFeedback({db,uid:'teacher-b',quizId:run.quizId,q,data:{eventId:'00000000-0000-4000-8000-000000000012',version:'v',verdict:'good',comment:'Eigene Präferenz'}});
  const examples=[...db.docs.values()].filter(x=>x.humanVerdict==='good');
  assert.ok(examples.every(x=>x.ownerId==='teacher-b'&&x.reviewerId==='teacher-b'));
});
test('reviewed examples are retrieved even after many unreviewed system candidates',async()=>{
  const db=new TestDatabase();
  for(let i=0;i<40;i++)await db.doc('taskLearningExamples/unreviewed-'+i).set({ownerId:uid,recipeVersion:'dreisatz-20261118-v1',humanVerdict:''});
  await db.doc('taskLearningExamples/teacher-example').set({ownerId:uid,reviewerId:uid,recipeVersion:'dreisatz-20261118-v1',
    humanVerdict:'bad',wish:'Taxi mit Grundgebühr',kind:'other',humanComment:'Anderer Rechenweg'});
  const run=await createRun({db,uid,data:{requestId:'00000000-0000-4000-8000-000000000013',wish:plan.text}});
  let examples;
  const client={responses:{create:async request=>{
    examples=JSON.parse(request.input[1].content).teacherExamples;
    return {status:'completed',output_text:JSON.stringify(plan),usage:{input_tokens:10,output_tokens:10}};
  }}};
  await stepCase({db,uid,data:{runId:run.runId,caseId:'wish'},client});
  assert.equal(examples.length,1);
  assert.equal(examples[0].wish,'Taxi mit Grundgebühr');
});
test('a corrected blind projection can recheck the same generated version once per explicit request without regenerating content',async()=>{
  const {recheckCase}=require('./runner.cjs');
  const db=new TestDatabase(),run=await createRun({db,uid,data:{requestId:'00000000-0000-4000-8000-000000000014',wish:plan.text}});
  let generators=0,judges=0;
  const client={responses:{create:async request=>{
    const generation=request.model==='gpt-6-luna';
    if(generation)generators++;else judges++;
    return {status:'completed',output_text:JSON.stringify(generation?plan:{...judgment,appropriate:judges>1}),usage:{input_tokens:10,output_tokens:10}};
  }}};
  const input={db,uid,data:{runId:run.runId,caseId:'wish'},client};
  await stepCase(input);await stepCase(input);
  const data={...input.data,requestId:'00000000-0000-4000-8000-000000000015',reason:'Die Beschreibung freier Pfeile wurde korrigiert.'};
  assert.equal((await recheckCase({db,uid,data})).revision,2);
  assert.equal((await recheckCase({db,uid,data})).revision,2);
  assert.equal((await stepCase(input)).status,'ready');
  assert.equal(generators,1);assert.equal(judges,2);
  assert.ok([...db.docs.keys()].some(p=>p.includes('/providerCalls/')&&p.endsWith('judge-r2')));
  assert.ok([...db.docs.keys()].some(p=>p.includes('/rechecks/')));
});
test('the same stored runner creates the eight mixed wishes and their independent graph profile',async()=>{
  const {GRAPH_RUN,GRAPH_VERSION}=require('./graph.cjs');
  const db=new TestDatabase();
  const run=await createRun({db,uid,data:{calibration:true,family:'fields-arrows'}});
  assert.equal(run.runId,GRAPH_RUN);
  const state=await status({db,uid,data:{runId:run.runId}});
  assert.equal(state.expected,8);
  assert.equal(db.docs.get('taskLearningRuns/'+run.runId).recipeVersion,GRAPH_VERSION);
  assert.equal(db.docs.get('taskLearningRuns/'+run.runId).limitMicros,1000000);
});

test('shared graph runner blind-checks English fields, keeps feedback versioned and can ask rather than fabricate a scored task',async()=>{
  const db=new TestDatabase();
  const p={kind:'chain',title:'Verbformen',subject:'Englisch',text:'Ergänze die Simple-Past-Form von go.',reason:'Verb umformen.',
    paths:[{title:'Verb',steps:[{type:'text',text:'go'},{type:'arrow',text:'Simple Past'},{type:'field',fieldId:'past'}]}],
    fields:[{id:'past',label:'Simple Past',mode:'text',options:[],accepted:['went'],calculation:{op:'none',left:'',right:''}}]};
  const j={kind:'chain',matchesWish:true,appropriate:true,unambiguous:true,leaksAnswer:false,answers:[{id:'f1',value:'went'}],links:[]};
  const run=await createRun({db,uid,data:{family:'fields-arrows',requestId:'00000000-0000-4000-8000-000000000021',wish:'Englisch: Simple Past von go selbst eintragen.'}});
  let calls=0;
  const client={responses:{create:async request=>{
    calls++;const input=JSON.parse(request.input[1].content);
    if(calls===2){assert.doesNotMatch(JSON.stringify(input),/"accepted"|"solution"/);assert.ok(input.studentView.fields);}
    return {status:'completed',output_text:JSON.stringify(calls===1?p:j),usage:{input_tokens:10,output_tokens:10}};
  }}};
  for(let i=0;i<2;i++)await stepCase({db,uid,data:{runId:run.runId,caseId:'wish'},client});
  const q=(await resolveTraining({db,uid,quizId:run.quizId})).tasks[0];assert.equal(q.type,'diagram');
  const version=present(run.quizId,'training',q).version;
  await recordTrainingFeedback({db,uid,quizId:run.quizId,q,data:{eventId:'00000000-0000-4000-8000-000000000022',version,verdict:'bad',comment:'Bitte mehr Platz für die Antwort.'}});
  const example=[...db.docs.values()].find(x=>x.humanVerdict==='bad');
  assert.equal(example.taskVersion,version);assert.equal(example.blueprint.fields[0].accepted[0],'went');
  const run2=await createRun({db,uid,data:{family:'fields-arrows',requestId:'00000000-0000-4000-8000-000000000023',wish:'Welche Zuordnung soll es sein?'}});
  let seen;
  const notice={kind:'clarify',title:'Eine Rückfrage',subject:'Allgemein',text:'Welche Inhalte möchtest du zuordnen lassen?',reason:'Ziel fehlt.'};
  const next={responses:{create:async request=>{seen=JSON.parse(request.input[1].content);return {status:'completed',output_text:JSON.stringify(request.model==='gpt-6-luna'?notice:{...j,kind:'clarify',answers:[]}),usage:{input_tokens:10,output_tokens:10}};}}};
  await stepCase({db,uid,data:{runId:run2.runId,caseId:'wish'},client:next});
  assert.equal(seen.teacherExamples[0].structure.fields[0].id,'past');
  await stepCase({db,uid,data:{runId:run2.runId,caseId:'wish'},client:next});
  const n=(await resolveTraining({db,uid,quizId:run2.quizId})).tasks[0];assert.equal(n.type,'notice');assert.equal(n.points,0);
});
test('a training verdict and its learning memory commit atomically and replay cannot overwrite a newer verdict',async()=>{
 const db=new TestDatabase(),run=await createRun({db,uid,data:{calibration:true}}),q=require('./builder.cjs').buildCandidate(plan,{id:'direct-01'});
 await db.doc('taskLearningRuns/'+run.runId+'/cases/direct-01').update({status:'ready',q,plan});
 const event=id=>db.doc('pilotFeedback/'+uid+'/events/'+id),latest=db.doc('pilotFeedback/'+uid+'/latest/v');
 const input={db,uid,quizId:run.quizId,q,latest};
 const a={eventId:'00000000-0000-4000-8000-000000000031',version:'v',verdict:'good',comment:'Gut'},b={...a,eventId:'00000000-0000-4000-8000-000000000032',verdict:'bad',comment:'Korrigieren'};
 await recordTrainingFeedback({...input,data:a,event:event(a.eventId),rating:a});
 assert.equal((await latest.get()).data().verdict,'good');
 await recordTrainingFeedback({...input,data:b,event:event(b.eventId),rating:b});
 await recordTrainingFeedback({...input,data:a,event:event(a.eventId),rating:a});
 assert.equal((await latest.get()).data().verdict,'bad');
 assert.equal([...db.docs.values()].find(x=>x.reviewerId===uid&&x.humanVerdict)?.humanVerdict,'bad');
});
test('recent same-wish learning memory is preferred over older unrelated examples',async()=>{
 const db=new TestDatabase();
 for(let i=0;i<35;i++)await db.doc('taskLearningTeacherMemory/'+uid+'/examples/e'+i).set({ownerId:uid,reviewerId:uid,recipeVersion:'dreisatz-20261118-v1',humanVerdict:'bad',wish:i===34?plan.text:'Unrelated '+i,kind:'inverse',humanComment:'Hinweis '+i,reviewedAt:100+i});
 const run=await createRun({db,uid,data:{requestId:'00000000-0000-4000-8000-000000000033',wish:plan.text}});let seen;
 const client={responses:{create:async request=>{seen=JSON.parse(request.input[1].content).teacherExamples;return {status:'completed',output_text:JSON.stringify(plan),usage:{input_tokens:10,output_tokens:10}};}}};
 await stepCase({db,uid,data:{runId:run.runId,caseId:'wish'},client});
 assert.equal(seen[0].reason,'Hinweis 34');
});
test('one explicit source-linked recovery is limited to the synthetic graph pilot and does not unlock unbounded repairs',async()=>{
 const db=new TestDatabase(),{GRAPH_RUN}=require('./graph-profile.cjs');
 await createRun({db,uid,data:{calibration:true,family:'fields-arrows'}});
 const ref=db.doc('taskLearningRuns/'+GRAPH_RUN+'/cases/graph-percent');await ref.update({status:'rejected',attempt:3,errors:['Falsche Anordnung'],judge:{reason:'Beide Zahlenspalten brauchen eigene Pfeile.'}});
 const data={runId:GRAPH_RUN,caseId:'graph-percent',requestId:'00000000-0000-4000-8000-000000000041'};
 await assert.rejects(repairCase({db,uid,data}),/keine weitere/);
 const request={...data,sourceCommit:'a'.repeat(40),technicalCorrection:'Geprüfte Korrektur der Auswahlregeln und Zwischenstufe.'};
 assert.equal((await repairCase({db,uid,data:request})).attempt,4);
 assert.match((await ref.get()).data().repairNotes,/Zahlenspalten/);
 await ref.update({status:'rejected'});await assert.rejects(repairCase({db,uid,data:{...request,requestId:'00000000-0000-4000-8000-000000000042'}}),/keine weitere/);
});
