import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingLogin,verifyStagingToken} from '../plugin/staging-login.mjs';

const jwt=(exp,overrides={})=>{
 const payload={aud:'gradecrew-staging-2026',iss:'https://securetoken.google.com/gradecrew-staging-2026',exp,...overrides};
 return ['header',Buffer.from(JSON.stringify(payload)).toString('base64url'),'signature'].join('.');
};

test('local pairing accepts one authorized Staging token without exposing it to MCP',async()=>{
 let now=1_800_000_000_000;
 const accepted=jwt(Math.floor(now/1000)+600);
 const login=createStagingLogin({now:()=>now,verifyToken:async token=>{
  assert.equal(token,accepted);
  return true;
 }});
 const connection=await login.connect();
 const page=await fetch(connection.url);
 assert.equal(page.status,200);
 assert.match(page.headers.get('content-security-policy'),/default-src 'none'/);
 assert.equal(page.headers.get('cache-control'),'no-store');
 assert.match(await page.text(),/GradeCrew-Staging/);
 const target=new URL(connection.url);
 const complete=`${target.origin}/complete/${target.pathname.split('/').at(-1)}`;
 const wrongOrigin=await fetch(complete,{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:JSON.stringify({idToken:accepted})});
 assert.equal(wrongOrigin.status,403);
 assert.equal(login.status().connected,false);
 const wrongProject=await fetch(complete,{method:'POST',headers:{origin:target.origin,'content-type':'application/json'},body:JSON.stringify({idToken:jwt(Math.floor(now/1000)+600,{aud:'hausaufgabe-40294'})})});
 assert.equal(wrongProject.status,400);
 assert.equal(login.status().connected,false);
 const success=await fetch(complete,{method:'POST',headers:{origin:target.origin,'content-type':'application/json'},body:JSON.stringify({idToken:accepted})});
 assert.equal(success.status,200);
 assert.equal(login.token(),accepted);
 assert.equal(login.status().connected,true);
 assert(!JSON.stringify(await success.json()).includes(accepted));
 assert(!JSON.stringify(login.status()).includes(accepted));
 now+=601_000;
 assert.equal(login.token(),'');
 assert.equal(login.status().connected,false);
 await login.disconnect();
});

test('Staging role denial keeps the local connection unauthenticated',async()=>{
 const now=1_800_000_000_000;
 const login=createStagingLogin({now:()=>now,verifyToken:async()=>{throw Error('private backend details');}});
 const {url}=await login.connect();
 const target=new URL(url);
 const response=await fetch(`${target.origin}/complete/${target.pathname.split('/').at(-1)}`,{method:'POST',headers:{origin:target.origin,'content-type':'application/json'},body:JSON.stringify({idToken:jwt(Math.floor(now/1000)+600)})});
 assert.equal(response.status,403);
 assert.equal(login.token(),'');
 assert(!JSON.stringify(await response.json()).includes('private backend details'));
 await login.disconnect();
});

test('disconnect during the role check cannot restore a private session',async()=>{
 const now=1_800_000_000_000;
 let finishCheck,checkStarted;
 const started=new Promise(resolve=>{checkStarted=resolve;});
 const login=createStagingLogin({now:()=>now,verifyToken:async()=>{checkStarted();await new Promise(resolve=>{finishCheck=resolve;});return true;}});
 const {url}=await login.connect();
 const target=new URL(url);
 const request=fetch(`${target.origin}/complete/${target.pathname.split('/').at(-1)}`,{method:'POST',headers:{origin:target.origin,'content-type':'application/json'},body:JSON.stringify({idToken:jwt(Math.floor(now/1000)+600)})});
 await started;
 const disconnecting=login.disconnect();
 finishCheck();
 await request.catch(()=>{});
 await disconnecting;
 assert.equal(login.status().connected,false);
});

test('access check uses only the Staging reviewMode callable and rejects its error response',async()=>{
 const seen=[];
 const fetchImpl=async(url,init)=>{
  seen.push({url:String(url),init});
  return Response.json({result:{uid:'teacher-1',admin:false}});
 };
 await verifyStagingToken('id-token',{fetchImpl});
 assert.equal(seen[0].url,'https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/reviewMode');
 assert.equal(seen[0].init.headers.authorization,'Bearer id-token');
 assert.deepEqual(JSON.parse(seen[0].init.body),{data:{action:'access'}});
 await assert.rejects(verifyStagingToken('id-token',{fetchImpl:async()=>Response.json({error:{status:'PERMISSION_DENIED'}})}),/Berechtigung/);
});
