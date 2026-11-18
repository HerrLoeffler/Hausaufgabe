'use strict';
const fs=require('node:fs'),path=require('node:path');
const {GRAPH_RUN:RUN}=require('./graph-profile.cjs');
const {PROJECT,UID}=require('../../visual-pilot/access.cjs');
const auth=require('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew/tools/rules/node_modules/firebase-tools/lib/auth');
const decode=v=>v?.stringValue??v?.booleanValue??(v?.integerValue!==undefined?Number(v.integerValue):undefined)??v?.doubleValue??
  (v?.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)])):undefined)??null;
const document=d=>({id:d.name.split('/').at(-1),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]))});
(async()=>{
  const root=path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118');
  const free=['free-english.json'].map(file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')));
  if(free.some(x=>x.status!=='ready'||!/^graph-[a-f0-9]{32}$/.test(x.runId)))throw Error('Free wish receipt missing.');
  const account=auth.getGlobalDefaultAccount(),token=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
  const base='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/taskLearningRuns/';
  const runs=[];
  for(const id of [RUN,...free.map(x=>x.runId)]){
    const headers={Authorization:'Bearer '+token.access_token};
    const response=await fetch(base+id,{headers});
    if(!response.ok)throw Error('Own run usage HTTP '+response.status);
    const run=document(await response.json());
    if(run.ownerId!==UID)throw Error('Own synthetic runs only.');
    let page;const calls=[];
    do{
      const r=await fetch(base+id+'/providerCalls?pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):''),{headers});
      if(!r.ok)throw Error('Own provider receipts HTTP '+r.status);
      const b=await r.json();calls.push(...(b.documents||[]).map(document));page=b.nextPageToken;
    }while(page);
    runs.push({id,spentMicros:run.spentMicros,reservedMicros:run.reservedMicros,calls:calls.map(c=>({
      step:c.id,phase:c.phase,model:c.model,status:c.status,responseId:c.responseId,requestHash:c.requestHash,
      inputTokens:c.usage?.input_tokens||0,outputTokens:c.usage?.output_tokens||0,costMicros:c.costMicros,
      startedAt:c.startedAt,finishedAt:c.finishedAt}))});
  }
  const all=runs.flatMap(r=>r.calls);
  const result={at:new Date().toISOString(),currency:'USD',costBasis:'Recorded token use multiplied by the saved standard list-price snapshot; excludes infrastructure and taxes.',
    providerCalls:all.length,totalSpentMicros:runs.reduce((s,r)=>s+r.spentMicros,0),reservedMicros:runs.reduce((s,r)=>s+r.reservedMicros,0),
    inputTokens:all.reduce((s,c)=>s+c.inputTokens,0),outputTokens:all.reduce((s,c)=>s+c.outputTokens,0),runs};
  if(result.reservedMicros!==0||all.some(c=>c.status!=='completed'))throw Error('Provider outcome remains unresolved.');
  fs.writeFileSync(path.join(root,'usage.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({calls:all.length,totalUSD:result.totalSpentMicros/1e6,reserved:result.reservedMicros}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
