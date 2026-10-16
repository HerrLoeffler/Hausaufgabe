const test=require('node:test');const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
let createApi;try{({createApi}=require('../../lab/fast-quiz-functions/classroom.js'));}catch{}
const hashToken=s=>createHash('sha256').update(String(s)).digest('hex');
function fixture(){const docs=new Map();let time=2000000000000;let serial=0;let queue=Promise.resolve();
 const db={collection:()=>({doc:id=>({id})}),runTransaction:fn=>{const run=queue.then(()=>fn({get:async ref=>({exists:docs.has(ref.id),data:()=>structuredClone(docs.get(ref.id))}),create:(ref,data)=>{assert.ok(!docs.has(ref.id));docs.set(ref.id,structuredClone(data));},set:(ref,data)=>docs.set(ref.id,structuredClone(data))}));queue=run.catch(()=>{});return run;}};
 const fail=(code,message,status=400)=>{throw Object.assign(new Error(message),{apiCode:code,httpStatus:status});};
 return{api:createApi?.({db,hashToken,newToken:()=>`secret-${++serial}`,fail,now:()=>time,randomSeed:()=>12345}),docs,tick:ms=>{time+=ms;},get now(){return time;}};
}
async function room(f,n=5,config={}){const r=await f.api('classroomCreate',{config:{category:'paper',level:'n2',gameMode:'teams',...config}});const players=[];for(let i=0;i<n;i++)players.push(await f.api('classroomJoin',{code:r.code,name:'QA'+i,joinKey:'opaque-join-key-'+i.toString().padStart(16,'0')}));return{...r,players};}
const creds=(r,p)=>({code:r.code,playerId:p.playerId,playerToken:p.playerToken});
const host=r=>({code:r.code,hostToken:r.hostToken});
test('server classroom routes exist',()=>assert.equal(typeof createApi,'function'));
test('roster balances, freezes, rejoin is identical, latejoin has no scoring and public projection keeps keys private',async()=>{
 assert.ok(createApi);const f=fixture(),r=await room(f);const p=r.players[0];
 const again=await f.api('classroomJoin',{code:r.code,name:'different',joinKey:p.playerToken});assert.equal(again.playerId,p.playerId);
 let state=await f.api('classroomState',host(r));assert.deepEqual(state.teams.map(x=>x.size),[2,1,1,1]);
 await f.api('classroomStart',host(r));const started=await f.api('classroomState',host(r));await f.api('classroomStart',host(r));assert.equal((await f.api('classroomState',host(r))).startsAtMs,started.startsAtMs);
 await assert.rejects(f.api('classroomAssign',{...host(r),assignments:{[p.playerId]:2}}),/Runde/);
 const late=await f.api('classroomJoin',{code:r.code,name:'late',joinKey:'opaque-late-key-1234567890'});const lateState=await f.api('classroomState',creds(r,late));assert.equal(lateState.self.scored,false);
 state=await f.api('classroomState',{code:r.code});assert.equal(state.members,undefined);assert.equal(state.seed,undefined);assert.equal(state.hostTokenHash,undefined);assert.equal(state.self,undefined);assert.deepEqual(state.teams.map(x=>x.size),[2,1,1,1]);
 await assert.rejects(f.api('classroomState',{...creds(r,p),playerToken:'wrong'}),/ungültig/);
});
test('answers are server graded, atomic/idempotent; hint/solution/correction cannot add a second score',async()=>{
 assert.ok(createApi);const f=fixture(),r=await room(f,4,{gameMode:'computer'}),p=r.players[0],c=creds(r,p);
 await f.api('classroomStart',host(r));await assert.rejects(f.api('classroomTask',c),/Start/);f.tick(5000);
 const q=await f.api('classroomTask',c);assert.equal(q.question.correct,undefined);assert.equal(q.question.hint,undefined);assert.equal(q.question.explanation,undefined);assert.equal(q.seed,undefined);
 const privateRoom=f.docs.get(r.code),math=require('../../lab/fast-quiz-functions/classroom-math.js');const key=math.generateTask({...privateRoom.config,slotCount:5},privateRoom.seed,0).correct;
 await f.api('classroomHint',{...c,slot:0});
 const answers=await Promise.all([f.api('classroomAnswer',{...c,slot:0,answer:key,summary:{score:999999}}),f.api('classroomAnswer',{...c,slot:0,answer:key})]);assert.equal(answers[0].points,10);assert.equal(answers[1].points,10);
 assert.equal((await f.api('classroomState',c)).self.score,10);
 const corrected=await f.api('classroomAnswer',{...c,slot:0,answer:'wrong'});assert.equal(corrected.points,10);assert.equal((await f.api('classroomState',c)).self.score,10);
 f.tick(60000);await assert.rejects(f.api('classroomAnswer',{...c,slot:0,answer:key}),/Zeitfenster/);
 await f.api('classroomReveal',{...c,slot:1});const next=math.generateTask({...privateRoom.config,slotCount:5},privateRoom.seed,1);await f.api('classroomAnswer',{...c,slot:1,answer:next.correct});assert.equal((await f.api('classroomState',c)).self.score,10);
 await f.api('classroomStop',host(r));assert.equal((await f.api('classroomState',c)).status,'aborted');await assert.rejects(f.api('classroomAnswer',{...c,slot:1,answer:key}),/Runde/);
});
test('five common windows give M100; equal target is success; next level teacher-only and retries remain possible',async()=>{
 assert.ok(createApi);const f=fixture(),r=await room(f,1,{gameMode:'computer'}),p=r.players[0],c=creds(r,p);await f.api('classroomStart',host(r));f.tick(5000);
 const math=require('../../lab/fast-quiz-functions/classroom-math.js');
 for(let i=0;i<5;i++) {const privateRoom=f.docs.get(r.code);const q=math.generateTask({...privateRoom.config,slotCount:5},privateRoom.seed,i);await f.api('classroomHint',{...c,slot:i});await f.api('classroomAnswer',{...c,slot:i,answer:q.correct});f.tick(60000);}
 let s=await f.api('classroomState',c);assert.equal(s.energy,500);assert.equal(s.success,true);assert.equal(s.status,'finished');
 await assert.rejects(f.api('classroomStart',{...c,next:true}),/Lehrer/);
 await f.api('classroomStart',{...host(r),next:true});s=await f.api('classroomState',host(r));assert.equal(s.round,2);assert.equal(s.target,600);assert.equal(s.config.level,'n2');
 await f.api('classroomStop',host(r));await f.api('classroomStart',{...host(r),retry:true});assert.equal((await f.api('classroomState',host(r))).status,'running');
});
