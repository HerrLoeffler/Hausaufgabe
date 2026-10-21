import test from 'node:test';import assert from 'node:assert/strict';import {openLocalRoster} from './local-roster-store.mjs';import {createPreviewServer} from './server.mjs';import {schoolFixture} from './local-school-fixture.mjs';
test('HTTP pupil code establishes isolated cookie session; never authenticates teacher endpoints; print remains teacher-only',async()=>{
 const store=openLocalRoster(':memory:');schoolFixture(store);let r=store.read('teacher');r=store.mutate('teacher',{command:'createClass',payload:{name:'8b',schoolYear:'2026/27'},expectedRevision:r.revision,contextId:r.contextId,operationId:crypto.randomUUID()});r=store.mutate('teacher',{command:'createStudent',payload:{firstName:'Mila',lastName:'Muster',classId:r.classes[0].id},expectedRevision:r.revision,contextId:r.contextId,operationId:crypto.randomUUID()});
 const selection={contextId:r.contextId,expectedRevision:r.revision,studentIds:[r.students[0].id],operationId:crypto.randomUUID()};
 const server=createPreviewServer({rosterStore:store,verifyIdentity:async token=>{if(token!=='teacher')throw Error('unauthenticated');return {uid:token};}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const access=(command,payload,token='teacher')=>fetch(base+'/api/classroom/access',{method:'POST',headers:{Authorization:`Bearer ${token}`,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({command,payload})});
 const studentPost=(path,body,cookie='',origin=base)=>fetch(base+'/api/classroom/student/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)});
 try{
  const issue=await access('issue',selection);assert.equal(issue.status,200);assert.equal((await issue.json()).rows[0].code,undefined);
  const print=await access('print',{...selection,layout:'list',includeCodes:true});const data=await print.json();assert.equal(data.rows[0].code.length,8);
  assert.equal((await access('print',{...selection,includeCodes:true},'anonymous')).status,401);
  assert.equal((await studentPost('login',{code:data.rows[0].code},'','https://evil.example')).status,403);
  const logged=await studentPost('login',{code:data.rows[0].code});assert.equal(logged.status,200);const cookies=logged.headers.getSetCookie();assert.ok(cookies.some(c=>/gc_student_session=.*HttpOnly/.test(c)));const cookie=cookies.map(c=>c.split(';')[0]).join('; ');
  assert.equal((await logged.json()).token,undefined,'session secret is only an HttpOnly cookie');
  const me=await fetch(base+'/api/classroom/student/me',{headers:{Cookie:cookie}});assert.equal(me.status,200);assert.equal((await me.json()).student.firstName,'Mila');
  assert.equal((await fetch(base+'/api/classroom/roster',{headers:{Cookie:cookie}})).status,401);
  assert.equal((await fetch(base+'/api/classroom/roster',{headers:{Authorization:'Bearer '+cookie.match(/gc_student_session=([^;]+)/)[1]}})).status,401);
  assert.equal((await studentPost('logout',{},cookie)).status,200);assert.equal((await fetch(base+'/api/classroom/student/me',{headers:{Cookie:cookie}})).status,401);
 }finally{await new Promise(resolve=>server.close(resolve));store.close();}
});
