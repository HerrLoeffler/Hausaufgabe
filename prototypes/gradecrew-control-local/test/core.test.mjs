import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';
import {recommend,buildHandoff} from '../public/shared.mjs';

test('Security risk overrides a routine task classification',()=>{
 assert.equal(recommend({kind:'routine',risk:'high'}).model,'gpt-6-astra');
 assert.equal(recommend({kind:'routine',risk:'low'}).model,'gpt-6-luna');
 assert.equal(recommend({kind:'code',risk:'normal'}).model,'gpt-6.1-sol');
});
test('A prepared handoff preserves choice and explicitly forbids unapproved API fallback',()=>{
 const text=buildHandoff({id:'GC-X-01',title:'Fix',next:'Test'}, {text:'Touch target',model:'gpt-6-luna',effort:'medium',route:'subscription'});
 assert.match(text,/GC-X-01/);assert.match(text,/gpt-6-luna/);assert.match(text,/kein.*API/i);
});

test('Local server persists comments and idempotent drafts, rejects forged writes and never dispatches',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-control-test-'));
 const catalog={tasks:[{id:'GC-X-01',title:'X'}],benchmarks:{}};
 let server=await createApp({stateDir:dir,catalog});
 const start=async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));return `http://127.0.0.1:${server.address().port}`;};
 let base=await start();
 const request=async(path,body,origin=base)=>{const session=await fetch(base+'/api/bootstrap').then(r=>r.json());return fetch(base+path,{method:'POST',headers:{'content-type':'application/json','origin':origin,'x-gc-token':session.token},body:JSON.stringify(body)});};
 try{
  let r=await request('/api/comments',{taskId:'GC-X-01',text:'Kommentar bleibt erhalten'});assert.equal(r.status,201);
  r=await request('/api/comments',{taskId:'GC-X-01',text:' '});assert.equal(r.status,400);
  r=await request('/api/comments',{taskId:'GC-X-01',text:'forged'},'https://example.com');assert.equal(r.status,403);
  r=await request('/api/comments',{taskId:'GC-MISSING',text:'x'});assert.equal(r.status,400);
  const draft={requestId:'test-request-001',taskId:'GC-X-01',text:'Fix the target',model:'gpt-6.1-sol',effort:'medium',route:'subscription',confirmed:true};
  r=await request('/api/drafts',draft);assert.equal(r.status,201);assert.equal((await r.json()).draft.status,'prepared');
  r=await request('/api/drafts',draft);assert.equal(r.status,200);
  r=await request('/api/drafts',{...draft,text:'different'});assert.equal(r.status,409);
  r=await request('/api/drafts',{...draft,requestId:'test-request-002',confirmed:false});assert.equal(r.status,400);
  r=await request('/api/dispatch',draft);assert.equal(r.status,404);
  await new Promise(r=>server.close(r));server=await createApp({stateDir:dir,catalog});base=await start();
  const body=await fetch(base+'/api/bootstrap').then(r=>r.json());
  assert.equal(body.state.comments.length,1);assert.equal(body.state.drafts.length,1);assert.equal(body.state.drafts[0].model,'gpt-6.1-sol');
  assert.equal((await fetch(base+'/.local/state.json')).status,404);
  r=await request('/api/tasks',{title:'Neue Idee',area:'Games',priority:'P2'});assert.equal(r.status,201);
 }finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
