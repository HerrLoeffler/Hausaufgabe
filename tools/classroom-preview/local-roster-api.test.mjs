import test from 'node:test';import assert from 'node:assert/strict';
import {createPreviewServer} from './server.mjs';
import {openLocalRoster} from './local-roster-store.mjs';
import {createFirebaseIdentityVerifier} from './local-roster-api.mjs';
test('provider validates token; payload never contains pupil data; anonymous and invalid users rejected',async()=>{
 let sent;
 const verify=createFirebaseIdentityVerifier({apiKey:'public-test-key',fetchImpl:async(url,init)=>{sent={url,body:JSON.parse(init.body)};return {ok:true,json:async()=>({users:[{localId:'verified-teacher',providerUserInfo:[{providerId:'password'}]}]})};}});
 assert.deepEqual(await verify('test-token'),{uid:'verified-teacher'});assert.deepEqual(sent.body,{idToken:'test-token'});assert.match(sent.url,/identitytoolkit.googleapis.com\/v1\/accounts:lookup/);
 const invalid=createFirebaseIdentityVerifier({apiKey:'k',fetchImpl:async()=>({ok:false,status:400,json:async()=>({error:{message:'INVALID_ID_TOKEN'}})})});
 await assert.rejects(invalid('fake'),/unauthenticated/);
 const anonymous=createFirebaseIdentityVerifier({apiKey:'k',fetchImpl:async()=>({ok:true,json:async()=>({users:[{localId:'guest'}]})})});
 await assert.rejects(anonymous('guest'),/permission-denied/);
});
test('HTTP API requires real actor, same origin and JSON; HTTP state survives client reload',async()=>{
 const store=openLocalRoster(':memory:');const server=createPreviewServer({rosterStore:store,verifyIdentity:async token=>{if(token!=='valid-a'&&token!=='valid-b')throw Error('unauthenticated');return {uid:token};}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const read=token=>fetch(base+'/api/classroom/roster',{headers:token?{Authorization:`Bearer ${token}`}:{}});
 const body={command:'createClass',payload:{name:'9b',schoolYear:'2026/27'},expectedRevision:0,operationId:crypto.randomUUID()};
 const post=(origin,token='valid-a',extra={})=>fetch(base+'/api/classroom/roster',{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({...body,...extra})});
 try{
  assert.equal((await read()).status,401);assert.equal((await read('fake')).status,401);
  assert.equal((await post('https://evil.example')).status,403);
  const created=await post(base);assert.equal(created.status,200);assert.equal((await created.json()).classes.length,1);
  assert.equal((await (await read('valid-a')).json()).classes[0].name,'9b');
  assert.equal((await (await read('valid-b')).json()).classes.length,0);
  assert.equal((await post(base,'valid-a',{ownerUid:'valid-b'})).status,400);
  const input={schoolYear:'2026/27',sourceNamespace:'Testquelle',rows:[{line:2,firstName:'Ada',lastName:'Beispiel',className:'8b',sourceId:''}],decisions:[]};
  const viewResponse=await fetch(base+'/api/classroom/roster',{method:'POST',headers:{Origin:base,Authorization:'Bearer valid-a','Content-Type':'application/json'},body:JSON.stringify({command:'previewStudentImport',payload:input})});
  assert.equal(viewResponse.status,200);const view=await viewResponse.json();assert.equal(view.counts.newStudents,1);
  assert.equal((await (await read('valid-a')).json()).students.length,0,'HTTP preview is read-only');
  const imported=await post(base,'valid-a',{command:'importStudents',payload:{...input,previewHash:view.planHash},expectedRevision:view.revision,operationId:crypto.randomUUID()});
  assert.equal(imported.status,200);assert.equal((await imported.json()).students[0].firstName,'Ada');

  const staff={schoolYear:'2026/27',sourceNamespace:'Teststaff',rows:[{line:2,firstName:'Mila',lastName:'Muster',shortCode:'MM',sourceId:'0001',className:'8b',subject:'Deutsch'}]};
  const staffPreviewResponse=await post(base,'valid-a',{command:'previewTeacherImport',payload:staff,expectedRevision:undefined,operationId:undefined});assert.equal(staffPreviewResponse.status,200);const staffView=await staffPreviewResponse.json();assert.equal(staffView.counts.newTeachers,1);
  const staffSaved=await post(base,'valid-a',{command:'importTeachers',payload:{...staff,previewHash:staffView.planHash},expectedRevision:staffView.revision,operationId:crypto.randomUUID()});assert.equal(staffSaved.status,200);assert.equal((await staffSaved.json()).teachers[0].assignments[0].subject,'Deutsch');assert.equal((await(await read('valid-b')).json()).teachers.length,0);
  assert.equal((await fetch(base+'/.gradecrew-local/classroom.sqlite')).status,404);
  const normal=await(await fetch(base)).text();assert.match(normal,/__GRADECREW_ACCOUNT_WORKSPACE__/);assert.doesNotMatch(normal,/importmap/);
 }finally{await new Promise(r=>server.close(r));store.close();}
});
