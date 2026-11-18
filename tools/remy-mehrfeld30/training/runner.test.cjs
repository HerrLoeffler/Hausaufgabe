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
