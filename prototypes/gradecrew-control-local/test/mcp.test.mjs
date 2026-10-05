import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';

test('real stdio MCP roundtrip lists UI tools and persists answer in the shared app',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-mcp-'));
 const server=await createApp({stateDir:dir,catalog:{sourceCommit:'source-1',tasks:[{id:'GC-I18N-03',area:'Internationalisierung',title:'Übersetzen',stage:'unknown'}]}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const child=spawn(process.execPath,['plugin/mcp.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,GC_CONTROL_PORT:String(server.address().port),GC_CONTROL_NO_AUTOSTART:'1'},stdio:['pipe','pipe','pipe']});
 let buf='',id=0;const pending=new Map();
 child.stdout.on('data',c=>{buf+=c;let n;while((n=buf.indexOf('\n'))>=0){const m=JSON.parse(buf.slice(0,n));buf=buf.slice(n+1);pending.get(m.id)?.(m);pending.delete(m.id);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const t=setTimeout(()=>reject(Error('MCP timeout')),3000);pending.set(n,v=>{clearTimeout(t);resolve(v);});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n');});
 try{
  assert.equal((await call('initialize',{protocolVersion:'2025-11-25'})).result.serverInfo.name,'gradecrew-central');
  const list=(await call('tools/list')).result.tools;
  assert.deepEqual(list.find(t=>t.name==='gradecrew_answer')._meta.ui.visibility,['model']);
  assert.deepEqual(list.find(t=>t.name==='gradecrew_open')._meta['openai/ui'].entrypoints,[{type:'global'},{type:'thread'}]);
  const ui=(await call('resources/read',{uri:'ui://gradecrew/central.html'})).result.contents[0];
  assert.equal(ui.mimeType,'text/html;profile=mcp-app');assert.match(ui.text,/ui\/initialize/);
  const open=(await call('tools/call',{name:'gradecrew_open',arguments:{}})).result;
  assert.equal(open.structuredContent.tasks[0].id,'GC-I18N-03');assert.equal(open.structuredContent.token,undefined);
  const q=(await call('tools/call',{name:'gradecrew_question',arguments:{taskId:'GC-I18N-03',text:'Stand?',requestId:'mcp-question-01',sourceCommit:'source-1'}})).result;
  assert.equal(q.structuredContent.question.status,'awaiting_chat');
  const ans=(await call('tools/call',{name:'gradecrew_answer',arguments:{id:q.structuredContent.question.id,text:'Quelle gelesen; Stand zu prüfen.',actor:'Test',sourceCommit:'source-1'}})).result;
  assert.equal(ans.structuredContent.question.status,'answered');
  const snapshot=await fetch(`http://127.0.0.1:${server.address().port}/api/bootstrap`).then(r=>r.json());
  assert.equal(snapshot.state.questions[0].answer,'Quelle gelesen; Stand zu prüfen.');
  assert.equal((await call('tools/call',{name:'gradecrew_task',arguments:{taskId:'missing'}})).result.isError,true);
  assert.equal((await call('unknown')).error.code,-32601);
 }finally{child.kill();await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
