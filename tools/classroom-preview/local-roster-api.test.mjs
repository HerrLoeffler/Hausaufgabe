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
  assert.equal((await fetch(base+'/.gradecrew-local/classroom.sqlite')).status,404);
  const normal=await(await fetch(base)).text();assert.match(normal,/__GRADECREW_ACCOUNT_WORKSPACE__/);assert.doesNotMatch(normal,/importmap/);
 }finally{await new Promise(r=>server.close(r));store.close();}
});
