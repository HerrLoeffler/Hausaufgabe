'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
let sources;try{sources=require('../../lab/fast-quiz-functions/classroom-sources.js')}catch{}
const original={id:'test-a',title:'Zehnerübergang',questions:[{id:'a',type:'number',text:'38 + 7 = ?',numericAnswer:45},{id:'b',type:'number',text:'52 − 8 = ?',numericAnswer:44}]};
test('two actual source questions supply a unique checked ten-minute stream without originals or source mutation',()=>{
 assert.ok(sources,'source compiler exists');const before=JSON.stringify(original),plan=sources.preparePlan(original,{category:'mental',durationSec:600});
 assert.equal(plan.available,true);assert.ok(plan.requiredCount>=300);const tasks=Array.from({length:plan.requiredCount},(_,i)=>sources.taskAt(plan,i,81));
 assert.equal(new Set(tasks.map(q=>q.fingerprint)).size,tasks.length);assert.equal(tasks.every(q=>q.kind==='H'&&q.sourceId&&q.weight===20),true);
 for(const q of tasks){const m=q.prompt.match(/^(-?\d+) ([+−]) (\d+) = \?$/);assert.ok(m);assert.equal(Number(q.correct),m[2]==='+'?Number(m[1])+Number(m[3]):Number(m[1])-Number(m[3]));}
 assert.equal(JSON.stringify(original),before);
});
test('unsupported knowledge questions, false source keys and inadequate paper families are explicit blockers',()=>{
 assert.ok(sources);for(const source of [{id:'k',questions:[{id:'a',text:'Wer entdeckte Amerika?',type:'short',acceptedAnswers:['Kolumbus']}]},{id:'bad',questions:[{id:'a',type:'number',text:'38 + 7 = ?',numericAnswer:46}]}]){
 const p=sources.preparePlan(source,{category:'mental',durationSec:300});assert.equal(p.available,false);assert.match(p.issues.join(' '),/Aufgabe|Lösung|Quelle|Familie/);
 }
 assert.equal(sources.preparePlan(original,{category:'paper',durationSec:300}).available,false);
});
test('validated curriculum covers selectable grades5–10 and legal tracks with real competency references',()=>{
 assert.ok(sources);for(let grade=5;grade<=10;grade++){const rows=sources.curriculum.filter(r=>r.grade===grade);assert.ok(rows.length);assert.ok(rows.every(r=>r.sourceUrl.startsWith('https://www.lehrplanplus.bayern.de/fachlehrplan/')));if(grade<7)assert.deepEqual([...new Set(rows.map(r=>r.track))],['regel']);if(grade===10)assert.deepEqual([...new Set(rows.map(r=>r.track))],['m']);for(const row of rows){const p=sources.preparePlan(sources.curriculumSource(row),{category:'mental',durationSec:600});assert.equal(p.available,true,row.title);}}
});
test('duration rejects coercion, fractions, emptiness and excessive ranges',()=>{
 assert.ok(sources);for(const durationSec of ['',0,-1,59,1201,60.5,'300',null])assert.throws(()=>sources.duration(durationSec));for(const n of [60,180,300,600,1200])assert.equal(sources.duration(n),n);
});
const {createHash}=require('node:crypto');let createApi;try{({createApi}=require('../../lab/fast-quiz-functions/classroom-v2.js'))}catch{}
const hashToken=s=>createHash('sha256').update(String(s)).digest('hex');
function fixture(){const docs=new Map();let time=2000000000000,serial=0,queue=Promise.resolve();const db={collection:collection=>({doc:id=>({id:collection+'/'+id})}),runTransaction:fn=>{const run=queue.then(()=>fn({get:async r=>({exists:docs.has(r.id),data:()=>structuredClone(docs.get(r.id))}),create:(r,v)=>docs.set(r.id,structuredClone(v)),set:(r,v)=>docs.set(r.id,structuredClone(v))}));queue=run.catch(()=>{});return run;}};const src=structuredClone(original);return{docs,src,get now(){return time},tick:ms=>time+=ms,api:createApi?.({db,hashToken,newToken:()=>`test-token-${++serial}`,fail:(code,message,status=400)=>{throw Object.assign(new Error(message),{apiCode:code,httpStatus:status})},now:()=>time,randomSeed:()=>12345,sourceRepo:{identity:async ctx=>{if(ctx?.authorization!=='valid')throw new Error('Anmeldung erforderlich');return{uid:'owner'}},list:async()=>[{id:src.id,title:src.title}],load:async(uid,id)=>{if(uid!=='owner'||id!==src.id)throw new Error('Keine Berechtigung');return src}}})};}
const auth={authorization:'valid'};
async function prepare(f,config={}){return f.api('Prepare',{source:{kind:'test',quizId:original.id},config:{category:'mental',durationSec:300,...config}},auth)}
async function room2(f,n=4,config={}){const prep=await prepare(f,config);const r=await f.api('Create',{preparationId:prep.preparationId,sourceRevision:prep.sourceRevision,config:{category:'mental',gameMode:'teams',durationSec:300,teamCount:4,teamNames:['Rot','Blau','Grün','Gelb'],...config}},auth);r.players=[];for(let i=0;i<n;i++)r.players.push(await f.api('Join',{code:r.code,name:'QA'+i,joinKey:'opaque-join-key-'+i.toString().padStart(16,'0')}));return r;}
const hc=r=>({code:r.code,hostToken:r.hostToken}),pc=(r,i=0)=>({code:r.code,playerId:r.players[i].playerId,playerToken:r.players[i].playerToken});
test('source preparation requires active auth and binds immutable own source revision',async()=>{
 assert.equal(typeof createApi,'function');const f=fixture();await assert.rejects(f.api('Sources',{}),/anmelden/);const p=await prepare(f);f.src.questions[0].text='39 + 7 = ?';await assert.rejects(f.api('Create',{preparationId:p.preparationId,sourceRevision:p.sourceRevision,config:{category:'mental',gameMode:'computer',durationSec:300}},auth),/geändert/);
});
test('continuous answers: sixth is scored, task never times out at60s, next requires feedback and round replay is rejected',async()=>{
 assert.equal(typeof createApi,'function');const f=fixture(),r=await room2(f,1,{gameMode:'computer'}),c=pc(r);await f.api('Start',hc(r));f.tick(5000);
 let first;for(let i=0;i<7;i++){const t=await f.api('Task',c);if(i===0){first=t;f.tick(61000);assert.equal((await f.api('Task',c)).question.id,t.question.id);await assert.rejects(f.api('Next',{...c,slot:t.slot,roundId:t.roundId}),/Antwort|Feedback/);}
 const privateRoom=f.docs.get('fastQuizClassroomsV2/'+r.code),key=privateRoom.plan.tasks[t.slot].correct;
 const a=await Promise.all([f.api('Answer',{...c,slot:t.slot,roundId:t.roundId,answer:key}),f.api('Answer',{...c,slot:t.slot,roundId:t.roundId,answer:key})]);assert.equal(a[0].points,20);assert.equal(a[1].points,20);await f.api('Next',{...c,slot:t.slot,roundId:t.roundId});}
 assert.equal((await f.api('State',c)).self.score,140);await f.api('Stop',hc(r));await f.api('Start',{...hc(r),retry:true,expectedRoundId:first.roundId});f.tick(5000);await assert.rejects(f.api('Answer',{...c,slot:0,roundId:first.roundId,answer:'45'}),/Runde/);
});
test('duration/teams names enforce limits; unequal teams use average fixed roster and abort never wins',async()=>{
 assert.equal(typeof createApi,'function');const f=fixture(),r=await room2(f,5,{teamCount:2,teamNames:['7a','7b'],durationSec:60});let s=await f.api('State',hc(r));assert.deepEqual(s.teams.map(t=>t.size),[3,2]);await assert.rejects(f.api('Teams',{...hc(r),teamCount:2,teamNames:['Gleich','gleich']}),/namen/i);await f.api('Teams',{...hc(r),teamCount:2,teamNames:['<A>','B']});await f.api('Start',hc(r));f.tick(5000);
 for(let i=0;i<5;i++){const c=pc(r,i),t=await f.api('Task',c),key=f.docs.get('fastQuizClassroomsV2/'+r.code).plan.tasks[0].correct;await f.api('Answer',{...c,slot:t.slot,roundId:t.roundId,answer:key});}
 s=await f.api('State',hc(r));assert.deepEqual(s.teams.map(t=>t.average),[20,20]);assert.deepEqual(s.teams.map(t=>t.rawScore),[60,40]);assert.equal(s.teams[0].rank,1);assert.equal(s.teams[1].rank,1);await f.api('Join',{code:r.code,name:'Late',joinKey:'opaque-late-join-key-123456789'});s=await f.api('State',hc(r));assert.deepEqual(s.teams.map(t=>t.size),[3,2]);await f.api('Stop',hc(r));assert.equal((await f.api('State',hc(r))).success,false);
});
test('hard score cutoff preserves late learning feedback without knowledge-error and keeps all keys private',async()=>{
 assert.equal(typeof createApi,'function');const f=fixture(),r=await room2(f,1,{gameMode:'computer',durationSec:60}),c=pc(r);await f.api('Start',hc(r));f.tick(5000);const t=await f.api('Task',c);assert.equal(t.question.correct,undefined);assert.equal(t.question.hint,undefined);assert.equal(t.question.fingerprint,undefined);const view=await f.api('State',{code:r.code});assert.equal(view.members,undefined);assert.equal(view.plan,undefined);f.tick(60000);const answer=f.docs.get('fastQuizClassroomsV2/'+r.code).plan.tasks[0].correct,result=await f.api('Answer',{...c,slot:t.slot,roundId:t.roundId,answer});assert.equal(result.correct,true);assert.equal(result.points,0);assert.equal(result.late,true);assert.equal((await f.api('State',c)).self.score,0);assert.equal((await f.api('Next',{...c,slot:t.slot,roundId:t.roundId})).finished,true);
});
test('commutative operands are a single canonical task; 30 fast players stay below Firestore room size limit',async()=>{
 const plan=sources.preparePlan(sources.curriculumSource(sources.curriculum.find(c=>c.grade===5)),{category:'mental',durationSec:1200});assert.equal(plan.available,true);
 const canonical=plan.tasks.map(q=>{const m=q.prompt.match(/^(\d+) \+ (\d+)/);return m?[Number(m[1]),Number(m[2])].sort((a,b)=>a-b).join('+'):q.prompt});assert.equal(new Set(canonical).size,canonical.length);
 const f=fixture(),r=await room2(f,30,{durationSec:600});await f.api('Start',hc(r));f.tick(5000);
 for(let i=0;i<25;i++)for(let j=0;j<30;j++){const c=pc(r,j),t=await f.api('Task',c),answer=f.docs.get('fastQuizClassroomsV2/'+r.code).plan.tasks[t.slot].correct;await f.api('Answer',{...c,slot:t.slot,roundId:t.roundId,answer});await f.api('Next',{...c,slot:t.slot,roundId:t.roundId});}
 const stored=f.docs.get('fastQuizClassroomsV2/'+r.code);assert.ok(Object.values(stored.members).every(m=>Object.keys(m.receipts).length<=1));assert.ok(Buffer.byteLength(JSON.stringify(stored))<900000);
});
test('source variants keep original result digit width and never cross the original answer number range',()=>{
 const p=sources.preparePlan(original,{category:'mental',durationSec:1200});assert.equal(p.available,true);assert.ok(p.tasks.every(q=>Number(q.correct)>=10&&Number(q.correct)<=99));
});
test('small finite math families transparently cycle through checked variants with new opaque instances and no dry runtime',()=>{
 const source={id:'tiny',questions:[{id:'a',type:'number',text:'2 + 2 = ?',numericAnswer:4},{id:'b',type:'number',text:'3 + 1 = ?',numericAnswer:4}]};const p=sources.preparePlan(source,{category:'mental',durationSec:600});assert.equal(p.available,true);assert.equal(p.repeating,true);assert.match(p.repeatNotice,/Festigung/);const size=p.pools.H.length;assert.ok(size>2&&size<320);const first=sources.taskAt(p,0,12),again=sources.taskAt(p,size,12);assert.equal(first.fingerprint,again.fingerprint);assert.notEqual(first.id,again.id);assert.equal(new Set(Array.from({length:size},(_,i)=>sources.taskAt(p,i,12).fingerprint)).size,size);assert.ok(sources.taskAt(p,100000,12));
});
test('computer success compares exact raw threshold, independent from rounded display energy',async()=>{
 const f=fixture(),r=await room2(f,7,{gameMode:'computer',durationSec:1200}),c=pc(r);await f.api('Start',hc(r));const stored=f.docs.get('fastQuizClassroomsV2/'+r.code);stored.round=2;stored.config.referencePoints=960;for(const m of Object.values(stored.members))m.score=0;stored.members[c.playerId].score=4030;f.tick(1205000);const s=await f.api('State',c);assert.equal(s.energy,600);assert.equal(s.success,false);
});
test('a small head family cycles independently while a large paper family continues new variants',()=>{
 const source={id:'mixed',questions:[{id:'h',type:'number',text:'2 + 2 = ?',numericAnswer:4},{id:'p',type:'number',text:'147 + 268 = ?',numericAnswer:415}]};const p=sources.preparePlan(source,{category:'paper',durationSec:1200});assert.equal(p.available,true);assert.ok(p.pools.H.length<30);assert.ok(p.pools.P.length>=217);const tasks=Array.from({length:620},(_,i)=>sources.taskAt(p,i,90));for(let i=1;i<=620;i++)assert.equal(tasks.slice(0,i).filter(t=>t.kind==='P').length,Math.floor((35*i+50)/100));const written=tasks.filter(q=>q.kind==='P');assert.equal(new Set(written.map(q=>q.fingerprint)).size,written.length);
});
test('Remi request preserves selected grade and topic without imposing a different arithmetic curriculum',async()=>{
 const {buildGenerationRequest}=await import('../../lab/fast-quiz/source-client.mjs');assert.equal(typeof buildGenerationRequest,'function');for(const topic of ['Brüche addieren','Lineare Gleichungen','Prozentrechnung']){const request=buildGenerationRequest({grade:9,topic});assert.equal(request.topic,topic);assert.equal(request.grade,'9');assert.deepEqual(request.allowedTypes,['number','text']);assert.match(request.notes,/Thema.*unverändert/);assert.doesNotMatch(request.notes,/Keine Sachtexte|Keine.*Bruch|zwei positiven ganzen Zahlen/);}
});
test('real GradeCrew source repository preserves position questions and legacy questions without position',async()=>{
 const {createSourceRepo}=require('../../lab/fast-quiz-functions/classroom-source-repo');
 const questions=[{id:'b',position:2,type:'number',text:'52 − 8 = ?',numericAnswer:44},{id:'a',position:1,type:'number',text:'38 + 7 = ?',numericAnswer:45},{id:'legacy',type:'number',text:'47 + 8 = ?',numericAnswer:55}];
 function query(field,limit=1000){return{orderBy:key=>query(key,limit),limit:n=>query(field,n),get:async()=>{const rows=(field?questions.filter(q=>Object.hasOwn(q,field)).sort((a,b)=>a[field]-b[field]):questions).slice(0,limit);return{size:rows.length,docs:rows.map(q=>({id:q.id,data:()=>q}))}}};}
 const db={doc:p=>({get:async()=>p==='users/owner'?{exists:true,data:()=>({role:'teacher',status:'active'})}:p==='accountDeletions/owner'?{exists:false,data:()=>null}:{exists:true,data:()=>({ownerId:'owner',title:'Remi-Test',generationStatus:'ready'})},collection:()=>query()})};
 const repo=createSourceRepo({db,getAuth:()=>({getUser:async()=>({disabled:false})}),fail:(code,message)=>{throw new Error(message)}});
 const result=await repo.load('owner','remi-generated');assert.deepEqual(result.questions.map(q=>q.id),['a','b','legacy']);assert.equal(result.questions.length,3);assert.equal(sources.preparePlan(result,{category:'mental',durationSec:600}).available,true);
 const originalOrder=sources.digest(result);questions.reverse();assert.equal(sources.digest(await repo.load('owner','remi-generated')),originalOrder);
});
