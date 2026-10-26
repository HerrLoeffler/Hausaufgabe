'use strict';
const fs=require('node:fs');
const prior='/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work';
const PROJECT='gradecrew-staging-2026',UID='gc-visual255-e2e';
let token,expires=0;
async function login(){
 if(token&&Date.now()<expires)return token;
 const credentials=JSON.parse(fs.readFileSync(prior+'/test-login.json','utf8'));
 const config=fs.readFileSync(prior+'/gradecrew/firebase-config.staging.js','utf8');
 const key=config.match(/apiKey: "([^"]+)"/)[1];
 const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:credentials.email,password:credentials.password,returnSecureToken:true})});
 const d=await r.json(); if(!r.ok)throw Error('Synthetic test login failed HTTP '+r.status+' '+(d.error?.message||''));
 if(d.localId!==UID)throw Error('Synthetic account identity mismatch; stopped');
 token=d.idToken;expires=Date.now()+3000000;return token;
}
async function call(name,data){if(!/^visual255[A-Za-z]+$/.test(name))throw Error('Endpoint outside preview');const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/'+name,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},body:JSON.stringify({data}),signal:AbortSignal.timeout(550000)});const d=await r.json();if(!r.ok||d.error)throw Error(name+' HTTP '+r.status+' '+JSON.stringify(d.error));return d.result??d.data;}
const decode=v=>v==null?null:v.stringValue??(v.integerValue!==undefined?Number(v.integerValue):undefined)??v.doubleValue??v.booleanValue??v.timestampValue??(v.nullValue!==undefined?null:undefined)??(v.arrayValue?(v.arrayValue.values||[]).map(decode):undefined)??(v.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,v])=>[k,decode(v)])):undefined);
const doc=d=>({...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)])),id:d.name?.split('/').pop()});
async function read(path){if(!/^(aiJobs\/[a-f0-9]{40}|quizzes\/[A-Z0-9]+(?:\/questions(?:\?pageSize=100)?)?)$/.test(path))throw Error('Read scope rejected');const r=await fetch('https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/'+path,{headers:{Authorization:'Bearer '+await login()}});const d=await r.json();if(!r.ok)throw Error('Own document read failed HTTP '+r.status);return d.documents?d.documents.map(doc):doc(d);}
async function patchQuestion(quizId,questionId,fields,expected){
 const quiz=await read('quizzes/'+quizId);if(quiz.ownerId!==UID||quiz.published)throw Error('Only own unpublished pilot drafts may be corrected');
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(questionId)||Object.keys(fields).some(k=>!['text','visualTask'].includes(k)))throw Error('Question correction scope rejected');
 const url='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/quizzes/'+quizId+'/questions/'+questionId;
 const get=await fetch(url,{headers:{Authorization:'Bearer '+await login()}});if(!get.ok)throw Error('Question read '+get.status);const before=await get.json();
 if(Object.entries(fields).every(([k,v])=>before.fields?.[k]?.stringValue===v))return {updated:false,alreadyApplied:true,at:new Date().toISOString()};
 if(!expected||before.fields?.visualTask?.stringValue!==expected.visualTask||before.fields?.text?.stringValue!==expected.text)throw Error('Question changed since evidence snapshot; preserve concurrent changes');
 const query=Object.keys(fields).map(k=>'updateMask.fieldPaths='+k).join('&')+'&currentDocument.updateTime='+encodeURIComponent(before.updateTime);
 const r=await fetch(url+'?'+query,{method:'PATCH',headers:{Authorization:'Bearer '+await login(),'Content-Type':'application/json'},body:JSON.stringify({fields:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,{stringValue:v}]))})});if(!r.ok)throw Error('Question patch failed HTTP '+r.status);return {updated:true,at:new Date().toISOString()};
}
module.exports={login,call,read,patchQuestion,UID,PROJECT};
if(require.main===module)login().then(async()=>{const d=await read('aiJobs/6a1daf36a30146d33f01350fc6847ee27786db47');console.log(JSON.stringify({authenticated:true,syntheticIdentityVerified:true,ownHistoricalJobReadable:d.ownerId===UID,status:d.status}));}).catch(e=>{console.error(e.message);process.exitCode=1;});
