import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';

test('questions persist exactly once, reject conflicts and cannot change release evidence',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-question-'));
 const catalog={sourceCommit:'snapshot-a',tasks:[{id:'GC-X-01',title:'X',stage:'branch_only'}]};
 let server=await createApp({stateDir:dir,catalog});let base;
 const start=async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;};
 const post=async(path,body)=>{const s=await fetch(base+'/api/bootstrap').then(r=>r.json());return fetch(base+path,{method:'POST',headers:{'content-type':'application/json',origin:base,'x-gc-token':s.token},body:JSON.stringify(body)});};
 await start();
 try{
  const q={requestId:'question-001',taskId:'GC-X-01',text:'Wie weit?',sourceCommit:'snapshot-a'};
  const [a,b]=await Promise.all([post('/api/questions',q),post('/api/questions',q)]);
  assert.deepEqual([a.status,b.status].sort(),[200,201]);
  const saved=(await a.json()).question;
  assert.equal(saved.status,'awaiting_chat');
  assert.equal((await post('/api/questions',{...q,text:'Andere Frage'})).status,409);
  assert.equal((await post('/api/questions',{...q,requestId:'question-002',sourceCommit:'old'})).status,409);
  assert.equal((await post('/api/questions',{...q,requestId:'question-003',taskId:'missing'})).status,400);
  const answer={id:saved.id,text:'Noch offen. Quelle unverändert.',actor:'Test',sourceCommit:'snapshot-a'};
  assert.equal((await post('/api/questions/answer',answer)).status,200);
  assert.equal((await post('/api/questions/answer',answer)).status,200);
  assert.equal((await post('/api/questions/answer',{...answer,text:'Anders'})).status,409);
  await new Promise(r=>server.close(r));server=await createApp({stateDir:dir,catalog});await start();
  const out=await fetch(base+'/api/bootstrap').then(r=>r.json());
  assert.equal(out.state.questions.length,1);assert.equal(out.state.questions[0].answer,answer.text);
  assert.equal(out.catalog.tasks[0].stage,'branch_only');
 }finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
