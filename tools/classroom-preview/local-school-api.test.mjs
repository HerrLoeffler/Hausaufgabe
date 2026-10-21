import test from 'node:test';import assert from 'node:assert/strict';
import {openLocalRoster} from './local-roster-store.mjs';import {createPreviewServer} from './server.mjs';
test('school HTTP preserves normal app; binds writes to verified actor, origin and current school',async()=>{
 const store=openLocalRoster(':memory:');const server=createPreviewServer({rosterStore:store,verifyIdentity:async token=>{if(!['a','b','c'].includes(token))throw Error('unauthenticated');return {uid:token,email:`${token}@example.invalid`};}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const read=(uid,path='/api/classroom/school')=>fetch(base+path,{headers:{Authorization:`Bearer ${uid}`}});
 const post=(uid,command,payload,expectedRevision=0,contextId=null,origin=base)=>fetch(base+'/api/classroom/school',{method:'POST',headers:{Authorization:`Bearer ${uid}`,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({command,payload,expectedRevision,operationId:crypto.randomUUID(),contextId})});
 try{
  assert.equal((await read('a')).status,200,'school API exists for authenticated teachers');assert.equal((await read('bad')).status,401);
  assert.equal((await post('a','previewSchoolSetup',{name:'Schule',displayName:'Ada'},0,null,'https://evil.example')).status,403);
  const p=await(await post('a','previewSchoolSetup',{name:'Schule',displayName:'Ada'})).json();
  const created=await post('a','createSchool',{name:'Schule',displayName:'Ada',previewHash:p.planHash},p.revision);assert.equal(created.status,200);let state=await created.json();const id=state.currentSchool.id;
  assert.equal((await post('a','invite',{name:'B',role:'admin'},state.revision,null)).status,409,'stale personal context rejected');
  const invitation=await(await post('a','invite',{name:'B',role:'admin'},state.revision,id)).json();
  assert.equal((await post('b','claimInvitation',{secret:invitation.invitation.secret,displayName:'B'})).status,200);
  state=await(await read('a')).json();assert.equal(state.requests[0].accountLabel,'b@example.invalid');
  const approved=await post('a','approveRequest',{requestId:state.requests[0].id},state.revision,id);assert.equal(approved.status,200);
  const b=await(await read('b')).json();assert.equal(b.currentSchool.id,id);assert.equal(b.currentSchool.role,'admin');assert.equal((await(await read('c')).json()).currentSchool,null);
  assert.equal((await post('c','selectSchool',{schoolId:id})).status,403);
  const roster=await(await read('b','/api/classroom/roster')).json();
  const mutation={command:'createClass',payload:{name:'8b',schoolYear:'2026/27'},expectedRevision:roster.revision,operationId:crypto.randomUUID()};
  const write=(body)=>fetch(base+'/api/classroom/roster',{method:'POST',headers:{Authorization:'Bearer b',Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await write(mutation)).status,409);assert.equal((await write({...mutation,contextId:id})).status,200);
  assert.equal((await(await read('a','/api/classroom/roster')).json()).classes[0].name,'8b');
  const html=await(await fetch(base)).text();assert.match(html,/loginForm/);assert.match(html,/__GRADECREW_ACCOUNT_WORKSPACE__/);assert.doesNotMatch(html,/importmap/);
 }finally{await new Promise(r=>server.close(r));store.close();}
});
