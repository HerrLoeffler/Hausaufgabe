'use strict';
const fs=require('node:fs'),path=require('node:path');
const {login,PROJECT,UID}=require('../../visual-pilot/access.cjs');
const {RUN}=require('./cases.cjs');
const auth=require('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew/tools/rules/node_modules/firebase-tools/lib/auth');
const requestId='00000000-0000-4000-8000-000000006010';
(async()=>{
  const account=auth.getGlobalDefaultAccount();
  const t=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase']);
  const database='projects/'+PROJECT+'/databases/(default)';
  const base='https://firestore.googleapis.com/v1/'+database+'/documents';
  const headers={Authorization:'Bearer '+t.access_token,'Content-Type':'application/json'};
  const runResponse=await fetch(base+'/taskLearningRuns/'+RUN,{headers});
  const run=await runResponse.json();
  if(!runResponse.ok||run.fields?.ownerId?.stringValue!==UID)throw Error('Only the own synthetic calibration may be edited.');
  const name=database+'/documents/taskLearningRuns/'+RUN+'/cases/contrast-10';
  const response=await fetch('https://firestore.googleapis.com/v1/'+name,{headers});
  if(!response.ok)throw Error('Case read failed.');
  const old=await response.json();
  const newText='Zwei kurze Quellen sollen jeweils den Aussagen zugeordnet werden, die sie belegen. Welche Vorgehensweise passt zu diesem Auftrag?';
  const already=old.fields?.q?.mapValue?.fields?.text?.stringValue===newText;
  if(!already){
    if(old.fields?.status?.stringValue!=='rejected'||!old.fields?.q?.mapValue?.fields?.text?.stringValue.includes('Es gibt keine Mengenberechnung.'))
      throw Error('The reviewed original changed. Preserve concurrent work.');
    const fields=structuredClone(old.fields);
    fields.q.mapValue.fields.text={stringValue:newText};
    fields.q.mapValue.fields.heading={stringValue:'Unterrichtsauftrag prüfen'};
    fields.plan.mapValue.fields.text={stringValue:'Zwei kurze Quellen sollen jeweils den Aussagen zugeordnet werden, die sie belegen.'};
    fields.plan.mapValue.fields.title={stringValue:'Unterrichtsauftrag prüfen'};
    fields.editorialProof={mapValue:{fields:{origin:{stringValue:'explicit-development-correction'},
      reason:{stringValue:'Verräterische Meta-Anweisung aus dem öffentlichen Text entfernt. Kein Lehrerurteil.'},
      at:{timestampValue:new Date().toISOString()}}}};
    const snapshot={q:old.fields.q,plan:old.fields.plan,judge:old.fields.judge,
      reason:{stringValue:'Original vor redaktioneller Entfernung der verräterischen Meta-Anweisung.'}};
    const commit=await fetch(base+':commit',{method:'POST',headers,body:JSON.stringify({writes:[
      {update:{name:name+'/editorialVersions/'+requestId,fields:snapshot},currentDocument:{exists:false}},
      {update:{name,fields},currentDocument:{updateTime:old.updateTime}}
    ]})});
    if(!commit.ok)throw Error('Own case CAS correction HTTP '+commit.status);
  }
  const receipt={at:new Date().toISOString(),runId:RUN,caseId:'contrast-10',requestId,origin:'explicit-development-correction',
    removed:'Es gibt keine Mengenberechnung.',newText,reason:'Verräterische Meta-Anweisung gestrichen. Die unveränderte Eignungsentscheidung wird unabhängig erneut geprüft.'};
  fs.writeFileSync(path.resolve(__dirname,'../../../docs/evidence/remy-training-20261118/editorial-fix.json'),JSON.stringify(receipt,null,2)+'\n');
  const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',
    headers:{Authorization:'Bearer '+await login(),'Content-Type':'application/json'},
    body:JSON.stringify({data:{action:'trainingRecheck',runId:RUN,caseId:'contrast-10',requestId,reason:receipt.reason}})});
  const b=await r.json();if(b.error)throw Error(b.error.message);
  console.log(JSON.stringify(b.result));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
