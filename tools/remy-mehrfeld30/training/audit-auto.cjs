'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {SESSION,PHASES}=require('./auto-manifest.cjs'),{summary}=require('./auto-loop.cjs');
const auth=require('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew/tools/rules/node_modules/firebase-tools/lib/auth');
const decode=v=>v==null?null:v.stringValue??(v.integerValue!==undefined?Number(v.integerValue):undefined)??v.doubleValue??v.booleanValue??v.timestampValue??(v.arrayValue?(v.arrayValue.values||[]).map(decode):undefined)??(v.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)])):undefined)??null;
const doc=d=>({id:d.name.split('/').at(-1),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]))});
(async()=>{
 const account=auth.getGlobalDefaultAccount(),token=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
 const base='https://firestore.googleapis.com/v1/projects/gradecrew-staging-2026/databases/(default)/documents/';
 async function read(p,list=false){let all=[],page;do{const r=await fetch(base+p+(list?'?pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):''):''),{headers:{Authorization:'Bearer '+token.access_token}});if(r.status===404)return list?[]:null;if(!r.ok)throw Error('Own experiment audit HTTP '+r.status);const b=await r.json();if(!list)return doc(b);all.push(...(b.documents||[]).map(doc));page=b.nextPageToken;}while(page);return all;}
 const parent=await read('taskLearningAutoRuns/'+SESSION);assert.equal(parent.ownerId,'gc-visual255-e2e');assert.equal(parent.limitMicros,5000000);
 const runs=[];
 for(const phase of PHASES){const id=SESSION+'-'+phase,run=await read('taskLearningRuns/'+id);if(!run)continue;assert.equal(run.ownerId,'gc-visual255-e2e');const [cases,calls]=await Promise.all([read('taskLearningRuns/'+id+'/cases',true),read('taskLearningRuns/'+id+'/providerCalls',true)]);runs.push({phase,run,cases,calls});}
 fs.writeFileSync('/private/tmp/gc-auto-audit-private.json',JSON.stringify({at:new Date().toISOString(),parent,runs},null,2)+'\n');
 const calls=runs.flatMap(r=>r.calls),total=calls.reduce((s,c)=>s+(c.costMicros||0),0);
 if(parent.status==='completed')assert.equal(total,parent.spentMicros);assert.ok(parent.spentMicros+parent.reservedMicros<=5000000);
 const result={at:new Date().toISOString(),session:SESSION,status:parent.status,modelWeightsTrained:false,humanApproved:false,totalCalls:calls.length,spentMicros:parent.spentMicros,reservedMicros:parent.reservedMicros,
  inputTokens:calls.reduce((s,c)=>s+(c.usage?.input_tokens||0),0),outputTokens:calls.reduce((s,c)=>s+(c.usage?.output_tokens||0),0),
  models:[...new Set(calls.map(c=>c.model))],phases:runs.map(r=>({phase:r.phase,metrics:summary(r.cases),strategyHint:r.run.strategyHint||'',
   cases:r.cases.map(c=>({id:c.id,family:c.family,status:c.status,attempt:c.attempt,kind:c.plan?.kind,adversary:c.adversary||null,errors:c.errors||[]}))})),
  comparisons:parent.developmentComparisons||[],transfer:parent.transfer||null,selectedPhase:parent.selectedPhase||null,finalCount:parent.finalCount||0};
 const root=path.resolve(__dirname,'../../../docs/evidence/autonomous-recipes-20261118');fs.mkdirSync(root,{recursive:true});fs.writeFileSync(path.join(root,'audit.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({calls:result.totalCalls,spentUSD:result.spentMicros/1e6,reservedUSD:result.reservedMicros/1e6,phases:result.phases.map(p=>({phase:p.phase,...p.metrics}))}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
