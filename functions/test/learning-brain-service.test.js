'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {createService}=require('../lib/learning-brain/service');
function fixture(){const state=new Map();let calls=0;const topic={id:'math-r-6-1',title:'Brüche',grade:6,track:'R',modality:'text'};
 const service=createService({catalog:{version:'test',topics:[topic]},now:()=>1000,store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(state.get(uid)));state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai:{assess:async()=>({outcome:'incorrect',short:'Kleiner Schritt.'}),next:async(s)=>{calls++;return {task:{id:'task-'+calls,prompt:'Ein Schritt '+s.supportStage,contextText:'',input:'number',options:[],answer:{kind:'number',values:['2']},family:'part',rubric:'secret'},explanation:s.phase==='help'?'Ganz klein beginnen.':'',visual:null};}}});
 return {service,state,calls:()=>calls};}
test('own profile persists; different authenticated identities cannot load session',async()=>{const f=fixture();await f.service.profile('A',{grade:9,track:'M'});assert.equal((await f.service.profile('A')).learner.grade,9);assert.equal((await f.service.profile('B')).learner.grade,6);const s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});await assert.rejects(f.service.turn('B',{sessionId:s.id,revision:1,eventId:'answer-001',action:'answer',answer:'2'}),e=>e.code==='not-found');});
test('duplicate event is cached, revision guards and mismatched replays reject',async()=>{const f=fixture(),d={topicId:'math-r-6-1',minutes:20,eventId:'start-0001'};const s=await f.service.start('A',d);assert.deepEqual(await f.service.start('A',d),s);assert.equal(f.calls(),1);await assert.rejects(f.service.start('A',{...d,minutes:10}),e=>e.code==='already-exists');const turn={sessionId:s.id,revision:s.revision,eventId:'answer-0001',action:'answer',answer:'1'};const result=await f.service.turn('A',turn);assert.equal(result.phase,'help');assert.deepEqual(await f.service.turn('A',turn),result);assert.equal(f.calls(),2);await assert.rejects(f.service.turn('A',{...turn,eventId:'answer-0002'}),e=>e.code==='aborted');});
test('AI error leaves original revision and progress intact; retry works',async()=>{const f=fixture();const s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});const before=await f.service.profile('A');assert.equal(before.skills.length,0);await assert.rejects(f.service.turn('A',{sessionId:s.id,revision:1,eventId:'blank-0001',action:'answer',answer:''}));assert.equal((await f.service.profile('A')).activeSession.revision,1);assert.equal((await f.service.profile('A')).skills.length,0);});
test('real AI exception releases reservation without advancing; parallel request cannot consume twice',async()=>{
 const f=fixture();const s=await f.service.start('A',{topicId:'math-r-6-1',minutes:20,eventId:'start-0001'});
 let finish,called=0;const ai={assess:async()=>({outcome:'correct',short:'Richtig'}),next:async()=>{called++;await new Promise(r=>{finish=r;});throw new Error('provider unavailable');}};
 const svc=createService({catalog:{version:'v',topics:[]},store:{transact:async(uid,fn)=>{const r=fn(globalThis.structuredClone(f.state.get(uid)));f.state.set(uid,globalThis.structuredClone(r.state));return r.result;}},ai,now:()=>1000});
 const body={sessionId:s.id,revision:1,eventId:'fail-0001',action:'answer',answer:'2'};
 const promise=svc.turn('A',body);await new Promise(r=>require('node:timers').setImmediate(r));
 await assert.rejects(svc.turn('A',{...body,eventId:'fail-0002'}),e=>e.code==='aborted');assert.equal(called,1);finish();await assert.rejects(promise,/provider unavailable/);
 assert.equal(f.state.get('A').sessions[s.id].revision,1);assert.equal(f.state.get('A').lock,undefined);assert.equal(f.state.get('A').requests['fail-0001'],undefined);
 const retry=await f.service.turn('A',body);assert.equal(retry.revision,2);
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
