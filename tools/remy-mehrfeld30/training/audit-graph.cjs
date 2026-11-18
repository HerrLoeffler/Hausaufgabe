'use strict';
const fs=require('node:fs'),path=require('node:path');
const {GRAPH_RUN:RUN}=require('./graph-profile.cjs');
const prior='/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew';
const auth=require(prior+'/tools/rules/node_modules/firebase-tools/lib/auth');
function decode(v){
  if(v==null)return null;
  if('stringValue'in v)return v.stringValue;
  if('integerValue'in v)return Number(v.integerValue);
  if('doubleValue'in v)return v.doubleValue;
  if('booleanValue'in v)return v.booleanValue;
  if('timestampValue'in v)return v.timestampValue;
  if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode);
  if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));
  return null;
}
const doc=d=>({id:d.name.split('/').at(-1),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]))});
(async()=>{
  const account=auth.getGlobalDefaultAccount();
  const token=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase']);
  const base='https://firestore.googleapis.com/v1/projects/gradecrew-staging-2026/databases/(default)/documents/taskLearningRuns/'+RUN;
  async function read(suffix=''){
    const all=[];let page;
    do{
      const url=base+suffix+(suffix?'?pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):''):'');
      const response=await fetch(url,{headers:{Authorization:'Bearer '+token.access_token}});
      if(!response.ok)throw Error('Own pilot audit HTTP '+response.status);
      const value=await response.json();
      if(!suffix)return doc(value);
      all.push(...(value.documents||[]).map(doc));page=value.nextPageToken;
    }while(page);
    return all;
  }
  const [run,cases,calls]=await Promise.all([read(),read('/cases'),read('/providerCalls')]);
  const raw={at:new Date().toISOString(),run,cases,calls};
  fs.writeFileSync('/private/tmp/gc-graph-audit-private.json',JSON.stringify(raw,null,2)+'\n');
  const summary={at:raw.at,runId:RUN,spentMicros:run.spentMicros,reservedMicros:run.reservedMicros,
    providerCalls:calls.length,completedCalls:calls.filter(x=>x.status==='completed').length,
    tokens:calls.reduce((a,c)=>(a.input+=c.usage?.input_tokens||0,a.output+=c.usage?.output_tokens||0,a),{input:0,output:0}),
    cases:cases.map(c=>({id:c.id,family:c.family,status:c.status,attempt:c.attempt,decision:c.plan?.kind,expected:c.expected?.kind,
      errors:c.errors||[],reason:c.judge?.reason||c.plan?.reason||''}))};
  fs.writeFileSync(path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118/audit.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({providerCalls:summary.providerCalls,tokens:summary.tokens,spentUSD:run.spentMicros/1e6,
    rejected:cases.filter(c=>c.status==='rejected').map(c=>({id:c.id,text:c.q?.text,plan:c.plan,judge:c.judge,errors:c.errors}))},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
