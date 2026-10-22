'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {createService}=require('../lib/learning-brain/service');
function fixture(){const state=new Map();let calls=0;const topic={id:'math-r-6-1',title:'Brüche',grade:6,track:'R',modality:'text'};
 const service=createService({catalog:{version:'test',topics:[topic]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(state.get(uid)));state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'incorrect',short:'Kleiner Schritt.'}),next:async(s)=>{calls++;return {task:{id:'task-'+calls,prompt:'Ein Schritt '+s.supportStage,contextText:'',input:'number',options:[],answer:{kind:'number',values:['2']},family:'part',rubric:'secret'},explanation:s.phase==='help'?'Ganz klein beginnen.':'',visual:null};}}});
 return {service,state,calls:()=>calls};}
test('own profile persists; different authenticated identities cannot load session',async()=>{const f=fixture();await f.service.profile('A',{grade:9,track:'M'});assert.equal((await f.service.profile('A')).learner.grade,9);assert.equal((await f.service.profile('B')).learner.grade,6);const s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});await assert.rejects(f.service.turn('B',{sessionId:s.id,revision:1,eventId:'answer-001',action:'answer',answer:'2'}),e=>e.code==='not-found');});
test('duplicate event is cached, revision guards and mismatched replays reject',async()=>{const f=fixture(),d={topicId:'math-r-6-1',minutes:20,eventId:'start-0001'};const s=await f.service.start('A',d);assert.deepEqual(await f.service.start('A',d),s);assert.equal(f.calls(),1);await assert.rejects(f.service.start('A',{...d,minutes:10}),e=>e.code==='already-exists');const turn={sessionId:s.id,revision:s.revision,eventId:'answer-0001',action:'answer',answer:'1'};const result=await f.service.turn('A',turn);assert.equal(result.phase,'help');assert.deepEqual(await f.service.turn('A',turn),result);assert.equal(f.calls(),2);await assert.rejects(f.service.turn('A',{...turn,eventId:'answer-0002'}),e=>e.code==='aborted');});
test('AI error leaves original revision and progress intact; retry works',async()=>{const f=fixture();const s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});const before=await f.service.profile('A');assert.equal(before.skills.length,0);await assert.rejects(f.service.turn('A',{sessionId:s.id,revision:1,eventId:'blank-0001',action:'answer',answer:''}));assert.equal((await f.service.profile('A')).activeSession.revision,1);assert.equal((await f.service.profile('A')).skills.length,0);});
test('next failure keeps assessed success once and retry only generates',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});
 let assessments=0,failNext=true;
 const svc=createService({catalog:{topics:[]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>{assessments++;return {outcome:'correct',short:'Richtig'};},next:async()=>{if(failNext)throw Error('private provider detail');return {task:{id:'new-task',prompt:'Neue Probe'},explanation:'',visual:null};}}});
 const body={sessionId:s.id,revision:1,eventId:'answer-0001',action:'answer',answer:'2'};
 const pending=await svc.turn('A',body);assert.equal(pending.feedback.outcome,'correct');assert.equal(pending.pendingNext,true);assert.equal(pending.task,null);assert.equal(pending.revision,2);assert.equal(JSON.stringify(pending).includes('provider detail'),false);
 assert.deepEqual(await svc.turn('A',body),pending);assert.equal(assessments,1);
 assert.equal(f.state.get('A').topicEvents['math-r-6-1'].length,1);
 await assert.rejects(svc.turn('A',{...body,eventId:'answer-0002',revision:2}),e=>e.code==='failed-precondition');
 failNext=false;const retry=await svc.turn('A',{sessionId:s.id,revision:2,eventId:'retry-0001',action:'retry-next'});
 assert.equal(retry.task.id,'new-task');assert.equal(retry.pendingNext,false);assert.equal(assessments,1);assert.equal(f.state.get('A').topicEvents['math-r-6-1'].length,1);
 const record=f.state.get('A').attempts['answer-0001'];assert.equal(record.answer,'2');assert.equal(record.ownerUid,'A');assert.equal(record.task.id,'task-1');assert.equal(record.assessment.outcome,'correct');assert.equal(record.expiresAt,1000+30*86400000);
});
test('assessment failure writes no attempt or competency event',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});
 const svc=createService({catalog:{topics:[]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>{throw Error('grading failed');}}});
 await assert.rejects(svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-0001',action:'answer',answer:'2'}),/grading failed/);
 assert.equal(f.state.get('A').sessions[s.id].revision,1);assert.equal(f.state.get('A').attempts?.['answer-0001'],undefined);
});
test('test project, verified uid, active profile and deletion guard are mandatory',()=>{
 const {requireLearningIdentity}=require('../lib/learning-brain/contracts');const d={project:'gradecrew-staging-2026',uid:'A',profile:{role:'student',status:'active'}};
 assert.equal(requireLearningIdentity(d),'A');
 for(const patch of [{project:'hausaufgabe-staging'},{project:'hausaufgabe-40294'},{uid:null},{profile:null},{deleted:true},{profile:{role:'student',status:'disabled'}},{profile:{role:'teacher',accountDeletionId:'x'}}])assert.throws(()=>requireLearningIdentity({...d,...patch}));
});
test('area entry chooses a text goal server-side and preserves the last open learning point',async()=>{
 const topics=[{id:'math-5-a',subject:'math',grade:5,track:'R',area:'Zahlen',modality:'text',prerequisites:[]},{id:'math-5-b',subject:'math',grade:5,track:'R',area:'Zahlen',modality:'text',prerequisites:['math-5-a']},{id:'math-5-c',subject:'math',grade:5,track:'R',area:'Zahlen',modality:'visual',prerequisites:[]}];
 let state;const service=createService({catalog:{topics,version:'v'},store:{transact:async(_uid,fn)=>{const r=fn(globalThis.structuredClone(state));state=globalThis.structuredClone(r.state);return r.result;}},ai:{next:async()=>({task:{id:'task',prompt:'Rechne',answer:{kind:'number',values:['2']},family:'entry'},explanation:'',visual:null})}});
 const data={area:'Zahlen',subject:'math',grade:5,track:'R',minutes:20,eventId:'area-start-01'};assert.equal((await service.start('A',data)).topic.id,'math-5-a');
 state.topicEvents['math-5-b']=[{independent:true,correct:false,fingerprint:'x',family:'entry',sessionId:'a',at:1}];
 assert.equal((await service.start('A',{...data,eventId:'area-start-02'})).topic.id,'math-5-b');
});

test('workshop replay supplies actual answer and observations to assessment and next help; forged success is rejected',async()=>{
 const w={tool:'fraction-board',version:1,role:'answer',goal:'equivalent',numerator:1,denominator:3,targetDenominator:6,instruction:'Stelle denselben Anteil dar.'};
 let state,assessed,nextContext,quota=0;
 const svc=createService({catalog:{version:'v',topics:[{id:'fractions-6',subject:'math',title:'Brüche',modality:'text'}]},quota:async()=>{quota++;},store:{transact:async(_uid,fn)=>{const r=fn(globalThis.structuredClone(state));state=globalThis.structuredClone(r.state);return r.result;}},ai:{next:async(s,c)=>{nextContext=c;return {task:{id:'board-task',input:'workshop',prompt:'Zeige1/3inSechsteln',workshop:w,answer:{kind:'exact-fraction',values:['2/6']}},explanation:'',visual:null};},assess:async(s,answer,c)=>{assessed={answer,c};return {outcome:'incorrect',short:'Du hast nur die Gesamtzahl der Teile verändert.'};}}});
 const s=await svc.start('A',{topicId:'fractions-6',minutes:20,eventId:'work-start-01'});assert.deepEqual(s.task.workshop,w);assert.equal(s.task.answer,undefined);
 const data={sessionId:s.id,revision:1,eventId:'work-turn-01',action:'answer',answer:'',workshop:{tool:w.tool,version:1,taskId:'board-task',actions:[{type:'set-parts',value:6}]}};
 await svc.turn('A',data);assert.equal(assessed.answer,'1/6');assert.equal(assessed.c.workshop.valuePreserved,false);assert.deepEqual(nextContext.workshop.final,{numerator:1,denominator:6});assert.equal((await svc.profile('A')).skills[0].correct,0);
 const used=quota;await assert.rejects(svc.turn('A',{...data,revision:2,eventId:'work-bad-01',workshop:{...data.workshop,final:{numerator:2,denominator:6}}}),e=>e.code==='invalid-argument');assert.equal(quota,used);
});
test('attempt retention is bounded, private and separates support requests from demonstrated success',async()=>{
 const f=fixture();let s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});
 for(let i=0;i<62;i++)s=await f.service.turn('A',{sessionId:s.id,revision:s.revision,eventId:'question-'+String(i).padStart(4,'0'),action:'question',question:'Wie geht dieser Schritt?'});
 const state=f.state.get('A');assert.equal(Object.keys(state.attempts).length,60);assert.equal(state.attemptIndex.length,60);assert.equal(state.attempts['question-0000'],undefined);
 const record=state.attempts['question-0061'];assert.equal(record.assessment,null);assert.equal(record.phase,'help');assert.equal(record.question,'Wie geht dieser Schritt?');assert.equal(record.expireAt.getTime(),record.expiresAt);
 assert.equal(state.topicEvents['math-r-6-1'].length,0);const profile=await f.service.profile('A');assert.equal(profile.observationSummary.attempts,60);assert.equal(JSON.stringify(profile).includes('Wie geht'),false);assert.equal((await f.service.profile('B')).observationSummary.attempts,0);
});
test('validated response is durable before next provider finishes; concurrent duplicate never grades again',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let release,assessments=0;
 const svc=createService({catalog:{topics:[]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>{assessments++;return {outcome:'correct'};},next:async()=>{await new Promise(r=>{release=r;});return {task:{id:'next-task',prompt:'Weiter'},explanation:'',visual:null};}}});
 const body={sessionId:s.id,revision:1,eventId:'answer-0001',action:'answer',answer:'2'};const result=svc.turn('A',body);await new Promise(r=>globalThis.setImmediate(r));
 const stored=(await svc.profile('A')).activeSession;assert.equal(stored.pendingNext,true);assert.equal(stored.feedback.outcome,'correct');assert.equal(f.state.get('A').attempts['answer-0001'].answer,'2');
 const duplicate=await svc.turn('A',body);assert.equal(duplicate.pendingNext,true);assert.equal(assessments,1);await assert.rejects(svc.turn('A',{sessionId:s.id,revision:2,eventId:'retry-0001',action:'retry-next'}),e=>e.code==='aborted');release();assert.equal((await result).task.id,'next-task');
});
test('oversized task evidence is bounded and does not leak through the profile',async()=>{
 const f=fixture();let s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});
 f.state.get('A').sessions[s.id].task.rubric='x'.repeat(20000);
 await f.service.turn('A',{sessionId:s.id,revision:1,eventId:'help-big-001',action:'help'});
 const saved=f.state.get('A').attempts['help-big-001'];assert.equal(saved.task.truncated,true);assert.equal(saved.task.excerpt.length,12000);assert.equal(JSON.stringify(await f.service.profile('A')).includes('excerpt'),false);
});
test('missing assessment fails closed without advancing or generating another task',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let nextCalls=0;
 const svc=createService({catalog:{topics:[]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>null,next:async()=>{nextCalls++;return {task:{id:'wrong-next'}};}}});
 await assert.rejects(svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-null',action:'answer',answer:'2'}),e=>e.code==='internal');assert.equal(nextCalls,0);assert.equal(f.state.get('A').sessions[s.id].revision,1);assert.equal(f.state.get('A').attempts['answer-null'],undefined);
});
test('retry after deadline ends pending session without generation and removes unnecessary raw context',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let time=1000,nextCalls=0;
 const svc=createService({catalog:{topics:[]},now:()=>time,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'correct'}),next:async()=>{nextCalls++;throw Error('provider failure');}}});
 const pending=await svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-0001',action:'answer',answer:'My answer'});time=1300000;
 const body={sessionId:s.id,revision:pending.revision,eventId:'retry-expired',action:'retry-next'};const ended=await svc.turn('A',body);assert.equal(ended.phase,'ended');assert.equal(ended.pendingNext,false);assert.equal(nextCalls,1);assert.equal(f.state.get('A').sessions[s.id].nextContext,undefined);assert.equal(f.state.get('A').topicEvents['math-r-6-1'].length,1);assert.deepEqual(await svc.turn('A',body),ended);
});
test('eligible visual number line starts while unsupported visual, audio and long essays stay gated',async()=>{
 const topics=[{id:'visual-line',title:'Zahlenstrahl',subject:'math',modality:'visual',grade:6,track:'R',area:'Zahlen'},{id:'visual-shape',title:'Figuren konstruieren',subject:'math',modality:'visual',grade:6,track:'R',area:'Zahlen'},{id:'audio-words',title:'Wörter hören',subject:'german',modality:'audio'},{id:'essay-long',title:'Erzählung verfassen',subject:'german',modality:'text'}];let state;
 const svc=createService({catalog:{topics,version:'test'},now:()=>1000,store:{transact:async(_uid,fn)=>{const r=fn(globalThis.structuredClone(state));state=globalThis.structuredClone(r.state);return r.result;}},ai:{next:async()=>({task:{id:'line-task',prompt:'Ordne ein'},explanation:'',visual:null})}});
 const start=await svc.start('A',{topicId:'visual-line',minutes:20,eventId:'visual-start'});assert.equal(start.topic.id,'visual-line');
 const area=await svc.start('A',{area:'Zahlen',subject:'math',grade:6,track:'R',minutes:20,eventId:'visual-area'});assert.equal(area.topic.id,'visual-line');
 for(const topicId of ['visual-shape','audio-words','essay-long'])await assert.rejects(svc.start('A',{topicId,minutes:20,eventId:'blocked-'+topicId}),e=>e.code==='failed-precondition');
});
test('generation diagnostics stay private, bounded and clear after successful retry',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let failNext=true;
 const svc=createService({catalog:{topics:[]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'correct'}),next:async()=>{if(failNext){const error=Error('provider');error.stage='next-step-review';error.critique='private rubric '+ 'x'.repeat(1000);throw error;}return {task:{id:'task-new'},explanation:'',visual:null};}}});
 const pending=await svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-trace',action:'answer',answer:'2'});const failure=f.state.get('A').sessions[s.id].nextFailure;assert.equal(failure.stage,'next-step-review');assert.equal(failure.critique.length,800);assert.equal(JSON.stringify(pending).includes('private rubric'),false);assert.equal(JSON.stringify(await svc.profile('A')).includes('nextFailure'),false);
 failNext=false;await svc.turn('A',{sessionId:s.id,revision:pending.revision,eventId:'retry-trace',action:'retry-next'});assert.equal(f.state.get('A').sessions[s.id].nextFailure,undefined);
});
test('profile lazily scrubs pending raw generation context older than thirty days',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let time=1000;
 const svc=createService({catalog:{topics:[]},now:()=>time,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'correct'}),next:async()=>{throw Error('offline');}}});
 const pending=await svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-expiry',action:'answer',answer:'private pupil answer'});assert.equal(f.state.get('A').sessions[s.id].nextContext.answer,'private pupil answer');
 time+=30*86400000+1;await svc.profile('A');const stored=f.state.get('A').sessions[s.id];assert.equal(stored.nextContext.answer,undefined);assert.equal(stored.nextContext.question,undefined);assert.equal(stored.nextContext.workshop,undefined);assert.equal(stored.nextContext.expired,true);assert.equal(stored.events.length,1);assert.equal(stored.revision,pending.revision);
});
test('expired pending retry ends safely and clears context even when profile was never loaded',async()=>{
 const f=fixture(),s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});let time=1000,calls=0;
 const svc=createService({catalog:{topics:[]},now:()=>time,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'correct'}),next:async()=>{calls++;throw Error('offline');}}});
 const pending=await svc.turn('A',{sessionId:s.id,revision:1,eventId:'answer-expiry',action:'answer',answer:'private pupil answer'});time+=30*86400000+1;
 const ended=await svc.turn('A',{sessionId:s.id,revision:pending.revision,eventId:'retry-expiry',action:'retry-next'});assert.equal(ended.phase,'ended');assert.equal(calls,1);const stored=f.state.get('A').sessions[s.id];assert.equal(stored.nextContext,undefined);assert.equal(stored.nextFailure,undefined);assert.equal(stored.events.length,1);
});
